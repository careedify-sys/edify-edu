// Tests for lib/whatsapp/inbox-service.ts against the in-memory mock repo and
// a fake Meta. No network, no database.
// Run: npx tsx lib/whatsapp/inbox-service.test.mts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mockInboxRepo } from './inbox-mock'
import * as svc from './inbox-service'
import { OWNER, type Actor } from './access'
import type { GraphEnv } from './graph'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}

const env: GraphEnv = { token: 'T', phoneNumberId: 'P', wabaId: 'W', appId: 'A', appSecret: 'S', version: 'v26.0' }
function meta(status = 200, json: unknown = { messages: [{ id: 'wamid.sent.1' }] }) {
  const calls: any[] = []
  const f = (async (_u: string, init: RequestInit) => { calls.push(JSON.parse(String(init.body))); return { status, json: async () => json } }) as unknown as typeof fetch
  return { f, calls }
}
const counsellor: Actor = { id: 'c1', role: 'counsellor' }
let n = 0
const ref = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`

function setup() {
  const repo = mockInboxRepo()
  const s = repo.state
  const byName = (name: string) => {
    const ct = s.contacts.find(c => c.profile_name === name)!
    const cv = s.convs.find(c => c.contact_id === ct.id)!
    return { ct, cv }
  }
  return { repo, s, asha: byName('Asha Verma'), ravi: byName('Ravi'), imran: byName('Imran K'), neha: byName('Neha') }
}

await test('send: blocked while sending is switched off, nothing reaches Meta', async () => {
  const { repo, asha } = setup()
  const m = meta()
  const r = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: ref(), kind: 'text', text: 'hi' })
  assert.equal(r.ok, false)
  assert.equal(m.calls.length, 0)
})

await test('send: in the window, accepted once; same clientRef never sends twice', async () => {
  const { repo, s, asha } = setup()
  s.settings.sending_enabled = true
  const m = meta()
  const cr = ref()
  const a = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: '  Fee details below  ' })
  assert.deepEqual(a, { ok: true, state: 'accepted' })
  const b = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: 'Fee details below' })
  assert.equal(b.ok && b.duplicate, true)
  assert.equal(m.calls.length, 1)
  assert.equal(m.calls[0].to, '919800000011')
  assert.equal(m.calls[0].text.body, 'Fee details below')
  const row = s.messages.find(x => x.client_ref === cr)!
  assert.equal(row.send_state, 'accepted')
  assert.equal(row.wamid, 'wamid.sent.1')
  // The audit trail records ids and states, never the message text or number.
  const audit = JSON.stringify(s.audit)
  assert.ok(!audit.includes('Fee details'))
  assert.ok(!audit.includes('919800000011'))
})

await test('send: closed 24-hour window, opt-out and empty text are refused', async () => {
  const { repo, s, asha, imran } = setup()
  s.settings.sending_enabled = true
  const m = meta()
  const closed = await svc.sendReply(repo, env, m.f, OWNER, { convId: imran.cv.id, clientRef: ref(), kind: 'text', text: 'hi' })
  assert.equal(closed.ok, false)
  assert.match((closed as any).error, /24-hour/)
  await repo.addConsent(asha.ct.id, { purpose: 'service', granted: false, source: 'whatsapp_message', evidence: 'STOP', recorded_by: 'owner' })
  const opted = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: ref(), kind: 'text', text: 'hi' })
  assert.match((opted as any).error, /not to be messaged/)
  const { repo: r2, s: s2, asha: a2 } = setup()
  s2.settings.sending_enabled = true
  assert.equal((await svc.sendReply(r2, env, m.f, OWNER, { convId: a2.cv.id, clientRef: ref(), kind: 'text', text: '   ' })).ok, false)
  assert.equal((await svc.sendReply(r2, env, m.f, OWNER, { convId: a2.cv.id, clientRef: ref(), kind: 'text', text: 'x'.repeat(4097) })).ok, false)
  assert.equal(m.calls.length, 0)
})

await test('request phone: refused when the number is known, sent by BSUID when hidden', async () => {
  const { repo, s, asha, ravi } = setup()
  s.settings.sending_enabled = true
  const m = meta()
  assert.equal((await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: ref(), kind: 'request_phone' })).ok, false)
  const r = await svc.sendReply(repo, env, m.f, OWNER, { convId: ravi.cv.id, clientRef: ref(), kind: 'request_phone' })
  assert.equal(r.ok && r.state, 'accepted')
  assert.equal(m.calls[0].recipient, 'IN.MOCK0022')
  assert.equal(m.calls[0].interactive.type, 'request_contact_info')
})

await test('cap: a paid reply over the cap is blocked before Meta and writes nothing', async () => {
  const { repo, s, asha } = setup()
  s.settings.sending_enabled = true
  s.settings.monthly_cap_inr = 1
  // 1,000 free + 9 paid so far = 1.035 > 1 already; the next one is refused.
  repo.usage = async () => ({ month_start: '2026-11-30T18:30:00Z', service_delivered: 1008, service_in_flight: 1, meta_billable: 0, meta_free: 0 })
  const m = meta()
  const cr = ref()
  const r = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: 'hi' })
  assert.equal(r.ok, false)
  assert.match((r as any).error, /cap/)
  assert.equal(m.calls.length, 0)
  assert.equal((r as any).blocked, 'cap_reached')
  assert.equal(s.messages.find(x => x.client_ref === cr), undefined, 'no row, so the same key works after the cap is raised')
  // 7 paid so far = 0.805; one more = 0.92 fits under 1. Same key as the blocked try (QA S3).
  repo.usage = async () => ({ month_start: '2026-11-30T18:30:00Z', service_delivered: 1006, service_in_flight: 1, meta_billable: 0, meta_free: 0 })
  const ok = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: 'hi' })
  assert.equal(ok.ok && ok.state, 'accepted')
})

await test('send: Meta timeout or 5xx is "unknown", recorded, and not retried', async () => {
  const { repo, s, asha } = setup()
  s.settings.sending_enabled = true
  const m = meta(503, {})
  const cr = ref()
  const r = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: 'hi' })
  assert.equal(r.ok && r.state, 'unknown')
  assert.equal(m.calls.length, 1)
  assert.equal(s.messages.find(x => x.client_ref === cr)!.send_state, 'unknown')
})

await test('permissions: no session is denied everything; a counsellor cannot change money or sending', async () => {
  const { repo, asha } = setup()
  assert.equal((await svc.loadThread(repo, null, asha.cv.id)).ok, false)
  assert.equal((await svc.setSending(repo, counsellor, true)).ok, false)
  assert.equal((await svc.overrideCap(repo, counsellor, 100, 'x')).ok, false)
  assert.equal((await svc.connectionCheck(repo, counsellor, env, meta().f)).ok, false)
  assert.equal((await svc.addNote(repo, counsellor, asha.cv.id, 'ok')).ok, true)
})

await test('thread: suggests a lead stored with a bare 10-digit number; never links by itself', async () => {
  const { repo, neha } = setup()
  const t = await svc.loadThread(repo, OWNER, neha.cv.id)
  assert.ok(t.ok)
  if (t.ok) {
    assert.deepEqual(t.thread.leadMatches.map(l => l.name), ['Neha Sharma'])
    assert.equal(t.thread.lead, null)
  }
  assert.equal((await repo.getContact(neha.ct.id))!.lead_id, null)
})

await test('create lead: links the existing match instead of duplicating; needs a phone', async () => {
  const { repo, s, neha, ravi, imran } = setup()
  const leads = s.leads.length
  const r = await svc.createLeadFromContact(repo, OWNER, { contactId: neha.ct.id, name: 'Neha', program: '', university: '' })
  assert.ok(r.ok && r.existing)
  assert.equal(s.leads.length, leads)
  assert.equal((await repo.getContact(neha.ct.id))!.lead_id, s.leads.find(l => l.name === 'Neha Sharma')!.id)
  assert.equal((await svc.createLeadFromContact(repo, OWNER, { contactId: ravi.ct.id, name: 'Ravi', program: '', university: '' })).ok, false)
  const c = await svc.createLeadFromContact(repo, OWNER, { contactId: imran.ct.id, name: '', program: 'MBA', university: '' })
  assert.ok(c.ok && !c.existing)
  const made = s.leads.find(l => l.phone === '919800000033')!
  assert.equal(made.name, 'Imran K', 'falls back to the WhatsApp name')
  assert.equal(made.source, 'whatsapp')
})

await test('consent: agreement needs evidence; refusal does not; bad values refused', async () => {
  const { repo, s, ravi } = setup()
  const base = { contactId: ravi.ct.id, purpose: 'counselling_call', source: 'whatsapp_message' }
  assert.equal((await svc.recordConsent(repo, OWNER, { ...base, granted: true, evidence: ' ' })).ok, false)
  assert.equal((await svc.recordConsent(repo, OWNER, { ...base, granted: true, evidence: 'Call me after 6, 2 Dec' })).ok, true)
  assert.equal((await svc.recordConsent(repo, OWNER, { ...base, granted: false, evidence: '' })).ok, true)
  assert.equal((await svc.recordConsent(repo, OWNER, { ...base, purpose: 'anything', granted: false, evidence: '' })).ok, false)
  const cur = svc.currentConsent(await repo.getConsent(ravi.ct.id))
  assert.equal(cur.counselling_call?.granted, false, 'the latest answer wins')
  assert.equal(s.consent.filter(c => c.contact_id === ravi.ct.id).length, 2, 'history is kept')
})

await test('billing settings: validated, saved and audited with before and after', async () => {
  const { repo, s } = setup()
  const good = { capInr: 750, service: 0.115, utility: 0.115, marketing: 0.8631, authentication: 0.115, effectiveFrom: '2026-10-01', verifiedOn: '2026-11-26', source: 'Meta INR card', freePerMonth: 1000, freeSource: 'Meta pricing page', timezone: 'Asia/Kolkata' }
  assert.equal((await svc.updateBilling(repo, OWNER, { ...good, service: -1 })).ok, false)
  assert.equal((await svc.updateBilling(repo, OWNER, { ...good, timezone: 'Mars/Base' })).ok, false)
  assert.equal((await svc.updateBilling(repo, OWNER, { ...good, source: '' })).ok, false)
  assert.equal((await svc.updateBilling(repo, OWNER, good)).ok, true)
  assert.equal(s.settings.monthly_cap_inr, 750)
  const a = s.audit.find(x => x.action === 'billing_settings') as any
  assert.equal(a.detail.before.cap, 500)
  assert.equal(a.detail.after.cap, 750)
})

await test('override: owner only, needs a reason, applies to this month', async () => {
  const { repo, s } = setup()
  assert.equal((await svc.overrideCap(repo, OWNER, 200, '')).ok, false)
  assert.equal((await svc.overrideCap(repo, OWNER, 200, 'Admissions week')).ok, true)
  const v = await svc.loadSettings(repo, OWNER)
  assert.ok(v.ok && v.settings.spend.overrideActive && v.settings.spend.budgetInr === 700)
  assert.equal((await svc.overrideCap(repo, OWNER, 0, 'back to normal')).ok, true)
  assert.equal(s.settings.cap_override, null)
})

await test('static: the inbox UI never injects HTML and the browser bundle imports no server module values', async () => {
  const ui = readFileSync(join(process.cwd(), 'app', 'leads', 'whatsapp', 'InboxClient.tsx'), 'utf8')
  assert.ok(!/dangerouslySetInnerHTML|innerHTML|eval\(/.test(ui))
  // Server-only modules may appear only as `import type`.
  for (const line of ui.split('\n').filter(l => /from '@\/lib\/whatsapp\//.test(l))) {
    assert.match(line, /^import type /, line)
  }
  assert.ok(!/process\.env/.test(ui), 'no env reads in the client')
  // Self-check: the pattern would catch an injection if one were added.
  assert.ok(/dangerouslySetInnerHTML/.test('<div dangerouslySetInnerHTML={{__html: x}} />'))
})

await test('delete: owner only, needs DELETE, removes chat and contact but keeps the CRM lead', async () => {
  const { repo, s, asha } = setup()
  const leadId = asha.ct.lead_id
  assert.equal((await svc.deleteContactData(repo, counsellor, asha.ct.id, 'DELETE')).ok, false)
  assert.equal((await svc.deleteContactData(repo, OWNER, asha.ct.id, 'delete')).ok, false)
  assert.equal((await svc.deleteContactData(repo, OWNER, asha.ct.id, 'DELETE')).ok, true)
  assert.equal(s.contacts.some(c => c.id === asha.ct.id), false)
  assert.equal(s.messages.some(m => m.conversation_id === asha.cv.id), false)
  assert.equal(s.notes.some(n => n.conversation_id === asha.cv.id), false)
  assert.ok(s.leads.some(l => l.id === leadId), 'CRM lead kept')
  assert.ok(!JSON.stringify(s.audit).includes('Asha'))
})

await test('opt-out hint: STOP after the last consent record shows; a recorded No clears it', async () => {
  const { repo, s, ravi } = setup()
  const t0 = await svc.loadThread(repo, OWNER, ravi.cv.id)
  assert.ok(t0.ok && !t0.thread.optOutHint)
  s.messages.push({ ...s.messages.find(m => m.conversation_id === ravi.cv.id)!, id: 'x1', body: 'STOP', created_at: new Date().toISOString() })
  const t1 = await svc.loadThread(repo, OWNER, ravi.cv.id)
  assert.ok(t1.ok && t1.thread.optOutHint)
  await svc.recordConsent(repo, OWNER, { contactId: ravi.ct.id, purpose: 'service', granted: false, source: 'whatsapp_message', evidence: 'Replied STOP' })
  const t2 = await svc.loadThread(repo, OWNER, ravi.cv.id)
  assert.ok(t2.ok && !t2.thread.optOutHint)
  assert.equal(svc.looksLikeOptOut([{ direction: 'inbound', type: 'text', body: 'please stop calling at work', created_at: 'z' }], null), false, 'only short opt-out messages')
  assert.equal(svc.looksLikeOptOut([{ direction: 'inbound', type: 'text', body: 'Band karo', created_at: 'z' }], null), true)
})

await test('opt-out: a STOP message blocks the next reply at once, with nothing sent or stored', async () => {
  const { repo, s, asha } = setup()
  s.settings.sending_enabled = true
  s.messages.push({ id: 'stop1', conversation_id: asha.cv.id, direction: 'inbound', type: 'text', body: 'STOP', status: null, status_rank: 0,
    send_state: null, error_code: null, error_title: null, sent_by: null, meta_timestamp: null, created_at: new Date().toISOString(), client_ref: null, wamid: 'wamid.stop1' } as any)
  const m = meta()
  const before = s.messages.length
  for (const kind of ['text', 'request_phone'] as const) {
    const r = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: ref(), kind, text: 'one more thing' })
    assert.equal(r.ok, false, kind)
  }
  assert.equal(m.calls.length, 0)
  assert.equal(s.messages.length, before)
  // The repo's locked check refuses too, if the early check were skipped.
  const direct = await repo.reserveOutbound(asha.cv.id, ref(), 'text', 'x', {}, 'owner')
  assert.equal(direct.blocked, 'opted_out')
  const t = await svc.loadThread(repo, OWNER, asha.cv.id)
  assert.equal(t.ok && t.thread.canCall, false, 'Call now is blocked after STOP even with a call Yes on file')
})

await test('calls: Call now needs a recorded Yes; a No to replies also records a No to calls', async () => {
  const { repo, asha, imran } = setup()
  const a = await svc.loadThread(repo, OWNER, asha.cv.id)
  assert.equal(a.ok && a.thread.canCall, true, 'Asha has a call Yes from the enquiry form')
  const i = await svc.loadThread(repo, OWNER, imran.cv.id)
  assert.equal(i.ok && i.thread.canCall, false, 'no record: starting a chat is not permission to call')
  assert.equal((await svc.recordConsent(repo, OWNER, { contactId: asha.ct.id, purpose: 'service', granted: false, source: 'whatsapp_message', evidence: 'Asked us to stop' })).ok, true)
  const cur = svc.currentConsent(await repo.getConsent(asha.ct.id))
  assert.equal(cur.counselling_call?.granted, false)
  const a2 = await svc.loadThread(repo, OWNER, asha.cv.id)
  assert.equal(a2.ok && a2.thread.canCall, false)
})

await test('QA R2: recording fails after Meta accepted; the answer is "unknown" and a retry never sends twice', async () => {
  const { repo, s, asha } = setup()
  s.settings.sending_enabled = true
  const m = meta()
  const realFinish = repo.finishOutbound
  repo.finishOutbound = async () => { throw Object.assign(new Error('db down'), { code: '57014' }) }
  const cr = ref()
  const r = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: 'Fee details' })
  assert.equal(r.ok && r.state, 'unknown')
  assert.equal(m.calls.length, 1)
  repo.finishOutbound = realFinish
  const again = await svc.sendReply(repo, env, m.f, OWNER, { convId: asha.cv.id, clientRef: cr, kind: 'text', text: 'Fee details' })
  assert.equal(again.ok && again.duplicate, true)
  assert.equal(m.calls.length, 1, 'Meta was called once in total')
})

console.log(`\n${passed} inbox service tests passed`)
