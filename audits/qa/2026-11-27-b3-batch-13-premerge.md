# QA: B3 batch 13, pre-merge (fix/b3-batch-13 at dd2c07f)

Date: 2026-11-27. Checker: qa-checker (outsider; did not write this batch).
Base: origin/main 9522c13. Branch: dd2c07f, one commit.
Files changed: audits/FIX-LOG.md, audits/QUESTIONS-FOR-RISHI.md, components/EdifyRecommends.tsx (deleted),
data/blog-fee-baseline.json and lib/blog.ts. Nothing outside the item.

## Verdict: PASS (all 7 tests). Four advisories below, none blocking.

---

## Test 1: blog EMIs (24 posts). PASS

**What is left is all kept and sourced.**
- I listed every rupee figure in 500-60,000 near "EMI", "month", "/mo" or "instalment" in all 26 changed posts
  (content, FAQs and meta; the script is qa13/emiscan.mts).
- The only university-tied EMI figures left are:
  - JAIN 6,917
  - Amity 8,906
  - MUJ 6,517
  - UU 3,733
  - Alliance 8,700
  - MUJ list 7,667
  - Amity premium 13,023
  - Amity list 9,375
  - Amity MCA 7,877
- Every other hit is a semester fee, registration fee or exam fee.
- I ran the same scan over all 271 posts. Outside the BBA cluster, the university-tied EMIs are only kept figures:
  - Adichunchanagiri 4,417 (a kept emiFrom);
  - Amity 8,906 (amity-online-mba-hr-worth-it and ignou-online-mba-review-2026);
  - MUJ 6,517 and 7,667 (muj-online-mba-review-2026).
- The rest are generic examples or salaries.

**Each source states the figure:**
- **The 7 emiFrom values:** confirmed in the batch 12 QA. Their sources exist and state them.
- **MUJ 7,667:** lib/data.ts:1610 has the owner-supplied January 2027 chart, "MBA 1,84,000 sem 46,000 EMI 7,667; 15% discount
  1,56,400 / 39,100 / 6,517". feePlans has `{ mode: 'EMI (per month)', instalment: 7667 }`.
- **Amity 9,375:** the "Official source says" column of audits/verify/amity-university-online-2026-11-18.md:33 reads
  "24-month no-cost EMI ₹8,906/month (list ₹9,375)". Source: amityonline.com MBA page.
- **Amity 13,023:** the official column at :35 reads "EMI ₹13,023/month on the Healthcare and Dual pages". The International
  Finance page prints ₹13,022. The difference is ₹1, it was already there, and it is noted on the sheet.
- **Amity MCA 7,877:** commit 87ecb86 (Rishi Kumar, 6 Oct 2026, "Amity online MCA is Rs 1,99,000") reads
  "zero-cost EMI from Rs 7,877/month" in its message and adds the blog line "the starting figure Amity publishes".

**Removals read cleanly.**
- I read every changed sentence in the rendered visible-text diff of all 27 changed pages (qa13/vd.txt) and the source
  diff (qa13/blogdiff.txt, qa13/wd.txt).
- Each EMI clause was removed with its sentence boundary intact, or the table cell became "On request" with the column kept.
- Replacements use the kept figure: Amity 8,625 became 8,906, MUJ 6,375 became 6,517, and JAIN 7,292 became 6,917. The derived
  "₹2,250/month" saving became "MUJ has the lower monthly figure."
- None of these values appears anywhere in lib/blog.ts or in rendered blog HTML:
  - 8,167, 7,297, 16,333, 6,375, 17,750, 8,625, 4,762;
  - 12,167, 6,733, 6,319, 6,111, 6,875, 3,125, 4,583, 6,729, 7,955, 7,333.
- The 6,250 and 7,292 hits that remain are non-EMI. 6,250 is a different sentence in other posts. 7,292 is a per-semester
  saving in chandigarh-online-bba-review, a BBA post outside scope.

**uu-doon SVG: no orphans.**
- The whole `<div>` holding the SVG and its caption went as one block.
- In the post, "EMI Comparison", "Similar Programs", "chart", "svg", DSU, NMIMS and the bar values all count 0.
- The remaining "below" and "above" refer to other sections.
- UU's own ₹3,733/mo is still in the fee table. Tags are balanced.

**BBA cluster (Q58) untouched.**
- The rendered `<body>`, minus scripts, is byte-identical between base and branch for all six posts:
  - amity-online-bba-fees-2026, amity-online-bba-review-2026, muj-online-bba-review-2026;
  - mahe-online-bba-review-2026, best-online-bba-colleges-india-2026, chandigarh-online-bba-review-2026.
- None is in the changed-post list. Q58 is in QUESTIONS-FOR-RISHI.md.

## Test 2: fee text touched for check-blog-fees. PASS

Checked against getExactFee and getDisplayFee on the branch lib/data.ts (script qa13/fees13.mts):

| Sentence now | lib/fees.ts / lib/data.ts | Result |
|---|---|---|
| "MAHE total fee: ₹2,92,000" + "MAHE MBA fee: ₹2,92,000" (x2), Karnataka | getExactFee ₹2,92,000 | MATCH |
| "University of Mysore total fee: ₹1,60,000" | getDisplayFee ₹1,60,000 (rule 1, pd.fees "₹160K – ₹160K"); getExactFee **none** | Matches lib/data.ts; see A1 |
| "Yenepoya total fee: ₹1,20,000" | getDisplayFee ₹1,20,000 (pd.fees "₹120K – ₹120K"); getExactFee **none** | Matches lib/data.ts; see A1 |
| "NMIMS total fee: ₹1,96,000 to ₹2,20,000" | getExactFee ₹1,96,000–₹2,20,000 | MATCH |
| "NMIMS below Symbiosis on fee" | NMIMS 1,96,000–2,20,000 vs Symbiosis 3,15,000–3,70,000 | True, and no figure |
| Bharati Vidyapeeth "₹1,78,000, or ₹1,68,000 paid in full upfront" | feeBreakdown.mba list 1,78,000, net 1,68,000 "paid in full upfront", source "Rishi, confirmed 2026-11-13"; getExactFee prints the same | MATCH |
| Amity MBA "Rs 2.07 to 2.25 lakh" (data-science table) | getExactFee ₹2,07,000–₹2,25,000 | MATCH (was a stale Rs 1.99 lakh) |
| NMIMS-Symbiosis derived gap "₹1.2 to ₹1.5 lakh" | removed | Gone |
| UPES "(Year 1: ₹95,000 + Year 2: ₹80,000), payable as no-cost EMI starting at ₹7,955" | removed from Quick Answer | Gone; split stays in the next bullet and the fee table |

**data/blog-fee-baseline.json** changes in only two places: totalUnverified 1956 to 1955, and
online-mba-karnataka-2026 18 to 17. No entry went up. The hook's check-blog-fees reports "1955 unverified, unchanged from baseline".

## Test 3: rule 4d fallback held. PASS

- `git diff --quiet 9522c13 dd2c07f -- lib/fees.ts` exits 0, so lib/fees.ts is byte-identical to base.
- data/fee-mismatch-baseline.json is not in the diff. The hook's check-fee-baseline reports "205 suppressed, unchanged from baseline".
- Madurai and Mumbai therefore behave as on main, which matches batch 12's advisory A3 and Q59.
- Q59 is recorded in QUESTIONS-FOR-RISHI.md.

## Test 4: EdifyRecommends deleted. PASS

- components/EdifyRecommends.tsx exists at 9522c13 and is absent at dd2c07f.
- A grep for "EdifyRecommends" in app/, components/, lib/, scripts/ and data/ on the branch tree returns 0 hits.
- `npx tsc --noEmit -p tsconfig.json` on the branch tree (scratch worktree) exits 0.
- The engineer's branch build is fresh: .next BUILD_ID was written at 00:03:59, after the 00:00:32 commit.
  It holds all 2,335 prerendered pages.
- My base build at 9522c13 exited 0.

## Test 5: placement post. PASS

In online-mba-with-placement-india-2026:
- Percentage mentions fell from 11 to 2 in visible text and from 4 to 1 in JSON-LD. The ones left are the two
  "100 percent placement guarantee" warnings, which have no figure claim.
- All of these count 0 in both visible text and JSON-LD: "30-40", "5-10 percent", "1-2 percent", "30-50", "25-40", "80-90", "25-35", "Rs 4-7".
- The "What I have learnt from alumni feedback" paragraph and the "Average packages" table row are gone.
- Replacements read cleanly: "describe the top of the batch", "opens mid-tier hiring doors" and "genuinely useful for the
  motivated students who actively use it".
- All 3 tables have uniform row widths: [2×11], [3×6] and [2×9].
- The FAQ mirror holds: no page gained an unmirrored answer.

## Test 6: international specialisations. PASS

- All six "Rs X to Y LPA at year 5" clauses are gone from "Best International Online MBA Specialisations 2026".
- Each item now reads "{Specialisation}: {school note}." For example: "Global Strategy plus Consulting: Best at IE,
  Warwick, Imperial." All six are clean sentences, and the list is balanced.

## Test 7: damage and gates. PASS

- **updatedAt:** I compared BLOG_POSTS at base and branch (qa13/posts.mts). Exactly 26 posts differ outside
  updatedAt, and all 26 moved to 2026-11-27. No other post's updatedAt changed.
- **Titles:** title, seoTitle, metaDescription, h1Title, status and slug are unchanged on all of them. 0 meta changes
  across all 2,335 pages. check-protected-pages reports "8 protected paths and 8 frozen posts checked", OK.
- **Rendered pages:** 25 blog pages changed, because online-mba-fee-comparison-india-2026 is a draft and not rendered.
  Two online-mca mirrors also changed, the same two MCA posts. The page list is identical (2,335 = 2,335).
- **Tag balance:**
  - The rendered body is balanced on all 27 changed pages except online-mba-lpu-review-2026 div 130/131, which is identical at base.
  - The source content of all 26 posts, including the draft, is balanced on 18 tag types, with the same LPU -1 div at base.
- **JSON-LD:** 0 parse failures, 0 pages with "undefined" or "NaN", and 0 pages where unmirrored FAQ answers increased.
  The damage scan found no new empty elements, dangling words or inconsistent tables.
- **Full diff read:** the only figures added are the kept EMIs (8,906 and 6,517 replacements, 6,917 for JAIN) and the
  getExactFee and lib/data.ts fees in test 2. Everything else is deletion.
- **Line endings:** every changed blob is LF at both commits (0 CR lines), the same as base.
- **.husky/pre-commit:**
  - Run on a staged copy of 9522c13..dd2c07f in a scratch worktree, with the index equal to the dd2c07f tree.
  - Exit 0, "all checks passed", and the hooks modified no files.

---

## Advisories (not fails)

- **A1. Mysore and Yenepoya.** These fees now resolve as MATCH only because the sentence names the university.
  - The figure was already there; the batch only added the subject. It matches getDisplayFee, but getExactFee returns none:
    pd.fees is K-notation and feeMin/feeMax is 60,000-2,00,000. So /fees shows "On request" for both while the Karnataka post
    states the exact ₹1,60,000 and ₹1,20,000.
  - No audits/verify sheet exists for either.
  - This is where the Karnataka 18 to 17 drop comes from. Worth a portal check before treating these as verified.
- **A2. nmims-vs-symbiosis-online-mba-2026.**
  - With the EMI Comparison H3 and block gone, the paragraph "SSODL publishes semester instalments, not a monthly EMI, so compare the
    semester amounts instead... the monthly difference may be manageable" now follows the Higher-Tier "Gap" paragraph.
  - It still reads, but "the monthly difference" no longer has a monthly figure behind it. Consider "the fee difference".
- **A3. Spec pages still print the same derived EMIs this batch removed from blogs** (lib/data/page-content/*.json, outside this item):
  - MAHE ₹12,167/month on 6 MAHE spec pages;
  - LPU ₹6,733/month on 9 pages (8 LPU specs plus galgotias mba/finance);
  - Jindal ₹6,319 on 6 Jindal spec pages.
  - Candidate for the next batch.
- **A4. Pre-existing, untouched.**
  - amity-vs-manipal-online-mba-2026 still shows the old MUJ chart, one-time ₹1,53,000 and semester ₹1,80,000.
    That gives "₹54,000 saved", sitting beside the Jan 2027 EMI ₹6,517.
  - The placement post keeps unsourced sector "Average packages Rs 6-12 LPA" lines.
  - UPES posts say ₹1,75,000 where getExactFee gives ₹1,75,000–₹2,20,000.

## Cleanup
- I removed the scratch worktrees qab13base and qab13gates, rmdir'ing the node_modules junctions first, then ran prune.
- I started no servers. No site files were edited.
