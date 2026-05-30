// scripts/build-verify-slugs.ts
// Fetches all university slugs from Supabase and writes lib/data/verify-slugs.json.
// Run before builds: npx tsx scripts/build-verify-slugs.ts
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { join } from 'path'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

async function main() {
  const { data, error } = await supabase
    .from('universities')
    .select('slug')
    .order('slug')

  if (error) {
    console.error('Supabase error:', error.message)
    process.exit(1)
  }

  const slugs: string[] = data?.map((u: { slug: string }) => u.slug) ?? []

  // Add brand-merged slugs (see BRAND_SLUGS in app/verify/[slug]/page.tsx)
  const brandSlugs = ['amity-online']
  const allSlugs = Array.from(new Set([...brandSlugs, ...slugs]))

  const outPath = join(process.cwd(), 'lib', 'data', 'verify-slugs.json')
  writeFileSync(outPath, JSON.stringify(allSlugs, null, 2))
  console.log(`Wrote ${allSlugs.length} verify slugs to lib/data/verify-slugs.json`)
}

main()
