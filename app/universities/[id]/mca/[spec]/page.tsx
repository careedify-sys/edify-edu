// app/universities/[id]/mca/[spec]/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getMasterSyllabus } from '@/lib/content'
import { getProgramSpecParams, resolveSpecName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
import { getSpecPageContent } from '@/lib/data/page-content'

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
  if (!u) return { title: 'Not Found', robots: { index: false, follow: false } }

  const spec = resolveSpecName(id, 'MCA', 'mca', specSlug)
  if (!spec) return { title: 'Not Found', robots: { index: false, follow: false } }

  const year = new Date().getFullYear()
  const syllabus = getMasterSyllabus(u.id, 'MCA') as any
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const pd = u.programDetails['MCA']
  const fee = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  const title = clampTitle(`${titleName} MCA ${shortSpec} ${year}: ${fee}, NAAC ${u.naac} | EdifyEdu`)
  const description = clampDescription(syllabus?.metaDesc
    ? `${u.name} Online MCA in ${spec} ${year}. ${syllabus.metaDesc}`
    : `${u.name} Online MCA in ${spec} ${year}: ${fee} fees, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. Check syllabus, eligibility & career scope free.`)

  return {
    title,
    description,
    keywords: syllabus?.metaKeywords || undefined,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/mca/${specSlug}` },
    openGraph: { title, description, type: 'website' },
    robots: getSpecPageContent(id, 'mca', specSlug)
      ? { index: true, follow: true }
      : { index: false, follow: true },
  }
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function MCASpecPage(
  { params }: { params: Promise<{ id: string; spec: string }> }
) {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) notFound()

  const pd = u.programDetails['MCA']
  if (!pd) redirect(`/universities/${u.id}`)
  const spec = resolveSpecName(id, 'MCA', 'mca', specSlug)
  if (!spec) notFound()

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

export const revalidate = false
export const dynamicParams = true
