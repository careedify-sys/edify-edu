# Verify: alliance-university-online (Alliance Online), online MBA fee

**Item:** D4 · **Checked:** 2026-11-16 · **Checker:** fact-checker
**Site record:** `lib/data.ts:5415` · **Live hub:** https://edifyedu.in/universities/alliance-university-online/mba (fetched with `?cb=1116`, robots `index, follow`)
**Official source:** https://allianceonline.edu.in/mba/ (linked from the allianceonline.edu.in home page; the record comment at `lib/data.ts:5416` notes the domain is linked from alliance.edu.in as "Alliance Online").

| Fact | Site now (file:line and/or page URL) | Official source says | Source URL | Checked | Verdict |
|---|---|---|---|---|---|
| MBA full course fee (domestic) | `lib/data.ts:5439-5440` feeMin 1,60,000, feeMax 1,75,000; `lib/data.ts:5452` programDetails.MBA.fees "₹1.6L". Live hub prints no total for Alliance; it shows "Talk to counsellor" | Domestic "Full Course Fee INR ₹1,74,000/-", with Rs 1,000 one-time registration fee shown beside it | https://allianceonline.edu.in/mba/ | 2026-11-16 | FIX (to Rs 1,74,000, condition: plus Rs 1,000 one-time registration) |
| Semester fee | Not shown on the hub | "Semester Fee INR ₹43,500/-", marked inclusive of all taxes | https://allianceonline.edu.in/mba/ | 2026-11-16 | FIX (add only if the template carries instalments) |
| Registration fee | Not shown | Rs 1,000 one-time | https://allianceonline.edu.in/mba/ | 2026-11-16 | FIX (separate line) |
| Exam fee | Not shown | Not published on the MBA page | https://allianceonline.edu.in/mba/ | 2026-11-16 | MATCH (neither side states one) |
| EMI | `lib/data.ts:5441` emiFrom 6,667; live hub "Starting at ₹6,667 /month" plus 6/12/24-month figures derived from 1,60,000 | No-cost EMI plans from Rs 8,700 for 20 months | https://allianceonline.edu.in/mba/ | 2026-11-16 | FIX (to the published Rs 8,700 a month over 20 months) |
| SAARC fee | Not shown | Full course fee Rs 2,06,000 plus Rs 1,000 registration; semester fee Rs 51,500 | https://allianceonline.edu.in/mba/ | 2026-11-16 | MATCH (site makes no claim) |
| International fee | Not shown | USD 2,800 full course, USD 100 registration, USD 700 per semester | https://allianceonline.edu.in/mba/ | 2026-11-16 | MATCH (site makes no claim) |
| feeVerifiedOn / officialUrl | `lib/data.ts:5419-5420` officialUrl https://allianceonline.edu.in, feeVerifiedOn 2026-10-30 (that check covered BBA and B.Com) | Official domain confirmed; MBA fee read today | https://allianceonline.edu.in/mba/ | 2026-11-16 | FIX (feeVerifiedOn to 2026-11-16 once the MBA fee changes) |

## Notes

- The page source also holds a "Semester fees ₹12,667/-" block, but it sits inside an HTML comment and is not displayed. It is ignored here.
- The typed blog figure Rs 1,75,000 in `audits/spec-fee-audit-summary-2026-11-14.md` is also off: the published figure is Rs 1,74,000.
- 5 of 6 Alliance MBA spec JSONs carry 1,60,000 or 1,75,000 style figures (51 hits). That sweep belongs to B6.

## Resolution (2026-11-18)

- **Decision (D4 brief, 16 Nov):** use the published full course fee of Rs 1,74,000 (domestic), Rs 43,500 a semester, a Rs 1,000 one-time registration fee as a separate line, and no-cost EMI from Rs 8,700 a month over 20 months.
- **Applied on branch `fix/d4-fees-niu-alliance` (ccf74ce, follow-up commit after QA):**
  - `lib/data.ts`: feeMin/feeMax 1,74,000, `programFees.mba` 1,74,000, `feePlans.mba` (full course, 4 semester rows, and an EMI row of 8,700 a month for 20 months; registration as an extra), emiFrom 8,700 (was 6,667), programDetails.MBA.fees "₹1,74,000", feeVerifiedOn 2026-11-16.
  - Mirrors: `lib/data-slim.ts`, `data/fees-hub-data.json` (EMI "₹8,700/mo").
  - Alliance hub and 5 spec page-content JSONs swept; peer JSONs that typed Alliance at Rs 1,75,000 now say Rs 1,74,000, with derived gaps reworded without a number.
  - The MBA hub's EMI card no longer prints Edify's fee / 6, 12, 24 grid (it showed Rs 7,250 for 24 months, below the published minimum), because a published plan table exists.
  - Blogs: Alliance figures corrected in 3 posts.
- Logged in `audits/FIX-LOG.md` (2026-11-18, D4).
