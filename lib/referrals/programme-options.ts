// Programme options for /refer and the referrals dashboard, read from the
// programmes the universities in lib/data.ts actually offer (Q56: fetch from
// the existing database). 'MBA (WX)' is an MBA variant, so it folds into MBA.
import { UNIVERSITIES } from '@/lib/data'
import { PROGRAMME_EXTRAS } from './refer-rules'

const ORDER = ['MBA', 'MCA', 'BBA', 'BCA', 'B.Com', 'M.Com', 'BA', 'MA', 'BSc', 'MSc']
let cached: string[] | null = null
export function programmeOptions(): string[] {
  if (cached) return cached
  const offered = new Set<string>()
  for (const u of UNIVERSITIES) for (const p of u.programs ?? []) offered.add(p === 'MBA (WX)' ? 'MBA' : p)
  const known = ORDER.filter(p => offered.has(p))
  const rest = Array.from(offered).filter(p => !ORDER.includes(p)).sort()
  cached = [...known, ...rest, ...PROGRAMME_EXTRAS]
  return cached
}
