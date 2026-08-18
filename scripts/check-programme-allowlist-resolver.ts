// scripts/check-programme-allowlist-resolver.ts
// Pre-commit invariant: the middleware allowlist and the app-side resolver
// must agree on every (uni, programme) combo in scope. If they diverge, the
// middleware becomes a second independent source of truth for what "resolves"
// vs "not-found", and a class-A phantom hub could either slip through the
// edge 404 (allowlist too permissive) or a legitimate uni could be 404'd at
// the edge before the page ever renders (allowlist too strict). This gate
// blocks either drift.
//
// Runs under tsx (matches check-blog-fees / check-duplicate-slugs / check-
// spec-rescue pattern).

import fs from 'fs'
import path from 'path'
import { UNIVERSITIES, type Program } from '../lib/data'
import { resolveProgramme, programmeSlug } from '../lib/seo/resolve-programme'

const ROOT = path.join(__dirname, '..')

const SCOPE: { program: Program; allowlistPath: string }[] = [
  { program: 'MA', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-ma.json') },
  { program: 'B.Com', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-bcom.json') },
  { program: 'M.Com', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-mcom.json') },
  { program: 'MBA', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-mba.json') },
  { program: 'BBA', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-bba.json') },
  { program: 'BCA', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-bca.json') },
  { program: 'MCA', allowlistPath: path.join(ROOT, 'lib', 'data', 'programme-allowlist-mca.json') },
]

let hardFail = false

for (const { program, allowlistPath } of SCOPE) {
  const relPath = path.relative(ROOT, allowlistPath).replace(/\\/g, '/')
  if (!fs.existsSync(allowlistPath)) {
    console.error(`FAIL: ${relPath} does not exist. Run: node scripts/build-programme-allowlist.js`)
    hardFail = true
    continue
  }

  const allowlist: string[] = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'))
  const allowlistSet = new Set(allowlist)

  const resolverAllows = new Set<string>()
  for (const u of UNIVERSITIES) {
    const r = resolveProgramme(u.id, programmeSlug(program))
    if (r.kind === 'resolved') resolverAllows.add(u.id)
  }

  const inAllowlistNotResolver: string[] = []
  const inResolverNotAllowlist: string[] = []

  for (const id of allowlistSet) if (!resolverAllows.has(id)) inAllowlistNotResolver.push(id)
  for (const id of resolverAllows) if (!allowlistSet.has(id)) inResolverNotAllowlist.push(id)

  if (inAllowlistNotResolver.length === 0 && inResolverNotAllowlist.length === 0) {
    console.log(`OK. ${program} allowlist (${allowlist.length} entries) agrees with resolver.`)
    continue
  }

  console.error(`FAIL: ${program} allowlist disagrees with resolver.`)
  console.error(`  allowlist file: ${relPath}`)
  if (inAllowlistNotResolver.length > 0) {
    console.error(`  IN allowlist, NOT in resolver (${inAllowlistNotResolver.length}). Edge would let through unis the app calls notFound() on:`)
    for (const id of inAllowlistNotResolver.sort()) console.error(`    - ${id}`)
  }
  if (inResolverNotAllowlist.length > 0) {
    console.error(`  IN resolver, NOT in allowlist (${inResolverNotAllowlist.length}). Edge would 404 unis the app would render:`)
    for (const id of inResolverNotAllowlist.sort()) console.error(`    - ${id}`)
  }
  console.error('')
  console.error('Fix: run `node scripts/build-programme-allowlist.js` and stage the diff,')
  console.error('     or fix the resolver / lib/data.ts if the disagreement is intentional.')
  hardFail = true
}

if (hardFail) process.exit(1)
