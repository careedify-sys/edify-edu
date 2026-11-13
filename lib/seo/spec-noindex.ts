// lib/seo/spec-noindex.ts
//
// Near-copy specialisation pages noindexed on 2026-11-14 (ranking plan, middle
// path). The list and the reason are in lib/data/spec-noindex-urls.json.
//
// Every spec route must ask this, not just one. The MBA, BBA, BCA and MCA
// specs are served by static routes (app/universities/[id]/mba/[spec] and its
// siblings), which take precedence over app/universities/[id]/[program]/[spec].
// Wiring only the generic route left 384 of the 686 pages saying "index" when
// this first shipped on the branch. scripts/prune-noindex-hub-urls.js reads the
// same JSON to keep these pages out of valid-urls.json and the sitemap.
import specNoindex from '@/lib/data/spec-noindex-urls.json'

const SPEC_NOINDEX: ReadonlySet<string> = new Set((specNoindex as { urls: string[] }).urls)

/** True when /universities/{uniId}/{programSlug}/{specSlug} is on the noindex list. */
export function isSpecNoindexed(uniId: string, programSlug: string, specSlug: string): boolean {
  return SPEC_NOINDEX.has(`/universities/${uniId}/${programSlug.toLowerCase()}/${specSlug}`)
}
