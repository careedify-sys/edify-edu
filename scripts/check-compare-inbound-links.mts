// scripts/check-compare-inbound-links.mts
//
// Every comparison page should be reachable from the content that carries the
// traffic, not only from the /compare hub.
//
// Why. On 2026-10-06, 214 posts linked to comparison pages 15 times and reached
// 5 of 26. The other 21 had no inbound link from any post, while the blog held
// 193,455 impressions a month and those pages converted at 1.4% to 2.8% CTR
// against a 0.55% site average. lib/compare-links.ts now derives the links from
// each post's relatedUniversities. This gate stops a new pair being added and
// silently landing with none.
//
// Run: npx tsx scripts/check-compare-inbound-links.mts

import { BLOG_POSTS } from '../lib/blog'
import { PAIR_SLUGS } from '../app/compare/[pair]/pairs'
import { getComparisonsForBlog } from '../lib/compare-links'

// A pair earns an exemption only when NO published post relates either of its
// universities, so there is no honest place to put the link. Empty today: the
// two entries this started with, amrita-vs-nmims and
// manipal-jaipur-vs-sikkim-manipal-mca, were covered once tier 2 of
// lib/compare-links.ts started offering a matchup to a post that covers one
// side. The gate reports a stale exemption rather than quietly carrying it.
const NO_COVERING_POST = new Set<string>([])

type Post = { slug: string; status: string; relatedUniversities?: string[] }
const published = (BLOG_POSTS as unknown as Post[]).filter(p => p.status === 'published')

const inbound = new Map<string, number>(PAIR_SLUGS.map(s => [s, 0]))
let totalLinks = 0
let postsWithBlock = 0
let widest = 0

for (const post of published) {
  const links = getComparisonsForBlog(post as never)
  if (!links.length) continue
  postsWithBlock++
  widest = Math.max(widest, links.length)
  totalLinks += links.length
  for (const l of links) {
    const slug = l.href.replace('/compare/', '')
    if (!inbound.has(slug)) {
      console.error(`check-compare-inbound-links: FAILED\n  ${post.slug} links /compare/${slug}, which is not a pair in pairs.ts.`)
      process.exit(1)
    }
    inbound.set(slug, inbound.get(slug)! + 1)
  }
}

// A gate that can pass by finding nothing is not a gate.
if (totalLinks === 0) {
  console.error('check-compare-inbound-links: derived 0 links from ' + published.length + ' published posts. Refusing to pass.')
  process.exit(1)
}

const orphans = PAIR_SLUGS.filter(s => inbound.get(s) === 0 && !NO_COVERING_POST.has(s))
const staleExempt = [...NO_COVERING_POST].filter(s => (inbound.get(s) ?? 0) > 0)
const unknownExempt = [...NO_COVERING_POST].filter(s => !inbound.has(s))

if (orphans.length || staleExempt.length || unknownExempt.length) {
  console.error('check-compare-inbound-links: FAILED')
  if (orphans.length) {
    console.error(`\n  ${orphans.length} comparison page(s) have no inbound link from any published post:`)
    for (const s of orphans) console.error(`    /compare/${s}`)
    console.error('\n  Fix: give a post that covers both universities their ids in')
    console.error('  relatedUniversities, or add the slug to NO_COVERING_POST here with a reason.')
  }
  if (staleExempt.length) {
    console.error(`\n  ${staleExempt.length} exemption(s) are no longer needed, remove them:`)
    for (const s of staleExempt) console.error(`    ${s} now has ${inbound.get(s)} inbound link(s)`)
  }
  if (unknownExempt.length) {
    console.error(`\n  ${unknownExempt.length} exemption(s) name a pair that no longer exists:`)
    for (const s of unknownExempt) console.error(`    ${s}`)
  }
  process.exit(1)
}

const covered = PAIR_SLUGS.filter(s => inbound.get(s)! > 0).length
console.log(
  `check-compare-inbound-links: OK (${totalLinks} links from ${postsWithBlock} posts, ` +
  `${covered}/${PAIR_SLUGS.length} pages covered, at most ${widest} per post, ` +
  `${NO_COVERING_POST.size} exempt).`,
)
