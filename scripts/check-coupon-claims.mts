/**
 * Guard: every /coupons/* landing page states accreditation facts that agree
 * with lib/data.ts, and the /coupons hub can resolve each coupon to its own
 * page.
 *
 * Why this is a pre-commit rule and not a one-off cleanup. On 2026-09-13 the
 * live coupon cluster carried five wrong claims at once:
 *
 *   NMIMS      "#17 Management"     truth #24   (overstated on a commercial page)
 *   JAIN       "#62 Management"     truth #73   (that was its University rank)
 *   Symbiosis  "#32 Management"     truth #11   (matched no category at all)
 *   IGNOU      "#1 Open University"             (NIRF publishes no such category)
 *   DPU        "Ranked"                         (a rank claim with no category)
 *
 * Coupons are the best-converting cluster on the site, so they are the worst
 * place to carry a wrong NAAC grade or an invented NIRF category. The standing
 * rule is that a NIRF rank always states its category, and that lib/data.ts
 * (which is reconciled against Supabase) is the source of truth.
 *
 * The hub check exists because /coupons used to resolve a coupon to its page by
 * substring, which sent D.Y. Patil's card to Bharati Vidyapeeth ('dy' matched
 * 'vi(dy)apeeth') and rendered no link at all for four universities whose page
 * slug uses a short form (LPU, SMU, DSU, VGU).
 */
import { COUPON_PAGES, getCouponPageSlugForUniversity } from '../lib/coupon-pages'
import { COUPONS } from '../lib/coupons'
import { getUniversityById } from '../lib/data'

let bad = 0
const fail = (m: string) => { console.error('  ' + m); bad++ }

for (const p of COUPON_PAGES) {
  const u = getUniversityById(p.universityId)
  if (!u) { fail(`${p.slug}: universityId '${p.universityId}' is not in lib/data.ts`); continue }

  if (u.naac !== p.naac) fail(`${p.slug}: NAAC page='${p.naac}' lib/data.ts='${u.naac}'`)

  const ranked = p.nirf.match(/^#(\d+)\s+(\w[\w ]*)$/)
  if (ranked) {
    const rank = Number(ranked[1])
    const category = ranked[2].trim()
    const truth = category === 'Management' ? u.nirfMgt : u.nirf
    if (truth == null || truth >= 999) {
      fail(`${p.slug}: claims NIRF '${p.nirf}' but lib/data.ts has no ${category} rank`)
    } else if (truth !== rank) {
      fail(`${p.slug}: NIRF page='${p.nirf}' lib/data.ts ${category}=#${truth}`)
    }
  } else if (!/^not ranked/i.test(p.nirf)) {
    fail(`${p.slug}: NIRF '${p.nirf}' is neither "#<rank> <Category>" nor "Not ranked..."`)
  }
}

for (const c of COUPONS) {
  if (!getUniversityById(c.universityId)) {
    fail(`coupon ${c.code}: universityId '${c.universityId}' is not in lib/data.ts`)
  }
}

const unreachable = COUPON_PAGES.filter(p => getCouponPageSlugForUniversity(p.universityId) !== p.slug)
for (const p of unreachable) fail(`${p.slug}: the /coupons hub cannot resolve this page from its universityId`)

// A coupon page whose university has no COUPONS entry gets no card on the hub,
// so the hub links to it from nowhere. MAHE and DPU sat orphaned this way while
// publishing live coupon codes. A page that deliberately carries no coupon
// (couponCode 'N/A', e.g. IGNOU) is exempt, since a card would imply an offer
// that does not exist.
const catalogued = new Set(COUPONS.map(c => c.universityId))
for (const p of COUPON_PAGES) {
  if (p.couponCode === 'N/A') continue
  if (!catalogued.has(p.universityId)) {
    fail(`${p.slug}: publishes coupon ${p.couponCode} but has no lib/coupons.ts entry, so /coupons renders no card and no link to it`)
  }
}

// ── Derived fee superlatives ───────────────────────────────────────────────
// Standing rule: never derive a fee superlative. A large share of fee rows are
// placeholder ranges, and we track 143 universities rather than the whole
// market, so "cheapest in India" is not a claim our data can support. On
// 2026-09-14 the cluster carried three: a "has the lowest fee" heading, "the
// most affordable online MBA from a NAAC A++ university", and "lowest base fee
// in India" in a rendered peer-comparison row.
//
// A superlative bounded to a named set that we hold fee data for is checkable
// and allowed, but only after someone has actually checked it. Those live in
// CHECKED_SUPERLATIVES with the date and the figures.
const SUPERLATIVE = /cheapest|most affordable|lowest (?:base )?fee|best value/i

const CHECKED_SUPERLATIVES: string[] = [
  // Verified 2026-09-14 against lib/data.ts: SMU Rs 1,20,000 < MUJ Rs 1,53,000
  // < MAHE Rs 2,92,000. Bounded to the three named Manipal-group programmes.
  'SMU is the most affordable Manipal-group MBA. Northeast residents save 30% automatically, bringing effective fee to Rs 84,000. Add the coupon discount (up to Rs 4,000 on Tue/Sat) on top.',
  'Is SMU the most affordable Manipal-group online MBA?',
  'Yes. SMU is the most affordable of the three Manipal-group online MBA programmes (SMU, MUJ, MAHE). Confirm the current fee structure with our admission desk on your enrollment call.',
]

for (const p of COUPON_PAGES) {
  const strings: string[] = [
    p.couponDiscount,
    p.stackExample,
    p.emiCompatible,
    ...p.exclusions,
    ...p.faqs.flatMap(f => [f.q, f.a]),
    ...p.peerComparisons.flatMap(c => [c.uni, c.savings]),
    ...p.discounts.flatMap(d => [d.type, d.eligibility, d.saving, d.howToApply]),
  ]
  for (const str of strings) {
    if (SUPERLATIVE.test(str) && !CHECKED_SUPERLATIVES.includes(str)) {
      fail(`${p.slug}: derived fee superlative in "${str.slice(0, 90)}". Either drop it, or bound it to a named set, verify it against lib/data.ts, and add the exact string to CHECKED_SUPERLATIVES with the figures.`)
    }
  }
}

if (bad) {
  console.error(`\ncheck-coupon-claims: ${bad} problem(s). Fix the claim or the data, do not weaken the check.`)
  process.exit(1)
}
console.log(`check-coupon-claims: OK (${COUPON_PAGES.length} coupon pages, ${COUPONS.length} coupons, all claims agree with lib/data.ts).`)
