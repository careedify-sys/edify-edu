/**
 * Retire the four duplicate university records found by the UGC-DEB audit.
 *
 * Each retired slug already 308-redirects to its keep slug via OLD_SLUG_REDIRECTS
 * in middleware.ts, so no URL is being moved here. What this removes is the dead
 * record behind the redirect, which still inflated the university count, shipped
 * in the client bundle via data-slim, and sat in the allowlists and manifests.
 *
 * The OLD_SLUG_REDIRECTS entries are deliberately NOT touched. They are what
 * keeps the old URLs resolving.
 *
 * Run: node scripts/retire-duplicate-universities.mjs [--apply]
 */
import fs from 'node:fs'
import path from 'node:path'

const APPLY = process.argv.includes('--apply')
const ROOT = process.cwd()

const RETIRE = {
  'shree-guru-gobind-singh-tricentenary-university-online': 'sgt-university-online',
  'vit-vellore-online': 'vit-university-online',
  'shanmugha-arts-science-technology-research-online': 'sastra-university-online',
  'kiit-university-online': 'kalinga-institute-industrial-technology-online',
}
const SLUGS = Object.keys(RETIRE)

const changes = []
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8')
const write = (f, s) => { if (APPLY) fs.writeFileSync(path.join(ROOT, f), s) }
const log = (f, what, detail) => changes.push([f, what, detail])

// ---- 1. lib/data.ts: remove the whole object literal for each retired id ----
{
  const f = 'lib/data.ts'
  let s = read(f)
  for (const slug of SLUGS) {
    const at = s.indexOf(`    id: '${slug}',`)
    if (at < 0) { log(f, slug, 'already absent'); continue }
    const start = s.lastIndexOf('\n  {', at)
    if (start < 0) throw new Error('no opening brace for ' + slug)
    let i = s.indexOf('{', start)
    let depth = 0, end = -1, inStr = null, esc = false
    for (; i < s.length; i++) {
      const c = s[i]
      if (inStr) {
        if (esc) { esc = false; continue }
        if (c === '\\') { esc = true; continue }
        if (c === inStr) inStr = null
        continue
      }
      if (c === "'" || c === '"' || c === '`') { inStr = c; continue }
      if (c === '{') depth++
      else if (c === '}') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end < 0) throw new Error('unbalanced braces for ' + slug)
    let after = end + 1
    if (s[after] === ',') after++
    log(f, slug, 'removed ' + s.slice(start, after).split('\n').length + ' lines')
    s = s.slice(0, start) + s.slice(after)
  }
  write(f, s)
}

// ---- 2. lib/data-slim.ts: one-line entries, spacing after `id:` varies ----
{
  const f = 'lib/data-slim.ts'
  const s = read(f)
  const kept = s.split('\n').filter(l => !SLUGS.some(g => l.includes(`id:'${g}'`) || l.includes(`id: '${g}'`)))
  log(f, '(all)', (s.split('\n').length - kept.length) + ' line(s) removed')
  write(f, kept.join('\n'))
}

// ---- 3. plain arrays of slugs ----
for (const f of [
  'lib/canonical-slugs.json',
  'lib/data/programme-allowlist-mba.json',
  'lib/data/programme-allowlist-mca.json',
  'lib/data/programme-allowlist-bba.json',
  'lib/data/programme-allowlist-bca.json',
  'lib/data/programme-allowlist-bcom.json',
  'lib/data/programme-allowlist-mcom.json',
  'lib/data/programme-allowlist-ma.json',
]) {
  const arr = JSON.parse(read(f))
  const out = arr.filter(x => !SLUGS.includes(x))
  if (out.length !== arr.length) log(f, '(all)', `${arr.length} -> ${out.length}`)
  write(f, JSON.stringify(out, null, 2) + '\n')
}

// ---- 4. arrays of records keyed by a slug field ----
for (const [f, key] of [['lib/data/programs-manifest.json', 'university_slug'], ['data/fees-hub-data.json', 'id']]) {
  const arr = JSON.parse(read(f))
  const out = arr.filter(x => !SLUGS.includes(x[key]))
  if (out.length !== arr.length) log(f, '(all)', `${arr.length} -> ${out.length} rows`)
  write(f, JSON.stringify(out, null, 2) + '\n')
}

// ---- 5. objects keyed by slug. syllabus-manifest.json carries a BOM. ----
{
  const f = 'lib/data/syllabus-manifest.json'
  const obj = JSON.parse(read(f).replace(/^﻿/, ''))
  let n = 0
  for (const k of Object.keys(obj)) if (SLUGS.includes(k)) { delete obj[k]; n++ }
  log(f, '(all)', n + ' key(s) removed')
  write(f, JSON.stringify(obj, null, 2) + '\n')
}

// ---- 6. logos: the retired VIT record holds the only VIT logo. Move it. ----
{
  const f = 'lib/data/logos-manifest.json'
  const obj = JSON.parse(read(f))
  for (const [old, keep] of Object.entries(RETIRE)) {
    if (!obj[old]) continue
    if (!obj[keep]) { obj[keep] = obj[old]; log(f, old, 'logo moved to ' + keep) }
    delete obj[old]
    log(f, old, 'key removed')
  }
  write(f, JSON.stringify(obj, null, 2) + '\n')
}

// ---- 7. verify overrides. The retired records carry working Supabase
//         mappings the keep records lack, so move them across and lift the keep
//         id out of _no_verify_page. lib/data/verify-slugs.json is a Supabase
//         namespace, NOT lib/data ids, and is deliberately untouched:
//         'shree-guru-gobind-singh-tricentenary-university-online' is a real
//         verify page there, and is exactly what fixes SGT's 404.
{
  const f = 'lib/data/verify-slug-overrides.json'
  const obj = JSON.parse(read(f))
  const verifySlugs = JSON.parse(read('lib/data/verify-slugs.json'))
  obj.map = obj.map || {}
  for (const [old, keep] of Object.entries(RETIRE)) {
    if (obj.map[old]) {
      if (!obj.map[keep]) { obj.map[keep] = obj.map[old]; log(f, old, 'verify map moved to ' + keep) }
      delete obj.map[old]
    }
    if (verifySlugs.includes(old) && !obj.map[keep]) {
      obj.map[keep] = old
      log(f, old, 'is itself a live verify slug, now mapped from ' + keep)
    }
  }
  const before = obj._no_verify_page.length
  obj._no_verify_page = obj._no_verify_page.filter(s => !SLUGS.includes(s) && !obj.map[s])
  log(f, '(_no_verify_page)', `${before} -> ${obj._no_verify_page.length}`)
  write(f, JSON.stringify(obj, null, 2) + '\n')
}

console.log(APPLY ? '=== APPLIED ===' : '=== DRY RUN, pass --apply to write ===')
for (const [f, what, detail] of changes) console.log('  ', f.padEnd(44), String(what).padEnd(56), detail)
