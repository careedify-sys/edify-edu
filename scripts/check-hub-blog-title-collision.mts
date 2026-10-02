// scripts/check-hub-blog-title-collision.mts
//
// Blocks a programme HUB page carrying the same <title> as a published blog
// post. Two URLs with the same title compete for one SERP slot, split the
// signal for the query, and read as duplicate content. The repo already gates
// this for specialisation pages (check-duplicate-spec-titles.mts); hubs had no
// such gate and that is how the defect below shipped.
//
// What shipped: on 2026-07-04 (a43d7e7) /programs/mba and /programs/bba were
// given "Best Online {MBA,BBA} Colleges in India 2026: Fees Compared". Each is
// a near duplicate of the blog post that already owns that phrase, and each
// also contradicted its own hub H1, which promises a complete filterable list
// rather than a curated best-of.
//
// Scope: the hand-written overrides in lib/program-hub-seo.ts and
// lib/mba-spec-seo-overrides.ts. The generic templates in the route are
// formulaic and derive from the programme name, so a human cannot paste a
// blog-shaped title into them. Overrides are where that happens.
//
// Run: npx tsx scripts/check-hub-blog-title-collision.mts
// Wired into: .husky/pre-commit

import { BLOG_POSTS } from '../lib/blog'
import { getProgramHubSeo, PROGRAM_HUB_SEO_SLUGS } from '../lib/program-hub-seo'
import { MBA_SPEC_SEO_OVERRIDES } from '../lib/mba-spec-seo-overrides'
import { getUniversitiesByProgram } from '../lib/data'

const YEAR = new Date().getFullYear()

// Normalise to a word list: lowercase, drop the brand suffix, drop a 4-digit
// year, drop punctuation, drop a few stopwords. The year goes because two
// titles differing only by "2026" are the same title to a reader. The
// stopwords go because the live BBA pair differs only by an "in"
// ("...Colleges in India..." vs "...Colleges India...").
const STOPWORDS = new Set(['in', 'the', 'a', 'an', 'of', 'for', 'and', 'to'])

function words(t: string): string[] {
  return t
    .replace(/\s*\|\s*(edifyedu(\.in)?)\s*$/i, '')
    .toLowerCase()
    .replace(/\b(19|20)\d{2}\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w && !STOPWORDS.has(w))
}

// Length of the shared LEADING phrase, in words.
//
// Deliberately not a bag-of-words similarity. The first version of this gate
// used Jaccard over word sets: it flagged 13 specialisation hubs whose titles
// merely share the template vocabulary ("online mba in X management
// universities fees") and it MISSED both real collisions, because those differ
// in their tails ("Fees Compared" vs "Top 15 NIRF Ranked") and Jaccard scored
// them 0.50. What collides in a SERP is the leading phrase a reader sees
// first, and word order is exactly what a set comparison throws away.
function sharedPrefix(a: string[], b: string[]): number {
  let n = 0
  while (n < a.length && n < b.length && a[n] === b[n]) n++
  return n
}

// A collision needs a long shared opening AND that opening to dominate the
// shorter title. Five words keeps same-specialisation pairs out: the
// entrepreneurship hub and its blog post share three leading words and are
// legitimately distinct pages.
const MIN_PREFIX_WORDS = 5
const MIN_PREFIX_SHARE = 0.6

interface HubTitle { label: string; title: string }
const hubTitles: HubTitle[] = []

for (const slug of PROGRAM_HUB_SEO_SLUGS) {
  const program = slug.toUpperCase() === 'MBA' ? 'MBA' : slug.toUpperCase() === 'BBA' ? 'BBA' : slug.toUpperCase()
  const count = getUniversitiesByProgram(program as any).length
  const seo = getProgramHubSeo(slug, count, YEAR)
  if (seo) hubTitles.push({ label: `/programs/${slug}`, title: seo.title })
}
for (const [specSlug, o] of Object.entries(MBA_SPEC_SEO_OVERRIDES)) {
  hubTitles.push({ label: `/programs/mba/${specSlug}`, title: o.title })
}

const posts = BLOG_POSTS.filter(p => p.status === 'published')

interface Collision { hub: string; hubTitle: string; blog: string; blogTitle: string; shared: string; n: number; share: number }
const collisions: Collision[] = []

for (const h of hubTitles) {
  const hw = words(h.title)
  for (const p of posts) {
    for (const [field, value] of [['seoTitle', p.seoTitle], ['title', p.title]] as const) {
      if (!value) continue
      const pw = words(value)
      const n = sharedPrefix(hw, pw)
      const share = n / Math.min(hw.length, pw.length)
      if (n >= MIN_PREFIX_WORDS && share >= MIN_PREFIX_SHARE) {
        collisions.push({
          hub: h.label, hubTitle: h.title,
          blog: `/blog/${p.slug} (${field})`, blogTitle: value,
          shared: hw.slice(0, n).join(' '), n, share,
        })
        break
      }
    }
  }
}

console.log(`check-hub-blog-title-collision: ${hubTitles.length} hub titles vs ${posts.length} published posts.`)

if (!collisions.length) {
  console.log('check-hub-blog-title-collision: OK, no hub title duplicates a blog title.')
  process.exit(0)
}

console.error('\ncheck-hub-blog-title-collision: FAIL.')
for (const c of collisions) {
  console.error(`\n  ${c.hub}`)
  console.error(`    hub  : "${c.hubTitle}"`)
  console.error(`    blog : "${c.blogTitle}"  ${c.blog}`)
  console.error(`    shared opening: "${c.shared}" (${c.n} words, ${(100 * c.share).toFixed(0)}% of the shorter title)`)
}
console.error(`\n${collisions.length} collision(s). Give the hub a title that matches its own H1 and the head`)
console.error('term it answers. "Best X colleges" phrasing belongs to the editorial blog post.')
process.exit(1)
