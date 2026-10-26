// Blocks a NIRF rank rendered without its category in page templates.
//
// NIRF publishes separate tables, and one university sits in very different
// places in each: Amity is #22 University and #49 Management, NMIMS #52 and #24.
// A bare "NIRF #22" on an MBA page is wrong for the reader and for every AI
// answer that quotes it. It shipped three times before this gate existed, and on
// 2026-10-26 a sweep found 20+ templates printing it, including a title builder
// that picked whichever of the two ranks was smaller.
//
// Rule: any template literal that interpolates a rank after "NIRF #" must name
// the category right after it (University, Management, Mgmt, Univ, Engineering)
// or come from formatNirfBadge / nirfForProgramme in lib/data-slim.ts.
//
// Scope: app/, components/, lib/ source, excluding the unused CMS admin, tests
// and lib/blog.ts (post content is prose and needs its own check).
//
// Run: npx tsx scripts/check-nirf-category.mts
// Self-test: npx tsx scripts/check-nirf-category.mts --self-test
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

const ROOTS = ['app', 'components', 'lib']
const SKIP = [/^app[\\/]admin/, /\.test\.tsx?$/, /^lib[\\/]blog\.ts$/, /^lib[\\/]blog-quick-facts\.ts$/]
const CATEGORY = /^\s*(University|Management|Mgmt|Univ|Uni\b|Engineering|in (the )?\w+( category)?|\$\{[^}]*(categor|Category|short)[^}]*\})/

// "NIRF #${expr}" followed by whatever comes after the closing brace.
const PATTERN = /NIRF #\$\{([^}]+)\}([^`'"]{0,40})/g

export function findBare(src: string): string[] {
  const hits: string[] = []
  for (const m of src.matchAll(PATTERN)) {
    if (!CATEGORY.test(m[2])) hits.push(`NIRF #\${${m[1]}}${m[2].slice(0, 20)}`)
  }
  return hits
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'node_modules') walk(p, out) }
    else if (/\.(ts|tsx|mts)$/.test(name)) out.push(p)
  }
  return out
}

if (process.argv.includes('--self-test')) {
  const bad = 'const x = `, NIRF #${u.nirf}` ; const y = `NIRF #${n} overall`'
  const good = 'const a = `NIRF #${u.nirf} University`; const b = `NIRF #${u.nirfMgt} Management`; const c = `NIRF #${r} ${category}`'
  const b = findBare(bad), g = findBare(good)
  if (b.length !== 2 || g.length !== 0) {
    console.error(`check-nirf-category self-test FAILED: bad=${b.length} (want 2), good=${g.length} (want 0)`, b, g)
    process.exit(1)
  }
  console.log('check-nirf-category self-test: OK (2 of 2 bare ranks caught, 0 false positives)')
  process.exit(0)
}

const failures: string[] = []
for (const root of ROOTS) {
  for (const f of walk(root)) {
    const rel = f.replace(/\\/g, '/')
    if (SKIP.some(r => r.test(rel))) continue
    const src = readFileSync(f, 'utf8')
    for (const hit of findBare(src)) {
      const line = src.slice(0, src.indexOf(hit.slice(0, 12))).split('\n').length
      failures.push(`  ${rel}:${line}  ${hit}`)
    }
  }
}
if (failures.length) {
  console.error(`check-nirf-category: ${failures.length} NIRF rank(s) rendered without a category:`)
  console.error(failures.join('\n'))
  console.error('Use nirfForProgramme(u, programme) or formatNirfBadge(u, ...) from lib/data-slim.ts.')
  process.exit(1)
}
console.log('check-nirf-category: OK (every templated NIRF rank names its category)')
