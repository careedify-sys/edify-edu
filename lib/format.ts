/**
 * lib/format.ts
 * Deterministic formatting utilities to prevent React hydration mismatches.
 * Next.js SSR can produce different strings than the client browser if locales differ.
 */

/**
 * Formats a number according to the Indian numbering system (Lakhs/Crores).
 * Example: 150000 -> 1,50,000
 * @param n The number to format
 * @param includeSymbol Whether to prefix with ₹
 */
export function formatINR(n: number | string, includeSymbol: boolean = true): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '';

  const rounded = Math.round(num).toString();
  const lastThree = rounded.slice(-3);
  const otherNumbers = rounded.slice(0, -3);
  
  let formatted = lastThree;
  if (otherNumbers !== '') {
    // Group by 2 digits for the rest (Indian style)
    const grouped = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formatted = grouped + "," + lastThree;
  }

  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Formats a large number into Lacs/Crores for compact display.
 * Example: 150000 -> 1.5L
 */
export function formatCompactINR(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
}

/**
 * Cleans a careerOutcome string that may have been truncated at 40 chars during import,
 * leaving broken unclosed parentheses or en-dash fragments before "— recognised".
 * Examples fixed:
 *   "...Amrita Vishwa Vidyapeetham (Amrita — recognised..." → "...Amrita Vishwa Vidyapeetham — recognised..."
 *   "...(DSU) On — recognised..."                          → "...(DSU) — recognised..."
 *   "...— — recognised..."                                 → "...— recognised..."
 */
export function cleanCareerOutcome(text: string): string {
  if (!text) return text
  return text
    .replace(/—\s*—/g, '—')                                   // double em-dash → single
    .replace(/\s*[\(–][^—)]*—(\s*recognised)/g, ' —$1')       // unclosed paren or en-dash fragment before "recognised"
    .replace(/\)\s+\w+\s+—(\s*recognised)/g, ') —$1')         // closed paren + trailing word + dash (e.g. "(DSU) On —")
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Strips trailing "Online" / "(Online)" from a university display name so it can be
 * safely composed with " Online {Program}" without producing "Online Online".
 * Also strips "Deemed to be University", "Deemed University" parentheticals
 * that add no display value.
 */
export function formatUniversityDisplayName(name: string): string {
  if (!name) return ''
  return name
    .replace(/\s+Online\s*$/i, '')
    .replace(/\s+\(Online\)\s*$/i, '')
    .trim()
}

/**
 * Short university name for use in H1, H2, and breadcrumbs.
 * - Strips trailing " Online" (prevents "Online Online" when composing headings)
 * - When the result exceeds 50 chars, strips the first trailing parenthetical
 *   (e.g. "(Centre for Distance Education)" or "(Deemed to be University)")
 *   so headings don't break mid-parenthesis on small screens.
 */
export function getShortUniversityName(name: string): string {
  const clean = formatUniversityDisplayName(name)
  if (clean.length <= 50) return clean
  return clean.replace(/\s*\([^)]+\)\s*$/, '').trim()
}

/**
 * Formats common numbers with standard comma grouping (thousands).
 * Safe for hydration because it doesn't use system locale.
 */
export function formatNumber(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
