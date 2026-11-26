// Run with: npx tsx lib/whatsapp/ingest.test.mts
// Webhook POST handling with a fake store. No network, no database.
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { handleWebhookPost, type EventStore, type ProcessSummary } from './ingest'
import { buildPayload, inboundText } from './test-fixtures'

const SECRET = 'test-app-secret'
const sign = (b: Buffer, s = SECRET) => 'sha256=' + createHmac('sha256', s).update(b).digest('hex')

type Call = { kind: 'ingest' | 'process'; arg: unknown }

function fakeStore(o: {
  ingestThrows?: boolean
  processThrows?: boolean
  state?: string
  summary?: ProcessSummary
} = {}) {
  const calls: Call[] = []
  const seen = new Map<string, { eventId: number; state: string }>()
  const store: EventStore = {
    async ingest(sha, raw) {
      calls.push({ kind: 'ingest', arg: { sha, len: raw.length } })
      if (o.ingestThrows) throw Object.assign(new Error('db down: +919800000001 hello'), { code: '08006' })
      const prev = seen.get(sha)
      if (prev) return prev
      const row = { eventId: seen.size + 1, state: o.state ?? 'pending' }
      seen.set(sha, row)
      return row
    },
    async process(id) {
      calls.push({ kind: 'process', arg: id })
      if (o.processThrows) throw Object.assign(new Error('timeout +919800000001'), { code: 'ETIMEDOUT' })
      const row = [...seen.values()].find(r => r.eventId === id)
      if (row) row.state = 'completed'
      return o.summary ?? { state: 'completed', messages: 1, messageTypes: { text: 1 } }
    },
  }
  return { store, calls }
}

function capture() {
  const lines: string[] = []
  const f = (...a: unknown[]) => { lines.push(a.map(String).join(' ')) }
  return { log: { info: f, warn: f, error: f }, lines }
}

const body = Buffer.from(JSON.stringify(buildPayload({
  messages: [inboundText({ id: 'wamid.T1', from: '919800000001', text: 'secret text', name: 'Private Name' })],
})))

async function post(raw: Buffer, sig: string | null, store: EventStore | null, secret: string | undefined = SECRET, log = capture().log) {
  return handleWebhookPost({ raw, declaredLength: raw.length, signature: sig, appSecret: secret, store, log })
}

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}

await test('valid signature: stored, processed, 200', async () => {
  const { store, calls } = fakeStore()
  const r = await post(body, sign(body), store)
  assert.deepEqual(r, { status: 200, body: 'EVENT_RECEIVED' })
  assert.deepEqual(calls.map(c => c.kind), ['ingest', 'process'])
})

await test('wrong secret, missing header, bad prefix, non-hex: 401 and nothing stored', async () => {
  for (const sig of [sign(body, 'other'), null, 'sha1=' + 'a'.repeat(64), 'sha256=zz', 'sha256=' + 'a'.repeat(63)]) {
    const { store, calls } = fakeStore()
    const r = await post(body, sig, store)
    assert.equal(r.status, 401, String(sig))
    assert.equal(calls.length, 0)
  }
})

await test('signature over re-serialised JSON fails', async () => {
  const pretty = Buffer.from(JSON.stringify(JSON.parse(body.toString()), null, 2))
  const { store } = fakeStore()
  assert.equal((await post(pretty, sign(body), store)).status, 401)
})

await test('missing app secret: 500', async () => {
  const { store } = fakeStore()
  assert.equal((await post(body, sign(body), store, '')).status, 500)
})

await test('oversize body: 413 before signature work', async () => {
  const big = Buffer.alloc(1024 * 1024 + 1, 32)
  const { store, calls } = fakeStore()
  assert.equal((await post(big, sign(big), store)).status, 413)
  assert.equal(calls.length, 0)
})

await test('signed bad JSON: 400', async () => {
  const bad = Buffer.from('{not json')
  assert.equal((await post(bad, sign(bad), fakeStore().store)).status, 400)
})

await test('signed non-WhatsApp object: 200, not stored', async () => {
  const other = Buffer.from(JSON.stringify({ object: 'page', entry: [] }))
  const { store, calls } = fakeStore()
  assert.equal((await post(other, sign(other), store)).status, 200)
  assert.equal(calls.length, 0)
})

await test('storage failure: 500 so Meta retries', async () => {
  const { store } = fakeStore({ ingestThrows: true })
  assert.equal((await post(body, sign(body), store)).status, 500)
})

await test('no database configured: 500', async () => {
  assert.equal((await post(body, sign(body), null)).status, 500)
})

await test('processing failure after storage: still 200 (sweeper retries)', async () => {
  const { store, calls } = fakeStore({ processThrows: true })
  assert.equal((await post(body, sign(body), store)).status, 200)
  assert.deepEqual(calls.map(c => c.kind), ['ingest', 'process'])
})

await test('duplicate delivery of a completed event: not processed again', async () => {
  const { store, calls } = fakeStore()
  await post(body, sign(body), store)
  await post(body, sign(body), store)
  assert.deepEqual(calls.map(c => c.kind), ['ingest', 'process', 'ingest'])
})

await test('10 parallel identical deliveries: one event id', async () => {
  const { store, calls } = fakeStore()
  const rs = await Promise.all(Array.from({ length: 10 }, () => post(body, sign(body), store)))
  assert.ok(rs.every(r => r.status === 200))
  const ids = new Set(calls.filter(c => c.kind === 'process').map(c => c.arg))
  assert.equal(ids.size, 1)
})

await test('logs never contain phone, name, text or error messages', async () => {
  for (const opts of [{}, { ingestThrows: true }, { processThrows: true }, { summary: { state: 'completed', messages: 1, messageTypes: { text: 1, '+919800000001': 1 } as Record<string, number> } }]) {
    const cap = capture()
    await post(body, sign(body), fakeStore(opts).store, SECRET, cap.log)
    const all = cap.lines.join('\n')
    assert.ok(cap.lines.length > 0)
    for (const bad of ['919800000001', 'Private Name', 'secret text', 'db down', 'timeout']) {
      assert.ok(!all.includes(bad), `log leaked "${bad}": ${all}`)
    }
  }
})

await test('no console call in WhatsApp code prints a raw payload, body or error message', async () => {
  // Static check over the WhatsApp server code. Flags console.* calls whose
  // arguments mention fields that carry personal data.
  const files: string[] = []
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else if (/\.(ts|tsx)$/.test(f) && !/\.test\.|test-fixtures/.test(f)) files.push(p)
    }
  }
  for (const d of ['lib/whatsapp', 'app/api/whatsapp', 'app/api/cron/whatsapp-sweep']) walk(d)
  assert.ok(files.length >= 4)
  const risky = /console\.\w+\([^)]*\b(raw|payload|text|body|message|err\.message|from|phone|wa_id|profile|name)\b/
  const hits = files.flatMap(f => readFileSync(f, 'utf8').split('\n')
    .map((l, i) => ({ f, i: i + 1, l }))
    .filter(x => risky.test(x.l) && !/\[whatsapp-(webhook|sweep)\]/.test(x.l.replace(risky, ''))))
  // Self-check: the detector must catch a known-bad line.
  assert.ok(risky.test("console.info('x', payload)"))
  assert.deepEqual(hits, [])
})

console.log(`\n${passed} ingest tests passed`)
