// scripts/lib/blog-content-text.mjs
//
// What "the rendered content of a blog post changed" means, shared by
// scripts/backfill-blog-updated-at.mts and scripts/check-blog-updated-at.mts.
//
// The blog page (app/blog/[slug]/page.tsx) renders post.content through
// addHeadingIds + splitLongParagraphsHtml, both of which only reshape markup,
// plus post.faqs. lib/answers/* reaches readers only through the sections
// scripts/build-ai-citation-appendix.mts writes into post.content, so it is
// covered by comparing post.content. Nothing else in lib/blog.ts is imported.
//
// COUNTS: body text, table cells, answer sections, FAQ questions and answers.
// DOES NOT COUNT: title, seoTitle, metaDescription, h1Title (not in content),
// link-only edits (hrefs and wrapping existing words in <a> change no text),
// attribute or styling edits, and the hand-pasted YouTube block that 7c2e0c5
// put in the Amity MBA review and a488015 moved into the template.

/** Drop the hand-pasted video block: its <h2 id="video-review">, the iframe wrapper, and the caption after it. */
function stripVideoBlocks(html) {
  return html
    .replace(/<h2[^>]*id=["']video-review["'][^>]*>[\s\S]*?<\/h2>/gi, ' ')
    .replace(/<div[^>]*>\s*<iframe[\s\S]*?<\/iframe>\s*<\/div>\s*(<p[^>]*font-size:\s*12px[^>]*>[\s\S]*?<\/p>)?/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
}

/** Visible text of an HTML fragment, whitespace-collapsed. */
export function htmlText(html) {
  return stripVideoBlocks(String(html ?? ''))
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** One string per post that changes exactly when its rendered content changes. */
export function contentText(post) {
  if (!post) return null
  const faqs = (post.faqs ?? []).map(f => `Q: ${htmlText(f.q)} A: ${htmlText(f.a)}`).join(' | ')
  return `${htmlText(post.content)} || ${faqs}`
}

/** The entry the blog page renders for each slug: the first .find() match. */
export function firstBySlug(posts) {
  const m = new Map()
  const dups = new Set()
  for (const p of posts) {
    if (m.has(p.slug)) dups.add(p.slug)
    else m.set(p.slug, p)
  }
  return { bySlug: m, duplicates: [...dups] }
}
