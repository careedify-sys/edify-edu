// Validate that the middleware's slug-resolution logic (OLD_SLUG_REDIRECTS +
// fuzzy resolver) handles every GSC-reported URL pattern by mapping it to a
// canonical university slug or known redirect target. Run after editing
// middleware.ts to catch regressions.

const fs = require('fs')
const path = require('path')

const CANONICAL_SLUGS = require('../lib/canonical-slugs.json')
const mw = fs.readFileSync(path.join(__dirname, '..', 'middleware.ts'), 'utf8')

// Extract OLD_SLUG_REDIRECTS map by parsing the source.
const mapMatch = mw.match(/const OLD_SLUG_REDIRECTS[^{]*\{([\s\S]*?)\n\}/)
const OLD_SLUG_REDIRECTS = {}
for (const line of mapMatch[1].split('\n')) {
  const m = line.match(/^\s+'([^']+)':\s*'([^']*)',?\s*$/)
  if (m) OLD_SLUG_REDIRECTS[m[1]] = m[2]
}

// Extract STOP_TOKENS list (only first-line literal — quick parse).
const STOP_TOKENS = new Set([
  'university','universi','uni','online','of','the','and','for',
  'in','on','at','an','edu','be','to',
  'deemed','higher','research','studies',
])

function tokensOf(slug) {
  return slug.split('-').filter(t => t.length >= 3 && !STOP_TOKENS.has(t))
}

function fuzzyResolveSlug(unknown) {
  const want = tokensOf(unknown)
  if (want.length === 0) return null
  let best = null
  for (const c of CANONICAL_SLUGS) {
    const have = tokensOf(c)
    if (have.length === 0) continue
    let exact = 0, prefix = 0
    for (const w of want) {
      if (have.includes(w)) { exact++; continue }
      const matched = have.some(h => {
        const s = h.length < w.length ? h : w
        const l = h.length < w.length ? w : h
        return s.length >= 4 && l.startsWith(s) && s.length / l.length >= 0.5
      })
      if (matched) prefix++
    }
    if (exact + prefix === 0) continue
    const total = exact + prefix
    const bestTotal = best ? best.exact + best.prefix : -1
    if (!best || total > bestTotal || (total === bestTotal && exact > best.exact)) {
      best = { slug: c, exact, prefix }
    }
  }
  if (!best) return null
  const need = Math.ceil(want.length * 0.66)
  if (best.exact + best.prefix >= Math.max(1, need)) return best.slug
  return null
}

function resolve(slug) {
  if (CANONICAL_SLUGS.includes(slug)) return { method: 'canonical', target: slug }
  const r = OLD_SLUG_REDIRECTS[slug]
  if (r && r !== '__universities_list__') return { method: 'old-slug-map', target: r }
  if (r === '__universities_list__') return { method: 'old-slug-map-list', target: null }
  const f = fuzzyResolveSlug(slug)
  if (f) return { method: 'fuzzy', target: f }
  return { method: 'unresolved', target: null }
}

const TEST_SLUGS = [
  // Truncated
  'shivaji-universi','andhra-universi','jamia-millia-islamia-universi','centurio-universi-of-technolo',
  'christ-deemed-to-be','noida-internat-universi','dr-babasahe-ambedkar-open','dayal-bagh-educatio-institut',
  'kurukshe-universi','jawaharl-nehru-universi','bs-abdur-rahman-institut','manonman-sundaran-universi',
  'bharathi-universi','dr-mgr-educatio-and','mahatma-gandhi-universi','desh-bhagat-universi',
  'parul-universi','galgotia-universi','savitrib-phule-pune-universi','gujarat-universi',
  'gujarat-technolo-universi','mizoram-universi','vivekana-global-universi','bharathidasan-uni',
  'mats-universi','birla-institut-of-technolo','internat-institut-of-informat','banastha-vidyapit',
  'maharshi-dayanand-universi','universi-of-jammu','universi-of-mumbai','universi-of-madras',
  'universi-of-kerala','alliance-universi','anna-universi','vivekana-global-universi',
  'sathyaba-institut-of-science','manipal-jaipur','jaypee-universi','chitkara-universi',
  'teerthanker-universi','marwadi-universi','dypatil','sage-universi','kiit-universi',
  'datta-meghe-institut-of','guru-gobind-singh-indrapra','dayanand-sagar-universi',
  'guru-nanak-dev-universi','jaipur-national-universi','bharati-vidyapee-universi',
  'mangalay-universi','guru-kashi-universi','karnatak-state-open-universi',
  'aligarh-muslim-universi','madurai-kamaraj-universi','gls-universi','iift',
  'shiv-nadar-institut-of','guru-jambhesh-universi-of','adichunc-universi',
  'shanmugh-arts-science-technolo','shri-ramasamy-memorial-univers','sri-ramachandra-universi',
  'arka-jain-universi','bharath-institut-of-higher','jamia-hamdard','graphic-era-universi',
  'shree-guru-gobind-singh','manipal','lpu','nmims','symbiosis','jain','sikkim-manipal',
  'mahe-manipal','ignou','manav-rachna-online','yenepoya-online','amity','chandigarh',
  'shoolini','dr-dy-patil-vidyapeeth-online',
]

let pass = 0, fail = 0, byMethod = {}
const failures = []
for (const s of TEST_SLUGS) {
  const r = resolve(s)
  byMethod[r.method] = (byMethod[r.method] || 0) + 1
  if (r.method === 'unresolved') {
    failures.push(s)
    fail++
  } else {
    pass++
  }
}

console.log('Total tested:', TEST_SLUGS.length)
console.log('Resolved:', pass)
console.log('Unresolved:', fail)
console.log('By method:', byMethod)
if (failures.length) {
  console.log('\nUnresolved slugs:')
  failures.forEach(f => console.log(' ', f))
}
