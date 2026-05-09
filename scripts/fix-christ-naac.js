// scripts/fix-christ-naac.js
// One-shot fix: Christ (Deemed-to-be University) was re-accredited by NAAC
// in Cycle 2, 2022 with grade A+ (CGPA 3.31). Supabase had stale Cycle 1
// data (B+, 2.61). Update to current accreditation.

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

;(async () => {
  const { data: u, error: ue } = await supa
    .from('universities')
    .select('id, name')
    .eq('slug', 'christ-deemed-to-be-university-online')
    .single()
  if (ue || !u) { console.error('Christ not found:', ue?.message); process.exit(1) }

  console.log('Found:', u.name, u.id)

  // Read current NAAC row
  const { data: cur } = await supa
    .from('accreditations')
    .select('*')
    .eq('university_id', u.id)
    .eq('body', 'NAAC')
    .single()
  console.log('Current NAAC:', cur)

  // Update to Cycle 2, 2022, A+, CGPA 3.31
  const update = {
    grade: 'A+',
    score: 3.31,
    cycle: 2,
    valid_till: '2029-06-23',  // NAAC A+ Cycle 2 typical 7-year validity from 2022 award
    notes: 'Cycle 2 (2022). CGPA 3.31',
    data_updated_at: new Date().toISOString(),
  }

  const { error: we } = await supa
    .from('accreditations')
    .update(update)
    .eq('university_id', u.id)
    .eq('body', 'NAAC')
  if (we) { console.error('Update failed:', we.message); process.exit(1) }

  console.log('\nUpdated. New NAAC:')
  const { data: post } = await supa
    .from('accreditations')
    .select('body, grade, score, cycle, valid_till, notes')
    .eq('university_id', u.id)
    .eq('body', 'NAAC')
    .single()
  console.log(post)
})().catch(e => { console.error(e); process.exit(1) })
