// scripts/build-url-canonical-map.mts
// Emits lib/data/url-canonical-map.json, the lookup table
// scripts/apply-url-canonical-map.js uses in the prebuild chain to keep
// lib/data/valid-urls.json advertising only the URL a request lands on.
//
// Split into a tsx generator plus a plain-CommonJS applier on purpose. The
// prebuild chain regenerates valid-urls.json from scratch on every deploy, so
// a one-off rewrite of the committed file is reverted the next time Vercel
// builds. The rewrite therefore has to run in prebuild, and that chain is
// deliberately tsx-free (see the loader-race note in
// build-programme-allowlist.js). Same shape as the programme allowlists: a tsx
// generator calls the real resolver, commits a JSON, and a pre-commit gate
// keeps the two in step.
//
// Before this table existed, 439 of 3,328 sitemap URLs answered a redirect
// request actually lands on. Measured 2026-08-29, before this script: 439 of
// 3,328 sitemap URLs answered 301/308 rather than 200.
//
//   195  /universities/{uni}/{prog}/{spec}  alias slug -> canonical spec
//   244  /programs/{prog}/{spec}            alias or unknown spec -> canonical
//                                           spec, or the programme hub
//
// A sitemap full of redirect sources wastes crawl budget and splits signals
// across two URLs for the same page. Nothing is hidden by this pass: every URL
// is either kept as-is or replaced by the target it already redirects to, and
// that target is guaranteed present in the output. The old URL keeps working,
// it just stops being advertised.
//
// Canonical form is computed from the same resolvers the routes use, so this
// cannot drift into a third opinion:
//   /universities/... -> resolveSpec() in lib/data/programs.ts
//   /programs/...     -> SPEC_REDIRECTS and the activeSpec predicate in
//                        app/programs/[...slug]/page.tsx
//
// Run: npx tsx scripts/build-url-canonical-map.mts

import { readFileSync, writeFileSync } from 'fs'
import { UNIVERSITIES, getAllSpecs, type Program } from '../lib/data'
import { resolveSpec } from '../lib/data/programs'

const OUT = 'lib/data/url-canonical-map.json'

// Candidate enumeration is the sitemap generator's own domain: lib/data.ts
// specs plus programs-manifest.json rows. Every candidate goes through
// resolveSpec, so the table records exactly what the route would settle on.
const manifestRows = JSON.parse(
  readFileSync('lib/data/programs-manifest.json', 'utf8')
) as { university_slug: string; program: string; spec_slug: string }[]

const specSlugOf = (s: unknown): string =>
  typeof s === 'string'
    ? s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : String((s as { slug?: string })?.slug ?? '')

const PROG: Record<string, Program> = {
  mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA',
  bcom: 'B.Com', mcom: 'M.Com', ba: 'BA', ma: 'MA', msc: 'MSc', bsc: 'BSc',
}

// Text-parse the two maps out of the programmes route rather than importing a
// page component, which would drag JSX and every one of its data imports in.
const routeSrc = readFileSync('app/programs/[...slug]/page.tsx', 'utf8')
function mapBody(name: string): string {
  const at = routeSrc.indexOf('const ' + name)
  if (at < 0) throw new Error('could not find ' + name + ' in the programmes route')
  const open = routeSrc.indexOf('{', at)
  const close = routeSrc.indexOf('\n}', open)
  if (open < 0 || close < 0) throw new Error('could not delimit ' + name)
  return routeSrc.slice(open, close)
}
const SPEC_REDIRECTS: Record<string, string> = {}
for (const m of mapBody('SPEC_REDIRECTS').matchAll(/^\s*'([^']+)':\s*'([^']+)'/gm)) {
  SPEC_REDIRECTS[m[1]] = m[2]
}
const SPEC_SLUG_KEYS = new Set<string>(
  [...mapBody('SPEC_SLUG_MAP').matchAll(/^\s*'([^']+)':\s*\{/gm)].map(m => m[1])
)

const specCache = new Map<string, Set<string>>()
function programmeSpecSlugs(progSlug: string): Set<string> {
  let s = specCache.get(progSlug)
  if (s) return s
  s = new Set(
    getAllSpecs(PROG[progSlug]).map(x => x.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  )
  specCache.set(progSlug, s)
  return s
}

// next.config.js also rewrites some spec slugs, with wildcard sources such as
// /universities/:university/mba/information-technology-it. Those fire before
// the route runs, so the canonical URL is whatever they land on, not what
// resolveSpec alone reports. Missing this left 19 sitemap URLs answering 308.
// Conditional redirects (a `has`/`missing` clause, e.g. the www host rule whose
// source is /:path*) are skipped: they would otherwise match every path.
const ptr: any = await import('next/dist/compiled/path-to-regexp' as any)
const ptrMatch = ptr.match ?? ptr.default?.match
const ptrCompile = ptr.compile ?? ptr.default?.compile

const cfg: any = await import('../next.config.js' as any)
const nextConfig = cfg?.default ?? cfg
const rules: { match: (p: string) => any; to: (params: any) => string }[] = []
for (const r of await nextConfig.redirects()) {
  if (r?.has || r?.missing || !r?.source || !r?.destination) continue
  const dest = String(r.destination)
  if (/^https?:/i.test(dest)) continue
  try {
    rules.push({ match: ptrMatch(String(r.source), { decode: decodeURIComponent }), to: ptrCompile(dest) })
  } catch { /* a source path-to-regexp cannot compile cannot be applied here */ }
}

/** Follow next.config redirects to a fixed point. */
function followRedirects(url: string): string {
  let current = url
  for (let hop = 0; hop < 5; hop++) {
    let moved = false
    for (const rule of rules) {
      const m = rule.match(current)
      if (!m) continue
      let next: string
      try { next = rule.to(m.params) } catch { continue }
      if (!next || next === current) continue
      current = next
      moved = true
      break
    }
    if (!moved) break
  }
  return current
}

// ── Emit the table ──────────────────────────────────────────────────────────
// "u": university spec URLs, keyed "uniId|progSlug|specSlug".
//      value = canonical spec slug, or null when nothing resolves and the URL
//      must be dropped from the sitemap.
// "p": programme directory URLs, keyed "progSlug|specSlug".
//      value = canonical spec slug, or "" meaning the route redirects to the
//      programme hub.
const u: Record<string, string | null> = {}
const p: Record<string, string> = {}

for (const progSlug of Object.keys(PROG)) {
  const label = PROG[progSlug]

  for (const uni of UNIVERSITIES) {
    const pd = (uni.programDetails as Record<string, { specs?: unknown[] } | undefined>)[label]
    const candidates = new Set<string>()
    for (const s of (pd?.specs ?? [])) candidates.add(specSlugOf(s))
    for (const r of manifestRows) {
      if (r.university_slug === uni.id && r.program === progSlug && r.spec_slug) candidates.add(r.spec_slug)
    }
    // Deliberately NOT the alias vocabulary here. This table only has to cover
    // what build-valid-urls.js can emit, which is data.ts specs plus manifest
    // rows. Adding the alias fanout took the file from 60 KB to 4.5 MB of
    // mostly-null entries. apply-url-canonical-map.js hard-fails on a spec URL
    // it cannot find, so an unexpected slug breaks the build loudly rather
    // than slipping into the sitemap.
    for (const c of candidates) {
      if (!c) continue
      const r = resolveSpec(uni.id, label, progSlug, c)
      const key = `${uni.id}|${progSlug}|${c}`
      if (!r) { u[key] = null; continue }
      const landed = followRedirects(`/universities/${uni.id}/${progSlug}/${r.slug}`)
      const seg = landed.split('/')
      // Landed outside this hub's spec shape: the destination is a different
      // page the sitemap already lists on its own, so drop this URL.
      if (!(seg.length === 5 && seg[1] === 'universities' && seg[2] === uni.id && seg[3] === progSlug)) {
        u[key] = null
        continue
      }
      // Landed on a slug this university does not actually offer. Some
      // next.config wildcards canonicalise a slug sitewide to a spec that only
      // some universities have, e.g. banking-financial-services ->
      // banking-insurance for a university that has no banking-insurance. The
      // redirect still fires and the destination 404s, so the sitemap must not
      // advertise either end of it. Measured 2026-08-30: 9 such pairs, none
      // with any Search Console history.
      const settled = resolveSpec(uni.id, label, progSlug, seg[4])
      u[key] = settled && settled.slug === seg[4] ? seg[4] : null
    }
  }

  // Identity entries for every canonical this pass produced. The applier has to
  // be idempotent: prebuild runs it over a freshly generated valid-urls.json,
  // while the pre-commit --check runs it over the already-canonicalised file,
  // whose URLs are these canonical slugs. Without these the second run reports
  // them as absent from the table and fails.
  for (const key of Object.keys(u)) {
    const value = u[key]
    if (value === null) continue
    const [uniId, prog] = key.split('|')
    const identity = `${uniId}|${prog}|${value}`
    if (identity in u) continue
    const settled = resolveSpec(uniId, PROG[prog], prog, value)
    u[identity] = settled && settled.slug === value ? value : null
  }

  const progSpecs = programmeSpecSlugs(progSlug)
  const progCandidates = new Set<string>([...progSpecs, ...SPEC_SLUG_KEYS, ...Object.keys(SPEC_REDIRECTS)])
  for (const r of manifestRows) if (r.program === progSlug && r.spec_slug) progCandidates.add(r.spec_slug)
  for (const c of progCandidates) {
    if (!c) continue
    // Two redirect layers alternate here: next.config.js rules and the route's
    // own SPEC_REDIRECTS map. insurance-management goes to banking-insurance via
    // next.config, and banking-insurance goes to banking-finance via the route,
    // so resolving either layer alone left a middle slug in the sitemap still
    // answering a 308. Alternate until the URL stops moving.
    let url = `/programs/${progSlug}/${c}`
    for (let hop = 0; hop < 8; hop++) {
      const parts = url.split('/')
      const slug = parts.length === 4 ? parts[3] : ''
      let next = url
      if (slug && SPEC_REDIRECTS[slug]) {
        next = `/programs/${progSlug}/${SPEC_REDIRECTS[slug]}`
      } else if (slug && !(programmeSpecSlugs(progSlug).has(slug) || SPEC_SLUG_KEYS.has(slug))) {
        next = `/programs/${progSlug}`
      }
      next = followRedirects(next)
      if (next === url) break
      url = next
    }
    const seg = url.split('/')
    p[`${progSlug}|${c}`] =
      seg.length === 4 && seg[1] === 'programs' && seg[2] === progSlug ? seg[3]
      : seg.length === 3 && seg[1] === 'programs' && seg[2] === progSlug ? ''
      : ''
  }
}

const payload = JSON.stringify({ u, p })

// --check: pre-commit freshness. A stale table would let apply-url-canonical-map
// rewrite a URL onto a slug the route no longer serves.
if (process.argv.includes('--check')) {
  let committed = ''
  try { committed = readFileSync(OUT, 'utf8').trim() } catch { /* handled below */ }
  if (committed === payload) {
    console.log('OK. ' + OUT + ' is current (' + Object.keys(u).length + ' + ' + Object.keys(p).length + ' entries).')
    process.exit(0)
  }
  console.error('FAIL: ' + OUT + ' is stale against resolveSpec() and the programmes route.')
  console.error('Fix: npx tsx scripts/build-url-canonical-map.mts and stage the diff.')
  process.exit(1)
}

writeFileSync(OUT, payload + '\n', 'utf8')
console.log(`Wrote ${OUT}`)
console.log(`  university spec entries : ${Object.keys(u).length}`)
console.log(`  programme spec entries  : ${Object.keys(p).length}`)
console.log(`  bytes                   : ${JSON.stringify({ u, p }).length}`)
