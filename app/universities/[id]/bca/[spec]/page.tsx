// app/universities/[id]/bca/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, getSpecDisplayName } from '@/lib/data/programs'
import SpecializationPageClient from '@/components/SpecializationPageClient'
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

  const spec = getSpecDisplayName(id, 'bca', specSlug)
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
  const university = getUniversityById(id)
  if (!university) notFound()

  const spec = getSpecDisplayName(id, 'bca', specSlug)
  if (!spec) notFound()

  return (
    <SpecializationPageClient
      university={university}
      program="BCA"
      specialization={spec}
      specSlug={specSlug}
    />
  )
}

export const revalidate = 21600
export const dynamicParams = true
