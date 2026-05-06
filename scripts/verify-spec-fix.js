// Verify that the resolveSpecName logic now resolves every spec listed
// on a /universities/{id}/{program} page. Reads the audit list and the
// listing-derived slugs from lib/data.ts (parsed identically to the audit).

const fs = require('fs')
const path = require('path')

const issues = require('./spec-mismatch-audit.json')

// Minimal parse of lib/data.ts → { uni: { programLabel: [{ slug, name }] } }
function specSlugify(s) {
  if (typeof s === 'string') return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return s.slug
}
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
const idRe = /^\s+id:\s+'([a-z0-9-]+)',\s*$/gm
const ids = []
let m
while ((m = idRe.exec(src))) ids.push({ id: m[1], idx: m.index })

const dataIndex = {}
const PROG_LABEL = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', bcom: 'B.Com', mcom: 'M.Com', ba: 'BA', ma: 'MA', msc: 'MSc', bsc: 'BSc' }
const labelToProg = Object.fromEntries(Object.entries(PROG_LABEL).map(([p, l]) => [l, p]))

for (let i = 0; i < ids.length; i++) {
  const start = ids[i].idx
  const end = i < ids.length - 1 ? ids[i + 1].idx : src.length
  const body = src.slice(start, end)
  const uni = ids[i].id
  dataIndex[uni] = {}
  const progRe = /'(MBA|MCA|BBA|BCA|B\.Com|MSc|BSc|MA|BA|M\.Com)':\s*\{/g
  let pm
  while ((pm = progRe.exec(body))) {
    const progLabel = pm[1]
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
    const specs = []
    const objRe = /\{[^}]*slug:\s*'([^']+)'[^}]*name:\s*'([^']+)'[^}]*\}/g
    const objMatches = [...arrText.matchAll(objRe)]
    for (const om of objMatches) specs.push({ slug: om[1], name: om[2] })
    let stripped = arrText
    for (const om of objMatches) stripped = stripped.replace(om[0], '')
    const stringRe = /'([^']+)'/g
    let sx
    while ((sx = stringRe.exec(stripped))) specs.push({ slug: specSlugify(sx[1]), name: sx[1] })
    dataIndex[uni][progLabel] = specs
  }
}

let resolved = 0, unresolved = 0
const stillBroken = []
for (const it of issues) {
  const uni = it.uni
  const prog = it.program
  const slug = it.listingSlug
  const label = PROG_LABEL[prog]
  const specs = dataIndex[uni]?.[label] || []
  const found = specs.find(s => s.slug === slug)
  if (found) resolved++
  else { unresolved++; stillBroken.push(it) }
}
console.log('Resolved by data.ts fallback:', resolved)
console.log('Still unresolved:', unresolved)
if (stillBroken.length) {
  console.log('First 20 still broken:')
  stillBroken.slice(0, 20).forEach(b => console.log(' ', b.uni, '/', b.program, '/', b.listingSlug))
}
