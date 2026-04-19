// app/universities/[id]/bca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'
import UniProgramBody from '@/components/UniProgramBody'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('BCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BCA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['BCA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const title = `${titleName} Online BCA — Fees, Syllabus & Specialisations ${year} | EdifyEdu`
  const description = `${titleName} Online BCA: fees ${pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`}, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved 3-year degree.`

  return {
    title,
    description,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function OnlineBCAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('BCA')) notFound()
  const pd = u.programDetails['BCA']
  if (!pd) notFound()

  return <UniProgramBody u={u} program="BCA" programSlug="bca" pd={pd} />
}

export const revalidate = 21600
