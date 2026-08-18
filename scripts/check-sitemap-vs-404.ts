// scripts/check-sitemap-vs-404.ts
//
// Task 3 slice 3c pre-commit gate. Two invariants, on the ACTUAL sitemap the
// app would emit (not just lib/data/valid-urls.json):
//
//   1. NEVER-BOTH-404. No HUB sitemap URL is one that middleware would
//      return HTTP 404 on. Concretely: for every /universities/{slug}/{prog}
//      URL (exactly 3 segments) in the sitemap, {slug} must be in the
//      {prog} allowlist. If it is not, the middleware (section 2d) would
//      404 that URL, and Google would report "Submitted URL not found (404)"
//      in Search Console.
//
//      Hub-only by design: middleware currently 404s only 3-segment hubs.
//      Spec URLs (4-segment /universities/{slug}/{prog}/{spec}) have their
//      own resolution path and are covered by scripts/check-spec-rescue.ts.
//      When a future slice starts 404ing specs beneath class-A hubs, extend
//      the regex here to accept 4-segment paths too.
//
//   2. NEVER-BOTH-REDIRECT. No sitemap URL (hub or spec) is an exact source
//      in lib/data/redirects.json. A sitemap URL that 308s produces "Page
//      with redirect" in Search Console. Two instances found before this
//      gate existed: chitkara-university-online/bcom (not in sitemap, safe)
//      and chandigarh-university-online/bba/business-analytics-
//      specialization-with-data-focuse (IS in sitemap, drift, Task 4 fix
//      pending).
//
// Defect classes the 404-check catches (all resolve to "uni not in the
// programme allowlist"):
//   class-A  uni has prog in u.programs but no u.programDetails[prog]
//   class-B  has both but feeOk() false and no content JSON
//   class-C  prog is not in u.programs at all, Excel-only rows for a
//            programme the university does not offer in data.ts, e.g.
//            /universities/christ-university-online/mba (Christ has no
//            MBA entry in data.ts). This is the only class the Excel can
//            manufacture on its own, and is distinct from A/B.
//
// The upstream fix is in scripts/prune-noindex-hub-urls.js, which now
// consults the same allowlists and strips class-A/B/C hubs from
// valid-urls.json before sitemap() consumes it.
//
// Reads every source app/sitemap.ts consumes, not just lib/data/valid-urls.json.
// valid-urls.json is a PROXY for the sitemap; app/sitemap.ts additionally
// applies NO_MBA_DATA_UNIS and REDIRECT_SPEC_SLUGS filters AND force-adds
// RESCUED_PROGRAM_PATHS (17 paths that never pass through valid-urls.json).
// A 404-shape URL arriving via a force-add would slip past a valid-urls.json-
// only check. This gate calls the actual sitemap() function so any future
// force-add is covered by construction.
//
// Extension pattern: add a new programme to PROGRAMME_ALLOWLIST_FILES when
// its allowlist ships. No other change needed.

import fs from 'fs'
import path from 'path'

const ROOT = path.join(__dirname, '..')

// Keep in sync with scripts/build-programme-allowlist.js SCOPE_PROGRAMS.
const PROGRAMME_ALLOWLIST_FILES: { slug: string; file: string }[] = [
  { slug: 'ma',   file: 'programme-allowlist-ma.json' },
  { slug: 'bcom', file: 'programme-allowlist-bcom.json' },
  { slug: 'mcom', file: 'programme-allowlist-mcom.json' },
  { slug: 'mba',  file: 'programme-allowlist-mba.json' },
  { slug: 'bba',  file: 'programme-allowlist-bba.json' },
  { slug: 'bca',  file: 'programme-allowlist-bca.json' },
  { slug: 'mca',  file: 'programme-allowlist-mca.json' },
]

const SITE = 'https://edifyedu.in'

async function loadSitemapPaths(): Promise<string[]> {
  // Next 14 CJS-interop wraps the ESM default; unwrap one layer if present.
  // Extension omitted so tsc doesn't require allowImportingTsExtensions. tsx
  // resolves the .ts source at runtime.
  const mod: any = await import('../app/sitemap' as any)
  const fn = typeof mod.default === 'function'
    ? mod.default
    : (mod.default && typeof mod.default.default === 'function' ? mod.default.default : null)
  if (!fn) {
    throw new Error('scripts/check-sitemap-vs-404.ts could not resolve the sitemap() default export from app/sitemap.ts')
  }
  const entries = await fn()
  return entries
    .map((e: any) => String(e.url).replace(new RegExp('^' + SITE.replace(/[.]/g, '\\.')), ''))
    .filter((p: string) => p.startsWith('/'))
}

function loadRedirectSources(): Set<string> {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', 'redirects.json'), 'utf8'))
  const list: any[] = Array.isArray(raw) ? raw : (raw.redirects || [])
  const s = new Set<string>()
  for (const r of list) {
    const src = String(r.source || '')
    // Only exact-path sources (no :param, no *) can be matched directly.
    // Parameterised sources are handled by Next at request time and cannot be
    // pre-materialised into an exact URL list here.
    if (src && !src.includes(':') && !src.includes('*')) s.add(src)
  }
  return s
}

function loadAllowlists(): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>()
  for (const { slug, file } of PROGRAMME_ALLOWLIST_FILES) {
    const p = path.join(ROOT, 'lib', 'data', file)
    if (!fs.existsSync(p)) {
      console.error(`FAIL: ${path.relative(ROOT, p)} missing. Run: node scripts/build-programme-allowlist.js`)
      process.exit(1)
    }
    const arr: string[] = JSON.parse(fs.readFileSync(p, 'utf8'))
    m.set(slug, new Set(arr))
  }
  return m
}

;(async () => {
  const paths = await loadSitemapPaths()
  const redirects = loadRedirectSources()
  const allowlists = loadAllowlists()
  const programmeSlugs = new Set(PROGRAMME_ALLOWLIST_FILES.map(p => p.slug))

  const violations404: { url: string; programme: string; slug: string }[] = []
  const violationsRedirect: { url: string; destination?: string }[] = []

  // Load redirect map for helpful destination reporting
  const redirectsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', 'redirects.json'), 'utf8'))
  const redirectsList: any[] = Array.isArray(redirectsRaw) ? redirectsRaw : (redirectsRaw.redirects || [])
  const redirectDest = new Map<string, string>()
  for (const r of redirectsList) {
    const src = String(r.source || '')
    if (src && !src.includes(':') && !src.includes('*')) redirectDest.set(src, String(r.destination || ''))
  }

  for (const url of paths) {
    // Redirect-source check
    if (redirects.has(url)) {
      violationsRedirect.push({ url, destination: redirectDest.get(url) })
    }
    // 404-shape check, HUB URLs only (3 segments). Middleware only 404s hubs.
    const m = url.match(/^\/universities\/([^/]+)\/([^/]+)\/?$/)
    if (!m) continue
    const [, slug, prog] = m
    if (!programmeSlugs.has(prog)) continue
    const allow = allowlists.get(prog)!
    if (!allow.has(slug)) {
      violations404.push({ url, programme: prog, slug })
    }
  }

  const fail = violations404.length > 0 || violationsRedirect.length > 0

  console.log(`sitemap URLs scanned:   ${paths.length}`)
  console.log(`programme allowlists:   ${PROGRAMME_ALLOWLIST_FILES.map(p => p.slug).join(', ')}`)
  console.log(`redirect sources loaded: ${redirects.size} exact-path entries`)
  console.log('')

  if (violations404.length > 0) {
    console.error(`FAIL: ${violations404.length} sitemap URL(s) would be 404'd by middleware:`)
    for (const v of violations404.slice(0, 50)) console.error(`  - ${v.url}  (${v.programme} allowlist excludes '${v.slug}')`)
    if (violations404.length > 50) console.error(`  ... ${violations404.length - 50} more`)
    console.error('')
    console.error('  Google would report these as "Submitted URL not found (404)" in Search Console.')
    console.error('  Fix: either remove the URL from the sitemap source, or add {slug} to the')
    console.error('       relevant programme allowlist if the resolver considers it healthy.')
    console.error('')
  }

  if (violationsRedirect.length > 0) {
    console.error(`FAIL: ${violationsRedirect.length} sitemap URL(s) are redirect sources in lib/data/redirects.json:`)
    for (const v of violationsRedirect.slice(0, 50)) {
      console.error(`  - ${v.url}${v.destination ? '  ->  ' + v.destination : ''}`)
    }
    if (violationsRedirect.length > 50) console.error(`  ... ${violationsRedirect.length - 50} more`)
    console.error('')
    console.error('  Google would report these as "Page with redirect" in Search Console.')
    console.error('  Fix: drop from sitemap source (keep the redirect).')
    console.error('')
  }

  if (fail) process.exit(1)
  console.log(`OK. sitemap has no 404-shape URLs and no redirect-source URLs.`)
})()
