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
  // List tables
  const { data: unis } = await supa.from('universities').select('id, slug, name, ugc_deb_status').limit(3)
  console.log('=== universities (sample) ===')
  console.log(JSON.stringify(unis, null, 2))
  
  const { data: accreds } = await supa.from('accreditations').select('*').limit(5)
  console.log('\n=== accreditations (sample) ===')
  console.log(JSON.stringify(accreds, null, 2))
  
  // Count by body type
  const { data: bodies } = await supa.from('accreditations').select('body, category').limit(2000)
  const counts = {}
  for (const r of bodies || []) {
    const k = `${r.body}${r.category ? ' / ' + r.category : ''}`
    counts[k] = (counts[k] || 0) + 1
  }
  console.log('\n=== accreditation body counts ===')
  Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(`  ${v}\t${k}`))
})().catch(e => { console.error(e); process.exit(1) })
