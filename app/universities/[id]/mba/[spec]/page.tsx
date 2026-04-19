// app/universities/[id]/mba/[spec]/page.tsx
// University MBA Specialization Page - e.g., /universities/amity-university-online/mba/marketing
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, getSpecDisplayName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec } from '@/lib/seo-title'

// ── Static Params — sourced from Excel manifest ───────────────────────────────
export async function generateStaticParams() {
  return getProgramSpecParams('mba')
}

// ── Per-page Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string; spec: string }> }
): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) return { title: 'Not Found' }

  const spec = getSpecDisplayName(id, 'mba', specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const pd = u.programDetails['MBA']
  const fee = pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`
  const title = `${titleName} Online MBA in ${shortSpec} ${year} | EdifyEdu`
  const description = `${titleName} MBA in ${spec}: fees ${fee}, NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved. Admissions open ${year}.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}/mba/${specSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://edifyedu.in/universities/${u.id}/mba/${specSlug}`,
      type: 'website',
      images: [{ url: '/og.webp', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  }
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function SpecializationPage(
  { params }: { params: Promise<{ id: string; spec: string }> }
) {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  if (!u) notFound()

  const spec = getSpecDisplayName(id, 'mba', specSlug)
  if (!spec) notFound()

  const pd = u.programDetails['MBA']
  if (!pd) notFound()

  return (
    <UniSpecBody
      u={u}
      program="MBA"
      programSlug="mba"
      spec={spec}
      specSlug={specSlug}
      pd={pd}
    />
  )
}

export const revalidate = 21600
export const dynamicParams = true
