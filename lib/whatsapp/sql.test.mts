// SQL tests for supabase/migrations/*whatsapp_core.sql, run on PGlite
// (Postgres compiled to WebAssembly). Never touches Supabase.
//
// PGlite is not a project dependency. Install it anywhere outside the repo and
// point PGLITE_MODULE at its entry file:
//   npm i --prefix <dir> @electric-sql/pglite@0.3
//   PGLITE_MODULE=file:///<dir>/node_modules/@electric-sql/pglite/dist/index.js npx tsx lib/whatsapp/sql.test.mts
//
// PGlite is single-connection, so true concurrency is NOT covered here; the
// row lock and unique keys are exercised sequentially.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { buildPayload, inboundText, statusEvent } from './test-fixtures'

const modPath = process.env.PGLITE_MODULE
if (!modPath) {
  console.error('Set PGLITE_MODULE (see the header of this file).')
  process.exit(2)
}
const { PGlite } = await import(modPath)
const db = new PGlite()

const MIG_DIR = join(process.cwd(), 'supabase', 'migrations')

async function setup() {
  await db.exec(`create role anon; create role authenticated; create role service_role;`)
  const files = readdirSync(MIG_DIR).filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql')).sort()
  for (const f of files) {
    try {
      await db.exec(readFileSync(join(MIG_DIR, f), 'utf8'))
    } catch (e) {
      throw new Error(`migration ${f} failed: ${(e as Error).message}`)
    }
  }
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex')

async function ingest(raw: string) {
  const r = await db.query<{ event_id: number; event_state: string }>(
    'select * from wa_ingest_event($1, $2)', [sha(raw), raw])
  return r.rows[0]
}
// Mirrors lib/whatsapp/store.ts: count the attempt, then process.
async function processEv(id: number) {
  const b = await db.query<{ ok: boolean }>('select wa_begin_attempt($1) as ok', [id])
  if (b.rows[0].ok !== true) return { state: 'skipped' }
  const r = await db.query<{ r: any }>('select wa_process_event($1) as r', [id])
  return r.rows[0].r
}
async function deliver(payload: unknown) {
  const raw = JSON.stringify(payload)
  const ev = await ingest(raw)
  return { ev, res: await processEv(ev.event_id) }
}
async function one<T = any>(sql: string, params: unknown[] = []): Promise<T> {
  return (await db.query<T>(sql, params)).rows[0]
}
async function count(sql: string, params: unknown[] = []) {
  return Number((await one<{ n: number }>(sql, params)).n)
}

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}

await setup()

await test('migration is idempotent (runs twice)', async () => {
  await db.exec(readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith('whatsapp_core.sql'))!), 'utf8'))
})

await test('inbound text creates contact, conversation, message', async () => {
  const { res } = await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.A1', from: '919800000001', text: 'नमस्ते, MBA fees? 🙏', name: 'Asha' })] }))
  assert.equal(res.state, 'completed')
  assert.equal(res.messages, 1)
  const c = await one<any>(`select * from wa_contacts where phone_e164 = '+919800000001'`)
  assert.equal(c.profile_name, 'Asha')
  assert.equal(c.phone_source, 'webhook')
  const m = await one<any>(`select * from wa_messages where wamid = 'wamid.A1'`)
  assert.equal(m.body, 'नमस्ते, MBA fees? 🙏')
  assert.equal(m.direction, 'inbound')
  const conv = await one<any>(`select * from wa_conversations where id = $1`, [m.conversation_id])
  assert.equal(conv.unread_count, 1)
  assert.ok(conv.last_inbound_at)
  assert.equal(conv.last_message_preview, 'नमस्ते, MBA fees? 🙏')
})

await test('identical delivery twice: one event row, one message', async () => {
  const p = buildPayload({ messages: [inboundText({ id: 'wamid.A2', from: '919800000001', text: 'hi' })] })
  const a = await deliver(p)
  const b = await deliver(p)
  assert.equal(a.ev.event_id, b.ev.event_id)
  assert.equal(b.res.state, 'skipped') // already completed: wa_begin_attempt refuses
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.A2'`), 1)
})

await test('same message in a different delivery body: deduped by wamid', async () => {
  const m = inboundText({ id: 'wamid.A3', from: '919800000001', text: 'again' })
  await deliver(buildPayload({ messages: [m] }))
  const r = await deliver(buildPayload({ messages: [m], entryId: 'other-entry' }))
  assert.equal(r.res.duplicates, 1)
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.A3'`), 1)
  const conv = await one<any>(`select unread_count from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000001'`)
  assert.equal(conv.unread_count, 3) // A1, A2, A3 once each
})

await test('out-of-order statuses: read survives a late delivered and sent', async () => {
  const conv = await one<any>(`select cv.id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000001'`)
  // Status arrives BEFORE our outbound row has its wamid.
  await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.OUT1', status: 'read', recipient: '919800000001' })] }))
  await db.query(`insert into wa_messages (conversation_id, direction, wamid, type, body, send_state) values ($1, 'outbound', 'wamid.OUT1', 'text', 'reply', 'accepted')`, [conv.id])
  await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.OUT1', status: 'delivered', recipient: '919800000001' })] }))
  await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.OUT1', status: 'sent', recipient: '919800000001', pricing: { billable: true, pricing_model: 'PMP', type: 'regular', category: 'service' } })] }))
  const m = await one<any>(`select status, status_rank from wa_messages where wamid = 'wamid.OUT1'`)
  assert.equal(m.status, 'read')
  assert.equal(m.status_rank, 3)
  assert.equal(await count(`select count(*) n from wa_message_statuses where wamid = 'wamid.OUT1'`), 3)
  const pr = await one<any>(`select pricing from wa_message_statuses where wamid = 'wamid.OUT1' and status = 'sent'`)
  assert.equal(pr.pricing.category, 'service')
})

await test('failed status shows failed with code, unless already delivered', async () => {
  const conv = await one<any>(`select id from wa_conversations limit 1`)
  await db.query(`insert into wa_messages (conversation_id, direction, wamid, type, send_state) values ($1, 'outbound', 'wamid.OUT2', 'text', 'accepted')`, [conv.id])
  await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.OUT2', status: 'failed', recipient: '919800000001', errors: [{ code: 131047, title: 'Re-engagement message' }] })] }))
  const m = await one<any>(`select status, error_code, error_title from wa_messages where wamid = 'wamid.OUT2'`)
  assert.equal(m.status, 'failed')
  assert.equal(m.error_code, 131047)
})

await test('username user with no phone: stored by BSUID, phone filled later', async () => {
  const p = buildPayload({
    messages: [inboundText({ id: 'wamid.U1', from: undefined, fromUserId: 'IN.111', text: 'hello', name: 'Ravi', username: 'ravi.k' })],
  })
  const r = await deliver(p)
  assert.equal(r.res.messages, 1)
  const c = await one<any>(`select * from wa_contacts where bsuid = 'IN.111'`)
  assert.equal(c.phone_e164, null)
  assert.equal(c.username, 'ravi.k')
  // A later message carries both: phone is filled on the same contact.
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.U2', from: '919800000002', fromUserId: 'IN.111', text: 'call me' })] }))
  const c2 = await one<any>(`select * from wa_contacts where bsuid = 'IN.111'`)
  assert.equal(c2.phone_e164, '+919800000002')
  assert.equal(await count(`select count(*) n from wa_contacts where bsuid = 'IN.111' or phone_e164 = '+919800000002'`), 1)
})

await test('REQUEST_CONTACT_INFO reply sets the hidden phone, origin other does not', async () => {
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.R0', from: undefined, fromUserId: 'IN.222', text: 'hi' })] }))
  const other = {
    id: 'wamid.R1', from_user_id: 'IN.222', timestamp: '1764000000', type: 'contacts',
    contacts: [{ origin: 'other', phones: [{ phone: '+91 98000 00099', wa_id: '919800000099', type: 'CELL' }], name: { formatted_name: 'Friend' } }],
  }
  await deliver(buildPayload({ messages: [other], contacts: [{ user_id: 'IN.222', profile: { name: 'Neha' } }] }))
  assert.equal((await one<any>(`select phone_e164 from wa_contacts where bsuid = 'IN.222'`)).phone_e164, null)
  const reply = {
    id: 'wamid.R2', from_user_id: 'IN.222', timestamp: '1764000100', type: 'contacts',
    contacts: [{ origin: 'contact_request', phones: [{ phone: '+91 98000 00003', wa_id: '919800000003', type: 'CELL' }], user_id: 'IN.222' }],
  }
  await deliver(buildPayload({ messages: [reply], contacts: [{ user_id: 'IN.222', profile: { name: 'Neha' } }] }))
  const c = await one<any>(`select phone_e164, phone_source from wa_contacts where bsuid = 'IN.222'`)
  assert.equal(c.phone_e164, '+919800000003')
  assert.equal(c.phone_source, 'contact_request')
})

await test('user_changed_number moves the number and keeps history', async () => {
  const sys = {
    id: 'wamid.S1', from: '919800000001', timestamp: '1764000200', type: 'system',
    system: { body: 'User A changed from 919800000001 to 919800000011', wa_id: '919800000011', type: 'user_changed_number' },
  }
  await deliver(buildPayload({ messages: [sys] }))
  assert.equal(await count(`select count(*) n from wa_contacts where phone_e164 = '+919800000011'`), 1)
  assert.equal(await count(`select count(*) n from wa_contact_identity_history where old_phone_e164 = '+919800000001'`), 1)
})

await test('unknown field and junk entries complete without projecting', async () => {
  const { res } = await deliver({
    object: 'whatsapp_business_account',
    entry: [{ id: 'x', changes: [{ field: 'user_preferences', value: { foo: 1 } }, { field: 'messages', value: 'nope' }, 7] }, null, 'str'],
  })
  assert.equal(res.state, 'completed')
  assert.equal(res.other_fields, 3) // user_preferences, non-object value, and the bare 7
  const { res: r2 } = await deliver({ object: 'whatsapp_business_account', entry: 'not-an-array' })
  assert.equal(r2.state, 'completed')
})

await test('\\u0000 in text is stored instead of rejected', async () => {
  const raw = JSON.stringify(buildPayload({ messages: [inboundText({ id: 'wamid.N1', from: '919800000004', text: 'a\u0000b' })] }))
  assert.ok(raw.includes('\\u0000'))
  const ev = await ingest(raw)
  const res = await processEv(ev.event_id)
  assert.equal(res.state, 'completed')
  assert.equal((await one<any>(`select body from wa_messages where wamid = 'wamid.N1'`)).body, 'ab')
})

await test('failure inside processing is undone and recorded as failed, then retried', async () => {
  const raw = JSON.stringify(buildPayload({ messages: [inboundText({ id: 'wamid.F1', from: '919800000005', text: 'x' })] }))
  const ev = await ingest(raw)
  // Break processing: a check constraint the insert will violate.
  await db.exec(`alter table wa_messages add constraint tmp_break check (wamid <> 'wamid.F1')`)
  const res = await processEv(ev.event_id)
  assert.equal(res.state, 'failed')
  const row = await one<any>(`select state, attempts, last_error, raw_body is not null as kept from wa_webhook_events where id = $1`, [ev.event_id])
  assert.equal(row.state, 'failed')
  assert.equal(row.attempts, 1)
  assert.ok(row.kept)
  assert.match(row.last_error, /^23514 tmp_break$/)
  assert.ok(!/919800000005/.test(row.last_error))
  // Partial work rolled back: no contact for that number.
  assert.equal(await count(`select count(*) n from wa_contacts where phone_e164 = '+919800000005'`), 0)
  await db.exec(`alter table wa_messages drop constraint tmp_break`)
  // Sweeper only picks it up after a minute; backdate it.
  await db.query(`update wa_webhook_events set received_at = now() - interval '2 minutes' where id = $1`, [ev.event_id])
  const ids = (await db.query<{ id: number }>(`select wa_events_to_retry(20) as id`)).rows.map(r => Number(r.id))
  assert.ok(ids.includes(Number(ev.event_id)))
  const res2 = await processEv(ev.event_id)
  assert.equal(res2.state, 'completed')
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.F1'`), 1)
})

await test('retry stops after 5 attempts and is counted as exhausted', async () => {
  const raw = JSON.stringify(buildPayload({ messages: [inboundText({ id: 'wamid.F2', from: '919800000006', text: 'y' })] }))
  const ev = await ingest(raw)
  await db.query(`update wa_webhook_events set attempts = 5, state = 'failed', received_at = now() - interval '2 minutes' where id = $1`, [ev.event_id])
  const ids = (await db.query<{ id: number }>(`select wa_events_to_retry(100) as id`)).rows.map(r => Number(r.id))
  assert.ok(!ids.includes(Number(ev.event_id)))
  assert.ok((await one<any>(`select wa_exhausted_count() n`)).n >= 1)
})

await test('retention nulls raw bodies of completed events older than 30 days only', async () => {
  await db.exec(`update wa_webhook_events set received_at = now() - interval '31 days' where state = 'completed'`)
  const n = (await one<any>(`select wa_purge_raw_bodies() n`)).n
  assert.ok(n > 0)
  assert.equal(await count(`select count(*) n from wa_webhook_events where state = 'completed' and raw_body is not null`), 0)
  assert.ok(await count(`select count(*) n from wa_webhook_events where state <> 'completed' and raw_body is not null`) >= 1)
})

await test('RLS: anon and authenticated see no rows and cannot call functions', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`grant usage on schema public to ${role}; grant select on all tables in schema public to ${role};`)
    await db.exec(`set role ${role}`)
    try {
      for (const t of ['wa_contacts', 'wa_messages', 'wa_conversations', 'wa_webhook_events', 'wa_message_statuses', 'wa_settings']) {
        assert.equal(await count(`select count(*) n from ${t}`), 0, `${role} sees ${t}`)
      }
      await assert.rejects(db.query(`select wa_ingest_event('x', '{}')`), /permission denied/)
    } finally {
      await db.exec('reset role')
    }
  }
})

await test('kill switches seeded off', async () => {
  const r = (await db.query<any>(`select key, value from wa_settings order by key`)).rows
  assert.deepEqual(r.map((x: any) => [x.key, x.value]), [['automation_enabled', false], ['campaigns_enabled', false], ['sending_enabled', false]])
})

// ── Regression tests for QA findings, 26 Nov (audits/qa/2026-11-26-whatsapp-phase1-premerge.md)

await test('QA F1: entries without an id are skipped, good ones in the same delivery kept', async () => {
  const good = inboundText({ id: 'wamid.F1good', from: '919800000021', text: 'ok' })
  const noId = { from: '919800000021', timestamp: '1764000000', type: 'text', text: { body: 'no id' } }
  const { res } = await deliver(buildPayload({
    messages: [noId, good],
    statuses: [{ status: 'read', timestamp: '1764000000' }, { id: 'wamid.x', timestamp: '1764000000' }],
  }))
  assert.equal(res.state, 'completed')
  assert.equal(res.messages, 1)
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.F1good'`), 1)
  assert.equal(await count(`select count(*) n from wa_messages where wamid is null and direction = 'inbound'`), 0)
})

await test('QA F2: an attempt that rolls back uncaught still counts; stops at 5', async () => {
  const raw = JSON.stringify(buildPayload({ messages: [inboundText({ id: 'wamid.F2x', from: '919800000022', text: 'z' })] }))
  const ev = await ingest(raw)
  await db.query(`update wa_webhook_events set received_at = now() - interval '2 minutes' where id = $1`, [ev.event_id])
  for (let i = 0; i < 7; i++) {
    const b = (await db.query<any>('select wa_begin_attempt($1) ok', [ev.event_id])).rows[0].ok
    if (!b) break
    // Simulate a statement timeout: processing's transaction is rolled back whole.
    await db.exec('begin')
    await db.query('select wa_process_event($1)', [ev.event_id])
    await db.exec('rollback')
  }
  const row = await one<any>(`select attempts, state from wa_webhook_events where id = $1`, [ev.event_id])
  assert.equal(row.attempts, 5)
  assert.notEqual(row.state, 'completed')
  const ids = (await db.query<{ id: number }>(`select wa_events_to_retry(100) as id`)).rows.map(r => Number(r.id))
  assert.ok(!ids.includes(Number(ev.event_id)))
  assert.equal((await processEv(ev.event_id)).state, 'skipped')
})

await test('QA F2: retry list skips events older than 7 days and puts fewest attempts first', async () => {
  const a = await ingest(JSON.stringify({ object: 'whatsapp_business_account', entry: [], n: 'old' }))
  const b = await ingest(JSON.stringify({ object: 'whatsapp_business_account', entry: [], n: 'tried' }))
  const c = await ingest(JSON.stringify({ object: 'whatsapp_business_account', entry: [], n: 'fresh' }))
  await db.query(`update wa_webhook_events set received_at = now() - interval '8 days' where id = $1`, [a.event_id])
  await db.query(`update wa_webhook_events set received_at = now() - interval '3 days', attempts = 3, state = 'failed' where id = $1`, [b.event_id])
  await db.query(`update wa_webhook_events set received_at = now() - interval '2 minutes' where id = $1`, [c.event_id])
  const ids = (await db.query<{ id: number }>(`select wa_events_to_retry(100) as id`)).rows.map(r => Number(r.id))
  assert.ok(!ids.includes(Number(a.event_id)))
  assert.ok(ids.indexOf(Number(c.event_id)) < ids.indexOf(Number(b.event_id)))
})

await test('QA F3: a BSUID is never read as a phone number', async () => {
  const r = await one<any>(`select wa_digits('IN.13491208655302741918') a, wa_digits('+91 98000-00003') b, wa_digits('12345') c, wa_digits('919800000003') d`)
  assert.equal(r.a, null)
  assert.equal(r.b, '919800000003')
  assert.equal(r.c, null)
  assert.equal(r.d, '919800000003')
  await deliver(buildPayload({ messages: [{ id: 'wamid.F3', from: 'IN.555', from_user_id: 'IN.555', timestamp: '1764000000', type: 'text', text: { body: 'x' } }], contacts: [{ user_id: 'IN.555', profile: { name: 'B' } }] }))
  assert.equal((await one<any>(`select phone_e164 from wa_contacts where bsuid = 'IN.555'`)).phone_e164, null)
})

await test('QA F4: failed without errors shows failed; odd error code does not fail the delivery', async () => {
  const conv = await one<any>(`select id from wa_conversations limit 1`)
  await db.query(`insert into wa_messages (conversation_id, direction, wamid, type, send_state) values ($1, 'outbound', 'wamid.F4a', 'text', 'accepted'), ($1, 'outbound', 'wamid.F4b', 'text', 'accepted')`, [conv.id])
  const r1 = await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.F4a', status: 'failed' })] }))
  const r2 = await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.F4b', status: 'failed', errors: [{ code: 'abc', title: 'odd' }] })] }))
  assert.equal(r1.res.state, 'completed')
  assert.equal(r2.res.state, 'completed')
  assert.equal((await one<any>(`select status from wa_messages where wamid = 'wamid.F4a'`)).status, 'failed')
  const b = await one<any>(`select status, error_code, error_title from wa_messages where wamid = 'wamid.F4b'`)
  assert.equal(b.status, 'failed')
  assert.equal(b.error_code, null)
  assert.equal(b.error_title, 'odd')
})

await test('QA F5: number change to a phone owned by someone else records nothing', async () => {
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.F5a', from: '919800000031', text: 'a' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.F5b', from: '919800000032', text: 'b' })] }))
  const sys = { id: 'wamid.F5s', from: '919800000031', timestamp: '1764000300', type: 'system', system: { type: 'user_changed_number', wa_id: '919800000032' } }
  const f5 = await deliver(buildPayload({ messages: [sys] }))
  assert.equal(f5.res.state, 'completed')
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.F5s'`), 1)
  assert.equal(await count(`select count(*) n from wa_contact_identity_history h join wa_contacts c on c.id = h.contact_id where c.phone_e164 = '+919800000031'`), 0)
  assert.equal(await count(`select count(*) n from wa_contact_identity_history where new_phone_e164 = '+919800000032'`), 0)
})

await test('QA R1: an event aged out of the retry window counts as exhausted', async () => {
  const before = (await one<any>(`select wa_exhausted_count() n`)).n
  const ev = await ingest(JSON.stringify({ object: 'whatsapp_business_account', entry: [], n: 'aged' }))
  await db.query(`update wa_webhook_events set received_at = now() - interval '8 days' where id = $1`, [ev.event_id])
  assert.equal((await one<any>(`select wa_exhausted_count() n`)).n, before + 1)
})

await test('QA F6: retention also clears old failed events', async () => {
  const ev = await ingest(JSON.stringify({ object: 'whatsapp_business_account', entry: [], n: 'old-failed' }))
  await db.query(`update wa_webhook_events set state = 'failed', attempts = 5, received_at = now() - interval '31 days' where id = $1`, [ev.event_id])
  await db.query(`select wa_purge_raw_bodies()`)
  assert.equal((await one<any>(`select raw_body from wa_webhook_events where id = $1`, [ev.event_id])).raw_body, null)
})

await test('end to end: signed POST through handleWebhookPost into the real schema', async () => {
  const { handleWebhookPost } = await import('./ingest')
  const { createHmac } = await import('node:crypto')
  const store = {
    async ingest(sha: string, raw: string) {
      const r = (await db.query<any>('select * from wa_ingest_event($1, $2)', [sha, raw])).rows[0]
      return { eventId: Number(r.event_id), state: r.event_state }
    },
    async process(id: number) { return processEv(id) },
  }
  const raw = Buffer.from(JSON.stringify(buildPayload({ messages: [inboundText({ id: 'wamid.E2E', from: '919800000007', text: 'தமிழ் test' })] })))
  const sig = 'sha256=' + createHmac('sha256', 's3cret').update(raw).digest('hex')
  const quiet = { info() {}, warn() {}, error() {} }
  const r1 = await handleWebhookPost({ raw, declaredLength: raw.length, signature: sig, appSecret: 's3cret', store, log: quiet })
  const r2 = await handleWebhookPost({ raw, declaredLength: raw.length, signature: sig, appSecret: 's3cret', store, log: quiet })
  assert.equal(r1.status, 200)
  assert.equal(r2.status, 200)
  assert.equal((await one<any>(`select body from wa_messages where wamid = 'wamid.E2E'`)).body, 'தமிழ் test')
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.E2E'`), 1)
  const bad = await handleWebhookPost({ raw, declaredLength: raw.length, signature: sig, appSecret: 'wrong', store, log: quiet })
  assert.equal(bad.status, 401)
})

await test('down migration removes everything it added and nothing else', async () => {
  const before = await count(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name not like 'wa\\_%'`)
  await db.exec(readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith('whatsapp_core.down.sql'))!), 'utf8'))
  assert.equal(await count(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name like 'wa\\_%'`), 0)
  assert.equal(await count(`select count(*) n from pg_proc where proname like 'wa\\_%'`), 0)
  assert.equal(await count(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name not like 'wa\\_%'`), before)
})

console.log(`\n${passed} SQL tests passed`)
await db.close()
