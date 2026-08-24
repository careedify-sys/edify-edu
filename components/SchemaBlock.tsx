import type { University, ProgramDetail, Program } from '@/lib/data'
import type { Coupon } from '@/lib/coupons'
import { formatUniversityDisplayName } from '@/lib/format'
import { getDisplayFee } from '@/lib/fees'

interface Props {
  u: University
  pd: ProgramDetail
  program: string
  programSlug: string
  spec?: string
  specSlug?: string
  coupon?: Coupon | null
  faqs?: { q: string; a: string }[]
  keywords?: string
}

export default function SchemaBlock({ u, pd, program, programSlug, spec, specSlug, coupon, faqs, keywords }: Props) {
  const year     = new Date().getFullYear()
  const baseUrl  = 'https://edifyedu.in'
  const pageUrl  = spec
    ? `${baseUrl}/universities/${u.id}/${programSlug}/${specSlug}`
    : `${baseUrl}/universities/${u.id}/${programSlug}`

  const durationYears = parseInt(pd.duration?.replace(/[^0-9]/g, '') || '2', 10) || 2

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${baseUrl}/universities` },
      { '@type': 'ListItem', position: 3, name: u.name,         item: `${baseUrl}/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: `Online ${program}`, item: `${baseUrl}/universities/${u.id}/${programSlug}` },
      ...(spec && specSlug ? [{ '@type': 'ListItem', position: 5, name: spec, item: pageUrl }] : []),
    ],
  }

  // Strip trailing " Online" from u.name before composing schema strings.
  // Universities named "... University Online" otherwise produce double-word
  // artefacts like "Galgotias University Online Online MBA".
  const brand = formatUniversityDisplayName(u.name)

  // Canonical fee source. When getDisplayFee suppresses (no verified fee), the
  // schema must not assert a fee fragment or an Offer price. See lib/fees.ts.
  const fee = getDisplayFee(u, program as Program)

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: spec ? `${brand} Online ${program}: ${spec} Specialisation` : `${brand} Online ${program}`,
    description: spec
      ? `Online ${program} with ${spec} specialisation from ${brand}. NAAC ${u.naac} accredited, UGC DEB approved. Admissions open for ${year}.`
      : `UGC DEB approved Online ${program} from ${brand}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations${fee.ok ? `, fees ${fee.compact}` : ''}.`,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalLevel: ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(program) ? 'Postgraduate' : 'Undergraduate',
    courseMode: 'Online',
    timeRequired: `P${durationYears}Y`,
    url: pageUrl,
    offers: (fee.ok && fee.min) ? (fee.max && fee.max !== fee.min ? {
      '@type': 'AggregateOffer',
      lowPrice: String(fee.min),
      highPrice: String(fee.max),
      priceCurrency: 'INR',
      offerCount: '2',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
      category: 'Online Education',
    } : {
      '@type': 'Offer',
      price: String(fee.min),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: pageUrl,
      category: 'Online Education',
      ...(coupon ? {
        priceValidUntil: `${year}-12-31`,
        description: `EdifyEdu Coupon: ${coupon.code} - ${coupon.savings}`,
      } : {}),
    }) : undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      startDate: `${year}-07-01`,
      courseWorkload: `P${durationYears}Y`,
    },
    ...(keywords ? { keywords } : {}),
    // aggregateRating + review[] removed 2026-08-07: markup was fed by
    // hand-authored review copy, not first-party collected reviews. Will be
    // re-added once real verified rows exist in the reviews table.
  }

  // FAQPage schema removed — rendered once by FAQBlock.tsx to avoid duplicate
  // rich result errors in Google Search Console

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
    </>
  )
}
