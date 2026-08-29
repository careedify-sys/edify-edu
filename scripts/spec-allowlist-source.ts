// scripts/spec-allowlist-source.ts
// Shared builder for lib/data/spec-allowlist.json. Imported by the generator
// (build-spec-allowlist.mts) and by the pre-commit gate (check-spec-allowlist.ts)
// so both agree by construction and the gate's only job is to detect a stale
// committed file.
//
// Candidate enumeration has to be a superset of everything resolveSpec() can
// accept for a (uni, programme):
//   1. every spec slug in lib/data.ts programDetails[label].specs
//   2. every spec_slug in programs-manifest.json for that (uni, programme)
//   3. every alias token in lib/data/programs.ts, because resolveSpec fans a
//      requested slug out through SPEC_ALIASES before giving up
// Each candidate is then confirmed by calling resolveSpec itself, so the
// enumeration can only ever be too wide, never too narrow. Too wide costs a
// soft 404 that survives; too narrow would 404 a real page, so the asymmetry
// is deliberate.

import { readFileSync } from 'fs'
import { UNIVERSITIES, specSlug as toSlug } from '../lib/data'
import { resolveSpec } from '../lib/data/programs'

export const PROGRAMME_LABELS: Record<string, string> = {
  mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA',
  bcom: 'B.Com', mcom: 'M.Com', ba: 'BA', ma: 'MA', msc: 'MSc', bsc: 'BSc',
}

export interface SpecAllowlist {
  /** Dictionary of every distinct spec slug. */
  s: string[]
  /** "uniId|progSlug" -> indices into `s` that resolve for that pair. */
  m: Record<string, number[]>
  /**
   * "uniId|progSlug" -> flat [aliasIdx, canonicalIdx, ...] pairs for the slugs
   * resolveSpec accepts but canonicalises to a different slug.
   *
   * Middleware needs these because the route's own redirect() cannot produce an
   * HTTP 308 here. These pages are statically generated, and Next encodes a
   * redirect() during static generation as a meta-refresh 200. Confirmed
   * 2026-08-29: dropping the aliases from generateStaticParams did not help,
   * ISR renders the first request the same way and writes the same
   * meta-refresh HTML into the cache. Redirecting at the edge, before the route
   * renders, is the only way these become real 308s.
   */
  r: Record<string, number[]>
}

// next.config.js carries sitewide wildcard rules of the shape
//   /universities/:university/{prog}/{from} -> /universities/:university/{prog}/{to}
// and those run BEFORE middleware. If the alias table ever pointed at a slug
// that is itself one of those `from` values, the two would redirect at each
// other forever. That happened once for real: Symbiosis MBA hr-management and
// human-resource looped until the resolver was taught next.config's sitewide
// canonical. Rather than rely on the data staying in agreement, any pair whose
// target is a wildcard source is dropped here and left to next.config.
function wildcardRedirectSources(): Set<string> {
  const out = new Set<string>()
  const src = readFileSync('next.config.js', 'utf8')
  const re = /source:\s*'\/universities\/:[a-z]+\/([a-z]+)\/([a-z0-9-]+)',\s*destination:\s*'([^']+)'/g
  for (const m of src.matchAll(re)) out.add(`${m[1]}|${m[2]}`)
  return out
}

export function buildSpecAllowlist(): { payload: SpecAllowlist; stats: { triples: number; aliases: number; loopsAvoided: number } } {
  const manifest = JSON.parse(
    readFileSync('lib/data/programs-manifest.json', 'utf8')
  ) as { university_slug: string; program: string; spec_slug: string }[]

  const aliasVocab = new Set<string>()
  for (const m of readFileSync('lib/data/programs.ts', 'utf8').matchAll(/'([a-z0-9-]{3,})'/g)) {
    aliasVocab.add(m[1])
  }

  const wildcardSources = wildcardRedirectSources()
  let loopsAvoided = 0

  const dict: string[] = []
  const dictIndex = new Map<string, number>()
  const map: Record<string, number[]> = {}
  const redirects: Record<string, number[]> = {}
  let triples = 0
  let aliases = 0

  for (const progSlug of Object.keys(PROGRAMME_LABELS)) {
    const label = PROGRAMME_LABELS[progSlug]
    for (const u of UNIVERSITIES) {
      const pd = (u.programDetails as Record<string, { specs?: unknown[] } | undefined>)[label]
      const candidates = new Set<string>()
      for (const s of (pd?.specs ?? [])) candidates.add(toSlug(s as never))
      for (const r of manifest) {
        if (r.university_slug === u.id && r.program === progSlug && r.spec_slug) candidates.add(r.spec_slug)
      }
      // Alias fanout only matters when the uni actually has this programme.
      if (pd) for (const a of aliasVocab) candidates.add(a)

      const intern = (slug: string): number => {
        let i = dictIndex.get(slug)
        if (i === undefined) { i = dict.length; dict.push(slug); dictIndex.set(slug, i) }
        return i
      }

      const accepted: number[] = []
      const aliasPairs: number[] = []
      for (const c of candidates) {
        if (!c) continue
        const r = resolveSpec(u.id, label, progSlug, c)
        if (!r) continue
        accepted.push(intern(c))
        triples++
        if (r.slug === c) continue
        // Target is a next.config wildcard source: redirecting to it here would
        // hand the request straight back to a rule that sends it somewhere else.
        if (wildcardSources.has(`${progSlug}|${r.slug}`)) { loopsAvoided++; continue }
        aliasPairs.push(intern(c), intern(r.slug))
        aliases++
      }
      if (accepted.length) map[`${u.id}|${progSlug}`] = accepted.sort((a, b) => a - b)
      if (aliasPairs.length) redirects[`${u.id}|${progSlug}`] = aliasPairs
    }
  }

  return { payload: { s: dict, m: map, r: redirects }, stats: { triples, aliases, loopsAvoided } }
}
