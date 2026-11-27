// Real-Postgres race test for wa_reserve_outbound (the ₹500 cap under
// concurrent sends).
//
// Needs embedded-postgres and pg, which the repo does not install. Copy this
// file into an empty folder OUTSIDE the repo, then in that folder run:
//   npm init -y && npm i embedded-postgres pg@8 && node cap-race.mjs <repo-root>
// The database lives in a new folder under the OS temp directory; nothing in
// the current folder or the repo is created or deleted.
// (Last run 27 Nov 2026: locked 3 of 20 reserved; unlocked copy 20 of 20.)
//
// Applies every migration, opens 20 separate connections and fires 20
// reservations at once with room in the cap for exactly 3.
// Detector proof: the same race against a copy of the function with the
// lock removed (and a sleep to widen the window) must overspend.
import EmbeddedPostgres from 'embedded-postgres'
import pg from 'pg'
import { readFileSync, readdirSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const repo = process.argv[2]
if (!repo) { console.error('usage: node cap-race.mjs <repo-root>'); process.exit(2) }
// A fresh, empty temp folder; persistent: false makes the server remove it on stop.
const dir = join(mkdtempSync(join(tmpdir(), 'wa-cap-race-')), 'pgdata')
const server = new EmbeddedPostgres({ databaseDir: dir, user: 'postgres', password: 'pw', port: 54329, persistent: false, initdbFlags: ['--encoding=UTF8', '--locale=C'] })
await server.initialise()
await server.start()
const conn = { host: 'localhost', port: 54329, user: 'postgres', password: 'pw', database: 'postgres' }
const admin = new pg.Client(conn); await admin.connect()
let failed = false
try {
  await admin.query('create role anon; create role authenticated; create role service_role; create extension if not exists pgcrypto;')
  const migDir = join(repo, 'supabase', 'migrations')
  for (const f of readdirSync(migDir).filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql')).sort()) {
    await admin.query(readFileSync(join(migDir, f), 'utf8'))
  }
  const ct = (await admin.query(`insert into wa_contacts (phone_e164) values ('+919800000999') returning id`)).rows[0].id
  const conv = (await admin.query(`insert into wa_conversations (contact_id, phone_number_id, last_inbound_at) values ($1, 'P', now()) returning id`, [ct])).rows[0].id
  await admin.query(`update wa_settings set value = 'true' where key = 'sending_enabled'`)
  await admin.query(`update wa_settings set value = jsonb_set(value, '{per_month}', '0') where key = 'free_service_allowance'`)
  await admin.query(`update wa_settings set value = '0.35' where key = 'monthly_cap_inr'`) // 3 x 0.115 = 0.345 fits, 4 does not

  // Unlocked copy for the detector proof.
  const src = readFileSync(join(migDir, '20261202120000_whatsapp_inbox.sql'), 'utf8')
  const fn = src.slice(src.indexOf('create or replace function wa_reserve_outbound('), src.indexOf('end $$;', src.indexOf('create or replace function wa_reserve_outbound(')) + 7)
  const unlocked = fn.replace('wa_reserve_outbound(', 'wa_reserve_unlocked(')
    .replace("perform pg_advisory_xact_lock(hashtext('wa_reserve_outbound'));", '')
    .replace("  v_sent := (v_u->>'service_delivered')", "  perform pg_sleep(0.3);\n  v_sent := (v_u->>'service_delivered')")
  if (unlocked === fn || !unlocked.includes('pg_sleep')) throw new Error('could not build the unlocked copy')
  await admin.query(unlocked)

  const race = async (fnName) => {
    await admin.query(`delete from wa_messages where conversation_id = $1`, [conv])
    const clients = await Promise.all(Array.from({ length: 20 }, async () => { const c = new pg.Client(conn); await c.connect(); return c }))
    const res = await Promise.all(clients.map((c, i) => c.query(
      `select * from ${fnName}($1, gen_random_uuid(), 'text', $2, null, 'owner')`, [conv, `reply ${i}`]).then(r => r.rows[0].blocked)))
    await Promise.all(clients.map(c => c.end()))
    const rows = Number((await admin.query(`select count(*) n from wa_messages where conversation_id = $1`, [conv])).rows[0].n)
    return { ok: res.filter(b => b === null).length, capped: res.filter(b => b === 'cap_reached').length, rows }
  }

  const locked = await race('wa_reserve_outbound')
  console.log('locked   :', JSON.stringify(locked))
  const bare = await race('wa_reserve_unlocked')
  console.log('unlocked :', JSON.stringify(bare))
  if (locked.ok !== 3 || locked.capped !== 17 || locked.rows !== 3) { failed = true; console.log('FAIL: the locked function let the wrong number through') }
  if (bare.ok <= 3) { failed = true; console.log('FAIL: the detector did not catch the unlocked race, so the test proves nothing') }
  if (!failed) console.log('PASS: 20 concurrent sends, exactly 3 reserved (Rs 0.345 of a Rs 0.35 cap); without the lock', bare.ok, 'got through')
} finally {
  await admin.end()
  await server.stop()
}
process.exit(failed ? 1 : 0)
