# QA pre-merge: B3 batch 2 (fix/b3-batch-2 @ f7317ee = 0a33af4 + f7317ee, base 1ed2ea6 = origin/main, live)

Checked 2026-11-19 by qa-checker. No code was changed.

**Builds compared**
- **After:** a fresh `npm run build` of f7317ee in worktree `agent-a0f4ac625e43eccf2`. Nothing else was building in this worktree. The only other build running was batch 3, in its own worktree (`agent-a10e18a83ae7ad291`), which I did not touch. The build exited 0 with 2,360/2,360 static pages, and I served it with `next start -p 3127`. That PID (19220) is now killed.
- **Before:** a fresh build of 1ed2ea6, made from `git archive` into the session scratchpad. It also exited 0 with 2,360/2,360 pages.

**Gates harness**
- With nothing staged, staged-diff gates pass trivially. So I made a disposable `git clone --shared` at 1ed2ea6 in the scratchpad, staged the whole f7317ee tree on top of it, and ran `bash .husky/pre-commit` there.

**Cleanup**
- The worktree is clean at f7317ee.
- The CRLF churn the build left on 13 prebuild files has been restored.

## Overall: FAIL (3 small content misses, all one-line edits; everything else passes)

| # | Check | Result |
|---|---|---|
| 1 | Fidelity to the 4 sheets | **FAIL** (F1, F2, F3 below); every other sampled change matches its sheet row |
| 2 | Template removals on other universities | PASS |
| 3 | Generated files | PASS (line endings only) |
| 4 | Built output counts, A8/A9/D4/B3-1 intact | PASS (residuals other than F1-F3 are not about these four, or are documented deferrals) |
| 5 | Titles, H1, meta, frozen pages | PASS |
| 6 | Gates | PASS |
| 7 | House rules | PASS |
| 8 | Rendering of 4 profiles and 4 hubs | PASS |

## FAILs and exact fixes

**F1. Uttaranchal "established in 2011" still renders and contradicts the new 2013.**
- Sheet row: Established, FIX "2013, or drop the field".
- The engineer changed "est. 2011" to "est. 2013" in the hero `sub` of the same files but left the `about` body untouched.
- It renders on `/universities/uttaranchal-university-online/mba/{digital-marketing,hr-management,international-business}`. The profile now prints "Established 2013".
- Fix: in each of these 6 files, line 13, replace `a private university established in 2011` with `a private university established in 2013`:
  - `lib/data/page-content/uttaranchal-university-online-mba-digital-marketing.json:13`
  - `-financial-management.json:13`
  - `-hr-management.json:13`
  - `-information-technology.json:13`
  - `-international-business.json:13`
  - `-marketing-management.json:13`

**F2. Shoolini Pay-After-Placement "only" claim survives as "unique".**
- Sheet row 21: FIX, remove "ONLY"; Shoolini says "first".
- `lib/data/page-content/shoolini-university-online-mba-digital-marketing.json:13` reads: `...until after confirmed placement. unique in India's online MBA space.`
- This was the same sentence the engineer edited (Rs 30,000 to Rs 23,700). It renders on `/universities/shoolini-university-online/mba/digital-marketing`.
- Fix: delete ` unique in India's online MBA space.` so the sentence ends at "placement.". Alternatively replace it with ` Shoolini says it was the first in India to offer this on an online MBA.`

**F3. A compare FAQ missed in the "19" sweep.**
- Sheet row 32: FIX, drop "19".
- `app/compare/[pair]/pairs.ts:206` (amity-vs-chandigarh) reads: `'CU offers 26 specialisations. Amity offers 19. ...'`
- It renders 3 times (visible FAQ and FAQPage schema) on `/compare/amity-vs-chandigarh`. The engineer fixed the five sibling FAQs in the same file.
- Fix: change `Amity offers 19.` to `Amity offers fewer.`

## 1. Fidelity

I read all 75 files of `git diff 1ed2ea6..f7317ee` and the segment diffs of lib/blog.ts (all 45 posts) and the 40 page-content JSONs. I sampled more than 40 changed sentences against the sheets.

**Amity**
- feePlans totals are 2,13,750 / 2,25,000 / 2,13,750 / 3,29,000 / 3,12,560, matching sheet rows 34-35.
- The rendered hub table shows exactly these, with the one-time ₹2,07,000 and ₹3,02,680.
- The old products 2,13,760 / 2,25,200 / 2,13,744 / 3,29,200 / 3,12,552 fell from 20/20/20/5/5 files to 0.
- The review blog tables and the mba-seo-overrides intro were changed to match.

**Amity "14"**
- Sheet row 32 says the specialisation tab lists 14. The count columns changed 19 to 14 (blog.ts 9664, 10490, 21451, 21612, 22413, 22617).
- Prose now says "many" or "a wide choice". It does not claim "widest" or "most".
- Pre-existing, not new: the blog.ts:21451 row pairs "14" with "Insurance; Aviation" (Insurance is a Q25 track). The frozen review meta keeps "19" until 5 Dec.

**Other Amity sheet rows**
- "under Rs 2 lakh" is gone from 8 JSONs.
- "QS World" is gone from 2 JSONs and the 1 blog line.
- 13 salary FAQs were removed.
- "among the first" was removed.
- ACCA now reads "9 ACCA paper exemptions".
- Express Entry was replaced with Amity's WES wording.
- The 2026-27 July DEB line and "each year from 2021-22" match row 14.
- NIRF year 2025 matches row 20.

**Uttaranchal**
- emiFrom is 3,733 in data.ts, data-slim and fees-hub, and in 9 JSONs and the review blog. 4,317 fell from 35 hits to 0.
- The annual ₹49,800 line was added.
- The exam-fee note "₹2,500 per semester, included" matches row 89.
- The list figures 1,44,000 / 72,000 / 37,000 match row 86.
- established 2013 and feeVerifiedOn 2026-11-18 are set.
- "after scholarship" labels replace the 30%.
- WES was removed, and red flags 2-4 were removed.
- The learning model now says "Live + Recorded, 8 to 10 hours a week", matching row 99.

**Shoolini**
- These figures are printed as Shoolini publishes them (rows 22/24/26):
  - ₹1,58,000
  - ₹1,34,300 during the course (₹33,575 × 4 "as Shoolini prints it")
  - ₹23,700 after placement
  - ₹1,30,000 at ₹32,500 a semester
  - ₹500 application fee as a separate extra
- No row or sentence presents 1,58,000 as our own sum of 1,34,300 + 23,700. The feePlans row carries 1,58,000 as Shoolini's "fee after scholarship".
- emiFrom is 0 and fees-hub shows "Not published".
- The immersion and the 80/20 and 85/15 splits were removed. 21% / 35% / 25% / 18% / 30% / 20% were removed.
- The value-adds heading reads "One free value add-on, as Shoolini describes it".
- Exam mode is untouched (Q29). Global rankings are untouched (Q30).

**Adichunchanagiri**
- emiFrom is 4,417.
- feeExtras are ₹500 registration and ₹3,000 a year exam fee. They render as "University registration fee ₹500, charged separately" and "Examination fee ₹3,000 a year, charged separately", and are not added into the total.
- feeMin/feeMax stay 1,40,000 (Q31). The spec pages are untouched (Q32).
- officialUrl and feeVerifiedOn are correctly held back until Q31.

**BITS**
- Sheet row 27 (`bits-pilani-wilp.ac.in/mba/finance.php`, "with 0% interest") supports "interest-free EMI option".
- The published lines Sem 1 ₹93,100, Sem 2-4 ₹73,100, total ₹3,12,400, admission ₹18,500 and application ₹1,500 all match the BITS sheet fee-components row.
- 2,92,400 / 3,10,900 / 1,66,200 fell to 0.

**Q24-Q32**
- The diff does not touch these fields: naac, qsRank, highlights.rankings, examMode, the intake/last-date lines, ACU feeMin/feeMax, or any specs array.

**No new sum, marketed percentage or invented EMI.** The only computed-looking figures are published ones.

**Advisory: stale comment, not a FAIL**
- data.ts:5114 (DY Patil) still says "The salary line stays until Q22 is answered", but the avgSalary below it is now blank.
- The blanked value (₹5L-₹18L) was not DPU's published "5.5 to 20 LPA", so blanking it is safe under either Q22 answer. Only the comment is stale.

**Advisory: FIX-LOG count is wrong**
- FIX-LOG says "252 values, 57 distinct". Base 1ed2ea6 actually had **407** non-empty avgSalary values, 61 distinct strings. That includes the `₹`-escaped forms and 7 "Not Mentioned"/"Not specified".
- All 407 are now ''. The result is right; the count in FIX-LOG should read 407.

## 2. Template removals (PASS)

I checked 22 profiles and MBA hubs on `next start`:
- NMIMS, MUJ, IGNOU, LPU, JAIN, Chandigarh, MAHE, DSU, Symbiosis, Galgotias and DY Patil
- the Galgotias BBA and MCA hubs, the UU BBA hub and the Shoolini BBA hub

Results:
- Every page returns 200 with H1 = 1 and 0 JSON-LD parse errors. Visible "undefined", "NaN" and "N/A" are all 0. There are no "Avg Salary", "Low monthly", "Registration / Admission Fee", "30–40%" or "80% of the Indian job market" strings.
- **Sourced fields still show.**
  - DSU and Symbiosis hubs show "Assessment Pattern ... as the university publishes it".
  - The DY Patil hub shows the "not published" line.
  - Published EMI shows: Amity ₹8,906, MUJ, UU ₹3,733, ACU ₹4,417, LPU, Chandigarh, MAHE, IGNOU.
- **Empty sections are omitted.**
  - Shoolini (emiFrom 0) shows no EMI section and no ₹0.
  - Universities without weighting have no Assessment row.
  - ACU's profile has no Established tile. UU shows "Established 2013".
  - Non-MBA hubs drop the eligibility line, keep the "Good fit / Not ideal" lists, and drop the eligibility FAQ. There is no empty card.
- **Salary:** there is no "Avg Salary" or "Salary Range" label left on university pages (116 and 1,207 files on base, 0 now).

**Pre-existing, unchanged base to branch:** "Fees: ₹0+" in the "Other Universities" cards on 46 pages, including the MUJ profile. Base and branch have the identical file set.

## 3. Generated files (PASS)

A fresh build changed 13 files:
- lib/canonical-slugs.json
- programme-allowlist-{ba,bba,bca,bcom,bsc,ma,mba,mca,mcom,msc}.json
- programs-manifest.json
- valid-urls.json

CR-stripped md5 equals HEAD for all 13, and `git diff` shows nothing. So the difference is CRLF only, and the commit is not missing a regeneration. I restored them with `git checkout --`.

## 4. Built output (PASS)

I used a plain substring count over all 2,335 HTML files, both raw HTML and visible text (scripts, styles and comments stripped). This is the same detector as in prior QA rounds.

**The searches work.** Base reproduces the engineer's "before" figures exactly:

| Needle | Base visible files (hits) | Branch |
|---|---|---|
| "Low monthly" | 480 | 0 |
| "Registration / Admission Fee" | 543 | 0 |
| "80% of the Indian job market" | 506 | 0 |
| "30–40%" / "60–70%" | 1,304 / 1,304 | 0 / 0 |
| "curriculum each admission cycle" | 966 | 0 (1 raw: RSC payload of 1 page, not visible) |
| "Established N/A" | 142 | 0 |
| "Alumni report salaries" | 1,207 | 0 |
| "₹4L – ₹12L" | 391 (1,069 hits) | 0 |
| 2,13,760 / 2,25,200 / 2,13,744 | 20 / 20 / 20 | 0 |
| 3,29,200 / 3,12,552 | 5 / 5 | 0 |
| "4,317" | 12 (35 hits) | 0 |
| "5,417" / "6,187" | 10 / 12 | 0 / 0 |
| "2,92,400" | 1 (3 hits) | 0 |
| "India's ONLY Pay-After-Placement" / "5-day on-campus immersion" | 18 / 18 | 0 / 0 |
| "1,20,000 before placement" | 9 | 0 |
| "Rs 1.19L" / "Rs 30,000 cheaper" | 1 / 3 | 0 / 0 |
| "after 30% scholarship" | 17 | 0 |
| "under Rs 2 lakh" | 11 | 3 |
| "widest specialisation" | 6 | 3 |
| "19 specialisations" | 18 | 11 |
| "established in 2011" | 9 | 9 (3 are UU, see F1) |

**New values present:** 2,13,750 in 20 files, 3,29,000 in 5, 3,733 in 13, 4,417 in 12, "Check the UGC-DEB programme register" in 61 hubs.

**Residual hits, each read by hand:**
- **"under Rs 2 lakh":** commerce-jobs, delhi-ncr and blog/page/11. These are generic budget phrases, not about Amity.
- **"widest specialisation":** the MUJ claim in online-manipal-review, Sathyabama in the Tamil Nadu blog, and the JAIN hub. None is about these four.
- **"19 specialisations":**
  - The frozen Amity review meta and its listing card (blog/page/7).
  - 9 compare intros "Amity University: 19 specialisations": a template count of `specs` (19), deferred in FIX-LOG to Q25. It is pre-existing, not new. Recommend suppressing the count for Amity until Q25 is answered.
- **"established in 2011":** Galgotias and MUJ/Manipal pages, plus 3 UU spec pages (F1).
- **"30% scholarship":** 8 files, all Sikkim Manipal's own Northeast scholarship.
- **"QS World":** 48 files. These are Shoolini lines (Q30) and Amity BBA/MCA blogs outside this MBA sheet. Follow-up: online-mca-amity-vs-lpu and the amity-online-bba posts still say "QS World".
- **"0% interest":** 9 files, Amity BBA, JAIN, UPES and generic posts. None is the BITS MBA page.
- **"Included in total":** 1 file, typed in the JIIT review body.
- **"EMI figures are indicative":** 1 file, the UU review's own EMI comparison footnote.
- **"Avg Salary":** 9 blog posts with typed tables. Blog salary was outside avgSalary scope.

**Advisory: GatedContent precision**
- The GatedContent change applies to every profile. The card now prints exact feeMin–feeMax for all 143 profiles, including placeholder ranges.
- 59 profiles print "₹60,000 – ₹2,00,000" (was "₹60K – ₹2.0L"), 11 print "₹75,000 – ₹1,80,000", and 7 print "₹90,000 – ₹2,00,000".
- These are not new figures. The leak predates this batch, but the placeholders now look exact.
- Recommend a follow-up: feed this card from getDisplayFee or the fees rule 4d suppression.

**Advisory: spec-level salary still renders**
- Spec pages still render a "Salary: ₹6L – ₹25L per annum" career-path line on about 1,014 pages (the per-spec salary map, not avgSalary). This includes all four universities' spec pages.
- It is outside the sheets' rows. Flagging it so Part B item 7 is not read as "no unsourced salary left".

**Earlier batches are intact:**
- **A9:** all 12 needles are 0 raw and 0 visible on university pages. "within 48 hours" is 2 raw and 0 visible, as before (JAIN/LPU FAQ JSON).
- **BITS:** no DEB claim. "UGC-DEB entitled", "appears on the UGC-DEB", "Yes: UGC DEB", "Your UGC-DEB ID", `alt="UGC DEB"` and "QS World" are all 0. "UGC DEB approved" is 10 visible, the same as base (site footer). The new register link correctly does not render for BITS.
- **D4 totals are unchanged**, apart from +1 per university from the profile card now printing exact rupees instead of "₹1.2L"/"₹1.7L":
  - NIU ₹1,18,000: 29 files
  - Alliance ₹1,74,000: 27 files; ₹8,700: 7
  - Sharda ₹1,50,000: present on the profile
  - JIIT ₹1,75,000: 128 files; ₹5,850: 6
  - Each profile card reads its D4 total.
- **Symbiosis** "NIRF #24 (University 2025)": 1 visible / 15 raw files, same as base.
- **DSU:** "NAAC A++ (DSU" is 0.
- **JAIN:** "16 specialisations" is 3 files / 6 hits, same as base.
- **AI tracks:** /programs/mba/ai-for-marketing, ai-for-human-resources and ai-for-international-finance each return **308 → /programs/mba**.

## 5. Titles and frozen pages (PASS)

I compared `<title>`, all H1 text and meta description on all 2,335 pages, base vs branch:
- 0 title changes.
- 0 H1 changes.
- 3 meta changes, exactly the three listed: blog/uu-doon-online-mba-review, the Amity MBA hub and the UU MBA hub. Each drops only "30%" or "19".
- None of the three is on the protected/frozen list (data/protected-ai-pages.csv). check-protected-pages reported "8 protected paths and 8 frozen posts checked".
- The 45 updatedAt bumps are accepted. check-blog-updated-at reported "45 post(s) with content changes, all dated".

## 6. Gates (PASS)

- `bash .husky/pre-commit` on the real staged diff (1ed2ea6 plus the f7317ee tree, in the scratchpad clone) exited 0 and ended with "pre-commit: all checks passed".
  - check-blog-fees: "2023 unverified, unchanged from baseline".
  - em-dash baseline unchanged (234).
  - fee baseline unchanged (205).
  - check-hub-fee-text: 0.
  - check-gsc-404s: OK across 690 URLs.
  - The hook wrote no further changes.
- No file under `scripts/` or `.husky/`, and no allowlist or ranges file, was touched.
- The only baseline change is data/blog-fee-baseline.json: totalUnverified 2024 → 2023 and nmims-online-mba-review-2026 11 → 10. Both went down.
- data/sitemap-lastmod.json changed only re-dates (hook-maintained).
- **check-nirf-category labels are genuine.** These are the rendered labels:
  - Amity: "NIRF (Uni 2025) #22", "(Mgt 2025) #49", "(Eng 2025) #37", "NIRF Mgmt #49 (2025)", "NIRF Management 2025 #49", "NIRF University #22 (2025)", "NIRF #49 Management 2025"
  - Shoolini: "NIRF (Uni 2025) #69", "NIRF Univ #69 (2025)"
  - Profile FAQ: "ranked at NIRF University rank #22 and NIRF Management rank #49"
  - Each names its category beside the rank.

## 7. House rules (PASS)

- 0 em dashes added and 0 removed in the diff.
- No new visible official-site link.
  - Branch: amityonline.com 4 and shoolini.online/mba.php 4, the same as base.
  - onlineuu.in went from 3 to 1. Both review links were removed. The remaining one is the pre-existing `/mba.php` link in the UU review.
- The only new external link is deb.ugc.ac.in/Home/HEI_Prog_List. It is a regulator link that PAGE-STANDARDS M4 asks for, and D6 bans only university-site links. It shows only where `isOnDebRegister` is true.

## 8. Rendering (PASS)

Checked on `next start -p 3127`:

| Page | Status | H1 | JSON-LD (parse errors) | undefined / NaN / ₹0 |
|---|---|---|---|---|
| /universities/amity-university-online | 200 | 1 | 9 (0) | 0/0/0 |
| /universities/amity-university-online/mba | 200 | 1 | 11 (0) | 0/0/0 |
| /universities/uttaranchal-university-online | 200 | 1 | 8 (0) | 0/0/0 |
| /universities/uttaranchal-university-online/mba | 200 | 1 | 10 (0) | 0/0/0 |
| /universities/shoolini-university-online | 200 | 1 | 8 (0) | 0/0/0 |
| /universities/shoolini-university-online/mba | 200 | 1 | 10 (0) | 0/0/0 |
| /universities/adichunchanagiri-university-online | 200 | 1 | 8 (0) | 0/0/0 |
| /universities/adichunchanagiri-university-online/mba | 200 | 1 | 10 (0) | 0/0/0 |

## To pass on rerun

1. Apply F1, F2 and F3. That is 8 one-line edits in 8 files.
2. Correct the FIX-LOG salary count from 252 to 407 values (61 distinct).
3. Optionally update the stale comment at lib/data.ts:5114.
4. Rebuild. Expected visible counts: "established in 2011" 0 on UU pages, "unique in India's online MBA space" 0, "Amity offers 19" 0.
