# QA pre-merge rerun: B3 batch 20 round 2

**Date:** 2026-11-27 · **Checker:** qa-checker (outside reviewer; did not do the work)
**Commit:** bc888b8 on fix/b3-batch-20 · **Parent:** b7c902c · **Base:** 674fb42
**Answers:** audits/qa/2026-11-27-b3-batch-20-premerge.md (F1, F2, F3, A4)

**Method:**
- Clean detached worktrees at b7c902c (the pre-round-2 build) and bc888b8. Both got a full `next build`, and the prerendered HTML was compared page by page.
- Pre-commit ran on a third worktree at 674fb42 with 674fb42..bc888b8 staged.
- The salary sweep is my own script (scratchpad `qa20r/sweep.mts`). It does not use the engineer's sweep20.cjs.

## VERDICT: PASS

F1, F2 and F3 are closed, and the two A4 points are fixed. No regression was found. The advisories below are non-blocking.

| Item | Result |
|---|---|
| F1 table leftovers | PASS |
| F2 IGNOU coupon page | PASS (advisories R1, R2) |
| F3 UPES wording | PASS |
| A4 best-online-mba, mba-vs-bba | PASS |
| Gates and damage | PASS |

## F1. Same-page salary leftovers: PASS

**Sweep method.**
- Covers the 20 posts batch 20 or 21 edits (the 19 batch 20 posts plus bba-full-form).
- **Salary figures:** each table cell is attributed by its row label and column header; prose is attributed by sentence. The regex is broader than the gate's: it also covers "lakh CTC", "L p.a." and crore forms.
- **Non-publishers per page:** each "does not publish / publishes no / not published / does not report" clause names one. A clause that says "publishes only" or "states" is excluded, and a "Not published" cell counts for its row or column university.
- **Flag:** any salary figure attributed to a university the same page calls a non-publisher.

**Proof the detector works.** On b7c902c it flagged every known defect:
- the amity-vs-manipal MUJ cell;
- the jain-vs-amity JAIN cell;
- the nmims-vs-symbiosis NMIMS cell;
- all 5 Pune "NMIMS Online MBA" cells;
- the 2 mba-vs-pgdm "Year 1 CTC (online)" NMIMS cells;
- the mba-vs-pgdm "Rs 6-15 LPA lateral" sentence.

**At bc888b8.**
- **Four target tables:** all clear.
- **amity-vs-manipal:** the row is now "Published salary figure".
  - Amity: "Highest package Rs 18 LPA (all programmes, no year given)", matching sheet S3.
  - MUJ column: "About 5.5 LPA MBA average, group-wide across Online Manipal universities (no year given)", matching S2.
  - Both labels are exact.
  - The sweep still lists the 5.5 LPA cell and sentence under MUJ. That is by design: the label says it is Online Manipal group-wide, not MUJ.
- **jain-vs-amity:** JAIN "Not published", Amity S3 as above.
- **nmims-vs-symbiosis:** "Not published / Not published".
- **online-mba-pune:** the NMIMS Online MBA column is gone: header plus 5 cells, with rows still 3 cells wide and tags balanced.
- **Remaining hits:**
  - The Pune sentence that itself attributes Rs 18 LPA to Amity, which is a false positive.
  - mba-vs-pgdm (3 hits). Batch 21 clears these (see the batch 21 rerun).
  - Merge note: **do not merge batch 20 without batch 21**, or mba-vs-pgdm keeps the contradiction.

**No fee figure exposed.** check-blog-fees stays at 1948 on the staged tree. Nothing was added to the allowlist.

**Per-slug salary counts:**

| Post | Before | After | Change |
|---|---|---|---|
| jain-vs-amity | 3 | 2 | |
| nmims-vs-symbiosis | 1 | 0 | removed from the baseline |
| online-mba-pune | 11 | 6 | |
| amity-vs-manipal | 4 | 4 | 2 old ranges out, 2 sourced figures in |
| best-online-mba | | net 0 | see A4 |

The total goes 2353 → 2346, and the baseline file matches: sum of perSlug = total = 2346, confirmed by the gate run from the branch.

## F2. IGNOU coupon page: PASS (advisories R1, R2)

**hasCoupon gating.** I read the template diff in full.
- `hasCoupon = couponCode !== 'N/A'` gates every section listed in the FIX-LOG. That includes the HowTo JSON-LD (2 "HowTo" hits before, 0 after) and the disclaimer amounts line.
- The peer row prints `couponDiscount`, which is "No coupon on this programme" for IGNOU.

**I read the whole built IGNOU page:**
- 0 visible "N/A".
- It reads as a no-coupon page:
  - the fee CTA;
  - the scholarships note, ending "…what documents you need.";
  - "What This Coupon Does Not Include", which holds the single "No coupon system" bullet;
  - the peer table;
  - fit / FAQs / related / disclaimer.
- **JSON-LD:** all 6 blocks parse: Organization, WebSite, Person, BreadcrumbList, FAQPage, Course. The Course description now ends at "(NAAC A++)."
- **Head unchanged:** title "IGNOU Online MBA 2026 - UGC-DEB Approved, NAAC A++", description, OG, twitter, canonical and robots are all identical to b7c902c.
- **Tables:** 2 → 1. "at a Glance" is gated, as intended.

**The other 23 coupon pages are not byte-identical, but they are equivalent.**
- **What differs:** React text-node markers (`<!-- -->`), because the scholarships sentence is now a JSX fragment. The MUJ page also gets a new `useId` value (`:Ru6…` → `:Rtm…`) on its form input, because the tree shape changed.
- **What is identical on all 23**, after stripping those markers:
  - visible text;
  - all JSON-LD;
  - every meta tag and the `<head>`, ignoring static chunk hashes;
  - DOM without scripts, on 22 of 23 (MUJ differs only by that useId).

**Advisories:**
- **R1.** The IGNOU page still uses coupon-framed generic copy:
  - the heading "What This Coupon Does Not Include";
  - "Before using a coupon code…" and "…before you apply any coupon code" in the fit section;
  - the disclaimer bullets "The coupon codes on this page are fee adjustments…", "admissions decide whether the discount applies" and "separate from this coupon".

  None of it says "N/A" and none is a factual claim about IGNOU. Gating or rewording these is a nice-to-have.
- **R2.** `<meta name="keywords">` on the IGNOU page still contains the bare token "N/A", from `${page.couponCode}` at app/coupons/[slug]/page.tsx:66. It is not visible and search engines ignore keywords. It was left alone because changing it is a head change.

## F3. UPES: PASS

- **FAQ (visible), body (visible) and FAQPage JSON-LD** all read: "UPES publishes no rupee salary figure for its online MBA (it reports an alumni-survey salary-hike percentage); outcomes depend on prior experience, role and city."
- This matches sheet S7/A18. The percentage itself is not quoted.
- **"does not publish":** 0 occurrences left on the page.

## A4: PASS

**best-online-mba-colleges-india-2026 (Amity).** The FAQ and its LD say "Amity Online publishes only a highest package (Rs 18 LPA, no year given)…". That is consistent with the other posts and with S3.

**The removed generic figure is OK.** The fresher row of "Realistic 2-year post-online-MBA outcomes by use case 2026" now reads "Fresher graduate, target first management job | Junior management role | Low (20 to 35 percent…)".
- **Not a weakening:** deleting an unsourced, unattributed figure only lowers a ratchet. The gate counts per post, and this keeps the post's count flat rather than gaming it.
- **Reads correctly:** the cell sits under "2-year post-MBA outcome".
- **Disclosed:** the FIX-LOG records it.

**mba-vs-bba.** The sentence now reads "Edify counsellor interviews (2025 to 2026) give the following pattern." That is visible and capitalised correctly. The table-attribution point is left to a later salary chunk, as disclosed.

## Gates and damage: PASS

**Pre-commit.** Staged 674fb42..bc888b8, 38 files. Result: "pre-commit: all checks passed", and the tree was identical to bc888b8 afterwards.

| Gate | Result |
|---|---|
| fee-baseline | 205 |
| blog-fees | 1948 |
| em-dash | 227 |
| blog-salaries | self-test 7/7; 2346 = baseline 2346 |
| verify-fees | 0 new |
| protected-pages | 8 frozen posts OK |
| naac-consistency | 0 |
| blog-updated-at | 19 posts, all dated |
| coupon-claims | 24 pages OK |

check-blog-salaries.mjs was also run directly from the bc888b8 worktree: OK, 2346.

**Build:** exit 0, 2,367/2,367 pages generated.

**Compared with b7c902c:**
- Same 2,335-page list.
- Visible changes on 31 pages: 7 blog plus the 24 coupon pages (24 because of the comment markers above).
- JSON-LD changed on 3 pages (2 blog, IGNOU); 0 parse failures.
- 0 meta/title/OG/canonical/robots changes.
- 0 undefined/NaN pages, 0 new unmirrored FAQ answers.
- 0 new tag imbalances across 2,335 pages.

**Line endings:** all 4 changed files keep CRLF on every line (page.tsx 640/640, blog.ts 52922/52922, baseline 117/117, FIX-LOG 8339/8339).

**Full diff read.** Four files: the template, lib/blog.ts (7 posts), data/blog-salary-baseline.json and FIX-LOG. All are in scope. No updatedAt change was needed, since all 7 posts already carry 2026-11-27.

## Advisories (non-blocking)

- **R1 and R2:** IGNOU coupon-framed copy and the meta keywords "N/A" token (see F2).
- **R3. NMIMS still has an unsourced salary range on mba-scope-india-2026.** The batch removed NMIMS from the FAQ's "Rs 12 to 18 LPA" tier, because the NIRF median is Rs 20,00,000 (sheet A29). But the same page's specialisation table still has a column headed "Tier-1 Private (NMIMS, SPJ, SIBM)", with Finance "Rs 12 to 18 LPA" and five more ranges. That is the same conflict, in table form. mba-marketing-career-salary-jobs-2026 has a similar "Tier-2 MBA (NMIMS, SPJ)" column. Both are for the next salary chunk.
- **R4.** The mat-exam colleges table still lists SRM / JAIN / Amity Noida (campus) "Rs 6-10 LPA" under "Year 1 CTC". This is unchanged from round 1 (advisory A4 there).

## Housekeeping

Worktrees r20pre, r20 and rg (plus rg21 for the batch 21 rerun) were removed after both reports, junctions first. No server was started. No site edits, commits or pushes.
