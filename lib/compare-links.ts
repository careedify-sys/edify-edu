// lib/compare-links.ts : blog post to comparison page links, derived.
//
// Why this exists. On 2026-10-06 a count found 214 posts linking to comparison
// pages 15 times, reaching 5 of 26 pages. The other 21 had no inbound link from
// any post, while the blog carried 193,455 impressions a month and the
// comparison pages were the best-converting on the site at 1.4% to 2.8% CTR
// against a 0.55% site average. The hub linked them; the content did not.
//
// Nothing is hand-listed. Every post already declares relatedUniversities, so a
// post that covers both sides of a matchup is exactly a post where the
// comparison belongs. Add a pair to [pair]/pairs.ts and the links appear on
// their own; the mapping cannot drift because there is no mapping.

import { PAIRS, PAIR_SLUGS, type PairSlug } from '@/app/compare/[pair]/pairs'
import { getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'

/** At most this many per post, so a post that relates six universities does not
 *  sprout a dozen links. House style allows 5 to 10 internal links per post and
 *  these sit alongside the ones already in the body. */
const MAX_PER_POST = 3

export interface ComparisonLink {
  href: string
  label: string
  program: string
}

export interface ComparableBlogPost {
  relatedUniversities?: string[]
  title?: string
  category?: string
  tags?: string[]
  targetKeyword?: string
}

/** The programme a post is about, read from the fields it already sets.
 *  Order matters: MCA and BCA are checked before MBA and BBA because a post
 *  titled "MBA vs MCA" should offer the MCA matchups it is actually weighing. */
export function programmeOfPost(post: ComparableBlogPost): string | null {
  const hay = [post.title ?? '', post.targetKeyword ?? '', post.category ?? '', ...(post.tags ?? [])]
    .join(' ')
    .toUpperCase()
  if (/\bMCA\b/.test(hay)) return 'MCA'
  if (/\bBCA\b/.test(hay)) return 'BCA'
  if (/\bBBA\b/.test(hay)) return 'BBA'
  if (/\bMBA\b/.test(hay)) return 'MBA'
  return null
}

function label(slug: PairSlug): string | null {
  const cfg = PAIRS[slug]
  const a = getUniversityById(cfg.uniA)
  const b = getUniversityById(cfg.uniB)
  if (!a || !b) return null
  return `${getTitleName(a.id, a.name, a.abbr)} vs ${getTitleName(b.id, b.name, b.abbr)} Online ${cfg.program}`
}

/**
 * Comparison pages worth offering on a given post.
 *
 * A pair qualifies when the post relates BOTH of its universities. Mentioning a
 * name in prose is not enough: a roundup naming twenty universities would match
 * everything, which is how link blocks become noise.
 *
 * Ordering puts the post's own programme first, then falls back to the other
 * programmes for the same two universities. That fallback is deliberate. A
 * reader weighing Amity against Manipal Jaipur for an MBA is a reader who may
 * also weigh them for an MCA, and without it the MCA pairs would have almost no
 * inbound links, since only 12 of 209 published posts are about MCA.
 *
 * Pure and local, so the template can call it at render time with no build step
 * and no generated file to fall out of date.
 */
export function getComparisonsForBlog(post: ComparableBlogPost): ComparisonLink[] {
  const related = new Set(post.relatedUniversities ?? [])
  // One is enough. Tier 2 below turns a single-university review into links to
  // that university's matchups, and the size < 2 guard that used to sit here
  // returned early before tier 2 could run.
  if (related.size === 0) return []

  const programme = programmeOfPost(post)

  // localeCompare second throughout so the order is stable build to build.
  const byRelevance = (a: PairSlug, b: PairSlug) => {
    const aMatch = PAIRS[a].program === programme ? 0 : 1
    const bMatch = PAIRS[b].program === programme ? 0 : 1
    return aMatch - bMatch || a.localeCompare(b)
  }

  // Tier 1: the post covers both sides of the matchup.
  const both = PAIR_SLUGS.filter(slug => {
    const cfg = PAIRS[slug]
    return related.has(cfg.uniA) && related.has(cfg.uniB)
  }).sort(byRelevance)

  // Tier 2 fills any slot tier 1 left, from pairs where the post covers one
  // side. Without it a single-university review gets nothing, and the review of
  // X is the obvious home for "X vs Y": nmims-online-mba-review-2026 relates
  // only nmims-online, so the best page on the site for that matchup linked to
  // none of its five comparisons.
  const oneSide = PAIR_SLUGS.filter(slug => {
    const cfg = PAIRS[slug]
    const a = related.has(cfg.uniA)
    const b = related.has(cfg.uniB)
    return (a || b) && !(a && b)
  }).sort(byRelevance)

  return [...both, ...oneSide]
    .slice(0, MAX_PER_POST)
    .map((slug): ComparisonLink | null => {
      const text = label(slug)
      return text ? { href: `/compare/${slug}`, label: text, program: PAIRS[slug].program } : null
    })
    .filter((x): x is ComparisonLink => x !== null)
}
