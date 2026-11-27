// scripts/check-fee-provenance.mts
//
// B1 (2026-11-28). A fee on a Phase B page must carry the date it was checked
// against the university's own portal, and that date must belong to the figure
// the page prints.
//
// Why. Every Phase B university needs "checkedOn present on every fee" (exit
// gate, audits/OPERATING-PLAN.md). Before this, 26 records carried a
// feeVerifiedOn that no page rendered, some dates covered a different
// programme's fees (JAIN's 30 Oct date was a BBA/MCA read), and nothing tied a
// date to a figure: a fee could change and keep the old date.
//
// Rules:
//   1. Scope: the 10 queue universities (audits/queue-ranking-2026-11-16.md)
//      plus every record in UNIVERSITY_PROVENANCE. Each must carry
//      provenance.fee with value, sourceUrl and checkedOn.
//   2. KNOWN_GAPS holds the queue universities with no dated portal check of
//      their printed fee, each with its question number. It is a ratchet: a
//      gap that gains provenance fails until it is removed, and no id may be
//      added without a QUESTIONS-FOR-RISHI row.
//   3. Every provenance entry, in or out of scope, is complete: value,
//      https sourceUrl on the fact's own authority, checkedOn as YYYY-MM-DD and
//      not in the future, and a sheet that exists in the repo.
//   4. fee.value must equal the MBA fee the page prints (formatExactFee of
//      getExactFee). A changed fee with an old date fails.
//   5. fee.sourceUrl must sit on the record's officialUrl host. deb, naac and
//      nirf sources must sit on deb.ugc.ac.in, naac.gov.in and nirfindia.org.
//   6. deb needs a session; naac.value must equal u.naac; each NIRF rank in
//      nirf.value must equal the record's rank field.
//
// Run: npx tsx scripts/check-fee-provenance.mts [--self-test]

import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { UNIVERSITIES, UNIVERSITY_PROVENANCE, type UniProvenance, type University } from '../lib/data'
import { getExactFee, formatExactFee } from '../lib/fees'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const QUEUE_10 = [
  'bits-pilani-work-integrated-online',
  'galgotias-university-online',
  'jain-university-online',
  'dayananda-sagar-university-online',
  'symbiosis-university-online',
  'dr-dy-patil-vidyapeeth-online',
  'amity-university-online',
  'uttaranchal-university-online',
  'shoolini-university-online',
  'adichunchanagiri-university-online',
]

// Only shrinks. Each entry names the question that unblocks it.
const KNOWN_GAPS: Record<string, string> = {
  'dayananda-sagar-university-online': 'Q80: dsuonline.com UNVERIFIED as DSU\'s own domain (audits/verify/b2-official-urls-2026-11-28.md)',
  'adichunchanagiri-university-online': 'Q81: which ACU MBA figure is the payable total (Q31 open since 18 Nov)',
}

const AUTHORITY: Record<'deb' | 'naac' | 'nirf', string> = {
  deb: 'deb.ugc.ac.in',
  naac: 'naac.gov.in',
  nirf: 'nirfindia.org',
}

const host = (url: string) => url.replace(/^https:\/\//i, '').split(/[/?#]/)[0].toLowerCase()
const onHost = (url: string, h: string) => host(url) === h || host(url).endsWith('.' + h)
const bare = (h: string) => h.replace(/^www\./, '')

function localToday(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export function validate(
  unis: University[],
  prov: Record<string, UniProvenance>,
  gaps: Record<string, string>,
  today: string,
): string[] {
  const errors: string[] = []
  const byId = new Map(unis.map(u => [u.id, u]))

  for (const id of Object.keys(prov)) {
    if (!byId.has(id)) errors.push(`${id}: UNIVERSITY_PROVENANCE names an id that is not in UNIVERSITIES`)
  }
  for (const id of Object.keys(gaps)) {
    if (!QUEUE_10.includes(id)) errors.push(`${id}: KNOWN_GAPS may only hold queue universities`)
    if (prov[id]?.fee) errors.push(`${id}: now carries fee provenance; remove it from KNOWN_GAPS (the list only shrinks)`)
  }

  const scope = new Set([...QUEUE_10, ...Object.keys(prov)])
  for (const id of scope) {
    const u = byId.get(id)
    if (!u) { errors.push(`${id}: in scope but not in UNIVERSITIES`); continue }
    const p = prov[id]
    if (!p?.fee && !gaps[id]) {
      errors.push(`${id}: no provenance.fee. A Phase B fee needs { value, sourceUrl, checkedOn } from a verify sheet or FIX-LOG`)
    }
    if (!p) continue

    for (const key of ['fee', 'deb', 'naac', 'nirf'] as const) {
      const f = p[key]
      if (!f) continue
      const at = `${id}.${key}`
      if (f.value === undefined || f.value === null || String(f.value).trim() === '') errors.push(`${at}: missing value`)
      if (!f.checkedOn) errors.push(`${at}: missing checkedOn`)
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(f.checkedOn)) errors.push(`${at}: checkedOn is not YYYY-MM-DD: ${f.checkedOn}`)
      else if (f.checkedOn > today) errors.push(`${at}: checkedOn is in the future: ${f.checkedOn}`)
      if (!f.sourceUrl) errors.push(`${at}: missing sourceUrl`)
      else if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(f.sourceUrl)) errors.push(`${at}: sourceUrl is not an https URL: ${f.sourceUrl}`)
      else if (key === 'fee') {
        if (!u.officialUrl) errors.push(`${at}: record has no officialUrl, so the fee source cannot be tied to the university's own portal`)
        else if (!onHost(f.sourceUrl, bare(host(u.officialUrl)))) errors.push(`${at}: sourceUrl ${f.sourceUrl} is not on the officialUrl host ${u.officialUrl}`)
      } else if (!onHost(f.sourceUrl, AUTHORITY[key])) {
        errors.push(`${at}: sourceUrl must be on ${AUTHORITY[key]}: ${f.sourceUrl}`)
      }
      if (!f.sheet) errors.push(`${at}: missing sheet (audits/verify/... or audits/FIX-LOG.md)`)
      else if (!/^audits\/(verify\/[^/]+\.md|FIX-LOG\.md)$/.test(f.sheet)) errors.push(`${at}: sheet must be an audits/verify/*.md file or audits/FIX-LOG.md: ${f.sheet}`)
      else if (!existsSync(join(ROOT, f.sheet))) errors.push(`${at}: sheet does not exist: ${f.sheet}`)
    }

    if (p.fee?.value) {
      const shown = formatExactFee(getExactFee(u, 'MBA'))
      if (shown !== p.fee.value) {
        errors.push(`${id}.fee: value "${p.fee.value}" is not the MBA fee the page prints ("${shown ?? 'none'}"). Re-check the portal and re-date, or fix the record`)
      }
    }
    if (p.deb && !p.deb.session) errors.push(`${id}.deb: missing session`)
    if (p.naac?.value && p.naac.value !== u.naac) errors.push(`${id}.naac: value ${p.naac.value} disagrees with the record's naac ${u.naac}`)
    if (p.nirf?.value) {
      if (!p.nirf.session) errors.push(`${id}.nirf: missing session (the NIRF edition year)`)
      for (const [, cat, rank] of p.nirf.value.matchAll(/(University|Management) #(\d+)/g)) {
        const field = cat === 'University' ? u.nirf : u.nirfMgt
        if (field !== Number(rank)) errors.push(`${id}.nirf: ${cat} #${rank} disagrees with the record (${field ?? 'unset'})`)
      }
    }
  }
  return errors
}

function selfTest(): void {
  const today = localToday()
  const clone = (): Record<string, UniProvenance> => JSON.parse(JSON.stringify(UNIVERSITY_PROVENANCE))
  const base = validate(UNIVERSITIES, clone(), KNOWN_GAPS, today)
  if (base.length) {
    console.error('check-fee-provenance --self-test: the real data must pass before the injections mean anything:')
    for (const e of base) console.error('  ' + e)
    process.exit(1)
  }
  const id = Object.keys(UNIVERSITY_PROVENANCE).find(k => UNIVERSITY_PROVENANCE[k].fee)
  if (!id) { console.error('check-fee-provenance --self-test: no fee provenance to inject into'); process.exit(1) }

  const cases: { name: string; mutate: (p: Record<string, UniProvenance>) => Record<string, string> | void; expect: RegExp }[] = [
    { name: 'missing fee checkedOn', mutate: p => { delete (p[id].fee as Partial<NonNullable<UniProvenance['fee']>>).checkedOn }, expect: new RegExp(`${id}\\.fee: missing checkedOn`) },
    { name: 'empty fee checkedOn', mutate: p => { p[id].fee!.checkedOn = '' }, expect: /fee: missing checkedOn/ },
    { name: 'future checkedOn', mutate: p => { p[id].fee!.checkedOn = '2999-01-01' }, expect: /in the future/ },
    { name: 'fee value drifted from the page', mutate: p => { p[id].fee!.value = '₹1' }, expect: /is not the MBA fee the page prints/ },
    { name: 'fee source off the portal', mutate: p => { p[id].fee!.sourceUrl = 'https://collegebandhu.com/x' }, expect: /not on the officialUrl host/ },
    { name: 'queue university loses its provenance', mutate: p => { delete p[id] }, expect: new RegExp(`${id}: no provenance.fee`) },
    { name: 'gap gains provenance but stays listed', mutate: p => { p['adichunchanagiri-university-online'] = { fee: p[id].fee } }, expect: /remove it from KNOWN_GAPS/ },
    { name: 'deb without session', mutate: p => { const k = Object.keys(p).find(x => p[x].deb)!; delete (p[k].deb as Partial<NonNullable<UniProvenance['deb']>>).session }, expect: /deb: missing session/ },
  ]
  let failed = 0
  for (const c of cases) {
    const p = clone()
    c.mutate(p)
    const errs = validate(UNIVERSITIES, p, KNOWN_GAPS, today)
    const caught = errs.some(e => c.expect.test(e))
    console.log(`  ${caught ? 'caught' : 'MISSED'}: ${c.name}`)
    if (!caught) failed++
  }
  if (failed) { console.error(`check-fee-provenance --self-test: FAILED, ${failed} injected defect(s) not caught`); process.exit(1) }
  console.log(`check-fee-provenance --self-test: OK (${cases.length} injected defects caught, real data clean)`)
}

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  const errors = validate(UNIVERSITIES, UNIVERSITY_PROVENANCE, KNOWN_GAPS, localToday())
  const withFee = Object.values(UNIVERSITY_PROVENANCE).filter(p => p.fee).length
  if (UNIVERSITIES.length === 0 || withFee === 0) {
    console.error('check-fee-provenance: read no universities or no fee provenance. Refusing to pass.')
    process.exit(1)
  }
  if (errors.length) {
    console.error('check-fee-provenance: FAILED')
    for (const e of errors) console.error('  ' + e)
    process.exit(1)
  }
  console.log(
    `check-fee-provenance: OK (${withFee} fees dated, ${Object.keys(KNOWN_GAPS).length} known gaps: ` +
    `${Object.entries(KNOWN_GAPS).map(([k, v]) => `${k} ${v.split(':')[0]}`).join(', ')}).`,
  )
}
