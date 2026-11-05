// scripts/check-protected-pages.mjs
// Blocks a commit that would take a page Google's AI features cite out of
// service, and freezes the search-facing copy of eight review posts.
//
// Why this gate exists: f8d8b5c (2026-09-14) set the MUJ fake-or-legit post to
// status 'redirected' during the /verify consolidation. a0ad337 restored it on
// 2026-10-07. For those 23 days the URL redirected, and the page lost most of
// its AI-feature visibility. Nothing stopped the change: the status field
// drives four gates in lib/blog.ts, and no pre-commit check looked at it.
//
// PROTECTED list: data/protected-ai-pages.csv (one path per row, first column).
// For every listed path the commit FAILS if it would:
//   1. set a lib/blog.ts entry's status away from 'published', or remove the
//      entry. Renaming a slug is a removal of the old slug, so it fails too.
//   2. remove the university id behind a /universities/{id}/... path from
//      lib/data.ts (the slug change for that page type).
//   3. add or change a redirect whose source matches the path, in
//      lib/data/redirects.json or next.config.js (both evaluated, matched with
//      Next's own path-to-regexp), or in middleware.ts (heuristic: an added line
//      that uses the path as a map key or compares pathname to it).
//   4. make the page emit noindex: the route's index decision is evaluated
//      against the working tree (shouldIndexProgrammeHub, shouldIndexUniversity,
//      shouldIndexProgramsPath), and any staged app/**/page.tsx or layout.tsx
//      line adding "index: false" or "noindex" to a route that serves the path
//      fails.
//
// FREEZE list (until FREEZE_UNTIL, inclusive): the eight review posts below may
// not change seoTitle, title, h1Title or metaDescription. Body edits and FAQ
// appends stay allowed. A 2026-11-05 history trace found f61aed3 (2026-10-28)
// retitled five of them (Amity, SMU, IGNOU, Symbiosis, JAIN) and left the BITS
// control alone, whose title has not changed since 14 Sep. Holding the copy
// still gives a clean read of whether those retitles caused the drop.
//
// OVERRIDE: ALLOW_PROTECTED_CHANGE=<path>[,<path>...] in the environment AND an
// entry in data/protected-change-log.json, {"date":"YYYY-MM-DD","path":"...",
// "reason":"..."}, dated within the last 3 days. Both are required: the env var
// alone is too easy to leave set, and the log is the record of why.
//
// Limits (a floor, not a guarantee):
//   - noindex is evaluated on the working tree, as every other gate here does,
//     not on the index. A partial stage can pass that one rule.
//   - middleware.ts is matched by text. A new regex or prefix rule that happens
//     to cover a protected path is not detected; the gate prints a reminder
//     whenever middleware.ts is staged.
//   - paths of a type the gate does not model for noindex (/guides, /compare,
//     /tools, static pages) are still covered by rules 1 to 3.
//
// Run: npx tsx scripts/check-protected-pages.mjs

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { createRequire } from 'module'

const ROOT = process.cwd()
const CSV = path.join(ROOT, 'data', 'protected-ai-pages.csv')
const LOG = path.join(ROOT, 'data', 'protected-change-log.json')
const FREEZE_UNTIL = '2026-12-05'
const FREEZE_SLUGS = [
  'is-manipal-university-jaipur-fake-or-legit-2026',
  'chandigarh-university-online-mba-review',
  'amity-online-mba-review-2026',
  'smu-online-mba-review',
  'ignou-online-mba-review-2026',
  'symbiosis-online-mba-review-2026',
  'jain-online-mba-review-2026',
  'bits-pilani-online-mba-review-2026',
]
const FREEZE_FIELDS = ['seoTitle', 'title', 'h1Title', 'metaDescription']
const PM = { mba: 'MBA', mca: 'MCA', bba: 'BBA', bca: 'BCA', ba: 'BA', bcom: 'B.Com', mcom: 'M.Com', ma: 'MA', msc: 'MSc', bsc: 'BSc' }

// ── git helpers ─────────────────────────────────────────────────────────────
function git(args) {
  try { return execFileSync('git', args, { cwd: ROOT, maxBuffer: 1 << 30, encoding: 'utf8' }) } catch { return null }
}
const headFile = f => git(['show', `HEAD:${f}`])
const stagedFile = f => git(['show', `:${f}`])
const stagedNames = (git(['diff', '--cached', '--name-only']) || '').split('\n').filter(Boolean)
const isStaged = f => stagedNames.includes(f)

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function normPath(raw) {
  let p = String(raw).trim().replace(/^"|"$/g, '')
  p = p.replace(/^https?:\/\/(www\.)?edifyedu\.in/i, '')
  p = p.split(/[?#]/)[0]
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p || '/'
}

// ── inputs ──────────────────────────────────────────────────────────────────
if (!fs.existsSync(CSV)) {
  console.error(`FAIL: ${path.relative(ROOT, CSV)} is missing. This gate fails closed: without the list it cannot protect anything.`)
  process.exit(1)
}
const PROTECTED = [...new Set(
  fs.readFileSync(CSV, 'utf8').split(/\r?\n/)
    .map(l => l.split(',')[0])
    .filter(c => c && /^(\/|https?:)/i.test(c.trim().replace(/^"/, '')))
    .map(normPath),
)]
if (PROTECTED.length === 0) {
  console.error('FAIL: data/protected-ai-pages.csv has no path rows. The gate fails closed.')
  process.exit(1)
}

// ── lib/blog.ts entry extraction ────────────────────────────────────────────
// Same line-based cut the history audits used: an entry runs from the "  {"
// line above its slug to the next "  }," line, and is evaluated as a JS object
// literal once "as const" casts are stripped. A parse failure is reported, not
// skipped, so a malformed entry cannot pass silently.
function blogEntries(txt, slugs) {
  const out = new Map()
  if (!txt) return out
  const L = txt.split('\n')
  const want = new Set(slugs)
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/^\s*slug:\s*(['"`])([^'"`]+)\1/)
    if (!m || !want.has(m[2])) continue
    let s = i; while (s > 0 && !/^ {2}\{\s*$/.test(L[s])) s--
    let e = i; while (e < L.length && !/^ {2}\},?\s*$/.test(L[e])) e++
    const raw = L.slice(s, e + 1).join('\n').replace(/,\s*$/, '').replace(/(['"])\s+as\s+const/g, '$1')
    let obj
    try { obj = new Function(`return (${raw})`)() } catch (err) { obj = { __parseError: err.message } }
    if (!out.has(m[2])) out.set(m[2], [])
    out.get(m[2]).push(obj)
  }
  return out
}

// ── next.config.js redirect evaluation ─────────────────────────────────────
// Evaluates a given next.config.js source with a given redirects.json, so HEAD
// and the staged versions can be compared without touching the working tree.
const realRequire = createRequire(path.join(ROOT, 'next.config.js'))
async function redirectRules(configSrc, redirectsJsonSrc) {
  if (!configSrc) return []
  const mod = { exports: {} }
  const req = id => {
    if (/lib\/data\/redirects\.json$/.test(id)) {
      if (redirectsJsonSrc == null) throw new Error('missing')
      return JSON.parse(redirectsJsonSrc)
    }
    return realRequire(id)
  }
  new Function('require', 'module', 'exports', '__dirname', '__filename', configSrc)(req, mod, mod.exports, ROOT, path.join(ROOT, 'next.config.js'))
  const cfg = mod.exports.default ?? mod.exports
  const rules = typeof cfg.redirects === 'function' ? await cfg.redirects() : []
  // A redirects.json rule that next.config.js does not spread is still a rule
  // someone meant to ship, so include the file's own list as well.
  let jsonRules = []
  try { const j = JSON.parse(redirectsJsonSrc || 'null'); jsonRules = Array.isArray(j) ? j : (j?.redirects || []) } catch { /* reported by other gates */ }
  return [...rules, ...jsonRules].filter(r => r && r.source && !r.has && !r.missing)
}

let pathToRegexp
async function matcher(src) {
  if (!pathToRegexp) {
    const ptr = await import('next/dist/compiled/path-to-regexp/index.js')
    pathToRegexp = ptr.pathToRegexp ?? ptr.default?.pathToRegexp ?? ptr.default
  }
  try { const re = pathToRegexp(src); return p => re.test(p) } catch { return p => p === src }
}

// ── route patterns for the robots text rule ────────────────────────────────
function routeRegex(file) {
  const rel = file.replace(/^app\//, '').replace(/\/?(page|layout)\.tsx?$/, '')
  const segs = rel.split('/').filter(Boolean).filter(s => !/^\(.*\)$/.test(s))
  const body = segs.map(s => /^\[\.\.\..+\]$/.test(s) ? '.+' : /^\[.+\]$/.test(s) ? '[^/]+' : s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/')
  const isLayout = /layout\.tsx?$/.test(file)
  return new RegExp(`^/${body}${isLayout ? '(/.*)?' : ''}$`.replace('^//', '^/'))
}

// ── override ────────────────────────────────────────────────────────────────
const allowEnv = new Set((process.env.ALLOW_PROTECTED_CHANGE || '').split(',').map(s => s.trim()).filter(Boolean).map(normPath))
let changeLog = []
try { changeLog = JSON.parse(fs.readFileSync(LOG, 'utf8')) } catch { changeLog = [] }
// Git Bash rewrites an env value that starts with "/" into a Windows path
// ("/blog/x" arrives as "C:/.../Git/blog/x"), so accept a value that ends with
// the protected path as well as an exact match.
function overridden(p) {
  if (![...allowEnv].some(v => v === p || v.endsWith(p))) return false
  const now = new Date(`${today()}T00:00:00`)
  return changeLog.some(e => {
    if (!e || normPath(e.path || '') !== p || !String(e.reason || '').trim()) return false
    const d = new Date(`${e.date}T00:00:00`)
    if (isNaN(d)) return false
    const ageDays = (now - d) / 86400000
    return ageDays >= 0 && ageDays <= 3
  })
}

// ── main ────────────────────────────────────────────────────────────────────
const failures = [] // { path, rule, detail }
const notes = []
const seen = new Set()
const fail = (p, rule, detail) => {
  const k = `${p}\u0000${rule}\u0000${detail}`
  if (!seen.has(k)) { seen.add(k); failures.push({ path: p, rule, detail }) }
}

const blogPaths = PROTECTED.filter(p => /^\/blog\/[^/]+$/.test(p))
const blogSlugs = blogPaths.map(p => p.slice(6))

// Rule 1: blog status, removal and slug change. Index against HEAD.
if (isStaged('lib/blog.ts')) {
  const allSlugs = [...new Set([...blogSlugs, ...FREEZE_SLUGS])]
  const H = blogEntries(headFile('lib/blog.ts'), allSlugs)
  const S = blogEntries(stagedFile('lib/blog.ts'), allSlugs)
  for (const slug of blogSlugs) {
    const p = `/blog/${slug}`
    const h = H.get(slug) || [], s = S.get(slug) || []
    if (h.length && !s.length) { fail(p, 'entry removed or slug changed', 'the lib/blog.ts entry is gone from the staged file'); continue }
    for (const e of s) {
      if (e.__parseError) fail(p, 'entry unreadable', `staged entry does not parse: ${e.__parseError}`)
      else if (e.status !== 'published') fail(p, 'status changed', `status is '${e.status}', must stay 'published'`)
    }
  }
  // Freeze.
  if (today() <= FREEZE_UNTIL) {
    for (const slug of FREEZE_SLUGS) {
      const h = (H.get(slug) || [])[0], s = (S.get(slug) || [])[0]
      if (!h || !s || h.__parseError || s.__parseError) continue // rule 1 reports these when listed
      for (const f of FREEZE_FIELDS) {
        if (h[f] !== s[f]) fail(`/blog/${slug}`, `frozen field ${f} changed (freeze runs to ${FREEZE_UNTIL})`, `"${h[f] ?? '(unset)'}" -> "${s[f] ?? '(unset)'}"`)
      }
    }
  }
}

// Rule 2: university id removed (slug change for /universities/{id}/...).
const uniPaths = PROTECTED.filter(p => /^\/universities\/[^/]+/.test(p))
if (isStaged('lib/data.ts') && uniPaths.length) {
  const h = headFile('lib/data.ts') || '', s = stagedFile('lib/data.ts') || ''
  for (const p of uniPaths) {
    const id = p.split('/')[2]
    const re = new RegExp(`\\bid:\\s*['"\`]${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`)
    if (re.test(h) && !re.test(s)) fail(p, 'university id removed or renamed', `id '${id}' is gone from the staged lib/data.ts`)
  }
}

// Rule 3a: redirects in next.config.js and lib/data/redirects.json.
if (isStaged('next.config.js') || isStaged('lib/data/redirects.json')) {
  const before = await redirectRules(headFile('next.config.js'), headFile('lib/data/redirects.json'))
  const after = await redirectRules(stagedFile('next.config.js'), stagedFile('lib/data/redirects.json'))
  const key = r => JSON.stringify([r.source, r.destination, !!r.permanent, r.statusCode ?? null])
  const old = new Set(before.map(key))
  const added = after.filter(r => !old.has(key(r)))
  for (const r of added) {
    const m = await matcher(String(r.source))
    for (const p of PROTECTED) if (m(p)) fail(p, 'redirect added or changed', `source '${r.source}' -> '${r.destination}'`)
  }
}

// Rule 3b: middleware.ts, by text.
if (isStaged('middleware.ts')) {
  const diff = git(['diff', '--cached', '-U0', '--', 'middleware.ts']) || ''
  const addedLines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'))
  for (const p of PROTECTED) {
    const esc = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Used as a key ('...': ...), or compared against (=== '...', startsWith('...')).
    const asSource = new RegExp(`(['"\`])${esc}\\1\\s*[:)\\]]|(===|==|startsWith\\(|includes\\()\\s*(['"\`])${esc}\\3`)
    for (const l of addedLines) if (asSource.test(l)) fail(p, 'middleware redirect added or changed', l.slice(1).trim().slice(0, 160))
  }
  notes.push('middleware.ts is staged. This gate matches literal paths only; check by hand that no new pattern rule covers a protected page.')
}

// Rule 4a: staged robots/noindex lines in route files.
const routeFiles = stagedNames.filter(f => /^app\/.*\/(page|layout)\.tsx?$/.test(f) || /^app\/(page|layout)\.tsx?$/.test(f))
for (const f of routeFiles) {
  const diff = git(['diff', '--cached', '-U0', '--', f]) || ''
  const hits = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++') && /index:\s*false|noindex/i.test(l) && !/^\+\s*(\/\/|\*)/.test(l))
  if (!hits.length) continue
  const re = routeRegex(f)
  for (const p of PROTECTED) if (re.test(p)) for (const h of hits) fail(p, `noindex added in ${f}`, h.slice(1).trim().slice(0, 160))
}

// Rule 4b: evaluate each modelled route's index decision on the working tree.
{
  let data, si
  try {
    data = await import('../lib/data.ts')
    si = await import('../lib/seo/should-index.ts')
  } catch (err) {
    fail('(all)', 'index evaluation failed', `could not load lib/data or lib/seo/should-index: ${err.message}`)
  }
  if (data && si) {
    const byId = id => (data.UNIVERSITIES || []).find(u => u.id === id)
    for (const p of PROTECTED) {
      const seg = p.split('/')
      if (seg[1] === 'universities' && seg[2]) {
        const u = byId(seg[2])
        if (!u) { fail(p, 'university missing', `no university with id '${seg[2]}' in lib/data.ts`); continue }
        if (seg.length === 3) { if (!si.shouldIndexUniversity(u.id)) fail(p, 'noindex', 'shouldIndexUniversity() is false') }
        else if (seg.length === 4) {
          const prog = PM[seg[3].toLowerCase()]
          if (!prog) continue // not a programme hub route: rules 1 to 3 still apply
          const d = si.shouldIndexProgrammeHub(u, prog)
          if (!d.shouldIndex) fail(p, 'noindex', `shouldIndexProgrammeHub() is false (hasContentJson=${d.hasContentJson}, feeOk=${d.feeOk}, uniIndexed=${si.shouldIndexUniversity(u.id)})`)
        } else if (!si.shouldIndexUniversity(u.id)) fail(p, 'noindex', 'shouldIndexUniversity() is false')
      } else if (seg[1] === 'programs') {
        if (!si.shouldIndexProgramsPath(p)) fail(p, 'noindex', 'not in PROGRAMS_INDEX_ALLOWLIST')
      } else if (seg[1] === 'review') {
        fail(p, 'noindex', '/review/* is noindex by design; this path should not be on the protected list')
      }
    }
  }
}

// ── report ──────────────────────────────────────────────────────────────────
const blocking = failures.filter(f => !overridden(f.path))
const waived = failures.filter(f => overridden(f.path))

for (const n of notes) console.log(`note: ${n}`)
for (const w of waived) console.log(`WAIVED (ALLOW_PROTECTED_CHANGE + protected-change-log.json): ${w.path}  ${w.rule}: ${w.detail}`)

if (blocking.length === 0) {
  console.log(`OK. ${PROTECTED.length} protected paths and ${FREEZE_SLUGS.length} frozen posts checked${today() > FREEZE_UNTIL ? ' (freeze expired)' : ''}.`)
  process.exit(0)
}

console.error(`FAIL: ${blocking.length} change(s) to protected AI-cited pages.`)
for (const f of blocking) console.error(`    ${f.path}\n        ${f.rule}: ${f.detail}`)
console.error(`
These pages carry Google AI-feature visibility (data/protected-ai-pages.csv).
The MUJ fake-or-legit post lost most of its visibility after a 23-day redirect
(f8d8b5c, 14 Sep to 7 Oct 2026). If this change is intended:
  1. add {"date":"${today()}","path":"<path>","reason":"<why>"} to data/protected-change-log.json
  2. commit with ALLOW_PROTECTED_CHANGE=<path> (comma-separate several paths)`)
process.exit(1)
