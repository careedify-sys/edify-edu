// app/universities/[id]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import { nirfForProgramme } from '@/lib/data-slim'
import UniversityPageClient from '@/components/UniversityPageClient'
import { getResolvableProgrammes, getVerifyPage, resolveSpecHref } from '@/lib/seo/safe-internal-links'
import { getTitleName, clampTitle, clampDescription } from '@/lib/seo-title'
import { resolveFirstHand } from '@/lib/first-hand'
import { getExactFee, formatExactFee, formatExactFeeShort } from '@/lib/fees'
import { getProgramSchemaOffer } from '@/lib/seo/program-schema'
import { pageKeywords } from '@/lib/page-keywords'
import { shouldIndexUniversity, onlinePrefix } from '@/lib/seo/mode-unverified'
import { formatUniversityDisplayName } from '@/lib/format'
import { feePlanTableHtml, nmimsNoDistanceHtml, symbiosisDistanceAnswerHtml } from '@/lib/fee-plans'
import { debApprovedSentence, debBasis } from '@/lib/seo/deb-basis'

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
  // Exact rupees via getExactFee (list price where a discount applies).
  const mbaFee = liveProgs.includes('MBA') ? formatExactFeeShort(getExactFee(u, 'MBA')) : null
  const hasFee = !!mbaFee
  const feeStr = hasFee ? `MBA ${mbaFee}` : ''
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
  let description = `${cleanName} online courses: ${progStr}.${hasFee ? ` ${feeStr} fees.` : ''}${nirfHook} ${naacSeg}. ${debApprovedSentence(u.id)}${specStr}${cityStr} Check ${year} eligibility, syllabus & placement data free.`
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

// sameAs says "this is the same entity". It is emitted only when officialUrl is
// the university's own site and no other record uses the same host. MUJ, SMU
// and MAHE all point at onlinemanipal.com, so sameAs there would merge three
// universities into one entity (QA F2, 2026-11-16).
function urlHost(url: string): string | null {
  try { return new URL(url).host.toLowerCase().replace(/^www\./, '') } catch { return null }
}
// Third-party admission or ERP platforms, not a university's own site.
// samarth.edu.in is the Ministry of Education's shared Samarth ERP; IGNOU's
// officialUrl (ignouiop.samarth.edu.in) is its admission portal on it.
const NON_UNIVERSITY_HOST_SUFFIXES = ['samarth.edu.in']
const SHARED_OFFICIAL_HOSTS: Set<string> = (() => {
  const counts = new Map<string, number>()
  for (const uni of UNIVERSITIES) {
    const h = uni.officialUrl ? urlHost(uni.officialUrl) : null
    if (h) counts.set(h, (counts.get(h) || 0) + 1)
  }
  return new Set(Array.from(counts).filter(([, n]) => n > 1).map(([h]) => h))
})()
function schemaSameAs(officialUrl?: string): string[] | null {
  if (!officialUrl) return null
  const h = urlHost(officialUrl)
  if (!h || SHARED_OFFICIAL_HOSTS.has(h)) return null
  if (NON_UNIVERSITY_HOST_SUFFIXES.some(s => h === s || h.endsWith('.' + s))) return null
  return [officialUrl]
}

// ── JSON-LD Structured Data ──
function UniversitySchema({ u }: { u: NonNullable<ReturnType<typeof getUniversityById>> }) {
  const kw = pageKeywords[u.id]?.join(', ') || ''
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollegeOrUniversity', 'EducationalOrganization'],
        '@id': `https://edifyedu.in/universities/${u.id}#university`,
        name: u.name,
        url: `https://edifyedu.in/universities/${u.id}`,
        // No telephone here: the only number we have is Edify's own, and on
        // this node it would merge into the university entity (audit S2,
        // 2026-11-16). sameAs points at the official portal where we hold one
        // that belongs to this university alone (see schemaSameAs).
        ...(schemaSameAs(u.officialUrl) ? { sameAs: schemaSameAs(u.officialUrl) } : {}),
        description: `${u.name} ${debBasis(u.id) ? `offers work-integrated online programmes. ${debBasis(u.id)!.metaSentence}` : 'is a UGC DEB approved university offering online degrees.'}${u.naac ? ` NAAC ${u.naac} accredited.` : ''}${u.nirf < 200 ? ` NIRF #${u.nirf} University.` : ''}`,
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
        answerHtml={university.id === 'nmims-online' ? nmimsNoDistanceHtml() : university.id === 'symbiosis-university-online' ? symbiosisDistanceAnswerHtml() : undefined}
        feePlanHtml={{ MBA: feePlanTableHtml(university, 'MBA') }}
        linkableProgrammes={getResolvableProgrammes(university)}
        verifyHref={getVerifyPage(university.id)}
        programSchema={Object.fromEntries(university.programs.map(p => {
          return [p, { offer: getProgramSchemaOffer(university, p), feeCompact: formatExactFee(getExactFee(university, p)), feeShort: formatExactFeeShort(getExactFee(university, p)) }]
        }))}
        firstHand={resolveFirstHand(university)}
        specHrefs={Object.fromEntries(university.programs.flatMap(p => {
          // Same slug derivation as the chips in UniversityPageClient.
          const progSlug = p.toLowerCase().replace(/\./g, '')
          return (university.programDetails[p]?.specs ?? []).map(spec => {
            const slug = typeof spec === 'string' ? spec.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : spec.slug
            return [`${progSlug}/${slug}`, resolveSpecHref(university.id, progSlug, slug)]
          })
        }))}
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
