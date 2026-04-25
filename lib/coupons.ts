export type Coupon = {
  code: string
  university: string
  universityId: string
  discount: number
  program: 'MBA' | 'MCA' | 'All'
  savings: string
  expiry: string
  featured: boolean
}

export const COUPONS: Coupon[] = [
  // ── MBA / All ──────────────────────────────────────────────────────────────
  {
    code: 'AMITY25',
    university: 'Amity University Online',
    universityId: 'amity-university-online',
    discount: 10,
    program: 'MBA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'JAIN20',
    university: 'JAIN Online',
    universityId: 'jain-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'CHANDIGARH15',
    university: 'Chandigarh University Online',
    universityId: 'chandigarh-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'LPU20',
    university: 'LPU Online',
    universityId: 'lovely-professional-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'MANIPAL20',
    university: 'Manipal MUJ Online',
    universityId: 'manipal-university-jaipur-online',
    discount: 10,
    program: 'MBA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'NMIMS15',
    university: 'NMIMS Online',
    universityId: 'nmims-online',
    discount: 10,
    program: 'MBA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'SYMBIOSIS20',
    university: 'Symbiosis SSODL',
    universityId: 'symbiosis-university-online',
    discount: 10,
    program: 'MBA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'UPES15',
    university: 'UPES Online',
    universityId: 'upes-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'SMU20',
    university: 'Sikkim Manipal University Online',
    universityId: 'sikkim-manipal-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'AMRITA15',
    university: 'Amrita Online',
    universityId: 'amrita-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'SHARDA20',
    university: 'Sharda University Online',
    universityId: 'sharda-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'GALGOTIAS15',
    university: 'Galgotias University Online',
    universityId: 'galgotias-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'BVP20',
    university: 'Bharati Vidyapeeth Online',
    universityId: 'bharati-vidyapeeth-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  // ── MCA ───────────────────────────────────────────────────────────────────
  {
    code: 'AMITYMCA20',
    university: 'Amity University Online',
    universityId: 'amity-university-online',
    discount: 10,
    program: 'MCA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: true,
  },
  {
    code: 'JAINMCA15',
    university: 'JAIN Online',
    universityId: 'jain-university-online',
    discount: 10,
    program: 'MCA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'LPUMCA20',
    university: 'LPU Online',
    universityId: 'lovely-professional-university-online',
    discount: 10,
    program: 'MCA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'MANIPALMCA15',
    university: 'Manipal MUJ Online',
    universityId: 'manipal-university-jaipur-online',
    discount: 10,
    program: 'MCA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'CUMCA20',
    university: 'Chandigarh University Online',
    universityId: 'chandigarh-university-online',
    discount: 10,
    program: 'MCA',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  // ── New universities ──────────────────────────────────────────────────────
  {
    code: 'SHOOLINI20',
    university: 'Shoolini University Online',
    universityId: 'shoolini-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'DSU15',
    university: 'Dayananda Sagar University Online',
    universityId: 'dayananda-sagar-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'UTTARANCHAL15',
    university: 'Uttaranchal University Online',
    universityId: 'uttaranchal-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'VIT20',
    university: 'VIT Vellore Online',
    universityId: 'vit-vellore-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'KLUNIV15',
    university: 'KL University Online',
    universityId: 'kl-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'GRAPHICERA15',
    university: 'Graphic Era University Online',
    universityId: 'graphic-era-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'PARUL20',
    university: 'Parul University Online',
    universityId: 'parul-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
    expiry: 'rolling',
    featured: false,
  },
  {
    code: 'CHRIST15',
    university: 'Christ University Online',
    universityId: 'christ-university-online',
    discount: 10,
    program: 'All',
    savings: 'EdifyEdu Bonus: up to ₹10,000',
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

/** Partially visible code for SEO indexing: "AMITY-••••" */
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
