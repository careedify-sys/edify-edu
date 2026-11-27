// Data access for the WhatsApp inbox. Server-only.
// One interface, two implementations: Supabase (production) and an in-memory
// mock (lib/whatsapp/inbox-mock.ts) for local browser checks and tests, so
// development never reads or writes real student data.
import type { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { Usage } from './spend'
import { safeErrorTitle } from './graph'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/inbox-repo.ts must not be imported in the browser')
}

export type ConvRow = {
  id: string
  contact_id: string
  status: 'open' | 'archived'
  unread_count: number
  last_message_at: string | null
  last_inbound_at: string | null
  last_message_preview: string | null
  phone_e164: string | null
  bsuid: string | null
  username: string | null
  profile_name: string | null
  lead_id: string | null
  lead_name: string | null
  lead_stage: string | null
  updated_at: string
}

export type ContactRow = {
  id: string
  phone_e164: string | null
  bsuid: string | null
  username: string | null
  profile_name: string | null
  phone_source: string | null
  lead_id: string | null
  lead_link_method: string | null
}

export type MessageRow = {
  id: string
  direction: 'inbound' | 'outbound'
  type: string
  body: string | null
  status: string | null
  status_rank: number
  send_state: string | null
  error_code: number | null
  error_title: string | null
  sent_by: string | null
  meta_timestamp: string | null
  created_at: string
}

export type NoteRow = { id: string; actor: string; body: string; created_at: string }

export type ConsentPurpose = 'service' | 'counselling_call' | 'utility' | 'marketing'
export type ConsentSource = 'lead_form' | 'whatsapp_message' | 'phone_call' | 'admin_entry'
export type ConsentRow = {
  purpose: ConsentPurpose
  granted: boolean
  source: ConsentSource
  evidence: string | null
  recorded_by: string
  recorded_at: string
}

export type LeadLite = {
  id: string
  name: string
  phone: string
  stage: string
  email: string | null
  program: string | null
  university: string | null
  source: string | null
  next_call_date: string | null
  next_call_time: string | null
}

export type LeadActivityRow = {
  id: string
  occurred_on: string
  type: 'call' | 'note'
  outcome: string | null
  remark: string | null
  created_at: string
}

export type ListFilter = {
  status: 'open' | 'archived' | null
  search: string | null
  unreadOnly: boolean
  beforeAt: string | null
  beforeId: string | null
  limit: number
}

// blocked: null when the row was reserved (or an earlier row came back), else
// the rule that stopped it, decided in SQL under a lock (wa_reserve_outbound).
export type ReserveBlock = 'bad_ref' | 'sending_off' | 'no_conversation' | 'window_closed' | 'opted_out' | 'rate_missing' | 'cap_missing' | 'cap_reached'
export type ReserveOutbound =
  | { blocked: null; message_id: string; is_new: boolean; send_state: string; wamid: string | null }
  | { blocked: ReserveBlock }

export interface InboxRepo {
  readonly mode: 'supabase' | 'mock'
  listConversations(f: ListFilter): Promise<ConvRow[]>
  changedSince(since: string): Promise<string[]>
  getConversation(id: string): Promise<ConvRow | null>
  getContact(id: string): Promise<ContactRow | null>
  getMessages(convId: string, limit: number): Promise<MessageRow[]>
  getNotes(convId: string): Promise<NoteRow[]>
  addNote(convId: string, actor: string, body: string): Promise<NoteRow>
  getConsent(contactId: string): Promise<ConsentRow[]>
  addConsent(contactId: string, row: Omit<ConsentRow, 'recorded_at'>): Promise<void>
  markRead(convId: string): Promise<void>
  setStatus(convId: string, status: 'open' | 'archived'): Promise<void>
  findLeadsByDigits(digits: string): Promise<Array<Pick<LeadLite, 'id' | 'name' | 'stage' | 'phone'>>>
  getLead(id: string): Promise<LeadLite | null>
  getLeadActivity(leadId: string, limit: number): Promise<LeadActivityRow[]>
  setContactLead(contactId: string, leadId: string | null, method: 'manual' | null): Promise<void>
  createLead(l: { name: string; phone: string; program: string | null; university: string | null }): Promise<{ id: string } | { conflict: true }>
  getSettings(): Promise<Record<string, unknown>>
  setSetting(key: string, value: unknown): Promise<void>
  usage(tz: string): Promise<Usage>
  reserveOutbound(convId: string, clientRef: string, type: string, body: string | null, payload: unknown, sentBy: string): Promise<ReserveOutbound>
  finishOutbound(clientRef: string, wamid: string | null, state: 'accepted' | 'failed' | 'unknown', code: number | null, title: string | null): Promise<void>
  audit(actor: string, action: string, target: string | null, detail: Record<string, unknown> | null): Promise<void>
  deleteContact(contactId: string): Promise<void>
}

type Sb = ReturnType<typeof createSupabaseServiceClient>

// PostgREST errors carry a code; keep it, drop the message (it can quote data).
function fail(what: string, e: { code?: string } | null): never {
  throw Object.assign(new Error(`${what} failed`), { code: e?.code })
}

const MSG_COLS = 'id,direction,type,body,status,status_rank,send_state,error_code,error_title,sent_by,meta_timestamp,created_at'
const LEAD_COLS = 'id,name,phone,stage,email,program,university,source,next_call_date,next_call_time'

export function supabaseInboxRepo(sb: Sb): InboxRepo {
  return {
    mode: 'supabase',
    async listConversations(f) {
      const { data, error } = await sb.rpc('wa_list_conversations', {
        p_status: f.status, p_search: f.search, p_unread_only: f.unreadOnly,
        p_before_at: f.beforeAt, p_before_id: f.beforeId, p_limit: f.limit,
      })
      if (error) fail('list', error)
      return (data ?? []) as ConvRow[]
    },
    async changedSince(since) {
      const { data, error } = await sb.rpc('wa_conversations_changed', { p_since: since })
      if (error) fail('poll', error)
      return ((data ?? []) as Array<string | { wa_conversations_changed: string }>).map(x => typeof x === 'string' ? x : x.wa_conversations_changed)
    },
    async getConversation(id) {
      const { data: cv, error } = await sb.from('wa_conversations')
        .select('id,contact_id,status,unread_count,last_message_at,last_inbound_at,last_message_preview,updated_at').eq('id', id).maybeSingle()
      if (error) fail('conversation', error)
      if (!cv) return null
      const ct = await this.getContact(cv.contact_id)
      let lead: LeadLite | null = null
      if (ct?.lead_id) lead = await this.getLead(ct.lead_id)
      return {
        ...cv, phone_e164: ct?.phone_e164 ?? null, bsuid: ct?.bsuid ?? null, username: ct?.username ?? null,
        profile_name: ct?.profile_name ?? null, lead_id: ct?.lead_id ?? null, lead_name: lead?.name ?? null, lead_stage: lead?.stage ?? null,
      } as ConvRow
    },
    async getContact(id) {
      const { data, error } = await sb.from('wa_contacts')
        .select('id,phone_e164,bsuid,username,profile_name,phone_source,lead_id,lead_link_method').eq('id', id).maybeSingle()
      if (error) fail('contact', error)
      return (data ?? null) as ContactRow | null
    },
    async getMessages(convId, limit) {
      const { data, error } = await sb.from('wa_messages').select(MSG_COLS)
        .eq('conversation_id', convId).order('created_at', { ascending: false }).limit(limit)
      if (error) fail('messages', error)
      // Delivery-status errors are written by Phase 1 unredacted; strip number-like runs before display.
      return ((data ?? []) as MessageRow[]).reverse().map(m => (m.error_title ? { ...m, error_title: safeErrorTitle(m.error_title) } : m))
    },
    async getNotes(convId) {
      const { data, error } = await sb.from('wa_notes').select('id,actor,body,created_at')
        .eq('conversation_id', convId).order('created_at', { ascending: false }).limit(50)
      if (error) fail('notes', error)
      return (data ?? []) as NoteRow[]
    },
    async addNote(convId, actor, body) {
      const { data, error } = await sb.from('wa_notes').insert({ conversation_id: convId, actor, body })
        .select('id,actor,body,created_at').single()
      if (error) fail('note', error)
      return data as NoteRow
    },
    async getConsent(contactId) {
      const { data, error } = await sb.from('wa_consent').select('purpose,granted,source,evidence,recorded_by,recorded_at')
        .eq('contact_id', contactId).order('recorded_at', { ascending: false }).limit(40)
      if (error) fail('consent', error)
      return (data ?? []) as ConsentRow[]
    },
    async addConsent(contactId, row) {
      const { error } = await sb.from('wa_consent').insert({ contact_id: contactId, ...row })
      if (error) fail('consent', error)
    },
    async markRead(convId) {
      const { error } = await sb.from('wa_conversations').update({ unread_count: 0 }).eq('id', convId).gt('unread_count', 0)
      if (error) fail('mark read', error)
    },
    async setStatus(convId, status) {
      const { error } = await sb.from('wa_conversations').update({ status }).eq('id', convId)
      if (error) fail('status', error)
    },
    async findLeadsByDigits(digits) {
      const { data, error } = await sb.rpc('wa_leads_by_digits', { p_digits: digits })
      if (error) fail('lead lookup', error)
      return (data ?? []) as Array<Pick<LeadLite, 'id' | 'name' | 'stage' | 'phone'>>
    },
    async getLead(id) {
      const { data, error } = await sb.from('leads').select(LEAD_COLS).eq('id', id).maybeSingle()
      if (error) fail('lead', error)
      return (data ?? null) as LeadLite | null
    },
    async getLeadActivity(leadId, limit) {
      const { data, error } = await sb.from('lead_activity').select('id,occurred_on,type,outcome,remark,created_at')
        .eq('lead_id', leadId).order('created_at', { ascending: false }).limit(limit)
      if (error) fail('activity', error)
      return (data ?? []) as LeadActivityRow[]
    },
    async setContactLead(contactId, leadId, method) {
      const { error } = await sb.from('wa_contacts').update({ lead_id: leadId, lead_link_method: method }).eq('id', contactId)
      if (error) fail('link', error)
    },
    async createLead(l) {
      const { data, error } = await sb.from('leads').insert({
        name: l.name, phone: l.phone, program: l.program, university: l.university,
        source: 'whatsapp', channel: 'whatsapp',
      }).select('id').single()
      if (error) {
        if (error.code === '23505') return { conflict: true }
        fail('create lead', error)
      }
      return { id: (data as { id: string }).id }
    },
    async getSettings() {
      const { data, error } = await sb.from('wa_settings').select('key,value')
      if (error) fail('settings', error)
      return Object.fromEntries(((data ?? []) as Array<{ key: string; value: unknown }>).map(r => [r.key, r.value]))
    },
    async setSetting(key, value) {
      const { error } = await sb.from('wa_settings').upsert({ key, value, updated_at: new Date().toISOString() })
      if (error) fail('setting', error)
    },
    async usage(tz) {
      const { data, error } = await sb.rpc('wa_month_usage', { p_tz: tz })
      if (error) fail('usage', error)
      return data as Usage
    },
    async reserveOutbound(convId, clientRef, type, body, payload, sentBy) {
      const { data, error } = await sb.rpc('wa_reserve_outbound', {
        p_conv: convId, p_client_ref: clientRef, p_type: type, p_body: body, p_payload: payload, p_sent_by: sentBy,
      })
      if (error) fail('reserve send', error)
      const row = (Array.isArray(data) ? data[0] : data) as { message_id: string | null; is_new: boolean; send_state: string | null; wamid: string | null; blocked: string | null } | undefined
      if (!row) throw Object.assign(new Error('reserve send: no row'), { code: 'no_row' })
      if (row.blocked) return { blocked: row.blocked as ReserveBlock }
      return { blocked: null, message_id: row.message_id!, is_new: row.is_new, send_state: row.send_state ?? 'sending', wamid: row.wamid }
    },
    async finishOutbound(clientRef, wamid, state, code, title) {
      const { error } = await sb.rpc('wa_finish_outbound', {
        p_client_ref: clientRef, p_wamid: wamid, p_state: state, p_error_code: code, p_error_title: title,
      })
      if (error) fail('finish send', error)
    },
    async deleteContact(contactId) {
      // Cascades to conversations, messages, notes, consent and identity history.
      const { error } = await sb.from('wa_contacts').delete().eq('id', contactId)
      if (error) fail('delete contact', error)
    },
    async audit(actor, action, target, detail) {
      // Best effort: an audit write failure is reported by code, never hides the action's result.
      const { error } = await sb.from('wa_audit_log').insert({ actor, action, target, detail })
      if (error) console.warn('[wa-inbox] audit write failed', error.code)
    },
  }
}
