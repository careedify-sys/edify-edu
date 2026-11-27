// B3 batch 18: server wrapper so the comparison table gets getExactFee data (lib/fee-short-map.ts) instead of
// the slim MBA-led feeMin. No metadata here: the route had none as a client page, so its title is unchanged.
import UniversityComparisonClient from './UniversityComparisonClient'
import { getFeeShortMap, getFeeBoundsMap } from '@/lib/fee-short-map'

export default function UniversityComparisonPage() {
  return <UniversityComparisonClient feeShort={getFeeShortMap()} feeBounds={getFeeBoundsMap()} />
}
