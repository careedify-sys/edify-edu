// /refer tests: form validation, bot checks, referral ids, retry on a taken
// code, rate limits, repeats and review flags. Mock store only.
// Run: npx tsx lib/referrals/refer.test.mts
import assert from 'node:assert/strict'
import { validateReferral, REF_CODE_RE, MIN_FILL_MS, UNI_UNDECIDED, type ReferInput } from './refer-rules'
import { newRefCode, hashIp, submitReferral, mockReferralStore, notificationEmail } from './refer-service'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}
const UNIS = [{ id: 'amity-university-online', name: 'Amity University Online' }]
const base: ReferInput = {
  referrerName: 'Asha Rao', referrerPhone: '98765 43210', referredName: 'Vikram Singh', referredPhone: '+91 91234 56789',
  programme: 'MBA', universityId: 'amity-university-online', note: 'Call after 6 pm', permission: true, termsAccepted: true, waOptin: false,
  campaign: '', website: '', elapsedMs: MIN_FILL_MS + 1,
}
const ok = (r: Partial<ReferInput> = {}) => {
  const v = validateReferral({ ...base, ...r }, UNIS)
  assert.ok(v.ok, JSON.stringify(v))
  return v.value
}

await test('valid form is normalised to E.164 and the university name comes from the list', () => {
  const v = ok()
  assert.equal(v.referrerPhone, '+919876543210')
  assert.equal(v.referredPhone, '+919123456789')
  assert.equal(v.university, 'Amity University Online')
  assert.equal(v.campaign, null)
})

await test('programme and university are optional; "not decided" keeps no id', () => {
  const v = ok({ programme: '', universityId: 'undecided' })
  assert.equal(v.programme, null); assert.equal(v.universityId, null); assert.equal(v.university, UNI_UNDECIDED)
  const w = ok({ programme: 'Not decided yet', universityId: '' })
  assert.equal(w.programme, 'Not decided yet'); assert.equal(w.university, null)
})

await test('a university or programme not on the list is refused', () => {
  const v = validateReferral({ ...base, universityId: 'made-up-uni', programme: 'PhD' }, UNIS)
  assert.ok(!v.ok); assert.ok(v.errors.universityId); assert.ok(v.errors.programme)
})

await test('terms must be accepted explicitly (QA F5)', () => {
  const v = validateReferral({ ...base, termsAccepted: false }, UNIS)
  assert.ok(!v.ok && !v.bot); assert.deepEqual(Object.keys(v.errors), ['termsAccepted'])
  const w = validateReferral({ ...base, termsAccepted: 'yes' as unknown as boolean }, UNIS)
  assert.ok(!w.ok)
})

await test('missing permission, bad names and bad numbers give field errors', () => {
  const v = validateReferral({ ...base, permission: false, referrerName: 'A', referredPhone: '12345', referredName: 'R2D2' }, UNIS)
  assert.ok(!v.ok)
  assert.deepEqual(Object.keys(v.errors).sort(), ['permission', 'referredName', 'referredPhone', 'referrerName'])
})

await test('honeypot and too-fast submissions are treated as bots', () => {
  const a = validateReferral({ ...base, website: 'http://spam' }, UNIS)
  const b = validateReferral({ ...base, elapsedMs: 500 }, UNIS)
  const c = validateReferral({ ...base, elapsedMs: undefined as unknown as number }, UNIS)
  for (const v of [a, b, c]) { assert.ok(!v.ok); assert.equal(v.bot, true) }
})

await test('campaign token passes only in its exact form', () => {
  assert.equal(ok({ campaign: '0123456789abcdef' }).campaign, '0123456789abcdef')
  assert.equal(ok({ campaign: '+919876543210' }).campaign, null)
  assert.equal(ok({ campaign: '0123456789ABCDEF' }).campaign, null)
})

await test('referral ids match the database format and do not repeat in 5,000 draws', () => {
  const seen = new Set<string>()
  for (let i = 0; i < 5000; i++) { const c = newRefCode(); assert.match(c, REF_CODE_RE); seen.add(c) }
  assert.equal(seen.size, 5000)
})

await test('ip hash is keyed, hex, and absent without an ip or key', () => {
  const h = hashIp('1.2.3.4', 'k1')!
  assert.match(h, /^[0-9a-f]{64}$/)
  assert.notEqual(h, hashIp('1.2.3.4', 'k2'))
  assert.equal(hashIp('unknown', 'k1'), null)
  assert.equal(hashIp('1.2.3.4', ''), null)
})

await test('a taken code is retried with a new one', async () => {
  const s = mockReferralStore()
  await submitReferral(s, ok(), null, () => 'EDU-REF-AAAAAAAA')
  const codes = ['EDU-REF-AAAAAAAA', 'EDU-REF-BBBBBBBB']
  const r = await submitReferral(s, ok({ referredPhone: '9123498765' }), null, () => codes.shift()!)
  assert.ok(r.ok); assert.equal(r.refCode, 'EDU-REF-BBBBBBBB')
})

await test('the same pair within a day returns the earlier id and stores nothing', async () => {
  const s = mockReferralStore()
  const a = await submitReferral(s, ok(), null)
  const b = await submitReferral(s, ok(), null)
  assert.ok(a.ok && b.ok); assert.equal(b.refCode, a.refCode); assert.equal(b.outcome, 'repeat'); assert.equal(s.rows.length, 1)
})

await test('flags: self-referral, already referred, several from one referrer', async () => {
  const s = mockReferralStore()
  await submitReferral(s, ok(), null)
  await submitReferral(s, ok({ referredPhone: '9876543210' }), null)        // self
  await submitReferral(s, ok({ referrerPhone: '9111111111' }), null)        // same friend, other referrer
  assert.deepEqual(s.rows[0].flags, [])
  assert.ok(s.rows[1].flags.includes('self_referral'))
  assert.ok(s.rows[1].flags.includes('many_from_referrer'))
  assert.ok(s.rows[2].flags.includes('already_referred'))
})

await test('rate limit: the sixth from one ip in an hour is refused with 429', async () => {
  const s = mockReferralStore()
  for (let i = 0; i < 5; i++) assert.ok((await submitReferral(s, ok({ referrerPhone: `9${i}12345678`, referredPhone: `8${i}12345678` }), 'ip1')).ok)
  const r = await submitReferral(s, ok({ referrerPhone: '9712345678', referredPhone: '8712345678' }), 'ip1')
  assert.ok(!r.ok); assert.equal(r.status, 429)
})

await test('notification email escapes input and marks review', () => {
  const m = notificationEmail('EDU-REF-ABCDEFGH', ok({ note: 'Tom & "Jerry"' }), { flags: ['existing_lead'], attribution: 'link', campaign: 'Nov referral' })
  assert.ok(m.subject.includes('needs review'))
  assert.ok(m.html.includes('Tom &amp; &quot;Jerry&quot;'))
  assert.equal(ok({ note: '<b>x</b>' }).note?.includes('<'), false)
  assert.ok(m.text.includes('This friend is already a lead'))
  assert.ok(!/—/.test(m.html))
})

console.log(`\n${passed} passed`)
