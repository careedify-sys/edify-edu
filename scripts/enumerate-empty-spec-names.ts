/**
 * scripts/enumerate-empty-spec-names.ts
 *
 * Enumerates the 238 manifest rows whose spec_name is empty AND whose page
 * currently renders only because of the resolveSpecName rescue (title-casing
 * the slug). This is the exact set from audits/fabricated-spec-urls-2026-08-17.csv,
 * reframed as a data-fill worklist. Populate spec_name against the
 * university's official portal, then the rescue can be deleted outright.
 *
 * Output: audits/empty-spec-names-2026-08-17.csv
 * Columns: university, programme, spec_slug, currently_emitted_name,
 *          verified_name (blank, fill from portal), page_url
 *
 * Run: npx tsx scripts/enumerate-empty-spec-names.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()
const OUT = join(ROOT, 'audits', 'empty-spec-names-2026-08-17.csv')
const SRC = join(ROOT, 'audits', 'fabricated-spec-urls-2026-08-17.csv')

interface FabRow { url: string; uni: string; programme: string; slug: string; name: string }

function parseCsv(text: string): FabRow[] {
  const lines = text.trim().split('\n').slice(1)
  return lines.map(line => {
    const cells = line.match(/"([^"]|"")*"/g)!.map(c => c.slice(1, -1).replace(/""/g, '"'))
    return { url: cells[0], uni: cells[1], programme: cells[2], slug: cells[3], name: cells[4] }
  })
}

const ACRONYMS = new Set(['HR', 'IT', 'AI', 'ML', 'ESG', 'MBA', 'BFSI', 'HRM', 'UI', 'UX'])
function titleCaseSlug(slug: string): string {
  return slug.split('-').map(w => {
    const up = w.toUpperCase()
    if (ACRONYMS.has(up)) return up
    return w.charAt(0).toUpperCase() + w.slice(1)
  }).join(' ')
}

const rows = parseCsv(readFileSync(SRC, 'utf8'))

mkdirSync(join(ROOT, 'audits'), { recursive: true })

const header = 'university,programme,spec_slug,currently_emitted_name,verified_name,page_url'
const lines = [header]
for (const r of rows) {
  const emitted = titleCaseSlug(r.slug)
  const pageUrl = `https://edifyedu.in${r.url}`
  const cells = [r.uni, r.programme, r.slug, emitted, '', pageUrl]
  lines.push(cells.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
}
writeFileSync(OUT, lines.join('\n') + '\n')

console.log(`Wrote ${rows.length} empty-spec-name rows to ${OUT}`)
