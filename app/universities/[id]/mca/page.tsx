// app/universities/[id]/mca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
import { getMasterSyllabus } from '@/lib/content'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MCA')) return { title: 'Not Found', robots: { index: false, follow: false } }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['MCA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const feeDisplay = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const specCount = pd?.specs?.length || 3
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): fee + NAAC + bracket review hook, year first.
  const title = clampTitle(`${titleName} Online MCA ${year}: ${feeDisplay} Fees, NAAC ${u.naac} [Review] | EdifyEdu`)
  const description = clampDescription(syllabus?.metaDesc ||
    `${titleName} Online MCA ${year}: ${feeDisplay} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. Check syllabus, placement & eligibility free.`)

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
    robots: { index: true, follow: true },
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
    description: `UGC-DEB approved Online MCA from ${u.name}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations, fees ${pd.fees || `from ₹${Math.round(u.feeMin / 1000)}K`}.`,
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
  const u = getUniversityById(id)
  if (!u) notFound()
  const pd = u.programDetails['MCA']
  if (!u.programs.includes('MCA') || !pd) notFound()

  return (
    <>
      <MCAProgramSchema u={u} pd={pd} />
      <UniProgramBody u={u} program="MCA" programSlug="mca" pd={pd} />
    </>
  )
}

export const revalidate = false
