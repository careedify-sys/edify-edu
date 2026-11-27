// Rule-based auto-replies to referral campaign replies (Phase 4, P4).
//
// Runs right after the webhook stores an event. OFF unless the owner turns on
// the existing 'automation_enabled' setting. Every decision that matters is
// made in SQL under a per-conversation lock (wa_auto_claim):
//   global switch, rule on, conversation not taken over, message under 2 h
//   old, 24 h window open, not opted out, at most 4 automatic replies per
//   conversation, no staff reply since, and exactly one answer per message.
// Sending then goes through wa_reserve_outbound (sending switch, cap) like any
// inbox reply, with sent_by 'automation', which never triggers takeover and
// never answers itself: only inbound messages are candidates, so no loops.
// A message that matches no rule is left for a person.
import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { InboxRepo } from './inbox-repo'
import { sendMessage, textPayload, type GraphEnv } from './graph'
import { leadPhoneFromE164 } from './inbox-service'
import { isOptOutText } from './opt-out'

import { RULE_ORDER, type AutoRuleKey } from './auto-labels'
export { RULE_LABEL, RULE_ORDER, type AutoRuleKey } from './auto-labels'
export type AutoRule = { key: AutoRuleKey; enabled: boolean; keywords: string[]; reply: string; updated_at?: string; updated_by?: string | null }

const NON_WORD = new RegExp('[^\\p{L}\\p{N}\\s]', 'gu')
export const normalise = (s: string | null | undefined) =>
  (s ?? '').toLowerCase().replace(/[‘’']/g, '').replace(NON_WORD, ' ').replace(/\s+/g, ' ').trim()

export const isStop = (body: string | null | undefined) =>
  isOptOutText(body) || /^\s*stop promotions\s*[.!]*\s*$/i.test(body ?? '')

// A keyword matches the whole message, or appears as whole words in a short
// message (at most 6 words). Longer messages go to a person: they usually
// say more than a keyword reply can answer.
export function matchRule(body: string | null | undefined, rules: AutoRule[]): { kind: 'stop' } | { kind: 'rule'; key: AutoRuleKey } | null {
  if (isStop(body)) return { kind: 'stop' }
  const text = normalise(body)
  if (!text) return null
  const words = text.split(' ').length
  for (const key of RULE_ORDER) {
    const r = rules.find(x => x.key === key)
    if (!r) continue
    for (const k of r.keywords) {
      const kw = normalise(k)
      if (!kw) continue
      if (text === kw) return { kind: 'rule', key }
      if (words <= 6 && ` ${text} `.includes(` ${kw} `)) return { kind: 'rule', key }
    }
  }
  return null
}

// The same inbound message always maps to the same client_ref, so even a
// second run that got past the claim could not reserve a second send.
export function autoClientRef(messageId: string): string {
  const h = createHash('sha256').update(`auto:${messageId}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`
}

export type Candidate = { message_id: string; conversation_id: string; contact_id: string; type: string; body: string | null; created_at: string }

export interface AutoStore {
  enabled(): Promise<boolean>
  rules(): Promise<AutoRule[]>
  candidates(limit: number): Promise<Candidate[]>
  claim(messageId: string, rule: AutoRuleKey | null): Promise<string>
  finish(messageId: string, state: 'sent' | 'failed', outboundId: string | null, reason: string | null): Promise<void>
  recordOptOuts(): Promise<number>
}

export function supabaseAutoStore(sb: SupabaseClient): AutoStore {
  const must = <T,>(r: { data: T | null; error: { code?: string } | null }): T => {
    if (r.error) throw Object.assign(new Error('auto-reply db error'), { code: r.error.code })
    return r.data as T
  }
  return {
    async enabled() {
      const r = must(await sb.from('wa_settings').select('value').eq('key', 'automation_enabled').maybeSingle()) as { value: unknown } | null
      return r?.value === true
    },
    async rules() { return must(await sb.from('wa_auto_rules').select('key,enabled,keywords,reply,updated_at,updated_by')) as AutoRule[] },
    async candidates(limit) { return (must(await sb.rpc('wa_auto_candidates', { p_limit: limit })) as Candidate[]) ?? [] },
    async claim(messageId, rule) { return String(must(await sb.rpc('wa_auto_claim', { p_message: messageId, p_rule: rule }))) },
    async finish(messageId, state, outboundId, reason) {
      must(await sb.rpc('wa_auto_finish', { p_message: messageId, p_state: state, p_outbound: outboundId, p_reason: reason }))
    },
    async recordOptOuts() { return Number(must(await sb.rpc('wa_record_marketing_opt_outs')) ?? 0) },
  }
}

export type AutoNotify = (i: { conversationId: string; phone: string | null; rule: AutoRuleKey; text: string }) => Promise<void>
export type AutoSummary = { state: 'off' | 'ran'; seen: number; sent: number; skipped: Record<string, number>; failed: number }

export async function runAutoReplies(store: AutoStore, inbox: InboxRepo, env: GraphEnv, f: typeof fetch,
  opts: { deadline: number; notify?: AutoNotify; limit?: number }): Promise<AutoSummary> {
  const out: AutoSummary = { state: 'off', seen: 0, sent: 0, skipped: {}, failed: 0 }
  if (!(await store.enabled())) return out
  out.state = 'ran'
  const skip = (why: string) => { out.skipped[why] = (out.skipped[why] ?? 0) + 1 }
  const [rules, cands] = await Promise.all([store.rules(), store.candidates(opts.limit ?? 20)])
  let stopSeen = false
  for (const c of cands) {
    if (Date.now() > opts.deadline) break
    out.seen++
    const m = matchRule(c.body, rules.filter(r => r.enabled))
    if (m?.kind === 'stop') {
      // Record the opt-out now rather than at the daily sweep. Sends already
      // check STOP messages live; this makes the consent record match.
      if (!stopSeen) { stopSeen = true; await store.recordOptOuts().catch(() => 0) }
      await store.claim(c.message_id, null); skip('stop'); continue
    }
    const key = m?.kind === 'rule' ? m.key : null
    const why = await store.claim(c.message_id, key)
    if (why !== 'ok' || !key) { skip(key ? why : 'no_match'); continue }

    const rule = rules.find(r => r.key === key)!
    const contact = await inbox.getContact(c.contact_id)
    const ref = autoClientRef(c.message_id)
    const content = textPayload(rule.reply)
    const begun = await inbox.reserveOutbound(c.conversation_id, ref, 'text', rule.reply, content, 'automation')
    if (begun.blocked) { await store.finish(c.message_id, 'failed', null, `blocked:${begun.blocked}`); skip(begun.blocked); continue }
    if (!begun.is_new) { skip('duplicate'); continue }
    const r = await sendMessage(env, { phoneDigits: leadPhoneFromE164(contact?.phone_e164 ?? null), bsuid: contact?.bsuid ?? null }, content, f)
    try {
      if (r.state === 'accepted') await inbox.finishOutbound(ref, r.wamid, 'accepted', null, null)
      else if (r.state === 'failed') await inbox.finishOutbound(ref, null, 'failed', r.code, r.title)
      else await inbox.finishOutbound(ref, null, 'unknown', null, `No confirmation from Meta (${r.reason})`)
      await store.finish(c.message_id, r.state === 'failed' ? 'failed' : 'sent', begun.message_id ?? null, r.state === 'accepted' ? null : r.state)
    } catch { /* the row stays 'sending'/'claimed'; never retried, so never sent twice */ }
    if (r.state === 'failed') out.failed++; else out.sent++
    if (key === 'call_me') {
      await inbox.addNote(c.conversation_id, 'automation', 'Callback requested (Call Me). Call this student.').catch(() => {})
      await opts.notify?.({ conversationId: c.conversation_id, phone: contact?.phone_e164 ?? null, rule: key, text: c.body ?? '' }).catch(() => {})
    }
  }
  return out
}
