// Hit every URL from valid-urls.json against production. Follows redirects
// up to 3 hops; reports the final status. Batched at 20 concurrent to keep
// the run under a couple of minutes without hammering the origin.
import { readFileSync, writeFileSync } from 'fs'

const HOST = 'https://edifyedu.in'
const urls = JSON.parse(readFileSync('lib/data/valid-urls.json', 'utf8'))
console.log(`Sweeping ${urls.length} URLs from valid-urls.json…`)

const bust = Date.now()
const results = []
const concurrency = 20
let idx = 0
let done = 0

async function hitOne(path) {
  const url = `${HOST}${path}?_v=${bust}`
  const t0 = Date.now()
  try {
    // Follow up to 3 redirects, capture final status. AbortSignal for safety.
    const controller = new AbortController()
    const to = setTimeout(() => controller.abort(), 20000)
    let r = await fetch(url, { redirect: 'manual', headers: { 'cache-control': 'no-cache' }, signal: controller.signal })
    let hops = 0
    while ([301, 302, 307, 308].includes(r.status) && hops < 3) {
      const loc = r.headers.get('location')
      if (!loc) break
      const next = loc.startsWith('http') ? loc : `${HOST}${loc}`
      r = await fetch(next, { redirect: 'manual', headers: { 'cache-control': 'no-cache' }, signal: controller.signal })
      hops++
    }
    clearTimeout(to)
    return { path, status: r.status, hops, ms: Date.now() - t0 }
  } catch (e) {
    return { path, status: 0, hops: 0, ms: Date.now() - t0, error: String(e).slice(0, 120) }
  }
}

async function worker() {
  while (idx < urls.length) {
    const my = idx++
    const r = await hitOne(urls[my])
    results.push(r)
    done++
    if (done % 100 === 0) console.log(`  ${done}/${urls.length}…`)
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

// Tally
const byStatus = new Map()
for (const r of results) byStatus.set(r.status, (byStatus.get(r.status) || 0) + 1)
console.log('\n=== Status distribution ===')
for (const [status, n] of [...byStatus.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`  ${status || 'error'}: ${n}`)
}

const bad = results.filter(r => r.status !== 200)
if (bad.length === 0) {
  console.log('\n✓ Every URL returned 200 (after up to 3 redirect hops).')
} else {
  console.log(`\n✗ ${bad.length} URL(s) did not resolve to 200:`)
  for (const b of bad.slice(0, 40)) {
    console.log(`  [${b.status}${b.error ? ' ' + b.error : ''}] ${b.path}`)
  }
  if (bad.length > 40) console.log(`  … +${bad.length - 40} more`)
  writeFileSync('audits/live-sweep-failures.json', JSON.stringify(bad, null, 2))
  console.log('\n(full failure list written to audits/live-sweep-failures.json)')
}
