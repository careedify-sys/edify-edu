// app/universities/[id]/[program]/[spec]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { Program } from '@/lib/data'
import { getSpecContent, getSpecFallback } from '@/lib/content'
import UniversitySpecClient from '@/components/UniversitySpecClient'

const PM: Record<string, Program> = {
  'mba': 'MBA', 'mca': 'MCA', 'bba': 'BBA', 'bca': 'BCA', 'ba': 'BA',
  'bcom': 'B.Com', 'mcom': 'M.Com', 'ma': 'MA', 'msc': 'MSc', 'bsc': 'BSc',
  'online-mba': 'MBA', 'online-mca': 'MCA', 'online-bba': 'BBA', 'online-bca': 'BCA',
  'online-ba': 'BA', 'online-bcom': 'B.Com', 'online-mcom': 'M.Com',
  'online-ma': 'MA', 'online-msc': 'MSc',
}

const toSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Pages render on demand (dynamicParams = true below); no static pre-generation
// to avoid build-time OOM. ISR caches each page after first render.

export async function generateMetadata(
  { params }: { params: Promise<{ id: string; program: string; spec: string }> }
): Promise<Metadata> {
  const { id, program: programSlug, spec: specSlug } = await params
  const u = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]
  if (!u || !program) return { title: 'Not Found' }

  const pd = u.programDetails[program]
  const spec = pd?.specs?.find(s => toSlug(s) === specSlug)
  if (!spec) return { title: 'Not Found' }

  const year = new Date().getFullYear()
  const title = `${u.name} Online ${program} ${spec} ${year} — Fees, Syllabus & Admission`
  const description = `${u.name} Online ${program} with ${spec} specialisation. ${pd?.duration || '2 Years'}, NAAC ${u.naac} accredited, UGC DEB approved. Check fees, syllabus and ${year} admission details.`

  return {
    title,
    description,
    keywords: [
      `${u.name} online ${program} ${spec}`,
      `${u.name} ${program} ${spec} fees`,
      `${u.name} ${program} ${spec} syllabus`,
      `online ${program} ${spec} ${year}`,
      `${u.abbr} ${program} ${spec}`,
    ].join(', '),
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}/${programSlug}/${specSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://edifyedu.in/universities/${u.id}/${programSlug}/${specSlug}`,
      type: 'website',
      siteName: 'Edify',
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

  const pd = u.programDetails[program]!
  const spec = pd.specs?.find(s => toSlug(s) === specSlug)
  if (!spec) notFound()

  const year = new Date().getFullYear()
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: 'https://edifyedu.in/universities' },
      { '@type': 'ListItem', position: 3, name: u.name, item: `https://edifyedu.in/universities/${u.id}` },
      { '@type': 'ListItem', position: 4, name: `Online ${program}`, item: `https://edifyedu.in/universities/${u.id}/${programSlug}` },
      { '@type': 'ListItem', position: 5, name: spec, item: `https://edifyedu.in/universities/${u.id}/${programSlug}/${specSlug}` },
    ],
  }

  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${u.name} Online ${program} — ${spec} Specialisation`,
    description: `${u.name} Online ${program} with ${spec} specialisation. NAAC ${u.naac} accredited, UGC DEB approved. Enrol for ${year} batch.`,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `https://edifyedu.in/universities/${u.id}`,
    },
    educationalLevel: program.startsWith('M') ? 'Postgraduate' : 'Undergraduate',
    offers: u.feeMin ? {
      '@type': 'Offer',
      price: u.feeMin,
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: u.feeMin,
        maxPrice: u.feeMax,
        priceCurrency: 'INR',
      },
    } : undefined,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      startDate: `${year}-07-01`,
      courseWorkload: `PT${pd?.duration?.replace(/[^0-9]/g, '') || '2'}Y`,
    },
  }

  const specContent = getSpecContent(spec) || getSpecFallback(spec, program)
  const allFaqs = [
    ...(specContent?.faqs || []),
    { q: `Is ${u.name} Online ${program} valid for jobs?`, a: `Yes — ${u.name} is UGC DEB approved and NAAC ${u.naac} accredited. The degree is identical to an on-campus degree and valid for private sector, banks, and government job portals across India.` },
    { q: `What is the fee for ${program} ${spec} at ${u.name}?`, a: `Total fee is ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}. EMI options start from ₹${u.emiFrom.toLocaleString()}/month. No-cost EMI available via lending partners.` },
    { q: `Can I work while doing ${program} from ${u.name}?`, a: `Yes — designed for working professionals. Live sessions on weekends, recorded lectures available 24/7. Exams are ${u.examMode || 'online proctored'} — no campus visits required.` },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <UniversitySpecClient
        university={u}
        program={program}
        programSlug={programSlug}
        spec={spec}
      />
    </>
  )
}

export const revalidate = 21600
export const dynamicParams = true
