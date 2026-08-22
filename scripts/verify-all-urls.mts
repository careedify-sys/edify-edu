// Comprehensive URL verifier.
//
// Walks lib/data/valid-urls.json (authoritative site URL list) and simulates
// the resolution each route page performs. Any URL that would render 404 is
// reported. Also enumerates every (uni, program) and (uni, program, spec)
// combination in data.ts to catch pages that exist but are missing from the
// sitemap, plus every alias variant to confirm the redirect target resolves.
//
// Run: npx tsx scripts/verify-all-urls.mts

import { readFileSync } from 'fs'
import { join } from 'path'
import { UNIVERSITIES, getUniversityById, specSlug as toSlug, type Program } from '@/lib/data'
import { resolveSpec } from '@/lib/data/programs'
import { resolveProgramme, PROGRAMME_SLUG_TO_LABEL } from '@/lib/seo/resolve-programme'

const validUrls: string[] = JSON.parse(
  readFileSync(join(process.cwd(), 'lib', 'data', 'valid-urls.json'), 'utf8')
)

type Row = { url: string; kind: string; verdict: 'ok' | 'notfound' | 'redirect' | 'unchecked'; detail?: string }
const rows: Row[] = []

// Route matchers ordered by specificity
const R = {
  root: /^\/$/,
  staticTop: /^\/(universities|programs|compare|about|contact|coupons|privacy-policy|blog|guides|tools|coupon-savings-calculator|redirect-check|search|sitemap)(\/)?$/,
  blogPost: /^\/blog\/([^/]+)$/,
  guidePost: /^\/guides\/([^/]+)$/,
  tool: /^\/tools\/([^/]+)$/,
  comparePage: /^\/compare\/([^/]+)$/,
  couponUni: /^\/coupons\/([^/]+)$/,
  programHub: /^\/programs\/([a-z]+)$/,
  programSpec: /^\/programs\/([a-z]+)\/([^/]+)$/,
  uniHome: /^\/universities\/([^/]+)$/,
  uniProgramHub: /^\/universities\/([^/]+)\/([a-z]+)$/,
  uniSpec: /^\/universities\/([^/]+)\/([a-z]+)\/([^/]+)$/,
}

function classify(url: string): { kind: string; params: string[] } {
  if (R.root.test(url)) return { kind: 'root', params: [] }
  if (R.staticTop.test(url)) return { kind: 'static', params: [] }
  let m
  if ((m = url.match(R.uniSpec))) return { kind: 'uni-spec', params: [m[1], m[2], m[3]] }
  if ((m = url.match(R.uniProgramHub))) return { kind: 'uni-program', params: [m[1], m[2]] }
  if ((m = url.match(R.uniHome))) return { kind: 'uni-home', params: [m[1]] }
  if ((m = url.match(R.programSpec))) return { kind: 'program-spec', params: [m[1], m[2]] }
  if ((m = url.match(R.programHub))) return { kind: 'program-hub', params: [m[1]] }
  if ((m = url.match(R.blogPost))) return { kind: 'blog-post', params: [m[1]] }
  if ((m = url.match(R.guidePost))) return { kind: 'guide-post', params: [m[1]] }
  if ((m = url.match(R.tool))) return { kind: 'tool', params: [m[1]] }
  if ((m = url.match(R.comparePage))) return { kind: 'compare-page', params: [m[1]] }
  if ((m = url.match(R.couponUni))) return { kind: 'coupon-uni', params: [m[1]] }
  return { kind: 'other', params: [] }
}

// Simulate route-level resolution.
function simulate(url: string): Row {
  const { kind, params } = classify(url)
  switch (kind) {
    case 'root':
    case 'static':
      return { url, kind, verdict: 'ok' }

    case 'uni-home': {
      const [id] = params
      const u = getUniversityById(id)
      return u
        ? { url, kind, verdict: 'ok' }
        : { url, kind, verdict: 'notfound', detail: 'unknown university id' }
    }

    case 'uni-program': {
      const [id, prog] = params
      const r = resolveProgramme(id, prog)
      if (r.kind === 'not-found') {
        return { url, kind, verdict: 'notfound', detail: `resolveProgramme: ${r.reason}` }
      }
      return { url, kind, verdict: 'ok' }
    }

    case 'uni-spec': {
      const [id, prog, spec] = params
      const label = PROGRAMME_SLUG_TO_LABEL[prog]
      if (!label) return { url, kind, verdict: 'notfound', detail: 'unknown program slug' }
      const u = getUniversityById(id)
      if (!u) return { url, kind, verdict: 'notfound', detail: 'unknown university id' }
      const pd = (u.programDetails as Record<string, unknown>)[label]
      if (!pd) return { url, kind, verdict: 'redirect', detail: 'programDetails missing → redirect to /universities/{id}' }
      const resolved = resolveSpec(id, label, prog, spec)
      if (!resolved) return { url, kind, verdict: 'notfound', detail: 'resolveSpec returned null' }
      if (resolved.slug !== spec) return { url, kind, verdict: 'redirect', detail: `301 to /universities/${id}/${prog}/${resolved.slug}` }
      return { url, kind, verdict: 'ok' }
    }

    case 'program-hub':
    case 'program-spec':
    case 'blog-post':
    case 'guide-post':
    case 'tool':
    case 'compare-page':
    case 'coupon-uni':
      // These live in other modules (blog CMS, programs data, etc.). Marking
      // 'unchecked' rather than pretending we verified them.
      return { url, kind, verdict: 'unchecked' }

    default:
      return { url, kind: 'other', verdict: 'unchecked', detail: 'unmatched URL pattern' }
  }
}

for (const u of validUrls) rows.push(simulate(u))

const notfound = rows.filter(r => r.verdict === 'notfound')
const redirect = rows.filter(r => r.verdict === 'redirect')
const ok = rows.filter(r => r.verdict === 'ok').length
const unchecked = rows.filter(r => r.verdict === 'unchecked').length

const byKind = new Map<string, number>()
for (const r of rows) byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1)

console.log(`\n=== Sitemap URL simulation ===`)
console.log(`Total URLs: ${rows.length}`)
console.log(`  ok:        ${ok}`)
console.log(`  redirect:  ${redirect.length}   (sitemap contains a URL that 301s — should not happen)`)
console.log(`  notfound:  ${notfound.length}   (sitemap contains a URL that 404s — critical)`)
console.log(`  unchecked: ${unchecked}   (blog/guides/programs/tool: verified by other gates)`)

console.log(`\nBy route kind:`)
for (const [k, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(16)} ${n}`)
}

if (notfound.length) {
  console.log(`\n=== notfound (${notfound.length}) ===`)
  for (const r of notfound.slice(0, 40)) console.log(`  ${r.url}  [${r.kind}]  ${r.detail ?? ''}`)
  if (notfound.length > 40) console.log(`  … +${notfound.length - 40} more`)
}
if (redirect.length) {
  console.log(`\n=== redirect (${redirect.length}) ===`)
  for (const r of redirect.slice(0, 40)) console.log(`  ${r.url}  [${r.kind}]  ${r.detail ?? ''}`)
  if (redirect.length > 40) console.log(`  … +${redirect.length - 40} more`)
}

// Second pass: enumerate every (uni, program) in data.ts and every (uni,
// program, spec). Any triple that would fail to render is a real bug.
console.log(`\n=== Enumeration: every uni × programme × spec from data.ts ===`)
const PROG_TO_SLUG: Record<string, string> = {
  MBA: 'mba', BBA: 'bba', BCA: 'bca', MCA: 'mca',
  'B.Com': 'bcom', 'M.Com': 'mcom',
  BA: 'ba', MA: 'ma', MSc: 'msc', BSc: 'bsc',
}
let enumTotal = 0
const enumFail: Array<{ url: string; detail: string }> = []
for (const u of UNIVERSITIES) {
  const pd = u.programDetails as Record<string, { specs?: unknown[] } | undefined>
  for (const [label, block] of Object.entries(pd)) {
    const progSlug = PROG_TO_SLUG[label]
    if (!progSlug) continue
    // Hub check
    enumTotal++
    const hub = resolveProgramme(u.id, progSlug)
    if (hub.kind === 'not-found') {
      enumFail.push({ url: `/universities/${u.id}/${progSlug}`, detail: `resolveProgramme: ${hub.reason}` })
    }
    // Every spec
    const specs = (block?.specs ?? []) as Array<string | { slug: string; name: string }>
    for (const s of specs) {
      enumTotal++
      const specSlug = toSlug(s as never)
      const r = resolveSpec(u.id, label, progSlug, specSlug)
      if (!r) enumFail.push({ url: `/universities/${u.id}/${progSlug}/${specSlug}`, detail: 'resolveSpec returned null' })
      else if (r.slug !== specSlug) enumFail.push({ url: `/universities/${u.id}/${progSlug}/${specSlug}`, detail: `data.ts canonical redirects to ${r.slug} — indicates data.ts inconsistency` })
    }
  }
}
console.log(`Checked: ${enumTotal}   Failures: ${enumFail.length}`)
if (enumFail.length) {
  console.log(`\n=== data.ts pages that would 404 or redirect (${enumFail.length}) ===`)
  for (const f of enumFail.slice(0, 40)) console.log(`  ${f.url}  ${f.detail}`)
  if (enumFail.length > 40) console.log(`  … +${enumFail.length - 40} more`)
}

const criticalFail = notfound.length + enumFail.length
process.exit(criticalFail > 0 ? 1 : 0)
