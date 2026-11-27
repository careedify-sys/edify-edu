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
import { OPT_OUT_SAMPLES, isOptOutText } from './opt-out'

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
  const r = (await db.query<any>(`select key, value from wa_settings where key like '%\\_enabled' order by key`)).rows
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

// ── Phase 2: inbox migration (20261202120000_whatsapp_inbox.sql) ─────────────

await test('P2: inbox migration is idempotent and seeds verified settings', async () => {
  await db.exec(readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith('whatsapp_inbox.sql'))!), 'utf8'))
  // Phase 3 adds campaign_* keys; this test is about the Phase 2 set.
  const keys = (await db.query<{ key: string }>(`select key from wa_settings where key not like 'campaign\\_%' order by key`)).rows.map(r => r.key)
  assert.deepEqual(keys, ['automation_enabled', 'billing_timezone', 'campaigns_enabled', 'cap_override', 'free_service_allowance', 'last_retention', 'last_sweep', 'monthly_cap_inr', 'rates', 'sending_enabled'])
  const rates = (await one<{ value: any }>(`select value from wa_settings where key = 'rates'`)).value
  assert.equal(rates.service, 0.115)
  assert.equal(rates.marketing, 0.8631)
  assert.equal(rates.effective_from, '2026-10-01')
  assert.equal((await one<{ value: any }>(`select value from wa_settings where key = 'monthly_cap_inr'`)).value, 500)
})

await test('P2: list searches name, username, phone digits and lead name; % is literal', async () => {
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.L1', from: '919800000101', text: 'fees 50% off?', name: 'Kavya Rao' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.L2', fromUserId: 'IN.LISTUSER2', text: 'hi', name: 'Zed', username: 'zed_learns' })] }))
  const lead = await one<{ id: string }>(`insert into leads (name, phone) values ('Meera Lead', '919800000102') returning id`)
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.L3', from: '919800000102', text: 'call me', name: 'M' })] }))
  await db.query(`update wa_contacts set lead_id = $1, lead_link_method = 'manual' where phone_e164 = '+919800000102'`, [lead.id])
  const search = async (s: string) => (await db.query<any>('select * from wa_list_conversations(null, $1, false, null, null, 50)', [s])).rows
  assert.equal((await search('kavya'))[0].profile_name, 'Kavya Rao')
  assert.equal((await search('zed_l'))[0].username, 'zed_learns')
  assert.equal((await search('0000101'))[0].phone_e164, '+919800000101')
  assert.equal((await search('meera'))[0].lead_name, 'Meera Lead')
  assert.equal((await search('%')).length, 0, 'a bare % must not match everything')
  assert.equal((await search('z_d')).length, 0, '_ must not act as a wildcard')
})

await test('P2: unread filter and keyset paging return each row once', async () => {
  const all = (await db.query<any>('select * from wa_list_conversations(null, null, false, null, null, 50)')).rows
  assert.ok(all.length >= 3)
  const seen: string[] = []
  let at: string | null = null, id: string | null = null
  for (;;) {
    const page = (await db.query<any>('select * from wa_list_conversations(null, null, false, $1, $2, 2)', [at, id])).rows
    if (!page.length) break
    for (const r of page) seen.push(r.id)
    const last = page[page.length - 1]
    at = last.last_message_at; id = last.id
  }
  assert.deepEqual(seen, all.map((r: any) => r.id))
  await db.query(`update wa_conversations set unread_count = 0`)
  await db.query(`update wa_conversations set unread_count = 2 where id = $1`, [all[0].id])
  const unread = (await db.query<any>('select * from wa_list_conversations(null, null, true, null, null, 50)')).rows
  assert.deepEqual(unread.map((r: any) => r.id), [all[0].id])
})

await test('P2: lead lookup matches 91-prefixed and bare 10-digit phones only', async () => {
  await db.query(`insert into leads (name, phone) values ('Bare Ten', '9800000199')`)
  const a = (await db.query<any>('select * from wa_leads_by_digits($1)', ['919800000199'])).rows
  assert.deepEqual(a.map((r: any) => r.name), ['Bare Ten'])
  const b = (await db.query<any>('select * from wa_leads_by_digits($1)', ['919800000102'])).rows
  assert.deepEqual(b.map((r: any) => r.name), ['Meera Lead'])
  assert.equal((await db.query<any>('select * from wa_leads_by_digits($1)', ['9800000'])).rows.length, 0)
})

await test('P2: outbound is idempotent on client_ref and a status that arrives first is kept', async () => {
  const conv = (await one<{ id: string }>(`select cv.id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000101'`)).id
  const ref = '00000000-0000-4000-8000-000000000001'
  await db.query(`update wa_settings set value = 'true' where key = 'sending_enabled'`)
  await db.query(`update wa_conversations set last_inbound_at = now() where id = $1`, [conv])
  const first = await one<any>('select * from wa_reserve_outbound($1, $2, $3, $4, $5, $6)', [conv, ref, 'text', 'Fee details below', null, 'owner'])
  const again = await one<any>('select * from wa_reserve_outbound($1, $2, $3, $4, $5, $6)', [conv, ref, 'text', 'Fee details below', null, 'owner'])
  assert.equal(first.blocked, null)
  assert.equal(first.is_new, true)
  assert.equal(again.is_new, false)
  assert.equal(again.message_id, first.message_id)
  // Meta's 'delivered' webhook lands before our own call returns.
  await deliver(buildPayload({ statuses: [statusEvent({ id: 'wamid.P2OUT1', status: 'delivered', recipient: '919800000101',
    pricing: { billable: false, pricing_model: 'PMP', category: 'service', type: 'free_customer_service' } })] }))
  await db.query('select wa_finish_outbound($1, $2, $3, null, null)', [ref, 'wamid.P2OUT1', 'accepted'])
  const m = await one<any>('select status, status_rank, send_state from wa_messages where client_ref = $1', [ref])
  assert.equal(m.status, 'delivered')
  assert.equal(m.send_state, 'accepted')
  assert.equal(await count(`select count(*) n from wa_messages where client_ref = $1`, [ref]), 1)
  const cv = await one<any>('select last_message_preview from wa_conversations where id = $1', [conv])
  assert.equal(cv.last_message_preview, 'Fee details below')
  await assert.rejects(db.query('select wa_finish_outbound($1, null, $2, null, null)', [ref, 'sending']))
})

await test('P2: month usage counts delivered, in flight, failed and Meta billable', async () => {
  const conv = (await one<{ id: string }>(`select cv.id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000101'`)).id
  const mk = async (n: number, state: string, wamid: string | null) => {
    const ref = `00000000-0000-4000-8000-0000000001${String(n).padStart(2, '0')}`
    // Direct insert: this test is about counting, not the send rules.
    await db.query(`insert into wa_messages (conversation_id, direction, client_ref, type, body, sent_by, send_state) values ($1, 'outbound', $2, 'text', 'x', 'owner', 'sending')`, [conv, ref])
    await db.query('select wa_finish_outbound($1, $2, $3, null, null)', [ref, wamid, state])
  }
  const usage = async () => (await one<any>(`select wa_month_usage('Asia/Kolkata') as u`)).u
  const before = await usage()
  await mk(1, 'accepted', 'wamid.P2U1')     // in flight until a status arrives
  await mk(2, 'failed', null)
  await mk(3, 'unknown', null)            // timed out: may or may not have gone
  await mk(4, 'accepted', 'wamid.P2U4')     // delivered below
  await mk(5, 'accepted', 'wamid.P2U5')     // delivered, but last month
  await db.query(`update wa_messages set created_at = now() - interval '40 days' where wamid = 'wamid.P2U5'`)
  await db.query(`update wa_messages set type = 'template' where client_ref = '00000000-0000-4000-8000-000000000102'`)
  for (const w of ['wamid.P2U4', 'wamid.P2U5']) {
    await deliver(buildPayload({ statuses: [statusEvent({ id: w, status: 'delivered', recipient: '919800000101',
      pricing: { billable: true, pricing_model: 'PMP', category: 'service', type: 'regular' } })] }))
  }
  const u = await usage()
  const d = (k: string) => u[k] - before[k]
  assert.equal(d('service_delivered'), 1, 'only this month, P2U4')
  assert.equal(d('service_in_flight'), 2, 'P2U1 accepted + the unknown one')
  assert.equal(d('service_failed'), 0, 'the failed one was turned into a template')
  assert.equal(d('meta_billable'), 2, 'Meta status rows count by when they arrived')
  assert.equal(d('meta_free'), 0)
})

await test('P2: deleting a contact removes its chat, notes and consent but keeps the lead', async () => {
  const c = await one<{ id: string; lead_id: string }>(`select id, lead_id from wa_contacts where phone_e164 = '+919800000102'`)
  const conv = await one<{ id: string }>(`select id from wa_conversations where contact_id = $1`, [c.id])
  await db.query(`insert into wa_notes (conversation_id, actor, body) values ($1, 'owner', 'n')`, [conv.id])
  await db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by) values ($1, 'counselling_call', true, 'whatsapp_message', 'e', 'owner')`, [c.id])
  await db.query(`delete from wa_contacts where id = $1`, [c.id])
  assert.equal(await count(`select count(*) n from wa_conversations where id = $1`, [conv.id]), 0)
  assert.equal(await count(`select count(*) n from wa_messages where conversation_id = $1`, [conv.id]), 0)
  assert.equal(await count(`select count(*) n from wa_notes where conversation_id = $1`, [conv.id]), 0)
  assert.equal(await count(`select count(*) n from wa_consent where contact_id = $1`, [c.id]), 0)
  assert.equal(await count(`select count(*) n from leads where id = $1`, [c.lead_id]), 1)
})

await test('P2: anon and authenticated cannot call inbox functions; new tables have RLS', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    try {
      await assert.rejects(db.query(`select * from wa_list_conversations(null, null, false, null, null, 5)`))
      await assert.rejects(db.query(`select wa_month_usage('Asia/Kolkata')`))
      await assert.rejects(db.query(`select * from wa_leads_by_digits('919800000101')`))
    } finally { await db.exec('reset role') }
  }
  for (const t of ['wa_notes', 'wa_consent', 'wa_audit_log']) {
    const r = await one<{ rls: boolean }>(`select relrowsecurity rls from pg_class where relname = $1`, [t])
    assert.equal(r.rls, true, t)
  }
})

await test('P2: opt-out words match the same way in SQL and in the app', async () => {
  for (const [text, want] of OPT_OUT_SAMPLES) {
    const r = await one<{ v: boolean }>('select wa_is_opt_out($1) as v', [text])
    assert.equal(r.v, want, `SQL: ${JSON.stringify(text)}`)
    assert.equal(isOptOutText(text), want, `JS: ${JSON.stringify(text)}`)
  }
})

const nowTs = () => String(Math.floor(Date.now() / 1000))
const reserve = (conv: string, ref: string, body = 'hello') =>
  one<any>('select * from wa_reserve_outbound($1, $2, $3, $4, $5, $6)', [conv, ref, 'text', body, null, 'owner'])
let refN = 9000
const nextRef = () => `00000000-0000-4000-8000-${String(++refN).padStart(12, '0')}`

await test('P2: reserve blocks when sending is off, the window is closed, or the ref is reused elsewhere; blocked writes nothing', async () => {
  await deliver(buildPayload({ messages: [inboundText({ timestamp: nowTs(), id: 'wamid.Q2R1', from: '919800000201', text: 'Hi, MBA fees?', name: 'Rule One' })] }))
  await deliver(buildPayload({ messages: [inboundText({ timestamp: nowTs(), id: 'wamid.Q2R2', from: '919800000202', text: 'Hello', name: 'Rule Two' })] }))
  const c1 = (await one<{ id: string }>(`select cv.id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000201'`)).id
  const c2 = (await one<{ id: string }>(`select cv.id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000202'`)).id
  const before = await count(`select count(*) n from wa_messages where direction = 'outbound'`)

  await db.query(`update wa_settings set value = 'false' where key = 'sending_enabled'`)
  assert.equal((await reserve(c1, nextRef())).blocked, 'sending_off')
  await db.query(`update wa_settings set value = 'true' where key = 'sending_enabled'`)

  await db.query(`update wa_conversations set last_inbound_at = now() - interval '25 hours' where id = $1`, [c2])
  assert.equal((await reserve(c2, nextRef())).blocked, 'window_closed')
  assert.equal((await reserve('00000000-0000-4000-8000-00000000dead', nextRef())).blocked, 'no_conversation')
  assert.equal(await count(`select count(*) n from wa_messages where direction = 'outbound'`), before, 'blocked sends write no row')

  const ref = nextRef()
  const ok = await reserve(c1, ref)
  assert.equal(ok.blocked, null)
  assert.equal(ok.is_new, true)
  const again = await reserve(c1, ref)
  assert.equal(again.is_new, false)
  assert.equal(again.message_id, ok.message_id)
  assert.equal((await reserve(c2, ref)).blocked, 'bad_ref', 'a key from another conversation is refused')
  await db.query(`select wa_finish_outbound($1, 'wamid.Q2R1OUT', 'accepted', null, null)`, [ref])
})

await test('P2: STOP blocks replies at once, the sweep records a No for replies and calls, and only a new Yes unblocks', async () => {
  const c1 = (await one<{ id: string; contact_id: string }>(`select cv.id, cv.contact_id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000201'`))
  await deliver(buildPayload({ messages: [inboundText({ timestamp: nowTs(), id: 'wamid.Q2R1STOP', from: '919800000201', text: 'STOP', name: 'Rule One' })] }))
  assert.equal((await reserve(c1.id, nextRef())).blocked, 'opted_out', 'blocked before the sweep runs')

  assert.equal((await one<{ n: number }>('select wa_record_opt_outs() as n')).n, 1)
  assert.equal((await one<{ n: number }>('select wa_record_opt_outs() as n')).n, 0, 'second run records nothing new')
  const rows = (await db.query<any>(`select purpose, granted, recorded_by from wa_consent where contact_id = $1 order by purpose`, [c1.contact_id])).rows
  assert.deepEqual(rows.map((r: any) => [r.purpose, r.granted, r.recorded_by]), [['counselling_call', false, 'system'], ['service', false, 'system']])
  assert.equal((await reserve(c1.id, nextRef())).blocked, 'opted_out')

  // A later message that is not an opt-out does not unblock on its own.
  await deliver(buildPayload({ messages: [inboundText({ timestamp: nowTs(), id: 'wamid.Q2R1BACK', from: '919800000201', text: 'Sorry, I do want the fee details', name: 'Rule One' })] }))
  assert.equal((await reserve(c1.id, nextRef())).blocked, 'opted_out')
  // A person records the new Yes with evidence.
  await db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by) values ($1, 'service', true, 'whatsapp_message', 'Asked for fee details again', 'owner')`, [c1.contact_id])
  assert.equal((await reserve(c1.id, nextRef())).blocked, null)
})

await test('P2: the cap allows exactly what fits, then blocks; an override for this month raises it', async () => {
  const c1 = (await one<{ id: string }>(`select cv.id from wa_conversations cv join wa_contacts c on c.id = cv.contact_id where c.phone_e164 = '+919800000201'`)).id
  // Settle every in-flight row so the count is exact.
  await db.query(`update wa_messages set send_state = 'failed' where direction = 'outbound' and send_state = 'sending'`)
  const u = (await one<{ u: any }>(`select wa_month_usage('Asia/Kolkata') as u`)).u
  const sent = u.service_delivered + u.service_in_flight
  assert.ok(u.meta_billable <= sent, 'precondition: our count is not below Meta billable')
  // No free tier; room for exactly 3 more paid replies at Rs 0.115.
  await db.query(`update wa_settings set value = jsonb_set(value, '{per_month}', '0') where key = 'free_service_allowance'`)
  await db.query(`update wa_settings set value = to_jsonb($1::numeric) where key = 'monthly_cap_inr'`, [((sent + 3) * 0.115 + 0.01).toFixed(4)])
  const results = []
  for (let i = 0; i < 5; i++) results.push((await reserve(c1, nextRef())).blocked)
  assert.deepEqual(results, [null, null, null, 'cap_reached', 'cap_reached'])

  await db.query(`update wa_settings set value = jsonb_build_object('month_start', $1::text, 'extra_inr', 0.2, 'by', 'owner', 'at', now()::text) where key = 'cap_override'`, [u.month_start])
  assert.equal((await reserve(c1, nextRef())).blocked, null, 'override adds room for one more')
  assert.equal((await reserve(c1, nextRef())).blocked, 'cap_reached')
  // An override dated to another month does nothing.
  await db.query(`update wa_settings set value = jsonb_set(value, '{month_start}', '"2026-01-01T00:00:00+05:30"') where key = 'cap_override'`)
  assert.equal((await reserve(c1, nextRef())).blocked, 'cap_reached')

  // Missing rate or cap blocks a paid reply instead of guessing.
  await db.query(`update wa_settings set value = value - 'service' where key = 'rates'`)
  assert.equal((await reserve(c1, nextRef())).blocked, 'rate_missing')
  await db.query(`update wa_settings set value = jsonb_set(value, '{service}', '0.115') where key = 'rates'`)
  await db.query(`update wa_settings set value = 'null' where key = 'monthly_cap_inr'`)
  assert.equal((await reserve(c1, nextRef())).blocked, 'cap_missing')

  // Restore the seeded values for later tests.
  await db.query(`update wa_settings set value = '500' where key = 'monthly_cap_inr'`)
  await db.query(`update wa_settings set value = 'null' where key = 'cap_override'`)
  await db.query(`update wa_settings set value = jsonb_set(value, '{per_month}', '1000') where key = 'free_service_allowance'`)
  await db.query(`update wa_messages set send_state = 'failed' where direction = 'outbound' and send_state = 'sending'`)
})

await test('P2: reserve takes the advisory lock before it reads anything', async () => {
  const src = (await one<{ s: string }>(`select prosrc s from pg_proc where proname = 'wa_reserve_outbound'`)).s
  const lock = src.indexOf('pg_advisory_xact_lock')
  assert.ok(lock > 0, 'lock present')
  assert.ok(lock < src.indexOf('from wa_messages') && lock < src.indexOf('from wa_settings'), 'lock comes first')
})

await test('P2: retention deletes 24-month-old data and inactive contacts, keeps recent data, runs once a day', async () => {
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.OLD1', from: '919800000301', text: 'old chat', name: 'Old Student' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.MIX1', from: '919800000302', text: 'recent chat', name: 'Active Student' })] }))
  const old = await one<{ id: string; cv: string }>(`select c.id, cv.id cv from wa_contacts c join wa_conversations cv on cv.contact_id = c.id where c.phone_e164 = '+919800000301'`)
  const act = await one<{ id: string; cv: string }>(`select c.id, cv.id cv from wa_contacts c join wa_conversations cv on cv.contact_id = c.id where c.phone_e164 = '+919800000302'`)
  const ago = `now() - interval '25 months'`
  await db.query(`update wa_contacts set created_at = ${ago} where id in ($1, $2)`, [old.id, act.id])
  await db.query(`update wa_conversations set created_at = ${ago}, last_message_at = ${ago}, last_inbound_at = ${ago} where id = $1`, [old.cv])
  await db.query(`update wa_messages set created_at = ${ago} where wamid = 'wamid.OLD1'`)
  // The active contact has one old message and one new one.
  await db.query(`insert into wa_messages (conversation_id, direction, wamid, type, body, created_at) values ($1, 'inbound', 'wamid.MIX0', 'text', 'very old', ${ago})`, [act.cv])
  await db.query(`insert into wa_notes (conversation_id, actor, body, created_at) values ($1, 'owner', 'old note', ${ago}), ($1, 'owner', 'new note', now())`, [act.cv])
  await db.query(`insert into wa_audit_log (actor, action, created_at) values ('owner', 'old', ${ago})`)
  await db.query(`update wa_settings set value = 'null' where key = 'last_retention'`)

  const r = (await one<{ r: any }>('select wa_apply_retention() as r')).r
  assert.ok(r && r.at, 'ran')
  assert.equal(await count(`select count(*) n from wa_contacts where id = $1`, [old.id]), 0, 'inactive contact deleted')
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.OLD1'`), 0)
  assert.equal(await count(`select count(*) n from wa_contacts where id = $1`, [act.id]), 1, 'active contact kept')
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.MIX0'`), 0, 'old message in an active chat deleted')
  assert.equal(await count(`select count(*) n from wa_messages where wamid = 'wamid.MIX1'`), 1, 'recent message kept')
  assert.deepEqual((await db.query<any>(`select body from wa_notes where conversation_id = $1`, [act.cv])).rows.map((x: any) => x.body), ['new note'])
  assert.equal(await count(`select count(*) n from wa_audit_log where action = 'old'`), 0)
  assert.equal((await one<{ r: any }>('select wa_apply_retention() as r')).r, null, 'not due again within 20 hours')
  const lr = (await one<{ value: any }>(`select value from wa_settings where key = 'last_retention'`)).value
  assert.equal(lr.contacts >= 1, true)
})

await test('P2: anon and authenticated cannot call the send, opt-out or retention functions', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    try {
      await assert.rejects(db.query(`select * from wa_reserve_outbound(null, null, 'text', 'x', null, 'x')`))
      await assert.rejects(db.query(`select wa_record_opt_outs()`))
      await assert.rejects(db.query(`select wa_apply_retention()`))
    } finally { await db.exec('reset role') }
  }
})

await test('QA R1: CRM blocks calls and messages from WhatsApp consent; enquiry-form leads are untouched', async () => {
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.CB1', from: '919800000401', text: 'hi', name: 'Form Lead' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.CB2', from: '919800000402', text: 'hi', name: 'Wa Lead' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.CB3', from: '919800000403', text: 'STOP', name: 'Stop Lead' })] }))
  const lead = async (name: string, phone: string, source: string | null) =>
    (await one<{ id: string }>(`insert into leads (name, phone, source) values ($1, $2, $3) returning id`, [name, phone, source])).id
  const form = await lead('Form Lead', '919800000401', 'website')
  const wa = await lead('Wa Lead', '919800000402', 'whatsapp')
  const stop = await lead('Stop Lead', '919800000403', 'website')
  const plain = await lead('Plain Lead', '919800000404', 'website')
  const orphan = await lead('Orphan Wa Lead', '919800000405', 'whatsapp')
  for (const [ph, id] of [['+919800000401', form], ['+919800000402', wa], ['+919800000403', stop]] as const) {
    await db.query(`update wa_contacts set lead_id = $1, lead_link_method = 'manual' where phone_e164 = $2`, [id, ph])
  }
  const blocks = async () => Object.fromEntries((await db.query<any>('select * from wa_crm_contact_blocks()')).rows.map((r: any) => [r.lead_id, [r.no_call, r.no_message]]))
  let b = await blocks()
  assert.equal(b[form], undefined, 'enquiry-form lead linked to a chat: no block')
  assert.deepEqual(b[wa], [true, false], 'created from WhatsApp, no call Yes')
  assert.deepEqual(b[stop], [true, true], 'STOP blocks calls and messages')
  assert.equal(b[plain], undefined, 'unlinked enquiry lead: no block')
  assert.deepEqual(b[orphan], [true, false], 'WhatsApp lead with no contact link: no call Yes on record')
  const waContact = (await one<{ id: string }>(`select id from wa_contacts where phone_e164 = '+919800000402'`)).id
  await db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by) values ($1, 'counselling_call', true, 'whatsapp_message', 'Asked for a call', 'owner')`, [waContact])
  const formContact = (await one<{ id: string }>(`select id from wa_contacts where phone_e164 = '+919800000401'`)).id
  await db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by) values ($1, 'counselling_call', false, 'phone_call', 'Said no calls', 'owner')`, [formContact])
  b = await blocks()
  assert.equal(b[wa], undefined, 'a recorded call Yes clears it')
  assert.deepEqual(b[form], [true, false], 'a recorded call No blocks even an enquiry-form lead')
  await db.exec('set role anon')
  try { await assert.rejects(db.query('select * from wa_crm_contact_blocks()')) } finally { await db.exec('reset role') }
})

await test('down migration removes everything it added and nothing else', async () => {
  const before = await count(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name not like 'wa\\_%'`)
  // Real rollback order: newest first, because each phase references the one before.
  await db.exec(readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith('whatsapp_campaigns.down.sql'))!), 'utf8'))
  assert.equal(await count(`select count(*) n from wa_settings where key like 'campaign\\_%'`), 0, 'Phase 3 settings removed')
  await db.exec(readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith('whatsapp_inbox.down.sql'))!), 'utf8'))
  assert.equal(await count(`select count(*) n from wa_settings`), 3, 'Phase 1 settings stay')
  await db.exec(readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith('whatsapp_core.down.sql'))!), 'utf8'))
  assert.equal(await count(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name like 'wa\\_%'`), 0)
  assert.equal(await count(`select count(*) n from pg_proc where proname like 'wa\\_%'`), 0)
  assert.equal(await count(`select count(*) n from information_schema.tables where table_schema = 'public' and table_name not like 'wa\\_%'`), before)
})

console.log(`\n${passed} SQL tests passed`)
await db.close()
