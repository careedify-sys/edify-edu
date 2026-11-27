// Inbox additions: template sends after the window, a new chat by number,
// image/PDF sends, consent and opt-in rules, and retry without a double send.
// Run: npx tsx lib/whatsapp/inbox-extras.test.mts
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mockInboxRepo } from './inbox-mock'
import { mockCampaignRepo } from './campaign-mock'
import * as x from './inbox-extras'
import { OWNER } from './access'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}
const bad = (r: unknown, re: RegExp) => { assert.equal((r as { ok: boolean }).ok, false, JSON.stringify(r)); assert.match((r as { error: string }).error, re) }

function setup(sendingOn = true) {
  const inbox = mockInboxRepo()
  inbox.state.settings.sending_enabled = sendingOn
  const crepo = mockCampaignRepo()
  const calls: Array<{ url: string; body: unknown }> = []
  const f = (async (url: string, init?: { body?: unknown }) => {
    const u = String(url)
    calls.push({ url: u, body: typeof init?.body === 'string' ? JSON.parse(init.body) : null })
    if (u.endsWith('/media')) return { status: 200, json: async () => ({ id: 'mediaX' }) }
    return { status: 200, json: async () => ({ messages: [{ id: `wamid.${calls.length}` }] }) }
  }) as unknown as typeof fetch
  const store = x.mockExtrasStore(inbox, new Set(), async id => (await crepo.getTemplate(id))?.category ?? null)
  const env = { token: 't', phoneNumberId: 'PNID', wabaId: 'w', appId: 'a', appSecret: 's', version: 'v26.0' }
  return { inbox, crepo, store, calls, ctx: { store, crepo, inbox, env, f } }
}
const tplId = async (crepo: ReturnType<typeof mockCampaignRepo>) => (await crepo.templates()).find(t => t.status === 'APPROVED')!.id
const closedConv = (inbox: ReturnType<typeof mockInboxRepo>) => inbox.state.convs.find(c => c.last_message_preview === 'Thanks')!
const sends = (calls: Array<{ url: string }>) => calls.filter(c => c.url.endsWith('/messages')).length

await test('only approved Marketing/Utility templates are offered', async () => {
  const { crepo } = setup()
  const u = x.usableTemplates(await crepo.templates())
  assert.ok(u.length >= 1)
  assert.ok(u.every(t => t.category === 'MARKETING' || t.category === 'UTILITY'))
  assert.ok(!u.some(t => t.name === 'referral_reminder_mock' || t.name === 'referral_offer_mock'))
})

await test('Marketing template to a number without marketing consent is blocked; nothing sent', async () => {
  const { ctx, crepo, inbox, calls } = setup()
  const r = await x.sendTemplateMessage(ctx, OWNER, { convId: closedConv(inbox).id, templateId: await tplId(crepo), clientRef: randomUUID() })
  bad(r, /marketing consent/)
  assert.equal(sends(calls), 0)
})

await test('with consent: template sends after the window closed; a retry with the same ref does not resend', async () => {
  const { ctx, crepo, inbox, calls } = setup()
  const cv = closedConv(inbox)
  await inbox.addConsent(cv.contact_id, { purpose: 'marketing', granted: true, source: 'admin_entry', evidence: 'test', recorded_by: 'owner' } as never)
  const ref = randomUUID(); const templateId = await tplId(crepo)
  const r = await x.sendTemplateMessage(ctx, OWNER, { convId: cv.id, templateId, clientRef: ref })
  assert.ok(r.ok && r.state === 'accepted', JSON.stringify(r))
  const sent = calls.find(c => c.url.endsWith('/messages'))!.body as { type: string; template: { name: string } }
  assert.equal(sent.type, 'template'); assert.equal(sent.template.name, 'referral_invite_mock')
  const again = await x.sendTemplateMessage(ctx, OWNER, { convId: cv.id, templateId, clientRef: ref })
  assert.ok(again.ok && again.duplicate)
  assert.equal(sends(calls), 1)
})

await test('sending switched off blocks template sends', async () => {
  const { ctx, crepo, inbox } = setup(false)
  bad(await x.sendTemplateMessage(ctx, OWNER, { convId: closedConv(inbox).id, templateId: await tplId(crepo), clientRef: randomUUID() }), /switched off/)
})

await test('new chat: opt-in confirmation and a valid Indian mobile are required; signed-out caller cannot send', async () => {
  const { ctx, crepo, calls } = setup()
  const templateId = await tplId(crepo)
  bad(await x.startChat(ctx, OWNER, { phone: '9876501234', templateId, clientRef: randomUUID(), confirmOptIn: false }), /agreed to receive/)
  bad(await x.startChat(ctx, OWNER, { phone: '12345', templateId, clientRef: randomUUID(), confirmOptIn: true }), /10-digit/)
  bad(await x.startChat(ctx, null, { phone: '9876501234', templateId, clientRef: randomUUID(), confirmOptIn: true }), /permission/)
  assert.equal(sends(calls), 0)
})

await test('new chat to a new number creates the conversation; Marketing still needs consent', async () => {
  const { ctx, crepo, inbox } = setup()
  const before = inbox.state.convs.length
  const r = await x.startChat(ctx, OWNER, { phone: '98765 01234', templateId: await tplId(crepo), clientRef: randomUUID(), confirmOptIn: true })
  bad(r, /marketing consent/)
  assert.equal(inbox.state.convs.length, before + 1)
  assert.ok(inbox.state.contacts.some(c => c.phone_e164 === '+919876501234'))
})

await test('file send: needs an inbox (outbound) file and an open window', async () => {
  const { ctx, crepo, inbox, calls } = setup()
  const open = inbox.state.convs.find(c => c.last_message_preview?.startsWith('Is the MBA fee'))!
  const header = await crepo.saveMedia({ purpose: 'template_header', kind: 'image', file_name: 'h.png', mime: 'image/png', size_bytes: 3, sha256: 'x', created_by: 'owner' }, new Uint8Array([1, 2, 3]))
  bad(await x.sendFile(ctx, OWNER, { convId: open.id, fileId: header.id, caption: '', clientRef: randomUUID() }), /uploaded for the inbox/)
  const pdf = await crepo.saveMedia({ purpose: 'outbound', kind: 'document', file_name: 'brochure.pdf', mime: 'application/pdf', size_bytes: 3, sha256: 'y', created_by: 'owner' }, new Uint8Array([1, 2, 3]))
  const r = await x.sendFile(ctx, OWNER, { convId: open.id, fileId: pdf.id, caption: 'Fee sheet', clientRef: randomUUID() })
  assert.ok(r.ok && r.state === 'accepted', JSON.stringify(r))
  const sent = calls.find(c => c.url.endsWith('/messages'))!.body as { type: string; document: { id: string; filename: string; caption: string } }
  assert.equal(sent.type, 'document'); assert.equal(sent.document.id, 'mediaX'); assert.equal(sent.document.filename, 'brochure.pdf'); assert.equal(sent.document.caption, 'Fee sheet')
  bad(await x.sendFile(ctx, OWNER, { convId: closedConv(inbox).id, fileId: pdf.id, caption: '', clientRef: randomUUID() }), /window is closed/)
})

await test('thread facts: unknown conversation refused; auto-off flag reflects the shared switch', async () => {
  const off = new Set<string>()
  const inbox = mockInboxRepo(); const crepo = mockCampaignRepo()
  const store = x.mockExtrasStore(inbox, off)
  const id = inbox.state.convs[0].id
  bad(await x.threadExtras(store, crepo, OWNER, randomUUID()), /Unknown/)
  const a = await x.threadExtras(store, crepo, OWNER, id); assert.ok(a.ok && !a.facts.autoOff)
  off.add(id)
  const b = await x.threadExtras(store, crepo, OWNER, id); assert.ok(b.ok && b.facts.autoOff)
})

console.log(`\n${passed} passed`)
