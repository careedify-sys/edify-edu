// app/universities/[id]/mba/[spec]/page.tsx
// University MBA Specialization Page - e.g., /universities/amity-university-online/mba/marketing
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, resolveSpecName } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, shortenSpec, clampTitle, clampDescription, compactFee } from '@/lib/seo-title'

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

  const spec = resolveSpecName(id, 'MBA', 'mba', specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const pd = u.programDetails['MBA']
  const fee = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : (u as any).nirfMgt && (u as any).nirfMgt < 200 ? `, NIRF #${(u as any).nirfMgt} Mgmt` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  const title = clampTitle(`${titleName} MBA ${shortSpec} ${year}: ${fee}, NAAC ${u.naac} | EdifyEdu`)
  const description = clampDescription(`${titleName} Online MBA in ${spec} ${year}: ${fee} fees, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. See syllabus, career data & honest review free.`)

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

  const pd = u.programDetails['MBA']
  if (!pd) redirect(`/universities/${u.id}`)
  const spec = resolveSpecName(id, 'MBA', 'mba', specSlug)
  if (!spec) redirect(`/universities/${u.id}/mba`)

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

export const revalidate = false
export const dynamicParams = true
