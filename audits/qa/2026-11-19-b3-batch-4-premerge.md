# QA pre-merge: fix/b3-batch-4 (5182f3f) vs origin/main (b9e18b2), 2026-11-19

**Overall verdict: FAIL. Do not merge yet.** 3 FAILs: T6, T7 and T9. T9 is a new factual error that the branch introduces on 37 pages. The other 8 tests pass, and so do the build, all 45 pre-commit gates, the page count and the title/meta freeze.

## Method

- **Clean builds of both commits.** Base was built in a new worktree at b9e18b2. The branch was built in a second new worktree at 5182f3f. Both have node_modules junctioned and audit-data copied in. No dev server was running. Both `npm run build` runs exited 0, and each produced 2,335 prerendered HTML pages.
  - I did not use the engineer's own `.next` in agent-a0f9ffeb35a239595. It is **stale**: BUILD_ID is from 11:33, but lib/blog.ts was edited at 11:38 and the commit is from 11:40.
- **Gates.** In the clean branch worktree I ran `git reset --soft b9e18b2`, so the whole diff was staged, then ran `sh .husky/pre-commit`. Every gate passed ("all checks passed"). Afterwards HEAD was restored, and the gates left no modified files.
- **Detectors.** Visible text was taken from every HTML file (script, style and noscript removed, React `<!-- -->` markers removed, tags stripped). Each detector is a plain-substring check in a script file: extract.js, detect.js, detect2.js, t9.js, t9b.js, tokdiff.js and progfetch.js, all in `C:\Users\91706\AppData\Local\Temp\claude\4989ee246e828ad6\b8b6c658-5c86-4f0f-8a0d-9476c306dede\scratchpad\qab4\`.
  - Each detector was run on base first, to show it finds the defect. The table below gives the base count beside the branch count.
  - The T10 block is absent on base too, so for T10 I spliced the old SectionCoreSubjects text into a real page. The detector fired on the injected copy and stayed silent on the clean page.
- **Dynamic routes.** `/programs/[...slug]` is dynamic (ƒ), so I checked it with `next start` on both builds. I requested 260 candidate `/programs/{prog}/{spec}` URLs plus 12 named ones.
- **Whole-site text diff.** I compared the visible text of every page, base against branch, and grouped the changes by pattern (tokdiff.txt). Only these pages changed: the 7 blog posts in the diff, 1,047 uni spec pages, 217 hubs and 121 profiles. No `/compare`, `/programs`, `/coupons`, guide or static page changed. No `<title>` or meta description changed on any of the 2,335 pages.

## Results

| # | Test | Base | Branch | Verdict |
|---|---|---|---|---|
| 1 | Spec pages: no salary | Uni spec pages (1,307): "Salary: " on 1,037, "per annum" on 1,014. The FAQ answer "and other roles. ₹…" in raw HTML/JSON-LD on 982, plus 32 with "Rs". "(experience-dependent)" on 296. "AmbitionBox" on 0. | All 0, in both visible text and raw HTML. | **PASS** |
| 1b | `/programs/...` spec pages | The catch-all salary block did not render on base for any of 272 URLs, because the spec rich-content section is not reached. The removal is dead code, and harmless. | 0 | PASS (nothing to fix) |
| 1c | `/programs/mba/specializations/*` (out of scope) | 7 pages with "Salary range:" and 7 with "per annum" | 7 and 7, unchanged | Count only |
| 2 | GatedContent fee strip | 59 profiles showed "₹60,000 – ₹2,00,000". 102 showed a range. The strip differed from the hero "Total Fees" tile on 103. It was missing on 18. EMI showed on 33 non-MBA default tabs. | 0 placeholder. Strip equals the hero tile on 143/143. Fallback text on 88. Missing on 0. EMI on non-MBA tabs: 0. EMI on MBA tabs: 83. | **PASS** |
| 3 | "Fees: ₹0+" | 18 pages | 0 | **PASS** |
| 4 | Vignan FeeBreakdown | "EMI available through lending partners" on 9/16 Vignan pages. "Study Material Included (digital)" on 9. | 0 and 0. The new counsellor line is on 9. Non-Vignan pages: 521 and 521 on base, 521 and 521 on branch, so unchanged. | **PASS** |
| 5 | Vignan MCA/BCA: no hirers, no salary | The 6 MCA/BCA pages listed TCS…Accenture or foundit…Accenture, a "Top Hiring Companies" block, and "Salary: … per annum" on the spec pages. | No company names, no hiring block, no "Salary:"/"per annum"/"LPA". The profile payload no longer contains "Tech Mahindra" or "foundit". | **PASS** (see advisory A3) |
| 6 | No Shoolini "only"/"uniquely" claims (Shoolini pages, blogs, compare) | Shoolini pages: "the only" 5, "only UGC-DEB" 4, "uniquely" 4, "No other UGC-DEB" 4, "only option" 4 | Shoolini spec JSONs are clean. **3 claims remain in the Shoolini review blog.** | **FAIL** |
| 7 | Amity BBA/MCA posts: no "QS World"; QS Asia numbers match lib/data.ts | 17 "QS World" in 5 posts | 0 "QS World", 17 "QS Asia". No new sentence quotes a number, and lib/data.ts holds qsRank Amity 45, LPU 51. No title/seoTitle/meta changed. | **FAIL** (the new claim has no source) |
| 8 | No derived fee gaps | "69,400" ×4 and "69,000 to Rs 81,560" ×2 (amity-vs-lpu MCA). "Rs 6,500 cheaper" (ARKA JAIN finance). "34,000 to Rs 39,000" (Dr MGR finance and IS). "25,800" is in the Kurukshetra hub JSON only; it is latent and rendered on 0 pages on both commits. | 0 site-wide, in visible text, raw HTML and source (`git grep` on lib, app and components is empty). | **PASS** |
| 9 | Hero eligibility tile only from a record | 529 "10+2 + 50%" and 1,057 "Grad + 50%" pages. 857 hub/spec pages showed a 50% tile with no 50% record. | 0 "10+2 + 50%". 0 tiles without a record (812 pages have no record and no tile; 812 have a record and a tile). **But 37 PG pages (35 MBA, 2 MCA) now show "10+2".** | **FAIL** |
| 10 | Uttaranchal and ACU: no generic Core Subjects | 0 (A9 already removed it) | 0. The injection test fires. | **PASS** |
| 11 | Vignan review | "Physical exam centre may be required" 1, "Top 75 (2024)" 1, "NIRF 2024 … top 75" 1 | All 0. Tile reads "NIRF Management 101-125 band (2025)". Body reads "NIRF 2025 places it at #70 in the University category and in the 101-125 band in Management". Both match vignan sheet rows 34-35. Title and meta are byte-identical. | **PASS** |

**T9 spot-check (recorded values still shown):**
- Adichunchanagiri MBA: "Grad + 50%"
- Aligarh MBA: "Grad + 50%"
- Alliance MBA: "Grad + 50%"
- Amity MBA: "Grad + 40%" with its note
- Galgotias-type records: "Grad (pass)" on 8 pages
- "Grad + 60%" with the work-experience note on 10 pages

## Global

| Check | Result |
|---|---|
| Build | Base and branch both exit 0. |
| Gates | All 45 pre-commit gates pass on the staged full diff. `.husky/` and `scripts/` are untouched. In data/blog-fee-baseline.json the total went 2023 → 2021, business-data-analytics 43 → 42 and amity-vs-lpu 1 → 0, so only down. |
| Files touched | 23. All belong to items 1-11, plus FIX-LOG, sitemap-lastmod (the Kurukshetra hub) and the baseline. |
| Page count | 2,335 = 2,335. No route was added or lost. |
| Em dashes | 0 added lines contain "—". |
| JSON | All 13 changed JSON files parse. check-page-content-json passes. |
| "undefined", "NaN", "[object Object]", "₹ ", "₹+", "null+" | 0 pages on the branch. |
| Titles and meta | 0 changes across all pages. check-protected-pages passes. |

## FAILs and exact fixes

### F1 (T9). The hero tile says "10+2" on MBA/MCA pages (37 pages, 15 universities)

`components/UniHero.tsx:81-84` tests the 10+2 pattern before the graduation pattern. Records written for both levels therefore resolve to "10+2" on a PG hero. Examples of such records:
- "Graduation in any discipline for PG programmes, 10+2 for UG programmes"
- "…for the MBA, 10+2 for the BBA"
- IGNOU's "Varies by program (10+2 for UG, Graduation for PG)"

On base these pages showed a wrong default ("Grad + 50%"). They now show the wrong level.

Affected universities: ajeenkya-dy-patil, atlas-skilltech, bennett, choudhary-charan-singh (6 pages), dr-br-ambedkar (3), ignou (6), mohan-babu, pt-sundarlal-sharma, sandip, silver-oak, srinivas, swami-rama-himalayan and university-of-calicut, all on MBA. Plus sri-siddhartha-academy on MCA.

Fix: choose the level from the programme, not from whichever pattern matches first. Replace lines 81-84 with:

```ts
const isPG = /^(M|PG)/.test(program)
const eligLevel = !eligSource ? undefined
  : isPG ? (/grad|bachelor|degree/i.test(eligSource) ? 'Grad' : undefined)
  : (/10\s*\+\s*2|12th|class 12|higher secondary|senior secondary/i.test(eligSource) ? '10+2' : undefined)
```

Then re-run t9b.js. The expected result is 0 PG pages showing "10+2" and 0 UG pages showing "Grad".

### F2 (T6). Three Shoolini exclusivity claims remain in the review blog (`/blog/shoolini-online-mba-review`)

- `lib/blog.ts:29970`: "Highlighted tracks (orange border) are unique to Shoolini, unavailable at other UGC-DEB online MBAs at this price range."
  - Fix: delete the sentence, or change it to "Highlighted tracks (orange border) are the niche subject areas Shoolini lists."
- `lib/blog.ts:30082` (blockquote): "For those sectors, it is the only affordable accredited online MBA that actually teaches your domain."
  - Fix: "For those sectors, it offers subject areas that match your domain."
- `lib/blog.ts:30136`: "The niche specializations (Biotech, Pharma, Food Tech, Direct Selling, Real Estate) are unique to Shoolini and not available at most competitor universities."
  - Fix: delete from "are unique" to the end of that sentence, or reword to "…are less common among online MBAs."

Body-only edits. The title freeze is not touched. Keep any fee sentence verbatim (check-blog-fees).

### F3 (T7). "QS World" became "QS Asia" in 17 places, a claim no source row backs

The Amity verify sheet (`audits/verify/amity-university-online-2026-11-18.md`) says this claim should come out:
- Row 21: qsRank 45 has "No approved source", verdict REMOVE (Q26, still open; the interim is only "badge stays").
- Row 22: the verdict for "QS World" is FIX (**remove** "QS World"), not relabel.

There is no verify sheet for LPU at all, yet the MCA comparison table now credits LPU with "QS Asia University Rankings". This breaks the rule that no new fact appears without a source row. No sentence quotes a number, so nothing contradicts lib/data.ts. The problem is that the claim itself has no source.

Fix: remove the QS item instead of renaming it.
- `lib/blog.ts:36114, 36141, 36170, 36176, 36183, 36326, 36332, 36370`: delete ", QS Asia" or " and QS Asia" from each accreditation list. Also delete the paragraph "QS Asia University Rankings: Amity appears in the QS Asia University Rankings, which supports its international brand." Also delete the "QS Asia University Rankings" item from the Approvals table row.
- `lib/blog.ts:41545`: in the International Accreditations row, change the Amity cell to "WASC (USA), QAA (UK), WES" and the LPU cell to "Not listed".

Line 36370 sits inside a fee sentence ("Amity Online at ₹1,75,120 One-Time (…)"). Delete only the ", QS Asia" token, then run `npx tsx scripts/check-blog-fees.mjs`.

## Advisories (not blocking; mostly pre-existing)

- **A1. EMI beside a suppressed fee.** On 41 profiles the strip says "Contact our counsellor for current fee details" next to "EMI from ₹2,500/mo". That EMI is not backed by any shown fee. The hero top tile does the same, so the two are consistent, but the figure is likely a placeholder. Separately, the top tile in `components/UniversityPageClient.tsx` still prints `u.emiFrom` on 33 non-MBA default tabs, for example Alagappa B.Com. The strip fix did not cover the tile.
- **A2. Same class as T3, other templates.** `/universities` shows "Total fees ₹0" (`components/UniversityCard.tsx:185-189`) and `/programs` shows "From ₹0" (`app/programs/page.tsx:67`). Both were present on base.
- **A3. Salary claims with no figure.** The Vignan MCA/BCA spec pages, and the same template elsewhere, keep lines such as "Highest salary premium over general graduates, typically 2–3× non-specialised peers" (lib/content.ts whyChoose). Every hub also still says "Select a specialisation below for detailed syllabus, career scope, and salary data." (`components/SpecializationGrid.tsx:28`), which is now a broken promise.
- **A4. Side effect not in the FIX-LOG.** Removing "Rs 25,800" cleared the hubConflicts fee conflict. The Kurukshetra MBA hub now renders QuickAnswers fee content: "costs ₹1,02,000 in total for the 2 yrs programme", a fee table, and "5 specialisations for ₹1,02,000". The figure is traceable to lib/data.ts and getExactFee, and the lastmod was bumped. Please note it in the FIX-LOG.
- **A5. Shoolini FAQ answers now visible.** Removing the "Is Shoolini the only…" FAQs lets two existing answers render as visible text. Before, they were only in the raw payload.
  - Direct selling (`shoolini-university-online-mba-direct-selling-management.json:109`) names "MCA Direct Selling Guidelines 2021" and "SEBI Collective Investment Scheme regulations" as course content. The 2021 rules came from Consumer Affairs, not MCA, and the Shoolini sheet records only subject-area names.
  - Real estate (`…-real-estate-management.json:93`) gives RERA coverage details.
  - Recommendation: verify both answers, or drop them.
- **A6. Leftovers in files this batch touched.**
  - `dr-mgr-…-mba-finance.json`: "SMU at Rs 1,20,000 is Rs 16,000 to Rs 21,000 cheaper", another derived gap.
  - `dr-mgr-…-information-systems.json`: "Rs 1.36-1.41L".
  - `kurukshetra-university-online-mba.json`: "central university status". The Dr MGR JSON calls Kurukshetra a state university.
  - `online-mba-business-data-analytics-india-2026`: keeps "the only Business Analytics & AI track among UGC-DEB programmes" and "Only programme with explicit AI focus" (Alliance).
- **A7.** `shoolini-university-online-mba-real-estate-management.json` now contains "\n\n\n\n". It renders no empty paragraph, so this is cosmetic only.

## Live check

Not applicable. This is pre-merge, and nothing was deployed.

## Re-verify after fixes

Rebuild the branch in a clean worktree, then run detect.js, detect2.js, t9b.js and the Shoolini scan against fresh extracts. The expected results:
- 0 PG pages showing "10+2"
- 0 Shoolini "only"/"unique" claims in `/blog/shoolini-online-mba-review`
- "QS Asia" in the 5 posts down to the pre-existing count, with 0 new
- everything else unchanged
