// app/universities/[id]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import UniversityPageClient from '@/components/UniversityPageClient'
import { getTitleName } from '@/lib/seo-title'

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
  const title = `${titleName} Online (${progStr}, Fees ${year}) | EdifyEdu`
  const feeMin = Math.round(u.feeMin / 1000)
  const feeMax = Math.round(u.feeMax / 1000)
  const feeStr = feeMin === feeMax ? `₹${feeMin}K` : `₹${feeMin}K–₹${feeMax}K`
  const mainProg = u.programs[0] || 'MBA'
  const description = `${titleName} online ${progStr}: fees ${feeStr}, NAAC ${u.naac}${u.nirf && u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved. Admissions open ${year}.`

  const keywords = [
    `${u.name} online ${mainProg} fees`,
    `${u.name} online ${mainProg} syllabus`,
    `${u.name} online ${mainProg} placements`,
    `${u.name} online ${mainProg} reviews`,
    `${u.name} online ${mainProg} admission ${year}`,
    `${u.name} online degree`,
    `${u.abbr} online ${mainProg}`,
  ].join(', ')

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://edifyedu.in/universities/${u.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://edifyedu.in/universities/${u.id}`,
      type: 'website',
      siteName: 'Edify',
      images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: `${u.name} Online Programs` }],
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

// ── JSON-LD Structured Data ──
function UniversitySchema({ u }: { u: NonNullable<ReturnType<typeof getUniversityById>> }) {
  const year = new Date().getFullYear()
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['CollegeOrUniversity', 'LocalBusiness'],
        '@id': `https://edifyedu.in/universities/${u.id}#university`,
        name: u.name,
        url: `https://edifyedu.in/universities/${u.id}`,
        description: `${u.name} is a UGC DEB approved university offering online degrees. NAAC ${u.naac} accredited.${u.nirf < 200 ? ` NIRF ranked #${u.nirf}.` : ''}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: u.city !== 'Online' ? u.city : u.name.split(' ')[0],
          addressRegion: u.state !== 'Online' ? u.state : 'India',
          addressCountry: 'IN',
        },
        sameAs: [],
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
            price: u.programDetails[prog]?.fees || `₹${Math.round(u.feeMin/1000)}K+`,
            priceCurrency: 'INR',
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
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is ${u.name} online degree valid?`,
            acceptedAnswer: { '@type': 'Answer', text: `Yes. ${u.name} is UGC DEB approved for online education. The degree is equivalent to a regular campus degree and is valid for government jobs, private sector employment, and further studies.` },
          },
          {
            '@type': 'Question',
            name: `What is the fee for ${u.name} online ${u.programs[0]}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${u.name} online ${u.programs[0]} fees range from ₹${Math.round(u.feeMin/1000)}K to ₹${Math.round(u.feeMax/1000)}K. EMI options are available from ₹${u.emiFrom.toLocaleString()}/month.` },
          },
          {
            '@type': 'Question',
            name: `Is ${u.name} NAAC accredited?`,
            acceptedAnswer: { '@type': 'Answer', text: `Yes. ${u.name} is NAAC ${u.naac} accredited, which is one of the highest accreditation grades given by the National Assessment and Accreditation Council.` },
          },
          {
            '@type': 'Question',
            name: `What programs does ${u.name} offer online for ${year}?`,
            acceptedAnswer: { '@type': 'Answer', text: `${u.name} offers the following online programs: ${u.programs.join(', ')}. All programs are UGC DEB approved and admissions are open for ${year}.` },
          },
        ],
      },
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
export const revalidate = 21600

// ── Allow dynamic params for new universities added via CMS ──
export const dynamicParams = true
