import type { University, ProgramDetail } from '@/lib/data'
import type { Coupon } from '@/lib/coupons'

interface SchemaReview {
  name: string
  city?: string
  year?: number
  rating: number
  body: string
}

interface Props {
  u: University
  pd: ProgramDetail
  program: string
  programSlug: string
  spec?: string
  specSlug?: string
  coupon?: Coupon | null
  faqs?: { q: string; a: string }[]
  reviews?: SchemaReview[]
}

export default function SchemaBlock({ u, pd, program, programSlug, spec, specSlug, coupon, faqs, reviews }: Props) {
  const year     = new Date().getFullYear()
  const baseUrl  = 'https://edifyedu.in'
  const pageUrl  = spec
    ? `${baseUrl}/universities/${u.id}/${programSlug}/${specSlug}`
    : `${baseUrl}/universities/${u.id}/${programSlug}`

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

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: spec ? `${u.name} Online ${program} — ${spec} Specialisation` : `${u.name} Online ${program}`,
    description: spec
      ? `Online ${program} with ${spec} specialisation from ${u.name}. NAAC ${u.naac} accredited, UGC DEB approved. Admissions open for ${year}.`
      : `UGC DEB approved Online ${program} from ${u.name}. NAAC ${u.naac} accredited. ${pd.specs?.length || 0}+ specialisations, fees ${pd.fees || `from ₹${Math.round(u.feeMin / 1000)}K`}.`,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `${baseUrl}/universities/${u.id}`,
    },
    educationalLevel: ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(program) ? 'Postgraduate' : 'Undergraduate',
    courseMode: 'Online',
    url: pageUrl,
    offers: u.feeMin ? (u.feeMax && u.feeMax !== u.feeMin ? {
      '@type': 'AggregateOffer',
      lowPrice: String(u.feeMin),
      highPrice: String(u.feeMax),
      priceCurrency: 'INR',
      offerCount: '2',
      availability: 'https://schema.org/InStock',
    } : {
      '@type': 'Offer',
      price: String(u.feeMin),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      ...(coupon ? {
        priceValidUntil: `${year}-12-31`,
        description: `EdifyEdu Coupon: ${coupon.code} - ${coupon.savings}`,
      } : {}),
    }) : undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      startDate: `${year}-07-01`,
      courseWorkload: `PT${pd.duration?.replace(/[^0-9]/g, '') || '2'}Y`,
    },
    // AggregateRating nested inside Course — required by Google for star snippet eligibility
    ...(avgRating && reviews?.length ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: reviews.length,
        bestRating: '5',
        worstRating: '1',
      },
      review: reviews.map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.name },
        datePublished: r.year ? `${r.year}-01-01` : `${year}-01-01`,
        reviewRating: { '@type': 'Rating', ratingValue: String(r.rating) },
        reviewBody: r.body,
      })),
    } : {}),
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
