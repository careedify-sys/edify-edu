# QA pre-merge rerun: B3 batch 19 round 2 (fix/b3-batch-19 @ 674fb42)

**Date:** 2026-11-27 · **Checker:** qa-checker (outside reviewer) · **Round 2 commit:** 674fb42 on e857e46 · **Base for builds and gates:** 02552a9
**Answers:** audits/qa/2026-11-27-b3-batch-19-premerge.md (FAIL on F1 and F2, C1, advisory A2).
**Method:**
- Fresh scratchpad worktrees for 02552a9 and 674fb42, each with a junctioned node_modules and a copy of audit-data/. Both built with `npm run build`, with generated files restored afterwards. The tree was clean after both builds.
- A third worktree held 02552a9 with the 02552a9..674fb42 diff staged, and the full .husky/pre-commit ran there.
- No server was needed: every page checked is prerendered.
- All worktrees and junctions were removed afterwards. The main checkout was not touched apart from this file.

## Verdict: PASS, on one merge condition (C2)

| Item | Result |
|---|---|
| F1 Christ FeeBreakdown | PASS |
| F2 Q60 row | PASS |
| C1 FIX-LOG head-change entry | PASS |
| A2 CU plan names | PASS, with C2 |
| Regression and gates | PASS |

### C2 (merge condition): the PwC India / PMI certificate claims cite a sheet that is not on this branch
- Round 2 adds these certificate statements:
  - The CU coupon certifications row says "the MBA plan includes the Harvard certificate; the Triple Industry Certified MBA plan adds PwC India and PMI".
  - The coupon FAQ says "The MBA plan includes the Harvard Business Publishing certificate. The Triple Industry Certified MBA plan adds PwC India and PMI certificates".
  - The online-mba-entrepreneurship-india-2026 FAQ says "Triple Industry Certified MBA plan (Harvard, PwC India, PMI CAPM)".
- FIX-LOG cites "batch20 sheet 3d-3e". Those rows exist and support the claims. In audits/verify/batch20-facts-2026-11-27.md:
  - Row 3d: plan "MBA" has one certificate entry, Harvard Business School Publishing.
  - Row 3e: the Triple plan has "PwC India, PMI, and Harvard Business Publishing".
- That sheet is committed only on fix/b3-batch-20. It is untracked in the main checkout and absent from fix/b3-batch-19 at 674fb42. `git grep -i pwc 674fb42 -- audits/verify` finds no CU row.
- The batch 19 sheet (row 2a and the text under item 2) lists the Triple plan's certificates as CAPM/PMI and Harvard. It does not name PwC.
- If batch 19 merges to main before batch 20, these facts ship with no source row on main.
- **To clear:** merge batch 20 together with or before batch 19, or commit audits/verify/batch20-facts-2026-11-27.md (or its item 3) on this branch. No site change is needed.

## Results

### F1: PASS
- components/FeeBreakdown.tsx: `'christ-university-online'` has been added to NO_UNSOURCED_FEE_COMPONENTS, with a reason comment. No other change was made to the component.
- Built /universities/christ-university-online/bba and /bba/general-management now show: "Fee structure for BBA . Confirm the payment schedule with our counsellor before you pay. Total Program Fee ₹3,00,000".
- "lending partners", "Study Material" and "Included (digital)" each appear 0 times on both pages.
- The one remaining "semester-wise" is the syllabus line ("BBA semester-wise subjects, exam pattern..."). It is not a fee claim.
- Every visible line added against base is fee-related:
  - hero, card and FeeBreakdown show ₹3,00,000;
  - the FAQ says "Total programme fee is ₹3,00,000 across 3 Years. edifyedu.in does not list a verified EMI figure";
  - the generic lines "Fees can change between intakes" and "does not collect any fees".
  - All trace to row 1c.
- The other template copy (placement support, hiring companies, "Pay Fees Semester-wise, EMI or one-shot payment" in the admission steps, badges) is identical at base. It is not introduced by this batch.
- On the profile, the only change is "BBA ₹3,00,000". Christ MCA pages have no visible or head diff.

### F2: PASS
- Every Q row in QUESTIONS-FOR-RISHI.md at 674fb42 has 8 pipe fields, which is 6 cells and matches the header. No row deviates.
- The Q60 6th cell begins "RESOLVED 27 Nov (answered from the source, not by Rishi): audits/verify/batch19-facts-2026-11-27.md item 4 ...", so it renders in the "Rishi's answer" column.
- Q60 is the only line in this file that changed.

### C1: PASS
- The FIX-LOG round 2 entry lists the six pages with the before and after text: the Christ BBA hub title, description, og and twitter tags; the Christ General Management description; the descriptions and og:descriptions of the 3 compare pages; and /fees "60" becoming "61". It records the coordinator's acceptance.
- The rendered head diff against base at 674fb42 is exactly these 6 paths and nothing else.
- None of them is in FREEZE_SLUGS (8 review posts) in scripts/check-protected-pages.mjs or in data/protected-ai-pages.csv. The only CU path in that CSV is /blog/chandigarh-university-online-mba-review, and its head is unchanged.
- The protected-pages gate printed "OK. 8 protected paths and 8 frozen posts checked."

### A2: PASS (see C2)

| Location | Result |
|---|---|
| Fake-or-legit table rows 3-4 and the 2 paragraphs below | Now "Triple Industry Certified MBA plan" / "MBA plan". In the built page, "3-certificate", "1-certificate" and "with 3 certificates" each appear 0 times. updatedAt was already 2026-11-27. |
| online-mba-entrepreneurship-india-2026 FAQ (old :36424) | Relabelled. updatedAt and JSON-LD dateModified go from 2026-11-25 to 2026-11-27, and the visible "Last updated" shows 27 November 2026. |
| online-mba-event-management-india-2026 FAQ (old :36490) | Relabelled, with the same date bump. |
| CU coupon: discount row, exclusion, FAQ | Relabelled. The FAQ question text changed from "What certifications does CU bundle for free?" to "What certificates come with each CU MBA plan?". The coupon head is unchanged. |
| FAQ JSON-LD against visible | 0 LD answers missing from visible text on the entrepreneurship, event-management, fake-or-legit and coupon pages, and the new strings appear in both. 0 undefined/NaN. |
| Fee sentences otherwise verbatim | A word-diff of e857e46..674fb42 over lib/blog.ts and lib/coupon-pages.ts changes 0 rupee tokens. check-blog-fees OK at 1950. |

### Regression and gates: PASS

| Check | Result |
|---|---|
| Builds | 02552a9 exit 0; 674fb42 exit 0 |
| Page list | 2335 = 2335, identical, and identical to the round 1 tip |
| JSON-LD | 17,934 blocks at 674fb42, 0 parse failures, 0 undefined/NaN |
| Tags | The 3 edited content posts are balanced |
| CRLF | All 5 changed files are LF in git at both e857e46 and 674fb42. Line counts are unchanged except FIX-LOG (+31) and FeeBreakdown (+2). |
| Pre-commit, staged 02552a9..674fb42 | "pre-commit: all checks passed". em-dash 227 and fee 205 unchanged; blog-fees 1950 unchanged; protected pages OK. The hook staged nothing extra. |
| Style | 0 em dashes and 0 filler words or banned starters in added lines |
| Full diff e857e46..674fb42 read | 5 files: FIX-LOG, QUESTIONS (Q60 only), FeeBreakdown (+2 lines), lib/blog.ts (2 FAQs, 2 updatedAt, 2 table rows, 2 paragraphs), coupon-pages.ts (3 strings). All in scope. |

Normalised HTML diff against base: 90 pages. That is round 1's 87 plus the entrepreneurship and event-management posts and /blog/write.html (CMS page, build noise only). All visible changes are the planned fee and label changes.

## Advisories (non-blocking)
- **A7.** The CU coupon discount row still has type "Harvard/PwC/PMI certifications" and eligibility "All students". Its saving text now says PwC and PMI come only with the Triple plan, so "All students" reads loosely. Batch 20 can tidy it.
- **A8.** lpu-vs-chandigarh-university-online-mba-2026 still has "₹2.38L (3-certificate list price)". This is already logged in FIX-LOG for batch 20.
- **A9.** The coupon FAQ says "Harvard Business Publishing certificate". CU's certificate block says "Harvard Business School Publishing" and its FAQ says "Harvard Business Publishing Education". The wording is close enough not to be an error.
- Round 1 advisories A1, A3, A4, A5 and A6 still apply, and none of them blocks merge.
