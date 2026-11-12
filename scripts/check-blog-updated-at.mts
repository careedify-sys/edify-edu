// scripts/check-blog-updated-at.mts
//
// Pre-commit gate. Blocks a commit that changes a blog post's rendered content
// without changing its updatedAt.
//
// WHY. updatedAt drives the sitemap <lastmod> and Article dateModified. It was
// not being bumped: on 2026-11-12 the BITS Pilani review still said 2026-05-04
// although its answer sections landed on 4 Nov (333bbf6), and the Amity review
// said 2026-10-28 after a 4 Nov edit. 164 posts were backfilled from git
// history by scripts/backfill-blog-updated-at.mts.
//
// "Rendered content" is defined once, in scripts/lib/blog-content-text.mjs:
// body text, tables, answer sections and FAQs count; title, seoTitle, meta,
// H1, link-only edits and the video block do not. The entry checked per slug is
// the first .find() match, which is the one the blog page renders.
//
// This hook never edits lib/blog.ts. Set updatedAt to today's date yourself.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { contentText, firstBySlug } from './lib/blog-content-text.mjs'

const ROOT = process.cwd()
const FILE = 'lib/blog.ts'

function git(args: string[]): { ok: boolean; out: string } {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
  return { ok: r.status === 0, out: r.stdout }
}

async function loadPosts(rev: string, tag: string): Promise<any[] | null> {
  const r = git(['show', `${rev}${FILE}`])
  if (!r.ok) return null
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `blog-${tag}-`))
  const tmp = path.join(dir, 'blog.ts')
  fs.writeFileSync(tmp, r.out)
  try {
    const mod: any = await import(pathToFileURL(tmp).href)
    return (mod.BLOG_POSTS ?? mod.default?.BLOG_POSTS) as any[]
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

async function main() {
  const staged = git(['diff', '--cached', '--name-only', '--', FILE]).out.trim()
  if (!staged) { console.log('check-blog-updated-at: lib/blog.ts not staged, skipped'); return }

  const head = await loadPosts('HEAD:', 'head')
  const next = await loadPosts(':', 'staged')
  if (!next) throw new Error('could not read the staged lib/blog.ts')
  if (!head) { console.log('check-blog-updated-at: no lib/blog.ts at HEAD, skipped'); return }

  const a = firstBySlug(head).bySlug
  const b = firstBySlug(next).bySlug
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  const stale: string[] = []
  let changed = 0
  for (const [slug, post] of b) {
    const prev = a.get(slug)
    if (!prev) continue // a new post is dated by publishedAt
    if (contentText(prev) === contentText(post)) continue
    changed++
    // A post already dated today (IST) is current: a second edit the same day
    // cannot change the date, and blocking it would force a wrong one.
    if ((prev.updatedAt ?? '') === (post.updatedAt ?? '') && post.updatedAt !== today) stale.push(`${slug} (updatedAt still ${post.updatedAt ?? `unset, publishedAt ${post.publishedAt}`})`)
  }

  if (stale.length) {
    console.error(`check-blog-updated-at: ${stale.length} post(s) changed content without changing updatedAt:`)
    for (const s of stale) console.error('  ' + s)
    console.error(`Set updatedAt: "${today}" on each. Title, meta, H1, link-only and video edits do not need it.`)
    process.exit(1)
  }
  console.log(`check-blog-updated-at: ok (${changed} post(s) with content changes, all dated)`)
}

main().catch(e => { console.error(e); process.exit(1) })
