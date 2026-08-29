// app/universities/[id]/mba/page.tsx
//
// Task 3 slice 3 (2026-08-18): metadata and page component both branch on
// resolveProgramme(). Prior to this, metadata guarded on
// !u.programs.includes('MBA') only, while the body ALSO required
// u.programDetails['MBA']. The 2 class-A MBA hubs (madurai-kamaraj-
// university-online, university-of-mumbai-online) rendered a full metadata
// title with noindex,follow while the body threw notFound() and served the
// bare-noindex shell. Both now agree on the same resolver result.
// Edge middleware /mba path (section 2d) is what actually turns those into
// real HTTP 404s; this file just makes the app-side branching consistent.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '@/lib/seo-title'
import { getDisplayFee } from '@/lib/fees'
import { shouldIndexProgrammeHub } from '@/lib/seo/should-index'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '@/lib/seo/program-schema'
import { MBA_SEO_OVERRIDES } from '@/lib/mba-seo-overrides'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'
import { resolveProgramme } from '@/lib/seo/resolve-programme'
import { formatUniversityDisplayName } from '@/lib/format'
import { naacSuffix, naacSegment, naacAccredited, naacPhrase } from '@/lib/seo/display-guards'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const r = resolveProgramme(id, 'mba')
  // Soft-404 fix (2026-08-29): notFound() here, not a noindex title. The page
  // component's notFound() below runs after loading.tsx has flushed the
  // streaming shell with a 200, so it can only swap the UI. generateMetadata
  // resolves before that flush, which is what makes the status a real 404.
  // Middleware section 2d/2e also 404s these at the edge; this is the
  // app-side half of the same invariant.
  if (r.kind === 'not-found') notFound()
  const u = r.university

  // Final-sprint FIX 2: overrides bypassed when getDisplayFee flags the
  // data as inconsistent. This prevents a static override string from
  // shipping a fee number that the canonical fee source cannot back
  // (e.g. Galgotias MBA override said ₹76K-₹86K while pd.fees only
  // backs ₹76.2K; Chandigarh MBA override said ₹1.65L-₹2.2L while
  // pd.fees caps at ₹1.80L). When suppressed we fall through to the
  // generic template which renders the counsellor-CTA path.
  const feePreCheck = getDisplayFee(u, 'MBA')
  const override = feePreCheck.ok ? MBA_SEO_OVERRIDES[id] : undefined
  if (override) {
    const kw = [
      `${u.name} online MBA fees`,
      `${u.name} online MBA syllabus`,
      `${u.name} online MBA placements`,
      `${u.name} online MBA reviews`,
      `${u.abbr} online MBA`,
    ].join(', ')
    return {
      title: override.title,
      description: override.description,
      keywords: kw,
      alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mba` },
      openGraph: {
        title: override.title,
        description: override.description,
        type: 'website',
        url: `https://edifyedu.in/universities/${u.id}/mba`,
        siteName: 'edifyedu.in',
        images: [{ url: 'https://edifyedu.in/og.png', width: 1200, height: 630, alt: `${formatUniversityDisplayName(u.name)} Online MBA | edifyedu.in` }],
      },
      twitter: { card: 'summary_large_image', title: override.title, description: override.description, images: ['https://edifyedu.in/og.png'] },
      robots: { index: shouldIndexProgrammeHub(u, 'MBA').shouldIndex, follow: true },
    }
  }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['MBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  const fee = getDisplayFee(u, 'MBA')
  const specCount = pd?.specs?.length || 5
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : u.nirfMgt && u.nirfMgt < 200 ? `, NIRF #${u.nirfMgt} Mgmt` : ''
  // Sprint 1 FIX 2: fee comes from getDisplayFee (one canonical source).
  // When fee.ok === false the fee is suppressed everywhere; user sees
  // "Fee structure verified by our counsellor" and the lead CTA instead.
  const title = fee.ok
    ? clampTitleFeeLed(
        `${titleName} Online MBA Fees ${year}: ${fee.compact}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        `${shortName} Online MBA Fees ${year}: ${fee.compact}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        fee.compact ?? null,
      )
    : clampTitle(`${titleName} Online MBA ${year}: ${naacPhrase(u.naac, "UGC-DEB Entitled")} [Review] | edifyedu.in`)
  const description = fee.ok
    ? clampDescription(`${titleName} Online MBA ${year}: ${fee.compact} fees, ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved. See honest review, syllabus and placement data.`)
    : clampDescription(`${titleName} Online MBA ${year}: ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved.`)

  const keywords = [
    `${u.name} online MBA fees`,
    `${u.name} online MBA syllabus`,
    `${u.name} online MBA placements`,
    `${u.name} online MBA reviews`,
    `${u.name} online MBA admission ${year}`,
    `${u.abbr} online MBA`,
    `${u.name} MBA fees syllabus placements reviews`,
  ].join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mba` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://edifyedu.in/universities/${u.id}/mba`,
      siteName: 'edifyedu.in',
      images: [
        {
          url: 'https://edifyedu.in/og.png',
          width: 1200,
          height: 630,
          alt: `${formatUniversityDisplayName(u.name)} Online MBA | edifyedu.in`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://edifyedu.in/og.png'],
    },
    robots: { index: shouldIndexProgrammeHub(u, 'MBA').shouldIndex, follow: true },
  }
}

// ── MBA JSON-LD (EducationalOccupationalProgram + BreadcrumbList) ──
function MBAProgramSchema({
  u,
  pd,
}: {
  u: NonNullable<ReturnType<typeof getUniversityById>>
  pd: ProgramDetail
}) {
  const baseUrl = 'https://edifyedu.in'
  const pageUrl = `${baseUrl}/universities/${u.id}/mba`
  const durationYears = parseInt(pd.duration?.replace(/[^0-9]/g, '') || '2', 10) || 2
  const kw = pageKeywords[`${u.id}-mba`]?.join(', ') || ''

  // Sprint 3 Task 6: strip trailing " Online" from u.name before composing
  // schema strings. Raw u.name for universities that end in "Online" (e.g.
  // "Galgotias University Online") produces double-word artefacts like
  // "Galgotias University Online Online MBA" in every schema payload.
  const brand = formatUniversityDisplayName(u.name)

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${brand} Online MBA`,
    description: `UGC-DEB approved Online MBA from ${brand}.${naacAccredited(u.naac)} ${pd.specs?.length || 0}+ specialisations${getProgramSchemaFeeFragment(u, 'MBA')}.`,
    url: pageUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
  }

  const offer = getProgramSchemaOffer(u, 'MBA')
  if (offer) programSchema.offers = offer

  if (kw) programSchema.keywords = kw

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${baseUrl}/universities` },
      { '@type': 'ListItem', position: 3, name: u.name, item: `${baseUrl}/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: 'Online MBA', item: pageUrl },
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

export default async function OnlineMBAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const r = resolveProgramme(id, 'mba')
  if (r.kind === 'not-found') notFound()
  const u = r.university
  const pd = r.pd

  // Same override bypass as generateMetadata: when the fee suppression
  // fires, drop the override so the H1/intro also route through the
  // generic template rather than displaying an unbacked fee number.
  const bodyFee = getDisplayFee(u, 'MBA')
  const override = bodyFee.ok ? MBA_SEO_OVERRIDES[id] : undefined
  return (
    <>
      <MBAProgramSchema u={u} pd={pd} />
      <UniProgramBody
        u={u}
        program="MBA"
        programSlug="mba"
        pd={pd}
        customH1={override?.h1}
        customIntro={override?.intro}
      />
    </>
  )
}

export const revalidate = false
