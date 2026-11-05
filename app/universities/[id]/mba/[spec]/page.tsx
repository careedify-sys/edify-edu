// app/universities/[id]/mba/[spec]/page.tsx
// University MBA Specialization Page - e.g., /universities/amity-university-online/mba/marketing
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { nirfForProgramme } from '@/lib/data-slim'
import { getProgramSpecParams, resolveSpec } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, getShortTitleName, shortenSpec, clampTitle, clampTitleSpecLed, clampDescription } from '@/lib/seo-title'
import { getExactFee, formatExactFeeShort } from '@/lib/fees'
import { pageKeywords } from '@/lib/page-keywords'
import { naacSuffix, naacSegment, naacAccredited } from '@/lib/seo/display-guards'
import { shouldIndexUniversity, unverifiedDescription } from '@/lib/seo/mode-unverified'

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
  // Soft-404 fix (2026-08-29): notFound() here, not a noindex title. This route
  // sits under app/universities/[id]/loading.tsx, so by the time the page
  // component runs Next has already flushed the streaming shell with a 200 and
  // its notFound() can only swap the UI, never the status. generateMetadata
  // resolves before that first flush, so throwing here is what actually
  // produces HTTP 404. Branch order mirrors the page component exactly; the
  // !pd branch stays a plain return so the page's redirect() still wins.
  if (!u) notFound()
  if (!u.programDetails['MBA']) return { title: 'Not Found', robots: { index: false, follow: false } }

  const resolved = resolveSpec(id, 'MBA', 'mba', specSlug)
  if (!resolved) notFound()
  const spec = resolved.name
  const canonicalSlug = resolved.slug

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const pd = u.programDetails['MBA']
  // Exact rupees via getExactFee, list price for a discounted fee. This was
  // compactFee of raw pd.fees, or of the MBA-led feeMin, with no getDisplayFee
  // gate, so a suppressed or placeholder fee could still reach the title.
  const feeExact = formatExactFeeShort(getExactFee(u, 'MBA'))
  const fee = feeExact ?? 'UGC-DEB Approved'
  const nirfLabel = nirfForProgramme(u, 'MBA')
  const nirfStr = nirfLabel ? `, ${nirfLabel}` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  const title = clampTitleSpecLed(
      `${titleName} MBA ${shortSpec} ${year}: ${fee}${naacSegment(u.naac)} | EdifyEdu`,
      `${shortName} MBA ${shortSpec} ${year}: ${fee}${naacSegment(u.naac)} | EdifyEdu`,
      shortSpec,
    )
  const baseDescription = clampDescription(`Online MBA in ${spec} from ${titleName}: ${feeExact ? `${feeExact} fees` : 'fees on request'}, eligibility, syllabus and admission ${year}.${naacSuffix(u.naac)}${nirfStr}. UGC-DEB approved. Compare before you enrol.`)

  // Mode-unverified universities: see lib/seo/mode-unverified.ts.
  const description = shouldIndexUniversity(u.id)
    ? baseDescription
    : unverifiedDescription(u.name, 'MBA')

  return {
    title,
    description,
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}/mba/${canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://edifyedu.in/universities/${u.id}/mba/${canonicalSlug}`,
      type: 'website',
      images: [{ url: '/og.webp', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: shouldIndexUniversity(u.id), follow: true },
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
  const resolved = resolveSpec(id, 'MBA', 'mba', specSlug)
  if (!resolved) notFound()
  if (resolved.slug !== specSlug) redirect(`/universities/${u.id}/mba/${resolved.slug}`)

  const kw = pageKeywords[`${u.id}-mba`]?.join(', ') || undefined

  return (
    <UniSpecBody
      u={u}
      program="MBA"
      programSlug="mba"
      spec={resolved.name}
      specSlug={resolved.slug}
      pd={pd}
      keywords={kw}
    />
  )
}

export const revalidate = false
export const dynamicParams = true
