/**
 * Edify — Export current data to CSV files for Google Sheets import
 * Run: npx tsx scripts/export-to-csv.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { UNIVERSITIES } from '../lib/data'
import { BLOG_POSTS } from '../lib/blog'
import { getMasterSyllabus, getUniversitySyllabus } from '../lib/content'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'export')
mkdirSync(OUT, { recursive: true })

function esc(v: any): string {
  const s = String(v ?? '').replace(/\r?\n/g, ' ').trim()
  if (s.includes(',') || s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
  return s
}
function row(arr: any[]) { return arr.map(esc).join(',') }
function csv(headers: string[], rows: any[][]) {
  return [row(headers), ...rows.map(r => row(r))].join('\n')
}

// ── 1. Universities ───────────────────────────────────────────────────────────
const UNI_HEADERS = [
  'ID','University Full Name','Abbreviation','City','State','Region',
  'NIRF Rank','NIRF Management Rank','NAAC Grade','NAAC Score',
  'UGC DEB (TRUE/FALSE)','PSU Eligible (TRUE/FALSE)','Govt Recognised (TRUE/FALSE)',
  'Exam Mode','Fee Min ₹','Fee Max ₹','EMI From ₹/month',
  'Programs Offered','Approvals (comma sep)',
  'Tagline','Brand Color','Status'
]

const uniRows = UNIVERSITIES.map(u => [
  u.id, u.name, u.abbr, u.city, u.state, u.region,
  u.nirf, u.nirfMgt || '', u.naac, (u as any).naacScore || '',
  u.ugc ? 'TRUE' : 'FALSE',
  u.psuEligible ? 'TRUE' : 'FALSE',
  'TRUE',
  u.examMode || 'Online',
  u.feeMin, u.feeMax, u.emiFrom,
  u.programs.join(','),
  (u.approvals || []).join(','),
  (u as any).tagline || '',
  (u as any).color || '#0B1D35',
  'active'
])

writeFileSync(join(OUT, '1_universities.csv'), csv(UNI_HEADERS, uniRows), 'utf8')
console.log(`✅ 1_universities.csv — ${uniRows.length} rows`)

// ── 2. Programs ───────────────────────────────────────────────────────────────
const PROG_HEADERS = [
  'University ID','Program','Specialisations (comma sep)',
  'Fee Range','Duration','Avg Salary',
  'Entry Roles (comma sep)','Top Companies (comma sep)',
  'Internship / Project Type','Career Outcome (1 sentence)'
]

const progRows: any[][] = []
for (const u of UNIVERSITIES) {
  if (!u.programDetails) continue
  for (const [prog, pd] of Object.entries(u.programDetails)) {
    if (!pd) continue
    progRows.push([
      u.id, prog,
      (pd.specs || []).join(','),
      pd.fees || '', pd.duration || '', pd.avgSalary || '',
      (pd.roles || []).join(','),
      (pd.topCompanies || []).join(','),
      pd.internshipType || '', pd.careerOutcome || '',
    ])
  }
}

writeFileSync(join(OUT, '2_programs.csv'), csv(PROG_HEADERS, progRows), 'utf8')
console.log(`✅ 2_programs.csv — ${progRows.length} rows`)

// ── 3. Syllabus ───────────────────────────────────────────────────────────────
const SYL_HEADERS = [
  'University ID','Program',
  'Semester 1 Subjects','Semester 2 Subjects',
  'Semester 3 Subjects','Semester 4 Subjects'
]

const sylRows: any[][] = []
const PROGRAMS = ['MBA','MCA','BBA','BCA','B.Com','M.Com','MA','MSc','BSc','BA']

for (const u of UNIVERSITIES) {
  for (const prog of PROGRAMS) {
    const syl = getMasterSyllabus(u.id, prog as any) || getUniversitySyllabus(u.id, prog as any)
    if (!syl) continue
    const s = (v: any) => Array.isArray(v) ? v.join(', ') : (v || '')
    sylRows.push([u.id, prog, s(syl.sem1), s(syl.sem2), s(syl.sem3), s(syl.sem4)])
  }
}

writeFileSync(join(OUT, '3_syllabus.csv'), csv(SYL_HEADERS, sylRows), 'utf8')
console.log(`✅ 3_syllabus.csv — ${sylRows.length} rows`)

// ── 4. Blog Posts ─────────────────────────────────────────────────────────────
const BLOG_HEADERS = [
  'Slug (URL)','Title','Meta Description','Category',
  'Tags (comma sep)','Published Date','Read Time (min)',
  'Target Keyword','Status'
]

const blogRows = BLOG_POSTS.map(b => [
  b.slug, b.title, b.metaDescription || '', b.category || '',
  (b.tags || []).join(','), b.publishedAt || '', b.readTime || '',
  b.targetKeyword || '', b.status || 'published'
])

writeFileSync(join(OUT, '4_blogs.csv'), csv(BLOG_HEADERS, blogRows), 'utf8')
console.log(`✅ 4_blogs.csv — ${blogRows.length} rows`)

console.log('\n🎉 All done! Files saved in: scripts/export/')
console.log('\nImport into Google Sheets:')
console.log('1. Open each sheet tab (📊 Universities, 📚 Programs, 📖 Syllabus, ✍️ Blog Posts)')
console.log('2. File → Import → Upload the matching CSV → "Replace current sheet"')
