# Verify: sharda-university-online (Sharda Online), online MBA fee

**Item:** D4 · **Checked:** 2026-11-16 · **Checker:** fact-checker
**Site record:** `lib/data.ts:2130` · **Live hub:** https://edifyedu.in/universities/sharda-university-online/mba (fetched with `?cb=1116`, robots `index, follow`)
**Official source:** https://shardaonline.ai/programs/sharda/mba/ (the record's officialUrl, `lib/data.ts:2132`). The page states "Curriculum and fees last reviewed : 5 November 2026".

| Fact | Site now (file:line and/or page URL) | Official source says | Source URL | Checked | Verdict |
|---|---|---|---|---|---|
| MBA total programme fee (domestic, as published) | `lib/data.ts:2149-2150` feeMin 1,40,000, feeMax 1,54,500; `lib/data.ts:2162` programDetails.MBA.fees "₹1.4L". Live hub prints no total; it shows "Talk to counsellor" and says to request the fee in writing | "Total Program Fee ₹1,50,000" for Indian nationals; the FAQ repeats Rs 1,50,000 for the full two-year programme | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (to Rs 1,50,000 as the published programme fee, with registration and exam shown as separate published lines) |
| Is Rs 1,50,000 the all-in amount? | n/a | The section heading says it lists everything you pay, "tuition plus one-time registration and annual examination charges", yet registration and exam fees sit in a separate table beside the Rs 1,50,000 | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | UNCLEAR |
| Semester instalment | Not shown on the hub | Rs 37,500 per semester | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (add only if the template carries instalments) |
| Yearly instalment | Not shown on the hub | Rs 75,000 per year | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (add only if the template carries instalments) |
| Registration fee | Not shown | Rs 500 one-time (Indian nationals); Rs 1,000 SAARC | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (separate line) |
| Exam fee | Not shown | Rs 3,500 per year (Indian nationals); Rs 5,000 per year SAARC | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (separate line) |
| EMI | `lib/data.ts:2151` emiFrom 5,833; live hub "Starting at ₹5,833 /month" plus 6/12/24-month figures derived from 1,40,000 | "No Cost EMI available on education loans availed by domestic students"; no monthly figure published | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (derived from a wrong fee; recompute from Rs 1,50,000 or drop) |
| Campus immersion variant | Not shown | A separate campus-immersion option for domestic students: Rs 80,000 per semester, Rs 1,60,000 per year, total Rs 3,20,000 | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | MATCH (site makes no claim; do not merge it into the online fee) |
| International fee | Not shown | USD 2,400 total, USD 600 per semester | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | MATCH (site makes no claim) |
| feeVerifiedOn / officialUrl | `lib/data.ts:2132-2133` officialUrl https://shardaonline.ai, feeVerifiedOn 2026-10-06 | Official domain confirmed; MBA fee read today | https://shardaonline.ai/programs/sharda/mba/ | 2026-11-16 | FIX (feeVerifiedOn to 2026-11-16 once the MBA fee changes) |

## Notes

- Neither Rs 1,40,000 nor Rs 1,54,500 (the pair named in `audits/spec-fee-audit-summary-2026-11-14.md`) appears on the official page. 24 of the typed Rs 1,54,500 figures sit in all-in wording; the university publishes no all-in figure, so that wording cannot be kept as written.
- The precedent at `lib/data.ts:2194-2196` (BCA, same domain) records the total programme fee with registration and exam as separate published lines. The MBA row follows the same shape.
- The official page lists seven MBA tracks; `lib/data.ts:2161` lists six specs. Not part of D4; flagged for the spec owner.
- 5 of 7 Sharda MBA spec JSONs carry the old figures (51 hits). That sweep belongs to B6.

## Resolution (2026-11-18)

- **Rishi's answer, 2026-11-18:** the MBA total is Rs 1,50,000 (Rs 37,500 a semester, Rs 75,000 a year). The Rs 500 one-time registration fee and the Rs 3,500 yearly exam fee are separate lines and are never added into the total. Use https://shardaonline.ai/programs/sharda/mba/ as the source. No EMI figure is published, so none is shown.
- The "Is Rs 1,50,000 the all-in amount?" row moves from UNCLEAR to settled: not all-in; registration and exam stay as separate lines.
- **Applied on branch `fix/d4-fees-niu-alliance`:**
  - `lib/data.ts`: feeMin/feeMax 1,50,000, `programFees.mba` 1,50,000, `feePlans.mba` (total, 2 yearly, 4 semester rows, registration and exam as extras), emiFrom 0, programDetails.MBA.fees "₹1,50,000", feeVerifiedOn 2026-11-18.
  - Mirrors: `lib/data-slim.ts`, `data/fees-hub-data.json` (EMI "Not published"). The Sharda drift entry in `data/fee-verification-allowlist.json` was removed because the data now matches.
  - Hub and spec page-content JSONs: typed Rs 1,40,000 / Rs 1,54,500 figures, derived gaps and the Rs 2,500 template EMI removed or corrected; peer pages that quote Sharda now say Rs 1,50,000.
  - Blogs: Rs 1,40,000 / ₹1.4L / ₹1.4 lakh for the Sharda MBA corrected to Rs 1,50,000 (Rs 37,500 a semester) in 7 posts. Sharda BBA figures were not touched.
- Logged in `audits/FIX-LOG.md` (2026-11-18, D4 Sharda/JIIT).
