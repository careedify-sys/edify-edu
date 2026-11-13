// lib/first-hand.ts
//
// Turns a lib/data/first-hand/ file into what the pages render. Server-side:
// it reads lib/data.ts and lib/data/ugc-deb-extract.json, so amounts, NAAC and
// NIRF come from data, never from the copy.
//
// resolveFirstHand() throws, and so fails the build, when
//   - a {{token}} has no value in lib/data.ts, so a page never shows "{{x}}";
//   - the NIRF ranks in lib/data.ts disagree with the UGC file's NIRF columns.

import type { University } from './data'
import { getFirstHand, type FirstHandUniversity } from './data/first-hand'
import { getDisplayFee } from './fees'
import ugcExtract from './data/ugc-deb-extract.json'

export interface ApprovalRow {
  body: string
  holds: string
  /** Programme list for the UGC-DEB row. */
  programmes?: { name: string; notice: string; period: string }[]
  source: string
  link?: { href: string; label: string }
}

export interface ResolvedFirstHand extends Omit<FirstHandUniversity, 'approvals'> {
  approvals: ApprovalRow[]
  /** "13 November 2026" */
  reviewedOnText: string
  universitySaysCheckedOnText: string
  /** getDisplayFee range for the MBA, or null when suppressed. */
  mbaFee: string | null
}

type Extract = {
  universityName: string
  state: string
  programmes: { name: string; category: string; notice: string; period: string }[]
  naac: { grade: string; cgpa: number | null; declaredOn: string | null } | null
  nirf: { overall: number | null; university: number | null; management: number | null }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const longDate = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) throw new Error(`first-hand: bad date ${iso}`)
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`
}
const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

function tokenValues(u: University): Record<string, string | undefined> {
  const plan = u.feePlans?.mba?.find(p => !p.specs?.length)
  const sem = plan?.rows.find(r => /semester/i.test(r.mode))?.instalment
  const initial = u.admissionPayments?.initial?.amount
  const processing = plan?.extras?.find(e => /admission processing/i.test(e.label))?.amount
  return {
    registration: u.admissionPayments?.registration ? rupees(u.admissionPayments.registration.amount) : undefined,
    initial: initial != null ? rupees(initial) : undefined,
    admissionProcessing: processing != null ? rupees(processing) : undefined,
    semester1Balance: sem != null && initial != null ? rupees(sem - initial) : undefined,
  }
}

function fillTokens<T>(value: T, vals: Record<string, string | undefined>, id: string): T {
  if (typeof value === 'string') {
    return value.replace(/\{\{(\w+)\}\}/g, (_m, k: string) => {
      const v = vals[k]
      if (!v) throw new Error(`first-hand ${id}: {{${k}}} has no value in lib/data.ts`)
      return v
    }) as T
  }
  if (Array.isArray(value)) return value.map(v => fillTokens(v, vals, id)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillTokens(v, vals, id)])) as T
  }
  return value
}

const DEB = { href: 'https://deb.ugc.ac.in', label: 'deb.ugc.ac.in' }
const NAAC = { href: 'https://naac.gov.in', label: 'naac.gov.in' }
const NIRF = { href: 'https://www.nirfindia.org', label: 'nirfindia.org' }
const LINKS: Record<string, { href: string; label: string }> = { 'deb.ugc.ac.in': DEB, 'naac.gov.in': NAAC, 'nirfindia.org': NIRF }

function approvalRows(u: University, fh: FirstHandUniversity): ApprovalRow[] {
  const ex = (ugcExtract as Record<string, Extract>)[u.id]
  return fh.approvals.map(a => {
    switch (a.kind) {
      case 'ugc-deb': {
        if (!ex) throw new Error(`first-hand ${u.id}: no UGC-DEB rows. Add it to scripts/build-ugc-deb-extract.mjs`)
        return {
          body: 'UGC-DEB',
          holds: a.holds ?? `${ex.programmes.length} online programmes listed under ${ex.universityName}, ${ex.state}:`,
          programmes: ex.programmes.map(p => ({ name: p.name, notice: p.notice, period: p.period })),
          source: 'UGC-DEB online programme list, AY 2025-26',
          link: DEB,
        }
      }
      case 'naac': {
        const fromFile = ex?.naac
        if (fromFile && fromFile.grade !== u.naac) {
          throw new Error(`first-hand ${u.id}: NAAC ${u.naac} in lib/data.ts, ${fromFile.grade} in the UGC file`)
        }
        const detail = fromFile?.cgpa != null && fromFile.declaredOn ? ` (CGPA ${fromFile.cgpa}, declared ${longDate(fromFile.declaredOn)})` : ''
        return { body: 'NAAC', holds: `NAAC ${u.naac}${detail}`, source: 'NAAC record', link: NAAC }
      }
      case 'nirf': {
        const n = ex?.nirf
        if (!n) throw new Error(`first-hand ${u.id}: no NIRF columns in the UGC file`)
        if (n.university !== u.nirf || (u.nirfMgt != null && n.management !== u.nirfMgt)) {
          throw new Error(`first-hand ${u.id}: NIRF in lib/data.ts (University ${u.nirf}, Management ${u.nirfMgt}) disagrees with the UGC file (University ${n.university}, Management ${n.management})`)
        }
        const parts = [
          n.university != null ? `University #${n.university}` : null,
          n.management != null ? `Management #${n.management}` : null,
          n.overall != null ? `Overall #${n.overall}` : null,
        ].filter(Boolean)
        return { body: a.body, holds: parts.join(', '), source: 'NIRF India Rankings 2025', link: NIRF }
      }
      case 'text':
        return {
          body: a.body,
          holds: a.holds,
          source: a.source ?? '',
          link: a.link ? (LINKS[a.link] ?? (a.link.startsWith('/') ? { href: a.link, label: a.link } : undefined)) : undefined,
        }
    }
  })
}

/** Everything the first-hand sections render for u, or undefined when u has no first-hand file. */
export function resolveFirstHand(u: University): ResolvedFirstHand | undefined {
  const raw = getFirstHand(u.id)
  if (!raw) return undefined
  const fh = fillTokens(raw, tokenValues(u), u.id)
  const fee = getDisplayFee(u, 'MBA')
  return {
    ...fh,
    approvals: approvalRows(u, fh),
    reviewedOnText: longDate(fh.reviewedOn),
    universitySaysCheckedOnText: longDate(fh.placements.universitySaysCheckedOn),
    mbaFee: fee.ok ? fee.range ?? null : null,
  }
}

export { stripLinks } from './link-markup'

/**
 * Fee tokens in page-content JSON strings, filled from University.feePlans:
 *   {{fee:mba/standard/one-time}}  total of the row whose mode matches "one-time"
 *   {{fee:mba/premium/semester}}   total of the premium plan's semester row
 * Throws on a token with no value, so an unfilled token cannot ship.
 */
export function fillFeeTokens(text: string, u: University): string {
  return text.replace(/\{\{fee:(\w+)\/([\w-]+)\/([\w-]+)\}\}/g, (_m, prog: string, planId: string, mode: string) => {
    const plan = u.feePlans?.[prog as 'mba']?.find(p => p.id === planId)
    const row = plan?.rows.find(r => r.mode.toLowerCase().replace(/\s+/g, '-').includes(mode))
    if (row?.total == null) throw new Error(`page-content ${u.id}: {{fee:${prog}/${planId}/${mode}}} has no value in lib/data.ts`)
    return rupees(row.total)
  })
}
