// lib/coupon-pages.ts — Data for dedicated university coupon pages
// Each page targets "[uni] online mba discount coupon" queries

export interface CouponPageData {
  slug: string
  universityId: string
  universityName: string
  shortName: string
  totalFee: string
  totalFeeNum: number
  maxSavings: string
  maxSavingsNum: number
  finalFee: string
  naac: string
  nirf: string
  couponCode: string
  couponDiscount: string
  blogSlug: string
  officialUrl: string
  discounts: { type: string; eligibility: string; saving: string; howToApply: string }[]
  stackExample: string
  emiCompatible: string
  exclusions: string[]
  faqs: { q: string; a: string }[]
  peerComparisons: { uni: string; savings: string }[]
}

export const COUPON_PAGES: CouponPageData[] = [
  {
    slug: 'amity-online-mba-discount-coupon-2026',
    universityId: 'amity-university-online',
    universityName: 'Amity University Online',
    shortName: 'Amity',
    totalFee: 'Rs 2,25,000',
    totalFeeNum: 225000,
    maxSavings: 'Rs 30,000',
    maxSavingsNum: 30000,
    finalFee: 'Rs 1,95,000',
    naac: 'A+',
    nirf: '#22 University',
    couponCode: 'AMITY25',
    couponDiscount: '25% off',
    blogSlug: 'amity-online-mba-review-2026',
    officialUrl: 'amityonline.com',
    discounts: [
      { type: 'Lump-sum payment', eligibility: 'All students', saving: 'Rs 18,000 (pay Rs 2,07,000 instead of Rs 2,25,000)', howToApply: 'Select one-time payment during fee payment' },
      { type: 'Merit scholarship', eligibility: '60%+ in graduation', saving: '10-20% fee waiver', howToApply: 'Upload marksheets during application' },
      { type: 'Defence personnel', eligibility: 'Serving/retired defence, JCO', saving: 'Additional discount on tuition', howToApply: 'Submit defence ID during admission' },
      { type: 'Divyaang scholarship', eligibility: 'Candidates with disability certificate', saving: 'Up to 100% fee waiver', howToApply: 'Submit disability certificate' },
      { type: 'Alumni discount', eligibility: 'Amity University alumni', saving: '5-10% additional', howToApply: 'Verify alumni status during admission' },
      { type: 'CHAMPS (Sports)', eligibility: 'National/state level sports achievement', saving: 'Performance-based waiver', howToApply: 'Submit sports certificates' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 30,000', howToApply: 'Mention code AMITY25 during advisor call' },
    ],
    stackExample: 'If you have 70%+ graduation marks AND pay lump-sum AND apply before the early-bird deadline, your stacked savings can reach Rs 30,000-45,000 on a Rs 2,25,000 programme. That brings your effective fee to Rs 1,80,000-1,95,000.',
    emiCompatible: 'Yes. Amity allows coupon discount to be applied first, then the reduced balance can be paid via 24-month no-cost EMI. Example: Rs 2,07,000 one-time becomes roughly Rs 8,625/month.',
    exclusions: ['Does not reduce examination fees', 'Does not apply to ACCA International Finance track (Rs 2,99,000 separate pricing)', 'Cannot be combined with other third-party commercial coupons', 'Does not waive application fee (Rs 1,100)'],
    faqs: [
      { q: 'What is the Amity online MBA coupon code for 2026?', a: 'The verified EdifyEdu coupon code is AMITY25. It provides up to 25% discount on Amity University Online MBA fees. Apply the code through your EdifyEdu advisor during the admissions call.' },
      { q: 'How much can I save on Amity Online MBA fees?', a: 'Maximum stackable savings reach Rs 30,000-45,000 when you combine the lump-sum payment discount (Rs 18,000), merit scholarship (10-20%), and the EdifyEdu verified code. Standard fee is Rs 2,25,000.' },
      { q: 'Can I use the Amity coupon code with EMI?', a: 'Yes. The coupon discount reduces the total fee first. You can then pay the remaining balance via 24-month no-cost EMI at approximately Rs 8,625/month.' },
      { q: 'Is the Amity AIC referral code different from EdifyEdu coupon?', a: 'Yes. AIC (Amity International Centre) referral codes are peer-to-peer sharing codes from existing students. EdifyEdu codes represent verified university fee concessions. Both can potentially be stacked. Ask your advisor for details.' },
      { q: 'Does Amity offer early-bird discount?', a: 'Amity periodically offers early-bird discounts for new batches (January and July intakes). The discount varies by batch. Contact our advisor for the current early-bird deadline and saving amount.' },
      { q: 'Where do I enter the Amity coupon code?', a: 'The coupon code is applied during the admissions process through your EdifyEdu advisor, not on the Amity website directly. Your advisor will coordinate with the Amity admissions team to ensure the discount is applied to your fee.' },
      { q: 'Are there separate coupons for Amity MCA?', a: 'Yes. AMITYMCA20 provides 20% off on Amity Online MCA fees, saving up to Rs 20,000. The MBA and MCA coupons are separate codes with different discount percentages.' },
      { q: 'Is the Amity scholarship automatic?', a: 'Merit scholarships (based on graduation marks) are evaluated during the admission process. You do not need to apply separately. Upload your marksheets and the scholarship will be assessed automatically. Defence and Divyaang scholarships require additional documentation.' },
    ],
    peerComparisons: [
      { uni: 'NMIMS (Rs 1,96,000)', savings: 'Max Rs 20,000 via NMIMS15' },
      { uni: 'JAIN (Rs 1,96,000)', savings: 'Max Rs 20,000 via JAIN20' },
      { uni: 'Chandigarh (Rs 1,65,000)', savings: 'Max Rs 12,000 via CHANDIGARH15' },
      { uni: 'IGNOU (Rs 66,000)', savings: 'No coupons but lowest base fee' },
    ],
  },
  {
    slug: 'nmims-online-mba-discount-coupon-2026',
    universityId: 'nmims-online',
    universityName: 'NMIMS Online',
    shortName: 'NMIMS',
    totalFee: 'Rs 2,20,000',
    totalFeeNum: 220000,
    maxSavings: 'Rs 20,000',
    maxSavingsNum: 20000,
    finalFee: 'Rs 2,00,000',
    naac: 'A++',
    nirf: '#17 Management',
    couponCode: 'NMIMS15',
    couponDiscount: '15% off',
    blogSlug: 'nmims-online-mba-review-2026',
    officialUrl: 'online.nmims.edu',
    discounts: [
      { type: 'One-time payment', eligibility: 'All students', saving: 'Rs 24,000 (pay Rs 1,96,000 vs Rs 2,20,000 semester-wise)', howToApply: 'Select one-time payment option' },
      { type: 'Armed Forces scholarship', eligibility: 'Serving/retired defence personnel', saving: '20% fee waiver', howToApply: 'Submit defence ID during admission' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 20,000', howToApply: 'Mention code NMIMS15 during advisor call' },
    ],
    stackExample: 'NMIMS offers fewer discount categories than Amity but the one-time payment discount of Rs 24,000 is significant. Combined with the EdifyEdu code, total savings can reach Rs 20,000-30,000.',
    emiCompatible: 'Yes. NMIMS offers 3, 6, 9, and 12-month no-cost EMI through education lending partners. The coupon discount is applied to the total fee first.',
    exclusions: ['Does not reduce application fee (Rs 1,200)', 'Does not apply to executive MBA tracks', 'Cannot combine with other third-party coupons'],
    faqs: [
      { q: 'What is the NMIMS online MBA coupon code for 2026?', a: 'The verified EdifyEdu coupon code is NMIMS15. It provides up to 15% discount on NMIMS Online MBA fees. Apply through your EdifyEdu advisor during the admissions call.' },
      { q: 'How much can I save on NMIMS Online MBA?', a: 'Maximum savings of Rs 20,000-30,000 when combining one-time payment discount (Rs 24,000 saved) and the EdifyEdu verified code. Semester-wise total is Rs 2,20,000.' },
      { q: 'Can I use the NMIMS coupon with EMI?', a: 'Yes. The discount reduces the total fee first. You can then pay via 3-12 month no-cost EMI on the reduced amount.' },
      { q: 'Does NMIMS offer merit scholarship for online MBA?', a: 'NMIMS does not prominently advertise merit-based scholarships for the online MBA. The primary savings come from one-time payment discount and the Armed Forces scholarship (20% for defence personnel).' },
      { q: 'Is NMIMS online MBA Rs 1,96,000 or Rs 2,20,000?', a: 'Both are correct. Rs 1,96,000 is the one-time payment price (best value). Rs 2,20,000 is the semester-wise total (Rs 55,000 x 4). The difference of Rs 24,000 is the lump-sum payment discount.' },
      { q: 'Where to enter NMIMS coupon code?', a: 'The code is applied through your EdifyEdu advisor during the admission process. Your advisor coordinates with NMIMS admissions to ensure the discount is reflected in your fee invoice.' },
      { q: 'Is NMIMS NIRF #17 Management rank verified?', a: 'Yes. NMIMS holds NIRF #17 in the Management category for 2025 and NIRF #52 in the University category. Both are verified from nirfindia.org.' },
      { q: 'Does NMIMS have AACSB accreditation?', a: 'NMIMS is an AACSB member institution. AACSB accreditation is one of the most respected global business school accreditations, held by fewer than 6% of business schools worldwide.' },
    ],
    peerComparisons: [
      { uni: 'Amity (Rs 2,25,000)', savings: 'Max Rs 30,000 via AMITY25' },
      { uni: 'Symbiosis (Rs 3,15,000)', savings: 'Max Rs 25,000 via SYMBIOSIS20' },
      { uni: 'JAIN (Rs 1,96,000)', savings: 'Max Rs 20,000 via JAIN20' },
      { uni: 'MUJ (Rs 1,80,000)', savings: 'Max Rs 22,000 via MANIPAL20' },
    ],
  },
  {
    slug: 'manipal-jaipur-online-mba-discount-coupon-2026',
    universityId: 'manipal-university-jaipur-online',
    universityName: 'Manipal University Jaipur (MUJ) Online',
    shortName: 'MUJ',
    totalFee: 'Rs 1,80,000',
    totalFeeNum: 180000,
    maxSavings: 'Rs 22,000',
    maxSavingsNum: 22000,
    finalFee: 'Rs 1,58,000',
    naac: 'A+',
    nirf: '#58 University',
    couponCode: 'MANIPAL20',
    couponDiscount: '20% off',
    blogSlug: 'muj-online-mba-review-2026',
    officialUrl: 'jaipur.manipal.edu',
    discounts: [
      { type: '15% upfront discount', eligibility: 'All students paying full fee upfront', saving: 'Rs 27,000 (pay Rs 1,53,000)', howToApply: 'Select one-time payment during enrollment' },
      { type: 'Defence scholarship', eligibility: 'Serving/retired defence', saving: '20% fee waiver', howToApply: 'Submit defence ID' },
      { type: 'Divyaang scholarship', eligibility: 'Disability certificate holders', saving: 'Up to 100%', howToApply: 'Submit disability certificate' },
      { type: 'Merit scholarship', eligibility: '60%+ graduation marks', saving: '5-15%', howToApply: 'Automatic during admission' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 22,000', howToApply: 'Mention code MANIPAL20 during advisor call' },
    ],
    stackExample: 'MUJ offers a strong 15% upfront payment discount that brings the fee from Rs 1,80,000 to Rs 1,53,000. Stack with merit scholarship for additional 5-15% saving.',
    emiCompatible: 'Yes. MUJ offers EMI options. Coupon discount applies to total fee first.',
    exclusions: ['Does not apply to dual specialisation upgrade fees', 'Does not reduce exam or registration fees', 'Cannot combine with other third-party coupons'],
    faqs: [
      { q: 'What is the MUJ online MBA coupon code?', a: 'The verified code is MANIPAL20 for 20% off on MUJ Online MBA. Apply through your EdifyEdu advisor.' },
      { q: 'How much does MUJ online MBA cost after discount?', a: 'Standard fee is Rs 1,80,000. With 15% upfront discount: Rs 1,53,000. With EdifyEdu code: additional savings up to Rs 22,000.' },
      { q: 'Does MUJ include Coursera Plus?', a: 'Yes. MUJ bundles free Coursera Plus access throughout the programme. This is included in the fee and not affected by coupon discounts.' },
      { q: 'Is there a separate MCA coupon for MUJ?', a: 'Yes. MANIPALMCA15 provides 15% off on MUJ Online MCA, saving up to Rs 14,000.' },
      { q: 'Is MUJ the same as MAHE Manipal?', a: 'No. MUJ (Manipal University Jaipur) and MAHE (Manipal Academy of Higher Education, Karnataka) are separate universities under the Manipal group. MUJ is more affordable; MAHE has higher NIRF rank.' },
      { q: 'Can I switch from semester payment to one-time after enrollment?', a: 'Typically no. The 15% upfront discount applies only if you choose one-time payment at the start. Confirm with the MUJ admissions team before enrolling.' },
    ],
    peerComparisons: [
      { uni: 'Amity (Rs 2,25,000)', savings: 'Max Rs 30,000 via AMITY25' },
      { uni: 'NMIMS (Rs 2,20,000)', savings: 'Max Rs 20,000 via NMIMS15' },
      { uni: 'LPU (Rs 1,61,000)', savings: 'Max Rs 18,000 via LPU20' },
      { uni: 'MAHE (Rs 2,92,000)', savings: 'No specific coupon -- higher base fee' },
    ],
  },
  {
    slug: 'lpu-online-mba-discount-coupon-2026',
    universityId: 'lovely-professional-university-online',
    universityName: 'LPU Online',
    shortName: 'LPU',
    totalFee: 'Rs 1,61,000',
    totalFeeNum: 161000,
    maxSavings: 'Rs 18,000',
    maxSavingsNum: 18000,
    finalFee: 'Rs 1,43,000',
    naac: 'A++',
    nirf: '#31 University',
    couponCode: 'LPU20',
    couponDiscount: '20% off',
    blogSlug: 'online-mba-lpu-review-2026',
    officialUrl: 'online.lpu.in',
    discounts: [
      { type: '20% placement-linked grant', eligibility: 'All students', saving: 'Built into fee structure', howToApply: 'Automatic -- included in advertised fee' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 18,000', howToApply: 'Mention code LPU20 during advisor call' },
    ],
    stackExample: 'LPU already includes a 20% placement-linked grant in its advertised fee. Additional savings through EdifyEdu code can bring total savings to Rs 18,000.',
    emiCompatible: 'Yes. LPU offers semester-wise and EMI payment options after coupon discount.',
    exclusions: ['Does not reduce exam fees', 'Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the LPU online MBA coupon code?', a: 'LPU20 provides 20% off. Apply through your EdifyEdu advisor.' },
      { q: 'What is LPU online MBA total fee?', a: 'Rs 1,61,000 total (with 20% grant already included). Without grant: Rs 2,00,000.' },
      { q: 'Does LPU have NAAC A++ accreditation?', a: 'Yes. LPU holds NAAC A++ accreditation, the highest grade.' },
      { q: 'Is there a separate LPU MCA coupon?', a: 'Yes. LPUMCA20 provides 20% off on LPU Online MCA.' },
      { q: 'How does the LPU placement-linked grant work?', a: 'LPU includes a 20% fee reduction as a "placement-linked grant" in the advertised fee. This is automatic and does not require a separate application.' },
    ],
    peerComparisons: [
      { uni: 'Chandigarh (Rs 1,65,000)', savings: 'Max Rs 12,000 via CHANDIGARH15' },
      { uni: 'Galgotias (Rs 76,200)', savings: 'Max Rs 10,000 via GALGOTIAS15' },
      { uni: 'MUJ (Rs 1,80,000)', savings: 'Max Rs 22,000 via MANIPAL20' },
    ],
  },
  {
    slug: 'chandigarh-university-online-mba-discount-coupon-2026',
    universityId: 'chandigarh-university-online',
    universityName: 'Chandigarh University Online',
    shortName: 'Chandigarh',
    totalFee: 'Rs 1,65,000',
    totalFeeNum: 165000,
    maxSavings: 'Rs 12,000',
    maxSavingsNum: 12000,
    finalFee: 'Rs 1,53,000',
    naac: 'A+',
    nirf: '#19 University',
    couponCode: 'CHANDIGARH15',
    couponDiscount: '15% off',
    blogSlug: 'chandigarh-university-online-mba-review',
    officialUrl: 'cuonlineedu.in',
    discounts: [
      { type: 'Harvard/PwC/PMI certifications', eligibility: 'All students', saving: 'Bundled at no extra cost (worth Rs 50,000+)', howToApply: 'Included automatically in programme' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 12,000', howToApply: 'Mention code CHANDIGARH15 during advisor call' },
    ],
    stackExample: 'Chandigarh bundles Harvard Business Publishing, PwC, and PMI certifications at no extra cost -- worth Rs 50,000+ if purchased separately. Combined with EdifyEdu code, total value exceeds Rs 60,000.',
    emiCompatible: 'Yes. CU offers EMI options on the reduced fee.',
    exclusions: ['Does not reduce Tier 2 programme fee (Rs 1,80,000)', 'Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the Chandigarh University online MBA coupon?', a: 'CHANDIGARH15 provides 15% off. Apply through your EdifyEdu advisor.' },
      { q: 'What certifications does CU bundle for free?', a: 'Harvard Business Publishing, PwC, and PMI certifications are included at no extra cost in the CU online MBA fee.' },
      { q: 'Is there a separate CU MCA coupon?', a: 'Yes. CUMCA20 provides 20% off on CU Online MCA.' },
      { q: 'What is the difference between CU Tier 1 and Tier 2?', a: 'Tier 1 costs Rs 1,65,000 and Tier 2 costs Rs 1,80,000. Both include the same certifications. Tier selection depends on your application timing and batch.' },
    ],
    peerComparisons: [
      { uni: 'LPU (Rs 1,61,000)', savings: 'Max Rs 18,000 via LPU20' },
      { uni: 'MUJ (Rs 1,80,000)', savings: 'Max Rs 22,000 via MANIPAL20' },
      { uni: 'Amity (Rs 2,25,000)', savings: 'Max Rs 30,000 via AMITY25' },
    ],
  },
  {
    slug: 'smu-online-mba-discount-coupon-2026', universityId: 'sikkim-manipal-university-online', universityName: 'Sikkim Manipal University Online', shortName: 'SMU', totalFee: 'Rs 1,20,000', totalFeeNum: 120000, maxSavings: 'Rs 16,000', maxSavingsNum: 16000, finalFee: 'Rs 1,04,000', naac: 'A+', nirf: 'Not ranked in top 200', couponCode: 'SMU20', couponDiscount: '20% off', blogSlug: 'smu-online-mba-review', officialUrl: 'onlinesmu.com',
    discounts: [
      { type: 'Northeast India scholarship', eligibility: 'Northeast India and Sikkim residents', saving: '30% fee waiver', howToApply: 'Submit domicile certificate' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 16,000', howToApply: 'Mention code SMU20 during advisor call' },
    ],
    stackExample: 'SMU is the most affordable Manipal-group MBA. Northeast residents save 30% automatically, bringing effective fee to Rs 84,000.',
    emiCompatible: 'Yes. SMU offers EMI on the reduced fee amount.',
    exclusions: ['Does not apply to executive MBA tracks', 'Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the SMU online MBA coupon code?', a: 'SMU20 provides 20% off. Apply through your EdifyEdu advisor.' },
      { q: 'Is SMU the cheapest Manipal MBA?', a: 'Yes. SMU at Rs 1,20,000 is cheaper than MUJ (Rs 1,80,000) and MAHE (Rs 2,92,000).' },
      { q: 'Does SMU offer Northeast India scholarship?', a: 'Yes. 30% fee waiver for Northeast India and Sikkim residents.' },
      { q: 'Is SMU different from MUJ?', a: 'Yes. SMU (Sikkim) and MUJ (Jaipur) are separate universities under the Manipal group.' },
    ],
    peerComparisons: [{ uni: 'MUJ (Rs 1,80,000)', savings: 'Max Rs 22,000 via MANIPAL20' }, { uni: 'Galgotias (Rs 76,200)', savings: 'Max Rs 10,000 via GALGOTIAS15' }],
  },
  {
    slug: 'mahe-online-mba-discount-coupon-2026', universityId: 'manipal-academy-higher-education-online', universityName: 'MAHE Manipal Online', shortName: 'MAHE', totalFee: 'Rs 2,92,000', totalFeeNum: 292000, maxSavings: 'Rs 20,000', maxSavingsNum: 20000, finalFee: 'Rs 2,72,000', naac: 'A++', nirf: '#3 University', couponCode: 'MAHE15', couponDiscount: '15% off', blogSlug: 'mahe-online-mba-review-2026', officialUrl: 'onlinemanipal.com',
    discounts: [
      { type: 'Defence scholarship', eligibility: 'Serving/retired defence', saving: '20% fee waiver', howToApply: 'Submit defence ID' },
      { type: 'Female candidate scholarship', eligibility: 'Female applicants', saving: '15% fee waiver', howToApply: 'Automatic during admission' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 20,000', howToApply: 'Mention code during advisor call' },
    ],
    stackExample: 'MAHE offers Defence (20%) and Female (15%) scholarships. Combined with EdifyEdu savings, total discount can reach Rs 20,000-50,000.',
    emiCompatible: 'Yes. MAHE offers Coursera-integrated EMI options.',
    exclusions: ['Does not reduce exam fees', 'Premium tracks may have separate pricing'],
    faqs: [
      { q: 'What is the MAHE online MBA coupon code?', a: 'Contact EdifyEdu advisor for the latest MAHE verified discount code and savings.' },
      { q: 'Is MAHE worth Rs 2.92L?', a: 'MAHE carries NIRF #3 University rank and NAAC A++. For employers who value the MAHE brand, the premium is justified.' },
      { q: 'Does MAHE offer female scholarship?', a: 'Yes. 15% fee waiver for female applicants, applied automatically.' },
      { q: 'Is MAHE the same as MUJ?', a: 'No. MAHE (Karnataka) and MUJ (Jaipur) are separate universities under the Manipal group.' },
    ],
    peerComparisons: [{ uni: 'Symbiosis (Rs 3,15,000)', savings: 'Max Rs 25,000 via SYMBIOSIS20' }, { uni: 'Amity (Rs 2,25,000)', savings: 'Max Rs 30,000 via AMITY25' }],
  },
  {
    slug: 'jain-online-mba-discount-coupon-2026', universityId: 'jain-university-online', universityName: 'JAIN Online', shortName: 'JAIN', totalFee: 'Rs 1,96,000', totalFeeNum: 196000, maxSavings: 'Rs 20,000', maxSavingsNum: 20000, finalFee: 'Rs 1,76,000', naac: 'A++', nirf: '#62 Management', couponCode: 'JAIN20', couponDiscount: '20% off', blogSlug: 'best-mba-specialization-india-2026', officialUrl: 'online.jainuniversity.ac.in',
    discounts: [
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 20,000', howToApply: 'Mention code JAIN20 during advisor call' },
      { type: 'Merit scholarship', eligibility: '60%+ graduation', saving: '10-20%', howToApply: 'Automatic during admission' },
    ],
    stackExample: 'JAIN offers NAAC A++ at Rs 1,96,000 with 19 specializations and ACCA integration. Savings up to Rs 20,000 with EdifyEdu code.',
    emiCompatible: 'Yes. JAIN offers EMI options on reduced fee.',
    exclusions: ['Does not reduce ACCA track premium', 'Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the JAIN online MBA coupon code?', a: 'JAIN20 provides 20% off. Apply through your EdifyEdu advisor.' },
      { q: 'Does JAIN have NAAC A++?', a: 'Yes. JAIN Online holds NAAC A++ accreditation.' },
      { q: 'Is there a JAIN MCA coupon?', a: 'Yes. JAINMCA15 provides 15% off on JAIN Online MCA.' },
      { q: 'Does JAIN offer ACCA integration?', a: 'Yes. JAIN Online offers ACCA-integrated International Finance specialisation.' },
    ],
    peerComparisons: [{ uni: 'NMIMS (Rs 2,20,000)', savings: 'Max Rs 20,000 via NMIMS15' }, { uni: 'Amity (Rs 2,25,000)', savings: 'Max Rs 30,000 via AMITY25' }],
  },
  {
    slug: 'symbiosis-ssodl-online-mba-discount-coupon-2026', universityId: 'symbiosis-university-online', universityName: 'Symbiosis SSODL Online', shortName: 'Symbiosis', totalFee: 'Rs 3,15,000', totalFeeNum: 315000, maxSavings: 'Rs 25,000', maxSavingsNum: 25000, finalFee: 'Rs 2,90,000', naac: 'A++', nirf: '#32 Management', couponCode: 'SYMBIOSIS20', couponDiscount: '20% off', blogSlug: 'symbiosis-online-mba-review-2026', officialUrl: 'ssodl.symbiosis.ac.in',
    discounts: [
      { type: 'Work experience scholarship', eligibility: '2+ years professional experience', saving: 'Rs 50,000-55,000 (fee becomes Rs 2,65,000)', howToApply: 'Submit experience letters during admission' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 25,000', howToApply: 'Mention code SYMBIOSIS20 during advisor call' },
    ],
    stackExample: 'Symbiosis offers Rs 50,000-55,000 work experience scholarship for 2+ years professionals. This brings the fee from Rs 3,15,000-3,70,000 to Rs 2,65,000. Additional EdifyEdu savings of up to Rs 25,000.',
    emiCompatible: 'Yes. Symbiosis offers semester-wise payment after coupon discount.',
    exclusions: ['Does not reduce registration fee', 'Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the Symbiosis online MBA coupon code?', a: 'SYMBIOSIS20 provides 20% off. Apply through your EdifyEdu advisor.' },
      { q: 'What is the Symbiosis work experience scholarship?', a: 'Rs 50,000-55,000 fee waiver for candidates with 2+ years of professional experience.' },
      { q: 'Is Symbiosis the most expensive online MBA?', a: 'Symbiosis is among the most expensive at Rs 3,15,000 (with scholarship) to Rs 3,70,000 (without). The premium buys NAAC A++ and NIRF #32 Management rank.' },
      { q: 'Does Symbiosis require work experience?', a: 'No. Work experience is not required for admission but it qualifies you for the Rs 50,000+ scholarship.' },
    ],
    peerComparisons: [{ uni: 'MAHE (Rs 2,92,000)', savings: 'NIRF #3 University at lower fee' }, { uni: 'NMIMS (Rs 2,20,000)', savings: 'Max Rs 20,000 via NMIMS15' }],
  },
  {
    slug: 'ignou-online-mba-discount-coupon-2026', universityId: 'ignou-online', universityName: 'IGNOU Online', shortName: 'IGNOU', totalFee: 'Rs 66,000', totalFeeNum: 66000, maxSavings: 'Rs 0', maxSavingsNum: 0, finalFee: 'Rs 66,000', naac: 'A++', nirf: '#1 Open University', couponCode: 'N/A', couponDiscount: 'No coupon -- lowest base fee', blogSlug: 'ignou-online-mba-review-2026', officialUrl: 'ignou.ac.in',
    discounts: [
      { type: 'Already lowest fee', eligibility: 'All students', saving: 'Rs 66,000 total -- no further discount needed', howToApply: 'Apply directly on ignou.ac.in' },
      { type: 'SC/ST fee concession', eligibility: 'SC/ST category candidates', saving: 'Reduced fee structure', howToApply: 'Submit caste certificate during admission' },
    ],
    stackExample: 'IGNOU at Rs 66,000 is already the lowest-priced online MBA from a NAAC A++ university. No coupons are needed. The fee itself is the discount.',
    emiCompatible: 'IGNOU does not offer formal EMI. Fee is paid semester-wise (Rs 14,000-16,000 per semester).',
    exclusions: ['No coupon system -- IGNOU is a central government university with fixed fees'],
    faqs: [
      { q: 'Is there an IGNOU online MBA coupon code?', a: 'No. IGNOU is a central government university with the lowest online MBA fee in India (Rs 66,000). No coupon is needed or applicable.' },
      { q: 'Why is IGNOU MBA so cheap?', a: 'IGNOU is funded by the Government of India and operates as a not-for-profit institution. The low fee reflects government subsidization, not lower quality.' },
      { q: 'Is IGNOU MBA valid for government jobs?', a: 'Yes. IGNOU holds NAAC A++ and is arguably the strongest online MBA for government job eligibility as a central university.' },
      { q: 'Should I choose IGNOU or Amity?', a: 'IGNOU for pure affordability and government job eligibility. Amity for structured LMS, live sessions, international accreditation (WASC+QAA), and 19 specialisations.' },
    ],
    peerComparisons: [{ uni: 'Galgotias (Rs 76,200)', savings: 'Max Rs 10,000 via GALGOTIAS15' }, { uni: 'SMU (Rs 1,20,000)', savings: 'Max Rs 16,000 via SMU20' }],
  },
  {
    slug: 'dpu-online-mba-discount-coupon-2026', universityId: 'dr-dy-patil-vidyapeeth-online', universityName: 'DY Patil Vidyapeeth Online', shortName: 'DPU', totalFee: 'Rs 1,20,000', totalFeeNum: 120000, maxSavings: 'Rs 12,000', maxSavingsNum: 12000, finalFee: 'Rs 1,08,000', naac: 'A++', nirf: 'Ranked', couponCode: 'DPU15', couponDiscount: '15% off', blogSlug: 'dy-patil-online-mba-review', officialUrl: 'dypatilonline.com',
    discounts: [
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 12,000', howToApply: 'Mention code during advisor call' },
    ],
    stackExample: 'DPU offers a competitive Rs 1,20,000 fee with NAAC A++ and WES recognition. EdifyEdu code saves up to Rs 12,000.',
    emiCompatible: 'Yes. DPU offers EMI options.',
    exclusions: ['Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the DY Patil online MBA coupon?', a: 'Contact EdifyEdu for the latest DPU verified discount code.' },
      { q: 'Does DPU have NAAC A++?', a: 'Yes. Dr. DY Patil Vidyapeeth holds NAAC A++ accreditation.' },
      { q: 'Is DPU WES recognised?', a: 'Yes. DPU online MBA is WES recognised for international credential evaluation.' },
    ],
    peerComparisons: [{ uni: 'SMU (Rs 1,20,000)', savings: 'Same fee, different brand' }, { uni: 'LPU (Rs 1,61,000)', savings: 'Max Rs 18,000 via LPU20' }],
  },
  {
    slug: 'amrita-online-mba-discount-coupon-2026', universityId: 'amrita-vishwa-vidyapeetham-online', universityName: 'Amrita Vishwa Vidyapeetham Online', shortName: 'Amrita', totalFee: 'Rs 1,76,000-2,60,000', totalFeeNum: 176000, maxSavings: 'Rs 12,000', maxSavingsNum: 12000, finalFee: 'Rs 1,64,000+', naac: 'A++', nirf: '#8 University', couponCode: 'AMRITA15', couponDiscount: '15% off', blogSlug: 'top-online-mba-india-2026', officialUrl: 'amritaonline.com',
    discounts: [
      { type: 'Defence scholarship', eligibility: 'Serving/retired defence', saving: '20% fee waiver', howToApply: 'Submit defence ID' },
      { type: 'Female scholarship', eligibility: 'Female applicants', saving: '15% fee waiver', howToApply: 'Automatic' },
      { type: 'SAARC scholarship', eligibility: 'SAARC country nationals', saving: '40% fee waiver', howToApply: 'Submit nationality proof' },
      { type: 'Doctors scholarship', eligibility: 'Medical professionals', saving: '15% fee waiver', howToApply: 'Submit medical registration' },
      { type: 'EdifyEdu verified code', eligibility: 'All students via EdifyEdu', saving: 'Up to Rs 12,000', howToApply: 'Mention code AMRITA15 during advisor call' },
    ],
    stackExample: 'Amrita offers 8 scholarship categories. Female candidates save 15% automatically. Defence personnel save 20%. SAARC nationals save 40%. Combined with EdifyEdu code, savings can be substantial.',
    emiCompatible: 'Yes. Amrita offers EMI on reduced fee.',
    exclusions: ['Specialisation-specific pricing varies (General Mgmt Rs 1,76,000 vs IFA Rs 2,60,000)', 'Cannot combine with other third-party offers'],
    faqs: [
      { q: 'What is the Amrita online MBA coupon code?', a: 'AMRITA15 provides 15% off. Apply through your EdifyEdu advisor.' },
      { q: 'Does Amrita offer per-specialisation pricing?', a: 'Yes. General Management is Rs 1,76,000. Analytics/FinTech is Rs 2,44,000. International Finance is Rs 2,60,000.' },
      { q: 'Does Amrita have Grant Thornton co-branding?', a: 'Yes. Selected specialisations (Analytics, FinTech, ESG) are co-branded with Grant Thornton.' },
      { q: 'Is Amrita NIRF #8?', a: 'Yes. Amrita holds NIRF #8 in the University category for 2025.' },
    ],
    peerComparisons: [{ uni: 'NMIMS (Rs 2,20,000)', savings: 'Max Rs 20,000 via NMIMS15' }, { uni: 'JAIN (Rs 1,96,000)', savings: 'Max Rs 20,000 via JAIN20' }],
  },
]

export function getCouponPage(slug: string): CouponPageData | undefined {
  return COUPON_PAGES.find(p => p.slug === slug)
}

export const COUPON_PAGE_SLUGS = COUPON_PAGES.map(p => p.slug)
