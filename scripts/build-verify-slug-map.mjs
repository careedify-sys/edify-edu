#!/usr/bin/env node
// scripts/build-verify-slug-map.mjs
//
// Maps a lib/data.ts university id to its /verify/{slug} page.
//
// Why this is needed. The 125 verification pages are keyed by Supabase slug,
// and lib/data.ts ids do not agree with Supabase slugs: `upes-online` is
// `university-of-petroleum-and-energy-studies-online` there, and
// `manipal-university-jaipur-online` is `manipal-university-online`. Joining
// them naively drops rows or, worse, pairs the wrong institutions, which is
// what scripts/lib/supabase-uni-map.mjs exists to prevent.
//
// Why a committed artifact rather than a runtime join. The mapping is needed
// inside a React server component, which cannot reach Supabase during a static
// render and should not try. Resolving once at authoring time and committing
// the result keeps the render pure and makes the mapping reviewable in a diff.
//
// Run: node scripts/build-verify-slug-map.mjs
//      node scripts/build-verify-slug-map.mjs --check   (pre-commit)

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { UNIVERSITIES } from '../lib/data.ts'
import { resolveSupabaseSlug } from './lib/supabase-uni-map.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'lib', 'data', 'verify-slug-map.json')
const SLUGS = join(ROOT, 'lib', 'data', 'verify-slugs.json')
const CHECK = process.argv.includes('--check')

const envPath = join(ROOT, '.env.local')
if (existsSync(envPath)) {
  for (const l of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const verifySlugs = new Set(JSON.parse(readFileSync(SLUGS, 'utf8')))

// --check runs in pre-commit, where Supabase credentials may be absent. Without
// them we can only confirm the committed file is internally consistent: every
// id real, every slug an actual verify page. That is the drift worth catching.
const haveCreds = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

if (CHECK && !haveCreds) {
  if (!existsSync(OUT)) { console.error('check-verify-slug-map: lib/data/verify-slug-map.json is missing.'); process.exit(1) }
  const map = JSON.parse(readFileSync(OUT, 'utf8'))
  const ids = new Set(UNIVERSITIES.map(u => u.id))
  const bad = []
  for (const [id, slug] of Object.entries(map)) {
    if (!ids.has(id)) bad.push(`${id}: no such university in lib/data.ts`)
    if (!verifySlugs.has(slug)) bad.push(`${id} -> ${slug}: no such verify page`)
  }
  if (bad.length) {
    console.error('check-verify-slug-map: ' + bad.length + ' problem(s):')
    for (const b of bad) console.error('  ' + b)
    console.error('  Regenerate: node scripts/build-verify-slug-map.mjs')
    process.exit(1)
  }
  console.log(`check-verify-slug-map: OK (${Object.keys(map).length} universities mapped, no Supabase creds so the join was not re-run).`)
  process.exit(0)
}

if (!haveCreds) {
  console.error('build-verify-slug-map: Supabase credentials missing from .env.local')
  process.exit(1)
}

const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const { data: unis, error } = await supa.from('universities').select('id,name,slug')
if (error) { console.error('build-verify-slug-map:', error.message); process.exit(1) }

const map = {}
let unmapped = 0
for (const u of UNIVERSITIES) {
  const slug = resolveSupabaseSlug(u.id, unis)
  // A university with no Supabase record, or one whose record has no verify
  // page, simply gets no link. Never guess: a wrong link here would send a
  // reader to another institution's verification page.
  if (slug && verifySlugs.has(slug)) map[u.id] = slug
  else unmapped++
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)))
const body = JSON.stringify(sorted, null, 2) + '\n'

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : ''
  if (current.trim() !== body.trim()) {
    console.error('check-verify-slug-map: lib/data/verify-slug-map.json is stale.')
    console.error('  Regenerate: node scripts/build-verify-slug-map.mjs')
    process.exit(1)
  }
  console.log(`check-verify-slug-map: OK (${Object.keys(sorted).length} mapped, ${unmapped} without a verify page).`)
  process.exit(0)
}

writeFileSync(OUT, body, 'utf8')
console.log(`build-verify-slug-map: wrote ${Object.keys(sorted).length} mappings; ${unmapped} universities have no verify page.`)
