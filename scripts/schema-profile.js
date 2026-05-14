// scripts/schema-profile.js
// Profile distinct values and coverage for the journalist report planning.

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

function bucket(arr, fn) {
  const out = {}
  for (const r of arr) {
    const k = fn(r) ?? '(null)'
    out[k] = (out[k] || 0) + 1
  }
  return out
}
function printBucket(title, obj) {
  console.log(`\n### ${title}\n`)
  console.log('| Value | Count |')
  console.log('|---|---:|')
  Object.entries(obj).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`| ${k} | ${v} |`))
}

;(async () => {
  // 1. universities profile
  const { data: unis, error: e1 } = await supa.from('universities').select('*')
  if (e1) throw e1
  console.log(`# Supabase Data Coverage Profile\n`)
  console.log(`## universities (${unis.length} rows)\n`)
  console.log(`### Coverage (non-null / total)\n`)
  console.log('| Column | Filled | Empty | Coverage |')
  console.log('|---|---:|---:|---:|')
  const sampleKeys = Object.keys(unis[0])
  for (const k of sampleKeys) {
    const filled = unis.filter(r => r[k] !== null && r[k] !== undefined && r[k] !== '').length
    const empty = unis.length - filled
    console.log(`| \`${k}\` | ${filled} | ${empty} | ${Math.round(filled * 100 / unis.length)}% |`)
  }
  printBucket('university_type distribution', bucket(unis, r => r.university_type))
  printBucket('state distribution (top 20)', Object.fromEntries(
    Object.entries(bucket(unis, r => r.state)).sort((a, b) => b[1] - a[1]).slice(0, 20)
  ))
  printBucket('ugc_deb_status distribution', bucket(unis, r => r.ugc_deb_status))
  printBucket('is_ioe distribution', bucket(unis, r => r.is_ioe))

  // 2. accreditations profile
  const { data: accreds, error: e2 } = await supa.from('accreditations').select('*')
  if (e2) throw e2
  console.log(`\n\n## accreditations (${accreds.length} rows)\n`)
  printBucket('body distribution', bucket(accreds, r => r.body))
  printBucket('body / category distribution', bucket(accreds, r => `${r.body}${r.category ? ' / ' + r.category : ''}`))
  printBucket('status distribution', bucket(accreds, r => r.status))
  printBucket('NAAC grade distribution (all status)', bucket(accreds.filter(r => r.body === 'NAAC'), r => r.grade))
  printBucket('NAAC grade distribution (active only)', bucket(accreds.filter(r => r.body === 'NAAC' && r.status === 'active'), r => r.grade))
  printBucket('NIRF category coverage (active only)', bucket(accreds.filter(r => r.body === 'NIRF' && r.status === 'active'), r => r.category))
  printBucket('cycle distribution (top values)', Object.fromEntries(
    Object.entries(bucket(accreds, r => r.cycle)).sort((a, b) => b[1] - a[1]).slice(0, 15)
  ))

  // 3. programmes profile
  const { data: progs, error: e3 } = await supa.from('programmes').select('*')
  if (e3) throw e3
  console.log(`\n\n## programmes (${progs.length} rows)\n`)
  printBucket('category distribution', bucket(progs, r => r.category))
  printBucket('short_name distribution (top 30)', Object.fromEntries(
    Object.entries(bucket(progs, r => r.short_name)).sort((a, b) => b[1] - a[1]).slice(0, 30)
  ))
  printBucket('aicte_listed distribution', bucket(progs, r => r.aicte_listed))
  printBucket('ugc_notice_ref distribution', bucket(progs, r => r.ugc_notice_ref))
  // How many programmes per university (top 10)
  const perUni = {}
  for (const p of progs) perUni[p.university_id] = (perUni[p.university_id] || 0) + 1
  const programmeCountDist = {}
  for (const c of Object.values(perUni)) {
    const bucket = c >= 20 ? '20+' : c >= 15 ? '15-19' : c >= 10 ? '10-14' : c >= 5 ? '5-9' : `${c}`
    programmeCountDist[bucket] = (programmeCountDist[bucket] || 0) + 1
  }
  printBucket('programmes per university (bucketed)', programmeCountDist)

  // 4. how many universities have a NAAC grade?
  const uniIdsWithNaac = new Set(accreds.filter(r => r.body === 'NAAC' && r.status === 'active' && r.grade).map(r => r.university_id))
  const uniIdsWithNirf = new Set(accreds.filter(r => r.body === 'NIRF' && r.status === 'active' && r.rank).map(r => r.university_id))
  console.log(`\n\n## Cross-table coverage\n`)
  console.log(`- Universities with active NAAC grade: ${uniIdsWithNaac.size} / ${unis.length}`)
  console.log(`- Universities with at least one active NIRF rank: ${uniIdsWithNirf.size} / ${unis.length}`)
  console.log(`- Universities with established_year set: ${unis.filter(u => u.established_year).length} / ${unis.length}`)
  console.log(`- Universities with city set: ${unis.filter(u => u.city).length} / ${unis.length}`)
  console.log(`- Universities with ugc_deb_valid_till set: ${unis.filter(u => u.ugc_deb_valid_till).length} / ${unis.length}`)
  console.log(`- Programmes with duration_years set: ${progs.filter(p => p.duration_years).length} / ${progs.length}`)
  console.log(`- Programmes with ugc_valid_till set: ${progs.filter(p => p.ugc_valid_till).length} / ${progs.length}`)
})().catch(e => { console.error(e); process.exit(1) })
