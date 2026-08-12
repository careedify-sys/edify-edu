// scripts/check-duplicate-slugs.mjs
// Pre-commit gate: fails if any slug appears more than once in BLOG_POSTS.
//
// Background: commit a78ec2e (2026-05-26) added 12 template-literal blog
// entries whose slugs collided with earlier JSON-stringified entries from
// cd76c30 (2026-05-05). Runtime .find() returned the earlier match, so the
// later duplicates never rendered on /blog/{slug} — but sitemap and the
// /blog index consumed both via .filter().sort(). Deduplicated on
// fix/dedupe-blog-slugs; this gate keeps that state.
//
// Run: node scripts/check-duplicate-slugs.mjs

import { BLOG_POSTS } from '../lib/blog.ts'

const seen = new Map()   // slug -> first index
const dups = []          // { slug, first, second }
for (let i = 0; i < BLOG_POSTS.length; i++) {
  const s = BLOG_POSTS[i].slug
  if (seen.has(s)) {
    dups.push({ slug: s, first: seen.get(s), second: i })
  } else {
    seen.set(s, i)
  }
}

if (dups.length > 0) {
  console.error(`check-duplicate-slugs: FAIL. ${dups.length} duplicate slug(s) in BLOG_POSTS.`)
  for (const d of dups) {
    console.error(`  ${d.slug}: first at BLOG_POSTS[${d.first}], duplicate at BLOG_POSTS[${d.second}]`)
  }
  console.error('')
  console.error('BLOG_POSTS.find(p => p.slug === slug) returns the FIRST match, so the')
  console.error('later duplicate never renders on /blog/{slug}. Delete the losing entry')
  console.error('from lib/blog.ts. See audits/duplicate-blog-slugs-2026-08-11.md.')
  process.exit(1)
}

console.log(`check-duplicate-slugs: OK (${BLOG_POSTS.length} posts, ${seen.size} distinct slugs).`)
process.exit(0)
