// app/universities/[id]/[program]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { Program } from '@/lib/data'
import UniProgramBody from '@/components/UniProgramBody'
import { getTitleName } from '@/lib/seo-title'

// Program slug to Program type mapping
const PM: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'BA',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA', 'msc': 'MSc', 'bsc': 'BSc', 'mba-wx': 'MBA (WX)',
}

// ── Static Params (SSG) — pre-render top university+program combinations only ──
// Others are served via ISR (dynamicParams = true) on first request, then cached.
export async function generateStaticParams() {
  const TOP_UNI_IDS = [
    'amity-university-online', 'chandigarh-university-online', 'jain-university-online', 'lovely-professional-university-online', 'manipal-university-jaipur-online',
    'nmims-online', 'symbiosis-university-online', 'manipal-academy-higher-education-online', 'sikkim-manipal-university-online', 'sharda-university-online',
    'amrita-vishwa-vidyapeetham-online', 'chitkara-university-online', 'alliance-university-online',
  ]
  const TOP_PROGRAMS = ['mba', 'mca']
  const params: { id: string; program: string }[] = []

  for (const id of TOP_UNI_IDS) {
    for (const program of TOP_PROGRAMS) {
      params.push({ id, program })
    }
  }

  return params
}

// ── Per-page Metadata — targets "[University Name] online mba fees syllabus placements reviews" ──
export async function generateMetadata(
  { params }: { params: any }
): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id, program: programSlug } = resolvedParams
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!u || !program || !u.programs.includes(program)) {
    return { title: 'Program Not Found' }
  }

  const year = new Date().getFullYear()
  const pd = u.programDetails[program]
  const cleanName = u.name.replace(/\s+online\s*$/i, '')
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const title = `${titleName} Online ${program} — Fees & Syllabus ${year} | EdifyEdu`
  const fees = pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`
  const duration = pd?.duration || '2 Yrs'
  const specCount = pd?.specs?.length || 0
  const nirfStr = u.nirf > 0 && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  const specStr = specCount > 0 ? ` ${specCount}+ specialisations available.` : ''
  let description = `${cleanName} online ${program}: fees ${fees}, ${duration}${nirfStr}. NAAC ${u.naac}. UGC DEB approved.${specStr} Compare syllabus, placements and career outcomes. Admissions ${year}.`
  if (description.length < 150) {
    description = `${cleanName} offers UGC DEB approved online ${program} program. Fees ${fees}, duration ${duration}. NAAC ${u.naac} accredited${nirfStr}.${specStr} Independent comparison at EdifyEdu. Admissions open ${year}.`
  }

  const keywords = [
    `${u.name} online ${program} fees`,
    `${u.name} online ${program} syllabus`,
    `${u.name} online ${program} placements`,
    `${u.name} online ${program} reviews`,
    `${u.name} online ${program} admission ${year}`,
    `${u.abbr} online ${program}`,
    `${u.name} ${program} fees syllabus placements reviews`,
  ].join(', ')

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}/${programSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://edifyedu.in/universities/${u.id}/${programSlug}`,
      type: 'website',
      siteName: 'edifyedu.in',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `${u.name} Online ${program}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://edifyedu.in/og.webp'],
    },
    robots: { index: true, follow: true },
  }
}

// ── Page Component (Server Component) ──
export default async function UniversityProgramPage(
  { params }: { params: any }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id, program: programSlug } = resolvedParams
  const university = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!university) notFound()
  if (!program || !university.programs.includes(program) || !university.programDetails[program]) {
    notFound()
  }

  const pd = university.programDetails[program]!

  return (
    <UniProgramBody
      u={university}
      program={program}
      programSlug={programSlug}
      pd={pd}
    />
  )
}

// ── ISR Configuration — revalidate every 6 hours ──
export const revalidate = false

// ── Allow dynamic params for new programs added via CMS ──
export const dynamicParams = true
