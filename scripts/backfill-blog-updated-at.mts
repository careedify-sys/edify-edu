// scripts/backfill-blog-updated-at.mts
//
// One-off backfill (2026-11-12). Sets BLOG_POSTS[].updatedAt to the last date a
// post's rendered content changed, when that is later than updatedAt ||
// publishedAt. updatedAt feeds both the sitemap <lastmod> and Article
// dateModified, and it had not been bumped when content changed: the BITS
// Pilani review got its answer sections on 4 Nov (333bbf6) but still said
// 2026-05-04.
//
// Walks every non-merge commit since 2026-08-01 that touched lib/blog.ts,
// loads BLOG_POSTS from the commit and its first parent, and compares
// contentText() (scripts/lib/blog-content-text.mjs) for the entry the page
// renders (first .find() match). A post's creation is not a change.
//
//   npx tsx scripts/backfill-blog-updated-at.mts           dry run, prints the plan
//   npx tsx scripts/backfill-blog-updated-at.mts --write   patches lib/blog.ts
//   ... --plan <dry-run-output.json>                       applies a saved dry-run plan

import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { transformSync } from 'esbuild'
import { contentText, firstBySlug } from './lib/blog-content-text.mjs'

const ROOT = process.cwd()
const SINCE = '2026-08-01'
const FILE = 'lib/blog.ts'

function git(args: string[]): string {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout
}

export function loadPostsFromSource(src: string): any[] {
  const js = transformSync(src, { loader: 'ts', format: 'cjs', target: 'es2020' }).code
  const mod = { exports: {} as any }
  vm.runInNewContext(js, { module: mod, exports: mod.exports, require: () => ({}) }, { timeout: 60000 })
  return mod.exports.BLOG_POSTS ?? []
}

const sha = (s: string) => crypto.createHash('sha1').update(s).digest('hex')

// blob id -> slug -> content hash (hashes only, so 200 versions fit in memory)
const blobCache = new Map<string, Map<string, string>>()
function hashesForBlob(blob: string): Map<string, string> {
  const hit = blobCache.get(blob)
  if (hit) return hit
  const src = git(['cat-file', '-p', blob])
  const { bySlug } = firstBySlug(loadPostsFromSource(src))
  const out = new Map<string, string>()
  for (const [slug, p] of bySlug) out.set(slug, sha(contentText(p) ?? ''))
  blobCache.set(blob, out)
  return out
}

function blobAt(rev: string): string | null {
  const r = spawnSync('git', ['rev-parse', '--verify', '--quiet', `${rev}:${FILE}`], { cwd: ROOT, encoding: 'utf8' })
  return r.status === 0 ? r.stdout.trim() : null
}

function main() {
  const planIdx = process.argv.indexOf('--plan')
  if (planIdx > 0) return applyPlan(JSON.parse(fs.readFileSync(process.argv[planIdx + 1], 'utf8')).plan)
  const commits = git(['log', '--no-merges', `--since=${SINCE}`, '--format=%H %cs %s', '--', FILE])
    .trim().split('\n').filter(Boolean).map(l => {
      const [h, d, ...s] = l.split(' ')
      return { h, d, s: s.join(' ') }
    })
  console.error(`backfill-blog-updated-at: ${commits.length} commits touching ${FILE} since ${SINCE}`)

  const last = new Map<string, { date: string; commit: string }>()
  const perCommit: { h: string; d: string; s: string; n: number }[] = []
  let i = 0
  for (const c of commits) {
    i++
    const after = blobAt(c.h)
    const before = blobAt(`${c.h}^`)
    if (!after || !before || after === before) continue
    let a: Map<string, string>, b: Map<string, string>
    try {
      a = hashesForBlob(after)
      b = hashesForBlob(before)
    } catch (e) {
      console.error(`  ${c.h.slice(0, 7)} could not be evaluated, skipped: ${(e as Error).message.slice(0, 120)}`)
      continue
    }
    let n = 0
    for (const [slug, h] of a) {
      const prev = b.get(slug)
      if (prev === undefined || prev === h) continue
      n++
      const cur = last.get(slug)
      if (!cur || c.d > cur.date) last.set(slug, { date: c.d, commit: c.h.slice(0, 7) })
    }
    if (n) perCommit.push({ ...c, n })
    if (i % 20 === 0) console.error(`  ${i}/${commits.length}`)
    // Keep memory flat: only parents of later commits are reused, and git log is newest first.
    if (blobCache.size > 6) blobCache.delete(blobCache.keys().next().value!)
  }

  const src = fs.readFileSync(path.join(ROOT, FILE), 'utf8')
  const { bySlug, duplicates } = firstBySlug(loadPostsFromSource(src))

  const plan: { slug: string; from: string; to: string; commit: string }[] = []
  for (const [slug, { date, commit }] of last) {
    const p = bySlug.get(slug)
    if (!p) continue
    const curVal = (p.updatedAt || p.publishedAt || '').slice(0, 10)
    if (date > curVal) plan.push({ slug, from: p.updatedAt ? `updatedAt ${p.updatedAt}` : `publishedAt ${p.publishedAt}`, to: date, commit })
  }
  plan.sort((x, y) => x.slug.localeCompare(y.slug))

  console.log(JSON.stringify({ duplicates, commitsWithContentChanges: perCommit.map(c => `${c.h.slice(0, 7)} ${c.d} posts=${c.n} ${c.s.slice(0, 80)}`), plan }, null, 2))

  if (!process.argv.includes('--write')) return
  applyPlan(plan)
}

function applyPlan(plan: { slug: string; from: string; to: string; commit: string }[]) {
  const src = fs.readFileSync(path.join(ROOT, FILE), 'utf8')
  // Plan every edit against the original lines, then apply bottom-up, so no
  // edit shifts the position of another (see feedback: bulk edits in one pass).
  const nl = src.includes('\r\n') ? '\r\n' : '\n'
  const lines = src.split(/\r?\n/)
  // Two entry styles exist: `    slug: "x",` and the JSON-style `  "slug": "x",`.
  // slug is the first key in every entry and updatedAt, where present, follows
  // it, so the entry's own keys sit between its slug line and the next one.
  const SLUG_RE = /^(\s*)("?)slug"?\s*:\s*["']([^"']+)["'],?\s*$/
  const slugLines: { idx: number; slug: string; indent: string; q: string }[] = []
  lines.forEach((l, idx) => {
    const m = l.match(SLUG_RE)
    if (m) slugLines.push({ idx, slug: m[3], indent: m[1], q: m[2] })
  })
  const firstSlug = new Map<string, number>()
  slugLines.forEach((s, k) => { if (!firstSlug.has(s.slug)) firstSlug.set(s.slug, k) })
  const edits: { at: number; kind: 'replace' | 'insert'; text: string; slug: string }[] = []
  for (const p of plan) {
    const k = firstSlug.get(p.slug)
    if (k === undefined) throw new Error(`no slug line for ${p.slug}`)
    const { idx: start, indent, q } = slugLines[k]
    const end = k + 1 < slugLines.length ? slugLines[k + 1].idx : lines.length
    const text = `${indent}${q}updatedAt${q}: "${p.to}",`
    const upd = lines.slice(start, end).findIndex(l => /^\s*"?updatedAt"?\s*:/.test(l))
    if (upd >= 0) edits.push({ at: start + upd, kind: 'replace', text, slug: p.slug })
    else edits.push({ at: start + 1, kind: 'insert', text, slug: p.slug })
  }
  edits.sort((x, y) => y.at - x.at)
  for (const e of edits) {
    if (e.kind === 'replace') lines[e.at] = e.text
    else lines.splice(e.at, 0, e.text)
  }
  fs.writeFileSync(path.join(ROOT, FILE), lines.join(nl))

  // Verify by re-reading: every planned slug must now carry its date.
  const { bySlug: after } = firstBySlug(loadPostsFromSource(fs.readFileSync(path.join(ROOT, FILE), 'utf8')))
  const bad = plan.filter(p => after.get(p.slug)?.updatedAt !== p.to)
  if (bad.length) throw new Error(`write verification failed for ${bad.map(b => b.slug).join(', ')}`)
  console.error(`backfill-blog-updated-at: wrote ${edits.length} updatedAt values, verified`)
}

main()
