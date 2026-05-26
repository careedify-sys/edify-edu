import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { UNIS_SLIM, formatFeeSlim } from '@/lib/data-slim'
import { getShortUniversityName } from '@/lib/format'

// ── Spec definitions ────────────────────────────────────────────────────────

interface SpecDef {
  displayName: string
  canonicalName: string
  targetKeyword: string
  intro: string
  why2026: string[]
  salaryRange: string
  entryRoles: string[]
  midRoles: string[]
  industries: string[]
  eligibility: string
  admission: string
  specVariantMatch: (s: string) => boolean
  supportingBlogs: { slug: string; title: string; desc: string }[]
  careerBlogSlug: string
  faqs: { q: string; a: string }[]
}

const SPECS: Record<string, SpecDef> = {
  'hr-management': {
    displayName: 'HR Management',
    canonicalName: 'Online MBA HR Management',
    targetKeyword: 'online MBA HR management India 2026',
    intro: `An Online MBA in HR Management prepares professionals for strategic people-management roles in any industry. The 2-year UGC-DEB approved programme covers talent acquisition, performance management, compensation design, labour law, organisational development, and HR analytics. It is designed for working HR executives, recruiters, and L&D professionals who want to move into HRBP or CHRO-track positions without leaving their current jobs.`,
    why2026: [
      'India added over 1.2 crore new organised-sector jobs in 2023-24, creating sustained demand for HR professionals.',
      'HR analytics and HRIS tools are now core hiring criteria, and an MBA bridges the skill gap faster than a certificate course.',
      'Remote and hybrid work has made HR strategy a board-level priority, lifting average HR Manager salaries by 18% since 2022.',
      'PSU and government sector roles increasingly require a full MBA degree, not a diploma, for HR cadre positions.',
    ],
    salaryRange: '₹4L to ₹18L per annum depending on sector and seniority',
    entryRoles: ['HR Executive', 'Recruitment Executive', 'Compensation Analyst', 'L&D Coordinator'],
    midRoles: ['HR Manager', 'HRBP', 'Talent Acquisition Head', 'Compensation Manager'],
    industries: ['IT Services', 'Manufacturing', 'Banking', 'FMCG', 'Healthcare', 'Consulting'],
    eligibility: `Minimum 50% marks in any bachelor's degree (45% for reserved categories). Most UGC-DEB approved universities accept graduates from any stream. Work experience is preferred but not mandatory for online programmes. No entrance exam is required at most participating universities.`,
    admission: `Applications open in January-February and July-August each year. Submit marksheets, ID proof, and a short statement of purpose. Enrolment is confirmed within 3-5 working days. Fees are paid in semester instalments or via 0% EMI options.`,
    specVariantMatch: (s: string) => {
      const n = s.toLowerCase()
      return n.includes('human resource') || n === 'hr management' || n.includes('hr management') || n === 'hrm' || n.includes('human resources')
    },
    supportingBlogs: [
      { slug: 'mba-hr-career-salary-scope-2026', title: 'MBA HR Career, Salary and Scope India 2026', desc: 'Deep-dive into HR career paths, salary benchmarks at each level, and top hiring sectors.' },
      { slug: 'mba-hr-management-online-india-2026', title: 'MBA in HR Management Online India 2026', desc: 'Compares top universities, fees, curriculum depth, and placement records for the HR specialisation.' },
    ],
    careerBlogSlug: 'mba-hr-career-salary-scope-2026',
    faqs: [
      { q: 'Is an Online MBA HR Management degree valid in India?', a: 'Yes. UGC-DEB approved online MBA degrees carry the same legal standing as regular on-campus MBA degrees. They are accepted by government and private employers.' },
      { q: 'Which online universities offer MBA HR Management?', a: 'MAHE, NMIMS, Amrita, JAIN, Chandigarh University, LPU, and over 20 other UGC-DEB approved universities offer MBA with HR Management specialisation. Fees range from ₹65K to ₹3.7L for the full programme.' },
      { q: 'What is the salary after an Online MBA HR Management?', a: 'Entry-level HR roles pay ₹4L to ₹7L per annum. HR Managers with 3-5 years of experience earn ₹8L to ₹14L. Senior HRBP and CHRO-track roles command ₹15L to ₹25L.' },
      { q: 'Do I need work experience to join an Online MBA HR Management?', a: 'Most online programmes do not require prior work experience. However, universities like NMIMS and Symbiosis may prefer candidates with 1-2 years of experience.' },
      { q: 'How is Online MBA HR different from a PGDM in HR?', a: 'An Online MBA is a full degree awarded by a UGC-recognised university. A PGDM is a diploma, typically awarded by AICTE-approved autonomous institutes. For PSU recruitment and government jobs, a degree is generally preferred over a diploma.' },
      { q: 'Can I switch from a non-HR background to HR via an online MBA?', a: 'Yes. An online MBA HR is regularly chosen by professionals from IT, sales, operations, and finance who want to pivot into people management. The curriculum starts from fundamentals.' },
      { q: 'What certifications should I stack alongside an Online MBA HR?', a: 'SHRM-CP, PHRi (HRCI), and Workday HCM certifications are valued by large IT and BFSI employers. Completing at least one alongside your MBA significantly strengthens your profile.' },
    ],
  },

  'supply-chain-management': {
    displayName: 'Supply Chain Management',
    canonicalName: 'Online MBA Supply Chain Management',
    targetKeyword: 'online MBA supply chain management India 2026',
    intro: `An Online MBA in Supply Chain Management covers procurement, warehouse management, global logistics, supply chain analytics, and green supply chain practices. The UGC-DEB approved 2-year programme suits professionals in e-commerce fulfilment, 3PL, FMCG distribution, and manufacturing supply chain who want to move into managerial and leadership roles without pausing their careers.`,
    why2026: [
      'India\'s e-commerce sector is expected to reach $150B by 2027, creating over 5 lakh new supply chain jobs annually.',
      'Government PLI schemes for manufacturing and the PM Gati Shakti logistics plan are expanding formal SCM hiring at scale.',
      'Supply chain disruptions post-COVID made risk management and digital SCM skills board-level priorities.',
      'Average SCM Manager salaries grew by 22% between 2022 and 2025 due to talent shortages at the mid-management level.',
    ],
    salaryRange: '₹5L to ₹20L per annum depending on sector and seniority',
    entryRoles: ['Supply Chain Coordinator', 'Logistics Executive', 'Procurement Officer', 'Inventory Analyst'],
    midRoles: ['Supply Chain Manager', 'Logistics Manager', 'VP Supply Chain', 'CSCO track'],
    industries: ['E-commerce', '3PL', 'FMCG', 'Auto', 'Pharma', 'Government Logistics'],
    eligibility: `Minimum 50% marks in any bachelor's degree. No specific stream requirement. Work experience in logistics, procurement, or operations is useful but not mandatory. No entrance exam is required at most UGC-DEB approved online programmes.`,
    admission: `Applications open twice a year (January-February and July-August). Documents required include graduation marksheets, ID proof, and a statement of purpose. Fees are payable in semester instalments. Most universities offer 0% EMI options.`,
    specVariantMatch: (s: string) => {
      const n = s.toLowerCase()
      return n.includes('supply chain') || n.includes('logistics scm') || n.includes('logistics supply chain') || n.includes('logistics & supply chain') || n.includes('logistics and supply chain')
    },
    supportingBlogs: [
      { slug: 'online-mba-supply-chain-management-india-2026', title: 'Online MBA Supply Chain Management India 2026', desc: 'Compares universities, fees, curriculum, and career outcomes for the SCM specialisation.' },
      { slug: 'mba-operations-management-career-2026', title: 'MBA Operations Management Career 2026', desc: 'Career paths, salary data, and sector analysis for operations and supply chain roles.' },
    ],
    careerBlogSlug: 'mba-operations-management-career-2026',
    faqs: [
      { q: 'Is Online MBA Supply Chain Management UGC approved?', a: 'Yes, when offered by a UGC-DEB approved university. Always verify the university\'s approval status on deb.ugc.ac.in before enrolling.' },
      { q: 'Which online universities offer MBA Supply Chain Management?', a: 'Chandigarh University, MAHE, UPES, Parul University, Symbiosis SSODL, MUJ, JAIN, and LPU are among the leading options. Fees range from ₹1.5L to ₹3.7L for the full 2-year programme.' },
      { q: 'What is the salary after an Online MBA SCM?', a: 'Entry-level supply chain roles pay ₹5L to ₹8L per annum. SCM Managers with 3-5 years\' experience earn ₹10L to ₹15L. Senior VP and CSCO roles command ₹18L to ₹30L.' },
      { q: 'Is MBA Operations Management the same as MBA SCM?', a: 'They overlap significantly but are not identical. Operations focuses on internal process management while SCM includes external vendor, logistics, and distribution networks. Some universities offer a combined Operations and Supply Chain specialisation.' },
      { q: 'What certifications complement an Online MBA SCM?', a: 'APICS CSCP, APICS CPIM, and Lean Six Sigma (Green Belt or Black Belt) are valued by recruiters in manufacturing, FMCG, and e-commerce fulfilment roles.' },
      { q: 'Can online MBA SCM graduates get PSU jobs?', a: 'Yes. UGC-DEB approved online MBA degrees are eligible for PSU recruitment. Government logistics and infrastructure roles often accept online MBA candidates.' },
      { q: 'Is UPES a good university for MBA Supply Chain Management?', a: 'UPES (NIRF #45, NAAC A, WES approved) has a domain specialisation in energy and logistics. Its MBA SCM curriculum integrates petroleum logistics and infrastructure management, making it distinct from generalist SCM programmes.' },
    ],
  },

  'business-analytics': {
    displayName: 'Business Analytics',
    canonicalName: 'Online MBA Business Analytics',
    targetKeyword: 'online MBA business analytics India 2026',
    intro: `An Online MBA in Business Analytics combines management fundamentals with data skills including statistical modelling, data visualisation, Python/R, predictive analytics, and business intelligence tools. The UGC-DEB approved 2-year programme suits analysts, MIS executives, and mid-career professionals who want to move into analytics leadership and data strategy roles.`,
    why2026: [
      'India\'s analytics market is projected to reach $16B by 2027. Demand for analytics managers is growing at 28% CAGR.',
      'Business Analyst and Data Strategy Manager roles now command 35-40% salary premiums over equivalent general management positions.',
      'Banking, telecom, e-commerce, and FMCG are investing in analytics infrastructure, creating sustained mid-management demand.',
      'An MBA in Business Analytics is preferred over a standalone data science course for managerial and strategy roles.',
    ],
    salaryRange: '₹6L to ₹22L per annum depending on sector and seniority',
    entryRoles: ['Business Analyst', 'Data Analyst', 'BI Analyst', 'MIS Executive'],
    midRoles: ['Analytics Manager', 'BI Manager', 'Data Strategy Manager', 'Head of Analytics'],
    industries: ['IT Services', 'Banking', 'E-commerce', 'Retail', 'Telecom', 'Consulting'],
    eligibility: `Minimum 50% marks in any bachelor's degree. Math or statistics background is an advantage but not mandatory. Work experience in analytics, MIS, or data roles strengthens the application. No entrance exam required at most UGC-DEB approved online programmes.`,
    admission: `Applications open January-February and July-August. Key documents are graduation marksheets, ID proof, and a statement of purpose. Seat allocation is done on a rolling basis. Most universities offer EMI options of ₹5,000 to ₹13,000 per month.`,
    specVariantMatch: (s: string) => {
      const n = s.toLowerCase()
      return n.includes('business analytics') || n.includes('business intelligence') || n.includes('analytics and data science')
    },
    supportingBlogs: [
      { slug: 'mba-data-science-analytics-career-2026', title: 'MBA Data Science and Analytics Career India 2026', desc: 'Career paths, salary benchmarks, and sector analysis for analytics professionals.' },
      { slug: 'online-mba-business-data-analytics-india-2026', title: 'Online MBA Business Data Analytics India 2026', desc: 'Compares top universities, fees, curriculum depth, and analytics tools taught.' },
    ],
    careerBlogSlug: 'mba-data-science-analytics-career-2026',
    faqs: [
      { q: 'Is Online MBA Business Analytics valid for IT and banking jobs?', a: 'Yes. UGC-DEB approved online MBA degrees are accepted by IT services, banking, and consulting employers across India and internationally.' },
      { q: 'Which online universities offer MBA Business Analytics?', a: 'MAHE, JAIN, Amrita, Chandigarh University, UPES, Parul University, Symbiosis SSODL, MUJ, SRM, and DSU are among the leading options.' },
      { q: 'What tools are taught in MBA Business Analytics?', a: 'Most curricula include Python, R, Tableau, Power BI, SQL, Excel advanced modelling, and SPSS. MAHE and JAIN also include machine learning fundamentals in their analytics syllabi.' },
      { q: 'MBA Business Analytics vs MBA Data Science: which is better?', a: 'MBA Business Analytics focuses on using data for business decisions (BI, strategy, reporting). MBA Data Science goes deeper into ML model building. If you want to lead analytics teams, Business Analytics is usually sufficient. If you plan to build models, Data Science is better.' },
      { q: 'What salary can I expect after an Online MBA Business Analytics?', a: 'Entry-level business analysts earn ₹6L to ₹9L per annum. Analytics managers with 3-5 years\' experience earn ₹12L to ₹18L. Head of Analytics and CDO-track roles pay ₹20L and above.' },
      { q: 'Do I need a technical background for MBA Business Analytics?', a: 'No. Most universities design the curriculum for non-technical managers. Quantitative aptitude and Excel proficiency are helpful, but prior coding experience is not required.' },
      { q: 'Is NMIMS good for MBA Business Analytics?', a: 'NMIMS (NIRF #52, NAAC A++, WES recognised) offers "Operations and Data Sciences Management" which is its analytics-focused MBA track. The programme has strong Mumbai-based industry connections in BFSI, FMCG, and consulting sectors.' },
    ],
  },

  'healthcare-management': {
    displayName: 'Healthcare Management',
    canonicalName: 'Online MBA Healthcare Management',
    targetKeyword: 'online MBA healthcare management India 2026',
    intro: `An Online MBA in Healthcare Management prepares professionals for administrative and strategic roles in hospitals, healthcare chains, pharma companies, and health insurance organisations. The UGC-DEB approved 2-year programme covers hospital operations, health informatics, quality management (NABH), healthcare finance, medical records management, and public health policy.`,
    why2026: [
      'India\'s healthcare market is expected to reach $638B by 2025. Hospital administrators and health managers are in sustained demand.',
      'The Ayushman Bharat expansion and 50,000 new hospital beds being added across tier-2 and tier-3 cities require qualified healthcare managers.',
      'NABH accreditation has become mandatory for government empanelment, creating demand for quality managers with formal training.',
      'Pharma and health insurance sectors are growing at 12-15% CAGR, opening lateral management roles for MBA Healthcare graduates.',
    ],
    salaryRange: '₹4L to ₹18L per annum depending on role and hospital tier',
    entryRoles: ['Hospital Administrator (Junior)', 'Healthcare Operations Executive', 'Quality Coordinator', 'Medical Records Manager'],
    midRoles: ['Hospital Administrator', 'Operations Manager', 'Quality Manager (NABH)', 'Healthcare Cluster Head'],
    industries: ['Hospitals', 'Healthcare Chains', 'Pharma', 'Health Insurance', 'Government Health'],
    eligibility: `Minimum 50% marks in any bachelor's degree. Both medical (MBBS, BDS, BSc Nursing, BAMS) and non-medical (BBA, B.Com, B.Sc) graduates can apply. Work experience in a clinical or administrative healthcare setting is preferred but not mandatory.`,
    admission: `Applications open January-February and July-August. Required documents include graduation marksheets, ID proof, and a statement of purpose. Healthcare-background applicants may receive direct admission at some universities. Fees are payable in semester instalments.`,
    specVariantMatch: (s: string) => {
      const n = s.toLowerCase()
      return n.includes('healthcare') || n.includes('hospital management') || n.includes('hospital health') || n.includes('hospital and health') || n.includes('pharma health') || n === 'hospital administration'
    },
    supportingBlogs: [
      { slug: 'online-mba-hospital-healthcare-management-india-2026', title: 'Online MBA Hospital and Healthcare Management India 2026', desc: 'Compares universities, fees, curriculum, and career outcomes for the healthcare specialisation.' },
      { slug: 'mba-pharmaceutical-management-online-india-2026', title: 'MBA in Pharmaceutical Management Online India 2026', desc: 'Career paths and university comparison for pharma-focused management roles.' },
    ],
    careerBlogSlug: 'online-mba-hospital-healthcare-management-india-2026',
    faqs: [
      { q: 'Is Online MBA Healthcare Management valid for hospital jobs?', a: 'Yes. UGC-DEB approved online MBA degrees are recognised by hospitals, healthcare chains, and government health organisations across India.' },
      { q: 'Which online universities offer MBA Healthcare Management?', a: 'MAHE, Parul University, Chandigarh University, Galgotias University, Symbiosis SSODL, and DY Patil University are among the leading options. Fees range from ₹60K to ₹3.7L for the full 2-year programme.' },
      { q: 'Can a non-medical graduate do an MBA Healthcare Management?', a: 'Yes. Most universities accept graduates from any stream including commerce, science, engineering, and arts. A non-medical background is no barrier for hospital administration roles.' },
      { q: 'What is the salary after an Online MBA Healthcare Management?', a: 'Entry-level hospital administration roles pay ₹4L to ₹7L per annum. Operations managers earn ₹8L to ₹13L. CEO-track and cluster head roles in large hospital chains pay ₹15L to ₹25L.' },
      { q: 'Is MBA Healthcare Management the same as MHA (Masters in Hospital Administration)?', a: 'They are different. MHA is a specialised programme focused entirely on healthcare. MBA Healthcare Management is a general management degree with a healthcare specialisation. MBA has broader applicability across sectors if you later change direction.' },
      { q: 'What certifications support MBA Healthcare Management?', a: 'NABH Lead Assessor certification, CPHIMS (healthcare informatics), and Six Sigma (Green Belt) are valued in hospital quality and operations roles. Pharma sector roles benefit from Regulatory Affairs certifications.' },
      { q: 'Does MAHE offer MBA Healthcare Management online?', a: 'Yes. MAHE (NIRF #3 overall, NAAC A++) offers MBA with Healthcare Management specialisation through its online platform. It also offers Pharmaceutical Management as a distinct track.' },
    ],
  },

  'fintech': {
    displayName: 'FinTech',
    canonicalName: 'Online MBA FinTech',
    targetKeyword: 'online MBA fintech India 2026',
    intro: `An Online MBA in FinTech prepares professionals for leadership roles at the intersection of finance and technology. The UGC-DEB approved 2-year programme covers digital payments, blockchain fundamentals, lending-tech, BFSI regulation, risk analytics, and product management for financial services. It suits banking executives, payments professionals, and finance graduates who want to move into digital finance leadership without pausing their careers.`,
    why2026: [
      'India processed over 13,000 crore UPI transactions in 2024-25. FinTech product and operations roles are growing at 35% CAGR.',
      'RBI and SEBI digital regulation frameworks are creating sustained demand for professionals with both finance and technology fluency.',
      'Global FinTech investment in India exceeded $2B in 2024, generating senior management openings at payments, lending-tech, and neo-bank firms.',
      'PSU banks and NBFCs are hiring digital transformation managers with formal MBA FinTech or Finance credentials at premium packages.',
    ],
    salaryRange: '₹8L to ₹25L per annum depending on role and sector',
    entryRoles: ['FinTech Analyst', 'Payments Operations Executive', 'BFSI Tech Analyst', 'Digital Banking Associate'],
    midRoles: ['FinTech Product Manager', 'Digital Payments Manager', 'BFSI Risk Manager', 'Digital Transformation Lead'],
    industries: ['Payments', 'Neo-banks', 'NBFC', 'PSU Banks', 'Insurance-Tech', 'Lending-Tech'],
    eligibility: `Minimum 50% marks in any bachelor's degree. Finance, engineering, or commerce background is an advantage. Work experience in banking, payments, or technology roles strengthens the application. No entrance exam is required at most UGC-DEB approved online programmes.`,
    admission: `Applications open January-February and July-August. Required documents include graduation marksheets, ID proof, and a statement of purpose. Most universities offer semester-wise fee payment and 0% EMI options.`,
    specVariantMatch: (s: string) => {
      const n = s.toLowerCase()
      return n.includes('fintech') || n.includes('digital banking') || n.includes('digital finance') || n.includes('banking technology') || n.includes('financial technology')
    },
    supportingBlogs: [
      { slug: 'online-mba-fintech-india-2026', title: 'Online MBA FinTech India 2026', desc: 'Compares universities, fees, curriculum, and career outcomes for the MBA FinTech specialisation.' },
      { slug: 'mba-finance-career-salary-scope-2026', title: 'MBA Finance Career, Salary and Scope India 2026', desc: 'Career paths, salary benchmarks, and sector analysis for finance and FinTech roles.' },
    ],
    careerBlogSlug: 'online-mba-fintech-india-2026',
    faqs: [
      { q: 'Is an Online MBA FinTech degree valid in India?', a: 'Yes. UGC-DEB approved online MBA degrees carry the same legal standing as on-campus MBA degrees and are accepted by banks, NBFCs, and FinTech companies.' },
      { q: 'Which online universities offer MBA FinTech?', a: 'MAHE, Amrita, UPES, and select UGC-DEB approved universities offer MBA with FinTech or Digital Finance tracks. Always verify the specialisation name and UGC-DEB approval status before enrolling.' },
      { q: 'What is the salary after an Online MBA FinTech?', a: 'Entry-level FinTech roles pay ₹8L to ₹12L per annum. Mid-level product and risk managers earn ₹14L to ₹20L. Senior digital transformation and BFSI leadership roles command ₹22L to ₹35L.' },
      { q: 'Do I need a tech background for MBA FinTech?', a: 'No. MBA FinTech is designed for finance professionals who want technology fluency, not deep engineering. You will learn product thinking, digital payments architecture, and data-driven decision-making at the business level.' },
      { q: 'MBA FinTech vs MBA Finance: which is better?', a: 'MBA Finance is broader and opens more roles across banking, investment, and corporate finance. MBA FinTech is more specialised for digital payments, neo-banking, and lending-tech roles. Choose based on your 5-year target sector.' },
      { q: 'What certifications complement MBA FinTech?', a: 'CFA Level 1, FRM, AWS Cloud Practitioner, and Certified FinTech Professional (ICICI Academy) are valued by payments and BFSI tech employers. Python for finance certification also strengthens analytics-track profiles.' },
      { q: 'Is MBA FinTech useful for PSU bank jobs?', a: 'PSU banks are actively hiring digital transformation managers. An online MBA from a UGC-DEB approved university qualifies candidates for these roles. Direct BFSI experience plus the MBA credential is the strongest profile combination.' },
    ],
  },
}

// ── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(SPECS).map(spec => ({ spec }))
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: { spec: string } }
): Promise<Metadata> {
  const def = SPECS[params.spec]
  if (!def) return { title: 'Not Found' }

  const uniCount = UNIS_SLIM.filter(u =>
    u.programs.includes('MBA') && (u as any).mbaSpecs?.some((s: string) => def.specVariantMatch(s))
  ).length

  const title = `Online MBA ${def.displayName} 2026: ${uniCount}+ Colleges, Fees and Career | EdifyEdu`
  const description = `${uniCount}+ UGC-DEB approved universities offer online MBA ${def.displayName} in India. Compare fees, curriculum, career outcomes, and NIRF ranks. Verify accreditation free at edifyedu.in.`
  const canonical = `https://edifyedu.in/programs/mba/specializations/${params.spec}`

  return {
    title: { absolute: title },
    description,
    keywords: [def.targetKeyword, `mba ${def.displayName.toLowerCase()} india 2026`, `online mba ${def.displayName.toLowerCase()}`, `best mba ${def.displayName.toLowerCase()} india`],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `Online MBA ${def.displayName} India 2026` }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MBASpecialisationHubPage(
  { params }: { params: { spec: string } }
) {
  const def = SPECS[params.spec]
  if (!def) notFound()

  const allMbaUnis = UNIS_SLIM.filter(u => u.programs.includes('MBA'))

  const unis = allMbaUnis
    .filter(u => (u as any).mbaSpecs?.some((s: string) => def.specVariantMatch(s)))
    .sort((a, b) => (a.nirf < 500 ? a.nirf : 999) - (b.nirf < 500 ? b.nirf : 999))
    .slice(0, 10)

  const feeMin = unis.length ? Math.min(...unis.map(u => u.feeMin).filter(f => f > 0)) : 0
  const feeMax = unis.length ? Math.max(...unis.map(u => u.feeMax).filter(f => f > 0)) : 0

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Programs', item: 'https://edifyedu.in/programs' },
      { '@type': 'ListItem', position: 3, name: 'Online MBA', item: 'https://edifyedu.in/programs/mba' },
      { '@type': 'ListItem', position: 4, name: def.displayName, item: `https://edifyedu.in/programs/mba/specializations/${params.spec}` },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: def.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="bg-surface-1 min-h-screen pt-4 pb-20">
        <div className="container-custom">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 py-4 text-xs text-ink-3 flex-wrap">
            <Link href="/" className="hover:text-navy">Home</Link>
            <ChevronRight size={12} />
            <Link href="/programs" className="hover:text-navy">Programs</Link>
            <ChevronRight size={12} />
            <Link href="/programs/mba" className="hover:text-navy">Online MBA</Link>
            <ChevronRight size={12} />
            <span className="text-amber font-bold">{def.displayName}</span>
          </div>

          {/* Hero */}
          <div className="card p-6 md:p-10 mt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber/10 text-amber-text text-[10px] font-bold tracking-wider uppercase rounded-full mb-4">
              UGC-DEB Approved 2026
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy leading-tight">
              Online MBA{' '}
              <span className="text-amber-text">{def.displayName}</span>
              {' '}in India 2026
            </h1>
            <p className="mt-5 text-lg text-ink-2 max-w-2xl leading-relaxed">{def.intro}</p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Universities', value: `${unis.length}+` },
                { label: 'Fee Range', value: `${formatFeeSlim(feeMin)} to ${formatFeeSlim(feeMax)}` },
                { label: 'Duration', value: '2 Years' },
                { label: 'Salary Range', value: def.salaryRange.split(' ')[0] + '...' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Why section */}
          <section className="card p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold text-navy mb-4">Why MBA {def.displayName} in 2026?</h2>
            <ul className="space-y-3">
              {def.why2026.map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-ink-2">
                  <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* University fee table */}
          {unis.length > 0 && (
            <section className="card p-6 md:p-8 mt-6">
              <h2 className="text-xl font-bold text-navy mb-1">Top Universities Offering MBA {def.displayName}</h2>
              <p className="text-sm text-ink-3 mb-5">
                UGC-DEB approved universities sorted by NIRF rank. Fees shown are indicative total programme fees.
                Verify the current fee at the official university portal before enrolling.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-navy text-white">
                      <th className="text-left p-3 font-semibold rounded-tl-lg">University</th>
                      <th className="text-center p-3 font-semibold">NIRF</th>
                      <th className="text-center p-3 font-semibold">NAAC</th>
                      <th className="text-right p-3 font-semibold rounded-tr-lg">Total Fees (indicative)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unis.map((u, i) => (
                      <tr key={u.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-3 font-medium text-navy">
                          <Link href={`/universities/${u.id}/mba`} className="hover:text-amber transition-colors">
                            {getShortUniversityName(u.name)}
                          </Link>
                        </td>
                        <td className="p-3 text-center text-ink-2">
                          {u.nirf < 500 ? `#${u.nirf}` : 'NR'}
                        </td>
                        <td className="p-3 text-center text-ink-2">{u.naac}</td>
                        <td className="p-3 text-right font-semibold text-navy">
                          {u.feeMin === u.feeMax
                            ? formatFeeSlim(u.feeMin)
                            : `${formatFeeSlim(u.feeMin)} to ${formatFeeSlim(u.feeMax)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Fees are sourced from university portals as of 2026. Always verify the current fee at the official portal.
                Edify presents public data with no referral fees or paid rankings.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                <Link href="/compare" className="text-sm font-semibold text-amber hover:underline">
                  Compare these universities side-by-side
                </Link>
                <Link href="/fees?program=MBA" className="text-sm font-semibold text-ink-2 hover:text-amber">
                  See full MBA fee comparison table
                </Link>
              </div>
            </section>
          )}

          {/* Career paths */}
          <section className="card p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold text-navy mb-5">Career Path: MBA {def.displayName}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-3">Entry Level (0-3 Years)</div>
                <ul className="space-y-2">
                  {def.entryRoles.map((role, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ink-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-text mb-3">Mid-Senior Level (3-7 Years)</div>
                <ul className="space-y-2">
                  {def.midRoles.map((role, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ink-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <div className="text-sm text-ink-2">
                <span className="font-bold text-navy">Key industries: </span>
                {def.industries.join(', ')}
              </div>
              <div className="mt-2 text-sm text-ink-2">
                <span className="font-bold text-navy">Salary range: </span>
                {def.salaryRange}
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/blog/${def.careerBlogSlug}`} className="text-sm font-semibold text-amber hover:underline">
                Read the detailed career and salary guide
              </Link>
            </div>
          </section>

          {/* Eligibility + Admission */}
          <section className="card p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold text-navy mb-4">Eligibility and Admission Process</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-bold text-navy mb-3">Eligibility</h3>
                <p className="text-sm text-ink-2 leading-relaxed">{def.eligibility}</p>
              </div>
              <div>
                <h3 className="text-base font-bold text-navy mb-3">Admission Process</h3>
                <p className="text-sm text-ink-2 leading-relaxed">{def.admission}</p>
              </div>
            </div>
          </section>

          {/* Supporting blogs */}
          <section className="card p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold text-navy mb-4">Read More: {def.displayName} Guides</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {def.supportingBlogs.map(blog => (
                <Link
                  key={blog.slug}
                  href={`/blog/${blog.slug}`}
                  className="flex flex-col gap-2 p-5 bg-white border border-border rounded-xl hover:border-amber hover:shadow-md transition-all no-underline group"
                >
                  <div className="text-sm font-bold text-navy group-hover:text-amber transition-colors leading-snug">
                    {blog.title}
                  </div>
                  <div className="text-xs text-ink-3 leading-relaxed">{blog.desc}</div>
                  <div className="text-xs font-semibold text-amber mt-1">Read guide</div>
                </Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="cta-box mt-6 p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-extrabold text-white mb-3">
              Not Sure Which University to Choose?
            </h2>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
              Edify compares public UGC, NAAC, and NIRF data with no paid rankings and no referral commissions.
              Talk to our team for a free, unbiased shortlist.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              Get Free Guidance
            </Link>
            <p className="mt-3 text-xs text-slate-400">No spam. No referral pressure. Public data only.</p>
          </section>

          {/* FAQ */}
          <section className="card p-6 md:p-8 mt-6">
            <h2 className="text-xl font-bold text-navy mb-5">
              Frequently Asked Questions: MBA {def.displayName}
            </h2>
            <div className="space-y-4">
              {def.faqs.map((faq, i) => (
                <details key={i} className="border border-border rounded-xl overflow-hidden">
                  <summary className="p-4 font-semibold text-navy cursor-pointer hover:bg-surface-1 text-sm leading-snug list-none flex justify-between items-center gap-3">
                    <span>{faq.q}</span>
                    <ChevronRight size={14} className="text-amber shrink-0 rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 pt-2 text-sm text-ink-2 leading-relaxed border-t border-border">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Related specs */}
          <section className="card p-6 mt-6">
            <h2 className="text-base font-bold text-navy mb-3">Explore Other MBA Specialisations</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/programs/mba/finance', label: 'MBA Finance' },
                { href: '/programs/mba/marketing', label: 'MBA Marketing' },
                { href: '/programs/mba/digital-marketing', label: 'MBA Digital Marketing' },
                { href: '/programs/mba/operations-management', label: 'MBA Operations' },
                { href: '/programs/mba/international-business', label: 'MBA International Business' },
                { href: '/programs/mba', label: 'All MBA Specialisations' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-navy hover:border-amber hover:text-amber transition-colors no-underline"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
