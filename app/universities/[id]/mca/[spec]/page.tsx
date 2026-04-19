// app/universities/[id]/mca/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getMasterSyllabus } from '@/lib/content'
import { getProgramSpecParams, getSpecDisplayName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec } from '@/lib/seo-title'

// ── Static Params — sourced from Excel manifest ───────────────────────────────
export async function generateStaticParams() {
  return getProgramSpecParams('mca')
}

// ── Per-page Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string; spec: string }> }
): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) return { title: 'Not Found' }

  const spec = getSpecDisplayName(id, 'mca', specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const title = `${titleName} MCA in ${shortSpec} — Fees ${year} | EdifyEdu`
  const description = syllabus?.metaDesc
    ? `${u.name} MCA in ${spec}. ${syllabus.metaDesc}`
    : `${u.name} MCA in ${spec} — fees, syllabus, eligibility & career scope. NAAC ${u.naac}. UGC DEB approved. Admissions open ${year}.`

  return {
    title,
    description,
    keywords: syllabus?.metaKeywords || undefined,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mca/${specSlug}` },
    openGraph: { title, description, type: 'website' },
    robots: { index: true, follow: true },
  }
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function MCASpecPage(
  { params }: { params: Promise<{ id: string; spec: string }> }
) {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) notFound()

  const spec = getSpecDisplayName(id, 'mca', specSlug)
  if (!spec) notFound()

  const pd = u.programDetails['MCA']
  if (!pd) notFound()

  return (
    <UniSpecBody
      u={u}
      program="MCA"
      programSlug="mca"
      spec={spec}
      specSlug={specSlug}
      pd={pd}
    />
  )
}

export const revalidate = 21600
export const dynamicParams = true
