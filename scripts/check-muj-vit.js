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
  for (const slug of ['manipal-university-online', 'jaypee-institute-of-information-technology-online', 'vellore-institute-of-technology-online', 'international-institute-of-information-technology-online', 'symbiosis-international-online']) {
    const { data: u } = await supa.from('universities').select('id, name').eq('slug', slug).single()
    if (!u) { console.log(`NOT FOUND: ${slug}`); continue }
    const { data: a } = await supa.from('accreditations').select('body, grade, score, cycle, valid_till, notes').eq('university_id', u.id).eq('body', 'NAAC').single()
    console.log(`${u.name} (${slug}): grade=${a?.grade} score=${a?.score} cycle=${a?.cycle} notes="${a?.notes || ''}"`)
  }
})()
