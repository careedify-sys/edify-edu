// Per-university SEO overrides for /universities/[id]/mba pages.
// Keyed by university slug. When present, these values replace the generic template
// in generateMetadata() and the H1/intro in UniHero/SectionAbout.
//
// Sprint feat/fees-query-sprint1 (2026-08-04): the fee-stripping override style
// (title with no fee number) was underperforming on high-intent "[uni] mba fees"
// queries in GSC. Titles for Galgotias, Jain, Symbiosis, Sikkim Manipal, IGNOU
// and Chandigarh now lead with the total fee pulled directly from data.ts
// feeMin/feeMax. Each number is annotated with the data.ts line it came from.
// Brand suffix standardised on "| edifyedu.in" per Sprint 1 hard rule #4.

export interface MBASeoOverride {
  title: string
  description: string
  h1: string
  intro: string
}

export const MBA_SEO_OVERRIDES: Record<string, MBASeoOverride> = {
  // Amity: data.ts:276 feeMin=207000, data.ts:277 feeMax=225000
  // Sprint 1 FIX 5: previous title (87 chars) overflowed SERP cap. Rewritten
  // to the fee-led pattern used for the other Sprint 1 overrides, under 60c.
  'amity-university-online': {
    title: 'Amity Online MBA 2026: ₹2,07,000–₹2,25,000 | edifyedu.in',
    description: 'Amity University online MBA fees ₹2,07,000 to ₹2,25,000 total (₹8,906/mo EMI). 19 specializations, NAAC A+, WASC and QAA accredited. UGC-DEB approved. Zero-commission, verified fee data.',
    h1: 'Amity University Online MBA 2026: Fees, Specializations, and Honest Review',
    intro: 'The Amity University online MBA costs ₹2,07,000 to ₹2,25,000 in total over two years (four semesters), depending on the specialisation. You need a bachelor\'s degree with 50% marks to apply. Amity holds NAAC A+ accreditation, UGC-DEB approval and a NIRF Management rank of #49, and lists 19 specialisations, from Finance and Accounting to Business Analytics and Data Science. Amity also lists WASC (USA) and QAA (UK) accreditation on its official portal. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Fees are indicative, so confirm the current figure on online.amity.edu before you pay.',
  },
  // Uttaranchal: data.ts feeMin=99600 (one-time), feeMax=148000 (before the 30%
  // scholarship); 1,03,600 is the semester-track total. Since 2026-10-27 titles
  // carry exact rupees, and a list-vs-scholarship fee shows the before-
  // scholarship figure only, never a bare net ("From ₹99.6K" was both).
  'uttaranchal-university-online': {
    title: 'Uttaranchal Online MBA Fees 2026: ₹1,48,000 | edifyedu.in',
    description: 'Uttaranchal University online MBA fees: ₹1,03,600 after the 30% scholarship, or ₹99,600 paid upfront. 8 specialisations, NAAC A+, UGC-DEB approved.',
    h1: 'Uttaranchal University Online MBA 2026: Fees, Specialisations and Honest Review',
    intro: 'For the January 2027 batch, the Uttaranchal University Online (UU Online) MBA lists at ₹1,48,000. A 30% scholarship brings it to ₹1,03,600, paid as four semester instalments of ₹25,900, and paying the full fee upfront costs ₹99,600. The programme holds NAAC A+ accreditation and UGC-DEB approval, with 8 specialisations including Logistics and Supply Chain, International Business and Digital Marketing. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Confirm the current fee on the official portal before you pay.',
  },
  // MUJ: data.ts feeMin=156400 (after the 15% discount), feeMax=184000 (list),
  // emiFrom=6517, January 2027 chart. The generic template opens with the full
  // name "Manipal University Jaipur (MUJ) Online", which runs past 60 chars, so
  // clampTitle dropped the fee and rendered "Manipal Univ Jaipur Online MBA
  // Fees 2026". "MUJ" frees enough room to carry the range.
  'manipal-university-jaipur-online': {
    title: 'MUJ Online MBA Fees 2026: ₹1,84,000 | edifyedu.in',
    description: 'Manipal University Jaipur online MBA fees: ₹1,84,000 list, ₹1,56,400 after the 15% discount, EMI from ₹6,517. 13 specialisations, NAAC A+, UGC-DEB.',
    h1: 'Manipal University Jaipur (MUJ) Online MBA 2026: Fees, Specialisations and Honest Review',
    intro: 'For the January 2027 batch, the Manipal University Jaipur (MUJ) online MBA lists at ₹1,84,000, or ₹46,000 a semester. A 15% discount brings the total to ₹1,56,400, with EMI from ₹6,517 a month. The programme holds NAAC A+ accreditation, UGC-DEB approval and a NIRF Management rank of #81, with 13 specialisations including Finance, Analytics and Data Science, and BFSI. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Confirm the current fee on onlinemanipal.com before you pay.',
  },
  'lovely-professional-university-online': {
    title: 'LPU Online MBA Fees 2026: ₹2,00,000 | edifyedu.in',
    description: 'LPU online MBA fees: ₹2,00,000 list; ₹1,46,240 to ₹1,61,600 by payment plan. NAAC A++, NIRF #44 Management, UGC-DEB approved. Compare with Amity, CU, NMIMS.',
    h1: 'LPU Online MBA 2026: Fees, Review, and Specialization Guide',
    intro: 'The LPU (Lovely Professional University) online MBA lists at ₹2,00,000 for two years (four semesters). Paying semester-wise brings it to ₹1,61,600 and a lump sum to ₹1,46,240, and you can take up to four years to finish. You need a bachelor\'s degree with 50% marks to apply. LPU holds NAAC A++ accreditation, UGC-DEB approval and a NIRF Management rank of #44, and lists 12 specialisations, including Finance, Business Analytics, Data Science, and Banking and Financial Services. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Fees are indicative, so confirm the current figure on the official LPU Online portal before you pay.',
  },
  'nmims-online': {
    title: 'NMIMS Online MBA 2026: ₹1,96,000–₹2,20,000 | edifyedu.in',
    description: 'NMIMS (Narsee Monjee) online MBA fees ₹1,96,000 to ₹2,20,000 total. NAAC A++, NIRF #24 Management, UGC-DEB approved. Compare NMIMS vs Amity vs Symbiosis, zero commission.',
    h1: 'NMIMS Online MBA 2026: Fees, Specializations, and Independent Review',
    intro: 'The NMIMS (Narsee Monjee Institute of Management Studies) online MBA costs ₹1,96,000 to ₹2,20,000 in total over two years, with up to four years allowed to finish. You need a bachelor\'s degree with 50% marks to apply. NMIMS holds NAAC A++ accreditation, UGC-DEB approval and a NIRF Management rank of #24, and offers 6 specialisations: Business, Financial, Human Resource, IT, Marketing, and Operations and Data Sciences Management. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Fees are indicative, so confirm the current figure on the official NMIMS portal before you pay.',
  },

  // Sprint 1: fee-led rewrites for the 5 fee-stripping overrides + CU MBA reconciliation.
  // Fee numbers below come from lib/data.ts feeMin/feeMax as annotated.

  // Galgotias: data.ts:1261 feeMin=80200 (backed by pd.fees "₹80,200",
  // 2026-27 revised fee confirmed by Rishi against galgotiasonline.edu.in).
  // feeMax=86400 is the wider uni-range upper bound; getDisplayFee rule 1
  // fires with parsed 80,200 single vs ref 80,200-86,400 (7.17% max drift,
  // within the 10% tolerance), producing compact "₹80,200".
  // Description clamped to ~155 chars so Google does not truncate.
  'galgotias-university-online': {
    title: 'Galgotias Online MBA Fees 2026: ₹80,200 Total | edifyedu.in',
    description: 'Galgotias University online MBA fees ₹80,200 total (₹3,342/mo EMI). NAAC A+, UGC-DEB approved. Zero commission, verified data. Compare vs Sharda, LPU, CU.',
    h1: 'Galgotias University Online MBA 2026: Fees, Review, and Specializations',
    intro: 'Galgotias University online MBA total fees are ₹80,200 for the two-year programme, one of the more affordable options for candidates comparing online MBA programs in North India. The programme is UGC-DEB approved and NAAC A+ accredited, delivered from Greater Noida with EMI plans from ₹3,342 per month. Specialisations span Finance, Marketing, HR, Operations, and Business Analytics. edifyedu.in compares Galgotias MBA fees and accreditation status against Sharda, LPU, and Chandigarh University using public UGC-DEB data only.',
  },

  // JAIN: VERIFIED 2026-09-14 against onlinejain.com/online-mba. The page
  // prices every elective individually, in four tiers:
  //   ₹1,60,000  HR Management, Marketing, General Management, Finance
  //   ₹1,75,000  the dual combinations (Finance+Marketing, HR+Finance, ...)
  //   ₹1,96,000  BI & Analytics, Digital Marketing, Supply Chain, the AI tracks
  //   ₹2,98,000  International Finance (Accredited by ACCA, UK)
  // So the true span is ₹1.6L to ₹2.98L. The old NEEDS-VERIFICATION note here
  // had spotted half of it, that pd.fees '₹1.75L-₹1.96L' started above feeMin.
  // The bigger error was the other end: feeMax was 196000, which silently
  // dropped the ACCA tier and made the ceiling look ₹1L lower than it is.
  'jain-university-online': {
    title: 'JAIN Online MBA 2026: ₹1,60,000–₹2,98,000 | edifyedu.in',
    description: 'JAIN Deemed University online MBA fees ₹1,60,000 to ₹2,98,000 by elective. NAAC A++, UGC-DEB approved. Zero-commission, verified fee data. Compare vs Amity, LPU, Chandigarh before you enrol.',
    h1: 'Jain University Online MBA 2026: Fees, Review, and Specializations',
    intro: 'Jain (Deemed-to-be) University online MBA has no single fee. It is priced per elective across four tiers, from ₹1,60,000 for Finance, Marketing, HR or General Management, up to ₹2,98,000 for International Finance, which is accredited by ACCA in the UK. Most electives sit at ₹1,75,000 or ₹1,96,000, spread across four semesters with EMI options through NBFC partners. The programme is NAAC A++ accredited with UGC-DEB approval. edifyedu.in reviews Jain University online MBA fees using only public regulatory and NIRF data, with no paid ranking influence. Fees are indicative, so confirm your elective on the official JAIN portal before you pay.',
  },

  // Chandigarh: feeMin=165000, feeMax=220000. An earlier note here called
  // pd.fees "₹1.65L-₹1.80L" the verified range; it is not. 1,80,000 is not a
  // CU figure and both ends are early-bird nets.
  // Resolved 2026-10-27: Rishi verified on the portal (Aug 2026) list 2,20,000,
  // early-bird 1,80,400 Standard and 1,65,000 HBP / Business Analytics. The
  // labelled figures live in lib/data.ts feeBreakdown.mba.
  'chandigarh-university-online': {
    title: 'Chandigarh MBA Fees 2026: ₹2,20,000 | edifyedu.in',
    description: 'Chandigarh University online MBA fees: ₹2,20,000 list; ₹1,65,000 to ₹1,80,400 after early-bird. NAAC A+, NIRF #32 Management, UGC-DEB approved.',
    h1: 'Chandigarh University Online MBA 2026: Fees, Scholarships, and Review',
    intro: 'The Chandigarh University online MBA lists at ₹2,20,000 for two years (four semesters). The early-bird fee is ₹1,80,400 for the Standard programme and ₹1,65,000 for the HBP and Business Analytics variants. You need a bachelor\'s degree with 50% marks to apply. Chandigarh University holds NAAC A+ accreditation, UGC-DEB approval and a NIRF Management rank of #32 (its NIRF University rank is #19), and lists 26 specialisations, from Finance and Marketing to FinTech and Data Science and AI. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Fees and scholarships change by batch, so confirm both on the official portal before you pay.',
  },

  'dy-patil-university-online': {
    title: 'DY Patil Online MBA Fees 2026: ₹1,75,000 | edifyedu.in',
    description: 'D.Y. Patil University, Navi Mumbai online MBA fees ₹1,75,000 total. NAAC A++, UGC-DEB approved. Not the same institution as Dr. D.Y. Patil Vidyapeeth, Pune.',
    h1: 'DY Patil Online MBA 2026: Fees, Review, and Specialization Guide',
    intro: 'DY Patil University online MBA from its Navi Mumbai campus carries NAAC A++ accreditation and UGC-DEB approval. DY Patil online MBA fees cover a two-year program spanning Finance, Marketing, HR, and Operations specializations. The university\'s proximity to Mumbai\'s business district gives the degree employer visibility across Maharashtra. edifyedu.in reviews DY Patil online MBA fees against Amity, Symbiosis, and NMIMS using public NAAC and UGC-DEB data. No paid rankings or referral commissions influence this comparison.',
  },

  // IGNOU: data.ts:8757 feeMin=66000, data.ts:8758 feeMax=66000
  'ignou-online': {
    title: 'IGNOU Online MBA Fees 2026: ₹66,000 Total | edifyedu.in',
    description: 'IGNOU online MBA total fee ₹66,000 for the full 2-year programme. NAAC A++, UGC-DEB approved central open university. Zero-commission, verified fee data. Compare IGNOU vs Amity, LPU, Galgotias.',
    h1: 'IGNOU Online MBA 2026: Fees, Admission Process, and Review',
    intro: 'IGNOU online MBA total fee is ₹66,000 for the full two-year programme, making it the most affordable UGC-DEB approved management degree in India from a NAAC A++ accredited central open university. Specializations cover Financial, Marketing, Human Resource, Operations, and Services Management. Admissions run in January and July cycles. edifyedu.in compares IGNOU online MBA fees and programme structure against private university options like Amity and LPU using public data only.',
  },

  // MAHE: no fee-strip issue on this override, kept intact.
  'manipal-academy-higher-education-online': {
    title: 'MAHE Online MBA Fees 2026: ₹2,92,000 | edifyedu.in',
    description: 'MAHE Manipal online MBA fees ₹2,92,000 total. NAAC A++, NIRF #39 Management, UGC-DEB approved. Compare MAHE vs Amity, Symbiosis, NMIMS. Zero-commission data.',
    h1: 'MAHE Manipal Online MBA 2026: Fees, Specializations, and Review',
    intro: 'MAHE Manipal online MBA from Manipal Academy of Higher Education carries NAAC A++ accreditation and strong recognition across India\'s IT and consulting sectors. Manipal online MBA fees cover a two-year program with specializations in Finance, Marketing, HR, Business Analytics, and Digital Business. The UGC-DEB approved degree is delivered via the Online Manipal platform, with weekend sessions and on-demand recordings. edifyedu.in compares MAHE online MBA fees against Amity, Symbiosis, and NMIMS using public accreditation and NIRF data.',
  },

  // SMU: data.ts:1337 feeMin=120000, data.ts:1338 feeMax=120000
  'sikkim-manipal-university-online': {
    title: 'SMU Online MBA Fees 2026: ₹1,20,000 Total | edifyedu.in',
    description: 'Sikkim Manipal (SMU) online MBA total fee ₹1,20,000 for the full 2-year programme. NAAC A+, UGC-DEB approved. Zero-commission, verified fee data. Compare SMU vs Amity, LPU, MAHE.',
    h1: 'Sikkim Manipal University (SMU) Online MBA 2026: Fees and Review',
    intro: 'Sikkim Manipal University online MBA total fee is ₹1,20,000 for the full two-year programme, delivered under the UGC-DEB framework with NAAC A+ accreditation. Specializations cover Marketing, Finance, Human Resource, Systems (IT Management), Operations and Supply Chain, and Healthcare. edifyedu.in reviews SMU online MBA fees using public regulatory data only, without referral commissions.',
  },

  // Symbiosis: data.ts:1437 feeMin=315000, data.ts:1438 feeMax=370000
  'symbiosis-university-online': {
    title: 'Symbiosis MBA 2026: ₹3,15,000–₹3,70,000 | edifyedu.in',
    description: 'Symbiosis SSODL online MBA fees ₹3,15,000 to ₹3,70,000 total. NAAC A++, NIRF #11 Management, UGC-DEB approved. Zero-commission, verified fee data. Compare vs NMIMS, Amity, MAHE.',
    h1: 'Symbiosis Online MBA 2026: SSODL Fees, Specializations, and Honest Review',
    intro: 'The Symbiosis online MBA from SSODL (Symbiosis School for Online and Digital Learning, Pune) costs ₹3,15,000 to ₹3,70,000 in total over two years, depending on the specialisation. You need a bachelor\'s degree with 50% marks to apply. Symbiosis holds NAAC A++ accreditation, UGC-DEB approval and a NIRF Management rank of #11, and offers 9 specialisations, including Finance, Business Analytics, Logistics and Supply Chain, and Agri Operations Management. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Fees are indicative, so confirm the current figure on the official SSODL portal before you pay.',
  },
}
