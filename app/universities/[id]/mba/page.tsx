// app/universities/[id]/mba/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
import { MBA_SEO_OVERRIDES } from '@/lib/mba-seo-overrides'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MBA')) return { title: 'Not Found', robots: { index: false, follow: false } }

  const override = MBA_SEO_OVERRIDES[id]
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
        siteName: 'EdifyEdu',
        images: [{ url: 'https://edifyedu.in/og.png', width: 1200, height: 630, alt: `${u.name} Online MBA — EdifyEdu` }],
      },
      twitter: { card: 'summary_large_image', title: override.title, description: override.description, images: ['https://edifyedu.in/og.png'] },
      robots: { index: true, follow: true },
    }
  }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['MBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const feeDisplay = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K`)
  const specCount = pd?.specs?.length || 5
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : u.nirfMgt && u.nirfMgt < 200 ? `, NIRF #${u.nirfMgt} Mgmt` : ''
  // CTR-tuned title (2026-05-25): fee number leads, NAAC + bracket review hook.
  const title = clampTitle(`${titleName} Online MBA ${year}: ${feeDisplay} Fees, NAAC ${u.naac} [Review] | EdifyEdu`)
  // Description: fee + spec count + accreditation up front, micro-CTA at end, no "Compare" lead.
  const description = clampDescription(`${titleName} Online MBA ${year}: ${feeDisplay} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. See honest review, syllabus & placement data.`)

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
      siteName: 'EdifyEdu',
      images: [
        {
          url: 'https://edifyedu.in/og.png',
          width: 1200,
          height: 630,
          alt: `${u.name} Online MBA — EdifyEdu`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://edifyedu.in/og.png'],
    },
    robots: { index: true, follow: true },
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

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${u.name} Online MBA`,
    description: `UGC-DEB approved Online MBA from ${u.name}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations, fees ${pd.fees || `from ₹${Math.round(u.feeMin / 1000)}K`}.`,
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
  const u = getUniversityById(id)
  if (!u) notFound()
  // Programs listed in u.programs but missing from programDetails (data drift)
  // would 404 — redirect to the university page instead of breaking the URL.
  const pd = u.programDetails['MBA']
  if (!u.programs.includes('MBA') || !pd) notFound()

  const override = MBA_SEO_OVERRIDES[id]
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
