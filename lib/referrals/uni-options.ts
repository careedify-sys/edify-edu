// The university list for /refer: every record in lib/data.ts, A to Z.
// Built on the server so the page ships only ids and names to the browser.
import { UNIVERSITIES } from '@/lib/data'
import type { UniOption } from './refer-rules'

let cached: UniOption[] | null = null
export function universityOptions(): UniOption[] {
  if (cached) return cached
  const seen = new Set<string>()
  cached = UNIVERSITIES
    .filter(u => u.id && u.name && !seen.has(u.id) && seen.add(u.id))
    .map(u => ({ id: u.id, name: u.name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
  return cached
}
