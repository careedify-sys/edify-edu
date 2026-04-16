// app/universities/[id]/bca/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import SpecializationPageClient from '@/components/SpecializationPageClient'
import { getTitleName, shortenSpec } from '@/lib/seo-title'

const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

export async function generateStaticParams() {
  const params: { id: string; spec: string }[] = []
  for (const u of UNIVERSITIES) {
    const pd = u.programDetails['BCA']
    if (pd?.specs) {
      for (const spec of pd.specs) {
        params.push({ id: u.id, spec: makeSlug(spec) })
      }
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; spec: string }> }): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) return { title: 'Not Found' }
  
  const pd = u.programDetails['BCA']
  const spec = pd?.specs?.find(s => makeSlug(s) === specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  return {
    title: `${titleName} BCA in ${shortSpec} — Fees ${year} | EdifyEdu`,
    description: `${u.name} BCA in ${spec} — fees, syllabus, eligibility & career scope. NAAC ${u.naac}. UGC DEB approved. 3-year program, admissions open ${year}.`,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca/${specSlug}` },
  }
}

export default async function BCASpecPage({ params }: { params: Promise<{ id: string; spec: string }> }) {
  const { id, spec: specSlug } = await params
  const university = getUniversityById(id)
  if (!university) notFound()
  
  const pd = university.programDetails['BCA']
  const spec = pd?.specs?.find(s => makeSlug(s) === specSlug) || specSlug.replace(/-/g, ' ')

  return <SpecializationPageClient university={university} program="BCA" specialization={spec} specSlug={specSlug} />
}

export const revalidate = 21600
export const dynamicParams = true
