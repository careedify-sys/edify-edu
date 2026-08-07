import { notFound } from 'next/navigation'
import { getUniversityById } from '@/lib/data'
import ReviewForm from './ReviewForm'

interface Props {
  params: { 'university-slug': string }
}

export const dynamic = 'force-static'

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
