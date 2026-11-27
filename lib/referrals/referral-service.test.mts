// Referral dashboard tests: permissions, stage rules, admission -> approve ->
// pay, the 7-day due date, overdue view, review gate, races and CSV.
// Run: npx tsx lib/referrals/referral-service.test.mts
import assert from 'node:assert/strict'
import { mockReferralStore, submitReferral } from './refer-service'
import { mockReferralRepo } from './referral-mock'
import { validateReferral, MIN_FILL_MS } from './refer-rules'
import * as svc from './referral-service'
import { todayIST, rewardStatus, suggestRule } from './referral-types'
import { OWNER, type Actor } from '../whatsapp/access'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}
const COUNSELLOR: Actor = { id: 'c1', role: 'counsellor' }
const today = todayIST()
const daysAgo = (n: number) => new Date(Date.parse(`${today}T00:00:00Z`) - n * 864e5).toISOString().slice(0, 10)

async function setup(extra: Record<string, unknown> = {}) {
  const store = mockReferralStore()
  const repo = mockReferralRepo(store)
  const v = validateReferral({ referrerName: 'Asha Rao', referrerPhone: '9876543210', referredName: 'Vikram Singh', referredPhone: '9123456789',
    programme: 'MBA', universityId: '', note: '', permission: true, waOptin: false, campaign: '', website: '', elapsedMs: MIN_FILL_MS + 1, ...extra }, [])
  assert.ok(v.ok)
  const s = await submitReferral(store, v.value, null)
  assert.ok(s.ok)
  return { store, repo, id: s.referralId }
}
const okr = <T,>(r: T) => { assert.ok((r as { ok: boolean }).ok, JSON.stringify(r)); return r as Extract<T, { ok: true }> }
const bad = (r: unknown, re: RegExp) => { assert.equal((r as { ok: boolean }).ok, false); assert.match((r as { error: string }).error, re) }

await test('list and detail; counsellor can view and edit but not approve or pay', async () => {
  const { repo, id } = await setup()
  const l = okr(await svc.listReferrals(repo, COUNSELLOR, {}))
  assert.equal(l.rows.length, 1); assert.equal(l.counts.total, 1)
  okr(await svc.setStage(repo, COUNSELLOR, id, 'contacted'))
  okr(await svc.confirmAdmission(repo, COUNSELLOR, id, daysAgo(1), 'Amity University Online'))
  bad(await svc.approveReward(repo, COUNSELLOR, id, 1000, null), /permission/)
  bad(await svc.exportReferrals(repo, COUNSELLOR, {}), /permission/)
})

await test('reward stages cannot be set through the free stage control', async () => {
  const { repo, id } = await setup()
  bad(await svc.setStage(repo, OWNER, id, 'reward_paid'), /admission and reward buttons/)
  bad(await svc.setStage(repo, OWNER, id, 'admission_confirmed'), /admission and reward buttons/)
  bad(await svc.setStage(repo, OWNER, id, 'closed'), /reason/)
})

await test('admission sets due = admission + 7; future dates refused', async () => {
  const { repo, id } = await setup()
  bad(await svc.confirmAdmission(repo, OWNER, id, '2999-01-01', 'X Uni'), /today or earlier/)
  bad(await svc.confirmAdmission(repo, OWNER, id, '2026-02-30', 'X Uni'), /today or earlier/)
  const r = okr(await svc.confirmAdmission(repo, OWNER, id, daysAgo(2), 'Amity University Online'))
  assert.equal(r.referral.reward_due_on, daysAgo(-5))
  assert.equal(rewardStatus(r.referral, today), 'pending')
})

await test('approve needs admission, then pay needs approval, a date and a reference', async () => {
  const { repo, id } = await setup()
  bad(await svc.approveReward(repo, OWNER, id, 1000, null), /Confirm the admission/)
  bad(await svc.markPaid(repo, OWNER, id, today, 'UTR123'), /Approve the reward/)
  okr(await svc.confirmAdmission(repo, OWNER, id, daysAgo(3), 'Amity University Online'))
  bad(await svc.approveReward(repo, OWNER, id, 0, null), /whole rupee/)
  bad(await svc.approveReward(repo, OWNER, id, 1.5, null), /whole rupee/)
  okr(await svc.approveReward(repo, OWNER, id, 1500, null))
  bad(await svc.setStage(repo, OWNER, id, 'contacted'), /Undo the approval/)
  bad(await svc.markPaid(repo, OWNER, id, daysAgo(10), 'UTR123'), /before the admission/)
  bad(await svc.markPaid(repo, OWNER, id, today, 'x'), /transaction reference/)
  const p = okr(await svc.markPaid(repo, OWNER, id, today, 'UTR123456'))
  assert.equal(p.referral.stage, 'reward_paid'); assert.equal(rewardStatus(p.referral, today), 'paid')
  bad(await svc.setStage(repo, OWNER, id, 'closed', 'oops'), /paid referral/)
  const log = (await repo.activity(id)).map(a => a.body).join(' | ')
  assert.match(log, /Rs 1,500 approved/); assert.match(log, /paid on/)
})

await test('overdue: admission 10 days ago and unpaid shows in the overdue view only', async () => {
  const { repo, id } = await setup()
  okr(await svc.confirmAdmission(repo, OWNER, id, daysAgo(10), 'Amity University Online'))
  const o = okr(await svc.listReferrals(repo, OWNER, { due: 'overdue' }))
  const p = okr(await svc.listReferrals(repo, OWNER, { due: 'pending' }))
  assert.equal(o.rows.length, 1); assert.equal(p.rows.length, 0); assert.equal(o.counts.overdue, 1)
  okr(await svc.approveReward(repo, OWNER, id, 1000, null))
  const paid = okr(await svc.markPaid(repo, OWNER, id, today, 'UTR999'))
  assert.equal(paid.referral.stage, 'reward_paid')
  assert.match((await repo.activity(id))[0].body, /3 days late/)
})

await test('flagged referral: approval blocked until review resolved; self-referral never eligible', async () => {
  const { repo, id } = await setup({ referredPhone: '9876543210' }) // self
  okr(await svc.confirmAdmission(repo, OWNER, id, daysAgo(1), 'X University'))
  bad(await svc.approveReward(repo, OWNER, id, 1000, null), /Resolve the review/)
  bad(await svc.resolveReview(repo, OWNER, id, ''), /what you checked/)
  okr(await svc.resolveReview(repo, OWNER, id, 'Checked by phone'))
  bad(await svc.approveReward(repo, OWNER, id, 1000, null), /Self-referrals/)
})

await test('undo approval needs a reason and returns to admission confirmed', async () => {
  const { repo, id } = await setup()
  okr(await svc.confirmAdmission(repo, OWNER, id, daysAgo(1), 'X University'))
  okr(await svc.approveReward(repo, OWNER, id, 500, null))
  bad(await svc.undoApproval(repo, OWNER, id, ''), /reason/)
  const u = okr(await svc.undoApproval(repo, OWNER, id, 'Wrong amount'))
  assert.equal(u.referral.stage, 'admission_confirmed'); assert.equal(u.referral.reward_amount_inr, null)
})

await test('two tabs approving at once: the second gets a reload message', async () => {
  const { repo, id } = await setup()
  okr(await svc.confirmAdmission(repo, OWNER, id, daysAgo(1), 'X University'))
  const [a, b] = await Promise.all([svc.approveReward(repo, OWNER, id, 500, null), svc.approveReward(repo, OWNER, id, 700, null)])
  const oks = [a, b].filter(x => x.ok).length
  assert.equal(oks, 1)
  bad([a, b].find(x => !x.ok), /another tab|Confirm the admission/)
})

await test('reward rules: owner only, validated, best match suggested', async () => {
  const { repo } = await setup()
  bad(await svc.saveRewardRule(repo, COUNSELLOR, { label: 'x', amount_inr: 100 }), /permission/)
  bad(await svc.saveRewardRule(repo, OWNER, { label: 'x', amount_inr: 0 }), /whole rupee/)
  const g = okr(await svc.saveRewardRule(repo, OWNER, { label: 'General', amount_inr: 500 }))
  const m = okr(await svc.saveRewardRule(repo, OWNER, { label: 'MBA', programme: 'MBA', amount_inr: 1000 }))
  const rules = await repo.rules()
  assert.equal(suggestRule(rules, 'MBA', null)?.id, m.rule.id)
  assert.equal(suggestRule(rules, 'BBA', null)?.id, g.rule.id)
})

await test('search, follow-up due filter, note and CSV export', async () => {
  const { repo, id } = await setup()
  assert.equal(okr(await svc.listReferrals(repo, OWNER, { q: 'vikram' })).rows.length, 1)
  assert.equal(okr(await svc.listReferrals(repo, OWNER, { q: '3456789' })).rows.length, 1)
  assert.equal(okr(await svc.listReferrals(repo, OWNER, { q: 'nobody' })).rows.length, 0)
  okr(await svc.setFollowUp(repo, OWNER, id, daysAgo(1)))
  assert.equal(okr(await svc.listReferrals(repo, OWNER, { due: 'followup_due' })).rows.length, 1)
  okr(await svc.addNote(repo, OWNER, id, 'call', 'No answer'))
  const csv = okr(await svc.exportReferrals(repo, OWNER, {}))
  assert.equal(csv.rows.length, 1); assert.equal(csv.header[0], 'Referral ID')
})

console.log(`\n${passed} passed`)
