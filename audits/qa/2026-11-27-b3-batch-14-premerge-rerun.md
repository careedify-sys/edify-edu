# QA rerun: B3 batch 14 round 2 (fix/b3-batch-14 at b0f78ac)

Date: 2026-11-27. Checker: qa-checker (outsider; did not write this batch).
Round 1 report: audits/qa/2026-11-27-b3-batch-14-premerge.md (FAIL F1-F3, advisory A1).

**Range:** f0f6866..b0f78ac, three commits: 99a2e3c (round 1, rebased), 7c3b540 and b0f78ac (round 2).

**Base:** f0f6866, a fresh build. I could not reuse dc0cb35. The 5 WhatsApp commits between them change rendered code:
app/layout.tsx, app/privacy-policy/page.tsx and app/leads/*.

**Branch build:** my own, in a scratch worktree at b0f78ac. The batch worktree's .next BUILD_ID (13:51:51) predates the
b0f78ac commit (13:54:27), so I did not use it. Both builds exited 0.

## Verdict: PASS. F1, F2, F3 and A1 are fixed, and the round 1 passes still hold.

---

## F1: fixed

- **JAIN hub comparisons block deleted.**
  - jain-university-online-mba.json now has 20 sections and no `comparisons`. The schema marks the section optional
    (lib/data/page-content-schema.ts:36 and :125, `comparisons?:`).
  - The JSON diff shows exactly one structural change across 78 files: the removal of /sections/comparisons/body and /heading.
  - The hub universities/jain-university-online/mba.html builds and renders the same visible text as at base. The block was never
    rendered, and "Rs.6,111", "Rs.7,500" and "Monthly EMI" count 0 in its HTML.
- **NMIMS hub.** about.body now reads "...offers {{mbaSpecCount}} specialisations. Fees are Rs.1.96L. This page verifies figures
  independently." That is a clean sentence.
- **UPES hub.** about.body now reads "Fees are Rs.1.75L to Rs.2.20L." getExactFee(UPES, MBA) is ₹1,75,000–₹2,20,000, so it matches.
  - The only "new number" my JSON differ found anywhere is this "20" (from 2.20L).
- **"and EMI starts."** counts 0 in all 431 JSON files.

**Unkept EMI recount.** The page-content JSON now has 0 unkept EMI figures by four independent checks:
- .b8tmp/count14.mjs (fixed lookbehind): `src` gives 0 in 0 files, and the built university pages give 0.
- .b8tmp/count14r2.mjs: the JAIN row is 0 in source and 0 in the build.
- My own scanner (qa14/jsonemi.mjs): only kept figures, plus 10,000 (a lump-sum discount), 43,781 and 1,000 (CU semester and registration).
- A looser line-level scan (qa14r/loose.mjs): any Rs/₹ figure in a string line mentioning EMI, instalment or monthly. It finds only
  semester instalments, total fees and the Galgotias ₹80,200 comparisons. No monthly figure.

**Rendered university pages.** Unkept EMI figures (qa14r/htmlemi.mjs) go from 58 on 36 pages to 0.

**Round-trip.** All 78 JSON files are byte-exact under `JSON.stringify(o, null, 2)` at both commits.

## F2: fixed (amity-vs-manipal-online-mba-2026)

- **Snapshot rows** match getExactFee for both universities:
  - "MBA Fee (lowest published)": Amity ₹2,07,000 (one-time) and MUJ ₹1,56,400 (after 15% discount).
  - "MBA Fee (list)": Amity ₹2,25,000 (semester-wise total) and MUJ ₹1,84,000 (list).
  - getExactFee: Amity ₹2,07,000–₹2,25,000. MUJ is "₹1,84,000 list; ₹1,56,400 after 15% discount" (feeBreakdown.mba, "Rishi, Jan 2027 fee chart").
  - The old ₹1,53,000 and ₹1,80,000 are gone (count14r2: 0).
- **No derived gap or saving remains** in the rendered page.
  - All of these count 0: "Gap: ₹", "gap of about ₹", "cheaper by about", "saves you about", "₹27,600 saved", "₹18,000 saved", "54,000", "₹1.56L (one-time)".
  - The "Savings vs Semester" column is gone, and the table has 2 columns throughout.
- **The replacement sentence reads cleanly:** "MUJ's 15% discount applies across its payment modes, so ₹1,56,400 is not a
  one-time price and does not line up with Amity's one-time fee." It is accurate to feePlans, where the discount applies to the
  full-fee, annual and semester rows.
- **FAQ, in both the visible text and the FAQPage JSON-LD:** "Amity charges ₹2.07L one-time (₹2.25L semester-wise). MUJ lists ₹1.84L, or ₹1.56L
  after its 15% discount. Both offer no-cost EMI options." Every figure is a getExactFee value.
- **Quick Facts card** (lib/blog-quick-facts.ts): it renders "MUJ Fee ₹1.56L (after 15% discount)", and check-quick-facts passes
  (76 entries, no blank rows).
- **One "like for like" remains.** It is the H2 "Fees Breakdown: Comparing Like for Like". The FIX-LOG explains it: the H2 now introduces
  mode-by-mode tables, and the sentence under it disclaims the comparison. This is not a derived figure, so it does not fail.

## F3: fixed

The rendered FAQ (visible text and JSON-LD) now reads: "No university in this guide publishes a university-specific average package for its online
MBA graduates, so there is no reliable figure to quote."
- This is consistent with audits/verify/highest-package-2026-11-26.md row 18. Online Manipal's "Average Salary Package 6 LPA*" is pooled,
  "not by university".
- It is also consistent with the post's own table caption.

## A1: fixed

- All six SMU spec JSONs now read "Contact our counsellor for current EMI tenure options." in fees.body. The bare "current tenure
  options" is 0 in the SMU files (count14r2).
- **Correction to my round 1 note:** the SMU fees bodies are not in the server-rendered text. Their visible-text count is 0 at base and branch.
  The 4 rendered hits I cited were Kurukshetra and Chitkara spec pages. There, "Zero-cost EMI: Available directly through ..."
  comes immediately before the line, so leaving them unchanged was right.

---

## Round 1 passes re-checked on b0f78ac. All hold

- **Gates:** .husky/pre-commit on a staged copy of f0f6866..b0f78ac (index equal to the b0f78ac tree): **exit 0**, "all checks
  passed", and the hooks modified no files. Within that run:
  - check-blog-fees: 1950 unverified, unchanged from baseline.
  - check-fee-baseline: 205, unchanged.
  - check-protected-pages: 8 paths and 8 frozen posts, OK.
  - check-quick-facts: OK.
  - check-page-content-json: OK, 431 files.
  - check-page-content-facts: self-test 4/4, then OK.
  - check-em-dash: OK.
  - typecheck:scripts: OK.
- **blog-fee-baseline:** totalUnverified went 1955 to 1950. mba-hr-management-online-india-2026 went 41 to 39,
  online-mba-business-data-analytics-india-2026 39 to 37, and amity-vs-manipal-online-mba-2026 14 to 13.
  No entry went up, and none was removed.
- **Posts:** exactly 9 posts differ from base, all at updatedAt 2026-11-27. There are no title, seoTitle, metaDescription, h1Title, status or
  slug changes, and 0 meta changes across the site.
- **Rendered site:** the page list is identical (2,335 = 2,335; the WhatsApp pages are dynamic).
  - Visible text changed on 46 pages (9 blog, 1 online-mca mirror, 36 university) and JSON-LD on 39.
  - JSON-LD has 0 parse failures. Undefined and NaN appear on 0 pages.
  - Pages where unmirrored FAQ answers increased: 0.
  - The damage scan flags only the LD-answer-mirror kind, unchanged from base.
- **Tag balance:**
  - Across all 52 changed pages, the per-tag imbalance changed on none.
  - The source content of all 9 posts is balanced.
- **Line endings:** all 83 changed files are LF at both commits, with no trailing-newline change.
- **Round 1 tests 2, 4 and 6 are unaffected by round 2.** Round 2 touched only amity-vs-manipal, the placement FAQ and the JSON above.
  The Amity MCA ₹1,99,000 FAQ, the UPES ₹1,75,000–₹2,20,000 range and JIIT ₹1,75,000, and "fee difference" in nmims-vs-symbiosis
  are still present and unchanged.

## Advisories carried forward (not blocking)
- UPES spec-page tldr and FAQ still give "Rs 1,75,000 (Year 1 / Year 2)" while the blogs and hub give the range. Their fee bodies keep
  the unsourced "3 to 36 months" tenure. (Round 1, A2.)
- Already there and outside scope: page-content JSONs carry derived comparisons such as "MAHE at ₹2,92,000 costs ₹67,000 more" and
  "Galgotias at Rs 80,200 is roughly half the price". These are the same derived-gap class as F2, so they are a candidate for a later sweep.

## Cleanup
- I removed the scratch worktrees qr14base, qr14br and qr14gates, rmdir'ing the node_modules junctions first, then ran prune.
- I started no servers. No site files were edited.
