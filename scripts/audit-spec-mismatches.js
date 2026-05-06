// Audit spec mismatches between lib/data.ts (listing source) and programs-manifest.json (route source).
// A "mismatch" = university lists a spec on its program page, but clicking through 404s.

const fs = require('fs')
const path = require('path')

function specSlugify(s) {
  if (typeof s === 'string') return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return s.slug
}

const SPEC_ALIASES = {
  'finance': ['financial-management', 'finance-management', 'finance-and-accounting'],
  'marketing': ['marketing-management', 'sales-and-marketing'],
  'human-resource-management': ['hr-management', 'hrm', 'hr'],
  'operations-management': ['operations', 'production-and-operations-management', 'production-management'],
  'business-analytics': ['analytics', 'business-analytics-and-ai', 'data-analytics'],
  'digital-marketing': ['digital-marketing-management', 'digital-mktg'],
  'international-business': ['international-business-management', 'intl-business', 'ib'],
  'healthcare-management': ['hospital-management', 'hospital-administration', 'hospital-healthcare-management', 'hospital-and-healthcare-management'],
  'information-technology': ['it-management', 'information-technology-management', 'it'],
  'supply-chain-management': ['logistics-and-supply-chain-management', 'logistics-supply-chain-management', 'logistics-scm', 'logistics-supply-chain', 'supply-chain-logistics'],
  'entrepreneurship': ['entrepreneurship-and-leadership-management', 'entrepreneur'],
  'data-science': ['data-science-and-analytics', 'data-science-analytics', 'data-science--ai'],
  'general-management': ['general'],
  'cyber-security': ['cybersecurity', 'cyber-security-and-forensics', 'cyber-security-forensics'],
  'artificial-intelligence-and-machine-learning': ['ai-ml', 'ai-and-ml', 'artificial-intelligence-machine-learning', 'artificial-intelligence'],
  'blockchain-technology': ['blockchain', 'blockchain-technologies'],
  'cloud-computing': ['cloud-computing-and-internet-of-things', 'cloud-technology'],
  'full-stack-development': ['full-stack-web-development', 'full-stack-development-and-devops', 'full-stack'],
  'project-management': ['project-management-and-leadership'],
  'retail-management': ['retail', 'retail-ops'],
  'banking-and-insurance': ['banking-insurance', 'banking-finance', 'banking-and-financial-services', 'bfsi-banking-financial-services-and-insurance'],
}
const aliasToCanonical = {}
for (const [c, as] of Object.entries(SPEC_ALIASES)) for (const a of as) aliasToCanonical[a] = c

const manifest = require('../lib/data/programs-manifest.json')
const manifestKey = new Set()
for (const r of manifest) {
  if (r.spec_slug) manifestKey.add(r.university_slug + '|' + r.program + '|' + r.spec_slug)
}

function manifestHas(uni, prog, slug) {
  if (manifestKey.has(uni + '|' + prog + '|' + slug)) return slug
  const can = aliasToCanonical[slug]
  if (can && manifestKey.has(uni + '|' + prog + '|' + can)) return can
  const aliases = SPEC_ALIASES[slug] || []
  for (const a of aliases) if (manifestKey.has(uni + '|' + prog + '|' + a)) return a
  return null
}

const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')

const idRe = /^\s+id:\s+'([a-z0-9-]+)',\s*$/gm
const ids = []
let m
while ((m = idRe.exec(src))) ids.push({ id: m[1], idx: m.index })

const issues = []
for (let i = 0; i < ids.length; i++) {
  const start = ids[i].idx
  const end = i < ids.length - 1 ? ids[i + 1].idx : src.length
  const body = src.slice(start, end)
  const uni = ids[i].id
  const progRe = /'(MBA|MCA|BBA|BCA|B\.Com|MSc|BSc|MA|BA|M\.Com|BCom|MCom)':\s*\{/g
  let pm
  while ((pm = progRe.exec(body))) {
    const progLabel = pm[1]
    const progSlug = progLabel.replace(/\./g, '').toLowerCase()
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
    const slugs = []
    const objRe = /\{[^}]*slug:\s*'([^']+)'[^}]*name:\s*'([^']+)'[^}]*\}/g
    const objMatches = [...arrText.matchAll(objRe)]
    for (const om of objMatches) slugs.push({ slug: om[1], name: om[2] })
    let stripped = arrText
    for (const om of objMatches) stripped = stripped.replace(om[0], '')
    const stringRe = /'([^']+)'/g
    let sx
    while ((sx = stringRe.exec(stripped))) {
      slugs.push({ slug: specSlugify(sx[1]), name: sx[1] })
    }
    for (const sp of slugs) {
      const found = manifestHas(uni, progSlug, sp.slug)
      if (!found) {
        issues.push({ uni, program: progSlug, listingSlug: sp.slug, name: sp.name })
      }
    }
  }
}

console.log('Total mismatches:', issues.length)
const byUni = {}
for (const i of issues) {
  byUni[i.uni] = byUni[i.uni] || []
  byUni[i.uni].push(i)
}
console.log('Universities affected:', Object.keys(byUni).length)
fs.writeFileSync(path.join(__dirname, 'spec-mismatch-audit.json'), JSON.stringify(issues, null, 2))
console.log('Wrote scripts/spec-mismatch-audit.json')
console.log('---')
for (const uni of Object.keys(byUni).sort()) {
  console.log('\n' + uni + ' (' + byUni[uni].length + ')')
  for (const i of byUni[uni]) console.log('  ' + i.program + ' / ' + i.listingSlug + '  (' + i.name + ')')
}
