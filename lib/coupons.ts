// lib/coupons.ts — Per-university enrollment-bonus catalogue.
//
// Bonus tiers (all amounts in INR, paid as fee adjustment at enrollment via edifyedu.in):
//   premium  → Rs 7,500 on Tue/Sat (IST), Rs 5,000 on other days
//   standard → Rs 5,000 on Tue/Sat (IST), Rs 4,000 on other days
//   budget   → Rs 4,000 on Tue/Sat (IST), Rs 3,000 on other days
//
// The Tue/Sat "max window" creates a recurring scarcity signal across the
// /coupons hub and per-university pages. getTodaysBonus(tier) is the single
// source of truth for the live amount — never hard-code Rs 10,000 anywhere.

export type Tier = 'premium' | 'standard' | 'budget'

export type Coupon = {
  code: string
  university: string
  universityId: string
  discount: number
  program: 'MBA' | 'MCA' | 'All'
  tier: Tier
  savings: string
  expiry: string
  featured: boolean
}

export const TIER_AMOUNTS: Record<Tier, { max: number; base: number }> = {
  premium:  { max: 7500, base: 5000 },
  standard: { max: 5000, base: 4000 },
  budget:   { max: 4000, base: 3000 },
}

export const TIER_SAVINGS_LABEL: Record<Tier, string> = {
  premium:  'edifyedu.in Enrollment Bonus: up to Rs 7,500 (Tue/Sat)',
  standard: 'edifyedu.in Enrollment Bonus: up to Rs 5,000 (Tue/Sat)',
  budget:   'edifyedu.in Enrollment Bonus: up to Rs 4,000 (Tue/Sat)',
}

export const COUPONS: Coupon[] = [
  // ── MBA / All ──────────────────────────────────────────────────────────────
  {
    code: 'AMTY2026-5K',
    university: 'Amity University Online',
    universityId: 'amity-university-online',
    discount: 10,
    program: 'MBA',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'JAIN2026-5K',
    university: 'JAIN Online',
    universityId: 'jain-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'CU2026-5K',
    university: 'Chandigarh University Online',
    universityId: 'chandigarh-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'LPU2026-5K',
    university: 'LPU Online',
    universityId: 'lovely-professional-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'MUJ2026-4K',
    university: 'Manipal MUJ Online',
    universityId: 'manipal-university-jaipur-online',
    discount: 10,
    program: 'MBA',
    tier: 'budget',
    savings: TIER_SAVINGS_LABEL.budget,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'NMIMS2026-5K',
    university: 'NMIMS Online',
    universityId: 'nmims-online',
    discount: 10,
    program: 'MBA',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'SYMB2026-7500',
    university: 'Symbiosis SSODL',
    universityId: 'symbiosis-university-online',
    discount: 10,
    program: 'MBA',
    tier: 'premium',
    savings: TIER_SAVINGS_LABEL.premium,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'UPES2026-5K',
    university: 'UPES Online',
    universityId: 'upes-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'SMU2026-4K',
    university: 'Sikkim Manipal University Online',
    universityId: 'sikkim-manipal-university-online',
    discount: 10,
    program: 'All',
    tier: 'budget',
    savings: TIER_SAVINGS_LABEL.budget,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'AMR2026-5K',
    university: 'Amrita Online',
    universityId: 'amrita-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'SHAR2026-5K',
    university: 'Sharda University Online',
    universityId: 'sharda-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'GALG2026-5K',
    university: 'Galgotias University Online',
    universityId: 'galgotias-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'BVP2026-5K',
    university: 'Bharati Vidyapeeth Online',
    universityId: 'bharati-vidyapeeth-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  // ── MCA ───────────────────────────────────────────────────────────────────
  {
    code: 'AMTYMCA2026-5K',
    university: 'Amity University Online',
    universityId: 'amity-university-online',
    discount: 10,
    program: 'MCA',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'JAINMCA2026-5K',
    university: 'JAIN Online',
    universityId: 'jain-university-online',
    discount: 10,
    program: 'MCA',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'LPUMCA2026-5K',
    university: 'LPU Online',
    universityId: 'lovely-professional-university-online',
    discount: 10,
    program: 'MCA',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'MUJMCA2026-4K',
    university: 'Manipal MUJ Online',
    universityId: 'manipal-university-jaipur-online',
    discount: 10,
    program: 'MCA',
    tier: 'budget',
    savings: TIER_SAVINGS_LABEL.budget,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'CUMCA2026-5K',
    university: 'Chandigarh University Online',
    universityId: 'chandigarh-university-online',
    discount: 10,
    program: 'MCA',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  // ── New universities ──────────────────────────────────────────────────────
  {
    code: 'SHO2026-5K',
    university: 'Shoolini University Online',
    universityId: 'shoolini-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'DSU2026-5K',
    university: 'Dayananda Sagar University Online',
    universityId: 'dayananda-sagar-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'UTT2026-5K',
    university: 'Uttaranchal University Online',
    universityId: 'uttaranchal-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'VIT2026-5K',
    university: 'VIT Vellore Online',
    universityId: 'vit-vellore-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'KLU2026-5K',
    university: 'KL University Online',
    universityId: 'kl-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'GE2026-5K',
    university: 'Graphic Era University Online',
    universityId: 'graphic-era-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'PRL2026-5K',
    university: 'Parul University Online',
    universityId: 'parul-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'CHR2026-5K',
    university: 'Christ University Online',
    universityId: 'christ-university-online',
    discount: 10,
    program: 'All',
    tier: 'standard',
    savings: TIER_SAVINGS_LABEL.standard,
    expiry: 'rolling',
    featured: false,
  },
]

/** Rolling expiry: always 30 days from now. Displays as "Valid till [date]" */
export function getExpiryDisplay(coupon: Coupon): string {
  if (coupon.expiry === 'rolling') {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return coupon.expiry
}

/** ISO date for schema (rolling = +30 days) */
export function getExpiryISO(coupon: Coupon): string {
  if (coupon.expiry === 'rolling') {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }
  return new Date(coupon.expiry).toISOString().split('T')[0]
}

/** Partially visible code for SEO indexing: "AMTY-••••" */
export function getMaskedCode(code: string): string {
  const half = Math.ceil(code.length * 0.6)
  return code.slice(0, half) + '••••'
}

export function getCouponByCode(code: string): Coupon | null {
  return COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase()) ?? null
}

export function getCouponsByProgram(program: string): Coupon[] {
  if (program === 'All') return COUPONS
  return COUPONS.filter(c => c.program === program || c.program === 'All')
}

/**
 * Live bonus amount for a given tier, evaluated against the current day in
 * Asia/Kolkata (IST). Tuesday and Saturday unlock the tier's "max" amount;
 * every other day pays the "base" amount.
 *
 * Returns:
 *   amount       — INR value currently active for this tier
 *   isMaxWindow  — true on Tue/Sat IST (max amount in effect today)
 *   nextMaxAt    — UTC ISO timestamp of the next IST midnight that opens a max window
 *
 * IST has no DST and is a fixed UTC+5:30 offset, so we can do the arithmetic
 * with a constant offset rather than a tz library. We pull the current IST
 * date components via Intl.DateTimeFormat for stable behaviour on the server
 * and in any browser locale.
 */
export function getTodaysBonus(tier: Tier): { amount: number; isMaxWindow: boolean; nextMaxAt: string } {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(now).reduce<Record<string, string>>((acc, p) => {
    acc[p.type] = p.value
    return acc
  }, {})
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const day = dayMap[parts.weekday] ?? 0
  const isMaxWindow = day === 2 || day === 6

  const t = TIER_AMOUNTS[tier]
  const amount = isMaxWindow ? t.max : t.base

  // Days until the next max-window opens. If today is already a max day, the
  // next *opening* is the following Tue or Sat (so the countdown to the next
  // unlock is always strictly positive).
  let daysAhead = 7
  for (let d = 1; d <= 7; d++) {
    const next = (day + d) % 7
    if (next === 2 || next === 6) {
      daysAhead = d
      break
    }
  }

  // IST midnight = UTC of that same calendar date at -5:30 hours.
  const istY = parseInt(parts.year, 10)
  const istMo = parseInt(parts.month, 10) - 1
  const istD = parseInt(parts.day, 10)
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  const todayIstMidnightUtcMs = Date.UTC(istY, istMo, istD, 0, 0, 0) - IST_OFFSET_MS
  const targetMs = todayIstMidnightUtcMs + daysAhead * 24 * 60 * 60 * 1000
  return { amount, isMaxWindow, nextMaxAt: new Date(targetMs).toISOString() }
}

/** Group coupons by intent-based sections */
export function getCouponSections() {
  const top5Ids = ['amity-university-online', 'nmims-online', 'manipal-university-jaipur-online', 'lovely-professional-university-online', 'chandigarh-university-online']
  const premiumIds = ['manipal-academy-higher-education-online', 'symbiosis-university-online', 'amrita-vishwa-vidyapeetham-online', 'jain-university-online', 'bits-pilani-online', 'dr-dy-patil-vidyapeeth-online']
  const mcaPrograms = COUPONS.filter(c => c.program === 'MCA')

  const top5 = COUPONS.filter(c => top5Ids.includes(c.universityId) && c.program !== 'MCA')
  const premium = COUPONS.filter(c => premiumIds.includes(c.universityId) && c.program !== 'MCA' && !top5Ids.includes(c.universityId))
  const usedIds = new Set([...top5.map(c => c.code), ...premium.map(c => c.code), ...mcaPrograms.map(c => c.code)])
  const budget = COUPONS.filter(c => !usedIds.has(c.code))

  return { top5, premium, budget, mca: mcaPrograms }
}
