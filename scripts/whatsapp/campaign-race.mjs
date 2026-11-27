// Real-Postgres race test for wa_campaign_claim: the shared daily campaign
// budget under concurrent sweep runs and two campaigns at once.
//
// Same setup as cap-race.mjs: copy this file into an empty folder OUTSIDE
// the repo, then in that folder run:
//   npm init -y && npm i embedded-postgres pg@8 && node campaign-race.mjs <repo-root>
// The database lives in a new folder under the OS temp directory.
//
// Two approved campaigns, 20 consented recipients each, a daily budget that
// covers exactly 5 messages in total. 20 connections claim at once, 10 per
// campaign. Exactly 5 may be reserved. Detector proof: the same race against
// a copy with the advisory lock and the row lock removed must overspend.
// (Last run 27 Nov 2026: locked 5 of 20 reserved; unlocked copy 6.)
import EmbeddedPostgres from 'embedded-postgres'
import pg from 'pg'
import { readFileSync, readdirSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const repo = process.argv[2]
if (!repo) { console.error('usage: node campaign-race.mjs <repo-root>'); process.exit(2) }
const dir = join(mkdtempSync(join(tmpdir(), 'wa-campaign-race-')), 'pgdata')
const server = new EmbeddedPostgres({ databaseDir: dir, user: 'postgres', password: 'pw', port: 54331, persistent: false, initdbFlags: ['--encoding=UTF8', '--locale=C'] })
await server.initialise()
await server.start()
const conn = { host: 'localhost', port: 54331, user: 'postgres', password: 'pw', database: 'postgres' }
const admin = new pg.Client(conn); await admin.connect()
let failed = false
try {
  await admin.query('create role anon; create role authenticated; create role service_role; create extension if not exists pgcrypto;')
  const migDir = join(repo, 'supabase', 'migrations')
  for (const f of readdirSync(migDir).filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql')).sort()) {
    await admin.query(readFileSync(join(migDir, f), 'utf8'))
  }
  await admin.query(`update wa_settings set value = 'true' where key = 'campaigns_enabled'`)
  // Unit cost 0.8631 x 1.18 = 1.0185: 5.10 covers exactly 5 messages a day.
  await admin.query(`update wa_settings set value = '5.10' where key = 'campaign_budget_daily_inr'`)
  await admin.query(`update wa_settings set value = '5000' where key = 'campaign_budget_monthly_inr'`)
  const tpl = (await admin.query(`insert into wa_templates (name, language, category, status, components)
    values ('referral_invite', 'en', 'MARKETING', 'APPROVED', '[{"type":"BODY","text":"Refer a friend"}]') returning id`)).rows[0].id

  async function makeCampaigns() {
    await admin.query('delete from wa_campaign_recipients; delete from wa_campaigns;')
    const ids = []
    for (const k of [0, 1]) {
      const c = (await admin.query(`insert into wa_campaigns (name, template_id, budget_inr, batch_size, created_by)
        values ($1, $2, 1000, 1, 'owner') returning id`, ['Race ' + k, tpl])).rows[0].id
      const nums = Array.from({ length: 20 }, (_, i) => '+91980' + String(k * 100 + i).padStart(7, '0'))
      await admin.query(`select wa_import_numbers($1, null, 'paste', 'owner')`, [nums])
      await admin.query(`insert into wa_consent (contact_id, purpose, granted, source, recorded_by)
        select id, 'marketing', true, 'admin_entry', 'owner' from wa_contacts where phone_e164 = any($1)`, [nums])
      await admin.query(`select wa_campaign_add_recipients($1, (select array_agg(id) from wa_contacts where phone_e164 = any($2)), null, null)`, [c, nums])
      const p = (await admin.query('select wa_campaign_preview($1) p', [c])).rows[0].p
      const r = (await admin.query('select wa_campaign_approve($1, $2, $3, $4) r', [c, 'owner', p.eligible, p.template_id])).rows[0].r
      if (r !== null) throw new Error('approve failed: ' + r)
      ids.push(c)
    }
    return ids
  }

  // Unlocked copy for the detector proof.
  const src = readFileSync(join(migDir, '20261203120000_whatsapp_campaigns.sql'), 'utf8')
  const start = src.indexOf('create or replace function wa_campaign_claim(')
  const fn = src.slice(start, src.indexOf('end $$;', start) + 7)
  const unlocked = fn.replace('wa_campaign_claim(', 'wa_campaign_claim_unlocked(')
    .replace("perform pg_advisory_xact_lock(hashtext('wa_campaign_claim'));", '')
    .replace('from wa_campaigns where id = p_campaign for update;', 'from wa_campaigns where id = p_campaign;')
    .replace('  v_room := least(', '  perform pg_sleep(0.3);\n  v_room := least(')
  if (unlocked === fn || !unlocked.includes('pg_sleep') || unlocked.includes('pg_advisory_xact_lock')) throw new Error('could not build the unlocked copy')
  await admin.query(unlocked)

  const race = async (fnName) => {
    const [a, b] = await makeCampaigns()
    const clients = await Promise.all(Array.from({ length: 20 }, async () => { const c = new pg.Client(conn); await c.connect(); return c }))
    const res = await Promise.all(clients.map((c, i) => c.query(`select * from ${fnName}($1, 1, 'P')`, [i % 2 ? a : b]).then(r => r.rows)))
    await Promise.all(clients.map(c => c.end()))
    const reserved = Number((await admin.query(`select count(*) n from wa_campaign_recipients where state = 'sending'`)).rows[0].n)
    const messages = Number((await admin.query(`select count(*) n from wa_messages where type = 'template'`)).rows[0].n)
    await admin.query(`delete from wa_messages where type = 'template'`)
    return { claimed: res.flat().filter(r => r.blocked === null).length, reserved, messages }
  }

  const locked = await race('wa_campaign_claim')
  console.log('locked   :', JSON.stringify(locked))
  const bare = await race('wa_campaign_claim_unlocked')
  console.log('unlocked :', JSON.stringify(bare))
  if (locked.claimed !== 5 || locked.reserved !== 5 || locked.messages !== 5) { failed = true; console.log('FAIL: the locked claim let the wrong number through') }
  if (bare.reserved <= 5) { failed = true; console.log('FAIL: the detector did not catch the unlocked race, so the test proves nothing') }
  if (!failed) console.log('PASS: 20 concurrent claims over 2 campaigns, exactly 5 reserved against a 5-message daily budget; without the locks', bare.reserved, 'got through')
} finally {
  await admin.end()
  await server.stop()
}
process.exit(failed ? 1 : 0)
