# QA pre-merge: B3 batch 19 (fix/b3-batch-19)

**Date:** 2026-11-27 · **Checker:** qa-checker (outside reviewer) · **Commits:** 610dd2e + e857e46 (log only), compared against base 02552a9 (batch 18 round 2 tip)
**Method:** detached worktrees for 02552a9 and e857e46 under the session scratchpad. node_modules was junctioned, audit-data/ was copied in, and both were built with `npm run build`, with the generated files restored afterwards. Production servers ran on 3941 (base) and 3942 (tip). A third worktree held 02552a9 with the 02552a9..e857e46 diff staged, and the full .husky/pre-commit ran there. Every worktree, junction and server was removed afterwards. The main checkout was not touched.

## Overall: FAIL (2 blocking findings; small fixes)

| # | Finding | Severity |
|---|---|---|
| F1 | Unlocking the Christ BBA fee made FeeBreakdown print three generic claims on 2 indexed Christ pages, and no row in batch19-facts backs them | Blocking (new unsourced fact) |
| F2 | The Q60 row in QUESTIONS-FOR-RISHI.md has an extra cell, so the ANSWERED note is invisible when the table renders | Blocking (small; Q60 is not really "marked answered") |
| C1 | Rendered titles and metas changed on 6 pages. These come from templates; the source title fields were not edited. FIX-LOG's "No title, seoTitle or metaDescription changed" holds for source fields only | Coordinator must acknowledge |

### F1. Christ BBA FeeBreakdown carries unsourced claims
- At base, /universities/christ-university-online/bba and /bba/general-management showed the counsellor fallback, because getExactFee was none.
- At tip, getExactFee gives exact 3,00,000. components/FeeBreakdown.tsx now renders its generic block on both pages:
  - "Fee structure for BBA . Payment is accepted semester-wise or in full. EMI available through lending partners."
  - "Study Material / Included (digital)"
- None of these is in audits/verify/batch19-facts-2026-11-27.md:
  - Christ prints the fee per **year** (1st, 2nd and 3rd Year Rs 1,00,000; row 1c). Nothing says semester-wise.
  - Row 1f says only "Flexible EMI options are available for tuition fee payments". It names no lending partner.
  - No row covers study material.
- B3 batch 4 added NO_UNSOURCED_FEE_COMPONENTS for exactly this case. Christ is not in it, while Amrita, CU and others are.
- **Fix:** add `'christ-university-online'` to NO_UNSOURCED_FEE_COMPONENTS in components/FeeBreakdown.tsx, then rebuild. With that change Amrita's pages print "Confirm the payment schedule with our counsellor before you pay." and no Study Material row.

### F2. Q60 row is malformed
- QUESTIONS-FOR-RISHI.md Q60 ends `...is printed || ANSWERED 27 Nov ... |`. That gives 9 pipe-separated fields (7 cells) against the header's 6 columns. Every other Q row has 8 fields.
- GFM drops extra cells. The "Rishi's answer" column renders empty and the ANSWERED text is not shown.
- The note is also written into the answer slot as "not by Rishi", even though the header says Rishi writes in that column.
- **Fix:** collapse the `||` so the note sits in the 6th cell, or follow the Q6 convention: "RESOLVED ..." in the Item/Question cell, with the answer cell left for Rishi.

### C1. Rendered head changes, all template-derived

| Page | What changed |
|---|---|
| /universities/christ-university-online/bba | title "Christ University Online BBA 2026 \| edifyedu.in" becomes "Christ Online BBA Fees 2026: ₹3,00,000 \| edifyedu.in"; description, og and twitter tags also change |
| /universities/christ-university-online/bba/general-management | description: "fees on request" becomes "₹3,00,000 fees" (title same) |
| /compare/chandigarh-vs-lpu, /compare/amity-vs-chandigarh, /compare/manipal-jaipur-vs-chandigarh | description and og:description: "with 1 certificate ... with 3 certificates" becomes "MBA plan ... Triple Industry Certified MBA plan", from the feeBreakdown labels; still cut at about 160 characters |
| /fees | description: "published total fee for 60" becomes "61" |

- None is a frozen review post. The protected-pages gate passed.
- These are the expected result of a correct fee and label change. Still, the Christ BBA hub's indexed title changes, and the batch's claim of "no title or meta change" does not hold for rendered output. Record it in the fix log.

## Test results

### 1. Christ BBA: PASS on data, FAIL on render (F1)

| Check | Result | Evidence |
|---|---|---|
| Sheet supports ₹3,00,000 | PASS | Row 1c: "For Indian Students ... Total- Rs.3,00,000", from online.christuniversity.in/courses/MTA=, 2026-11-27. The data.ts comment cites it and says application, admission and exam fees are separate. |
| getExactFee | PASS | tip: `exact ₹3,00,000` (getDisplayFee ₹3L). base: none. |
| Built page shows it | PASS | Hub hero "Total Fees ₹3,00,000", spec card, FeeBreakdown, FAQ "Total programme fee is ₹3,00,000 across 3 Years", JSON-LD offers price 300000. Profile "BBA ₹3,00,000". /fees "₹3,00,000 (BBA)". |
| No Christ 1,75,000 / 1.75L / 175K | PASS | Source: no Christ line. Built HTML: 0 files with Christ within 250 chars of those strings (base: 7 files). The remaining 175K hits on Christ pages belong to other universities in the global fee map (Amity BCA, JIIT MBA, UPES). |
| Table order, cheapest first | PASS | ...Manav Rachna 1,80,000 < Amity 1,99,000 < Christ 3,00,000. Still 37 rows, matching the "37 Universities" title. |
| "Most expensive" claims and FAQ range against getExactFee | PASS (scoped) | The maximum getExactFee among the 37 named universities is Christ at 3,00,000. Amity is labelled 1,75,120 / 1,99,000. 17 of the 37 return getExactFee none (UPES, Amrita, Manav Rachna, KSOU, Bharathiar, KL, Lucknow, VTU and others), and no named university's pd.fees exceeds ₹3L. Christ is NAAC A+, so "one band lower" holds. The FAQ floor of Rs 39,000 (KSOU) is getExactFee none; it was there before this batch and was not changed. |
| updatedAt bumped | PASS | 2026-11-25 becomes 2026-11-27 |
| Christ MCA unchanged | PASS | data.ts '₹2.3L' untouched. getExactFee none at both. MCA pages: head same and no visible diff. |
| Placeholder ₹60K–₹2L | Advisory | Not rendered on any prerendered Christ page or listing (/fees, /universities, /tools/university-comparison). The only prerendered "₹60K – ₹2L" hits are SRM IST pages and blog/online-mba-tamil-nadu-2026, not Christ. It is exposed raw by /api/universities (feeMin 60000 / feeMax 200000), which was already the case. |

The 8 blog edits are not served: online-bba-fees-india-2026-compared is status redirected and returns 308 to /blog/online-bba-fees-india-2026 on both servers. The live target post builds its table from data, and it now lists Christ at ₹3,00,000 in last place, correctly ordered. It makes no range or "most expensive" claim.

### 2. Mysore: PASS

| Check | Result | Evidence |
|---|---|---|
| data.ts still ₹160K | PASS | line 3816 '₹160K – ₹160K', with a stop-case comment |
| getExactFee | PASS | none. Note: **getDisplayFee is ok with compact "₹1.6L"**, so the safety comes from the renderers using getExactFee, not from suppression. |
| No visible 1,60,000 / 1.6L / 160K / 6,667 | PASS | All 16 Mysore pages: title, meta and JSON-LD clean. Visible text reads "Contact our counsellor for current fee details". The 1,60,000 hits are JAIN's fee in the global map. The 160K hits are the raw programDetails in the RSC flight payload (page source, not visible), already there at base. online-mba-karnataka-2026 shows "Under revision". No OG fee: og:image is the static /og.png. |
| Baseline 205 to 206 | CONFIRMED | Scratch worktree, line 3816 set to 'Not published': `check-fee-baseline: FAIL. Mismatch count rose from 205 -> 206.`, exit 1. Restored afterwards. |

### 3. Amrita: PASS (edits are latent, as stated)

| Check | Result | Evidence |
|---|---|---|
| JSON fee text against the sheet | PASS | HR 2,20,000 (4h), Operations 2,24,000 (4i), ESG 1,96,000 (4j), IFA (ACCA) 2,60,000 (4k). Registration Rs 700 and exam Rs 2,750 per semester are listed as separate and not summed (4n). |
| Not rendered | CONFIRMED | "Total Tuition Fee" appears 0 times in all 4 built pages, and the 4 pages are byte-identical to base after normalising. UniSpecBody takes the FeeBreakdown branch on metadata.factSweep. |
| What those pages show | PASS | "Fee structure for MBA. Confirm the payment schedule with our counsellor before you pay. Total Program Fee ₹1,76,000–₹2,60,000". Both ends of the range are sourced (4a, 4k), and Amrita is in NO_UNSOURCED, so there is no lending-partner or Study Material line. |
| 0 "Total cost of programme" | PASS | Source 0. Built HTML 0. 1,87,700 / 2,31,700 / 2,35,700 / 2,55,700 / 11,000 appear 0 times in the Amrita JSONs. |
| Q60 marked answered | FAIL (F2) | Present, but in a malformed extra cell |

### 4. CU: PASS with advisories

| Check | Result | Evidence |
|---|---|---|
| feeBreakdown relabelled, amounts unchanged | PASS | getExactFee is labelled at both, with modes 175125 / 190400 / 233500 / 238000 unchanged. Labels are now "MBA plan ..." and "Triple Industry Certified MBA plan ...", which match plan labels 2a and 2e. |
| 2 posts, seo intro, coupon, 3 pairs FAQs | PASS (partial, see A2) | All edits are present and render, except the mba-seo-overrides intro, which renders nowhere at base or tip. The CU hub does not use the override intro, so that edit is latent. |
| Business-analytics budget line labelled | PASS | Renders "Rs 1,75,125 (CU's MBA plan, after the 25% Early Bird Scholarship)" |
| 87,563 count | PASS | 0 in source and 0 in tip HTML (base: 1 page) |
| 87,562 printed | PASS | Only on /blog/is-chandigarh-university-online-fake-or-legit-2026. It matches sheet 2d, plan "MBA" "Per Annum" ₹87,562. Also in the data.ts comment and the latent seo intro. |
| emiFrom | PASS | 0 |
| No title or meta in source | PASS | The mba-seo-overrides diff touches only `intro`. The pairs.ts diff touches only `faqs[].a`. The CU MBA hub head is unchanged. Compare-page descriptions change through the derived label (C1). |
| FAQ JSON-LD matches visible FAQ | PASS | The 3 compare pages, the 2 posts and the coupon page each have 0 LD answers missing from the visible text, and the new strings appear in both. The hubs' accordion answers sit only in the RSC payload, as at base. |

### 5. Q66–Q69: PASS
Q66, Q67, Q68 and Q69 come straight after Q65, and each number appears once. Each row has 6 cells, matching the header. Content matches drafts D2, D4, D5 and D7. D1, D3 and D6 were applied or merged and not filed, as the log states.

### 6. Damage and gates

| Check | Result | Evidence |
|---|---|---|
| Both builds exit 0, same page list | PASS | 2335 = 2335 HTML files, identical list. The tree is clean after restoring the generated files. |
| JSON-LD | PASS | Tip: 17,934 blocks, 0 parse failures, 0 undefined/NaN (base the same). |
| Tags balance | PASS | All 3 edited posts are balanced at base and tip (string-split counter, checked first on an injected extra `</div>`). |
| CRLF | PASS | All 14 blobs are LF at both 02552a9 and e857e46, with line counts unchanged except where lines were added. Working-tree CRLF comes from autocrlf. |
| No title or meta changes | CONDITION (C1) | Source fields untouched. 6 rendered heads changed, all template-derived. |
| Pre-commit on staged 02552a9..e857e46 | PASS | "pre-commit: all checks passed". fee 205, blog-fees 1950 and em-dash 227 all unchanged. The hook staged nothing extra. |
| Diff touches only item files | PASS | 14 files, all in scope. The sitemap-lastmod change is the ESG page date. |
| New-fact sourcing | FAIL (F1) | Everything else traces to batch19-facts rows 1c, 2a, 2c, 2d, 2e and 4h–4n. |
| Style in added lines | PASS | 0 em dashes and 0 filler words or banned sentence starters in added lines. |

Pages whose visible text changed (87 normalised HTML diffs): the 3 CU blog/coupon pages; 3 compare pages; 26 CU MBA spec pages plus the hub (label swap only); 7 /programs/mba/specializations pages and the Alliance and CHARUSAT hubs (CU peer label); Christ BBA hub, spec page and profile; /fees; the live BBA fees post; Uttaranchal BBA hub and 3 spec pages (Christ peer column, "CUO ... ₹3,00,000"). Nothing else changed visibly.

## Advisories (non-blocking)
- **A1.** The frozen metaDescription of online-bba-fees-india-2026-compared still says "Rs 39,000 to Rs 1,99,000". It is not served (the post 308s), and it is already logged as a post-5-Dec item.
- **A2.** Some "certificate" labels are left over:
  - In the fake-or-legit table, rows 1–2 now say "MBA plan" but rows 3–4 still say "Online MBA with 3 certificates", and the paragraphs below say "1-certificate MBA" and "3-certificate MBA".
  - The coupon still has "1 or 3 certificates by fee variant", the "3-certificate variant" exclusion, and the "What certifications does CU bundle" FAQ.
  - lib/blog.ts:36424 and :36490 have "Premium 3-certificate tier (Harvard, PwC, PMI CAPM)". The sheet lists CAPM/PMI and Harvard, not PwC.
  - Nothing here is false by row 2a's reasoning, but the wording is inconsistent within one table.
- **A3.** The business-analytics comparisons paragraph now mixes "CU Rs 1,75,125 Tier 1" with "(CU's MBA plan ...)" in the same body. Its FAQ LD still says "Tier 1 / Tier 2". This is already logged as left.
- **A4.** On the Christ BBA hub, the total is shown with no note that application (INR 1,500 + GST), admission (INR 5,000) and exam (INR 3,000 a year) fees are separate (row 1e). Consider adding one line.
- **A5.** Pre-existing and not caused by this batch:
  - In the redirected BBA post, "better accredited than every option above Rs 1,50,000 except two" is wrong: Amrita, Symbiosis and Manav Rachna make three A++ above 1,50,000.
  - In the same post, Uttaranchal's table figure of Rs 1,08,000 differs from getExactFee (labelled list 1,20,000).
  - The Uttaranchal peer table labels Christ "CUO", the same abbreviation as Chandigarh.
  - online-mba-karnataka-2026 has a Christ MBA "₹10.90L" footnote; the batch 18 domain (Q62) says there is no Christ online MBA.
- **A6.** Mysore's ₹160K is still in the RSC payload and /api/universities. That is expected while the field is held for Q68.

## To pass
1. Add christ-university-online to NO_UNSOURCED_FEE_COMPONENTS, or add source rows for the three claims. Rebuild and confirm the Christ BBA hub and spec page drop "semester-wise", "lending partners" and "Study Material".
2. Fix the Q60 row to 6 cells.
3. Note C1 (the 6 rendered head changes) in FIX-LOG.
A re-run of only the Christ pages and the Q60 row is enough. Everything else above stands.
