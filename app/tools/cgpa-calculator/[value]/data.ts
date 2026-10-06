// CGPA value page data. Each entry is a unique CGPA number that earns its
// own pre-rendered URL at /tools/cgpa-calculator/{slug}.
//
// Formula: percentage = CGPA * 9.5 (UGC, 10-point scale).
// All percentage strings are pre-rounded to 2 decimals at build time so the
// runtime page is a pure static render with no client math.
//
// Tier mapping (online MBA eligibility, India 2026):
//   below-50    percentage  < 50.00   not eligible for most online MBAs
//   tier-50-60  50.00 - 59.99         Galgotias, Sharda, LPU and similar
//   tier-60-70  60.00 - 69.99         NMIMS, Symbiosis, MAHE
//   tier-70+    70.00 and above       all top-tier programmes plus scholarships

export type CgpaTier = 'below-50' | 'tier-50-60' | 'tier-60-70' | 'tier-70+'

export interface CgpaValueEntry {
  /** URL slug fragment, e.g. "7-5-cgpa-percentage" */
  slug: string
  /** Numeric CGPA value, e.g. 7.5 */
  cgpa: number
  /** Display label for H1 and copy, e.g. "7.5" or "8" */
  label: string
  /** Percentage as a 2-decimal string, e.g. "71.25" */
  percentage: string
  /** Mumbai University engineering 7-point formula result */
  mumbaiPct: string
  /** Tier label for eligibility copy */
  tier: CgpaTier
}

function mumbai(cgpa: number): string {
  // Mumbai University engineering formula: pct = (CGPA * 7.1) + 11
  return ((cgpa * 7.1) + 11).toFixed(2)
}

function tierFor(pct: number): CgpaTier {
  if (pct < 50) return 'below-50'
  if (pct < 60) return 'tier-50-60'
  if (pct < 70) return 'tier-60-70'
  return 'tier-70+'
}

// Pre-computed entries. Order matches the 26 unique values after dedup of
// gpa/cgpa duplicate-slug variants from the source list.
function build(cgpa: number, label: string, slug: string, pct: string): CgpaValueEntry {
  const pctNum = parseFloat(pct)
  return {
    slug,
    cgpa,
    label,
    percentage: pct,
    mumbaiPct: mumbai(cgpa),
    tier: tierFor(pctNum),
  }
}

export const CGPA_VALUES: CgpaValueEntry[] = [
  build(7.5,  '7.5',  '7-5-cgpa-percentage',  '71.25'),
  build(8.5,  '8.5',  '8-5-cgpa-percentage',  '80.75'),
  build(6.5,  '6.5',  '6-5-cgpa-percentage',  '61.75'),
  build(7.8,  '7.8',  '7-8-cgpa-percentage',  '74.10'),
  build(7.9,  '7.9',  '7-9-cgpa-percentage',  '75.05'),
  build(9.4,  '9.4',  '9-4-cgpa-percentage',  '89.30'),
  build(6.2,  '6.2',  '6-2-cgpa-percentage',  '58.90'),
  build(8.75, '8.75', '8-75-cgpa-percentage', '83.13'),
  build(6.3,  '6.3',  '6-3-cgpa-percentage',  '59.85'),
  build(6,    '6',    '6-cgpa-percentage',    '57.00'),
  build(8,    '8',    '8-cgpa-percentage',    '76.00'),
  build(6.32, '6.32', '6-32-cgpa-percentage', '60.04'),
  build(8.25, '8.25', '8-25-cgpa-percentage', '78.38'),
  build(6.25, '6.25', '6-25-cgpa-percentage', '59.38'),
  build(8.2,  '8.2',  '8-2-cgpa-percentage',  '77.90'),
  build(5.2,  '5.2',  '5-2-cgpa-percentage',  '49.40'),
  build(7.75, '7.75', '7-75-cgpa-percentage', '73.63'),
  build(6.87, '6.87', '6-87-cgpa-percentage', '65.27'),
  build(9.5,  '9.5',  '9-5-cgpa-percentage',  '90.25'),
  build(7.44, '7.44', '7-44-cgpa-percentage', '70.68'),
  build(7.55, '7.55', '7-55-cgpa-percentage', '71.73'),
  build(9,    '9',    '9-cgpa-percentage',    '85.50'),
  build(9.8,  '9.8',  '9-8-cgpa-percentage',  '93.10'),
  build(7,    '7',    '7-cgpa-percentage',    '66.50'),
  build(8.17, '8.17', '8-17-cgpa-percentage', '77.62'),
  build(7.45, '7.45', '7-45-cgpa-percentage', '70.78'),
]

export function getEntryBySlug(slug: string): CgpaValueEntry | undefined {
  return CGPA_VALUES.find(e => e.slug === slug)
}

// TIER_COPY lived here until 2026-10-06. It told readers that NMIMS, Symbiosis
// and MAHE require 60%, that scholarship slabs start at 70%, and that a 70%
// score earns fee waivers and entrance-test exemptions, across all 26 pages.
// lib/data.ts has none of it: of the online MBA universities that publish a
// graduation minimum, all but one state 50% and the exception states 40%.
// The copy is now derived in ./eligibility.ts so it tracks the data.
