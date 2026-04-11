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
    discount: 25,
    program: 'MBA',
    savings: 'Save up to ₹30,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'JAIN20',
    university: 'JAIN Online',
    universityId: 'jain-university-online',
    discount: 20,
    program: 'All',
    savings: 'Save up to ₹20,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'CHANDIGARH15',
    university: 'Chandigarh University Online',
    universityId: 'chandigarh-university-online',
    discount: 15,
    program: 'All',
    savings: 'Save up to ₹12,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'LPU20',
    university: 'LPU Online',
    universityId: 'lovely-professional-university-online',
    discount: 20,
    program: 'All',
    savings: 'Save up to ₹18,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'MANIPAL20',
    university: 'Manipal MUJ Online',
    universityId: 'manipal-university-jaipur-online',
    discount: 20,
    program: 'MBA',
    savings: 'Save up to ₹22,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'NMIMS15',
    university: 'NMIMS Online',
    universityId: 'nmims-online',
    discount: 15,
    program: 'MBA',
    savings: 'Save up to ₹20,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'SYMBIOSIS20',
    university: 'Symbiosis SSODL',
    universityId: 'symbiosis-university-online',
    discount: 20,
    program: 'MBA',
    savings: 'Save up to ₹25,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'UPES15',
    university: 'UPES Online',
    universityId: 'upes-online',
    discount: 15,
    program: 'All',
    savings: 'Save up to ₹15,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'SMU20',
    university: 'Sikkim Manipal University Online',
    universityId: 'sikkim-manipal-university-online',
    discount: 20,
    program: 'All',
    savings: 'Save up to ₹16,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'AMRITA15',
    university: 'Amrita Online',
    universityId: 'amrita-university-online',
    discount: 15,
    program: 'All',
    savings: 'Save up to ₹12,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'SHARDA20',
    university: 'Sharda University Online',
    universityId: 'sharda-university-online',
    discount: 20,
    program: 'All',
    savings: 'Save up to ₹18,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'GALGOTIAS15',
    university: 'Galgotias University Online',
    universityId: 'galgotias-university-online',
    discount: 15,
    program: 'All',
    savings: 'Save up to ₹10,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'BVP20',
    university: 'Bharati Vidyapeeth Online',
    universityId: 'bharati-vidyapeeth-online',
    discount: 20,
    program: 'All',
    savings: 'Save up to ₹14,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  // ── MCA ───────────────────────────────────────────────────────────────────
  {
    code: 'AMITYMCA20',
    university: 'Amity University Online',
    universityId: 'amity-university-online',
    discount: 20,
    program: 'MCA',
    savings: 'Save up to ₹20,000',
    expiry: '30 Apr 2026',
    featured: true,
  },
  {
    code: 'JAINMCA15',
    university: 'JAIN Online',
    universityId: 'jain-university-online',
    discount: 15,
    program: 'MCA',
    savings: 'Save up to ₹12,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'LPUMCA20',
    university: 'LPU Online',
    universityId: 'lovely-professional-university-online',
    discount: 20,
    program: 'MCA',
    savings: 'Save up to ₹16,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'MANIPALMCA15',
    university: 'Manipal MUJ Online',
    universityId: 'manipal-university-jaipur-online',
    discount: 15,
    program: 'MCA',
    savings: 'Save up to ₹14,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
  {
    code: 'CUMCA20',
    university: 'Chandigarh University Online',
    universityId: 'chandigarh-university-online',
    discount: 20,
    program: 'MCA',
    savings: 'Save up to ₹16,000',
    expiry: '30 Apr 2026',
    featured: false,
  },
]

export function getCouponByCode(code: string): Coupon | null {
  return COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase()) ?? null
}

export function getCouponsByProgram(program: string): Coupon[] {
  if (program === 'All') return COUPONS
  return COUPONS.filter(c => c.program === program || c.program === 'All')
}
