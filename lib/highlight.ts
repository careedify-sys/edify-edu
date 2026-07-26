// Deterministic highlight-string generator for university cards.
// Reads live data fields (nirf, nirfMgt, naac, approvals, highlightExtra) and
// emits the display string. Prevents the drift class where hardcoded highlight
// strings fall out of sync with the underlying fields.
//
// Rule 2 (site-wide): never render 999 or any placeholder rank. If the field
// is 999 or missing, the rank simply drops from the output.
//
// Output order (all optional, dropped when absent):
//   [IoE] · [AACSB] · [NIRF rank] · [NAAC grade] · [WES] · [QS Ranked] · [extra]

import { NIRF_EDITION_YEAR } from './constants'

export interface HighlightInput {
  nirf?: number
  nirfMgt?: number
  naac?: string
  approvals?: string[]
  highlightExtra?: string
}

function approvalsHas(approvals: string[] | undefined, pattern: RegExp): boolean {
  if (!approvals) return false
  return approvals.some(a => pattern.test(a))
}

export function buildHighlight(u: HighlightInput): string {
  const parts: string[] = []

  // 1. Institutional-status tags (approvals-derived)
  if (approvalsHas(u.approvals, /\b(IoE|Institution of Eminence)\b/i)) parts.push('IoE')
  if (approvalsHas(u.approvals, /\bAACSB\b/i)) parts.push('AACSB')

  // 2. NIRF rank — Management preferred over University for MBA-facing surfaces
  //    Never render 999 or 0 (sentinels for "not currently ranked").
  const hasMgt = typeof u.nirfMgt === 'number' && u.nirfMgt > 0 && u.nirfMgt < 999
  const hasUni = typeof u.nirf === 'number' && u.nirf > 0 && u.nirf < 999
  if (hasMgt) {
    parts.push(`NIRF #${u.nirfMgt} Management ${NIRF_EDITION_YEAR}`)
  } else if (hasUni) {
    parts.push(`NIRF #${u.nirf} University ${NIRF_EDITION_YEAR}`)
  }

  // 3. NAAC grade
  if (u.naac) parts.push(`NAAC ${u.naac}`)

  // 4. International recognition tags (approvals-derived)
  if (approvalsHas(u.approvals, /\bWES\b/i)) parts.push('WES')
  if (approvalsHas(u.approvals, /\bQS\b/i)) parts.push('QS Ranked')

  // 5. Genuinely non-derivable thematic label (per-university override)
  if (u.highlightExtra) parts.push(u.highlightExtra)

  return parts.join(' · ')
}

// ── formatRank helper ────────────────────────────────────────────────────────
// Same Rule 2 guarantees as buildHighlight:
//   - Never emit 999 or any placeholder.
//   - Always label the category ('Management' | 'University') and the year.
//   - Pick the right category for context: Management on MBA / management
//     surfaces, University everywhere else.

export type RankPreference = 'management' | 'university' | 'auto'

export interface RankInput {
  nirf?: number
  nirfMgt?: number
}

export interface RankResult {
  /** 'Management' if nirfMgt was used, 'University' if nirf was used, null if unranked. */
  category: 'Management' | 'University' | null
  /** The numeric rank, or null when unranked. Never 999. */
  rank: number | null
  /** The NIRF edition year used for labelling. */
  year: number
  /** Display string, e.g. "NIRF #11 University 2025". Empty string when unranked. */
  label: string
  /** Short display string for tight spaces, e.g. "NIRF #11 Univ". */
  shortLabel: string
  /** Sort key; unranked always sorts last (9999). */
  sortKey: number
}

export function formatRank(u: RankInput, prefer: RankPreference = 'auto'): RankResult {
  const hasMgt = typeof u.nirfMgt === 'number' && u.nirfMgt > 0 && u.nirfMgt < 999
  const hasUni = typeof u.nirf === 'number' && u.nirf > 0 && u.nirf < 999

  let category: 'Management' | 'University' | null = null
  let rank: number | null = null

  if (prefer === 'management' || prefer === 'auto') {
    // Management first; fall back to University if no Management rank.
    if (hasMgt) { category = 'Management'; rank = u.nirfMgt! }
    else if (hasUni) { category = 'University'; rank = u.nirf! }
  } else if (prefer === 'university') {
    // University only; do not fall back to Management.
    if (hasUni) { category = 'University'; rank = u.nirf! }
  }

  const label = rank !== null ? `NIRF #${rank} ${category} ${NIRF_EDITION_YEAR}` : ''
  const short = category === 'Management' ? 'Mgt' : 'Univ'
  const shortLabel = rank !== null ? `NIRF #${rank} ${short}` : ''
  const sortKey = rank !== null ? rank : 9999

  return { category, rank, year: NIRF_EDITION_YEAR, label, shortLabel, sortKey }
}

/** Map a program name to the right rank preference. MBA / management → Management. */
export function preferForProgram(program: string | undefined): RankPreference {
  if (!program) return 'auto'
  const p = program.toLowerCase()
  if (p === 'mba' || p.includes('management')) return 'management'
  return 'university'
}
