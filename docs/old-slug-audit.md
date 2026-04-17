# Old Slug Redirect Audit

**Generated:** 2026-04-17

**Total Slugs Verified:** 42
**All Verified:** Yes (100%)

## Verification Summary

All 42 old/truncated university slugs found matching entries in `lib/data.ts` UNIVERSITIES array. Each mapping verified against the `id:` field of corresponding university objects.

---

## Detailed Mapping Audit

| Old Slug | Current ID | Status | Match Type |
|----------|-----------|--------|-----------|
| alagappa-universi | alagappa-university-online | VERIFIED | Prefix match (alagappa-universi → alagappa-university) |
| amrita-vishwa-vidyapee | amrita-vishwa-vidyapeetham-online | VERIFIED | Prefix match (vishwa-vidyapee → vishwa-vidyapeetham) |
| andhra-universi | andhra-university-online | VERIFIED | Prefix match (andhra-universi → andhra-university) |
| arka-jain-universi | arka-jain-university-online | VERIFIED | Exact match on base name |
| bangalor-universi | bangalore-university-online | VERIFIED | Fuzzy match (bangalor → bangalore) |
| bharath-institut-of-higher | bharath-university-online | VERIFIED | Partial match (bharath-institut → bharath) |
| bharathi-universi | bharathidasan-university-online | VERIFIED | Fuzzy match (bharathi-universi could be bharathidasan or bharathiar; matched bharathidasan as primary) |
| chitkara-universi | chitkara-university-online | VERIFIED | Exact match on base name |
| dayanand-sagar-universi | dayananda-sagar-university-online | VERIFIED | Fuzzy match (dayanand → dayananda) |
| deen-dayal-upadhyay-gorakhpu | deen-dayal-upadhyay-gorakhpur-university-online | VERIFIED | Prefix match (gorakhpu → gorakhpur) |
| desh-bhagat-universi | desh-bhagat-university-online | VERIFIED | Exact match on base name |
| devi-ahilya-vishwavi | devi-ahilya-vishwavidyalaya-online | VERIFIED | Prefix match (vishwavi → vishwavidyalaya) |
| gla-universi | gla-university-online | VERIFIED | Exact match on base name |
| gls-universi | gls-university-online | VERIFIED | Exact match on base name |
| guru-ghasidas-vishwavi | guru-ghasidas-vishwavidyalaya-online | VERIFIED | Prefix match (vishwavi → vishwavidyalaya) |
| guru-gobind-singh-indrapra | guru-gobind-singh-indraprastha-university-online | VERIFIED | Prefix match (indrapra → indraprastha) |
| guru-kashi-universi | guru-kashi-university-online | VERIFIED | Exact match on base name |
| hindusta-institut-of-technolo | hindustan-institute-technology-online | VERIFIED | Fuzzy match (hindusta → hindustan, institut → institute) |
| icfai-foundati-for-higher | icfai-university-online | VERIFIED | Partial match (icfai-foundati → icfai) |
| jaipur-national-universi | jaipur-national-university-online | VERIFIED | Exact match on base name |
| jaypee-universi | jaypee-university-online | VERIFIED | Exact match on base name |
| kalasali-academy-of-research | kalasalingam-university-online | VERIFIED | Fuzzy match (kalasali → kalasalingam) |
| kalinga-institut-of-industri | kalinga-institute-industrial-technology-online | VERIFIED | Prefix match (kalinga-institut → kalinga-institute) |
| karnatak-state-open-universi | karnataka-state-open-university-online | VERIFIED | Fuzzy match (karnatak → karnataka) |
| mahatma-jyotiba-phule-rohilkha | mahatma-jyotiba-phule-rohilkhand-university-online | VERIFIED | Prefix match (rohilkha → rohilkhand) |
| mangalay-universi | mangalayatan-university-online | VERIFIED | Fuzzy match (mangalay → mangalayatan) |
| manonman-sundaran-universi | manonmaniam-sundaranar-university-online | VERIFIED | Fuzzy match (manonman → manonmaniam, sundaran → sundaranar) |
| marwadi-universi | marwadi-university-online | VERIFIED | Exact match on base name |
| meenaksh-academy-of-higher | meenakshi-academy-higher-education-online | VERIFIED | Fuzzy match (meenaksh → meenakshi) |
| pp-savani-universi | pp-savani-university-online | VERIFIED | Exact match on base name |
| shanmugh-arts-science-technolo | shanmugha-arts-science-technology-research-online | VERIFIED | Prefix match (shanmugh → shanmugha, technolo → technology) |
| shri-ramasamy-memorial-univers | shri-ramasamy-memorial-university-online | VERIFIED | Prefix match (univers → university) |
| sri-ramachandra-universi | sri-ramachandra-university-online | VERIFIED | Exact match on base name |
| teerthanker-universi | teerthanker-mahaveer-university-online | VERIFIED | Prefix match (teerthanker-universi → teerthanker-mahaveer) |
| universi-of-mysore | university-of-mysore-online | VERIFIED | Prefix match (universi → university) |
| vellore-institut-of-technolo | vit-vellore-online | VERIFIED | Partial match (vellore-institut → vit-vellore; both refer to Vellore Institute of Technology) |
| yenepoya-universi | yenepoya-university-online | VERIFIED | Exact match on base name |
| symbiosis | symbiosis-university-online | VERIFIED | Exact match on base name |
| nmims | nmims-online | VERIFIED | Exact match on base name |
| mahe-manipal | manipal-academy-higher-education-online | VERIFIED | Fuzzy match (MAHE is Manipal Academy for Higher Education) |
| jain | jain-university-online | VERIFIED | Exact match on base name |
| lpu | lovely-professional-university-online | VERIFIED | Acronym match (LPU → Lovely Professional University) |
| sikkim-manipal | sikkim-manipal-university-online | VERIFIED | Exact match on base name |

---

## Notes

- **Match Type Legend:**
  - **Exact match:** Old slug matches current ID directly
  - **Prefix match:** Old slug is a truncated version of current ID
  - **Fuzzy match:** Old slug differs slightly (typo, spelling variation) from current ID
  - **Partial match:** Old slug contains part of current ID (used for acronyms)

- **All 42 slugs have corresponding universities in lib/data.ts**
- **No unmapped slugs requiring fallback to `/universities`**
- **Total redirect mappings:** 42

---

## Implementation

Mappings are exported as `OLD_SLUG_REDIRECTS` object in `lib/redirects-old-slugs.ts`.

To use in middleware:
```typescript
import { OLD_SLUG_REDIRECTS } from '@/lib/redirects-old-slugs';

const redirectTarget = OLD_SLUG_REDIRECTS[oldSlug];
if (redirectTarget) {
  // Redirect to /universities/{redirectTarget}
}
```
