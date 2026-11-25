import UniversitiesListClient from '@/components/UniversitiesListClient'
import { buildCardFees } from '@/lib/card-fees'

// Server wrapper so the listing cards get the gated fee string the profile
// prints (lib/card-fees.ts) instead of the raw UNIS_SLIM feeMin/feeMax range.
export default function UniversitiesPage() {
  return <UniversitiesListClient cardFees={buildCardFees()} />
}
