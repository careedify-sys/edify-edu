// scripts/audit-unlisted-spec-pages.mts
// Lists every /universities/{id}/{program}/{spec} slug the Programs manifest
// carries that is not one of that university's lib/data.ts
// programDetails[P].specs, and says what happens to it.
//
// Why: resolveSpec has a manifest-only branch. programs-manifest.json is
// rebuilt from the Programs xlsx on every deploy, the xlsx drifts from
// lib/data.ts and carries the split-spec corruption, so any slug it holds used
// to render a 200 page. Found 2026-10-29: Bharati BBA served both event-mgmt
// and event-management.
//
// Classes:
//   alias         lib/data/spec-slug-consolidation.json redirects it (308 at the edge)
//   junk          that file retires it (404 at the edge, or a next.config 301 if it ranks)
//   hub-gated     the programme hub is not in the section 2d allowlist, so it 404s already
//   needs-portal  renders a 200 page; may be a real specialisation lib/data.ts lacks.
//                 Never add it to lib/data.ts without the official portal.
//
// Run: npx tsx scripts/audit-unlisted-spec-pages.mts [date] [prod-status-file]
//   prod-status-file: lines of "<path> <status> [redirect]" from curl, optional.

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { UNIVERSITIES, specSlug as toSlug, specName as toName } from '../lib/data'
import { resolveSpec } from '../lib/data/programs'
import { resolveSpecHref } from '../lib/seo/safe-internal-links'
import { PROGRAMME_LABELS } from './spec-allowlist-source'
import CONSOLIDATION from '../lib/data/spec-slug-consolidation.json'

const C = CONSOLIDATION as { alias: Record<string, Record<string, string>>; retired: Record<string, string[]> }

// Why a needs-portal row is listed, where there is more to say than "the xlsx
// has it and lib/data.ts does not". Keyed "uni|prog" or "uni|prog|slug".
const NOTES: Record<string, string> = {
  'maharishi-markandeshwar-university-online|bcom|marketing': 'lib/data.ts lists "Marke", a truncated name; the real spec is probably Marketing',
  'maharishi-markandeshwar-university-online|mba|hr-management': 'lib/data.ts lists "Human Re", a truncated name',
  'vels-university-online|mba|hr-management': 'lib/data.ts lists "Human Re", a truncated name',
  'karnataka-state-open-university-online|bba|supply-chain': 'lib/data.ts lists "Supply", a truncated name',
  'manav-rachna-online|ba': 'lib/data.ts holds one entry "Economics, English" (comma corruption); these two are probably the real specs',
  'northcap-university-online|bba': 'lib/data.ts holds one entry "Marketing, Finance, HR" (comma corruption); these three are probably the real specs',
  'gls-university-online|bba': 'GLS and SGT carry cloned programme blocks; rebuild from the portal, never guess',
  'sgt-university-online|bba': 'GLS and SGT carry cloned programme blocks; rebuild from the portal, never guess',
  'christ-university-online|mca|computer-science-and-it': 'ranks (94 impressions, pos 15); lib/data.ts lists only General',
  'uttaranchal-university-online|ba|sociology': 'lib/data.ts lists "General – Sociology"; may be the same spec',
  'sharda-university-online|mca|augmented-reality-and-virtual-reality-with-artificial-intelligence': 'ar and vr-and-information-security (retired) look split from this name',
  'madurai-kamaraj-university-online|mcom': 'lib/data.ts M.Com list is identical to Dayalbagh M.Com; may be templated',
  'dayalbagh-educational-institute-online|mcom': 'lib/data.ts M.Com list is identical to Madurai Kamaraj M.Com; may be templated',
  'hindustan-institute-technology-online|mba': 'lib/data.ts lists only Finance; the xlsx lists five more',
  'karunya-university-online|mba': 'lib/data.ts lists only Finance; the xlsx lists five more',
  'dayananda-sagar-university-online|mca': 'xlsx lists 11 MCA specs beyond the 14 in lib/data.ts',
  'vit-university-online|mca': 'xlsx lists 8 MCA specs beyond the 11 in lib/data.ts; some read like elective subjects',
}

const date = process.argv[2] ?? new Date().toISOString().slice(0, 10)
const prod = new Map<string, string>()
if (process.argv[3] && existsSync(process.argv[3])) {
  for (const l of readFileSync(process.argv[3], 'utf8').split('\n')) {
    const [p, ...rest] = l.trim().split(/\s+/)
    if (p) prod.set(p, rest.join(' '))
  }
}

const byId = new Map(UNIVERSITIES.map(u => [u.id, u]))
const manifest = JSON.parse(readFileSync('lib/data/programs-manifest.json', 'utf8')) as
  { university_slug: string; program: string; spec_slug: string }[]

const rows: string[][] = []
const seen = new Set<string>()
for (const m of manifest) {
  const prog = m.program, slug = m.spec_slug, uniId = m.university_slug
  const label = PROGRAMME_LABELS[prog]
  const u = byId.get(uniId)
  if (!slug || !label || !u) continue
  const key = `${uniId}|${prog}|${slug}`
  if (seen.has(key)) continue
  seen.add(key)
  const pd = (u.programDetails as Record<string, { specs?: unknown[] } | undefined>)[label]
  // No programDetails entry: the hub itself 404s at the edge (section 2d), but
  // the manifest still holds rows for it, so list them as hub-gated.
  const listed = (pd?.specs ?? []).map(s => toSlug(s as never))
  const url = `/universities/${uniId}/${prog}/${slug}`
  // Listed, or the page a listed slug lands on (MBA canonical overrides and
  // rescue rules move some listed slugs, e.g. Jagannath information-technology-it).
  if (listed.includes(slug) || listed.some(l => resolveSpecHref(uniId, prog, l) === url)) continue

  const pair = `${uniId}|${prog}`
  let cls: string, target = '', note = ''
  const aliasTo = C.alias[pair]?.[slug]
  if (aliasTo) {
    cls = 'alias'
    target = resolveSpec(uniId, label, prog, slug)?.slug ?? ''
  } else if (C.retired[pair]?.includes(slug)) {
    cls = 'junk'
    note = 'program name, fragment or multi-name cell from the xlsx'
  } else {
    const r = resolveSpec(uniId, label, prog, slug)
    if (!r || r.slug !== slug) continue // already a 404 or an existing alias
    if (!resolveSpecHref(uniId, prog, slug)) { cls = 'hub-gated'; note = 'hub not in the 2d allowlist, already 404' + (pd ? '' : '; no programDetails entry in lib/data.ts') }
    else { cls = 'needs-portal'; note = NOTES[key] ?? NOTES[pair] ?? 'in the xlsx, not in lib/data.ts' }
  }
  rows.push([url, uniId, prog, slug, prod.get(url) ?? '', cls, target, note,
    (pd?.specs ?? []).map(s => toName(s as never)).join(' | ')])
}
rows.sort((a, b) => a[0].localeCompare(b[0]))

const out = `audits/unlisted-spec-pages-${date}.csv`
const esc = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
const header = ['url', 'uni', 'program', 'spec_slug', 'prod_status_before', 'class', 'redirect_to', 'note', 'listed_specs_in_data_ts']
writeFileSync(out, [header, ...rows].map(r => r.map(esc).join(',')).join('\n') + '\n', 'utf8')
const count: Record<string, number> = {}
for (const r of rows) count[r[5]] = (count[r[5]] ?? 0) + 1
console.log(`Wrote ${out}: ${rows.length} unlisted spec URLs`, count)
