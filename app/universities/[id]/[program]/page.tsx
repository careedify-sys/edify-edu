// app/universities/[id]/[program]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { Program, ProgramDetail } from '@/lib/data'
import UniProgramBody from '@/components/UniProgramBody'
import { getTitleName, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
import { pageKeywords } from '@/lib/page-keywords'

// Program slug to Program type mapping
const PM: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'BA',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA', 'msc': 'MSc', 'bsc': 'BSc', 'mba-wx': 'MBA (WX)',
}

// ── Static Params (SSG) — pre-render top university+program combinations only ──
// Others are served via ISR (dynamicParams = true) on first request, then cached.
export async function generateStaticParams() {
  const TOP_UNI_IDS = [
    'amity-university-online', 'chandigarh-university-online', 'jain-university-online', 'lovely-professional-university-online', 'manipal-university-jaipur-online',
    'nmims-online', 'symbiosis-university-online', 'manipal-academy-higher-education-online', 'sikkim-manipal-university-online', 'sharda-university-online',
    'amrita-vishwa-vidyapeetham-online', 'chitkara-university-online', 'alliance-university-online',
  ]
  const TOP_PROGRAMS = ['mba', 'mca']
  const params: { id: string; program: string }[] = []

  for (const id of TOP_UNI_IDS) {
    for (const program of TOP_PROGRAMS) {
      params.push({ id, program })
    }
  }

  return params
}

// ── Per-page Metadata — targets "[University Name] online mba fees syllabus placements reviews" ──
export async function generateMetadata(
  { params }: { params: any }
): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id, program: programSlug } = resolvedParams
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!u || !program || !u.programs.includes(program)) {
    return { title: 'Program Not Found', robots: { index: false, follow: false } }
  }

  const year = new Date().getFullYear()
  const pd = u.programDetails[program]
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const fees = compactFee(pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`)
  const specCount = pd?.specs?.length || 0
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): short uni name, fee number, NAAC, bracket review hook.
  // titleName (not full name) keeps room for the brand suffix inside the 60-char SERP cap.
  const title = clampTitle(`${titleName} Online ${program} ${year}: ${fees} Fees, NAAC ${u.naac} [Review] | EdifyEdu`)
  // Description: short uni name + numeric facts first, micro-CTA at end. No "Compare/Explore" lead.
  let description = `${titleName} Online ${program} ${year}: ${fees} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. See honest review, syllabus & placement data free.`
  if (description.length < 150) {
    description = `${titleName} Online ${program} ${year}: ${fees} fees, ${specCount}+ specs, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. Check verified syllabus, placement data & honest review free at EdifyEdu.`
  }
  description = clampDescription(description)

  const keywords = [
    `${u.name} online ${program} fees`,
    `${u.name} online ${program} syllabus`,
    `${u.name} online ${program} placements`,
    `${u.name} online ${program} reviews`,
    `${u.name} online ${program} admission ${year}`,
    `${u.abbr} online ${program}`,
    `${u.name} ${program} fees syllabus placements reviews`,
  ].join(', ')

  const t = title
  const d = description

  return {
    title: t,
    description: d,
    keywords,
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}/${programSlug}`,
    },
    openGraph: {
      title: t,
      description: d,
      url: `https://edifyedu.in/universities/${u.id}/${programSlug}`,
      type: 'website',
      siteName: 'edifyedu.in',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `${u.name} Online ${program}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t,
      description: d,
      images: ['https://edifyedu.in/og.webp'],
    },
    robots: { index: true, follow: true },
  }
}

// ── Program JSON-LD (EducationalOccupationalProgram + BreadcrumbList) ──
function ProgramSchema({
  u,
  program,
  programSlug,
  pd,
}: {
  u: NonNullable<ReturnType<typeof getUniversityById>>
  program: Program
  programSlug: string
  pd: ProgramDetail
}) {
  const baseUrl = 'https://edifyedu.in'
  const pageUrl = `${baseUrl}/universities/${u.id}/${programSlug}`
  const durationYears = parseInt(pd.duration?.replace(/[^0-9]/g, '') || '2', 10) || 2
  const kw = pageKeywords[`${u.id}-${programSlug}`]?.join(', ') || ''

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${u.name} Online ${program}`,
    description: `UGC-DEB approved Online ${program} from ${u.name}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations, fees ${pd.fees || `from ₹${Math.round(u.feeMin / 1000)}K`}.`,
    url: pageUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
  }

  if (u.feeMin) {
    programSchema.offers = u.feeMax && u.feeMax !== u.feeMin
      ? {
          '@type': 'AggregateOffer',
          lowPrice: String(u.feeMin),
          highPrice: String(u.feeMax),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        }
      : {
          '@type': 'Offer',
          price: String(u.feeMin),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        }
  }

  if (kw) programSchema.keywords = kw

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${baseUrl}/universities` },
      { '@type': 'ListItem', position: 3, name: u.name, item: `${baseUrl}/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: `Online ${program}`, item: pageUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(programSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

// ── Page Component (Server Component) ──
export default async function UniversityProgramPage(
  { params }: { params: any }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id, program: programSlug } = resolvedParams
  const university = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!university) notFound()
  if (!program) notFound()
  if (!university.programs.includes(program) || !university.programDetails[program]) {
    notFound()
  }

  const pd = university.programDetails[program]!

  return (
    <>
      <ProgramSchema u={university} program={program} programSlug={programSlug} pd={pd} />
      <UniProgramBody
        u={university}
        program={program}
        programSlug={programSlug}
        pd={pd}
      />
    </>
  )
}

// ── ISR Configuration — revalidate every 6 hours ──
export const revalidate = false

// ── Allow dynamic params for new programs added via CMS ──
export const dynamicParams = true
