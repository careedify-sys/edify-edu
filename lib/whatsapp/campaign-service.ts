// Referral campaign rules (Phase 3). Server-only and framework-free, so tests
// drive it with the mock repo and a fake fetch.
//
// Every function checks can(actor, action) first. Nothing here sends: the
// only sender is the worker in the sweep (campaign-worker.ts), and it sends
// only for a campaign the owner approved, with campaigns switched on, to
// recipients the database says are eligible at that moment.
//
// Audit entries carry ids and counts, never phone numbers or message text.
import { can, type Action, type Actor } from './access'
import type { CampaignRepo, CampaignRow, DraftPatch, NumberStatus, Preview, RecipientState, Stats } from './campaign-repo'
import { createTemplate, draftComponents, listTemplates, previewText, validateDraft, accountLimits, needsParameters, type TemplateDraft, type AccountLimits } from './graph-templates'
import type { GraphEnv } from './graph'
import { parseRates } from './spend'

export type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }
const deny = (): { ok: false; error: string } => ({ ok: false, error: 'You do not have permission for this' })
const bad = (error: string): { ok: false; error: string } => ({ ok: false, error })
const gate = (actor: Actor | null, a: Action) => (can(actor, a) ? null : deny())
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const E164 = /^\+91[6-9]\d{9}$/
export const MAX_NUMBERS = 20000

export { CONSENT_SOURCES, CONSENT_SOURCE_TEXT } from './consent-sources'
import { CONSENT_SOURCES } from './consent-sources'

export { SKIP_TEXT } from './campaign-text'

export const BLOCK_TEXT: Record<string, string> = {
  no_campaign: 'Campaign not found.',
  not_draft: 'Only a draft can be approved.',
  template_not_approved: 'The template is not approved by Meta.',
  rate_missing: 'The marketing rate is not set in Settings.',
  no_eligible_recipients: 'No recipient has recorded marketing consent, so there is nobody to send to.',
  preview_changed: 'The recipients or template changed since you looked. Check the summary again.',
  over_budget: 'The estimated cost is above this campaign\'s budget.',
  bad_state: 'That is not possible in the campaign\'s current state.',
  already_sending: 'Messages have already gone out, so it cannot go back to draft. Pause or cancel instead.',
  bad_action: 'Unknown action.',
}

// ── Numbers and lists ───────────────────────────────────────────────────────

export type NumbersReport = {
  rows: NumberStatus[]
  counts: { checked: number; existing: number; new: number; consent_yes: number; consent_no: number; consent_unknown: number; opted_out: number; eligible: number }
}

function cleanNumbers(phones: unknown): string[] | null {
  if (!Array.isArray(phones) || phones.length > MAX_NUMBERS) return null
  const out = new Set<string>()
  for (const p of phones) if (typeof p === 'string' && E164.test(p)) out.add(p)
  return Array.from(out)
}

export function countStatuses(rows: NumberStatus[]): NumbersReport['counts'] {
  const c = { checked: rows.length, existing: 0, new: 0, consent_yes: 0, consent_no: 0, consent_unknown: 0, opted_out: 0, eligible: 0 }
  for (const r of rows) {
    if (r.contact_id) c.existing++; else c.new++
    if (r.opted_out) c.opted_out++
    if (r.marketing === 'yes') c.consent_yes++; else if (r.marketing === 'no') c.consent_no++; else c.consent_unknown++
    if (r.marketing === 'yes' && !r.opted_out) c.eligible++
  }
  return c
}

// Read-only: a paste or a file is checked before anything is saved.
export async function checkNumbers(repo: CampaignRepo, actor: Actor | null, phones: unknown): Promise<Result<NumbersReport>> {
  const g = gate(actor, 'campaign_view'); if (g) return g
  const list = cleanNumbers(phones)
  if (!list) return bad(`Up to ${MAX_NUMBERS.toLocaleString('en-IN')} numbers at a time.`)
  const rows = await repo.numbersStatus(list)
  return { ok: true, rows, counts: countStatuses(rows) }
}

export async function saveNumbers(repo: CampaignRepo, actor: Actor | null, i: { phones: unknown; listId: string | null; newListName: string | null; source: string }): Promise<Result<{ listId: string | null; result: Awaited<ReturnType<CampaignRepo['importNumbers']>> }>> {
  const g = gate(actor, 'contacts_import'); if (g) return g
  const list = cleanNumbers(i.phones)
  if (!list || !list.length) return bad('No valid numbers to save.')
  if (!['paste', 'file', 'inbox', 'crm', 'list'].includes(i.source)) return bad('Unknown source.')
  let listId = i.listId && UUID.test(i.listId) ? i.listId : null
  if (!listId && i.newListName) {
    const name = i.newListName.trim().slice(0, 80)
    if (!name) return bad('Give the list a name.')
    const r = await repo.createList(name, actor!.id)
    if ('conflict' in r) return bad('A list with that name already exists.')
    listId = r.id
  }
  const result = await repo.importNumbers(list, listId, i.source, actor!.id)
  await repo.audit(actor!.id, 'campaign_import', listId, { source: i.source, ...result })
  return { ok: true, listId, result }
}

export async function sourcePhones(repo: CampaignRepo, actor: Actor | null, from: 'inbox' | 'crm'): Promise<Result<{ values: string[] }>> {
  const g = gate(actor, 'contacts_import'); if (g) return g
  const values = from === 'inbox' ? await repo.inboxPhones(2000) : await repo.crmPhones(2000)
  return { ok: true, values }
}

export async function loadLists(repo: CampaignRepo, actor: Actor | null) {
  const g = gate(actor, 'campaign_view'); if (g) return g
  return { ok: true as const, lists: await repo.lists() }
}

export async function createList(repo: CampaignRepo, actor: Actor | null, name: string): Promise<Result<{ id: string }>> {
  const g = gate(actor, 'list_edit'); if (g) return g
  const n = String(name ?? '').trim().slice(0, 80)
  if (!n) return bad('Give the list a name.')
  const r = await repo.createList(n, actor!.id)
  if ('conflict' in r) return bad('A list with that name already exists.')
  await repo.audit(actor!.id, 'list_create', r.id, null)
  return { ok: true, id: r.id }
}

export async function renameList(repo: CampaignRepo, actor: Actor | null, id: string, name: string): Promise<Result> {
  const g = gate(actor, 'list_edit'); if (g) return g
  const n = String(name ?? '').trim().slice(0, 80)
  if (!UUID.test(id) || !n) return bad('Give the list a name.')
  const r = await repo.renameList(id, n)
  if ('conflict' in r) return bad('A list with that name already exists.')
  await repo.audit(actor!.id, 'list_rename', id, null)
  return { ok: true }
}

export async function archiveList(repo: CampaignRepo, actor: Actor | null, id: string): Promise<Result> {
  const g = gate(actor, 'list_edit'); if (g) return g
  if (!UUID.test(id)) return bad('Unknown list.')
  await repo.archiveList(id)
  await repo.audit(actor!.id, 'list_archive', id, null)
  return { ok: true }
}

export type MemberView = { contact_id: string; phone: string | null; source: string; added_at: string; marketing: string; opted_out: boolean; eligible: boolean }

export async function loadMembers(repo: CampaignRepo, actor: Actor | null, i: { listId: string; search: string; offset: number }): Promise<Result<{ list: Awaited<ReturnType<CampaignRepo['getList']>>; rows: MemberView[]; total: number; eligibleOnPage: number }>> {
  const g = gate(actor, 'campaign_view'); if (g) return g
  if (!UUID.test(i.listId)) return bad('Unknown list.')
  const list = await repo.getList(i.listId)
  if (!list) return bad('That list no longer exists.')
  const digits = String(i.search ?? '').replace(/\D/g, '').slice(0, 12)
  const page = await repo.listMembers(i.listId, digits.length >= 3 ? digits : null, Math.max(0, Math.floor(Number(i.offset) || 0)), 100)
  const st = new Map((await repo.numbersStatus(page.rows.map(r => r.phone).filter((p): p is string => !!p))).map(s => [s.phone, s]))
  const rows = page.rows.map(r => {
    const s = r.phone ? st.get(r.phone) : undefined
    return { contact_id: r.contact_id, phone: r.phone, source: r.source, added_at: r.added_at, marketing: s?.marketing ?? 'unknown', opted_out: !!s?.opted_out, eligible: s?.marketing === 'yes' && !s.opted_out }
  })
  return { ok: true, list, rows, total: page.total, eligibleOnPage: rows.filter(r => r.eligible).length }
}

export async function listReport(repo: CampaignRepo, actor: Actor | null, listId: string): Promise<Result<NumbersReport['counts']>> {
  const g = gate(actor, 'campaign_view'); if (g) return g
  if (!UUID.test(listId)) return bad('Unknown list.')
  const phones = await repo.listPhones(listId)
  return { ok: true, ...countStatuses(await repo.numbersStatus(phones)) }
}

export async function removeMembers(repo: CampaignRepo, actor: Actor | null, listId: string, contactIds: unknown): Promise<Result<{ removed: number }>> {
  const g = gate(actor, 'list_edit'); if (g) return g
  const ids = Array.isArray(contactIds) ? contactIds.filter((x): x is string => typeof x === 'string' && UUID.test(x)).slice(0, MAX_NUMBERS) : []
  if (!UUID.test(listId) || !ids.length) return bad('Select numbers to remove.')
  const removed = await repo.removeMembers(listId, ids)
  await repo.audit(actor!.id, 'list_remove', listId, { removed })
  return { ok: true, removed }
}

export async function contactHistory(repo: CampaignRepo, actor: Actor | null, contactId: string) {
  const g = gate(actor, 'campaign_view'); if (g) return g
  if (!UUID.test(contactId)) return bad('Unknown contact.')
  return { ok: true as const, history: await repo.contactHistory(contactId) }
}

// Consent is recorded, never assumed: a source, the date it was given and
// what proves it. Withdrawing needs no evidence.
export async function recordConsent(repo: CampaignRepo, actor: Actor | null, i: { contactIds?: unknown; listId?: string | null; granted: boolean; source: string; obtainedOn: string | null; evidence: string; confirm: string }): Promise<Result<{ recorded: number }>> {
  const g = gate(actor, 'consent_bulk'); if (g) return g
  if (!(CONSENT_SOURCES as readonly string[]).includes(i.source)) return bad('Choose where the consent came from.')
  const evidence = String(i.evidence ?? '').trim().slice(0, 500)
  const today = new Date().toISOString().slice(0, 10)
  const obtained = typeof i.obtainedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(i.obtainedOn) ? i.obtainedOn : null
  if (i.granted) {
    if (evidence.length < 10) return bad('Describe the evidence (at least 10 characters), for example "Admission form 2024, WhatsApp opt-in box ticked".')
    if (!obtained) return bad('Enter the date consent was given.')
    if (obtained > today) return bad('The consent date cannot be in the future.')
  }
  let ids = Array.isArray(i.contactIds) ? i.contactIds.filter((x): x is string => typeof x === 'string' && UUID.test(x)) : []
  if (!ids.length && i.listId && UUID.test(i.listId)) {
    const phones = await repo.listPhones(i.listId)
    ids = (await repo.numbersStatus(phones)).map(s => s.contact_id).filter((x): x is string => !!x)
  }
  ids = Array.from(new Set(ids)).slice(0, MAX_NUMBERS)
  if (!ids.length) return bad('Select numbers first.')
  if (String(i.confirm ?? '').trim() !== String(ids.length)) return bad(`Type ${ids.length} to confirm the number of contacts.`)
  const recorded = await repo.addConsent(ids, { granted: i.granted === true, source: i.source, obtained_on: obtained, evidence: evidence || 'Withdrawn by the owner', recorded_by: actor!.id })
  await repo.audit(actor!.id, i.granted ? 'consent_bulk_yes' : 'consent_bulk_no', i.listId ?? null, { recorded, source: i.source, obtained_on: obtained })
  return { ok: true, recorded }
}

// ── Templates ───────────────────────────────────────────────────────────────

export async function loadTemplates(repo: CampaignRepo, actor: Actor | null) {
  const g = gate(actor, 'campaign_view'); if (g) return g
  return { ok: true as const, templates: await repo.templates() }
}

export async function syncTemplates(repo: CampaignRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch): Promise<Result<{ synced: number }>> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  const r = await listTemplates(env, f)
  if (!r.ok) return bad(`Meta: ${r.error}`)
  for (const t of r.templates) {
    if (!/^[a-z0-9_]+$/.test(t.name) || !['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(String(t.category))) continue
    await repo.saveTemplate({ meta_id: t.meta_id, name: t.name, language: t.language, category: String(t.category), status: t.status, components: t.components, reason: t.reason, quality: t.quality, submitted_by: null })
  }
  await repo.audit(actor!.id, 'templates_sync', null, { count: r.templates.length })
  return { ok: true, synced: r.templates.length }
}

export async function submitTemplate(repo: CampaignRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch, d: TemplateDraft): Promise<Result<{ status: string; category: string }>> {
  const g = gate(actor, 'template_submit'); if (g) return g
  const draft: TemplateDraft = {
    name: String(d?.name ?? '').trim(), language: String(d?.language ?? ''), category: d?.category,
    header: typeof d?.header === 'string' ? d.header : undefined, body: String(d?.body ?? ''), footer: typeof d?.footer === 'string' ? d.footer : undefined,
    buttons: Array.isArray(d?.buttons) ? d.buttons.slice(0, 11).map(b => b?.type === 'URL' ? { type: 'URL' as const, text: String(b.text ?? ''), url: String((b as { url?: string }).url ?? '') } : { type: 'QUICK_REPLY' as const, text: String(b?.text ?? '') }) : [],
  }
  const invalid = validateDraft(draft)
  if (invalid) return bad(invalid)
  const r = await createTemplate(env, draft, f)
  if (!r.ok) return bad(`Meta did not accept it: ${r.error}`)
  // Meta may move a template to another category; store what Meta says.
  await repo.saveTemplate({ meta_id: r.meta_id, name: draft.name, language: draft.language, category: r.category, status: r.status, components: draftComponents(draft), reason: null, quality: null, submitted_by: actor!.id })
  await repo.audit(actor!.id, 'template_submit', r.meta_id, { name: draft.name, category: r.category })
  return { ok: true, status: r.status, category: r.category }
}

// ── Campaigns ───────────────────────────────────────────────────────────────

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && Number.isFinite(Number(v)) ? Number(v) : null)

export type CampaignSettings = {
  enabled: boolean; dailyBudget: number | null; monthlyBudget: number | null; defaultBatch: number
  taxPct: number; dailyMax: number; marketingRate: number | null; rateVerifiedOn: string | null; timezone: string
}

export function readCampaignSettings(s: Record<string, unknown>): CampaignSettings {
  const rates = parseRates(s.rates)
  return {
    enabled: s.campaigns_enabled === true,
    dailyBudget: num(s.campaign_budget_daily_inr), monthlyBudget: num(s.campaign_budget_monthly_inr),
    defaultBatch: Math.min(200, Math.max(1, Math.floor(num(s.campaign_default_batch) ?? 50))),
    taxPct: num(s.campaign_tax_pct) ?? 18, dailyMax: Math.max(1, Math.floor(num(s.campaign_daily_max) ?? 250)),
    marketingRate: rates?.currency === 'INR' && typeof rates.marketing === 'number' ? rates.marketing : null,
    rateVerifiedOn: rates?.verified_on ?? null,
    timezone: typeof s.billing_timezone === 'string' ? s.billing_timezone : 'Asia/Kolkata',
  }
}

export async function loadCampaigns(repo: CampaignRepo, actor: Actor | null) {
  const g = gate(actor, 'campaign_view'); if (g) return g
  const rows = await repo.campaigns()
  // Stats only for the 20 newest non-drafts: one database call each.
  const withStats = await Promise.all(rows.map(async (c, i) => ({ ...c, stats: c.status !== 'draft' && i < 20 ? await repo.stats(c.id) : null })))
  return { ok: true as const, campaigns: withStats }
}

export async function createCampaign(repo: CampaignRepo, actor: Actor | null, name: string): Promise<Result<{ id: string }>> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  const n = String(name ?? '').trim().slice(0, 100)
  if (!n) return bad('Give the campaign a name.')
  const s = readCampaignSettings(await repo.getSettings())
  const r = await repo.createCampaign({ name: n, created_by: actor!.id, batch_size: s.defaultBatch, daily_max: s.dailyMax, budget_inr: null, template_id: null, duplicated_from: null })
  await repo.audit(actor!.id, 'campaign_create', r.id, null)
  return { ok: true, id: r.id }
}

async function draftOnly(repo: CampaignRepo, id: string): Promise<CampaignRow | { ok: false; error: string }> {
  if (!UUID.test(id)) return bad('Unknown campaign.')
  const c = await repo.getCampaign(id)
  if (!c) return bad('Campaign not found.')
  if (c.status !== 'draft') return bad('This campaign is approved. Move it back to draft to change it.')
  return c
}

export async function updateDraft(repo: CampaignRepo, actor: Actor | null, id: string, p: { name?: unknown; templateId?: unknown; scheduledAt?: unknown; batchSize?: unknown; dailyMax?: unknown; budgetInr?: unknown }): Promise<Result> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  const c = await draftOnly(repo, id); if ('ok' in c) return c
  const patch: DraftPatch = {}
  if (p.name !== undefined) { const n = String(p.name).trim().slice(0, 100); if (!n) return bad('Give the campaign a name.'); patch.name = n }
  if (p.templateId !== undefined) {
    if (p.templateId === null) patch.template_id = null
    else {
      const t = typeof p.templateId === 'string' && UUID.test(p.templateId) ? await repo.getTemplate(p.templateId) : null
      if (!t) return bad('Unknown template.')
      if (t.category !== 'MARKETING') return bad('Referral messages are marketing. Choose a Marketing template.')
      if (t.status !== 'APPROVED') return bad('Meta has not approved this template yet.')
      const np = needsParameters(t.components); if (np) return bad(np)
      patch.template_id = t.id
    }
  }
  if (p.scheduledAt !== undefined) {
    if (p.scheduledAt === null || p.scheduledAt === '') patch.scheduled_at = null
    else {
      const t = Date.parse(String(p.scheduledAt))
      if (!Number.isFinite(t)) return bad('Pick a valid date and time.')
      if (t < Date.now() - 60_000) return bad('The scheduled time is in the past.')
      if (t > Date.now() + 90 * 86_400_000) return bad('Schedule within the next 90 days.')
      patch.scheduled_at = new Date(t).toISOString()
    }
  }
  if (p.batchSize !== undefined) { const b = num(p.batchSize); if (b == null || b < 1 || b > 200 || !Number.isInteger(b)) return bad('Batch size: a whole number from 1 to 200.'); patch.batch_size = b }
  if (p.dailyMax !== undefined) { const d = num(p.dailyMax); if (d == null || d < 1 || d > 100000 || !Number.isInteger(d)) return bad('Daily maximum: a whole number, at least 1.'); patch.daily_max = d }
  if (p.budgetInr !== undefined) { const b = p.budgetInr === null || p.budgetInr === '' ? null : num(p.budgetInr); if (b !== null && (b < 0 || b > 1_000_000)) return bad('Budget: ₹0 to ₹10,00,000.'); patch.budget_inr = b }
  await repo.updateDraft(id, patch)
  await repo.audit(actor!.id, 'campaign_edit', id, { fields: Object.keys(patch) })
  return { ok: true }
}

export async function addRecipients(repo: CampaignRepo, actor: Actor | null, id: string, i: { listId?: string | null; phones?: unknown; source?: string }): Promise<Result<{ added: number }>> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  const c = await draftOnly(repo, id); if ('ok' in c) return c
  let contactIds: string[] = []
  if (i.phones !== undefined) {
    const list = cleanNumbers(i.phones)
    if (!list || !list.length) return bad('No valid numbers.')
    await repo.importNumbers(list, null, ['paste', 'file', 'inbox', 'crm'].includes(String(i.source)) ? String(i.source) : 'paste', actor!.id)
    contactIds = (await repo.numbersStatus(list)).map(s => s.contact_id).filter((x): x is string => !!x)
  }
  const listId = i.listId && UUID.test(i.listId) ? i.listId : null
  if (!listId && !contactIds.length) return bad('Choose a list or add numbers.')
  const added = await repo.addRecipients(id, contactIds, listId, null)
  await repo.audit(actor!.id, 'campaign_recipients_add', id, { added, from_list: !!listId })
  return { ok: true, added }
}

export async function removeRecipients(repo: CampaignRepo, actor: Actor | null, id: string, contactIds: unknown): Promise<Result<{ removed: number }>> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  const c = await draftOnly(repo, id); if ('ok' in c) return c
  const ids = Array.isArray(contactIds) ? contactIds.filter((x): x is string => typeof x === 'string' && UUID.test(x)).slice(0, MAX_NUMBERS) : []
  if (!ids.length) return bad('Select recipients to remove.')
  const removed = await repo.removeRecipients(id, ids)
  await repo.audit(actor!.id, 'campaign_recipients_remove', id, { removed })
  return { ok: true, removed }
}

// "Select all eligible": keeps only recipients the database says may receive it.
export async function keepEligibleOnly(repo: CampaignRepo, actor: Actor | null, id: string): Promise<Result<{ removed: number }>> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  const c = await draftOnly(repo, id); if ('ok' in c) return c
  const all = await allRecipients(repo, id, 'queued')
  const st = new Map((await repo.numbersStatus(all.map(r => r.phone).filter((p): p is string => !!p))).map(s => [s.phone, s]))
  const drop = all.filter(r => { const s = r.phone ? st.get(r.phone) : undefined; return !(s?.marketing === 'yes' && !s.opted_out) }).map(r => r.contact_id)
  const removed = drop.length ? await repo.removeRecipients(id, drop) : 0
  await repo.audit(actor!.id, 'campaign_keep_eligible', id, { removed })
  return { ok: true, removed }
}

async function allRecipients(repo: CampaignRepo, id: string, state: RecipientState | null) {
  const out: Awaited<ReturnType<CampaignRepo['recipients']>>['rows'] = []
  for (let off = 0; off < MAX_NUMBERS; off += 1000) {
    const p = await repo.recipients(id, state, off, 1000)
    out.push(...p.rows)
    if (p.rows.length < 1000) break
  }
  return out
}

export type CampaignView = {
  campaign: CampaignRow; preview: Preview; stats: Stats; settings: CampaignSettings
  template: { name: string; language: string; status: string; category: string; header: string | null; body: string; footer: string | null; buttons: string[] } | null
  budgetLeft: { today: number | null; month: number | null; unitCost: number | null; messagesToday: number; messagesMonth: number }
  recipients: { rows: Array<Awaited<ReturnType<CampaignRepo['recipients']>>['rows'][number] & { marketing: string; opted_out: boolean }>; total: number }
}

export async function loadCampaign(repo: CampaignRepo, actor: Actor | null, id: string, i: { state?: string | null; offset?: number } = {}): Promise<Result<{ view: CampaignView }>> {
  const g = gate(actor, 'campaign_view'); if (g) return g
  if (!UUID.test(id)) return bad('Unknown campaign.')
  const campaign = await repo.getCampaign(id)
  if (!campaign) return bad('Campaign not found.')
  const s = await repo.getSettings()
  const settings = readCampaignSettings(s)
  const [preview, stats, spend, tpl] = await Promise.all([
    repo.preview(id), repo.stats(id), repo.spend(settings.timezone),
    campaign.template_id ? repo.getTemplate(campaign.template_id) : Promise.resolve(null),
  ])
  const states: RecipientState[] = ['queued', 'sending', 'accepted', 'failed', 'unknown', 'skipped', 'cancelled']
  const state = states.includes(i.state as RecipientState) ? (i.state as RecipientState) : null
  const page = await repo.recipients(id, state, Math.max(0, Math.floor(Number(i.offset) || 0)), 100)
  const st = new Map((await repo.numbersStatus(page.rows.map(r => r.phone).filter((p): p is string => !!p))).map(x => [x.phone, x]))
  const unit = settings.marketingRate == null ? null : settings.marketingRate * (1 + settings.taxPct / 100)
  const round2 = (n: number) => Math.round(n * 100) / 100
  const t = tpl ? { name: tpl.name, language: tpl.language, status: tpl.status, category: tpl.category, ...previewText(tpl.components) } : null
  return {
    ok: true,
    view: {
      campaign, preview, stats, settings, template: t,
      budgetLeft: {
        unitCost: unit == null ? null : round2(unit),
        messagesToday: Number(spend.today ?? 0), messagesMonth: Number(spend.month ?? 0),
        today: unit == null || settings.dailyBudget == null ? null : round2(settings.dailyBudget - Number(spend.today ?? 0) * unit),
        month: unit == null || settings.monthlyBudget == null ? null : round2(settings.monthlyBudget - Number(spend.month ?? 0) * unit),
      },
      recipients: { total: page.total, rows: page.rows.map(r => ({ ...r, marketing: (r.phone && st.get(r.phone)?.marketing) || 'unknown', opted_out: !!(r.phone && st.get(r.phone)?.opted_out) })) },
    },
  }
}

// Explicit owner approval: the owner types APPROVE after seeing the exact
// count, template and cost. The database refuses if any of them changed.
export async function approveCampaign(repo: CampaignRepo, actor: Actor | null, id: string, i: { seenEligible: number; seenTemplate: string; confirm: string }): Promise<Result> {
  const g = gate(actor, 'campaign_approve'); if (g) return g
  if (!UUID.test(id) || !UUID.test(String(i.seenTemplate ?? ''))) return bad('Unknown campaign.')
  if (String(i.confirm ?? '').trim() !== 'APPROVE') return bad('Type APPROVE to confirm.')
  const c = await repo.getCampaign(id)
  if (!c) return bad('Campaign not found.')
  const t = c.template_id ? await repo.getTemplate(c.template_id) : null
  if (!t || t.category !== 'MARKETING') return bad('Referral messages are marketing. Choose a Marketing template.')
  const np = needsParameters(t.components); if (np) return bad(np)
  const why = await repo.approve(id, actor!.id, Math.floor(Number(i.seenEligible)), i.seenTemplate)
  if (why) return bad(BLOCK_TEXT[why] ?? why)
  await repo.audit(actor!.id, 'campaign_approve', id, { eligible: Math.floor(Number(i.seenEligible)), template_id: i.seenTemplate })
  return { ok: true }
}

export async function controlCampaign(repo: CampaignRepo, actor: Actor | null, id: string, action: string): Promise<Result> {
  const need: Record<string, Action> = { pause: 'campaign_pause', cancel: 'campaign_pause', resume: 'campaign_resume', unapprove: 'campaign_approve' }
  const a = need[action]
  if (!a) return bad('Unknown action.')
  const g = gate(actor, a); if (g) return g
  if (!UUID.test(id)) return bad('Unknown campaign.')
  const why = await repo.control(id, action as 'pause' | 'resume' | 'cancel' | 'unapprove')
  if (why) return bad(BLOCK_TEXT[why] ?? why)
  await repo.audit(actor!.id, `campaign_${action}`, id, null)
  return { ok: true }
}

// A copy for the people the original did not reach: anyone it sent to, or
// may have sent to (unknown), is left out by the database.
export async function duplicateCampaign(repo: CampaignRepo, actor: Actor | null, id: string): Promise<Result<{ id: string; added: number }>> {
  const g = gate(actor, 'campaign_edit'); if (g) return g
  if (!UUID.test(id)) return bad('Unknown campaign.')
  const c = await repo.getCampaign(id)
  if (!c) return bad('Campaign not found.')
  const r = await repo.createCampaign({ name: `${c.name} (copy)`.slice(0, 100), created_by: actor!.id, batch_size: c.batch_size, daily_max: c.daily_max, budget_inr: c.budget_inr, template_id: c.template_id, duplicated_from: c.id })
  const ids = Array.from(new Set((await allRecipients(repo, id, null)).map(x => x.contact_id)))
  const added = ids.length ? await repo.addRecipients(r.id, ids, null, c.id) : 0
  await repo.audit(actor!.id, 'campaign_duplicate', r.id, { from: id, added })
  return { ok: true, id: r.id, added }
}

// ── Settings ────────────────────────────────────────────────────────────────

export async function loadCampaignSettings(repo: CampaignRepo, actor: Actor | null): Promise<Result<{ settings: CampaignSettings; migrationReady: boolean }>> {
  const g = gate(actor, 'campaign_view'); if (g) return g
  const s = await repo.getSettings()
  return { ok: true, settings: readCampaignSettings(s), migrationReady: 'campaign_budget_daily_inr' in s }
}

export async function updateCampaignSettings(repo: CampaignRepo, actor: Actor | null, i: { dailyBudget: unknown; monthlyBudget: unknown; defaultBatch: unknown; taxPct: unknown; dailyMax: unknown }): Promise<Result> {
  const g = gate(actor, 'campaign_settings'); if (g) return g
  const d = num(i.dailyBudget), m = num(i.monthlyBudget), b = num(i.defaultBatch), t = num(i.taxPct), x = num(i.dailyMax)
  if (d == null || d < 0 || d > 100000) return bad('Daily budget: ₹0 to ₹1,00,000.')
  if (m == null || m < 0 || m > 1000000) return bad('Monthly budget: ₹0 to ₹10,00,000.')
  if (d > m) return bad('The daily budget cannot be more than the monthly budget.')
  if (b == null || !Number.isInteger(b) || b < 1 || b > 200) return bad('Default batch: a whole number from 1 to 200.')
  if (t == null || t < 0 || t > 50) return bad('Tax: 0 to 50 percent.')
  if (x == null || !Number.isInteger(x) || x < 1 || x > 100000) return bad('Daily maximum: a whole number, at least 1.')
  const before = readCampaignSettings(await repo.getSettings())
  await repo.setSetting('campaign_budget_daily_inr', d)
  await repo.setSetting('campaign_budget_monthly_inr', m)
  await repo.setSetting('campaign_default_batch', b)
  await repo.setSetting('campaign_tax_pct', t)
  await repo.setSetting('campaign_daily_max', x)
  await repo.audit(actor!.id, 'campaign_settings', null, { before: { d: before.dailyBudget, m: before.monthlyBudget, b: before.defaultBatch, t: before.taxPct, x: before.dailyMax }, after: { d, m, b, t, x } })
  return { ok: true }
}

export async function setCampaignsEnabled(repo: CampaignRepo, actor: Actor | null, on: boolean, confirm: string): Promise<Result> {
  const g = gate(actor, 'campaign_settings'); if (g) return g
  if (on && String(confirm ?? '').trim() !== 'ENABLE') return bad('Type ENABLE to switch campaign sending on.')
  await repo.setSetting('campaigns_enabled', on === true)
  // Switching off also pauses running campaigns, so switching on later never
  // restarts something without the owner pressing Resume.
  const paused = on ? 0 : await repo.pauseAll('campaigns_switched_off')
  await repo.audit(actor!.id, 'campaigns_enabled', null, { value: on === true, paused })
  return { ok: true }
}

export async function metaLimits(repo: CampaignRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch): Promise<Result<{ limits: AccountLimits }>> {
  const g = gate(actor, 'connection_check'); if (g) return g
  const limits = await accountLimits(env, f)
  await repo.audit(actor!.id, 'meta_limits_check', null, { quality: limits.quality, limit: limits.messagingLimit })
  return { ok: true, limits }
}

// ── Export ──────────────────────────────────────────────────────────────────

export async function exportRows(repo: CampaignRepo, actor: Actor | null, kind: 'list' | 'campaign', id: string): Promise<Result<{ name: string; header: string[]; rows: string[][] }>> {
  const g = gate(actor, 'export'); if (g) return g
  if (!UUID.test(id)) return bad('Unknown id.')
  if (kind === 'list') {
    const list = await repo.getList(id)
    if (!list) return bad('List not found.')
    const st = await repo.numbersStatus(await repo.listPhones(id))
    await repo.audit(actor!.id, 'export_list', id, { rows: st.length })
    return { ok: true, name: list.name, header: ['phone', 'marketing_consent', 'opted_out', 'eligible'], rows: st.map(s => [s.phone, s.marketing, s.opted_out ? 'yes' : 'no', s.marketing === 'yes' && !s.opted_out ? 'yes' : 'no']) }
  }
  const c = await repo.getCampaign(id)
  if (!c) return bad('Campaign not found.')
  const rows = await allRecipients(repo, id, null)
  await repo.audit(actor!.id, 'export_campaign', id, { rows: rows.length })
  return {
    ok: true, name: c.name, header: ['phone', 'state', 'skip_reason', 'meta_status', 'error_code', 'claimed_at', 'finished_at'],
    rows: rows.map(r => [r.phone ?? '', r.state, r.skip_reason ?? '', r.message_status ?? '', r.error_code == null ? '' : String(r.error_code), r.claimed_at ?? '', r.finished_at ?? '']),
  }
}
