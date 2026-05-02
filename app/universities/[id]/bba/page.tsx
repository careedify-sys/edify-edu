// app/universities/[id]/bba/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'
import UniProgramBody from '@/components/UniProgramBody'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BBA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BBA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['BBA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const title = `${titleName} Online BBA — Fees, Syllabus & Specialisations ${year} | EdifyEdu`
  const description = `${titleName} Online BBA: fees ${pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`}, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved 3-year degree.`

  return {
    title,
    description,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bba` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function OnlineBBAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BBA')) notFound()
  const pd = u.programDetails['BBA']
  if (!pd) notFound()

  return <UniProgramBody u={u} program="BBA" programSlug="bba" pd={pd} />
}

export const revalidate = false
