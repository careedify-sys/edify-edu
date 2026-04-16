// app/universities/[id]/mba/[spec]/page.tsx
// University MBA Specialization Page - e.g., /universities/amity/mba/marketing
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import SpecializationPageClient from '@/components/SpecializationPageClient'
import { getTitleName, shortenSpec } from '@/lib/seo-title'

// Helper to create slug
const makeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

// ── Static Params (SSG) — pre-render all university+specialization combinations ──
export async function generateStaticParams() {
  const params: { id: string; spec: string }[] = []
  
  for (const u of UNIVERSITIES) {
    const pd = u.programDetails['MBA']
    if (pd?.specs) {
      for (const spec of pd.specs) {
        params.push({ id: u.id, spec: makeSlug(spec) })
      }
    }
  }
  
  return params
}

// ── Per-page Metadata — Professional SEO titles ──
export async function generateMetadata(
  { params }: { params: Promise<{ id: string; spec: string }> }
): Promise<Metadata> {
  const { id, spec: specSlug } = await params
  const u = getUniversityById(id)
  
  if (!u) {
    return { title: 'University Not Found' }
  }

  const pd = u.programDetails['MBA']
  // Find spec by slug or use slug as fallback
  const spec = pd?.specs?.find(s => makeSlug(s) === specSlug) || specSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  const year = new Date().getFullYear()
  const cleanName = u.name.replace(/\bOnline\b\s*$/i, '').trim()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const title = `${titleName} Online MBA in ${shortSpec} ${year} | EdifyEdu`
  const fee = pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`
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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  }
}

// ── Page Component (Server Component) ──
export default async function SpecializationPage(
  { params }: { params: Promise<{ id: string; spec: string }> }
) {
  const { id, spec: specSlug } = await params
  const university = getUniversityById(id)
  
  if (!university) {
    notFound()
  }

  const pd = university.programDetails['MBA']
  // Find spec by slug or use slug as fallback (for dynamicParams)
  const spec = pd?.specs?.find(s => makeSlug(s) === specSlug) || specSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <SpecializationPageClient 
      university={university} 
      program="MBA"
      specialization={spec}
      specSlug={specSlug}
    />
  )
}

// ── ISR Configuration ──
export const revalidate = 21600
export const dynamicParams = true
