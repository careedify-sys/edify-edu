# QA: B3 batch 18 round 2, pre-merge rerun (fix/b3-batch-18 at 02552a9, parent a5d0268, base a1b5368)

Checker: qa-checker (outsider review). Date: 2026-11-27.

**Method**
- **Fresh builds:** a1b5368 and 02552a9 in clean worktrees (`next build`, both EXIT 0). The engineer had not built this commit. I compared the prerendered HTML page by page.
- **Real browser:** both builds served with `next start` on ports 3932 (base) and 3931 (branch), driven by Playwright Chromium.
- **Pre-commit:** run on a1b5368 with the 02552a9 tree checked out and staged.
- **Detectors:** all my own. I reran my round-1 scripts and added a JMI clause sweep. Run on a1b5368, the sweep flags 10 known JMI specialisation-count clauses, so it does catch them.

## Verdict: PASS

| # | Item | Result |
|---|---|---|
| F1 | Christ MBA JSON | PASS |
| F2 | JMI in peer JSONs | PASS |
| C1 | Facts sheet committed | PASS |
| Adv | Coupon EMI copy | PASS |
| Adv | Grammar | PASS |
| Adv | Navbar payload | PASS |
| Q65 | Format and numbering | PASS |
| R | Regression and gates | PASS |

## F1, Christ MBA JSON: PASS
- **Sections rewritten.** `classes`, `exams` and `admission` now read "Christ has not published ... for an online MBA". `admission` adds "Do not pay any fee until the programme appears on the UGC-DEB register". `abcId` now says "there is no MBA enrolment to link one to yet". The ABC "Yes" FAQ is deleted.
  - All of these read cleanly and match the wording of `whoCanApply`, `sampleCert`, `emi` and `coupon`.
- **No unverifiable claims left (sheet rows 3j, 3k, 3n).** Each of these terms appears 0 times in the JSON: proctor, webcam, Aadhaar, Live sessions, weekend, campus visit, first semester, offer letter, January, July, 2 years, 4 semesters, 50%, AICTE, DigiLocker, Business Analytics.
- **Terms that remain are not about the Christ MBA:**
  - "intake" is the generic "Fees can change between intakes".
  - "WES" and "A++" both belong to VIT and SRM in the comparisons.
  - "entitled" is in the government-jobs FAQ, which says the MBA is not on the register.
  - "eligib" appears in "Christ has not published eligibility".
- **Valid and still hidden.** The JSON parses. `comingSoon: ['MBA']` is unchanged. `/universities/christ-university-online/mba` returns 307 to the profile. No built HTML contains the JSON's text.

## F2, JMI in peer JSONs: PASS
- **Source sweep.** I parsed every page-content JSON string, plus lib/blog.ts and lib/data.ts, and checked every clause that names JMI or Jamia Millia Islamia.
  - At 02552a9: 104 such clauses, **0** with a specialisation count.
  - At a1b5368: the same sweep finds 10.
- **NAAC.** Within 80 characters after a JMI mention, the grade is A++ every time (20 hits). The one "NAAC A+" nearby is Amity's, in the next sentence.
- **The 3 edits:**
  - JH comparisons now read "NAAC A++ ... central university, New Delhi".
  - The JH FAQ and the SRM comparisons no longer carry ", 4 specialisations".
- **Built HTML (2,335 pages, visible text, sentence level).** JMI with a specialisation count appears only on `/universities/jamia-millia-islamia-online/mba`, from the data-driven hub template (Q65).
  - The "JMI ... NAAC A+" hits are false positives. One is the JH-vs-JMI blog table, which pairs A+ for JH with A++ for JMI. The other is a /universities listing that splits across two cards.

## C1: PASS
audits/verify/batch18-facts-2026-11-27.md is committed in 02552a9 (137 lines). Apart from line endings, it is identical to the main-checkout copy. The committed copy has LF and the disk copy CRLF, which is git normalisation.

## Coupon EMI copy: PASS
- `hasSourcedNoCostEmi` matches only feePlans.mba entries that have a `source` and a row mode or note mentioning "no-cost EMI".
- Run against lib/data.ts, only MUJ qualifies, via its note "No-cost EMI from ₹6,517 a month after the 15% discount, with 6, 12 or 18-month tenures." The source is "Online Manipal MUJ MBA page, checked 2026-11-13; Rishi, confirmed 2026-11-13".
- **In the build:**
  - `coupons/manipal-jaipur-...` is the only coupon page, and the only page site-wide, that prints "no-cost EMI window".
  - The other 23 print "Whether an EMI plan applies to the reduced balance is set by the university and confirmed at enrollment." That sentence reads cleanly after the unchanged preceding sentences.
  - These 23 pages account for the coupon visible-text changes, and MUJ's text is unchanged.
- **Advisory, not a defect.** DPU has a verify-sheet source for "No Cost EMI" (dr-dy-patil-vidyapeeth-online-2026-11-18.md) but no feePlans entry, so it gets the neutral sentence. That is conservative, not false.

## Grammar: PASS
- The text now reads `{program.startsWith('M') ? 'an' : 'a'} {program}`, which gives "an MBA", "an MCA", "an MA", "an M.Com", "an MSc", and "a BBA", "a BCA", "a BA", "a B.Com", "a BSc".
- **Correction to my round-1 advisory:** /compare only offers MBA and MCA tabs (CompareClient.tsx:876), so "an BBA" could never render there. The fix is still correct for every Program value.
- In the browser, the JMI and AMU MBA verdict reads "Fewer than two of these universities publish an MBA fee."

## Navbar payload: PASS
- **The moved list is unchanged.** lib/nav-traffic-order.ts is a plain module with no 'use client'. Its 35 ids, in order, are identical to the TRAFFIC_ORDER array removed from components/Navbar.tsx.
- **The layout sends only those universities.** It now sends `pickFeeShortMap(TRAFFIC_ORDER)`, which copies only those ids, and only when they have a published fee.
- **Browser check, every tab.** 10 programme tabs (MBA, MCA, MA, M.Com, MSc, BBA, BCA, BA, B.Com, BSc) × 3 start pages (/, an Amity profile, a blog post) gives 30 tab views and **444 cards**:
  - **444/444** fee labels and card texts equal getExactFee/formatExactFeeShort for the tab's programme. The fee table is unchanged since round 1, where the same cards were verified.
  - **186** cards have no published fee and show no ₹ figure.
  - In all **30** views, the card list (names and order) is identical to base a1b5368.
  - 0 console errors on either build, apart from the tawk.to CORS block on localhost.
- **HTML size:**
  - The fee map embedded in index.html dropped from 5,854 to 3,069 characters.
  - The average per-page increase over base dropped from +6,360 bytes in round 1 to +3,574 now, so about 2.8 KB is saved on every page.
  - The largest increases remaining are /programs +32 KB, /tools/university-comparison +15 KB and /tools/emi-calculator +5.7 KB. These pages carry their own fee props.
- **No route broken.** All 2,335 pages build, with the same page list. Every page I loaded in the browser rendered.

## Q65: PASS
- The row is well-formed: 6 pipe fields, a source column and a current-state column.
- It is accurate. It quotes the prospectus fee with no total, no specialisations and no EMI. It names the 3 visible "4 specialisations" strings and the 3 indexed spec pages. It also notes that specs drive URLs and that the fee field holds a total.
- origin/main (a1b5368) ends at Q61. The branch adds Q62 to Q65, so there are no collisions.

## Regression and gates: PASS
- **Round-1 A2 results, rerun on this build:**
  - Profile peer cards: 569/569 match (331 "Fee not published", 0 numbers on kind none).
  - /programs cards: all match.
  - The round-1 browser runs, replayed:
    - University-comparison: sort, filter, slider, NAAC and search all work.
    - EMI calculator: works.
    - /compare: fee cells, EMI gating and "Best Value" with 2+ published fees, on 4 sets plus the MCA tab.
    - These produce output **identical to round 1**, with 0 non-tawk console errors.
  - First Load JS is unchanged from round 1. Shared is 87.6 kB, /compare 243 kB and /programs 96.5 kB, and no other route moved.
  - lib/data.ts markers in client chunks are unchanged (`feePlans` in 3 chunks). No secret strings appear in any client chunk.
- **Base a1b5368 → 02552a9:**
  - The page list is the same at 2,335.
  - 179 pages changed visibly: round 1's 161, plus 18 more coupon pages from the EMI sentence.
  - 34 pages changed in JSON-LD; 0 parse failures; 0 undefined or NaN.
  - 0 pages with more unmirrored FAQ answers.
  - 0 changes to head fields (title, description, og, twitter, canonical, robots).
  - 0 new tag imbalances across all pages.
- **Files:**
  - CRLF: 38 files, 0 with CR lines at either commit, 0 trailing-newline changes.
  - JSON round-trip: 15 page-content JSONs, 0 mismatches.
- **Pre-commit** on the staged a1b5368..02552a9 tree (index equal to the 02552a9 tree before and after): EXIT 0.
  - fee 205, blog-fees 1950, em-dash 227 (all unchanged);
  - verify-fees: 0 new mismatches;
  - NAAC consistency: 0;
  - protected pages OK;
  - page-content-json and page-content-facts: 431 files;
  - sitemap-lastmod: OK.
- **Full diff a5d0268..02552a9 (12 files), all read:**
  - `app/coupons/[slug]/page.tsx`, `app/layout.tsx`, `components/CompareClient.tsx` (one line), `components/Navbar.tsx` (list moved out), `lib/fee-short-map.ts` (+pickFeeShortMap), `lib/nav-traffic-order.ts` (new);
  - 3 page-content JSONs;
  - FIX-LOG (append only), QUESTIONS (+Q65) and the facts sheet.
  - Nothing under app/admin, app/api/cms or app/blog/write.

## Advisories (non-blocking)
1. **New, pre-existing, outside this batch.** The indexed blog `/blog/jamia-hamdard-mba-2026` gives JMI as "NIRF University rank 2025 ... 3", but sheet row 2f says #4. It also says JMI has "No fully online MBA currently ... their MBA is full-time on-campus only", but rows 2c and 2d say an online MBA has been on the DEB register since the 2026-27 July session. Give it to a later batch.
2. **DPU coupon.** It could name the no-cost window from its verify sheet once DPU has a feePlans entry. It is fine as it stands.
3. **JMI hub "4 specialisations".** This is correctly parked as Q65.
