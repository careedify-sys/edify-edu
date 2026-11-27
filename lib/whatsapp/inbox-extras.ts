// Inbox additions (Phase 4, P5): start a chat by number with a template, send a
// template when the 24-hour window is closed, send an image or PDF inside the
// window, and the referral, campaign and automation facts for a thread.
// Every send is reserved first (wa_reserve_template / wa_reserve_outbound),
// which checks the sending switch, opt-out, consent and the monthly cap under
// a lock, and reuses one client_ref so a retry never sends twice.
import type { SupabaseClient } from '@supabase/supabase-js'
import { can, type Actor } from './access'
import type { CampaignRepo } from './campaign-repo'
import type { InboxRepo } from './inbox-repo'
import { sendMessage, type GraphEnv } from './graph'
import { previewText } from './graph-templates'
import { sendPlan, templatePayload, errorText } from './template-rules'
import { ensureMetaMediaId } from './template-service'
import { leadPhoneFromE164 } from './inbox-service'
import { normaliseIndianMobile } from './phones'

type Fail = { ok: false; error: string }
const bad = (error: string): Fail => ({ ok: false, error })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Inbox template sends have no campaign. The referral link still needs a
// 16-hex token; this one matches no campaign, so attribution falls back to
// the referrer's phone.
export const INBOX_REF_TOKEN = '0000000000000000'

export type Reserve = { message_id: string | null; is_new: boolean; send_state: string | null; wamid: string | null; blocked: string | null }
export type ThreadFacts = {
  autoOff: boolean
  referrals: Array<{ id: string; ref_code: string; role: 'referrer' | 'referred'; stage: string }>
  campaigns: Array<{ id: string; name: string; at: string | null; status: string | null }>
}

export interface ExtrasStore {
  reserveTemplate(conv: string, ref: string, templateId: string, body: string, payload: unknown, sentBy: string): Promise<Reserve>
  conversationForPhone(phone: string, phoneNumberId: string): Promise<string>
  facts(convId: string): Promise<ThreadFacts | null>
}

export const BLOCK_TEXT: Record<string, string> = {
  sending_off: 'Sending is switched off. The owner can switch it on in Settings.',
  no_conversation: 'Unknown conversation.',
  template_not_approved: 'That template is not approved by Meta.',
  opted_out: 'This person asked not to be messaged. Sending is blocked.',
  no_marketing_consent: 'A Marketing template needs recorded marketing consent for this number. Use a Utility template, or record consent first.',
  rate_missing: 'The message rates are not set in Settings, so the cost cannot be checked.',
  cap_missing: 'The monthly cap is not set.',
  cap_reached: "This month's cap is reached. The owner can raise it in Settings.",
  window_closed: 'The 24-hour window is closed. Send an approved template instead.',
  bad_ref: 'Bad request. Reload and try again.',
}

export async function threadExtras(store: ExtrasStore, crepo: CampaignRepo, actor: Actor | null, convId: string) {
  if (!can(actor, 'view')) return bad('You do not have permission for this')
  if (!UUID.test(convId)) return bad('Unknown conversation.')
  const [facts, templates, files] = await Promise.all([store.facts(convId), crepo.templates(), crepo.mediaFiles('outbound')])
  if (!facts) return bad('Unknown conversation.')
  return { ok: true as const, facts, templates: usableTemplates(templates), files: files.map(f => ({ id: f.id, kind: f.kind, file_name: f.file_name, size_bytes: f.size_bytes })) }
}

export function usableTemplates(rows: Awaited<ReturnType<CampaignRepo['templates']>>) {
  return rows.filter(t => t.status === 'APPROVED' && (t.category === 'MARKETING' || t.category === 'UTILITY'))
    .map(t => {
      const plan = sendPlan(t.components, !!t.header_file_id)
      const p = previewText(t.components as unknown[])
      return { id: t.id, name: t.name, language: t.language, category: t.category, body: p.body, headerKind: p.headerKind, buttons: p.buttons, usable: plan.ok, why: plan.ok ? null : plan.error }
    })
}

type Ctx = { store: ExtrasStore; crepo: CampaignRepo; inbox: InboxRepo; env: GraphEnv; f: typeof fetch }
type SendResult = { ok: true; state: 'accepted' | 'failed' | 'unknown'; error?: string; duplicate?: boolean; convId: string } | Fail

async function deliver(c: Ctx, convId: string, ref: string, content: Record<string, unknown>): Promise<{ state: 'accepted' | 'failed' | 'unknown'; error?: string }> {
  const conv = await c.inbox.getConversation(convId)
  const contact = conv ? await c.inbox.getContact(conv.contact_id) : null
  const r = await sendMessage(c.env, { phoneDigits: leadPhoneFromE164(contact?.phone_e164 ?? null), bsuid: contact?.bsuid ?? null }, content, c.f)
  // Meta has answered: nothing below may throw, or a retry could send twice.
  try {
    if (r.state === 'accepted') await c.inbox.finishOutbound(ref, r.wamid, 'accepted', null, null)
    else if (r.state === 'failed') await c.inbox.finishOutbound(ref, null, 'failed', r.code, r.title)
    else await c.inbox.finishOutbound(ref, null, 'unknown', null, `No confirmation from Meta (${r.reason})`)
  } catch { /* row stays 'sending'; the thread shows it */ }
  if (r.state === 'accepted') return { state: 'accepted' }
  if (r.state === 'failed') return { state: 'failed', error: errorText(r.code) ?? r.title ?? 'Meta refused the message.' }
  return { state: 'unknown', error: 'Meta did not confirm this message. Check the thread before sending again.' }
}

export async function sendTemplateMessage(c: Ctx, actor: Actor | null, i: { convId: string; templateId: string; clientRef: string }): Promise<SendResult> {
  if (!can(actor, 'send')) return bad('You do not have permission for this')
  if (!UUID.test(i.convId) || !UUID.test(i.templateId) || !UUID.test(i.clientRef)) return bad('Bad request.')
  const t = await c.crepo.getTemplate(i.templateId)
  if (!t || t.status !== 'APPROVED') return bad(BLOCK_TEXT.template_not_approved)
  const plan = sendPlan(t.components, !!t.header_file_id)
  if (!plan.ok) return bad(plan.error)
  let mediaId: string | null = null, fileName: string | null = null
  if (plan.plan.header) {
    const m = await ensureMetaMediaId(c.crepo, c.env, c.f, t.header_file_id!)
    if (!m.ok) return bad(m.error)
    mediaId = m.mediaId; fileName = m.file.file_name
  }
  const content = templatePayload(t.name, t.language, plan.plan, { mediaId, fileName, refToken: INBOX_REF_TOKEN })
  const body = previewText(t.components as unknown[]).body.slice(0, 4096)
  const res = await c.store.reserveTemplate(i.convId, i.clientRef, t.id, body, content, actor!.id)
  if (res.blocked) return bad(BLOCK_TEXT[res.blocked] ?? 'Sending is blocked.')
  if (!res.is_new) return { ok: true, state: (res.send_state as 'accepted') ?? 'accepted', duplicate: true, convId: i.convId }
  const d = await deliver(c, i.convId, i.clientRef, content)
  await c.inbox.audit(actor!.id, 'send_template', i.convId, { template: t.name, state: d.state })
  return { ok: true, convId: i.convId, ...d }
}

// A new chat with a typed number. The person must already have agreed to hear
// from Edify on WhatsApp (Meta's rule for business-initiated messages); the
// user confirms that, and it is written to the audit log.
export async function startChat(c: Ctx, actor: Actor | null, i: { phone: string; templateId: string; clientRef: string; confirmOptIn: boolean }): Promise<SendResult> {
  if (!can(actor, 'send')) return bad('You do not have permission for this')
  if (i.confirmOptIn !== true) return bad('Confirm that this person agreed to receive WhatsApp messages from Edify.')
  const p = normaliseIndianMobile(String(i.phone ?? '').slice(0, 30))
  if (p.kind !== 'valid') return bad('Enter a 10-digit Indian mobile number.')
  if (!c.env.phoneNumberId) return bad('WhatsApp is not configured.')
  const convId = await c.store.conversationForPhone(p.e164, c.env.phoneNumberId)
  await c.inbox.audit(actor!.id, 'start_chat', convId, { opt_in_confirmed: true })
  return sendTemplateMessage(c, actor, { convId, templateId: i.templateId, clientRef: i.clientRef })
}

// An image or PDF (brochure) inside the 24-hour window.
export async function sendFile(c: Ctx, actor: Actor | null, i: { convId: string; fileId: string; caption: string; clientRef: string }): Promise<SendResult> {
  if (!can(actor, 'send')) return bad('You do not have permission for this')
  if (!UUID.test(i.convId) || !UUID.test(i.fileId) || !UUID.test(i.clientRef)) return bad('Bad request.')
  const file = await c.crepo.getMedia(i.fileId)
  if (!file || file.purpose !== 'outbound') return bad('Choose a file uploaded for the inbox.')
  const caption = String(i.caption ?? '').replace(/\r\n/g, '\n').trim().slice(0, 1024)
  const m = await ensureMetaMediaId(c.crepo, c.env, c.f, file.id)
  if (!m.ok) return bad(m.error)
  const content = file.kind === 'image'
    ? { type: 'image', image: { id: m.mediaId, ...(caption ? { caption } : {}) } }
    : { type: 'document', document: { id: m.mediaId, filename: file.file_name.slice(0, 100), ...(caption ? { caption } : {}) } }
  const res = await c.inbox.reserveOutbound(i.convId, i.clientRef, file.kind, caption || file.file_name, content, actor!.id)
  if (res.blocked) return bad(BLOCK_TEXT[res.blocked] ?? 'Sending is blocked.')
  if (!res.is_new) return { ok: true, state: (res.send_state as 'accepted') ?? 'accepted', duplicate: true, convId: i.convId }
  const d = await deliver(c, i.convId, i.clientRef, content)
  await c.inbox.audit(actor!.id, 'send_file', i.convId, { kind: file.kind, state: d.state })
  return { ok: true, convId: i.convId, ...d }
}

export function supabaseExtrasStore(sb: SupabaseClient): ExtrasStore {
  const must = <T,>(r: { data: T | null; error: { code?: string } | null }): T => {
    if (r.error) throw Object.assign(new Error('inbox extras db error'), { code: r.error.code })
    return r.data as T
  }
  return {
    async reserveTemplate(conv, ref, templateId, body, payload, sentBy) {
      const d = must(await sb.rpc('wa_reserve_template', { p_conv: conv, p_client_ref: ref, p_template: templateId, p_body: body, p_payload: payload, p_sent_by: sentBy }))
      return ((Array.isArray(d) ? d[0] : d) ?? { blocked: 'no_conversation' }) as Reserve
    },
    async conversationForPhone(phone, pnid) { return String(must(await sb.rpc('wa_conversation_for_phone', { p_phone: phone, p_phone_number_id: pnid }))) },
    async facts(convId) {
      const cv = must(await sb.from('wa_conversations').select('id,auto_off,contact_id,wa_contacts(phone_e164)').eq('id', convId).maybeSingle()) as Record<string, any> | null
      if (!cv) return null
      const phone: string | null = cv.wa_contacts?.phone_e164 ?? null
      const refs = phone
        ? must(await sb.from('referrals').select('id,ref_code,stage,referrer_phone,referred_phone').or(`referrer_phone.eq."${phone}",referred_phone.eq."${phone}"`).order('created_at', { ascending: false }).limit(20)) as Array<Record<string, string>>
        : []
      const camps = must(await sb.from('wa_campaign_recipients').select('claimed_at,state,wa_campaigns(id,name)').eq('contact_id', cv.contact_id).order('claimed_at', { ascending: false, nullsFirst: false }).limit(10)) as Array<Record<string, any>>
      return {
        autoOff: !!cv.auto_off,
        referrals: refs.map(r => ({ id: r.id, ref_code: r.ref_code, stage: r.stage, role: r.referrer_phone === phone ? 'referrer' as const : 'referred' as const })),
        campaigns: camps.filter(r => r.wa_campaigns).map(r => ({ id: r.wa_campaigns.id, name: r.wa_campaigns.name, at: r.claimed_at, status: r.state ?? null })),
      }
    },
  }
}

// Mock: reserves into the inbox mock's own message list.
export function mockExtrasStore(inbox: InboxRepo & { state: { messages: any[]; convs: any[]; contacts: any[]; settings: Record<string, unknown>; consent?: Array<{ contact_id: string; purpose: string; granted: boolean; recorded_at: string }> } },
  autoOff: Set<string> = new Set(), templateCategory: (id: string) => Promise<string | null> = async () => null): ExtrasStore {
  const s = inbox.state
  return {
    async reserveTemplate(conv, ref, templateId, body, _p, sentBy) {
      const ex = s.messages.find(m => m.client_ref === ref)
      if (ex) return { message_id: ex.id, is_new: false, send_state: ex.send_state, wamid: ex.wamid, blocked: null }
      if (s.settings.sending_enabled !== true) return { message_id: null, is_new: false, send_state: null, wamid: null, blocked: 'sending_off' }
      const cv = s.convs.find(c => c.id === conv)
      if (!cv) return { message_id: null, is_new: false, send_state: null, wamid: null, blocked: 'no_conversation' }
      // Mirrors wa_reserve_template: Marketing needs the latest marketing consent row to be a grant.
      if ((await templateCategory(templateId)) === 'MARKETING') {
        const mk = (s.consent ?? []).filter(c => c.contact_id === cv.contact_id && c.purpose === 'marketing').sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))[0]
        if (!mk?.granted) return { message_id: null, is_new: false, send_state: null, wamid: null, blocked: 'no_marketing_consent' }
      }
      const id = crypto.randomUUID()
      s.messages.push({ id, conversation_id: conv, direction: 'outbound', type: 'template', body, status: null, status_rank: 0, send_state: 'sending',
        error_code: null, error_title: null, sent_by: sentBy, meta_timestamp: null, created_at: new Date().toISOString(), client_ref: ref, wamid: null })
      return { message_id: id, is_new: true, send_state: 'sending', wamid: null, blocked: null }
    },
    async conversationForPhone(phone) {
      let ct = s.contacts.find(c => c.phone_e164 === phone)
      if (!ct) { ct = { id: crypto.randomUUID(), phone_e164: phone, bsuid: null, username: null, profile_name: null, phone_source: 'import', lead_id: null, lead_link_method: null }; s.contacts.push(ct) }
      let cv = s.convs.find(c => c.contact_id === ct.id)
      if (!cv) { cv = { id: crypto.randomUUID(), contact_id: ct.id, status: 'open', unread_count: 0, last_message_at: null, last_inbound_at: null, last_message_preview: null, updated_at: new Date().toISOString() }; s.convs.push(cv) }
      return cv.id
    },
    async facts(convId) { return s.convs.some(c => c.id === convId) ? { autoOff: autoOff.has(convId), referrals: [], campaigns: [] } : null },
  }
}
