#!/usr/bin/env node
// Live smoke check for edifyedu.in, run by qa-checker after each deploy.
//
// Usage:
//   node scripts/check-live.mjs                 # default sample of core templates
//   node scripts/check-live.mjs /path1 /path2   # specific paths
//   node scripts/check-live.mjs --sitemap 40    # up to 40 sitemap URLs per template
//
// Each URL must return 200, carry a self-referencing canonical, one H1,
// no noindex, and JSON-LD that parses. The script also prints x-vercel-cache
// and age so a stale prerender is visible: ?cb= can bypass Cloudflare but not
// always the Vercel cache. Exit code 1 on any failure.

const BASE = 'https://edifyedu.in'
const UA = 'Mozilla/5.0 (compatible; EdifyLiveCheck/1.0)'
const DEFAULT = [
  '/',
  '/programs/mba',
  '/universities',
  '/universities/nmims-online',
  '/universities/nmims-online/mba',
  '/universities/amity-university-online/mba',
  '/compare/nmims-vs-symbiosis',
  '/verify',
  '/blog',
  '/tools/cgpa-calculator',
]

const m1 = (re, s) => { const m = s.match(re); return m ? m[1] : null }

async function sitemapSample(per) {
  const xml = await (await fetch(`${BASE}/sitemap.xml?cb=${Date.now()}`, { headers: { 'user-agent': UA } })).text()
  const paths = [...xml.matchAll(/<loc>https:\/\/edifyedu\.in([^<]*)<\/loc>/g)].map(m => m[1] || '/')
  const groups = {}
  for (const p of paths) {
    const s = p.split('/').filter(Boolean)
    const k = s[0] === 'universities' ? `uni-${s.length}` : (s[0] || 'home') + (s.length > 1 ? '/*' : '')
    ;(groups[k] ||= []).push(p)
  }
  const out = []
  for (const arr of Object.values(groups)) {
    const step = Math.max(1, arr.length / per)
    for (let i = 0; i < Math.min(per, arr.length); i++) out.push(arr[Math.floor(i * step)])
  }
  return out
}

async function check(path) {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}cb=${Date.now()}`
  const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'manual' })
  const res = { path, status: r.status, vercel: r.headers.get('x-vercel-cache'), age: r.headers.get('age'), problems: [] }
  if (r.status !== 200) { res.problems.push(`status ${r.status} ${r.headers.get('location') || ''}`); return res }
  const h = await r.text()
  const head = h.split('</head>')[0]
  const canon = m1(/<link rel="canonical" href="([^"]*)"/i, head)
  const expect = path === '/' ? [BASE, `${BASE}/`] : [`${BASE}${path.split('?')[0]}`]
  if (!expect.includes(canon)) res.problems.push(`canonical ${canon}`)
  const robots = m1(/<meta name="robots" content="([^"]*)"/i, head) || ''
  if (/noindex/i.test(robots) || /noindex/i.test(r.headers.get('x-robots-tag') || '')) res.problems.push(`robots ${robots}`)
  const h1 = (h.slice(head.length).match(/<h1[\s>]/gi) || []).length
  if (h1 !== 1) res.problems.push(`h1 count ${h1}`)
  for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]) } catch { res.problems.push('json-ld parse error') }
  }
  return res
}

const args = process.argv.slice(2)
let paths = DEFAULT
if (args[0] === '--sitemap') paths = await sitemapSample(Number(args[1] || 20))
// Git Bash on Windows rewrites "/blog/x" into "C:/.../Git/blog/x"; undo that.
else if (args.length) paths = args.map(a => a.replace(/^[A-Za-z]:[\\/].*?[\\/]Git(?=[\\/])/, '').replace(/\\/g, '/'))

let fail = 0
for (const p of paths) {
  const r = await check(p).catch(e => ({ path: p, problems: [String(e)] }))
  const ok = r.problems.length === 0
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.status ?? '-'} vercel=${r.vercel ?? '-'} age=${r.age ?? '-'} ${p}${ok ? '' : '  ' + r.problems.join('; ')}`)
  await new Promise(res => setTimeout(res, 150))
}
console.log(`\n${paths.length - fail}/${paths.length} pass`)
process.exit(fail ? 1 : 0)
