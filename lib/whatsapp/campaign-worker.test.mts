// The campaign worker end to end against the real migration on PGlite and a
// fake Meta. No network, no Supabase, fake numbers only. Every message the
// worker would send is captured by the fake fetch and checked here.
// Run: PGLITE_MODULE=file:///<dir>/node_modules/@electric-sql/pglite/dist/index.js npx tsx lib/whatsapp/campaign-worker.test.mts
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { runCampaignWorker } from './campaign-worker'
import type { CampaignRepo } from './campaign-repo'
import type { GraphEnv } from './graph'

const modPath = process.env.PGLITE_MODULE
if (!modPath) { console.error('Set PGLITE_MODULE (see sql.test.mts).'); process.exit(2) }
const { PGlite } = await import(modPath)
const db = new PGlite()
const MIG_DIR = join(process.cwd(), 'supabase', 'migrations')
await db.exec(`create role anon; create role authenticated; create role service_role;`)
for (const f of readdirSync(MIG_DIR).filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql')).sort()) await db.exec(readFileSync(join(MIG_DIR, f), 'utf8'))

let passed = 0
async function test(name: string, fn: () => Promise<void>) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}
const one = async <T = any,>(sql: string, p: unknown[] = []) => (await db.query<T>(sql, p)).rows[0]
const all = async <T = any,>(sql: string, p: unknown[] = []) => (await db.query<T>(sql, p)).rows
const count = async (sql: string, p: unknown[] = []) => Number(Object.values(await one(sql, p) as object)[0])

// Only the methods the worker uses, straight onto the SQL functions.
const repo = {
  async getSettings() { return Object.fromEntries((await all<{ key: string; value: unknown }>('select key, value from wa_settings')).map(r => [r.key, r.value])) },
  async dueCampaigns(nowIso: string, limit: number) {
    return all(`select id, template_id, batch_size from wa_campaigns where status = 'sending' or (status = 'approved' and (scheduled_at is null or scheduled_at <= $1)) order by approved_at limit $2`, [nowIso, limit])
  },
  async getTemplate(id: string) { return one('select * from wa_templates where id = $1', [id]) },
  async setTemplateStatus(id: string, status: string, category: string | null) { await db.query('update wa_templates set status = $2, category = coalesce($3, category) where id = $1', [id, status, category]) },
  async claim(c: string, n: number, pnid: string) { return all('select * from wa_campaign_claim($1, $2, $3)', [c, n, pnid]) },
  async finish(ref: string, wamid: string | null, state: string, code: number | null, title: string | null) { await db.query('select wa_campaign_finish($1, $2, $3, $4, $5)', [ref, wamid, state, code, title]) },
  async release(refs: string[]) { return Number((await one<{ n: number }>('select wa_campaign_release($1::uuid[]) n', [refs])).n) },
  async pauseAll(reason: string) { return (await db.query(`update wa_campaigns set status = 'paused', paused_reason = $1 where status in ('approved','sending')`, [reason])).affectedRows ?? 0 },
} as unknown as CampaignRepo

const env: GraphEnv = { token: 'T', phoneNumberId: 'PNID', wabaId: 'W', version: 'v26.0' }
type Meta = { quality?: string; template?: string; templateCategory?: string; send?: (n: number) => { status: number; json: unknown } | 'timeout' }
function meta(o: Meta = {}) {
  const sends: any[] = []
  const f = (async (url: string, init?: RequestInit) => {
    const u = String(url)
    const res = (status: number, json: unknown) => ({ status, json: async () => json }) as unknown as Response
    if (u.endsWith('/messages')) {
      const body = JSON.parse(String(init?.body))
      sends.push(body)
      const r = o.send ? o.send(sends.length) : { status: 200, json: { messages: [{ id: `wamid.T${sends.length}` }] } }
      if (r === 'timeout') throw Object.assign(new Error('aborted'), { name: 'AbortError' })
      return res(r.status, r.json)
    }
    if (u.includes('fields=quality_rating')) return res(200, { quality_rating: o.quality ?? 'GREEN' })
    if (u.includes('messaging_limit')) return res(200, { whatsapp_business_manager_messaging_limit: 'TIER_250' })
    if (u.includes('fields=status,category')) return res(200, { status: o.template ?? 'APPROVED', category: o.templateCategory ?? 'MARKETING' })
    return res(404, {})
  }) as unknown as typeof fetch
  return { f, sends }
}
const later = () => Date.now() + 50_000

const P = (n: number) => '+9197000' + String(n).padStart(5, '0')
let tpl = ''
async function fresh(o: { n: number; consented: number; batch?: number; budget?: number }) {
  await db.exec(`delete from wa_campaign_recipients; delete from wa_campaigns; delete from wa_messages where type = 'template';`)
  await db.query(`update wa_settings set value = 'true' where key = 'campaigns_enabled'`)
  await db.query(`insert into wa_settings (key, value) values ('rates', '{"currency":"INR","service":0,"marketing":0.8631}'::jsonb)
                  on conflict (key) do update set value = excluded.value`)
  tpl = (await one<{ id: string }>(`insert into wa_templates (meta_id, name, language, category, status, components)
    values ('m_ref', 'referral_invite', 'en', 'MARKETING', 'APPROVED', '[{"type":"BODY","text":"Refer a friend. Reply STOP to opt out."}]')
    on conflict (name, language) do update set status = 'APPROVED', category = 'MARKETING' returning id`)).id
  const phones = Array.from({ length: o.n }, (_, i) => P(o.consented * 1000 + o.n * 10 + i))
  await db.query(`select wa_import_numbers($1, null, 'paste', 'owner')`, [phones])
  await db.query(`delete from wa_consent where contact_id in (select id from wa_contacts where phone_e164 = any($1))`, [phones])
  await db.query(`insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by, obtained_on)
    select id, 'marketing', true, 'enrolment_record', 'test', 'owner', current_date from wa_contacts where phone_e164 = any($1)`, [phones.slice(0, o.consented)])
  const c = (await one<{ id: string }>(`insert into wa_campaigns (name, template_id, budget_inr, batch_size, created_by) values ('W', $1, $2, $3, 'owner') returning id`, [tpl, o.budget ?? 1000, o.batch ?? 50])).id
  await db.query(`select wa_campaign_add_recipients($1, (select array_agg(id) from wa_contacts where phone_e164 = any($2)), null, null)`, [c, phones])
  const p = (await one<{ p: any }>('select wa_campaign_preview($1) p', [c])).p
  assert.equal((await one<{ r: string | null }>('select wa_campaign_approve($1, $2, $3, $4) r', [c, 'owner', p.eligible, p.template_id])).r, null)
  return { c, phones }
}
const states = async (c: string) => Object.fromEntries((await all<{ state: string; n: number }>('select state, count(*)::int n from wa_campaign_recipients where campaign_id = $1 group by state', [c])).map(r => [r.state, r.n]))

await test('switched off: an approved campaign sends nothing', async () => {
  const { c } = await fresh({ n: 3, consented: 3 })
  await db.query(`update wa_settings set value = 'false' where key = 'campaigns_enabled'`)
  const m = meta()
  const r = await runCampaignWorker(repo, env, m.f, later())
  assert.equal(r.state, 'off'); assert.equal(m.sends.length, 0)
  assert.equal((await states(c)).queued, 3)
})

await test('sends one batch to consented recipients only, with the approved template and no other content', async () => {
  const { c, phones } = await fresh({ n: 5, consented: 3, batch: 50 })
  const m = meta()
  const r = await runCampaignWorker(repo, env, m.f, later())
  assert.equal(r.sent, 3); assert.equal(m.sends.length, 3)
  for (const s of m.sends) {
    assert.deepEqual(Object.keys(s).sort(), ['messaging_product', 'recipient_type', 'template', 'to', 'type'])
    assert.deepEqual(s.template, { name: 'referral_invite', language: { code: 'en' } })
    assert.ok(phones.slice(0, 3).map(p => p.slice(1)).includes(s.to), 'only consented numbers')
  }
  const st = await states(c)
  assert.equal(st.accepted, 3); assert.equal(st.skipped, 2)
  // Next run: nothing left, campaign completes, no second message to anyone.
  const r2 = await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 3, 'no resend')
  assert.equal((await one('select status from wa_campaigns where id = $1', [c])).status, 'completed')
  assert.ok(r2.blocked.includes('completed') || r2.state === 'idle')
})

await test('batch size limits each run; the rest waits for the next run', async () => {
  const { c } = await fresh({ n: 7, consented: 7, batch: 3 })
  const m = meta()
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 3)
  assert.equal((await states(c)).queued, 4)
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 6)
})

await test('a timeout is recorded unknown and never resent', async () => {
  const { c } = await fresh({ n: 2, consented: 2 })
  const m = meta({ send: n => (n === 1 ? 'timeout' : { status: 200, json: { messages: [{ id: 'wamid.ok' + n }] } }) })
  const r = await runCampaignWorker(repo, env, m.f, later())
  assert.equal(r.unknown, 1); assert.equal(r.sent, 1)
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 2, 'the unknown one is not retried')
  assert.equal((await states(c)).unknown, 1)
})

await test('a Meta stop error stops the batch at once, pauses the campaign, and puts unsent rows back', async () => {
  const { c } = await fresh({ n: 12, consented: 12, batch: 12 })
  const m = meta({ send: n => (n === 2 ? { status: 400, json: { error: { code: 131048, message: 'Spam rate limit hit' } } } : { status: 200, json: { messages: [{ id: 'wamid.s' + n }] } }) })
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 5, 'only the first group of 5 went; the next groups did not start')
  const st = await states(c)
  assert.equal(st.queued, 7, 'unsent claims released to the queue')
  assert.equal((await one('select status, paused_reason from wa_campaigns where id = $1', [c])).paused_reason, 'meta_error_131048')
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 5, 'paused: nothing more')
})

await test('error 131049 (per-user marketing limit) fails that person only, and is not retried', async () => {
  const { c } = await fresh({ n: 3, consented: 3 })
  const m = meta({ send: n => (n === 1 ? { status: 400, json: { error: { code: 131049, message: 'not delivered to maintain healthy ecosystem engagement' } } } : { status: 200, json: { messages: [{ id: 'wamid.e' + n }] } }) })
  await runCampaignWorker(repo, env, m.f, later())
  const st = await states(c)
  assert.equal(st.failed, 1); assert.equal(st.accepted, 2)
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 3)
})

await test('quality RED or FLAGGED pauses every campaign before any send', async () => {
  for (const q of ['RED', 'FLAGGED']) {
    const { c } = await fresh({ n: 2, consented: 2 })
    const m = meta({ quality: q })
    const r = await runCampaignWorker(repo, env, m.f, later())
    assert.equal(r.state, 'quality_paused'); assert.equal(m.sends.length, 0)
    assert.equal((await one('select paused_reason from wa_campaigns where id = $1', [c])).paused_reason, 'quality_' + q.toLowerCase())
  }
})

await test('template paused or recategorised at Meta: the claim pauses the campaign, nothing sends', async () => {
  for (const o of [{ template: 'PAUSED' }, { templateCategory: 'UTILITY' }]) {
    const { c } = await fresh({ n: 2, consented: 2 })
    const m = meta(o)
    await runCampaignWorker(repo, env, m.f, later())
    assert.equal(m.sends.length, 0)
    assert.equal((await one('select status from wa_campaigns where id = $1', [c])).status, 'paused')
  }
})

await test('a STOP after approval is honoured at send time', async () => {
  const { c, phones } = await fresh({ n: 2, consented: 2 })
  const cid = (await one('select id from wa_contacts where phone_e164 = $1', [phones[0]])).id
  const conv = (await one(`with e as (select id from wa_conversations where contact_id = $1 limit 1),
    i as (insert into wa_conversations (contact_id) select $1 where not exists (select 1 from e) returning id)
    select id from e union all select id from i`, [cid])).id
  await db.query(`insert into wa_messages (conversation_id, direction, wamid, type, body) values ($1, 'inbound', 'wamid.in.stop', 'text', 'STOP')`, [conv])
  const m = meta()
  await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 1)
  assert.equal(m.sends[0].to, phones[1].slice(1))
  assert.equal((await one(`select skip_reason from wa_campaign_recipients r join wa_contacts ct on ct.id = r.contact_id where ct.phone_e164 = $1 and r.campaign_id = $2`, [phones[0], c])).skip_reason, 'opted_out')
})

await test('out of time: claimed rows are released, not sent and not lost', async () => {
  const { c } = await fresh({ n: 4, consented: 4 })
  const m = meta()
  let t = Date.now()
  // Clock reads: 1 due list, 2 campaign start (passes), 3 first group (too late).
  const start = t
  const r = await runCampaignWorker(repo, env, m.f, start + 10_500, () => (t += 1_000))
  assert.equal(r.campaigns, 1, 'it did claim')
  assert.equal(r.released, 4, 'and released every claimed row')
  assert.equal(m.sends.length, 0)
  assert.equal((await states(c)).queued, 4)
  assert.equal(await count(`select count(*) from wa_messages where type = 'template'`), 0, 'no outbound rows left behind')
})

await test('budget: the daily budget stops sends at the exact count', async () => {
  // 0.8631 x 1.18 = 1.0185 per message; 3.10 covers 3.
  await db.query(`update wa_settings set value = '3.10' where key = 'campaign_budget_daily_inr'`)
  const { c } = await fresh({ n: 6, consented: 6 })
  await db.query(`update wa_settings set value = 'true' where key = 'campaigns_enabled'`)
  const m = meta()
  const r = await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 3)
  assert.ok(r.blocked.length === 0)
  const r2 = await runCampaignWorker(repo, env, m.f, later())
  assert.equal(m.sends.length, 3); assert.ok(r2.blocked.includes('daily_limit'))
  assert.equal((await states(c)).queued, 3)
  await db.query(`update wa_settings set value = '250' where key = 'campaign_budget_daily_inr'`)
})

await test('not configured: no token or phone number id means no send and no Meta call', async () => {
  await fresh({ n: 1, consented: 1 })
  const m = meta()
  const r = await runCampaignWorker(repo, { version: 'v26.0' }, m.f, later())
  assert.equal(r.state, 'not_configured'); assert.equal(m.sends.length, 0)
  assert.equal(await count(`select count(*) from wa_campaign_recipients where state <> 'queued'`), 0)
})

console.log(`\n${passed} campaign worker tests passed`)
