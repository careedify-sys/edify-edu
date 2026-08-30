// app/universities/[id]/bca/[spec]/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUniversityById } from '@/lib/data'
import { getProgramSpecParams, resolveSpec } from '@/lib/data/programs'
import UniSpecBody from '@/components/UniSpecBody'
import { getTitleName, getShortTitleName, shortenSpec, clampTitle, clampTitleSpecLed, clampDescription, compactFee } from '@/lib/seo-title'
import { pageKeywords } from '@/lib/page-keywords'
import { naacSuffix, naacSegment, naacAccredited } from '@/lib/seo/display-guards'

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
  // Soft-404 fix (2026-08-29): notFound() here, not a noindex title. This route
  // sits under app/universities/[id]/loading.tsx, so by the time the page
  // component runs Next has already flushed the streaming shell with a 200 and
  // its notFound() can only swap the UI, never the status. generateMetadata
  // resolves before that first flush, so throwing here is what actually
  // produces HTTP 404. Branch order mirrors the page component exactly; the
  // !pd branch stays a plain return so the page's redirect() still wins.
  if (!u) notFound()
  if (!u.programDetails['BCA']) return { title: 'Not Found', robots: { index: false, follow: false } }

  const resolved = resolveSpec(id, 'BCA', 'bca', specSlug)
  if (!resolved) notFound()
  const spec = resolved.name
  const canonicalSlug = resolved.slug

  const year = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const shortName = getShortTitleName(u.id, u.shortName, u.name, u.abbr)
  const shortSpec = shortenSpec(spec)
  const pd = u.programDetails['BCA']
  const fee = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  return {
    title: clampTitleSpecLed(
      `${titleName} BCA ${shortSpec} ${year}: ${fee}${naacSegment(u.naac)} | EdifyEdu`,
      `${shortName} BCA ${shortSpec} ${year}: ${fee}${naacSegment(u.naac)} | EdifyEdu`,
      shortSpec,
    ),
    description: clampDescription(`${u.name} Online BCA in ${spec} ${year}: ${fee} fees${naacSegment(u.naac)}${nirfStr}. UGC-DEB approved 3-year degree. Check syllabus, eligibility & career scope free.`),
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/bca/${canonicalSlug}` },
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
  const resolved = resolveSpec(id, 'BCA', 'bca', specSlug)
  if (!resolved) notFound()
  if (resolved.slug !== specSlug) redirect(`/universities/${u.id}/bca/${resolved.slug}`)

  const kw = pageKeywords[`${u.id}-bca`]?.join(', ') || undefined

  return (
    <UniSpecBody
      u={u}
      program="BCA"
      programSlug="bca"
      spec={resolved.name}
      specSlug={resolved.slug}
      pd={pd}
      keywords={kw}
    />
  )
}

export const revalidate = false
export const dynamicParams = true
