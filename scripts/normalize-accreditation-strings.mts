// scripts/normalize-accreditation-strings.mts
// Rebuild the hand-authored `approvals` and `rankingBadge` display strings in
// lib/data.ts from the numeric fields (naac, nirf, nirfMgt), which Rishi
// confirmed on 2026-08-26 are the source of truth when the two disagree.
//
// Rules
//   NAAC   : approvals entry becomes `NAAC <naac field>`; dropped if no grade.
//   NIRF   : `NIRF #<nirf> (University)` when nirf < 500, plus
//            `NIRF #<nirfMgt> (Management)` when nirfMgt < 500.
//            When neither is a real rank, every NIRF rank claim is removed,
//            because nirf 999 means "not ranked".
//   Bands  : an explicit band claim (e.g. "NIRF 101-125 (Management band)")
//            is NOT an individual rank, so it is preserved as written.
//   Year   : omitted. The numeric fields carry no year, and inventing one
//            would assert something this pass cannot verify.
//   Other  : UGC DEB, AICTE, WES Recognised, QS Ranked, Central University and
//            anything else is passed through untouched, in its original order.
//
// Usage: npx tsx scripts/normalize-accreditation-strings.mts [--apply]

import { readFileSync, writeFileSync } from 'node:fs'
import { UNIVERSITIES } from '../lib/data'

const APPLY = process.argv.includes('--apply')
const PATH = 'lib/data.ts'
let src = readFileSync(PATH, 'utf8')

const isNaacEntry = (s: string) => /^\s*NAAC\b/i.test(s)
const isNirfEntry = (s: string) => /NIRF/i.test(s)
const isBandEntry = (s: string) => /\d\s*-\s*\d|\d\s*\+/.test(s) && /NIRF/i.test(s)

type Change = { id: string; field: 'approvals' | 'rankingBadge'; before: string; after: string }
const changes: Change[] = []

function esc(s: string) { return s.replace(/'/g, "\\'") }

for (const u of UNIVERSITIES as any[]) {
  const start = src.indexOf(`id: '${u.id}'`)
  if (start < 0) { console.error('SKIP (not found in source):', u.id); continue }
  const nextId = src.indexOf("\n    id: '", start + 10)
  const end = nextId === -1 ? src.length : nextId
  let block = src.slice(start, end)
  const originalBlock = block

  // ---- approvals ----
  const apprMatch = block.match(/approvals:\s*\[([^\]]*)\]/)
  if (apprMatch) {
    const items = [...apprMatch[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"))
    const kept: string[] = []
    let naacInserted = false
    let nirfInserted = false
    for (const it of items) {
      if (isNaacEntry(it)) {
        if (!naacInserted && u.naac && String(u.naac).trim() && String(u.naac).toUpperCase() !== 'NA') {
          kept.push(`NAAC ${u.naac}`); naacInserted = true
        }
        continue
      }
      if (isNirfEntry(it)) {
        if (isBandEntry(it)) { kept.push(it); continue }   // band, not a rank
        if (!nirfInserted) {
          if (u.nirf && u.nirf < 500) kept.push(`NIRF #${u.nirf} (University)`)
          if (u.nirfMgt && u.nirfMgt < 500) kept.push(`NIRF #${u.nirfMgt} (Management)`)
          nirfInserted = true
        }
        continue
      }
      kept.push(it)
    }
    const rebuilt = `approvals: [${kept.map(k => `'${esc(k)}'`).join(', ')}]`
    if (rebuilt !== apprMatch[0]) {
      changes.push({ id: u.id, field: 'approvals', before: apprMatch[0], after: rebuilt })
      block = block.replace(apprMatch[0], rebuilt)
    }
  }

  // ---- rankingBadge ----
  const badgeMatch = block.match(/rankingBadge:\s*'((?:[^'\\]|\\.)*)'/)
  if (badgeMatch) {
    const cur = badgeMatch[1]
    // The rank the badge should carry: Management first (house rule puts the
    // Management rank ahead on MBA pages), else University.
    const wantNum = (u.nirfMgt && u.nirfMgt < 500) ? u.nirfMgt
                  : (u.nirf && u.nirf < 500) ? u.nirf : null
    const wantCat = (u.nirfMgt && u.nirfMgt < 500) ? 'Management' : 'University'
    const curNum = cur.match(/#\s*(\d+)/)?.[1]
    const curHasCat = /\((?:University|Management)/i.test(cur)

    let next: string | null = null
    if (isBandEntry(cur)) next = cur                                  // preserve bands verbatim
    else if (!/NIRF/i.test(cur)) next = cur                           // not a NIRF badge, leave alone
    else if (wantNum == null) next = ''                               // no real rank -> remove claim
    else if (curNum === String(wantNum) && curHasCat) next = cur      // already right, keep year intact
    else next = `NIRF #${wantNum} (${wantCat})`
    if (next !== cur) {
      const rebuilt = next === '' ? '' : `rankingBadge: '${esc(next)}'`
      const before = badgeMatch[0]
      changes.push({ id: u.id, field: 'rankingBadge', before, after: rebuilt || '(removed)' })
      block = rebuilt
        ? block.replace(before, rebuilt)
        : block.replace(new RegExp(`\\s*${before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},?`), '')
    }
  }

  if (block !== originalBlock) src = src.slice(0, start) + block + src.slice(end)
}

console.log(`changes: ${changes.length} across ${new Set(changes.map(c => c.id)).size} universities\n`)
for (const c of changes.slice(0, 18)) {
  console.log(`${c.id} [${c.field}]`)
  console.log(`   -  ${c.before.slice(0, 130)}`)
  console.log(`   +  ${c.after.slice(0, 130)}\n`)
}
if (changes.length > 18) console.log(`... +${changes.length - 18} more\n`)

if (APPLY) { writeFileSync(PATH, src); console.log('APPLIED to lib/data.ts') }
else console.log('DRY RUN. Re-run with --apply to write.')
