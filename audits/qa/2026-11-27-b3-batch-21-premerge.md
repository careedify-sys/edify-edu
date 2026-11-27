# QA pre-merge: B3 batch 21 (fix/b3-batch-21 @ b90b5e9)

**Date:** 2026-11-27 · **Checker:** qa-checker (outside reviewer) · **Base:** b7c902c (batch 20 tip, under separate QA) · **Commit:** b90b5e9
**Method:**
- Scratchpad worktrees for b7c902c and b90b5e9, each with a junctioned node_modules and a copy of audit-data/. Both built with `npm run build`, generated files restored, and the tree was clean after both.
- A third worktree held b7c902c with b7c902c..b90b5e9 staged, and the full .husky/pre-commit ran there.
- No server was needed: every affected page is prerendered.
- All worktrees and junctions were removed afterwards. The main checkout was untouched apart from this file.

## Verdict: FAIL (1 small wording fix), plus 1 condition for the coordinator

| # | Finding | Severity |
|---|---|---|
| F1 | bba-full-form scenario 4 says "Neither publishes a BBA-only placement figure". That goes beyond the batch20a sheet. | Blocking (new claim wider than its source); one-sentence fix |
| C1 | The mba-vs-pgdm MUJ cell "Rs 1.56-1.84 lakh" sits under "Total Fees" with no label. Its floor is the discounted net. The figures MATCH; the label is not adequate. | Coordinator decides: fix now or log |
| S1 | The coordinator expected "no salary figure remains on the page". Not met: 19 remain on mba-vs-pgdm, the gate's own count. All are outside the edited table and were there before this batch. | Scope note, not a defect of this diff |

### F1. Scenario 4 claims more than the sheet shows
- The new text says: "Neither publishes a BBA-only placement figure: NIRF reports their campus medians for all undergraduate programmes together."
- Sheet row B7 (sources S13 and S14) shows only this: NIRF 2025 gives NMIMS and Symbiosis International a **university-wide UG 3-year** median (Rs 5,50,000 and Rs 4,60,000 for 2023-24), not a BBA-only figure.
- The sheet did not search either university's own campus BBA placement pages. S6 is the NMIMS online MBA pages; S23 is the Symbiosis online domains. So "neither publishes" is wider than the evidence.
- "All undergraduate programmes" is also slightly wider than the source, which covers "UG 3-year" programmes.
- **Fix:** for example, "NIRF does not report a BBA-only figure for either: their NIRF medians cover all three-year undergraduate programmes together."
- updatedAt is bumped from 2026-11-25 to 2026-11-27, and the rendered "Last updated" shows 27 November 2026. That part is OK.

### C1. MUJ fee cell label
- getExactFee for MUJ MBA is **labelled**: "₹1,84,000 list; ₹1,56,400 after 15% discount".
- The site's own short form (formatExactFeeShort) prints the list price only, ₹1,84,000. exactFeeBounds is {184000, 184000}.
- The codebase rule (lib/fees.ts) is that "a discounted net is never printed as the fee on its own". "Rs 1.56-1.84 lakh" under a "Total Fees" header turns the net into an unlabelled range floor.
- Both figures are correct, and check-blog-fees resolves the cell as MATCH. The label is the problem.
- Suggested cell: "Rs 1.84 lakh list (Rs 1.56 lakh after 15% discount)". Note that rewording a fee sentence can fail check-blog-fees (see the fee-gate phrasing memory), so re-run the gate after the edit.
- JAIN "Rs 1.60-2.98 lakh" is a genuine exact range: getExactFee gives exact ₹1,60,000–₹2,98,000, with no discount component. **PASS.**

### S1. Salary figures still on mba-vs-pgdm (19, all present before this batch)
- FAQ: "IIM plus XLRI ... place at Rs 25-40 LPA. Online MBA from NMIMS plus JAIN plus Amity is widely accepted at Rs 6-15 LPA lateral."
  - The second sentence is a university-attributed **online** outcome range, the same class as sheet rows X1–X3. It has no sheet row and should go in the next salary chunk.
- Comparison table: "IIM A, B, C Rs 30-50 LPA".
- Prose: "top IIMs exceeding Rs 25 to 30 LPA".
- "Top PGDM institutes" table: 10 "Year 1 CTC" cells (IIMs, XLRI, MDI, SP Jain, SPJIMR).
- "Honest Career Outcomes" list: 5 figures (IIM tiers, IIM exec, Tier-3 PGDM, State University MBA).
- None of these names a university in lib/data.ts except the FAQ's NMIMS/JAIN/Amity line.

## Results

### 1. mba-vs-pgdm-online-india-2026: PASS on structure; C1 and S1 as above
| Check | Result | Evidence |
|---|---|---|
| CTC column removed | PASS | Source: header plus 8 cells gone. Built HTML: "Year 1 CTC (online)" appears 0 times. Caption "Top online plus campus MBA universities 2026": cells per row [3,3,3,3,3,3,3,3,3] at tip, [4×9] at base. |
| Tags balance | PASS | Rendered table: table 1/1, tr 9/9, td 24/24. Post content is balanced at base and tip (string-split counter). The other 3 tables are unchanged. |
| JAIN cell | PASS | MATCH against getExactFee exact ₹1,60,000–₹2,98,000 |
| MUJ cell | C1 | Figures MATCH; label not adequate |
| Other 6 cells | PASS | All "Contact our counsellor": 6 visible hits. getExactFee for the three online ones: NMIMS ₹1,96,000–₹2,20,000, Amity ₹2,07,000–₹2,25,000, Symbiosis ₹3,15,000–₹3,70,000. The old cells (2.10-2.40, 1.99, 1.65 lakh) were all wrong, so removing them is right. |
| Reads cleanly | Mostly | Two advisories: A1 (counsellor line on campus rows) and A2 (NIRF label) |
| Head | PASS | Title, meta and canonical unchanged; updatedAt was already 2026-11-27 |

### 2. bba-full-form scenario 4: FAIL (F1)
The INR 6-8 LPA figure and the unsourced "INR 10-15 lakh" campus BBA fee were both removed, which is correct. The replacement sentence is wider than the sheet (F1). updatedAt is bumped.

### 3. amity-online-mca-fees-review: PASS (advisory)
- "Payscale" now appears 0 times in source, and in the built /blog/amity-online-mca-fees-review and /online-mca/amity-online-mca-fees-review.
- **Advisory, left for later as the fix log says.** 17 salary figures remain, all unsourced and university-attributed:
  - The "Amity Online MCA Salary Outcomes by Specialisation 2026" table, with Year 1 / Year 5 columns. Each pair is entry then year 5:
    - AI and Machine Learning: Rs 5 to 10 LPA, then Rs 15 to 28 LPA.
    - FinTech plus AI: Rs 5 to 9, then 14 to 25.
    - Cyber Security: Rs 5 to 9, then 14 to 25.
    - Software Engineering: Rs 4 to 8, then 12 to 22.
    - Blockchain: Rs 5 to 10, then 14 to 26.
    - General MCA: Rs 3.5 to 7, then 10 to 18.
  - The "5-Year Trajectory" ladder: Year 2 Rs 4-9 LPA; Year 3 Rs 8-14 LPA; Year 4 Rs 12-20 LPA; Year 5 Rs 16-25 LPA.
  - The closing line "reaches Rs 15-22 LPA by year 5".

### 4. CU tagline: PASS
| Check | Result | Evidence |
|---|---|---|
| Nothing outside app/admin reads `tagline` | CONFIRMED | grep over app/, components/, lib/ and scripts/: only app/admin (CMS), app/api/cms/sync (CMS, out of scope), lib/site-config.ts (the site's own unrelated "tagline"), export scripts and a lint helper. lib/data.ts derives nothing from it. |
| No title/meta/OG/visible/JSON-LD | CONFIRMED | Tip build: the new text is in 37 HTML files, only in the RSC flight payload. Visible text, head and JSON-LD on /universities/chandigarh-university-online/mba: false, false, 0 meta tags. Old text: 37 files at base, 0 at tip. It is also in /api/universities with the whole record. |
| Wording against the batch20 sheet | PASS | Sheet item 3 says "Two MBA subjects are taught by PwC India experts, with certificates on completion", and the Triple plan carries PwC India, PMI and Harvard. The tagline: "Triple Industry Certified MBA plan: two subjects taught by PwC India experts, plus PMI and Harvard certificates". That is 111 characters, the plan name is exact, there is no superlative and no em dash. The sheet is committed on this branch. |
| Allowlist removal is not a weakening | PASS | Allowlist entries are keyed `id::key::value`, so the removed entry matched only the exact old string. scripts/check-string-truncation.mts lists stale entries as a NOTE and does not fail on them, so the removal is hygiene rather than something the gate strictly requires. Proof: putting the old 120-character text back without its entry made the gate exit 1 ("1 truncated string(s)"). It then reported 5 truncations found, 5 allowlisted. |
| The 4 gates | PASS | check-string-truncation OK; check-duplicate-tagline "OK, no university-specific claim is shared"; check-llms-txt OK; check-data-slim-drift "OK, the mirror matches the master" |

### 5. Gates and damage: PASS
| Check | Result | Evidence |
|---|---|---|
| Pre-commit, staged b7c902c..b90b5e9 | PASS | "pre-commit: all checks passed": fee 205, blog-fees 1948, em-dash 227 and salary 2344, all at baseline. Protected pages OK. The hook staged nothing extra. |
| Salary drop is genuine | CONFIRMED | Gate's own regex on the post bodies: mba-vs-pgdm 27 → 19 (the 8 CTC cells deleted), bba-full-form 16 → 15 ("INR 6-8 LPA" deleted). Full run: base "2353 ... baseline 2353", tip "2344 ... baseline 2344". The diff shows deletions, not rewording around the regex. |
| Same page list | PASS | 2335 = 2335, identical |
| JSON-LD | PASS | 17,934 blocks, 0 parse failures, 0 undefined/NaN |
| CRLF | PASS | All 5 files are LF in git at both commits. Line counts are unchanged except FIX-LOG (+24) and the truncation allowlist (−6). |
| No title/meta changes | PASS | 57 pages differ after normalising. 0 have a head diff. The 41 CU pages and the Amity, MUJ and NMIMS MBA hubs differ only in the RSC payload (the tagline). |
| Style | PASS | 0 em dashes and 0 filler words in added lines |
| Full diff read | PASS | 5 files, all in the item scope listed in FIX-LOG |

## Advisories (non-blocking)
- **A1.** Three rows of the mba-vs-pgdm table are campus programmes (NMIMS Mumbai, Symbiosis Pune, SCMHRD). They now say "Contact our counsellor", but Edify counsels for online programmes. "Not listed here" or "See the institute" would read more honestly. 6 of the 8 rows are now counsellor lines, so consider trimming the table to the rows Edify can price.
- **A2.** In a kept row, the JAIN cell reads "NIRF University 73". lib/data.ts has JAIN at NIRF University 62. 73 is JAIN's **Management** rank (online-mba-karnataka-2026 says "NIRF #62 University and NIRF #73 Management"). This is a wrong-category NIRF label, the class flagged in memory. NMIMS "NIRF Mgmt 24" was not checked against data (lib/data.ts holds NMIMS University 52).
- **A3.** The old CU tagline survives in scripts/export/1_universities.csv, an export artifact that is not rendered.
- **A4.** The FIX-LOG says the truncation gate "requires" removing the entry. In fact the gate only prints a NOTE for stale entries. The removal is still correct.
