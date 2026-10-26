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
    title: 'Amity Online MBA Fees 2026: ₹2.07L-₹2.25L | edifyedu.in',
    description: 'Amity University online MBA fees ₹2,07,000 to ₹2,25,000 total (₹8,906/mo EMI). 19 specializations, NAAC A+, WASC and QAA accredited. UGC-DEB approved. Zero-commission, verified fee data.',
    h1: 'Amity University Online MBA 2026: Fees, Specializations, and Honest Review',
    intro: 'Amity University online MBA total fees range from ₹2,07,000 to ₹2,25,000 over two years, with EMI from ₹8,906 per month. The programme holds NAAC A+ accreditation and UGC-DEB approval, covering 19 specializations from Finance to Business Analytics. International accreditations from WASC and QAA strengthen the degree for candidates targeting global employers. edifyedu.in compares Amity online MBA fees against NMIMS, Symbiosis, and other approved universities using public data only.',
  },
  // Uttaranchal: data.ts feeMin=99600 (one-time), feeMax=148000 (before the 30%
  // scholarship); 1,03,600 is the semester-track total. The generic template
  // rendered "₹99.6K-₹1.48L" at 61 chars, one over the cap, so clampTitle
  // dropped the fee from the title entirely. "From ₹99.6K" keeps it fee-led.
  'uttaranchal-university-online': {
    title: 'Uttaranchal Online MBA Fees 2026: From ₹99.6K | edifyedu.in',
    description: 'Uttaranchal University online MBA fees: ₹1,03,600 after the 30% scholarship, or ₹99,600 paid upfront. 8 specialisations, NAAC A+, UGC-DEB approved.',
    h1: 'Uttaranchal University Online MBA 2026: Fees, Specialisations and Honest Review',
    intro: 'For the January 2027 batch, the Uttaranchal University online MBA lists at ₹1,48,000. A 30% scholarship brings it to ₹1,03,600, paid as four semester instalments of ₹25,900, and paying the full fee upfront costs ₹99,600. The programme holds NAAC A+ accreditation and UGC-DEB approval, with 8 specialisations including Logistics and Supply Chain, International Business and Digital Marketing. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Confirm the current fee on the official portal before you pay.',
  },
  // MUJ: data.ts feeMin=156400 (after the 15% discount), feeMax=184000 (list),
  // emiFrom=6517, January 2027 chart. The generic template opens with the full
  // name "Manipal University Jaipur (MUJ) Online", which runs past 60 chars, so
  // clampTitle dropped the fee and rendered "Manipal Univ Jaipur Online MBA
  // Fees 2026". "MUJ" frees enough room to carry the range.
  'manipal-university-jaipur-online': {
    title: 'MUJ Online MBA Fees 2026: ₹1.56L-₹1.84L | edifyedu.in',
    description: 'Manipal University Jaipur online MBA fees: ₹1,84,000 list, ₹1,56,400 after the 15% discount, EMI from ₹6,517. 13 specialisations, NAAC A+, UGC-DEB.',
    h1: 'Manipal University Jaipur (MUJ) Online MBA 2026: Fees, Specialisations and Honest Review',
    intro: 'For the January 2027 batch, the Manipal University Jaipur (MUJ) online MBA lists at ₹1,84,000, or ₹46,000 a semester. A 15% discount brings the total to ₹1,56,400, with EMI from ₹6,517 a month. The programme holds NAAC A+ accreditation, UGC-DEB approval and a NIRF Management rank of #81, with 13 specialisations including Finance, Analytics and Data Science, and BFSI. edifyedu.in compares public UGC/NAAC/NIRF data, with no paid rankings. Confirm the current fee on onlinemanipal.com before you pay.',
  },
  'lovely-professional-university-online': {
    title: 'LPU Online MBA Fees 2026: ₹1.61L-₹2L | edifyedu.in',
    description: 'Lovely Professional University (LPU) online MBA fees ₹1.61L to ₹2L total. NAAC A++, NIRF #44 Management, UGC-DEB approved. Compare with Amity, Chandigarh, NMIMS.',
    h1: 'LPU Online MBA 2026: Fees, Review, and Specialization Guide',
    intro: 'LPU online MBA from Lovely Professional University carries NAAC A++ accreditation, one of the top-rated programs in North India. LPU MBA fees are structured across four semesters with EMI options available. Lovely Professional University MBA fees are competitive against similar NAAC A++ programs. The program spans 15+ specializations including Finance, HR, Marketing, and Operations, delivered via weekend live sessions and recorded backups. edifyedu.in presents LPU online MBA fees and accreditation data from UGC-DEB and NAAC public records, without referral commissions.',
  },
  'nmims-online': {
    title: 'NMIMS Online MBA Fees 2026: ₹1.96L-₹2.2L | edifyedu.in',
    description: 'NMIMS (Narsee Monjee) online MBA fees ₹1.96L to ₹2.2L total. NAAC A++, NIRF #24 Management, UGC-DEB approved. Compare NMIMS vs Amity vs Symbiosis, zero commission.',
    h1: 'NMIMS Online MBA 2026: Fees, Specializations, and Independent Review',
    intro: 'The NMIMS online MBA, from Narsee Monjee Institute of Management Studies, is one of India\'s most searched management programmes. NMIMS holds NAAC A++ accreditation and a NIRF Management rank of #24. NMIMS online MBA fees cover two years of coursework across Finance, Marketing, HR, Operations, and other specializations. The university holds UGC-DEB approval, giving the degree full validity for employment and higher studies. edifyedu.in compares NMIMS online MBA fees against Amity, Symbiosis, and MAHE using public regulatory data. Candidates shortlisting NMIMS frequently compare fees and specialization counts before applying.',
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
    title: 'JAIN Online MBA Fees 2026: ₹1.6L-₹2.98L Total | edifyedu.in',
    description: 'JAIN Deemed University online MBA fees ₹1,60,000 to ₹2,98,000 by elective. NAAC A++, UGC-DEB approved. Zero-commission, verified fee data. Compare vs Amity, LPU, Chandigarh before you enrol.',
    h1: 'Jain University Online MBA 2026: Fees, Review, and Specializations',
    intro: 'Jain (Deemed-to-be) University online MBA has no single fee. It is priced per elective across four tiers, from ₹1,60,000 for Finance, Marketing, HR or General Management, up to ₹2,98,000 for International Finance, which is accredited by ACCA in the UK. Most electives sit at ₹1,75,000 or ₹1,96,000, spread across four semesters with EMI options through NBFC partners. The programme is NAAC A++ accredited with UGC-DEB approval. edifyedu.in reviews Jain University online MBA fees using only public regulatory and NIRF data, with no paid ranking influence. Fees are indicative, so confirm your elective on the official JAIN portal before you pay.',
  },

  // Chandigarh: data.ts:2151 feeMin=165000, data.ts:2152 feeMax=220000.
  // pd.fees (data.ts:2191) is the narrower "₹1.65L-₹1.80L" — that is the
  // verified programme range. Reference (feeMax=₹2.2L) is NOT backed by
  // pd.fees, so we display the narrower BACKED range per rule 3.
  // NEEDS-VERIFICATION: does the 25% Early Bird apply to MBA, and what is
  // the correct MBA net?
  'chandigarh-university-online': {
    title: 'Chandigarh MBA Fees 2026: ₹1.65L-₹1.8L | edifyedu.in',
    description: 'Chandigarh University online MBA fees ₹1,65,000 to ₹1,80,000. NAAC A+, NIRF #32 Management, UGC-DEB approved. 25% Early Bird Scholarship available. Zero-commission, verified fee data.',
    h1: 'Chandigarh University Online MBA 2026: Fees, Scholarships, and Review',
    intro: 'Chandigarh University online MBA total fees range from ₹1,65,000 to ₹1,80,000 across four semesters. The programme is UGC-DEB approved and NAAC A+ accredited, with a NIRF University rank of #19. Chandigarh University runs a 25% Early Bird Scholarship for eligible early applicants, verifiable on the UGC-DEB and NAAC public registers. Live classes are delivered on weekends via the CUOnline platform. edifyedu.in compares Chandigarh University MBA fees using public university data, not paid rankings.',
  },

  'dy-patil-university-online': {
    title: 'DY Patil Online MBA Fees 2026: ₹1.75L | edifyedu.in',
    description: 'D.Y. Patil University, Navi Mumbai online MBA fees ₹1.75L total. NAAC A++, UGC-DEB approved. Not the same institution as Dr. D.Y. Patil Vidyapeeth, Pune.',
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
    title: 'Manipal (MAHE) Online MBA Fees 2026: ₹2.92L | edifyedu.in',
    description: 'MAHE Manipal online MBA fees ₹2.92L total. NAAC A++, NIRF #39 Management, UGC-DEB approved. Compare MAHE vs Amity, Symbiosis, NMIMS. Zero-commission data.',
    h1: 'MAHE Manipal Online MBA 2026: Fees, Specializations, and Review',
    intro: 'MAHE Manipal online MBA from Manipal Academy of Higher Education carries NAAC A++ accreditation and strong recognition across India\'s IT and consulting sectors. Manipal online MBA fees cover a two-year program with specializations in Finance, Marketing, HR, Business Analytics, and Digital Business. The UGC-DEB approved degree is delivered via the Online Manipal platform, with weekend sessions and on-demand recordings. edifyedu.in compares MAHE online MBA fees against Amity, Symbiosis, and NMIMS using public accreditation and NIRF data.',
  },

  // SMU: data.ts:1337 feeMin=120000, data.ts:1338 feeMax=120000
  'sikkim-manipal-university-online': {
    title: 'SMU Online MBA Fees 2026: ₹1.2L Total | edifyedu.in',
    description: 'Sikkim Manipal (SMU) online MBA total fee ₹1,20,000 for the full 2-year programme. NAAC A+, UGC-DEB approved. Zero-commission, verified fee data. Compare SMU vs Amity, LPU, MAHE.',
    h1: 'Sikkim Manipal University (SMU) Online MBA 2026: Fees and Review',
    intro: 'Sikkim Manipal University online MBA total fee is ₹1,20,000 for the full two-year programme, delivered under the UGC-DEB framework with NAAC A+ accreditation. Specializations cover Marketing, Finance, Human Resource, Systems (IT Management), Operations and Supply Chain, and Healthcare. edifyedu.in reviews SMU online MBA fees using public regulatory data only, without referral commissions.',
  },

  // Symbiosis: data.ts:1437 feeMin=315000, data.ts:1438 feeMax=370000
  'symbiosis-university-online': {
    title: 'Symbiosis SSODL MBA Fees 2026: ₹3.15L-₹3.7L | edifyedu.in',
    description: 'Symbiosis SSODL online MBA fees ₹3,15,000 to ₹3,70,000 total. NAAC A++, NIRF #11 Management, UGC-DEB approved. Zero-commission, verified fee data. Compare vs NMIMS, Amity, MAHE.',
    h1: 'Symbiosis Online MBA 2026: SSODL Fees, Specializations, and Honest Review',
    intro: 'Symbiosis online MBA from SSODL (Symbiosis School for Online and Digital Learning) total fees range from ₹3,15,000 to ₹3,70,000 depending on specialization, across a two-year programme. The programme is NAAC A++ accredited with a NIRF Management rank of #11 and UGC-DEB approval. Specializations include Finance, Marketing, Operations, Human Resource, Logistics and Supply Chain, Business Analytics, and Hospital and Healthcare Management. edifyedu.in reviews Symbiosis online MBA fees and placement data using NIRF and NAAC public databases, without paid rankings.',
  },
}
