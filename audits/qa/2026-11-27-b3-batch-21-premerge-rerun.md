# QA pre-merge rerun: B3 batch 21 (rebased) plus round 2

**Date:** 2026-11-27 · **Checker:** qa-checker (outside reviewer; did not do the work)
**Branch:** fix/b3-batch-21 at 33bae44 (round 2) · **Rebased original:** 09273d9 (was b90b5e9)
**Base:** bc888b8 (batch 20 round 2)
**Answers:** audits/qa/2026-11-27-b3-batch-21-premerge.md (F1, C1, S1, advisories A1, A2, A4)

**Method:**
- Clean detached worktrees at bc888b8 and 33bae44, both with a full `next build`. The prerendered HTML was compared page by page.
- Pre-commit ran on a worktree at bc888b8 with bc888b8..33bae44 staged.
- getExactFee and lib/data.ts were read through tsx from the 33bae44 tree.
- I ran a gate-gap injection test on a separate scratch tree, then restored it.

## VERDICT: PASS

Every round-1 item is closed. The coordinator's question about the discount NON_FEE exemption is answered **yes, log it** (see C1): this is an existing gate gap, not a defect of this diff.

| # | Check | Result |
|---|---|---|
| 1 | F1 wording | PASS |
| 2 | C1 MUJ cell | PASS on figures and label; the gate gap is real (log it) |
| 3 | JAIN "NIRF Management 73" | PASS |
| 4 | Campus cells | PASS |
| 5 | S1 range gone | PASS |
| 6 | FIX-LOG correction | PASS (one stale figure, see 6) |
| 7 | Rebase clean | PASS |
| 8 | Salary-baseline drop | PASS (total is 2336, not 2337; see 8) |
| | Gates and damage | PASS |

## 1. F1: PASS

Built /blog/bba-full-form-course-details-eligibility-fees-2026 reads: "Scenario 4: BBA from a premium private college (like NMIMS or Symbiosis). NIRF does not report a BBA-only figure for either: their NIRF medians cover all three-year undergraduate programmes together. The brand name of the college does a lot of heavy lifting…"

- That is exactly the suggested wording, and it is within sheet row B7 (sources S13, S14).
- "INR 6-8 LPA" and "INR 10-15 lakh" are gone.
- updatedAt is 2026-11-27, and check-blog-updated-at agrees.

## 2. C1, MUJ cell: PASS; the NON_FEE exemption is a gate gap you should log

**Manual check against getExactFee.** At 33bae44, manipal-university-jaipur-online MBA is kind `labelled`:
- list 1,84,000;
- net 1,56,400, labelled "after 15% discount";
- formatExactFee: "₹1,84,000 list; ₹1,56,400 after 15% discount".

The cell "Rs 1.84 lakh list (Rs 1.56 lakh after 15% discount)" matches.
- Both figures carry their labels.
- 1,56,400 is written to two decimals as 1.56 lakh, in the same notation as the list figure.
- The net is no longer the unlabelled floor of a range.

**Yes, log the gate gap.** The gap is wider than this cell.
- **Exemption rule** (scripts/lib/blog-fee-scan.mjs:222-256): any ₹ figure is classed NON_FEE and never compared with lib/data.ts if one of `discount(ed)`, `save(s|d)`, `saving(s)`, `scholarship`, `waiver`, `cheaper`, `lower`, `gap`, `off,` or `cashback` sits within **80 characters** of it.
- **Who it affects:** existing posts. check-blog-fees.mjs:105-107 excludes NON_FEE from their count. New posts use the strict rule and are not affected.

**Injection proof.** Four existing posts each got the same wrong MUJ fee, "the Manipal University Jaipur online MBA costs Rs 9,99,000", which is 5.4 times the real fee.

| Post | Text after the figure | Gate |
|---|---|---|
| muj-online-mba-review-2026 (control) | "…for the full programme." | **FAIL** 2 → 3 |
| online-manipal-mba-review-2026 | "…after the 15% discount." | passes |
| mahe-online-mba-review-2026 | "…, which is cheaper than MAHE." | passes |
| amity-vs-manipal-online-mba-2026 | "…with a merit scholarship." | passes |

Exit 1 was reported only for the control. The tree was restored and verified identical.

**Scale.**
- **Corpus at 33bae44:** 8,140 ₹ figures, 4,737 classed NON_FEE.
- **Discount-type words only:** 496 are NON_FEE *only* because of those words (with the discount-type words stripped, no other pattern fires). 400 of those are ≥ ₹50,000, so they look like programme fees.
- **Real examples, all exempt today:**
  - ignou-online-mba-review-2026 "IGNOU charges Rs 66,000 in tuition", which is the own-sum figure (the box is headed "DISCOUNT AVAILABLE");
  - nmims-online-mba-review-2026 "IGNOU costs around Rs 66,000 and SMU costs around Rs 1.20L … cheaper";
  - several mahe and symbiosis review fee sentences.

**Suggested log line:** "check-blog-fees NON_FEE: discount/saving/cheaper/lower/scholarship words within 80 chars exempt a figure from the getExactFee comparison on existing posts. Wrong totals pass (Rs 9,99,000 for MUJ with 'after the 15% discount' passed). ~400 fee-sized figures are exempt only by these words."

**Possible fix direction.** Keep these words as NON_FEE only when the figure is the *amount* of the discount ("Rs 10,000 off", "save Rs 55,000"). Otherwise classify the figure normally, and accept a labelled net (getExactFee `net`) as MATCH. The MUJ cell would then be checked and MATCH, rather than skipped.

## 3. JAIN NIRF: PASS

- lib/data.ts jain-university-online has `nirf: 62` and `nirfMgt: 73`, so the cell "NAAC A plus plus, NIRF Management 73" is correct.
- I also checked NMIMS "NIRF Mgmt 24" against nirfMgt 24: correct.
- **Disclosed leftover:** "NIRF University 73" still appears **9 times in 8 posts**:
  - best-computer-courses-after-12th ×2;
  - career-after-12th-arts;
  - ignou-online-mba-review (frozen);
  - mahe-online-mba-review;
  - mba-after-engineering;
  - mba-data-science-analytics-career;
  - mba-for-commerce-students;
  - mba-hr-career-salary-scope.

  The FIX-LOG says 10 rows on 8 posts. Check which count is right when that batch is planned.

## 4. Campus cells: PASS

The built table reads:

```
University | NAAC plus NIRF | Total Fees
NMIMS Online (Mumbai) | NAAC A plus plus, NIRF Mgmt 24 | Contact our counsellor
NMIMS Mumbai Campus (Full-Time MBA) | Same as above | Not tracked (campus programme)
JAIN Online (Bengaluru) | NAAC A plus plus, NIRF Management 73 | Rs 1.60-2.98 lakh
Amity University Online | NAAC A plus | Contact our counsellor
Manipal University Jaipur Online | NAAC A plus | Rs 1.84 lakh list (Rs 1.56 lakh after 15% discount)
Symbiosis SCDL (Pune) | NAAC A plus plus | Contact our counsellor
Symbiosis Pune Campus (Full-Time MBA) | Same as above | Not tracked (campus programme)
SCMHRD Pune | NAAC A plus plus | Not tracked (campus programme)
```

- All three campus rows read "Not tracked (campus programme)".
- Every row has 3 cells, and tags are balanced.
- JAIN still matches getExactFee exactly (₹1,60,000–₹2,98,000).

## 5. S1: PASS

- The FAQ/one-line frame now reads "Online MBA from NMIMS plus JAIN plus Amity is widely accepted for lateral moves."
- "Rs 6-15 LPA" and "Year 1 CTC (online)" each appear 0 times in the built page.
- My sweep (see the batch 20 rerun) finds no remaining figure on mba-vs-pgdm attributed to a university the page calls a non-publisher.

## 6. FIX-LOG correction: PASS (one stale figure)

- **Correction present:** the batch 21 CU-tagline paragraph now carries "(Corrected in round 2: check-string-truncation only notes stale entries, it does not require removing them.)". The round 2 entry lists it.
- **Stale figure:** the round 2 entry's gate line says "salary 2344 or lower". The committed total is **2336**. It is not wrong, but it is imprecise; update it when convenient.

## 7. Rebase: PASS

I compared `git diff -U0 b7c902c b90b5e9` with `git diff -U0 bc888b8 09273d9`, ignoring index and hunk-header lines. Both show the same 5 files with 40 insertions and 22 deletions. They differ in only three places, all in FIX-LOG and the baseline:
- the FIX-LOG "rebased onto … bc888b8" clause;
- the FIX-LOG "2346 -> 2337 after the rebase" note;
- the baseline `total` (2353→2344 became 2346→2337).

lib/blog.ts, lib/data.ts and the allowlist hunks are identical.

## 8. Salary baseline: PASS

The committed total is 2336, not 2337. That is correct.

| Commit | Total | mba-vs-pgdm | bba-full-form |
|---|---|---|---|
| bc888b8 | 2346 | | |
| 09273d9 | 2337 | 19 (8 CTC cells deleted) | 15 |
| 33bae44 | **2336** | 18 ("Rs 6-15 LPA" deleted) | |

- The baseline file has total 2336, equal to the sum of perSlug.
- check-blog-salaries.mjs run from the 33bae44 tree: "OK (2336 salary figures, baseline 2336)".
- The 2337 in the brief is the pre-round-2 figure.

## Gates and damage: PASS

**Pre-commit.** Staged bc888b8..33bae44, 5 files. Result: "pre-commit: all checks passed", and the tree was identical to 33bae44 afterwards.

| Gate | Result |
|---|---|
| fee-baseline | 205 |
| blog-fees | 1948 |
| em-dash | 227 |
| blog-salaries | self-test 7/7; 2336 = baseline |
| string-truncation | 5 found, 5 allowlisted, OK |
| nirf-category | OK |
| naac-consistency | 0 |
| protected-pages | 8 frozen OK |
| blog-updated-at | 3 posts, all dated |
| coupon-claims | OK |

The main checkout's hook lacks the salary gate, so the gate was run from the branch as above.

**Build:** exit 0, 2,367/2,367 pages generated.

**Compared with bc888b8:**
- Same 2,335-page list.
- Visible changes on 4 pages: mba-vs-pgdm, bba-full-form, and amity-online-mca-fees-review plus its /online-mca mirror.
- JSON-LD changed on 1 page; 0 parse failures.
- 0 meta/title/OG/canonical/robots changes.
- 0 undefined/NaN pages, 0 new unmirrored FAQ answers.
- 0 new tag imbalances across 2,335 pages.
- **CU tagline:** RSC payload only, not visible, as round 1 established.

**Line endings:** all 5 files keep CRLF on every line (blog.ts 52922/52922, data.ts 10938/10938, baseline 117/117, allowlist 36/36, FIX-LOG 8375/8375).

**Full diff read.** Round 2 is one table, one FAQ sentence, one BBA sentence and FIX-LOG. The rebased original is checked in 7. All are in scope.

## Advisories (non-blocking)

- **Label style.** The table now mixes "NIRF Mgmt 24" and "NIRF Management 73".
- **"Symbiosis SCDL (Pune)".** This row offers "Contact our counsellor". Edify tracks SSODL (symbiosis-university-online), and SCDL is a different Symbiosis unit. Check the row label when the table is next touched.
- **Merge order.** Merge batch 20 and batch 21 together. The mba-vs-pgdm "does not publish" contradiction is only cleared by batch 21.

## Housekeeping

Worktrees r20pre, r20, r21, rg and rg21 were removed after both reports, junctions first. No server was started. No site edits, commits or pushes.
