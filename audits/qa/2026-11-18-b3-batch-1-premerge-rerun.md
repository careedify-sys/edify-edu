# QA pre-merge rerun: B3 batch 1 (fix/b3-batch-1 @ 6dc820d, on 0703326, base 1021c26 = origin/main, live)

Checked 2026-11-18 by qa-checker. Worktree: `.claude/worktrees/agent-a1d5d379a0da08837`. The first QA report is `audits/qa/2026-11-18-b3-batch-1-premerge.md`.

**Builds compared**

- **After:** a fresh `npm run build` of 6dc820d in the worktree. Nothing else was building. It exited 0 with 2,360/2,360 static pages, and I served it with `next start -p 3125`.
- **Before:** the existing production build of 1021c26 in the scratchpad, served with `next start -p 3126`.

**Cleanup:** I restored the prebuild CRLF-only churn on 12 generated files with `git checkout`, and confirmed it was whitespace-only first. Both servers are stopped (PIDs 17396 and 37076). The worktree is clean at 6dc820d. I changed no code.

**Method for sweep searches:** every search below was first proven to hit on 0703326, using `git grep -F -o` on 1021c26, 0703326 and 6dc820d over `lib`, `components`, `app` and `data/fees-hub-data.json`. I then counted the same strings in the visible text of all 2,335 built HTML files, base build against branch build.

## Overall: FAIL

F1 and F3 are closed. Most of F2 is closed. The batch still fails for three reasons:

1. **DSU still renders as "NAAC A++".** It shows on 3 blog posts and on 1 BITS spec page.
2. **JAIN still has the withdrawn AI tracks and "19 specialisations".** These render on `compare/jain-vs-lpu`, `compare/amity-vs-jain` and `/programs/mba`. FIX-LOG says both are done.
3. **The new BITS review FAQ double counts.** It says Semester 1 is ₹93,100 "plus" the ₹18,500 and ₹1,500 one-time fees, which contradicts the ₹3,12,400 total in the same answer.

Several of the remaining DSU and JAIN hits were not listed in my first report. My first sweep missed them, so the engineer had no list to work from. They still fail now because the batch's own FIX-LOG says these claims are gone from the site, and the pages are indexable.

| # | Check | Result |
|---|---|---|
| 1 | F1 JAIN ai-* pages: title, H1 and meta identical to base; hub tiles | **PASS** |
| 2 | F2 sweep, each failure closed | **FAIL** (F2a, F2f/F2g remnants; F2h FIX-LOG still inaccurate) |
| 3 | F3 new EMI wording invents nothing | PASS (advisory on wording) |
| 4 | Two blog copy edits are true per `lib/data.ts` | PASS |
| 5 | Title, H1 and meta for all six universities' pages and the JAIN ai-* pages, against base | PASS |
| 6 | 308s still hold | PASS |
| 7 | A8/A9 and D4 intact | PASS |
| 8 | Gates pass, nothing loosened, baselines only down | PASS |
| 9 | New defect introduced by 6dc820d | **FAIL** (BITS FAQ double count, R3) |

---

## 1. F1: JAIN ai-* pages (PASS)

**Titles, H1s, meta, canonical and robots**

- I compared base against branch for all 152 built HTML files under the six universities' directories, which includes all 4 JAIN `ai-*` spec pages.
- Exactly 1 changed: the Galgotias MBA hub meta dropped "(₹3,342/mo EMI)". That is a false derived EMI the sheet removes, and the hub is not frozen, so the change is allowed.
- The 6 profile pages, fetched separately, are byte-identical in all five fields.
- `jain-university-online/mba/ai-for-marketing`, `ai-for-human-resources` and `ai-for-international-finance` all read "same". The "AI For" title-casing is gone; it has 0 visible hits site-wide.

**JAIN hub**

- The JAIN MBA hub now has 16 unique `/universities/jain-university-online/mba/` hrefs (base had 19).
- It has 0 links to the 3 withdrawn slugs, and its header says "16 Specialisations".
- 0 related-spec links to the 3 slugs remain on the other JAIN spec pages I fetched.

**Other**

- The 3 JAIN `ai-*` pages still return 200, as Q35 intends.
- Q35 is filed in the main checkout's QUESTIONS-FOR-RISHI.md, which is uncommitted there.

## 2. F2 sweep (FAIL)

**Closed, with source and visible counts:**

| Item | 0703326 source | 6dc820d source | Visible on branch |
|---|---|---|---|
| SSODL "NIRF Management 11" | 6 | 0 | 0 |
| DSU "EMI ... 5,000 to ₹6,000" / "5,000–6,000" | 1 / 1 | 0 / 0 | 0 (the one "5,000-6,000" left is UU Doon) |
| DSU "seven tracks", "not easily available" | n/a | n/a | 0 / 0 (were 1 / 1 on base). "Seven specializations" left: 1, in the Vignan review, which is correct for Vignan |
| DPU "7,890" | 17 | 15 (none DPU) | 0 |
| DPU 11 to 14% interest row | present | DPU row now "Not published / No Cost EMI / Not published" | the remaining "11 to 14 percent" rows are Amity and D.Y. Patil Navi Mumbai |
| DPU ₹2,500/month in spec JSONs | 26 | 1 (not DPU) | 0 on DPU pages |
| Symbiosis "₹6L to ₹10L" / "₹6L - ₹10L" | 3 / 1 | 0 | 0 |
| Symbiosis and BITS salary cells in online-mba-with-placement | present | "Not published" | rendered as "Not published" |
| "78,750", "61% more", "1,19,000" | 3 / 1 / 1 | 0 | 0 |
| JAIN "20-plus specialisations", "18 (highest in India)", "17+ specialisations" | 12 / 1 / present | 4 (none JAIN) / 0 / 0 | 0 / 0 / 0 |
| "12 to 24 month plans", "via partner banks" (F3 text) | 2 / 5 | 0 / 3 (unrelated) | 0 / 0, from 20 / 20 on base |
| Galgotias "Analytics & IT" | 1 | 0 | 0 |
| JAIN coupon "19 specializations" | present | "16 specializations" | rendered "16" |

**Not closed (all rendered, all indexable):**

### R1. DSU still "NAAC A++" (F2a). DSU is A+ in `lib/data.ts`.

| Page | Source | Rendered text |
|---|---|---|
| `/blog/mba-fees-india-complete-guide-2026` | `lib/blog.ts:8520` | "Dayananda Sagar University Online \| Total: Rs 1,30,000 \| Per semester: Rs 32,500 avg \| NAAC: A++" |
| `/blog/galgotias-online-mba-review` | `lib/blog.ts:29159` (comparison table row) | "DSU Online \| Rs. 1,30,000 \| A++ \| Bengaluru, A++ grade" |
| `/blog/shoolini-online-mba-review` | `lib/blog.ts:30099` (comparison table row) | "DSU Online \| Rs. 1,30,000 \| A++ \| A++ grade, Bengaluru brand" |
| `/universities/bits-pilani-work-integrated-online/mba/digital-transformation` | `lib/data/page-content/bits-pilani-work-integrated-online-mba-digital-transformation.json:99` | "DSU Digital Marketing MBA at Rs 1,30,000 (NAAC A++)" |

- All four are present on 1021c26, 0703326 and 6dc820d. I found them with a visible-text scan for "A++" within 110 characters after "Dayananda Sagar" or "DSU", across all 2,335 pages; the branch has 21 such hits in total.
- The other hits are correct:
  - DSU shown as A+ next to an A++ peer;
  - the CSJMU tables, where the A++ belongs to CSJMU;
  - "DPU has NAAC A++".
- **Fix:** in each of the four, change the DSU cell or phrase to "A+". For the two table rows, change the last cell to "Bengaluru, A+ grade" and "A+ grade, Bengaluru brand". `lib/blog.ts:8520` sits in a fee-bearing paragraph. Change only "A++" to "A+" and keep the rest verbatim, so check-blog-fees still MATCHes.
- **Also on the BITS JSON line:** DSU's spec list has no Digital Marketing track; the "eight electives" in the DSU review do not include it. The sentence is wrong twice. Delete it, or name an actual DSU track.

### R2. JAIN withdrawn AI tracks and "19 specialisations" (F2f/F2g). FIX-LOG says "The removed AI tracks are gone from pairs.ts" and "'19' ... counts are 16". They are not.

| Page | Source | Rendered text |
|---|---|---|
| `/compare/jain-vs-lpu` | `app/compare/[pair]/pairs.ts:231` (FAQ 1) | "JAIN has 19 specialisations including AI-focused dual specs." |
| `/compare/jain-vs-lpu` | `pairs.ts:236` (verdictA) | "You want AI-specific MBA specialisations (AI for Finance, Marketing, HR)" and "You want 19 specialisations including dual-domain AI specs" |
| `/compare/amity-vs-jain` | `pairs.ts:247` (FAQ) | "Both offer 19 specialisations. JAIN includes unique AI-focused dual-domain specs." |
| `/compare/amity-vs-jain` | `pairs.ts:251` (verdictB) | "AI-focused MBA specs (AI for Finance, Marketing, HR) match your goals" |
| `/programs/mba` | `components/MBAHubClient.tsx:35` | JAIN bestFor "19 specialisations with ACCA integration" |

- Both compare pages render `index, follow` and are in the sitemap.
- Only the third FAQ on jain-vs-lpu (`:233`) was fixed.
- **Fix:**
  - `:231`: "JAIN has 16 specialisations, including AI for Finance and Data Science and Artificial Intelligence."
  - `:236`: "You want an AI-linked MBA specialisation (AI for Finance, or Data Science and Artificial Intelligence)" and "You want 16 specialisations to choose from".
  - `:247`: "JAIN offers 16 specialisations and Amity offers 19. JAIN includes AI for Finance and Data Science and Artificial Intelligence. Amity includes niche tracks like Insurance and Hospitality."
  - `:251`: "AI-linked MBA specs (AI for Finance, Data Science and AI) match your goals".
  - `MBAHubClient.tsx:35`: "16 specialisations".
  - Amity's 19 is outside this batch; leave it.
  - check-compare-pair-urls and check-compare-inbound-links must stay green. Neither depends on FAQ text.

### R3. FIX-LOG accuracy (F2h), minor

- FIX-LOG says the 8 remaining ₹1.19L instances in nmims-vs-symbiosis were "removed". One remains, as a rendered H2 (it also renders in the TOC): `lib/blog.ts:44624` reads "Fees Breakdown: What Does ₹1.19 Lakh More Buy You?"
- The arithmetic is consistent (3.15L minus 1.96L).
- **Fix:** either reword the H2 without the number ("What Does the Higher Symbiosis Fee Buy You?"), or correct the FIX-LOG sentence to say one heading keeps the derived figure.

## 3. New defect from 6dc820d: BITS fee FAQ double counts (FAIL)

- **Where:** `lib/blog.ts:37640`, in bits-pilani-online-mba-review-2026, the FAQ "What is the fee for BITS Pilani WILP Online MBA in 2026?"
- **What it now says:** "Total programme fee is ₹3,12,400 all-in. Semesters 2 to 4 are ₹73,100 each and Semester 1 is ₹93,100, plus a one-time ₹18,500 admission fee and a ₹1,500 application fee."
- **Why it is wrong:**
  - The verify sheet row "Fee components" lists Sem 1 Rs 93,100 and Sems 2 to 4 Rs 73,100. 93,100 + 3 × 73,100 = 3,12,400.
  - So the Sem 1 figure already contains the 18,500 and 1,500 (73,100 + 20,000 = 93,100).
  - Read with "plus", the parts sum to ₹3,32,400 and contradict the ₹3,12,400 in the same answer.
  - The old text (73,100 × 4 plus the one-time fees) was internally consistent.
- The post is frozen only for title, H1 and meta, so the FAQ body is editable.
- **Fix:** "Total programme fee is ₹3,12,400 all-in. Semester 1 is ₹93,100 and Semesters 2 to 4 are ₹73,100 each. The one-time ₹1,500 application fee and ₹18,500 admission fee are listed separately on the BITS fee page." That reproduces the sheet's published lines, with no "plus" and no sum. Re-run check-blog-fees after the edit (see the fee-gate phrasing note in memory).

## 4. F3: new EMI wording (PASS, advisory)

- `components/UniversityPageClient.tsx` now prints "📋 Current fee breakdown and payment options for {abbr}, confirmed with the university" when `emiFrom` is 0.
- It renders inside the locked "Fee, EMI and Scholarship Details" card as an item the advisor will provide. It states no EMI scheme, tenure, lender or figure, so it invents nothing about the university.
- `GatedContent.tsx`'s default hint has the same wording. Its default renders 0 times.
- **Scope:**
  - The line now renders on 25 profiles. The 20 profiles that printed "No-cost EMI, 12 to 24 month plans via partner banks" on base now print 0 of it.
  - 19 of the 25 are outside this batch's six. The change only removes an unsourced claim, but the visible text of those profiles changed.
- **Advisory:** `{abbr}` prints internal codes, such as "BPWIL", "DDPVP", "GUO", "NIUO", "DSUO" and "SUO". These read like typos to a student. Consider `u.name`, or drop the "for {abbr}" clause.
- **Gated Total Fee:**
  - Profiles now print a single figure when min equals max: Galgotias "₹80K", BITS "₹3.1L", DSU "₹1.3L" and DPU "₹1.9L". Symbiosis and JAIN keep their ranges.
  - **Advisory:** the `/universities` listing card is a different component, and it now prints "Total fees ₹80K – ₹80K" for Galgotias (base: "₹80K – ₹86K"). The same degenerate style already existed on base for other universities (for example "₹1.2L – ₹1.2L"), so this is not blocking.

## 5. The two blog copy edits (PASS, true per `lib/data.ts`)

**mba-hr-management-online-india-2026: "All are NAAC A or above"**

- The group is:

  | University | NAAC grade |
  |---|---|
  | Galgotias | A+ |
  | Vignan | A++ |
  | Kurukshetra | A++ |
  | ARKA JAIN | A |
  | Sikkim Manipal | A+ |
  | NIU | A+ |
  | DSU | A+ |

- The lowest grade is A, so the claim is true.

**online-mba-entrepreneurship-india-2026: the unsourced ₹1,65,000-₹1,96,000 range was removed.** The replacement and nearby lines are:

- "Chandigarh and JAIN sit in the middle of the range".
  - The range is ₹1,30,000 (DSU) to ₹2,25,000 (Amity).
  - CU's net fee is ₹1,75,125, and the post's own JAIN H3 is "₹1,75,000 to ₹1,96,000".
  - Both sit between the two ends, so the statement is true and carries no new number.
- The same post now says "DSU holds NAAC A+ accreditation" and "If budget is tight and you want a NAAC A+ brand: DSU Online at ₹1,30,000". Both are true (my word-diff reading of "A++" was a tokenization artefact).

**online-mba-business-data-analytics-india-2026:** "All three are NAAC A+ or A++ rated". The three are Galgotias (A+), Vignan (A++) and Kurukshetra (A++), so it is true.

## 6. 308s (PASS)

| URL | Branch | Base build |
|---|---|---|
| /programs/mba/ai-for-marketing | 308 → /programs/mba | 200 |
| /programs/mba/ai-for-human-resources | 308 → /programs/mba | 200 |
| /programs/mba/ai-for-international-finance | 308 → /programs/mba | 200 |

## 7. A8/A9 and D4 (PASS)

- **A9:** the 12 A9 needles over all 1,786 `universities/**` pages are 0 raw and 0 visible.
- **BITS DEB needles:** 0, except "UGC DEB Approved" and "UGC-DEB approved", each 22 raw and 0 visible. These are the same footer and schema hits as before.
- **D4 hub counts, unchanged from base and the first report:**

  | Hub | Figure | Count |
  |---|---|---|
  | NIU | ₹1,18,000 | 32 |
  | Alliance | ₹1,74,000 | 39 |
  | Alliance | ₹8,700 | 4 |
  | Sharda | ₹1,50,000 | 45 |
  | JIIT (`jaypee-university-online`) | ₹1,75,000 | 25 |
  | JIIT (`jaypee-university-online`) | ₹5,850 | 9 |

- **Rendering, 6 profiles and 6 MBA hubs:** all return 200, with 1 H1 each and 8 to 11 JSON-LD blocks with 0 parse errors. Each has 0 "undefined", 0 "NaN" and 0 bare "₹0".

## 8. Titles across the site (PASS)

- Over 350 built pages under `blog`, `compare`, `programs` and `coupons`, base against branch, only 3 meta descriptions changed. They are the same 3 the first report allowed:
  - dsu-online-mba-review: A++ → A+
  - jain-vs-amity: dropped "19 specialisations each"
  - nmims-vs-symbiosis: "#11" → "University #24"
- None of the 3 is frozen.
- No title or H1 changed anywhere. The 8 frozen posts pass check-protected-pages.

## 9. Gates (PASS)

- `bash .husky/pre-commit` in the clean worktree exited 0 and ended "pre-commit: all checks passed". All 46 checks ran, including:
  - check-blog-fees: "2024 unverified, unchanged from baseline";
  - check-protected-pages: "8 protected paths and 8 frozen posts";
  - check-nirf-category: OK.
- 1021c26..6dc820d touches nothing under `scripts/` or `.husky/`, and no allowlist or ranges file.
- The only baseline file is `data/blog-fee-baseline.json`, and every change went down: `totalUnverified` 2026 → 2024, `dsu-online-mba-review` 7 → 6, `nmims-vs-symbiosis-online-mba-2026` 12 → 11.
- **House rules:** 0 em dashes added or removed in 0703326..6dc820d. No new official-site hostname was added. The `galgotiasonline.edu.in` text occurs 10 times on all three commits.
- Nothing under `app/admin`, `app/api/cms` or `blog/write` was touched.

## Remaining advisories (not blocking)

- **DPU derived "₹47,350" per-semester cells** remain in 4 spec-roundup posts and the dy-patil review: mba-hr-management, online-mba-business-data-analytics, online-mba-hospital-healthcare-management, online-mba-supply-chain-management. FIX-LOG scopes its claim to "the fee guides", which are clean. DPU publishes 50,000/50,000/45,000/44,400.
- **DSU "₹32,500 avg"** remains in mba-fees-india, mba-hr and online-mba-business-data-analytics. It is labelled "avg" and is arithmetic on the published total.
- **Other ₹1.19L lines.** `lib/blog.ts:6309` (nmims-online-mba-review) and `symbiosis-university-online-mba.json` (the "Rs.1.19L less" peer line) carry the same derived ₹1.19L gap.
- **Galgotias eligibility on BBA/BCA/MCA pages.** The "Graduation pass" leak onto those pages, from the first report, is unchanged.

## Required before merge

1. **R1:** set DSU to A+ at `lib/blog.ts:8520`, `:29159` and `:30099`, and in `bits-pilani-work-integrated-online-mba-digital-transformation.json:99`. Also fix the nonexistent "DSU Digital Marketing MBA" there.
2. **R2:** remove the withdrawn AI tracks and set JAIN to 16 in `app/compare/[pair]/pairs.ts:231`, `:236`, `:247` and `:251`, and in `components/MBAHubClient.tsx:35`.
3. **BITS FAQ (section 3):** remove the "plus" double count.
4. **R3:** fix the ₹1.19L H2 at `lib/blog.ts:44624`, or correct the FIX-LOG sentence. Also correct the FIX-LOG sentences for "AI tracks gone from pairs.ts", "'19' counts are 16" and "DSU A+ ... in 5 blog posts".

Re-run after these: a visible-text scan for "A++" within about 110 characters after DSU or Dayananda Sagar (expect 0 DSU-owned hits); "AI for Finance, Marketing, HR", "AI-focused dual", "dual-domain AI" and JAIN "19 specialisations" (expect 0); and check-blog-fees.

Scratch artefacts are in the session scratchpad: `html-rerun/`, `blog-fix.ts`, `build-rerun.log`, `precommit-rerun.log`, and `scripts/visnear.mjs` and `titles-tree.mjs`.
