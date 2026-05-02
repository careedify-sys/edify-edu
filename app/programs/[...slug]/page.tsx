import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, BookOpen, Award, Users, Briefcase, TrendingUp } from 'lucide-react'
import { formatFeeSlim as formatFee, PREFERRED_UNI_IDS } from '@/lib/data-slim'
import { getShortUniversityName } from '@/lib/format'
import { PROGRAM_META } from '@/lib/data-client'
import { getAllSpecs, getUniversitiesByProgram, UNIVERSITIES, specName as getSpecName } from '@/lib/data'
import { getProgramContent, getSpecContent, getSpecFallback } from '@/lib/content'
import type { Program } from '@/lib/data'
import ProgramPageClient from '@/components/ProgramPageClient'
import MBAHubClient from '@/components/MBAHubClient'
import MBASpecHubClient from '@/components/MBASpecHubClient'
import ProgramHubClient from '@/components/ProgramHubClient'

const PM: Record<string, Program> = {
  'mba':'MBA','mca':'MCA','bba':'BBA','bca':'BCA','ba':'BA',
  'bcom':'B.Com','mcom':'M.Com','ma':'MA','msc':'MSc','bsc':'BSc',
  'online-mba':'MBA','online-mca':'MCA','online-bba':'BBA','online-bca':'BCA',
  'online-ba':'BA','online-bcom':'B.Com','online-mcom':'M.Com',
  'online-ma':'MA','online-msc':'MSc',
}

// Maps URL slugs → display name, content key, and target keywords for SEO
const SPEC_SLUG_MAP: Record<string, { display: string; contentKey: string; keywords: string[] }> = {
  'marketing':                    { display: 'Marketing', contentKey: 'marketing', keywords: ['mba marketing', 'online mba marketing india 2026', 'mba marketing career salary', 'best mba marketing specialisation'] },
  'marketing-management':         { display: 'Marketing Management', contentKey: 'marketing', keywords: ['mba marketing management', 'online mba marketing management india 2026', 'mba marketing management career', 'mba marketing salary india'] },
  'finance':                      { display: 'Finance', contentKey: 'finance', keywords: ['mba finance', 'online mba finance india 2026', 'mba finance career salary', 'best mba finance specialisation'] },
  'finance-management':           { display: 'Finance Management', contentKey: 'finance', keywords: ['mba finance management', 'online mba finance management 2026', 'mba finance career india', 'mba finance salary'] },
  'financial-management':         { display: 'Financial Management', contentKey: 'finance', keywords: ['mba financial management', 'online mba financial management india', 'mba finance career 2026', 'mba finance scope'] },
  'human-resource-management':    { display: 'Human Resource Management', contentKey: 'human resource management', keywords: ['mba hr', 'mba human resource management', 'online mba hr india 2026', 'mba hr salary india', 'mba hrm career'] },
  'hr-management':                { display: 'HR Management', contentKey: 'human resource management', keywords: ['mba hr management', 'online mba hr india 2026', 'mba hrm career salary'] },
  'data-science-analytics':       { display: 'Data Science & Analytics', contentKey: 'data science', keywords: ['mba data science analytics', 'online mba data science india 2026', 'mba analytics career salary', 'best mba data science india'] },
  'data-science':                 { display: 'Data Science', contentKey: 'data science', keywords: ['mba data science', 'online mba data science india 2026', 'mba data science career', 'mba data science salary'] },
  'business-analytics':           { display: 'Business Analytics', contentKey: 'business analytics', keywords: ['mba business analytics', 'online mba business analytics india 2026', 'mba analytics career salary', 'mba business analytics scope'] },
  'digital-marketing':            { display: 'Digital Marketing', contentKey: 'digital marketing', keywords: ['mba digital marketing', 'online mba digital marketing india 2026', 'mba digital marketing career', 'mba digital marketing salary'] },
  'operations-management':        { display: 'Operations Management', contentKey: 'operations & supply chain', keywords: ['mba operations management', 'online mba operations india 2026', 'mba operations career salary', 'mba supply chain management'] },
  'international-business':       { display: 'International Business', contentKey: 'international business', keywords: ['mba international business', 'online mba international business india 2026', 'mba ib career salary', 'mba international business scope'] },
  'entrepreneurship':             { display: 'Entrepreneurship', contentKey: 'entrepreneurship', keywords: ['mba entrepreneurship india 2026', 'online mba entrepreneurship', 'mba entrepreneurship career salary', 'best mba entrepreneurship india', 'mba startup india'] },
  'project-management':           { display: 'Project Management', contentKey: 'project management', keywords: ['mba project management india 2026', 'online mba project management', 'mba project management career', 'mba pmp india'] },
  'supply-chain-management':      { display: 'Supply Chain Management', contentKey: 'logistics & supply chain', keywords: ['mba supply chain management india 2026', 'online mba supply chain', 'mba scm career salary', 'mba logistics india'] },
  'healthcare-management':        { display: 'Healthcare Management', contentKey: 'healthcare management', keywords: ['mba healthcare management india 2026', 'online mba hospital management', 'mba healthcare career salary'] },
  'it-management':                { display: 'IT Management', contentKey: 'it management', keywords: ['mba it management india 2026', 'online mba information technology', 'mba it career salary india'] },
  'general-management':           { display: 'General Management', contentKey: 'general management', keywords: ['mba general management india 2026', 'online mba general management', 'mba general management career'] },
  'banking-finance':              { display: 'Banking & Finance', contentKey: 'finance', keywords: ['mba banking finance india 2026', 'online mba banking finance', 'mba banking career salary india'] },
  'logistics-supply-chain':       { display: 'Logistics & Supply Chain', contentKey: 'logistics & supply chain', keywords: ['mba logistics supply chain india 2026', 'online mba logistics', 'mba supply chain career salary'] },
  'logistics-supply-chain-management': { display: 'Logistics & Supply Chain Management', contentKey: 'logistics & supply chain', keywords: ['mba logistics supply chain management india 2026', 'online mba logistics supply chain', 'mba scm career salary india'] },
  'logistics-and-supply-chain-management': { display: 'Logistics and Supply Chain Management', contentKey: 'logistics & supply chain', keywords: ['mba logistics and supply chain management', 'online mba logistics india 2026'] },
  'operations-supply-chain-management': { display: 'Operations & Supply Chain Management', contentKey: 'operations & supply chain', keywords: ['mba operations supply chain india 2026', 'online mba operations scm'] },
  'artificial-intelligence':       { display: 'AI & Machine Learning', contentKey: 'artificial intelligence', keywords: ['mba artificial intelligence india 2026', 'online mba ai ml', 'mba ai career salary', 'mba machine learning india'] },
  'ai-ml':                         { display: 'AI & ML', contentKey: 'artificial intelligence', keywords: ['mba ai ml india 2026', 'online mba ai machine learning'] },
  'ai-and-ml':                     { display: 'AI and ML', contentKey: 'artificial intelligence', keywords: ['mba ai and ml india 2026'] },
}

function findUniId(slug: string) {
  return UNIVERSITIES.find(u => u.id === slug || u.abbr.toLowerCase() === slug)?.id
}

function resolveSpec(subSlug: string | undefined, allSpecs: string[]) {
  if (!subSlug) return { activeSpec: null, specEntry: null }
  // 1. Match from university data specs
  const dataSpec = allSpecs.find(s => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === subSlug)
  // 2. Fall back to canonical map
  const entry = SPEC_SLUG_MAP[subSlug] || null
  return { activeSpec: dataSpec || entry?.display || null, specEntry: entry }
}

export async function generateMetadata(
  { params }: { params: any }
): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const slugArray = resolvedParams?.slug || []
  const programSlug = slugArray[0]?.toLowerCase()
  const program = PM[programSlug]
  const subSlug = slugArray[1]?.toLowerCase()
  
  if (!program) return { title: 'Program Not Found' }

  // Check if subSlug is a specialization
  const allSpecs = getAllSpecs(program)
  const { activeSpec, specEntry } = resolveSpec(subSlug, allSpecs)

  const year = new Date().getFullYear()

  // Use spec-specific metadata from content.ts — but ONLY for non-MBA programs
  // MBA spec pages use specMapping.ts data via MBASpecHubClient, not content.ts
  // content.ts maps MBA keys like 'it management' to MCA content ('cloud computing') which is wrong
  const specContent = activeSpec && program !== 'MBA'
    ? (specEntry ? getSpecContent(specEntry.contentKey) : null) || getSpecContent(activeSpec)
    : null

  const allUnis = getUniversitiesByProgram(program)
  const uniCount = allUnis.length

  // Get top 3 university brand names for SEO (sorted by NIRF)
  const topBrands = activeSpec && program === 'MBA'
    ? UNIVERSITIES.filter(u => u.programs.includes('MBA') && u.programDetails?.['MBA']?.specs?.some((s: any) => {
        const name = typeof s === 'string' ? s : s.name
        return name.toLowerCase().includes(activeSpec.toLowerCase().slice(0, 8))
      })).sort((a, b) => (a.nirf < 200 ? a.nirf : 999) - (b.nirf < 200 ? b.nirf : 999)).slice(0, 3).map(u => u.abbr).join(', ')
    : ''

  const title = specContent?.metaTitle
    || (activeSpec
      ? program === 'MBA'
        ? `Best Online MBA in ${activeSpec} ${year} — Fees, Colleges, Placements, Discounts | EdifyEdu`
        : `Best Online ${program} in ${activeSpec} ${year} — Fees, Colleges, Career | EdifyEdu`
      : program === 'MBA'
        ? `Best Online MBA in India ${year} — ${uniCount} UGC-Approved Universities | EdifyEdu`
        : `Online ${program} India ${year} — Compare UGC Approved Universities | EdifyEdu`)

  const description = specContent?.metaDesc
    || (activeSpec
      ? program === 'MBA'
        ? `Compare online MBA in ${activeSpec} from ${topBrands || 'top universities'} and more. Fees, NIRF ranks, syllabus, career scope, salary data. ${uniCount}+ UGC approved. Independent comparison ${year}.`
        : `Compare top UGC DEB approved online ${program} programs with ${activeSpec} specialisation in India ${year}. Check NIRF ranks, fees, career scope, and salary data.`
      : program === 'MBA'
        ? `Compare ${uniCount} UGC-DEB approved online MBAs by NIRF rank, fees (Rs 66K-3.7L), specialisations and placement. Independent reviews. Zero referral commissions. Updated April ${year}.`
        : `Explore all UGC approved online ${program} programs in India. Find real NIRF rankings, NAAC grades, and verified fees. Admissions for ${year}.`)

  const canonical = activeSpec
    ? `https://edifyedu.in/programs/${programSlug}/${subSlug}`
    : `https://edifyedu.in/programs/${programSlug}`

  // Program-level base keywords from keyword gap research
  const PROGRAM_BASE_KEYWORDS: Partial<Record<string, string[]>> = {
    MBA: [`online mba india ${year}`, `best online mba india`, `online mba for working professionals`, `mba course duration`, `mba how many years`, `mba specializations`, `types of mba`, `mba course details`, `best mba colleges in india`, `best online mba colleges in india`, `mba for working professionals`, `top 10 mba colleges in india`, `mba salary per month`, `best university for mba in india`, `mba scope`, `mba after engineering`, `average salary of mba in india`, `mba salary in india per month`, `difference between pgdm and mba`, `mba eligibility criteria`, `cheapest online mba in india`, `executive mba in india`, `mba in india`, `mba fields`, `mba duration in india`, `mba how many subjects`, `minimum eligibility for mba`, `online mba colleges`, `mba degree duration`, `is online mba worth it in india`, `distance mba course`, `distance mba colleges`, `is distance mba worth it`, `best distance mba in india`, `best distance mba university in india`, `distance mba vs online mba`, `online mba vs distance mba`, `online mba vs regular mba`, `1 year mba in india`, `one year mba in india`, `1 year mba programs in india`, `executive mba requirements`, `online executive mba india`, `hybrid mba programs in india`, `mba admission tests in india`, `management exams`, `easiest mba entrance exam`, `competitive exams for mba`, `entrance test for mba`, `all mba exams`, `mba entrance exam subjects`, `mba age limit`, `mba admission qualification`, `mba after bcom`, `mba after bca`, `can bsc student do mba`, `can bcom student do mba`, `mba vs mca which is better`, `difference between mba and mca`, `low cost online mba`, `is mba a postgraduate degree`, `mba is professional course or not`, `government college for mba`, `govt mba colleges in india`, `best govt colleges for mba`, `online mba in bangalore`, `online mba in mumbai`, `online mba in pune`, `online mba in hyderabad`, `online mba in delhi`, `online mba in chennai`, `online mba in ahmedabad`, `online mba in kolkata`, `mba highest salary`, `mba degree salary`, `mba graduate salary`, `mba package in india`, `average package of mba in india`, `minimum salary of mba in india`, `mba starting salary in india`, `mba starting salary`, `mba starting salary in india per month`, `mba salary in kerala`, `online mba with placement`, `online mba distance education`, `mba course fees in government college`, `mba finance vs marketing`, `mba finance marketing`, `mba it specialization`, `mba in information systems`, `mba real estate`, `mba scope in future`, `mba related courses`, `mba sub courses`, `mba branches in india`, `mba department list`, `mba specialization options`, `mba specialization courses`, `mba fields list`, `best mba specialization for future`, `most demanding mba specialization`, `best branch in mba`, `in mba which specialization is best`, `which type of mba is best`, `best mba specialization in india`, `mba or mca which is better`, `mba vs mtech`, `mba or mtech`, `mba tech`, `mba 1 year subjects`, `mba 3 years`, `mba course year`, `mba course time`, `mba year course`, `mba year duration`, `how many year mba course`, `how many years does mba take`, `how long is mba course`, `how many subjects are there in mba`, `mba courses time period`, `mba tenure`, `mba course duration in india`, `mba long from`, `expand mba`, `mba full form salary per month`, `integrated mba meaning`, `integrated mba means`, `emba vs mba`, `dba course`, `dba course duration`, `dba course full form`, `doctor of business administration course duration`, `dba colleges in india`, `dba program in india`],
    MCA: [`online mca india ${year}`, `best online mca india`, `online mca course`, `mca salary in india`, `best course after bca`, `after bca which course is best`, `mca after bca`, `online mca course fees`, `online mca duration`, `mca starting salary`, `mca scope and salary`, `mca career options`, `online mca degree`, `after mca which course is best`, `mca benefits`, `mca salary per month`, `mca cyber security`, `mca job salary per month`, `mca artificial intelligence`, `mca jobs salary`, `jobs after mca and salary`, `mca ke baad salary`, `mca package in india`, `mca highest package in india`, `mca graduate salary`, `mca student salary`, `mca education`, `mca in iit delhi`, `bca mca salary in india`, `mca maths syllabus`, `mca salary in usa per month`, `mca starting salary in india per month`, `mca job opportunities and salary`, `mca scope`, `after mca jobs and salary`, `after mca what can i do`, `after mca what should i do`, `after mca course`, `after mca job salary`, `after mca`, `jobs after mca`, `online mca course in india`, `distance bca course`, `distance bca`, `online bca degree`],
    BBA: [`online bba india ${year}`, `bba course`, `bba course details after 12th`, `job opportunities after bba`, `bba international business`, `amity bba fees`, `amity university bba fees`, `bba after 12th`, `bba distance education`, `career opportunities after bba`, `bba eligibility after 12th`, `bba finance and international business`, `online bba programs`, `bba mba salary in india per month`, `bba healthcare management salary`, `bba in hospital management salary`, `bba logistics and supply chain management salary`, `bba business analytics salary`, `bba at manipal university`, `bba related courses`, `subjects needed for bba`, `bba plus mba salary`, `bba comes under which stream`, `online bba course`, `bba distance education in pune`, `career opportunity after bba`, `opportunities after bba`],
    BCA: [`online bca course`, `bca salary in india`, `bca starting salary in india per month`, `best course after bca`, `online bca course fees`, `job opportunities after bca`, `after bca which course is best for high salary`, `bca average salary`, `bca education`, `after bca job in bank`, `bca field`, `bca mba salary in india`, `bca graduate salary`, `bca minimum salary`, `bca online degree`, `bca salary in kerala`, `bca 1st semester maths syllabus`, `bca maths syllabus`, `bca mathematics syllabus`, `after bca courses`, `bca online`, `after completing bca what can i do`, `list of jobs after bca`, `after bca`, `pg courses after bca`, `what we do after bca`, `bca course job opportunities`, `bca course salary per month`, `bca package in india`, `bca highest salary`, `job options for bca`, `after bca which job is best`],
    'B.Com': [`online bcom india ${year}`, `best course after b com`, `courses after bcom`, `b com course details`, `b com how many years`, `b com accounting and finance`, `bcom course duration`, `jobs after b.com and salary`, `career after b com`, `bcom career options`, `after b com govt jobs`, `b com is which degree`, `best career in commerce`, `b com benefits`, `bcom scope and salary`, `bcom future scope`, `after b com which course is best for job`, `after doing b com what can i do`, `b com ca salary`, `bachelor of commerce salary`, `b com m com salary`, `bcom accounting and finance syllabus`, `bcom final year project topics`, `bcom project topics for final year`, `b com project topics list`, `bcom project topics list`, `project topics for bcom students`, `6th semester bcom project topics`, `bcom qualification`, `bcom streams`, `bcom degree courses`, `commerce stream jobs list with salary`, `commerce jobs salary per month`, `jobs after b.com and salary per month`, `after b.com courses`, `after b.com jobs`, `can bcom student do mba`, `courses to do after bcom`, `banking courses after graduation`, `b com specialization`, `b com how many subjects`, `b com main subjects`, `b com programme subjects`, `b com groups`, `bcom accounting and taxation`, `bcom banking subjects`, `b com accounting and finance`, `best course after ba graduation`, `commerce related careers`, `commerce jobs list and salary in india`, `commerce field jobs`, `high salary jobs in commerce stream`, `jobs after commerce`, `jobs after taking commerce`, `best job in commerce`, `commerce background`, `commerce degree salary`, `in commerce which field is best`, `after b com courses list`, `after b com best career option`, `best career option after b com`, `career options after graduation in commerce`, `best courses after graduation in commerce`, `after b com which course is best`, `best course in b com`, `best cource after b com`, `cources after b com`, `courses for commerce students after graduation`],
    MA: [`online ma india ${year}`, `courses after ba`, `ba job opportunities`, `ma distance learning india`, `career after ba`, `jobs after ba`, `after ba jobs list`, `scope of bachelor of arts`, `ba career options`, `m com project topics`, `m com benefits`, `m com scope`, `mcom career options`, `after mcom what can i do`, `salary after m com`, `m com salary per month`, `mcom after jobs`, `job after m com`, `ma economics scope`, `ma economics online`, `after mcom which course is best`, `after ba job opportunities`, `what after ba`, `what we can do after ba`, `career options after graduation in arts`, `after ba degree what next`, `after ba which job is best`, `courses after ba`, `best course after ba`, `ba next course`, `ba course jobs`, `jobs for ba students`, `after ba`, `scope for arts students`, `fields in arts`, `career in arts stream after 12th`, `arts side career options`, `career after arts`, `best career options for arts students`, `career opportunities after ba`, `ba career options`, `arts stream career options after 12th`, `ma economics online`],
  }

  const specKeywords = specEntry?.keywords || (activeSpec
    ? [`online ${program} ${activeSpec.toLowerCase()}`, `${program} ${activeSpec.toLowerCase()} india ${year}`, `${program} ${activeSpec.toLowerCase()} career salary`, `best ${program} ${activeSpec.toLowerCase()} india`]
    : (PROGRAM_BASE_KEYWORDS[program] || [`online ${program} india ${year}`, `best online ${program} india`, `ugc approved ${program}`, `online ${program} for working professionals`]))

  return {
    title: { absolute: title },
    description,
    keywords: specKeywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `Online ${program} India 2026` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CatchAllProgramPage(
  { params }: { params: any }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const slugArray = resolvedParams?.slug || []
  const programSlug = slugArray[0]?.toLowerCase()
  const program = PM[programSlug]
  const subSlug = slugArray[1]?.toLowerCase()

  if (!program) notFound()

  // SEO Redirection: If slug[1] is a university, redirect to /universities/[id]/[program]
  if (subSlug) {
    const uId = findUniId(subSlug)
    if (uId) {
      permanentRedirect(`/universities/${uId}/${programSlug}`)
    }
  }

  // Check if subSlug is a specialization
  const allSpecs = getAllSpecs(program)
  const { activeSpec, specEntry } = resolveSpec(subSlug, allSpecs)

  const meta = PROGRAM_META[program]
  const content = getProgramContent(program)
  const universities = getUniversitiesByProgram(program)
  
  const feeMin = universities.length ? Math.min(...universities.map(u => u.feeMin)) : 0
  const feeMax = universities.length ? Math.max(...universities.map(u => u.feeMax)) : 0

  const year = new Date().getFullYear()
  const canonicalSlug = activeSpec
    ? `https://edifyedu.in/programs/${programSlug}/${subSlug}`
    : `https://edifyedu.in/programs/${programSlug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Programs', item: 'https://edifyedu.in/programs' },
      { '@type': 'ListItem', position: 3, name: `Online ${program}`, item: `https://edifyedu.in/programs/${programSlug}` },
      ...(activeSpec ? [{ '@type': 'ListItem', position: 4, name: activeSpec, item: canonicalSlug }] : []),
    ],
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: activeSpec ? `Online ${program} in ${activeSpec}` : `Online ${program} in India ${year}`,
    description: activeSpec
      ? `UGC DEB approved online ${program} with ${activeSpec} specialisation. Compare ${universities.length} top-ranked universities in India.`
      : `UGC DEB approved online ${program} programs in India. Compare ${universities.length} top-ranked universities. Fees from ₹${Math.round(feeMin/1000)}K.`,
    provider: { '@type': 'Organization', name: 'Edify', sameAs: 'https://edifyedu.in' },
    educationalLevel: program.startsWith('M') ? 'Postgraduate' : 'Undergraduate',
    offers: {
      '@type': 'Offer',
      price: feeMin,
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: feeMin,
        maxPrice: feeMax,
        priceCurrency: 'INR',
      },
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: 'PT2Y',
      startDate: `${year}-07-01`,
    },
  }

  const faqSchema = content?.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.slice(0, 5).map((f: { q: string; a: string }) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  // If a sub-slug was provided but didn't resolve to any spec or university, 404
  // This prevents duplicate content with the base program page canonical
  if (subSlug && !activeSpec) {
    notFound()
  }

  // MBA spec hub page (e.g., /programs/mba/finance) — dedicated spec comparison
  if (program === 'MBA' && activeSpec && subSlug) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
        <MBASpecHubClient specSlug={subSlug} specName={activeSpec} />
      </>
    )
  }

  // Non-MBA spec hub page (e.g., /programs/mca/data-science)
  // Render the same generic template but with a safety fallback
  if (program !== 'MBA' && activeSpec && subSlug) {
    // Safely get spec content — never crash
    let sc
    try {
      sc = (specEntry ? getSpecContent(specEntry.contentKey) : null)
        || getSpecContent(activeSpec)
        || getSpecFallback(activeSpec, program)
    } catch {
      sc = getSpecFallback(activeSpec, program)
    }
    if (!sc) sc = { overview: '', whyChoose: [], skills: [], careerBeginner: [], careerMid: [], careerSenior: [], salaryRange: '', certifications: [], topCompanies: [] }

    const specSlugStr = activeSpec.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const unisWithSpec = universities
      .filter(u => u.programDetails[program]?.specs?.some(s => getSpecName(s) === activeSpec))
      .sort((a, b) => (a.nirf || 999) - (b.nirf || 999))
      .slice(0, 8)

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
        <div className="bg-surface-1 min-h-screen pt-4 pb-20">
          <div className="container-custom">
            <div className="flex items-center gap-2 py-4 text-xs text-ink-3">
              <Link href="/" className="hover:text-navy">Home</Link>
              <ChevronRight size={12}/>
              <Link href="/programs" className="hover:text-navy">Programs</Link>
              <ChevronRight size={12}/>
              <Link href={`/programs/${programSlug}`} className="hover:text-navy">{program}</Link>
              <ChevronRight size={12}/>
              <span className="text-amber font-bold">{activeSpec}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 mt-4 relative">
              <div className="flex-1">
                <div className="card p-6 md:p-8 overflow-hidden relative">
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber/10 text-amber-text text-[10px] font-bold tracking-wider uppercase rounded-full mb-4">
                      <TrendingUp size={12}/> UGC DEB Approved 2026
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy leading-tight">
                      Online {program}{' '}
                      <span className="text-amber-text">in {activeSpec}</span>
                    </h1>
                    <p className="mt-4 text-lg text-ink-2 max-w-2xl leading-relaxed">
                      Compare {unisWithSpec.length || universities.length} top-ranked universities offering online {program} in {activeSpec} in India.
                      UGC approved degrees valid for govt and private jobs.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: BookOpen, label: 'Universities', value: `${unisWithSpec.length || universities.length}` },
                    { icon: Award, label: 'Min Fee', value: formatFee(feeMin) },
                    { icon: Users, label: 'Duration', value: program.startsWith('B') ? '3 Years' : '2 Years' },
                    { icon: Briefcase, label: 'Salary Range', value: sc.salaryRange || '₹3L – ₹15L' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
                      <div className="w-5 h-5 text-amber-text"><stat.icon size={20}/></div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{stat.label}</div>
                        <div className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {sc.overview && (
                  <section className="card p-6 md:p-8 mt-6">
                    <h2 className="text-xl font-bold text-navy mb-4">About Online {program} in {activeSpec}</h2>
                    <div className="text-[15px] text-ink-2 leading-relaxed space-y-3">
                      <p>{sc.overview}</p>
                      <p>Online degrees from UGC DEB approved universities are accepted by government and private sector employers across India.</p>
                    </div>
                  </section>
                )}

                {(sc.whyChoose?.length || sc.skills?.length) ? (
                  <section className="grid md:grid-cols-2 gap-4 mt-4">
                    {sc.whyChoose?.length ? (
                      <div className="card p-6">
                        <h3 className="text-base font-bold text-navy mb-3">Why {activeSpec}?</h3>
                        <ul className="space-y-2">
                          {sc.whyChoose.map((w: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                              <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span><span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {sc.skills?.length ? (
                      <div className="card p-6">
                        <h3 className="text-base font-bold text-navy mb-3">Skills You Will Build</h3>
                        <ul className="space-y-2">
                          {sc.skills.map((s: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                              <span className="text-amber-text font-bold mt-0.5 shrink-0">→</span><span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {unisWithSpec.length > 0 && (
                  <section className="card p-6 md:p-8 mt-6">
                    <h2 className="text-xl font-bold text-navy mb-1">Top Universities for {program} in {activeSpec}</h2>
                    <p className="text-sm text-ink-3 mb-5">UGC DEB approved universities sorted by NIRF rank</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {unisWithSpec.map(u => {
                        const upd = u.programDetails[program]
                        return (
                          <Link key={u.id} href={`/universities/${u.id}/${programSlug}/${specSlugStr}`}
                            className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl hover:border-amber hover:shadow-md transition-all no-underline group">
                            <div className="w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                              {u.logo
                                ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                                : <span style={{ fontSize:9, fontWeight:800, color:'#fff', background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>{u.abbr?.slice(0,2)}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-navy group-hover:text-amber transition-colors leading-snug truncate">{getShortUniversityName(u.name)}</div>
                              <div className="text-xs text-ink-3">NAAC {u.naac}{u.nirf < 200 ? ` · NIRF #${u.nirf}` : ''} · {upd?.fees || formatFee(u.feeMin)}</div>
                            </div>
                            <ChevronRight size={14} className="text-amber shrink-0" />
                          </Link>
                        )
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                      <Link href={`/programs/${programSlug}`} className="text-sm text-amber font-semibold hover:underline no-underline">← All {program} Universities</Link>
                      <Link href="/compare" className="text-sm text-ink-2 font-semibold hover:text-amber no-underline">Compare Side-by-Side →</Link>
                    </div>
                  </section>
                )}

                <ProgramPageClient program={program} programSlug={programSlug} universities={universities} allSpecs={allSpecs} initialSpec={activeSpec ?? undefined} />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Program hub pages (no spec sub-slug) — redesigned hub components
  if (!activeSpec) {
    if (program === 'MBA') {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: universities.slice(0, 20).map((u, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://edifyedu.in/universities/${u.id}/mba`,
            name: `${u.name} Online MBA`,
          })),
        }) }} />
        <MBAHubClient />
      </>
    )
    }

    // All other programs (MCA, BBA, BCA, B.Com, M.Com, MA, BA, MSc, BSc)
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
        <ProgramHubClient program={program} />
      </>
    )
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
    <div className="bg-surface-1 min-h-screen pt-4 pb-20">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 py-4 text-xs text-ink-3">
          <Link href="/" className="hover:text-navy">Home</Link>
          <ChevronRight size={12}/>
          <Link href="/programs" className="hover:text-navy">Programs</Link>
          <ChevronRight size={12}/>
          <span className="text-navy font-semibold">{program}</span>
          {activeSpec && (
            <>
              <ChevronRight size={12}/>
              <span className="text-amber font-bold">{activeSpec}</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mt-4 relative">
          <div className="flex-1">
            <div className="card p-6 md:p-8 overflow-hidden relative">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber/10 text-amber-text text-[10px] font-bold tracking-wider uppercase rounded-full mb-4">
                  <TrendingUp size={12}/> UGC DEB Approved 2026
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy leading-tight">
                  Online {program}{' '}
                  {activeSpec ? (
                    <span className="text-amber-text">in {activeSpec}</span>
                  ) : (
                    <span className="text-amber-text">Universities in India {year} — UGC DEB Approved</span>
                  )}
                </h1>
                <p className="mt-4 text-lg text-ink-2 max-w-2xl leading-relaxed">
                  Compare {universities.length} top-ranked universities offering online {program} in India. 
                  UGC approved degrees valid for govt and private jobs.
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: BookOpen, label: 'Universities', value: `${universities.length}` },
                { icon: Award, label: 'Min Fee', value: formatFee(feeMin) },
                { icon: Users, label: 'Specialisations', value: `${allSpecs.length}+` },
                { icon: Briefcase, label: 'Salary Range', value: '₹4L – ₹18L' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col gap-3">
                  <div className="w-5 h-5 text-amber-text">
                    <stat.icon size={20}/>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{stat.label}</div>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* About + rich spec content — only shown when a spec is active */}
            {activeSpec && (() => {
              const sc = (specEntry ? getSpecContent(specEntry.contentKey) : null) || getSpecContent(activeSpec) || getSpecFallback(activeSpec, program)
              const uniWithSpec = universities.find(u => u.programDetails[program]?.specs?.some(s => getSpecName(s) === activeSpec))
              const uniName = uniWithSpec?.name || `Top UGC DEB Approved Universities`
              return (
                <>
                  {/* Overview */}
                  <section className="card p-6 md:p-8 mt-6">
                    <h2 className="text-xl font-bold text-navy mb-4">About Online {program} in {activeSpec}</h2>
                    <div className="flex flex-col gap-4 text-[15px] text-ink-2 leading-relaxed">
                      <p>
                        {uniName.replace(/\s+online\s*$/i, '')} and other UGC DEB approved universities offer an Online {program} in {activeSpec} as a{program === 'MCA' || program === 'MSc' ? ' 2-year' : program === 'MBA' || program === 'M.Com' || program === 'MA' ? ' 2-year' : ' 3-year'} postgraduate program delivered entirely online. The program is UGC DEB approved and designed for working professionals and fresh graduates.
                      </p>
                      {sc.overview && <p>{sc.overview}</p>}
                      <p>Online degrees from UGC DEB approved universities are accepted by government and private sector employers across India. The degree holds the same value as a regular on-campus degree as per UGC regulations.</p>
                    </div>
                  </section>

                  {/* Why choose + Skills */}
                  {(sc.whyChoose?.length || sc.skills?.length) && (
                    <section className="grid md:grid-cols-2 gap-4 mt-4">
                      {sc.whyChoose?.length ? (
                        <div className="card p-6">
                          <h3 className="text-base font-bold text-navy mb-3">Why {activeSpec}?</h3>
                          <ul className="space-y-2">
                            {sc.whyChoose.map((w: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                                <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {sc.skills?.length ? (
                        <div className="card p-6">
                          <h3 className="text-base font-bold text-navy mb-3">Skills You'll Build</h3>
                          <ul className="space-y-2">
                            {sc.skills.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                                <span className="text-amber-text font-bold mt-0.5 shrink-0">→</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </section>
                  )}

                  {/* Career paths */}
                  {(sc.careerBeginner?.length || sc.careerMid?.length || sc.careerSenior?.length) && (
                    <section className="card p-6 md:p-8 mt-4">
                      <h2 className="text-xl font-bold text-navy mb-5">Career Path: {program} in {activeSpec}</h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          { label: '0–3 Years', items: sc.careerBeginner, color: '#3b82f6' },
                          { label: '3–7 Years', items: sc.careerMid, color: '#f59e0b' },
                          { label: '7+ Years', items: sc.careerSenior, color: '#10b981' },
                        ].map(({ label, items, color }) => items?.length ? (
                          <div key={label}>
                            <div className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color }}>{label}</div>
                            <div className="space-y-3">
                              {items.map((c: { title: string; desc: string }, i: number) => (
                                <div key={i} className="bg-surface-1 rounded-xl p-3 border border-border">
                                  <div className="text-sm font-bold text-navy">{c.title}</div>
                                  <div className="text-xs text-ink-3 mt-1">{c.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null)}
                      </div>
                      {sc.salaryRange && (
                        <div className="mt-5 pt-4 border-t border-border flex flex-wrap gap-6 text-sm">
                          <div><span className="font-bold text-navy">Salary range: </span><span className="text-ink-2">{sc.salaryRange}</span></div>
                          {sc.salaryGrowth && <div className="text-ink-3">{sc.salaryGrowth}</div>}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Certifications */}
                  {sc.certifications?.length ? (
                    <section className="card p-6 mt-4">
                      <h3 className="text-base font-bold text-navy mb-3">Certifications to Stack Alongside</h3>
                      <ul className="space-y-1.5">
                        {sc.certifications.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ink-2">
                            <span className="text-amber-text font-bold shrink-0">★</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                      {sc.resumeTip && (
                        <div className="mt-4 p-3 rounded-lg bg-surface-1 border border-border text-sm text-ink-2">
                          <span className="font-bold text-navy">Resume tip: </span>{sc.resumeTip}
                        </div>
                      )}
                    </section>
                  ) : null}

                  {/* Top hiring companies */}
                  {sc.topCompanies?.length ? (
                    <section className="card p-6 mt-4">
                      <h3 className="text-base font-bold text-navy mb-3">Top Hiring Companies</h3>
                      <div className="flex flex-wrap gap-2">
                        {sc.topCompanies.map((c: string, i: number) => (
                          <span key={i} className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-white text-ink-2">{c}</span>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </>
              )
            })()}

            {/* Top universities for this specialisation — direct internal links to spec pages */}
            {activeSpec && (() => {
              const specSlugStr = activeSpec.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
              const unisWithSpec = universities
                .filter(u => u.programDetails[program]?.specs?.some(s => getSpecName(s) === activeSpec))
                .sort((a,b) => (a.nirf||999) - (b.nirf||999))
                .slice(0, 8)
              if (!unisWithSpec.length) return null
              return (
                <section className="card p-6 md:p-8 mt-6">
                  <h2 className="text-xl font-bold text-navy mb-1">
                    Top Universities for {program} in {activeSpec}
                  </h2>
                  <p className="text-sm text-ink-3 mb-5">
                    UGC DEB approved universities offering {program} with {activeSpec} specialisation — sorted by NIRF rank
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {unisWithSpec.map(u => {
                      const pd = u.programDetails[program]
                      return (
                        <Link
                          key={u.id}
                          href={`/universities/${u.id}/${programSlug}/${specSlugStr}`}
                          className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl hover:border-amber hover:shadow-md transition-all no-underline group"
                        >
                          <div className="w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                            {u.logo
                              ? <img src={u.logo} alt={u.name} className="max-w-full max-h-full object-contain p-0.5" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                              : <span style={{ fontSize:9, fontWeight:800, color:'#fff', background:u.color, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6 }}>{u.abbr?.slice(0,2)}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-navy group-hover:text-amber transition-colors leading-snug truncate">
                              {getShortUniversityName(u.name)}
                            </div>
                            <div className="text-xs text-ink-3">
                              NAAC {u.naac}{u.nirf < 200 ? ` · NIRF #${u.nirf}` : ''} · {pd?.fees || formatFee(u.feeMin)}
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-amber shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
                    <Link href={`/programs/${programSlug}`} className="text-sm text-amber font-semibold hover:underline no-underline">
                      ← All {program} Universities
                    </Link>
                    <Link href="/compare" className="text-sm text-ink-2 font-semibold hover:text-amber no-underline">
                      Compare Side-by-Side →
                    </Link>
                  </div>
                </section>
              )
            })()}

            {/* Section H2 — visible to crawlers even when no spec is active */}
            {!activeSpec && (
              <h2 className="text-xl font-bold text-navy mt-8 mb-2">
                Best Online {program} Colleges in India 2026 — UGC DEB Approved
              </h2>
            )}

            <ProgramPageClient
              program={program}
              programSlug={programSlug}
              universities={universities}
              allSpecs={allSpecs}
              initialSpec={activeSpec ?? undefined}
            />

            {/* Related Programs — internal linking for SEO */}
            {program === 'MBA' && (
              <section className="card p-6 md:p-8 mt-6">
                <h2 className="text-lg font-bold text-navy mb-4">Related Programs You May Consider</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { href: '/programs/mba', label: 'Online MBA India' },
                    { href: '/programs/mba/finance', label: 'MBA Finance' },
                    { href: '/programs/mba/marketing', label: 'MBA Marketing' },
                    { href: '/programs/mba/hr', label: 'MBA Human Resources' },
                    { href: '/programs/mba/data-science', label: 'MBA Data Science' },
                    { href: '/compare', label: 'Compare Universities' },
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg text-sm font-medium text-navy hover:border-amber hover:text-amber transition-colors no-underline"
                    >
                      <ChevronRight size={14} className="text-amber shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
