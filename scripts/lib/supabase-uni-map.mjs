// scripts/lib/supabase-uni-map.mjs
//
// lib/data.ts university ids and Supabase `universities.slug` values do NOT
// agree. Joining the two on slug silently drops rows or, worse, pairs the wrong
// institutions. Both failure modes are invisible: the query returns something.
//
// Examples that bit us on 2026-09-17:
//   upes-online                        -> university-of-petroleum-and-energy-studies-online
//   manipal-university-jaipur-online   -> manipal-university-online          (Rajasthan)
//   dayananda-sagar-university-online  -> dayanand-sagar-university-online    (one letter)
//   symbiosis-university-online        -> symbiosis-international-online
// A naive join concluded that MUJ, DSU and Amrita had no accreditation records
// at all, which is false. All three are present under a different name.
//
// Equally important, two pairs look alike and are DIFFERENT institutions:
//   dr-br-ambedkar-open-university-online (Telangana) is NOT
//   dr-babasaheb-ambedkar-open-university-online (Gujarat)
//   ajeenkya-dy-patil-university-online is NOT dr-dy-patil-vidyapeeth-pune-online
//
// Use resolveSupabaseSlug() for any cross-check. Anything in ABSENT is genuinely
// missing from Supabase and must not be given a fuzzy match.

// Hand-verified where automatic matching was unsafe. Verified 2026-09-17
// against Supabase name, slug and state.
export const OVERRIDES = {
  'upes-online': 'university-of-petroleum-and-energy-studies-online',
  'manipal-university-jaipur-online': 'manipal-university-online',
  'dayananda-sagar-university-online': 'dayanand-sagar-university-online',
  'shoolini-university-online': 'shoolini-university-of-biotechnology-and-management-sciences-online',
  'symbiosis-university-online': 'symbiosis-international-online',
  'amrita-vishwa-vidyapeetham-online': 'amrita-vishwa-vidyapeetham-university-online',
  'vit-university-online': 'vellore-institute-of-technology-online',
  'bit-mesra-online': 'birla-institute-of-technology-online',
  'vtu-online': 'visvesvaraya-technological-university-online',
  'charusat-university-online': 'charotar-university-of-science-technology-online',
  'shiv-nadar-university-online': 'shiv-nadar-institution-of-eminence-online',
  'srm-institute-science-technology-online': 'srm-institute-of-sciences-and-technology-online',
  'kalasalingam-university-online': 'kalasalingam-academy-of-research-and-higher-education-online',
  'jss-university-online': 'jss-academy-of-education-and-research-online',
  'manav-rachna-online': 'manav-rachna-international-institute-of-research-studies-online',
  'hindustan-institute-technology-online': 'hindustan-institute-of-technology-and-science-hits-online',
  'nmims-online': 'narsee-monjee-institute-of-management-studies-nmims-online',
  'jain-university-online': 'jain-deemed-to-be-university-online',
  'manipal-academy-higher-education-online': 'manipal-academy-of-higher-education-online',
  'christ-university-online': 'christ-deemed-to-be-university-online',
  'savitribai-phule-pune-university-online': 'savitribai-phule-pune-university-online',
  'ignou-online': 'ignou-online',
  'icfai-university-online': 'icfai-foundation-for-higher-education-online',
  'jaypee-university-online': 'jaypee-institute-of-information-technology-online',
  'sathyabama-university-online': 'sathyabama-institute-of-science-and-technology-online',
  'karunya-university-online': 'karunya-institute-of-technology-and-sciences-online',
  'vignan-university-online': 'vignans-foundation-for-science-technology-and-research-online',
  'bharathidasan-university-online': 'bharathidasan-university-online',
  'yenepoya-university-online': 'yenepoya-online',
  'maharishi-markandeshwar-university-online': 'maharishi-markandeshwar-online',
  'dr-dy-patil-vidyapeeth-online': 'dr-dy-patil-vidyapeeth-pune-online',
  'jamia-millia-islamia-online': 'jamia-millia-islamia-university-online',
  'bharati-vidyapeeth-university-online': 'bharati-vidyapeeth-online',
  'northcap-university-online': 'the-northcap-university-online',
  'centurion-university-online': 'centurion-university-of-technology-and-management-online',
  'subharti-university-online': 'swami-vivekanand-subharti-university-online',
  'graphic-era-university-online': 'graphic-era-online',
  'guru-jambheshwar-university-online': 'guru-jambheshwar-university-of-science-and-technology-online',
  'mody-university-online': 'mody-university-of-science-and-technology-online',
}

// Present in Supabase `universities` but carrying NO NAAC accreditation row, so
// any NAAC grade the site shows for them is unverifiable against source of
// truth. Confirmed 2026-09-17. These need a backfill, not a fuzzy match.
export const NO_NAAC_ROW = new Set([
  'ignou-online',
  'savitribai-phule-pune-university-online',
  'bharathidasan-university-online',
])

// Confirmed absent from Supabase `universities` on 2026-09-17. Do NOT fuzzy
// match these; a near-name hit is a different institution.
export const ABSENT = new Set([
  'bits-pilani-work-integrated-online',
  'op-jindal-global-university-online',
  'dr-br-ambedkar-open-university-online',
  'ajeenkya-dy-patil-university-online',
  'sgt-university-online',
  'sastra-university-online',
  'srm-university-sikkim-online',
  'vels-university-online',
  'alvas-college-online',
  'choudhary-charan-singh-university-online',
  'pt-sundarlal-sharma-open-university-online',
  'university-of-calicut-online',
  'sri-venkateswara-university-online',
  'swami-rama-himalayan-university-online',
  'central-university-tamil-nadu-online',
  'silver-oak-university-online',
  'srinivas-university-online',
  'st-aloysius-university-online',
  'bennett-university-online',
  'sandip-university-online',
  'atlas-skilltech-university-online',
  'sri-siddhartha-academy-online',
  'saveetha-university-online',
  'bml-munjal-university-online',
])

/**
 * Resolve a lib/data.ts university id to a Supabase universities.slug.
 * Returns null when the university is known to be absent, or when no confident
 * match exists. Never guesses.
 *
 * @param {string} id          lib/data.ts university id
 * @param {Array<{slug:string,name:string}>} supabaseUnis rows from Supabase
 * @returns {string|null}
 */
export function resolveSupabaseSlug(id, supabaseUnis) {
  if (ABSENT.has(id)) return null
  if (OVERRIDES[id]) return OVERRIDES[id]
  return supabaseUnis.some(u => u.slug === id) ? id : null
}
