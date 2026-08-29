// app/universities/[id]/[program]/[spec]/page.tsx
import { notFound, redirect, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById, specSlug as getSpecSlug, specName as getSpecName } from '@/lib/data'
import type { Program } from '@/lib/data'
import { resolveSpec } from '@/lib/data/programs'
import { getTitleName, clampTitle, clampDescription, compactFee, shortenSpec } from '@/lib/seo-title'
import UniSpecBody from '@/components/UniSpecBody'
import { naacSuffix, naacSegment, naacAccredited } from '@/lib/seo/display-guards'

const PM: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'BA',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA', 'msc': 'MSc', 'bsc': 'BSc',
  'online-mba': 'MBA', 'online-mca': 'MCA', 'online-bba': 'BBA', 'online-bca': 'BCA',
  'online-ba': 'BA', 'online-bcom': 'B.Com', 'online-mcom': 'M.Com',
  'online-ma': 'MA', 'online-msc': 'MSc',
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string; program: string; spec: string }> }
): Promise<Metadata> {
  const { id, program: programSlug, spec: specSlug } = await params
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]
  // Soft-404 fix (2026-08-29): notFound() here, not a noindex title. This route
  // sits under app/universities/[id]/loading.tsx, so by the time the page
  // component runs Next has already flushed the streaming shell with a 200 and
  // its notFound() can only swap the UI, never the status. generateMetadata
  // resolves before that first flush, so throwing here is what actually
  // produces HTTP 404. Branch order mirrors the page component exactly; the
  // !pd branch stays a plain return so the page's redirect() still wins.
  if (!u) notFound()
  if (!program) return { title: 'Not Found', robots: { index: false, follow: false } }

  const pd      = u.programDetails[program]
  if (!pd) return { title: 'Not Found', robots: { index: false, follow: false } }
  const resolved = resolveSpec(id, program, programSlug.toLowerCase(), specSlug)
  if (!resolved) notFound()
  const spec = resolved.name
  const canonicalSlug = resolved.slug

  const shortSpec = shortenSpec(spec)
  const year     = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const fees = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  // Uses shortenSpec so long names like "Healthcare Management" stay clampable.
  const title     = clampTitle(`${titleName} ${program} ${shortSpec} ${year}: ${fees}${naacSegment(u.naac)} | EdifyEdu`)
  const description = clampDescription(`Online ${program} in ${spec} from ${titleName}: ${fees} fees, eligibility, syllabus and admission ${year}.${naacSuffix(u.naac)}${nirfStr}. UGC-DEB approved. Compare before you enrol.`)

  return {
    title,
    description,
    keywords: [
      `${u.name} online ${program} ${spec}`,
      `${u.name} ${program} ${spec} fees`,
      `${u.name} ${program} ${spec} syllabus`,
      `online ${program} ${spec} india ${year}`,
    ].join(', '),
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/${programSlug}/${canonicalSlug}` },
    openGraph: {
      title, description, type: 'website',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  }
}

export default async function UniversitySpecPage(
  { params }: { params: Promise<{ id: string; program: string; spec: string }> }
) {
  const { id, program: programSlug, spec: specSlug } = await params
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!u) notFound()
  if (!program) permanentRedirect(`/universities/${u.id}`)
  if (!u.programDetails[program]) redirect(`/universities/${u.id}`)

  const pd      = u.programDetails[program]!
  const resolved = resolveSpec(id, program, programSlug.toLowerCase(), specSlug)
  if (!resolved) notFound()
  if (resolved.slug !== specSlug) redirect(`/universities/${u.id}/${programSlug}/${resolved.slug}`)

  return (
    <UniSpecBody
      u={u}
      program={program}
      programSlug={programSlug}
      spec={resolved.name}
      specSlug={resolved.slug}
      pd={pd}
    />
  )
}

export const revalidate = false
export const dynamicParams = true
