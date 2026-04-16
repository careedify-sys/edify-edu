// app/universities/[id]/[program]/page.tsx
// ✅ Server Component — enables SSG, per-page metadata, and optimal Lighthouse scores
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { UNIVERSITIES, getUniversityById } from '@/lib/data'
import type { Program } from '@/lib/data'
import UniversityProgramClient from '@/components/UniversityProgramClient'
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
  const description = `${titleName} online ${program}: fees ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K+`}, ${pd?.duration || '2 Yrs'}${pd?.specs?.length ? `, ${pd.specs.length}+ specialisations` : ''}. NAAC ${u.naac}${u.nirf < 200 ? `, NIRF #${u.nirf}` : ''}. UGC DEB approved.`

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
      siteName: 'Edify',
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

// ── JSON-LD Schema for university program page ──
function ProgramSchema({ u, program, programSlug }: {
  u: NonNullable<ReturnType<typeof getUniversityById>>;
  program: Program;
  programSlug: string;
}) {
  const year = new Date().getFullYear()
  const pd = u.programDetails[program]
  const cleanName = u.name.replace(/\s+online\s*$/i, '').trim()
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: `${cleanName} Online ${program}`,
        description: `UGC DEB approved online ${program} from ${u.name}. NAAC ${u.naac} accredited.`,
        provider: {
          '@type': 'CollegeOrUniversity',
          name: u.name,
          sameAs: `https://edifyedu.in/universities/${u.id}`,
        },
        offers: {
          '@type': 'Offer',
          price: u.feeMin,
          priceCurrency: 'INR',
          description: pd?.fees || `From ₹${Math.round(u.feeMin/1000)}K`,
        },
        timeRequired: pd?.duration || 'P2Y',
        courseMode: 'online',
        educationalCredentialAwarded: program,
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          startDate: `${year}-07-01`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
          { '@type': 'ListItem', position: 2, name: 'Universities', item: 'https://edifyedu.in/universities' },
          { '@type': 'ListItem', position: 3, name: u.name, item: `https://edifyedu.in/universities/${u.id}` },
          { '@type': 'ListItem', position: 4, name: `Online ${program}`, item: `https://edifyedu.in/universities/${u.id}/${programSlug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is the fee for ${u.name} online ${program}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${u.name} online ${program} fees are ${pd?.fees || `₹${Math.round(u.feeMin/1000)}K to ₹${Math.round(u.feeMax/1000)}K`}. EMI options start from ₹${u.emiFrom.toLocaleString()}/month.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the syllabus for ${u.name} online ${program}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${u.name} online ${program} covers core ${program} subjects${pd?.specs?.length ? ` with ${pd.specs.length}+ specialisations including ${pd.specs.slice(0,3).join(', ')}` : ''}. Duration is ${pd?.duration || '2 years'}.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is ${u.name} online ${program} valid for government jobs?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. ${u.name} is UGC DEB approved for online education, making the ${program} degree valid for private sector jobs, government recruitment (where UGC DEB approved degrees are accepted)${u.psuEligible ? ', and PSU recruitment' : ''}, and further studies.`,
            },
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
export default async function UniversityProgramPage(
  { params }: { params: any }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id, program: programSlug } = resolvedParams
  const university = getUniversityById(id)
  const program = PM[programSlug?.toLowerCase()]

  if (!university) notFound()
  if (!program || !university.programs.includes(program) || !university.programDetails[program]) {
    redirect(`/universities/${id}`)
  }

  return (
    <>
      <ProgramSchema u={university} program={program} programSlug={programSlug} />
      <UniversityProgramClient
        university={university}
        program={program}
        programSlug={programSlug}
      />
    </>
  )
}

// ── ISR Configuration — revalidate every 6 hours ──
export const revalidate = 21600

// ── Allow dynamic params for new programs added via CMS ──
export const dynamicParams = true
