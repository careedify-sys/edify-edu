// app/universities/[id]/[program]/page.tsx
// Server Component. Enables SSG, per-page metadata, and optimal Lighthouse scores.
//
// Task 3 slice 1 (2026-08-18): both generateMetadata and the page component
// branch on the same resolveProgramme() result. Prior to this the two paths
// used slightly different predicates (metadata: !u.programs.includes(program);
// page: also !u.programDetails[program]), which let class-A phantom hubs emit
// metadata + notFound() shell simultaneously. The single resolver closes that.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { Program, ProgramDetail } from '@/lib/data'
import UniProgramBody from '@/components/UniProgramBody'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '@/lib/seo-title'
import { getDisplayFee } from '@/lib/fees'
import { shouldIndexProgrammeHub } from '@/lib/seo/should-index'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '@/lib/seo/program-schema'
import { pageKeywords } from '@/lib/page-keywords'
import { resolveProgramme } from '@/lib/seo/resolve-programme'
import { naacSuffix, naacSegment, naacAccredited, naacPhrase } from '@/lib/seo/display-guards'

// Static Params (SSG). Pre-render top university+program combinations only.
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

// Per-page Metadata. Targets "[University Name] online mba fees syllabus placements reviews".
export async function generateMetadata(
  { params }: { params: any }
): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id, program: programSlug } = resolvedParams
  const r = resolveProgramme(id, programSlug)
  // Soft-404 fix (2026-08-29): notFound() here, not a noindex title. The page
  // component's notFound() below runs after loading.tsx has flushed the
  // streaming shell with a 200, so it can only swap the UI. generateMetadata
  // resolves before that flush, which is what makes the status a real 404.
  // Middleware section 2d/2e also 404s these at the edge; this is the
  // app-side half of the same invariant.
  if (r.kind === 'not-found') notFound()
  const u = r.university
  const program = r.program
  const pd: ProgramDetail = r.pd

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  const fee = getDisplayFee(u, program)
  const specCount = pd?.specs?.length || 0
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  const title = fee.ok
    ? clampTitleFeeLed(
        `${titleName} Online ${program} Fees ${year}: ${fee.compact}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        `${shortName} Online ${program} Fees ${year}: ${fee.compact}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        fee.compact ?? null,
      )
    : clampTitle(`${titleName} Online ${program} ${year}: ${naacPhrase(u.naac, "UGC-DEB Entitled")} [Review] | edifyedu.in`)
  let description = fee.ok
    ? `${titleName} Online ${program} ${year}: ${fee.compact} fees, ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved. See honest review and syllabus.`
    : `${titleName} Online ${program} ${year}: ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved.`
  if (fee.ok && description.length < 150) {
    description = `${titleName} Online ${program} ${year}: ${fee.compact} fees, ${specCount}+ specs${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved. Check verified syllabus, placement data and honest review free at edifyedu.in.`
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
    robots: { index: shouldIndexProgrammeHub(u, program).shouldIndex, follow: true },
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
    description: `UGC-DEB approved Online ${program} from ${u.name}.${naacAccredited(u.naac)} ${pd.specs?.length || 0}+ specialisations${getProgramSchemaFeeFragment(u, program)}.`,
    url: pageUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
  }

  const offer = getProgramSchemaOffer(u, program)
  if (offer) programSchema.offers = offer

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
  const r = resolveProgramme(id, programSlug)
  if (r.kind === 'not-found') notFound()
  const { university, program, pd } = r

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

// ISR Configuration. Revalidate every 6 hours.
export const revalidate = false

// ── Allow dynamic params for new programs added via CMS ──
export const dynamicParams = true
