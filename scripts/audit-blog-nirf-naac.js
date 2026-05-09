// scripts/audit-blog-nirf-naac.js
//
// Audits lib/blog.ts (and other content files) against the source-of-truth
// NIRF 2025 data (nirf_2025_map.json) and NAAC data (lib/data.ts).
// Reports every blog claim that contradicts ground truth.
//
// Run: node scripts/audit-blog-nirf-naac.js

const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '..', 'lib', 'data.ts')
const nirfPath = path.join(__dirname, '..', 'nirf_2025_map.json')

// Sources to scan: { label, path, content }
const sources = []
function add(label, p) {
  if (fs.existsSync(p)) sources.push({ label, path: p, content: fs.readFileSync(p, 'utf8') })
}
add('lib/blog.ts',         path.join(__dirname, '..', 'lib', 'blog.ts'))
add('lib/content.ts',      path.join(__dirname, '..', 'lib', 'content.ts'))
add('lib/guides.ts',       path.join(__dirname, '..', 'lib', 'guides.ts'))
add('lib/coupon-pages.ts', path.join(__dirname, '..', 'lib', 'coupon-pages.ts'))
add('lib/mba-data.ts',     path.join(__dirname, '..', 'lib', 'mba-data.ts'))
add('lib/improved-specs.ts', path.join(__dirname, '..', 'lib', 'improved-specs.ts'))
const jsonDir = path.join(__dirname, '..', 'lib', 'data', 'page-content')
if (fs.existsSync(jsonDir)) {
  for (const f of fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'))) {
    add(`lib/data/page-content/${f}`, path.join(jsonDir, f))
  }
}

const data = fs.readFileSync(dataPath, 'utf8')
const nirfRaw = JSON.parse(fs.readFileSync(nirfPath, 'utf8'))

// ── Build NIRF lookup keyed by short tokens that appear in blog prose ──────
// Each entry maps an alias substring (lowercase) to {uni, mgt, eng, official}
const NIRF_ALIASES = []
for (const [official, ranks] of Object.entries(nirfRaw)) {
  const o = official.toLowerCase()
  const tokens = []
  // Hand-curated alias map for the most common shorthand used in blogs
  if (o.includes('manipal academy') || o.includes('mahe')) tokens.push('mahe', 'manipal academy of higher education', 'manipal academy')
  else if (o.includes('manipal university jaipur') || o.includes('muj')) tokens.push('muj', 'manipal university jaipur', 'manipal jaipur')
  else if (o.includes('sikkim manipal') || o.includes('smu')) tokens.push('smu', 'sikkim manipal')
  else if (o.includes('jain')) tokens.push('jain online', 'jain university', 'jain (deemed')
  else if (o.includes('amity')) tokens.push('amity online', 'amity university')
  else if (o.includes('lovely professional') || o.includes('lpu')) tokens.push('lpu online', 'lpu', 'lovely professional')
  else if (o.includes('symbiosis')) tokens.push('symbiosis ssodl', 'symbiosis school for online', 'symbiosis')
  else if (o.includes('amrita')) tokens.push('amrita vishwa', 'amrita ahead', 'amrita online')
  else if (o.includes('nmims') || o.includes('narsee monjee')) tokens.push('nmims', 'narsee monjee')
  else if (o.includes('chandigarh')) tokens.push('chandigarh university', 'cu online')
  else if (o.includes('upes')) tokens.push('upes online', 'upes')
  else if (o.includes('chitkara')) tokens.push('chitkara')
  else if (o.includes('shoolini')) tokens.push('shoolini')
  else if (o.includes('galgotias')) tokens.push('galgotias')
  else if (o.includes('jss academy') || o.includes('jss aher')) tokens.push('jss aher', 'jss university')
  else if (o.includes('icfai')) tokens.push('icfai', 'ifhe online')
  else if (o.includes('datta meghe')) tokens.push('datta meghe')
  else if (o.includes('kiit')) tokens.push('kiit')
  else if (o.includes('dy patil') || o.includes('d.y. patil') || o.includes('dypu')) tokens.push('dy patil', 'dypu')
  else if (o.includes('alliance')) tokens.push('alliance university')
  else if (o.includes('vit')) tokens.push('vit online', 'vit university')
  else if (o.includes('bits')) tokens.push('bits pilani', 'bits wilp')
  else if (o.includes('graphic era')) tokens.push('graphic era')
  else if (o.includes('jamia hamdard')) tokens.push('jamia hamdard')
  else if (o.includes('parul')) tokens.push('parul university', 'parul online')
  else if (o.includes('shri ramachandra')) tokens.push('sri ramachandra')
  else if (o.includes('mangalayatan')) tokens.push('mangalayatan')
  else if (o.includes('chitkara')) tokens.push('chitkara')
  else if (o.includes('iift')) tokens.push('iift')
  else if (o.includes('jaipur national')) tokens.push('jaipur national')
  else if (o.includes('uttaranchal')) tokens.push('uttaranchal')
  else if (o.includes('subharti')) tokens.push('subharti')
  else if (o.includes('mody')) tokens.push('mody university')

  if (tokens.length === 0) continue
  NIRF_ALIASES.push({ tokens, ranks, official })
}

// ── Build NAAC lookup from lib/data.ts ────────────────────────────────────
// Crude but effective: pair each id: 'xxx' with the next naac: 'X' that
// follows in the file
const NAAC_BY_SLUG = {}
{
  const idRe = /id:\s*'([a-z0-9-]+)'/g
  let m
  while ((m = idRe.exec(data)) !== null) {
    const slug = m[1]
    const after = data.slice(m.index, m.index + 1500)
    const naacM = after.match(/naac:\s*'([^']+)'/)
    if (naacM) NAAC_BY_SLUG[slug] = naacM[1]
  }
}

// ── Scan all sources for NIRF claims ──────────────────────────────────────
const issues = []

for (const src of sources) {
  const blog = src.content
  const blogLower = blog.toLowerCase()

  for (const { tokens, ranks, official } of NIRF_ALIASES) {
   for (const token of tokens) {
    let from = 0
    while (true) {
      const idx = blogLower.indexOf(token, from)
      if (idx === -1) break
      from = idx + token.length
      // Look in a 220-char window around the alias for rank numbers
      const winStart = Math.max(0, idx - 30)
      const winEnd = Math.min(blog.length, idx + 220)
      const win = blog.slice(winStart, winEnd)

      // Patterns to extract claimed rank
      // - "NIRF #N" without category → ambiguous
      // - "#N mgmt" / "#N management"
      // - "#N university" / "#N overall"
      const mgtClaim = win.match(/#\s*(\d{1,3})\s*(?:mgt|mgmt|management)/i)
      const uniClaim = win.match(/#\s*(\d{1,3})\s*(?:university|universities|overall)/i)
      const bareNirfClaim = win.match(/NIRF\s*#\s*(\d{1,3})\b(?!\s*(?:mgt|mgmt|management|university|universities|overall))/i)

      if (mgtClaim) {
        const claimed = parseInt(mgtClaim[1], 10)
        if (ranks.mgt === 0) {
          issues.push({
            type: 'NIRF Management — claimed but NOT RANKED',
            file: src.label,
            token, official, claimed, truth: 'not in NIRF Management 2025',
            context: win.replace(/\s+/g, ' ').slice(0, 200),
            offset: winStart + win.search(/#\s*\d/),
          })
        } else if (ranks.mgt !== claimed) {
          issues.push({
            type: 'NIRF Management — wrong rank',
            file: src.label,
            token, official, claimed, truth: `#${ranks.mgt}`,
            context: win.replace(/\s+/g, ' ').slice(0, 200),
            offset: winStart + win.search(/#\s*\d/),
          })
        }
      }
      if (uniClaim) {
        const claimed = parseInt(uniClaim[1], 10)
        if (ranks.uni === 0) {
          issues.push({
            type: 'NIRF University — claimed but NOT RANKED',
            file: src.label,
            token, official, claimed, truth: 'not in NIRF University 2025',
            context: win.replace(/\s+/g, ' ').slice(0, 200),
            offset: winStart + win.search(/#\s*\d/),
          })
        } else if (ranks.uni !== claimed) {
          issues.push({
            type: 'NIRF University — wrong rank',
            file: src.label,
            token, official, claimed, truth: `#${ranks.uni}`,
            context: win.replace(/\s+/g, ' ').slice(0, 200),
            offset: winStart + win.search(/#\s*\d/),
          })
        }
      }
      if (bareNirfClaim && !mgtClaim && !uniClaim) {
        // Bare "NIRF #N" with no category. Per CLAUDE.md house rule,
        // NIRF mentions must always state the category. Flag for review.
        const claimed = parseInt(bareNirfClaim[1], 10)
        const looksLikeUni = ranks.uni === claimed
        const looksLikeMgt = ranks.mgt === claimed
        const matches = looksLikeUni ? 'matches University' : looksLikeMgt ? 'matches Mgmt' : 'NEITHER'
        issues.push({
          type: 'NIRF — category missing (house-style violation)',
          file: src.label,
          token, official, claimed,
          truth: `uni=${ranks.uni || '—'}, mgt=${ranks.mgt || '—'} (${matches})`,
          context: win.replace(/\s+/g, ' ').slice(0, 200),
          offset: winStart + win.search(/NIRF/i),
        })
      }
    }
   }
  }
}

// Group + dedupe (now keyed on file too)
const grouped = {}
for (const i of issues) {
  const key = `${i.file} || ${i.type} || ${i.token} || ${i.context.slice(0,80)}`
  if (!grouped[key]) grouped[key] = i
}
const dedup = Object.values(grouped)

console.log(`Total unique issues: ${dedup.length}\n`)

// Sort by type then alias
dedup.sort((a, b) => a.type.localeCompare(b.type) || a.token.localeCompare(b.token))

const byType = {}
for (const i of dedup) {
  if (!byType[i.type]) byType[i.type] = []
  byType[i.type].push(i)
}

for (const [type, list] of Object.entries(byType)) {
  console.log(`\n=== ${type} (${list.length}) ===`)
  for (const i of list.slice(0, 60)) {
    console.log(`  • [${i.file}] ${i.token}  claimed:${i.claimed}  truth:${i.truth}`)
    console.log(`    "${i.context.slice(0, 150)}..."`)
  }
  if (list.length > 60) console.log(`  ...and ${list.length - 60} more`)
}
