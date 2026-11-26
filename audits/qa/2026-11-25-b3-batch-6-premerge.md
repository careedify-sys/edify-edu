# QA pre-merge: B3 batch 6 (fix/b3-batch-6 @ 3dad422)

- **Date:** 2026-11-25
- **Branch:** fix/b3-batch-6 @ 3dad422 (batch commit 09694a1 on 5ae5ade, merged with origin/main 199d859)
- **Base:** origin/main 199d859
- **Checker:** qa-checker (outsider; I did not write this batch)
- **Overall verdict: FAIL.** The build, gates, scope and HTML structure are clean. Most removals landed and render. But ten items are incomplete or still false on live-rendered pages:
  - BVP still printed as NAAC A+ on 11 pages.
  - DPU "fee saving" survives in an FAQ.
  - IGNOU and Galgotias "cheapest" claims survive in other wording, and the FIX-LOG's own data proves them false.
  - Half-removed market stats in lib/content.ts render on 41 to 94 pages each.
  - One list item was emptied.
  - Derived fee gaps remain in pairs.ts.

  Each FAIL below gives the file, line and exact fix. None needs a new fact, only removals.

## Method

- **Builds.** Base 199d859 was built in a clean scratch worktree (scratchpad/qab6base: node_modules junction, audit-data copied). The branch was rebuilt in its own worktree after the merge. No dev server was running. Both builds exited 0 at 2360/2360. Each emits 2,335 HTML files, and the two file lists are identical.
- **Source-level comparison.** I imported BLOG_POSTS from both trees with tsx and compared them post by post on metadata, tag balance, table cell counts, empty elements, FAQ counts, ld+json and punctuation artifacts. Script: scratchpad/qa6/blogcmp.mts.
- **Rendered comparison.** I counted plain substrings across all 2,335 pages, base against branch, and diffed title, description, og and canonical tags on every page (qa6/htmlcmp.mjs). I extracted visible-text context per hit (qa6/ctx.mjs).
- **Detector proof.**
  - Every detector fired on the base before I trusted a zero on the branch.
  - I also injected defects into an in-memory copy to prove the tag-balance, empty-element, empty-FAQ, title-change and table cell-count detectors catch real defects. The injected defects were a stray `</div>`, an empty `<li>`, an empty `<h2>`, ". .", "and and", "as shown above", an empty FAQ answer, a changed title, and an extra `<td>` in a row (selftest output: blog `[draft]` excluded).
  - The `</strong></li>` detector (qa6/extra.mts) found the real defect below.
- **Diff reading.**
  - I read the full word-level diff of lib/blog.ts: 459 changed-text hunks, all of them, not a sample.
  - I read all 201 page-content JSON hunks.
  - I read every hunk in lib/data.ts, lib/content.ts and pairs.ts.

## A. Removals

| Test | Result | Evidence (rendered hits, base → branch, pages) |
|---|---|---|
| "most affordable" outside kept list | **FAIL** | 203 → 49 (52 → 8 pages). One false, non-kept claim is still live (F3). The rest are kept, frozen-meta, or non-superlative. |
| "cheapest" outside kept list | **FAIL** | 725 → 241 (97 → 33 pages). The remaining hits are kept, or are table-sort labels, tags or frozen titles, except F5. |
| "lowest fee" / "lowest-fee" | PASS (with F4 below) | 83 → 30, 54 → 40. Remaining: SMU-within-Manipal (kept), the "sorted cheapest first" FAQ, DBA tables, and /fees (out of batch scope, advisory). |
| "widest" | PASS | Page-specific hits remaining are the kept "label-breadth" uses and the Manipal trio (MUJ 14 > MAHE 9 > SMU 6). |
| "best value" / "most economical" | PASS | 39 → 9 and 0 → 0. Remaining: Amity one-time payment mode (kept), and generic "cheapest is not the best value". |
| "highest-paying" / "top-paying" / "highest salaries" / "salary premium" | **FAIL** | "highest-paying" 66 → 14: all 14 are the frozen metaDescription of career-after-mba (12) and its listing card. "salary premium" 54 → 8: all in /guides and the Q52 spec page, outside batch files. "highest salary" 57 → 8, of which 4 is a body FAQ the batch missed (F7). |
| "Rs 18 to 42 LPA" | **FAIL** | That exact form is gone (2 → 0). The same figure is still live as "Rs 18-42 LPA" in an FAQ (F6). |
| Every LPA/CTC figure on mba-finance-career-salary-scope-2026 and mba-data-science-analytics-career-2026, body and FAQ | PASS | Source scan of content, FAQs and CTA finds 0 LPA, CTC or salary figures. The only figure left is the frozen metaDescription "salary Rs 6L to Rs 22L" (title freeze, advisory). |
| BITS "top-5 engineering" | PASS | Rendered 10 → 0 (4 pages). Source 5 → 0. |
| BVP NAAC equals lib/data.ts (A++) on every BVP page | **FAIL** | 51 BVP pages. 13 pages still print "NAAC A+" (base 13). 11 of them are BVP self-claims (F1). |
| Market stats ("billion", "lakh crore", "CAGR", "grew 18 percent", "11M-plus") | **FAIL** | billion 24 → 12, lakh crore 14 → 6, CAGR 78 → 10, "grew by 18 percent" 1 → 0, 11M-plus 2 → 0. The batch removed some stats from one field and left the same stat in the sibling field on the same page (F10). The DS post's "USD 27 billion / 27 percent CAGR" survives verbatim in another post (F6). |
| DPU "fee saving" | **FAIL** | Removed from the comparisons body. Still in the FAQ answer, which is shipped in FAQPage JSON-LD and the RSC payload (F2). |
| Dr MGR "99,600" | PASS (source) | The JSON comparison heading went 1 → 0. Note: the Dr MGR HR page does not render its comparisons section on base or branch, so a render-level detector cannot fire. Source-level evidence only. |
| Shoolini agri "unique" | PASS | Source 1 → 0. |

## B. Kept list

| Kept item | Result | Check against lib/data.ts |
|---|---|---|
| Manipal trio fees | PASS | SMU 1,20,000 < MUJ 1,56,400 to 1,84,000 < MAHE 2,92,000. |
| Manipal trio spec counts | PASS | MUJ 14, MAHE 9, SMU 6. |
| Amity payment modes | PASS | BBA modes 1,75,120 one-time and 1,99,000 semester-wise (data.ts:535). MBA one-time 2,07,000 (data.ts:549). |
| Advisory on kept claims | n/a | Several kept SMU superlatives carry a stale "Rs 1,10,000 / ₹1.1L" figure: online-manipal review, online-mba-karnataka-2026, data.ts:1906 tagline, syllabus-manifest. The superlative is still true, but the figure disagrees with feeMin 120000. |
| pairs.ts floor gaps | **FAIL** (F9) | The gaps are derived differences, our own subtraction of two published figures. Lines 176, 190, 204 and 218 (exact text in F9). |

## C. Damage

| Test | Result | Evidence |
|---|---|---|
| Tag balance per changed post (div, table, thead, tbody, tr, td, th, ul, ol, li, p, details, summary, section, h2-h4, strong, a, span, figure, svg, blockquote, script) | PASS | 114 changed posts, 0 balance changes. The detector fires on an injected `</div>`. |
| Table header/row cell counts | PASS | 0 newly inconsistent tables. Two tables were removed whole (marketing "Digital Premium", data-science "GenAI Premium"). The detector fires on an injected `<td>`. |
| Empty headings, li, td, p, FAQ q/a | **FAIL** (F8) | One list item is reduced to a bare label. No empty h, td, p or FAQ answer. No changed JSON has a new empty string (2 pre-existing empty `redFlags.intro`, identical on base). |
| Dangling references ("as shown above", "this premium", "the table above", ...) | PASS | No new hits. "the table above": 30 → 30, all pre-existing and still pointing at a table that exists. Advisory: online-mba-karnataka-2026 (blog.ts:43194) ends "Alva's fills the absolute floor", the last trace of the deleted "cheapest in Karnataka" claim. |
| Double spaces, ". .", ",.", orphan conjunctions, lowercase starts | PASS | None introduced. Cosmetic only: lib/content.ts:643 B.Com paragraph starts with a space (markdown, renders fine); upes-online-mba-power-management.json body has "\n\n " before "Power Management". |
| JSON-LD | PASS | 0 parse failures across 2,335 pages. Blog FAQPage is generated from `faqs`, so deleted FAQs drop out of schema and the visible block together. The two deleted in-body microdata FAQ blocks were removed whole and stayed balanced. |
| Galgotias BA FAQ question rewrite | PASS | New question "What does this MBA cost?" matches its answer. |

## D. Regression

| Test | Result | Evidence |
|---|---|---|
| Build | PASS | Exit 0 on both, 2360/2360 static pages each. |
| Page count | PASS | Identical 2,335-file HTML list on base and branch. The /api route exists in both. |
| Title, seoTitle and meta unchanged | PASS | Source: 0 posts changed title, metaDescription, seoTitle, h1Title, tags, targetKeyword, quickFacts, status, publishedAt, heroImage, category or relatedUniversities. Rendered: 0 diffs in title, description, og:title, og:description, canonical, robots or h1 on 2,335 pages. |
| updatedAt | PASS | 114 posts have body changes, and all 114 carry 2026-11-25 (94 bumped now, 20 already at 2026-11-25 from batch 5). That is 110 published, 1 redirected and 3 drafts. No updatedAt-only change. FIX-LOG says "106"; that is a doc miscount. |
| JSON parses | PASS | 84 changed JSON files parse. check-page-content-json passes. |
| Scope | PASS | 89 files in 5ae5ade..09694a1: lib/blog.ts, lib/content.ts, lib/data.ts, pairs.ts, 80 page-content JSONs, blog-fee-baseline, sitemap-lastmod and audits. Diff against 199d859 shows no WhatsApp files. |
| New facts | PASS | The rewrites only reuse values in lib/data.ts or the NAAC audit, and add no figure: NIU A+ (naac-audit row 72), LPU A++, DPU A++, BVP A++ (row 56), JAIN 16 specs, MUJ 14 and BVP 14 specs. |
| Gates not weakened | PASS | .husky/ and scripts/ unchanged. blog-fee-baseline only went down (totalUnverified 2020 → 1977, every per-slug value lower). sitemap-lastmod adds 49 2026-11-25 entries. |
| .husky/pre-commit on staged 199d859..3dad422 | PASS | Ran in scratchpad/qab6gates. "all checks passed", and the hook rewrote nothing (log: scratchpad/qa6/precommit.log). |
| Truncation allowlist "ignou-online .tagline" (report only) | NOTE | It is stale because of this batch. data.ts:9561 dropped "most affordable online degrees in India;" and the tagline went from exactly 120 characters (the allowlisted R5 false positive) to 79. check-string-truncation says to remove it. Fix: delete the ignou-online entry (data/string-truncation-allowlist.json:29-33). |

## FAILs and exact fixes

**F1. BVP self-described as NAAC A+ (lib/data.ts says A++).** All 11 lines below render. Change "NAAC A+" to "NAAC A++" in each:
- `lib/data/page-content/bharati-vidyapeeth-university-online-mba.json:5` "from a Pune-based NAAC A+ institution"
- `...-mba.json:139` "Bharati Vidyapeeth: NAAC A+, NIRF University #59". Leave the Amity half of that answer as is.
- `...-mba-agribusiness.json:60` "You want a NAAC A+, NIRF University #59"
- `...-mba-business-analytics.json:59` "You want a NAAC A+, NIRF University #59"
- `...-mba-event-management.json:56` "from a NAAC A+, NIRF #59 university"
- `...-mba-finance.json:59` "from a NAAC A+, NIRF #59 university"
- `...-mba-infrastructure.json:57` "Pune legacy (est. 1964), NAAC A+,"
- `...-mba-marketing.json:59` "You want a NAAC A+ marketing MBA"
- `...-mba-production-operations.json:59` "from a NAAC A+ Pune institution"
- `...-mba-project-management.json:59` "at Rs 1,78,000 from NAAC A+."
- `...-mba-retail.json:61` "from a NAAC A+ institution"
- `...-mba-sports.json:57` "NAAC A+ credentials at Rs 1,78,000"

Do not touch the peer grades in the same files (Vignan, Galgotias, NIU, Sharda, Amity, Kurukshetra, Uttaranchal are A+).

**F2. DPU "fee saving".**
- File: `lib/data/page-content/dr-dy-patil-vidyapeeth-online-mba-fintech-management.json:93`
- Delete the final sentence " Choose DPU if fee saving with NAAC A++ is the priority."
- It ships in FAQPage JSON-LD on /universities/dr-dy-patil-vidyapeeth-online/mba/fintech-management.

**F3. IGNOU "most affordable ... in India" is false.**
- File: `lib/mba-seo-overrides.ts:119`, live on /universities/ignou-online/mba.
- Why it is false: lib/data.ts has DDU Rs 52,500 (A++) and Andhra Rs 62,200 (A++) below IGNOU Rs 66,000. The FIX-LOG cites this itself.
- Replace ", making it the most affordable UGC-DEB approved management degree in India from a NAAC A++ accredited central open university." with ". IGNOU is a NAAC A++ accredited central open university."

**F4. Galgotias "second only to IGNOU" is false.**
- Why it is false: Mangalayatan Rs 67,000 is NAAC A+ and below Rs 80,200. DDU and Andhra are also below Rs 80,200. The batch removed every "second-lowest after IGNOU" but left this wording.
- Files, delete " At Rs 80,200, Galgotias is second only to IGNOU." in each:
  - `lib/data/page-content/galgotias-university-online-mba-finance.json:98` (renders on /mba/finance)
  - `galgotias-university-online-mba-hr-management.json:102` (renders on /mba/hr-management)
  - `galgotias-university-online-mba-marketing-management.json:102` (source only; slug mismatch, does not render today)
  - `galgotias-university-online-mba-operations-management.json:102` (source only)

**F5. IGNOU BBA "cheapest" survives in an FAQ.**
- File: `lib/blog.ts:38843` (best-online-bba-colleges-india-2026, published FAQ).
- The batch removed the same claim from the h3 and two paragraphs of this post. IGNOU has no BBA fee in lib/data.ts.
- Replace "(cheapest UGC-DEB valid BBA, central university statute" with "(central university statute".

**F6. The "Rs 18 to 42 LPA" figure and the DS market stat survive in mba-after-bsc-is-it-good-2026.**
- `lib/blog.ts:10188` FAQ: delete " (Rs 18-42 LPA range)".
- `lib/blog.ts:10192` FAQ: delete "India data analytics market growing 27 percent CAGR, projected USD 27 billion by 2033. ". This is the stat the batch deleted from the DS post. In the same answer, also strip "(Rs 18 to 32 LPA)", "(Rs 25 to 40 LPA)" and "(Rs 35 to 60 LPA)".
- Both strings exist only in these two FAQ answers (lib/blog.ts has no other hit). They render twice per page, once as the visible FAQ and once in FAQPage schema.

**F7. Pay superlative missed.**
- File: `lib/blog.ts:7464` (career-after-bcom-jobs-salary-courses-2026 FAQ).
- The batch removed the sibling "highest-paying" FAQ and body line in this post.
- Replace "CA offers the highest salary ceiling but has a very low pass rate" with "CA has a very low pass rate".

**F8. Emptied list item.**
- File: `lib/blog.ts:11881` (online-mba-salary-india-2026), which now renders `<li><strong>CFA Level 2 or 3 plus MBA Finance:</strong></li>`.
- Delete the whole line.
- Also note: its siblings at 11882-11884 still print "Adds Rs 3 to 8 LPA" and the like, under the H2 "Certifications That Add Premium". Either remove those figures in the same pass or record why this list is exempt.

**F9. pairs.ts derived floor gaps** (`app/compare/[pair]/pairs.ts`). Each figure is our own subtraction, not a published number. Delete the gap sentences and keep the two published ranges plus "Fees are indicative":
- :176 "MUJ upfront is Rs 5,200 below the lowest LPU fee; the full MUJ fee is Rs 22,400 above it."
- :190 "The lowest LPU fee is Rs 13,525 below the lowest CU fee, and the top CU list price is Rs 38,000 above the top LPU fee."
- :204 "The lowest CU fee is Rs 31,875 below the lowest Amity fee, but the top CU list price is Rs 13,000 above the top Amity fee."
- :218 "MUJ upfront is Rs 18,725 below the lowest CU fee. The full MUJ fee is Rs 54,000 below the top CU list price."
- Same class, and two of these are arithmetically wrong:
  - :83 "SMU saves Rs 1,05,000". Against the Rs 2,07,000 stated in the same sentence the gap is Rs 87,000.
  - :162 "LPU is Rs 25,000-45,000 cheaper". 2,07,000 minus 1,61,600 is 45,400.
- Recommended in the same pass: the remaining "saves Rs X / save Rs X" lines at :43, :59, :113, :131, :135, :145, :150, :246, :251, :413, :414, :419 and :428.

**F10. Market stats half-removed in lib/content.ts.** The batch deleted these stats from one field and left them in the sibling field on the same page. All render:
- :826 overview "sectors that employ over 35% of all MBA graduates in India" (94 finance spec pages). Fix: end the sentence at "financial advisory."
- :958 overview "India's D2C revolution and ₹60,000 Cr+ digital ad spend market have created" (41 pages, also mba-marketing-career-salary-jobs-2026). Fix: "D2C brands have created".
- :1136 whyChoose "AI job postings in India grew 60% YoY in 2024, fastest of any IT specialisation" and "India government's ₹10,000 Cr AI Mission is creating public sector AI roles" (41 AI spec pages). The batch removed the same "grew 60% YoY" from the overview at :1135. Fix: delete both array items.

## Advisories (not blocking; outside batch files or frozen)

- **Frozen titles and metas still carry claims the batch removed from the body:**
  - DY Patil review meta: "most affordable WES-recognised online MBA".
  - career-after-mba meta: "highest-paying".
  - affordable-online-mba title: "Cheapest Programs".
  - mba-finance meta: "salary Rs 6L to Rs 22L".
  - These belong in the title-freeze queue (after 5 Dec).
- **Untouched files with the same claim classes:**
  - app/fees/page.tsx:184 "₹60K lowest fee". DDU's Rs 52,500 is lower, and the file's own comment at :17 says the dataset cannot support "lowest fee".
  - components/MBAHubClient.tsx:36 "Lowest fee at Rs 66,000" (not rendered in any prerendered page).
  - lib/guides.ts:399 and :523 ("salary premium", "highest salary ceilings").
  - app/tools/salary-calculator/page.tsx:251 "Highest paying specialization".
  - lib/coupon-pages.ts:266 and :271 (SMU most affordable; kept trio, true).
  - lib/reviews-data.ts:9 "Best value MBA".
- **lib/data.ts:1908 (SMU forWho):** "Students wanting the lowest-fee Manipal MBA" prints on SMU's BBA, MCA and spec pages too.
- **IGNOU as fee floor:** "Fees at UGC-DEB approved universities run from ₹66,000 (IGNOU)" in 4 spec-guide FAQs (blog.ts:39830, 40046, 40266, 40479) implies IGNOU is the floor. DDU at Rs 52,500 is lower.
- **Remaining blog market stats, not in the batch list:**
  - gd-topics (USD 200 billion, Rs 1.78 lakh crore GST; GD prep data)
  - mba-international-business (USD 421.32 billion)
  - online-mba-ahmedabad-gujarat (USD 250 billion, USD 12 billion)
  - mba-marketing-career (Rs 60,000/85,000 Cr "per Dentsu", a non-approved source)
  - the Q52 spec pages (CAGR, $638B, ₹100 lakh crore)
- **mba-vs-bba-which-is-better-2026:** still shows a BBA-vs-MBA salary table with a "Premium 2x" column.
- **Leftover worktrees:** scratchpad worktrees qab6base and qab6gates are left registered (qab6gates holds the staged branch diff). They can be removed with `git worktree remove --force`.

## Verdict

**FAIL.** Fix F1 to F10. All are deletions or one-token grade corrections. Then rerun:
- `npx tsx scratchpad/qa6/blogcmp.mts`
- `node scratchpad/qa6/htmlcmp.mjs`
- `node scratchpad/qa6/bvp.mjs`
- `.husky/pre-commit`

Post-deploy checks (x-vercel-cache/age, check-live.mjs) are not applicable until a merge is approved.
