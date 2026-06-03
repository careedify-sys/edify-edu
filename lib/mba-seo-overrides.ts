// Per-university SEO overrides for /universities/[id]/mba pages.
// Keyed by university slug. When present, these values replace the generic template
// in generateMetadata() and the H1/intro in UniHero/SectionAbout.

export interface MBASeoOverride {
  title: string
  description: string
  h1: string
  intro: string
}

export const MBA_SEO_OVERRIDES: Record<string, MBASeoOverride> = {
  'amity-university-online': {
    title: 'Amity Online MBA 2026: Fees ₹2,07,000, 19 Specializations, NAAC A+ Review | edifyedu.in',
    description: 'Amity University online MBA fees start at ₹2,07,000 total (₹8,906/mo EMI). 19 specializations. WASC + QAA accredited. Honest comparison vs NMIMS and Symbiosis. No commission advice.',
    h1: 'Amity University Online MBA 2026: Fees, Specializations, and Honest Review',
    intro: 'Amity University online MBA is among India\'s most recognized distance programs, with fees of ₹2,07,000 total over two years. The program holds NAAC A+ accreditation and UGC-DEB approval, covering 19 specializations from Finance to Business Analytics. Amity online MBA fees are payable in semester installments, with EMI from ₹8,906 per month. International accreditations from WASC and QAA strengthen the degree for candidates targeting global employers. edifyedu.in compares Amity online MBA fees against NMIMS, Symbiosis, and other approved universities using public data only.',
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
  'symbiosis-university-online': {
    title: 'Symbiosis Online MBA (SSODL) 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'Symbiosis SSODL online MBA fees and review 2026. NIRF #11 Management. All specializations covered. Compare vs NMIMS, Amity, MAHE. Independent zero-commission guide.',
    h1: 'Symbiosis Online MBA 2026: SSODL Fees, Specializations, and Honest Review',
    intro: 'Symbiosis online MBA from SSODL (Symbiosis School of Online Digital Learning) holds NAAC A grade accreditation and a NIRF #11 Management rank. The program covers specializations including Finance, Marketing, Operations, and HR. Symbiosis online MBA fees are structured in semester installments with EMI support. SSODL operates under Symbiosis International University, a UGC-DEB approved institution recognized by Indian and global employers. edifyedu.in reviews Symbiosis online MBA fees and placement data using NIRF and NAAC public databases, without paid rankings.',
  },
  'jain-university-online': {
    title: 'Jain Online MBA 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'Jain University online MBA fees, specializations, and honest review 2026. NAAC A++ accredited. Compare vs Amity, LPU, Chandigarh. Zero-commission advice.',
    h1: 'Jain University Online MBA 2026: Fees, Review, and Specializations',
    intro: 'Jain University online MBA comes from a NAAC A++ accredited institution with UGC-DEB approval for its distance programs. Jain online MBA fees are structured across four semesters with EMI options through NBFC partners. The program spans 12+ specializations including Finance, Marketing, HR, and Business Analytics. Jain University MBA fees are mid-range among NAAC A++ programs, making it a popular shortlist option alongside Amity and LPU. edifyedu.in reviews Jain University online MBA fees using only public regulatory and NIRF data.',
  },
  'chandigarh-university-online': {
    title: 'Chandigarh University Online MBA 2026: Fees ₹1,31,250 After Scholarship | edifyedu.in',
    description: 'Chandigarh University online MBA fees ₹1,31,250 after 25% early bird scholarship. NAAC A+, NIRF #19. All specializations. Honest review and comparison.',
    h1: 'Chandigarh University Online MBA 2026: Fees, Scholarships, and Review',
    intro: 'Chandigarh University online MBA is offered with UGC-DEB approval and NAAC A+ accreditation, with a NIRF rank of #19 among Indian universities. The base fee reduces to ₹1,31,250 after the 25% early-bird scholarship. Chandigarh University online MBA specializations span Marketing, Finance, HR, Operations, and Business Analytics. The program delivers live classes on weekends via the CUOnline platform. edifyedu.in compares Chandigarh University MBA fees and scholarship terms using public university data, not paid rankings.',
  },
  'galgotias-university-online': {
    title: 'Galgotias University Online MBA 2026: Fees, Review | edifyedu.in',
    description: 'Galgotias University online MBA fees, specializations, and review 2026. UGC-DEB approved. Compare with Sharda, LPU, Chandigarh. Honest zero-commission guide.',
    h1: 'Galgotias University Online MBA 2026: Fees and Honest Review',
    intro: 'Galgotias University online MBA is a UGC-DEB approved program from a NAAC-accredited institution in Greater Noida. Galgotias University MBA fees are among the more affordable options for candidates comparing online MBA programs in North India. The program spans specializations in Finance, Marketing, HR, Operations, and Data Analytics, with weekend live sessions and flexible EMI plans. edifyedu.in compares Galgotias MBA fees and accreditation status against Sharda, LPU, and Chandigarh University using public UGC-DEB data only.',
  },
  'dy-patil-university-online': {
    title: 'DY Patil Online MBA 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'DY Patil University online MBA fees, review, and specializations 2026. Mumbai/Pune campus. NAAC A++ accredited. Compare vs Amity, Symbiosis, NMIMS.',
    h1: 'DY Patil Online MBA 2026: Fees, Review, and Specialization Guide',
    intro: 'DY Patil University online MBA from its Navi Mumbai campus carries NAAC A++ accreditation and UGC-DEB approval. DY Patil online MBA fees cover a two-year program spanning Finance, Marketing, HR, and Operations specializations. The university\'s proximity to Mumbai\'s business district gives the degree employer visibility across Maharashtra. edifyedu.in reviews DY Patil online MBA fees against Amity, Symbiosis, and NMIMS using public NAAC and UGC-DEB data. No paid rankings or referral commissions influence this comparison.',
  },
  'ignou-online': {
    title: 'IGNOU Online MBA 2026: Fees, Admission, Review | edifyedu.in',
    description: 'IGNOU online MBA fees, admission process, and honest review 2026. Most affordable MBA option in India. Compare IGNOU vs Amity, LPU, Galgotias.',
    h1: 'IGNOU Online MBA 2026: Fees, Admission Process, and Review',
    intro: 'IGNOU online MBA is the most affordable UGC-DEB approved management program in India, offered by the country\'s largest open university. IGNOU online MBA fees are structured over two to five years, with flexibility to study at your own pace. The program covers Finance, Marketing, HR, and Production Management specializations. Admission runs through January and July cycles. edifyedu.in compares IGNOU online MBA fees and program structure against private university options like Amity and LPU using public data only.',
  },
  'manipal-academy-higher-education-online': {
    title: 'Manipal (MAHE) Online MBA 2026: Fees, Review, Specializations | edifyedu.in',
    description: 'MAHE Manipal online MBA fees, review, and specializations 2026. NAAC A++ accredited. Compare MAHE vs Amity, Symbiosis, NMIMS. Zero-commission advice.',
    h1: 'MAHE Manipal Online MBA 2026: Fees, Specializations, and Review',
    intro: 'MAHE Manipal online MBA from Manipal Academy of Higher Education carries NAAC A++ accreditation and strong recognition across India\'s IT and consulting sectors. Manipal online MBA fees cover a two-year program with specializations in Finance, Marketing, HR, Business Analytics, and Digital Business. The UGC-DEB approved degree is delivered via the Online Manipal platform, with weekend sessions and on-demand recordings. edifyedu.in compares MAHE online MBA fees against Amity, Symbiosis, and NMIMS using public accreditation and NIRF data.',
  },
  'sikkim-manipal-university-online': {
    title: 'Sikkim Manipal (SMU) Online MBA 2026: Fees, Review | edifyedu.in',
    description: 'SMU Sikkim Manipal University online MBA fees and review 2026. All specializations. UGC-DEB approved. Compare SMU vs Amity, LPU, MAHE.',
    h1: 'Sikkim Manipal University (SMU) Online MBA 2026: Fees and Review',
    intro: 'Sikkim Manipal University online MBA is one of India\'s oldest distance learning programs, now delivered under the UGC-DEB framework with updated digital infrastructure. SMU online MBA covers Finance, Marketing, HR, Operations, and Business Analytics specializations. Sikkim Manipal University online MBA fees are structured across four semesters with EMI options available. The university holds UGC-DEB approval and NAAC accreditation, giving the degree validity for private sector employment. edifyedu.in reviews SMU online MBA using public regulatory data only.',
  },
}
