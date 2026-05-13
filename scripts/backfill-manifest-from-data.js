// Backfill programs-manifest.json with specs that exist in lib/data.ts
// programDetails but were missing from the Excel-built manifest. Pure ADD —
// never removes existing entries. Also rebuilds lib/data/valid-urls.json so
// the sitemap covers the new URLs.
//
// Why: the listing pages link to slugs derived from lib/data.ts via specSlug().
// The manifest, built from a separate Excel, had drifted away. The route
// resolver now falls back to data.ts, but the sitemap and static-params lookup
// also need the same set so SSG and indexing work.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const MANIFEST_PATH = path.join(ROOT, 'lib', 'data', 'programs-manifest.json')
const URLS_PATH = path.join(ROOT, 'lib', 'data', 'valid-urls.json')
const DATA_TS = path.join(ROOT, 'lib', 'data.ts')

function specSlugify(s) {
  if (typeof s === 'string') return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return s.slug
}

const PROG_LABEL = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', bcom: 'B.Com', mcom: 'M.Com', ba: 'BA', ma: 'MA', msc: 'MSc', bsc: 'BSc' }
const labelToProg = Object.fromEntries(Object.entries(PROG_LABEL).map(([p, l]) => [l, p]))

// Parse lib/data.ts to extract { uni, program, specs[] }
const src = fs.readFileSync(DATA_TS, 'utf8')
const idRe = /^\s+id:\s+'([a-z0-9-]+)',\s*$/gm
const ids = []
let m
while ((m = idRe.exec(src))) ids.push({ id: m[1], idx: m.index })

const listed = []
for (let i = 0; i < ids.length; i++) {
  const start = ids[i].idx
  const end = i < ids.length - 1 ? ids[i + 1].idx : src.length
  const body = src.slice(start, end)
  const uni = ids[i].id
  const progRe = /'(MBA|MCA|BBA|BCA|B\.Com|MSc|BSc|MA|BA|M\.Com)':\s*\{/g
  let pm
  while ((pm = progRe.exec(body))) {
    const progLabel = pm[1]
    const progSlug = labelToProg[progLabel]
    if (!progSlug) continue
    const after = body.slice(pm.index)
    const specsIdx = after.indexOf('specs:')
    if (specsIdx < 0) continue
    const arrStart = after.indexOf('[', specsIdx)
    if (arrStart < 0) continue
    let depth = 0, j = arrStart, arrEnd = -1
    for (; j < after.length; j++) {
      const ch = after[j]
      if (ch === '[') depth++
      else if (ch === ']') { depth--; if (depth === 0) { arrEnd = j; break } }
    }
    if (arrEnd < 0) continue
    const arrText = after.slice(arrStart, arrEnd + 1)
    const objRe = /\{[^}]*slug:\s*'([^']+)'[^}]*name:\s*'([^']+)'[^}]*\}/g
    const objMatches = [...arrText.matchAll(objRe)]
    for (const om of objMatches) listed.push({ uni, prog: progSlug, slug: om[1], name: om[2] })
    let stripped = arrText
    for (const om of objMatches) stripped = stripped.replace(om[0], '')
    const stringRe = /'([^']+)'/g
    let sx
    while ((sx = stringRe.exec(stripped))) listed.push({ uni, prog: progSlug, slug: specSlugify(sx[1]), name: sx[1] })
  }
}

const manifest = require(MANIFEST_PATH)
const seen = new Set()
for (const r of manifest) {
  if (r.spec_slug) seen.add(r.university_slug + '|' + r.program + '|' + r.spec_slug)
}

let added = 0
for (const l of listed) {
  if (!l.slug) continue
  const key = l.uni + '|' + l.prog + '|' + l.slug
  if (seen.has(key)) continue
  manifest.push({
    university_slug: l.uni,
    program: l.prog,
    spec_slug: l.slug,
    spec_name: l.name,
  })
  seen.add(key)
  added++
}

console.log('Added', added, 'rows to manifest. Total now:', manifest.length)
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))

// Rebuild valid-urls.json
const STATIC_URLS = ['/', '/universities', '/programs', '/compare', '/about', '/contact', '/coupons', '/privacy-policy', '/blog', '/guides']
const uniSlugs = new Set()
const uniProgPairs = new Set()
const uniSpecTriples = new Set()
const programs = new Set()
const programSpecs = new Set()
for (const r of manifest) {
  uniSlugs.add(r.university_slug)
  uniProgPairs.add(r.university_slug + '/' + r.program)
  programs.add(r.program)
  if (r.spec_slug) {
    uniSpecTriples.add(r.university_slug + '/' + r.program + '/' + r.spec_slug)
    programSpecs.add(r.program + '/' + r.spec_slug)
  }
}
const urls = [
  ...STATIC_URLS,
  ...[...uniSlugs].sort().map(s => '/universities/' + s),
  ...[...uniProgPairs].sort().map(s => '/universities/' + s),
  ...[...uniSpecTriples].sort().map(s => '/universities/' + s),
  ...[...programs].sort().map(p => '/programs/' + p),
  ...[...programSpecs].sort().map(s => '/programs/' + s),
]
// Program-level URLs that 301 redirect to a canonical (per next.config.js and
// middleware.ts). Keep them out of the sitemap so we only ship canonicals.
// University-level variants under /universities/* are scoped separately and
// remain in the sitemap as their own spec pages.
const REDIRECTED_PROGRAM_URLS = new Set([
  // Healthcare consolidation -> /programs/mba/healthcare-management
  '/programs/mba/hospital-healthcare-management',
  '/programs/mba/hospital-and-health-care-management',
  // Marketing consolidation -> /programs/mba/marketing
  '/programs/mba/marketing-management',
  // Operations consolidation -> /programs/mba/operations-management
  '/programs/mba/operations',
  '/programs/mba/operations-supply-chain-management',
  '/programs/mba/operations-and-supply-chain-management',
])
const uniqueUrls = [...new Set(urls)].filter(u => !REDIRECTED_PROGRAM_URLS.has(u))
fs.writeFileSync(URLS_PATH, JSON.stringify(uniqueUrls, null, 2))
console.log('Rebuilt valid-urls.json — total unique URLs:', uniqueUrls.length)
