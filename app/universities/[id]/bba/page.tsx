// app/universities/[id]/bba/page.tsx
//
// Task 3 slice 3b (2026-08-18): metadata and page component both branch on
// resolveProgramme('bba'). Prior metadata guarded on !u.programs.includes('BBA')
// only; body ALSO required u.programDetails['BBA']. Class-A hubs emitted a
// full metadata title with noindex,follow while the body threw notFound() and
// served the bare-noindex shell. Both now agree on the same resolver result.
// Edge middleware /bba path (section 2d) is what turns them into real HTTP 404.
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { ProgramDetail } from '@/lib/data'
import { getTitleName, getShortTitleName, clampTitle, clampTitleFeeLed, clampDescription } from '@/lib/seo-title'
import { getDisplayFee } from '@/lib/fees'
import { shouldIndexProgrammeHub } from '@/lib/seo/should-index'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '@/lib/seo/program-schema'
import UniProgramBody from '@/components/UniProgramBody'
import { pageKeywords } from '@/lib/page-keywords'
import { resolveProgramme } from '@/lib/seo/resolve-programme'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const r = resolveProgramme(id, 'bba')
  if (r.kind === 'not-found') return { title: 'Not Found', robots: { index: false, follow: false } }
  const u = r.university
  const pd: ProgramDetail = r.pd

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  const fee = getDisplayFee(u, 'BBA')
  const specCount = pd?.specs?.length || 4
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  const title = fee.ok
    ? clampTitleFeeLed(
        `${titleName} Online BBA Fees ${year}: ${fee.compact}, NAAC ${u.naac} [Review] | edifyedu.in`,
        `${shortName} Online BBA Fees ${year}: ${fee.compact}, NAAC ${u.naac} [Review] | edifyedu.in`,
        fee.compact ?? null,
      )
    : clampTitle(`${titleName} Online BBA ${year}: NAAC ${u.naac} [Review] | edifyedu.in`)
  const description = fee.ok
    ? clampDescription(`${titleName} Online BBA ${year}: ${fee.compact} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved 3-year degree.`)
    : clampDescription(`${titleName} Online BBA ${year}: ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. Fee structure verified by our counsellor. UGC-DEB approved 3-year degree.`)

  const keywords = [
    `${u.name} online BBA fees`,
    `${u.name} online BBA syllabus`,
    `${u.name} online BBA placements`,
    `${u.name} online BBA reviews`,
    `${u.name} online BBA admission ${year}`,
    `${u.abbr} online BBA`,
  ].join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bba` },
    openGraph: { title, description, type: 'website' },
    robots: { index: shouldIndexProgrammeHub(u, 'BBA').shouldIndex, follow: true },
  }
}

function BBAProgramSchema({
  u,
  pd,
}: {
  u: NonNullable<ReturnType<typeof getUniversityById>>
  pd: ProgramDetail
}) {
  const baseUrl = 'https://edifyedu.in'
  const pageUrl = `${baseUrl}/universities/${u.id}/bba`
  const durationYears = parseInt(pd.duration?.replace(/[^0-9]/g, '') || '3', 10) || 3
  const kw = pageKeywords[`${u.id}-bba`]?.join(', ') || ''

  const programSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${u.name} Online BBA`,
    description: `UGC-DEB approved Online BBA from ${u.name}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations${getProgramSchemaFeeFragment(u, 'BBA')}.`,
    url: pageUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
  }

  const offer = getProgramSchemaOffer(u, 'BBA')
  if (offer) programSchema.offers = offer

  if (kw) programSchema.keywords = kw

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${baseUrl}/universities` },
      { '@type': 'ListItem', position: 3, name: u.name, item: `${baseUrl}/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: 'Online BBA', item: pageUrl },
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

export default async function OnlineBBAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const r = resolveProgramme(id, 'bba')
  if (r.kind === 'not-found') notFound()
  const { university: u, pd } = r

  return (
    <>
      <BBAProgramSchema u={u} pd={pd} />
      <UniProgramBody u={u} program="BBA" programSlug="bba" pd={pd} />
    </>
  )
}

export const revalidate = false
