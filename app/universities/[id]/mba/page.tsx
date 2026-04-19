// app/universities/[id]/mba/page.tsx
import { notFound } from 'next/navigation'
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
  const title = `${titleName} Online MBA — Fees, Syllabus & Specialisations ${year} | EdifyEdu`
  const description = `${titleName} Online MBA: ${pd?.specs?.length || 5}+ specialisations, fees ${pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`}, NAAC ${u.naac}${u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved. Compare, verify, enrol.`

  return {
    title,
    description,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mba` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function OnlineMBAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MBA')) notFound()
  const pd = u.programDetails['MBA']
  if (!pd) notFound()

  return <UniProgramBody u={u} program="MBA" programSlug="mba" pd={pd} />
}

export const revalidate = 21600
