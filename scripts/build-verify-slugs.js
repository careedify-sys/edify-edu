// scripts/build-verify-slugs.js
// Refreshes lib/data/verify-slugs.json from the Supabase universities table.
//
// WHY THIS IS PLAIN COMMONJS:
// This runs inside the Vercel prebuild chain, where every other step is plain
// .js on purpose. scripts/build-programme-allowlist.js documents a tsx-hook
// loader race under Vercel's Node-24 prebuild that broke an earlier branch, so
// prebuild stays tsx-free. The previous scripts/build-verify-slugs.ts needed
// tsx, which is why it was never wired in, and it then drifted seven weeks out
// of date (last run 2026-07-07). That staleness meant the site never linked to
// shri-ramasamy-memorial-university-online, a verify page that existed in
// Supabase the whole time.
//
// WHY IT FAILS SOFT:
// A deploy must never break because Supabase blipped or an env var is missing
// on the build host. Every failure path here logs a warning and exits 0,
// leaving the committed verify-slugs.json untouched. A stale file degrades
// gracefully; a failed build does not.
//
// Run manually: node scripts/build-verify-slugs.js

const fs = require('fs')
const path = require('path')

const OUT = path.join(process.cwd(), 'lib', 'data', 'verify-slugs.json')

// Brand-merged slugs that have no row in the universities table. The verify
// route resolves these through its own brand path, so they must survive every
// regeneration. Keep in sync with BRAND_SLUGS in app/verify/[slug]/page.tsx.
const BRAND_SLUGS = ['amity-online']

// Refuse to shrink the file by more than this. Guards against a partial or
// rate-limited Supabase response silently gutting the sitemap.
const MAX_SHRINK_RATIO = 0.9

function readExisting() {
  try {
    const parsed = JSON.parse(fs.readFileSync(OUT, 'utf8'))
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function bail(reason) {
  const existing = readExisting()
  console.warn(`[verify-slugs] ${reason}`)
  console.warn(
    existing
      ? `[verify-slugs] keeping the existing ${existing.length} slugs. Build continues.`
      : '[verify-slugs] no existing file to fall back on. Sitemap will omit verify URLs.',
  )
  process.exit(0)
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    bail('NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing.')
  }

  let createClient
  try {
    ;({ createClient } = require('@supabase/supabase-js'))
  } catch (e) {
    bail(`could not load @supabase/supabase-js: ${e.message}`)
  }

  let data, error
  try {
    ;({ data, error } = await createClient(url, key)
      .from('universities')
      .select('slug')
      .order('slug'))
  } catch (e) {
    bail(`Supabase request threw: ${e.message}`)
  }

  if (error) bail(`Supabase error: ${error.message}`)
  if (!Array.isArray(data) || data.length === 0) {
    bail('Supabase returned no rows.')
  }

  const slugs = data.map(u => u && u.slug).filter(s => typeof s === 'string' && s.length > 0)
  if (slugs.length === 0) bail('Supabase rows contained no usable slugs.')

  const next = Array.from(new Set([...BRAND_SLUGS, ...slugs]))

  const existing = readExisting()
  if (existing && next.length < existing.length * MAX_SHRINK_RATIO) {
    bail(
      `refusing to shrink ${existing.length} slugs to ${next.length}. ` +
        'That looks like a partial response, not a real deletion. ' +
        'If the drop is genuine, delete lib/data/verify-slugs.json and rerun.',
    )
  }

  const prev = existing ? existing.length : 0
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(next, null, 2) + '\n')

  if (existing) {
    const added = next.filter(s => !existing.includes(s))
    const removed = existing.filter(s => !next.includes(s))
    console.log(`[verify-slugs] ${prev} -> ${next.length} slugs.`)
    if (added.length) console.log(`[verify-slugs]   added: ${added.join(', ')}`)
    if (removed.length) console.log(`[verify-slugs]   removed: ${removed.join(', ')}`)
    if (!added.length && !removed.length) console.log('[verify-slugs]   no change.')
  } else {
    console.log(`[verify-slugs] wrote ${next.length} slugs.`)
  }
}

main().catch(e => bail(`unexpected failure: ${e && e.message}`))
