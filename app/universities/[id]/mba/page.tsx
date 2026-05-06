// app/universities/[id]/mba/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'
import UniProgramBody from '@/components/UniProgramBody'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MBA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['MBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const feeDisplay = pd?.fees || `₹${Math.round(u.feeMin / 1000)}K`
  const specCount = pd?.specs?.length || 5
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : u.nirfMgt && u.nirfMgt < 200 ? `, NIRF #${u.nirfMgt} Mgmt` : ''
  const title = `${titleName} Online MBA ${year}: Fees, Placement, Syllabus & Reviews | EdifyEdu`
  const description = `${titleName} Online MBA ${year}: ${feeDisplay} fees, ${specCount}+ specialisations, UGC-DEB approved, NAAC ${u.naac}${nirfStr}. Compare honest reviews at EdifyEdu.`

  return {
    title,
    description,
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

export default async function OnlineMBAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u) notFound()
  // Programs listed in u.programs but missing from programDetails (data drift)
  // would 404 — redirect to the university page instead of breaking the URL.
  const pd = u.programDetails['MBA']
  if (!u.programs.includes('MBA') || !pd) redirect(`/universities/${u.id}`)

  return <UniProgramBody u={u} program="MBA" programSlug="mba" pd={pd} />
}

export const revalidate = false
