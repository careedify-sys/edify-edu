// Data access for referral campaigns (Phase 3). Server-only.
// Same shape as inbox-repo.ts: one interface, a Supabase implementation and an
// in-memory mock (campaign-mock.ts), so local checks never touch student data.
// Every rule that protects a student or the budget lives in SQL
// (20261203120000_whatsapp_campaigns.sql); this file only calls it.
import type { createSupabaseServiceClient } from '@/lib/supabase/service'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/campaign-repo.ts must not be imported in the browser')
}

export type Marketing = 'yes' | 'no' | 'unknown'
export type NumberStatus = { phone: string; contact_id: string | null; marketing: Marketing; opted_out: boolean; lists: number }
export type ImportResult = { received: number; valid: number; new_contacts: number; added_to_list: number; already_in_list: number }
export type ListRow = { id: string; name: string; created_at: string; updated_at: string; members: number }
export type MemberRow = { contact_id: string; phone: string | null; profile_name: string | null; source: string; added_at: string }
export type TemplateRow = {
  id: string; meta_id: string | null; name: string; language: string; category: string; status: string
  components: unknown[]; reason: string | null; quality: string | null; synced_at: string | null; created_at: string
  header_file_id: string | null
}
export type MediaRow = {
  id: string; purpose: 'template_header' | 'outbound'; kind: 'image' | 'document'; file_name: string; mime: string
  size_bytes: number; sha256: string; storage_path: string; meta_media_id: string | null; meta_media_expires: string | null
  created_by: string | null; created_at: string
}
export type NewMedia = Pick<MediaRow, 'purpose' | 'kind' | 'file_name' | 'mime' | 'size_bytes' | 'sha256' | 'created_by'>
export type CampaignStatus = 'draft' | 'approved' | 'sending' | 'paused' | 'completed' | 'cancelled'
export type CampaignRow = {
  id: string; name: string; status: CampaignStatus; template_id: string | null; scheduled_at: string | null
  batch_size: number; daily_max: number; budget_inr: number | null; approval: Preview | null
  approved_by: string | null; approved_at: string | null; paused_reason: string | null
  duplicated_from: string | null; created_by: string; created_at: string; updated_at: string
  started_at: string | null; completed_at: string | null; ref_token: string
}
export type RecipientState = 'queued' | 'sending' | 'accepted' | 'failed' | 'unknown' | 'skipped' | 'cancelled'
export type RecipientRow = {
  id: number; contact_id: string; phone: string | null; state: RecipientState; skip_reason: string | null
  error_code: number | null; claimed_at: string | null; finished_at: string | null; message_status: string | null
}
export type HistoryRow = { campaign_id: string; campaign_name: string; state: string; claimed_at: string | null; message_status: string | null }
export type Preview = {
  template_id: string | null; template_name: string | null; template_status: string | null; category: string | null
  preview: string | null; recipients_queued: number; eligible: number; excluded: Record<string, number>
  rate: number | null; tax_pct: number; cost_before_tax: number; cost_with_tax: number; budget_inr: number | null
  error?: string
}
export type Stats = {
  total: number; queued: number; processing: number; skipped: number; skipped_by_reason: Record<string, number>
  cancelled: number; unknown: number; sent: number; delivered: number; read: number; failed: number
  replies: number; messaged_after_unconfirmed: number; opt_outs: number; meta_billable: number
}
export type Spend = { day_start: string; month_start: string; today: number; month: number; last_24h_reached: number; [k: string]: unknown }
export type ClaimRow = { recipient_id: number | null; client_ref: string | null; phone: string | null; blocked: string | null }
export type ConsentInput = { granted: boolean; source: string; obtained_on: string | null; evidence: string; recorded_by: string }
export type DraftPatch = Partial<Pick<CampaignRow, 'name' | 'template_id' | 'scheduled_at' | 'batch_size' | 'daily_max' | 'budget_inr'>>

export interface CampaignRepo {
  readonly mode: 'supabase' | 'mock'
  numbersStatus(phones: string[]): Promise<NumberStatus[]>
  importNumbers(phones: string[], listId: string | null, source: string, actor: string): Promise<ImportResult>
  inboxPhones(limit: number): Promise<string[]>
  crmPhones(limit: number): Promise<string[]>
  addConsent(contactIds: string[], c: ConsentInput): Promise<number>

  lists(): Promise<ListRow[]>
  getList(id: string): Promise<ListRow | null>
  createList(name: string, actor: string): Promise<{ id: string } | { conflict: true }>
  renameList(id: string, name: string): Promise<{ ok: true } | { conflict: true }>
  archiveList(id: string): Promise<void>
  listMembers(listId: string, digits: string | null, offset: number, limit: number): Promise<{ rows: MemberRow[]; total: number }>
  listPhones(listId: string): Promise<string[]>
  removeMembers(listId: string, contactIds: string[]): Promise<number>
  contactHistory(contactId: string): Promise<HistoryRow[]>

  templates(): Promise<TemplateRow[]>
  getTemplate(id: string): Promise<TemplateRow | null>
  saveTemplate(t: Omit<TemplateRow, 'id' | 'created_at' | 'synced_at' | 'header_file_id'> & { submitted_by: string | null; header_file_id?: string | null }): Promise<void>
  setTemplateStatus(id: string, status: string, category: string | null): Promise<void>
  updateTemplate(id: string, patch: { components?: unknown[]; status?: string; reason?: string | null; header_file_id?: string | null }): Promise<void>
  activeCampaignsUsing(templateId: string): Promise<number>

  saveMedia(m: NewMedia, bytes: Uint8Array): Promise<{ id: string }>
  getMedia(id: string): Promise<MediaRow | null>
  mediaBytes(id: string): Promise<Uint8Array | null>
  setMediaMetaId(id: string, mediaId: string, expiresIso: string): Promise<void>
  mediaFiles(purpose: MediaRow['purpose']): Promise<MediaRow[]>

  campaigns(): Promise<CampaignRow[]>
  getCampaign(id: string): Promise<CampaignRow | null>
  createCampaign(c: { name: string; created_by: string; batch_size: number; daily_max: number; budget_inr: number | null; template_id: string | null; duplicated_from: string | null }): Promise<{ id: string }>
  updateDraft(id: string, patch: DraftPatch): Promise<void>
  addRecipients(campaignId: string, contactIds: string[], listId: string | null, excludeCampaign: string | null): Promise<number>
  removeRecipients(campaignId: string, contactIds: string[]): Promise<number>
  recipients(campaignId: string, state: RecipientState | null, offset: number, limit: number): Promise<{ rows: RecipientRow[]; total: number }>
  preview(campaignId: string): Promise<Preview>
  approve(campaignId: string, actor: string, seenEligible: number, seenTemplate: string): Promise<string | null>
  control(campaignId: string, action: 'pause' | 'resume' | 'cancel' | 'unapprove'): Promise<string | null>
  stats(campaignId: string): Promise<Stats>
  spend(tz: string): Promise<Spend>

  dueCampaigns(nowIso: string, limit: number): Promise<Array<Pick<CampaignRow, 'id' | 'template_id' | 'batch_size' | 'ref_token'>>>
  claim(campaignId: string, limit: number, phoneNumberId: string): Promise<ClaimRow[]>
  finish(clientRef: string, wamid: string | null, state: 'accepted' | 'failed' | 'unknown', code: number | null, title: string | null): Promise<void>
  release(clientRefs: string[]): Promise<number>
  pauseAll(reason: string): Promise<number>
  recordMarketingOptOuts(): Promise<number>
  retention(): Promise<number>

  getSettings(): Promise<Record<string, unknown>>
  setSetting(key: string, value: unknown): Promise<void>
  audit(actor: string, action: string, target: string | null, detail: Record<string, unknown> | null): Promise<void>
}

type Sb = ReturnType<typeof createSupabaseServiceClient>

function fail(what: string, e: { code?: string } | null): never {
  throw Object.assign(new Error(`${what} failed`), { code: e?.code })
}

const CHUNK = 5000
const chunks = <T,>(a: T[], n = CHUNK) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
const CAMPAIGN_COLS = 'id,name,status,template_id,scheduled_at,batch_size,daily_max,budget_inr,approval,approved_by,approved_at,paused_reason,duplicated_from,created_by,created_at,updated_at,started_at,completed_at,ref_token'
const TEMPLATE_COLS = 'id,meta_id,name,language,category,status,components,reason,quality,synced_at,created_at,header_file_id'
const MEDIA_COLS = 'id,purpose,kind,file_name,mime,size_bytes,sha256,storage_path,meta_media_id,meta_media_expires,created_by,created_at'
export const MEDIA_BUCKET = 'wa-media'
const one = <T,>(x: T | T[] | null | undefined): T | null => (Array.isArray(x) ? x[0] ?? null : x ?? null)

export function supabaseCampaignRepo(sb: Sb): CampaignRepo {
  return {
    mode: 'supabase',
    async numbersStatus(phones) {
      const out: NumberStatus[] = []
      for (const c of chunks(phones)) {
        const { data, error } = await sb.rpc('wa_numbers_status', { p_numbers: c })
        if (error) fail('number check', error)
        out.push(...((data ?? []) as NumberStatus[]))
      }
      return out
    },
    async importNumbers(phones, listId, source, actor) {
      const total: ImportResult = { received: 0, valid: 0, new_contacts: 0, added_to_list: 0, already_in_list: 0 }
      for (const c of chunks(phones)) {
        const { data, error } = await sb.rpc('wa_import_numbers', { p_numbers: c, p_list: listId, p_source: source, p_actor: actor })
        if (error) fail('import', error)
        const r = data as ImportResult
        for (const k of Object.keys(total) as Array<keyof ImportResult>) total[k] += Number(r?.[k] ?? 0)
      }
      return total
    },
    async inboxPhones(limit) {
      const { data, error } = await sb.from('wa_conversations').select('wa_contacts!inner(phone_e164)')
        .not('last_inbound_at', 'is', null).order('last_message_at', { ascending: false }).limit(limit)
      if (error) fail('inbox numbers', error)
      return ((data ?? []) as any[]).map(r => one(r.wa_contacts)?.phone_e164).filter((p): p is string => typeof p === 'string')
    },
    async crmPhones(limit) {
      const { data, error } = await sb.from('leads').select('phone').not('phone', 'is', null).order('created_at', { ascending: false }).limit(limit)
      if (error) fail('crm numbers', error)
      return ((data ?? []) as Array<{ phone: string | null }>).map(r => r.phone).filter((p): p is string => typeof p === 'string')
    },
    async addConsent(contactIds, c) {
      let n = 0
      for (const ids of chunks(contactIds, 1000)) {
        const rows = ids.map(id => ({ contact_id: id, purpose: 'marketing', granted: c.granted, source: c.source, obtained_on: c.obtained_on, evidence: c.evidence, recorded_by: c.recorded_by }))
        const { error } = await sb.from('wa_consent').insert(rows)
        if (error) fail('consent', error)
        n += rows.length
      }
      return n
    },

    async lists() {
      const { data, error } = await sb.from('wa_lists').select('id,name,created_at,updated_at,wa_list_members(count)')
        .is('archived_at', null).order('updated_at', { ascending: false }).limit(200)
      if (error) fail('lists', error)
      return ((data ?? []) as any[]).map(r => ({ id: r.id, name: r.name, created_at: r.created_at, updated_at: r.updated_at, members: Number(one(r.wa_list_members)?.count ?? 0) }))
    },
    async getList(id) {
      const { data, error } = await sb.from('wa_lists').select('id,name,created_at,updated_at,wa_list_members(count)').eq('id', id).is('archived_at', null).maybeSingle()
      if (error) fail('list', error)
      if (!data) return null
      const r = data as any
      return { id: r.id, name: r.name, created_at: r.created_at, updated_at: r.updated_at, members: Number(one(r.wa_list_members)?.count ?? 0) }
    },
    async createList(name, actor) {
      const { data, error } = await sb.from('wa_lists').insert({ name, created_by: actor }).select('id').single()
      if (error) { if (error.code === '23505') return { conflict: true }; fail('create list', error) }
      return { id: (data as { id: string }).id }
    },
    async renameList(id, name) {
      const { error } = await sb.from('wa_lists').update({ name }).eq('id', id).is('archived_at', null)
      if (error) { if (error.code === '23505') return { conflict: true }; fail('rename list', error) }
      return { ok: true }
    },
    async archiveList(id) {
      const { error } = await sb.from('wa_lists').update({ archived_at: new Date().toISOString() }).eq('id', id)
      if (error) fail('archive list', error)
    },
    async listMembers(listId, digits, offset, limit) {
      let q = sb.from('wa_list_members').select('contact_id,source,added_at,wa_contacts!inner(phone_e164,profile_name)', { count: 'exact' })
        .eq('list_id', listId)
      if (digits) q = q.like('wa_contacts.phone_e164', `%${digits}%`)
      const { data, error, count } = await q.order('added_at', { ascending: false }).order('contact_id').range(offset, offset + limit - 1)
      if (error) fail('members', error)
      return {
        total: count ?? 0,
        rows: ((data ?? []) as any[]).map(r => ({ contact_id: r.contact_id, source: r.source, added_at: r.added_at, phone: one(r.wa_contacts)?.phone_e164 ?? null, profile_name: one(r.wa_contacts)?.profile_name ?? null })),
      }
    },
    async listPhones(listId) {
      const out: string[] = []
      for (let from = 0; from < 20000; from += 1000) {
        const { data, error } = await sb.from('wa_list_members').select('contact_id,wa_contacts!inner(phone_e164)').eq('list_id', listId).order('contact_id').range(from, from + 999)
        if (error) fail('list numbers', error)
        const rows = (data ?? []) as any[]
        out.push(...rows.map(r => one(r.wa_contacts)?.phone_e164).filter((p: unknown): p is string => typeof p === 'string'))
        if (rows.length < 1000) break
      }
      return out
    },
    async removeMembers(listId, contactIds) {
      let n = 0
      for (const ids of chunks(contactIds, 1000)) {
        const { error, count } = await sb.from('wa_list_members').delete({ count: 'exact' }).eq('list_id', listId).in('contact_id', ids)
        if (error) fail('remove members', error)
        n += count ?? 0
      }
      await sb.from('wa_lists').update({ updated_at: new Date().toISOString() }).eq('id', listId)
      return n
    },
    async contactHistory(contactId) {
      const { data, error } = await sb.from('wa_campaign_recipients').select('campaign_id,state,claimed_at,wa_campaigns!inner(name),wa_messages(status)')
        .eq('contact_id', contactId).order('id', { ascending: false }).limit(50)
      if (error) fail('history', error)
      return ((data ?? []) as any[]).map(r => ({ campaign_id: r.campaign_id, campaign_name: one(r.wa_campaigns)?.name ?? '', state: r.state, claimed_at: r.claimed_at, message_status: one(r.wa_messages)?.status ?? null }))
    },

    async templates() {
      const { data, error } = await sb.from('wa_templates').select(TEMPLATE_COLS).order('created_at', { ascending: false }).limit(500)
      if (error) fail('templates', error)
      return (data ?? []) as TemplateRow[]
    },
    async getTemplate(id) {
      const { data, error } = await sb.from('wa_templates').select(TEMPLATE_COLS).eq('id', id).maybeSingle()
      if (error) fail('template', error)
      return (data ?? null) as TemplateRow | null
    },
    async saveTemplate(t) {
      const row = { ...t, synced_at: new Date().toISOString() }
      const { error } = await sb.from('wa_templates').upsert(row, { onConflict: 'name,language' })
      if (error) fail('save template', error)
    },
    async setTemplateStatus(id, status, category) {
      const patch: Record<string, unknown> = { status, synced_at: new Date().toISOString() }
      if (category) patch.category = category
      const { error } = await sb.from('wa_templates').update(patch).eq('id', id)
      if (error) fail('template status', error)
    },
    async updateTemplate(id, patch) {
      const { error } = await sb.from('wa_templates').update({ ...patch, synced_at: new Date().toISOString() }).eq('id', id)
      if (error) fail('template update', error)
    },
    async activeCampaignsUsing(templateId) {
      const { count, error } = await sb.from('wa_campaigns').select('id', { count: 'exact', head: true })
        .eq('template_id', templateId).in('status', ['draft', 'approved', 'sending', 'paused'])
      if (error) fail('campaigns using template', error)
      return count ?? 0
    },

    // Bytes go to the private Storage bucket under a random path (no file
    // name, no phone number); the row records what Meta needs.
    async saveMedia(m, bytes) {
      const path = `${m.purpose}/${crypto.randomUUID()}`
      const up = await sb.storage.from(MEDIA_BUCKET).upload(path, bytes, { contentType: m.mime, upsert: false })
      if (up.error) fail('media upload', { code: 'storage' })
      const { data, error } = await sb.from('wa_media_files').insert({ ...m, storage_path: path }).select('id').single()
      if (error) { await sb.storage.from(MEDIA_BUCKET).remove([path]); fail('media row', error) }
      return { id: (data as { id: string }).id }
    },
    async getMedia(id) {
      const { data, error } = await sb.from('wa_media_files').select(MEDIA_COLS).eq('id', id).is('deleted_at', null).maybeSingle()
      if (error) fail('media', error)
      return (data ?? null) as MediaRow | null
    },
    async mediaBytes(id) {
      const { data: row, error: e1 } = await sb.from('wa_media_files').select('storage_path').eq('id', id).is('deleted_at', null).maybeSingle()
      if (e1) fail('media', e1)
      if (!row) return null
      const { data, error } = await sb.storage.from(MEDIA_BUCKET).download((row as { storage_path: string }).storage_path)
      if (error || !data) return null
      return new Uint8Array(await data.arrayBuffer())
    },
    async setMediaMetaId(id, mediaId, expiresIso) {
      const { error } = await sb.from('wa_media_files').update({ meta_media_id: mediaId, meta_media_expires: expiresIso }).eq('id', id)
      if (error) fail('media meta id', error)
    },
    async mediaFiles(purpose) {
      const { data, error } = await sb.from('wa_media_files').select(MEDIA_COLS).eq('purpose', purpose).is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(200)
      if (error) fail('media files', error)
      return (data ?? []) as MediaRow[]
    },

    async campaigns() {
      const { data, error } = await sb.from('wa_campaigns').select(CAMPAIGN_COLS).order('created_at', { ascending: false }).limit(200)
      if (error) fail('campaigns', error)
      return (data ?? []) as CampaignRow[]
    },
    async getCampaign(id) {
      const { data, error } = await sb.from('wa_campaigns').select(CAMPAIGN_COLS).eq('id', id).maybeSingle()
      if (error) fail('campaign', error)
      return (data ?? null) as CampaignRow | null
    },
    async createCampaign(c) {
      const { data, error } = await sb.from('wa_campaigns').insert(c).select('id').single()
      if (error) fail('create campaign', error)
      return { id: (data as { id: string }).id }
    },
    async updateDraft(id, patch) {
      // The trigger refuses changes to an approved campaign; eq status keeps it a no-op otherwise.
      const { error } = await sb.from('wa_campaigns').update(patch).eq('id', id).eq('status', 'draft')
      if (error) fail('update campaign', error)
    },
    async addRecipients(campaignId, contactIds, listId, excludeCampaign) {
      let n = 0
      const groups = contactIds.length ? chunks(contactIds) : [[]]
      for (let i = 0; i < groups.length; i++) {
        const { data, error } = await sb.rpc('wa_campaign_add_recipients', {
          p_campaign: campaignId, p_contacts: groups[i], p_list: i === 0 ? listId : null, p_exclude_campaign: excludeCampaign,
        })
        if (error) fail('add recipients', error)
        n += Number(data ?? 0)
      }
      return n
    },
    async removeRecipients(campaignId, contactIds) {
      let n = 0
      for (const ids of chunks(contactIds, 1000)) {
        const { error, count } = await sb.from('wa_campaign_recipients').delete({ count: 'exact' })
          .eq('campaign_id', campaignId).eq('state', 'queued').in('contact_id', ids)
        if (error) fail('remove recipients', error)
        n += count ?? 0
      }
      return n
    },
    async recipients(campaignId, state, offset, limit) {
      let q = sb.from('wa_campaign_recipients')
        .select('id,contact_id,state,skip_reason,error_code,claimed_at,finished_at,wa_contacts!inner(phone_e164),wa_messages(status)', { count: 'exact' })
        .eq('campaign_id', campaignId)
      if (state) q = q.eq('state', state)
      const { data, error, count } = await q.order('id').range(offset, offset + limit - 1)
      if (error) fail('recipients', error)
      return {
        total: count ?? 0,
        rows: ((data ?? []) as any[]).map(r => ({
          id: r.id, contact_id: r.contact_id, state: r.state, skip_reason: r.skip_reason, error_code: r.error_code,
          claimed_at: r.claimed_at, finished_at: r.finished_at, phone: one(r.wa_contacts)?.phone_e164 ?? null, message_status: one(r.wa_messages)?.status ?? null,
        })),
      }
    },
    async preview(campaignId) {
      const { data, error } = await sb.rpc('wa_campaign_preview', { p_campaign: campaignId })
      if (error) fail('preview', error)
      return data as Preview
    },
    async approve(campaignId, actor, seenEligible, seenTemplate) {
      const { data, error } = await sb.rpc('wa_campaign_approve', { p_campaign: campaignId, p_actor: actor, p_seen_eligible: seenEligible, p_seen_template: seenTemplate })
      if (error) fail('approve', error)
      return (data ?? null) as string | null
    },
    async control(campaignId, action) {
      const { data, error } = await sb.rpc('wa_campaign_control', { p_campaign: campaignId, p_action: action })
      if (error) fail('control', error)
      return (data ?? null) as string | null
    },
    async stats(campaignId) {
      const { data, error } = await sb.rpc('wa_campaign_stats', { p_campaign: campaignId })
      if (error) fail('stats', error)
      return data as Stats
    },
    async spend(tz) {
      const { data, error } = await sb.rpc('wa_campaign_spend', { p_tz: tz })
      if (error) fail('spend', error)
      return data as Spend
    },

    async dueCampaigns(nowIso, limit) {
      const { data, error } = await sb.from('wa_campaigns').select('id,template_id,batch_size,ref_token')
        .or(`status.eq.sending,and(status.eq.approved,or(scheduled_at.is.null,scheduled_at.lte.${nowIso}))`)
        .order('approved_at', { ascending: true }).limit(limit)
      if (error) fail('due campaigns', error)
      return (data ?? []) as Array<Pick<CampaignRow, 'id' | 'template_id' | 'batch_size' | 'ref_token'>>
    },
    async claim(campaignId, limit, phoneNumberId) {
      const { data, error } = await sb.rpc('wa_campaign_claim', { p_campaign: campaignId, p_limit: limit, p_pnid: phoneNumberId })
      if (error) fail('claim', error)
      return (data ?? []) as ClaimRow[]
    },
    async finish(clientRef, wamid, state, code, title) {
      const { error } = await sb.rpc('wa_campaign_finish', { p_client_ref: clientRef, p_wamid: wamid, p_state: state, p_error_code: code, p_error_title: title })
      if (error) fail('finish', error)
    },
    async release(clientRefs) {
      if (!clientRefs.length) return 0
      const { data, error } = await sb.rpc('wa_campaign_release', { p_client_refs: clientRefs })
      if (error) fail('release', error)
      return Number(data ?? 0)
    },
    async pauseAll(reason) {
      const { error, count } = await sb.from('wa_campaigns').update({ status: 'paused', paused_reason: reason }, { count: 'exact' }).in('status', ['approved', 'sending'])
      if (error) fail('pause all', error)
      return count ?? 0
    },
    async recordMarketingOptOuts() {
      const { data, error } = await sb.rpc('wa_record_marketing_opt_outs')
      if (error) fail('marketing opt-outs', error)
      return Number(data ?? 0)
    },
    async retention() {
      const { data, error } = await sb.rpc('wa_campaign_retention')
      if (error) fail('campaign retention', error)
      return Number(data ?? 0)
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
    async audit(actor, action, target, detail) {
      const { error } = await sb.from('wa_audit_log').insert({ actor, action, target, detail })
      if (error) console.warn('[wa-campaigns] audit write failed', error.code)
    },
  }
}
