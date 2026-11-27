// Phase 4 template tests: Meta's button grouping, the referral link token,
// the send payload, upload checks, header submit, edit, delete and media id
// reuse. Mock repo and fake fetch only: nothing reaches Meta or Supabase.
// Run: npx tsx lib/whatsapp/template-service.test.mts
import assert from 'node:assert/strict'
import { mockCampaignRepo } from './campaign-mock'
import { checkButtons, sendPlan, templatePayload, REFER_URL_VAR, reasonText, errorText } from './template-rules'
import { checkUpload, sniff } from './media-check'
import { needsParameters } from './campaign-text'
import * as ts from './template-service'
import { OWNER, type Actor } from './access'
import type { GraphEnv } from './graph'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}
const COUNSELLOR: Actor = { id: 'c1', role: 'counsellor' }
const env: GraphEnv = { token: 'T', phoneNumberId: 'PN', wabaId: 'WABA', appId: 'APP', appSecret: 'S', version: 'v26.0' }
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34])

type Call = { url: string; method: string; headers: Record<string, string>; body: unknown }
function fakeMeta(answers: Array<(c: Call) => [number, unknown] | null>) {
  const calls: Call[] = []
  const f = (async (url: string, init: RequestInit = {}) => {
    const c: Call = { url: String(url), method: String(init.method ?? 'GET'), headers: (init.headers ?? {}) as Record<string, string>, body: init.body }
    calls.push(c)
    for (const a of answers) { const r = a(c); if (r) return { status: r[0], ok: r[0] < 300, json: async () => r[1], headers: new Headers() } as unknown as Response }
    return { status: 404, ok: false, json: async () => ({ error: { code: 100, message: 'no route' } }), headers: new Headers() } as unknown as Response
  }) as unknown as typeof fetch
  return { f, calls }
}

const referralButtons = [
  { type: 'URL' as const, text: 'Refer a Friend', url: REFER_URL_VAR },
  { type: 'QUICK_REPLY' as const, text: 'Know More' },
  { type: 'QUICK_REPLY' as const, text: 'Stop Promotions' },
]

await test('buttons: URL then two quick replies is valid; split quick replies are refused', () => {
  assert.equal(checkButtons(referralButtons), null)
  assert.match(checkButtons([referralButtons[1], referralButtons[0], referralButtons[2]])!, /together/)
  assert.equal(checkButtons([referralButtons[1], referralButtons[2], referralButtons[0]]), null)
  assert.match(checkButtons([{ type: 'URL', text: 'x', url: 'https://edifyedu.in/{{1}}' }])!, /only link with a variable/)
  assert.match(checkButtons([{ type: 'URL', text: 'a', url: 'https://a.in' }, { type: 'URL', text: 'b', url: 'https://b.in' }, { type: 'URL', text: 'c', url: 'https://c.in' }])!, /2 website/)
})

await test('send plan: image header needs a file; referral link takes the campaign token; payload shape', () => {
  const comps = [{ type: 'HEADER', format: 'IMAGE' }, { type: 'BODY', text: 'Refer a friend' }, { type: 'BUTTONS', buttons: [{ type: 'URL', text: 'Refer a Friend', url: REFER_URL_VAR }, { type: 'QUICK_REPLY', text: 'Know More' }] }]
  assert.match(needsParameters(comps)!, /Attach the image/)
  assert.equal(needsParameters(comps, true), null)
  const p = sendPlan(comps, true); assert.ok(p.ok)
  if (!p.ok) return
  assert.deepEqual(p.plan, { header: { kind: 'image' }, urlTokenButtons: [0] })
  const payload = templatePayload('ref_invite', 'en', p.plan, { mediaId: '123', refToken: '0123456789abcdef' }) as any
  assert.deepEqual(payload.template.components, [
    { type: 'header', parameters: [{ type: 'image', image: { id: '123' } }] },
    { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: '0123456789abcdef' }] },
  ])
  assert.throws(() => templatePayload('x', 'en', p.plan, { mediaId: '1', refToken: '+919800000001' }))
  assert.match(needsParameters([{ type: 'BODY', text: 'Hi {{1}}' }])!, /personalised/)
  assert.match(needsParameters([{ type: 'HEADER', format: 'VIDEO' }, { type: 'BODY', text: 'x' }], true)!, /video/)
  // Plain text template: no components in the payload, as before.
  const plain = sendPlan([{ type: 'BODY', text: 'x' }], false)
  assert.ok(plain.ok && !('components' in (templatePayload('t', 'en', plain.plan, {}) as any).template))
})

await test('uploads: type must match the bytes; size and kind limits', () => {
  assert.equal(sniff(PNG), 'png'); assert.equal(sniff(PDF), 'pdf')
  assert.ok(checkUpload('template_header', 'promo.png', 'image/png', PNG).ok)
  assert.match((checkUpload('template_header', 'promo.png', 'image/jpeg', PNG) as any).error, /does not match/)
  assert.match((checkUpload('template_header', 'brochure.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', new Uint8Array([0x50, 0x4b, 3, 4])) as any).error, /Template headers/)
  assert.ok(checkUpload('outbound', 'brochure.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', new Uint8Array([0x50, 0x4b, 3, 4])).ok)
  assert.match((checkUpload('outbound', 'big.pdf', 'application/pdf', new Uint8Array(4 * 1024 * 1024 + 1)) as any).error, /4 MB/)
  assert.match((checkUpload('outbound', 'x.exe', 'application/x-msdownload', PNG) as any).error, /cannot be sent/)
  assert.equal((checkUpload('outbound', '../../etc\u0000/passwd.pdf', 'application/pdf', PDF) as any).file.fileName, '....etcpasswd.pdf')
})

await test('upload permission: header files are owner-only, inbox files need send', async () => {
  const repo = mockCampaignRepo()
  assert.equal((await ts.uploadFile(repo, COUNSELLOR, 'template_header', 'p.png', 'image/png', PNG)).ok, false)
  assert.equal((await ts.uploadFile(repo, COUNSELLOR, 'outbound', 'b.pdf', 'application/pdf', PDF)).ok, true)
  assert.equal((await ts.uploadFile(repo, null, 'outbound', 'b.pdf', 'application/pdf', PDF)).ok, false)
})

await test('submit with an image header: resumable upload, then create with the handle; file id stored', async () => {
  const repo = mockCampaignRepo()
  const up = await ts.uploadFile(repo, OWNER, 'template_header', 'promo.png', 'image/png', PNG)
  assert.ok(up.ok)
  if (!up.ok) return
  const { f, calls } = fakeMeta([
    c => c.url.includes('/APP/uploads?') ? [200, { id: 'upload:abc' }] : null,
    c => c.url.endsWith('/upload:abc') ? [200, { h: '4::handle' }] : null,
    c => c.url.includes('/WABA/message_templates') && c.method === 'POST' ? [200, { id: '777', status: 'PENDING', category: 'MARKETING' }] : null,
  ])
  const r = await ts.submitTemplate(repo, OWNER, env, f, { name: 'referral_invite_img', language: 'en', category: 'MARKETING', body: 'Know someone planning an online degree? Refer them to edifyedu.in for free guidance.', buttons: referralButtons, headerFileId: up.id })
  assert.deepEqual(r, { ok: true, status: 'PENDING', category: 'MARKETING' })
  assert.equal(calls[1].headers.Authorization, 'OAuth T'); assert.equal(calls[1].headers.file_offset, '0')
  const sent = JSON.parse(String(calls[2].body))
  assert.deepEqual(sent.components[0], { type: 'HEADER', format: 'IMAGE', example: { header_handle: ['4::handle'] } })
  assert.deepEqual(sent.components.at(-1).buttons[0], { type: 'URL', text: 'Refer a Friend', url: REFER_URL_VAR, example: ['https://edifyedu.in/refer?c=0123456789abcdef'] })
  const t = (await repo.templates()).find(x => x.name === 'referral_invite_img')!
  assert.equal(t.header_file_id, up.id)
  // A bad draft never uploads the file.
  const n = calls.length
  const bad = await ts.submitTemplate(repo, OWNER, env, f, { name: 'Bad Name', language: 'en', category: 'MARKETING', body: 'x', headerFileId: up.id })
  assert.equal(bad.ok, false); assert.equal(calls.length, n)
})

await test('edit: only approved, rejected or paused; refused while a campaign uses it; never sends the category', async () => {
  const repo = mockCampaignRepo()
  const tpls = await repo.templates()
  const pending = tpls.find(t => t.status === 'PENDING')!
  const rejected = tpls.find(t => t.status === 'REJECTED')!
  const { f, calls } = fakeMeta([
    c => c.method === 'POST' && /\/mock_3$/.test(c.url) ? [200, { success: true }] : null,
    c => c.url.includes('/mock_3?fields=status') ? [200, { status: 'PENDING', category: 'MARKETING' }] : null,
  ])
  assert.match((await ts.editTemplateDraft(repo, OWNER, env, f, pending.id, { name: '', language: '', category: 'MARKETING', body: 'New text' }) as any).error, /pending/)
  // mock_3 is not numeric; the graph call refuses it before any request.
  const r = await ts.editTemplateDraft(repo, OWNER, env, f, rejected.id, { name: '', language: '', category: 'MARKETING', body: 'New text' })
  assert.equal(r.ok, false); assert.equal(calls.length, 0)
  await repo.updateTemplate(rejected.id, {}); (rejected as any).meta_id = '12345'
  const { f: f2, calls: c2 } = fakeMeta([
    c => c.method === 'POST' && c.url.endsWith('/12345') ? [200, { success: true }] : null,
    c => c.url.includes('/12345?fields=status') ? [200, { status: 'PENDING', category: 'MARKETING' }] : null,
  ])
  const ok = await ts.editTemplateDraft(repo, OWNER, env, f2, rejected.id, { name: 'ignored', language: 'xx', category: 'UTILITY', body: 'Refer a friend to edifyedu.in for neutral guidance.' })
  assert.deepEqual(ok, { ok: true, status: 'PENDING' })
  assert.deepEqual(Object.keys(JSON.parse(String(c2[0].body))), ['components'])
  assert.equal((await repo.getTemplate(rejected.id))!.name, 'referral_offer_mock')
  // In use by a draft campaign: refused.
  const approved = tpls.find(t => t.status === 'APPROVED')!
  await repo.createCampaign({ name: 'x', created_by: 'owner', batch_size: 50, daily_max: 250, budget_inr: null, template_id: approved.id, duplicated_from: null })
  ;(approved as any).meta_id = '999'
  assert.match((await ts.editTemplateDraft(repo, OWNER, env, f2, approved.id, { name: '', language: '', category: 'MARKETING', body: 'x' }) as any).error, /campaign/)
  assert.match((await ts.removeTemplate(repo, OWNER, env, f2, approved.id, approved.name) as any).error, /campaign/)
  assert.equal((await ts.editTemplateDraft(repo, COUNSELLOR, env, f2, rejected.id, { name: '', language: '', category: 'MARKETING', body: 'x' })).ok, false)
})

await test('delete: needs the typed name, calls Meta with name and hsm_id, marks DELETED', async () => {
  const repo = mockCampaignRepo()
  const t = (await repo.templates()).find(x => x.status === 'REJECTED')!
  ;(t as any).meta_id = '4242'
  const { f, calls } = fakeMeta([c => c.method === 'DELETE' ? [200, { success: true }] : null])
  assert.match((await ts.removeTemplate(repo, OWNER, env, f, t.id, 'wrong') as any).error, /Type the template name/)
  assert.equal(calls.length, 0)
  assert.deepEqual(await ts.removeTemplate(repo, OWNER, env, f, t.id, t.name), { ok: true })
  assert.match(calls[0].url, /\/WABA\/message_templates\?name=referral_offer_mock&hsm_id=4242$/)
  assert.equal((await repo.getTemplate(t.id))!.status, 'DELETED')
})

await test('media id: uploaded once, reused until 2 days before expiry, then refreshed', async () => {
  const repo = mockCampaignRepo()
  const up = await ts.uploadFile(repo, OWNER, 'template_header', 'promo.png', 'image/png', PNG)
  if (!up.ok) throw new Error('upload')
  let n = 0
  const { f, calls } = fakeMeta([c => c.url.endsWith('/PN/media') ? [200, { id: 'media' + (++n) }] : null])
  const now = Date.parse('2026-12-01T00:00:00Z')
  assert.equal((await ts.ensureMetaMediaId(repo, env, f, up.id, now) as any).mediaId, 'media1')
  assert.equal((await ts.ensureMetaMediaId(repo, env, f, up.id, now + 26 * 86_400_000) as any).mediaId, 'media1')
  assert.equal((await ts.ensureMetaMediaId(repo, env, f, up.id, now + 28 * 86_400_000) as any).mediaId, 'media2')
  assert.equal(calls.length, 2)
})

await test('plain-English reasons and errors', () => {
  assert.match(reasonText('PROMOTIONAL')!, /Marketing/)
  assert.equal(reasonText(null), null)
  assert.match(errorText(131047)!, /24-hour/)
  assert.match(errorText(131049)!, /24 hours/)
  assert.equal(errorText(1), null)
})

console.log(`\n${passed} template tests passed`)
