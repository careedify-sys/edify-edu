// In-memory campaign data for local checks (WA_INBOX_MOCK=1, never in
// production). Fake numbers only. It mirrors the SQL rules closely enough to
// click through every screen; the real rules are tested against Postgres in
// sql-campaigns.test.mts, not here.
import { randomUUID } from 'node:crypto'
import type {
  CampaignRepo, CampaignRow, ClaimRow, ConsentInput, HistoryRow, ListRow, Marketing, NumberStatus, Preview,
  RecipientRow, RecipientState, Stats, TemplateRow, MediaRow,
} from './campaign-repo'
import { randomBytes } from 'node:crypto'

type Contact = { id: string; phone: string; profile_name: string | null; consent: Array<{ granted: boolean; at: number }>; optedOut: boolean }
type Member = { list_id: string; contact_id: string; source: string; added_at: string }
type Recip = { id: number; campaign_id: string; contact_id: string; state: RecipientState; skip_reason: string | null; error_code: number | null; claimed_at: string | null; finished_at: string | null; message_status: string | null }

const iso = (msAgo = 0) => new Date(Date.now() - msAgo).toISOString()
const DAY = 86_400_000

export function mockCampaignRepo(): CampaignRepo {
  const contacts = new Map<string, Contact>()
  const byPhone = new Map<string, Contact>()
  const lists = new Map<string, { id: string; name: string; created_at: string; updated_at: string; archived: boolean }>()
  let members: Member[] = []
  const templates = new Map<string, TemplateRow>()
  const media = new Map<string, { row: MediaRow; bytes: Uint8Array }>()
  const campaigns = new Map<string, CampaignRow>()
  let recips: Recip[] = []
  let rid = 1
  const settings: Record<string, unknown> = {
    campaigns_enabled: false, campaign_budget_daily_inr: 250, campaign_budget_monthly_inr: 2000, campaign_default_batch: 50,
    campaign_tax_pct: 18, campaign_daily_max: 250, billing_timezone: 'Asia/Kolkata',
    rates: { currency: 'INR', service: 0, marketing: 0.8631, utility: 0.115, authentication: 0.115, verified_on: '2026-11-26', source: 'Mock rate card' },
  }

  const contactFor = (phone: string) => {
    let c = byPhone.get(phone)
    if (!c) { c = { id: randomUUID(), phone, profile_name: null, consent: [], optedOut: false }; contacts.set(c.id, c); byPhone.set(phone, c) }
    return c
  }
  const marketing = (c: Contact | undefined): Marketing => {
    if (!c || !c.consent.length) return 'unknown'
    return c.consent[c.consent.length - 1].granted ? 'yes' : 'no'
  }
  const ineligible = (c: Contact | undefined) => !c ? 'no_phone' : c.optedOut ? 'opted_out' : marketing(c) === 'unknown' ? 'no_consent' : marketing(c) === 'no' ? 'marketing_no' : null
  const listRow = (l: { id: string; name: string; created_at: string; updated_at: string }): ListRow =>
    ({ ...l, members: members.filter(m => m.list_id === l.id).length })

  // Seed: 12 fake numbers, 5 with a recorded Yes, 1 opted out.
  const seedList = randomUUID()
  lists.set(seedList, { id: seedList, name: 'Mock: 2024 MBA batch', created_at: iso(5 * DAY), updated_at: iso(DAY), archived: false })
  for (let i = 0; i < 12; i++) {
    const c = contactFor(`+9198765000${String(i).padStart(2, '0')}`)
    if (i < 5) c.consent.push({ granted: true, at: Date.now() - 3 * DAY })
    if (i === 11) c.optedOut = true
    members.push({ list_id: seedList, contact_id: c.id, source: 'file', added_at: iso(DAY) })
  }
  const approvedTpl = randomUUID()
  templates.set(approvedTpl, {
    id: approvedTpl, meta_id: '1001', name: 'referral_invite_mock', language: 'en', category: 'MARKETING', status: 'APPROVED',
    components: [{ type: 'BODY', text: 'Mock text. Know someone looking at an online degree? Reply YES and we will call them. Reply STOP to opt out.' }, { type: 'FOOTER', text: 'edifyedu.in' }, { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Yes, refer someone' }, { type: 'QUICK_REPLY', text: 'Stop promotions' }] }],
    reason: null, quality: 'UNKNOWN', synced_at: iso(), created_at: iso(4 * DAY), header_file_id: null,
  })
  const pendingTpl = randomUUID()
  templates.set(pendingTpl, { id: pendingTpl, meta_id: '1002', name: 'referral_reminder_mock', language: 'en', category: 'MARKETING', status: 'PENDING', components: [{ type: 'BODY', text: 'Mock pending template.' }], reason: null, quality: null, synced_at: iso(), created_at: iso(DAY), header_file_id: null })
  const rejTpl = randomUUID()
  templates.set(rejTpl, { id: rejTpl, meta_id: '1003', name: 'referral_offer_mock', language: 'en', category: 'MARKETING', status: 'REJECTED', components: [{ type: 'BODY', text: 'Mock rejected template.' }], reason: 'INVALID_FORMAT', quality: null, synced_at: iso(), created_at: iso(2 * DAY), header_file_id: null })

  function preview(id: string): Preview {
    const c = campaigns.get(id)
    if (!c) return { error: 'no_campaign' } as Preview
    const t = c.template_id ? templates.get(c.template_id) : undefined
    const queued = recips.filter(r => r.campaign_id === id && r.state === 'queued')
    const excluded: Record<string, number> = {}
    let ok = 0
    for (const r of queued) { const e = ineligible(contacts.get(r.contact_id)); if (e) excluded[e] = (excluded[e] ?? 0) + 1; else ok++ }
    const rate = (settings.rates as { marketing?: number })?.marketing ?? null
    const tax = Number(settings.campaign_tax_pct ?? 18)
    const text = t ? (t.components as any[]).filter(x => ['HEADER', 'BODY', 'FOOTER'].includes(x.type) && x.text).map(x => x.text).join('\n\n') : null
    return {
      template_id: c.template_id, template_name: t?.name ?? null, template_status: t?.status ?? null, category: t?.category ?? null, preview: text,
      recipients_queued: queued.length, eligible: ok, excluded, rate, tax_pct: tax,
      cost_before_tax: Math.round(ok * (rate ?? 0) * 100) / 100, cost_with_tax: Math.round(ok * (rate ?? 0) * (1 + tax / 100) * 100) / 100, budget_inr: c.budget_inr,
    }
  }

  const repo: CampaignRepo = {
    mode: 'mock',
    async numbersStatus(phones) {
      return Array.from(new Set(phones)).map((p): NumberStatus => {
        const c = byPhone.get(p)
        return { phone: p, contact_id: c?.id ?? null, marketing: marketing(c), opted_out: !!c?.optedOut, lists: c ? members.filter(m => m.contact_id === c.id).length : 0 }
      })
    },
    async importNumbers(phones, listId, source) {
      const valid = Array.from(new Set(phones.filter(p => /^\+91[6-9]\d{9}$/.test(p))))
      let fresh = 0, added = 0, already = 0
      if (listId && !lists.get(listId)) throw Object.assign(new Error('no_list'), { code: 'P0001' })
      for (const p of valid) {
        if (!byPhone.has(p)) fresh++
        const c = contactFor(p)
        if (listId) {
          if (members.some(m => m.list_id === listId && m.contact_id === c.id)) already++
          else { members.push({ list_id: listId, contact_id: c.id, source, added_at: iso() }); added++ }
        }
      }
      if (listId) lists.get(listId)!.updated_at = iso()
      return { received: phones.length, valid: valid.length, new_contacts: fresh, added_to_list: added, already_in_list: already }
    },
    async inboxPhones() { return ['+919876500001', '+919876500020', '+919876500021'] },
    async crmPhones() { return ['98765 00030', '+91 98765-00031', '919876500001', '12345'] },
    async addConsent(ids, c: ConsentInput) {
      let n = 0
      for (const id of ids) { const ct = contacts.get(id); if (ct) { ct.consent.push({ granted: c.granted, at: Date.now() }); n++ } }
      return n
    },

    async lists() { return Array.from(lists.values()).filter(l => !l.archived).map(listRow).sort((a, b) => b.updated_at.localeCompare(a.updated_at)) },
    async getList(id) { const l = lists.get(id); return l && !l.archived ? listRow(l) : null },
    async createList(name, _actor) {
      if (Array.from(lists.values()).some(l => !l.archived && l.name.trim().toLowerCase() === name.trim().toLowerCase())) return { conflict: true }
      const id = randomUUID(); lists.set(id, { id, name, created_at: iso(), updated_at: iso(), archived: false }); return { id }
    },
    async renameList(id, name) {
      if (Array.from(lists.values()).some(l => l.id !== id && !l.archived && l.name.trim().toLowerCase() === name.trim().toLowerCase())) return { conflict: true }
      const l = lists.get(id); if (l) { l.name = name; l.updated_at = iso() }
      return { ok: true }
    },
    async archiveList(id) { const l = lists.get(id); if (l) l.archived = true },
    async listMembers(listId, digits, offset, limit) {
      const all = members.filter(m => m.list_id === listId).map(m => ({ ...m, phone: contacts.get(m.contact_id)?.phone ?? null, profile_name: contacts.get(m.contact_id)?.profile_name ?? null }))
        .filter(m => !digits || (m.phone ?? '').includes(digits))
      return { total: all.length, rows: all.slice(offset, offset + limit).map(({ list_id: _l, ...r }) => r) }
    },
    async listPhones(listId) { return members.filter(m => m.list_id === listId).map(m => contacts.get(m.contact_id)?.phone).filter((p): p is string => !!p) },
    async removeMembers(listId, ids) { const before = members.length; members = members.filter(m => !(m.list_id === listId && ids.includes(m.contact_id))); return before - members.length },
    async contactHistory(contactId): Promise<HistoryRow[]> {
      return recips.filter(r => r.contact_id === contactId).map(r => ({ campaign_id: r.campaign_id, campaign_name: campaigns.get(r.campaign_id)?.name ?? '', state: r.state, claimed_at: r.claimed_at, message_status: r.message_status }))
    },

    async templates() { return Array.from(templates.values()).sort((a, b) => b.created_at.localeCompare(a.created_at)) },
    async getTemplate(id) { return templates.get(id) ?? null },
    async saveTemplate(t) {
      const existing = Array.from(templates.values()).find(x => x.name === t.name && x.language === t.language)
      const id = existing?.id ?? randomUUID()
      templates.set(id, { id, meta_id: t.meta_id, name: t.name, language: t.language, category: t.category, status: t.status, components: t.components, reason: t.reason, quality: t.quality, synced_at: iso(), created_at: existing?.created_at ?? iso(), header_file_id: t.header_file_id !== undefined ? t.header_file_id : existing?.header_file_id ?? null })
    },
    async setTemplateStatus(id, status, category) { const t = templates.get(id); if (t) { t.status = status; if (category) t.category = category } },
    async updateTemplate(id, patch) { const t = templates.get(id); if (t) Object.assign(t, patch, { synced_at: iso() }) },
    async activeCampaignsUsing(templateId) { return Array.from(campaigns.values()).filter(c => c.template_id === templateId && ['draft', 'approved', 'sending', 'paused'].includes(c.status)).length },

    async saveMedia(m, bytes) {
      const id = randomUUID()
      media.set(id, { row: { ...m, id, storage_path: `${m.purpose}/${id}`, meta_media_id: null, meta_media_expires: null, created_at: iso() }, bytes })
      return { id }
    },
    async getMedia(id) { return media.get(id)?.row ?? null },
    async mediaBytes(id) { return media.get(id)?.bytes ?? null },
    async setMediaMetaId(id, mediaId, expires) { const x = media.get(id); if (x) { x.row.meta_media_id = mediaId; x.row.meta_media_expires = expires } },
    async mediaFiles(purpose) { return Array.from(media.values()).map(x => x.row).filter(r => r.purpose === purpose).sort((a, b) => b.created_at.localeCompare(a.created_at)) },

    async campaigns() { return Array.from(campaigns.values()).sort((a, b) => b.created_at.localeCompare(a.created_at)) },
    async getCampaign(id) { return campaigns.get(id) ?? null },
    async createCampaign(c) {
      const id = randomUUID()
      campaigns.set(id, { id, status: 'draft', scheduled_at: null, approval: null, approved_by: null, approved_at: null, paused_reason: null, created_at: iso(), updated_at: iso(), started_at: null, completed_at: null, ref_token: randomBytes(8).toString('hex'), ...c })
      return { id }
    },
    async updateDraft(id, patch) { const c = campaigns.get(id); if (c && c.status === 'draft') Object.assign(c, patch, { updated_at: iso() }) },
    async addRecipients(campaignId, ids, listId, exclude) {
      const c = campaigns.get(campaignId); if (!c) return 0
      if (c.status !== 'draft') throw Object.assign(new Error('campaign_locked'), { code: 'P0001' })
      const src = new Set([...ids, ...(listId ? members.filter(m => m.list_id === listId).map(m => m.contact_id) : [])])
      let n = 0
      for (const cid of Array.from(src)) {
        if (!contacts.has(cid) || recips.some(r => r.campaign_id === campaignId && r.contact_id === cid)) continue
        if (exclude && recips.some(r => r.campaign_id === exclude && r.contact_id === cid && ['sending', 'accepted', 'unknown'].includes(r.state))) continue
        recips.push({ id: rid++, campaign_id: campaignId, contact_id: cid, state: 'queued', skip_reason: null, error_code: null, claimed_at: null, finished_at: null, message_status: null }); n++
      }
      return n
    },
    async removeRecipients(campaignId, ids) { const b = recips.length; recips = recips.filter(r => !(r.campaign_id === campaignId && r.state === 'queued' && ids.includes(r.contact_id))); return b - recips.length },
    async recipients(campaignId, state, offset, limit) {
      const all = recips.filter(r => r.campaign_id === campaignId && (!state || r.state === state))
      return { total: all.length, rows: all.slice(offset, offset + limit).map(({ campaign_id: _c, ...r }): RecipientRow => ({ ...r, phone: contacts.get(r.contact_id)?.phone ?? null })) }
    },
    async preview(id) { return preview(id) },
    async approve(id, actor, seenEligible, seenTemplate) {
      const c = campaigns.get(id); if (!c) return 'no_campaign'
      if (c.status !== 'draft') return 'not_draft'
      const p = preview(id)
      if (p.template_status !== 'APPROVED') return 'template_not_approved'
      if (p.rate == null) return 'rate_missing'
      if (p.eligible === 0) return 'no_eligible_recipients'
      if (p.eligible !== seenEligible || p.template_id !== seenTemplate) return 'preview_changed'
      if (c.budget_inr == null || p.cost_with_tax > c.budget_inr) return 'over_budget'
      Object.assign(c, { status: 'approved', approval: p, approved_by: actor, approved_at: iso(), paused_reason: null })
      return null
    },
    async control(id, action) {
      const c = campaigns.get(id); if (!c) return 'no_campaign'
      if (action === 'pause') { if (!['approved', 'sending'].includes(c.status)) return 'bad_state'; c.status = 'paused'; c.paused_reason = 'owner' }
      else if (action === 'resume') { if (c.status !== 'paused') return 'bad_state'; c.status = c.started_at ? 'sending' : 'approved'; c.paused_reason = null }
      else if (action === 'cancel') {
        if (['completed', 'cancelled'].includes(c.status)) return 'bad_state'
        for (const r of recips) if (r.campaign_id === id && r.state === 'queued') { r.state = 'cancelled'; r.finished_at = iso() }
        c.status = 'cancelled'; c.completed_at = iso()
      } else if (action === 'unapprove') {
        if (!['approved', 'paused'].includes(c.status)) return 'bad_state'
        if (recips.some(r => r.campaign_id === id && r.claimed_at)) return 'already_sending'
        Object.assign(c, { status: 'draft', paused_reason: null, approval: null, approved_by: null, approved_at: null })
      } else return 'bad_action'
      return null
    },
    async stats(id): Promise<Stats> {
      const r = recips.filter(x => x.campaign_id === id)
      const by = (s: RecipientState) => r.filter(x => x.state === s).length
      const skipped: Record<string, number> = {}
      for (const x of r) if (x.state === 'skipped' && x.skip_reason) skipped[x.skip_reason] = (skipped[x.skip_reason] ?? 0) + 1
      return {
        total: r.length, queued: by('queued'), processing: by('sending'), skipped: by('skipped'), skipped_by_reason: skipped, cancelled: by('cancelled'),
        unknown: by('unknown'), sent: by('accepted'), delivered: r.filter(x => x.message_status === 'delivered' || x.message_status === 'read').length,
        read: r.filter(x => x.message_status === 'read').length, failed: by('failed'), replies: 0, messaged_after_unconfirmed: 0, opt_outs: 0, meta_billable: 0,
      }
    },
    async spend() { return { day_start: iso(), month_start: iso(), today: 0, month: 0, last_24h_reached: 0 } },

    // The mock never sends. These exist so the interface is complete.
    async dueCampaigns() { return [] },
    async claim(): Promise<ClaimRow[]> { return [{ recipient_id: null, client_ref: null, phone: null, blocked: 'campaigns_off' }] },
    async finish() { /* no-op */ },
    async release() { return 0 },
    async pauseAll(reason) { let n = 0; for (const c of Array.from(campaigns.values())) if (['approved', 'sending'].includes(c.status)) { c.status = 'paused'; c.paused_reason = reason; n++ } return n },
    async recordMarketingOptOuts() { return 0 },
    async retention() { return 0 },

    async getSettings() { return { ...settings } },
    async setSetting(key, value) { settings[key] = value },
    async audit() { /* mock: nothing stored */ },
  }
  return repo
}
