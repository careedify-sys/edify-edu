# Verify: noida-international-university-online (NIU Online), online MBA fee

**Item:** D4 · **Checked:** 2026-11-16 · **Checker:** fact-checker
**Site record:** `lib/data.ts:6167` · **Live hub:** https://edifyedu.in/universities/noida-international-university-online/mba (fetched with `?cb=1116`, robots `index, follow`)
**Official sources:** https://niuonline.edu.in/programme-detail/mba (page title "MBA - NIU ONLINE"), https://niuonline.edu.in/additional-fees. The site's own comment at `lib/data.ts:6168` records niuonline.edu.in as linked from niu.edu.in as "NIU Online".

| Fact | Site now (file:line and/or page URL) | Official source says | Source URL | Checked | Verdict |
|---|---|---|---|---|---|
| MBA total fee | `lib/data.ts:6186-6187` feeMin 88,500, feeMax 97,600; `lib/data.ts:6200` programDetails.MBA.fees "₹88.5K". Live hub prints no total; it shows "Talk to counsellor" in place of a fee | "Total Fee: 118000" and "MBA Total Fees INR 118000", i.e. Rs 1,18,000 for the programme | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | FIX |
| Semester instalment | Not shown on the hub | Rs 29,500 per semester, Sem 1 to Sem 4 | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | FIX (add only if the template carries instalments) |
| Yearly instalment | Not shown on the hub | Rs 59,000 per year, Year 1 and Year 2 | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | FIX (add only if the template carries instalments) |
| Application fee | Not shown on the hub or in the MBA record (the comment at `lib/data.ts:6169` notes Rs 1,100 for BBA only) | "Non-Refundable Application Fees of Rs. 1100/-", paid while registering online. Published beside the total, not inside it | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | FIX (state as a separate one-time fee) |
| Exam fee | Hub fee block not rendered for this record | Regular exam fees per semester: "Included in fees" | https://niuonline.edu.in/additional-fees | 2026-11-16 | FIX (state as included) |
| Degree / convocation fee | Not shown | Rs 3,000 | https://niuonline.edu.in/additional-fees | 2026-11-16 | FIX (optional, separate line) |
| International fee | Not shown | USD 2,200 total | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | MATCH (site makes no claim) |
| EMI from | `lib/data.ts:6188` emiFrom 3,688; live hub "Starting at ₹3,688 /month" with 6/12/24-month figures derived from 88,500 | No EMI figure published on the MBA page | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | FIX (derived from a wrong fee; recompute from Rs 1,18,000 or drop) |
| feeVerifiedOn / officialUrl | `lib/data.ts:6170-6171` officialUrl https://niuonline.edu.in, feeVerifiedOn 2026-10-30 (that check covered BBA only) | Official domain confirmed; MBA fee read today | https://niuonline.edu.in/programme-detail/mba | 2026-11-16 | FIX (feeVerifiedOn to 2026-11-16 once the MBA fee changes) |

## Notes

- Neither site figure (Rs 88,500 or Rs 97,600, the pair named in `audits/spec-fee-audit-summary-2026-11-14.md`) appears on the official page. Both are out of date against the published Rs 1,18,000.
- `lib/data.ts:6172` sets programFees.mca to 118,000, the same figure the MBA page publishes. The MCA fee was not checked today.
- All 11 NIU MBA spec JSONs in `lib/data/page-content/` carry 88,500 or 97,600 figures (92 hits). That sweep belongs to B6, after the record changes.
- The prospectus linked from the MBA page (https://niuonline.edu.in/wp-content/uploads/2025/06/NIU-Online-All-Prospectus-2025.pdf, June 2025) has a fee table whose text layout does not extract cleanly; it does contain 1,18,000 among the postgraduate rows and no 88,500 or 97,600. The programme page, which advertises the January 2027 session, is the primary source here. The prospectus also markets a scholarship as a percentage; not recorded, per the fee rule.
- The official site also says "Admissions are Open for January 2027 Session!" and mentions scholarships with no rupee amount; no scholarship figure is recorded.

## Resolution (2026-11-18)

- **Decision (D4 brief, 16 Nov):** use the published total of Rs 1,18,000 (Rs 29,500 a semester, Rs 59,000 a year). The Rs 1,100 application fee is separate and exam fees are included. No EMI figure is published, so none is shown. NIU `programFees.mca` is not touched.
- **Applied on branch `fix/d4-fees-niu-alliance` (ccf74ce, follow-up commit after QA):**
  - `lib/data.ts`: feeMin/feeMax 1,18,000, `programFees.mba` 1,18,000, `feePlans.mba` (full, 2 yearly and 4 semester rows; application as an extra; note that exams are included), emiFrom 0 (was 3,688), programDetails.MBA.fees "₹1,18,000", feeVerifiedOn 2026-11-16.
  - Mirrors: `lib/data-slim.ts`, `data/fees-hub-data.json` (EMI "Not published").
  - NIU hub and 10 spec page-content JSONs swept; 11 peer spec JSONs that typed NIU at Rs 97,600 now say Rs 1,18,000, with gaps derived from 97,600 reworded without a number.
  - Blogs: the NIU review moved off the unverified Rs 88,500 price; cross-links and lists in 6 other posts carry Rs 1,18,000. The unsourced "NIU ... 25% Early Bird" claim was removed from the HR post.
  - The Rs 3,000 degree fee is mentioned in the NIU review only; it is not added to the data or the total.
- Logged in `audits/FIX-LOG.md` (2026-11-18, D4).
