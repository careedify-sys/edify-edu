// app/universities/[id]/bca/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getTitleName, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
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
  const feeDisplay = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const specCount = pd?.specs?.length || 4
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): fee + NAAC + bracket review hook, year first.
  const title = clampTitle(`${titleName} Online BCA ${year}: ${feeDisplay} Fees, NAAC ${u.naac} [Review] | EdifyEdu`)
  const description = clampDescription(`${titleName} Online BCA ${year}: ${feeDisplay} fees, ${specCount}+ specialisations, NAAC ${u.naac}${nirfStr}. UGC-DEB approved 3-year degree. Check syllabus & eligibility free.`)

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
  if (!u) notFound()
  const pd = u.programDetails['BCA']
  if (!u.programs.includes('BCA') || !pd) redirect(`/universities/${u.id}`)

  return <UniProgramBody u={u} program="BCA" programSlug="bca" pd={pd} />
}

export const revalidate = false
