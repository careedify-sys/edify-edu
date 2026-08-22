// Verify resolveSpec fixes the reported slug-drift 404s.
// Run: npx tsx scripts/verify-resolve-spec.mts
import { resolveSpec } from '@/lib/data/programs'

const cases: Array<{ uni: string; label: string; slug: string; input: string; expectSlug: string }> = [
  // Original user-reported URL
  { uni: 'symbiosis-university-online', label: 'MBA', slug: 'mba', input: 'healthcare-management', expectSlug: 'hospital-and-health-care-management' },
  // Symbiosis MBA aliases
  { uni: 'symbiosis-university-online', label: 'MBA', slug: 'mba', input: 'hr', expectSlug: 'human-resource' },
  { uni: 'symbiosis-university-online', label: 'MBA', slug: 'mba', input: 'operations-management', expectSlug: 'operations' },
  // Noida International MBA — hospital-health-care-management variant
  { uni: 'noida-international-university-online', label: 'MBA', slug: 'mba', input: 'healthcare-management', expectSlug: 'hospital-health-care-management' },
  // Sikkim Manipal MBA — healthcare
  { uni: 'sikkim-manipal-university-online', label: 'MBA', slug: 'mba', input: 'healthcare-management', expectSlug: 'healthcare' },
  // DY Patil BBA — travel-tourism (no -management)
  { uni: 'dy-patil-university-online', label: 'BBA', slug: 'bba', input: 'travel-tourism-management', expectSlug: 'travel-tourism' },
  // Jaipur National BBA — aviation-management (has -management)
  { uni: 'jaipur-national-university-online', label: 'BBA', slug: 'bba', input: 'aviation', expectSlug: 'aviation-management' },
  // Sanity: an exact match should return unchanged
  { uni: 'lovely-professional-university-online', label: 'MBA', slug: 'mba', input: 'digital-marketing', expectSlug: 'digital-marketing' },
]

let pass = 0
let fail = 0
for (const c of cases) {
  const r = resolveSpec(c.uni, c.label, c.slug, c.input)
  const gotSlug = r?.slug ?? 'NULL'
  const ok = gotSlug === c.expectSlug
  const marker = ok ? '✓' : '✗'
  console.log(`${marker} ${c.uni}/${c.slug}/${c.input} → ${gotSlug} (expected ${c.expectSlug})${ok ? '' : `  name=${r?.name ?? '-'}`}`)
  if (ok) pass++; else fail++
}
console.log(`\n${pass}/${pass + fail} pass`)
process.exit(fail ? 1 : 0)
