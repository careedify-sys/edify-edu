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
  s: string[]
  m: Record<string, number[]>
}

export function buildSpecAllowlist(): { payload: SpecAllowlist; stats: { triples: number } } {
  const manifest = JSON.parse(
    readFileSync('lib/data/programs-manifest.json', 'utf8')
  ) as { university_slug: string; program: string; spec_slug: string }[]

  const aliasVocab = new Set<string>()
  for (const m of readFileSync('lib/data/programs.ts', 'utf8').matchAll(/'([a-z0-9-]{3,})'/g)) {
    aliasVocab.add(m[1])
  }

  const dict: string[] = []
  const dictIndex = new Map<string, number>()
  const map: Record<string, number[]> = {}
  let triples = 0

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

      const accepted: number[] = []
      for (const c of candidates) {
        if (!c) continue
        if (!resolveSpec(u.id, label, progSlug, c)) continue
        let i = dictIndex.get(c)
        if (i === undefined) { i = dict.length; dict.push(c); dictIndex.set(c, i) }
        accepted.push(i)
        triples++
      }
      if (accepted.length) map[`${u.id}|${progSlug}`] = accepted.sort((a, b) => a - b)
    }
  }

  return { payload: { s: dict, m: map }, stats: { triples } }
}
