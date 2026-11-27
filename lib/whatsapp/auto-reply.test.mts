// Auto-reply tests: keyword matching, STOP, the runner's send path, one reply
// per message, the off switch, the sending switch and the Call Me note.
// The claim rules themselves (window, cap 4, takeover, opt-out) are tested
// against real SQL in sql-referrals.test.mts.
// Run: npx tsx lib/whatsapp/auto-reply.test.mts
import assert from 'node:assert/strict'
import { matchRule, isStop, autoClientRef, runAutoReplies, type AutoRule, type AutoStore, type Candidate, type AutoRuleKey } from './auto-reply'
import { mockInboxRepo } from './inbox-mock'
import type { GraphEnv } from './graph'

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) } catch (e) { console.error('FAIL', name); throw e }
}
const RULES: AutoRule[] = [
  { key: 'interested', enabled: true, keywords: ['yes', 'interested', 'i am interested', 'refer', 'i want to refer', 'refer a friend'], reply: 'Use https://edifyedu.in/refer' },
  { key: 'know_more', enabled: true, keywords: ['know more', 'more details', 'details', 'how does it work', 'info', 'tell me more'], reply: 'How it works...' },
  { key: 'reward', enabled: true, keywords: ['reward', 'payment', 'money', 'cash', 'how much', 'when will i get paid', 'amount'], reply: 'Rewards are paid within 7 days...' },
  { key: 'call_me', enabled: true, keywords: ['call me', 'call', 'callback', 'call back', 'please call', 'call me back'], reply: 'Our team will call you.' },
]
const key = (b: string) => { const m = matchRule(b, RULES); return m?.kind === 'rule' ? m.key : m?.kind ?? null }

await test('quick-reply button texts and typed keywords map to the right rule', () => {
  assert.equal(key('Know More'), 'know_more')
  assert.equal(key('Refer a Friend'), 'interested')
  assert.equal(key('YES'), 'interested')
  assert.equal(key('yes!'), 'interested')
  assert.equal(key('How much?'), 'reward')
  assert.equal(key('Please call me'), 'call_me')
  assert.equal(key('call me about the reward'), 'call_me')   // callback outranks reward
  assert.equal(key("I'm interested"), 'interested')          // apostrophes are ignored
  assert.equal(key('i am interested'), 'interested')
})

await test('STOP and Stop Promotions are opt-outs, never a rule', () => {
  for (const s of ['STOP', 'stop', 'Stop Promotions', 'stop promotions.', 'unsubscribe']) { assert.ok(isStop(s), s); assert.equal(key(s), 'stop') }
  assert.equal(isStop('please stop calling me about details'), false)
})

await test('negated replies are left for a person (QA F1)', () => {
  for (const b of ['not interested', 'no not interested', 'dont call me', "don't call me", 'do not call', 'Never call me', 'nahi chahiye', 'mat call karo', 'no reward needed'])
    assert.equal(key(b), null, b)
  // Control: the same keywords without a negation still match.
  assert.equal(key('interested'), 'interested')
  assert.equal(key('please call me'), 'call_me')
})

await test('long or unrecognised messages are left for a person', () => {
  assert.equal(key('Hi, my cousin wants an MBA but she works nights, can you share details for weekend batches'), null)
  assert.equal(key('Thanks'), null)
  assert.equal(key(''), null)
  assert.equal(key('🙏'), null)
})

await test('client ref is a stable uuid per message', () => {
  const a = autoClientRef('11111111-1111-4111-8111-111111111111')
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/)
  assert.equal(a, autoClientRef('11111111-1111-4111-8111-111111111111'))
  assert.notEqual(a, autoClientRef('22222222-2222-4222-8222-222222222222'))
})

// A fake store with the claim's one-row-per-message rule.
function fakeStore(cands: Candidate[], enabled = true) {
  const claims = new Map<string, { rule: AutoRuleKey | null; state: string; reason: string | null }>()
  let optOutRuns = 0
  const store: AutoStore = {
    async enabled() { return enabled },
    async rules() { return RULES },
    async candidates() { return cands.filter(c => !claims.has(c.message_id)) },
    async claim(id, rule) {
      if (claims.has(id)) return 'duplicate'
      const why = rule ? 'ok' : 'no_rule'
      claims.set(id, { rule, state: rule ? 'claimed' : 'skipped', reason: rule ? null : why }); return why
    },
    async finish(id, state, _o, reason) { const c = claims.get(id); if (c && c.state === 'claimed') { c.state = state; c.reason = reason } },
    async recordOptOuts() { optOutRuns++; return 1 },
  }
  return { store, claims, optOutRuns: () => optOutRuns }
}
const env: GraphEnv = { token: 'T', phoneNumberId: 'PN', wabaId: 'W', appId: 'A', appSecret: 'S', version: 'v26.0' }
function fakeMeta() {
  const sent: unknown[] = []
  const f = (async (_u: string, init: RequestInit = {}) => { sent.push(JSON.parse(String(init.body))); return { status: 200, ok: true, json: async () => ({ messages: [{ id: `wamid.${sent.length}` }] }), headers: new Headers() } as unknown as Response }) as unknown as typeof fetch
  return { f, sent }
}
function setup(bodies: string[], sending = true) {
  const inbox = mockInboxRepo()
  inbox.state.settings.sending_enabled = sending
  const conv = inbox.state.convs[0]
  const cands: Candidate[] = bodies.map((b, i) => ({ message_id: `00000000-0000-4000-8000-00000000000${i}`, conversation_id: conv.id, contact_id: conv.contact_id, type: 'text', body: b, created_at: new Date().toISOString() }))
  return { inbox, conv, cands }
}

await test('off switch: nothing is claimed or sent', async () => {
  const { inbox, cands } = setup(['YES'])
  const { store, claims } = fakeStore(cands, false)
  const m = fakeMeta()
  const s = await runAutoReplies(store, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(s.state, 'off'); assert.equal(claims.size, 0); assert.equal(m.sent.length, 0)
})

await test('a matching reply is sent once as sent_by automation; a rerun sends nothing', async () => {
  const { inbox, conv, cands } = setup(['Know More'])
  const { store, claims } = fakeStore(cands)
  const m = fakeMeta()
  const s1 = await runAutoReplies(store, inbox, env, m.f, { deadline: Date.now() + 5000 })
  const s2 = await runAutoReplies(store, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(s1.sent, 1); assert.equal(s2.seen, 0); assert.equal(m.sent.length, 1)
  const out = inbox.state.messages.filter(x => x.conversation_id === conv.id && x.sent_by === 'automation')
  assert.equal(out.length, 1); assert.equal(out[0].body, 'How it works...'); assert.equal(out[0].send_state, 'accepted')
  assert.equal([...claims.values()][0].state, 'sent')
})

await test('sending switched off: the claim is closed as failed and nothing goes to Meta', async () => {
  const { inbox, cands } = setup(['YES'], false)
  const { store, claims } = fakeStore(cands)
  const m = fakeMeta()
  const s = await runAutoReplies(store, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(m.sent.length, 0); assert.equal(s.skipped.sending_off, 1)
  assert.equal([...claims.values()][0].state, 'failed')
})

await test('STOP records opt-outs and sends nothing; unknown text is left alone', async () => {
  const { inbox, cands } = setup(['STOP', 'what is the fee for amity mba online for working people'])
  const fs = fakeStore(cands)
  const m = fakeMeta()
  const s = await runAutoReplies(fs.store, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(m.sent.length, 0); assert.equal(fs.optOutRuns(), 1)
  assert.equal(s.skipped.stop, 1); assert.equal(s.skipped.no_match, 1)
})

await test('Call Me sends the reply, adds a note and notifies the team', async () => {
  const { inbox, conv, cands } = setup(['call me'])
  const { store } = fakeStore(cands)
  const m = fakeMeta()
  const told: string[] = []
  await runAutoReplies(store, inbox, env, m.f, { deadline: Date.now() + 5000, notify: async i => { told.push(i.rule) } })
  assert.equal(m.sent.length, 1); assert.deepEqual(told, ['call_me'])
  assert.ok(inbox.state.notes.some(n => n.conversation_id === conv.id && /Callback requested/.test(n.body)))
})

await test('a disabled rule is not used', async () => {
  const { inbox, cands } = setup(['Know More'])
  const { store } = fakeStore(cands)
  const rules = RULES.map(r => r.key === 'know_more' ? { ...r, enabled: false } : r)
  store.rules = async () => rules
  const m = fakeMeta()
  const s = await runAutoReplies(store, inbox, env, m.f, { deadline: Date.now() + 5000 })
  assert.equal(m.sent.length, 0); assert.equal(s.skipped.no_match, 1)
})

await test('owner controls: ON needs typed confirm, counsellor cannot edit, STOP keyword refused', async () => {
  const { mockAutoAdminRepo, setAutomationEnabled, saveAutoRule, setConversationAuto } = await import('./auto-admin')
  const { OWNER } = await import('./access')
  const r = mockAutoAdminRepo()
  const C = { id: 'c1', role: 'counsellor' as const }
  assert.equal((await setAutomationEnabled(r, OWNER, true, 'yes')).ok, false)
  assert.equal((await setAutomationEnabled(r, C, true, 'ON')).ok, false)
  assert.equal((await setAutomationEnabled(r, OWNER, true, 'ON')).ok, true); assert.equal(r.state.enabled, true)
  assert.equal((await saveAutoRule(r, C, 'reward', { enabled: true, keywords: 'reward', reply: 'x' })).ok, false)
  assert.equal((await saveAutoRule(r, OWNER, 'reward', { enabled: true, keywords: 'reward, STOP', reply: 'x' })).ok, false)
  assert.equal((await saveAutoRule(r, OWNER, 'reward', { enabled: true, keywords: '', reply: 'x' })).ok, false)
  assert.equal((await saveAutoRule(r, OWNER, 'nope', { enabled: true, keywords: 'a', reply: 'x' })).ok, false)
  assert.equal((await saveAutoRule(r, OWNER, 'reward', { enabled: false, keywords: 'reward, reward, bonus', reply: 'Paid after admission.' })).ok, true)
  const rw = r.state.rules.find(x => x.key === 'reward')!
  assert.deepEqual(rw.keywords, ['reward', 'bonus']); assert.equal(rw.enabled, false)
  assert.equal((await setConversationAuto(r, C, 'not-a-uuid', true)).ok, false)
  assert.equal((await setConversationAuto(r, C, '00000000-0000-4000-8000-0000000000a1', true)).ok, true)
  assert.ok(r.state.off.has('00000000-0000-4000-8000-0000000000a1'))
})

console.log(`\n${passed} passed`)
