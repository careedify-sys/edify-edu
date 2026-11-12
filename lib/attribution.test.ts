// Run with: npx tsx lib/attribution.test.ts
import assert from 'node:assert/strict'
import { deriveChannel, parseAttribution, attributionColumns, attributionFromLocation } from './attribution'

// ── deriveChannel: every row of the mapping ────────────────────────────────
const cases: Array<[string, string, string]> = [
  // [utm_source, referrer host, expected]
  ['youtube', '', 'youtube'],
  ['Instagram', 'l.instagram.com', 'instagram'],
  ['reddit', 'google.com', 'reddit'],          // UTM wins over referrer
  ['quora', '', 'quora'],
  ['whatsapp', '', 'whatsapp'],
  ['facebook', '', 'facebook'],
  ['linkedin', '', 'linkedin'],
  ['', 'chatgpt.com', 'ai-assistant'],
  ['', 'chat.openai.com', 'ai-assistant'],
  ['', 'perplexity.ai', 'ai-assistant'],
  ['', 'www.perplexity.ai', 'ai-assistant'],
  ['', 'gemini.google.com', 'ai-assistant'],    // AI before Google
  ['', 'copilot.microsoft.com', 'ai-assistant'],
  ['', 'google.com', 'organic-search'],
  ['', 'www.google.co.in', 'organic-search'],
  ['', 'google.com.au', 'organic-search'],
  ['', 'bing.com', 'organic-search'],
  ['', 'duckduckgo.com', 'organic-search'],
  ['', 'search.yahoo.com', 'organic-search'],
  ['', 'www.youtube.com', 'youtube'],
  ['', 'm.youtube.com', 'youtube'],
  ['', 'youtu.be', 'youtube'],
  ['', 'instagram.com', 'instagram'],
  ['', 'l.instagram.com', 'instagram'],
  ['', 'facebook.com', 'facebook'],
  ['', 'l.facebook.com', 'facebook'],
  ['', 'm.facebook.com', 'facebook'],
  ['', 'reddit.com', 'reddit'],
  ['', 'old.reddit.com', 'reddit'],
  ['', 'quora.com', 'quora'],
  ['', 'linkedin.com', 'linkedin'],
  ['', 'lnkd.in', 'linkedin'],
  ['', 'wa.me', 'whatsapp'],
  ['', 'web.whatsapp.com', 'whatsapp'],
  ['', 'example.org', 'referral:example.org'],
  ['', 'notgoogle.com', 'referral:notgoogle.com'],
  ['', '', 'direct'],
]
for (const [us, host, want] of cases) {
  assert.equal(deriveChannel(us, host), want, `deriveChannel(${JSON.stringify(us)}, ${JSON.stringify(host)})`)
}
console.log(`PASS · deriveChannel: ${cases.length} cases`)

// ── parseAttribution never throws ───────────────────────────────────────────
assert.equal(parseAttribution(undefined), null)
assert.equal(parseAttribution('not json'), null)
assert.equal(parseAttribution('%E0%A4%A'), null)
assert.equal(parseAttribution('"a string"'), null)
const good = { lp: '/blog/x', ref: 'youtube.com/watch', us: 'youtube', um: 'video', uc: 'smu-review', uct: '', ts: 1 }
assert.deepEqual(parseAttribution(JSON.stringify(good)), good)
assert.deepEqual(parseAttribution(encodeURIComponent(JSON.stringify(good))), good)
assert.equal(parseAttribution(JSON.stringify({ ...good, lp: 'x'.repeat(500) }))!.lp.length, 200)
console.log('PASS · parseAttribution')

// ── attributionColumns ─────────────────────────────────────────────────────
assert.equal(attributionColumns(null).channel, 'direct')
assert.equal(attributionColumns(null).landing_page, null)
const cols = attributionColumns(parseAttribution(JSON.stringify(good)))
assert.equal(cols.channel, 'youtube')
assert.equal(cols.utm_campaign, 'smu-review')
assert.equal(cols.utm_content, null)
assert.equal(attributionColumns({ ...good, us: '' }).channel, 'youtube') // from the referrer host
console.log('PASS · attributionColumns')

// ── attributionFromLocation: last non-direct touch ─────────────────────────
const t = 1000
assert.equal(attributionFromLocation('https://edifyedu.in/blog/a', '', 'edifyedu.in', t), null, 'direct visit leaves cookie')
assert.equal(attributionFromLocation('https://edifyedu.in/blog/a', 'https://edifyedu.in/', 'edifyedu.in', t), null, 'internal nav')
assert.equal(attributionFromLocation('https://edifyedu.in/blog/a', 'https://www.edifyedu.in/x', 'edifyedu.in', t), null, 'www internal nav')
assert.equal(attributionFromLocation('http://localhost:3000/a', 'http://localhost:3000/', 'localhost', t), null, 'local internal nav')
assert.deepEqual(
  attributionFromLocation('https://edifyedu.in/blog/smu-online-mba-review?utm_source=YouTube&utm_medium=video&utm_campaign=smu-review', '', 'edifyedu.in', t),
  { lp: '/blog/smu-online-mba-review', ref: '', us: 'youtube', um: 'video', uc: 'smu-review', uct: '', ts: t },
)
assert.deepEqual(
  attributionFromLocation('https://edifyedu.in/blog/a', 'https://www.google.com/', 'edifyedu.in', t),
  { lp: '/blog/a', ref: 'google.com', us: '', um: '', uc: '', uct: '', ts: t },
)
assert.equal(
  attributionFromLocation('https://edifyedu.in/a', 'https://www.youtube.com/watch?v=abc&name=secret', 'edifyedu.in', t)!.ref,
  'youtube.com/watch',
  'referrer query string is dropped',
)
console.log('PASS · attributionFromLocation')
