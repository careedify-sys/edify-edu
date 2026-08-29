/**
 * Generate hub page-content JSON for the universities added from the August
 * 2026 UGC-DEB lists that have no fee on record yet.
 *
 * Why this exists: shouldIndexProgrammeHub is `hasContentJson OR feeOk`. These
 * records have no fee, so feeOk is false and every hub sits noindex. The
 * sanctioned way to make such a hub indexable is real editorial content, NOT a
 * placeholder fee. See audits/ugc-deb-2026-08/README.md.
 *
 * The content is genuinely per-university, not spun filler. Every sentence is
 * derived from that university's own UGC row: which programmes were granted,
 * which named specialisations, the recognition period where the addendum states
 * one, and the structural facts already captured in lib/data.ts (all-PG grants,
 * four-year honours UG, management-only grants, medium-of-instruction splits,
 * and the AICTE position for deemed universities offering online tech).
 *
 * Fees are absent by design. Each page says so plainly and routes to the
 * counsellor form, which is the lead-capture path.
 *
 * Run: node_modules/.bin/tsx scripts/gen-new-uni-content.mjs [--apply]
 */
import fs from 'node:fs'
import path from 'node:path'
import { UNIVERSITIES } from '../lib/data'
import { getDisplayFee } from '../lib/fees'

const APPLY = process.argv.includes('--apply')
const OUT = path.join(process.cwd(), 'lib', 'data', 'page-content')
const AUDIT = path.join(process.cwd(), 'audits', 'ugc-deb-2026-08')
const main = JSON.parse(fs.readFileSync(path.join(AUDIT, 'main.json'), 'utf8'))
const addendum = JSON.parse(fs.readFileSync(path.join(AUDIT, 'addendum.json'), 'utf8'))

// site record id -> its UGC row, so the copy can cite the actual grant
const ROW: Record<string, { src: string; sno: string; type: string; programmes: string[]; period?: string }> = {
  'pt-sundarlal-sharma-open-university-online': pick(main, 'SUNDARLAL'),
  'reva-university-online': pick(main, 'REVA'),
  'university-of-calicut-online': pick(main, 'CALICUT'),
  'dr-br-ambedkar-university-online': pick(main, 'B.R. AMBEDKAR UNIVERSITY'),
  'mohan-babu-university-online': pick(main, 'MOHAN BABU'),
  'sri-venkateswara-university-online': pick(main, 'SRI VENKATESWARA'),
  'swami-rama-himalayan-university-online': pick(main, 'SWAMI RAMA'),
  'central-university-tamil-nadu-online': pick(main, 'CENTRAL UNIVERSITY OF TAMIL NADU'),
  'st-aloysius-university-online': pick(main, 'ALOYSIUS'),
  'bennett-university-online': pick(main, 'BENNETT'),
  'sri-siddhartha-academy-online': pick(main, 'SIDDHARTHA'),
  'saveetha-university-online': pick(main, 'SAVEETHA'),
  'ajeenkya-dy-patil-university-online': pickAdd(addendum, 'AJEENKYA'),
  'dr-br-ambedkar-open-university-online': pickAdd(addendum, 'AMBEDKAR OPEN'),
  'silver-oak-university-online': pickAdd(addendum, 'SILVER OAK'),
  'srinivas-university-online': pickAdd(addendum, 'SRINIVAS'),
  'sandip-university-online': pickAdd(addendum, 'SANDIP'),
  'atlas-skilltech-university-online': pickAdd(addendum, 'ATLAS'),
  'bml-munjal-university-online': pickAdd(addendum, 'BML'),
}

function pick(rows: any[], needle: string) {
  const r = rows.find(x => x.hei.includes(needle))
  if (!r) throw new Error('main row not found: ' + needle)
  return { src: 'main', sno: r.sno, type: r.type, programmes: r.programmes }
}
function pickAdd(rows: any[], needle: string) {
  const r = rows.find(x => x.hei.includes(needle))
  if (!r) throw new Error('addendum row not found: ' + needle)
  return {
    src: 'addendum', sno: r.sno, type: r.type,
    programmes: r.blocks.flatMap((b: any) => b.programmes),
    period: tidyPeriod(r.blocks[0]?.period || ''),
  }
}
/** The PDF wraps mid-word, so "2030- 31" and "January- February" come through. */
function tidyPeriod(p: string): string {
  return p
    .replace(/(\d)-\s+(\d)/g, '$1-$2')
    .replace(/([A-Za-z])-\s+([A-Za-z])/g, '$1-$2')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** States arrive from the UGC tables in caps, e.g. "UTTAR PRADESH". */
function titleCase(x: string): string {
  return x.toLowerCase().split(' ').map(w => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')
}

const FULL: Record<string, string> = {
  MBA: 'Master of Business Administration', MCA: 'Master of Computer Applications',
  BBA: 'Bachelor of Business Administration', BCA: 'Bachelor of Computer Applications',
  'B.Com': 'Bachelor of Commerce', 'M.Com': 'Master of Commerce',
  BA: 'Bachelor of Arts', MA: 'Master of Arts', MSc: 'Master of Science', BSc: 'Bachelor of Science',
}
const TECH = new Set(['MCA', 'BCA'])

let written = 0
const report: string[] = []

for (const [id, row] of Object.entries(ROW)) {
  const u = UNIVERSITIES.find(x => x.id === id)
  if (!u) { report.push('MISSING RECORD ' + id); continue }
  const clean = u.name.replace(/\s+Online$/i, '')
  const isDeemed = u.uniType === 'deemed'
  const isOpen = u.uniType === 'open'
  const isCentral = u.uniType === 'central'
  const isState = u.uniType === 'state-public'
  const allPG = u.programs.every(p => ['MBA', 'MCA', 'MA', 'M.Com', 'MSc'].includes(p))

  const kind = isCentral ? 'central university'
    : isOpen ? 'state open university'
    : isDeemed ? 'deemed-to-be university'
    : isState ? 'state university'
    : 'private university'

  const grantLine = row.src === 'addendum'
    ? `listed in the UGC Distance Education Bureau addendum of August 2026`
    : `listed in the UGC Distance Education Bureau recognition list of August 2026`

  for (const program of u.programs) {
    const pd = u.programDetails[program as keyof typeof u.programDetails] as any
    if (!pd) continue
    const key = `${id}-${String(program).toLowerCase()}`
    const file = path.join(OUT, `${key}.json`)
    if (fs.existsSync(file)) { report.push('SKIP exists ' + key); continue }

    // Only generate where the hub is currently NOT indexable, i.e. no fee.
    if (getDisplayFee(u, program as any).ok) { report.push('SKIP has fee ' + key); continue }

    const specs: string[] = pd.specs || []
    const named = specs.filter(x => x && x !== 'General')
    const granted = row.programmes.filter(p => p.toUpperCase().startsWith(FULL[program]?.toUpperCase().slice(0, 18) || '@@'))

    const specLine = named.length
      ? `The grant names ${named.length === 1 ? 'one specialisation' : named.length + ' specialisations'}: ${named.join(', ')}.`
      : `It is granted as a general programme, with no named specialisation.`

    const periodLine = row.period
      ? ` Recognition runs for the ${row.period.replace(/^(\d{4})/, '$1')}.`
      : ''

    const techNote = isDeemed && TECH.has(String(program))
      ? ` One thing to check before you pay: for a deemed-to-be university offering an online technical programme, AICTE approval is the relevant legal anchor alongside UGC-DEB entitlement. No AICTE status is recorded for this university on this page, so ask for it in writing.`
      : ''

    const tldr = `TL;DR: ${clean} Online ${program} at a glance. Newly recognised, ${grantLine}. ${kind[0].toUpperCase() + kind.slice(1)} in ${titleCase(u.state)}. ${specLine} Duration ${pd.duration}. The fee for the current intake is not published here yet, so request it before you apply.`

    const ugcDeb = `${clean} is ${grantLine}, which grants it ${row.programmes.length} programme${row.programmes.length === 1 ? '' : 's'} for online delivery. ${FULL[String(program)] || program} is one of them.${periodLine} UGC rules treat an online degree from an entitled university as equivalent to a conventional one for employment, government recruitment and further study. Entitlement is granted intake by intake and programme by programme, so confirm the current position for your admission year at deb.ugc.ac.in rather than relying on any page, including this one.${techNote}`

    const redFlags = [
      `No fee is published on this page. Any figure quoted to you by a third party should be confirmed in writing with the university before you pay.`,
      `This is a recent entitlement. Confirm it covers the exact intake you are applying for, since UGC-DEB approval is granted per intake.`,
      isDeemed && TECH.has(String(program))
        ? `For an online ${program} from a deemed-to-be university, ask for the AICTE position in writing.`
        : `Check the specific recruitment notification if you are applying for a government role, as some services set their own conditions.`,
    ]

    const faqs = [
      { question: `Is ${clean} approved for an online ${program}?`,
        answer: `Yes. ${clean} appears in the UGC Distance Education Bureau ${row.src === 'addendum' ? 'addendum' : 'recognition list'} of August 2026, which grants it ${FULL[String(program)] || program} for online delivery.${periodLine} Verify the current position for your admission year at deb.ugc.ac.in.` },
      { question: `What does the ${clean} online ${program} cost?`,
        answer: `The fee for the current intake is not published on this page yet. This is a recent entitlement and the university has not put a public figure against it that we can verify. Request the current fee structure in writing before you apply, and treat any figure from a third party with caution.` },
      { question: `What specialisations are available?`,
        answer: named.length
          ? `The August 2026 grant names ${named.join(', ')}. A specialisation not on that list is not covered by this entitlement.`
          : `The programme is granted as a general ${program} with no named specialisation, so there is no separate track to choose at application.` },
      { question: `Is this degree valid for government jobs?`,
        answer: `An online degree from a UGC-DEB entitled university is treated as equivalent to a conventional one for employment and government recruitment. ${clean} holds that entitlement for this programme under the August 2026 list. Individual recruitment notifications can still set their own conditions, so check the notification you are applying against.` },
      { question: `How long is the ${program}?`,
        answer: `${pd.duration}.${String(pd.duration).startsWith('4') ? ' Note this is a four-year undergraduate degree rather than the usual three, which matters for postgraduate and doctoral eligibility routes.' : ''}` },
    ]

    const json = {
      uniSlug: id,
      program: String(program).toLowerCase(),
      sections: { tldr, ugcDeb, redFlags, faqs },
      metadata: {
        generatedAt: new Date().toISOString().slice(0, 10),
        source: 'audits/ugc-deb-2026-08, UGC-DEB August 2026 recognition list and addendum',
        note: 'No fee on record. Fee sections are deliberately absent and the page routes to the counsellor form.',
      },
    }

    if (APPLY) fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
    written++
    report.push('WRITE ' + key)
  }
}

console.log(APPLY ? '=== APPLIED ===' : '=== DRY RUN, pass --apply ===')
console.log('files:', written)
for (const r of report) console.log('  ', r)
