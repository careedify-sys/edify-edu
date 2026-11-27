// Owner controls for auto-replies: the global switch, each rule's keywords,
// reply and on/off, the history, and the per-conversation switch.
import type { SupabaseClient } from '@supabase/supabase-js'
import { can, type Actor } from './access'
import { isStop, normalise, RULE_ORDER, type AutoRule, type AutoRuleKey } from './auto-reply'

export type AutoHistoryRow = { inbound_message_id: string; conversation_id: string; rule: string; state: string; reason: string | null; created_at: string; contact_name: string | null }
export type AutoConvRow = { id: string; contact_name: string | null; last_message_at: string | null }

export interface AutoAdminRepo {
  getEnabled(): Promise<boolean>
  getSendingEnabled(): Promise<boolean>
  setEnabled(on: boolean): Promise<void>
  rules(): Promise<AutoRule[]>
  saveRule(key: AutoRuleKey, patch: { enabled: boolean; keywords: string[]; reply: string; updated_by: string }): Promise<void>
  history(limit: number): Promise<AutoHistoryRow[]>
  stoppedConversations(limit: number): Promise<AutoConvRow[]>
  setConversationOff(convId: string, off: boolean): Promise<boolean>
  audit(actor: string, action: string, target: string | null, detail: Record<string, unknown> | null): Promise<void>
}

type Fail = { ok: false; error: string }
const deny: Fail = { ok: false, error: 'You do not have permission for this.' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export { REASON_TEXT } from './auto-labels'

export async function loadAutomation(repo: AutoAdminRepo, actor: Actor | null) {
  if (!can(actor, 'view')) return deny
  const [enabled, sending, rules, history, stopped] = await Promise.all([
    repo.getEnabled(), repo.getSendingEnabled(), repo.rules(), repo.history(100), repo.stoppedConversations(100),
  ])
  rules.sort((a, b) => RULE_ORDER.indexOf(a.key) - RULE_ORDER.indexOf(b.key))
  return { ok: true as const, enabled, sending, rules, history, stopped, owner: can(actor, 'automation_edit') }
}

export async function setAutomationEnabled(repo: AutoAdminRepo, actor: Actor | null, on: boolean, confirm: string) {
  if (!can(actor, 'automation_edit')) return deny
  if (on && confirm !== 'ON') return { ok: false as const, error: 'Type ON to switch auto-replies on.' }
  await repo.setEnabled(on)
  await repo.audit(actor!.id, on ? 'automation_on' : 'automation_off', null, null)
  return { ok: true as const }
}

export async function saveAutoRule(repo: AutoAdminRepo, actor: Actor | null, key: string, i: { enabled: boolean; keywords: string; reply: string }) {
  if (!can(actor, 'automation_edit')) return deny
  if (!(RULE_ORDER as string[]).includes(key)) return { ok: false as const, error: 'Unknown rule.' }
  const reply = String(i?.reply ?? '').replace(/\r\n/g, '\n').trim()
  if (reply.length < 1 || reply.length > 1024) return { ok: false as const, error: 'The reply must be 1 to 1,024 characters.' }
  const kws = Array.from(new Set(String(i?.keywords ?? '').split(/[,\n]/).map(k => k.trim()).filter(Boolean)))
  if (kws.length === 0) return { ok: false as const, error: 'Add at least one keyword.' }
  if (kws.length > 30) return { ok: false as const, error: 'At most 30 keywords per rule.' }
  for (const k of kws) {
    if (k.length > 40) return { ok: false as const, error: `"${k.slice(0, 20)}…" is too long. Keep keywords under 40 characters.` }
    if (!normalise(k)) return { ok: false as const, error: `"${k}" has no letters or numbers.` }
    if (isStop(k)) return { ok: false as const, error: `"${k}" is an opt-out word. STOP always opts the student out and is never answered.` }
  }
  await repo.saveRule(key as AutoRuleKey, { enabled: i?.enabled === true, keywords: kws, reply, updated_by: actor!.id })
  await repo.audit(actor!.id, 'automation_rule_saved', key, { enabled: i?.enabled === true, keywords: kws.length })
  return { ok: true as const }
}

// Any signed-in user may stop auto-replies for a chat; resuming is also allowed
// because a staff reply already stops them, so resuming is the deliberate step.
export async function setConversationAuto(repo: AutoAdminRepo, actor: Actor | null, convId: string, off: boolean) {
  if (!can(actor, 'send')) return deny
  if (!UUID.test(convId)) return { ok: false as const, error: 'Unknown conversation.' }
  if (!(await repo.setConversationOff(convId, off))) return { ok: false as const, error: 'Unknown conversation.' }
  await repo.audit(actor!.id, off ? 'automation_conv_off' : 'automation_conv_on', convId, null)
  return { ok: true as const }
}

export function supabaseAutoAdminRepo(sb: SupabaseClient): AutoAdminRepo {
  const must = <T,>(r: { data: T | null; error: { code?: string } | null }): T => {
    if (r.error) throw Object.assign(new Error('automation db error'), { code: r.error.code })
    return r.data as T
  }
  const setting = async (key: string) => (must(await sb.from('wa_settings').select('value').eq('key', key).maybeSingle()) as { value: unknown } | null)?.value
  const name = (c: { profile_name?: string | null; username?: string | null } | null | undefined) => c?.profile_name ?? c?.username ?? null
  return {
    async getEnabled() { return (await setting('automation_enabled')) === true },
    async getSendingEnabled() { return (await setting('sending_enabled')) === true },
    async setEnabled(on) { must(await sb.from('wa_settings').upsert({ key: 'automation_enabled', value: on, updated_at: new Date().toISOString() })) },
    async rules() { return must(await sb.from('wa_auto_rules').select('key,enabled,keywords,reply,updated_at,updated_by')) as AutoRule[] },
    async saveRule(key, p) { must(await sb.from('wa_auto_rules').update({ ...p, updated_at: new Date().toISOString() }).eq('key', key)) },
    async history(limit) {
      const rows = must(await sb.from('wa_auto_replies')
        .select('inbound_message_id,conversation_id,rule,state,reason,created_at,wa_conversations(wa_contacts(profile_name,username))')
        .order('created_at', { ascending: false }).limit(limit)) as Array<Record<string, any>>
      return rows.map(r => ({ inbound_message_id: r.inbound_message_id, conversation_id: r.conversation_id, rule: r.rule, state: r.state, reason: r.reason, created_at: r.created_at,
        contact_name: name(r.wa_conversations?.wa_contacts) }))
    },
    async stoppedConversations(limit) {
      const rows = must(await sb.from('wa_conversations').select('id,last_message_at,wa_contacts(profile_name,username)').eq('auto_off', true)
        .order('last_message_at', { ascending: false, nullsFirst: false }).limit(limit)) as Array<Record<string, any>>
      return rows.map(r => ({ id: r.id, last_message_at: r.last_message_at, contact_name: name(r.wa_contacts) }))
    },
    async setConversationOff(convId, off) {
      const r = must(await sb.from('wa_conversations').update({ auto_off: off }).eq('id', convId).select('id')) as unknown[]
      return r.length === 1
    },
    async audit(actor, action, target, detail) { await sb.from('wa_audit_log').insert({ actor, action, target, detail }) },
  }
}

export function mockAutoAdminRepo(): AutoAdminRepo & { state: { enabled: boolean; rules: AutoRule[]; off: Set<string> } } {
  const state = {
    enabled: false, off: new Set<string>(),
    rules: [
      { key: 'interested', enabled: true, keywords: ['yes', 'interested', 'i am interested', 'refer', 'i want to refer', 'refer a friend'], reply: "Thank you for your interest in our referral programme!\n\nYou can submit your friend's details using the link below:\nhttps://edifyedu.in/refer\n\nAfter submitting the form, you will receive a unique referral ID for future communication." },
      { key: 'know_more', enabled: true, keywords: ['know more', 'more details', 'details', 'how does it work', 'info', 'tell me more'], reply: 'How the edifyedu.in referral programme works:\n\n1. Refer someone planning to pursue an online degree.\n2. Our education counsellor helps them explore suitable universities and programmes.\n3. Our team connects with you to explain the referral process, applicable benefits and eligibility details.\n\nSubmit a referral: https://edifyedu.in/refer' },
      { key: 'reward', enabled: true, keywords: ['reward', 'payment', 'money', 'cash', 'how much', 'when will i get paid', 'amount'], reply: 'Thank you for your interest in our referral programme. Our education counsellor will connect with you shortly to explain the referral process, applicable benefits and eligibility details.' },
      { key: 'call_me', enabled: true, keywords: ['call me', 'call', 'callback', 'call back', 'please call', 'call me back'], reply: 'Thank you. Our team will call you on this number soon.' },
    ] as AutoRule[],
  }
  return {
    state,
    async getEnabled() { return state.enabled },
    async getSendingEnabled() { return false },
    async setEnabled(on) { state.enabled = on },
    async rules() { return state.rules.map(r => ({ ...r, keywords: [...r.keywords] })) },
    async saveRule(key, p) { const r = state.rules.find(x => x.key === key)!; Object.assign(r, p, { updated_at: new Date().toISOString() }) },
    async history() {
      return [{ inbound_message_id: 'm1', conversation_id: '00000000-0000-4000-8000-0000000000a1', rule: 'know_more', state: 'sent', reason: null, created_at: new Date(Date.now() - 36e5).toISOString(), contact_name: 'Mock student' },
        { inbound_message_id: 'm2', conversation_id: '00000000-0000-4000-8000-0000000000a2', rule: 'none', state: 'skipped', reason: 'no_rule', created_at: new Date(Date.now() - 72e5).toISOString(), contact_name: 'Another student' }]
    },
    async stoppedConversations() { return Array.from(state.off).map(id => ({ id, contact_name: 'Mock student', last_message_at: null })) },
    async setConversationOff(id, off) { if (off) state.off.add(id); else state.off.delete(id); return true },
    async audit() {},
  }
}
