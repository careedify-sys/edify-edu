# QA pre-merge re-run: B3 batch 5 (fix/b3-batch-5 at 9f95f7a)

Date: 2026-11-25. Checker: qa-checker, re-checking as an outsider. I made no site edits.
Round 2 adds bfbd3d0, 9a66f49, e5c612c and 9f95f7a on top of eff1c32. The base is 8af7d35, and its build from the first run was reused.
First report: audits/qa/2026-11-25-b3-batch-5-premerge.md.

## Overall verdict: FAIL, one item

All round-1 FAILs are fixed. Card fees, sort, slider, interactivity, Dr MGR, Kurukshetra, Shoolini, the rarity sweep, salary claims and all regression checks pass. One item still fails: the DPU peer-grade fix stopped one sentence short.

On the indexed page /universities/dr-dy-patil-vidyapeeth-online/mba/business-analytics, a sibling file edited in this round, the LPU comparison still says:

> "DPU at ₹1,89,400 saves ₹10,600 with stronger NAAC (A++ vs A+) and NIRF (#41 vs unranked for LPU management)."

lib/data.ts contradicts all three parts of that sentence:
- LPU's NAAC is A++ (`lib/data.ts:714`).
- LPU's NIRF Management rank is 44 (`lib/data.ts:712`).
- ₹10,600 is a derived fee gap.

The same false LPU comparison sits on two more indexed DPU pages that this round did not touch. Fixing them is one clause each (see "Fix required"). After that the branch is mergeable.

| # | Test | Result |
|---|---|---|
| 1 | Listing cards = profile (143 + 6) | PASS |
| 2 | Refactor, metadata, interactivity, gated sort/slider | PASS |
| 3 | Shoolini | PASS |
| 4 | Dr MGR own fee and fee-direction | PASS (2 advisories) |
| 5 | Kurukshetra | PASS |
| 6 | Exclusivity; BVP dangling sentence; Jamia bullet; rarity in the 7 files | PASS |
| R2-DPU | DPU agri plus the two sibling pages: peer grades match lib/data.ts | **FAIL** |
| R2-SMU | SMU Finance "most affordable" | PASS (sibling SMU pages: advisory) |
| 7 | Salary / pay claims | PASS |
| 8 | Regression, gates, baselines, diff read | PASS |

## Method

- **Branch build:** I moved the `scratchpad/qab5branch` worktree to 9f95f7a, set the old `.next` aside, and ran a fresh `npm run build` (BUILD_ID I8mm__YxF27lqSLKq9DgX). It exited 0 with 2360/2360 static pages. The engineer worktree is also at 9f95f7a.
- **Detectors:** the round-1 detector set was re-run on round-2 text from all 2335 prerendered pages, alongside the base and round-1 counts. Every detector had already been shown to fire on the base in round 1.
- **Interactivity:** I ran `next start` on the branch (3105) and the base (3106). Headless Chrome drove both over CDP with the extended script `qab5/cdp2.cjs`, which captures every card's id and fee after each sort and slider move.
- **Gates:** I ran `.husky/pre-commit` on a fresh staged copy of 8af7d35..9f95f7a (`scratchpad/qab5gates2`). It ended with "all checks passed", exit 0, and the hook made no extra changes.
- **Diff review:** I read eff1c32..9f95f7a in full. That covers every new sentence in the changed source files, plus every rendered sentence that differs between round 1 and round 2 (181 added, 253 removed).

## Test 1: cards. PASS

- **/universities:** all 143 cards equal `formatExactFeeShort(getExactFee)` over `getResolvableProgrammes(u)`. Each also equals the profile's "All Programs" MBA row, or shows the counsellor line when the profile has no MBA row. That is 54 published fees and 89 counsellor lines. No EMI appears beside a non-gated fee.
- **Homepage:** 6 of 6 cards match, all MBA published, with the same EMI set as round 1.
- **Changes since round 1:** only two cards changed, and nothing else lost or changed its fee text.
  - Mumbai went from "MBA total fees ₹90,000–₹2,00,000 + ₹3,750/mo" to "Total fees: Contact our counsellor for current fee details" with no EMI.
  - Madurai Kamaraj went from "₹75,000–₹1,80,000 + ₹3,125/mo" to the same counsellor line with no EMI.
- **`lib/card-fees.ts`:** `bounds()` returns min/max from the same ExactFee the text comes from. It is never null when the text is non-null (only kind `none` gives no text). For every card the computed `text` equals the gated short fee.
- **Hub card grids:** /programs/mba, /bba, /mca and /programs/mba/finance are byte-identical to the base.

## Test 2: refactor and interactivity. PASS

- **Route table:** `○ /` is 17.7 kB and `○ /universities` is 6.18 kB, both static. First Load JS shared stays at 87.4 kB.
- **Metadata:** title, description, canonical, robots and JSON-LD on / and /universities are byte-identical to the base.
- **Fees Low → High:** 54 published cards in non-decreasing gated min, from ₹50,000–₹1,20,000 to ₹3,15,000–₹3,70,000. There are 0 order violations, and all 89 no-fee cards come after them.
- **Fees High → Low:** 54 published cards in non-increasing gated max, from ₹3,15,000–₹3,70,000 to ₹52,500. There are 0 violations, and all 89 no-fee cards come last.
- **Slider at ₹1,50,000, no filter:** 120 cards show. All 89 no-fee cards are still visible. The 31 published cards shown are exactly the published cards at or under ₹1,50,000, and none above the limit shows.
- **Slider after the MCA filter (₹1,00,000):** 61 cards show, against 54 on base. No-fee cards are no longer hidden by a placeholder.
- **Unchanged from base:**
  - Search "amity" gives 1; clearing gives 143.
  - Sorting by name A–Z gives the same order.
  - The Filters panel, the MCA chip (74 cards, "MCA total fees", 0 EMI), Clear all (143) and the Enquire form all work.
  - Homepage cards animate.
  - "Speak with an Advisor" and "Check Eligibility" both open the form.
- **Console:** no hydration errors and no exceptions. The only errors are the tawk.to CORS block on localhost, the same as on base.

## Test 3: Shoolini. PASS

- The rendered counts are 0 for "MCA 2021", "SEBI and MCA", "MCA direct selling", "SEBI Collective", "SEBI MFD", "#1 Private" and the RERA FAQ.
- `shoolini-…-direct-selling-management.json:124` now reads "You want compensation plan design and network management content in an academic MBA programme."
- Remaining QS mentions are the same allowed set as round 1:
  - the Q30 highlights line (`lib/data.ts:1551`, `:1596`)
  - the "QS Ranked" chip
  - the frozen review metaDescription "QS #1 private"

## Test 4: Dr MGR. PASS

- **Rendered Dr MGR pages:** the scan covers 9 pages: the profile, the MBA hub, 6 spec pages and /verify. Own-fee figures and fee-direction phrases are 0 on every one. The patterns were ₹/Rs 1,36,000, 1,41,000, 1.36L, 1.41L, 1.41 lakh, 35,250, "cheaper", "lower fee", "wins on fee", "more expensive", "more/most affordable", "at a lower", "less expensive" and "fee difference".
- **Source:** the same patterns are 0 in all 7 Dr MGR JSONs. The fee sections now render the counsellor line.
- **`lib/data.ts` (e5c612c):** only the `tagline`, `description` and one `forWho` string changed. `feeMin: 136000`, `feeMax: 141000` and programDetails are untouched (`lib/data.ts:4408-4409`). The edits were:
  - removed "Total fees ₹1.41L" and "(₹1.41L total)"
  - turned the two em dashes into a colon and a comma
  - changed "One of Chennai's top" to "Chennai NAAC A+ deemed university", which is a neutral wording
- **Fee gates:** verify-fees reports OK: 143 universities in lib/data.ts, 143 in the fees hub, 0 new mismatches. check-hub-fee-text reports 0 figures.
- **Advisory A (pre-existing, not changed by this batch):** /fees still prints Dr MGR as "MBA ₹1.36L – ₹1.41L ₹6K/mo", identical to base. The fees hub and lib/data.ts agree, which is all verify-fees checks, but the hub publishes a fee that the profile and spec pages suppress. Queue it for Rishi.
- **Advisory B:**
  - `dr-mgr-…-operations-management.json` about.body now has an empty "\n\n\n\n" gap where the fee sentence was. The page is noindex.
  - `…-human-resource-management.json` heading "vs Uttaranchal Online MBA HR (Rs 99,600)" shows Uttaranchal's after-scholarship net on its own; the gated short fee is ₹1,48,000. This is pre-existing and the page is noindex.

## Test 5: Kurukshetra. PASS

- "central" on Kurukshetra pages now appears only in "government job applications at central and state levels", which is fine.
- `kurukshetra-university-online-mba.json:66` now reads "Placement support at Kurukshetra University Online is primarily alumni networking…".
- No new claim was added. "Private Equity and Wealth Management in Finance" was already in the file at eff1c32.

## Test 6: exclusivity. PASS

- **Rendered counts, base → round 1 → round 2:**
  - "unique": 225 → 216 → 171
  - "extremely rare": 10 → 9 → 2. One is the toughest-exams post (unrelated); the other is Integral's, scoped "on edifyedu.in".
  - "no direct peer": 6 → 5 → 0
  - "no comparable peer": 2 → 2 → 0
  - "India's only": 7 → 2 → 1, the homepage self-claim, which is pre-existing and out of scope
  - "is one of them": 1 → 1 → 0
  - "rarest" and "India's only NAAC A++" stay at 0
- **The 7 listed files:** "unique", "extremely rare", "no direct/comparable peer", "virtually no", "almost no", "one of the very few", "functionally unique" and "most unique" are all 0 in source.
- **BVP dangling sentence:** gone from rendered text and source.
- **Jamia empty bullet:** gone. The next bullet ("If budget is Rs 1.56 to 1.84 lakh: …") renders normally.
- **pairs.ts:** two FAQ answers lost "unique" and "one of the few" and are otherwise unchanged.
- **Amrita AI:** "highest-demand", "strongest credential available" and "only 4 central" are 0. The new line "NAAC A++ is the highest grade on the NAAC scale" is true.

## R2-DPU: DPU agri and sibling pages. FAIL

**Fixed:** "Symbiosis at approximately ₹1,70,000 with NAAC A", "DPU wins on NAAC grade (A++ vs A)" (vs Symbiosis) and "DPU holds stronger NAAC (A++ vs A)" (vs JAIN) are all 0.

**Still correct:** the remaining "A++ vs A+" comparisons against CU and Shoolini (both A+ in lib/data.ts).

**FAIL:** `lib/data/page-content/dr-dy-patil-vidyapeeth-online-mba-business-analytics.json:66`. This file was edited in this round and the page is `index, follow`. It still says:

> "LPU at approximately ₹2,00,000 … DPU at ₹1,89,400 saves ₹10,600 with stronger NAAC (A++ vs A+) and NIRF (#41 vs unranked for LPU management)."

LPU is NAAC A++ (`lib/data.ts:714`) and NIRF Management 44 (`:712`). The ₹10,600 is a derived gap.

The same defect, untouched by this round and on indexed pages:
- `dr-dy-patil-vidyapeeth-online-mba-finance.json:66`: "DPU at ₹1,89,400 saves ₹10,600 with stronger NAAC (A++ vs A+) and NIRF positioning."
- `dr-dy-patil-vidyapeeth-online-mba-hospital-administration-healthcare-management.json:66`: "DPU at ₹1,89,400 saves ₹10,600 with substantially stronger credentials: NAAC A++ (vs A+), NIRF University #41 (vs unranked), and NIRF #12 Medical." LPU is NIRF University 31, not unranked.

## R2-SMU: SMU "most affordable". PASS for Finance

- The SMU Finance page has 0 "most affordable" and 0 "unique".
- **Advisory, recommend the same pass before or right after merge:** the five sibling SMU spec pages still say "Most affordable UGC-DEB approved … MBA in India" and "the most affordable NAAC A+ … MBA in India/available". That is 25 hits across text and FAQ LD on healthcare, human-resources, marketing, operations-supply-chain-management and systems-it-management.
  - These five files were edited in this round, though only "(unique regional scholarship)" was removed.
  - The claim is false on our own data: Galgotias A+ is ₹80,200 and Vignan A+ is ₹90,000.
  - The "Rs 84,000 net" figure on SMU pages is derived as 30% off ₹1,20,000. It is pre-existing and should be flagged for the fee rule.

## Test 7: salary. PASS

- **Gone from rendered pages:** "highest-paying HR sub-functions", "highest-paying MBA specialisation" and any "highest-paying" on /universities pages (93, ~94 and 187 pages in round 1). The finance editorialGuide "highest-paying" is also removed.
- **Round-1 removals still at 0.** "detailed syllabus and career scope." remains on 317 pages.
- **/programs/mba/specializations/*:** unchanged.
- **Left by the engineer (advisory):**
  - BBA `salaryNote` at lib/content.ts:345 and the B.Com "highest-paying B.Com career path" at :619 are outside MBA scope.
  - Blog salary posts keep their pay lines.
  - The BITS "one of India's top-5 engineering and science universities" was removed from strategy-consulting but still renders on 5 other BITS spec pages.

## Test 8: regression. PASS

- **Pages:** 2335 in both builds.
- **Head tags:** 0 titles, 0 meta descriptions, 0 canonicals and 0 robots changed against the base.
- **JSON-LD:** changed on 58 pages. 24 are dateModified only; 34 are intended FAQ/answer edits.
- **Blog dates:** 31 posts have updatedAt 2026-11-25. check-blog-updated-at reports "31 post(s) with content changes, all dated".
- **Sitemap:** every changed data/sitemap-lastmod.json entry is 2026-11-25.
- **JSON:** 65 of 65 changed .json files parse, and check-page-content-json reports 431 OK.
- **Gates and baselines:**
  - `.husky` and `scripts/` are unchanged.
  - data/blog-fee-baseline.json went 2021 → 2020, and the em-dash baseline drops `app/page.tsx`. Both are the same as round 1 and both go down only.
  - data/fee-mismatch-baseline.json is unchanged.
  - New and changed TSX files have 0 em dashes.
- **Pre-commit on the staged copy, all passed (exit 0):**
  - verify-fees OK
  - em-dash baseline unchanged at 229
  - fee-baseline at 205
  - blog-fees at 2020
  - protected-pages OK (8 frozen posts)
  - naac-consistency 0 mismatches
  - hub-fee-text at 0
- **Diff read:**
  - Every round-2 edit is a deletion or a neutral rewording. No new figure, grade, rank or superlative.
  - Figures that look new are already present at eff1c32: SMU Rs 84,000, IIFT "approximately Rs 2,25,000", UPES "Rs.50K more", SASTRA "Rs 60K-2.4L", Dr MGR hub "Amrita … Rs 1,20,000".
  - No ungrammatical or dangling sentence except the cosmetic "\n\n\n\n" in Advisory B.

## Fix required (then a short re-check of these 3 pages)

In each file, delete the LPU fee gap and the false grade and rank comparison. Keep the rest of the sentence.

1. `lib/data/page-content/dr-dy-patil-vidyapeeth-online-mba-business-analytics.json:66`
   - Replace: `DPU at ₹1,89,400 saves ₹10,600 with stronger NAAC (A++ vs A+) and NIRF (#41 vs unranked for LPU management). DPU wins on accreditation credentials.`
   - With: `DPU is at ₹1,89,400. Both hold NAAC A++.`
2. `lib/data/page-content/dr-dy-patil-vidyapeeth-online-mba-finance.json:66`
   - Replace: `DPU at ₹1,89,400 saves ₹10,600 with stronger NAAC (A++ vs A+) and NIRF positioning.`
   - With: `DPU is at ₹1,89,400. Both hold NAAC A++.`
3. `lib/data/page-content/dr-dy-patil-vidyapeeth-online-mba-hospital-administration-healthcare-management.json:66`
   - Replace: `DPU at ₹1,89,400 saves ₹10,600 with substantially stronger credentials: NAAC A++ (vs A+), NIRF University #41 (vs unranked), and NIRF #12 Medical.`
   - With: `DPU is at ₹1,89,400 and holds NIRF #12 Medical.`
   - Also check whether that paragraph still names the NAAC grade correctly.

For the fixing session: use "vs A+)" and "vs unranked" as detectors across all DPU JSONs, and compare each peer against lib/data.ts. ₹1,89,400 is DPU's gated MBA fee, and LPU's gated fee is ₹2,00,000.

## Evidence (scratchpad, not committed)

All under C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/:
- Build and gate logs: qab5r-branch-build.log, qab5r-precommit.log
- Extracted round-2 text: qab5/branch2.json
- Detector counts: qab5/det-branch2.txt
- Card lists: qab5/cards-r2-unis.txt, qab5/cards-r2-home.txt
- Gated fees and card fees at 9f95f7a: qab5/fees-r2.jsonl
- Interactivity runs: qab5/cdp2-branch.json, qab5/cdp2-base.json
- Diffs: qab5/pagediff-r1r2.txt, qab5/pagediff-r2-base.txt, qab5/newsent-r2.txt
- Worktrees: qab5base (8af7d35), qab5branch (9f95f7a), qab5gates2 (staged 8af7d35..9f95f7a)
- Round-1 `.next`: kept at qab5branch-next-eff1c32


---

## Round 3 (736d63e): targeted re-check

Date: 2026-11-25. Commit 736d63e, built in the engineer worktree. The commit is stamped 11:44:49 and the `.next` BUILD_ID file at 11:47; the working tree was clean. I extracted 2335 pages from that build into `qab5/branch3.json` and compared them against round 2 (`qab5/branch2.json`, 9f95f7a) and the base (`qab5/base.json`, 8af7d35).

### Overall merge verdict, round 3: PASS

The round-2 blocker is fixed and all four checks pass. One derived DPU fee gap is still live. It predates the branch and is a recommended one-line follow-up, not a blocker (see R3-A1).

| # | Check | Result |
|---|---|---|
| 1 | Detectors on the built DPU (24) and SMU (12) pages | PASS |
| 2 | Replacement sentences true against lib/data.ts, grammatical, nothing dangling | PASS |
| 3 | Diff scope; whole-site visible text changes only on DPU and SMU pages; head tags unchanged | PASS |
| 4 | `.husky/pre-commit` on a staged copy of 8af7d35..736d63e | PASS |

### 1. Detectors. PASS

Plain-substring counts over text, description and JSON-LD on every `/universities/dr-dy-patil-vidyapeeth-online*` and `/universities/sikkim-manipal-university-online*` page. The script is `qab5/det3.mjs` and the output is `qab5/det-r3.txt`. Every detector fired on 9f95f7a (and on the base) before I trusted the round-3 zero.

| Detector | base | r2 (9f95f7a) | r3 (736d63e) |
|---|---|---|---|
| DPU "vs unranked" | 3 | 3 | **0** |
| DPU "saves ₹" | 9 | 9 | **0** |
| DPU "does not hold NIRF" | 2 | 2 | **0** |
| DPU "approximately ₹1,80,000" (NMIMS/JAIN) | 5 | 5 | **0** |
| DPU "A++ vs A+) and NIRF" / "(vs A+), NIRF" / "A++ vs unranked" | 2 / 1 / 1 | 2 / 1 / 1 | **0 / 0 / 0** |
| DPU "10,600" / "30,600" / "34,600" | 3 / 3 / 1 | 3 / 3 / 1 | **0 / 0 / 0** |
| DPU "54,600" | 3 | 3 | **1** (see R3-A1) |
| SMU "most affordable NAAC A+" | 24 | 20 | 2 (both "from a Manipal Group institution", true, see below) |
| SMU "in India at Rs 1,20,000" | 5 | 4 | **0** |
| SMU "most affordable UGC-DEB" | 1 | 0 | 0 |
| SMU "84,000 net" / "Rs 84,000" / "net fee" | 14 / 29 / 15 | 14 / 29 / 15 | **0 / 0 / 0** |
| SMU "unmatched on value" | 2 | 2 | **0** |

The single remaining "84,000" hit on the SMU marketing page is MUJ's "Rs 1,56,400-1,84,000". It is a false positive.

### 2. Replacement sentences. PASS

All checks are against lib/data.ts at 736d63e, which round 3 did not change.

| Sentence | Peer named in the paragraph | lib/data.ts | Verdict |
|---|---|---|---|
| "DPU is at ₹1,89,400. Both hold NAAC A++." (business-analytics, finance, hospital admin; LPU paragraph) | LPU | DPU A++, feeMin = feeMax 1,89,400; LPU A++ (`:714`) | true |
| "Both hold the same NAAC grade." (finance; Amrita paragraph) | Amrita | A++ / A++ | true |
| "DPU is at ₹1,89,400 with the same NAAC grade." (fintech; Amrita paragraph and FAQ) | Amrita | A++ / A++ | true |
| "NMIMS carries legacy brand weight in the banking and finance sector. Both hold NAAC A++." (finance body and FAQ) | NMIMS | NMIMS A++ (nirf 52, nirfMgt 24) | true |
| "You want a NAAC A+ … MBA at Rs 1,20,000 flat." (5 SMU pages) | SMU | A+, feeMin = feeMax 1,20,000 | true |
| "qualify for the regional scholarship." (6 SMU pages) | SMU | the 30% Northeast scholarship is still described in the FAQ answer above it | true, neutral |
| "JAIN covers AI and business intelligence." / "Both are competitive in this segment." (DPU AI-ML, blockchain, BA) | JAIN | no figure or grade asserted | neutral |

Context reads:
- **Grammar:** every rendered paragraph reads correctly. The NMIMS FAQ ("How does DPU Finance compare to NMIMS Finance?") now answers with the brand point, the shared grade and one "Choose NMIMS if…" line. That is shorter than before but complete.
- **Business-analytics JAIN paragraph:** it is now a heading and one sentence, "Both are competitive in this segment." Thin, but not dangling.
- **Leftover whitespace:** the SMU HR, operations and IT about bodies have a "\n\n " gap with a leading space where the removed paragraph was. It collapses in the rendered text, so it is cosmetic only.
- **Manipal Group superlative:** the SMU healthcare and marketing pages keep "SMU is the most affordable NAAC A+ … MBA from a Manipal Group institution". That is true on our data: MUJ is A+ at ₹1,56,400 and up, and MAHE is A++ at ₹2,92,000. The FIX-LOG records keeping it on purpose.

### 3. Scope and regression. PASS

- **Diff 9f95f7a..736d63e (14 files):**
  - 6 DPU spec JSONs: AI-ML, blockchain, business-analytics, finance, fintech, hospital admin. The coordinator's message said 5.
  - 6 SMU spec JSONs.
  - `audits/FIX-LOG.md`.
  - `data/sitemap-lastmod.json`: three DPU routes moved 2026-11-18 → 2026-11-25. This is the expected lastmod bump for the edited pages.
  - Nothing else changed: no lib/data.ts, components, scripts or .husky.
- **Visible text across the site (r2 vs r3):** pages 2335 / 2335, none added or removed. Text changed on 12 pages, all 6 DPU and 6 SMU pages above. JSON-LD changed on 9 of them (FAQ answers).
- **Head tags:** title, description, canonical and robots changes are all 0.
- **Indexing and lastmod:** all 12 changed pages are `index, follow` and carry lastmod 2026-11-25.
- **Diff contents:** 15 distinct sentences added and 39 removed (`qab5/pagediff-r2r3.txt`). Every addition is a shortened form of a removed sentence or one of the true statements above. No new figure, grade, rank or superlative appears.

### 4. Gates. PASS

I staged 8af7d35..736d63e into `scratchpad/qab5gates2` (81 files; the index equals the 736d63e tree) and ran `sh .husky/pre-commit`. Exit 0, "all checks passed", and the hook left no unstaged changes. Log: `scratchpad/qab5r3-precommit.log`.

| Gate | Result |
|---|---|
| verify-fees | OK, 0 new mismatches, 5 allowlisted |
| em-dash baseline | unchanged, 229 |
| fee-baseline | unchanged, 205 |
| blog-fees | unchanged, 2020 |
| protected-pages | 8/8 OK |
| naac-consistency | 0 mismatches |
| page-content-json | 431 OK |
| page-content-facts | self-test 4/4, OK |
| hub-fee-text | 0 |
| check-blog-updated-at | 31 dated |
| nirf-category | OK |
| sitemap, redirect and 404 gates | OK |

### Round 3 advisories (not blocking)

- **R3-A1: derived fee gap still on an indexed DPU page.**
  - Where: `lib/data/page-content/dr-dy-patil-vidyapeeth-online-mba-artificial-intelligence-machine-learning.json:100` (Choose-This-If list), rendered on /universities/dr-dy-patil-vidyapeeth-online/mba/artificial-intelligence-machine-learning (index, follow).
  - Text: "₹1,89,400 with zero-cost EMI fits your budget, ₹54,600 less than Amrita's AI MBA."
  - Why it matters: it is the same computed ₹54,600 gap that round 3 removed twice elsewhere on this page. The FIX-LOG says the "54,600" lines are gone. It predates the branch (present at 8af7d35), so it is not a regression.
  - Recommended fix: change it to "₹1,89,400 with zero-cost EMI fits your budget." in the same branch or the next batch.
- **R3-A2: SMU healthcare vs SSODL.** It says "SMU is significantly cheaper for comparable NAAC A+ credentials". SSODL is NAAC A++ in lib/data.ts, so "comparable NAAC A+" understates Symbiosis's grade. This predates the branch.
- **R3-A3: DPU fintech wording.** It keeps "Choose DPU for the fee saving with NAAC A++" (body and FAQ).
  - Amrita's MBA range in lib/data.ts is ₹1,76,000 to ₹2,60,000. Its floor is below DPU's ₹1,89,400, so a saving is not certain against every Amrita plan.
  - There is no figure in the line, so the risk is low. Consider "Choose DPU if fee and NAAC A++ matter more."
- All round-2 advisories that round 3 did not address still stand: the /fees Dr MGR row, BITS "top-5", the Dr MGR HR Uttaranchal net, BVP event "NAAC A+", the BBA/B.Com pay lines, and blog "highest-paying".

### Round 3 evidence

All under `C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/`:
- Extract and detectors: qab5/branch3.json, qab5/det3.mjs, qab5/det-r3.txt
- Text diff: qab5/pagediff-r2r3.txt
- Gates: qab5r3-precommit.log; staged worktree qab5gates2
