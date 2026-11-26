// In-memory inbox data for local development and tests. Fake people, fake
// numbers in the 91980000xxxx range. Never used in production: the inbox
// only picks it when WA_INBOX_MOCK=1 and NODE_ENV is not 'production'.
import { randomUUID } from 'node:crypto'
import type {
  InboxRepo, ConvRow, ContactRow, MessageRow, NoteRow, ConsentRow, LeadLite, LeadActivityRow,
} from './inbox-repo'
import type { Usage } from './spend'

type State = {
  contacts: ContactRow[]
  convs: Array<Omit<ConvRow, 'phone_e164' | 'bsuid' | 'username' | 'profile_name' | 'lead_id' | 'lead_name' | 'lead_stage'>>
  messages: Array<MessageRow & { conversation_id: string; client_ref: string | null; wamid: string | null }>
  notes: Array<NoteRow & { conversation_id: string }>
  consent: Array<ConsentRow & { contact_id: string }>
  leads: LeadLite[]
  activity: Array<LeadActivityRow & { lead_id: string }>
  settings: Record<string, unknown>
  audit: Array<{ actor: string; action: string; target: string | null; detail: unknown; at: string }>
}

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString()

export function seedState(): State {
  const c1 = randomUUID(), c2 = randomUUID(), c3 = randomUUID(), c4 = randomUUID()
  const v1 = randomUUID(), v2 = randomUUID(), v3 = randomUUID(), v4 = randomUUID()
  const lead1 = randomUUID(), lead4 = randomUUID()
  const msg = (conversation_id: string, direction: 'inbound' | 'outbound', body: string, min: number, extra: Partial<MessageRow> = {}) => ({
    id: randomUUID(), conversation_id, direction, type: 'text', body, status: direction === 'outbound' ? 'read' : null,
    status_rank: direction === 'outbound' ? 3 : 0, send_state: direction === 'outbound' ? 'accepted' : null,
    error_code: null, error_title: null, sent_by: direction === 'outbound' ? 'owner' : null,
    meta_timestamp: ago(min), created_at: ago(min), client_ref: null, wamid: `wamid.mock.${randomUUID()}`, ...extra,
  })
  return {
    contacts: [
      { id: c1, phone_e164: '+919800000011', bsuid: 'IN.MOCK0011', username: null, profile_name: 'Asha Verma', phone_source: 'webhook', lead_id: lead1, lead_link_method: 'manual' },
      { id: c2, phone_e164: null, bsuid: 'IN.MOCK0022', username: 'ravi.learns', profile_name: 'Ravi', phone_source: null, lead_id: null, lead_link_method: null },
      { id: c3, phone_e164: '+919800000033', bsuid: null, username: null, profile_name: 'Imran K', phone_source: 'webhook', lead_id: null, lead_link_method: null },
      { id: c4, phone_e164: '+919800000044', bsuid: null, username: null, profile_name: 'Neha', phone_source: 'webhook', lead_id: null, lead_link_method: null },
    ],
    convs: [
      { id: v1, contact_id: c1, status: 'open', unread_count: 2, last_message_at: ago(4), last_inbound_at: ago(4), last_message_preview: 'Is the MBA fee payable in instalments?', updated_at: ago(4) },
      { id: v2, contact_id: c2, status: 'open', unread_count: 1, last_message_at: ago(30), last_inbound_at: ago(30), last_message_preview: 'Hi, I saw your BCA comparison', updated_at: ago(30) },
      { id: v3, contact_id: c3, status: 'open', unread_count: 0, last_message_at: ago(60 * 30), last_inbound_at: ago(60 * 30), last_message_preview: 'Thanks', updated_at: ago(60 * 30) },
      { id: v4, contact_id: c4, status: 'open', unread_count: 1, last_message_at: ago(90), last_inbound_at: ago(90), last_message_preview: 'Please call me after 6 pm', updated_at: ago(90) },
    ],
    messages: [
      msg(v1, 'inbound', 'Hello, I filled the form on edifyedu.in', 50),
      msg(v1, 'outbound', 'Hi Asha, thanks for writing. Which programme are you looking at?', 45),
      msg(v1, 'inbound', 'Online MBA. Working full time.', 6),
      msg(v1, 'inbound', 'Is the MBA fee payable in instalments?', 4),
      msg(v2, 'inbound', 'Hi, I saw your BCA comparison', 30),
      msg(v3, 'inbound', 'Thanks', 60 * 30),
      msg(v4, 'inbound', 'Please call me after 6 pm', 90),
    ],
    notes: [{ id: randomUUID(), conversation_id: v1, actor: 'owner', body: 'Prefers EMI. Shortlist sent by email.', created_at: ago(40) }],
    consent: [{ contact_id: c1, purpose: 'counselling_call', granted: true, source: 'lead_form', evidence: 'Enquiry form consent text, submitted on edifyedu.in', recorded_by: 'owner', recorded_at: ago(44) }],
    leads: [
      { id: lead1, name: 'Asha Verma', phone: '919800000011', stage: 'Interested', email: null, program: 'MBA', university: null, source: '/compare · enquiry', next_call_date: null, next_call_time: null },
      { id: lead4, name: 'Neha Sharma', phone: '9800000044', stage: 'Fresh', email: null, program: 'BBA', university: null, source: '/programs/bba', next_call_date: null, next_call_time: null },
    ],
    activity: [{ id: randomUUID(), lead_id: lead1, occurred_on: ago(60 * 24).slice(0, 10), type: 'call', outcome: 'Interested', remark: 'Wants weekend classes', created_at: ago(60 * 24) }],
    settings: {
      sending_enabled: false, campaigns_enabled: false, automation_enabled: false,
      monthly_cap_inr: 500,
      rates: { currency: 'INR', market: 'India', effective_from: '2026-10-01', verified_on: '2026-11-26', source: 'Meta WhatsApp pricing page, INR list rates', service: 0.115, utility: 0.115, authentication: 0.115, authentication_international: 2.4971, marketing: 0.8631 },
      free_service_allowance: { per_month: 1000, verified_on: '2026-11-26', source: 'Meta WhatsApp pricing page' },
      billing_timezone: 'Asia/Kolkata', cap_override: null,
      last_sweep: { at: ago(3), ok: true, ms: 120, retried: 0, completed: 0, failed: 0, busy: 0, errors: 0, purged: 0, exhausted: 0 },
    },
    audit: [],
  }
}

// Strictly increasing timestamps, so two records in one millisecond still order.
let lastMs = 0
function monotonicNow() { lastMs = Math.max(Date.now(), lastMs + 1); return new Date(lastMs).toISOString() }

function digits(s: string) { return s.replace(/\D/g, '') }

export function mockInboxRepo(state: State = seedState()): InboxRepo & { state: State } {
  const s = state
  const full = (cv: State['convs'][number]): ConvRow => {
    const ct = s.contacts.find(c => c.id === cv.contact_id)!
    const lead = ct.lead_id ? s.leads.find(l => l.id === ct.lead_id) : undefined
    return { ...cv, phone_e164: ct.phone_e164, bsuid: ct.bsuid, username: ct.username, profile_name: ct.profile_name,
      lead_id: ct.lead_id, lead_name: lead?.name ?? null, lead_stage: lead?.stage ?? null }
  }
  const touch = (id: string) => { const cv = s.convs.find(c => c.id === id); if (cv) cv.updated_at = new Date().toISOString() }
  return {
    mode: 'mock',
    state: s,
    async listConversations(f) {
      const q = f.search?.trim().toLowerCase() || ''
      const d = digits(q)
      return s.convs.map(full)
        .filter(c => !f.status || c.status === f.status)
        .filter(c => !f.unreadOnly || c.unread_count > 0)
        .filter(c => !q || [c.profile_name, c.username, c.lead_name].some(v => v?.toLowerCase().includes(q)) || (d.length >= 4 && !!c.phone_e164?.includes(d)))
        .sort((a, b) => (b.last_message_at ?? '').localeCompare(a.last_message_at ?? ''))
        .filter(c => !f.beforeAt || (c.last_message_at ?? '') < f.beforeAt)
        .slice(0, f.limit)
    },
    async changedSince(since) { return s.convs.filter(c => c.updated_at > since).map(c => c.id) },
    async getConversation(id) { const cv = s.convs.find(c => c.id === id); return cv ? full(cv) : null },
    async getContact(id) { return s.contacts.find(c => c.id === id) ?? null },
    async getMessages(convId, limit) {
      return s.messages.filter(m => m.conversation_id === convId).sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(-limit)
    },
    async getNotes(convId) { return s.notes.filter(n => n.conversation_id === convId).sort((a, b) => b.created_at.localeCompare(a.created_at)) },
    async addNote(convId, actor, body) {
      const n = { id: randomUUID(), conversation_id: convId, actor, body, created_at: new Date().toISOString() }
      s.notes.push(n); return n
    },
    async getConsent(contactId) { return s.consent.filter(c => c.contact_id === contactId).sort((a, b) => b.recorded_at.localeCompare(a.recorded_at)) },
    async addConsent(contactId, row) { s.consent.push({ ...row, contact_id: contactId, recorded_at: monotonicNow() }) },
    async markRead(convId) { const cv = s.convs.find(c => c.id === convId); if (cv && cv.unread_count) { cv.unread_count = 0; touch(convId) } },
    async setStatus(convId, status) { const cv = s.convs.find(c => c.id === convId); if (cv) { cv.status = status; touch(convId) } },
    async findLeadsByDigits(p) {
      const alt = /^91[6-9]\d{9}$/.test(p) ? p.slice(2) : null
      return s.leads.filter(l => digits(l.phone) === p || (alt && digits(l.phone) === alt)).map(({ id, name, stage, phone }) => ({ id, name, stage, phone }))
    },
    async getLead(id) { return s.leads.find(l => l.id === id) ?? null },
    async getLeadActivity(leadId, limit) { return s.activity.filter(a => a.lead_id === leadId).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit) },
    async setContactLead(contactId, leadId, method) {
      const c = s.contacts.find(x => x.id === contactId); if (!c) return
      c.lead_id = leadId; c.lead_link_method = method
      s.convs.filter(v => v.contact_id === contactId).forEach(v => touch(v.id))
    },
    async createLead(l) {
      if (s.leads.some(x => digits(x.phone) === digits(l.phone))) return { conflict: true }
      const id = randomUUID()
      s.leads.push({ id, name: l.name, phone: l.phone, stage: 'Fresh', email: null, program: l.program, university: l.university, source: 'whatsapp', next_call_date: null, next_call_time: null })
      return { id }
    },
    async getSettings() { return structuredClone(s.settings) },
    async setSetting(key, value) { s.settings[key] = value },
    async usage(): Promise<Usage> {
      const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0)
      const out = s.messages.filter(m => m.direction === 'outbound' && m.created_at >= start.toISOString() && m.type !== 'template')
      return {
        month_start: start.toISOString(),
        service_delivered: out.filter(m => m.status_rank >= 2).length,
        service_in_flight: out.filter(m => m.status_rank < 2 && m.send_state !== 'failed').length,
        service_failed: out.filter(m => m.send_state === 'failed').length,
        templates_sent: 0, meta_billable: 0, meta_free: out.filter(m => m.status_rank >= 2).length,
      }
    },
    async beginOutbound(convId, clientRef, type, body, _payload, sentBy) {
      const ex = s.messages.find(m => m.client_ref === clientRef)
      if (ex) return { message_id: ex.id, is_new: false, send_state: ex.send_state ?? 'sending', wamid: ex.wamid }
      const id = randomUUID()
      s.messages.push({ id, conversation_id: convId, direction: 'outbound', type, body, status: null, status_rank: 0, send_state: 'sending',
        error_code: null, error_title: null, sent_by: sentBy, meta_timestamp: null, created_at: new Date().toISOString(), client_ref: clientRef, wamid: null })
      return { message_id: id, is_new: true, send_state: 'sending', wamid: null }
    },
    async finishOutbound(clientRef, wamid, state, code, title) {
      const m = s.messages.find(x => x.client_ref === clientRef); if (!m) return
      m.wamid = wamid ?? m.wamid; m.send_state = state; m.error_code = code; m.error_title = title
      if (state === 'accepted') {
        // Mock Meta: "sent" straight away.
        m.status = 'sent'; m.status_rank = 1
        const cv = s.convs.find(c => c.id === m.conversation_id)
        if (cv) { cv.last_message_at = new Date().toISOString(); cv.last_message_preview = (m.body ?? `[${m.type}]`).slice(0, 120); touch(cv.id) }
      }
    },
    async deleteContact(contactId) {
      const convIds = s.convs.filter(v => v.contact_id === contactId).map(v => v.id)
      s.messages = s.messages.filter(m => !convIds.includes(m.conversation_id))
      s.notes = s.notes.filter(n => !convIds.includes(n.conversation_id))
      s.convs = s.convs.filter(v => v.contact_id !== contactId)
      s.consent = s.consent.filter(c => c.contact_id !== contactId)
      s.contacts = s.contacts.filter(c => c.id !== contactId)
    },
    async audit(actor, action, target, detail) { s.audit.push({ actor, action, target, detail, at: new Date().toISOString() }) },
  }
}

// Mock stand-ins for the CRM actions the inbox reuses for linked leads.
export function mockCrm(repo: ReturnType<typeof mockInboxRepo>) {
  return {
    async saveOutcome(i: { leadId: string; outcome: string; note: string; date: string | null; time: string | null }) {
      const lead = repo.state.leads.find(l => l.id === i.leadId)
      if (!lead) return { ok: false as const, error: 'Lead not found' }
      repo.state.activity.push({ id: randomUUID(), lead_id: i.leadId, occurred_on: new Date().toISOString().slice(0, 10),
        type: i.outcome === 'Add note' ? 'note' : 'call', outcome: i.outcome === 'Add note' ? null : i.outcome, remark: i.note || null, created_at: new Date().toISOString() })
      if (i.date) { lead.next_call_date = i.date; lead.next_call_time = i.time }
      return { ok: true as const }
    },
    async quickSchedule(i: { leadId: string; chip: string }) {
      const lead = repo.state.leads.find(l => l.id === i.leadId)
      if (!lead) return { ok: false as const, error: 'Lead not found' }
      const add = { tomorrow: 1, in3: 3, nextweek: 7 }[i.chip as 'tomorrow']
      lead.next_call_date = add ? new Date(Date.now() + add * 864e5).toISOString().slice(0, 10) : null
      lead.next_call_time = null
      return { ok: true as const }
    },
  }
}
