// app/universities/[id]/[program]/[spec]/page.tsx
import { notFound, redirect, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById, specSlug as getSpecSlug, specName as getSpecName } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getTitleName, clampTitle, clampDescription, compactFee, shortenSpec } from '@/lib/seo-title'
import UniSpecBody from '@/components/UniSpecBody'
import { getSpecPageContent } from '@/lib/data/page-content'

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
  if (!u || !program) return { title: 'Not Found', robots: { index: false, follow: false } }

  const pd      = u.programDetails[program]
  const specVal = pd?.specs?.find(s => getSpecSlug(s) === specSlug)
  if (!specVal) return { title: 'Not Found', robots: { index: false, follow: false } }

  const spec     = getSpecName(specVal)
  const shortSpec = shortenSpec(spec)
  const year     = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const fees = compactFee(pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`)
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  // CTR-tuned title (2026-05-25): short uni + short spec, fee, NAAC, year. No em dash.
  // Uses shortenSpec so long names like "Healthcare Management" stay clampable.
  const title     = clampTitle(`${titleName} ${program} ${shortSpec} ${year}: ${fees}, NAAC ${u.naac} | EdifyEdu`)
  const description = clampDescription(`${titleName} Online ${program} in ${spec} ${year}: ${fees} fees, NAAC ${u.naac}${nirfStr}. UGC-DEB approved. See syllabus, career data & honest review free.`)

  return {
    title,
    description,
    keywords: [
      `${u.name} online ${program} ${spec}`,
      `${u.name} ${program} ${spec} fees`,
      `${u.name} ${program} ${spec} syllabus`,
      `online ${program} ${spec} india ${year}`,
    ].join(', '),
    alternates: { canonical: `https://edifyedu.in/universities/${u.id}/${programSlug}/${specSlug}` },
    openGraph: {
      title, description, type: 'website',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630 }],
    },
    robots: getSpecPageContent(id, program.toLowerCase(), specSlug)
      ? { index: true, follow: true }
      : { index: false, follow: true },
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
  let specVal = pd.specs?.find(s => getSpecSlug(s) === specSlug)
  // Fallback: try manifest lookup which has alias support
  if (!specVal) {
    const { getSpecDisplayName } = require('@/lib/data/programs')
    const aliasName = getSpecDisplayName(id, programSlug, specSlug)
    if (aliasName) {
      specVal = pd.specs?.find(s => {
        const name = typeof s === 'string' ? s : s.name
        return name === aliasName
      })
    }
  }
  // If still no spec match, redirect to the program page rather than 404 —
  // the user clicked something we no longer have an exact spec for, so the
  // closest valid landing is the program listing for this university.
  if (!specVal) notFound()

  return (
    <UniSpecBody
      u={u}
      program={program}
      programSlug={programSlug}
      spec={getSpecName(specVal)}
      specSlug={specSlug}
      pd={pd}
    />
  )
}

export const revalidate = false
export const dynamicParams = true
