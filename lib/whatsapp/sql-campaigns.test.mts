// SQL tests for supabase/migrations/20261203120000_whatsapp_campaigns.sql on
// PGlite. Never touches Supabase, never calls Meta. Fake numbers only.
// Run: PGLITE_MODULE=file:///<dir>/node_modules/@electric-sql/pglite/dist/index.js npx tsx lib/whatsapp/sql-campaigns.test.mts
// PGlite is single-connection: the claim lock under real concurrency is
// covered by scripts/whatsapp/campaign-race.mjs on real Postgres.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { buildPayload, inboundText, statusEvent } from './test-fixtures'

const modPath = process.env.PGLITE_MODULE
if (!modPath) { console.error('Set PGLITE_MODULE (see sql.test.mts).'); process.exit(2) }
const { PGlite } = await import(modPath)
const db = new PGlite()
const MIG_DIR = join(process.cwd(), 'supabase', 'migrations')
const migFile = (suffix: string) => readFileSync(join(MIG_DIR, readdirSync(MIG_DIR).find(f => f.endsWith(suffix))!), 'utf8')

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}
async function one<T = any>(sql: string, params: unknown[] = []): Promise<T> { return (await db.query<T>(sql, params)).rows[0] }
async function all<T = any>(sql: string, params: unknown[] = []): Promise<T[]> { return (await db.query<T>(sql, params)).rows }
async function num(sql: string, params: unknown[] = []): Promise<number> { return Number(Object.values((await one(sql, params)) as object)[0]) }
const sha = (s: string) => createHash('sha256').update(s).digest('hex')
async function deliver(payload: unknown) {
  const raw = JSON.stringify(payload)
  const ev = await one<{ event_id: number }>('select * from wa_ingest_event($1, $2)', [sha(raw), raw])
  await db.query('select wa_begin_attempt($1)', [ev.event_id])
  return (await one<{ r: any }>('select wa_process_event($1) as r', [ev.event_id])).r
}
function button(o: { id: string; from: string; text: string; context?: string }) {
  const m: any = inboundText({ id: o.id, from: o.from, text: 'x' })
  delete m.text; m.type = 'button'; m.button = { text: o.text, payload: o.text }
  if (o.context) m.context = { id: o.context, from: '910000000000' }
  return m
}
function reply(o: { id: string; from: string; text: string; context?: string }) {
  const m: any = inboundText({ id: o.id, from: o.from, text: o.text })
  if (o.context) m.context = { id: o.context, from: '910000000000' }
  return m
}

await db.exec(`create role anon; create role authenticated; create role service_role;`)
for (const f of readdirSync(MIG_DIR).filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql')).sort()) {
  try { await db.exec(readFileSync(join(MIG_DIR, f), 'utf8')) } catch (e) { throw new Error(`migration ${f}: ${(e as Error).message}`) }
}

const P = (n: number) => '+9198000' + String(n).padStart(5, '0')     // +919800000001 ...
const consent = (phone: string, granted: boolean, at = 'now()') =>
  db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by, obtained_on, recorded_at)
            select id, 'marketing', $2, 'enrolment_record', 'test evidence', 'owner', current_date, ${at} from wa_contacts where phone_e164 = $1`, [phone, granted])
const contactId = async (phone: string) => (await one<{ id: string }>('select id from wa_contacts where phone_e164 = $1', [phone])).id

async function setSettings(o: Record<string, unknown>) {
  for (const [k, v] of Object.entries(o)) {
    await db.query(`insert into wa_settings (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value`, [k, JSON.stringify(v)])
  }
}
async function approvedTemplate(name = 'referral_invite') {
  return (await one<{ id: string }>(`insert into wa_templates (meta_id, name, language, category, status, components)
    values ($1, $2, 'en', 'MARKETING', 'APPROVED', $3::jsonb) on conflict (name, language) do update set status = 'APPROVED' returning id`,
    ['meta_' + name, name, JSON.stringify([{ type: 'BODY', text: 'Hi, refer a friend to edifyedu.in. Reply STOP to opt out.' }, { type: 'FOOTER', text: 'Team edifyedu.in' }])])).id
}
async function campaign(o: { tpl: string; budget?: number | null; batch?: number; dailyMax?: number; name?: string }) {
  return (await one<{ id: string }>(`insert into wa_campaigns (name, template_id, budget_inr, batch_size, daily_max, created_by)
    values ($1, $2, $3, $4, $5, 'owner') returning id`, [o.name ?? 'Test', o.tpl, o.budget ?? 100, o.batch ?? 50, o.dailyMax ?? 250])).id
}
async function approve(c: string) {
  const p = (await one<{ p: any }>('select wa_campaign_preview($1) as p', [c])).p
  return (await one<{ r: string | null }>('select wa_campaign_approve($1, $2, $3, $4) as r', [c, 'owner', p.eligible, p.template_id])).r
}
const claim = (c: string, n = 50) => all<{ recipient_id: number; client_ref: string; phone: string; blocked: string | null }>(
  `select * from wa_campaign_claim($1, $2, 'TEST_PNID')`, [c, n])
const finish = (ref: string, state: string, wamid: string | null = null, code: number | null = null) =>
  db.query('select wa_campaign_finish($1, $2, $3, $4, $5)', [ref, wamid, state, code, code ? 'err' : null])
const resetSpend = async () => { await db.exec(`delete from wa_campaign_recipients; delete from wa_campaigns;`) }

// ── Migration ───────────────────────────────────────────────────────────────
await test('migration runs twice, seeds budget settings as unset, keeps campaigns off', async () => {
  await db.exec(migFile('whatsapp_campaigns.sql'))
  const s = Object.fromEntries((await all<{ key: string; value: any }>(`select key, value from wa_settings where key like 'campaign%'`)).map(r => [r.key, r.value]))
  assert.deepEqual(s, { campaign_budget_daily_inr: 250, campaign_budget_monthly_inr: 2000, campaign_default_batch: 50, campaign_tax_pct: 18, campaign_daily_max: 250, campaigns_enabled: false })
  for (const t of ['wa_lists', 'wa_list_members', 'wa_templates', 'wa_campaigns', 'wa_campaign_recipients']) {
    assert.equal((await one<{ r: boolean }>(`select relrowsecurity r from pg_class where relname = $1`, [t])).r, true, t + ' RLS')
  }
})

await test('anon and authenticated cannot call campaign functions; service_role can', async () => {
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`)
    try {
      await assert.rejects(db.query(`select * from wa_numbers_status(array['+919800000001'])`))
      await assert.rejects(db.query(`select * from wa_campaign_claim(gen_random_uuid(), 1, 'x')`))
      await assert.rejects(db.query(`select * from wa_lists`))
    } finally { await db.exec('reset role') }
  }
  // Supabase grants service_role every table through default privileges;
  // a bare Postgres does not, so mirror that here.
  await db.exec('grant all on all tables in schema public to service_role')
  await db.exec('set role service_role')
  try { await db.query(`select * from wa_numbers_status(array['+919800000001'])`) } finally { await db.exec('reset role') }
})

// ── Import ──────────────────────────────────────────────────────────────────
await test('preview creates nothing; import adds contacts and list members once', async () => {
  const nums = [P(1), P(2), P(3), P(1), 'garbage', '+15550001111', '+919800012']
  const st = await all('select * from wa_numbers_status($1)', [nums])
  assert.equal(st.length, 3)
  assert.ok(st.every((r: any) => r.contact_id === null && r.marketing === 'unknown'))
  assert.equal(await num(`select count(*) from wa_contacts where phone_source = 'import'`), 0, 'preview is read-only')

  const list = (await one<{ id: string }>(`insert into wa_lists (name, created_by) values ('Enrolled Students', 'owner') returning id`)).id
  const r1 = (await one<{ r: any }>('select wa_import_numbers($1, $2, $3, $4) as r', [nums, list, 'paste', 'owner'])).r
  assert.deepEqual([r1.valid, r1.new_contacts, r1.added_to_list, r1.already_in_list], [3, 3, 3, 0])
  const r2 = (await one<{ r: any }>('select wa_import_numbers($1, $2, $3, $4) as r', [[P(3), P(4)], list, 'file', 'owner'])).r
  assert.deepEqual([r2.valid, r2.new_contacts, r2.added_to_list, r2.already_in_list], [2, 1, 1, 1])
  assert.equal(await num('select count(*) from wa_list_members where list_id = $1', [list]), 4)
  await assert.rejects(db.query(`insert into wa_lists (name, created_by) values ('  enrolled students ', 'owner')`), 'list names are unique ignoring case and spaces')
  await assert.rejects(db.query('select wa_import_numbers($1, $2, $3, $4)', [[P(5)], '00000000-0000-0000-0000-000000000000', 'paste', 'owner']), /no_list/)
  // An existing inbox contact is matched, not duplicated.
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.C1', from: '919800000005', text: 'hello' })] }))
  const st2 = await one('select * from wa_numbers_status($1)', [[P(5)]])
  assert.ok(st2.contact_id)
  const r3 = (await one<{ r: any }>('select wa_import_numbers($1, null, $2, $3) as r', [[P(5)], 'paste', 'owner'])).r
  assert.equal(r3.new_contacts, 0)
})

// ── Eligibility ─────────────────────────────────────────────────────────────
await test('unknown consent is not consent; No and opt-outs exclude; a later STOP beats a Yes', async () => {
  const why = async (p: string) => (await one<{ w: string | null }>('select wa_campaign_ineligible($1) w', [await contactId(p)])).w
  assert.equal(await why(P(1)), 'no_consent')
  await consent(P(1), true)
  assert.equal(await why(P(1)), null)
  await consent(P(2), false)
  assert.equal(await why(P(2)), 'marketing_no')
  await consent(P(5), true, `now() - interval '1 hour'`)
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.C2', from: '919800000005', text: 'STOP' })] }))
  assert.equal(await why(P(5)), 'opted_out', 'STOP after the Yes, before the sweep runs')
  assert.equal((await one('select * from wa_numbers_status($1)', [[P(5)]])).opted_out, true)
  // The sweep records it; the history then shows a No.
  assert.equal(await num('select wa_record_marketing_opt_outs()'), 1)
  assert.equal(await num('select wa_record_marketing_opt_outs()'), 0, 'recorded once')
  assert.equal(await num(`select count(*) from wa_consent where contact_id = $1 and purpose = 'marketing' and not granted and recorded_by = 'system'`, [await contactId(P(5))]), 1)
})

await test('"Stop promotions" button opts out of marketing only', async () => {
  await consent(P(3), true, `now() - interval '1 hour'`)
  await deliver(buildPayload({ messages: [button({ id: 'wamid.B1', from: '919800000003', text: 'Stop promotions' })] }))
  assert.equal((await one('select wa_campaign_ineligible($1) w', [await contactId(P(3))])).w, 'opted_out')
  assert.equal((await one('select wa_contact_opted_out($1) o', [await contactId(P(3))])).o, false, 'replies to their questions still allowed')
  // Control: an ordinary button press is not an opt-out.
  await consent(P(4), true, `now() - interval '1 hour'`)
  await deliver(buildPayload({ messages: [button({ id: 'wamid.B2', from: '919800000004', text: 'REFER' })] }))
  assert.equal((await one('select wa_campaign_ineligible($1) w', [await contactId(P(4))])).w, null)
})

// ── Approval ────────────────────────────────────────────────────────────────
await test('approval: needs an APPROVED template, eligible people, an up-to-date screen and a budget that covers the cost', async () => {
  const tpl = await approvedTemplate()
  const pending = (await one<{ id: string }>(`insert into wa_templates (name, language, category, status, components) values ('pending_one', 'en', 'MARKETING', 'PENDING', '[]') returning id`)).id
  const list = (await one<{ id: string }>(`select id from wa_lists limit 1`)).id
  const c1 = await campaign({ tpl: pending })
  await db.query('select wa_campaign_add_recipients($1, null, $2, null)', [c1, list])
  assert.equal(await approve(c1), 'template_not_approved')

  const c2 = await campaign({ tpl, budget: 0.5 })
  assert.equal(await num('select wa_campaign_add_recipients($1, null, $2, null)', [c2, list]), 4)
  const p = (await one<{ p: any }>('select wa_campaign_preview($1) p', [c2])).p
  assert.equal(p.recipients_queued, 4); assert.equal(p.eligible, 2)            // P1 yes, P4 yes; P2 No, P3 stop promotions
  assert.deepEqual(p.excluded, { marketing_no: 1, opted_out: 1 })
  assert.equal(p.cost_before_tax, 1.73); assert.equal(p.cost_with_tax, 2.04)   // 2 x 0.8631, +18%
  assert.match(p.preview, /refer a friend/); assert.match(p.preview, /Team edifyedu\.in/)
  assert.equal(await approve(c2), 'over_budget')
  assert.equal((await one<{ r: string }>('select wa_campaign_approve($1, $2, $3, $4) r', [c2, 'owner', 3, tpl])).r, 'preview_changed')
  await db.query('update wa_campaigns set budget_inr = 10 where id = $1', [c2])
  assert.equal(await approve(c2), null)
  const c = await one('select status, approval, approved_by from wa_campaigns where id = $1', [c2])
  assert.equal(c.status, 'approved'); assert.equal(c.approval.eligible, 2); assert.equal(c.approved_by, 'owner')

  // Locked after approval: no template, budget or recipient changes.
  await assert.rejects(db.query('update wa_campaigns set budget_inr = 99 where id = $1', [c2]), /campaign_locked/)
  await assert.rejects(db.query('select wa_campaign_add_recipients($1, $2, null, null)', [c2, [await contactId(P(5))]]), /campaign_locked/)
  // Back to draft clears the approval; then edits are allowed again.
  assert.equal((await one('select wa_campaign_control($1, $2) r', [c2, 'unapprove'])).r, null)
  const d = await one('select status, approval from wa_campaigns where id = $1', [c2])
  assert.equal(d.status, 'draft'); assert.equal(d.approval, null)
  await db.query('update wa_campaigns set budget_inr = 9 where id = $1', [c2])
  await resetSpend()
})

// ── Sending ─────────────────────────────────────────────────────────────────
async function readyCampaign(o: { budget?: number; batch?: number; dailyMax?: number } = {}) {
  const tpl = await approvedTemplate()
  const list = (await one<{ id: string }>(`select id from wa_lists limit 1`)).id
  const c = await campaign({ tpl, ...o })
  await db.query('select wa_campaign_add_recipients($1, null, $2, null)', [c, list])
  assert.equal(await approve(c), null)
  return c
}

await test('nothing sends while campaigns are off or budgets are unset', async () => {
  const c = await readyCampaign()
  assert.equal((await claim(c))[0].blocked, 'campaigns_off')
  await setSettings({ campaigns_enabled: true, campaign_budget_daily_inr: null })
  assert.equal((await claim(c))[0].blocked, 'budget_missing')
  assert.equal(await num(`select count(*) from wa_messages where type = 'template'`), 0)
  await setSettings({ campaign_budget_daily_inr: 1000, campaign_budget_monthly_inr: 5000 })
  await resetSpend()
})

await test('claim: skips the ineligible with a reason, creates template rows, hides them from the inbox', async () => {
  const c = await readyCampaign()
  const rows = await claim(c)
  assert.deepEqual(rows.map(r => r.phone).sort(), [P(1), P(4)])
  assert.ok(rows.every(r => r.blocked === null))
  const skipped = await all(`select r.skip_reason, ct.phone_e164 from wa_campaign_recipients r join wa_contacts ct on ct.id = r.contact_id where r.campaign_id = $1 and r.state = 'skipped' order by 2`, [c])
  assert.deepEqual(skipped.map((s: any) => s.skip_reason), ['marketing_no', 'opted_out'])
  const msgs = await all(`select type, send_state, sent_by, body from wa_messages where client_ref = any($1)`, [rows.map(r => r.client_ref)])
  assert.ok(msgs.every((m: any) => m.type === 'template' && m.send_state === 'sending' && m.sent_by === 'campaign:' + c && /refer a friend/.test(m.body)))
  assert.equal((await one('select status from wa_campaigns where id = $1', [c])).status, 'sending')
  // P1 never wrote to us: their conversation exists but stays out of the inbox list.
  const listed = (await all(`select phone_e164 from wa_list_conversations(null, null, false, null, null, 50)`)).map((r: any) => r.phone_e164)
  assert.ok(!listed.includes(P(1)), 'campaign-only conversation hidden')
  assert.ok(listed.includes(P(5)), 'real chats still listed (control)')

  // Meta accepts one, rejects one with 131049 (per-user limit): no pause.
  await finish(rows[0].client_ref, 'accepted', 'wamid.CAMP1')
  await finish(rows[1].client_ref, 'failed', null, 131049)
  assert.equal((await one('select status from wa_campaigns where id = $1', [c])).status, 'sending')
  assert.equal((await claim(c))[0].blocked, 'completed')
  assert.equal((await one('select status from wa_campaigns where id = $1', [c])).status, 'completed')
})

await test('eligibility is checked again at send time: STOP after approval skips the number', async () => {
  await resetSpend()
  const c = await readyCampaign()
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.S9', from: '919800000004', text: 'stop' })] }))
  const rows = await claim(c)
  assert.deepEqual(rows.map(r => r.phone), [P(1)])
  assert.equal((await one(`select skip_reason from wa_campaign_recipients r join wa_contacts ct on ct.id = r.contact_id where r.campaign_id = $1 and ct.phone_e164 = $2`, [c, P(4)])).skip_reason, 'opted_out')
  await finish(rows[0].client_ref, 'accepted', 'wamid.CAMP2')
})

// Fresh consented contacts for the budget tests.
async function consented(n: number, from: number) {
  const nums = Array.from({ length: n }, (_, i) => P(from + i))
  const list = (await one<{ id: string }>(`insert into wa_lists (name, created_by) values ($1, 'owner') returning id`, ['Batch ' + from])).id
  await db.query('select wa_import_numbers($1, $2, $3, $4)', [nums, list, 'paste', 'owner'])
  for (const p of nums) await consent(p, true)
  return list
}
async function campaignFor(list: string, o: { budget?: number; batch?: number; dailyMax?: number } = {}) {
  const c = await campaign({ tpl: await approvedTemplate(), ...o })
  await db.query('select wa_campaign_add_recipients($1, null, $2, null)', [c, list])
  const p = (await one<{ p: any }>('select wa_campaign_preview($1) as p', [c])).p
  const r = (await one<{ r: string | null }>('select wa_campaign_approve($1, $2, $3, $4) as r', [c, 'owner', p.eligible, p.template_id])).r
  return { c, r }
}

await test('batch size caps each run; the campaign budget pauses it exactly at the limit', async () => {
  await resetSpend()
  const list = await consented(10, 100)
  // Unit cost 0.8631 x 1.18 = 1.0185; budget 10.20 covers exactly 10.
  const { c, r } = await campaignFor(list, { budget: 10.20, batch: 4 })
  assert.equal(r, null)
  assert.equal((await claim(c)).length, 4)
  assert.equal((await claim(c)).length, 4)
  assert.equal((await claim(c)).length, 2)
  assert.equal((await claim(c))[0]?.blocked, 'campaign_budget_reached')
  assert.equal((await one('select status, paused_reason from wa_campaigns where id = $1', [c])).paused_reason, 'campaign_budget_reached')
  assert.equal(await num(`select count(*) from wa_campaign_recipients where campaign_id = $1 and state = 'sending'`, [c]), 10)
})

await test('daily and monthly budgets and the 24-hour messaging limit hold across campaigns', async () => {
  await resetSpend()
  await setSettings({ campaign_budget_daily_inr: 3.06, campaign_budget_monthly_inr: 5000 })   // 3 messages a day
  const listA = await consented(5, 200), listB = await consented(5, 300)
  const a = await campaignFor(listA, { budget: 100 }), b = await campaignFor(listB, { budget: 100 })
  assert.equal((await claim(a.c)).length, 3)
  assert.equal((await claim(b.c))[0].blocked, 'daily_limit', 'the daily budget is shared')
  assert.equal((await one('select status from wa_campaigns where id = $1', [b.c])).status, 'sending', 'daily limit waits, does not pause')

  await resetSpend()
  await setSettings({ campaign_budget_daily_inr: 1000, campaign_budget_monthly_inr: 2.04 })  // 2 a month
  const m = await campaignFor(listA, { budget: 100 })
  assert.equal((await claim(m.c)).length, 2)
  assert.equal((await claim(m.c))[0].blocked, 'monthly_budget_reached')

  await resetSpend()
  await setSettings({ campaign_budget_monthly_inr: 5000, campaign_daily_max: 3 })              // Meta tier
  const g = await campaignFor(listB, { budget: 100 })
  assert.equal((await claim(g.c)).length, 3)
  assert.equal((await claim(g.c))[0].blocked, 'daily_limit')
  await setSettings({ campaign_daily_max: 250 })
  await resetSpend()
  const pc = await campaignFor(listB, { budget: 100, dailyMax: 2 })                          // per campaign
  assert.equal((await claim(pc.c)).length, 2)
  assert.equal((await claim(pc.c))[0].blocked, 'daily_limit')
})

await test('a Meta stop error pauses at once; template no longer approved pauses; rate rise pauses', async () => {
  await resetSpend()
  const list = await consented(4, 400)
  const s = await campaignFor(list, { budget: 100, batch: 2 })
  const rows = await claim(s.c)
  await finish(rows[0].client_ref, 'failed', null, 131048)                   // spam rate limit
  assert.equal((await one('select status, paused_reason from wa_campaigns where id = $1', [s.c])).paused_reason, 'meta_error_131048')
  assert.equal((await claim(s.c))[0].blocked, 'not_sending')

  await resetSpend()
  const t = await campaignFor(list, { budget: 100, batch: 1 })
  await claim(t.c)
  await db.query(`update wa_templates set status = 'PAUSED' where name = 'referral_invite'`)
  assert.equal((await claim(t.c))[0].blocked, 'template_not_approved')
  await db.query(`update wa_templates set status = 'APPROVED' where name = 'referral_invite'`)

  await resetSpend()
  const r = await campaignFor(list, { budget: 100, batch: 1 })
  await db.query(`update wa_settings set value = jsonb_set(value, '{marketing}', '0.95') where key = 'rates'`)
  assert.equal((await claim(r.c))[0].blocked, 'rate_changed')
  await db.query(`update wa_settings set value = jsonb_set(value, '{marketing}', '0.8631') where key = 'rates'`)
})

await test('a send that never came back becomes unknown and is never resent; unsent claims can be released', async () => {
  await resetSpend()
  const list = await consented(3, 500)
  const { c } = await campaignFor(list, { budget: 100, batch: 3 })
  const rows = await claim(c)
  await finish(rows[0].client_ref, 'accepted', 'wamid.R1')
  // rows[1]: Meta was called but the function died. rows[2]: never called.
  assert.equal(await num('select wa_campaign_release($1)', [[rows[2].client_ref, rows[0].client_ref]]), 1, 'only the never-sent row')
  await db.query(`update wa_campaign_recipients set claimed_at = now() - interval '11 minutes' where client_ref = $1`, [rows[1].client_ref])
  const again = await claim(c)
  assert.deepEqual(again.map(r => r.phone), [rows[2].phone], 'released row is sent, the uncertain one is not')
  assert.equal((await one('select state from wa_campaign_recipients where client_ref = $1', [rows[1].client_ref])).state, 'unknown')
  assert.equal((await one('select send_state from wa_messages where client_ref = $1', [rows[1].client_ref])).send_state, 'unknown')
  // Finishing an already-finished row changes nothing (retried request).
  await finish(rows[0].client_ref, 'failed', null, 131048)
  assert.equal((await one('select state from wa_campaign_recipients where client_ref = $1', [rows[0].client_ref])).state, 'accepted')
})

await test('stats: delivery from webhooks in any order, replies only with evidence, opt-outs, Meta billing', async () => {
  await resetSpend()
  const list = await consented(4, 600)
  const { c } = await campaignFor(list, { budget: 100 })
  const rows = await claim(c)
  const w = rows.map((_, i) => 'wamid.ST' + i)
  for (let i = 0; i < rows.length; i++) await finish(rows[i].client_ref, 'accepted', w[i])
  const bill = { billable: true, pricing_model: 'PMP', category: 'marketing' }
  await deliver(buildPayload({ statuses: [
    statusEvent({ id: w[0], status: 'read', pricing: bill }), statusEvent({ id: w[0], status: 'delivered', pricing: bill }),   // out of order
    statusEvent({ id: w[1], status: 'delivered', pricing: bill }), statusEvent({ id: w[1], status: 'delivered', pricing: bill }), // duplicate
    statusEvent({ id: w[2], status: 'failed', errors: [{ code: 131026, title: 'undeliverable' }] }),
  ] }))
  const ph = (i: number) => rows[i].phone.slice(1)
  await deliver(buildPayload({ messages: [
    reply({ id: 'wamid.RP0', from: ph(0), text: 'REFER', context: w[0] }),          // quoted: counts
    reply({ id: 'wamid.RP1', from: ph(1), text: 'who is this?' }),                    // no link: unconfirmed
    button({ id: 'wamid.RP3', from: ph(3), text: 'Stop promotions', context: w[3] }), // button reply + opt-out
  ] }))
  await db.query('select wa_record_marketing_opt_outs()')
  const s = (await one<{ s: any }>('select wa_campaign_stats($1) s', [c])).s
  assert.deepEqual([s.total, s.sent, s.delivered, s.read, s.failed], [4, 4, 2, 1, 1])
  assert.deepEqual([s.replies, s.messaged_after_unconfirmed, s.opt_outs, s.meta_billable], [2, 1, 1, 2])
  // The reply surfaces the conversation in the inbox.
  const listed = (await all(`select phone_e164 from wa_list_conversations(null, null, false, null, null, 50)`)).map((r: any) => r.phone_e164)
  assert.ok(listed.includes(rows[0].phone))
})

await test('duplicating a campaign never resends to people already reached', async () => {
  await resetSpend()
  const list = await consented(3, 700)
  const first = await campaignFor(list, { budget: 100, batch: 2 })
  const rows = await claim(first.c)
  await finish(rows[0].client_ref, 'accepted', 'wamid.D1')
  await finish(rows[1].client_ref, 'unknown')
  const dup = await campaign({ tpl: await approvedTemplate(), name: 'Copy' })
  assert.equal(await num('select wa_campaign_add_recipients($1, null, $2, $3)', [dup, list, first.c]), 1, 'sent and unknown both excluded')
})

await test('pause, resume, cancel; cancel stops queued rows only', async () => {
  await resetSpend()
  const list = await consented(5, 800)
  const { c } = await campaignFor(list, { budget: 100, batch: 2 })
  const ctl = async (a: string) => (await one<{ r: string | null }>('select wa_campaign_control($1, $2) r', [c, a])).r
  assert.equal(await ctl('pause'), null)
  assert.equal((await claim(c))[0].blocked, 'not_sending')
  assert.equal(await ctl('resume'), null)
  assert.equal((await one('select status from wa_campaigns where id = $1', [c])).status, 'approved', 'not started yet')
  const rows = await claim(c)
  assert.equal(rows.length, 2)
  assert.equal(await ctl('unapprove'), 'bad_state', 'not while sending')
  assert.equal(await ctl('pause'), null)
  assert.equal(await ctl('unapprove'), 'already_sending', 'paused, but some were already sent')
  assert.equal(await ctl('cancel'), null)
  assert.equal(await num(`select count(*) from wa_campaign_recipients where campaign_id = $1 and state = 'cancelled'`, [c]), 3)
  assert.equal(await num(`select count(*) from wa_campaign_recipients where campaign_id = $1 and state = 'sending'`, [c]), 2, 'in flight is left to finish')
  await finish(rows[0].client_ref, 'accepted', 'wamid.X1')
  assert.equal(await ctl('resume'), 'bad_state')
  assert.equal((await claim(c))[0].blocked, 'not_sending')
})

await test('scheduled campaigns wait for their time', async () => {
  await resetSpend()
  const list = await consented(2, 900)
  const c = await campaign({ tpl: await approvedTemplate() })
  await db.query(`update wa_campaigns set scheduled_at = now() + interval '1 hour' where id = $1`, [c])
  await db.query('select wa_campaign_add_recipients($1, null, $2, null)', [c, list])
  const p = (await one<{ p: any }>('select wa_campaign_preview($1) as p', [c])).p
  await db.query('select wa_campaign_approve($1, $2, $3, $4)', [c, 'owner', p.eligible, p.template_id])
  assert.equal((await claim(c))[0].blocked, 'not_sending')
  await db.query(`update wa_campaigns set scheduled_at = now() - interval '1 minute' where id = $1`, [c])
  assert.equal((await claim(c)).length, 2)
})

await test('retention removes recipient rows after 24 months', async () => {
  const n = await num(`select count(*) from wa_campaign_recipients`)
  await db.query(`update wa_campaign_recipients set finished_at = now() - interval '25 months', claimed_at = now() - interval '25 months'
                   where id = (select min(id) from wa_campaign_recipients)`)
  assert.equal(await num('select wa_campaign_retention()'), 1)
  assert.equal(await num(`select count(*) from wa_campaign_recipients`), n - 1)
})

console.log(`\n${passed} campaign SQL tests passed`)
await db.close()
