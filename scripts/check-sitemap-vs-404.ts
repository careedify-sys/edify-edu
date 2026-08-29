// scripts/check-sitemap-vs-404.ts
//
// Task 3 slice 3c + slice 4 pre-commit gate. Two invariants, on the ACTUAL
// sitemap the app would emit (not just lib/data/valid-urls.json):
//
//   1. NEVER-BOTH-404. No sitemap URL, hub OR spec, resolves to a
//      middleware / spec-route 404. Concretely: for every
//      /universities/{slug}/{prog}(/{spec})? URL in the sitemap (3 OR 4
//      segments), {slug} must be in the {prog} allowlist. If it is not,
//      the hub is 404'd by middleware (section 2d) and any spec beneath
//      it is 404'd by the spec-route resolver (program-not-in-uni
//      short-circuit). Google would report either as "Submitted URL not
//      found (404)" in Search Console.
//
//      Slice 3c (2026-08-18): hub-only. Slice 4 (2026-08-19): widened to
//      4-segment after GSC intersection cleared the 91 that 404 (zero
//      earning) plus the 1 that 307s via next.config.js
//      (christ-university-online/mba/business-analytics, already
//      no-longer-earning-what-it-was-in-the-sitemap-for).
//
//   2. NEVER-BOTH-REDIRECT. No sitemap URL is an exact redirect source.
//      Redirect catalogues Vercel actually serves:
//        - lib/data/redirects.json (323 exact-path sources)
//        - next.config.js redirects() (382 exact-path sources)
//      Slice 3c read only the first, missed the Christ MBA case that
//      redirects via the second. Slice 4 unions both. Same-source-
//      different-destination between the two is a separate concern
//      (Task 4 catalogue reconciliation), not gated here.
//
//      A sitemap URL that redirects produces "Page with redirect" in GSC.
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
  { slug: 'ba',   file: 'programme-allowlist-ba.json' },
  { slug: 'msc',  file: 'programme-allowlist-msc.json' },
  { slug: 'bsc',  file: 'programme-allowlist-bsc.json' },
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

// Load exact-path redirect sources from BOTH catalogues Vercel serves:
//   1. lib/data/redirects.json (323 exact-path entries, read by many other
//      scripts; the historical single source of truth for slice 3c)
//   2. next.config.js redirects() (382 inline entries plus the 323 above
//      spread in via _phase3Redirects; total ~705)
// Calling the async redirects() function unions everything Vercel actually
// serves at the edge, so a next.config.js-only entry cannot silently shadow
// a sitemap URL the way christ-university-online/mba/... did in slice 3c.
// Same-source-different-destination between the two catalogues is a
// separate concern (Task 4 reconciliation), not gated here.
async function loadRedirectSources(): Promise<Set<string>> {
  const s = new Set<string>()
  // Catalogue 1: redirects.json (kept as a defensive fallback if next.config
  // ever drops the spread. The union is a no-op in the normal case.)
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', 'redirects.json'), 'utf8'))
    const list: any[] = Array.isArray(raw) ? raw : (raw.redirects || [])
    for (const r of list) addExactPathSource(s, r?.source)
  } catch { /* ignore, catalogue 2 will still fire */ }
  // Catalogue 2: next.config.js redirects()
  try {
    const cfg: any = await import('../next.config.js' as any)
    const nc = cfg?.default ?? cfg
    if (typeof nc?.redirects === 'function') {
      const list: any[] = await nc.redirects()
      for (const r of list) addExactPathSource(s, r?.source)
    }
  } catch (e) {
    throw new Error('check-sitemap-vs-404: failed to load next.config.js redirects(): ' + (e as Error).message)
  }
  return s
}

// Only exact-path sources (no :param, no *) can be matched directly against
// a sitemap URL. Parameterised sources are handled by Next at request time
// and cannot be pre-materialised into an exact URL list here.
function addExactPathSource(set: Set<string>, source: unknown): void {
  const src = String(source || '')
  if (src && !src.includes(':') && !src.includes('*')) set.add(src)
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
  const redirects = await loadRedirectSources()
  const allowlists = loadAllowlists()
  const programmeSlugs = new Set(PROGRAMME_ALLOWLIST_FILES.map(p => p.slug))

  const violations404: { url: string; programme: string; slug: string }[] = []
  const violationsRedirect: { url: string; destination?: string }[] = []

  // Build destination map from BOTH catalogues so failure reports show
  // where each source would redirect to. Same-source-different-destination
  // conflicts across catalogues are not this gate's concern; last-write-wins
  // matches how Vercel serves them (next.config.js order).
  const redirectDest = new Map<string, string>()
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'data', 'redirects.json'), 'utf8'))
    const list: any[] = Array.isArray(raw) ? raw : (raw.redirects || [])
    for (const r of list) {
      const src = String(r?.source || '')
      if (src && !src.includes(':') && !src.includes('*')) redirectDest.set(src, String(r?.destination || ''))
    }
  } catch { /* ignored */ }
  try {
    const cfg: any = await import('../next.config.js' as any)
    const nc = cfg?.default ?? cfg
    if (typeof nc?.redirects === 'function') {
      const list: any[] = await nc.redirects()
      for (const r of list) {
        const src = String(r?.source || '')
        if (src && !src.includes(':') && !src.includes('*')) redirectDest.set(src, String(r?.destination || ''))
      }
    }
  } catch { /* loadRedirectSources will have already thrown if fatal */ }

  for (const url of paths) {
    // Redirect-source check
    if (redirects.has(url)) {
      violationsRedirect.push({ url, destination: redirectDest.get(url) })
    }
    // 404-shape check, HUB (3-seg) or SPEC (4-seg) beneath an allowlist-out
    // (slug, prog). Middleware 404s the hub; the spec route resolver 404s
    // any spec beneath it via program-not-in-uni short-circuit.
    const m = url.match(/^\/universities\/([^/]+)\/([^/]+)(?:\/[^/]+)?\/?$/)
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
  console.log(`redirect sources loaded: ${redirects.size} exact-path entries (redirects.json + next.config.js redirects())`)
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
