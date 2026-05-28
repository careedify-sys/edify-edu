// app/universities/[id]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import UniversityPageClient from '@/components/UniversityPageClient'
import { getTitleName, clampTitle, clampDescription } from '@/lib/seo-title'

// ── Static Params (SSG) — pre-render all university pages at build time ──
export async function generateStaticParams() {
  return UNIVERSITIES.map(u => ({ id: u.id }))
}

// ── Per-page Metadata — Professional SEO titles ──
export async function generateMetadata(
  { params }: { params: any }
): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id } = resolvedParams
  const u = getUniversityById(id)

  if (!u) {
    return { title: 'University Not Found' }
  }

  const year = new Date().getFullYear()
  const cleanName = u.name.replace(/\s+online\s*$/i, '')
  const titleName = getTitleName(u.id, u.name, u.abbr)
  const progStr = u.programs.slice(0, 3).join(', ')
  const feeMin = Math.round(u.feeMin / 1000)
  const feeMax = Math.round(u.feeMax / 1000)
  const feeStr = feeMin === feeMax ? `₹${feeMin}K` : `₹${feeMin}K-${feeMax}K`
  const mainProg = u.programs[0] || 'MBA'
  const specCount = Object.values(u.programDetails || {}).reduce((sum, pd) => sum + (pd?.specs?.length || 0), 0)
  const nirfStr = u.nirf && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''
  const nirfHook = u.nirf && u.nirf < 100 ? ` NIRF #${u.nirf},` : ''
  // CTR-tuned title (2026-05-25): lead with brand, fee number first, NAAC + bracket year hook.
  // Pattern: "{Uni} Online: ₹{fee} Fees, NAAC {grade} [{year} Review] | EdifyEdu"
  const title = `${titleName} Online ${year}: Fees ${feeStr}, NAAC ${u.naac} [Review] | EdifyEdu`
  const specStr = specCount > 3 ? ` ${specCount}+ specialisations.` : ''
  const cityStr = u.city && u.city !== 'Online' ? ` Based in ${u.city}.` : ''
  // CTR-tuned description: numeric facts first, no "Compare/Explore" lead, micro-CTA at end.
  let description = `${cleanName} online ${progStr}: fees ${feeStr},${nirfHook} NAAC ${u.naac}. UGC-DEB approved.${specStr}${cityStr} Check ${year} eligibility, syllabus & placement data free.`
  if (description.length < 150) {
    description = `${cleanName} online ${progStr} ${year}: fees ${feeStr}, NAAC ${u.naac} accredited${nirfStr}.${specStr}${cityStr} See verified fees, syllabus & honest placement data. Check eligibility free.`
  }

  const keywords = [
    `${u.name} online ${mainProg} fees`,
    `${u.name} online ${mainProg} syllabus`,
    `${u.name} online ${mainProg} placements`,
    `${u.name} online ${mainProg} reviews`,
    `${u.name} online ${mainProg} admission ${year}`,
    `${u.name} online degree`,
    `${u.abbr} online ${mainProg}`,
  ].join(', ')

  const t = clampTitle(title)
  const d = clampDescription(description)

  return {
    title: t,
    description: d,
    keywords,
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}`,
    },
    openGraph: {
      title: t,
      description: d,
      url: `https://edifyedu.in/universities/${u.id}`,
      type: 'website',
      siteName: 'edifyedu.in',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `${u.name} Online Programs` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t,
      description: d,
      images: ['https://edifyedu.in/og.webp'],
    },
    robots: { index: true, follow: true },
  }
}

// NAAC letter grade → numeric score on NAAC 4-point scale (midpoint of each band)
const NAAC_SCORE_MAP: Record<string, string> = {
  'A++': '3.88', 'A+': '3.63', 'A': '3.38',
  'B++': '3.13', 'B+': '2.88', 'B': '2.63', 'C': '2.26',
}
function naacRatingValue(naac: string, naacScore?: string): string {
  if (naacScore && parseFloat(naacScore) > 0) return naacScore
  return NAAC_SCORE_MAP[naac] || '3.0'
}

// ── JSON-LD Structured Data ──
function UniversitySchema({ u }: { u: NonNullable<ReturnType<typeof getUniversityById>> }) {
  const ratingValue = naacRatingValue(u.naac, u.naacScore)
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollegeOrUniversity', 'EducationalOrganization'],
        '@id': `https://edifyedu.in/universities/${u.id}#university`,
        name: u.name,
        url: `https://edifyedu.in/universities/${u.id}`,
        telephone: '+91-7061285806',
        description: `${u.name} is a UGC DEB approved university offering online degrees. NAAC ${u.naac} accredited.${u.nirf < 200 ? ` NIRF ranked #${u.nirf}.` : ''}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: u.city !== 'Online' ? u.city : u.name.split(' ')[0],
          addressRegion: u.state !== 'Online' ? u.state : 'India',
          addressCountry: 'IN',
        },
        review: {
          '@type': 'Review',
          author: {
            '@type': 'Organization',
            name: 'National Assessment and Accreditation Council (NAAC)',
            url: 'https://naac.gov.in',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue,
            bestRating: '4',
            worstRating: '1',
          },
          reviewBody: `${u.name} has been accredited by NAAC with Grade ${u.naac}.${u.naacScore ? ` Institutional score: ${u.naacScore}/4.` : ''}`,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${u.name} Online Programs`,
          itemListElement: u.programs.map((prog, i) => ({
            '@type': 'Offer',
            position: i + 1,
            itemOffered: {
              '@type': 'Course',
              name: `Online ${prog}`,
              description: `${u.name} Online ${prog} program`,
              provider: { '@type': 'CollegeOrUniversity', name: u.name },
            },
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
          { '@type': 'ListItem', position: 2, name: 'Universities', item: 'https://edifyedu.in/universities' },
          { '@type': 'ListItem', position: 3, name: u.name, item: `https://edifyedu.in/universities/${u.id}` },
        ],
      },
      // FAQPage schema removed here — emitted once by UniversityPageClient.tsx
      // to avoid duplicate FAQPage causing Google rich results errors
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// ── Page Component (Server Component) ──
export default async function UniversityPage(
  { params }: { params: any }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id } = resolvedParams
  const university = getUniversityById(id)

  if (!university) {
    notFound()
  }

  return (
    <>
      <UniversitySchema u={university} />
      <UniversityPageClient university={university} />
    </>
  )
}

// ── ISR Configuration — revalidate every 6 hours ──
export const revalidate = false

// ── Allow dynamic params for new universities added via CMS ──
export const dynamicParams = true
