// Tests for campaign-service.ts and graph-templates.ts with the in-memory mock
// repo and a fake Meta. No network, no database, fake numbers only.
// Run: npx tsx lib/whatsapp/campaign-service.test.mts
import assert from 'node:assert/strict'
import { mockCampaignRepo } from './campaign-mock'
import * as svc from './campaign-service'
import { validateDraft, createTemplate, listTemplates, draftComponents, type TemplateDraft } from './graph-templates'
import { OWNER, type Actor } from './access'
import type { GraphEnv } from './graph'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}
const env: GraphEnv = { token: 'T', phoneNumberId: 'P', wabaId: 'WABA', version: 'v26.0' }
const counsellor: Actor = { id: 'c1', role: 'counsellor' }
const ok = <T,>(r: T) => { assert.equal((r as any).ok, true, JSON.stringify(r)); return r as Extract<T, { ok: true }> }
const err = (r: any, re: RegExp) => { assert.equal(r.ok, false); assert.match(r.error, re) }
function meta(handler: (url: string, init?: RequestInit) => { status: number; json: unknown }) {
  const calls: Array<{ url: string; body: any; auth: string | null }> = []
  const f = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), body: init?.body ? JSON.parse(String(init.body)) : null, auth: (init?.headers as any)?.Authorization ?? null })
    const r = handler(String(url), init)
    return { status: r.status, json: async () => r.json } as unknown as Response
  }) as unknown as typeof fetch
  return { f, calls }
}
const draft = (o: Partial<TemplateDraft> = {}): TemplateDraft => ({ name: 'referral_invite_nov', language: 'en', category: 'MARKETING', body: 'Know someone looking for an online degree? Reply YES. Reply STOP to opt out.', ...o })

// ── Template validation and Meta calls ──────────────────────────────────────
await test('template drafts: Meta rules, no variables, no authentication', () => {
  assert.equal(validateDraft(draft()), null)
  assert.match(validateDraft(draft({ name: 'Referral Invite' }))!, /lowercase/)
  assert.match(validateDraft(draft({ body: 'Hi {{1}}, refer a friend' }))!, /phone numbers only/)
  assert.match(validateDraft(draft({ category: 'AUTHENTICATION' }))!, /not created here/)
  assert.match(validateDraft(draft({ body: 'x'.repeat(1025) }))!, /1,024/)
  assert.match(validateDraft(draft({ header: 'Hello 🎓' }))!, /header cannot/)
  assert.match(validateDraft(draft({ buttons: [{ type: 'URL', text: 'Visit', url: 'http://edifyedu.in' }] }))!, /https/)
  assert.match(validateDraft(draft({ buttons: [{ type: 'QUICK_REPLY', text: 'x'.repeat(26) }] }))!, /25/)
  assert.match(validateDraft(draft({ language: 'xx' }))!, /language/)
  assert.equal(validateDraft(draft({ header: 'Refer a friend', footer: 'edifyedu.in', buttons: [{ type: 'QUICK_REPLY', text: 'Stop promotions' }] })), null)
})

await test('create template: one POST to the business account with exactly the draft, token only in the header', async () => {
  const m = meta(() => ({ status: 200, json: { id: '123', status: 'PENDING', category: 'MARKETING' } }))
  const r = await createTemplate(env, draft({ footer: 'edifyedu.in' }), m.f)
  assert.deepEqual(r, { ok: true, meta_id: '123', status: 'PENDING', category: 'MARKETING' })
  assert.equal(m.calls.length, 1)
  assert.equal(m.calls[0].url, 'https://graph.facebook.com/v26.0/WABA/message_templates')
  assert.equal(m.calls[0].auth, 'Bearer T')
  assert.deepEqual(m.calls[0].body, { name: 'referral_invite_nov', language: 'en', category: 'MARKETING', components: draftComponents(draft({ footer: 'edifyedu.in' })) })
  assert.ok(!m.calls[0].url.includes('T&') && !JSON.stringify(m.calls[0].body).includes('"T"'))
})

await test('create template: Meta error text is redacted; a timeout says to sync before retrying', async () => {
  const m = meta(() => ({ status: 400, json: { error: { code: 100, message: 'Invalid for +91 98765 43210' } } }))
  const r = await createTemplate(env, draft(), m.f)
  assert.equal(r.ok, false); assert.ok(!('meta_id' in r) && !(r as any).error.includes('98765'))
  const t = (async () => { throw Object.assign(new Error('x'), { name: 'AbortError' }) }) as unknown as typeof fetch
  const r2 = await createTemplate(env, draft(), t)
  assert.equal(r2.ok, false); assert.match((r2 as any).error, /Sync templates/)
})

await test('list templates: falls back when rejected_reason is refused; follows only Meta paging links', async () => {
  let n = 0
  const m = meta(url => {
    n++
    if (url.includes('rejected_reason')) return { status: 400, json: { error: { code: 100, message: 'Unknown field' } } }
    if (n === 2) return { status: 200, json: { data: [{ id: '1', name: 'a_one', language: 'en', status: 'APPROVED', category: 'MARKETING', components: [] }], paging: { next: 'https://graph.facebook.com/v26.0/WABA/message_templates?after=x' } } }
    return { status: 200, json: { data: [{ id: '2', name: 'b_two', language: 'en', status: 'REJECTED', category: 'MARKETING', components: [] }], paging: { next: 'https://evil.example/steal' } } }
  })
  const r = await listTemplates(env, m.f)
  assert.equal(r.ok, true)
  assert.deepEqual((r as any).templates.map((t: any) => t.name), ['a_one', 'b_two'])
  assert.equal(m.calls.length, 3)
  assert.ok(m.calls.every(c => c.url.startsWith('https://graph.facebook.com/')))
})

// ── Permissions ─────────────────────────────────────────────────────────────
await test('owner-only: approve, resume, consent, template submit, settings, campaigns switch, export', async () => {
  const repo = mockCampaignRepo()
  const id = '00000000-0000-4000-8000-000000000001'
  const m = meta(() => ({ status: 200, json: {} }))
  for (const r of [
    await svc.approveCampaign(repo, counsellor, id, { seenEligible: 1, seenTemplate: id, confirm: 'APPROVE' }),
    await svc.controlCampaign(repo, counsellor, id, 'resume'),
    await svc.controlCampaign(repo, counsellor, id, 'unapprove'),
    await svc.recordConsent(repo, counsellor, { contactIds: [id], granted: true, source: 'phone_call', obtainedOn: '2026-01-01', evidence: 'long enough evidence', confirm: '1' }),
    await svc.submitTemplate(repo, counsellor, env, m.f, draft()),
    await svc.updateCampaignSettings(repo, counsellor, { dailyBudget: 1, monthlyBudget: 2, defaultBatch: 3, taxPct: 18, dailyMax: 250 }),
    await svc.setCampaignsEnabled(repo, counsellor, true, 'ENABLE'),
    await svc.exportRows(repo, counsellor, 'list', id),
    await svc.metaLimits(repo, counsellor, env, m.f),
  ]) err(r, /permission/)
  assert.equal(m.calls.length, 0)
  // Nobody signed in: nothing at all.
  for (const r of [await svc.checkNumbers(repo, null, []), await svc.loadCampaigns(repo, null), await svc.loadLists(repo, null)]) err(r, /permission/)
  // A counsellor can still pause and cancel.
  assert.notEqual((await svc.controlCampaign(repo, counsellor, id, 'pause') as any).error, 'You do not have permission for this')
})

// ── Numbers and consent ─────────────────────────────────────────────────────
await test('check numbers: only normalised Indian mobiles are accepted, read-only, with counts', async () => {
  const repo = mockCampaignRepo()
  const before = (await repo.lists()).reduce((n, l) => n + l.members, 0)
  const r = ok(await svc.checkNumbers(repo, OWNER, ['+919876500000', '+919876500011', '+919876500099', 'not a number', '+15551234567', '+919876500099']))
  assert.equal(r.counts.checked, 3)
  assert.deepEqual({ existing: r.counts.existing, new: r.counts.new, yes: r.counts.consent_yes, unknown: r.counts.consent_unknown, opted: r.counts.opted_out, eligible: r.counts.eligible },
    { existing: 2, new: 1, yes: 1, unknown: 2, opted: 1, eligible: 1 })
  assert.equal((await repo.lists()).reduce((n, l) => n + l.members, 0), before, 'checking saves nothing')
  err(await svc.checkNumbers(repo, OWNER, Array(20001).fill('+919876500000')), /20,000/)
})

await test('consent: needs a source, a past date, real evidence and the typed count; withdrawal needs no evidence', async () => {
  const repo = mockCampaignRepo()
  const list = (await repo.lists())[0]
  const ids = (await repo.listMembers(list.id, null, 0, 100)).rows.map(r => r.contact_id).slice(5, 7)
  const base = { contactIds: ids, granted: true, source: 'enrolment_record', obtainedOn: '2024-06-01', evidence: 'Admission form 2024, WhatsApp box ticked', confirm: '2' }
  err(await svc.recordConsent(repo, OWNER, { ...base, source: 'guess' }), /where the consent came from/)
  err(await svc.recordConsent(repo, OWNER, { ...base, evidence: 'yes' }), /evidence/)
  err(await svc.recordConsent(repo, OWNER, { ...base, obtainedOn: null }), /date/)
  err(await svc.recordConsent(repo, OWNER, { ...base, obtainedOn: '2999-01-01' }), /future/)
  err(await svc.recordConsent(repo, OWNER, { ...base, confirm: '3' }), /Type 2/)
  assert.equal(ok(await svc.recordConsent(repo, OWNER, base)).recorded, 2)
  const st = await repo.numbersStatus((await repo.listMembers(list.id, null, 0, 100)).rows.slice(5, 7).map(r => r.phone!))
  assert.ok(st.every(s => s.marketing === 'yes'))
  assert.equal(ok(await svc.recordConsent(repo, OWNER, { ...base, granted: false, evidence: '', obtainedOn: null })).recorded, 2)
})

await test('save numbers: creates the list, refuses a duplicate list name, counts new and existing', async () => {
  const repo = mockCampaignRepo()
  const r = ok(await svc.saveNumbers(repo, OWNER, { phones: ['+919876500000', '+919811100001'], listId: null, newListName: 'Nov referrals', source: 'paste' }))
  assert.deepEqual({ new: r.result.new_contacts, added: r.result.added_to_list }, { new: 1, added: 2 })
  err(await svc.saveNumbers(repo, OWNER, { phones: ['+919811100002'], listId: null, newListName: ' nov REFERRALS ', source: 'paste' }), /already exists/)
  err(await svc.saveNumbers(repo, OWNER, { phones: ['junk'], listId: null, newListName: 'x', source: 'paste' }), /No valid/)
})

// ── Campaigns ───────────────────────────────────────────────────────────────
async function readyCampaign(repo = mockCampaignRepo()) {
  const c = ok(await svc.createCampaign(repo, OWNER, 'Nov referral'))
  const tpl = (await repo.templates()).find(t => t.status === 'APPROVED')!
  ok(await svc.updateDraft(repo, OWNER, c.id, { templateId: tpl.id, budgetInr: 50 }))
  ok(await svc.addRecipients(repo, OWNER, c.id, { listId: (await repo.lists())[0].id }))
  return { repo, id: c.id, tpl }
}

await test('drafts: only approved Marketing templates; settings defaults applied; edits refused once approved', async () => {
  const repo = mockCampaignRepo()
  const c = ok(await svc.createCampaign(repo, OWNER, 'Test'))
  const camp = (await repo.getCampaign(c.id))!
  assert.deepEqual({ b: camp.batch_size, d: camp.daily_max, budget: camp.budget_inr }, { b: 50, d: 250, budget: null })
  const pending = (await repo.templates()).find(t => t.status === 'PENDING')!
  err(await svc.updateDraft(repo, OWNER, c.id, { templateId: pending.id }), /not approved/)
  const { id, tpl } = await readyCampaign(repo)
  await repo.saveTemplate({ meta_id: 'u1', name: 'util_one', language: 'en', category: 'UTILITY', status: 'APPROVED', components: [], reason: null, quality: null, submitted_by: null })
  const util = (await repo.templates()).find(t => t.name === 'util_one')!
  err(await svc.updateDraft(repo, OWNER, id, { templateId: util.id }), /Marketing/)
  err(await svc.updateDraft(repo, OWNER, id, { scheduledAt: '2000-01-01T00:00' }), /past/)
  err(await svc.updateDraft(repo, OWNER, id, { batchSize: 500 }), /1 to 200/)
  const p = await repo.preview(id)
  ok(await svc.approveCampaign(repo, OWNER, id, { seenEligible: p.eligible, seenTemplate: tpl.id, confirm: 'APPROVE' }))
  err(await svc.updateDraft(repo, OWNER, id, { budgetInr: 9999 }), /approved/)
  err(await svc.addRecipients(repo, OWNER, id, { phones: ['+919811100009'] }), /approved/)
})

await test('approval: typed APPROVE, the exact count seen, within budget; unknown consent is never counted', async () => {
  const { repo, id, tpl } = await readyCampaign()
  const p = await repo.preview(id)
  assert.equal(p.recipients_queued, 12)
  assert.equal(p.eligible, 5, '5 consented, 6 unknown, 1 opted out')
  assert.deepEqual(p.excluded, { no_consent: 6, opted_out: 1 })
  err(await svc.approveCampaign(repo, OWNER, id, { seenEligible: p.eligible, seenTemplate: tpl.id, confirm: 'yes' }), /APPROVE/)
  err(await svc.approveCampaign(repo, OWNER, id, { seenEligible: p.eligible + 1, seenTemplate: tpl.id, confirm: 'APPROVE' }), /changed/)
  ok(await svc.updateDraft(repo, OWNER, id, { budgetInr: 1 }))
  err(await svc.approveCampaign(repo, OWNER, id, { seenEligible: p.eligible, seenTemplate: tpl.id, confirm: 'APPROVE' }), /budget/)
})

await test('keep eligible only removes unknown-consent and opted-out recipients', async () => {
  const { repo, id } = await readyCampaign()
  assert.equal(ok(await svc.keepEligibleOnly(repo, OWNER, id)).removed, 7)
  assert.equal((await repo.preview(id)).recipients_queued, 5)
})

await test('duplicate: a draft copy linked to the original, passing the original as the exclusion', async () => {
  // The exclusion itself (never resend to anyone reached or possibly reached)
  // is proven on real SQL in sql-campaigns.test.mts.
  const { repo, id } = await readyCampaign()
  const seen: unknown[] = []
  const add = repo.addRecipients.bind(repo)
  repo.addRecipients = async (c, ids, list, exclude) => { seen.push(exclude); return add(c, ids, list, exclude) }
  const d = ok(await svc.duplicateCampaign(repo, OWNER, id))
  const copy = (await repo.getCampaign(d.id))!
  assert.deepEqual({ status: copy.status, from: copy.duplicated_from, added: d.added }, { status: 'draft', from: id, added: 12 })
  assert.deepEqual(seen, [id])
})

await test('switching campaigns off pauses running campaigns; switching on needs ENABLE', async () => {
  const { repo, id, tpl } = await readyCampaign()
  const p = await repo.preview(id)
  ok(await svc.approveCampaign(repo, OWNER, id, { seenEligible: p.eligible, seenTemplate: tpl.id, confirm: 'APPROVE' }))
  err(await svc.setCampaignsEnabled(repo, OWNER, true, 'yes'), /ENABLE/)
  ok(await svc.setCampaignsEnabled(repo, OWNER, true, 'ENABLE'))
  assert.equal((await repo.getSettings()).campaigns_enabled, true)
  ok(await svc.setCampaignsEnabled(repo, OWNER, false, ''))
  assert.equal((await repo.getCampaign(id))!.status, 'paused')
})

await test('settings: Rishi\'s defaults load; invalid budgets are refused', async () => {
  const repo = mockCampaignRepo()
  const s = ok(await svc.loadCampaignSettings(repo, OWNER)).settings
  assert.deepEqual({ d: s.dailyBudget, m: s.monthlyBudget, b: s.defaultBatch, t: s.taxPct, on: s.enabled }, { d: 250, m: 2000, b: 50, t: 18, on: false })
  err(await svc.updateCampaignSettings(repo, OWNER, { dailyBudget: 3000, monthlyBudget: 2000, defaultBatch: 50, taxPct: 18, dailyMax: 250 }), /daily budget cannot/)
  err(await svc.updateCampaignSettings(repo, OWNER, { dailyBudget: 250, monthlyBudget: 2000, defaultBatch: 0, taxPct: 18, dailyMax: 250 }), /batch/)
  ok(await svc.updateCampaignSettings(repo, OWNER, { dailyBudget: 300, monthlyBudget: 2500, defaultBatch: 25, taxPct: 18, dailyMax: 250 }))
  assert.equal(ok(await svc.loadCampaignSettings(repo, OWNER)).settings.dailyBudget, 300)
})

await test('submit template: stored with the category Meta returns', async () => {
  const repo = mockCampaignRepo()
  const m = meta(() => ({ status: 200, json: { id: '77', status: 'PENDING', category: 'MARKETING' } }))
  const r = ok(await svc.submitTemplate(repo, OWNER, env, m.f, draft({ name: 'referral_test_one' })))
  assert.equal(r.status, 'PENDING')
  const t = (await repo.templates()).find(x => x.name === 'referral_test_one')!
  assert.deepEqual({ s: t.status, c: t.category, id: t.meta_id }, { s: 'PENDING', c: 'MARKETING', id: '77' })
})

await test('export: phones and states only, owner only', async () => {
  const repo = mockCampaignRepo()
  const list = (await repo.lists())[0]
  const r = ok(await svc.exportRows(repo, OWNER, 'list', list.id))
  assert.deepEqual(r.header, ['phone', 'marketing_consent', 'opted_out', 'eligible'])
  assert.equal(r.rows.length, 12)
  assert.equal(r.rows.filter(x => x[3] === 'yes').length, 5)
})

await test('a synced template that needs parameters cannot be chosen (QA 3)', async () => {
  const { needsParameters } = await import('./campaign-text')
  const body = (text: string) => ({ type: 'BODY', text })
  assert.equal(needsParameters([body('Refer a friend. Reply STOP to opt out.'), { type: 'BUTTONS', buttons: [{ type: 'QUICK_REPLY', text: 'Yes' }, { type: 'URL', text: 'Visit', url: 'https://edifyedu.in' }] }]), null)
  assert.match(needsParameters([body('Hi {{1}}, refer a friend')])!, /personalised/)
  assert.match(needsParameters([body('Hi {{name}}')])!, /personalised/)
  assert.match(needsParameters([{ type: 'HEADER', format: 'IMAGE' }, body('x')])!, /image/)
  assert.match(needsParameters([body('x'), { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Go', url: 'https://edifyedu.in/{{1}}' }] }])!, /variable/)
  assert.match(needsParameters([body('x'), { type: 'BUTTONS', buttons: [{ type: 'COPY_CODE', example: 'X' }] }])!, /copy code/)
  assert.match(needsParameters([])!, /Sync/)

  const repo = mockCampaignRepo()
  const { id } = await readyCampaign(repo)
  await repo.saveTemplate({ meta_id: 'v1', name: 'with_var', language: 'en', category: 'MARKETING', status: 'APPROVED', components: [body('Hi {{1}}')], reason: null, quality: null, submitted_by: null })
  const withVar = (await repo.templates()).find(t => t.name === 'with_var')!
  err(await svc.updateDraft(repo, OWNER, id, { templateId: withVar.id }), /personalised/)
})

console.log(`\n${passed} campaign service tests passed`)
