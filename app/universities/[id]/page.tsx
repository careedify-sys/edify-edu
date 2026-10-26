// app/universities/[id]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { nirfForProgramme } from '@/lib/data-slim'
import UniversityPageClient from '@/components/UniversityPageClient'
import { getResolvableProgrammes, getVerifyPage } from '@/lib/seo/safe-internal-links'
import { getTitleName, clampTitle, clampDescription } from '@/lib/seo-title'
import { getDisplayFee } from '@/lib/fees'
import { pageKeywords } from '@/lib/page-keywords'
import { shouldIndexUniversity, onlinePrefix } from '@/lib/seo/mode-unverified'
import { formatUniversityDisplayName } from '@/lib/format'

// The phrase people type for a university's online arm, where it differs from
// the short title name. Amity's short name is "Amity", but the searches are
// "amity university online" (22,200/month) and "amity online"; the overview
// title said neither. Source: Semrush India gap export, 26 Oct 2026.
const SEARCH_BRAND: Record<string, string> = {
  'amity-university-online': 'Amity University',
  'lovely-professional-university-online': 'LPU',
  'jain-university-online': 'JAIN',
  'uttaranchal-university-online': 'Uttaranchal (UU)',
}

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
  // Only programmes whose hub page resolves. University of Mumbai listed MBA,
  // BBA and BCA here while all three hubs 404.
  const liveProgs = getResolvableProgrammes(u)
  const progStr = liveProgs.slice(0, 3).join(', ')
  // feeMin/feeMax are MBA-led, so printing them as "fees" for the whole
  // university misstated every non-MBA programme. Show the MBA fee, labelled,
  // from getDisplayFee so a suppressed figure stays suppressed here too.
  // With no MBA hub, getDisplayFee falls back to the record's placeholder range.
  const mbaFee = liveProgs.includes('MBA') ? getDisplayFee(u, 'MBA') : null
  const hasFee = !!(mbaFee && mbaFee.ok && mbaFee.compact)
  const feeStr = hasFee ? `MBA ${mbaFee!.compact}` : ''
  const feeSeg = hasFee ? `${feeStr}, ` : ''
  const brandName = SEARCH_BRAND[u.id] || titleName
  // "UGC-DEB Entitled" is the no-NAAC fallback, but for a mode-unverified
  // university that phrase reads as an online entitlement we cannot support.
  // See lib/seo/mode-unverified.ts.
  const naacSeg = u.naac
    ? `NAAC ${u.naac}`
    : shouldIndexUniversity(u.id) ? 'UGC-DEB Entitled' : 'Delivery Mode Unconfirmed'
  const mainProg = u.programs[0] || 'MBA'
  const specCount = Object.values(u.programDetails || {}).reduce((sum, pd) => sum + (pd?.specs?.length || 0), 0)
  const nirfLabel = nirfForProgramme(u)
  const nirfStr = nirfLabel ? `, ${nirfLabel}` : ''
  const nirfHook = nirfLabel ? ` ${nirfLabel},` : ''
  // CTR-tuned title (2026-05-25): lead with brand, fee number first, NAAC + bracket year hook.
  // Pattern: "{Uni} Online: ₹{fee} Fees, NAAC {grade} [{year} Review] | EdifyEdu"
  // Facts first: the fee and grade earn the click, the brand suffix does not.
  // clampTitle keeps the suffix and cuts the body, which left "Courses" alone.
  const head = `${brandName} ${onlinePrefix(u.id)}${year}: Courses`
  const title = [
    `${head}, ${feeSeg}${naacSeg} | edifyedu.in`,
    `${head}, ${feeSeg}${naacSeg}`,
    hasFee ? `${head}, ${feeStr}` : `${head}, ${naacSeg}`,
    `${head} | edifyedu.in`,
  ].find(c => c.length <= 60) ?? head
  const specStr = specCount > 3 ? ` ${specCount}+ specialisations.` : ''
  const cityStr = u.city && u.city !== 'Online' ? ` Based in ${u.city}.` : ''
  // CTR-tuned description: numeric facts first, no "Compare/Explore" lead, micro-CTA at end.
  let description = `${cleanName} online courses: ${progStr}.${hasFee ? ` ${feeStr} fees.` : ''}${nirfHook} ${naacSeg}. UGC-DEB approved.${specStr}${cityStr} Check ${year} eligibility, syllabus & placement data free.`
  if (description.length < 150) {
    // Same guards as the primary description. A record with few programmes and
    // no city produces a short primary string and falls through to here, which
    // is how "fees 0K, NAAC  accredited" reached the meta tags.
    description = `${cleanName} online courses ${year}: ${progStr}.${hasFee ? ` ${feeStr} fees.` : ''} ${u.naac ? `NAAC ${u.naac} accredited` : 'UGC-DEB entitled'}${nirfStr}.${specStr}${cityStr} See verified fees, syllabus & honest placement data. Check eligibility free.`
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
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `${formatUniversityDisplayName(u.name)} ${onlinePrefix(u.id)}Programs` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t,
      description: d,
      images: ['https://edifyedu.in/og.webp'],
    },
    robots: { index: shouldIndexUniversity(u.id), follow: true },
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
  const kw = pageKeywords[u.id]?.join(', ') || ''
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollegeOrUniversity', 'EducationalOrganization'],
        '@id': `https://edifyedu.in/universities/${u.id}#university`,
        name: u.name,
        url: `https://edifyedu.in/universities/${u.id}`,
        telephone: '+91-7061285806',
        description: `${u.name} is a UGC DEB approved university offering online degrees.${u.naac ? ` NAAC ${u.naac} accredited.` : ''}${u.nirf < 200 ? ` NIRF #${u.nirf} University.` : ''}`,
        ...(kw ? { keywords: kw } : {}),
        // Omit a field we do not have rather than inventing one. This used to
        // read `u.city !== 'Online' ? u.city : u.name.split(' ')[0]`, which
        // turned a junk city of "Online" into an addressLocality of "GLS" or
        // "SGT", publishing a fabricated locality in structured data; and
        // `addressRegion: 'India'`, which is a country, not a region. The junk
        // values were cleared from lib/data.ts on 2026-10-03, so the fields are
        // now empty where the location is genuinely unknown.
        address: {
          '@type': 'PostalAddress',
          ...(u.city ? { addressLocality: u.city } : {}),
          ...(u.state ? { addressRegion: u.state } : {}),
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
          name: `${formatUniversityDisplayName(u.name)} ${onlinePrefix(u.id)}Programs`,
          itemListElement: u.programs.map((prog, i) => ({
            '@type': 'Offer',
            category: 'Online Education',
            position: i + 1,
            itemOffered: {
              '@type': 'Service',
              name: `${onlinePrefix(u.id)}${prog}`,
              description: `${formatUniversityDisplayName(u.name)} ${onlinePrefix(u.id)}${prog} program`,
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
      <UniversityPageClient
        university={university}
        linkableProgrammes={getResolvableProgrammes(university)}
        verifyHref={getVerifyPage(university.id)}
      />
    </>
  )
}

export const revalidate = false

// dynamicParams=false so an unknown university id 404s at the routing layer
// with a real status. With dynamicParams=true and revalidate=false the route
// rendered unknown ids on demand and served the not-found UI inside a 200,
// i.e. a soft 404. The comment here used to say "for new universities added
// via CMS", but the CMS is not in use and generateStaticParams above already
// enumerates every entry in UNIVERSITIES, so the param set is closed.
export const dynamicParams = false
