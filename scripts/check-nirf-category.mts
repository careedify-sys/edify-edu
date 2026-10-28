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
// Also scans the spec hub prose in lib/data/page-content/*.json (added
// 2026-10-28). Those files carried 905 bare "NIRF #19" mentions across 270 of
// 431 files, written by hand or by generators the template gate never saw. A
// literal "NIRF #N" must carry a category next to it: "NIRF Management #19",
// "NIRF #19 University", "NIRF #19 in Management".
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

// Second form, added 2026-10-27: "#${...nirf...}" without the "NIRF " prefix.
// components/ComparisonTable.tsx printed `#${nirf}` this way under a bare
// "NIRF Rank" row and PATTERN never saw it. A category may sit before the "#"
// ("Management #${...}", "(Uni) #${...}", label: 'NIRF University', value:)
// or right after it ("#${u.nirf} Univ", "#${u.nirfMgt} (Mgmt)").
const PATTERN2 = /(?<!NIRF )#\$\{([^}]*nirf[^}]*)\}([^`'"]{0,40})/gi
const CATEGORY_AFTER2 = /^\s*(\(\s*)?(University|Management|Mgmt|Mgt|Univ|Uni\b|Engineering|Eng\b)/i
const CATEGORY_BEFORE2 = /(University|Management|Mgmt|Mgt|Univ|Uni|Engineering|Eng|\$\{[^}]*(categor|label|cat)[^}]*\}|\bcat)\)?['"]?\s*(rank\s*)?[:,]?\s*(value:\s*)?`?$/i

// Uses that name the category somewhere this scanner cannot see. Each needs a reason.
const ALLOW2: { file: RegExp; expr: string; reason: string }[] = [
  { file: /^app\/best-online-mba-india\/page\.tsx$/, expr: 'r.nirfUniversity', reason: 'table column header reads "NIRF University"' },
  { file: /^app\/api\/enquiry\/route\.ts$/, expr: 'nirfRank.value', reason: 'internal lead email; row label is nirfRank.label' },
  { file: /^app\/leads\//, expr: 'u.nirf', reason: 'internal leads tool, not a public page' },
]

export function findBare(src: string, rel = ''): string[] {
  const hits: string[] = []
  for (const m of src.matchAll(PATTERN)) {
    if (!CATEGORY.test(m[2])) hits.push(`NIRF #\${${m[1]}}${m[2].slice(0, 20)}`)
  }
  for (const m of src.matchAll(PATTERN2)) {
    const before = src.slice(Math.max(0, (m.index ?? 0) - 40), m.index)
    if (CATEGORY_AFTER2.test(m[2]) || CATEGORY_BEFORE2.test(before)) continue
    if (ALLOW2.some(a => a.file.test(rel) && a.expr === m[1].trim())) continue
    hits.push(`#\${${m[1]}}${m[2].slice(0, 20)}`)
  }
  return hits
}

// Prose form for page-content JSON: a literal rank, not a template expression.
// "NIRF Management #19" never matches PROSE because a word sits between NIRF and #.
const PROSE_CATS = 'University|Management|Overall|Engineering|Pharmacy|Medical|Dental|Law|Architecture|Research|Agriculture|Innovation|Mgmt|Univ'
const PROSE = /NIRF\s*(?:rank(?:ing)?\s*)?#\s*\d+/gi
const PROSE_AFTER = new RegExp(`^\\s*(\\(\\s*)?(${PROSE_CATS}|in (the )?(${PROSE_CATS}))`, 'i')
const PROSE_BEFORE = new RegExp(`(${PROSE_CATS})\\s*(rank(ing)?)?\\s*[:(]?\\s*$`, 'i')

export function findBareProse(src: string): string[] {
  const hits: string[] = []
  for (const m of src.matchAll(PROSE)) {
    const i = m.index ?? 0, j = i + m[0].length
    if (PROSE_AFTER.test(src.slice(j, j + 40)) || PROSE_BEFORE.test(src.slice(Math.max(0, i - 30), i))) continue
    hits.push(src.slice(Math.max(0, i - 30), j + 20).replace(/\s+/g, ' '))
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
  // The third bad case is the exact form ComparisonTable.tsx shipped.
  const bad = 'const x = `, NIRF #${u.nirf}` ; const y = `NIRF #${n} overall`; function f(nirf){ return `#${nirf}` }'
  const good = 'const a = `NIRF #${u.nirf} University`; const b = `NIRF #${u.nirfMgt} Management`; const c = `NIRF #${r} ${category}`;'
    + ' const d = `#${u.nirf} Univ`; const e = `#${u.nirfMgt} (Mgmt)`; const g = { label: \'NIRF University\', value: `#${u.nirf}` }; const h = `(Uni) #${nirf}`'
  const b = findBare(bad), g = findBare(good)
  if (b.length !== 3 || g.length !== 0) {
    console.error(`check-nirf-category self-test FAILED: bad=${b.length} (want 3), good=${g.length} (want 0)`, b, g)
    process.exit(1)
  }
  // The first two bad prose cases are the exact forms the Chitkara marketing hub shipped.
  const badProse = '"CU is Rs 35,000 cheaper with NAAC A+ and NIRF #19. CU also", "holds NIRF #78 ranking, and", "NIRF rank #52 provides", "| NIRF #101 |"'
  const goodProse = '"NIRF Management #19", "NIRF #78 University 2025", "NIRF #12 Medical", "NIRF #41 (University)", "NIRF #49 in Management", "Management rank: NIRF #24"'
  const bp = findBareProse(badProse), gp = findBareProse(goodProse)
  if (bp.length !== 4 || gp.length !== 0) {
    console.error(`check-nirf-category self-test FAILED (prose): bad=${bp.length} (want 4), good=${gp.length} (want 0)`, bp, gp)
    process.exit(1)
  }
  console.log('check-nirf-category self-test: OK (3 of 3 templated and 4 of 4 prose bare ranks caught, 0 false positives)')
  process.exit(0)
}

const failures: string[] = []
for (const root of ROOTS) {
  for (const f of walk(root)) {
    const rel = f.replace(/\\/g, '/')
    if (SKIP.some(r => r.test(rel))) continue
    const src = readFileSync(f, 'utf8')
    for (const hit of findBare(src, rel)) {
      const line = src.slice(0, src.indexOf(hit.slice(0, 12))).split('\n').length
      failures.push(`  ${rel}:${line}  ${hit}`)
    }
  }
}
const PAGE_CONTENT = join('lib', 'data', 'page-content')
const proseFailures: string[] = []
for (const name of readdirSync(PAGE_CONTENT).filter(n => n.endsWith('.json')).sort()) {
  for (const hit of findBareProse(readFileSync(join(PAGE_CONTENT, name), 'utf8'))) proseFailures.push(`  ${PAGE_CONTENT.replace(/\\/g, '/')}/${name}  ...${hit}...`)
}
if (failures.length || proseFailures.length) {
  if (failures.length) {
    console.error(`check-nirf-category: ${failures.length} NIRF rank(s) rendered without a category:`)
    console.error(failures.join('\n'))
    console.error('Use nirfForProgramme(u, programme) or formatNirfBadge(u, ...) from lib/data-slim.ts.')
  }
  if (proseFailures.length) {
    console.error(`check-nirf-category: ${proseFailures.length} bare "NIRF #N" in spec hub content:`)
    console.error(proseFailures.join('\n'))
    console.error('Name the category ("NIRF Management #19") with the rank from Supabase, joined via scripts/lib/supabase-uni-map.mjs. If no category matches, drop the rank.')
  }
  process.exit(1)
}
console.log('check-nirf-category: OK (every templated NIRF rank and every page-content NIRF rank names its category)')
