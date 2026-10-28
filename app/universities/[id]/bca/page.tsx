// app/universities/[id]/bca/page.tsx
//
// Task 3 slice 3b (2026-08-18): metadata and page component both branch on
// resolveProgramme('bca'). See MBA route for the full class-A defect this
// closes. Edge middleware /bca path (section 2d) turns class-A into HTTP 404.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { nirfForProgramme } from '@/lib/data-slim'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '@/lib/seo-title'
import { getExactFee, formatExactFeeShort } from '@/lib/fees'
import { shouldIndexProgrammeHub } from '@/lib/seo/should-index'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '@/lib/seo/program-schema'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'
import { resolveProgramme } from '@/lib/seo/resolve-programme'
import { naacSuffix, naacSegment, naacAccredited, naacPhrase } from '@/lib/seo/display-guards'
import { shouldIndexUniversity, unverifiedDescription, onlinePrefix } from '@/lib/seo/mode-unverified'
import { formatUniversityDisplayName } from '@/lib/format'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const r = resolveProgramme(id, 'bca')
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
  // Title and description fee: exact rupees from getExactFee, list price for a
  // list-vs-discount fee. getDisplayFee's compact form was parsed from
  // abbreviated pd.fees ("₹1.61L" for a ₹1,61,600 fee).
  const feeTok = formatExactFeeShort(getExactFee(u, 'BCA'))
  const specCount = pd?.specs?.length || 4
  const nirfLabel = nirfForProgramme(u, 'BCA')
  const nirfStr = nirfLabel ? `, ${nirfLabel}` : ''
  const title = feeTok
    ? clampTitleFeeLed(
        `${titleName} ${onlinePrefix(u.id)}BCA Fees ${year}: ${feeTok}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        `${shortName} ${onlinePrefix(u.id)}BCA Fees ${year}: ${feeTok}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        feeTok,
      )
    : clampTitle(`${titleName} ${onlinePrefix(u.id)}BCA ${year}: ${naacPhrase(u.naac, "UGC-DEB Entitled")} [Review] | edifyedu.in`)
  const baseDescription = feeTok
    ? clampDescription(`${titleName} ${onlinePrefix(u.id)}BCA ${year}: ${feeTok} fees, ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved 3-year degree.`)
    : clampDescription(`${titleName} ${onlinePrefix(u.id)}BCA ${year}: ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved 3-year degree.`)

  const keywords = [
    `${u.name} online BCA fees`,
    `${u.name} online BCA syllabus`,
    `${u.name} online BCA placements`,
    `${u.name} online BCA reviews`,
    `${u.name} online BCA admission ${year}`,
    `${u.abbr} online BCA`,
  ].join(', ')

  // Mode-unverified universities: see lib/seo/mode-unverified.ts.
  const description = shouldIndexUniversity(u.id)
    ? baseDescription
    : unverifiedDescription(u.name, 'BCA')

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca` },
    openGraph: { title, description, type: 'website' },
    robots: { index: shouldIndexProgrammeHub(u, 'BCA').shouldIndex, follow: true },
  }
}

function BCAProgramSchema({
  u,
  pd,
}: {
  u: NonNullable<ReturnType<typeof getUniversityById>>
  pd: ProgramDetail
}) {
  const baseUrl = 'https://edifyedu.in'
  const pageUrl = `${baseUrl}/universities/${u.id}/bca`
  const durationYears = parseInt(pd.duration?.replace(/[^0-9]/g, '') || '3', 10) || 3
  const kw = pageKeywords[`${u.id}-bca`]?.join(', ') || ''

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${formatUniversityDisplayName(u.name)} ${onlinePrefix(u.id)}BCA`,
    description: `UGC-DEB approved ${onlinePrefix(u.id)}BCA from ${u.name}.${naacAccredited(u.naac)} ${pd.specs?.length || 0}+ specialisations${getProgramSchemaFeeFragment(u, 'BCA')}.`,
    url: pageUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
  }

  const offer = getProgramSchemaOffer(u, 'BCA')
  if (offer) programSchema.offers = offer

  if (kw) programSchema.keywords = kw

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${baseUrl}/universities` },
      { '@type': 'ListItem', position: 3, name: u.name, item: `${baseUrl}/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: 'Online BCA', item: pageUrl },
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

// Body intro only; the title and meta still come from the template above.
// Galgotias (2026-10-27): searchers also type "Galgotia" without the s, so the
// intro carries both spellings. The BBA hub deliberately has no override: it is
// cited in an AI Overview, so its copy stays as it is.
const BCA_INTRO_OVERRIDES: Record<string, string> = {
  'galgotias-university-online':
    'Galgotias University, often searched as Galgotia University, runs an Online BCA programme recognised by UGC DEB. It suits working professionals and fresh graduates aiming for careers in software development, data science and IT management. The 3-year programme runs through live and recorded sessions on an online platform, with no mandatory campus visits.',
}

export default async function OnlineBCAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const r = resolveProgramme(id, 'bca')
  if (r.kind === 'not-found') notFound()
  const { university: u, pd } = r

  return (
    <>
      <BCAProgramSchema u={u} pd={pd} />
      <UniProgramBody u={u} program="BCA" programSlug="bca" pd={pd} customIntro={BCA_INTRO_OVERRIDES[id]} />
    </>
  )
}

export const revalidate = false
