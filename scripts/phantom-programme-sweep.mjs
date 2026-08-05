// scripts/phantom-programme-sweep.mjs
// Sprint 2 Task 4. Reports every uni x programme where NONE of the following
// carry any real content: pd.fees, programFees[prog], any page-content JSON
// (uni hub or spec). Report only, no changes. Output is a Markdown table.
//
// Run: npx tsx scripts/phantom-programme-sweep.mjs > audits/phantom-programme-sweep-2026-08-05.md

import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PAGE_CONTENT_DIR = join(ROOT, 'lib', 'data', 'page-content')

const contentFiles = existsSync(PAGE_CONTENT_DIR)
  ? new Set(readdirSync(PAGE_CONTENT_DIR).map(f => f.replace(/\.json$/, '')))
  : new Set()

function progSlug(program) {
  return String(program).toLowerCase().replace('.', '')
}

const rows = []
for (const u of UNIVERSITIES) {
  const pf = u.programFees || {}
  for (const program of u.programs) {
    const pd = u.programDetails?.[program]
    const hasPdFees = Boolean(pd?.fees && String(pd.fees).trim())
    const hasProgramFees = typeof pf[program.toLowerCase()]?.fee === 'number'
    const pSlug = progSlug(program)
    const hubKey = `${u.id}-${pSlug}`
    const hasHubJson = contentFiles.has(hubKey)
    const hasAnySpecJson = Array.from(contentFiles).some(f => f.startsWith(`${u.id}-${pSlug}-`))
    if (!hasPdFees && !hasProgramFees && !hasHubJson && !hasAnySpecJson) {
      rows.push({
        university_slug: u.id,
        university_name: u.name,
        programme: program,
        live_url: `https://edifyedu.in/universities/${u.id}/${pSlug}`,
        page_content_json: 'none',
      })
    }
  }
}

console.log('# Phantom-Programme Sweep — Sprint 2')
console.log('')
console.log(`Generated: 2026-08-05`)
console.log(`Total suspected phantoms: ${rows.length}`)
console.log('')
console.log('Criteria: programme in university.programs array AND no pd.fees')
console.log('AND no programFees entry AND no page-content JSON (hub or spec).')
console.log('These are the most likely phantom pages — programmes that appear')
console.log('to exist in code but carry zero real content. Verify each against')
console.log('the university before deleting anything.')
console.log('')
console.log('| university_slug | programme | live URL | page-content JSON |')
console.log('|---|---|---|---|')
for (const r of rows) {
  console.log(`| ${r.university_slug} | ${r.programme} | ${r.live_url} | ${r.page_content_json} |`)
}
