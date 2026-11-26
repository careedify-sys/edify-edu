# QA pre-merge rerun: B3 batch 6 (fix/b3-batch-6 @ 6d228c8)

- **Date:** 2026-11-25
- **Branch:** fix/b3-batch-6 @ 6d228c8. This is round 2 bd7f938 merged with origin/main 21774d6.
- **Base:** 199d859, the same base build as round 1.
- **Round 1 report:** audits/qa/2026-11-25-b3-batch-6-premerge.md
- **Overall verdict: FAIL (2 blocking items, both in app/compare/[pair]/pairs.ts).**
  - F1 to F8 and F10 are fixed and verified in the rendered output.
  - F9 is mostly fixed: 21 derived-gap sentences are gone.
  - One derived figure is left, in an FAQ question.
  - One comparative claim is left that lib/data.ts shows is false.
  - The FIX-LOG says F9 went "23 -> 0", which is not accurate.
  - Everything else passes: build, page count, metadata, gates, damage checks and merge hygiene.
  - Both fixes are one-line deletions.

## Method

- **Builds.**
  - The branch was rebuilt at 6d228c8 in the engineer's worktree. It exited 0 at 2360/2360, and the build left no tracked-file changes.
  - I reused the 199d859 base build from round 1.
  - Both builds emit an identical list of 2,335 HTML files.
- **Detectors.**
  - I re-ran every round-1 detector: blogcmp.mts, extra.mts, htmlcmp, ctx.mjs and bvp.mjs.
  - I added a second needle set for each F1 to F10 string and for each round-2 rewrite (qa6/needles2.json, qa6/htmlcmp2.out).
  - Round 1 already proved these detectors fire on real or injected defects. Each new needle has base > 0, except the strings that only exist in the new rewrites.
- **Gates.** I ran .husky/pre-commit on a fresh worktree (scratchpad/qab6gates2) at 199d859, with the 6d228c8 tree checked out into the index. The index equals the 6d228c8 tree exactly (98 files).
- **Diff reading.** I read every hunk of 3dad422..bd7f938: pairs.ts, lib/content.ts, lib/mba-seo-overrides.ts, the allowlist, lib/blog.ts, and all 15 page-content JSONs.

## F1 to F10, as written in round 1

| Item | Result | Evidence |
|---|---|---|
| F1 BVP A++ on all 11 lines, peers untouched | PASS | BVP pages printing "NAAC A+": 13 → 8. All 19 remaining hits are peer universities (NIU, Galgotias, Vignan, Sharda, Amity, Uttaranchal, Kurukshetra). A source scan of the 15 BVP JSONs finds 0 self-references to A+. The Amity "NAAC A+" inside mba.json:139 is unchanged. |
| F2 DPU fintech FAQ, including FAQPage schema | PASS | "fee saving with NAAC": 4 → 0. The JSON-LD answer and the RSC payload now both end "...partnership matter for your employer." |
| F3 IGNOU override clause gone, no replacement fact | PASS | 2 → 0. The intro now reads "...₹66,000 for the full two-year programme. Specializations cover...". No new claim was added. |
| F4 Galgotias ×4 | PASS | "second only to IGNOU": 4 → 0 rendered, and 4 → 0 in source. |
| F5 IGNOU BBA FAQ | PASS | "cheapest UGC-DEB valid": 4 → 0. |
| F6 mba-after-bsc LPA, CAGR and billion | PASS | "18-42 LPA" 4 → 0, "27 percent CAGR" 4 → 0, "USD 27 billion" 6 → 0. The three role LPA parentheticals are gone. The answer still reads as a sentence. |
| F7 CA "highest salary ceiling" | PASS | Gone from the post. The 4 rendered hits left are /guides/career-after-mba-india, which was out of batch scope in round 1 too. |
| F8 empty CFA list item and sibling "Adds Rs X LPA" | PASS | The list item is deleted and the 7 sibling figures are removed. The H2 now reads "Online MBA Certifications That Pair Well 2026". extra.mts reports 0 new `</strong></li>`. "Adds Rs" no longer appears on online-mba-salary-india-2026. |
| F9 pairs.ts derived saves, gaps and "cheaper" | **FAIL** | "save Rs" 12 → 0, and the "below the lowest" and "Difference:" sentences are gone. But two items remain (see R2-F1 and R2-F2). |
| F9 MUJ verdict rewrites | PASS (with advisory) | The fee halves are true on lib/data.ts: MUJ Rs 1,56,400 to 1,84,000 is below MAHE Rs 2,92,000. Round 1's "the lowest Manipal fee" was rightly dropped, because SMU Rs 1,20,000 is lower. "Coursera Plus" at MUJ was already stated in base pairs.ts (lines 54, 177, 219, 291), so it is not a new claim. But see advisory A1: lib/data.ts contradicts it. |
| F10 lib/content.ts market and % stats, plus the engineer's sweep | PASS | Rendered: "employ over 35%" 188 → 0, "grew 60% YoY" 164 → 0, "10,000 Cr" 82 → 0, "45% YoY" 264 → 0, "growing 60% YoY" 78 → 0. "60,000 Cr" is down to 6 hits, all from the blog post mba-marketing-career (the "per Dentsu" line, round-1 advisory). Remaining % strings in lib/content.ts are assessment splits, eligibility marks and dead salaryGrowth/salaryNote fields that no component reads. One more remains: a university-reported "65% Avg Salary Hike" in the JAIN MCA highlight, content.ts:4468 (advisory A4). |

## Blocking items

**R2-F1. A derived gap is still in an FAQ question.**
- Location: `app/compare/[pair]/pairs.ts:133`. It renders 4 times on /compare/manipal-jaipur-vs-manipal-mahe (visible and FAQPage).
- Text: `{ q: 'Is MAHE worth the extra Rs 1,08,000?', ...`. Rs 1,08,000 is 2,92,000 minus 1,84,000. Round 2 removed this same figure from lines 127, 131 and 135 but left the question.
- Fix: change q to `'Is MAHE worth the higher fee?'` and leave the answer unchanged.

**R2-F2. A "cheaper" claim that lib/data.ts shows is false.**
- Location: `app/compare/[pair]/pairs.ts:175`, rendered on /compare/lpu-vs-manipal-jaipur.
- Text: "LPU is slightly cheaper."
- Why it is false: lib/data.ts has LPU Rs 1,61,600 to 2,00,000 and MUJ Rs 1,56,400 to 1,84,000, so MUJ is lower at both ends. The FAQ directly below it on the same page lists those same two ranges.
- Fix: delete " LPU is slightly cheaper.".

**Same class; clear them in the same pass (not proven false, but not supported uniformly by lib/data.ts):**
- **:203 "CU is slightly cheaper."** CU runs Rs 1,75,125 to 2,38,000 and Amity Rs 2,07,000 to 2,25,000. CU's top price is above Amity's. Delete it.
- **:245 "JAIN is more affordable."** pairs.ts quotes JAIN at 1,60,000 to 1,96,000, but lib/data.ts has JAIN at Rs 1,60,000 to 2,98,000. Delete it, or scope it to the entry fee.
- **:82 "(nearly half of Amity)".** This is a derived ratio: 1,20,000 / 2,07,000 = 58%. Delete the parenthetical.

## Damage (everything in 3dad422..bd7f938)

| Test | Result | Evidence |
|---|---|---|
| Tag balance | PASS | 115 changed posts against base (mba-after-bsc is new in round 2). 0 balance changes. |
| Tables | PASS | 0 newly inconsistent tables. Only the two whole-table removals from round 1 remain. |
| Empty list items, headings, cells, FAQ answers | PASS | 0 empty items. The `</strong></li>` detector is clean, and so is the empty-FAQ scan. |
| Dangling sentences | PASS | Checked: the F6 answer, the "For BFSI risk roles." items, the IGNOU intro, the Galgotias "Your top priority is a low fee for a NAAC A+ MBA.", and the DPU answer. |
| "D2C brands have created" | PASS (minor) | The sentence is now "Digital Marketing is now a standalone specialisation, D2C brands have created explosive demand...". That is a comma splice carried over from the base sentence's structure. It renders on 40 pages. Optional fix at lib/content.ts:957: change ", D2C" to ". D2C". |
| JSON-LD | PASS | 0 parse failures on 2,335 pages. The DPU FAQPage text matches the visible FAQ. Blog FAQPage is generated from `faqs`. |

## Regression

| Test | Result | Evidence |
|---|---|---|
| Build | PASS | Exit 0, 2360/2360. |
| Page count | PASS | 2,335 HTML files, identical list to base. |
| No title or meta change | PASS | 0 diffs in title, description, og, canonical, robots or h1 across 2,335 pages. In source, 0 posts changed a non-body field. |
| updatedAt | PASS | All 115 changed posts carry 2026-11-25. The FIX-LOG says 114 because mba-after-bsc was added in round 2. |
| Gates on staged 199d859..6d228c8 | PASS | "all checks passed", exit 0, and the hook rewrote nothing (log: qa6/precommit2.log). |
| Truncation allowlist removal | PASS | check-string-truncation: "6 truncation(s) found, 6 allowlisted… OK". There is no stale-entry note any more. |
| Baselines only down | PASS | Round 2 does not touch blog-fee-baseline. Against base it is still 2020 → 1977, and check-blog-fees passes unchanged. |
| .gitattributes | PASS | scripts/vercel-ignore-build.sh is `attr/text eol=lf`, LF in both index and worktree. vercel.json and .gitattributes keep their default behaviour. |
| Merge hygiene | PASS | vercel.json, scripts/vercel-ignore-build.sh and .gitattributes are byte-identical to origin/main 21774d6 (`git diff --quiet` on each). The only differences between origin/main and 6d228c8 are batch-6 files. |

## Advisories (non-blocking)

- **A1. Coursera is not bundled at MUJ.**
  - lib/data.ts:1639 (MUJ `addOns`, source "Online Manipal MUJ MBA page, checked 2026-11-13; Rishi, confirmed 2026-11-13") says Coursera access is an optional Rs 3,999-a-year add-on, "not included in the programme fee".
  - pairs.ts still says MUJ "bundles free Coursera Plus" at :54, :131, :132, :175, :177, :219 and :291. Round 2's new verdict at :135 ("Coursera Plus at a lower fee than MAHE") repeats it.
  - All of this predates the batch. It is a factual error on 5 compare pages and should be queued; I recommend a Q for Rishi or a fix batch.
- **A2.** /guides/career-after-mba-india still has "highest salary ceiling" and "salary premium" (lib/guides.ts). This carries over from round 1.
- **A3.** The remaining blog market stats and frozen-meta superlatives listed in round 1 are unchanged, as expected.
- **A4.** lib/content.ts:4468-4469 (JAIN MCA highlight) has "65% Avg Salary Hike & 78% Career Success Rate". It is university-reported and has no source row.
- **A5.** Rendered "30-50%" (17 hits) comes from sources other than the lib/content.ts line round 2 removed: the homepage, affordable-online-mba, and the DSU AI pages. This is unchanged from base.

## Verdict

**FAIL. Fix R2-F1 and R2-F2**, ideally with the three same-class lines. Then re-verify:
- grep pairs.ts for "extra Rs", "slightly cheaper", "more affordable" and "half of".
- `.husky/pre-commit`.

No rebuild-level change is expected beyond /compare. Post-deploy checks (x-vercel-cache/age, scripts/check-live.mjs) are not applicable until merge.

---

## Round 3 (6fc160b), checked 2026-11-25

Scope: the fix for R2-F1/R2-F2, the same-class lines and the MUJ Coursera advisory (A1). Changed files in 6d228c8..6fc160b: `app/compare/[pair]/pairs.ts`, `lib/content.ts` (comma splice only) and `audits/FIX-LOG.md`. No other file changed.

Build: engineer worktree `.next`. BUILD_ID was written 2026-11-25 16:31:48, after the 6fc160b commit at 16:29:17 +0530, so the build is fresh. 2,335 HTML pages. Comparison build: 6d228c8, built clean in a separate worktree (exit 0), 2,335 pages.

### (1) Banned strings on /compare: PASS

Plain-substring counts, visible text plus FAQPage JSON-LD. Each detector was proven on base before I trusted its zero.

| Needle | Base hits (pages) | 6fc160b |
|---|---|---|
| Rs 1,08,000 | 2 | 0 |
| nearly half | 5 | 0 |
| slightly cheaper | 3 | 0 |
| JAIN is more affordable | 1 | 0 |
| bundles free Coursera | 5 | 0 |
| Coursera Plus bundled | 13 | 0 |
| Coursera Plus free | 4 | 0 |
| includes Coursera Plus | 14 | 1 (note) |

Note: the one remaining "includes Coursera Plus" is the FAQ **question** "Which includes Coursera Plus?" on /compare/manipal-jaipur-vs-chandigarh. Its answer now says MUJ lists Coursera as an optional add-on. It makes no claim, so it passes. A reword would be cleaner (advisory R3-A1).

### (2) Replacement text and logic: PASS

- "MUJ lists Coursera access as an optional add-on, not included in the programme fee." renders on 5 compare pages, 5 visible and 5 in JSON-LD. It matches lib/data.ts:1639 MUJ `addOns`, which says "Optional, not included in the programme fee", sourced to the Online Manipal MUJ MBA page, checked 2026-11-13, and confirmed by Rishi 2026-11-13.
- In the MAHE pair, "Is MAHE worth the higher fee?" renders 1 visible and 1 JSON-LD, and "You want a lower fee than MAHE" renders 1. No Rs 1,08,000 derived gap is left.
- Every edited FAQ answer is non-empty and every edited verdict array still has at least 2 items. That matters because lib/answers/compare-answers.ts:112 reads verdictA[0]/verdictB[0], and page.tsx maps the arrays.
- The kept "MUJ is more affordable" lines are true at both ends of the range on lib/data.ts:
  - vs Amity: MUJ 1,56,400 to 1,84,000 against Amity 2,07,000 to 2,25,000.
  - vs NMIMS: MUJ 1,56,400 to 1,84,000 against NMIMS 1,96,000 to 2,20,000.
- R2-F1 and R2-F2 are closed, and so are the same-class lines (LPU/CU "slightly cheaper", "nearly half", "JAIN is more affordable").

### (3) Diff scope and whole-site render: PASS

Whole-site diff, 6d228c8 build vs 6fc160b build, over all 2,335 pages. The page list is identical.
- **Visible text** changed on 49 pages, all expected:
  - 9 /compare pages:
    - amity-vs-chandigarh
    - amity-vs-jain
    - amity-vs-manipal-jaipur
    - lpu-vs-manipal-jaipur
    - manipal-jaipur-vs-chandigarh-mca
    - manipal-jaipur-vs-chandigarh
    - manipal-jaipur-vs-manipal-mahe
    - manipal-jaipur-vs-nmims
    - sikkim-manipal-vs-amity
  - 40 Digital Marketing pages, from the content.ts comma-splice fix. The old form has 0 hits.
  - No other page changed.
- **JSON-LD** changed on 9 pages, the same 9 /compare pages and nothing else.
- **Meta**: 0 changes across title, description, og:title, og:description, canonical and robots. The title extractor matched on all 2,335 pages, so the zero is real.

### (4) Pre-commit gates: PASS

I ran `.husky/pre-commit` on a fresh worktree with the index equal to 6fc160b, staged against 199d859 (98 files).
- Result: "pre-commit: all checks passed", exit 0.
- Every gate up to check-compare-pair-urls and typecheck:scripts ran. check-compare-inbound-links: 41/41 pages covered. check-coupon-claims OK. check-blog-fees unchanged from baseline. check-fee-wording is warn-only.
- The hook rewrote nothing: the working tree vs 6fc160b diff is 0 lines.

### Facts and sources

Round 3 adds no new fact. The only new claim, that Coursera is an optional add-on, carries the lib/data.ts MUJ `addOns` source and Rishi's 2026-11-13 confirmation. Everything else is a deletion.

### Advisories (non-blocking, queue for a later batch)

- **R3-A1.** On /compare/manipal-jaipur-vs-chandigarh, the question "Which includes Coursera Plus?" still frames Coursera as included. A reword would be cleaner, for example "Which offers Coursera access?".
- **R3-A2.** The amity-vs-manipal-jaipur FAQ answer still ends "Choose based on spec variety vs platform perks." With the Coursera perk removed, "platform perks" now has nothing to refer to.
- **R3-A3.** lib/coupon-pages.ts:160 (/coupons/manipal-jaipur-online-mba-discount-coupon-2026) still says "MUJ bundles free Coursera Plus access throughout the programme. This is included in the fee". This contradicts lib/data.ts MUJ `addOns` and is the same factual error, outside /compare.
- **R3-A4.** FIX-LOG acknowledges 34 more "bundled/free Coursera" lines in lib/blog.ts and page-content. They are still live.
- **R3-A5.** The MCA compare answer reuses the add-on fact sourced from the MUJ **MBA** page. Confirm on the MCA portal page that it applies to MCA.
- Round 2 advisories A2 to A5 are unchanged.

### Round 3 verdict

**PASS. Batch 6 (fix/b3-batch-6 at 6fc160b) is clear to merge.** R2-F1 and R2-F2 are fixed, the gates pass, the diff stays in scope, the render shows the change only where intended, and there are no unsourced new facts.

Post-deploy is still to do after merge:
- Wait for a fresh prerender, checking x-vercel-cache and age, since ?cb= may not get past the Vercel cache.
- Run scripts/check-live.mjs.
- Acceptance test: 0 hits for the 8 needles above on the 9 changed /compare URLs, plus the new add-on sentence present on 5 of them.
