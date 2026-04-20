/**
 * audit-syllabus.js — v2 (fixed delimiters + cross-checks both code sources)
 *
 * Three data sources for syllabus in this codebase:
 *   1. lib/data.ts → pd.syllabus       — used by UniProgramBody (very sparse, 7 entries)
 *   2. lib/content.ts MASTER_SYLLABUS   — used by UniSpecBody via getMasterSyllabus()
 *   3. data/xlsx Programs sheet        — raw source for future import
 *
 * This script audits all three and cross-references them.
 */

const XLSX = require('xlsx')
const fs   = require('fs')
const path = require('path')

const XLSX_PATH    = path.resolve(__dirname, '../data/EdifyEdu_Unified_Programs_v3.xlsx')
const DATA_TS      = path.resolve(__dirname, '../lib/data.ts')
const CONTENT_TS   = path.resolve(__dirname, '../lib/content.ts')
const OUT_PATH     = path.resolve(__dirname, 'syllabus-audit.md')

// Min subjects per sem for FULL classification
const MIN_SUBJECTS = { mba: 4, mca: 4, bba: 5, bca: 5, default: 3 }

const PRIORITY_SLUGS = [
  { label: 'Amity',          slug: 'amity-university-online' },
  { label: 'IGNOU',          slug: 'ignou-online' },
  { label: 'Manipal Jaipur', slug: 'manipal-university-jaipur-online' },
  { label: 'LPU',            slug: 'lovely-professional-university-online' },
  { label: 'NMIMS',          slug: 'nmims-online' },
  { label: 'Jain',           slug: 'jain-university-online' },
  { label: 'Sathyabama',     slug: 'sathyabama-university-online' },
  { label: 'VTU',            slug: 'vtu-online' },
  { label: 'DY Patil',       slug: 'dr-dy-patil-vidyapeeth-online' },
  { label: 'Chandigarh',     slug: 'chandigarh-university-online' },
  { label: 'Amrita',         slug: 'amrita-vishwa-vidyapeetham-online' },
  { label: 'Shoolini',       slug: 'shoolini-university-online' },
  { label: 'SMU',            slug: 'sikkim-manipal-university-online' },
  { label: 'UPES',           slug: 'upes-online' },
  { label: 'Vignan',         slug: 'vignan-university-online' },
  { label: 'DSU',            slug: 'dayananda-sagar-university-online' },
  { label: 'Galgotias',      slug: 'galgotias-university-online' },
  { label: 'NIU',            slug: 'noida-international-university-online' },
  { label: 'JIIT',           slug: 'jaypee-university-online' },
  { label: 'ARKA JAIN',      slug: 'arka-jain-university-online' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

// Splits on comma, semicolon, OR pipe — handles all three xlsx styles
function countSubjects(cellValue) {
  if (!cellValue || typeof cellValue !== 'string') return 0
  const v = cellValue.trim()
  if (!v || /^(not mentioned|see above|n\/a|na|tbd|-+)$/i.test(v)) return 0
  return v.split(/[,;|]/).map(s => s.trim()).filter(s => s.replace(/[•\-\s]/g,'').length > 2).length
}

function classifyXlsx(row, H, program) {
  const min  = MIN_SUBJECTS[program] || MIN_SUBJECTS.default
  const sems = ['sem1','sem2','sem3','sem4'].map(k => countSubjects(row[H(k)]))
  if (sems.every(c => c >= min)) return 'FULL'
  if (sems.some(c => c > 0))     return 'PARTIAL'
  return 'EMPTY'
}

function missingDetail(row, H, program) {
  const min  = MIN_SUBJECTS[program] || MIN_SUBJECTS.default
  return ['sem1','sem2','sem3','sem4'].map((k, i) => {
    const c = countSubjects(row[H(k)])
    if (c === 0)    return `Sem${i+1} missing`
    if (c < min)    return `Sem${i+1} only ${c} subj (<${min})`
    return null
  }).filter(Boolean).join(', ')
}

// ── Source 1: XLSX ────────────────────────────────────────────────────────────

const wb      = XLSX.readFile(XLSX_PATH)
const ws      = wb.Sheets['Programs']
const allRows = XLSX.utils.sheet_to_json(ws, { header: 1 })
const headers = allRows[0]
const H       = (col) => headers.indexOf(col)

const generalRows = allRows.slice(1).filter(r => {
  const gen  = String(r[H('is_general')] || '').toUpperCase()
  const prog = String(r[H('program')]    || '').trim().toLowerCase()
  const slug = String(r[H('university_slug')] || '').trim()
  return gen === 'TRUE' && prog && slug
})

const xlsxResults = generalRows.map(row => {
  const slug    = String(row[H('university_slug')] || '').trim()
  const name    = String(row[H('university_name')] || '').trim()
  const program = String(row[H('program')]          || '').trim().toLowerCase()
  const status  = classifyXlsx(row, H, program)
  const missing = status === 'PARTIAL' ? missingDetail(row, H, program) : ''
  const subjectCounts = ['sem1','sem2','sem3','sem4'].map(k => countSubjects(row[H(k)]))
  return { slug, name, program, status, missing, subjectCounts }
})

// ── Source 2: MASTER_SYLLABUS in content.ts ───────────────────────────────────
// (what UniSpecBody actually renders)

const contentSrc = fs.readFileSync(CONTENT_TS, 'utf8')
const masterKeys = [...contentSrc.matchAll(/'([^']+\|\|[^']+)'\s*:/g)].map(m => m[1])
const masterBySlugProg = {}
masterKeys.forEach(k => {
  const [slug, prog] = k.split('||')
  masterBySlugProg[`${slug}||${prog}`] = true
})

// ── Source 3: pd.syllabus in data.ts ─────────────────────────────────────────
// (what UniProgramBody actually renders)
// Extract uni+program combos that have a syllabus: { ... } block with sem1 data

const dataSrc = fs.readFileSync(DATA_TS, 'utf8')
// Find all programDetails blocks — look for syllabus: { sem1:
const pdSyllabusMatches = [...dataSrc.matchAll(/syllabus:\s*\{[^}]+sem1[^}]+\}/g)]
// We can't easily extract the uni slug from these without a full parser, so count only
const pdSyllabusCount = pdSyllabusMatches.length

// ── Aggregate xlsxResults ─────────────────────────────────────────────────────

const PROGRAMS = ['mba','mca','bba','bca','bcom','ma','mcom','ba','msc','bsc','other']
const totals   = { FULL: 0, PARTIAL: 0, EMPTY: 0 }
const byProg   = {}
PROGRAMS.forEach(p => { byProg[p] = { FULL: 0, PARTIAL: 0, EMPTY: 0 } })

xlsxResults.forEach(({ program, status }) => {
  totals[status]++
  const p = PROGRAMS.includes(program) ? program : 'other'
  byProg[p][status]++
})

const total   = xlsxResults.length
const pct     = n => total ? Math.round(n / total * 100) : 0
const partials = xlsxResults.filter(r => r.status === 'PARTIAL')
const empties  = xlsxResults.filter(r => r.status === 'EMPTY')
const fulls    = xlsxResults.filter(r => r.status === 'FULL')

// MBA-only lookups for priority check
const xlsxMbaBySlug = {}
xlsxResults.filter(r => r.program === 'mba').forEach(r => { xlsxMbaBySlug[r.slug] = r })

// ── Console output ────────────────────────────────────────────────────────────

console.log('\n=== XLSX Programs sheet (is_general=TRUE rows) ===')
console.log(`TOTAL: ${total} uni × program combos`)
console.log(`FULL:    ${totals.FULL} (${pct(totals.FULL)}%)  ← all 4 sems meet min-subject threshold`)
console.log(`PARTIAL: ${totals.PARTIAL} (${pct(totals.PARTIAL)}%)  ← some sems present but thin`)
console.log(`EMPTY:   ${totals.EMPTY} (${pct(totals.EMPTY)}%)  ← no syllabus data`)

console.log('\nProgram breakdown (xlsx):')
PROGRAMS.forEach(p => {
  const b = byProg[p]
  const t = b.FULL + b.PARTIAL + b.EMPTY
  if (!t) return
  console.log(`  ${p.toUpperCase().padEnd(6)}: FULL=${String(b.FULL).padStart(2)}  PARTIAL=${String(b.PARTIAL).padStart(2)}  EMPTY=${String(b.EMPTY).padStart(2)}  (total ${t})`)
})

console.log('\n=== Code data sources (what actually renders on site) ===')
console.log(`MASTER_SYLLABUS entries (content.ts) — used by UniSpecBody:`)
console.log(`  MBA=${[...contentSrc.matchAll(/'[^']+\|\|MBA'\s*:/g)].length}  MCA=${[...contentSrc.matchAll(/'[^']+\|\|MCA'\s*:/g)].length}  BBA=${[...contentSrc.matchAll(/'[^']+\|\|BBA'\s*:/g)].length}  BCA=${[...contentSrc.matchAll(/'[^']+\|\|BCA'\s*:/g)].length}  total=${masterKeys.length}`)
console.log(`pd.syllabus entries (data.ts) — used by UniProgramBody:`)
console.log(`  ${pdSyllabusCount} uni-program combos have syllabus data in data.ts`)

console.log('\nTop 20 priority unis — MBA status (xlsx + MASTER_SYLLABUS):')
PRIORITY_SLUGS.forEach(({ label, slug }) => {
  const xlsxStatus   = xlsxMbaBySlug[slug] ? `${xlsxMbaBySlug[slug].status} [xlsx sems: ${xlsxMbaBySlug[slug].subjectCounts.join('/')}]` : 'NOT IN XLSX'
  const masterStatus = masterBySlugProg[`${slug}||MBA`] ? 'IN MASTER_SYLLABUS' : 'NOT IN MASTER_SYLLABUS'
  console.log(`  ${label.padEnd(16)}: ${xlsxStatus.padEnd(40)} | ${masterStatus}`)
})

console.log('')

// ── Write markdown ────────────────────────────────────────────────────────────

const now = new Date().toISOString().split('T')[0]
let md = `# Syllabus Data Audit — EdifyEdu (v2, fixed delimiters)\n_Generated: ${now}_\n\n`

md += `## TL;DR — What actually renders on the site\n\n`
md += `| Component | Data source | Coverage |\n|---|---|---|\n`
md += `| UniSpecBody (spec pages) | \`MASTER_SYLLABUS\` in content.ts | MBA: ${[...contentSrc.matchAll(/'[^']+\|\|MBA'\s*:/g)].length} unis, MCA: ${[...contentSrc.matchAll(/'[^']+\|\|MCA'\s*:/g)].length} unis |\n`
md += `| UniProgramBody (program pages) | \`pd.syllabus\` in data.ts | Only ${pdSyllabusCount} combos |\n`
md += `| Both | xlsx (raw, not yet synced to code) | ${totals.FULL} FULL, ${totals.PARTIAL} PARTIAL, ${totals.EMPTY} EMPTY |\n\n`

md += `## XLSX Audit Summary (is_general=TRUE rows)\n\n`
md += `| Status | Count | % | Meaning |\n|---|---|---|---|\n`
md += `| FULL | ${totals.FULL} | ${pct(totals.FULL)}% | All 4 sems ≥ min subjects |\n`
md += `| PARTIAL | ${totals.PARTIAL} | ${pct(totals.PARTIAL)}% | Some sems present but thin |\n`
md += `| EMPTY | ${totals.EMPTY} | ${pct(totals.EMPTY)}% | No sem data at all |\n`
md += `| **TOTAL** | **${total}** | 100% | |\n\n`

md += `## XLSX — Breakdown by Program\n\n`
md += `| Program | FULL | PARTIAL | EMPTY | Total | Min subj/sem |\n|---|---|---|---|---|---|\n`
PROGRAMS.forEach(p => {
  const b = byProg[p]; const t = b.FULL + b.PARTIAL + b.EMPTY
  if (!t) return
  const min = MIN_SUBJECTS[p] || MIN_SUBJECTS.default
  md += `| ${p.toUpperCase()} | ${b.FULL} | ${b.PARTIAL} | ${b.EMPTY} | ${t} | ${min} |\n`
})
md += '\n'

md += `## Priority MBA Universities\n\n`
md += `| University | Slug | xlsx status | Subj per sem (1/2/3/4) | MASTER_SYLLABUS |\n|---|---|---|---|---|\n`
PRIORITY_SLUGS.forEach(({ label, slug }) => {
  const x = xlsxMbaBySlug[slug]
  const xlsxSt = x ? x.status : 'NOT IN XLSX'
  const counts = x ? x.subjectCounts.join('/') : '-'
  const master = masterBySlugProg[`${slug}||MBA`] ? '✓ YES' : '✗ no'
  md += `| ${label} | ${slug} | ${xlsxSt} | ${counts} | ${master} |\n`
})
md += '\n'

md += `## FULL rows (xlsx) — ready to sync\n\n`
md += `| Slug | Program | Subj per sem (1/2/3/4) |\n|---|---|---|\n`
fulls.forEach(r => { md += `| ${r.slug} | ${r.program.toUpperCase()} | ${r.subjectCounts.join('/')} |\n` })
md += '\n'

md += `## PARTIAL rows — what is missing\n\n`
md += `| Slug | Program | Missing | Subj per sem |\n|---|---|---|---|\n`
partials.forEach(r => { md += `| ${r.slug} | ${r.program.toUpperCase()} | ${r.missing} | ${r.subjectCounts.join('/')} |\n` })
md += '\n'

md += `## EMPTY rows\n\n`
md += `| Slug | Program |\n|---|---|\n`
empties.forEach(r => { md += `| ${r.slug} | ${r.program.toUpperCase()} |\n` })
md += '\n'

fs.writeFileSync(OUT_PATH, md, 'utf8')
console.log(`Audit written to: ${OUT_PATH}`)
