// app/universities/[id]/[program]/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById, specSlug as getSpecSlug, specName as getSpecName } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'
import UniSpecBody from '@/components/UniSpecBody'

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
  if (!u || !program) return { title: 'Not Found' }

  const pd      = u.programDetails[program]
  const specVal = pd?.specs?.find(s => getSpecSlug(s) === specSlug)
  if (!specVal) return { title: 'Not Found' }

  const spec     = getSpecName(specVal)
  const year     = new Date().getFullYear()
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const title     = `${titleName} Online ${program} in ${spec} ${year} — Fees, Syllabus & Admission | EdifyEdu`
  const description = `${titleName} Online ${program} with ${spec} specialisation. ${pd?.duration || '2 Years'}, NAAC ${u.naac} accredited, UGC DEB approved. Fees ${pd?.fees || `₹${Math.round(u.feeMin / 1000)}K+`}. Check ${year} admission details.`

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
    robots: { index: true, follow: true },
  }
}

export default async function UniversitySpecPage(
  { params }: { params: Promise<{ id: string; program: string; spec: string }> }
) {
  const { id, program: programSlug, spec: specSlug } = await params
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!u || !program || !u.programDetails[program]) notFound()

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
