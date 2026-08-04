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
  'lovely-professional-university-online': {
    title: 'LPU Online MBA 2026: Fees, Specializations, NAAC A++ Review | edifyedu.in',
    description: 'LPU online MBA fees, all specializations, NAAC A++ details. Lovely Professional University distance MBA reviewed honestly. Compare with Amity, Chandigarh, NMIMS.',
    h1: 'LPU Online MBA 2026: Fees, Review, and Specialization Guide',
    intro: 'LPU online MBA from Lovely Professional University carries NAAC A++ accreditation, one of the top-rated programs in North India. LPU MBA fees are structured across four semesters with EMI options available. Lovely Professional University MBA fees are competitive against similar NAAC A++ programs. The program spans 15+ specializations including Finance, HR, Marketing, and Operations, delivered via weekend live sessions and recorded backups. edifyedu.in presents LPU online MBA fees and accreditation data from UGC-DEB and NAAC public records, without referral commissions.',
  },
  'nmims-online': {
    title: 'NMIMS Online MBA 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'NMIMS online MBA fees and complete review. All specializations listed. NAAC A+ accredited. Compare NMIMS vs Amity vs Symbiosis for value. Zero-commission advice from edifyedu.in.',
    h1: 'NMIMS Online MBA 2026: Fees, Specializations, and Independent Review',
    intro: 'NMIMS online MBA is one of India\'s most searched management programs, offered under the School of Distance Learning with NAAC A+ accreditation. NMIMS online MBA fees cover two years of coursework across Finance, Marketing, HR, Operations, and other specializations. The university holds UGC-DEB approval, giving the degree full validity for employment and higher studies. edifyedu.in compares NMIMS online MBA fees against Amity, Symbiosis, and MAHE using public regulatory data. Candidates shortlisting NMIMS frequently compare fees and specialization counts before applying.',
  },

  // Sprint 1: fee-led rewrites for the 5 fee-stripping overrides + CU MBA reconciliation.
  // Fee numbers below come from lib/data.ts feeMin/feeMax as annotated.

  // Galgotias: data.ts:1252 feeMin=76200 (backed by pd.fees "₹76.2K"),
  // feeMax=86400 (NOT backed by pd.fees, therefore "From" framing).
  'galgotias-university-online': {
    title: 'Galgotias Online MBA Fees 2026: From ₹76,200 | edifyedu.in',
    description: 'Galgotias University online MBA fees from ₹76,200 (₹3,175/mo EMI). NAAC A+, UGC-DEB approved. Zero-commission, verified fee data. Compare vs Sharda, LPU, Chandigarh before you enrol.',
    h1: 'Galgotias University Online MBA 2026: Fees, Review, and Specializations',
    intro: 'Galgotias University online MBA total fees start from ₹76,200, one of the more affordable options for candidates comparing online MBA programs in North India. The programme is UGC-DEB approved and NAAC A+ accredited, delivered from Greater Noida with EMI plans from ₹3,175 per month. Specialisations span Finance, Marketing, HR, Operations, and Business Analytics. edifyedu.in compares Galgotias MBA fees and accreditation status against Sharda, LPU, and Chandigarh University using public UGC-DEB data only.',
  },

  // JAIN: data.ts:168 feeMin=160000, data.ts:169 feeMax=196000
  // NEEDS-VERIFICATION: pd.fees at data.ts:201 is '₹1.75L-₹1.96L', which starts higher than feeMin (₹1.6L).
  'jain-university-online': {
    title: 'JAIN Online MBA Fees 2026: ₹1.6L-₹1.96L Total | edifyedu.in',
    description: 'JAIN Deemed University online MBA fees ₹1,60,000 to ₹1,96,000 total. NAAC A++, UGC-DEB approved. Zero-commission, verified fee data. Compare vs Amity, LPU, Chandigarh before you enrol.',
    h1: 'Jain University Online MBA 2026: Fees, Review, and Specializations',
    intro: 'Jain (Deemed-to-be) University online MBA total fees range from ₹1,60,000 to ₹1,96,000 depending on specialization, spread across four semesters with EMI options through NBFC partners. The programme is NAAC A++ accredited with UGC-DEB approval for its distance format. Specializations include Finance, Marketing, HR, and Business Analytics, plus dual-specialisation tracks that combine two domains in one degree. edifyedu.in reviews Jain University online MBA fees using only public regulatory and NIRF data, with no paid ranking influence.',
  },

  // Chandigarh: data.ts:2151 feeMin=165000, data.ts:2152 feeMax=220000.
  // pd.fees (data.ts:2191) is the narrower "₹1.65L-₹1.80L" — that is the
  // verified programme range. Reference (feeMax=₹2.2L) is NOT backed by
  // pd.fees, so we display the narrower BACKED range per rule 3.
  // NEEDS-VERIFICATION: does the 25% Early Bird apply to MBA, and what is
  // the correct MBA net?
  'chandigarh-university-online': {
    title: 'Chandigarh MBA Fees 2026: ₹1.65L-₹1.8L | edifyedu.in',
    description: 'Chandigarh University online MBA fees ₹1,65,000 to ₹1,80,000. NAAC A+, NIRF #19, UGC-DEB approved. 25% Early Bird Scholarship available. Zero-commission, verified fee data.',
    h1: 'Chandigarh University Online MBA 2026: Fees, Scholarships, and Review',
    intro: 'Chandigarh University online MBA total fees range from ₹1,65,000 to ₹1,80,000 across four semesters. The programme is UGC-DEB approved and NAAC A+ accredited, with a NIRF University rank of #19. Chandigarh University runs a 25% Early Bird Scholarship for eligible early applicants, verifiable on the UGC-DEB and NAAC public registers. Live classes are delivered on weekends via the CUOnline platform. edifyedu.in compares Chandigarh University MBA fees using public university data, not paid rankings.',
  },

  'dy-patil-university-online': {
    title: 'DY Patil Online MBA 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'DY Patil University online MBA fees, review, and specializations 2026. Mumbai/Pune campus. NAAC A++ accredited. Compare vs Amity, Symbiosis, NMIMS.',
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
    title: 'Manipal (MAHE) Online MBA 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'MAHE Manipal online MBA fees, review, and specializations 2026. NAAC A++ accredited. Compare MAHE vs Amity, Symbiosis, NMIMS. Zero-commission advice.',
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
