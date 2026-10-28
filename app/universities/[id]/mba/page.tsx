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
import { nirfForProgramme } from '@/lib/data-slim'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '@/lib/seo-title'
import { getDisplayFee, getExactFee, formatExactFeeShort } from '@/lib/fees'
import { shouldIndexProgrammeHub } from '@/lib/seo/should-index'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '@/lib/seo/program-schema'
import { MBA_SEO_OVERRIDES } from '@/lib/mba-seo-overrides'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'
import { resolveProgramme } from '@/lib/seo/resolve-programme'
import { formatUniversityDisplayName } from '@/lib/format'
import { naacSuffix, naacSegment, naacAccredited, naacPhrase } from '@/lib/seo/display-guards'
import { shouldIndexUniversity, unverifiedDescription, onlinePrefix } from '@/lib/seo/mode-unverified'
import { getProgramLinks } from '@/lib/internal-links'

// The review blog owns "{uni} online mba" and "{uni} online mba fees"
// (Semrush tracking, 27 Oct 2026: blogs 4-10, hubs 33-54; Aug GSC: the blog
// beat the hub in all 10 pairs checked). A hub whose links carry a keywordLink
// to its review stops leading with the fee in title and H1, and links the
// review instead (ProgramBlogLinks). The fee stays in the body and description.
function reviewOwnedTitle(u: NonNullable<ReturnType<typeof getUniversityById>>): string | null {
  const links = getProgramLinks(u.id, 'mba')
  const link = links?.keywordLink
  if (!link || links?.keepHubTitle) return null
  // Short name first, then the name the review anchor uses ("Manipal Univ
  // Jaipur" does not fit the pattern, "MUJ" does). u.abbr is not usable here:
  // it holds values like "MUJOM".
  const anchorName = link.anchor.replace(/ Online MBA fees and review$/, '')
  const names = [getShortTitleName(u.id, u.shortName, u.name, u.abbr), anchorName]
    .map(n => `${n} ${onlinePrefix(u.id)}MBA`)
  const options = names.flatMap(name => [
    `${name}: Specialisations, Eligibility and Admission | edifyedu.in`,
    `${name}: Specialisations, Eligibility and Admission`,
    `${name}: Specialisations and Admission | edifyedu.in`,
    `${name}: Specialisations and Admission`,
  ])
  return options.find(t => t.length <= 60) ?? clampTitle(`${names[0]}: Specialisations and Admission`)
}

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
  const reviewTitle = reviewOwnedTitle(u)
  if (override) {
    const otitle = reviewTitle ?? override.title
    const kw = [
      `${u.name} online MBA fees`,
      `${u.name} online MBA syllabus`,
      `${u.name} online MBA placements`,
      `${u.name} online MBA reviews`,
      `${u.abbr} online MBA`,
    ].join(', ')
    return {
      title: otitle,
      description: override.description,
      keywords: kw,
      alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mba` },
      openGraph: {
        title: otitle,
        description: override.description,
        type: 'website',
        url: `https://edifyedu.in/universities/${u.id}/mba`,
        siteName: 'edifyedu.in',
        images: [{ url: 'https://edifyedu.in/og.png', width: 1200, height: 630, alt: `${formatUniversityDisplayName(u.name)} ${onlinePrefix(u.id)}MBA | edifyedu.in` }],
      },
      twitter: { card: 'summary_large_image', title: otitle, description: override.description, images: ['https://edifyedu.in/og.png'] },
      robots: { index: shouldIndexProgrammeHub(u, 'MBA').shouldIndex, follow: true },
    }
  }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['MBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  // Title and description fee: exact rupees from getExactFee, list price for a
  // list-vs-discount fee. getDisplayFee's compact form was parsed from
  // abbreviated pd.fees ("₹1.61L" for a ₹1,61,600 fee).
  const feeTok = formatExactFeeShort(getExactFee(u, 'MBA'))
  const specCount = pd?.specs?.length || 5
  const nirfLabel = nirfForProgramme(u, 'MBA')
  const nirfStr = nirfLabel ? `, ${nirfLabel}` : ''
  // Sprint 1 FIX 2: fee comes from getDisplayFee (one canonical source).
  // When feeTok === false the fee is suppressed everywhere; user sees
  // "Fee structure verified by our counsellor" and the lead CTA instead.
  const title = reviewTitle ?? (feeTok
    ? clampTitleFeeLed(
        `${titleName} ${onlinePrefix(u.id)}MBA Fees ${year}: ${feeTok}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        `${shortName} ${onlinePrefix(u.id)}MBA Fees ${year}: ${feeTok}${naacSegment(u.naac)} [Review] | edifyedu.in`,
        feeTok,
      )
    : clampTitle(`${titleName} ${onlinePrefix(u.id)}MBA ${year}: ${naacPhrase(u.naac, "UGC-DEB Entitled")} [Review] | edifyedu.in`))
  const baseDescription = feeTok
    ? clampDescription(`${titleName} ${onlinePrefix(u.id)}MBA ${year}: ${feeTok} fees, ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved. See honest review, syllabus and placement data.`)
    : clampDescription(`${titleName} ${onlinePrefix(u.id)}MBA ${year}: ${specCount}+ specialisations${naacSegment(u.naac)}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved.`)

  const keywords = [
    `${u.name} online MBA fees`,
    `${u.name} online MBA syllabus`,
    `${u.name} online MBA placements`,
    `${u.name} online MBA reviews`,
    `${u.name} online MBA admission ${year}`,
    `${u.abbr} online MBA`,
    `${u.name} MBA fees syllabus placements reviews`,
  ].join(', ')

  // Mode-unverified universities: see lib/seo/mode-unverified.ts.
  const description = shouldIndexUniversity(u.id)
    ? baseDescription
    : unverifiedDescription(u.name, 'MBA')

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
          alt: `${formatUniversityDisplayName(u.name)} ${onlinePrefix(u.id)}MBA | edifyedu.in`,
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
  // "Galgotias University Online ${onlinePrefix(u.id)}MBA" in every schema payload.
  const brand = formatUniversityDisplayName(u.name)

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${brand} ${onlinePrefix(u.id)}MBA`,
    description: `UGC-DEB approved ${onlinePrefix(u.id)}MBA from ${brand}.${naacAccredited(u.naac)} ${pd.specs?.length || 0}+ specialisations${getProgramSchemaFeeFragment(u, 'MBA')}.`,
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
  const mbaLinks = getProgramLinks(u.id, 'mba')
  const reviewOwned = !!mbaLinks?.keywordLink && !mbaLinks.keepHubTitle
  return (
    <>
      <MBAProgramSchema u={u} pd={pd} />
      <UniProgramBody
        u={u}
        program="MBA"
        programSlug="mba"
        pd={pd}
        customH1={reviewOwned ? undefined : override?.h1}
        h1Variant={reviewOwned ? 'admission' : undefined}
        customIntro={override?.intro}
      />
    </>
  )
}

export const revalidate = false
