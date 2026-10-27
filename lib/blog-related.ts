// lib/blog-related.ts
// Picks the "Related Guides" cards at the foot of every blog post.
//
// Until 2026-10-27 that block was getPublishedPosts().slice(0, 3): the three
// newest posts, identical on every page. So every post linked the same three
// URLs, and an older post's only inbound link was its card on a paginated /blog
// listing. The Semrush audit of 27 Oct 2026 counted 227 pages with a single
// internal link; most of the blog ones trace back to this.
//
// Now: score every other post on overlap (shared universities, then category,
// then tags), and assign the whole set in one deterministic pass. Ties go to
// the candidate with the fewest inbound related-links so far, which spreads the
// links instead of piling them on whichever post sorts first. A repair pass
// then gives every post at least one inbound card from its most relevant
// neighbour, so nothing is left reachable only through pagination.
import { getPublishedPosts, type BlogPost } from './blog'

const PER_POST = 3

function score(a: BlogPost, b: BlogPost): number {
  const unis = new Set(a.relatedUniversities ?? [])
  const sharedUnis = (b.relatedUniversities ?? []).filter(u => unis.has(u)).length
  const tags = new Set((a.tags ?? []).map(t => t.toLowerCase()))
  const sharedTags = (b.tags ?? []).filter(t => tags.has(t.toLowerCase())).length
  return sharedUnis * 4 + (a.category === b.category ? 2 : 0) + Math.min(sharedTags, 4)
}

let cache: Map<string, BlogPost[]> | null = null

function build(): Map<string, BlogPost[]> {
  const posts = getPublishedPosts()
  const bySlug = new Map(posts.map(p => [p.slug, p]))
  const inbound = new Map<string, number>(posts.map(p => [p.slug, 0]))
  const picks = new Map<string, string[]>()
  const ranked = new Map<string, { slug: string; s: number }[]>()

  // Oldest first, so the posts most in need of links are placed before the
  // newest ones have soaked up the low-inbound tie-breaks.
  for (const post of [...posts].reverse()) {
    const cands = posts
      .filter(p => p.slug !== post.slug)
      .map(p => ({ slug: p.slug, s: score(post, p) }))
      .sort((x, y) => y.s - x.s || x.slug.localeCompare(y.slug))
    ranked.set(post.slug, cands)
    const chosen = [...cands]
      .sort((x, y) => y.s - x.s || inbound.get(x.slug)! - inbound.get(y.slug)! || x.slug.localeCompare(y.slug))
      .slice(0, PER_POST)
      .map(c => c.slug)
    for (const c of chosen) inbound.set(c, inbound.get(c)! + 1)
    picks.set(post.slug, chosen)
  }

  // Repair: a post nobody picked takes the weakest slot (lowest score, and its
  // occupant still linked from elsewhere) on the most relevant post that has one.
  for (const orphan of posts) {
    if (inbound.get(orphan.slug)! > 0) continue
    const hosts = posts
      .filter(p => p.slug !== orphan.slug)
      .map(p => ({ slug: p.slug, s: score(p, orphan) }))
      .sort((x, y) => y.s - x.s || x.slug.localeCompare(y.slug))
    for (const host of hosts) {
      const list = picks.get(host.slug)!
      const scores = ranked.get(host.slug)!
      const sOf = (slug: string) => scores.find(c => c.slug === slug)?.s ?? 0
      const victim = list
        .filter(slug => inbound.get(slug)! > 1)
        .sort((x, y) => sOf(x) - sOf(y))[0]
      if (!victim) continue
      list[list.indexOf(victim)] = orphan.slug
      inbound.set(victim, inbound.get(victim)! - 1)
      inbound.set(orphan.slug, 1)
      break
    }
  }

  const out = new Map<string, BlogPost[]>()
  picks.forEach((list, slug) => out.set(slug, list.map(s => bySlug.get(s)!)))
  return out
}

/** Related posts for the blog footer. Deterministic for a given post set. */
export function getRelatedPosts(slug: string): BlogPost[] {
  if (!cache) cache = build()
  return cache.get(slug) ?? getPublishedPosts().filter(p => p.slug !== slug).slice(0, PER_POST)
}
