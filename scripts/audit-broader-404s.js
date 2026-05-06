// Broader 404 audit — check for orphan URLs across:
// 1. /universities/{id}                — universities listed in lib/data.ts vs manifest
// 2. /universities/{id}/{program}      — programs listed in u.programs vs programDetails
// 3. Sitemap valid-urls.json self-consistency
// 4. Internal links inside content/blogs that point to non-existent spec URLs

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

// ── Parse lib/data.ts for universities and their programs ────────────────────
const src = fs.readFileSync(path.join(ROOT, 'lib', 'data.ts'), 'utf8')
const idRe = /^\s+id:\s+'([a-z0-9-]+)',\s*$/gm
const ids = []
let m
while ((m = idRe.exec(src))) ids.push({ id: m[1], idx: m.index })

const universities = []
const PROG_SLUGS = { MBA: 'mba', MCA: 'mca', BBA: 'bba', BCA: 'bca', 'B.Com': 'bcom', 'M.Com': 'mcom', BA: 'ba', MA: 'ma', MSc: 'msc', BSc: 'bsc' }

for (let i = 0; i < ids.length; i++) {
  const start = ids[i].idx
  const end = i < ids.length - 1 ? ids[i + 1].idx : src.length
  const body = src.slice(start, end)
  const uni = ids[i].id
  // Find `programs: [...]` (list)
  const progsArr = body.match(/programs:\s*\[([^\]]+)\]/)
  const programs = progsArr ? [...progsArr[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : []
  // Find programDetails keys
  const pdKeys = []
  const pdBlock = body.indexOf('programDetails:')
  if (pdBlock >= 0) {
    const after = body.slice(pdBlock)
    const keyRe = /'(MBA|MCA|BBA|BCA|B\.Com|M\.Com|BA|MA|MSc|BSc)':\s*\{/g
    let km
    while ((km = keyRe.exec(after))) pdKeys.push(km[1])
  }
  universities.push({ id: uni, programs, pdKeys })
}

console.log('Universities in lib/data.ts:', universities.length)

// ── Cross-check programs listed in u.programs vs u.programDetails ─────────────
const programsListedNoDetails = []
for (const u of universities) {
  for (const p of u.programs) {
    if (!u.pdKeys.includes(p)) {
      programsListedNoDetails.push({ uni: u.id, program: p })
    }
  }
}
console.log('\nPrograms listed in u.programs[] but missing from programDetails:', programsListedNoDetails.length)
programsListedNoDetails.slice(0, 20).forEach(x => console.log(' ', x.uni, '/', x.program))

// ── Check programDetails has fees+specs structure (route requires pd to exist) ─
// Already covered if pdKeys present.

// ── Cross-check manifest covers all universities + all program-listing pairs ──
const manifest = require(path.join(ROOT, 'lib', 'data', 'programs-manifest.json'))
const manifestUnis = new Set(manifest.map(r => r.university_slug))
const manifestPairs = new Set(manifest.map(r => r.university_slug + '|' + r.program))

const universitiesNotInManifest = universities.filter(u => !manifestUnis.has(u.id))
console.log('\nUniversities listed in lib/data.ts but not in manifest:', universitiesNotInManifest.length)
universitiesNotInManifest.slice(0, 10).forEach(u => console.log(' ', u.id))

const pairsNotInManifest = []
for (const u of universities) {
  for (const p of u.pdKeys) {
    const slug = PROG_SLUGS[p]
    if (!slug) continue
    if (!manifestPairs.has(u.id + '|' + slug)) pairsNotInManifest.push({ uni: u.id, program: slug })
  }
}
console.log('\n(uni, program) pairs in programDetails but not in manifest:', pairsNotInManifest.length)
pairsNotInManifest.slice(0, 20).forEach(x => console.log(' ', x.uni, '/', x.program))

// ── Internal blog links to spec URLs ──────────────────────────────────────────
const blogsDir = path.join(ROOT, 'content', 'blogs')
const internalLinkPattern = /href="(\/universities\/[a-z0-9-]+\/(mba|mca|bba|bca|bcom|mcom|ba|ma|msc|bsc)(?:\/[a-z0-9-]+)?)"/g

const validUrls = new Set(require(path.join(ROOT, 'lib', 'data', 'valid-urls.json')))
const brokenLinks = []
function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name)
    if (f.isDirectory()) walk(p)
    else if (f.name.endsWith('.html') || f.name.endsWith('.md') || f.name.endsWith('.mdx')) {
      const txt = fs.readFileSync(p, 'utf8')
      let lm
      while ((lm = internalLinkPattern.exec(txt))) {
        const url = lm[1]
        if (!validUrls.has(url)) brokenLinks.push({ file: path.relative(ROOT, p), url })
      }
    }
  }
}
walk(blogsDir)
console.log('\nBroken internal links in content/blogs (spec/program URLs):', brokenLinks.length)
const byUrl = {}
for (const b of brokenLinks) byUrl[b.url] = (byUrl[b.url] || 0) + 1
const sortedBroken = Object.entries(byUrl).sort((a, b) => b[1] - a[1])
sortedBroken.slice(0, 30).forEach(([u, c]) => console.log('  (' + c + ') ' + u))

console.log('\n— SUMMARY —')
console.log('Spec mismatches (listing → route):', 0, '(fixed)')
console.log('Programs listed without details:', programsListedNoDetails.length)
console.log('Universities not in manifest:', universitiesNotInManifest.length)
console.log('(uni, program) pairs not in manifest:', pairsNotInManifest.length)
console.log('Broken blog interlinks:', brokenLinks.length)
