#!/usr/bin/env node
// scripts/build-fee-backfill-worklist-4d.mjs
//
// Generates data/fee-backfill-worklist-4d.csv: every programme row whose fee is
// currently suppressed, ranked by how many people actually search for that
// university's fees.
//
// Why a worklist rather than the fees themselves. The obvious move after rule
// 4d was to go and fetch the real numbers from official portals. Two of the
// three highest-demand targets were tried on 2026-09-29 and neither could be
// verified: jamiahamdardonline.in does not resolve, and
// galgotiasuniversityonline.com publishes no fee anywhere on the site. The
// existing worklist already records the same outcome for GLS on 2026-08-04
// ("does not publish any fees on its website"). Many Indian online university
// portals gate fees behind an enquiry form, which is the reason placeholder
// ranges got authored in the first place.
//
// So the fees have to come from Rishi, through counsellor contact, and the
// useful thing to build is the queue: which rows are worth the call first.
// Ranking is by GSC fee-query impressions, because a suppressed fee on a
// university nobody searches costs nothing, while jamia-hamdard sits on 429
// impressions a month at position 11 earning zero clicks.
//
// Columns match data/fee-backfill-worklist.csv so rows drop into the existing
// ingest: fill VERIFIED_TOTAL_FEE, edit lib/data.ts, then validate with
// scripts/apply-verified-fees.mjs.
//
// Run: node scripts/build-fee-backfill-worklist-4d.mjs [path/to/Queries.csv]

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UNIVERSITIES } from '../lib/data.ts'
import { getDisplayFee } from '../lib/fees.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'data', 'fee-backfill-worklist-4d.csv')
const QUERIES = process.argv[2]

const PROGS = ['MBA', 'MCA', 'BBA', 'BCA', 'M.Com', 'MA', 'B.Com', 'MSc', 'BSc', 'BA']
const SLUG = { MBA: 'mba', MCA: 'mca', BBA: 'bba', BCA: 'bca', 'M.Com': 'mcom', MA: 'ma', 'B.Com': 'bcom', MSc: 'msc', BSc: 'bsc', BA: 'ba' }

// Fee-query demand per university, if a GSC export was supplied. Absent demand
// is recorded as 0 rather than guessed.
const demand = {}
if (QUERIES && existsSync(QUERIES)) {
  for (const line of readFileSync(QUERIES, 'utf8').split(/\r?\n/).slice(1)) {
    const m = line.match(/^(.*),(\d+),(\d+),[^,]*,[\d.]+$/)
    if (!m) continue
    const q = m[1].toLowerCase().replace(/^"|"$/g, '')
    if (!/fee/.test(q)) continue
    const impr = Number(m[3])
    for (const u of UNIVERSITIES) {
      const tokens = [u.abbr, ...u.name.replace(/\(.*?\)/g, ' ').split(/\s+/)]
        .filter(Boolean).map(t => String(t).toLowerCase())
        .filter(t => t.length > 4 && !['university', 'online', 'institute', 'deemed'].includes(t))
      if (tokens.some(t => q.includes(t))) demand[u.id] = (demand[u.id] || 0) + impr
    }
  }
}

const rows = []
for (const u of UNIVERSITIES) {
  for (const prog of PROGS) {
    if (!(u.programs || []).includes(prog)) continue
    const f = getDisplayFee(u, prog)
    if (f.ok) continue
    rows.push({
      slug: u.id,
      name: u.name,
      prog,
      raw: u.programDetails?.[prog]?.fees ?? '',
      rule: f.rule,
      feeMin: u.feeMin ?? '',
      feeMax: u.feeMax ?? '',
      url: `https://edifyedu.in/universities/${u.id}/${SLUG[prog]}`,
      impr: demand[u.id] || 0,
    })
  }
}

// Most-searched university first, then its programmes together.
rows.sort((a, b) => b.impr - a.impr || a.slug.localeCompare(b.slug) || a.prog.localeCompare(b.prog))

const q = s => `"${String(s).replace(/"/g, '""')}"`
const header = 'university_slug,university_display_name,program,current_pd_fees_value,suppression_rule,feeMin,feeMax,live_url,gsc_fee_impressions_28d,priority_rank,VERIFIED_TOTAL_FEE,VERIFIED_PER_SEM_FEE,VERIFIED_REGISTRATION_FEE,SOURCE_NOTE,VERIFIED_DATE'
const lines = rows.map((r, i) =>
  [r.slug, q(r.name), r.prog, q(r.raw), r.rule, r.feeMin, r.feeMax, r.url, r.impr, i + 1, '', '', '', '', ''].join(','))

writeFileSync(OUT, header + '\n' + lines.join('\n') + '\n', 'utf8')

const withDemand = rows.filter(r => r.impr > 0).length
const byRule = {}
for (const r of rows) byRule[r.rule] = (byRule[r.rule] || 0) + 1
console.log(`build-fee-backfill-worklist-4d: ${rows.length} suppressed rows written to data/fee-backfill-worklist-4d.csv`)
console.log(`  by rule: ${Object.entries(byRule).sort().map(([k, v]) => `${k}=${v}`).join('  ')}`)
console.log(`  rows on a university with fee-query demand: ${withDemand}`)
console.log(`\n  top of the queue:`)
for (const r of rows.slice(0, 10)) console.log(`    ${String(r.impr).padStart(5)} impr  ${r.slug} ${r.prog} (${r.rule})`)
