// app/universities/[id]/mca/page.tsx
//
// Task 3 slice 3b (2026-08-18): metadata and page component both branch on
// resolveProgramme('mca'). See MBA route for the full class-A defect this
// closes. Resolver short-circuits BEFORE getMasterSyllabus() and schema render,
// so class-A hubs skip the syllabus lookup entirely.
// Edge middleware /mca path (section 2d) turns class-A into HTTP 404.
// andhra-university-online/mca is in this slice's class-A set. Same URL
// that showed 200-shell double-robots in every acceptance run since Gate 0.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '@/lib/seo-title'
import { getDisplayFee } from '@/lib/fees'
import { shouldIndexProgrammeHub } from '@/lib/seo/should-index'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '@/lib/seo/program-schema'
import { getMasterSyllabus } from '@/lib/content'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'
import { resolveProgramme } from '@/lib/seo/resolve-programme'
import { naacSuffix, naacSegment, naacAccredited, naacPhrase } from '@/lib/seo/display-guards'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const r = resolveProgramme(id, 'mca')
  // Soft-404 fix (2026-08-29): notFound() here, not a noindex title. The page
  // component's notFound() below runs after loading.tsx has flushed the
  // streaming shell with a 200, so it can only swap the UI. generateMetadata
  // resolves before that flush, which is what makes the status a real 404.
  // Middleware section 2d/2e also 404s these at the edge; this is the
  // app-side half of the same invariant.
  if (r.kind === 'not-found') notFound()
  const u = r.university
  const pd: ProgramDetail = r.pd

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const fee = getDisplayFee(u, 'MCA')
  const specCount = pd?.specs?.length || 3
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  const title = fee.ok
    ? clampTitleFeeLed(
        `${titleName} Online MCA Fees ${year}: ${fee.compact}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        `${shortName} Online MCA Fees ${year}: ${fee.compact}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        fee.compact ?? null,
      )
    : clampTitle(`${titleName} Online MCA ${year}: ${naacPhrase(u.naac, "UGC-DEB Entitled")} [Review] | edifyedu.in`)
  const description = clampDescription(syllabus?.metaDesc || (fee.ok
    ? `${titleName} Online MCA ${year}: ${fee.compact} fees, ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved. Check syllabus and eligibility free.`
    : `${titleName} Online MCA ${year}: ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved.`))

  const dynamicKw = [
    `${u.name} online MCA fees`,
    `${u.name} online MCA syllabus`,
    `${u.name} online MCA placements`,
    `${u.name} online MCA reviews`,
    `${u.name} online MCA admission ${year}`,
    `${u.abbr} online MCA`,
  ].join(', ')

  return {
    title,
    description,
    keywords: syllabus?.metaKeywords || dynamicKw,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mca` },
    openGraph: { title, description, type: 'website' },
    robots: { index: shouldIndexProgrammeHub(u, 'MCA').shouldIndex, follow: true },
  }
}

function MCAProgramSchema({
  u,
  pd,
}: {
  u: NonNullable<ReturnType<typeof getUniversityById>>
  pd: ProgramDetail
}) {
  const baseUrl = 'https://edifyedu.in'
  const pageUrl = `${baseUrl}/universities/${u.id}/mca`
  const durationYears = parseInt(pd.duration?.replace(/[^0-9]/g, '') || '2', 10) || 2
  const kw = pageKeywords[`${u.id}-mca`]?.join(', ') || ''

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${u.name} Online MCA`,
    description: `UGC-DEB approved Online MCA from ${u.name}.${naacAccredited(u.naac)} ${pd.specs?.length || 0}+ specialisations${getProgramSchemaFeeFragment(u, 'MCA')}.`,
    url: pageUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
  }

  const offer = getProgramSchemaOffer(u, 'MCA')
  if (offer) programSchema.offers = offer

  if (kw) programSchema.keywords = kw

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${baseUrl}/universities` },
      { '@type': 'ListItem', position: 3, name: u.name, item: `${baseUrl}/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: 'Online MCA', item: pageUrl },
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

export default async function OnlineMCAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const r = resolveProgramme(id, 'mca')
  if (r.kind === 'not-found') notFound()
  const { university: u, pd } = r

  return (
    <>
      <MCAProgramSchema u={u} pd={pd} />
      <UniProgramBody u={u} program="MCA" programSlug="mca" pd={pd} />
    </>
  )
}

export const revalidate = false
