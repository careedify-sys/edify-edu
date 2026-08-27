/**
 * Emit the three working lists from the UGC-DEB reconciliation:
 *   1. universities on the new lists that the site does not carry
 *   2. duplicate site records, with the live URL surface each side owns
 *   3. site programmes with no matching UGC programme row
 *
 * Run: node_modules/.bin/tsx scripts/ugc-deb-worklists.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { UNIVERSITIES } from '../lib/data'
import type { Program } from '../lib/data'
import { shouldIndexProgrammeHub } from '../lib/seo/should-index'

const DIR = path.join(process.cwd(), 'audits', 'ugc-deb-2026-08')
const report = JSON.parse(fs.readFileSync(path.join(DIR, 'reconciliation.json'), 'utf8'))
const validUrls: string[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'lib', 'data', 'valid-urls.json'), 'utf8'))
const byId = new Map(UNIVERSITIES.map(u => [u.id, u]))
const esc = (s: any) => '"' + String(s ?? '').replace(/"/g, '""') + '"'
const SLUG: Record<string, string> = { 'B.Com': 'bcom', 'M.Com': 'mcom', MBA: 'mba', MCA: 'mca', BBA: 'bba', BCA: 'bca', BA: 'ba', MA: 'ma', MSc: 'msc', BSc: 'bsc' }
const hubSlug = (code: string) => SLUG[code] || code.toLowerCase()

// The real render surface, which is wider than the sitemap registry:
// app/universities/[id]/page.tsx returns every UNIVERSITIES entry from
// generateStaticParams, so a record's root page renders 200 whether or not
// valid-urls.json lists it. Programme hubs render when middleware's
// pre-generated allowlist carries the (slug, programme) pair.
const ALLOWLISTS: Record<string, string[]> = {
  mba: require('../lib/data/programme-allowlist-mba.json'),
  mca: require('../lib/data/programme-allowlist-mca.json'),
  bba: require('../lib/data/programme-allowlist-bba.json'),
  bca: require('../lib/data/programme-allowlist-bca.json'),
  bcom: require('../lib/data/programme-allowlist-bcom.json'),
  mcom: require('../lib/data/programme-allowlist-mcom.json'),
  ma: require('../lib/data/programme-allowlist-ma.json'),
}
function renderSurface(id: string) {
  const root = '/universities/' + id
  const hubs = Object.entries(ALLOWLISTS)
    .filter(([, ids]) => ids.includes(id))
    .map(([prog]) => root + '/' + prog)
  const sitemap = validUrls.filter(u => u === root || u.startsWith(root + '/'))
  const all = [...new Set([root, ...hubs, ...sitemap])].sort()
  return { root, hubs, sitemap, all }
}
const urlsFor = (id: string) => renderSurface(id).all

// ---------------------------------------------------------------- 1. missing
type Miss = { hei: string; state: string; src: string; sno: string; n: number; programmes: string[] }
const missing: Miss[] = (report.onListNotOnSite as any[])
  .map(r => ({ hei: r.hei, state: r.state, src: r.src, sno: r.sno, n: r.programmes.length, programmes: r.programmes }))
  .sort((a, b) => b.n - a.n || a.hei.localeCompare(b.hei))

const missMd = [
  '# Worklist 1: universities on the new UGC lists that the site does not carry',
  '',
  'Ordered by programme count, the closest proxy available here for demand.',
  'Amity Rajasthan is absent from this list on purpose: its programmes are merged',
  'into Amity Noida on the site, so `amity-university-online` answers for both rows.',
  '',
  '| # | HEI | State | Source | Programmes | Degree types |',
  '|---|---|---|---|---|---|',
  ...missing.map((m, i) => {
    const codes = [...new Set(m.programmes.map(p => {
      const s = p.toUpperCase()
      if (s.startsWith('MASTER OF BUSINESS')) return 'MBA'
      if (s.startsWith('MASTER OF COMPUTER')) return 'MCA'
      if (s.startsWith('BACHELOR OF BUSINESS')) return 'BBA'
      if (s.startsWith('BACHELOR OF COMPUTER')) return 'BCA'
      if (s.startsWith('MASTER OF COMMERCE')) return 'M.Com'
      if (s.startsWith('BACHELOR OF COMMERCE')) return 'B.Com'
      if (s.startsWith('MASTER OF ARTS')) return 'MA'
      if (s.startsWith('BACHELOR OF ARTS')) return 'BA'
      if (s.startsWith('MASTER OF SCIENCE')) return 'MSc'
      if (s.startsWith('BACHELOR OF SCIENCE')) return 'BSc'
      return 'other'
    }))].sort()
    return `| ${i + 1} | ${m.hei} | ${m.state} | ${m.src} #${m.sno} | ${m.n} | ${codes.join(', ')} |`
  }),
  '',
  '## Full programme lists',
  '',
  ...missing.flatMap(m => [`### ${m.hei} (${m.state}, ${m.src} #${m.sno})`, '', ...m.programmes.map((p, i) => `${i + 1}. ${p}`), '']),
].join('\n')
fs.writeFileSync(path.join(DIR, 'worklist-1-missing-universities.md'), missMd)

// ------------------------------------------------------------- 2. duplicates
const dupMd: string[] = [
  '# Worklist 2: duplicate site records and their URL surface',
  '',
  'Four pairs of site IDs resolve to a single UGC row, so the same real university',
  'is in `lib/data.ts` twice. Retiring one side means redirecting every URL it owns.',
  '',
  '`keep` is proposed as the record holding the sitemap presence, because that is the',
  'side with the earned search surface. Both sides are yours to overrule.',
  'to overrule. Note the two counts are different things: **sitemap** is presence in',
  '`valid-urls.json`, while **renders** is what actually returns 200, because',
  '`generateStaticParams` emits every record whether or not the sitemap lists it.',
  'A retired record needs a redirect for everything in the renders column, plus the',
  'spec pages that hang off each programme hub.',
  '',
]
for (const d of report.duplicateSiteRecords as any[]) {
  const sides = d.siteIds.map((id: string) => ({ id, urls: urlsFor(id), u: byId.get(id)! }))
  sides.sort((a: any, b: any) => renderSurface(b.id).sitemap.length - renderSurface(a.id).sitemap.length || b.urls.length - a.urls.length)
  const keep = sides[0], drop = sides.slice(1)
  dupMd.push(`## ${d.ugcRow}`, '')
  dupMd.push('| Record | Renders | In sitemap | Programmes | NAAC | Proposed |', '|---|---|---|---|---|---|')
  for (const s of sides) {
    const rs = renderSurface(s.id)
    dupMd.push(`| \`${s.id}\` | ${rs.all.length} | ${rs.sitemap.length} | ${s.u.programs.join(', ')} | ${s.u.naac} | ${s.id === keep.id ? '**keep**' : 'retire'} |`)
  }
  const lost = drop.flatMap((s: any) => s.u.programs.filter((p: string) => !keep.u.programs.includes(p)))
  if (lost.length) {
    dupMd.push('', `> Merge note: the retired side carries **${[...new Set(lost)].join(', ')}**, which \`${keep.id}\` does not list. Take the union of programmes, filtered by what the UGC row actually grants.`)
  }
  dupMd.push('')
  const keepSurface = renderSurface(keep.id)
  const total = drop.reduce((a: number, s: any) => a + s.urls.length, 0)
  dupMd.push(`Redirects needed: **${total}**`, '')
  for (const s of drop) {
    if (!s.urls.length) { dupMd.push(`\`${s.id}\` renders nothing.`, ''); continue }
    dupMd.push('```')
    for (const from of s.urls) {
      const to = from.replace('/universities/' + s.id, '/universities/' + keep.id)
      dupMd.push(`${from}  ->  ${keepSurface.all.includes(to) ? to : to + '   (TARGET DOES NOT RENDER, redirect to the keep root instead)'}`)
    }
    dupMd.push('```', '')
  }
}
fs.writeFileSync(path.join(DIR, 'worklist-2-duplicates.md'), dupMd.join('\n'))

// ------------------------------------------------- 3. unapproved programmes
type Gap = { id: string; name: string; code: string; url: string; indexable: boolean; reason: string; entitled: string; ugcRow: string }
const gaps: Gap[] = []
for (const r of report.withUnbackedProgrammes as any[]) {
  const u = byId.get(r.id)!
  for (const code of r.unbacked) {
    const variants = u.programs.filter(p => (p === 'MBA (WX)' ? 'MBA' : p) === code) as Program[]
    const decisions = variants.map(v => shouldIndexProgrammeHub(u, v))
    gaps.push({
      id: r.id, name: u.name, code,
      url: '/universities/' + r.id + '/' + hubSlug(code),
      indexable: decisions.some(d => d.shouldIndex),
      reason: decisions.map(d => [d.hasContentJson && 'content', d.feeOk && 'fee'].filter(Boolean).join('+') || 'thin').join(','),
      entitled: r.entitled.join(' '),
      ugcRow: r.sources.join(' + '),
    })
  }
}
gaps.sort((a, b) => Number(b.indexable) - Number(a.indexable) || a.code.localeCompare(b.code) || a.id.localeCompare(b.id))

fs.writeFileSync(
  path.join(DIR, 'worklist-3-unapproved-programmes.csv'),
  ['hub_url,university_id,university,programme,indexable,index_reason,ugc_row,ugc_entitled_programmes,decision']
    .concat(gaps.map(g => [g.url, g.id, g.name, g.code, g.indexable ? 'YES' : 'NO', g.reason, g.ugcRow, g.entitled, ''].map(esc).join(',')))
    .join('\n')
)

const gapMd = [
  '# Worklist 3: site programmes with no matching UGC programme row',
  '',
  'A gap means the university appears on the new lists but that degree type does not',
  'appear among its granted programmes. Two caveats before anyone edits a page:',
  '',
  '- These files may cover one mode. A state university may hold the programme under',
  '  an ODL entitlement these documents do not carry. Check mode before acting.',
  '- Rows marked `indexable: NO` are already `noindex` and carry no published claim,',
  '  so they are cleanup, not exposure.',
  '',
  '## Indexable, so a live published claim',
  '',
  '| Hub | Programme | Why it indexes | UGC grants instead | Decision |',
  '|---|---|---|---|---|',
  ...gaps.filter(g => g.indexable).map(g => `| \`${g.url}\` | ${g.code} | ${g.reason} | ${g.entitled} | |`),
  '',
  '## Not indexable, no published claim',
  '',
  '| Hub | Programme | UGC grants instead |',
  '|---|---|---|',
  ...gaps.filter(g => !g.indexable).map(g => `| \`${g.url}\` | ${g.code} | ${g.entitled} |`),
  '',
].join('\n')
fs.writeFileSync(path.join(DIR, 'worklist-3-unapproved-programmes.md'), gapMd)

console.log('worklist 1: missing universities        ', missing.length)
console.log('worklist 2: duplicate pairs             ', report.duplicateSiteRecords.length,
  '| redirects needed', (report.duplicateSiteRecords as any[]).reduce((a, d) => {
    const sides = d.siteIds.map((id: string) => urlsFor(id).length).sort((x: number, y: number) => y - x)
    return a + sides.slice(1).reduce((s: number, n: number) => s + n, 0)
  }, 0))
console.log('worklist 3: unapproved programmes       ', gaps.length, '| indexable', gaps.filter(g => g.indexable).length)
