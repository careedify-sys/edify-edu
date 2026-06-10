// app/universities/[id]/bca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BCA')) return { title: 'Not Found', robots: { index: false, follow: false } }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['BCA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const feeDisplay = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const specCount = pd?.specs?.length || 4
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): fee + NAAC + bracket review hook, year first.
  const title = clampTitle(`${titleName} Online BCA ${year}: ${feeDisplay} Fees, NAAC ${u.naac} [Review] | EdifyEdu`)
  const description = clampDescription(`${titleName} Online BCA ${year}: ${feeDisplay} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved 3-year degree. Check syllabus & eligibility free.`)

  const keywords = [
    `${u.name} online BCA fees`,
    `${u.name} online BCA syllabus`,
    `${u.name} online BCA placements`,
    `${u.name} online BCA reviews`,
    `${u.name} online BCA admission ${year}`,
    `${u.abbr} online BCA`,
  ].join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
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
    name: `${u.name} Online BCA`,
    description: `UGC-DEB approved Online BCA from ${u.name}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations, fees ${pd.fees || `from ₹${Math.round(u.feeMin / 1000)}K`}.`,
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

export default async function OnlineBCAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u) notFound()
  const pd = u.programDetails['BCA']
  if (!u.programs.includes('BCA') || !pd) notFound()

  return (
    <>
      <BCAProgramSchema u={u} pd={pd} />
      <UniProgramBody u={u} program="BCA" programSlug="bca" pd={pd} />
    </>
  )
}

export const revalidate = false
