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

if (bad) {
  console.error(`\ncheck-coupon-claims: ${bad} problem(s). Fix the claim or the data, do not weaken the check.`)
  process.exit(1)
}
console.log(`check-coupon-claims: OK (${COUPON_PAGES.length} coupon pages, ${COUPONS.length} coupons, all claims agree with lib/data.ts).`)
