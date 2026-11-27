// lib/fee-short-map.ts
// B3 batch 18: client components that list many universities only see UNIS_SLIM, whose feeMin/feeMax are
// MBA-led and often a placeholder range. Server components build these maps through getExactFee and pass them
// down as props, so a client card prints the programme's published fee or nothing. Server-only: it imports
// the full lib/data.ts, which must stay out of client bundles. About 5 KB serialised each.
import { UNIVERSITIES, type Program } from './data'
import { getExactFee, formatExactFeeShort, exactFeeBounds } from './fees'

export type FeeShortMap = Record<string, Partial<Record<Program, string>>>
export type FeeBoundsMap = Record<string, Partial<Record<Program, { min: number; max: number }>>>

let cache: FeeShortMap | null = null
let boundsCache: FeeBoundsMap | null = null

/** { universityId: { programme: formatExactFeeShort(getExactFee(u, programme)) } }, published fees only. */
export function getFeeShortMap(): FeeShortMap {
  if (cache) return cache
  const m: FeeShortMap = {}
  for (const u of UNIVERSITIES) {
    for (const p of u.programs) {
      const s = formatExactFeeShort(getExactFee(u, p as Program))
      if (s) (m[u.id] ||= {})[p as Program] = s
    }
  }
  cache = m
  return m
}

/** The getFeeShortMap entries for the given universities only, e.g. the Navbar's TRAFFIC_ORDER. */
export function pickFeeShortMap(ids: readonly string[]): FeeShortMap {
  const all = getFeeShortMap()
  const m: FeeShortMap = {}
  for (const id of ids) if (all[id]) m[id] = all[id]
  return m
}

/** exactFeeBounds per university and programme, for client-side sort and filter. Published fees only. */
export function getFeeBoundsMap(): FeeBoundsMap {
  if (boundsCache) return boundsCache
  const m: FeeBoundsMap = {}
  for (const u of UNIVERSITIES) {
    for (const p of u.programs) {
      const b = exactFeeBounds(getExactFee(u, p as Program))
      if (b) (m[u.id] ||= {})[p as Program] = b
    }
  }
  boundsCache = m
  return m
}
