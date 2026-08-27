// Fetch production sitemap.xml, extract every <loc>, hit each URL, report.
import { writeFileSync } from 'fs'

const HOST = 'https://edifyedu.in'

console.log('Fetching sitemap.xml…')
const xml = await fetch(`${HOST}/sitemap.xml`).then(r => r.text())
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
console.log(`${urls.length} URLs in sitemap. Sweeping…`)

const bust = Date.now()
const results = []
const concurrency = 25
let idx = 0
let done = 0

async function hitOne(fullUrl) {
  const sep = fullUrl.includes('?') ? '&' : '?'
  const url = `${fullUrl}${sep}_v=${bust}`
  const t0 = Date.now()
  try {
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
    return { path: fullUrl.replace(HOST, ''), status: r.status, hops, ms: Date.now() - t0 }
  } catch (e) {
    return { path: fullUrl.replace(HOST, ''), status: 0, hops: 0, ms: Date.now() - t0, error: String(e).slice(0, 120) }
  }
}

async function worker() {
  while (idx < urls.length) {
    const my = idx++
    const r = await hitOne(urls[my])
    results.push(r)
    done++
    if (done % 250 === 0) console.log(`  ${done}/${urls.length}…`)
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()))

const byStatus = new Map()
for (const r of results) byStatus.set(r.status, (byStatus.get(r.status) || 0) + 1)
console.log('\n=== Status distribution ===')
for (const [status, n] of [...byStatus.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`  ${status || 'error'}: ${n}`)
}

const bad = results.filter(r => r.status !== 200)
if (bad.length === 0) {
  console.log(`\n✓ Every one of ${urls.length} sitemap URLs returned 200.`)
} else {
  console.log(`\n✗ ${bad.length} URL(s) did not resolve to 200:`)
  // Group by section
  const bySection = new Map()
  for (const b of bad) {
    const section = b.path.split('/')[1] || 'root'
    if (!bySection.has(section)) bySection.set(section, [])
    bySection.get(section).push(b)
  }
  for (const [section, list] of [...bySection.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n[${section}] ${list.length} failure(s):`)
    for (const b of list.slice(0, 15)) {
      console.log(`  [${b.status}${b.error ? ' ' + b.error : ''}] ${b.path}`)
    }
    if (list.length > 15) console.log(`  … +${list.length - 15} more in this section`)
  }
  writeFileSync('audits/live-sweep-sitemap-failures.json', JSON.stringify(bad, null, 2))
  console.log('\n(full failure list written to audits/live-sweep-sitemap-failures.json)')
}
