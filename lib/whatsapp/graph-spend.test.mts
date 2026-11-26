// Unit tests for lib/whatsapp/graph.ts, spend.ts and access.ts.
// Run: npx tsx lib/whatsapp/graph-spend.test.mts   (no network, no database)
import assert from 'node:assert/strict'
import {
  readGraphEnv, sendMessage, checkConnection, recipientFields, textPayload,
  requestContactInfoPayload, safeErrorTitle, type GraphEnv,
} from './graph'
import { summariseSpend, parseRates, parseFreePerMonth, parseOverride, windowState, type Usage } from './spend'
import { can, OWNER, type Actor } from './access'
import { actorFromCookie } from './admin-session'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}

const TOKEN = 'EAAG-test-token-never-printed'
const SECRET = 'app-secret-never-printed'
const env: GraphEnv = { token: TOKEN, phoneNumberId: '111', wabaId: '222', appId: '1673517570814877', appSecret: SECRET, version: 'v26.0' }

type Call = { url: string; init: RequestInit }
function fakeFetch(handler: (url: string, init: RequestInit) => { status: number; json?: unknown } | Promise<never>) {
  const calls: Call[] = []
  const f = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    const r = await handler(url, init)
    return { status: r.status, json: async () => r.json ?? null } as Response
  }) as unknown as typeof fetch
  return { f, calls }
}
const noSecrets = (o: unknown) => {
  const s = JSON.stringify(o)
  assert.ok(!s.includes(TOKEN), 'token leaked')
  assert.ok(!s.includes(SECRET), 'app secret leaked')
}

// ── graph.ts ────────────────────────────────────────────────────────────────

await test('env: version falls back to v26.0, blanks are missing', () => {
  const e = readGraphEnv({ WHATSAPP_ACCESS_TOKEN: '  ', WHATSAPP_GRAPH_VERSION: 'latest' })
  assert.equal(e.token, undefined)
  assert.equal(e.version, 'v26.0')
  assert.equal(readGraphEnv({ WHATSAPP_GRAPH_VERSION: 'v27.0' }).version, 'v27.0')
})

await test('recipient: phone preferred, BSUID used when the number is hidden', () => {
  assert.deepEqual(recipientFields({ phoneDigits: '919800000001', bsuid: 'IN.1' }), { to: '919800000001' })
  assert.deepEqual(recipientFields({ phoneDigits: null, bsuid: 'IN.1' }), { recipient: 'IN.1' })
  assert.equal(recipientFields({ phoneDigits: 'abc', bsuid: '' }), null)
})

await test('send: accepted returns the wamid and posts the right body', async () => {
  const { f, calls } = fakeFetch(() => ({ status: 200, json: { messages: [{ id: 'wamid.X' }] } }))
  const r = await sendMessage(env, { phoneDigits: '919800000001' }, textPayload('hello <b>'), f)
  assert.deepEqual(r, { state: 'accepted', wamid: 'wamid.X' })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://graph.facebook.com/v26.0/111/messages')
  const body = JSON.parse(String(calls[0].init.body))
  assert.deepEqual(body, { messaging_product: 'whatsapp', recipient_type: 'individual', to: '919800000001', type: 'text', text: { body: 'hello <b>', preview_url: false } })
})

await test('send: request contact info uses the interactive form', async () => {
  const { f, calls } = fakeFetch(() => ({ status: 200, json: { messages: [{ id: 'wamid.Y' }] } }))
  await sendMessage(env, { bsuid: 'IN.9' }, requestContactInfoPayload('Share your number?'), f)
  const body = JSON.parse(String(calls[0].init.body))
  assert.equal(body.recipient, 'IN.9')
  assert.equal(body.to, undefined)
  assert.deepEqual(body.interactive, { type: 'request_contact_info', body: { text: 'Share your number?' }, action: { name: 'request_contact_info' } })
})

await test('send: 4xx is failed with code and a title stripped of numbers', async () => {
  const { f } = fakeFetch(() => ({ status: 400, json: { error: { code: 131047, message: 'Re-engagement message to +91 98000 00001 outside window' } } }))
  const r = await sendMessage(env, { phoneDigits: '919800000001' }, textPayload('x'), f)
  assert.equal(r.state, 'failed')
  if (r.state === 'failed') {
    assert.equal(r.code, 131047)
    assert.ok(!/98000/.test(r.title ?? ''), r.title ?? '')
  }
})

await test('send: 5xx, network error and timeout are unknown and never retried', async () => {
  for (const [h, reason] of [
    [() => ({ status: 503 }), 'server'],
    [() => Promise.reject(new TypeError('fetch failed')), 'network'],
  ] as const) {
    const { f, calls } = fakeFetch(h as any)
    const r = await sendMessage(env, { phoneDigits: '919800000001' }, textPayload('x'), f)
    assert.deepEqual(r, { state: 'unknown', reason })
    assert.equal(calls.length, 1, 'exactly one attempt')
  }
  const slow = ((_u: string, init: RequestInit) => new Promise((_, rej) => {
    init.signal?.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })))
  })) as unknown as typeof fetch
  assert.deepEqual(await sendMessage(env, { phoneDigits: '919800000001' }, textPayload('x'), slow, 20), { state: 'unknown', reason: 'timeout' })
})

await test('send: missing config fails without any request', async () => {
  const { f, calls } = fakeFetch(() => ({ status: 200 }))
  const r = await sendMessage({ ...env, token: undefined }, { phoneDigits: '919800000001' }, textPayload('x'), f)
  assert.equal(r.state, 'failed')
  assert.equal(calls.length, 0)
})

await test('safeErrorTitle keeps short codes, drops phone-like runs', () => {
  assert.equal(safeErrorTitle('Error 131047'), 'Error 131047')
  assert.equal(safeErrorTitle('to 919800000001 failed'), 'to [number] failed')
  assert.equal(safeErrorTitle(42), null)
})

function connectionFetch(o: { debug?: unknown; debugStatus?: number; phoneStatus?: number; wabaCurrency?: string; numbers?: string[] } = {}) {
  return fakeFetch(url => {
    if (url.includes('/debug_token')) return { status: o.debugStatus ?? 200, json: o.debug ?? {
      data: { app_id: '1673517570814877', type: 'SYSTEM_USER', is_valid: true, expires_at: 0,
        scopes: ['whatsapp_business_messaging', 'whatsapp_business_management', 'business_management'],
        granular_scopes: [{ scope: 'whatsapp_business_messaging', target_ids: ['222'] }] } } }
    if (url.includes('/222/phone_numbers')) return { status: 200, json: { data: (o.numbers ?? ['111']).map(id => ({ id })) } }
    if (url.includes('/222?')) return { status: 200, json: { id: '222', name: 'Edify', currency: o.wabaCurrency ?? 'INR', timezone_id: '71' } }
    if (url.includes('/111?')) return { status: o.phoneStatus ?? 200, json: o.phoneStatus && o.phoneStatus !== 200
      ? { error: { code: 100 } } : { id: '111', display_phone_number: '+91 70612 85806', verified_name: 'edifyedu.in', quality_rating: 'GREEN' } }
    return { status: 404 }
  })
}

await test('connection: healthy System User token reports ok and leaks nothing', async () => {
  const { f, calls } = connectionFetch()
  const r = await checkConnection(env, f)
  assert.deepEqual(r.vars, { WHATSAPP_ACCESS_TOKEN: 'ok', WHATSAPP_PHONE_NUMBER_ID: 'ok', WHATSAPP_BUSINESS_ACCOUNT_ID: 'ok', META_APP_SECRET: 'ok' })
  assert.equal(r.token?.systemUser, true)
  assert.equal(r.token?.expires, 'never')
  assert.deepEqual(r.token?.extraScopes, ['business_management'])
  assert.equal(r.token?.wabaGranted, true)
  assert.equal(r.phone?.inWaba, true)
  assert.equal(r.waba?.currency, 'INR')
  assert.deepEqual(r.problems, [])
  noSecrets(r)
  assert.ok(calls.every(c => c.init.method === 'GET'), 'read-only')
})

await test('connection: user token that expires is flagged; wrong phone id flagged', async () => {
  const { f } = connectionFetch({
    debug: { data: { app_id: '1673517570814877', type: 'USER', is_valid: true, expires_at: 1800000000, scopes: ['whatsapp_business_messaging'] } },
    phoneStatus: 400, wabaCurrency: 'USD',
  })
  const r = await checkConnection(env, f)
  assert.equal(r.vars.WHATSAPP_PHONE_NUMBER_ID, 'wrong')
  assert.ok(r.problems.some(p => /System User/.test(p)))
  assert.ok(r.problems.some(p => /expires/.test(p)))
  assert.ok(r.problems.some(p => /whatsapp_business_management/.test(p)))
  assert.ok(r.problems.some(p => /USD/.test(p)))
  noSecrets(r)
})

await test('connection: missing variables are named, nothing is called for them', async () => {
  const { f, calls } = connectionFetch()
  const r = await checkConnection({ version: 'v26.0', appId: '1' }, f)
  assert.equal(calls.length, 0)
  assert.deepEqual(Object.values(r.vars), ['missing', 'missing', 'missing', 'missing'])
  assert.equal(r.problems.filter(p => /not set/.test(p)).length, 4)
})

await test('connection: bad app secret is reported as META_APP_SECRET wrong', async () => {
  const { f } = connectionFetch({ debugStatus: 400, debug: { error: { code: 190 } } })
  const r = await checkConnection(env, f)
  assert.equal(r.vars.META_APP_SECRET, 'wrong')
  noSecrets(r)
})

// ── spend.ts ────────────────────────────────────────────────────────────────

const MONTH = '2026-11-30T18:30:00+00:00'
const RATES = parseRates({ currency: 'INR', service: 0.115, utility: 0.115, marketing: 0.8631, authentication: 0.115 })
const usage = (delivered: number, inFlight = 0, metaBillable = 0): Usage =>
  ({ month_start: MONTH, service_delivered: delivered, service_in_flight: inFlight, meta_billable: metaBillable, meta_free: 0 })

await test('spend: inside the free tier the next reply is free', () => {
  const s = summariseSpend({ usage: usage(10), rates: RATES, freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(s.freeUsed, 10)
  assert.equal(s.freeLeft, 990)
  assert.equal(s.paidMessages, 0)
  assert.equal(s.chargesInr, 0)
  assert.equal(s.remainingInr, 500)
  assert.deepEqual(s.next, { allowed: true, paid: false, costInr: 0, reason: null })
})

await test('spend: message 1,001 is the first paid one; in-flight counts', () => {
  const a = summariseSpend({ usage: usage(999), rates: RATES, freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(a.next.paid, false)
  const b = summariseSpend({ usage: usage(999, 1), rates: RATES, freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(b.next.paid, true)
  assert.equal(b.next.costInr, 0.115)
})

await test('spend: the ₹500 cap blocks the message that would cross it', () => {
  // 4,347 paid x 0.115 = 499.905; one more is 500.02.
  const s = summariseSpend({ usage: usage(1000 + 4347), rates: RATES, freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(s.chargesInr, 499.905)
  assert.equal(s.next.allowed, false)
  const t = summariseSpend({ usage: usage(1000 + 4346), rates: RATES, freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(t.next.allowed, true)
})

await test('spend: Meta billable count wins when it is higher', () => {
  const s = summariseSpend({ usage: usage(5, 0, 7), rates: RATES, freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(s.paidMessages, 7)
  assert.equal(s.next.paid, true)
})

await test('spend: override applies only to its own month', () => {
  const o = { month_start: '2026-11-30T18:30:00.000Z', extra_inr: 200, by: 'owner', at: '2026-12-02T00:00:00Z' }
  const s = summariseSpend({ usage: usage(1000 + 4347), rates: RATES, freePerMonth: 1000, capInr: 500, override: o })
  assert.equal(s.overrideActive, true)
  assert.equal(s.budgetInr, 700)
  assert.equal(s.next.allowed, true)
  const old = summariseSpend({ usage: usage(1000 + 4347), rates: RATES, freePerMonth: 1000, capInr: 500, override: { ...o, month_start: '2026-10-31T18:30:00Z' } })
  assert.equal(old.overrideActive, false)
  assert.equal(old.next.allowed, false)
})

await test('spend: missing rate or free tier fails safe', () => {
  const noRate = summariseSpend({ usage: usage(1000), rates: parseRates({ currency: 'INR', service: null }), freePerMonth: 1000, capInr: 500, override: null })
  assert.equal(noRate.next.allowed, false)
  const noFree = summariseSpend({ usage: usage(0), rates: RATES, freePerMonth: null, capInr: 500, override: null })
  assert.equal(noFree.next.paid, true, 'unknown free tier: assume paid')
  assert.equal(noFree.next.allowed, true)
  assert.equal(parseRates({ currency: 'USD', service: 0.1 }), null)
  assert.equal(parseRates({ currency: 'INR', service: -1 })?.service, null)
  assert.equal(parseFreePerMonth({ per_month: '1000' }), 1000)
  assert.equal(parseOverride({ month_start: MONTH, extra_inr: 'lots', by: 'x', at: 'y' }), null)
})

await test('window: open for 24 hours after the last inbound message', () => {
  const now = Date.parse('2026-12-02T12:00:00Z')
  assert.equal(windowState('2026-12-01T12:00:01Z', now).open, true)
  assert.equal(windowState('2026-12-01T11:59:59Z', now).open, false)
  assert.equal(windowState(null, now).open, false)
})

// ── access.ts and admin-session.ts ─────────────────────────────────────────

await test('access: owner can do everything, a counsellor cannot touch settings or the cap', () => {
  const c: Actor = { id: 'c1', role: 'counsellor' }
  assert.equal(can(OWNER, 'override_cap'), true)
  assert.equal(can(c, 'send'), true)
  for (const a of ['edit_settings', 'toggle_sending', 'override_cap', 'connection_check'] as const) assert.equal(can(c, a), false, a)
  assert.equal(can(null, 'view'), false)
})

await test('session: fails closed without ADMIN_SESSION_TOKEN; exact match only', () => {
  assert.equal(actorFromCookie(undefined, undefined), null)
  assert.equal(actorFromCookie('x', undefined), null)
  assert.equal(actorFromCookie('abc', 'abd'), null)
  assert.equal(actorFromCookie('ab', 'abc'), null)
  assert.deepEqual(actorFromCookie('abc', 'abc'), OWNER)
})

console.log(`\n${passed} graph/spend/access tests passed`)
