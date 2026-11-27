# QA: B3 batch 15, pre-merge (fix/b3-batch-15 at 5e59904, base 28cbba1)

Checked 2026-11-27 by qa-checker. I did not do this work. No site edits, commits or pushes.

**VERDICT: FAIL** on three findings (F1-F3). All three are small text or one-line fixes. Gates, damage checks and tests 2, 4, 6 and 7 pass.

## Method

- **Fresh `next build`** of each commit in separate scratch worktrees:
  - base 28cbba1: EXIT 0
  - branch 5e59904: EXIT 0
  - Compared all 2,335 prerendered pages in `.next/server/app`: visible text, JSON-LD, title, meta, OG/Twitter and robots.
- **/programs/mba is not prerendered.** I served both builds with `next start` on ports 3961 and 3962 and diffed the responses. Both servers are now stopped.
- **Pre-commit:** ran `.husky/pre-commit` on a third worktree. Its index equals the 5e59904 tree (`git diff --cached --quiet 5e59904` passed).
- **Page-content JSON:** walked every string in base and branch.
- **UGC-DEB register:** the live register at deb.ugc.ac.in/Home/HEI_Prog_List, fetched 27 Nov (11 MB) and parsed by mode.

## Test 1: Yenepoya MBA ₹50,000 (data PASS, knock-ons FAIL, see F1 and F2)

**Data.** lib/data.ts matches row 4 of audits/verify/fees-mku-mumbai-mysore-yenepoya-amitymca-2026-11-27.md:

- `programFees.mba.fee` 50000, feeMin/feeMax 50000, MBA pd.fees '₹50,000'.
- officialUrl and feeVerifiedOn 2026-11-27 are set.
- Registration (1,500) and exam (3,000 a year) are not summed. ACCA (+54,000) is not merged.
- The source comment cites both portal pages.

**Mirrors and fee output.**

- data-slim and fees-hub-data both carry 50000 / "₹50K". check-data-slim-drift: OK.
- `getExactFee(yenepoya,'MBA')` = `{"kind":"exact","min":50000,"max":50000}`.

**DEB online entitlement holds.** MASTER OF BUSINESS ADMINISTRATION is listed in three years:

| Year | Mode | Register row |
|---|---|---|
| 2024-25 | Online (Entitled) | 5173 |
| 2025-26 | Online(OL) | 1403 |
| 2026-27 July | Online(OL) | 11172 |

**Rendered knock-ons, base to branch.** All of these are correct.

- **/programs/mba:**
  - Hero chip and both FAQ ranges go from "₹50,000 to ₹3,70,000 across 54" to "across 55". The range is unchanged.
  - Cheapest list was CSJMU, DDU 52,500, Andhra 62,200. It is now CSJMU ₹50,000–₹1,20,000, then Yenepoya ₹50,000, then DDU ₹52,500. The tie sorts alphabetically.
  - The Finance, HR and Marketing cards go "from ₹52,500" to "from ₹50,000". This is correct because Yenepoya offers all three.
  - "Not published" goes from 65 to 64.
- **/fees:**
  - "published total fee for 59" becomes 60 in the page and in the meta, OG and Twitter descriptions.
  - The Yenepoya row moves from "On request" (sorted last) to ₹50,000 at the top.
- **Yenepoya profile:** "MBA fee ₹50,000". Other programmes still say "Contact our counsellor".
- **Yenepoya MBA hub:**
  - The fee card shows ₹50,000.
  - A new fee FAQ appears: "costs ₹50,000 in total ... confirm ... any registration or exam charge".
  - Robots stays `index, follow` (it was already indexed) and the sitemap is unchanged.
- **Six peer profile cards** (Galgotias, Gujarat, Jagannath, Kalasalingam, MMU, Silver Oak) change "Fees: ₹60K" to "₹50K".
- **No site-wide "cheapest/lowest MBA" claim** that cites a sub-₹60K figure is contradicted. I scanned every page.

**Title and meta changes. Expected, not a fail, but the coordinator should note them.** The brief said "no title or meta change". 49 meta fields change, all on Yenepoya pages or /fees:

- The Yenepoya profile title changes from "Courses, NAAC A+" to "Courses, MBA ₹50,000".
- The MBA hub title becomes "Yenepoya Online MBA Fees 2026: ₹50,000".
- The Finance and Marketing spec titles gain ": ₹50,000".
- The descriptions gain "₹50,000 fees".

These follow mechanically from a verified fee through the existing templates. No frozen or protected page is involved: check-protected-pages reported "8 protected paths and 8 frozen posts checked" and passed.

### F1 (FAIL): the Karnataka post's budget-tier copy now leaves out Yenepoya at ₹50,000

The table in blog/online-mba-karnataka-2026 now lists "Yenepoya Online Mangalore A+ ₹50,000". The post still says:

- "The under-₹1L budget tier (KSOU at ₹80K, Alva's from ₹30K) works if ..." This defines the tier without Yenepoya, which now belongs in it.
- The H2 "Value Tier: Online MBA Under ₹1 Lakh" covers KSOU, Adichunchanagiri, VTU and Alva's. Yenepoya stays under "Healthcare Specialists".
- "For the best NAAC-to-fee ratio on a budget, KSOU." / "This makes KSOU the most credible budget online MBA in Karnataka. The NAAC A+ grade at this price point is rare nationally."
  - These superlatives were already shaky at base: Alva's is listed A+ from ₹30K in the same post.
  - Yenepoya at A+ for ₹50K now contradicts them a second time, on the same page.

**Fix (in lib/blog.ts, a file this batch already edits):**

- Add Yenepoya ₹50,000 to the under-₹1L sentence, or make the sentence non-exhaustive.
- Delete the two KSOU superlatives ("best NAAC-to-fee ratio", "most credible budget ... rare nationally").
- Keep fee sentences verbatim so check-blog-fees stays at 1950.

### F2 (FAIL): an unsourced payment, EMI and study-material claim now prints on 4 Yenepoya pages

Before this batch, the Yenepoya MBA hub and its spec pages (finance, marketing, hr-management) said "Our published data ... is being cross-checked". With a fee present, components/FeeBreakdown.tsx now renders its generic block on all four pages:

> "Payment is accepted semester-wise or in full. EMI available through lending partners." ... "Study Material Included (digital)"

None of this is in the verify file:

- The portal publishes a **"Yearly Fee Plan ₹ 25,000"**, not a semester plan.
- The portal says "EMI starting ₹3,210/month*" but names no lending partner.
- No source covers study material.

This puts a new fact on the page without a source row. Batch 4 already has a mechanism for this: `NO_UNSOURCED_FEE_COMPONENTS` at FeeBreakdown.tsx:25, which currently holds only vignan.

**Fix:** add `'yenepoya-university-online'` to that set. Alternatively, add a `feePlans` entry (Yearly ₹25,000 x 2 = ₹50,000) from the verify file.

Related, minor: the spec FAQ JSON-LD says "EMI options are confirmed once the university publishes them". The portal already publishes an EMI-from figure. That wording is harmless, but stale.

## Test 2: Mysore ₹1,60,000 (PASS, with an advisory)

**Karnataka post.**

- The table cell reads "Under revision".
- The prose reads: "The University of Mysore portal shows its online MBA fee as under revision, so we do not quote a figure. Confirm the current fee with the university before applying."
- "uncommon in this price range", "at a fair price", "at lower fees" and "or budget is the primary constraint" are removed. The sentences around them read cleanly: "If targeting government jobs, ...".
- No orphans:
  - "₹1.60L" is now visible 0 times (base 1).
  - The only remaining "₹1,60,000" is JAIN's "₹1,60,000 to ₹2,98,000", which is correct.
  - The "Mysore cluster ₹80K to ₹2L" row does not depend on the Mysore figure.

**RSC payload.**

- The Mysore MBA hub HTML carries `"fees":"₹160K – ₹160K"` 4 times inside the serialized props. That count is unchanged from base, and the figure is visible 0 times.
- `getExactFee` returns none, so no fee surface prints it.

*Advisory:* the figure is still machine-readable in the page source. It has no portal basis: the portal shows 62,625, 92,625 and 2,02,940 unlabelled. I recommend blanking that pd.fees to '' in a later batch rather than keeping it with a comment.

## Test 3: derived-comparisons sweep (PASS)

**Diff stats.**

- 80 JSON files changed, 166 strings in all, including the UPES set.
- Every file round-trips.
- No structural changes: no section, key or array length changed.

**New numbers in the diff:**

- 2,20,000, 1,75,000 and 1,96,000 (the getExactFee bounds for UPES and NMIMS)
- "15" in MUJ "after its 15% discount" (the feeBreakdown label)

**Reading the changes.** I read all 99 non-UPES changed strings, far more than the 20 required. Each removes a computed gap, multiple or percentage, and the sentences read cleanly.

- Example: ARKA JAIN marketing "SMU is Rs 11,500 more expensive with ..." becomes "SMU has the established Manipal Group brand ...".
- "2.7x the cost" (Galgotias BA) is gone.
- Qualitative remnants were kept on purpose and add no figure: "Galgotias wins on pure cost", "at a marginally higher cost", "It costs more than DSU".
- One fragment, now ungrammatical: chitkara mba finance, "Chandigarh University at NIRF University #19 with PwC and Harvard partnerships." This is cosmetic.

**The two cmp15 leftover hits are false positives:**

- ADBU: "Affordability at the Rs 60,000 lower end of the fee range" is a range floor, not a gap.
- BITS BA FAQ: "JAIN: ... ~Rs 1,75,000, lower cost with strong accreditation" is qualitative.

**Karnataka.** "JAIN is roughly ₹1 lakh cheaper than MAHE while maintaining ..." becomes "JAIN holds the same NAAC A++ grade as MAHE." The cut is confirmed in the rendered post.

## Test 4: UPES spec pages (PASS, with an advisory)

**Rendered pages.** On the six rendered UPES spec pages (business-analytics, digital-business, infrastructure, international-business, oil-and-gas, power):

- "Year 1" went from 7 occurrences to 0 on each page.
- "Rs 1,75,000 to Rs 2,20,000" appears 9 to 13 times per page.
- "36 months", "NBFC", "1,95,000" and tier phrases each appear 0 times across all 11 UPES MBA spec HTML files.

**Wording.**

- EMI line: "**EMI:** Contact our counsellor for current EMI options and approval terms." This is neutral.
- Logistics FAQ: the question "priced higher than other UPES MBA specialisations?" becomes "What does the UPES Logistics and SCM MBA cost?". The answer becomes "UPES online MBA fees fall in the Rs 1,75,000 to Rs 2,20,000 range. Ask our counsellor for the current fee for Logistics and Supply Chain Management before payment." It reads cleanly.

*Advisory:* five UPES JSON files do not render on the spec slugs they appear to target:

- financial-management, human-resource-management, logistics-supply-chain-management, marketing-management, operations-management
- the slugs are finance, hr-management, supply-chain-management, marketing, operations
- those pages show 0 occurrences of the range

upes-online-mba-marketing-management.json still contains "You want an EMI option across up to 36 months". Nothing renders it today, but it would return if the slug mapping is ever fixed.

## Test 5: NMIMS peer quotes (PASS for the 12, see F3)

**The 12 quotes.** All 12 changed NMIMS quotes now read "Rs 1,96,000 to Rs 2,20,000". This matches `getExactFee(nmims-online)` = exact 196000 to 220000. The old "Rs 1,60,000-1,95,000" form is gone from the JSON (0 left).

### F3 (FAIL): the same stale NMIMS range survives in shorthand on a page this batch edited

- **Where:** lib/data/page-content/jain-university-online-mba-ai-for-finance.json, which this batch changed and which renders visibly on /universities/jain-university-online/mba/ai-for-finance.
- **Text:** "NMIMS Online MBA Financial Management at Rs 1.6L-1.95L carries stronger Mumbai banking recognition."
- **Cause:** this is the stale range the batch replaced in 12 places. It survived in lakh notation.
- **Fix:** change it to "Rs 1,96,000 to Rs 2,20,000", or drop the figure.

*Advisory, outside the 12 and pre-existing:* these NMIMS figures disagree with getExactFee.

| Figure | Where | Rendered |
|---|---|---|
| "NMIMS (Rs 2.5L+)" | 4 Kurukshetra MBA JSONs | in RSC only, visible 0 |
| "approximately Rs 2,50,000-3,00,000" | amity-university-online-mba-finance-and-accounting-management.json | |

## Test 6: Q59 rewrite (PASS)

**Against the register.** Every claim matches my own parse of the live DEB register:

- **MKU:**
  - MASTER OF BUSINESS ADMINISTRATION is ODL only: 2023-24 row 8839, 2024-25 row 8432, 2025-26 row 543, 2026-27 July row 12006.
  - Its online entries are only BA, BBA, B.Com, MA, M.Com and M.Sc.
- **Mumbai:**
  - Its only online entry is MASTER OF ARTS (SOCIOLOGY), every year.
  - MMS appears by ODL only.
  - No MBA appears in any mode.

This also agrees with verify file rows 1 and 2.

**Pages unchanged.** No MKU or University of Mumbai page has any visible, JSON-LD or meta change in the build diff.

**Diff scope.** The only audits/ changes are FIX-LOG.md (+64) and the Q59 row.

## Test 7: damage and gates (PASS)

**Page list and rendering.**

- The page list is identical: 2,335 pages in each build.
- 89 pages changed visibly and 27 changed in JSON-LD.
- JSON-LD parse failures in the branch: 0. Pages containing undefined or NaN: 0.
- The 89 changed pages have tag counts balanced in both builds. Some JSON-edited spec pages lose one `<p>`; I found no empty elements.
- Unmirrored FAQ answers: no page has more than in base.

**Files.**

- CRLF: 87 files changed. 0 have CR lines at either commit, and 0 trailing-newline changes.
- Blog posts: 271 and 271. Only online-mba-karnataka-2026 changed (content and FAQs). Its updatedAt is 2026-11-27, it stays published, its source is balanced, and no title field changed.
- data/sitemap-lastmod.json: 45 paths moved to 2026-11-27 and nothing else changed.

**Pre-commit** on the staged 28cbba1..5e59904 tree: EXIT 0 ("all checks passed"). The working tree was unchanged after the run.

- check-blog-fees: 1950, unchanged.
- check-fee-baseline: 205, unchanged.
- check-page-content-json: 431 files parse.
- check-data-slim-drift: OK.
- check-protected-pages: OK.
- verify-fees: 0 new mismatches.
- check-official-urls: 29 confirmed and 28 verified.
- check-nirf-category, check-sitemap-vs-404 and check-placeholder-fee-ranges: OK.

**New figures in the full diff** (non-JSON + lines whose numbers are absent from - lines):

- lib/blog.ts: only 50,000.
- lib/data.ts: 50000, plus portal numbers inside the source comment, all from the verify file.
- data-slim and fees-hub: 50000 and "₹50K".
- JSON: only the getExactFee bounds and the "15%" label (see test 3).

## Advisories (not blocking)

**A1. The MBA fee now appears in the OG/Twitter descriptions of 12 Yenepoya BBA/BCA/MCA pages** as "total fees (₹50K–₹50K)". Base showed "₹60K–₹2.0L".

- **Cause:** app/universities/[id]/layout.tsx:202 builds `feeStr` from the university-level feeMin/feeMax, and child pages inherit og/twitter.
- **Scope:** this is a pre-existing class. At base, 17 universities already print a degenerate "₹X–₹X" there, including Sharda, the precedent the engineer cited. Visible BBA/BCA/MCA text is unchanged.
- **Recommendation:** a separate item to make that layout string programme-aware or drop it.

**A2. MAHE "IoE" brand phrases are kept unchanged** in the comparison rewrites. This is pre-existing, and the IoE status is disputed.

**A3. The Karnataka H2 "Mid-Range Tier: DSU, Christ, Alliance, and University of Mysore"** still places Mysore in a fee tier although its fee is "Under revision". The engineer flagged this as open. Fixing it alongside F1 would cost little.

## Re-test needed after the fix

- F1: the Karnataka post text, plus check-blog-fees staying at 1950.
- F2: the 4 Yenepoya FeeBreakdown blocks.
- F3: the JAIN ai-for-finance string.

Everything else above can carry over unless the fix commit touches other files.

## Scratch and cleanup

- Evidence scripts and outputs are in C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa15/: site.mjs, metadiff.txt, dmg.out, precommit.log, mbahub-3961.html, mbahub-3962.html, strdiff.txt and pairs.txt.
- Servers on ports 3961 and 3962 were started by me and are now killed.
- Worktrees q15base, q15br and q15gates have been removed. Their node_modules junctions were unlinked first.
