/**
 * scripts/enumerate-rescue-urls.ts
 *
 * Enumerates every URL in the production sitemap that renders ONLY because of
 * the resolveSpecName title-case rescue at lib/data/programs.ts:185-187.
 *
 * A URL qualifies when, for its (uni, program, slug) triple:
 *   1. it is under /universities/{uni}/{mba|bba|bca|mca}/{slug}
 *   2. it appears in the sitemap (union of valid-urls.json + generateStaticParams)
 *   3. the manifest lookup (with SPEC_ALIASES) does NOT resolve a display name
 *   4. no programDetails.specs entry for (uni, program) has toSlug(s) === slug
 *
 * Under those conditions resolveSpecName reaches line 185 and returns a
 * title-cased version of the slug. Remove the rescue and the page 404s.
 *
 * Output: audits/fabricated-spec-urls-2026-08-17.csv
 * Run:    npx tsx scripts/enumerate-rescue-urls.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { UNIVERSITIES, specSlug as toSlug, specName as toName, getUniversityById } from '../lib/data'
import { getProgramSpecParams, resolveSpecName } from '../lib/data/programs'

const ROOT = process.cwd()
const OUT = join(ROOT, 'audits', 'fabricated-spec-urls-2026-08-17.csv')

const PROG_LABEL: Record<string, string> = { mba: 'MBA', bba: 'BBA', bca: 'BCA', mca: 'MCA' }
const PROGRAMS = ['mba', 'bba', 'bca', 'mca'] as const

// Local mirror of SPEC_ALIASES to avoid re-importing private constant.
// If this drifts, the script's answer drifts. Rerun after edits to programs.ts.
const SPEC_ALIASES: Record<string, string[]> = {
  'finance': ['financial-management', 'finance-management', 'finance-and-accounting'],
  'marketing': ['marketing-management', 'sales-and-marketing'],
  'human-resource-management': ['hr-management', 'hrm', 'hr'],
  'operations-management': ['operations', 'production-and-operations-management', 'production-management'],
  'business-analytics': ['analytics', 'business-analytics-and-ai', 'data-analytics'],
  'digital-marketing': ['digital-marketing-management', 'digital-mktg'],
  'international-business': ['international-business-management', 'intl-business', 'ib'],
  'healthcare-management': ['hospital-management', 'hospital-administration', 'hospital-healthcare-management', 'hospital-and-healthcare-management'],
  'information-technology': ['it-management', 'information-technology-management', 'it'],
  'supply-chain-management': ['logistics-and-supply-chain-management', 'logistics-supply-chain-management', 'logistics-scm', 'logistics-supply-chain', 'supply-chain-logistics'],
  'entrepreneurship': ['entrepreneurship-and-leadership-management', 'entrepreneur'],
  'data-science': ['data-science-and-analytics', 'data-science-analytics', 'data-science--ai'],
  'general-management': ['general'],
  'cyber-security': ['cybersecurity', 'cyber-security-and-forensics', 'cyber-security-forensics'],
  'artificial-intelligence-and-machine-learning': ['ai-ml', 'ai-and-ml', 'artificial-intelligence-machine-learning', 'artificial-intelligence'],
  'blockchain-technology': ['blockchain', 'blockchain-technologies'],
  'cloud-computing': ['cloud-computing-and-internet-of-things', 'cloud-technology'],
  'full-stack-development': ['full-stack-web-development', 'full-stack-development-and-devops', 'full-stack'],
  'project-management': ['project-management-and-leadership'],
  'retail-management': ['retail', 'retail-ops'],
  'banking-and-insurance': ['banking-insurance', 'banking-finance', 'banking-and-financial-services', 'bfsi-banking-financial-services-and-insurance'],
}
const aliasToCanonical: Record<string, string> = {}
for (const [c, list] of Object.entries(SPEC_ALIASES)) for (const a of list) aliasToCanonical[a] = c

interface ManifestRow {
  university_slug: string
  program: string
  spec_slug: string
  spec_name: string
}

const manifest: ManifestRow[] = JSON.parse(
  readFileSync(join(ROOT, 'lib', 'data', 'programs-manifest.json'), 'utf8')
) as ManifestRow[]

const validUrls: string[] = JSON.parse(
  readFileSync(join(ROOT, 'lib', 'data', 'valid-urls.json'), 'utf8')
) as string[]

// Sitemap-eligible triples: from valid-urls.json (post redirect/canonical filtering).
const sitemapTriples = new Set<string>()
for (const path of validUrls) {
  const m = path.match(/^\/universities\/([^/]+)\/(mba|bba|bca|mca)\/([^/]+)$/)
  if (m) sitemapTriples.add(`${m[1]}|${m[2]}|${m[3]}`)
}

// generateStaticParams union: sourced from manifest + programDetails.specs
const staticTriples = new Set<string>()
for (const p of PROGRAMS) {
  for (const { id, spec } of getProgramSpecParams(p)) {
    staticTriples.add(`${id}|${p}|${spec}`)
  }
}

// Union: what the site actually renders under mba/bba/bca/mca
const union = new Set<string>([...sitemapTriples, ...staticTriples])

// Mirror of getSpecDisplayName minus the rescue.
function manifestNameOrNull(uni: string, program: string, slug: string): string | null {
  const direct = manifest.find(r => r.university_slug === uni && r.program === program && r.spec_slug === slug)
  if (direct?.spec_name) return direct.spec_name
  const canonical = aliasToCanonical[slug]
  if (canonical) {
    const via = manifest.find(r => r.university_slug === uni && r.program === program && r.spec_slug === canonical)
    if (via?.spec_name) return via.spec_name
  }
  const aliases = SPEC_ALIASES[slug]
  if (aliases) {
    for (const a of aliases) {
      const via = manifest.find(r => r.university_slug === uni && r.program === program && r.spec_slug === a)
      if (via?.spec_name) return via.spec_name
    }
  }
  return null
}

function programDetailsNameOrNull(uni: string, program: string, slug: string): string | null {
  const u = getUniversityById(uni)
  if (!u) return null
  const label = PROG_LABEL[program]
  const pd = (u.programDetails as Record<string, { specs?: unknown[] } | undefined>)[label]
  const specs = (pd?.specs ?? []) as unknown[]
  const match = specs.find(s => toSlug(s as never) === slug)
  return match ? toName(match as never) : null
}

function titleCase(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const rescueRows: Array<{ url: string; uni: string; programme: string; slug: string; name: string }> = []

for (const key of union) {
  const [uni, program, slug] = key.split('|')
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) continue // rescue itself skips these

  const u = getUniversityById(uni)
  if (!u) continue
  const label = PROG_LABEL[program]
  const pd = (u.programDetails as Record<string, unknown>)[label]
  if (!pd) continue // page redirect()s away, not a rescue candidate

  const fromManifest = manifestNameOrNull(uni, program, slug)
  if (fromManifest) continue
  const fromPd = programDetailsNameOrNull(uni, program, slug)
  if (fromPd) continue

  // Sanity: production resolver should return the title-cased value on this triple.
  const resolved = resolveSpecName(uni, label, program, slug)
  if (resolved !== titleCase(slug)) continue

  rescueRows.push({
    url: `/universities/${uni}/${program}/${slug}`,
    uni,
    programme: label,
    slug,
    name: titleCase(slug),
  })
}

rescueRows.sort((a, b) => a.url.localeCompare(b.url))

const inSitemap = rescueRows.filter(r => sitemapTriples.has(`${r.uni}|${r.programme.toLowerCase()}|${r.slug}`))
const staticOnly = rescueRows.filter(r => !sitemapTriples.has(`${r.uni}|${r.programme.toLowerCase()}|${r.slug}`))

mkdirSync(join(ROOT, 'audits'), { recursive: true })

const header = 'url,university,programme,slug,title-cased-name-emitted'
const csv = [header, ...rescueRows.map(r => [r.url, r.uni, r.programme, r.slug, r.name].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
writeFileSync(OUT, csv + '\n')

console.log(`Union size (mba+bba+bca+mca):        ${union.size}`)
console.log(`  from sitemap (valid-urls.json):    ${sitemapTriples.size}`)
console.log(`  from generateStaticParams:         ${staticTriples.size}`)
console.log('')
console.log(`Rescue-only URLs (would 404 without title-case rescue): ${rescueRows.length}`)
console.log(`  in production sitemap:             ${inSitemap.length}`)
console.log(`  static-generated only (not sitemap): ${staticOnly.length}`)
console.log('')
console.log(`Wrote ${OUT}`)
console.log('')
console.log('First 20 rescue-only URLs for spot-check against production:')
for (const r of rescueRows.slice(0, 20)) console.log(`  https://edifyedu.in${r.url}`)
