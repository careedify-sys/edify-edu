# QA: B3 batch 12, pre-merge (fix/b3-batch-12 at 4e75b5a)

Date: 2026-11-26. Checker: qa-checker (outsider; did not write this batch).
Base: origin/main dcbf994 (includes the two WhatsApp commits). Branch: 4e75b5a, one commit on dcbf994.

## Verdict: FAIL (one finding, F1). Everything else PASS.

F1 is a count claim on /fees that the batch's own cells now contradict. The engineer
saw it and logged it (FIX-LOG batch 12, lines 7-8), but the brief's test 2 asks for no title or visible copy
that the cells contradict, so this fails as written. Fixing it changes the title, so the coordinator has to decide.

---

## F1 (FAIL). /fees says "125" universities have fees, but only 59 cells show one

`app/fees/page.tsx:28` still reads `const priced = feesData.filter(u => typeof u.feeMin === 'number' && u.feeMin > 0)`,
which is 125 rows from fees-hub-data.json feeMin. After this batch the table shows a fee in **59** of 143 rows
and "On request" in 84. It shows an EMI in **7** rows.

These rendered strings in the branch fees.html now say something the cells contradict:

| Where | Rendered text | Problem |
|---|---|---|
| `<title>`, og:title (l.85, 101) | "Online MBA & Degree Fees 2026: 125 Universities Compared" | 143 rows are compared and 59 carry a fee. 125 matches neither number. |
| meta description (l.86) | "Total online MBA and degree fees for 125 UGC-DEB universities in one table, with NAAC grade and EMI" | Fees for 59, EMI for 7 |
| og/twitter description (l.102, 111) | "...fees for 125 UGC-DEB universities, with NAAC grade and EMI" | Same |
| visible H1 (l.223) | "Online MBA & Degree Fees 2026 : 125 Universities Compared" | Same as title |
| visible lede (l.226) | "Total fee and EMI for **125+** UGC-DEB approved online degrees." | Fees for 59, EMI for 7. "+" overclaims. |
| WebPage/collection schema (l.186-187) | "Compare 125+ Programs", "Compare fees and EMI for 125 ..." | Same |

Before this batch, 125 roughly matched the base table's range cells (the "₹60K – ₹2L" placeholders), so this is a
contradiction the batch itself created, not an old one.

Fix options (the coordinator decides, because both change the title and /fees is not in data/protected-ai-pages.csv):
1. Derive the count from the cells: move `priced` below `feeCells` as
   `feesData.filter(u => feeCells[u.id].fee !== 'On request')`. That makes it 59, and the title becomes "59 Universities Compared".
2. Split the counts: use `feesData.length` (143) for "Universities Compared", and in the
   description and lede say "with the published total fee for 59", dropping "and EMI" or saying "EMI where published".

Either way, also re-word "Total fee and EMI for N+", since 7 EMI cells cannot carry that sentence.

---

## Test 1: derived emiFrom set to 0 (108 records). PASS, with advisories

**1a. Zeroed values are derived, not sourced: PASS.**
- I took all 108 changed records from lib/data.ts at base and branch and tested each old value with a script
  (the scratch file emi.mts).
  - 63 were the 2,500 default.
  - 33 equal a fee on the record divided by 24 (±1), for example NMIMS 8,167 = 1,96,000/24 and CU 7,297 = 1,75,125/24.
  - 12 cannot be derived from current data:
    - LPU 6,708 is 1,61,000/24, an older fee (commit 689a642).
    - The rest are round values: JNU, KIIT and GGSIPU 4,500; Jammu, Dayalbagh, Bharath, MDU, Rohilkhand and Meenakshi 4,000;
      Bangalore 3,000; Assam down town 2,000. They date from the initial import 0c3246f ("Deploy Edify v16"), the CMS sync
      2a9c6a9 and d24585d, with no source.
- I searched every audits/verify file and every data.ts comment block for each old value. The only hit is
  dr-dy-patil-vidyapeeth-online-2026-11-18.md, and it says D.Y. Patil publishes **no** monthly figure, which supports
  the zero. No zeroed value has a portal source anywhere in the repo.
- More than 15 records were spot-checked; in fact all 108 were checked by script.

**1b. Kept 7 are sourced: PASS.** JAIN, Amity, MUJ, Uttaranchal, Alliance, Jaypee and Adichunchanagiri each have an
audits/verify row or record comment that exists and states the monthly figure.

**1c. No ₹0 EMI is printed: PASS.**
- Over all 2,335 prerendered pages on the branch, these needles count 0:
  - "₹0/mo", "₹0/month", "EMI from ₹0", "₹0 a month", "from ₹0".
- "₹2,500/mo" went from 145 pages (218 hits) to 0.
- "EMI from ₹" went from 345 hits to 84, and "Starting at ₹" from 487 to 22.
- Every reader guards with `> 0` or a truthy check:
  - CompareClient 631/800
  - compare/[pair] 257
  - UniversityCard 196/199
  - UniversityPageClient 95/312/745/842
  - FeeBreakdown 88
  - EMIPlans 14
  - GatedContent 93 (truthy)
  - ProgramPageClient 376
  - display-guards emiPhrase
- lib/first-hand.ts:91 changed `??` to `||`, so emiFrom 0 now falls through to `r.instalment`. That is correct, because `??`
  would have printed ₹0. feePlanSummary runs only for MUJ (emiFrom 6,517), so nothing renders differently today.

**1d. EMI UIs: PASS.**
- The hub, compare and university pages drop the EMI line cleanly.
- Hubs show "EMI options are confirmed once the university publishes the current intake fee." Compare pages show "On request".
- "undefined" and "NaN" count 0 across all changed pages (visible text and JSON-LD).
- The /fees mobile card shows "EMI not published".

Advisories (not fails):
- A1. The FIX-LOG says the zeroed values were the 2,500 default or feeMin/24. For 12 values that is not accurate (listed above),
  but the conclusion still holds: none of them is sourced.
- A2. components/EdifyRecommends.tsx:96 prints emiFrom unguarded. It is imported nowhere, so it renders nothing today.
  Guard it if it is ever wired in.

## Test 2: /fees through getExactFee. PASS on every point except the count (F1)

- **Cells, all 143 checked against my own loop:**
  - I rebuilt every cell independently with lib/fees.ts getExactFee and formatExactFeeShort (fees12.mts, with output in
    expected-cells.json in my scratch directory).
  - The rendered branch fees.html matches on fee and EMI for **143 of 143** rows. That is well beyond the 20-cell sample.
- **IGNOU:** "₹66,000", row 5. PASS.
- **Placeholder ranges:** "₹60K – ₹2L" went from 120 visible + 3 JSON-LD to 0 across the site, and "₹10K – ₹66K" from 2 to 0. PASS.
- **Sort (SSR default, ascending):**
  - Fee rows run ₹50,000 (CSJMU) → ₹52,500 → ₹60,100 → ₹62,200 → ₹66,000 ... upwards.
  - The first "On request" is at row 60 and no fee row follows it, so all 84 "On request" rows sort last.
  - In components/FeesTableClient.tsx, fee-asc maps null to MAX_SAFE_INTEGER and fee-desc maps null to -1, so "On request" is last both ways. PASS.
- **ItemList JSON-LD:** all 20 items begin "{name}: {cell fee} total fee" or "fee on request", matching the cells. PASS.
- **Non-MBA rows** carry their programme label: SPPU "₹1,25,160 (BBA)", Alagappa "₹60,100 (B.Com)" and GGSIPU
  "₹90,000 (B.Com)". PASS.
- **Title and meta unchanged:** title, description, og, twitter, canonical and robots are byte-identical to base. PASS.
- **Claims the cells contradict:** FAIL, see F1.
- **Advisory A3 (rule 4d):** Madurai Kamaraj "₹75,000–₹1,80,000" (row 8) and University of Mumbai "₹90,000–₹2,00,000" (row 12)
  get past rule 4d.
  - Neither has an MBA pd.fees string, so getDisplayFee falls to rule 1 (record feeMin/feeMax), and 4d only checks pd.fees.
  - The same ranges are suppressed as shared placeholders elsewhere:
    - 75,000-1,80,000 for jamia-hamdard, graphic-era, devi-ahilya and mody;
    - 90,000-2,00,000 for university-of-kerala, shivaji and banasthali.
  - So the gate has a gap: the fallback path skips the fingerprint test. These two are probably placeholders. The batch
    correctly followed the site's own gate, so this is not a fail. Recommend a portal check, or applying 4d to the rule-1 fallback.

## Test 3: Amity MCA wording and updatedAt. PASS

- The amity-online-mca-fees-review FAQ now reads "Claimed hiring partners include TCS, Infosys, HCL, Accenture and Amazon."
  - It appears in both the visible text and the FAQPage JSON-LD, so the mirror holds.
  - "500+" went from 1 to 0 in both.
- updatedAt moved 2026-11-25 to 2026-11-26.

## Test 4: unsourced averages removed. PASS

- **online-mba-lpu-review-2026:** the "online cohort ... ₹4–7 LPA" paragraph is gone, and "average salary" went from 1 to 0.
  - The "₹4–7 LPA" that remains is the HR Manager role row in a role-salary table. It was not in scope.
  - The `<p>` count dropped by exactly 1 and is still balanced.
- **amity-online-mba-review-2026:**
  - The ₹7.35 LPA average and ₹6.50 LPA median rows are gone (tr 64→62, td 177→171, table balanced).
  - "median" went from 1 to 0 and "6.50" from 2 to 0, so nothing is orphaned.
  - The sentence reads cleanly: "The ₹26.30 LPA highest CTC (...) gets quoted everywhere, but it is the top offer, not a typical outcome."
  - The double-space-hyphen clause that follows ("-- the main management campus") is pre-existing.
- **mba-international-online-global-programs-2026:**
  - The "Career Outcomes by Programme Tier" H2 and its 6-item list are gone (h2 24→23, ul 14→13, li 113→103), plus the 2 per-programme bullets.
  - Visible "LPA" went from 16 to 6. The 6 left are the specialisations list the FIX-LOG defers.
  - updatedAt was bumped.
- **PGPX "Assume" scenario:** kept. It lives in mba-fees-india-complete-guide-2026 (blog.ts:8454) and no diff line touches it.
- The LPU and Amity updatedAt already read 2026-11-26 at base (from batch 11), so no bump was needed.

## Test 5: placement table. PASS

- In online-mba-with-placement-india-2026, the Rank column is gone. The header is now University | Placement Tier.
- Rows are grouped Tier 1 (Amity, Chandigarh, NMIMS, Symbiosis), Tier 2 (BITS, MAHE, MUJ), Tier 2-3 (JAIN), Tier 3 (LPU, UPES).
  They are alphabetical within each tier, and the same 10 universities as before.
- The table is well-formed: tr 27/27, td 64→54 (one cell less in each of 10 rows), all row widths consistent.
- The Tier 1 "30-50 percent ... receive offers" and Tier 2 "40-60 percent of motivated students" figures are gone.
  "percent of students" went from 1 to 0 and "40-60" from 1 to 0.
  - The 2 remaining "30-50" hits are the campus-vs-online table, which the FIX-LOG defers.
- The H2 "Ranked by Tier" still fits tier grouping.

## Test 6: damage and regression. PASS

- **Gates:**
  - .husky/pre-commit ran on a staged copy of dcbf994..4e75b5a in a scratch worktree: exit 0, "all checks passed",
    and no file modified by the hooks.
  - check-blog-fees reported "1956 unverified, unchanged from baseline".
  - check-protected-pages: OK.
- **Builds:**
  - The base build at dcbf994 exited 0.
  - The branch .next BUILD_ID was written at 16:53:49, after the 16:50:04 commit, so it is fresh.
- **Page list:** 2,335 prerendered pages in both builds, the same list.
- **Changes by page:**
  - Visible text changed on 544 pages: blog 5, compare 22, fees, index, online-mca, universities, universities/* 513.
  - JSON-LD changed on 481 pages.
  - Meta changed on **0** pages.
- **JSON-LD:** 0 parse failures. "undefined" and "NaN" count 0 in both visible text and JSON-LD.
- **FAQ parity:** equal at 4,456 entries. The number of LD answers with no visible mirror rose on **0** pages.
- **Damage scan (544 changed pages):** I checked for empty li/td/p/h/a, dangling words, double periods,
  inconsistent tables and LD parse failures. The only flags are the old LD-answer-not-mirrored kind, and none of them got worse.
- **Tag balance** on the 5 posts and fees.html matches base. The one unbalanced count is LPU div 130/131, which is identical at base.
- **Full diff read:** 8 files, all in this item's scope.
  - Files: app/fees/page.tsx, components/FeesTableClient.tsx, lib/data.ts, lib/data-slim.ts,
    data/fees-hub-data.json, lib/blog.ts, lib/first-hand.ts, audits/FIX-LOG.md.
  - The only new figures are getExactFee outputs and existing source figures.
  - lib/blog.ts has deletions, one rewording and two updatedAt bumps.
  - The data files only zero emiFrom or set hub emi to "Not published".
  - No fee, EMI, salary or percentage was added.
- **Line endings:** every changed blob is LF at both commits (0 CR lines), the same convention as base.
  The working copy is CRLF under core.autocrlf=true. Kept.
- **Titles:** no title, seoTitle or metaDescription changed in BLOG_POSTS, and no page's meta changed.

## Not done
- I did not fetch dynamic routes from `next start` for this batch. Every surface that changed is prerendered
  (hubs, universities, compare pairs, /fees, blog), and the prerender diff covered them.

## Cleanup
- Scratch worktrees qab12base and qab12gates were removed after their node_modules junctions were rmdir'd first. Then I ran prune.
- None remain registered, and the main node_modules is intact (417 entries, next present). I started no servers for this batch.
- My script had written expected-cells.json into the batch worktree root because of a relative path. I moved it to my
  scratch directory, so the engineer's worktree holds only its own untracked .b8tmp/.
