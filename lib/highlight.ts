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
