// SQL tests for supabase/migrations/20261204120000_whatsapp_referrals.sql on
// PGlite. Never touches Supabase, never calls Meta. Fake numbers only.
// Run: PGLITE_MODULE=file:///<dir>/node_modules/@electric-sql/pglite/dist/index.js npx tsx lib/whatsapp/sql-referrals.test.mts
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { buildPayload, inboundText as rawInbound } from './test-fixtures'
const inboundText = (o: Parameters<typeof rawInbound>[0]) => rawInbound({ timestamp: String(Math.floor(Date.now() / 1000)), ...o })

const modPath = process.env.PGLITE_MODULE
if (!modPath) { console.error('Set PGLITE_MODULE (see sql.test.mts).'); process.exit(2) }
const { PGlite } = await import(modPath)
const db = new PGlite()
const MIG_DIR = join(process.cwd(), 'supabase', 'migrations')
const migFile = (name: string) => readFileSync(join(MIG_DIR, name), 'utf8')

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}
async function one<T = any>(sql: string, params: unknown[] = []): Promise<T> { return (await db.query<T>(sql, params)).rows[0] }
async function num(sql: string, params: unknown[] = []): Promise<number> { return Number(Object.values((await one(sql, params)) as object)[0]) }
const sha = (s: string) => createHash('sha256').update(s).digest('hex')
async function deliver(payload: unknown) {
  const raw = JSON.stringify(payload)
  const ev = await one<{ event_id: number }>('select * from wa_ingest_event($1, $2)', [sha(raw), raw])
  await db.query('select wa_begin_attempt($1)', [ev.event_id])
  return (await one<{ r: any }>('select wa_process_event($1) as r', [ev.event_id])).r
}
async function setSettings(o: Record<string, unknown>) {
  for (const [k, v] of Object.entries(o)) {
    await db.query(`insert into wa_settings (key, value) values ($1, $2::jsonb) on conflict (key) do update set value = excluded.value`, [k, JSON.stringify(v)])
  }
}
function button(o: { id: string; from: string; text: string }) {
  const m: any = inboundText({ id: o.id, from: o.from, text: 'x' })
  delete m.text; m.type = 'button'; m.button = { text: o.text, payload: o.text }
  return m
}

await db.exec(`create role anon; create role authenticated; create role service_role;`)
const UP = readdirSync(MIG_DIR).filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql')).sort()
for (const f of UP) {
  try { await db.exec(migFile(f)) } catch (e) { throw new Error(`migration ${f}: ${(e as Error).message}`) }
}
assert.equal(UP.at(-1), '20261204120000_whatsapp_referrals.sql')

const P = (n: number) => '+9198100' + String(n).padStart(5, '0')
const contactId = async (phone: string) => (await one<{ id: string }>('select id from wa_contacts where phone_e164 = $1', [phone])).id
const marketingYes = (phone: string) =>
  db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by, obtained_on)
            select id, 'marketing', true, 'enrolment_record', 'test evidence', 'owner', current_date - 30 from wa_contacts where phone_e164 = $1`, [phone])

// A campaign that "reached" a phone: contact, approved template, campaign,
// recipient with an accepted outbound message. Triggers are bypassed to set
// up the state directly.
async function reached(phone: string): Promise<{ campaign: string; token: string; conv: string }> {
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.seed' + phone, from: phone.slice(1), text: 'hello' })] }))
  const tpl = await one<{ id: string }>(`insert into wa_templates (meta_id, name, language, category, status, components)
    values ($1, $2, 'en', 'MARKETING', 'APPROVED', '[{"type":"BODY","text":"hi"}]') returning id`, ['m' + phone, 't' + phone.slice(-5)])
  const c = await one<{ id: string; ref_token: string }>(`insert into wa_campaigns (name, created_by, template_id) values ('c', 'owner', $1) returning id, ref_token`, [tpl.id])
  const conv = await one<{ id: string }>(`select cv.id from wa_conversations cv join wa_contacts ct on ct.id = cv.contact_id where ct.phone_e164 = $1`, [phone])
  await db.exec(`set session_replication_role = replica`)
  const msg = await one<{ id: string }>(`insert into wa_messages (conversation_id, direction, type, body, sent_by, send_state, wamid, created_at)
    values ($1, 'outbound', 'template', 'hi', 'campaign:' || $2, 'accepted', 'wamid.c' || $3, now() - interval '1 hour') returning id`, [conv.id, c.id, phone])
  await db.query(`insert into wa_campaign_recipients (campaign_id, contact_id, state, message_id, claimed_at)
    values ($1, $2, 'accepted', $3, now() - interval '1 hour')`, [c.id, await contactId(phone), msg.id])
  await db.exec(`set session_replication_role = origin`)
  return { campaign: c.id, token: c.ref_token, conv: conv.id }
}
const submit = (o: Partial<Record<string, unknown>> = {}) => one<{ ref_code: string; outcome: string; referral_id: string }>(
  `select * from referral_submit($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
  [o.code ?? 'EDU-REF-AAAAAAAA', o.referrerName ?? 'Asha Rao', o.referrer ?? P(1), o.referredName ?? 'Ravi Kumar', o.referred ?? P(2),
   o.programme ?? 'MBA', o.uniId ?? null, o.uni ?? null, o.note ?? null, '2026-11-27', o.optin ?? false, o.token ?? null, o.ip ?? 'a'.repeat(64)])

await test('new switches start off and settings exist', async () => {
  assert.equal((await one(`select value from wa_settings where key = 'automation_enabled'`)).value, false)
  assert.equal((await one(`select value from wa_settings where key = 'referral_confirm_whatsapp'`)).value, false)
  assert.equal((await one(`select value from wa_settings where key = 'referral_disclosure'`)).value, '')
  assert.equal(await num(`select count(*) from wa_auto_rules where enabled`), 4)
})

await test('RLS on and no API grants on every new table', async () => {
  const t = ['wa_media_files', 'referral_reward_rules', 'referrals', 'referral_activity', 'referral_rate_hits', 'referral_form_opens', 'wa_auto_rules', 'wa_auto_replies']
  assert.equal(await num(`select count(*) from pg_class where relname = any($1) and relrowsecurity`, [t]), t.length)
  assert.equal(await num(`select count(*) from information_schema.role_table_grants where table_name = any($1) and grantee in ('anon','authenticated')`, [t]), 0)
  assert.equal(await num(`select count(*) from information_schema.routine_privileges where routine_name like 'referral_%' and grantee in ('anon','authenticated','PUBLIC')`), 0)
})

await test('template status webhook updates status, reason and category', async () => {
  await db.query(`insert into wa_templates (meta_id, name, language, category, status) values ('999', 'ref_invite', 'en', 'MARKETING', 'PENDING')`)
  const payload = { object: 'whatsapp_business_account', entry: [{ id: 'WABA', time: 1, changes: [{ field: 'message_template_status_update',
    value: { event: 'REJECTED', message_template_id: 999, message_template_name: 'ref_invite', message_template_language: 'en', reason: 'PROMOTIONAL' } }] }] }
  const r = await deliver(payload)
  assert.equal(r.state, 'completed'); assert.equal(r.templates, 1)
  const t = await one(`select status, reason from wa_templates where meta_id = '999'`)
  assert.deepEqual([t.status, t.reason], ['REJECTED', 'PROMOTIONAL'])
  await deliver({ ...payload, entry: [{ ...payload.entry[0], time: 2, changes: [{ field: 'message_template_status_update',
    value: { event: 'APPROVED', message_template_id: 999, reason: 'NONE' } }] }] })
  const t2 = await one(`select status, reason from wa_templates where meta_id = '999'`)
  assert.deepEqual([t2.status, t2.reason], ['APPROVED', null])
  // Unknown template: ignored, event still completes.
  const r3 = await deliver({ ...payload, entry: [{ ...payload.entry[0], time: 3, changes: [{ field: 'message_template_status_update', value: { event: 'APPROVED', message_template_id: 1 } }] }] })
  assert.deepEqual([r3.state, r3.templates], ['completed', 0])
})

await test('message webhooks still project as before', async () => {
  const r = await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.plain1', from: '919810099999', text: 'hi' })] }))
  assert.equal(r.messages, 1); assert.equal(r.templates, 0)
})

await test('referral: created with id, lead created once, activity written', async () => {
  const r = await submit()
  assert.deepEqual([r.ref_code, r.outcome], ['EDU-REF-AAAAAAAA', 'created'])
  const row = await one(`select * from referrals where ref_code = 'EDU-REF-AAAAAAAA'`)
  assert.equal(row.stage, 'new'); assert.equal(row.review_state, 'clear'); assert.deepEqual(row.flags, [])
  const lead = await one(`select name, phone, source from leads where id = $1`, [row.lead_id])
  assert.deepEqual([lead.name, lead.phone, lead.source], ['Ravi Kumar', P(2).slice(1), 'referral'])
  assert.equal(await num(`select count(*) from referral_activity where referral_id = $1`, [row.id]), 1)
  // Referred permission is not marketing consent.
  assert.equal(await num(`select count(*) from wa_consent`), 0)
})

await test('referral: same pair within 24 hours returns the first id, stores nothing new', async () => {
  const r = await submit({ code: 'EDU-REF-BBBBBBBB' })
  assert.deepEqual([r.ref_code, r.outcome], ['EDU-REF-AAAAAAAA', 'repeat'])
  assert.equal(await num(`select count(*) from referrals`), 1)
})

await test('referral: flags self, already referred, existing lead, many from referrer', async () => {
  const self = await submit({ code: 'EDU-REF-CCCCCCCC', referrer: P(3), referred: P(3), ip: 'b'.repeat(64) })
  assert.equal(self.outcome, 'created')
  const s = await one(`select flags, review_state from referrals where ref_code = 'EDU-REF-CCCCCCCC'`)
  assert.ok(s.flags.includes('self_referral')); assert.equal(s.review_state, 'needs_review')
  // P(2) was referred by P(1) and is a lead now.
  const again = await submit({ code: 'EDU-REF-DDDDDDDD', referrer: P(4), referred: P(2), ip: 'c'.repeat(64) })
  assert.equal(again.outcome, 'created')
  const a = await one(`select flags, lead_id from referrals where ref_code = 'EDU-REF-DDDDDDDD'`)
  assert.ok(a.flags.includes('already_referred') && a.flags.includes('existing_lead'))
  assert.equal(await num(`select count(*) from leads where phone = $1`, [P(2).slice(1)]), 1)
  const more = await submit({ code: 'EDU-REF-EEEEEEEE', referrer: P(4), referred: P(5), ip: 'c'.repeat(64) })
  assert.ok((await one(`select flags from referrals where ref_code = $1`, [more.ref_code])).flags.includes('many_from_referrer'))
})

await test('referral: code collision asks for another code', async () => {
  const r = await submit({ code: 'EDU-REF-AAAAAAAA', referrer: P(6), referred: P(7), ip: 'd'.repeat(64) })
  assert.equal(r.outcome, 'code_taken')
})

await test('referral: rate limit of 5 per IP per hour', async () => {
  const ip = 'e'.repeat(64)
  for (let i = 0; i < 5; i++) {
    const r = await submit({ code: 'EDU-REF-F' + 'GHJKM'[i] + 'FFFFFF', referrer: P(20 + i), referred: P(40 + i), ip })
    assert.equal(r.outcome, 'created')
  }
  assert.equal((await submit({ code: 'EDU-REF-FNFFFFFF', referrer: P(30), referred: P(50), ip })).outcome, 'rate_limited')
})

await test('referral: a repeat counts toward the IP limit; site-wide ceiling of 200 an hour', async () => {
  const ip = '7'.repeat(64)
  const first = await submit({ code: 'EDU-REF-RPRPRPRP', referrer: P(70), referred: P(71), ip })
  assert.equal(first.outcome, 'created')
  for (let i = 0; i < 4; i++) assert.equal((await submit({ code: 'EDU-REF-RQRQRQRQ', referrer: P(70), referred: P(71), ip })).outcome, 'repeat')
  assert.equal((await submit({ code: 'EDU-REF-RQRQRQRQ', referrer: P(70), referred: P(71), ip })).outcome, 'rate_limited')
  const before = await num(`select count(*) from referrals where created_at > now() - interval '1 hour'`)
  await db.query(`insert into referrals (ref_code, referrer_name, referrer_phone, referred_name, referred_phone, referred_permission, terms_version)
    select 'EDU-REF-Z' || translate(lpad(g::text, 7, '0'), '01', 'XY'), 'Bulk Test', '+919811100000', 'Bulk Test', '+919811100001', true, 't'
    from generate_series(1, $1::int) g`, [200 - before])
  assert.equal((await submit({ code: 'EDU-REF-CXCXCXCX', referrer: P(72), referred: P(73), ip: '8'.repeat(64) })).outcome, 'rate_limited')
  await db.query(`delete from referrals where referrer_name = 'Bulk Test'`)
})

await test('referral: attribution by link token, then by phone match', async () => {
  const a = await reached(P(60))
  assert.match(a.token, /^[0-9a-f]{16}$/)
  const byLink = await submit({ code: 'EDU-REF-HHHHHHHH', referrer: P(61), referred: P(62), token: a.token, ip: 'f'.repeat(64) })
  const l = await one(`select campaign_id, attribution from referrals where id = $1`, [byLink.referral_id])
  assert.deepEqual([l.campaign_id, l.attribution], [a.campaign, 'link'])
  const byPhone = await submit({ code: 'EDU-REF-JJJJJJJJ', referrer: P(60), referred: P(63), token: 'nottoken', ip: '1'.repeat(64) })
  const p = await one(`select campaign_id, attribution from referrals where id = $1`, [byPhone.referral_id])
  assert.deepEqual([p.campaign_id, p.attribution], [a.campaign, 'phone_match'])
  assert.equal(await one(`select referral_count_open($1) as r`, [a.token]).then(x => x.r), true)
  await db.query(`select referral_count_open($1)`, [a.token])
  assert.equal(await one(`select referral_count_open('zzz') as r`).then(x => x.r), false)
  const st = (await one(`select wa_campaign_referral_stats($1) as s`, [a.campaign])).s
  assert.deepEqual([st.form_opens, st.submitted, st.by_link, st.by_phone_match, st.unique_valid], [2, 2, 1, 1, 2])
})

await test('rewards: due date is admission + 7, stage rules enforced, one reward per student', async () => {
  const id = (await one(`select id from referrals where ref_code = 'EDU-REF-HHHHHHHH'`)).id
  await assert.rejects(db.query(`update referrals set stage = 'admission_confirmed' where id = $1`, [id]), /referrals_admission_needs_date/)
  await db.query(`update referrals set stage = 'admission_confirmed', admission_confirmed_on = '2026-12-01' where id = $1`, [id])
  assert.equal((await one(`select to_char(reward_due_on, 'YYYY-MM-DD') as d from referrals where id = $1`, [id])).d, '2026-12-08')
  await assert.rejects(db.query(`update referrals set stage = 'reward_approved' where id = $1`, [id]), /referrals_approved_needs_amount/)
  await db.query(`update referrals set stage = 'reward_approved', reward_amount_inr = 1000, reward_approved_at = now() where id = $1`, [id])
  await assert.rejects(db.query(`update referrals set stage = 'reward_paid' where id = $1`, [id]), /referrals_paid_needs_ref/)
  await assert.rejects(db.query(`update referrals set stage = 'reward_paid', reward_paid_on = '2026-11-30', payment_ref = 'UTR1' where id = $1`, [id]), /referrals_paid_after_admission/)
  await db.query(`update referrals set stage = 'reward_paid', reward_paid_on = '2026-12-05', payment_ref = 'UTR1' where id = $1`, [id])
  // A flagged referral cannot be rewarded until resolved.
  const flagged = (await one(`select id from referrals where ref_code = 'EDU-REF-CCCCCCCC'`)).id
  await assert.rejects(db.query(`update referrals set stage = 'reward_approved', admission_confirmed_on = current_date, reward_amount_inr = 1, reward_approved_at = now() where id = $1`, [flagged]), /referrals_review_before_reward/)
  // Second reward for the same referred phone (P(62)) is refused.
  const dup = await submit({ code: 'EDU-REF-KKKKKKKK', referrer: P(64), referred: P(62), ip: '2'.repeat(64) })
  await assert.rejects(db.query(`update referrals set review_state = 'resolved', stage = 'reward_approved', admission_confirmed_on = '2026-12-01', reward_amount_inr = 1000, reward_approved_at = now() where id = $1`, [dup.referral_id]), /referrals_one_reward_uidx/)
})

await test('automation: off by default, candidates are campaign recipients only', async () => {
  const a = await reached(P(70))
  await marketingYes(P(70))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.in70a', from: P(70).slice(1), text: 'Interested' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.stranger', from: '919810077777', text: 'Interested' })] }))
  const cands = (await db.query<any>(`select * from wa_auto_candidates(50)`)).rows
  const mine = cands.filter(c => c.conversation_id === a.conv)
  assert.ok(mine.some(c => c.body === 'Interested'))
  assert.ok(!cands.some(c => c.body === 'Interested' && c.conversation_id !== a.conv && c.contact_id !== mine[0].contact_id))
  const m = (await one(`select id from wa_messages where wamid = 'wamid.in70a'`)).id
  assert.equal((await one(`select wa_auto_claim($1, 'interested') as r`, [m])).r, 'automation_off')
  assert.equal((await one(`select wa_auto_claim($1, 'interested') as r`, [m])).r, 'duplicate')
})

await test('automation: claims once, caps at 4, stops after STOP and on staff takeover', async () => {
  await setSettings({ automation_enabled: true })
  const a = await reached(P(71)); await marketingYes(P(71))
  const claims: string[] = []
  for (let i = 0; i < 5; i++) {
    await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.in71_' + i, from: P(71).slice(1), text: 'know more' })] }))
    const m = (await one(`select id from wa_messages where wamid = $1`, ['wamid.in71_' + i])).id
    claims.push((await one(`select wa_auto_claim($1, 'know_more') as r`, [m])).r)
    if (claims.at(-1) === 'ok') await db.query(`select wa_auto_finish($1, 'sent', null, null)`, [m])
  }
  assert.deepEqual(claims, ['ok', 'ok', 'ok', 'ok', 'cap'])
  assert.equal(await num(`select count(*) from wa_auto_replies where conversation_id = $1 and state = 'sent'`, [a.conv]), 4)

  const b = await reached(P(72)); await marketingYes(P(72))
  await deliver(buildPayload({ messages: [button({ id: 'wamid.in72stop', from: P(72).slice(1), text: 'Stop Promotions' })] }))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.in72b', from: P(72).slice(1), text: 'yes' })] }))
  const m72 = (await one(`select id from wa_messages where wamid = 'wamid.in72b'`)).id
  assert.equal((await one(`select wa_auto_claim($1, 'interested') as r`, [m72])).r, 'opted_out')

  const c = await reached(P(73)); await marketingYes(P(73))
  await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.in73', from: P(73).slice(1), text: 'reward' })] }))
  await db.query(`insert into wa_messages (conversation_id, direction, type, body, sent_by, send_state) values ($1, 'outbound', 'text', 'Hi, Rishi here', 'owner', 'accepted')`, [c.conv])
  assert.equal((await one(`select auto_off from wa_conversations where id = $1`, [c.conv])).auto_off, true)
  const m73 = (await one(`select id from wa_messages where wamid = 'wamid.in73'`)).id
  assert.equal((await one(`select wa_auto_claim($1, 'reward') as r`, [m73])).r, 'conversation_off')
  // Campaign and automation sends do not count as a takeover.
  assert.equal((await one(`select auto_off from wa_conversations where id = $1`, [a.conv])).auto_off, false)
  await setSettings({ automation_enabled: false })
})

await test('inbox template send: allowed after the window, needs consent for marketing, respects the cap', async () => {
  await setSettings({ sending_enabled: true, rates: { currency: 'INR', service: 0.1, marketing: 1, utility: 0.2 }, monthly_cap_inr: 2, free_service_allowance: { per_month: 1000 } })
  const conv = (await one(`select wa_conversation_for_phone($1, 'PNID') as c`, [P(80)])).c
  const tpl = (await one(`insert into wa_templates (meta_id, name, language, category, status) values ('t80', 'ref_t80', 'en', 'MARKETING', 'APPROVED') returning id`)).id
  const ref = () => crypto.randomUUID()
  assert.equal((await one(`select * from wa_reserve_template($1, $2, $3, 'hi', '{}', 'owner')`, [conv, ref(), tpl])).blocked, 'no_marketing_consent')
  await marketingYes(P(80))
  const ok1 = await one(`select * from wa_reserve_template($1, $2, $3, 'hi', '{}', 'owner')`, [conv, ref(), tpl])
  assert.equal(ok1.blocked, null); assert.equal(ok1.is_new, true)
  const ok2 = await one(`select * from wa_reserve_template($1, $2, $3, 'hi', '{}', 'owner')`, [conv, ref(), tpl])
  assert.equal(ok2.blocked, null)
  assert.equal((await one(`select * from wa_reserve_template($1, $2, $3, 'hi', '{}', 'owner')`, [conv, ref(), tpl])).blocked, 'cap_reached')
  await db.query(`update wa_templates set status = 'PAUSED' where id = $1`, [tpl])
  assert.equal((await one(`select * from wa_reserve_template($1, $2, $3, 'hi', '{}', 'owner')`, [conv, ref(), tpl])).blocked, 'template_not_approved')
  await setSettings({ sending_enabled: false })
})

await test('down file undoes Phase 4 and restores the Phase 1 event processor; up re-applies', async () => {
  await db.exec(migFile('20261204120000_whatsapp_referrals.down.sql'))
  assert.equal(await num(`select count(*) from pg_class where relname in ('referrals','wa_auto_rules','wa_media_files')`), 0)
  assert.equal(await num(`select count(*) from information_schema.columns where table_name = 'wa_campaigns' and column_name = 'ref_token'`), 0)
  const r = await deliver(buildPayload({ messages: [inboundText({ id: 'wamid.afterdown', from: '919810088888', text: 'hi' })] }))
  assert.equal(r.state, 'completed'); assert.equal(r.templates, undefined)
  await db.exec(migFile('20261204120000_whatsapp_referrals.sql'))
  assert.equal(await num(`select count(*) from pg_class where relname = 'referrals'`), 1)
})

console.log(`\n${passed} passed`)
