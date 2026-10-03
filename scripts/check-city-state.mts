// scripts/check-city-state.mts
//
// Blocks a location field in lib/data.ts that is not a location.
//
// What shipped: 74 of 143 records carried a junk city or state. Twenty had both
// set to the literal string "Online". Thirty-one had an uppercase state
// ("UTTAR PRADESH"). Five had a PIN code welded on ("Punjab 144411"). Three had
// an address fragment where the city goes ("Block 32", "Sector 7", "NH-95").
// One had a city in the state field (Vels: state "Chennai").
//
// It was not cosmetic. app/universities/[id]/page.tsx built schema.org
// PostalAddress from these, and when the city was "Online" it fell back to the
// first word of the university name, so GLS published addressLocality "GLS" and
// SGT published "SGT": a fabricated locality in structured data, in the field
// search engines read for location.
//
// A second fault came out of fixing the first. Twenty records whose state had
// been "Online" were left on the default region "Central", so seven Gujarat
// universities, five Karnataka and three Tamil Nadu were filed under the
// Central filter. Region is derivable from state, so this gate checks they
// agree rather than trusting either alone.
//
// WHAT BLOCKS AND WHAT IS ONLY TRACKED.
//   A FALSE value always blocks. "Online" is not a place, "UTTAR PRADESH" is not
//   how the field is written anywhere else, and a region that contradicts its
//   own state is wrong whichever one you believe.
//   An ABSENT value does not block, because there is no city source: Supabase
//   has a city for 1 of its 124 rows and nothing else in the repo carries one.
//   43 records have no city and 2 have no state. Those counts are ratcheted
//   through data/city-state-baseline.json, so absence can shrink but never grow.
//
// Run:    npx tsx scripts/check-city-state.mts
// Detail: npx tsx scripts/check-city-state.mts --verbose
// Wired into: .husky/pre-commit

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { UNIVERSITIES } from '../lib/data'

const BASELINE_PATH = 'data/city-state-baseline.json'
const VERBOSE = process.argv.includes('--verbose')

const STATE_REGION: Record<string, string> = {
  'Jammu and Kashmir': 'North', 'Ladakh': 'North', 'Himachal Pradesh': 'North',
  'Punjab': 'North', 'Chandigarh': 'North', 'Uttarakhand': 'North', 'Haryana': 'North',
  'Delhi': 'North', 'New Delhi': 'North', 'Rajasthan': 'North', 'Uttar Pradesh': 'North',
  'Bihar': 'East', 'West Bengal': 'East', 'Jharkhand': 'East', 'Odisha': 'East',
  'Sikkim': 'East', 'Assam': 'East', 'Arunachal Pradesh': 'East', 'Nagaland': 'East',
  'Manipur': 'East', 'Mizoram': 'East', 'Tripura': 'East', 'Meghalaya': 'East',
  'Gujarat': 'West', 'Maharashtra': 'West', 'Goa': 'West',
  'Dadra and Nagar Haveli and Daman and Diu': 'West',
  'Madhya Pradesh': 'Central', 'Chhattisgarh': 'Central',
  'Andhra Pradesh': 'South', 'Telangana': 'South', 'Karnataka': 'South',
  'Tamil Nadu': 'South', 'Kerala': 'South', 'Puducherry': 'South',
  'Andaman and Nicobar Islands': 'South', 'Lakshadweep': 'South',
}
const VALID_REGIONS = new Set(Object.values(STATE_REGION))

// A city that is really a compass direction, a postal fragment, or the country.
const REGION_LABEL = /^(North|South|East|West|Central|North\s*East|Northeast)\s*(India)?$/i
const ADDRESS_FRAGMENT = /^(Block|Sector|Plot|Phase|Survey|Khasra|NH|SH)\b|^\d/i
const ONLINE = /^online$/i

interface Finding { id: string; field: string; value: string; why: string }
const findings: Finding[] = []
let noCity = 0
let noState = 0
const noCityIds: string[] = []
const noStateIds: string[] = []

for (const u of UNIVERSITIES as any[]) {
  const { id, city, state, region } = u

  // --- state ---
  if (!state) { noState++; noStateIds.push(id) }
  else if (ONLINE.test(state)) findings.push({ id, field: 'state', value: state, why: '"Online" is not a place' })
  else if (!STATE_REGION[state]) {
    const why = /\d{6}\s*$/.test(state) ? 'has a PIN code appended'
      : state === state.toUpperCase() ? 'is uppercase; write it as "Uttar Pradesh"'
      : 'is not an Indian state or union territory'
    findings.push({ id, field: 'state', value: state, why })
  }

  // --- city ---
  if (!city) { noCity++; noCityIds.push(id) }
  else if (ONLINE.test(city)) findings.push({ id, field: 'city', value: city, why: '"Online" is not a place' })
  else if (REGION_LABEL.test(city)) findings.push({ id, field: 'city', value: city, why: 'is a region, not a city' })
  else if (ADDRESS_FRAGMENT.test(city)) findings.push({ id, field: 'city', value: city, why: 'is an address fragment, not a city' })
  else if (city === 'India') findings.push({ id, field: 'city', value: city, why: 'is a country, not a city' })

  // --- region ---
  if (!region) findings.push({ id, field: 'region', value: '', why: 'is missing' })
  else if (!VALID_REGIONS.has(region)) findings.push({ id, field: 'region', value: region, why: `is not one of ${[...VALID_REGIONS].join(', ')}` })
  else if (state && STATE_REGION[state] && STATE_REGION[state] !== region) {
    findings.push({ id, field: 'region', value: region, why: `contradicts state "${state}", which is ${STATE_REGION[state]}` })
  }
}

console.log(
  `check-city-state: ${(UNIVERSITIES as any[]).length} records, ` +
  `${findings.length} false value(s), ${noCity} without a city, ${noState} without a state.`,
)

// ---------------------------------------------------------------- ratchet
let baselineFailed = false
const current = { noCity, noState }
if (!existsSync(BASELINE_PATH)) {
  writeFileSync(BASELINE_PATH, JSON.stringify({
    note: 'Records with no city or no state. There is no city source in this repo (Supabase has one for 1 of 124 rows), so absence is tracked rather than blocked. These counts may fall, never rise. Lower them by filling the field from the university\'s own portal.',
    updatedAt: new Date().toISOString().slice(0, 10),
    ...current,
  }, null, 2) + '\n')
  console.log(`check-city-state: seeded ${BASELINE_PATH} at ${noCity} missing cities, ${noState} missing states.`)
} else {
  const base = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
  for (const [key, label] of [['noCity', 'cities'], ['noState', 'states']] as const) {
    const was = base[key] ?? 0
    const now = (current as any)[key]
    if (now > was) {
      const ids = label === 'cities' ? noCityIds : noStateIds
      console.error(`\ncheck-city-state: FAIL. Records with no ${label} rose ${was} -> ${now}.`)
      console.error(`  currently missing: ${ids.join(', ')}`)
      console.error('  There is no source for these, so do not invent one. If a record genuinely')
      console.error('  lost its value, restore it rather than raising the baseline.')
      baselineFailed = true
    } else if (now < was) {
      base[key] = now
      base.updatedAt = new Date().toISOString().slice(0, 10)
      writeFileSync(BASELINE_PATH, JSON.stringify(base, null, 2) + '\n')
      console.log(`check-city-state: missing ${label} DROPPED ${was} -> ${now}. Baseline updated.`)
    }
  }
}

if (VERBOSE) {
  if (noCityIds.length) console.log(`\nno city (${noCityIds.length}): ${noCityIds.join(', ')}`)
  if (noStateIds.length) console.log(`no state (${noStateIds.length}): ${noStateIds.join(', ')}`)
}

if (!findings.length && !baselineFailed) {
  console.log('check-city-state: OK, every location field is a location.')
  process.exit(0)
}

if (findings.length) {
  console.error('\ncheck-city-state: FAIL.')
  for (const f of findings) {
    console.error(`  ${f.id}`)
    console.error(`    ${f.field} = ${JSON.stringify(f.value)}  ${f.why}`)
  }
  console.error(`\n${findings.length} false location value(s). These render on the university page`)
  console.error('and feed schema.org PostalAddress. Leave the field empty rather than writing a')
  console.error('placeholder: empty is incomplete, "Online" is false.')
}
process.exit(1)
