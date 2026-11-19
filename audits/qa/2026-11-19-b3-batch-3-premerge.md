# QA pre-merge: B3 batch 3 (fix/b3-batch-3 @ 2bba489, base 1ed2ea6 = origin/main, live)

Checked 2026-11-19 by qa-checker. No code was changed.

**Builds compared**
- Both builds ran in worktree `agent-a10e18a83ae7ad291`, one after the other, with nothing else building in that worktree.
  - **Base:** 1ed2ea6, `npm run build`, exit 0, 2,360/2,360 static pages. The prerendered HTML was copied to the session scratchpad.
  - **Branch:** 2bba489, `npm run build`, exit 0, 2,360/2,360 static pages.
- `/programs/*` is dynamic, so each build was served with `next start -p 3128` and fetched. Only my own PIDs were killed (34948 for base; 6712 and 14480 for branch).
- Batch 2's worktree (`agent-a0f4ac625e43eccf2`) and its port 3127 were not touched. Its server had already exited.

**Gates harness**
- In my worktree I checked out 1ed2ea6, staged the full 2bba489 tree on top (34 files, +668/-216) and ran `bash .husky/pre-commit`.

**Cleanup**
- The worktree is back on fix/b3-batch-3 at 2bba489 with `git status` empty.
- The CRLF churn that prebuild left on 13 generated files was restored after each build.

## Overall: FAIL (3 one-line misses: Vignan price claims that hold only at ₹90,000; everything else passes)

| # | Check | Result |
|---|---|---|
| 1 | Fidelity | **FAIL** (F1, F2, F3). Every edit the engineer made matches a sheet or audit row. The 3 misses are surviving sentences of the class the FIX-LOG says were removed. |
| 2 | NAAC surfaces | PASS |
| 3 | Built output, detectors, earlier batches intact, emiFrom 0 | PASS apart from F1-F3 |
| 4 | Titles, H1, meta, frozen list | PASS |
| 5 | Gates | PASS |
| 6 | House rules | PASS |
| 7 | Rendering | PASS |

## FAILs and exact fixes

Each sentence below makes a price claim about Vignan that rests on the unverified ₹90,000 and is false at the portal's ₹1,10,000 (Q38). The FIX-LOG says "sub-Rs 1 lakh claims about Vignan" were removed, and that a direction was kept "only where it holds at both Rs 90,000 and Rs 1,10,000". These three survive, and all three render.

**F1. BIT Mesra marketing: "sub-Rs 1L price point"**
- Location: `lib/data/page-content/bit-mesra-online-mba-marketing.json:27` (comparisons body). Renders on `/universities/bit-mesra-online/mba/marketing`.
- Current text: `Vignan at Rs 90,000 is significantly cheaper with NAAC A+. Strong value at the sub-Rs 1L price point.`
- Fix: delete ` Strong value at the sub-Rs 1L price point.`
- Keep "significantly cheaper". BIT Mesra is ₹1,78,000, so it holds at both Vignan figures.

**F2. ICFAI marketing: "substantially cheaper"**
- Location: `lib/data/page-content/icfai-university-online-mba-marketing.json:27`. Renders on `/universities/icfai-university-online/mba/marketing`.
- Current text: `Vignan is substantially cheaper.`
- Why it fails: ICFAI is ₹1,20,000. Against ₹1,10,000 the gap is ₹10,000, so "substantially" does not hold at both figures.
- Fix: replace it with `Vignan is cheaper.`
- The engineer already rewrote the sibling ICFAI finance file. This one was missed.

**F3. DSU IT and Systems: "under Rs 1 lakh"**
- Location: `lib/data/page-content/dayananda-sagar-university-online-mba-it-systems-management.json:62` (chooseAlternatives.consider). Renders on `/universities/dayananda-sagar-university-online/mba/it-systems-management`.
- Current text: `Your budget is under Rs 1 lakh. Vignan IT (Rs 90,000, NAAC A+) or Kurukshetra IT (Rs 1,02,000, NAAC A++) are cheaper.`
- Why it fails: the premise is false for Vignan at ₹1,10,000, and already false for Kurukshetra at ₹1,02,000.
- Fix: replace it with `You want a lower fee. Vignan IT (Rs 90,000, NAAC A+) or Kurukshetra IT (Rs 1,02,000, NAAC A++) are cheaper.`
- "Cheaper" holds at both figures because DSU is ₹1,30,000. The engineer edited the comparisons body of this same file.

After these 3 edits:
- No re-build of the whole site is needed for QA. A grep on the three files plus `bash .husky/pre-commit` is enough.
- These are JSON content files, not blog posts, so check-blog-fees and the updatedAt gate do not apply.

## 1. Fidelity: FAIL (F1-F3); the edits themselves PASS

I read the full diff:
- lib/data.ts, data-slim, naac-verified, fees-hub-data;
- all 10 blog.ts posts;
- all 27 page-content JSONs, diffed sentence by sentence.

**Sources for the new facts**
- "101-125 band in Management (2025)": sheet row "NIRF Engineering and Management (red flag 1)", source nirfindia.org ManagementRanking150. It is on the hub red flag and in the ICFAI finance comparison.
- "EMI starting ₹2,900": sheet row "EMI (derived)", source vignanonline.com/online-mba/finance. It is in 7 spec FAQs and the hub emi body. fees-hub-data carries it as emiFrom 2900 and "₹2,900/mo".
- "Online mode, session 2026-27": sheet row "Session shown on page" (FIX).
- 5% SC/ST relaxation: sheet row "Eligibility relaxation" (FIX).
- Delivery wording: sheet row "Class delivery" (FIX).
- "registration fee and an examination fee": sheet row "Fee components". Note text only, no amounts, no sum.
- officialUrl https://vignanonline.com: sheet row "Admission URL" (FIX).
- NAAC A+: sheet NAAC row and naac-audit r16.
- SRM {A++, null} and Jaypee {A, null}: naac-audit fix list rows 139 and 140.
- JIIT comment "r472, cycle 2, CGPA 3.10": naac-audit row 65.

**No open question touched**
- **Q38:** the ₹90,000 MBA fee is unchanged everywhere, including the 13 metas and the profile and hub titles. MCA, BCA and fee components are untouched.
- **Q37:** validTill is null and no lapse warning was added, which is the pre-filled "as-is" state.
- **Q39:** "UGC DEB approved" is still on all 7 spec pages.
- **Q40:** intake and last-date lines are unchanged.
- **Q41:** the hub still lists 7 specialisations, and the renames were skipped.
- **Q42-Q48:**
  - The UP FAQ still lists Amity and Sharda as A+, unchanged (Q43, Q45).
  - No other naac-verified entry was changed (Q46).
  - Supabase and the sync script were not run (Q48).

**No sums, marketed percentages or invented EMI**
- emiFrom is 0 on the record and in data-slim.
- ₹3,750, ₹5,700, ₹15,000, ₹7,500 and ₹22,500 were all removed and nothing was recomputed.
- "Confirm with counsellor" replaces the per-semester ~₹22,500 in the 2 blog tables.

**"Direction kept only where it holds at both ₹90,000 and ₹1,10,000": 10 instances checked**
- Peer fees are from data/fees-hub-data.json.
- **Kept, and holds at both figures:**
  - DSU ₹1,30,000: "Vignan is cheaper" (BA, IT, SCM).
  - Dr MGR ₹1,36,000-1,41,000: "Vignan is cheaper" (5 files).
  - Bharati Vidyapeeth ₹1,29,000-1,78,000: "lower fee" and "wins on price".
  - Sharda ₹1,50,000: "costs more".
  - DPU ₹1,89,400: "costs more" and "lower-fee alternative".
  - JIIT ₹1,75,000 and MUJ ₹1,84,000: "costs more".
  - SMU ₹1,20,000: "costs more".
  - Galgotias ₹80,200: "Galgotias is cheaper"; Vignan "costs more".
- **Correctly neutralised, because the direction flips at ₹1,10,000:**
  - Arka Jain ₹1,08,500: "cheaper" and "lower price" dropped.
  - Kurukshetra ₹1,02,000: "Rs 12,000 cheaper" dropped.
  - Uttaranchal ₹99,600: "Rs 9,600 more" changed to "also holds NAAC A+".
  - Logistics FAQ: "Rs 4,000 cheaper" dropped.
- **Not covered by the rule:** F1-F3, in files the sweep missed.

**UP online MBA FAQ "Seven/Four → These"**
- Base text: "Seven universities hold NAAC A+" followed by 9 names, and "Four ... hold NAAC A" followed by 4 names. Both counts no longer matched once Jaypee moved.
- New text: 8 names under A+ and 5 under A, with "Jaypee (JIIT)" now under A (naac-audit r472).
- "These" is true. The table cell changed A+ → A.

**Kurukshetra peer subjects**
- The new subjects are "business intelligence, data warehousing and data mining" and "ERP, software engineering, IT project management, and IT privacy and security".
- Both match Vignan's own BA and IT spec JSON syllabus, which the sheet marks as matching the portal.

**Sentences sampled against sources: 24**
- Peer files, 12:
  - arka-jain finance and marketing
  - bharati-vidyapeeth finance x3 and marketing
  - DSU BA, IT and SCM
  - Dr MGR x5
  - ICFAI finance
  - Kurukshetra x4
- Vignan spec JSONs: about, tldr, fees, faqs/1, faqs/2 and comparisons, all 7 files.
- Hub JSON, 9 sections: tldr, about, approvals, ugcDeb, whoCanApply, classes, exams, fees, coupon. It also has emi, admission, honestVerdict and redFlags.
- Blog, 6 sentences: the review meta, FAQ, intro, the two comparison tables and the verdict; the JIIT callout; the BCA guide x3.

## 2. NAAC surfaces: PASS

**/programs/mba, bba, mca, bca on next start :3128**
- I compared every table row's NAAC cell and every card's NAAC badge, base vs branch. The four pages hold 294 table rows and 332 cards in all.
- Changes on all 4 pages:
  - Vignan: table "A++ valid to 2031-06-16" → "A+"; card "NAAC A++" → "NAAC A+".
  - SRM: "A++ valid to 2029-08-16" → "A++".
  - JIIT: "A+ valid to 2031-04-25" → "A".
- There are no other changes, and no other university's NAAC display moved.
- Vignan has no BBA table row in base either, so the BBA page shows only the card change.

**Other NAAC checks**
- The `data/naac-verified.json` diff is exactly 3 entries: Vignan {A+, null}, Jaypee {A, null} and SRM {A++, null}.
- `npx tsx scripts/build-llms-txt.mjs --check` returns "OK (143 universities, 25 with a current verified NAAC grade)". public/llms.txt is unchanged.

## 3. Built output: PASS apart from F1-F3

Every search is on visible text (scripts and styles stripped). Each was proven on base first: base count, then branch count.

| Detector | Base | Branch | Residuals read |
|---|---|---|---|
| A++ within 80 chars after "Vignan/VFSTR" | 37 / 22 pages | 4 / 4 pages | All attribute A++ to Kurukshetra or ICFAI, not Vignan |
| A++ anywhere on a Vignan page | 116 / 16 | 7 / 4 | Kurukshetra, NMIMS, IGNOU, DPU, and the IGNOU sidebar card |
| ₹3,750 on Vignan pages | 14 / 4 | 0 | n/a |
| 3,750 near "Vignan" site-wide | 2 / 2 | 0 | n/a |
| cheapest / most affordable / lowest fee near Vignan | 37 / 18 | 16 / 11 | All name Galgotias or IGNOU, except F1 and F2 |
| price superlative or lakh threshold near Vignan | 41 / 14 | 8 / 5 | F1, F2; Kurukshetra "Galgotias ... cheapest" (Galgotias) |
| lakh threshold or gap arithmetic near Vignan | 29 / 20 | 4 / 4 | F1, F3; MCA guide "under Rs.1L" (MCA fee, deferred to Q38, see A6) |
| 5,700 on Vignan pages | 20 / 6 | 0 | n/a |
| WES on Vignan pages | 2 / 2 | 1 / 1 | Review: "higher education abroad (subject to WES evaluation)". Generic, not a recognition claim |
| Salary on Vignan MBA profile, hub and specs | profile 1, hub 11 | profile 0, hub 2 | Hub residuals are "salary data" (tile intro) and "minimum salary commitment" (generic). See A2 and A3 for MCA, BCA and per-spec lines |
| QS near Vignan | 2 / 1 | 0 | n/a |
| "no NIRF Management rank" / "has neither" (Vignan) | present | 0 on Vignan pages | Other universities' own flags remain |
| JIIT/Jaypee followed by A+ (not A++) | 3 / 3 | 1 / 1 | JIIT hub: "JIIT Online's NAAC grade is A, not A+." Correct |
| online.vignan.ac.in on Vignan pages | 0 visible | 0 | Raw JSON link removed from the hub admission body |

**Earlier batches intact.** Substring counts over all 2,335 HTML files are identical in base and branch:
- **A9:** all 12 needles are 0 raw and 0 visible. "within 48 hours" is 2 raw and 0 visible, as before.
- **D4:**
  - ₹1,18,000: 30 files / 106 hits
  - ₹1,74,000: 30 / 70
  - ₹8,700: 10 / 17
  - ₹1,75,000: 150 / 357
  - ₹5,850: 8 / 15
  - ₹1,50,000: 250 / 622
- **Symbiosis:** "NIRF #24 (University 2025)" is 15 raw / 1 visible.
- **DSU:** "NAAC A++ (DSU" is 0.
- **JAIN:** "16 specialisations" is 14 files / 27 hits.
- **AI tracks:** /programs/mba/ai-for-marketing, ai-for-human-resources and ai-for-international-finance each return 308 → /programs/mba.

**emiFrom 0**
- **Profile:**
  - The hero "EMI from ₹3,750/mo" tile is gone.
  - The details card shows "📋 Current fee breakdown and payment options, confirmed with the university", not the "No-cost EMI, 12 to 24 months" line.
  - The Avg Salary tile is gone.
  - Nothing is empty, and there is no ₹0.
- **Hub and spec FeeBreakdown:** the "EMI starts from" row is dropped.
- **Counts across all pages:**
  - "education lending partners" (EMIPlans): 494 → 491 visible files.
  - "No-cost EMI, 12 to 24 months": 118 → 117.
  - "EMI ₹0" and "₹0/mo": 0.
  - "partner banks": 2 files, both non-Vignan blogs (mahe review, working-professionals).
- `components/EdifyRecommends.tsx:96` prints `EMI ₹${u.emiFrom}/mo` unguarded, but nothing imports the component.

## 4. Titles, H1 and meta: PASS

All 2,335 pages were compared, base vs branch. No pages were added or missing.
- **`<title>`: 1 change.**
  - `/universities/vignan-university-online`: "Vignan University Online 2026: Courses, MBA ₹90,000" → "..., NAAC A+".
  - It is derived: `app/universities/[id]/page.tsx:67-83` builds `naacSeg` from `u.naac`, and clampTitle picks the longest candidate that fits. The A++ version did not fit; A+ does.
  - The page is not on `data/protected-ai-pages.csv` and not in FREEZE_SLUGS.
- **H1: 0 changes.**
- **Meta: exactly 13 changes,** all on Vignan pages, each A++ → A+:
  - the review
  - BBA, BCA and BCA/data-science
  - the MBA hub and the profile
  - all 7 MBA specs
- Two spec metas (business-analytics and finance) also gained template tail text ("UGC-DEB approved." / "Compare before you enrol.") because the shorter grade frees space. This is derived, not hand-written.
- `vignan-online-mba-review` is not on the protected list or the freeze list.
- check-protected-pages: "8 protected paths and 8 frozen posts checked".
- JSON-LD: 0 pages newly fail to parse.

## 5. Gates: PASS

`bash .husky/pre-commit` on the real staged diff (2bba489 tree over 1ed2ea6) exited 0 with "pre-commit: all checks passed". Key lines:
- check-em-dash-baseline: "234 em dash total, unchanged from baseline".
- check-fee-baseline: "205 suppressed, unchanged from baseline".
- check-blog-fees: "2024 unverified, unchanged from baseline".
- check-blog-updated-at: "10 post(s) with content changes, all dated". The 10 updatedAt bumps are accepted.
- check-llms-txt OK; check-official-urls OK (143, 27 with a confirmed portal).

The diff touches no file under scripts/ or .husky/, and no baseline, allowlist or protected list. The hook wrote nothing back.

## 6. House rules: PASS

- **Em dashes:** 0 added lines and 0 removed lines contain an em dash, outside audits/.
- **Links:**
  - The only URLs on added lines that are not also on removed lines are `https://vignanonline.com` in lib/data.ts `officialUrl`. It is not printed visibly. It now emits JSON-LD `sameAs: ["https://vignanonline.com"]` on the profile, which the sheet row asked for.
  - `https://online.vignan.ac.in` was removed from the hub admission body.
- **Advisory only:** the existing plain-text "vignanonline.com" mentions in the review were left as they were.

## 7. Rendering: PASS

Fetched from `next start -p 3128`:

| Page | Status | H1 | JSON-LD (parse) | undefined / NaN / ₹0 |
|---|---|---|---|---|
| /universities/vignan-university-online | 200 | 1 | 8 (ok) | 0 / 0 / 0 |
| /universities/vignan-university-online/mba | 200 | 1 | 10 (ok) | 0 / 0 / 0 |
| /universities/vignan-university-online/mba/finance | 200 | 1 | 8 (ok) | 0 / 0 / 0 |
| /universities/vignan-university-online/mba/business-analytics | 200 | 1 | 8 (ok) | 0 / 0 / 0 |
| /universities/jaypee-university-online/mba | 200 | 1 | 10 (ok) | 0 / 0 / 0 |
| /universities/srm-institute-science-technology-online | 200 | 1 | 8 (ok) | 0 / 0 / 0 |
| /blog/vignan-online-mba-review | 200 | 1 | 7 (ok) | 0 / 0 / 0 |
| /blog/jaypee-jiit-online-mba-review ("NAAC A" callout renders) | 200 | 1 | ok | 0 / 0 / 0 |
| /programs/mba | 200 | 1 | 6 (ok) | 0 / 0 / 0 |

## Advisories (not blocking; none is new in this batch)

- **A1. FeeBreakdown template.** `components/FeeBreakdown.tsx:97` prints "EMI available through lending partners." on 543 pages, plus "Registration / Admission Fee: Included in total" and "Study Material: Included (digital)".
  - These print on the Vignan hub and the hr-management and supply-chain-management spec URLs. They contradict the new FAQ ("do not publish ... the lender") and the sheet's Fee components FIX row.
  - The engineer deferred fee components with Q38, which is defensible. This needs a template change once Q38 is answered.
- **A2. Vignan MCA and BCA pages still print the hirer list and alumni salary ranges.**
  - Hirers: "foundit Google Cloud AWS HDFC Bank ICICI Bank Amazon Accenture".
  - Salary ranges: "₹3L-₹9L" and "₹4L-₹14L".
  - The FIX-LOG declares these outside the batch, because the sheet's rows are MBA rows.
- **A3. Per-spec "Salary: ₹4.5L-₹18L / ₹6L-₹20L per annum" career-path lines** still render on Vignan's hr-management and supply-chain-management URLs. These come from the template salary map, as batch 2 advisory noted.
- **A4. Two edited spec files are latent.** The URLs `/mba/hr-management` and `/mba/supply-chain-management` do not render `vignan-university-online-mba-human-resource-management.json` or `-logistics-supply-chain-management.json` (no spec FAQ block appears), so those two files' edits are latent. This is a slug mismatch that predates the batch.
- **A5. /fees shows Vignan "₹1.10L" and "EMI from ₹2,900/mo",** while every other surface shows ₹90,000. This contradiction predates the batch and Q38 resolves it. "/mo" is a unit restatement of the portal's "EMI starting ₹2,900".
- **A6. Vignan fee-direction claims on MCA and BCA.** The online MCA guide ("Vignan's (Rs.90,000) ... under Rs.1L total") and the BCA guide ("The fee is significantly lower than competitors with similar NAAC grades", at ₹1.08L against the portal's ₹1,20,000) rest on the deferred MCA and BCA fees. Revisit them with Q38.
