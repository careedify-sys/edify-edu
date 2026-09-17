// scripts/audit-naac-validity.mjs
//
// NAAC grades expire. lib/data.ts stores a grade with no validity date, so the
// site asserts every grade as current forever. Supabase holds the valid_till,
// which makes the two sources disagree silently over time.
//
// Found on 2026-09-17: Chandigarh University's A+ cycle lapsed on 2026-09-09
// and Dayalbagh's on 2026-08-09, while both were presented as current.
//
// Joins via scripts/lib/supabase-uni-map.mjs, because lib/data.ts ids and
// Supabase slugs do not agree and a naive join mis-pairs institutions.
//
// Run: npx tsx scripts/audit-naac-validity.mjs
//      npx tsx scripts/audit-naac-validity.mjs --json    (machine readable)
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { UNIVERSITIES } from '../lib/data'
import { resolveSupabaseSlug, ABSENT } from './lib/supabase-uni-map.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(ROOT, '.env.local')
if (existsSync(envPath)) {
  for (const l of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('audit-naac-validity: Supabase credentials missing from .env.local')
  process.exit(1)
}

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const TODAY = new Date()
const SOON = new Date(TODAY.getTime() + 180 * 864e5)

const { data: unis, error: e1 } = await supa.from('universities').select('id,name,slug')
if (e1) { console.error('audit-naac-validity:', e1.message); process.exit(1) }
const { data: acc, error: e2 } = await supa.from('accreditations').select('university_id,body,grade,score,valid_till')
if (e2) { console.error('audit-naac-validity:', e2.message); process.exit(1) }

const naacBy = {}
for (const a of acc) if (a.body === 'NAAC') naacBy[a.university_id] = a
const bySlug = {}
for (const u of unis) bySlug[u.slug] = u

const expired = [], soon = [], mismatch = [], absent = [], noRow = []
for (const u of UNIVERSITIES) {
  if (!u.naac) continue
  const slug = resolveSupabaseSlug(u.id, unis)
  if (!slug) { (ABSENT.has(u.id) ? absent : noRow).push({ id: u.id, naac: u.naac }); continue }
  const row = bySlug[slug] && naacBy[bySlug[slug].id]
  if (!row) { noRow.push({ id: u.id, naac: u.naac, slug }); continue }
  if (row.grade && String(row.grade).toUpperCase() !== String(u.naac).toUpperCase())
    mismatch.push({ id: u.id, site: u.naac, supabase: row.grade, slug })
  if (!row.valid_till) continue
  const vt = new Date(row.valid_till)
  if (vt < TODAY) expired.push({ id: u.id, naac: u.naac, validTill: row.valid_till })
  else if (vt < SOON) soon.push({ id: u.id, naac: row.grade, validTill: row.valid_till })
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ expired, soon, mismatch, absent, noRow }, null, 2))
  process.exit(0)
}

const section = (title, rows, fmt) => {
  console.log(`\n=== ${title} (${rows.length}) ===`)
  rows.forEach(r => console.log('  ' + fmt(r)))
}
section('NAAC VALIDITY PASSED, site still presents the grade as current', expired,
  r => `${r.id}   site says NAAC ${r.naac}, cycle expired ${r.validTill}`)
section('expires within 6 months', soon, r => `${r.id}   NAAC ${r.naac}, valid to ${r.validTill}`)
section('grade disagrees with Supabase', mismatch, r => `${r.id}   site=${r.site} supabase=${r.supabase}`)
console.log(`\nknown absent from Supabase: ${absent.length}    mapped but carrying no NAAC row: ${noRow.length}`)
if (noRow.length) noRow.forEach(r => console.log(`  ${r.id}`))
console.log(`\nChecked ${UNIVERSITIES.filter(u => u.naac).length} universities holding a NAAC grade in lib/data.ts.`)
if (expired.length) {
  console.log('\nAn expired cycle does not mean the grade is gone. It means we cannot')
  console.log('assert it as current. Date the claim or reconfirm at naac.gov.in.')
}
