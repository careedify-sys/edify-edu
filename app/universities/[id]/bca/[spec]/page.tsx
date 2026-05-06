// app/universities/[id]/bca/[spec]/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, resolveSpecName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec } from '@/lib/seo-title'

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
  if (!u) return { title: 'Not Found' }

  const spec = resolveSpecName(id, 'BCA', 'bca', specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  return {
    title: `${titleName} BCA in ${shortSpec} — Fees ${year} | EdifyEdu`,
    description: `${u.name} BCA in ${spec} — fees, syllabus, eligibility & career scope. NAAC ${u.naac}. UGC DEB approved. 3-year program, admissions open ${year}.`,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca/${specSlug}` },
    robots: { index: true, follow: true },
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
  if (!spec) redirect(`/universities/${u.id}/bca`)

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
