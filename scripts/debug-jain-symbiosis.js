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
  const { data: u } = await supa.from('universities').select('id, slug, name').like('slug', 'jain%')
  console.log(JSON.stringify(u, null, 2))
  const { data: s } = await supa.from('universities').select('id, slug, name').like('slug', 'symbiosis%')
  console.log(JSON.stringify(s, null, 2))
})().catch(e => { console.error(e); process.exit(1) })
