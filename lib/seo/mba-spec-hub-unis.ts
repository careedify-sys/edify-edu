// lib/seo/mba-spec-hub-unis.ts
//
// Which universities an MBA specialisation hub (/programs/mba/{spec}) lists,
// decided from lib/data.ts. Server-only: lib/data.ts is too large for the client.
//
// WHY. The hub used to filter UNIS_SLIM.mbaSpecs, a hand-kept mirror. On
// 2026-11-12 /programs/mba/finance listed 71 universities, two of which
// (Madurai Kamaraj and University of Mumbai) have no MBA specialisations at
// all in lib/data.ts, and one (MATS) matched on a malformed mirror string. The
// page printed a university count and a card for each of them. The master now
// decides membership; the client only renders the cards for these ids.
//
// The matcher is the one the client used: exact name, or one name being the
// other plus a word or a plural "s", after lowercasing and stripping symbols.

import { UNIVERSITIES, specName } from '../data'
import { getCanonicalSpec } from '../specMapping'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

export function specNameMatches(name: string, variants: string[]): boolean {
  const sn = norm(name)
  return variants.some(v => {
    const vn = norm(v)
    return sn === vn || sn.startsWith(vn + ' ') || sn.startsWith(vn + 's') || vn.startsWith(sn + ' ') || vn.startsWith(sn + 's')
  })
}

export function mbaSpecVariants(subSlug: string, fallback?: string): string[] {
  return getCanonicalSpec(subSlug)?.variants || [fallback || subSlug]
}

/** University ids whose lib/data.ts MBA specialisations include this hub's specialisation. */
export function getMbaSpecHubUniIds(subSlug: string, fallback?: string): string[] {
  const variants = mbaSpecVariants(subSlug, fallback)
  return UNIVERSITIES
    .filter(u => (u.programs || []).includes('MBA'))
    .filter(u => (u.programDetails?.MBA?.specs ?? []).some(s => specNameMatches(specName(s as any), variants)))
    .map(u => u.id)
}
