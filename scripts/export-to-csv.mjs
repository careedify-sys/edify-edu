/**
 * Edify — Export current data to CSV files for Google Sheets import
 * Run: node scripts/export-to-csv.mjs
 * Output: scripts/export/ folder with 3 CSV files
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT  = join(__dirname, 'export')

mkdirSync(OUT, { recursive: true })

// ── CSV helper ────────────────────────────────────────────────────────────────
function esc(v) {
  const s = String(v ?? '').replace(/\r?\n/g, ' ').trim()
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}
function row(arr) { return arr.map(esc).join(',') }
function csv(headers, rows) { return [row(headers), ...rows.map(r => row(r))].join('\n') }

// ── Read and eval data.ts as text ─────────────────────────────────────────────
// We extract the UNIVERSITIES array by building it from the TS source
// using a lightweight approach: compile via Function()

let dataSource = readFileSync(join(ROOT, 'lib', 'data.ts'), 'utf8')
let contentSource = readFileSync(join(ROOT, 'lib', 'content.ts'), 'utf8')

// Strip TypeScript-specific syntax
function stripTS(src) {
  return src
    .replace(/^export type .+?$/gm, '')
    .replace(/^export interface .+?\{[\s\S]*?\n\}/gm, '')
    .replace(/^import .+?$/gm, '')
    .replace(/: Program\[\]/g, '')
    .replace(/: string\[\]/g, '')
    .replace(/: number/g, '')
    .replace(/: string/g, '')
    .replace(/: boolean/g, '')
    .replace(/: UniFeature\[\]/g, '')
    .replace(/: SpecRoles/g, '')
    .replace(/: ProgramDetail/g, '')
    .replace(/: SyllabusSemester/g, '')
    .replace(/: Record<[^>]+>/g, '')
    .replace(/: University\[\]/g, '')
    .replace(/<[A-Za-z, \[\]|']+>/g, '')
    .replace(/export const /g, 'const ')
    .replace(/export function /g, 'function ')
    .replace(/export type \{[^}]+\}/gm, '')
    .replace(/^export \{[^}]+\}/gm, '')
}

// Eval with a sandbox
function evalData(src) {
  const clean = stripTS(src)
  try {
    const fn = new Function('module', 'exports', clean + '\nmodule.exports = { UNIVERSITIES, getUniversityById }')
    const mod = { exports: {} }
    fn(mod, mod.exports)
    return mod.exports
  } catch(e) {
    console.error('Parse error:', e.message)
    return null
  }
}

function evalContent(src) {
  const clean = stripTS(src)
  try {
    const fn = new Function('module', 'exports', clean + '\nmodule.exports = { MASTER_SYLLABUS, UNIVERSITY_SYLLABUS }')
    const mod = { exports: {} }
    fn(mod, mod.exports)
    return mod.exports
  } catch(e) {
    console.error('Content parse error:', e.message)
    return { MASTER_SYLLABUS: {}, UNIVERSITY_SYLLABUS: {} }
  }
}

console.log('📖 Reading data...')
const data = evalData(dataSource)

if (!data || !data.UNIVERSITIES) {
  console.error('❌ Could not parse data.ts — falling back to JSON export approach')
  console.log('Please run: npx tsx scripts/export-to-csv.ts instead')
  process.exit(1)
}

const { UNIVERSITIES } = data
const contentData = evalContent(contentSource)
const MASTER_SYLLABUS = contentData.MASTER_SYLLABUS || {}
const UNIVERSITY_SYLLABUS = contentData.UNIVERSITY_SYLLABUS || {}

console.log(`✅ Loaded ${UNIVERSITIES.length} universities`)

// ── 1. Universities sheet ─────────────────────────────────────────────────────
const UNI_HEADERS = [
  'ID','University Full Name','Abbreviation','City','State','Region',
  'NIRF Rank','NIRF Management Rank','NAAC Grade','NAAC Score',
  'UGC DEB (TRUE/FALSE)','PSU Eligible (TRUE/FALSE)','Govt Recognised (TRUE/FALSE)',
  'Exam Mode','Eligibility','Eligibility %',
  'Fee Min ₹','Fee Max ₹','EMI From ₹/month',
  'Programs Offered','Approvals (comma sep)',
  'Highlight Badge','Tagline','Short Description',
  'Brand Color','Status'
]

const uniRows = UNIVERSITIES.map(u => [
  u.id,
  u.name,
  u.abbr || '',
  u.city || '',
  u.state || '',
  u.region || '',
  u.nirf || '',
  u.nirfMgt || '',
  u.naac || '',
  u.naacScore || '',
  u.ugc ? 'TRUE' : 'FALSE',
  u.psuEligible ? 'TRUE' : 'FALSE',
  'TRUE',
  u.examMode || 'Online',
  u.eligibility || '50% in graduation',
  u.eligibilityPct || '50',
  u.feeMin || '',
  u.feeMax || '',
  u.emiFrom || '',
  (u.programs || []).join(','),
  (u.approvals || []).join(','),
  u.badge || '',
  u.tagline || '',
  u.shortDesc || u.tagline || '',
  u.color || '#0B1D35',
  'active'
])

writeFileSync(join(OUT, '1_universities.csv'), csv(UNI_HEADERS, uniRows), 'utf8')
console.log(`✅ universities.csv — ${uniRows.length} rows`)

// ── 2. Programs sheet ─────────────────────────────────────────────────────────
const PROG_HEADERS = [
  'University ID','Program','Specialisations (comma sep)',
  'Fee Range','Duration','Avg Salary',
  'Entry Roles (comma sep)','Top Companies (comma sep)',
  'Internship / Project Type','Career Outcome (1 sentence)'
]

const progRows = []
for (const u of UNIVERSITIES) {
  if (!u.programDetails) continue
  for (const [prog, pd] of Object.entries(u.programDetails)) {
    if (!pd) continue
    progRows.push([
      u.id,
      prog,
      (pd.specs || []).join(','),
      pd.fees || '',
      pd.duration || '',
      pd.avgSalary || '',
      (pd.roles || []).join(','),
      (pd.topCompanies || []).join(','),
      pd.internshipType || '',
      pd.careerOutcome || '',
    ])
  }
}

writeFileSync(join(OUT, '2_programs.csv'), csv(PROG_HEADERS, progRows), 'utf8')
console.log(`✅ programs.csv — ${progRows.length} rows`)

// ── 3. Syllabus sheet ─────────────────────────────────────────────────────────
const SYL_HEADERS = [
  'University ID','Program','Specialisation (for sem3/4)',
  'Semester 1 Subjects','Semester 2 Subjects','Semester 3 Subjects',
  'Semester 4 Subjects','Semester 5 Subjects','Semester 6 Subjects',
  'Highlight / Key Differentiator'
]

const sylRows = []
const allSyllabus = { ...MASTER_SYLLABUS, ...UNIVERSITY_SYLLABUS }

for (const [key, syl] of Object.entries(allSyllabus)) {
  if (!syl) continue
  const [uniId, prog] = key.split('||')
  sylRows.push([
    uniId,
    prog,
    '',
    Array.isArray(syl.sem1) ? syl.sem1.join(', ') : (syl.sem1 || ''),
    Array.isArray(syl.sem2) ? syl.sem2.join(', ') : (syl.sem2 || ''),
    Array.isArray(syl.sem3) ? syl.sem3.join(', ') : (syl.sem3 || ''),
    Array.isArray(syl.sem4) ? syl.sem4.join(', ') : (syl.sem4 || ''),
    Array.isArray(syl.sem5) ? syl.sem5.join(', ') : (syl.sem5 || ''),
    Array.isArray(syl.sem6) ? syl.sem6.join(', ') : (syl.sem6 || ''),
    syl.highlight || '',
  ])
}

writeFileSync(join(OUT, '3_syllabus.csv'), csv(SYL_HEADERS, sylRows), 'utf8')
console.log(`✅ syllabus.csv — ${sylRows.length} rows`)

// ── 4. Blog sheet ─────────────────────────────────────────────────────────────
let blogSource = readFileSync(join(ROOT, 'lib', 'blog.ts'), 'utf8')
const BLOG_HEADERS = [
  'Slug (URL)','Title','Meta Description','Category',
  'Tags (comma sep)','Published Date','Read Time (min)',
  'Target Keyword','Status','Content (HTML)'
]

// Extract blog posts via regex
const blogMatches = [...blogSource.matchAll(/slug:\s*['"]([^'"]+)['"]/g)]
const titleMatches = [...blogSource.matchAll(/title:\s*['"]([^'"]+)['"]/g)]
const metaMatches = [...blogSource.matchAll(/metaDescription:\s*['"]([^'"]+)['"]/g)]
const catMatches = [...blogSource.matchAll(/category:\s*['"]([^'"]+)['"]/g)]
const dateMatches = [...blogSource.matchAll(/publishedAt:\s*['"]([^'"]+)['"]/g)]
const statusMatches = [...blogSource.matchAll(/status:\s*['"]([^'"]+)['"]/g)]

const blogRows = blogMatches.map((m, i) => [
  m[1],
  titleMatches[i]?.[1] || '',
  metaMatches[i]?.[1] || '',
  catMatches[i]?.[1] || '',
  '',
  dateMatches[i]?.[1] || '',
  '',
  '',
  statusMatches[i]?.[1] || 'published',
  '',
])

writeFileSync(join(OUT, '4_blogs.csv'), csv(BLOG_HEADERS, blogRows), 'utf8')
console.log(`✅ blogs.csv — ${blogRows.length} rows`)

console.log(`\n🎉 Done! CSV files saved to: scripts/export/`)
console.log(`\nNext steps:`)
console.log(`1. Open your Google Sheet`)
console.log(`2. Click on "📊 Universities" tab → File → Import → Upload → select 1_universities.csv → "Replace current sheet"`)
console.log(`3. Repeat for 2_programs.csv → "📚 Programs" tab`)
console.log(`4. Repeat for 3_syllabus.csv → "📖 Syllabus" tab`)
console.log(`5. Repeat for 4_blogs.csv → "✍️ Blog Posts" tab`)
