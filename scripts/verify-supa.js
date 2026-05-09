const fs = require('fs')
const path = require('path')
const envPath = path.join('.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const { createClient } = require('@supabase/supabase-js')
const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

;(async () => {
  for (const slug of ['christ-deemed-to-be-university-online', 'visvesvaraya-technological-university-online', 'jain-deemed-to-be-university-online', 'sharda-university-online', 'narsee-monjee-institute-of-management-studies-nmims-online', 'manipal-academy-of-higher-education-online']) {
    const { data: u } = await supa.from('universities').select('id, name').eq('slug', slug).single()
    if (!u) { console.log(`NOT FOUND: ${slug}`); continue }
    const { data: a } = await supa.from('accreditations').select('body, category, grade, score, rank, status').eq('university_id', u.id)
    console.log(`\n=== ${u.name} (${slug}) ===`)
    a.forEach(x => console.log(`  ${x.body}${x.category ? '/' + x.category : ''} status=${x.status} grade=${x.grade || '—'} score=${x.score || '—'} rank=${x.rank || '—'}`))
  }
})().catch(e => { console.error(e); process.exit(1) })
