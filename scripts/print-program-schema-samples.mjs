// scripts/print-program-schema-samples.mjs
// Sprint 3 Fix 1 verification. Renders the JSON-LD programSchema for four
// sample pages so Rishi can eyeball the fee bits.
//
// Run: npx tsx scripts/print-program-schema-samples.mjs

import { UNIVERSITIES } from '../lib/data.ts'
import { getProgramSchemaOffer, getProgramSchemaFeeFragment } from '../lib/seo/program-schema.ts'
import { MBA_SEO_OVERRIDES } from '../lib/mba-seo-overrides.ts'

const SAMPLES = [
  ['chandigarh-university-online',   'BCA', '/universities/chandigarh-university-online/bca'],
  ['kurukshetra-university-online',  'BBA', '/universities/kurukshetra-university-online/bba (was suppressed pre-Sprint 2, backfilled to Rs 72,661)'],
  ['chitkara-university-online',     'BBA', '/universities/chitkara-university-online/bba (currently suppressed under Rule 4a)'],
  ['galgotias-university-online',    'BBA', '/universities/galgotias-university-online/bba'],
  ['amity-university-online',        'MBA', '/universities/amity-university-online/mba (override)'],
]

for (const [id, program, label] of SAMPLES) {
  const u = UNIVERSITIES.find(x => x.id === id)
  if (!u) { console.log(`MISSING ${id}`); continue }
  const pd = u.programDetails[program]
  const durationYears = parseInt(pd?.duration?.replace(/[^0-9]/g, '') || '2', 10) || 2
  const feeFrag = getProgramSchemaFeeFragment(u, program)
  const offer = getProgramSchemaOffer(u, program)
  const override = program === 'MBA' ? MBA_SEO_OVERRIDES[id] : undefined

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: `${u.name} Online ${program}`,
    description: `UGC-DEB approved Online ${program} from ${u.name}. NAAC ${u.naac} accredited. ${pd?.specs?.length || 0}+ specialisations${feeFrag}.`,
    url: `https://edifyedu.in/universities/${id}/${program.toLowerCase().replace('.', '')}`,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: u.name,
      sameAs: `https://edifyedu.in/universities/${id}`,
    },
    educationalProgramMode: 'Online',
    timeToComplete: `P${durationYears}Y`,
    ...(offer ? { offers: offer } : {}),
  }

  console.log('')
  console.log(`## ${label}`)
  if (override) console.log('   NOTE: MBA has an SEO override at title/description level; schema is unaffected by overrides.')
  console.log('```json')
  console.log(JSON.stringify(schema, null, 2))
  console.log('```')
}
