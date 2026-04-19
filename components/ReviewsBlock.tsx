import { UNIVERSITY_REVIEWS, GENERIC_REVIEWS } from '@/lib/reviews-data'
import { Star } from 'lucide-react'

interface Props {
  universityId: string
  program: string
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  )
}

export default function ReviewsBlock({ universityId, program }: Props) {
  const allReviews = UNIVERSITY_REVIEWS[universityId] || GENERIC_REVIEWS || []
  const reviews = allReviews.slice(0, 5)
  if (!reviews.length) return null

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const rounded   = Math.round(avgRating * 10) / 10

  const aggregateSchema = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    ratingValue: rounded.toFixed(1),
    reviewCount: reviews.length,
    bestRating: '5',
    worstRating: '1',
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateSchema) }}
      />

      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>Student Reviews</h2>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-amber-700">{rounded} / 5</span>
          <span className="text-xs text-amber-600">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="text-sm font-bold text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-400">{r.city} · {r.program} · {r.date}</div>
              </div>
              <StarRow rating={r.rating} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">&ldquo;{r.review}&rdquo;</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-3">
        Reviews collected by Edify from verified students. Edify does not manufacture or edit reviews. Experiences may vary.
      </p>
    </section>
  )
}
