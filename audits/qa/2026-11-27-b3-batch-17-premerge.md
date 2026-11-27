# QA: B3 batch 17, pre-merge (fix/b3-batch-17 at 6e30448, base 78b2b7b)

Checker: qa-checker (outsider review). Date: 2026-11-27.
Method: I built 78b2b7b and 6e30448 in separate worktrees (`next build`, both EXIT 0) and compared the prerendered HTML in `.next/server/app` page by page. I ran the pre-commit hook on a staged copy of the 6e30448 tree. I also re-ran the engineer's detector, plus a variant of it that reads the `**vs X (...)**` header text it skips.

## Verdict: FAIL

The batch has three blocking findings. F1 and F3 are new damage that this batch introduced. F2 is part of the batch's own scope, and the batch reports it as done when it is not.

| # | Test | Result |
|---|---|---|
| 1 | fees.body replaced by factSweep line | **FAIL** (F1) |
| 2 | Own-page drift | PASS |
| 3 | EMI sources, FAQ removals vs JSON-LD | PASS (advisories) |
| 4 | Peer quotes | **FAIL** (F2, F3) |
| 5 | Q60, Q61 | PASS |
| 6 | Damage and gates | PASS |

## Blocking findings

### F1. 49 spec pages now print unsourced generic fee lines (same class as batch 15 F2)

`metadata.factSweep` is an established convention. 57 JSONs carried it at base and 174 carry it now. `scripts/audit-spec-fees.mjs` also reads it. However, `components/UniSpecBody.tsx:571` switches the fee section to `<FeeBreakdown>` whenever `factSweep` is set. If the university has no feePlans, FeeBreakdown falls through to its generic block, which prints two lines:

- "Payment is accepted semester-wise or in full. EMI available through lending partners."
- "Study Material: Included (digital)"

The only universities that suppress this block are the two in `NO_UNSOURCED_FEE_COMPONENTS` (Vignan and Yenepoya).

In the rendered pages, 49 spec pages switched from the "Fees and Payment" prose to FeeBreakdown. Every one of them now prints both lines.

| University | Spec pages newly switched | Pages already showing it at base (hub and a few specs) |
|---|---|---|
| amrita-vishwa-vidyapeetham-online | 6 | 4 of 10 |
| arka-jain-university-online | 2 | 1 of 3 |
| chandigarh-university-online | 22 | 4 of 26 |
| chitkara-university-online | 7 | 1 of 8 |
| kurukshetra-university-online | 4 | 1 of 5 |
| lovely-professional-university-online | 8 | 4 of 12 |

None of the six universities has a source for "lending partners" or "Study Material included" in audits/verify/. The batch also deleted EMI claims as unsourced for CU, LPU, Kurukshetra, ARKA and Amrita, so these pages now delete an EMI claim in the JSON and print a fresh unsourced one from the template.

Note on counts: the engineer reported 53 pages with LPU at 12, but only 8 LPU spec pages render.

No page lost its fee section, and every switched page shows a correct total:
- Amrita ₹1,76,000 to ₹2,60,000
- ARKA ₹1,08,500
- Chitkara ₹2,00,000
- Kurukshetra ₹1,02,000
- LPU: labelled fee
- CU: the full labelled four-option fee plus per-semester

**Fix (app change):** add these six ids to `NO_UNSOURCED_FEE_COMPONENTS` in components/FeeBreakdown.tsx. That also cleans up the 15 pages that already showed the lines at base.
- `amrita-vishwa-vidyapeetham-online`
- `arka-jain-university-online`
- `chandigarh-university-online`
- `chitkara-university-online`
- `kurukshetra-university-online`
- `lovely-professional-university-online`

### F2. Partial and unlabelled peer quotes in `**vs X (Rs ...):**` headers were not swept

`.b8tmp/peer17p.ts` splits off the header with `body = hm ? chunk.slice(hm[0].length) : chunk`. That means it never scans a fee written inside the header. I made a variant (`body = hm ? hm[0] : ''`) that applies the same PARTIAL and UNLABELLED rules to the header text alone. Results:

- **JSON at 6e30448:** 51 flagged header quotes in 37 files.
  - Amity PARTIAL: 26
  - CU UNLABELLED: 17
  - MUJ UNLABELLED: 5
  - Bharati Vidyapeeth UNLABELLED: 2
  - UPES PARTIAL: 1
- **Rendered (branch build):** 37 quotes on 28 pages. The base build has the same 37, so the batch changed none of them.

Examples, all of which render:
- bharati-vidyapeeth-university-online/mba/hospitality: "**vs Amity Online MBA Hospitality Management (Rs 2,25,000):** Amity offers Hospitality Management at Rs 2,07,000 to Rs 2,25,000". The header contradicts its own body.
- bit-mesra-online-mba-marketing, chitkara-university-online-mba-finance, chitkara-university-online-mba-marketing: "**vs MUJ Online MBA Marketing/Finance (~Rs 1,84,000):**"
- galgotias (finance, healthcare, HR, IB, marketing, operations) and uttaranchal (digital marketing, finance, HR, IT, IB, marketing): "**vs Chandigarh University Online MBA ... (Rs 1,75,125):**" and "**vs Amity Online MBA ... (Rs 2,25,000):**"
- op-jindal-global-university-online (5 specs): "**vs Amity Online MBA (Rs 2,25,000, 2-year, NIRF ...**"
- bharati-vidyapeeth-university-online-mba-infrastructure: "**vs UPES Online MBA Infrastructure Management (Rs 1,75,000):**". The batch fixed the body sentence to "Rs 1,75,000 to Rs 2,20,000" but left the header.
- chitkara-university-online-mba-international-finance-accounting: "**vs general Finance MBAs (CU Rs 1,75,125, MUJ Rs 1,84,000):**"

So the brief's "282 source and 203 rendered go to 0" holds only for text the detector reads. The full list is in my scratch output (hdr17.out); rerun the variant to regenerate it.

**Fix:** let the detector scan header text, then apply the same replacements. Amity becomes "Rs 2,07,000 to Rs 2,25,000", or the premium tier on healthcare (see F3). CU gets the full labelled range, and MUJ becomes "Rs 1,84,000 list, Rs 1,56,400 after 15% discount".

### F3. The batch writes Amity's standard-tier range against Amity Hospital and Healthcare Management, which is a premium-tier spec

In lib/data.ts, Amity feePlans.mba has two tiers:
- **standard:** ₹2,07,000 to ₹2,25,000
- **premium:** one-time ₹3,02,680, annual ₹3,12,560, semester ₹3,29,000. Its specs are `healthcare-management`, `hospital-healthcare-management` and `international-finance-acca`.

`getExactFee(u, 'MBA')` has no spec argument, so a blanket "2,25,000 becomes 2,07,000 to 2,25,000" replacement gives Amity Healthcare the standard range. Base already had the wrong single figure (Rs 2,25,000); the batch extended it into a new wrong range. All four pages render it:

| Page | New text |
|---|---|
| galgotias-university-online/mba/healthcare-management | "Amity Online MBA Hospital and Healthcare Management (NIRF University #22, Rs 2,07,000 to Rs 2,25,000)". The header still says "(Rs 2,25,000)". |
| lovely-professional-university-online/mba/healthcare-management | "Amity is NAAC A+ and NIRF University #22 at Rs 2,07,000 to Rs 2,25,000" and "Amity Online MBA Hospital Healthcare Management at Rs 2,07,000 to Rs 2,25,000 is well recognised" |
| manipal-academy-higher-education-online/mba/healthcare-management | "Amity at ₹2,07,000 to ₹2,25,000 with NIRF University #22" |
| symbiosis-university-online/mba/hospital-and-health-care-management | "Amity ... at Rs 2,07,000 to Rs 2,25,000" twice, and "(Rs 2,07,000 to Rs 2,25,000) is a strong direct peer at a significantly lower cost". The "significantly lower cost" comparative is also unsafe at the premium tier. |

**Fix:** quote the premium tier on these pages, for example "Rs 3,02,680 one-time to Rs 3,29,000 semester-wise". Then re-read the comparatives on the Symbiosis page.

Related pre-existing issue (advisory): jain-university-online-mba-international-finance-acca says "**vs Amity Online MBA Finance (no ACCA pathway):**". Amity's premium tier lists `international-finance-acca`.

## Test detail

### 1. factSweep and FeeBreakdown: FAIL (F1)
- The convention is established (see F1).
- No page lost its fee section or rendered an empty one. All 49 switched pages show a total.

### 2. Own-page drift: PASS
I read 79 changed blocks across 44 universities.
- **JAIN elective tiers match feePlans:**
  - finance, marketing, HRM, general management: 1,60,000
  - finance-marketing, HRM-finance, marketing-HRM, supply chain: 1,75,000
  - ai-for-finance, business-intelligence-and-analytics, data-science-and-AI, digital-marketing-and-e-commerce: 1,96,000
  - international-finance-acca: 2,98,000
  - the 3 dual-analytics and 3 withdrawn AI tracks: range, per Q61
- **JAIN FAQ:** "Rs 2,500 registration fee (one-time) and a Rs 3,000 examination fee each year". This matches the feePlans extras and the verify sheet.
- **Amrita:** "Rs 1,76,000 to Rs 2,60,000 by specialisation" matches getExactFee.
- **Universities with no fee:** AMU, JMI, Jamia Hamdard, Shiv Nadar, Madras, Anna, MGU, DAVV, ADB, Christ and SRM Sikkim all had their figures deleted. Their FAQs read cleanly ("EdifyEdu does not yet hold a verified fee for this programme").
- **True thresholds hold:**
  - Galgotias ₹80,200 "under Rs 1 lakh"
  - ARKA ₹1,08,500 "sub-Rs 1.1L"
  - Kurukshetra ₹1,02,000
  - BV ₹1,68,000 to ₹1,78,000 comparatives
- **Other checks:**
  - IGNOU "Rs.16,000, or Rs.18,000 in semester 3" is sourced in a lib/data.ts comment.
  - SASTRA, SRM IST, NMIMS (₹1,96,000 to ₹2,20,000) and Symbiosis (₹3,15,000 to ₹3,70,000) all match getExactFee.
  - UU's false "under Rs 1 lakh total fee" is corrected to "Rs 99,600 to Rs 1,03,600 after scholarship (Rs 1,48,000 before scholarship)".

### 3. EMI: PASS
- **Kept claims and their sources:**
  - Amity: feePlans EMI row ₹8,906 x 24.
  - MUJ: the sentence "MUJ publishes a no-cost EMI from Rs 6,517 a month after the 15% discount, with 6, 12 or 18-month tenures" matches the feePlans note.
  - UU: ₹3,733, from the data.ts comment and verify sheet 2026-11-18.
  - Alliance: ₹8,700 x 20, from verify sheet 2026-11-16.
  - Adichunchanagiri: ₹4,417, from verify sheet 2026-11-18.
  - DPU: "No Cost EMI is also available".
  - BITS: "with 0% interest".
  - Sharda: "No Cost EMI available on education loans".
  - Jaypee: "Zero Cost EMI".
- **FAQ removals against FAQ JSON-LD:** ARKA 2, CU 22, Kurukshetra 4, LPU 8 rendered, SMU 6.
  - No removed question is still visible on a page.
  - No JSON-LD question is missing from its page's visible FAQs.
  - No page has more JSON-LD answers that do not appear on the page.

### 4. Peer quotes: FAIL (F2, F3)
- I spot-checked 30 random replacements against getExactFee: Amity ×10, CU ×7, LPU ×3, MUJ ×2, BV ×2, UPES, IGNOU and JAIN ×3. All 30 match the figure and the label.
- The CU label "Rs 1,75,125 to Rs 2,38,000 by certificate option and Early Bird discount" is consistent with getExactFee.
- The Chitkara rewording ("inside CU's range ... below Amity") and the DPU BA rewording ("stronger option on NIRF rank") read correctly.
- The MAHE pages now show Amity at NAAC A+, which matches lib/data.ts.
- The header quotes (F2) and the healthcare tier (F3) fail.

### 5. Q60, Q61: PASS
Both are well formed: 8 pipe fields under the 6-column header. Both are accurate:
- Q60: the deleted Amrita figures existed at base.
- Q61: the dual-analytics tracks and the 3 withdrawn AI tracks are correct.

### 6. Damage and gates: PASS
- **Builds:** both EXIT 0. The page list is identical, 2,335 pages.
- **Changes:** 162 pages changed visibly and 103 changed in JSON-LD.
  - 0 JSON-LD parse failures, 0 `undefined` or `NaN`, 0 unbalanced tags on the 162 pages.
  - 0 changes to head fields (no title, description or og changes).
- **Files:** JSON round-trip has 0 mismatches. CRLF: 0 files with CR lines at either commit and 0 trailing-newline changes across 222 files.
- **Structure:** the 123 structural changes are all removed FAQ or consider items.
- **Diff scope:**
  - 219 page-content JSONs, audits/FIX-LOG.md and audits/QUESTIONS-FOR-RISHI.md.
  - data/sitemap-lastmod.json: 53 date-only bumps to 2026-11-27, written by the pre-commit sitemap-lastmod check. Expected.
  - Nothing under app/, components/ or lib/data.ts changed.
- **Pre-commit on the staged 78b2b7b..6e30448 tree:** EXIT 0.
  - fee baseline 205, blog-fees 1950, em-dash 228 (all unchanged)
  - verify-fees: 0 new mismatches
  - protected pages OK, data-slim drift OK, page-content-json 431 files
- **Full-diff read** of 25 files across 20 universities (amity, amrita, ADB, BV, BIT Mesra, CU ×2, Chitkara, DPU, Dr MGR, ICFAI, Integral, JAIN ×2, Kurukshetra, LPU, MGU, MUJ ×2, Shoolini, SMU, Symbiosis, UPES, UU, Galgotias). Apart from F2 and F3, no defect.

## Advisories (non-blocking)
1. SRM IST "Rs 1,50,000 to Rs 1,89,000 fixed fee": "fixed fee" contradicts a range. It appears in the Christ, JMI and VIT JSONs.
2. NIU page "UPES ... at modest additional cost": UPES ₹1,75,000 to ₹2,20,000 against NIU ₹1,18,000.
3. BITS "No-cost EMI: Available directly through BITS Pilani" and UU "directly through the university": the sources do not say "directly".
4. SMU ops/SCM: "PwC Supply Chain advisory (Tier 2) at Rs 1,75,125 to Rs 2,38,000". CU's Tier 2 is the 3-certificate option, ₹1,90,400 to ₹2,38,000.
5. 12 unnamed CU "under Rs 1.2 lakh" consider items are true only because IGNOU and Andhra are A++. Leave them, but do not generalise the wording.
6. JAIN ACCA page "Amity ... (no ACCA pathway)" (see F3).

## Re-test needed
Fix F1 to F3. Then re-run:
- the header-aware peer detector (target 0 PARTIAL or UNLABELLED in headers)
- the FeeBreakdown generic-line check on the six universities
- the four healthcare pages
