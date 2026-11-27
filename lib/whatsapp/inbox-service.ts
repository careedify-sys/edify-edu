// WhatsApp inbox rules. Server-only, framework-free so tests can drive it
// with the mock repo and a fake fetch.
//
// Every function takes the actor and checks can() first. Nothing here sends
// on its own: a send happens only when a signed-in person presses Send, and
// only if sending is switched on, the 24-hour window is open, the student has
// not opted out, and this month's cap allows it.
import type { Actor, Action } from './access'
import { can } from './access'
import { looksLikeOptOut } from './opt-out'
import type { ReserveBlock } from './inbox-repo'
import type { InboxRepo, ConvRow, ContactRow, MessageRow, NoteRow, ConsentRow, ConsentPurpose, ConsentSource, LeadLite, LeadActivityRow } from './inbox-repo'
import { summariseSpend, parseRates, parseFreePerMonth, parseCap, parseOverride, windowState, type SpendSummary } from './spend'
import { sendMessage, textPayload, requestContactInfoPayload, checkConnection, type GraphEnv, type ConnectionReport } from './graph'

export type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }

const deny = (): { ok: false; error: string } => ({ ok: false, error: 'You do not have permission for this' })
const bad = (error: string): { ok: false; error: string } => ({ ok: false, error })
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const MAX_TEXT = 4096
export const REQUEST_PHONE_TEXT =
  'To help you faster, you can share your phone number with edifyedu.in. This is optional, and you can keep chatting here either way.'

function gate(actor: Actor | null, action: Action) { return can(actor, action) ? null : deny() }

export function currentConsent(rows: ConsentRow[]): Partial<Record<ConsentPurpose, ConsentRow>> {
  const out: Partial<Record<ConsentPurpose, ConsentRow>> = {}
  for (const r of [...rows].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))) if (!out[r.purpose]) out[r.purpose] = r
  return out
}

// Leads store Indian numbers as 91 + 10 digits (app/api/enquiry/route.ts).
export function leadPhoneFromE164(e164: string | null): string | null {
  const d = (e164 ?? '').replace(/\D/g, '')
  return /^\d{8,15}$/.test(d) ? d : null
}

// ── Spend ──────────────────────────────────────────────────────────────────

export async function spendSummary(repo: InboxRepo, settings?: Record<string, unknown>): Promise<SpendSummary & { timezone: string }> {
  const s = settings ?? await repo.getSettings()
  const tz = typeof s.billing_timezone === 'string' && validTimezone(s.billing_timezone) ? s.billing_timezone : 'Asia/Kolkata'
  const usage = await repo.usage(tz)
  return {
    ...summariseSpend({
      usage, rates: parseRates(s.rates), freePerMonth: parseFreePerMonth(s.free_service_allowance),
      capInr: parseCap(s.monthly_cap_inr), override: parseOverride(s.cap_override),
    }),
    timezone: tz,
  }
}

export function validTimezone(tz: string): boolean {
  try { new Intl.DateTimeFormat('en-IN', { timeZone: tz }); return true } catch { return false }
}

// ── Reading ────────────────────────────────────────────────────────────────

export type ThreadView = {
  conv: ConvRow
  contact: ContactRow
  messages: MessageRow[]
  notes: NoteRow[]
  consent: Partial<Record<ConsentPurpose, ConsentRow>>
  lead: LeadLite | null
  leadActivity: LeadActivityRow[]
  leadMatches: Array<Pick<LeadLite, 'id' | 'name' | 'stage' | 'phone'>>
  optOutHint: boolean     // a STOP-like message arrived after the last 'service' consent record
  canCall: boolean        // latest counselling_call record is a Yes and the student has not opted out
}

export async function loadThread(repo: InboxRepo, actor: Actor | null, convId: string): Promise<Result<{ thread: ThreadView }>> {
  const g = gate(actor, 'view'); if (g) return g
  if (!UUID.test(convId)) return bad('Unknown conversation')
  const conv = await repo.getConversation(convId)
  if (!conv) return bad('Unknown conversation')
  const contact = await repo.getContact(conv.contact_id)
  if (!contact) return bad('Unknown contact')
  const [messages, notes, consentRows] = await Promise.all([
    repo.getMessages(convId, 80), repo.getNotes(convId), repo.getConsent(contact.id),
  ])
  const lead = contact.lead_id ? await repo.getLead(contact.lead_id) : null
  const leadActivity = lead ? await repo.getLeadActivity(lead.id, 8) : []
  const digits = leadPhoneFromE164(contact.phone_e164)
  // Suggest only; linking is always a click (D3 keeps auto-link off until approved).
  const leadMatches = !lead && digits ? await repo.findLeadsByDigits(digits) : []
  const consent = currentConsent(consentRows)
  const optOutHint = !(consent.service && !consent.service.granted) && looksLikeOptOut(messages, consent.service?.recorded_at ?? null)
  const canCall = !!consent.counselling_call?.granted && !optOutHint && !(consent.service && !consent.service.granted)
  return { ok: true, thread: { conv, contact, messages, notes, consent, lead, leadActivity, leadMatches, optOutHint, canCall } }
}

// ── Sending ────────────────────────────────────────────────────────────────

export type SendInput = { convId: string; clientRef: string; kind: 'text' | 'request_phone'; text?: string }
export type SendOutcome = Result<{ state: 'accepted' | 'failed' | 'unknown' | 'sending'; error?: string; duplicate?: boolean }> | { ok: false; error: string; blocked: ReserveBlock }

export async function sendReply(
  repo: InboxRepo, env: GraphEnv, f: typeof fetch, actor: Actor | null, input: SendInput,
): Promise<SendOutcome> {
  const g = gate(actor, input.kind === 'request_phone' ? 'request_phone' : 'send'); if (g) return g
  if (!UUID.test(input.convId) || !UUID.test(input.clientRef)) return bad('Bad request')

  const settings = await repo.getSettings()
  if (settings.sending_enabled !== true) return bad(BLOCK_TEXT.sending_off)

  const conv = await repo.getConversation(input.convId)
  if (!conv) return bad('Unknown conversation')
  const contact = await repo.getContact(conv.contact_id)
  if (!contact) return bad('Unknown contact')

  if (!windowState(conv.last_inbound_at).open) {
    return bad('The 24-hour reply window is closed. A free-form reply is only allowed within 24 hours of the student\'s last message.')
  }
  // Friendly early answers. The authoritative check is wa_reserve_outbound,
  // which repeats every rule here under a lock.
  const consent = currentConsent(await repo.getConsent(contact.id))
  if (consent.service && !consent.service.granted) return bad(BLOCK_TEXT.opted_out)
  if (looksLikeOptOut(await repo.getMessages(input.convId, 80), consent.service?.recorded_at ?? null)) return bad(BLOCK_TEXT.opted_out)

  let type: string, body: string, content: Record<string, unknown>
  if (input.kind === 'request_phone') {
    if (contact.phone_e164) return bad('The phone number is already known')
    type = 'interactive'; body = REQUEST_PHONE_TEXT; content = requestContactInfoPayload(REQUEST_PHONE_TEXT)
  } else {
    const text = (input.text ?? '').replace(/\r\n/g, '\n').trim()
    if (!text) return bad('Type a message first')
    if (text.length > MAX_TEXT) return bad(`Messages are limited to ${MAX_TEXT} characters`)
    type = 'text'; body = text; content = textPayload(text)
  }

  // Check every rule and reserve the row in one locked step. Nothing is
  // written when a rule blocks, so the same key can be sent again later.
  const begun = await repo.reserveOutbound(input.convId, input.clientRef, type, body, content, actor!.id)
  if (begun.blocked) {
    if (begun.blocked === 'cap_reached' || begun.blocked === 'opted_out') {
      await repo.audit(actor!.id, 'send_blocked_' + begun.blocked, input.convId, null)
    }
    return { ok: false, error: BLOCK_TEXT[begun.blocked], blocked: begun.blocked }
  }
  if (!begun.is_new) {
    return { ok: true, state: begun.send_state as 'accepted', duplicate: true }
  }

  const r = await sendMessage(env, { phoneDigits: leadPhoneFromE164(contact.phone_e164), bsuid: contact.bsuid }, content, f)
  // Meta has answered. From here on nothing may throw to the caller: an error
  // would read as "try again", and a retry with a new key would message the
  // student twice. If recording fails, the row stays 'sending' (counted in the
  // cap) and the page says to check the thread.
  try {
    if (r.state === 'accepted') await repo.finishOutbound(input.clientRef, r.wamid, 'accepted', null, null)
    else if (r.state === 'failed') await repo.finishOutbound(input.clientRef, null, 'failed', r.code, r.title)
    else await repo.finishOutbound(input.clientRef, null, 'unknown', null, `No confirmation from Meta (${r.reason})`)
    await repo.audit(actor!.id, input.kind === 'request_phone' ? 'request_phone' : 'send', input.convId,
      { message_id: begun.message_id, state: r.state, ...(r.state === 'failed' ? { code: r.code } : {}) })
  } catch {
    if (r.state === 'failed') return { ok: true, state: 'failed', error: r.title ?? 'Meta refused the message' }
    return { ok: true, state: 'unknown', error: 'The message may have gone, but it could not be recorded. Check the thread before sending it again.' }
  }

  if (r.state === 'accepted') return { ok: true, state: 'accepted' }
  if (r.state === 'failed') return { ok: true, state: 'failed', error: r.title ?? 'Meta refused the message' }
  return { ok: true, state: 'unknown', error: 'Meta did not confirm this message. Check the thread before sending it again.' }
}

export const BLOCK_TEXT: Record<ReserveBlock, string> = {
  bad_ref: 'Bad request',
  sending_off: 'Sending is switched off. The owner can switch it on in Settings.',
  no_conversation: 'Unknown conversation',
  window_closed: 'The 24-hour reply window is closed. A free-form reply is only allowed within 24 hours of the student\'s last message.',
  opted_out: 'This student asked not to be messaged. Sending is blocked until they agree again and you record it under Consent.',
  rate_missing: 'The service message rate is not set, so the cost cannot be checked',
  cap_missing: 'The monthly cap is not set',
  cap_reached: 'This month\'s cap is reached. The owner can raise it in Settings.',
}

// ── Notes, consent, archive ────────────────────────────────────────────────

export async function addNote(repo: InboxRepo, actor: Actor | null, convId: string, body: string): Promise<Result<{ note: NoteRow }>> {
  const g = gate(actor, 'note'); if (g) return g
  if (!UUID.test(convId) || !(await repo.getConversation(convId))) return bad('Unknown conversation')
  const text = body.trim()
  if (!text) return bad('The note is empty')
  if (text.length > 4000) return bad('Notes are limited to 4,000 characters')
  const note = await repo.addNote(convId, actor!.id, text)
  await repo.audit(actor!.id, 'note', convId, { note_id: note.id })
  return { ok: true, note }
}

const PURPOSES: ConsentPurpose[] = ['service', 'counselling_call', 'utility', 'marketing']
const SOURCES: ConsentSource[] = ['lead_form', 'whatsapp_message', 'phone_call', 'admin_entry']

export async function recordConsent(repo: InboxRepo, actor: Actor | null, i: {
  contactId: string; purpose: string; granted: boolean; source: string; evidence: string
}): Promise<Result> {
  const g = gate(actor, 'record_consent'); if (g) return g
  if (!UUID.test(i.contactId) || !(await repo.getContact(i.contactId))) return bad('Unknown contact')
  if (!PURPOSES.includes(i.purpose as ConsentPurpose)) return bad('Unknown purpose')
  if (!SOURCES.includes(i.source as ConsentSource)) return bad('Unknown source')
  const evidence = i.evidence.trim()
  if (i.granted && !evidence) return bad('Say where the consent came from (for example, the student\'s words and the date)')
  if (evidence.length > 500) return bad('Evidence is limited to 500 characters')
  await repo.addConsent(i.contactId, {
    purpose: i.purpose as ConsentPurpose, granted: i.granted, source: i.source as ConsentSource,
    evidence: evidence || null, recorded_by: actor!.id,
  })
  // An opt-out from messages is an opt-out from calls too (privacy policy 3(d)).
  if (i.purpose === 'service' && !i.granted) {
    await repo.addConsent(i.contactId, {
      purpose: 'counselling_call', granted: false, source: i.source as ConsentSource,
      evidence: evidence || 'Recorded with the opt-out from WhatsApp replies', recorded_by: actor!.id,
    })
  }
  await repo.audit(actor!.id, 'consent', i.contactId, { purpose: i.purpose, granted: i.granted, source: i.source })
  return { ok: true }
}

export async function setArchived(repo: InboxRepo, actor: Actor | null, convId: string, archived: boolean): Promise<Result> {
  const g = gate(actor, 'archive'); if (g) return g
  if (!UUID.test(convId) || !(await repo.getConversation(convId))) return bad('Unknown conversation')
  await repo.setStatus(convId, archived ? 'archived' : 'open')
  await repo.audit(actor!.id, archived ? 'archive' : 'unarchive', convId, null)
  return { ok: true }
}

export async function markRead(repo: InboxRepo, actor: Actor | null, convId: string): Promise<Result> {
  const g = gate(actor, 'view'); if (g) return g
  if (!UUID.test(convId)) return bad('Unknown conversation')
  await repo.markRead(convId)
  return { ok: true }
}

// ── CRM links ──────────────────────────────────────────────────────────────

export async function linkLead(repo: InboxRepo, actor: Actor | null, contactId: string, leadId: string | null): Promise<Result> {
  const g = gate(actor, 'link_lead'); if (g) return g
  if (!UUID.test(contactId) || !(await repo.getContact(contactId))) return bad('Unknown contact')
  if (leadId !== null && (!UUID.test(leadId) || !(await repo.getLead(leadId)))) return bad('Unknown lead')
  await repo.setContactLead(contactId, leadId, leadId ? 'manual' : null)
  await repo.audit(actor!.id, leadId ? 'link_lead' : 'unlink_lead', contactId, leadId ? { lead_id: leadId } : null)
  return { ok: true }
}

export async function createLeadFromContact(repo: InboxRepo, actor: Actor | null, i: {
  contactId: string; name: string; program: string; university: string
}): Promise<Result<{ leadId: string; existing: boolean }>> {
  const g = gate(actor, 'create_lead'); if (g) return g
  if (!UUID.test(i.contactId)) return bad('Unknown contact')
  const contact = await repo.getContact(i.contactId)
  if (!contact) return bad('Unknown contact')
  if (contact.lead_id) return bad('This contact is already linked to a lead')
  const phone = leadPhoneFromE164(contact.phone_e164)
  if (!phone) return bad('A lead needs a phone number. Ask the student to share it first.')
  const name = i.name.trim().slice(0, 200) || contact.profile_name?.trim().slice(0, 200) || ''
  if (!name) return bad('Enter a name for the lead')
  const clip = (s: string) => s.trim().slice(0, 200) || null

  let leadId: string, existing = false
  // A lead stored as a bare 10-digit number does not trip the unique digits
  // index, so look first and link instead of creating a duplicate.
  const before = await repo.findLeadsByDigits(phone)
  const created = before.length ? { conflict: true as const } : await repo.createLead({ name, phone, program: clip(i.program), university: clip(i.university) })
  if ('id' in created) {
    leadId = created.id
  } else {
    // Same phone already in the CRM (unique digits index): link that lead.
    const found = await repo.findLeadsByDigits(phone)
    if (!found.length) return bad('A lead with this phone exists but could not be read')
    leadId = found[0].id; existing = true
  }
  await repo.setContactLead(i.contactId, leadId, 'manual')
  await repo.audit(actor!.id, existing ? 'link_lead' : 'create_lead', i.contactId, { lead_id: leadId })
  return { ok: true, leadId, existing }
}

// ── Settings (owner only) ──────────────────────────────────────────────────

export type SettingsView = {
  sendingEnabled: boolean
  capInr: number | null
  rates: ReturnType<typeof parseRates>
  freePerMonth: number | null
  freeSource: string | null
  timezone: string
  override: ReturnType<typeof parseOverride>
  lastSweep: { at: string; ok: boolean; [k: string]: unknown } | null
  spend: SpendSummary & { timezone: string }
  migrationReady: boolean
}

export async function loadSettings(repo: InboxRepo, actor: Actor | null): Promise<Result<{ settings: SettingsView }>> {
  const g = gate(actor, 'view'); if (g) return g
  const s = await repo.getSettings()
  const ls = s.last_sweep as SettingsView['lastSweep']
  const free = s.free_service_allowance as { source?: string } | undefined
  return {
    ok: true,
    settings: {
      sendingEnabled: s.sending_enabled === true,
      capInr: parseCap(s.monthly_cap_inr),
      rates: parseRates(s.rates),
      freePerMonth: parseFreePerMonth(s.free_service_allowance),
      freeSource: typeof free?.source === 'string' ? free.source : null,
      timezone: typeof s.billing_timezone === 'string' ? s.billing_timezone : 'Asia/Kolkata',
      override: parseOverride(s.cap_override),
      lastSweep: ls && typeof ls === 'object' && typeof ls.at === 'string' ? ls : null,
      spend: await spendSummary(repo, s),
      migrationReady: 'monthly_cap_inr' in s && 'rates' in s,
    },
  }
}

export async function setSending(repo: InboxRepo, actor: Actor | null, on: boolean): Promise<Result> {
  const g = gate(actor, 'toggle_sending'); if (g) return g
  await repo.setSetting('sending_enabled', on === true)
  await repo.audit(actor!.id, 'sending_enabled', null, { value: on === true })
  return { ok: true }
}

export async function updateBilling(repo: InboxRepo, actor: Actor | null, i: {
  capInr: number; service: number; utility: number; marketing: number; authentication: number
  effectiveFrom: string; verifiedOn: string; source: string; freePerMonth: number; freeSource: string; timezone: string
}): Promise<Result> {
  const g = gate(actor, 'edit_settings'); if (g) return g
  const n = (v: number, max: number) => Number.isFinite(v) && v >= 0 && v <= max
  if (!n(i.capInr, 100000)) return bad('The cap must be between ₹0 and ₹1,00,000')
  for (const [k, v] of [['service', i.service], ['utility', i.utility], ['marketing', i.marketing], ['authentication', i.authentication]] as const) {
    if (!n(v, 100)) return bad(`The ${k} rate must be between 0 and 100`)
  }
  if (!Number.isInteger(i.freePerMonth) || !n(i.freePerMonth, 1_000_000)) return bad('The free allowance must be a whole number')
  const date = /^\d{4}-\d{2}-\d{2}$/
  if (!date.test(i.effectiveFrom) || !date.test(i.verifiedOn)) return bad('Dates must look like 2026-10-01')
  if (!i.source.trim() || !i.freeSource.trim()) return bad('Say where the rates and the free allowance come from')
  if (!validTimezone(i.timezone)) return bad('Unknown time zone')

  const before = await repo.getSettings()
  const oldRates = (before.rates ?? {}) as Record<string, unknown>
  const rates = {
    ...oldRates, currency: 'INR', market: 'India', service: i.service, utility: i.utility, marketing: i.marketing,
    authentication: i.authentication, effective_from: i.effectiveFrom, verified_on: i.verifiedOn, source: i.source.trim().slice(0, 300),
  }
  await repo.setSetting('monthly_cap_inr', i.capInr)
  await repo.setSetting('rates', rates)
  await repo.setSetting('free_service_allowance', { per_month: i.freePerMonth, verified_on: i.verifiedOn, source: i.freeSource.trim().slice(0, 300) })
  await repo.setSetting('billing_timezone', i.timezone)
  await repo.audit(actor!.id, 'billing_settings', null, {
    before: { cap: before.monthly_cap_inr, rates: before.rates, free: before.free_service_allowance, tz: before.billing_timezone },
    after: { cap: i.capInr, rates, free: i.freePerMonth, tz: i.timezone },
  })
  return { ok: true }
}

export async function overrideCap(repo: InboxRepo, actor: Actor | null, extraInr: number, reason: string): Promise<Result> {
  const g = gate(actor, 'override_cap'); if (g) return g
  if (!Number.isFinite(extraInr) || extraInr < 0 || extraInr > 100000) return bad('The extra amount must be between ₹0 and ₹1,00,000')
  if (!reason.trim()) return bad('Give a reason for the override')
  const spend = await spendSummary(repo)
  const value = extraInr === 0 ? null : {
    month_start: spend.monthStart, extra_inr: extraInr, by: actor!.id, at: new Date().toISOString(), reason: reason.trim().slice(0, 300),
  }
  await repo.setSetting('cap_override', value)
  await repo.audit(actor!.id, 'cap_override', null, { extra_inr: extraInr, month_start: spend.monthStart, reason: reason.trim().slice(0, 300) })
  return { ok: true }
}

export async function connectionCheck(repo: InboxRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch): Promise<Result<{ report: ConnectionReport }>> {
  const g = gate(actor, 'connection_check'); if (g) return g
  const report = await checkConnection(env, f)
  await repo.audit(actor!.id, 'connection_check', null, { vars: report.vars, problems: report.problems.length })
  return { ok: true, report }
}

// Privacy request: delete everything the inbox holds about one contact.
// Cascades to conversations, messages, notes, consent and identity history.
// The CRM lead, if any, is separate and is not touched. Raw webhook bodies
// age out after 30 days on their own, which keeps the policy's 30-day promise.
export async function deleteContactData(repo: InboxRepo, actor: Actor | null, contactId: string, confirm: string): Promise<Result> {
  const g = gate(actor, 'delete_contact'); if (g) return g
  if (!UUID.test(contactId) || !(await repo.getContact(contactId))) return bad('Unknown contact')
  if (confirm !== 'DELETE') return bad('Type DELETE to confirm')
  await repo.deleteContact(contactId)
  await repo.audit(actor!.id, 'delete_contact', contactId, null)
  return { ok: true }
}

export { looksLikeOptOut } from './opt-out'
