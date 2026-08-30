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

// lib/data/spec-slug-rescue-rules.json holds the slug mappings that used to be
// wildcard redirects in next.config.js. Each says "this verbose MBA slug means
// that shorter one". As a sitewide wildcard it fired for all 144 universities,
// including the ones whose real spec IS the verbose slug, redirecting 11 live
// pages away and 8 of those into a 404. Applied here instead, once per
// university, a rule only produces a redirect when the university cannot serve
// the source slug itself and CAN serve the destination.
interface RescueRule { program: string; from: string; to: string }
function rescueRules(): RescueRule[] {
  return JSON.parse(readFileSync('lib/data/spec-slug-rescue-rules.json', 'utf8')) as RescueRule[]
}

export function buildSpecAllowlist(): { payload: SpecAllowlist; stats: { triples: number; aliases: number; rescued: number } } {
  const manifest = JSON.parse(
    readFileSync('lib/data/programs-manifest.json', 'utf8')
  ) as { university_slug: string; program: string; spec_slug: string }[]

  const aliasVocab = new Set<string>()
  for (const m of readFileSync('lib/data/programs.ts', 'utf8').matchAll(/'([a-z0-9-]{3,})'/g)) {
    aliasVocab.add(m[1])
  }

  const rules = rescueRules()
  let rescued = 0

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
        aliasPairs.push(intern(c), intern(r.slug))
        aliases++
      }
      // Rescue pass. A rule fires only when this university cannot serve the
      // source slug at all, so a university that genuinely offers it keeps its
      // page. The target is the resolver's canonical rather than the rule's
      // literal destination, which collapses what used to be a two hop chain
      // (wildcard to a generic slug, then the route to the real one).
      const acceptedSlugs = new Set(accepted.map(i => dict[i]))
      for (const rule of rules) {
        if (rule.program !== progSlug) continue
        if (acceptedSlugs.has(rule.from)) continue
        const dest = resolveSpec(u.id, label, progSlug, rule.to)
        if (!dest) continue
        aliasPairs.push(intern(rule.from), intern(dest.slug))
        rescued++
      }

      if (accepted.length) map[`${u.id}|${progSlug}`] = accepted.sort((a, b) => a - b)
      if (aliasPairs.length) redirects[`${u.id}|${progSlug}`] = aliasPairs
    }
  }

  return { payload: { s: dict, m: map, r: redirects }, stats: { triples, aliases, rescued } }
}
