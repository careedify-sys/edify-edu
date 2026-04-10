// app/universities/[id]/mca/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { getMasterSyllabus } from '@/lib/content'
import SpecializationPageClient from '@/components/SpecializationPageClient'

const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export async function generateStaticParams() {
  const params: { id: string; spec: string }[] = []
  for (const u of UNIVERSITIES) {
    const pd = u.programDetails['MCA']
    if (pd?.specs) {
      for (const spec of pd.specs) {
        params.push({ id: u.id, spec: makeSlug(spec) })
      }
    }
  }
  return params
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string; spec: string }> }
): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) return { title: 'Not Found' }
  
  const pd = u.programDetails['MCA']
  const spec = pd?.specs?.find(s => makeSlug(s) === specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const title = `${u.name} MCA in ${spec} - Fees, Syllabus, Placements ${year}`
  const description = syllabus?.metaDesc
    ? `${u.name} MCA in ${spec}. ${syllabus.metaDesc}`
    : `${u.name} MCA in ${spec} - Fees, syllabus, eligibility, career scope. NAAC ${u.naac}. UGC DEB approved.`
  const keywords = syllabus?.metaKeywords || undefined

  return {
    title, description, keywords,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mca/${specSlug}` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

export default async function MCASpecPage({ params }: { params: Promise<{ id: string; spec: string }> }) {
  const { id, spec: specSlug } = await params
  const university = getUniversityById(id)
  if (!university) notFound()
  
  const pd = university.programDetails['MCA']
  const spec = pd?.specs?.find(s => makeSlug(s) === specSlug)
  if (!spec) notFound()

  return <SpecializationPageClient university={university} program="MCA" specialization={spec} specSlug={specSlug} />
}

export const revalidate = 21600
export const dynamicParams = true
