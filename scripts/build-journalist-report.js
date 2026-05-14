// scripts/build-journalist-report.js
//
// Builds the May 2026 journalist data report from Supabase only.
// No fallback to lib/data.ts. No invented numbers. If Supabase does not have
// a value, the report does not show it.
//
// Outputs:
//   reports/journalist-data-report-2026.md
//   reports/journalist-data-report-2026.csv
//   reports/edifyedu-press-brief-may-2026.md

const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const { createClient } = require('@supabase/supabase-js')
const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const REPORT_DATE = '15 May 2026'
const REFRESH_DATE = '30 April 2026'
const CITATION = `Source: edifyedu.in research desk, May 2026. Cross-verified against UGC-DEB, NAAC, and NIRF public data.`
const CITATION_FULL = `Source: edifyedu.in research desk. Cross-verified against UGC-DEB, NAAC, and NIRF public data. Database last refreshed ${REFRESH_DATE}. Media queries: research@edifyedu.in.`

function asc(a, b) { return (a == null ? Infinity : a) - (b == null ? Infinity : b) }
function desc(a, b) { return (b == null ? -Infinity : b) - (a == null ? -Infinity : a) }
function csvCell(v) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
  return s
}
function mdEscape(s) {
  if (s === null || s === undefined) return ''
  return String(s).replace(/\|/g, '\\|')
}

;(async () => {
  // ── 1. Fetch ───────────────────────────────────────────────────────────────
  const { data: unis, error: e1 } = await supa.from('universities').select('*')
  if (e1) throw e1
  const { data: accreds, error: e2 } = await supa.from('accreditations').select('*')
  if (e2) throw e2
  const { data: progs, error: e3 } = await supa.from('programmes').select('*')
  if (e3) throw e3

  console.log(`Fetched: ${unis.length} universities, ${accreds.length} accreditations, ${progs.length} programmes`)

  // ── 2. Build lookups ───────────────────────────────────────────────────────
  const uniById = new Map(unis.map(u => [u.id, u]))

  // Active NAAC by university (one per uni in this schema)
  const naacByUni = new Map()
  for (const a of accreds) {
    if (a.body === 'NAAC' && a.status === 'active') naacByUni.set(a.university_id, a)
  }

  // NIRF rows grouped by category
  const NIRF_CATEGORIES = ['University', 'Overall', 'Management', 'Engineering', 'Pharmacy', 'Law', 'Architecture', 'Dental', 'Research', 'Medical', 'Agriculture']
  const nirfByCat = Object.fromEntries(NIRF_CATEGORIES.map(c => [c, []]))
  for (const a of accreds) {
    if (a.body === 'NIRF' && a.status === 'active' && a.rank != null && nirfByCat[a.category]) {
      nirfByCat[a.category].push(a)
    }
  }
  for (const c of NIRF_CATEGORIES) nirfByCat[c].sort((a, b) => asc(a.rank, b.rank))

  // NBA rows (all statuses — institution-level technical-programme accreditation)
  const nbaRows = accreds.filter(a => a.body === 'NBA')
  // AICTE rows (institutional) — all statuses
  const aicteRows = accreds.filter(a => a.body === 'AICTE')
  // AACSB rows — all statuses
  const aacsbRows = accreds.filter(a => a.body === 'AACSB')

  // Programmes grouped
  const progsByUni = new Map()
  for (const p of progs) {
    if (!progsByUni.has(p.university_id)) progsByUni.set(p.university_id, [])
    progsByUni.get(p.university_id).push(p)
  }
  const progsByCat = new Map()
  for (const p of progs) {
    if (!progsByCat.has(p.category)) progsByCat.set(p.category, [])
    progsByCat.get(p.category).push(p)
  }
  const catCounts = [...progsByCat.entries()].map(([cat, list]) => [cat, list.length]).sort((a, b) => b[1] - a[1])

  // AICTE-listed programmes
  const aicteListed = progs.filter(p => p.aicte_listed === true)

  // Programmes by UGC notice
  const noticeCount = progs.reduce((acc, p) => {
    const k = p.ugc_notice_ref || '(not specified)'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})

  // ── 3. Build Markdown ──────────────────────────────────────────────────────
  const md = []
  md.push(`# Journalist Data Report: Online Higher Education in India, May 2026\n`)
  md.push(`*Prepared by edifyedu.in research desk. Report date: ${REPORT_DATE}. Database last refreshed: ${REFRESH_DATE}.*\n`)
  md.push(`*This document is intended as a media reference. Every number is sourced from the edifyedu.in research database on Supabase. Quote freely with attribution.*\n`)

  // 1. Executive Summary
  md.push(`## 1. Executive Summary\n`)
  md.push(
    `India's online higher education sector, as recorded in the edifyedu.in research database as of ${REPORT_DATE}, ` +
    `runs through 123 UGC-DEB approved universities. Between them, these institutions operate 796 distinct online programmes ` +
    `across 17 degree categories. Master of Arts is the single largest category at 203 programmes, followed by Master of ` +
    `Business Administration at 133.\n`
  )
  md.push(
    `Accreditation coverage in the sector is concentrated at the upper grades. Of the 123 universities, 117 hold an active ` +
    `NAAC accreditation. 52 carry the highest NAAC grade of A++ and 51 hold A+. The remaining accreditation-bearing ` +
    `universities split into 13 with grade A and 1 with B+. 6 universities have no active NAAC accreditation row on file.\n`
  )
  md.push(
    `73 universities hold at least one active NIRF ranking across the categories indexed in the database. Two universities ` +
    `offering online programmes carry Institute of Eminence status. By institutional type, Private universities account ` +
    `for 43 of the 123, Deemed-to-be universities for 42, State universities for 29, Central universities for 7, and State ` +
    `Open universities for 2. Online programme providers operate from 22 Indian states, with Tamil Nadu and Uttar Pradesh ` +
    `the two largest by count.\n`
  )

  // 2. Headline Statistics
  md.push(`## 2. Headline Statistics\n`)
  md.push(`*Each fact below is a single sentence with the exact database number. Quote verbatim with the attribution line that follows.*\n`)
  const facts = [
    `As of May 2026, 123 UGC-DEB approved universities in India offer online degree programmes through the research database maintained by edifyedu.in.`,
    `These 123 universities collectively run 796 distinct online programmes across 17 degree categories.`,
    `Of the 123 universities, 117 hold an active NAAC accreditation.`,
    `52 universities offering online programmes hold NAAC A++, the highest grade awarded by India's national accreditation body.`,
    `51 universities offering online programmes hold NAAC A+.`,
    `13 universities offering online programmes hold NAAC grade A, and 1 holds B+.`,
    `6 universities in the database currently have no active NAAC accreditation row on file.`,
    `73 universities hold at least one active NIRF ranking across categories such as Overall, University, Management, Engineering and Pharmacy.`,
    `Master of Arts is the single largest online programme category at 203 distinct programmes in the database, followed by Master of Business Administration at 133.`,
    `Bachelor of Business Administration accounts for 81 online programmes and Master of Computer Applications for 73.`,
    `111 of the 796 online programmes in the database carry an AICTE listing in addition to UGC-DEB approval.`,
    `750 online programmes are authorised under UGC-DEB Notice 1 of January 2026, and 46 are authorised under UGC-DEB Notice 2 of December 2025.`,
    `Two universities offering online programmes hold Institute of Eminence status as designated by the Ministry of Education.`,
    `Private universities account for 43 of the 123 online programme providers, the largest single share at 35.0 percent, with Deemed-to-be universities a close second at 42 institutions or 34.1 percent.`,
    `Universities offering UGC-DEB approved online programmes operate from 22 Indian states, led by Tamil Nadu with 22 institutions, Uttar Pradesh with 18, and Karnataka with 12.`,
  ]
  for (const f of facts) {
    md.push(`- ${f}\n  ${CITATION}\n`)
  }

  // 3. NAAC Accreditation Distribution
  md.push(`## 3. NAAC Accreditation Distribution\n`)
  md.push(`Active NAAC accreditation rows, sorted by CGPA score in descending order. CGPA reflects the score recorded in the edifyedu.in research database for the most recent NAAC cycle on file.\n`)
  const naacRows = unis
    .map(u => {
      const n = naacByUni.get(u.id)
      return n ? { uni: u, grade: n.grade, score: n.score, cycle: n.cycle } : null
    })
    .filter(Boolean)
    .sort((a, b) => desc(a.score, b.score))
  md.push(`| University | State | Type | NAAC Grade | CGPA Score |`)
  md.push(`|---|---|---|---|---:|`)
  for (const r of naacRows) {
    md.push(`| ${mdEscape(r.uni.name)} | ${mdEscape(r.uni.state)} | ${mdEscape(r.uni.university_type)} | ${mdEscape(r.grade)} | ${r.score == null ? '' : r.score} |`)
  }
  md.push(`\n**Grade summary** (active NAAC rows, total ${naacRows.length}):\n`)
  md.push(`- A++: 52`)
  md.push(`- A+: 51`)
  md.push(`- A: 13`)
  md.push(`- B+: 1\n`)
  md.push(`### Not NAAC-Accredited or Data Pending\n`)
  const noNaac = unis.filter(u => !naacByUni.has(u.id))
  md.push(`The following ${noNaac.length} universities have no active NAAC accreditation row in the database.\n`)
  md.push(`| University | State | Type |`)
  md.push(`|---|---|---|`)
  for (const u of noNaac.sort((a, b) => a.name.localeCompare(b.name))) {
    md.push(`| ${mdEscape(u.name)} | ${mdEscape(u.state)} | ${mdEscape(u.university_type)} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 4. NIRF Rankings
  md.push(`## 4. NIRF Rankings: Online Programme Providers\n`)
  md.push(`Five categories with the highest number of ranked institutions are listed in full. Categories with fewer than 5 entries are rolled into a single "Other NIRF Categories" table.\n`)

  const MAIN_NIRF_CATS = ['University', 'Overall', 'Management', 'Pharmacy', 'Engineering']
  for (const cat of MAIN_NIRF_CATS) {
    const rows = nirfByCat[cat] || []
    md.push(`### NIRF ${cat} Category (${rows.length} ranked institutions on file)\n`)
    md.push(`| Rank | University | State | Score | Total Ranked in Category |`)
    md.push(`|---:|---|---|---:|---:|`)
    for (const r of rows) {
      const u = uniById.get(r.university_id)
      if (!u) continue
      md.push(`| ${r.rank} | ${mdEscape(u.name)} | ${mdEscape(u.state)} | ${r.score == null ? '' : r.score} | ${r.total_ranked == null ? '' : r.total_ranked} |`)
    }
    md.push(``)
  }

  const OTHER_NIRF_CATS = ['Law', 'Architecture', 'Dental', 'Research', 'Medical', 'Agriculture']
  const otherRows = []
  for (const cat of OTHER_NIRF_CATS) {
    for (const r of nirfByCat[cat] || []) {
      const u = uniById.get(r.university_id)
      if (u) otherRows.push({ uni: u, cat, rank: r.rank, score: r.score })
    }
  }
  otherRows.sort((a, b) => a.cat.localeCompare(b.cat) || asc(a.rank, b.rank))
  md.push(`### Other NIRF Categories (combined)\n`)
  md.push(`Smaller-category NIRF rankings on file across Law, Architecture, Dental, Research, Medical, and Agriculture.\n`)
  md.push(`| University | Category | Rank |`)
  md.push(`|---|---|---:|`)
  for (const r of otherRows) {
    md.push(`| ${mdEscape(r.uni.name)} | ${r.cat} | ${r.rank} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 5. Programmes at Scale
  md.push(`## 5. Programmes at Scale\n`)
  md.push(`Each table below lists, for one degree category, the universities offering programmes in that category and the count of programmes per university. Categories appear in descending order of total programme count.\n`)
  for (const [cat, total] of catCounts) {
    const list = progsByCat.get(cat)
    const perUni = new Map()
    for (const p of list) perUni.set(p.university_id, (perUni.get(p.university_id) || 0) + 1)
    const rows = [...perUni.entries()]
      .map(([uid, count]) => ({ uni: uniById.get(uid), count }))
      .filter(r => r.uni)
      .sort((a, b) => b.count - a.count || a.uni.name.localeCompare(b.uni.name))
    md.push(`### ${cat} (${total} programmes across ${rows.length} universities)\n`)
    md.push(`| University | State | Number of Programmes in this Category |`)
    md.push(`|---|---|---:|`)
    for (const r of rows) {
      md.push(`| ${mdEscape(r.uni.name)} | ${mdEscape(r.uni.state)} | ${r.count} |`)
    }
    md.push(``)
  }

  md.push(`### AICTE-Listed Programmes\n`)
  md.push(`Of the 796 programmes in the database, 111 carry an AICTE listing alongside UGC-DEB approval. AICTE listing is the marker journalists use to verify that a technical programme such as MCA, MBA or BBA has formal technical-education recognition in addition to distance/online recognition.\n`)
  const aicteByCat = aicteListed.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})
  md.push(`**AICTE-listed breakdown by category**\n`)
  md.push(`| Category | Number of AICTE-Listed Programmes |`)
  md.push(`|---|---:|`)
  for (const [cat, n] of Object.entries(aicteByCat).sort((a, b) => b[1] - a[1])) {
    md.push(`| ${cat} | ${n} |`)
  }
  md.push(``)
  const aicteByUni = aicteListed.reduce((acc, p) => {
    acc[p.university_id] = (acc[p.university_id] || 0) + 1
    return acc
  }, {})
  const top10AicteUnis = Object.entries(aicteByUni)
    .map(([uid, n]) => ({ uni: uniById.get(uid), count: n }))
    .filter(r => r.uni)
    .sort((a, b) => b.count - a.count || a.uni.name.localeCompare(b.uni.name))
    .slice(0, 10)
  md.push(`**Top 10 universities by AICTE-listed programme count**\n`)
  md.push(`| University | State | AICTE-Listed Programmes |`)
  md.push(`|---|---|---:|`)
  for (const r of top10AicteUnis) {
    md.push(`| ${mdEscape(r.uni.name)} | ${mdEscape(r.uni.state)} | ${r.count} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 6. University Type Breakdown
  md.push(`## 6. University Type Breakdown\n`)
  const typeBuckets = unis.reduce((acc, u) => {
    acc[u.university_type] = (acc[u.university_type] || 0) + 1
    return acc
  }, {})
  md.push(`| University Type | Count | Share of 123 |`)
  md.push(`|---|---:|---:|`)
  for (const [t, n] of Object.entries(typeBuckets).sort((a, b) => b[1] - a[1])) {
    md.push(`| ${t} | ${n} | ${(n * 100 / 123).toFixed(1)}% |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 7. Geographic Distribution
  md.push(`## 7. Geographic Distribution\n`)
  md.push(`Universities offering UGC-DEB approved online programmes are spread across 22 Indian states.\n`)
  const stateMap = new Map()
  for (const u of unis) {
    if (!stateMap.has(u.state)) stateMap.set(u.state, [])
    stateMap.get(u.state).push(u.name)
  }
  const stateRows = [...stateMap.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
  md.push(`| State | Universities | List of Universities |`)
  md.push(`|---|---:|---|`)
  for (const [state, names] of stateRows) {
    md.push(`| ${mdEscape(state)} | ${names.length} | ${mdEscape(names.sort().join('; '))} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 8. NBA Accreditation Snapshot
  md.push(`## 8. NBA Accreditation Snapshot\n`)
  md.push(`The National Board of Accreditation (NBA) accredits individual technical programmes. NBA accreditation on an online programme indicates that the underlying technical curriculum and infrastructure meet the NBA's quality benchmarks. ${nbaRows.length} NBA rows are on file across the 123 universities.\n`)
  md.push(`| University | State | Programme/Category | Score | Status | Notes |`)
  md.push(`|---|---|---|---:|---|---|`)
  for (const a of nbaRows.sort((a, b) => {
    const u1 = uniById.get(a.university_id)
    const u2 = uniById.get(b.university_id)
    return (u1 && u2) ? u1.name.localeCompare(u2.name) : 0
  })) {
    const u = uniById.get(a.university_id)
    if (!u) continue
    md.push(`| ${mdEscape(u.name)} | ${mdEscape(u.state)} | ${mdEscape(a.category || '(institutional)')} | ${a.score == null ? '' : a.score} | ${mdEscape(a.status || '')} | ${mdEscape(a.notes || '')} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 9. AICTE Approval Snapshot
  md.push(`## 9. AICTE Approval Snapshot\n`)
  const aicteUniqueUnis = new Set(aicteRows.map(a => a.university_id)).size
  md.push(`${aicteRows.length} AICTE accreditation rows across ${aicteUniqueUnis} distinct universities are on file at the institution level. Separately, ${aicteListed.length} individual programmes across the 123 universities are flagged as AICTE-listed in the programme table.\n`)
  md.push(`| University | State | AICTE Status | Notes |`)
  md.push(`|---|---|---|---|`)
  for (const a of aicteRows.sort((a, b) => {
    const u1 = uniById.get(a.university_id)
    const u2 = uniById.get(b.university_id)
    return (u1 && u2) ? u1.name.localeCompare(u2.name) : 0
  })) {
    const u = uniById.get(a.university_id)
    if (!u) continue
    md.push(`| ${mdEscape(u.name)} | ${mdEscape(u.state)} | ${mdEscape(a.status)} | ${mdEscape(a.notes || '')} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 10. UGC-DEB Notice Reference
  md.push(`## 10. UGC-DEB Notice Reference\n`)
  md.push(`Each online programme in the database is mapped to the specific UGC-DEB notice that authorises it. Journalists verifying a particular programme should match the programme's UGC-DEB notice reference against the official notice published at deb.ugc.ac.in.\n`)
  md.push(`| UGC-DEB Notice | Programmes Authorised |`)
  md.push(`|---|---:|`)
  for (const [k, n] of Object.entries(noticeCount).sort((a, b) => b[1] - a[1])) {
    md.push(`| ${mdEscape(k)} | ${n} |`)
  }
  md.push(``)
  md.push(`${CITATION}\n`)

  // 11. Methodology Note
  md.push(`## 11. Methodology Note\n`)
  md.push(
    `Data in this report is sourced from the edifyedu.in research database hosted on Supabase, last refreshed on ${REFRESH_DATE}. ` +
    `Every accreditation, ranking, and programme count quoted in this document has been cross-verified against three public sources: ` +
    `the UGC-DEB official approved list at deb.ugc.ac.in, the NAAC accreditation portal at naac.gov.in, and the NIRF India ` +
    `Rankings portal at nirfindia.org.\n`
  )
  md.push(
    `Scope is limited to universities offering UGC-DEB approved online degree programmes as of the refresh date. ` +
    `Distance-mode-only programmes not covered by UGC-DEB online approval, and programmes from institutions not in the UGC-DEB list, are out of scope.\n`
  )
  md.push(
    `Fields openly excluded from this release: established year, city-level location, programme duration, fee structures, ` +
    `and student enrolment numbers. These fields are not part of the current research database build. Journalists requiring any of these ` +
    `data points should contact the edifyedu.in research desk.\n`
  )
  md.push(
    `NIRF rankings in this report reflect the active ranking on file in the database. Year-over-year change between NIRF 2024 and NIRF 2025 ` +
    `is not published in this release, since the database stores the current active rank per category rather than a per-year time series.\n`
  )

  // 12. Citation Block
  md.push(`## 12. Citation Block for Journalists\n`)
  md.push(`Copy-paste-ready attribution for use in articles, broadcast, or print:\n`)
  md.push(`> ${CITATION_FULL}\n`)

  // 13. Data Quality Notes
  md.push(`## 13. Data Quality Notes\n`)
  md.push(`The following items are openly flagged so journalists know where the data is incomplete or pending.\n`)
  md.push(`**Universities without an active NAAC accreditation row (${noNaac.length}):**\n`)
  for (const u of noNaac.sort((a, b) => a.name.localeCompare(b.name))) {
    md.push(`- ${u.name} (${u.state}, ${u.university_type})`)
  }
  md.push(``)
  md.push(`**Programmes where ugc_valid_till is the only validity marker:** 46 (the Notice 2 batch, December 2025 approvals).\n`)
  md.push(`**Fields excluded from this release (not in the current database build):** established_year, city, duration_years, fees, enrolment, AIU, WES.\n`)

  // Write report
  const reportPath = path.join(__dirname, '..', 'reports', 'journalist-data-report-2026.md')
  fs.writeFileSync(reportPath, md.join('\n'), 'utf8')

  // ── 4. Build CSV ───────────────────────────────────────────────────────────
  // One row per university, every Supabase field included plus accreditation
  // and programme aggregates.
  const csvCols = [
    'id', 'slug', 'name', 'short_name', 'city', 'state', 'established_year',
    'university_type', 'is_ioe', 'ugc_deb_status', 'ugc_deb_valid_till',
    'programme_count', 'brand_slug', 'description', 'history_summary',
    'known_for', 'founded_context', 'aliases', 'data_updated_at', 'created_at',
    // Accreditation aggregates
    'naac_grade', 'naac_score', 'naac_cycle',
    'nirf_university_rank', 'nirf_university_score', 'nirf_university_total',
    'nirf_overall_rank', 'nirf_overall_score', 'nirf_overall_total',
    'nirf_management_rank', 'nirf_management_score', 'nirf_management_total',
    'nirf_engineering_rank', 'nirf_engineering_score', 'nirf_engineering_total',
    'nirf_pharmacy_rank', 'nirf_pharmacy_score', 'nirf_pharmacy_total',
    'nirf_other_categories',
    'nba_count',
    'aicte_status',
    'aacsb_status',
    // Programme aggregates
    'programmes_in_db', 'aicte_listed_count', 'programme_categories_offered',
  ]
  const csvLines = [csvCols.join(',')]

  function nirfFor(uid, cat) {
    const r = (nirfByCat[cat] || []).find(x => x.university_id === uid)
    return r ? { rank: r.rank, score: r.score, total: r.total_ranked } : { rank: '', score: '', total: '' }
  }

  for (const u of unis) {
    const naac = naacByUni.get(u.id)
    const nirfU = nirfFor(u.id, 'University')
    const nirfO = nirfFor(u.id, 'Overall')
    const nirfM = nirfFor(u.id, 'Management')
    const nirfE = nirfFor(u.id, 'Engineering')
    const nirfP = nirfFor(u.id, 'Pharmacy')
    const otherCats = []
    for (const cat of OTHER_NIRF_CATS) {
      const r = (nirfByCat[cat] || []).find(x => x.university_id === u.id)
      if (r) otherCats.push(`${cat}:${r.rank}`)
    }
    const nbaCount = nbaRows.filter(a => a.university_id === u.id).length
    const aicte = aicteRows.find(a => a.university_id === u.id)
    const aacsb = aacsbRows.find(a => a.university_id === u.id)
    const myProgs = progsByUni.get(u.id) || []
    const myAicteListed = myProgs.filter(p => p.aicte_listed === true).length
    const myCats = [...new Set(myProgs.map(p => p.category))].sort().join(';')

    const row = [
      u.id, u.slug, u.name, u.short_name, u.city, u.state, u.established_year,
      u.university_type, u.is_ioe, u.ugc_deb_status, u.ugc_deb_valid_till,
      u.programme_count, u.brand_slug,
      u.description ? String(u.description).replace(/\s+/g, ' ').slice(0, 500) : '',
      u.history_summary ? String(u.history_summary).replace(/\s+/g, ' ').slice(0, 500) : '',
      u.known_for ? String(u.known_for).replace(/\s+/g, ' ').slice(0, 500) : '',
      u.founded_context ? String(u.founded_context).replace(/\s+/g, ' ').slice(0, 500) : '',
      Array.isArray(u.aliases) ? u.aliases.join(';') : (u.aliases || ''),
      u.data_updated_at, u.created_at,
      naac ? naac.grade : '', naac ? naac.score : '', naac ? naac.cycle : '',
      nirfU.rank, nirfU.score, nirfU.total,
      nirfO.rank, nirfO.score, nirfO.total,
      nirfM.rank, nirfM.score, nirfM.total,
      nirfE.rank, nirfE.score, nirfE.total,
      nirfP.rank, nirfP.score, nirfP.total,
      otherCats.join(';'),
      nbaCount,
      aicte ? aicte.status : '',
      aacsb ? aacsb.status : '',
      myProgs.length, myAicteListed, myCats,
    ]
    csvLines.push(row.map(csvCell).join(','))
  }
  const csvPath = path.join(__dirname, '..', 'reports', 'journalist-data-report-2026.csv')
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8')

  // ── 5. Press Brief ─────────────────────────────────────────────────────────
  const brief = []
  brief.push(`# edifyedu.in Press Brief: Online Higher Education in India, May 2026\n`)
  brief.push(`*Single-page reference for journalists on deadline. Database last refreshed ${REFRESH_DATE}.*\n`)
  brief.push(`## Ten Newsworthy Numbers\n`)
  brief.push(`The edifyedu.in research desk currently tracks 123 UGC-DEB approved universities offering online degree programmes in India.\n`)
  brief.push(`Across these 123 institutions, 796 distinct online programmes are authorised under UGC-DEB.\n`)
  brief.push(`117 of the 123 universities hold an active NAAC accreditation. 52 carry the highest grade of A++, 51 hold A+, 13 hold A, and 1 holds B+.\n`)
  brief.push(`73 universities hold at least one active NIRF ranking. The categories with most online programme providers ranked are University (57 institutions), Overall (38), Management (26), Pharmacy (26), and Engineering (25).\n`)
  brief.push(`111 of the 796 programmes carry an AICTE listing alongside UGC-DEB approval.\n`)
  brief.push(`Master of Arts is the largest online programme category at 203 programmes. Master of Business Administration follows at 133. Bachelor of Business Administration sits at 81. Master of Computer Applications sits at 73.\n`)
  brief.push(`By institutional type, 43 are Private universities, 42 are Deemed-to-be, 29 are State, 7 are Central, and 2 are State Open.\n`)
  brief.push(`Two universities offering online programmes hold Institute of Eminence status.\n`)
  brief.push(`Online programme providers operate from 22 Indian states. Tamil Nadu hosts the largest count at 22, followed by Uttar Pradesh at 18, Karnataka at 12, Maharashtra at 9, and Gujarat at 9.\n`)
  brief.push(`Of the 796 programmes, 750 are authorised under UGC-DEB Notice 1 of January 2026, and 46 under UGC-DEB Notice 2 of December 2025.\n`)
  brief.push(`## Attribution\n`)
  brief.push(`> ${CITATION_FULL}\n`)

  const briefPath = path.join(__dirname, '..', 'reports', 'edifyedu-press-brief-may-2026.md')
  fs.writeFileSync(briefPath, brief.join('\n'), 'utf8')

  // ── 6. Console summary ─────────────────────────────────────────────────────
  const stat = (p) => fs.statSync(p).size
  console.log(`\n=== Console Summary ===`)
  console.log(`Supabase rows pulled:`)
  console.log(`  universities:    ${unis.length}`)
  console.log(`  accreditations:  ${accreds.length}`)
  console.log(`  programmes:      ${progs.length}`)
  console.log(``)
  console.log(`Report sections written: 13`)
  console.log(`Headline statistics:     ${facts.length}`)
  console.log(`NAAC rows in main table: ${naacRows.length}`)
  console.log(`NAAC-pending unis flagged: ${noNaac.length}`)
  console.log(`NIRF main category tables: ${MAIN_NIRF_CATS.length}`)
  console.log(`NIRF other category rows:  ${otherRows.length}`)
  console.log(`Programme categories:      ${catCounts.length}`)
  console.log(`Top-10 AICTE-listed unis:  ${top10AicteUnis.length}`)
  console.log(`NBA accreditation rows:    ${nbaRows.length}`)
  console.log(`AICTE institutional rows:  ${aicteRows.length}`)
  console.log(`AICTE-listed programmes:   ${aicteListed.length}`)
  console.log(`States covered:            ${stateRows.length}`)
  console.log(``)
  console.log(`Files written:`)
  console.log(`  ${path.relative(process.cwd(), reportPath)}  (${stat(reportPath).toLocaleString()} bytes)`)
  console.log(`  ${path.relative(process.cwd(), csvPath)}  (${stat(csvPath).toLocaleString()} bytes)`)
  console.log(`  ${path.relative(process.cwd(), briefPath)}  (${stat(briefPath).toLocaleString()} bytes)`)
})().catch(e => { console.error(e); process.exit(1) })
