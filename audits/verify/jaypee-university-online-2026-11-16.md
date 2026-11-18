# Verify: jaypee-university-online (JIIT Online), online MBA fee

**Item:** D4 · **Checked:** 2026-11-16 · **Checker:** fact-checker
**Site record:** `lib/data.ts:5749` · **Live hub:** https://edifyedu.in/universities/jaypee-university-online/mba (fetched with `?cb=1116`, robots `index, follow`)
**Official sources:** https://www.jiitonline.com/academics/online-mba-programs/, the home page https://www.jiitonline.com/, and the combined brochure linked from the home page, https://www.jiitonline.com/wp-content/uploads/2026/08/BBAMBABCAMCA-combine-brochure-1.pdf ("Program Fees", p. 31). The record comment at `lib/data.ts:5750` notes jiitonline.com is linked from jiit.ac.in as "Online Education".

| Fact | Site now (file:line and/or page URL) | Official source says | Source URL | Checked | Verdict |
|---|---|---|---|---|---|
| MBA total fee | `lib/data.ts:5769-5770` feeMin and feeMax 1,75,000; `lib/data.ts:5782` programDetails.MBA.fees "₹1.75L". Live hub: "Total Program Fee ₹1,75,000" and "Rs 1,75,000 total fee" | Programme page: "Total Program Investment ₹1,75,000/-". Home page card: Fees Rs 1,75,000. Brochure p. 31: MBA "Total course fee ₹1,75,000/-" | https://www.jiitonline.com/academics/online-mba-programs/ and brochure p. 31 | 2026-11-16 | MATCH |
| Application / registration fee | Live hub: "Registration / Admission Fee Included in total" | Brochure: one-time application fee Rs 1,000, "Included in Total course Fee". Programme page: admission processing fee covered by the Rs 1,75,000 | brochure p. 31; programme page | 2026-11-16 | MATCH |
| Exam fee | Live hub: "Exam Fee Included in total (usually)" | Programme page: the Rs 1,75,000 covers "All Examination Fees". Brochure p. 31: exam fee Rs 1,500 per semester "is applicable", with no statement that it is inside the total (the same page says so for the application fee only). The two official sources disagree | programme page; brochure p. 31 | 2026-11-16 | UNCLEAR |
| Official FAQ fee range | n/a | The FAQ on the programme page says the total is approximately Rs 1,50,000 to Rs 2,50,000, including registration, exam and course fees | https://www.jiitonline.com/academics/online-mba-programs/ | 2026-11-16 | UNCLEAR |
| Payment schedule | Live hub: "Payment is accepted semester-wise or in full" | Brochure: pay the admission fee for the first semester or year, or the full programme. No per-semester rupee figure published | brochure, Admission Process | 2026-11-16 | MATCH |
| EMI from | `lib/data.ts:5771` emiFrom 7,292; live hub "EMI starts from ₹7,292/month" (1,75,000 / 24, Edify's arithmetic) | Brochure p. 31: MBA "EMI Starts at: ₹5,850/- Per Month" (no tenure stated). Programme page: "Zero Cost EMI", no figure | brochure p. 31 | 2026-11-16 | FIX (to the published Rs 5,850 a month, tenure not stated) |
| feeVerifiedOn / officialUrl | `lib/data.ts:5752-5753` officialUrl https://www.jiitonline.com, feeVerifiedOn 2026-10-30 | Official domain confirmed; same MBA total today | https://www.jiitonline.com/academics/online-mba-programs/ | 2026-11-16 | MATCH (may move feeVerifiedOn to 2026-11-16) |

## Notes

- The data record's total is right. The mismatch driver named in `audits/spec-fee-audit-summary-2026-11-14.md` is typed copy: Rs 1,82,000 appears in 3 JIIT spec JSONs (finance 11, IT and business analytics 9, marketing 7 hits). No official source publishes Rs 1,82,000, so those belong to the B6 sweep.
- The brochure also says scholarships and early-bird offers apply via the counsellor, with no rupee figure. Nothing recorded.
- The older brochure `/wp-content/uploads/2026/05/JIIT-Online-MBA-BBA-Combine-Brochure.pdf` was not opened; the August 2026 one is newer.

## Resolution (2026-11-18)

- **Rishi's answer, 2026-11-18:** the MBA total is Rs 1,75,000 and covers tuition, all examinations and admission processing. There is no separate exam line. The official FAQ range of Rs 1,50,000 to Rs 2,50,000 is stale and is not used.
- The Exam fee row moves from UNCLEAR to settled: included in the total (programme page wording). The Official FAQ range row is settled: stale, not used.
- EMI: this sheet records the brochure figure with its source (brochure p. 31, "EMI Starts at: ₹5,850/- Per Month", no tenure), so emiFrom is set to 5,850 rather than removed.
- **Applied on branch `fix/d4-fees-niu-alliance`:**
  - `lib/data.ts`: `programFees.mba` 1,75,000, `feePlans.mba` (total row and an EMI-per-month row of 5,850; note says exams and admission processing are inside the total and the tenure is not stated), emiFrom 5,850 (was 7,292, Edify's own 1,75,000 / 24), feeVerifiedOn 2026-11-18.
  - Mirrors: `lib/data-slim.ts`, `data/fees-hub-data.json`.
  - Hub and spec page-content JSONs: Rs 1,82,000, Rs 7,292 / 7,417, the Rs 43,750 derived instalment and the Rs 2,500 template EMI removed; peer pages that quote JIIT now say Rs 1,75,000, with derived rupee gaps dropped.
  - Blog `jaypee-jiit-online-mba-review`: the unpublished semester split (Rs 43,000 + Rs 1,500 exam), the Rs 1,500 exam column and the separate Rs 1,000 registration line removed; the table now lists tuition, exams and admission processing as included in Rs 1,75,000.
- Logged in `audits/FIX-LOG.md` (2026-11-18, D4 Sharda/JIIT).
