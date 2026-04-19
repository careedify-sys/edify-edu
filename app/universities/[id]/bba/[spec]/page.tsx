// app/universities/[id]/bba/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, getSpecDisplayName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec } from '@/lib/seo-title'

// ── Static Params — sourced from Excel manifest ───────────────────────────────
export async function generateStaticParams() {
  return getProgramSpecParams('bba')
}

// ── Per-page Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string; spec: string }> }
): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) return { title: 'Not Found' }

  const spec = getSpecDisplayName(id, 'bba', specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  return {
    title: `${titleName} BBA in ${shortSpec} — Fees ${year} | EdifyEdu`,
    description: `${u.name} BBA in ${spec} — fees, syllabus, eligibility & career scope. NAAC ${u.naac}. UGC DEB approved. 3-year program, admissions open ${year}.`,
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bba/${specSlug}` },
    robots: { index: true, follow: true },
  }
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function BBASpecPage(
  { params }: { params: Promise<{ id: string; spec: string }> }
) {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) notFound()

  const spec = getSpecDisplayName(id, 'bba', specSlug)
  if (!spec) notFound()

  const pd = u.programDetails['BBA']
  if (!pd) notFound()

  return (
    <UniSpecBody
      u={u}
      program="BBA"
      programSlug="bba"
      spec={spec}
      specSlug={specSlug}
      pd={pd}
    />
  )
}

export const revalidate = 21600
export const dynamicParams = true
