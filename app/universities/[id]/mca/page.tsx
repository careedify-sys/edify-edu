// app/universities/[id]/mca/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'
import { getMasterSyllabus } from '@/lib/content'
import UniProgramBody from '@/components/UniProgramBody'

export async function generateStaticParams() {
  return UNIVERSITIES.filter(u => u.programs.includes('MCA')).map(u => ({ id: u.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MCA')) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const pd   = u.programDetails['MCA']
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const description = syllabus?.metaDesc ||
    `${titleName} Online MCA: ${pd?.specs?.length || 3}+ specialisations, fees ${pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`}, NAAC ${u.naac}${u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved.`
  const title = `${titleName} Online MCA — Fees, Syllabus & Specialisations ${year} | EdifyEdu`

  return {
    title,
    description,
    keywords: syllabus?.metaKeywords || undefined,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mca` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function OnlineMCAPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const u = getUniversityById(id)
  if (!u || !u.programs.includes('MCA')) notFound()
  const pd = u.programDetails['MCA']
  if (!pd) notFound()

  return <UniProgramBody u={u} program="MCA" programSlug="mca" pd={pd} />
}

export const revalidate = 21600
