/**
 * Rank the UGC-DEB programme gaps by live SEO exposure: a gap only matters
 * as a published claim if the hub page is actually indexable.
 * Run: node_modules/.bin/tsx scripts/ugc-deb-exposure.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { UNIVERSITIES } from '../lib/data'
import type { Program } from '../lib/data'
import { shouldIndexProgrammeHub } from '../lib/seo/should-index'

const DIR = path.join(process.cwd(), 'audits', 'ugc-deb-2026-08')
const report = JSON.parse(fs.readFileSync(path.join(DIR, 'reconciliation.json'), 'utf8'))
const byId = new Map(UNIVERSITIES.map(u => [u.id, u]))

const SLUG: Record<string, string> = { 'B.Com': 'bcom', 'M.Com': 'mcom', MBA: 'mba', MCA: 'mca', BBA: 'bba', BCA: 'bca', BA: 'ba', MA: 'ma', MSc: 'msc', BSc: 'bsc' }

type Row = { id: string; name: string; programme: string; url: string; indexed: boolean; reason: string }
const out: Row[] = []

for (const r of report.withUnbackedProgrammes as any[]) {
  const u = byId.get(r.id)!
  for (const code of r.unbacked) {
    // the site may carry the programme as "MBA (WX)"; test every variant it lists
    const variants = u.programs.filter(p => (p === 'MBA (WX)' ? 'MBA' : p) === code) as Program[]
    const d = variants.map(v => shouldIndexProgrammeHub(u, v))
    const indexed = d.some(x => x.shouldIndex)
    out.push({
      id: r.id, name: u.name, programme: code,
      url: '/universities/' + r.id + '/' + (SLUG[code] || code.toLowerCase()),
      indexed,
      reason: d.map(x => (x.hasContentJson ? 'content' : '') + (x.feeOk ? (x.hasContentJson ? '+fee' : 'fee') : '')).join(',') || 'thin',
    })
  }
}

// universities absent from the new list entirely, so every hub they publish is exposed
const absent: Row[] = []
for (const r of report.notListed as any[]) {
  const u = byId.get(r.id)!
  for (const p of u.programs) {
    const d = shouldIndexProgrammeHub(u, p as Program)
    const code = p === 'MBA (WX)' ? 'MBA' : p
    absent.push({
      id: r.id, name: u.name, programme: p,
      url: '/universities/' + r.id + '/' + (SLUG[code] || code.toLowerCase()),
      indexed: d.shouldIndex,
      reason: (d.hasContentJson ? 'content' : '') + (d.feeOk ? (d.hasContentJson ? '+fee' : 'fee') : '') || 'thin',
    })
  }
}

const esc = (s: any) => '"' + String(s ?? '').replace(/"/g, '""') + '"'
fs.writeFileSync(
  path.join(DIR, 'exposure.csv'),
  ['bucket,id,name,programme,hub_url,indexable,index_reason']
    .concat(out.map(r => ['PROGRAMME_GAP', r.id, r.name, r.programme, r.url, r.indexed ? 'YES' : 'NO', r.reason].map(esc).join(',')))
    .concat(absent.map(r => ['UNIVERSITY_ABSENT', r.id, r.name, r.programme, r.url, r.indexed ? 'YES' : 'NO', r.reason].map(esc).join(',')))
    .join('\n')
)

console.log('--- programme gaps on INDEXABLE hubs (published claim, no UGC row) ---')
out.filter(r => r.indexed).forEach(r => console.log('  ', r.url.padEnd(60), r.reason))
console.log('   indexable:', out.filter(r => r.indexed).length, '/ total gaps', out.length)
console.log('\n--- hubs of universities ABSENT from the new list ---')
const byUni = new Map<string, Row[]>()
absent.forEach(r => byUni.set(r.id, (byUni.get(r.id) || []).concat(r)))
for (const [id, rs] of byUni) console.log('  ', id.padEnd(40), 'hubs', rs.length, '| indexable', rs.filter(r => r.indexed).length)
console.log('   indexable:', absent.filter(r => r.indexed).length, '/ total hubs', absent.length)
