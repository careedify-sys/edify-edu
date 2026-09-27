import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUniversityById } from '@/lib/data'
import ReviewForm from './ReviewForm'

interface Props {
  params: { 'university-slug': string }
}

export const dynamic = 'force-static'

// Metadata added 2026-09-27. This route exported none, so all 143 pre-rendered
// /review/* pages inherited the root layout metadata verbatim: the homepage
// title "Online Universities India 2026: 125+ UGC-DEB Ranked | EdifyEdu" and
// the homepage description, 143 times over.
//
// That had a visible cost. On the brand query "edifyedu" the top organic result
// was /review/ignou-online carrying the homepage's own title, so a thin form
// page was answering the brand search instead of the homepage.
//
// These pages are "Share your review of X" forms. They carry no content anyone
// searches for, and 0 of them appear in valid-urls.json, so the sitemap already
// treats them as non-indexable. robots was the only place that never said so.
// noindex + follow: keep the crawl path to the university pages they link,
// drop them from the index so they stop competing with the homepage.
export function generateMetadata({ params }: Props): Metadata {
  const u = getUniversityById(params['university-slug'])
  if (!u) {
    return { title: 'Not Found', robots: { index: false, follow: false } }
  }
  return {
    // Root layout appends " | EdifyEdu" via its title template.
    title: `Share your review of ${u.name}`,
    description: `Submit a verified student review of ${u.name}. Published only after we confirm you studied the programme. No paid reviews.`,
    alternates: { canonical: `https://edifyedu.in/review/${u.id}` },
    robots: { index: false, follow: true },
  }
}

export default function ReviewPage({ params }: Props) {
  const slug = params['university-slug']
  const u = getUniversityById(slug)
  if (!u) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#0B1533' }}>
        Share your review of {u.name}
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        We publish reviews only after a manual verification step (email or phone).
        Your review will not appear on the site until we confirm you actually studied
        this programme. No spam, no editing, and we will never sell your details.
      </p>

      <ReviewForm universitySlug={u.id} defaultProgramme="" />
    </main>
  )
}
