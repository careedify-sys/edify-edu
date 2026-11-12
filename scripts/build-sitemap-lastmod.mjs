// scripts/build-sitemap-lastmod.mjs
//
// Writes data/sitemap-lastmod.json: { "/universities/{id}/{prog}[/{spec}]": "YYYY-MM-DD" }
// app/sitemap.ts reads it to set <lastmod> on university hub and spec URLs.
//
// WHY. app/sitemap.ts used to read statSync().mtime of the page-content JSON.
// Vercel builds from a fresh checkout, so every file carries the build time:
// on 2026-11-12 all 330 dated university URLs in the live sitemap said
// 2026-11-12 while no page-content file had changed that day. Google says an
// inaccurate lastmod can make it ignore lastmod across the whole site, which
// devalues the dates that ARE real (blog posts). Dates now come from git.
//
// RULES
//   - URL with a page-content JSON: date of the last commit touching that file.
//   - MBA hub that renders <QuickAnswers> (getHubAnswers(u) !== null, the same
//     function UniProgramBody calls): max(JSON date, 2026-11-04), the day
//     6da83d7 and 19a4957 put answer sections on those hubs.
//   - Neither: no entry. Omitting lastmod is correct. Never fall back to today.
//
// MODES
//   npx tsx scripts/build-sitemap-lastmod.mjs          rebuild from git history
//   npx tsx scripts/build-sitemap-lastmod.mjs --check  pre-commit: for every
//       staged lib/data/page-content/*.json, set the URL's entry to today (IST)
//       and re-stage the manifest. Then fail if any entry is in the future or
//       names a URL the sitemap does not emit.
//
// Needs full history. A shallow clone dates everything to the graft commit,
// so the build refuses to run on one.

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'data', 'sitemap-lastmod.json')
const PC_DIR = 'lib/data/page-content'
const QUICK_ANSWERS_DATE = '2026-11-04'
const SITE = 'https://edifyedu.in'

const git = (args) => {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`)
  return r.stdout
}

function todayIST() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

async function sitemapPaths() {
  const mod = await import('../app/sitemap.ts')
  const fn = typeof mod.default === 'function' ? mod.default : mod.default?.default
  if (typeof fn !== 'function') throw new Error('could not resolve sitemap() from app/sitemap.ts')
  const entries = await fn()
  return entries.map(e => String(e.url).replace(SITE, '')).filter(p => p.startsWith('/'))
}

// URL path -> page-content file name, mirroring getPageContent / getSpecPageContent.
function contentFileFor(urlPath) {
  const m = urlPath.match(/^\/universities\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/)
  if (!m) return null
  return `${[m[1], m[2], m[3]].filter(Boolean).join('-')}.json`
}

const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
const write = (o) => fs.writeFileSync(OUT, JSON.stringify(sortObj(o), null, 2) + '\n')

async function build() {
  if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
    console.error('build-sitemap-lastmod: shallow clone. Run `git fetch --unshallow` first; dates come from history.')
    process.exit(1)
  }

  // One git call: newest commit first, so the first time a file appears is its last change.
  const log = git(['log', '--format=@@%cs', '--name-only', '--', PC_DIR])
  const fileDate = new Map()
  let cur = null
  for (const line of log.split('\n')) {
    if (line.startsWith('@@')) { cur = line.slice(2).trim(); continue }
    const f = line.trim()
    if (!f || !cur) continue
    const base = path.basename(f)
    if (!fileDate.has(base)) fileDate.set(base, cur)
  }

  const { UNIVERSITIES } = await import('../lib/data.ts')
  const { getHubAnswers } = await import('../lib/answers/hub-answers.ts')
  const quickAnswerHubs = new Set(
    UNIVERSITIES.filter(u => getHubAnswers(u) !== null).map(u => `/universities/${u.id}/mba`),
  )

  const out = {}
  let fromJson = 0, fromQa = 0
  for (const p of await sitemapPaths()) {
    const file = contentFileFor(p)
    if (!file) continue
    const onDisk = fs.existsSync(path.join(ROOT, PC_DIR, file))
    let d = onDisk ? fileDate.get(file) ?? null : null
    if (d) fromJson++
    if (quickAnswerHubs.has(p)) {
      if (!d || d < QUICK_ANSWERS_DATE) { d = QUICK_ANSWERS_DATE; fromQa++ }
    }
    if (d) out[p] = d
  }
  write(out)
  const distinct = new Set(Object.values(out))
  console.log(`build-sitemap-lastmod: ${Object.keys(out).length} entries (${fromJson} dated by page-content JSON, ${fromQa} lifted to ${QUICK_ANSWERS_DATE} by QuickAnswers; ${quickAnswerHubs.size} QuickAnswers hubs), ${distinct.size} distinct dates -> data/sitemap-lastmod.json`)
}

async function check() {
  const manifest = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
  const before = JSON.stringify(sortObj(manifest))
  const today = todayIST()

  const staged = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--', PC_DIR])
    .split('\n').map(s => s.trim()).filter(f => f.endsWith('.json')).map(f => path.basename(f))

  const paths = await sitemapPaths()
  const inSitemap = new Set(paths)

  if (staged.length) {
    const stagedSet = new Set(staged)
    let bumped = 0
    for (const p of paths) {
      const file = contentFileFor(p)
      if (file && stagedSet.has(file) && manifest[p] !== today) { manifest[p] = today; bumped++ }
    }
    if (bumped) console.log(`check-sitemap-lastmod: ${bumped} URL(s) dated ${today} for staged page-content JSON`)
  }

  const errors = []
  for (const [p, d] of Object.entries(manifest)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errors.push(`${p}: malformed date "${d}"`)
    else if (d > today) errors.push(`${p}: ${d} is after today (${today} IST)`)
    if (!inSitemap.has(p)) errors.push(`${p}: not in the sitemap`)
  }
  if (errors.length) {
    console.error(`check-sitemap-lastmod: ${errors.length} problem(s) in data/sitemap-lastmod.json`)
    for (const e of errors.slice(0, 40)) console.error('  ' + e)
    console.error('Rebuild from git history: npx tsx scripts/build-sitemap-lastmod.mjs')
    process.exit(1)
  }

  if (JSON.stringify(sortObj(manifest)) !== before) {
    write(manifest)
    spawnSync('git', ['add', 'data/sitemap-lastmod.json'], { cwd: ROOT })
    console.log('check-sitemap-lastmod: manifest updated and staged')
  } else {
    console.log(`check-sitemap-lastmod: ok (${Object.keys(manifest).length} entries)`)
  }
}

if (process.argv.includes('--check')) await check()
else await build()
