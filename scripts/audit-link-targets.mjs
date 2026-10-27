// scripts/audit-link-targets.mjs
// Crawls a host (production, or a local `next start`) and resolves every
// internal link target with redirects NOT followed, so a link into a 301/308 or
// a 404 is visible as such. audit-internal-link-graph.mjs counts inbound links
// but follows redirects, which hides exactly the two defect classes the
// Semrush audit of 27 Oct 2026 reported: 179 pages linking to 404s and 726
// links into redirects.
//
// Seeds: sitemap.xml plus BFS from "/", so pages outside the sitemap (verify,
// noindex hubs) are reached the way a crawler reaches them. Depth is clicks
// from "/".
//
// Read-only. Run: node scripts/audit-link-targets.mjs --host http://localhost:3000 --out audit.json
import { writeFileSync } from 'fs'
import * as cheerio from 'cheerio'

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d }
const HOST = arg('--host', 'https://edifyedu.in').replace(/\/$/, '')
const OUT = arg('--out', 'link-targets.json')
const CONCURRENCY = Number(arg('--concurrency', '12'))
const MAX_PAGES = Number(arg('--max', '8000'))

const norm = (href) => {
  if (!href) return null
  let h = href.trim()
  for (const p of [HOST, 'https://edifyedu.in', 'https://www.edifyedu.in']) if (h.startsWith(p)) h = h.slice(p.length)
  if (/^[a-z]+:/i.test(h) || h.startsWith('//')) return null
  if (h.startsWith('#')) return null
  h = h.split('#')[0].split('?')[0]
  if (!h.startsWith('/')) return null
  if (h.length > 1 && h.endsWith('/')) h = h.slice(0, -1)
  return h || '/'
}

async function fetchManual(path) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(HOST + path, { redirect: 'manual', headers: { 'user-agent': 'edify-link-audit' } })
      return r
    } catch (e) { await new Promise(res => setTimeout(res, 500 * (attempt + 1))) }
  }
  return null
}

// Resolve a target's redirect chain. Returns { status, final, finalStatus, hops }.
const resolved = new Map()
async function resolve(path) {
  if (resolved.has(path)) return resolved.get(path)
  const p = (async () => {
    let cur = path, hops = 0, first = null
    while (hops < 6) {
      const r = await fetchManual(cur)
      if (!r) return { status: 0, final: cur, finalStatus: 0, hops }
      if (first === null) first = r.status
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get('location')
        const n = norm(loc ? new URL(loc, HOST + cur).href : null)
        if (!n) return { status: first, final: loc, finalStatus: r.status, hops: hops + 1, external: true }
        cur = n; hops++; continue
      }
      // meta-refresh "redirects" from route redirect() render as 200 (see memory: soft-404 mechanism)
      return { status: first, final: cur, finalStatus: r.status, hops }
    }
    return { status: first, final: cur, finalStatus: -1, hops }
  })()
  resolved.set(path, p)
  return p
}

const pages = new Map()   // path -> { depth, links: string[], mailto: string[], cfEmail: number, robots }
const queue = []
const seen = new Set()
const enqueue = (path, depth) => { if (seen.has(path) || seen.size >= MAX_PAGES) return; seen.add(path); queue.push({ path, depth }) }

async function crawlPage(job) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await crawlPageOnce(job) } catch (e) { await new Promise(res => setTimeout(res, 1000 * (attempt + 1))) }
  }
  pages.set(job.path, { depth: job.depth, status: 0, links: [], error: true })
}

async function crawlPageOnce({ path, depth }) {
  const r = await fetchManual(path)
  if (!r) { pages.set(path, { depth, status: 0, links: [] }); return }
  if (r.status !== 200) { pages.set(path, { depth, status: r.status, links: [] }); return }
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('text/html')) { pages.set(path, { depth, status: 200, links: [], nonHtml: true }); return }
  const html = await r.text()
  const $ = cheerio.load(html)
  const links = []
  const mailto = []
  $('a[href]').each((_, a) => {
    const raw = $(a).attr('href')
    if (raw && raw.startsWith('mailto:')) mailto.push(raw)
    const n = norm(raw)
    if (n) links.push(n)
  })
  const robots = $('meta[name="robots"]').attr('content') || ''
  const cfEmail = (html.match(/cdn-cgi\/l\/email-protection/g) || []).length
  pages.set(path, { depth, status: 200, links, mailto, cfEmail, robots, bytes: html.length })
  for (const l of links) {
    if (l.startsWith('/_next') || l.startsWith('/api/') || /\.(png|jpe?g|svg|webp|pdf|xml|txt|ico)$/i.test(l)) continue
    enqueue(l, depth + 1)
  }
}

async function main() {
  enqueue('/', 0)
  const sm = await fetch(HOST + '/sitemap.xml').then(r => r.text()).catch(() => '')
  const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => norm(m[1])).filter(Boolean)
  // BFS from "/" first so depth is click depth; sitemap-only pages get depth Infinity unless reached.
  const smOnly = []
  let active = 0
  await new Promise(done => {
    const pump = () => {
      if (queue.length === 0 && active === 0) {
        if (smOnly.length === 0 && smUrls.length) { for (const u of smUrls) if (!seen.has(u)) { seen.add(u); smOnly.push(u) } ; smUrls.length = 0
          for (const u of smOnly) queue.push({ path: u, depth: Infinity }) }
        if (queue.length === 0) return done()
      }
      while (active < CONCURRENCY && queue.length) {
        const job = queue.shift(); active++
        crawlPage(job).finally(() => { active--; if (pages.size % 250 === 0) process.stderr.write(`pages ${pages.size} queue ${queue.length}\n`); pump() })
      }
    }
    pump()
  })

  // Resolve every distinct target.
  const targets = new Set()
  for (const p of pages.values()) for (const l of p.links) targets.add(l)
  const list = [...targets]
  const results = {}
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    await Promise.all(list.slice(i, i + CONCURRENCY).map(async t => { results[t] = await resolve(t) }))
  }
  const pageOut = {}
  for (const [k, v] of pages) pageOut[k] = { ...v, depth: v.depth === Infinity ? null : v.depth }
  writeFileSync(OUT, JSON.stringify({ host: HOST, at: new Date().toISOString(), sitemap: smOnly.length, pages: pageOut, targets: results }))

  // Summary
  let dead = 0, deadPages = new Set(), redir = 0, redirPages = new Set()
  for (const [src, p] of pages) {
    for (const l of new Set(p.links)) {
      const t = results[l]; if (!t) continue
      if (t.status === 404 || t.finalStatus === 404) { dead++; deadPages.add(src) }
      else if (t.status >= 300 && t.status < 400) { redir++; redirPages.add(src) }
    }
  }
  console.log(JSON.stringify({ pages: pages.size, targets: list.length, deadLinks: dead, pagesWithDeadLinks: deadPages.size, redirectLinks: redir, pagesWithRedirectLinks: redirPages.size }))
}
main()
