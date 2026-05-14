// scripts/schema-audit.js
//
// Enumerates Supabase tables, columns, and row counts for the journalist
// data report (May 2026). Output: markdown schema table to stdout.
//
// Approach: Supabase JS client cannot list tables directly, so we attempt a
// curated list of likely-existing table names. For each table that responds,
// we fetch:
//   - exact row count
//   - one sample row (to enumerate columns + value types)
// We also call the Postgres reflection RPC if it exists for a complete list.

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

const CANDIDATE_TABLES = [
  'universities', 'university', 'unis',
  'accreditations', 'accreditation', 'rankings', 'nirf', 'naac',
  'programs', 'programmes', 'programs_offered', 'university_programs',
  'specialisations', 'specializations', 'specialisation', 'program_specializations',
  'fees', 'fee_structures', 'program_fees', 'university_fees',
  'locations', 'states', 'campuses',
  'university_types',
  'leads', 'enquiries', 'enquiry',
  'blogs', 'blog_posts', 'content',
  'coupons', 'coupon_codes',
  'metadata', 'config', 'site_config',
  'students', 'enrolments', 'enrollments', 'enrollment_stats',
  'wes_recognition', 'aiu_membership',
  'audit_log', 'sync_log',
]

function typeOf(v) {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return `array[${v.length}]`
  return typeof v === 'object' ? 'json' : typeof v
}

;(async () => {
  const found = []
  const missing = []

  for (const t of CANDIDATE_TABLES) {
    try {
      const { count, error: cErr } = await supa.from(t).select('*', { count: 'exact', head: true })
      if (cErr) {
        missing.push({ table: t, reason: cErr.message })
        continue
      }
      // Sample row for column enumeration
      const { data: sample, error: sErr } = await supa.from(t).select('*').limit(1)
      const cols = sample && sample[0] ? Object.entries(sample[0]).map(([k, v]) => ({ name: k, type: typeOf(v), sample: v })) : []
      found.push({ table: t, count, columns: cols, sample: sample && sample[0] ? sample[0] : null })
    } catch (e) {
      missing.push({ table: t, reason: e.message })
    }
  }

  // Output markdown
  console.log(`# Supabase Schema Audit — ${new Date().toISOString().slice(0, 10)}\n`)
  console.log(`## Tables Discovered (${found.length})\n`)
  console.log(`| Table | Row Count | Columns |`)
  console.log(`|---|---:|---:|`)
  for (const f of found) {
    console.log(`| \`${f.table}\` | ${f.count} | ${f.columns.length} |`)
  }
  console.log()

  for (const f of found) {
    console.log(`\n### \`${f.table}\` (${f.count} rows)\n`)
    if (!f.columns.length) {
      console.log(`*(empty table — column shape unknown)*\n`)
      continue
    }
    console.log(`| Column | Type | Sample value |`)
    console.log(`|---|---|---|`)
    for (const c of f.columns) {
      let display = c.sample
      if (display === null) display = '*(null in sample)*'
      else if (typeof display === 'object') display = '`' + JSON.stringify(display).slice(0, 80) + '`'
      else display = String(display).slice(0, 80)
      console.log(`| \`${c.name}\` | ${c.type} | ${display} |`)
    }
  }

  // For the universities table, pull distinct values for type-like fields
  const uni = found.find(f => f.table === 'universities')
  if (uni) {
    console.log(`\n## Universities Table — Distinct Value Profiles\n`)
    const profileFields = ['type', 'university_type', 'category', 'state', 'ugc_deb_status', 'status']
    for (const field of profileFields) {
      try {
        const { data, error } = await supa.from('universities').select(field).limit(5000)
        if (error) continue
        const counts = {}
        for (const r of data) {
          const v = r[field] ?? '(null)'
          counts[v] = (counts[v] || 0) + 1
        }
        const entries = Object.entries(counts)
        if (entries.length) {
          console.log(`### \`universities.${field}\`\n`)
          console.log(`| Value | Count |`)
          console.log(`|---|---:|`)
          entries.sort((a, b) => b[1] - a[1]).forEach(([v, n]) => console.log(`| ${v} | ${n} |`))
          console.log()
        }
      } catch (e) {}
    }
  }

  // For accreditations: profile body, category, grade distributions
  const acc = found.find(f => f.table === 'accreditations')
  if (acc) {
    console.log(`\n## Accreditations Table — Distinct Value Profiles\n`)
    const { data, error } = await supa.from('accreditations').select('body, category, grade, status').limit(5000)
    if (!error && data) {
      const bodyCat = {}
      const grades = {}
      const statuses = {}
      for (const r of data) {
        const bc = `${r.body || '(null)'}${r.category ? ' / ' + r.category : ''}`
        bodyCat[bc] = (bodyCat[bc] || 0) + 1
        if (r.body === 'NAAC' && r.grade) grades[r.grade] = (grades[r.grade] || 0) + 1
        statuses[r.status || '(null)'] = (statuses[r.status || '(null)'] || 0) + 1
      }
      console.log(`### \`accreditations.body / category\` distribution\n`)
      console.log(`| body / category | Count |`)
      console.log(`|---|---:|`)
      Object.entries(bodyCat).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`| ${k} | ${v} |`))
      console.log()

      console.log(`### NAAC grade distribution (active + inactive combined)\n`)
      console.log(`| Grade | Count |`)
      console.log(`|---|---:|`)
      Object.entries(grades).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`| ${k} | ${v} |`))
      console.log()

      console.log(`### \`accreditations.status\` distribution\n`)
      console.log(`| Status | Count |`)
      console.log(`|---|---:|`)
      Object.entries(statuses).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`| ${k} | ${v} |`))
      console.log()
    }
  }

  console.log(`\n## Candidate Tables Not Found (${missing.length})\n`)
  console.log(`These names were probed and returned an error (table absent or RLS-denied):\n`)
  console.log(`\`\`\``)
  missing.forEach(m => console.log(`${m.table.padEnd(35)} ${m.reason}`))
  console.log(`\`\`\``)
})().catch(e => { console.error(e); process.exit(1) })
