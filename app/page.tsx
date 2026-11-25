import HomePageClient from '@/components/HomePageClient'
import { UNIS_SLIM, getSortRank } from '@/lib/data-slim'
import { buildCardFees } from '@/lib/card-fees'

// Server wrapper so the homepage university cards get the gated fee string
// the profile prints (lib/card-fees.ts) instead of the raw feeMin/feeMax range.
// Same top-6 selection as HomePageClient, so only those fees ship to the client.
export default function HomePage() {
  const topIds = [...UNIS_SLIM].sort((a, b) => getSortRank(a) - getSortRank(b)).slice(0, 6).map(u => u.id)
  return <HomePageClient cardFees={buildCardFees(topIds)} />
}
