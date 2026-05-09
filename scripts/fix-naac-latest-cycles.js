// scripts/fix-naac-latest-cycles.js
// Updates NAAC accreditations in Supabase to reflect the LATEST cycle for
// each listed university. Initial Supabase seed (2026-04-30) contained
// stale Cycle 1 data for many universities; this corrects them.
//
// Add a row to UPDATES below whenever a stale NAAC row is found. Each entry
// must include cycle, valid_till and notes so freshness is auditable.
//
// Run: node scripts/fix-naac-latest-cycles.js

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
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const UPDATES = [
  // Each entry is the LATEST NAAC cycle for that uni per founder verification
  // (cross-checked against naac.gov.in / university IIQA portal).
  {
    slug: 'visvesvaraya-technological-university-online',
    grade: 'B++',
    score: null,  // founder did not state CGPA
    cycle: 2,
    valid_till: null,
    notes: 'Latest cycle B++ per founder verification 2026-05-10. Confirm CGPA on naac.gov.in.',
  },
  {
    slug: 'sharda-university-online',
    grade: 'A+',
    score: null,
    cycle: 2,
    valid_till: null,
    notes: 'Latest cycle A+ per founder verification 2026-05-10. Confirm CGPA on naac.gov.in.',
  },
  {
    slug: 'jain-deemed-to-be-university-online',
    grade: 'A++',
    score: 3.71,
    cycle: 2,
    valid_till: null,
    notes: 'Latest cycle A++ CGPA 3.71 per founder verification 2026-05-10.',
  },
]

;(async () => {
  for (const u of UPDATES) {
    const { data: uni, error: ue } = await supa
      .from('universities')
      .select('id, name')
      .eq('slug', u.slug)
      .single()
    if (ue || !uni) { console.error(`SKIP ${u.slug}: not found`); continue }

    const { data: cur } = await supa
      .from('accreditations')
      .select('grade, score, cycle')
      .eq('university_id', uni.id)
      .eq('body', 'NAAC')
      .single()
    console.log(`\n${uni.name} (${u.slug})`)
    console.log(`  before: grade=${cur?.grade} score=${cur?.score} cycle=${cur?.cycle || '—'}`)

    const update = {
      grade: u.grade,
      cycle: u.cycle,
      notes: u.notes,
      data_updated_at: new Date().toISOString(),
    }
    if (u.score !== null) update.score = u.score
    if (u.valid_till !== null) update.valid_till = u.valid_till

    const { error: we } = await supa
      .from('accreditations')
      .update(update)
      .eq('university_id', uni.id)
      .eq('body', 'NAAC')
    if (we) { console.error(`  FAIL: ${we.message}`); continue }

    const { data: post } = await supa
      .from('accreditations')
      .select('grade, score, cycle, notes')
      .eq('university_id', uni.id)
      .eq('body', 'NAAC')
      .single()
    console.log(`  after:  grade=${post.grade} score=${post.score || '—'} cycle=${post.cycle}`)
    console.log(`  notes:  ${post.notes}`)
  }
})().catch(e => { console.error(e); process.exit(1) })
