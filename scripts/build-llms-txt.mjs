#!/usr/bin/env node
// scripts/build-llms-txt.mjs
//
// Generates public/llms.txt from lib/data.ts plus a committed snapshot of
// Supabase-verified NAAC grades.
//
// Why this exists. llms.txt is the one file on the site written purely to be
// read by language models, and on 2026-09-28 eight of its twenty-two NAAC
// claims were wrong, stale or unverifiable, and its university count said
// "125+" against an actual 143. Six of the eight contradicted lib/data.ts, so
// a model reading both saw an accuracy-positioned site disagreeing with
// itself. Hand-maintaining it is what let that happen; generating it means it
// cannot drift from the database again.
//
// NAAC policy, which is the point of the whole script:
//   - A grade is printed only when the Supabase accreditations table confirms
//     it AND the cycle has not lapsed.
//   - A lapsed cycle prints no grade. Chandigarh University's A+ expired on
//     2026-09-09 and was still being asserted here.
//   - A university with no Supabase row prints no grade, however confident
//     lib/data.ts is. See the supabase-truth rule: Supabase is the source of
//     truth for accreditation claims.
//
// Modes:
//   node scripts/build-llms-txt.mjs                  write public/llms.txt
//   node scripts/build-llms-txt.mjs --check          fail if the file is stale
//   node scripts/build-llms-txt.mjs --refresh-naac   re-pull the NAAC snapshot
//                                                    from Supabase (needs creds)
//
// Wired into .husky/pre-commit via --check.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'llms.txt')
const SNAPSHOT = join(ROOT, 'data', 'naac-verified.json')

const argv = process.argv.slice(2)
const CHECK = argv.includes('--check')
const REFRESH = argv.includes('--refresh-naac')

const { UNIVERSITIES } = await import('../lib/data.ts')

// ── NAAC snapshot ────────────────────────────────────────────────────────────
// Kept as a committed file so an ordinary build never needs Supabase creds.
// Refresh it deliberately with --refresh-naac; audit-naac-validity.mjs is the
// tool that tells you when a cycle is about to lapse.

async function refreshSnapshot() {
  const { createClient } = await import('@supabase/supabase-js')
  const { resolveSupabaseSlug } = await import('./lib/supabase-uni-map.mjs')
  const envPath = join(ROOT, '.env.local')
  if (existsSync(envPath)) {
    for (const l of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('build-llms-txt: --refresh-naac needs Supabase credentials in .env.local')
    process.exit(1)
  }
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: unis, error: e1 } = await supa.from('universities').select('id,name,slug')
  if (e1) { console.error('build-llms-txt:', e1.message); process.exit(1) }
  const { data: acc, error: e2 } = await supa.from('accreditations').select('university_id,body,grade,valid_till')
  if (e2) { console.error('build-llms-txt:', e2.message); process.exit(1) }

  const naacBy = {}
  for (const a of acc) if (a.body === 'NAAC') naacBy[a.university_id] = a
  const bySlug = {}
  for (const u of unis) bySlug[u.slug] = u

  const out = {}
  for (const u of UNIVERSITIES) {
    const slug = resolveSupabaseSlug(u.id, unis)
    const row = slug && bySlug[slug] ? naacBy[bySlug[slug].id] : null
    if (!row || !row.grade) continue
    out[u.id] = { grade: String(row.grade).toUpperCase(), validTill: row.valid_till || null }
  }
  writeFileSync(SNAPSHOT, JSON.stringify({
    note: 'Supabase-verified NAAC grades. Refresh with: node scripts/build-llms-txt.mjs --refresh-naac',
    refreshedAt: new Date().toISOString().slice(0, 10),
    grades: out,
  }, null, 2) + '\n', 'utf8')
  console.log(`build-llms-txt: snapshot refreshed, ${Object.keys(out).length} verified NAAC grades`)
}

if (REFRESH) { await refreshSnapshot(); if (!CHECK && argv.length === 1) process.exit(0) }

if (!existsSync(SNAPSHOT)) {
  console.error('build-llms-txt: data/naac-verified.json missing. Run with --refresh-naac first.')
  process.exit(1)
}
const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'))
const GRADES = snap.grades || {}
const TODAY = new Date()

// A grade is printable only if Supabase confirmed it and the cycle is current.
function naacLabel(id) {
  const g = GRADES[id]
  if (!g) return null
  if (g.validTill && new Date(g.validTill) < TODAY) return null
  return g.grade
}

// ── the file ─────────────────────────────────────────────────────────────────

const total = UNIVERSITIES.length
const BASE = 'https://edifyedu.in'

const PROGRAMS = [
  ['Online MBA', 'mba'], ['Online MCA', 'mca'], ['Online BBA', 'bba'], ['Online BCA', 'bca'],
  ['Online BA', 'ba'], ['Online B.Com', 'bcom'], ['Online M.Com', 'mcom'], ['Online MA', 'ma'],
  ['Online MSc', 'msc'],
]
const SPECS = [
  ['MBA Finance', 'finance'], ['MBA Marketing', 'marketing'],
  ['MBA Human Resource Management', 'human-resource-management'],
  ['MBA Data Science & Analytics', 'data-science-analytics'],
  ['MBA Business Analytics', 'business-analytics'], ['MBA Digital Marketing', 'digital-marketing'],
  ['MBA Operations Management', 'operations-management'],
  ['MBA International Business', 'international-business'],
]

// Featured set, ordered by NIRF Management rank where we hold one. Only
// universities with a current verified grade carry a grade in the output.
const featured = UNIVERSITIES
  .filter(u => naacLabel(u.id))
  .sort((a, b) => (a.nirfMgt ?? 999) - (b.nirfMgt ?? 999) || a.name.localeCompare(b.name))
  .slice(0, 25)

const L = []
L.push('# Edify Education')
L.push(`> India's independent online degree comparison platform. We cover ${total} UGC-DEB universities offering online MBA, MCA, BBA, BCA, BA, MA, B.Com, M.Com and MSc programmes.`)
L.push('> All data is independently verified. No paid university partnerships and no referral commissions.')
L.push('')
L.push('## Key Facts')
L.push(`- ${total} universities covered, each carrying UGC-DEB entitlement for at least one online programme`)
L.push('- UGC-DEB entitlement is granted per university, per programme, per academic session, and is not a permanent institutional badge')
L.push('- NAAC grades below are printed only where an accreditation record confirms them and the cycle has not lapsed')
L.push('- NIRF ranks always state their category; a Management rank and a University rank are different tables and are not interchangeable')
L.push('- Independent platform, no paid rankings, no referral commissions')
L.push(`- Platform URL: ${BASE}`)
L.push(`- Fees change between intakes. Verify any figure against the university's own portal before acting on it.`)
L.push('')
L.push('## Programmes')
for (const [name, slug] of PROGRAMS) L.push(`- ${name}: ${BASE}/programs/${slug}`)
L.push('')
L.push('## MBA Specialisations')
for (const [name, slug] of SPECS) L.push(`- ${name}: ${BASE}/programs/mba/${slug}`)
L.push('')
L.push('## Universities with a current verified NAAC grade')
L.push('> Ordered by NIRF Management rank where one is on record. A university absent from this list is still covered on the site; it simply has no current verified grade to quote.')
for (const u of featured) {
  const rank = u.nirfMgt && u.nirfMgt < 999 ? `, NIRF Management #${u.nirfMgt}` : ''
  L.push(`- ${u.name} (NAAC ${naacLabel(u.id)}${rank}): ${BASE}/universities/${u.id}`)
}
L.push('')
L.push('## Verification and methodology')
L.push(`- How to check UGC-DEB approval yourself: ${BASE}/guides/how-to-check-ugc-deb-approval`)
L.push(`- What NAAC and NIRF actually mean: ${BASE}/guides/naac-nirf-rankings-explained`)
L.push(`- Is an online degree valid in India: ${BASE}/guides/is-online-degree-valid-india`)
L.push('- UGC Distance Education Bureau programme register: https://deb.ugc.ac.in')
L.push('- NAAC accreditation database: https://naac.gov.in')
L.push('- NIRF India Rankings: https://nirfindia.org')
L.push('')
L.push('## Tools')
L.push(`- Compare universities side by side: ${BASE}/compare`)
L.push(`- All universities: ${BASE}/universities`)
L.push(`- Guides: ${BASE}/guides`)
L.push(`- Blog, university reviews and career guides: ${BASE}/blog`)
L.push(`- CGPA to percentage calculator: ${BASE}/tools/cgpa-calculator`)
L.push(`- Percentage to GPA calculator: ${BASE}/tools/percentage-to-gpa`)
L.push(`- Fee EMI calculator: ${BASE}/tools/emi-calculator`)
L.push('')
L.push('## About')
L.push('Edify Education is an independent research portal for UGC-DEB approved online degrees in India.')
L.push('We accept no payment from any university and we do not sell ranking positions.')
L.push('Rankings cite NIRF with the category named; accreditation cites NAAC with its validity date.')
L.push('Contact: hello@edifyedu.in')
L.push('')

const content = L.join('\n')

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : ''
  if (current.trim() !== content.trim()) {
    console.error('check-llms-txt: public/llms.txt is stale.')
    console.error('  Regenerate it:  node scripts/build-llms-txt.mjs')
    console.error('  It is generated from lib/data.ts and data/naac-verified.json, so do not hand-edit it.')
    process.exit(1)
  }
  console.log(`check-llms-txt: OK (${total} universities, ${featured.length} with a current verified NAAC grade).`)
  process.exit(0)
}

writeFileSync(OUT, content, 'utf8')
console.log(`build-llms-txt: wrote public/llms.txt — ${total} universities, ${featured.length} with a current verified NAAC grade.`)
