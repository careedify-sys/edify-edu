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
  const { data: unis } = await supa.from('universities').select('id, name, slug')
  const { data: accreds } = await supa.from('accreditations').select('university_id, body, grade, score, cycle, valid_till').eq('body', 'NAAC')
  const map = Object.fromEntries(unis.map(u => [u.id, u]))
  const stale = accreds.filter(a => a.cycle === null && a.valid_till === null)
  console.log(`NAAC rows with cycle=null AND valid_till=null (likely stale): ${stale.length} of ${accreds.length}\n`)
  stale.sort((a,b) => (map[a.university_id]?.name || '').localeCompare(map[b.university_id]?.name || ''))
  for (const a of stale) {
    const u = map[a.university_id]
    console.log(`  ${a.grade}\tscore=${a.score || '—'}\t${u?.name}  (${u?.slug})`)
  }
})().catch(e => { console.error(e); process.exit(1) })
