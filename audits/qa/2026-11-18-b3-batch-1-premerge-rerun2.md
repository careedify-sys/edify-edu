# QA pre-merge rerun 2: B3 batch 1 (fix/b3-batch-1 @ 787c9e6, on 6dc820d, base 1021c26 = origin/main, live)

Checked 2026-11-18 by qa-checker. Previous reports:
- audits/qa/2026-11-18-b3-batch-1-premerge.md
- audits/qa/2026-11-18-b3-batch-1-premerge-rerun.md

**Builds compared**
- **After:** a fresh `npm run build` of 787c9e6 in the worktree. Nothing else was building: the only node processes were MCP servers. The build exited 0 with 2,360/2,360 static pages, and I served it with `next start -p 3125`. This rebuild includes the engineer's last unbuilt edit to the BITS quick-answer line.
- **Before:** the existing 1021c26 build, served with `next start -p 3126`.

**Cleanup**
- Before and after the build, I restored CRLF-only churn on 12 generated files. It was confirmed whitespace-only with `git diff --ignore-all-space --ignore-cr-at-eol`, which showed 0 files.
- Both servers are stopped (PIDs 3032 and 23384).
- The worktree is clean at 787c9e6. I changed no code.

## Overall: FAIL (one line)

All four required items from the rerun are closed in rendered visible text across the site. The three advisories are also fixed.

One part of required item 1 is still open. The rerun asked for the nonexistent "DSU Digital Marketing MBA" to be fixed in the BITS digital-transformation JSON. The engineer fixed line 99, but the same claim still renders from line 58 of that file. FIX-LOG addendum 2 says the track was replaced, so that FIX-LOG statement is only half true.

The fix is one edit to one line. Everything else passes.

| # | Check | Result |
|---|---|---|
| 1 | DSU A++ attributed to DSU = 0 (site-wide, visible) | PASS |
| 1b | Nonexistent DSU "Digital Marketing" track in BITS digital-transformation JSON | **FAIL**: `:58` remains |
| 2 | JAIN "19" and withdrawn AI tracks only on the 3 JAIN ai-* pages | PASS (one frozen-meta exception, below) |
| 3 | No BITS fee "plus" double count | PASS |
| 4 | ₹1.19 Lakh H2 gone | PASS |
| 5 | New wording invents nothing | PASS, except 1b |
| 6 | FIX-LOG claims true | PASS, except the 1b sentence |
| 7 | Titles, H1s, meta unchanged except allowed | PASS |
| 8 | 308s | PASS |
| 9 | A9 and D4 | PASS |
| 10 | Gates, baselines only down | PASS |

---

## 1. DSU A++ (PASS) and the DSU Digital Marketing track (FAIL)

I scanned the visible text of all 2,335 built pages for "A++" within 110 characters after "Dayananda Sagar" or "DSU". The scan found 17 hits, and none attributes A++ to DSU:

- **DSU shown as A+ beside an A++ peer.** This covers the dsu review, mba-fees-india ("Dayananda Sagar (Rs 1,30,000, NAAC A+)"), online-bcom-fees and the "Other Universities" cards.
- **CSJMU comparison tables.** The column order is CSJMU, DSUO, DPUNM, UOPES, and the NAAC row reads A++, A+, A++, A. So DSU is A+.
- **Other universities.** One line reads "DPU has NAAC A++" and another reads "BITS Pilani ... offers NAAC A++".

The four places I flagged now render as follows:

| Page | Now renders |
|---|---|
| mba-fees-india-complete-guide-2026 | "NAAC: A+." |
| galgotias-online-mba-review | "DSU Online \| Rs. 1,30,000 \| A+ \| Bengaluru, A+ grade" |
| shoolini-online-mba-review | "DSU Online \| Rs. 1,30,000 \| A+ \| A+ grade, Bengaluru brand" |
| bits .../mba/digital-transformation | "DSU Online's MBA with a Marketing Management elective is Rs 1,30,000 in total (NAAC A+)." |

The new BITS JSON line 99 is true:
- The DSU sheet (`audits/verify/dayananda-sagar-university-online-2026-11-18.md`, row "Specialisations, record") lists Marketing Management among the eight electives.
- The ₹1,30,000 total matches the sheet's fee row.
- A+ matches `lib/data.ts`.

**1b, still open:** `lib/data/page-content/bits-pilani-work-integrated-online-mba-digital-transformation.json:58` renders on `/universities/bits-pilani-work-integrated-online/mba/digital-transformation`:

> "vs DSU Online MBA Digital Marketing (Rs 1,30,000, NAAC A+): DSU is NAAC A+ at significantly lower fees. DSU focuses specifically on digital marketing."

- DSU offers no Digital Marketing elective. The sheet lists eight, and Digital Marketing is not one of them.
- This is the same false claim the fix removed from line 99, and it is the only remaining hit of a site-wide "DSU ... Digital Marketing" scan.
- **Fix:** change it to "vs DSU Online MBA Marketing Management (Rs 1,30,000, NAAC A+): DSU is NAAC A+ at a lower total fee. Its Marketing Management elective covers general marketing." Alternatively, delete the DSU comparison block.
- The current "focuses specifically on digital marketing" and "significantly lower fees" are a track claim and a fee superlative; drop both.
- Then amend the FIX-LOG addendum 2 sentence on R1.

## 2. JAIN (PASS)

**Withdrawn AI tracks.** Searches over all built HTML found the following.

| Search | Pages with hits |
|---|---|
| "AI for Marketing" | `jain-university-online/mba/ai-for-marketing` only |
| "AI for HR" | `jain-university-online/mba/ai-for-human-resources` only |
| "AI for International Finance" | `jain-university-online/mba/ai-for-international-finance` only |
| "AI for Human Resources" | the JAIN ai-for-human-resources page, plus an SRM MCA generative-ai page. The SRM hit is an SRM course name, present on base, and not visible. |
| "AI for Finance, Marketing" | 0 |
| "AI-focused dual" | 0 |
| "dual-domain AI" | 0 |
| "AI For " | 0 |

**JAIN "19".**
- A visible scan for "19 specialisations/electives" within 120–160 characters of JAIN, in both directions, returns one hit. It is on compare/amity-vs-jain and reads "Amity University: 19 specialisations. JAIN University: 16 specialisations". That is correct.
- **Frozen exception:** "19 electives" also renders on `blog/jain-online-mba-review-2026` and its card on `blog/page/7`. In both places it is the frozen metaDescription, locked to 5 Dec by check-protected-pages and already recorded in FIX-LOG. It is not a batch defect.

**New pairs.ts and MBAHubClient wording, checked against `lib/data.ts` at 787c9e6:**

| University | NAAC | MBA specs |
|---|---|---|
| JAIN | A++ | 16, including "AI for Finance", "Data Science and Artificial Intelligence" and "International Finance (ACCA)" |
| Amity | A+ | 19, including Insurance Management and Hospitality Management |
| LPU | A++ | 12 |

- "JAIN has 16 specialisations, including AI for Finance, and Data Science and Artificial Intelligence" is true.
- "16 specialisations with ACCA integration" (`/programs/mba`) is true.
- "Both have NAAC A++" (JAIN vs LPU) is true.
- The amity-vs-jain FAQ states JAIN's 16 and names Amity's Insurance and Hospitality tracks, which is true. The compare page's own table states Amity 19, which is also true.

**JAIN hub:** 16 unique spec hrefs. The 3 JAIN ai-* pages still return 200, per Q35.

## 3. BITS fee wording (PASS)

- **FAQ:** "Total programme fee is ₹3,12,400 all-in. Semester 1 is ₹93,100 and Semesters 2 to 4 are ₹73,100 each." 93,100 + 3 × 73,100 = 3,12,400, and there is no "plus".
- **Quick answer:** "priced at ₹3,12,400 all-in (Semester 1 ₹93,100 and Semesters 2 to 4 ₹73,100 each)". The rebuild shows this edit.
- **Site-wide scan** for "plus" with ₹18,500 or ₹1,500 near BITS, WILP or the semester figures: 0 hits. "93,100" never appears beside "plus".
- **Advisory (already listed in FIX-LOG as left in place):** the same post's key-facts line reads "₹2,92,400 tuition + ₹18,500 admission + ₹1,500 application = ₹3,12,400". The arithmetic is consistent with the published lines, so it is not a double count, but ₹2,92,400 is a sum Edify made.

## 4. ₹1.19 Lakh H2 (PASS)

- nmims-vs-symbiosis renders `<h2>Fees Breakdown: What Does the Higher Symbiosis Fee Buy You?</h2>`.
- Visible counts went from base to branch as follows:

  | String | Base | Branch |
  |---|---|---|
  | "1.19 Lakh" | 3 | 0 |
  | "1.19 lakh" | 1 | 0 |
  | "₹1.19L" | 9 | 0 |

- "Rs 1.19L" remains once, in nmims-online-mba-review. FIX-LOG now discloses this, together with the Symbiosis JSON peer line, as advisory.
- The H2 still carries a duplicate `id` attribute (`id="fees" id="fees-breakdown-..."`). Base has the same pattern, so it is pre-existing template behaviour.

## 5. Advisories from the rerun (all fixed)

**No-EMI line**
- It now reads "📋 Current fee breakdown and payment options, confirmed with the university" on 25 profiles, with no abbreviation.
- "via partner banks" went from 20 on base to 0.

**UniversityCard**
- The degenerate ranges are now 0 on the branch: "₹80K – ₹80K" (0), "₹1.2L – ₹1.2L" (6 → 0) and "₹1.3L – ₹1.3L" (2 → 0). The card prints one figure when min equals max.
- This changes the listing card for other universities too, but it only collapses identical endpoints.

**DPU ₹47,350**
- Visible count went from 8 to 0.
- "₹44,400 to ₹50,000" now appears in 4 spec-roundup tables and as "Rs. 44,400 to 50,000" in the dy-patil review hero.
- In every case it sits in a "Per Semester" column or field, with the total shown separately as ₹1,89,400. It is never presented as a total.
- The dy-patil review fee table reads "Semester Fees (Sem 1 to 4) | Rs. 50,000 / 50,000 / 45,000 / 44,400", and Step 5 reads "Pay semester 1 fee Rs 50,000". Both match the DPU sheet (50,000 / 50,000 / 45,000 / 44,400; total 1,89,400).
- The `syllabus-manifest.json` copies of 47,350 and 7,890 render 0 times.

## 6. FIX-LOG (PASS except the 1b sentence)

I checked each claim in the 787c9e6 FIX-LOG edits against the build. All are true except one: R1's "It now names a real elective from the sheet". That holds for line 99 only. Line 58 of the same file still names Digital Marketing.

The claims that check out:
- the 8 + 1 ₹1.19L instances and the advisory remnants;
- DSU A+ in 3 posts plus the BITS JSON;
- pairs.ts and MBAHubClient at 16;
- the BITS FAQ and quick answer;
- the H2;
- the three advisories;
- the syllabus-manifest note;
- check-blog-fees at 2024.

## 7. Titles, H1s and meta (PASS)

- `<title>`, H1, meta description, canonical and robots were compared base against branch over 2,136 built pages: every `universities/**` page, plus `blog`, `compare`, `programs` and `coupons`.
- 4 pages changed, all in meta description only. These are the same 4 allowed in the earlier reports, none of them frozen:
  - Galgotias MBA hub: dropped the false "(₹3,342/mo EMI)"
  - dsu-online-mba-review: A++ → A+
  - jain-vs-amity: dropped "19 specialisations each"
  - nmims-vs-symbiosis: "#11" → "University #24"
- No title or H1 changed anywhere. The 3 JAIN ai-* pages are identical to base in all five fields.

## 8. Redirects (PASS)

| URL | Branch |
|---|---|
| /programs/mba/ai-for-marketing | 308 → /programs/mba |
| /programs/mba/ai-for-human-resources | 308 → /programs/mba |
| /programs/mba/ai-for-international-finance | 308 → /programs/mba |

All three return 200 on base.

## 9. A9, D4 and rendering (PASS)

- **A9:** the 12 needles over 1,786 university pages are 0 raw and 0 visible.
- **BITS DEB needles:** 0, except "UGC DEB Approved" and "UGC-DEB approved", each 22 raw and 0 visible (the same footer and schema hits as before).
- **D4:** the counts are unchanged.

  | Hub | Figure | Count |
  |---|---|---|
  | NIU | ₹1,18,000 | 32 |
  | Alliance | ₹1,74,000 | 39 |
  | Alliance | ₹8,700 | 4 |
  | Sharda | ₹1,50,000 | 45 |
  | JIIT (`jaypee-university-online`) | ₹1,75,000 | 25 |
  | JIIT (`jaypee-university-online`) | ₹5,850 | 9 |

- **Rendering, 6 profiles and 6 MBA hubs:** 1 H1 each, 8 to 11 JSON-LD blocks with 0 parse errors, and 0 "undefined", 0 "NaN" and 0 bare "₹0".

## 10. Gates (PASS)

- `bash .husky/pre-commit` in the clean worktree exited 0 and ended with "pre-commit: all checks passed".
- check-blog-fees: "2024 unverified, unchanged from baseline". check-protected-pages: "8 protected paths and 8 frozen posts checked". check-nirf-category: OK.
- 1021c26..787c9e6 touches nothing under `scripts/` or `.husky/`, and no allowlist or ranges file.
- The only baseline file is `data/blog-fee-baseline.json`, and every change went down:

  | Field | Before | After |
  |---|---|---|
  | totalUnverified | 2026 | 2024 |
  | dsu-online-mba-review | 7 | 6 |
  | nmims-vs-symbiosis-online-mba-2026 | 12 | 11 |

- 0 em dashes were added in 6dc820d..787c9e6. Nothing under `app/admin`, `app/api/cms` or `blog/write` was touched.

## Required before merge

1. `lib/data/page-content/bits-pilani-work-integrated-online-mba-digital-transformation.json:58`: replace "DSU Online MBA Digital Marketing ... DSU focuses specifically on digital marketing" with the Marketing Management wording above, or delete the DSU block. Then amend the FIX-LOG addendum 2 R1 sentence.

A visible re-check of that one page is enough to close this. No other check needs repeating, because the edit touches only that JSON, which only that page renders. Run check-page-content-json, check-page-content-facts and the pre-commit hook as usual.

Scratch artefacts are in the session scratchpad: `html-r787/`, `build-rerun2.log`, `precommit-r787.log` and `scripts/visnear.mjs`.
