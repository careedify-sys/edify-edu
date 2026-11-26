# QA: B3 batch 10 pre-merge (fix/b3-batch-10 at bfcc4d9)

- **Date:** 2026-11-26
- **Checker:** qa-checker (outsider; did not do the work)
- **Branch:** fix/b3-batch-10 at bfcc4d9, cut from origin/main 37798f8
- **Engineer worktree:** .claude/worktrees/agent-a01edebc53ee492c4. The untracked `.b8tmp/` was ignored and not staged.

## Overall verdict: FAIL (1 finding, F1, in test 4)

| Test | Verdict |
|---|---|
| 1. Hospitality FAQ, salary calculator, hub intro | PASS |
| 2. MAHE NIRF and top-10 card ranks | PASS |
| 3. Spec-page university table | PASS |
| 4. Coupon peer rows | **FAIL (F1)** |
| 5. why-2026 bullets | PASS |
| 6. EMI and waiver text | PASS |
| 7. Damage and regression | PASS |

F1 is one line in the coupon template.

- **The problem:** the peer fees are correct, but changing their notation from "Rs" to "₹" defeats the template code that hides programme fees on coupon pages.
- **The result:** 49 fee figures that were hidden on base now show on 20 coupon pages, plus Symbiosis's 2 rows, which change from the already-visible concession string to the bare range.
- **Why it matters:** that hiding was a deliberate design decision (cbfc5c9). The FIX-LOG does not mention this visible change.

## Method

**Builds**
- Branch build: BUILD_ID 12:35:03, after the 12:32:39 commit. It is fresh.
- Base build: 37798f8, built in a clean scratch worktree. `next build` exit 0, 2360/2360 pages, types checked. Neither side has a `.env.local`.

**Comparison**
- Compared all 2,335 prerendered pages: visible text, JSON-LD and meta.
- /programs/mba renders on demand, so I fetched it from `next start`: base on port 3121, branch on 3122. I did not touch 3918. I stopped only my own two PIDs, 25316 and 25096.

**Fact checks**
- Fees and ranks were recomputed independently with tsx from lib/data.ts and lib/fees.ts: getExactFee, formatExactFee, formatExactFeeShort and exactFeeBounds.
- Every detector below found hits on base before a 0 on the branch was trusted.

**Change footprint**
- Diff: 5 files, +145/-75. The whole diff was read.
- Visible text changed on 28 pages: 20 coupon pages, 7 spec pages and the salary calculator.
- JSON-LD changed on 1 page (the hospitality FAQ).
- Meta changed on 0 pages.

## Test 1: Hospitality FAQ, salary calculator, hub intro. PASS

**Hospitality FAQ**
- "similar salary ranges" and "salaries are slightly higher" went from 1 visible and 1 LD hit to 0.
- The answer now ends cleanly: "...Healthcare suits you if you are in hospitals, pharma, or health insurance."
- The visible text and the LD agree.

**Salary calculator copy**
- "According to industry data" and "earn comparable" went from 1 to 0.
- The paragraph now reads "The key factors affecting salary are university ranking, specialization, and prior work experience rather than the mode of learning." That reads well under its h3.

**Calculator heading and NIRF list**
- These are client-only (`!hasMBA`), so I verified them from source.
- The heading is now "Explore Online MBA Programmes".
- The list prints `NIRF #{nirf} University` only when `nirf < 500`, and nothing otherwise.
- The five rows (top 5 UNIS_SLIM by getSortRank) all match lib/data.ts `nirf`, and each has a matching "(University)" approval where one exists:

| Row | UNIS_SLIM nirf | lib/data.ts nirf |
|---|---|---|
| MAHEO | 3 | 3 |
| BPWIL | 7 | 7 |
| AVVA | 8 | 8 |
| CUO | 19 | 19 |
| AUO | 22 | 22 |

**Hub intro (/programs/mba, live fetch)**
- "navigating" went from 1 to 0.
- The intro now reads "Choosing an online MBA in India means comparing 121 + UGC-DEB approved universities. This page compares every approved online MBA programme by NIRF rank...". It is grammatical. Advisory A3 covers the repetition.
- Tags are balanced and identical in shape to base. All 6 JSON-LD blocks parse and none differ from base. No meta changed. 0 "undefined" and 0 "NaN".

## Test 2: MAHE "NIRF #3 University". PASS

- lib/data.ts `manipal-academy-higher-education-online` has `nirf: 3` and approvals including "NIRF #3 (University)". It holds no nirfMgt.
- Live /programs/mba: "NIRF #4 University" went from 1 to 0.
- The other nine top-10 cards all match lib/data.ts:

| Card | Card says | lib/data.ts |
|---|---|---|
| Symbiosis | #24 University | nirf 24 |
| NMIMS | #24 Management | nirfMgt 24 |
| Amrita | #26 Management | nirfMgt 26 |
| CU | #32 Management | nirfMgt 32 |
| UPES | #36 Management | nirfMgt 36 |
| LPU | #44 Management | nirfMgt 44 |
| Amity | #49 Management | nirfMgt 49 |
| JAIN | #73 Management | nirfMgt 73 |
| IGNOU | no rank | nirf 999 |

- Every NAAC grade printed on the cards also matches lib/data.ts.

## Test 3: Spec-page university table. PASS

**Fee cells**
- I parsed every table row on all 7 spec pages and resolved each row's university from its `/universities/{id}` link.
- I recomputed `formatExactFee(getExactFee(u,'MBA')) || FEE_COUNSELLOR_LINE` for each.
- Result: 54 of 54 fee cells match exactly. 6 of them are the counsellor line.

**Other columns and the placeholder**
- I also checked each "#n Univ" or "#n Mgmt" NIRF cell against nirf or nirfMgt: 0 mismatches.
- "₹60K to ₹2.0L" went from 14 to 0 across the 7 pages.

**Table structure**
- Every row has 4 cells and the header has 4 th.
- Tags are balanced on all 7 pages.

**CU payment-mode labels**
- The CU cell reads "₹1,75,125 with 1 certificate after 25% Early Bird; ₹1,90,400 with 3 certificates after 20% Early Bird; ₹2,33,500 list with 1 certificate; ₹2,38,000 list with 3 certificates".
- That is exactly formatExactFee of CU's feeBreakdown.modes, and it reads correctly. It is long for a right-aligned cell; see advisory A4.

## Test 4: Coupon peer rows. FAIL (F1)

### Values: all correct

I recomputed every changed row myself.

| Row | Printed | Recomputed | Count | Result |
|---|---|---|---|---|
| Amity | ₹2,07,000–₹2,25,000 | getExactFee exact, 207000-225000 | x16 | match |
| JAIN | ₹1,60,000–₹2,98,000 | exact, 160000-298000 | x3 | match |
| NMIMS | ₹1,96,000–₹2,20,000 | exact, 196000-220000 | x16 | match |
| Symbiosis | ₹3,15,000–₹3,70,000 | exact, 315000-370000 | x2 | match |
| LPU | ₹2,00,000 list | see below | x14 | match |

**LPU detail**
- getExactFee returns `labelled`, breakdown `{list: 200000, net: {min: 146240, max: 161600, label: "by payment plan (lump sum to semester-wise)"}}`. Source: "lpuonline.com, Aug 2026; reconfirmed by Rishi 2026-10-28".
- formatExactFee is "₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan (lump sum to semester-wise)".
- formatExactFeeShort is "₹2,00,000", and the default listLabel is "list".
- So "₹2,00,000 list" is the published short form and the label is accurate.
- The old "1,61,000" was a mistype of 1,61,600. That is the semester-wise top of the payment-plan range and LPU's lib/data.ts feeMin. It was never the list price.

**Savings column**
- Every changed row's savings text is "Up to Rs 5,000 via <CODE>", the coupon amount.
- None was computed from a fee, so none contradicts the new figures.

**Superlatives**
- check-coupon-claims passes: 24 pages, 34 coupons.
- The only superlative is the allowlisted SMU Manipal-trio, and it still holds: SMU ₹1,20,000 < MUJ ₹1,84,000 list (₹1,56,400 net) < MAHE ₹2,92,000.

**Kept rows**
- "Chandigarh (from Rs 1,75,125)" is the lowest published CU mode ("with 1 certificate after 25% Early Bird").
- "Amity (from Rs 2,07,000)" is Amity's exact range floor.
- Both are honest "from" floors.

### F1: the template's fee-stripping no longer catches these rows

**Location:** `app/coupons/[slug]/page.tsx:490`.

**Current template code:**
```tsx
<td className="px-4 py-2 text-slate-700">{p.uni.replace(/\s*\(Rs\s*[\d,.+L]+\)/, '')}</td>
```

**Why the stripping exists**
- The regex was added in cbfc5c9 (2026-05-14): "Remove every programme-fee number ... from the rendered coupon detail pages. Pages now show only the Rs 4,000 / Rs 5,000 coupon discount".
- On base, "Amity (Rs 2,25,000)", "NMIMS (Rs 2,20,000)", "LPU (Rs 1,61,000)" and "JAIN (Rs 1,96,000)" all rendered as the bare name.

**What the batch changed**
- The new strings use "₹" and an en-dash range, so the regex no longer matches.
- Rendered peer-table University column, base against branch:

| Row | Base | Branch | Pages | Was the fee visible on base? |
|---|---|---|---|---|
| Amity (₹2,07,000–₹2,25,000) | "Amity" | fee shown | 16 | no |
| NMIMS (₹1,96,000–₹2,20,000) | "NMIMS" | fee shown | 16 | no |
| LPU (₹2,00,000 list) | "LPU" | fee shown | 14 | no |
| JAIN (₹1,60,000–₹2,98,000) | "JAIN" | fee shown | 3 | no |
| Symbiosis (₹3,15,000–₹3,70,000) | concession string | fee shown | 2 | yes (concession string) |

- These are the 20 coupon pages whose visible text changed.

**Consequences**
- MUJ, MAHE, SMU, Galgotias and IGNOU rows are still stripped to bare names, so the same table now mixes named and priced rows.
- LPU shows only its ₹2,00,000 list price, beside peers shown at their range floors.
- The FIX-LOG counts ("8: 51/55 -> 0/0") do not mention any visible change.

**Exact fix (recommended)**
- Make the strip catch both notations. In `app/coupons/[slug]/page.tsx:490` replace `/\s*\(Rs\s*[\d,.+L]+\)/` with `/\s*\((?:Rs|₹)[^)]*\)/`.
- I dry-ran this over every distinct peer row in lib/coupon-pages.ts:
  - It reduces the 5 changed rows to "Amity", "NMIMS", "LPU", "JAIN" and "Symbiosis".
  - It leaves IGNOU, MUJ, MAHE, SMU and Galgotias stripped as before.
  - It leaves "Chandigarh (from Rs 1,75,125)" and "Amity (from Rs 2,07,000)" unchanged from base.
  - Net effect on rendered HTML: the 20 coupon pages match base again, except the 2 Symbiosis rows. Those lose the old concession string and show the bare name, which is in line with cbfc5c9.
- The corrected data strings in lib/coupon-pages.ts stay as they are; they are right.

**Alternative**
- If showing peer fees on coupon pages is now wanted, that reverses cbfc5c9's decision.
- It needs a recorded decision, and the FIX-LOG and counts must state the visible change.
- The table header ("University" / "Max Coupon Savings") would then also need a fee column rather than fees inside the name cell.

**Re-verify**
- Rebuild, then confirm "Amity (₹", "NMIMS (₹", "LPU (₹", "JAIN (₹" and "Symbiosis (₹" each show 0 in visible text on /coupons/*.
- Confirm the 18 coupon pages other than the 2 Symbiosis ones have visible text identical to base.

## Test 5: why-2026 bullets. PASS

**Deleted figures**
- All 11 deleted bullets' figures went from 1 to 0 in visible text: 1.2 crore, $150B, $16B, 28% CAGR, $638B, 50,000 new hospital beds, 12-15% CAGR, 13,000 crore UPI, 35% CAGR, $2B, 100 lakh crore, 14% toward 8%, 100,000 hotel rooms.

**What remains on each page**
- No list is empty and no heading is orphaned.
- Bullets left per page: HR 2, SCM 2, Analytics 2, Healthcare 1, FinTech 2, Logistics 2, Hospitality 3.
- Each page's `<ul>` and `<li>` are balanced.

**No source elsewhere in the repo**
- `git grep` at bfcc4d9 over lib/, data/, content, app/, components/, public/ and audits/verify/ finds no other occurrence of any deleted figure or phrase.
- The only "638" hits are Pexels photo IDs in lib/blog.ts and the xlsx.
- So none of the figures had a source anywhere in the repo.

## Test 6: EMI and waiver. PASS

- Business Analytics: "₹5,000 to ₹13,000" went from 1 to 0. The admission paragraph now ends "...Seat allocation is done on a rolling basis. Most universities offer EMI options." The next block is the "Read More" guides, so nothing is left dangling.
- Hub FAQ: "5-25% fee waiver" went from 1 to 0 on live /programs/mba. It now reads "Yes. Merit-based scholarships are available at Amity, JAIN, Chandigarh, LPU, and several other universities." There is no empty parenthesis or double space.

## Test 7: Damage and regression. PASS

**Pages and markup**
- Page list: 2,335 on both builds, identical.
- JSON-LD parse failures: 0, including the live /programs/mba.
- "undefined" and "NaN": 0 on both builds.
- Tag balance: balanced on all 28 changed pages and on /programs/mba.
- Damage scan of the changed pages: 0 flags.
- FAQ parity: 153 FAQPage entries on both builds, 0 empty, 0 not mirrored.

**Diff review**
- The only new figures are the getExactFee-matched peer strings (test 4) and the MAHE #3 rank (test 2).
- The template's NIRF suffix "University" is a category label, not a new rank.
- No new superlative.

**Line endings**
- In the repo, all 5 files are LF on both commits: 0 CR lines in each blob before and after, with `core.autocrlf=true` giving CRLF only in working trees.
- No line-ending change, and `--ignore-cr-at-eol` gives the same stat (+145/-75).

**Meta and protected pages**
- 0 changes to title, description, og or twitter fields, canonical or robots.
- No blog post or protected-pages path is touched.

**Pre-commit**
- `.husky/pre-commit` on a staged copy of 37798f8..bfcc4d9: exit 0, "all checks passed", including check-coupon-claims, check-protected-pages and check-nirf-category.
- `git status` was identical before and after, so the hook changed no files.

## Advisories (not blocking)

**A1. Coupon pages' own fee strings disagree with getExactFee (hidden)**
- JAIN's own coupon page still carries `totalFee: 'Rs 1,96,000'` and stackExample "JAIN offers NAAC A++ at Rs 1,96,000". getExactFee gives ₹1,60,000–₹2,98,000.
- LPU's own page carries `totalFee: 'Rs 1,61,000'`.
- Neither renders visibly: totalFee shows only on "N/A" pages and stackExample has no reader. They sit only in the RSC payload, beside peer rows on other pages that now say otherwise.

**A2. The LPU row is list-only**
- In the peer table LPU shows its ₹2,00,000 list price, while its published payment plans are ₹1,46,240–₹1,61,600.
- This is moot if F1's recommended fix is applied, because the name cell goes back to "LPU".

**A3. Hub intro repetition**
- "comparing 121 + ... universities. This page compares..." repeats the verb.
- The "121 +" spacing predates this batch.
- Optional: "...means choosing among {n}+ UGC-DEB approved universities."

**A4. Long CU fee cell**
- The CU cell on 6 spec pages is a four-mode string in a right-aligned fee column.
- It is accurate. formatExactFeeShort plus formatExactFeeDetail as a second line would be tidier.

**A5. Engineer's IGNOU emiFrom note**
- The claim checks out in lib/data.ts: emiFrom 400 is 9,600/24, now stale against feeMin 66,000.
- Listed for Rishi as the engineer said.

## Cleanup

- I stopped both of my servers (ports 3121 and 3122). Port 3918 was not touched.
- I removed scratch worktrees qab10base and qab10gates, each node_modules junction first (rmdir), then ran `git worktree prune`.
- 0 scratch worktrees remain registered. The main node_modules is intact (417 entries).
- Scripts and logs: C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa10/
- No site edits, commits or pushes.
