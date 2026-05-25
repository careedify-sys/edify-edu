// app/universities/[id]/mca/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getTitleName, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
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
  const feeDisplay = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const specCount = pd?.specs?.length || 3
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): fee + NAAC + bracket review hook, year first.
  const title = clampTitle(`${titleName} Online MCA ${year}: ${feeDisplay} Fees, NAAC ${u.naac} [Review] | EdifyEdu`)
  const description = clampDescription(syllabus?.metaDesc ||
    `${titleName} Online MCA ${year}: ${feeDisplay} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. Check syllabus, placement & eligibility free.`)

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
  if (!u) notFound()
  const pd = u.programDetails['MCA']
  if (!u.programs.includes('MCA') || !pd) redirect(`/universities/${u.id}`)

  return <UniProgramBody u={u} program="MCA" programSlug="mca" pd={pd} />
}

export const revalidate = false
