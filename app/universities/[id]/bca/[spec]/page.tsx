// app/universities/[id]/bca/[spec]/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, resolveSpecName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'
import { getSpecPageContent } from '@/lib/data/page-content'

// ── Static Params — sourced from Excel manifest ───────────────────────────────
export async function generateStaticParams() {
  return getProgramSpecParams('bca')
}

// ── Per-page Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string; spec: string }> }
): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) return { title: 'Not Found', robots: { index: false, follow: false } }

  const spec = resolveSpecName(id, 'BCA', 'bca', specSlug)
  if (!spec) return { title: 'Not Found', robots: { index: false, follow: false } }

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const pd = u.programDetails['BCA']
  const fee = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  return {
    title: clampTitle(`${titleName} BCA ${shortSpec} ${year}: ${fee}, NAAC ${u.naac} | EdifyEdu`),
    description: clampDescription(`${u.name} Online BCA in ${spec} ${year}: ${fee} fees, NAAC ${u.naac}${nirfStr}. UGC-DEB approved 3-year degree. Check syllabus, eligibility & career scope free.`),
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca/${specSlug}` },
    robots: getSpecPageContent(id, 'bca', specSlug)
      ? { index: true, follow: true }
      : { index: false, follow: true },
  }
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function BCASpecPage(
  { params }: { params: Promise<{ id: string; spec: string }> }
) {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) notFound()

  const pd = u.programDetails['BCA']
  if (!pd) redirect(`/universities/${u.id}`)
  const spec = resolveSpecName(id, 'BCA', 'bca', specSlug)
  if (!spec) notFound()

  return (
    <UniSpecBody
      u={u}
      program="BCA"
      programSlug="bca"
      spec={spec}
      specSlug={specSlug}
      pd={pd}
    />
  )
}

export const revalidate = false
export const dynamicParams = true
