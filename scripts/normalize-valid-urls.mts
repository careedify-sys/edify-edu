// Post-process lib/data/valid-urls.json to remove URLs that would 404 or
// 301-redirect at request time. Runs after scripts/build-valid-urls.js.
//
// Why: build-valid-urls.js reads the Excel manifest, which drifts from
// lib/data.ts (source of truth for programme lists and canonical spec
// slugs). The old SPEC_SLUG_CANONICAL blanket transform inside that
// builder was also inverted vs the current resolveSpec direction. Instead
// of maintaining two sources, we let the resolver decide and rewrite
// valid-urls.json to reflect only what actually renders.
//
// - Hard 404 URL (e.g. programme not in u.programs)         → dropped.
// - URL whose resolveSpec would 301 to a different slug     → replaced with
//   the resolved target (deduped, so we never emit both alias and canonical).
// - Everything else passes through unchanged.
//
// Run: npx tsx scripts/normalize-valid-urls.mts
// Pipeline: node scripts/build-valid-urls.js && npx tsx scripts/normalize-valid-urls.mts

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { getUniversityById } from '@/lib/data'
import { resolveSpec } from '@/lib/data/programs'
import { resolveProgramme, PROGRAMME_SLUG_TO_LABEL } from '@/lib/seo/resolve-programme'

const URLS_PATH = join(process.cwd(), 'lib', 'data', 'valid-urls.json')
const before: string[] = JSON.parse(readFileSync(URLS_PATH, 'utf8'))

const uniSpecRe = /^\/universities\/([^/]+)\/([a-z]+)\/([^/]+)$/
const uniProgRe = /^\/universities\/([^/]+)\/([a-z]+)$/
const uniHomeRe = /^\/universities\/([^/]+)$/

type Action = 'keep' | 'drop-404' | 'rewrite'
type Trace = { url: string; action: Action; to?: string; reason: string }

const trace: Trace[] = []
const out = new Set<string>()

function push(url: string) { out.add(url) }

for (const url of before) {
  // uni-spec first (most specific)
  const specM = url.match(uniSpecRe)
  if (specM) {
    const [_all, id, prog, spec] = specM
    const label = PROGRAMME_SLUG_TO_LABEL[prog]
    if (!label) { trace.push({ url, action: 'drop-404', reason: 'unknown programme slug' }); continue }
    const u = getUniversityById(id)
    if (!u) { trace.push({ url, action: 'drop-404', reason: 'unknown university id' }); continue }
    const pd = (u.programDetails as Record<string, unknown>)[label]
    if (!pd) { trace.push({ url, action: 'drop-404', reason: `programDetails.${label} missing (page redirects to /universities/${id})` }); continue }
    const r = resolveSpec(id, label, prog, spec)
    if (!r) { trace.push({ url, action: 'drop-404', reason: 'resolveSpec returned null' }); continue }
    if (r.slug === spec) { push(url); trace.push({ url, action: 'keep', reason: 'canonical' }); continue }
    const rewritten = `/universities/${id}/${prog}/${r.slug}`
    push(rewritten)
    trace.push({ url, action: 'rewrite', to: rewritten, reason: `alias → canonical` })
    continue
  }
  const progM = url.match(uniProgRe)
  if (progM) {
    const [_all, id, prog] = progM
    const r = resolveProgramme(id, prog)
    if (r.kind === 'not-found') {
      trace.push({ url, action: 'drop-404', reason: `resolveProgramme: ${r.reason}` })
      continue
    }
    push(url); trace.push({ url, action: 'keep', reason: 'programme hub ok' })
    continue
  }
  const homeM = url.match(uniHomeRe)
  if (homeM) {
    const [_all, id] = homeM
    if (!getUniversityById(id)) {
      trace.push({ url, action: 'drop-404', reason: 'unknown university id' })
      continue
    }
    push(url); trace.push({ url, action: 'keep', reason: 'uni home ok' })
    continue
  }
  // Everything else passes through unchanged.
  push(url); trace.push({ url, action: 'keep', reason: 'unmatched (static/blog/programs/etc.)' })
}

const kept = trace.filter(t => t.action === 'keep').length
const dropped = trace.filter(t => t.action === 'drop-404')
const rewritten = trace.filter(t => t.action === 'rewrite')
const after = [...out].sort()

// Preserve original order structure by re-sorting to keep hierarchy tidy.
// valid-urls.json is unordered from callers' perspective; sort for a stable
// diff and readable file.
writeFileSync(URLS_PATH, JSON.stringify(after, null, 2))

console.log(`\n=== normalize-valid-urls ===`)
console.log(`Input URLs:   ${before.length}`)
console.log(`Output URLs:  ${after.length}`)
console.log(`Kept:         ${kept}`)
console.log(`Dropped 404:  ${dropped.length}`)
console.log(`Rewritten:    ${rewritten.length}   (alias → canonical; deduped with existing entries)`)

if (dropped.length) {
  console.log(`\n--- Dropped (${dropped.length}) ---`)
  for (const t of dropped.slice(0, 30)) console.log(`  ${t.url}   [${t.reason}]`)
  if (dropped.length > 30) console.log(`  … +${dropped.length - 30} more`)
}
if (rewritten.length) {
  console.log(`\n--- Rewritten (${rewritten.length}) ---`)
  for (const t of rewritten.slice(0, 30)) console.log(`  ${t.url}\n    → ${t.to}`)
  if (rewritten.length > 30) console.log(`  … +${rewritten.length - 30} more`)
}
console.log(`\nWrote ${URLS_PATH}`)
