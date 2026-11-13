// lib/fee-plans.ts
//
// Payment-mode fee tables, the fee peer table and the Manipal trio table.
// Added 2026-11-13 (AI-visibility round 1). Every AI answer we pulled states an
// online MBA fee as one row per payment mode (one-time, annual, semester, EMI)
// plus the extra charges, and our pages printed a single range with a typed
// date that disagreed with the next page. These builders read lib/data.ts only:
// University.feePlans for the rows and FeePlan.checkedOn for the one date a
// fee table may print. No figure is typed here.
//
// Each builder returns an HTML string, so the same output can be spliced into
// a blog post body (app/blog/[slug]/page.tsx expands data-edify markers) and
// rendered by a server component (components/FeePlanTable.tsx). One source,
// one format.

import { UNIVERSITIES, getUniversityById, SCDL_PGDBA, type FeePlan, type University, type Program } from './data'
import { getDisplayFee } from './fees'

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** '2026-11-13' -> '13 November 2026'. null for anything that is not a date. */
export function formatIsoDate(iso: string | undefined | null): string | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const planKey = (program: Program | string) => program.toLowerCase().replace(/\./g, '') as 'mba'

/**
 * The plans to show. On a specialisation page: the track that names the slug,
 * else the default track (the first with no specs, which excludes NMIMS's WX
 * track because it is listed second). On a hub or review: every track.
 */
export function getFeePlans(u: University, program: Program | string = 'MBA', spec?: string): FeePlan[] {
  const plans = u.feePlans?.[planKey(program)] ?? []
  if (!plans.length) return []
  if (!spec) return plans
  const own = plans.filter(p => p.specs?.includes(spec))
  if (own.length) return own
  const dflt = plans.find(p => !p.specs?.length)
  return dflt ? [dflt] : []
}

/** ISO date the fees were checked, from the default track. null when undated. */
export function feeCheckedOn(u: University, program: Program | string = 'MBA'): string | null {
  const p = getFeePlans(u, program)[0]
  return p?.checkedOn && formatIsoDate(p.checkedOn) ? p.checkedOn : null
}

export const COUNSELLOR_FEE_LINE = 'Talk to our counsellor for your intake’s fee.'

function checkedLine(iso: string): string {
  return `<p class="fee-checked" style="margin:0 0 8px;font-size:13px;color:#64748b"><strong style="color:#0f172a">Fees checked on ${formatIsoDate(iso)}.</strong> ${COUNSELLOR_FEE_LINE}</p>`
}

const TABLE = 'width:100%;border-collapse:collapse;font-size:14px;margin:0 0 8px'
const TH = 'text-align:left;padding:8px 10px;background:#0f172a;color:#fff;font-weight:600'
const TD = 'padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top'

function planTable(u: University, plan: FeePlan, heading: string | null): string {
  const hasInst = plan.rows.some(r => r.instalment)
  const hasDisc = plan.rows.some(r => r.discounted != null)
  const head = [
    '<th style="' + TH + '">Payment mode</th>',
    hasInst ? '<th style="' + TH + '">Instalment</th>' : '',
    '<th style="' + TH + '">Total</th>',
    hasDisc ? `<th style="${TH}">${esc(plan.discountLabel ?? 'After discount')}</th>` : '',
  ].join('')
  const body = plan.rows.map(r => {
    const inst = r.instalment ? `${rupees(r.instalment)}${r.count ? ` × ${r.count}` : ''}` : ''
    return '<tr>' +
      `<td style="${TD}">${esc(r.mode)}</td>` +
      (hasInst ? `<td style="${TD}">${inst}</td>` : '') +
      `<td style="${TD};font-weight:600">${r.total != null ? rupees(r.total) : 'Not published'}</td>` +
      (hasDisc ? `<td style="${TD}">${r.discounted != null ? rupees(r.discounted) : ''}</td>` : '') +
      '</tr>'
  }).join('')
  const extras = plan.extras?.length
    ? `<p style="margin:0 0 4px;font-size:13px;color:#334155"><strong>Extra charges:</strong> ${plan.extras.map(e => `${esc(e.label)} ${rupees(e.amount)}${e.per ? ` ${esc(e.per)}` : ''}`).join('; ')}.</p>`
    : ''
  const notes = (plan.notes ?? []).map(n => `<p style="margin:0 0 4px;font-size:13px;color:#334155">${esc(n)}</p>`).join('')
  const list = plan.list && !plan.rows.some(r => r.total === plan.list)
    ? `<p style="margin:0 0 4px;font-size:13px;color:#334155">List fee: ${rupees(plan.list)}.</p>`
    : ''
  return (heading ? `<h3 style="margin:16px 0 6px;font-size:16px;color:#0f172a">${esc(heading)}</h3>` : '') +
    checkedLine(plan.checkedOn) +
    `<div style="overflow-x:auto"><table style="${TABLE}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>` +
    list + extras + notes
}

/**
 * The payment-mode fee table for one university and programme. '' when the
 * university has no fee plan on record, so the caller keeps its own fallback.
 */
export function feePlanTableHtml(u: University, program: Program | string = 'MBA', opts: { spec?: string; title?: string } = {}): string {
  const plans = getFeePlans(u, program, opts.spec)
  if (!plans.length) return ''
  const many = plans.length > 1
  const name = shortName(u)
  const title = opts.title ?? `${name} ${program} fees by payment mode`
  return `<div class="fee-plan-table" data-uni="${esc(u.id)}" style="margin:16px 0">` +
    (title ? `<p style="margin:0 0 6px;font-weight:700;font-size:15px;color:#0f172a">${esc(title)}</p>` : '') +
    plans.map(p => planTable(u, p, many ? p.label : null)).join('') +
    '</div>'
}

export function shortName(u: University): string {
  const SHORT: Record<string, string> = {
    'nmims-online': 'NMIMS',
    'manipal-university-jaipur-online': 'MUJ',
    'sikkim-manipal-university-online': 'SMU',
    'manipal-academy-higher-education-online': 'MAHE',
    'amity-university-online': 'Amity',
    'symbiosis-university-online': 'Symbiosis (SSODL)',
    'bharati-vidyapeeth-university-online': 'Bharati Vidyapeeth',
  }
  return SHORT[u.id] ?? u.name.replace(/\s+Online$/, '')
}

// ── Peer table ──────────────────────────────────────────────────────────────

export const FEE_PEERS = [
  'nmims-online',
  'manipal-university-jaipur-online',
  'sikkim-manipal-university-online',
  'manipal-academy-higher-education-online',
  'amity-university-online',
  'symbiosis-university-online',
  'bharati-vidyapeeth-university-online',
] as const

function peerRow(u: University) {
  const plan = getFeePlans(u, 'MBA')[0]
  const shown = getDisplayFee(u, 'MBA').ok && plan
  if (!shown) return { oneTime: null as number | null, list: null as number | null, date: null as string | null }
  const oneTime = plan.rows.find(r => /one-time/i.test(r.mode))?.total ?? null
  const totals = plan.rows.map(r => r.total).filter((n): n is number => typeof n === 'number')
  const list = plan.list ?? (totals.length ? Math.max(...totals) : null)
  return { oneTime, list, date: plan.checkedOn }
}

/** "How {university} MBA fees compare": the fixed peer set, current row highlighted. */
export function peerFeeTableHtml(currentId: string): string {
  const current = getUniversityById(currentId)
  const rows = FEE_PEERS.map(id => getUniversityById(id)).filter((u): u is University => !!u).map(u => {
    const r = peerRow(u)
    const hi = u.id === currentId ? ';background:#fff7ed' : ''
    const cell = (v: number | null) => (v != null ? rupees(v) : 'Not published')
    return `<tr><td style="${TD}${hi}"><a href="/universities/${u.id}/mba">${esc(shortName(u))}</a></td>` +
      `<td style="${TD}${hi}">${cell(r.oneTime)}</td><td style="${TD}${hi}">${cell(r.list)}</td>` +
      `<td style="${TD}${hi}">${esc(String(u.naac || 'Not accredited'))}</td>` +
      `<td style="${TD}${hi}">${r.date ? formatIsoDate(r.date) : 'Talk to our counsellor'}</td></tr>`
  }).join('')
  const name = current ? shortName(current) : 'this'
  return `<div class="fee-peer-table" style="margin:16px 0">` +
    `<h3 style="margin:0 0 6px;font-size:17px;color:#0f172a">How ${esc(name)} MBA fees compare</h3>` +
    `<p style="margin:0 0 8px;font-size:13px;color:#64748b">Same programme, fixed peer set. One-time fee is shown only where the university publishes a one-time payment. ${COUNSELLOR_FEE_LINE}</p>` +
    `<div style="overflow-x:auto"><table style="${TABLE}"><thead><tr>` +
    `<th style="${TH}">University</th><th style="${TH}">One-time fee</th><th style="${TH}">Full list fee</th><th style="${TH}">NAAC</th><th style="${TH}">Fees checked</th>` +
    `</tr></thead><tbody>${rows}</tbody></table></div></div>`
}

// ── Manipal trio ────────────────────────────────────────────────────────────

const MANIPAL = ['manipal-academy-higher-education-online', 'manipal-university-jaipur-online', 'sikkim-manipal-university-online'] as const

/** One MAHE vs MUJ vs SMU table, every figure from lib/data.ts. */
export function manipalTrioHtml(): string {
  const rows = MANIPAL.map(id => getUniversityById(id)).filter((u): u is University => !!u).map(u => {
    const plan = getFeePlans(u, 'MBA')[0]
    const full = plan?.rows.find(r => r.total != null && !r.instalment)
    const sem = plan?.rows.find(r => /semester/i.test(r.mode) && r.instalment)
    const list = plan?.list ?? full?.total
    const disc = full?.discounted
    const suits = (u.forWho?.[0] ?? '').replace(/^./, c => c.toUpperCase())
    return `<tr><td style="${TD}"><a href="/universities/${u.id}/mba">${esc(shortName(u))}</a></td>` +
      `<td style="${TD}">${list ? rupees(list) : 'Talk to our counsellor'}</td>` +
      `<td style="${TD}">${disc ? `${rupees(disc)} (${esc((plan?.discountLabel ?? 'after discount').toLowerCase())})` : 'No discount on record'}</td>` +
      `<td style="${TD}">${sem?.instalment ? `${rupees(sem.instalment)}${sem.discounted && sem.count ? ` (${rupees(Math.round(sem.discounted / sem.count))} after discount)` : ''}` : 'Not confirmed'}</td>` +
      `<td style="${TD}">${esc(String(u.naac || ''))}</td>` +
      `<td style="${TD}">${esc(suits)}</td>` +
      `<td style="${TD}">${plan ? formatIsoDate(plan.checkedOn) : ''}</td></tr>`
  }).join('')
  return `<div class="manipal-trio-table" style="margin:16px 0">` +
    `<h3 style="margin:0 0 6px;font-size:17px;color:#0f172a">MAHE vs MUJ vs SMU online MBA</h3>` +
    `<p style="margin:0 0 8px;font-size:13px;color:#64748b">Three separate Manipal-group universities, three separate degrees. ${COUNSELLOR_FEE_LINE}</p>` +
    `<div style="overflow-x:auto"><table style="${TABLE}"><thead><tr>` +
    `<th style="${TH}">University</th><th style="${TH}">List fee</th><th style="${TH}">Fee after discount</th><th style="${TH}">Semester fee</th><th style="${TH}">NAAC</th><th style="${TH}">Who it suits</th><th style="${TH}">Fees checked</th>` +
    `</tr></thead><tbody>${rows}</tbody></table></div></div>`
}

// ── Answer-first blocks ─────────────────────────────────────────────────────

const ANSWER = 'margin:16px 0;padding:14px 16px;border-left:4px solid #f97316;background:#f1f5f9;border-radius:6px'

/** "Does Symbiosis offer a distance MBA? No." SCDL figures from SCDL_PGDBA. */
export function symbiosisDistanceAnswerHtml(): string {
  const s = SCDL_PGDBA
  return `<div class="answer-first" style="${ANSWER}">` +
    `<p style="margin:0 0 6px;font-weight:700;color:#0f172a">Does Symbiosis offer a distance MBA? No.</p>` +
    `<p style="margin:0 0 6px;color:#334155">The Symbiosis MBA degree is SSODL’s online MBA, which is UGC-DEB entitled. UGC-DEB Notice 1 (Jan 2026) lists Symbiosis International for online MBA, BBA, BCA, MA, M.Sc and B.Sc. See the list at <a href="https://deb.ugc.ac.in" rel="noopener" target="_blank">deb.ugc.ac.in</a>.</p>` +
    `<p style="margin:0;color:#334155">SCDL offers the PGDBA, a diploma that is AICTE-approved and not UGC-DEB entitled, at ${rupees(s.fee)} (${rupees(s.oneTime)} one-time) plus a ${rupees(s.application)} application fee, checked on ${formatIsoDate(s.checkedOn)}. SSODL and SCDL are separate Symbiosis institutions running separate programmes.</p>` +
    `</div>`
}

/** NMIMS runs no separate distance MBA. */
export function nmimsNoDistanceHtml(): string {
  return `<p class="answer-first" style="${ANSWER}"><strong>NMIMS does not run a separate distance MBA.</strong> Its MBA is offered online through NMIMS CDOE.</p>`
}

// ── Blog marker expansion ───────────────────────────────────────────────────

/**
 * Expands data-edify markers in a blog body:
 *   <div data-edify="fee-plans" data-uni="nmims-online" data-program="MBA" data-plan="wx"></div>
 *   <div data-edify="fee-peers" data-uni="nmims-online"></div>
 *   <div data-edify="manipal-trio"></div>
 *   <div data-edify="symbiosis-distance"></div>
 *   <div data-edify="nmims-no-distance"></div>
 * An unknown university or a missing plan expands to nothing.
 */
export function expandFeeMarkers(html: string): string {
  return html.replace(/<div data-edify="([\w-]+)"([^>]*)><\/div>/g, (_all, kind: string, attrs: string) => {
    const attr = (k: string) => attrs.match(new RegExp(`data-${k}="([^"]*)"`))?.[1]
    const u = attr('uni') ? getUniversityById(attr('uni')!) : undefined
    switch (kind) {
      case 'fee-plans': {
        if (!u) return ''
        const program = attr('program') ?? 'MBA'
        const only = attr('plan')
        if (only) {
          const plan = (u.feePlans?.[planKey(program)] ?? []).find(p => p.id === only)
          return plan ? `<div class="fee-plan-table" style="margin:16px 0">${planTable(u, plan, null)}</div>` : ''
        }
        return feePlanTableHtml(u, program, { spec: attr('spec') })
      }
      case 'fee-peers': return u ? peerFeeTableHtml(u.id) : ''
      case 'manipal-trio': return manipalTrioHtml()
      case 'symbiosis-distance': return symbiosisDistanceAnswerHtml()
      case 'nmims-no-distance': return nmimsNoDistanceHtml()
      default: return ''
    }
  })
}

// Exported for checks: every university with a dated plan.
export function universitiesWithFeePlans(): University[] {
  return UNIVERSITIES.filter(u => (u.feePlans?.mba ?? []).length > 0)
}
