// scripts/check-quick-facts.mjs
//
// Guards the blog sidebar Quick Facts box against the two ways it has silently
// broken, both of which shipped to production.
//
// There are two sources of Quick Facts data and only one of them is read. The
// sidebar renders BLOG_QUICK_FACTS[post.slug] from lib/blog-quick-facts.ts
// (app/blog/[slug]/page.tsx and app/online-mca/[slug]/page.tsx). The quickFacts
// field on the post object in lib/blog.ts is never read by any template, so
// filling it in is silently a no-op.
//
// Failure 1, the empty value. An entry is added with every label present and
// every value left as ''. BlogSidebarWidgets renders a row whether or not the
// value is empty, so the card appears, the page returns 200, and a smoke test
// that greps for "Quick Facts" passes while the reader sees a column of blank
// cells. This shipped twice in two consecutive commits (fd2464c, f40abee)
// because "the sidebar renders" was checked and "the sidebar has values" was
// not. That is the check this script makes non-optional.
//
// Failure 2, the missing entry. A post carries a populated quickFacts field and
// no lookup entry, so no card renders at all. Reported as a warning rather than
// an error: 20 posts are in that state deliberately, because their quickFacts
// hold fee, salary and superlative figures that no gate has verified. See the
// 2026-09-28 Quick Facts entry in audits/FIX-LOG.md before clearing them.

import { BLOG_QUICK_FACTS } from '../lib/blog-quick-facts.ts'
import { BLOG_POSTS } from '../lib/blog.ts'

let errors = 0

// --- Failure 1: any empty value in a lookup entry is a hard error -----------
const blanks = []
for (const [slug, facts] of Object.entries(BLOG_QUICK_FACTS)) {
  if (!Array.isArray(facts) || facts.length === 0) {
    blanks.push(`${slug}: entry is empty, so no card renders`)
    continue
  }
  facts.forEach((f, i) => {
    if (typeof f?.label !== 'string' || f.label.trim() === '') {
      blanks.push(`${slug}[${i}]: blank label`)
    }
    if (typeof f?.value !== 'string' || f.value.trim() === '') {
      blanks.push(`${slug}[${i}]: blank value for label ${JSON.stringify(f?.label ?? '')}`)
    }
  })
}

if (blanks.length > 0) {
  console.error('check-quick-facts: FAIL, blank Quick Facts rows would render as empty cells.')
  for (const b of blanks) console.error('  ' + b)
  console.error('')
  console.error('  Fill the value from that post\'s own quickFacts field in lib/blog.ts,')
  console.error('  matching on the label. Do not ship a label with no value.')
  errors += blanks.length
}

// --- Failure 2: populated field, no entry. Warning only. --------------------
const orphanedFields = BLOG_POSTS.filter(
  p => Array.isArray(p.quickFacts) && p.quickFacts.length > 0 && !BLOG_QUICK_FACTS[p.slug]
).map(p => p.slug)

// --- Dead entries: a lookup key matching no post. Warning only. -------------
const slugs = new Set(BLOG_POSTS.map(p => p.slug))
const deadEntries = Object.keys(BLOG_QUICK_FACTS).filter(k => !slugs.has(k))

if (errors > 0) process.exit(1)

const parts = [`${Object.keys(BLOG_QUICK_FACTS).length} entries, no blank rows`]
if (orphanedFields.length > 0) {
  parts.push(`${orphanedFields.length} post(s) carry an unread quickFacts field`)
}
if (deadEntries.length > 0) {
  parts.push(`${deadEntries.length} entry/entries match no post`)
}
console.log('check-quick-facts: OK (' + parts.join(', ') + ').')
if (orphanedFields.length > 0) {
  console.log('  Unread quickFacts field (no card renders), see audits/FIX-LOG.md 2026-09-28:')
  for (const s of orphanedFields) console.log('    ' + s)
}
if (deadEntries.length > 0) {
  for (const s of deadEntries) console.log('  dead entry: ' + s)
}
