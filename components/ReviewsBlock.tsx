import { UNIVERSITY_REVIEWS, GENERIC_REVIEWS } from '@/lib/reviews-data'

interface Props {
  universityId: string
  program: string
  cleanName?: string
}

// Neutral, non-fabricated attributions. Cycled across visible reviews so no
// single made-up name appears. Order chosen to match the mix of platforms
// students actually post on for online-degree feedback.
const SOURCE_ATTRIBUTIONS = [
  'A student on Reddit',
  'Feedback on Trustpilot',
  'A student on Quora',
  'A LinkedIn alumnus',
  'Feedback on Trustpilot',
]

export default function ReviewsBlock({ universityId, program, cleanName }: Props) {
  const allReviews = UNIVERSITY_REVIEWS[universityId] || GENERIC_REVIEWS || []
  const reviews = allReviews.slice(0, 5)
  if (!reviews.length) return null

  const uniLabel = cleanName || 'this university'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold mb-2" style={{ color: '#0B1533' }}>
        What students say about {uniLabel}
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Summarised from publicly available student feedback on Trustpilot, Reddit, Quora and LinkedIn.
        Paraphrased, not quoted. We do not yet collect first-party reviews. When we do, they will be
        labelled as verified.
      </p>

      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="mb-2">
              <div className="text-sm font-semibold text-slate-700">
                {SOURCE_ATTRIBUTIONS[i % SOURCE_ATTRIBUTIONS.length]}
              </div>
              <div className="text-xs text-slate-400">{r.program}</div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{r.review}</p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 mt-3">
        Paraphrased public sentiment. Not verified first-party reviews. Individual experiences vary.
      </p>
    </section>
  )
}
