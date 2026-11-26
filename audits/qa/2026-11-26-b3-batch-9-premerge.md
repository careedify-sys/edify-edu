# QA: B3 batch 9 pre-merge (fix/b3-batch-9 at 218303f)

- **Date:** 2026-11-26
- **Checker:** qa-checker (outsider; did not do the work)
- **Branch:** fix/b3-batch-9 at 218303f, cut from origin/main 7b8c3b8
- **Engineer worktree:** .claude/worktrees/agent-a01edebc53ee492c4. Untracked `.b8tmp/` was ignored and not staged.

## Overall verdict: PASS

All 7 tests pass. Nothing blocks the merge. There are 6 advisories at the end; none is a regression from this diff.

## Method

**Builds**
- Branch build: `.next/BUILD_ID` is from 12:06, after the commit at 12:04:12. It is fresh.
- Base build: 7b8c3b8, built in a clean scratch worktree. `next build` exit 0, 2360/2360 static pages generated, types checked. Neither side has a `.env.local`.

**Prerendered pages**
- Compared all 2,335 prerendered `.html` pages in `.next/server/app`, base against branch.
- Visible text: everything after `</head>`, with scripts and styles stripped.
- JSON-LD: compared separately.
- Meta: title, description, og and twitter title and description, canonical, robots.

**Dynamic route**
- /programs/mba renders on demand, so I fetched it from `next start` on both builds.
- Ports used: 3111 (base) and 3112 (branch). Port 3918 was not touched. Only my own two servers were stopped (PIDs 29832 and 36396).

**Facts and gates**
- Fees and ranks: checked with `getExactFee` and `getDisplayFee` (lib/fees.ts), plus lib/data.ts and lib/data-slim.ts, via tsx.
- Detectors: every detector below was run on base first and found hits there before a 0 on the branch was trusted. The base counts are listed with each result.
- Pre-commit: `.husky/pre-commit` ran on a scratch worktree at 7b8c3b8 with 218303f's tree staged (`git checkout 218303f -- .`).
- Typecheck: `tsc --noEmit` ran on the same tree.

**Change footprint**
- Diff: 8 files, +101/-294. The whole diff was read.
- Visible text changed on 9 pages: `/`, `/tools/salary-calculator` and 7 pages under /programs/mba/specializations/ (HR, SCM, Business Analytics, Healthcare, FinTech, Logistics, Hospitality).
- JSON-LD changed on 8 pages: the homepage and the same 7 spec pages.
- Meta changed on 0 pages.
- /programs/mba changed (fetched live).
- No other page changed.

## Test 1: Salary claims removed. PASS

### /programs/mba (live fetch)

| Item | Base | Branch |
|---|---|---|
| "Rs 3-6 LPA" | 1 | 0 |
| "Rs 6-12 LPA" | 3 | 0 |
| "Rs 10-25 LPA" | 1 | 0 |
| "LPA" anywhere in visible text | 10 | 0 |
| "Salary by Specialisation" | 1 | 0 |
| "industry surveys" / "realistic numbers" | 1 / 1 | 0 / 0 |
| "salary data" (spec-cards blurb) | 1 | 0 |

- The SALARY_DATA demand badges are gone: "Medium" 2 to 0, "Stable" 1 to 0, "Growing" 1 to 0.
- The section now reads: heading, then the qualitative paragraph ending "...does not guarantee a salary jump.", then the "Honest disclaimer" paragraph, then the next section.
- No heading is orphaned. The "Salary by Specialisation" h3 went with its table, and the h2 still has content under it.
- Tag balance on the live HTML is equal open/close for every tag on both builds.
- The removed counts match the deleted markup exactly:

| Tag | Removed | Explained by |
|---|---|---|
| div | 5 | 3 cards, the card grid, the table wrapper |
| table | 1 | the salary table |
| tr | 8 | 1 header row + 7 rows |
| td | 21 | 7 rows x 3 cells |
| p | 9 | 3 cards x 3 paragraphs |
| h3 | 1 | "Salary by Specialisation" |
| span | 7 | 7 demand badges |

- All 6 JSON-LD blocks are byte-identical to base and parse.
- No meta changed. "undefined" and "NaN" count 0.

### Homepage

| Item | Base visible | Base LD | Branch visible | Branch LD |
|---|---|---|---|---|
| "30–50%" (visible FAQ) | 1 | n/a | 0 | n/a |
| "30-50% salary jump" | n/a | 1 | n/a | 0 |
| "₹8L–₹25L" | 1 | 1 | 0 | 0 |
| "₹7L–₹20L" | 1 | 1 | 0 | 0 |
| "higher salary ceiling" | 1 | 1 | 0 | 0 |

- The FAQ still has 5 `<details>` and none is empty.
- The FAQPage LD parses.
- The LD and the visible FAQ lost the same claims.
  - My 70-character mirror check now flags the "worth it" and "Finance vs Marketing" pairs.
  - That is old wording drift between the LD and the visible copy, which was already there on base for 2 entries. It is not a new divergence: both sides say the same facts.

### Salary calculator

| Item | Base | Branch |
|---|---|---|
| "₹6 LPA to ₹25 LPA" | 1 | 0 |
| "20-30% more" | 1 | 0 |
| "Highest paying" | 1 | 0 |
| "Salary by MBA Specialization" h3 and its 5-item list | 1 | 0 |
| "+30% higher salary" | 1 | 0 |
| "included in this estimate" | 0 | 1 |

- The "30-50%" line is inside `{!hasMBA && ...}`, so it is not in the server render. I verified it from source: the diff replaces it with "Compare NIRF-ranked online MBA options below."
- That new line is true. The 5 `topUnis` all carry NIRF ranks (MAHE 3, BITS 7, Amrita 8, CU 19, Amity 22, from UNIS_SLIM via getSortRank), and each row prints "NIRF #n".
- Tags are balanced. The ul, 5 li and 1 h3 are gone. The h2 "Complete Guide" still has a paragraph and an h3 section under it.

**Arithmetic and label**
- Arithmetic is unchanged. Lines 44-50 (`baseMin/baseMax x EXPERIENCE x CITY`, `mbaBonus = hasMBA ? 1.3 : 1.0`, `salaryMin/Max/Avg`) are untouched by the diff.
- The rendered default state also matches base: "₹ 15.7 LPA, Range ₹ 9.0 L - ₹ 22.4 L".
- The label "MBA Premium: included in this estimate" is accurate.
  - It renders only when `hasMBA` is true.
  - In exactly that state, salaryMin and salaryMax have the 1.3 multiplier applied.

### Spec pages (7)

| Item | Base | Branch |
|---|---|---|
| "Salary range:" line | 7 pages | 0 |
| "Salary Range" stat card | 7 | 0 |
| "per annum" | 7 pages / 14 hits visible, 7 LD | 0 |
| "18% since 2022" | 1 | 0 |
| "grew by 22%" | 1 | 0 |
| "35-40% salary premiums" | 1 | 0 |
| "What is the salary after" / "What salary can I expect after" (these 7 pages) | 6 visible + 6 LD, plus 1 | 0 |

- The FAQPage entry count went from 54 to 47 across the changed pages: 7 salary FAQs removed. None is empty and all LD parses.
- Every spec page's tag balance is equal open/close. Each page lost one `<details>`.
- The "salar" mentions left on these pages are:
  - the "Read the detailed career and salary guide" link (unchanged), and
  - the Hospitality vs Healthcare FAQ sentence. See advisory A1.

## Test 2: Coupons. PASS

**IGNOU**
- lib/coupon-pages.ts:416 now reads "IGNOU does not offer formal EMI. Fee is paid semester-wise."
- "14,000-16,000" went from 1 page to 0 in the built coupon HTML.

**SMU**
- The new stackExample (lib/coupon-pages.ts:266):

  > "Northeast India and Sikkim residents can claim a 30% fee waiver with a domicile certificate."

- lib/data.ts holds no SMU discount at all. A grep for Northeast, Sikkim, domicile and 30% finds nothing on the SMU record.
- The discounts row is in lib/coupon-pages.ts:263, in the same record, and this diff leaves it unchanged:

  > `{ type: 'Northeast India scholarship', eligibility: 'Northeast India and Sikkim residents', saving: '30% fee waiver', howToApply: 'Submit domicile certificate' }`

- Word for word:
  - "Northeast India and Sikkim residents" matches the eligibility field exactly.
  - "30% fee waiver" matches the saving field exactly.
  - "with a domicile certificate" is how-to-apply.
- No fact beyond that row is added.
- It also removes the derived "Rs 84,000" and the old "automatically", which contradicted the certificate step.
- Neither the row nor stackExample has a visible reader. They sit only in the RSC payload of /coupons/smu-online-mba-discount-coupon-2026: 0 visible hits on both builds, 1 payload hit on the branch. See advisory A5.

**Manav Rachna and VGU**
- The values come from lib/data.ts.
  - The programDetails.MBA.fees strings are "₹160K – ₹160K" and "₹150K – ₹150K".
  - getDisplayFee returns `range "₹1,60,000"` (min = max = 160000) and `range "₹1,50,000"` (min = max = 150000).
  - The new strings are exactly those, so nothing was invented.
- totalFeeNum went from 60000 to 160000 and 150000. totalFeeNum has no reader anywhere in app/, components/, lib/ or scripts/; the only matches are its definitions.
- getExactFee returns `{kind:'none'}` for both.
- Where the fields could render:
  - The only reader of `totalFee` is components/CouponPageCTA.tsx:24, inside `if (page.couponCode === 'N/A')`. Manav Rachna is MRU2026-5K and VGU is VGU2026-5K, so it never runs for them.
  - finalFee has no reader.
  - Built HTML: visible text on both coupon pages is unchanged from base (they are not among the visible-change pages).
  - "1,60,000" and "1,50,000" appear only inside the RSC payload, 2 hits each. That replaces the base payload's "₹160K – ₹160K" and "₹150K – ₹150K", 2 hits each: the same number in a new notation, still not visible.
  - JSON-LD on the coupon pages is unchanged.
- No suppressed fee is shown on any page.

## Test 3: UPES. PASS

- The Logistics FAQ now reads "UPES (NIRF #45 University, NAAC A)".
- lib/data.ts (upes-online) has `nirf: 45`, `naac: 'A'` and approvals `'NIRF #45 (University)'`. Both facts match.
- "ranked #45 NIRF" went from 1 page (visible and LD) to 0.
- The same page's other FAQ, "NIRF #36 Management, NAAC A", agrees with `nirfMgt: 36`.

## Test 4: MBAHubClient and the spec stat grid. PASS

**IGNOU and LPU phrases (live /programs/mba)**
- "Strongest government job eligibility": 1 to 0. "at affordable price": 1 to 0.
- The cards now read "Central government university. NAAC A++." and "...Tech-driven LMS. Strong North India alumni network."
- Both IGNOU facts hold in lib/data.ts: naac A++ and approvals include "Central University".

**Intro clause**
- "₹10,000 to ₹3.70 lakh": 1 to 0. "3.70 lakh": 1 to 0. "10,000 to": 1 to 0.
- I decoded `&#8377;` before matching, so the detector found the entity-encoded base text.
- The sentence now ends "...navigating 121 + UGC-DEB approved universities. This page compares..." and reads cleanly.

**Spec stat grid**
- "Fee Range" on the 7 spec pages: 7 to 0. Base showed "₹60K to ₹3.7L", which is the placeholder floor.
- The grid is `grid grid-cols-2 gap-4` with two cards ("Universities 10+", "Duration 2 Years"): one row of two at every width, with no empty cells.
- Div count per page went from 66 to 58: 2 stat cards x 3, the salary line, and 1 FAQ answer, all balanced.
- The removed `feeMin` and `feeMax` consts have no remaining references. `formatFeeSlim` is still imported and still used at lines 463-464 (the university table). Typecheck passes.

## Test 5: editorialGuide. PASS

**No reader**
- `git grep editorialGuide` at 7b8c3b8 (excluding audits/) finds only lib/content.ts: 2 interface fields and 10 literals. At 218303f it finds nothing.
- No code iterates the content objects generically.
- The readers (`getProgramContent` and `getSpecContent` in app/programs/[...slug]/page.tsx, UniversityPageClient and UniSpecBody) access named fields only.

**Rendered output**
- The text never rendered on base.
- "3 Pillars of a Great Online MBA", "Management Ceiling" and "editorialGuide" have 0 hits in base `.html` and `.rsc`.
- Live base fetches of /programs/mba, /programs/mca, /programs/mba/finance, /universities/amity-university-online and its /mba page also return 0.
- On base the text existed only in JS bundles: server chunks 5472 and 9365, and client chunk 8827. On the branch it is in 0 files.
- So the deletion shrinks a shipped client bundle but changes no HTML.

**Typecheck**
- `tsc --noEmit` on the 218303f tree: exit 0, no output.

## Test 6: Gate allowlist edit. PASS (gate not weakened)

**Allowlist shape**
- CHECKED_SUPERLATIVES in scripts/check-coupon-claims.mts still has 3 entries before and after.
- One entry was swapped for the new SMU stackExample text, with the same "most affordable Manipal-group MBA" superlative.
- The SUPERLATIVE regex, the list of fields scanned and the exact-match `includes()` logic are unchanged.
- The old string no longer exists in COUPON_PAGES, so dropping it from the list removes an exemption and adds none.
- The superlative is still true: SMU 1,20,000 (getExactFee exact) is below MUJ and MAHE.

**Injection tests**

| Run | Tree | Result |
|---|---|---|
| Clean | branch | OK, exit 0 |
| Inject 1: IGNOU stackExample set to "IGNOU is the cheapest online MBA we list. No coupons are needed." | branch | FAIL, exit 1, named ignou-online-mba-discount-coupon-2026 |
| Inject 2: the allowed SMU string with one word changed ("can claim" to "may claim") | branch | FAIL, exit 1. Exact-match still holds; there is no prefix or fuzzy loophole. |
| Inject 3: the pre-batch SMU text ("...save 30% automatically, bringing effective fee to Rs 84,000...") restored | branch | FAIL, exit 1. The gate now rejects text it used to allow. |
| Inject 1 | base 7b8c3b8 | Fires: "1 problem(s)". |

- The scratch file was restored after each injection.

## Test 7: Damage and regression. PASS

**Pages and markup**
- Page list: 2,335 on both builds, identical.
- JSON-LD parse failures: 0 on the branch, including the live /programs/mba (6 blocks).
- "undefined": 0 on both builds. "NaN": 0 on both builds.
- Tag balance: equal open/close on all 9 changed prerendered pages and the live /programs/mba.
- Damage scan of the changed pages: no new empty li, h, td, p, a, strong, ul or parentheses, no dangling sentence ends, no inconsistent tables.

**Diff review**
- Every hunk deletes a figure or claim, or rewords neutrally.
- The added text is:
  - "included in this estimate" (accurate, test 1);
  - "Compare NIRF-ranked online MBA options below." (true, test 1);
  - "MBA salary in India depends on the university, specialization, experience, and location." (no figure);
  - the SMU sentence (test 2);
  - the Manav Rachna and VGU strings (test 2);
  - the UPES category (test 3);
  - the gate comment.
- No new figure, rank or superlative.

**Line endings**
- CRLF is preserved on all 8 files. Every line is CRLF before and after.
- HomePageClient was already 632/633 CR on base and is unchanged.
- `--ignore-cr-at-eol` gives the same stat (+101/-294), so there are no whole-file rewrites.

**Meta and protected pages**
- 0 changes to title, description, og or twitter fields, canonical or robots on any page.
- No blog post or data/protected-ai-pages.csv path is touched.

**Pre-commit**
- `.husky/pre-commit` on a staged copy of 7b8c3b8..218303f: exit 0, "all checks passed", including check-protected-pages, check-coupon-claims, check-nirf-category and typecheck:scripts.
- `git status` was identical before and after, so the hook changed no files.

## Advisories (not blocking; none introduced by this diff)

**A1. Hospitality spec FAQ keeps an unsourced pay comparison**
- Location: app/programs/mba/specializations/[spec]/page.tsx:283.
- The sentence: "Both have similar salary ranges at entry level; healthcare mid-tier salaries are slightly higher."
- It is in the visible FAQ and FAQPage LD on /programs/mba/specializations/hospitality-management. It is the same defect class as the 7 FAQs removed.
- Fix: delete that sentence, so the answer ends "...if you are in hospitals, pharma, or health insurance."

**A2. Salary calculator: two unsourced claims remain**
- Location: app/tools/salary-calculator/page.tsx:248.
- "According to industry data, online MBA graduates from top universities (NIRF Top 50) earn comparable salaries to regular MBA graduates."
  - This is the same unsourced attribution as the deleted "industry surveys" sentence on /programs/mba.
  - Fix: drop "According to industry data," and the comparability claim, keeping only the factors sentence.
- The "Boost Your Salary with MBA" heading (line 212, client-only) also still implies a pay effect.
- The engineer already listed the ROLES and multiplier data for Rishi.

**A3. /programs/mba intro still uses "navigating"**
- "navigating" is on the house-style banned list.
- This wording was already there; this batch only rewrapped the sentence.

**A4. Homepage FAQ LD and visible copy differ in wording**
- Two entries differ in wording: the "Finance vs Marketing" question text, "universities" in "worth it", and the NIRF entry.
- This is pre-existing. Facts agree after this batch.

**A5. SMU Northeast 30% waiver has no source in lib/data.ts and no audits/verify row**
- It lives only in lib/coupon-pages.ts.
- `discounts`, `stackExample` and `emiCompatible` have no visible reader. They ship only in the RSC payload, so the IGNOU, SMU and gate-string edits change no visible text.

**A6. Cosmetic: double blank line**
- A double blank line is left at app/programs/mba/specializations/[spec]/page.tsx:351-352 where the two consts were deleted.

**Out of scope, noted only**
- UNIS_SLIM has MAHE `nirf: 3` (shown on the salary calculator as "NIRF #3"), while the /programs/mba top-10 card says "NIRF #4 University". This is pre-existing data-slim drift.

## Cleanup

- Both `next start` servers I started (ports 3111 and 3112) are stopped. Port 3918 was not touched.
- Scratch worktrees qab9base and qab9gates were removed, each node_modules junction first (rmdir), then `git worktree prune`.
- 0 scratch worktrees remain registered.
- The main node_modules is intact (417 entries).
- Scripts and logs: C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa9/
- No site edits, commits or pushes.
