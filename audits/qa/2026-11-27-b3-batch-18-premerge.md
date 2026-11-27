# QA: B3 batch 18, pre-merge (fix/b3-batch-18: cc21cd7 part A, a5d0268 part B; base origin/main a1b5368)

Checker: qa-checker (outsider review). Date: 2026-11-27.

**Method**
- **Fresh builds.** a1b5368 and a5d0268 in clean worktrees (`next build`, both EXIT 0). I compared the prerendered HTML in `.next/server/app` page by page.
- **Both builds served side by side.** `next start` on ports 3932 (base) and 3931 (branch), for the dynamic `/programs/[...slug]` routes and for a real browser run (Playwright Chromium) on the four tool pages and the navbar.
- **Pre-commit.** Run on a1b5368 with the a5d0268 tree checked out and staged.
- **My own detectors only.** I built an expected-fee table from `getExactFee` and `formatExactFeeShort` for all 143 universities and every programme, and checked each render site against it. I did not use the engineer's scripts.

## Verdict: FAIL (two small JSON-only fixes; every app change passes)

The app changes (part A2) pass on every regression check I ran. The failure is in fact content: test 6 asked for no unverifiable claims, and the batch left some in the Christ JSON and in two peer JSONs. None of those three files renders today. Both fixes are edits to page-content JSON only.

| # | Test | Result |
|---|---|---|
| 1 | A1: JMI Rs 50,000 removal | PASS |
| 2 | A2: template fee renders through the helpers | PASS (advisories) |
| 3 | A3: OG fee on 3 noindex shells | PASS (explanation confirmed) |
| 4 | B1: Symbiosis EMI | PASS (one advisory) |
| 5 | B2: JMI JSON and the two LEFT items | PASS, but F2 sits next to it |
| 6 | B3: Christ JSON | **FAIL** (F1) |
| 7 | B4: coupons | PASS |
| 8 | B5: Q62 to Q64 | PASS |
| 9 | Damage and gates | PASS, with one condition (C1) |

## Blocking findings

### F1. Christ JSON still makes claims no source supports (latent)

lib/data/page-content/christ-university-online-mba.json still describes how a Christ online MBA works, after the facts sheet found that no such programme exists. The sheet marks exam mode, intake and certificate as UNVERIFIABLE (rows 3j, 3k, 3n). These remain:
- **`classes`:** "delivered through the university's online learning platform ... Live sessions are scheduled on weekends and weekday evenings ... No mandatory campus visits".
- **`exams`:** "conducted online in a proctored format. A functioning webcam, valid government-issued photo ID ...".
- **`admission`:** Steps 1 to 6, including "navigate to the online MBA page" and "confirm admission by paying the first semester fee". The latter contradicts redFlags[0], "Do not pay any fee for a Christ online MBA ...".
- **FAQ "Does Christ University Online MBA require an ABC ID?":** it answers "Yes", which presumes the programme exists.

The rest of the file is correct:
- NAAC A+ appears 11 times and A++ never for Christ. The two A++ are SRM and VIT.
- NIRF always names its category: Management #57 (2025) and University #63 (2025).
- No DEB-entitled claim remains. Every DEB line says the register has no Christ MBA.
- WES appears once, about VIT. No AICTE, fee, EMI, eligibility, Business Analytics or "categoryy" remains.
- MBA stays in `comingSoon`, and `/universities/christ-university-online/mba` returns 307 to the profile. The JSON text appears in no built HTML.

**Fix:** reduce `classes`, `exams` and `admission` to the same "Christ has not published ... for an online MBA" line used in `whoCanApply` and `sampleCert`. Reword or drop the ABC FAQ.

### F2. Peer JSONs still give JMI the "4 specialisations" and a wrong NAAC grade (latent)

The batch rewrote these sentences for part A1 but kept two claims that the facts sheet rejects:
- **jamia-hamdard-online-mba.json, comparisons:** "Jamia Millia Islamia Online: NAAC A+, NIRF #4 (University 2025), central university, 4 specialisations, New Delhi. Significantly stronger NIRF rank and NAAC A++."
  - NAAC A+ conflicts with sheet row 2e (A++), and with the next sentence.
  - "4 specialisations" is UNVERIFIABLE (row 2h).
- **jamia-hamdard-online-mba.json, FAQ answer:** "JMI Online: NAAC A++, NIRF #4 ..., central university, 4 specialisations."
- **srm-institute-science-technology-online-mba.json, comparisons:** "Jamia Millia Islamia Online: NAAC A++, NIRF University #4 (central university), 4 specialisations." This is the very sentence the sheet cites at `:73`.

The JMI JSON itself now says its "prospectus 2026-27 lists no specialisations", so these peer pages contradict it. None of the three renders: I found no built page with "JMI ... NAAC A+", and no "JMI ... 4 specialisations" outside the JMI hub's own template text.

**Fix:** change "NAAC A+" to "NAAC A++" in the JH comparisons, and drop "4 specialisations" from all three sentences.

### C1 (condition for the merge, not a content defect)

audits/verify/batch18-facts-2026-11-27.md is **untracked** in the main checkout and is in neither commit. FIX-LOG cites it as the source for all of part B. Commit it with this batch, or in the log commit, so that every new fact has its source row in the repo.

## Test detail

### 1. A1, JMI Rs 50,000: PASS
- **Source.** No "JMI" or "Jamia Millia" within 150 characters of 50,000 or 50K in lib/, app/, components/ or data/ at a5d0268.
- **Built HTML.** No match in any .html or .rsc file. The same regex found none in base either, because the figures were latent there too.
- **The 4 JSONs read cleanly:**
  - SRM: "Higher NIRF in University category ... Choose JMI if NIRF University #4 central university status matters."
  - AMU: "JMI has better NIRF rank and NAAC A++." The removal of "AMU has lower fee" is correct, since neither side has a fee.
  - BITS: "Choose JMI for a central government credential."
  - JH: "JMI offers a higher NIRF rank ..."
  - The "4 specialisations" and NAAC issues in the JH and SRM sentences are F2.
- **Blog.** In lib/blog.ts the AJK MCRC item now reads "Public university." and `updatedAt` is 2026-11-27. The blog shows "Last updated 27 November 2026".
- **The only "₹50K – ₹50K" left** is lib/data.ts `pd.fees` inside the RSC payload of the 6 JMI pages. None of it is visible (see test 5).

### 2. A2, fee renders through the helpers: PASS
**Every printed fee equals the helper output.** I checked against an expected table built from getExactFee and formatExactFeeShort for all 143 universities and all 537 university-programme pairs.

| Render site | Checked | Result |
|---|---|---|
| Profile "Other universities" cards (143 profiles) | 569 cards | 569/569 match. 331 print "Fee not published", and none of those prints a number. |
| /programs (server component now) | 27 cards | All match; 7 checked by hand after an abbreviation clash in my parser (CUO is both Chandigarh and Christ). The base cells were blank or showed raw strings. |
| EMI calculator card | 4 | Match (MAHE ₹2,92,000, BITS ₹3,12,400, Amrita ₹1,76,000–₹2,60,000, CU ₹1,75,125–₹2,38,000). The base showed "₹292K - ₹292K". |
| tools/university-comparison table | 50 rows × 2 programmes | Match. "Not published" for kind none. The base showed "₹0K onwards" for universities with no fee. |
| Navbar mega menu (browser), MBA and BBA tabs | 16 cards | Match getExactFee for the tab's programme. UPES BBA, kind none, shows no fee. The base printed the MBA-led range on every tab, e.g. Amity BBA "₹2.1L - ₹2.3L". |
| /compare (browser) | 4 university sets plus the MCA tab | Fee cells match. Kind none prints "Not published". EMI ₹8,906/mo appears only for Amity on the MBA tab and not on the MCA tab (the base showed ₹6,917/mo there). |
| /compare/[pair] (22 prerendered pairs) | all | No visible change. Every pair has a published fee on both sides, so the new EMI gate never fires. |
| /programs/[...slug] "Top Universities" (lines 1003-1032) | 5 URLs on both servers | Visible text is identical to base. This block is unreachable: lines 423 and 530 return early whenever `activeSpec && subSlug`, so the change cannot affect output. |

**"Cheapest" needs 2 or more published fees.**

| Set compared | Result |
|---|---|
| Amity, NMIMS, IGNOU | IGNOU ₹66,000 |
| JMI, AMU (no fees) | "Not enough published fees". The base said "JMI From ₹60K", a placeholder. |
| Amity, JMI (one published fee) | "Not enough published fees" |
| Amity, IGNOU, JMI | IGNOU ₹66,000. The base said "JMI From ₹60K". |

**No page lost a fee it should show.** Every removed figure is a slim feeMin, feeMax or pd.fees value for which getExactFee is none, or an MBA figure shown on a non-MBA tab.

**Bundles and secrets:**
- First Load JS shared is 87.6 kB on both builds.
- Route changes: /compare 240 → 243 kB (CompareClient now imports lib/fees). /programs 108 → 96.5 kB (now a server component). /tools/university-comparison 110 → 110 kB. /tools/emi-calculator 110 → 110 kB. No other route moved by more than 0.01 kB.
- Static chunks total 9,041 KB → 9,034 KB.
- lib/data.ts markers in client chunks are unchanged: `feePlans` in 3 chunks before and after, and `Rishi, confirmed` in 1 chunk before and after. lib/data.ts already reached the client through CompareClient's `getUniversityById` at base.
- No CRON_SECRET, SERVICE_ROLE, SUPABASE_SERVICE, WHATSAPP_TOKEN or sk_live string in any client chunk, at base or branch.

**Routes and interactivity:**
- All 2,335 pages build at both commits, with an identical page list.
- In the browser, the tool pages work. On /tools/university-comparison, the programme switch, fee sort (unpublished last), max-fee slider (BBA ≤150K gives 28 rows), the NAAC A++ toggle, search ("manipal" gives 3 rows) and name sort all respond. On /tools/emi-calculator, moving the principal slider changes EMI from ₹6,922 to ₹13,843. /compare and /programs render.
- **Console errors:** on both builds, the only errors are the tawk.to script being blocked by CORS on localhost, 16 each. No page errors.

**Em-dash baseline 228 → 227 is a real removal, not a gate edit.**
- app/tools/university-comparison/page.tsx had 1 em dash at base. At branch, page.tsx and UniversityComparisonClient.tsx have 0.
- The baseline JSON only dropped that file's entry. scripts/ and .husky/ are unchanged in this diff.
- The em dash was the unranked NIRF cell, which now reads "Not ranked".

### 3. A3, OG fee on 3 noindex shells: PASS (explanation confirmed)
- andhra/mca, integral/mca and vignan/bba are prerendered with `robots noindex`. Their og:description says "total fees (₹62,200 / ₹1,10,000 / ₹90,000)". These equal getExactFee for each university's first programme, the MBA. The MCA and BBA figures are none.
- The text is identical at base and branch.
- The engineer's cause is correct: the layout gets only `{ id }`.
- Practical exposure is nil. `next start` serves all three URLs as an empty-body 404 from middleware (middleware.ts:501/532/589), so the shell HTML never reaches a client.

### 4. B1, Symbiosis EMI: PASS
- **The 9 spec JSONs:**
  - "interest-bearing", "marketing partner", "no-cost", "No-cost", "zero-cost" and "no cost" each appear 0 times.
  - Each file now says only "SSODL's published fee table lists an EMI plan paid in semester instalments and an EMI With Scholarship plan. It does not state an interest rate or a lender." This matches facts sheet row 1a (ssodl.edu.in/ug-pg-fees).
  - The FAQ is now "Does SSODL offer EMI?", and its FAQ JSON-LD matches the visible question on all 8 rendered pages.
  - The "If no-cost EMI matters, MUJ publishes one; SSODL does not." items are gone.
- **Built pages.** "interest-bearing", "marketing partner" and "no-cost EMI" were on all 8 rendered Symbiosis spec pages at base. They are on none at branch.
- **Profile (UniversityPageClient:751, the old :734).** The "No-cost EMI, 12 to 24 months" line is gated on `emiShown` = MBA && `u.emiFrom > 0` && a published fee. Symbiosis `emiFrom` is 0 at both a1b5368 and a5d0268; it was zeroed in B3 batch 1. So the line cannot render, and the profile shows "Current fee breakdown and payment options ...". The facts sheet's ":1903 emiFrom 13125" is stale.
- **Advisory.** The Symbiosis coupon page (a shared coupon-template paragraph) still says "Whether the no-cost EMI window applies to the reduced balance is set by the university". That implies a no-cost window SSODL never publishes. It is outside the 9 JSONs, but it is the last "no-cost" text on a Symbiosis page.

### 5. B2, JMI JSON: PASS
- **Fee.** fees.body reads "Rs 35,000 a year programme fee plus Rs 1,500 one-time registration (JMI CDOE prospectus 2026-27). JMI publishes no programme total." No total is given, which matches sheet row 2a.
  - This body does not render. The hub fee section shows the counsellor line because getExactFee is none, so the figure is latent.
  - The FAQ answer now says JMI "publishes an annual programme fee and a one-time registration fee, not a programme total".
- **Deletions.** The specialisation FAQ, the "4 specialisations" red flag, the second-year track text, the honest-verdict line and the admission "select from 4 tracks" step are all gone.
  - On the built hub, FAQ JSON-LD went from 9 to 8 questions. The one removed is the specialisation question, and all 8 left are visible.
  - No page has more unmirrored FAQ answers than at base.
- **DEB note.** "on the UGC-DEB register in online mode from the 2026-27 July session" matches sheet row 2d.
- **LEFT item 1, data.ts `₹50K – ₹50K`.** Accurately described. It is in the RSC payload of 6 JMI pages (the profile, the hub and the 4 spec pages) and visible on none. The hub's "Against: no fee edifyedu.in can publish" line disappeared because the answers layer now treats the JSON fee as a conflict and omits the fee fact. That is harmless, but it is a second sign that data.ts and the JSON disagree.
- **LEFT item 2, "4 specialisations".** Accurately described, and yes, it renders visibly on an indexed page. `/universities/jamia-millia-islamia-online/mba` (index, follow) shows it in three places:
  - the hero badge "4 Specialisations";
  - the QuickAnswers line "Jamia Millia Islamia offers 4 specialisations";
  - "Against: 4 specialisations, a narrow choice".

  The JMI finance, hr-management and marketing spec pages are also indexed (operations is noindex). Those pages exist for tracks the prospectus does not list.

  No question in QUESTIONS-FOR-RISHI asks about the JMI specs list or the data.ts fee field. Add one, since both are data-model decisions for Rishi.

### 6. B3, Christ JSON: FAIL (F1)
NAAC, NIRF category, no DEB-entitled claim, `comingSoon` and the 307 are all correct. The classes, exams, admission and ABC-FAQ claims remain (see F1).

### 7. B4, coupons: PASS
- **Changed URLs:** LPU `www.lpuonline.com`, Symbiosis `ssodl.edu.in`, SMU `www.onlinemanipal.com` and DSU `dsuonline.com`.
  - All four equal the host of lib/data.ts `officialUrl`.
  - DSU's comes from the 18 Nov DSU verify sheet, which names the portal dsuonline.com.
- **IGNOU** `www.ignou.ac.in`. It does not match data.ts (`ignouiop.samarth.edu.in`), but sheet row 4d records the www host as 200 and the bare host as failing, so the choice is sourced.
- **The 19 unchanged URLs** are the sheet's SOURCED rows.
- **sameAs is absolute on 24 of 24** built coupon pages, all `https://host`.
- **The ":606" disclaimer** "Check them with the university at {host}." is plain text with no `<a>`, on all 24 pages.

### 8. B5, Q62 to Q64: PASS
- All three rows are well-formed, with 6 pipe fields matching the file's header.
- origin/main's QUESTIONS file ends at Q61, so Q62 to Q64 do not collide. A Q8 duplicate already exists on main, unrelated to this batch.
- The content matches the sheet: Christ (item 3), the Kurukshetra Cloudflare block (4f) and Symbiosis EMI (item 1).

### 9. Damage and gates: PASS (with C1)
- **Builds:** both EXIT 0. The page list is identical at 2,335.
- **Changes against base:**
  - 161 pages changed visibly: 143 profiles (peer cards), 9 JMI and Symbiosis hub/spec pages, 5 coupons, 1 blog, /programs and 2 tools.
  - 34 pages changed in JSON-LD: 24 coupon sameAs, 9 FAQ and 1 blog.
- **JSON-LD:** 0 parse failures and 0 pages with undefined or NaN. No page gains unmirrored FAQ answers.
- **Meta:** 0 head-field changes (title, description, og, twitter, canonical, robots).
- **Tags:** 0 new imbalances across all 2,335 pages.
- **Files:**
  - CRLF: 36 files, 0 with CR lines at either commit, 0 trailing-newline changes.
  - JSON round-trip: 15 page-content JSONs, 0 mismatches.
- **Pre-commit** on the staged a1b5368..a5d0268 tree (index equal to the a5d0268 tree before and after): EXIT 0.
  - fee baseline 205, blog-fees 1950, em-dash 227 (all unchanged);
  - verify-fees: 0 new mismatches;
  - NAAC consistency: 0;
  - page-content-json and page-content-facts: 431 files;
  - sitemap-lastmod: OK.
- **Full diff read of every app/ and components/ file:** compare/[pair], coupons/[slug], layout, programs, programs/[...slug], emi-calculator (2 files), university-comparison (2 files), universities/[id], CompareClient, Navbar, ProgramPageClient and UniversityPageClient. I compared UniversityComparisonClient.tsx with the old page.tsx line by line; apart from the fee props, the filter and sort, and "Not ranked", it is the same file.
- **Scope:** nothing under app/admin, app/api/cms or app/blog/write is touched.

## Advisories (non-blocking)
1. **Page weight.** The root layout passes the whole fee map, about 5.9 KB of JSON for all 143 universities, to Navbar on every page. The menu only uses the 35 TRAFFIC_ORDER universities. Average HTML rose by 6.4 KB per page. The largest rises are /programs +35 KB, /tools/university-comparison +18 KB and /tools/emi-calculator +8.5 KB. Passing only the 35 needed universities would cut most of it.
2. **Grammar.** The "Best Value" fallback text "publish an {program} fee" reads "an BBA", "an BCA", "an B.Com" and "an BSc" on those tabs.
3. **JMI JSON delivery and curriculum.** It still has unsourced lines, and "proctored" renders on the indexed hub. These predate the batch, but the prospectus is now the known source.
4. **The /compare "Save up to ₹50,000" scholarship banner** predates the batch and is not a JMI fee. I noted it because it matches a naive 50,000 search.
5. **Peer-card fee ranges.** Madurai Kamaraj (₹75,000–₹1,80,000) and Mumbai (₹90,000–₹2,00,000) now appear as getExactFee exact ranges on profile peer cards. These are helper output, so they are correct for this batch. They are wide enough to deserve a placeholder-fingerprint check in a later fee batch.
6. **The facts sheet's draft Q61 (onlinesmu.com).** The branch made it moot by switching to the data.ts host. Record that in the fix log, so the sheet's open question is visibly closed.

## Re-test needed
Fix F1 and F2 (JSON only) and commit the facts sheet (C1). Then re-run:
- the Christ JSON claim scan;
- the JMI peer-sentence scan (no "4 specialisations" and no "NAAC A+" for JMI);
- pre-commit.

The app-side results above stand unless app files change.
