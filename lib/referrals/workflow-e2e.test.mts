// End-to-end walk of the WhatsApp referral workflow against the in-memory
// mocks: import numbers -> campaign with an approved Marketing template ->
// eligibility -> keyword auto-reply and STOP -> referral with the campaign
// token -> stages -> admission -> approve -> pay -> campaign funnel.
// Nothing here calls Meta or a database: fetch is faked and every repo is a mock.
// Run: npx tsx lib/referrals/workflow-e2e.test.mts
import assert from 'node:assert/strict'
import { mockCampaignRepo } from '../whatsapp/campaign-mock'
import * as camp from '../whatsapp/campaign-service'
import { runAutoReplies, type AutoRule, type AutoStore, type Candidate, type AutoRuleKey } from '../whatsapp/auto-reply'
import { mockInboxRepo } from '../whatsapp/inbox-mock'
import type { GraphEnv } from '../whatsapp/graph'
import { OWNER, type Actor } from '../whatsapp/access'
import { mockReferralStore, submitReferral } from './refer-service'
import { mockReferralRepo } from './referral-mock'
import { validateReferral, MIN_FILL_MS, CAMPAIGN_TOKEN_RE } from './refer-rules'
import * as svc from './referral-service'
import { todayIST, rewardStatus } from './referral-types'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}
const okr = <T,>(r: T) => { assert.ok((r as { ok: boolean }).ok, JSON.stringify(r)); return r as Extract<T, { ok: true }> }
const bad = (r: unknown, re: RegExp) => { assert.equal((r as { ok: boolean }).ok, false, JSON.stringify(r)); assert.match((r as { error: string }).error, re) }

const COUNSELLOR: Actor = { id: 'c1', role: 'counsellor' }
const today = todayIST()
const daysAgo = (n: number) => new Date(Date.parse(`${today}T00:00:00Z`) - n * 864e5).toISOString().slice(0, 10)
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10)

// Numbers for the list. Varied digits; repeated-digit numbers are ambiguous.
const CONSENTED = '+919876543210'   // marketing Yes: the only eligible one
const NO_CONSENT = '+919123456789'  // never asked
const WITHDRAWN = '+919988776655'   // said Yes, then withdrew
const OPTED_OUT = '+919876500011'   // seeded in the campaign mock as opted out (STOP)

// Shared state: each step builds on the one before.
const crepo = mockCampaignRepo()
const store = mockReferralStore()
const rrepo = mockReferralRepo(store)
let listId = ''
let campaignId = ''
let refToken = ''
let referralId = ''
let refCode = ''
let admissionOn = ''

// ── 1. Import numbers into a list ──────────────────────────────────────────
await test('1. numbers are imported into a new list; invalid ones are dropped', async () => {
  const s = okr(await camp.saveNumbers(crepo, OWNER, { phones: [CONSENTED, NO_CONSENT, WITHDRAWN, OPTED_OUT, '12345', CONSENTED], listId: null, newListName: 'E2E referral list', source: 'paste' }))
  assert.ok(s.listId); listId = s.listId!
  assert.equal(s.result.valid, 4); assert.equal(s.result.added_to_list, 4)
  assert.equal(s.result.new_contacts, 3) // OPTED_OUT already existed in the seed
  const m = okr(await camp.loadMembers(crepo, OWNER, { listId, search: '', offset: 0 }))
  assert.equal(m.total, 4)
  // Counsellors may import too; only bulk consent is owner-only.
  bad(await camp.recordConsent(crepo, COUNSELLOR, { listId, granted: true, source: 'enrolment_record', obtainedOn: daysAgo(30), evidence: 'Admission form 2024, opt-in ticked', confirm: '4' }), /permission/)
})

await test('1b. consent is recorded with evidence: Yes for three, then one withdraws', async () => {
  const st = await crepo.numbersStatus([CONSENTED, WITHDRAWN, OPTED_OUT])
  const ids = st.map(x => x.contact_id!)
  bad(await camp.recordConsent(crepo, OWNER, { contactIds: ids, granted: true, source: 'enrolment_record', obtainedOn: daysAgo(30), evidence: 'short', confirm: '3' }), /evidence/)
  bad(await camp.recordConsent(crepo, OWNER, { contactIds: ids, granted: true, source: 'enrolment_record', obtainedOn: daysAgo(30), evidence: 'Admission form 2024, opt-in ticked', confirm: '2' }), /Type 3/)
  assert.equal(okr(await camp.recordConsent(crepo, OWNER, { contactIds: ids, granted: true, source: 'enrolment_record', obtainedOn: daysAgo(30), evidence: 'Admission form 2024, opt-in ticked', confirm: '3' })).recorded, 3)
  const w = st.find(x => x.phone === WITHDRAWN)!.contact_id!
  assert.equal(okr(await camp.recordConsent(crepo, OWNER, { contactIds: [w], granted: false, source: 'phone_call', obtainedOn: null, evidence: '', confirm: '1' })).recorded, 1)
  const rep = okr(await camp.listReport(crepo, OWNER, listId))
  assert.equal(rep.checked, 4); assert.equal(rep.consent_yes, 2); assert.equal(rep.consent_no, 1); assert.equal(rep.consent_unknown, 1)
  assert.equal(rep.opted_out, 1); assert.equal(rep.eligible, 1)
})

// ── 2. Approved Marketing template -> campaign with a ref_token ────────────
await test('2. campaign uses an APPROVED Marketing template and carries a ref_token', async () => {
  const tpls = await crepo.templates()
  const approved = tpls.find(t => t.status === 'APPROVED' && t.category === 'MARKETING')
  assert.ok(approved, 'mock has an approved marketing template')
  const pending = tpls.find(t => t.status !== 'APPROVED')!
  campaignId = okr(await camp.createCampaign(crepo, OWNER, 'E2E referral campaign')).id
  bad(await camp.updateDraft(crepo, OWNER, campaignId, { templateId: pending.id }), /not approved/)
  okr(await camp.updateDraft(crepo, OWNER, campaignId, { templateId: approved!.id, budgetInr: 100 }))
  const c = (await crepo.getCampaign(campaignId))!
  assert.equal(c.template_id, approved!.id); assert.equal(c.status, 'draft')
  assert.match(c.ref_token, CAMPAIGN_TOKEN_RE)
  refToken = c.ref_token
})

// ── 3. Eligibility ─────────────────────────────────────────────────────────
await test('3. eligibility: no consent, withdrawn consent and opted-out are excluded', async () => {
  assert.equal(okr(await camp.addRecipients(crepo, OWNER, campaignId, { listId })).added, 4)
  const v = okr(await camp.loadCampaign(crepo, OWNER, campaignId)).view
  assert.equal(v.preview.recipients_queued, 4)
  assert.equal(v.preview.eligible, 1)
  assert.deepEqual(v.preview.excluded, { no_consent: 1, marketing_no: 1, opted_out: 1 })
  const byPhone = new Map(v.recipients.rows.map(r => [r.phone, r]))
  assert.equal(byPhone.get(OPTED_OUT)!.opted_out, true)
  assert.equal(byPhone.get(OPTED_OUT)!.marketing, 'yes') // consent alone does not beat an opt-out
  // "Keep eligible only" drops the three; the owner then approves exactly one.
  assert.equal(okr(await camp.keepEligibleOnly(crepo, OWNER, campaignId)).removed, 3)
  const tpl = (await crepo.getCampaign(campaignId))!.template_id!
  bad(await camp.approveCampaign(crepo, COUNSELLOR, campaignId, { seenEligible: 1, seenTemplate: tpl, confirm: 'APPROVE' }), /permission/)
  bad(await camp.approveCampaign(crepo, OWNER, campaignId, { seenEligible: 4, seenTemplate: tpl, confirm: 'APPROVE' }), /changed since you looked/)
  okr(await camp.approveCampaign(crepo, OWNER, campaignId, { seenEligible: 1, seenTemplate: tpl, confirm: 'APPROVE' }))
  const c = (await crepo.getCampaign(campaignId))!
  assert.equal(c.status, 'approved'); assert.equal(c.ref_token, refToken)
})

// ── 4. Keyword reply ───────────────────────────────────────────────────────
// The inbox mock and the campaign mock do not share contacts, so the reply
// arrives on the inbox mock's first seeded conversation, not on CONSENTED.
const RULES: AutoRule[] = [
  { key: 'interested', enabled: true, keywords: ['yes', 'interested', 'refer a friend'], reply: 'Use https://edifyedu.in/refer to send us your friend\'s details.' },
  { key: 'know_more', enabled: true, keywords: ['know more', 'details'], reply: 'How it works: share a friend, we counsel them.' },
  { key: 'reward', enabled: true, keywords: ['reward', 'how much'], reply: 'Rewards are paid after a confirmed admission.' },
  { key: 'call_me', enabled: true, keywords: ['call me'], reply: 'Our team will call you.' },
]
function autoStore(cands: Candidate[], enabled: boolean) {
  const claims = new Map<string, AutoRuleKey | null>()
  let optOuts = 0
  const s: AutoStore = {
    async enabled() { return enabled },
    async rules() { return RULES },
    async candidates() { return cands.filter(c => !claims.has(c.message_id)) },
    async claim(id, rule) { if (claims.has(id)) return 'duplicate'; claims.set(id, rule); return rule ? 'ok' : 'no_rule' },
    async finish() { /* state not needed here */ },
    async recordOptOuts() { optOuts++; return 1 },
  }
  return { s, claims, optOuts: () => optOuts }
}
const env: GraphEnv = { token: 'T', phoneNumberId: 'PN', wabaId: 'W', appId: 'A', appSecret: 'S', version: 'v26.0' }
function fakeMeta() {
  const sent: Array<{ type: string; text?: { body: string } }> = []
  const f = (async (_u: string, init: RequestInit = {}) => {
    sent.push(JSON.parse(String(init.body)))
    return { status: 200, ok: true, json: async () => ({ messages: [{ id: `wamid.${sent.length}` }] }), headers: new Headers() } as unknown as Response
  }) as unknown as typeof fetch
  return { f, sent }
}
function inboxWith(bodies: string[]) {
  const inbox = mockInboxRepo()
  inbox.state.settings.sending_enabled = true
  const conv = inbox.state.convs[0]
  const cands: Candidate[] = bodies.map((b, i) => ({ message_id: `00000000-0000-4000-8000-0000000e2e0${i}`, conversation_id: conv.id, contact_id: conv.contact_id, type: 'text', body: b, created_at: new Date().toISOString() }))
  return { inbox, conv, cands }
}

await test('4a. automation OFF: a keyword reply sends nothing', async () => {
  const { inbox, cands } = inboxWith(['YES'])
  const a = autoStore(cands, false); const m = fakeMeta()
  const r = await runAutoReplies(a.s, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(r.state, 'off'); assert.equal(r.sent, 0); assert.equal(m.sent.length, 0); assert.equal(a.claims.size, 0)
})

await test('4b. automation ON: the matching rule\'s reply is sent', async () => {
  const { inbox, conv, cands } = inboxWith(['Yes'])
  const a = autoStore(cands, true); const m = fakeMeta()
  const r = await runAutoReplies(a.s, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(r.state, 'ran'); assert.equal(r.sent, 1); assert.equal(m.sent.length, 1)
  assert.equal(m.sent[0].type, 'text'); assert.equal(m.sent[0].text?.body, RULES[0].reply)
  assert.equal(a.claims.get(cands[0].message_id), 'interested')
  const out = inbox.state.messages.filter(x => x.conversation_id === conv.id && x.sent_by === 'automation')
  assert.equal(out.length, 1); assert.equal(out[0].body, RULES[0].reply)
})

await test('4c. STOP records an opt-out and sends nothing', async () => {
  const { inbox, cands } = inboxWith(['STOP'])
  const a = autoStore(cands, true); const m = fakeMeta()
  const r = await runAutoReplies(a.s, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(a.optOuts(), 1); assert.equal(r.skipped.stop, 1); assert.equal(r.sent, 0); assert.equal(m.sent.length, 0)
  assert.equal(a.claims.get(cands[0].message_id), null) // claimed with no rule, so it can never be answered later
})

// ── 5. Referral with the campaign token ────────────────────────────────────
const referInput = () => ({ referrerName: 'Asha Rao', referrerPhone: '98765 43210', referredName: 'Vikram Singh', referredPhone: '9123456789',
  programme: 'MBA', universityId: '', note: 'Works weekdays, call after 6', permission: true, waOptin: false, campaign: refToken, website: '', elapsedMs: MIN_FILL_MS + 1 })

await test('5. referral with the campaign token gets an EDU-REF code; the same pair repeats the code', async () => {
  const v = validateReferral(referInput(), [])
  assert.ok(v.ok, JSON.stringify(v))
  if (!v.ok) return
  assert.equal(v.value.campaign, refToken)
  assert.equal(v.value.referrerPhone, CONSENTED)
  const s = await submitReferral(store, v.value, null)
  assert.ok(s.ok, JSON.stringify(s)); if (!s.ok) return
  assert.match(s.refCode, new RegExp('^EDU-REF-[A-Z0-9]{8}$'))
  assert.equal(s.outcome, 'created')
  refCode = s.refCode; referralId = s.referralId
  const again = await submitReferral(store, v.value, null)
  assert.ok(again.ok); if (!again.ok) return
  assert.equal(again.refCode, refCode); assert.equal(again.referralId, referralId)
  assert.equal(again.outcome === 'repeat', true)
  assert.equal(store.rows.length, 1)
  const row = (await rrepo.get(referralId))!
  assert.equal(row.attribution, 'link'); assert.ok(row.campaign_id); assert.equal(row.stage, 'new')
  assert.deepEqual(row.flags, []); assert.equal(row.review_state, 'clear')
  // Markup is stripped, not stored.
  const v2 = validateReferral({ ...referInput(), note: 'hi <b>there</b>' }, [])
  assert.ok(v2.ok); if (v2.ok) assert.doesNotMatch(v2.value.note ?? '', new RegExp('[<>]'))
})

// ── 6. Stages and admission ────────────────────────────────────────────────
await test('6. contacted -> counselling -> admission 3 days ago; reward due = admission + 7', async () => {
  assert.equal(okr(await svc.setStage(rrepo, COUNSELLOR, referralId, 'contacted')).referral.stage, 'contacted')
  assert.equal(okr(await svc.setStage(rrepo, COUNSELLOR, referralId, 'counselling')).referral.stage, 'counselling')
  admissionOn = daysAgo(3)
  const a = okr(await svc.confirmAdmission(rrepo, COUNSELLOR, referralId, admissionOn, 'Amity University Online'))
  assert.equal(a.referral.stage, 'admission_confirmed')
  assert.equal(a.referral.admission_confirmed_on, admissionOn)
  assert.equal(a.referral.reward_due_on, addDays(admissionOn, 7))
  assert.equal(rewardStatus(a.referral, today), 'pending')
})

// ── 7. Approve and pay ─────────────────────────────────────────────────────
await test('7. counsellor cannot approve or pay; owner approves Rs 1,000 and marks paid with a UTR', async () => {
  bad(await svc.approveReward(rrepo, COUNSELLOR, referralId, 1000, null), /permission/)
  okr(await svc.approveReward(rrepo, OWNER, referralId, 1000, null))
  bad(await svc.markPaid(rrepo, COUNSELLOR, referralId, today, 'UTR402911887766'), /permission/)
  const p = okr(await svc.markPaid(rrepo, OWNER, referralId, today, 'UTR402911887766'))
  assert.equal(p.referral.stage, 'reward_paid')
  assert.equal(p.referral.reward_amount_inr, 1000)
  assert.equal(p.referral.reward_paid_on, today)
  assert.equal(p.referral.payment_ref, 'UTR402911887766')
  assert.equal(rewardStatus(p.referral, today), 'paid')
  const log = (await rrepo.activity(referralId)).map(a => a.body).join(' | ')
  assert.match(log, /Rs 1,000 approved/)
  assert.match(log, new RegExp(`Rs 1,000 paid on ${today}`))
  assert.match(log, /Ref UTR402911887766/)
  assert.doesNotMatch(log, /days late/)
})

// ── 8. Campaign funnel ─────────────────────────────────────────────────────
// MOCK LIMIT: mockReferralStore does not look the token up in the campaign
// mock. Any valid token is attributed to one fixed id
// (00000000-0000-4000-8000-00000000c001, "Mock campaign"), so the funnel can
// only be read for that id, not for campaignId from step 2. The token ->
// campaign join lives in SQL and is covered by sql-referrals.test.mts.
await test('8. campaign funnel shows 1 referral and 1 admission (on the id the mock attributes)', async () => {
  const attributed = (await rrepo.get(referralId))!.campaign_id!
  const f = okr(await svc.campaignFunnels(rrepo, COUNSELLOR, [attributed]))
  const fun = f.funnels[attributed]
  assert.equal(fun.submitted, 1); assert.equal(fun.by_link, 1); assert.equal(fun.admissions, 1)
  assert.equal(fun.rewards_paid_n, 1); assert.equal(fun.rewards_paid_inr, 1000); assert.equal(fun.rewards_pending_n, 0)
  // Recorded so a later change that wires the mock to the campaign repo shows up here.
  assert.notEqual(attributed, campaignId, 'mock now joins token to the real campaign: switch this step to campaignId')
})

console.log(`\n${passed} passed`)
