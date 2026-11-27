# Fee check: MKU, Mumbai, Mysore, Yenepoya online MBA and Amity Online MCA (2026-11-27)

This is a read-only audit. No site file was edited, and nothing was committed or pushed.
Sources are limited to each university's own portal plus deb.ugc.ac.in for mode checks. No aggregators were used: search results that pointed to aggregators were used only to find official URLs, never as evidence.
All pages were fetched on 2026-11-27. Figures are copied exactly as each portal prints them. No totals were computed.

## Verdicts

| # | Item | Site states | Verdict | Portal figure (exact) | Basis / mode | Variants | Official URL | Fetched |
|---|---|---|---|---|---|---|---|---|
| 1 | Madurai Kamaraj University online MBA, total fee | Not given by coordinator. The `lib/data.ts` record has no MBA programme fee, only uni-level feeMin 75,000 / feeMax 1,80,000. | NOT FOUND | No online MBA exists. The only MBA fee is for **distance (ODL)**: "M.B.A. ... 25200 \| 200 \| 25400" | Column headers read: "Fee (Per year - From 26AY Onwards) Rs." / "Postal Charge (Per year)" / "Total (per year) Rs." So it is **Rs 25,400 per year, ODL mode**, not online. The portal gives no programme total. | Several MBA specialisations are marked "(Not offered in this session)". There is no one-time or early-bird plan. | https://mkuniversity.ac.in/dde/pg_fee_2026.php | 2026-11-27 |
| 2 | University of Mumbai (CDOE, formerly IDOL) online MBA, total fee | Not given by coordinator. The `lib/data.ts` record lists 'MBA' in programs with no MBA fee, only uni-level feeMin 90,000 / feeMax 2,00,000. | NOT FOUND | No MBA in any mode. The CDOE 2025-26 list offers "MMS (Master of Management Studies)", described as "Equivalent to MBA", at "F.Y. Rs. 70,955/-" and "S.Y. Rs. 75,180/-". | MMS is a **distance (ODL)** programme priced **per year** (F.Y. / S.Y.). The only "Online Programme" in the list is M.A. (Sociology). The portal gives no programme total. | None stated | https://mu.ac.in/old/wp-content/uploads/2025/07/Course-List.pdf | 2026-11-27 |
| 3 | University of Mysore online MBA, total fee | ₹1,60,000 | DIFFERENT | Main MBA page: "Fees : INR 62,625.00". Most specialisation pages: "Fees : INR 92,625.00". General Management page: "Fees : INR 202,940.00". | Online mode ("MBA Online Course", 2 years). The portal does not label the figure as total, per year or per semester. Every page carries the banner "fee revision is currently in process!". No page states ₹1,60,000. | "we do not charge a registration fee separately". No early-bird or one-time variant. | https://www.uni-mysore.in/online-mba-degree-program ; https://www.uni-mysore.in/online-mba-finance-management-program ; https://www.uni-mysore.in/online-mba-general-management-program | 2026-11-27 |
| 4 | Yenepoya University online MBA, total fee | ₹1,20,000 | DIFFERENT | Domestic fee structure: "Yearly Fee Plan ₹ 25,000 \| Total Fee Plan ₹ 50,000" | Online mode. The portal states both the per-year fee (₹25,000) and its own **total (₹50,000)**. Same figures on the Finance and Marketing pages. | "One-time registration fee: ₹1,500". Exam fee "per year: For Indian students: ₹3,000". "EMI starting ₹3,210/month*". International Finance (ACCA) elective: "₹ 50,000 + ₹ 54000*" total, plus an "affiliation fee of ₹27,000/- ... payable annually". International students: "$ 833" total. | https://onlineyenepoya.com/programs/online-mba-finance ; https://onlineyenepoya.com/programs/online-mba-marketing ; https://onlineyenepoya.com/programs/online-mba-international-finance | 2026-11-27 |
| 5 | Amity University Online MCA, per-semester fee and total | "Rs 49,800 per semester" and ₹1,99,000 total | CONFIRMED | Per Semester Fee: "₹49,800", "Effective fee of Rs. 1,99,000" | Online mode. ₹1,99,000 is the portal's own stated effective fee for the per-semester plan. It is also shown as the list (struck) price next to the one-time fee. | One-time: "₹1,83,080 ₹1,99,000", "Effective fee of Rs. 1,83,080". Annual: "₹94,530 ₹99,500", "Effective fee of Rs. 1,89,050". 24-month no-cost EMI: "₹7,877/month ₹8,292", "Effective fee of Rs. 1,89,050". | https://amityonline.com/master-of-computer-applications-online | 2026-11-27 |

## Summary

- CONFIRMED: 1 (Amity Online MCA).
- DIFFERENT: 2 (Mysore: the portal shows ₹62,625 / ₹92,625 / ₹2,02,940, never ₹1,60,000. Yenepoya: the portal total is ₹50,000, not ₹1,20,000).
- NOT FOUND: 2 (MKU and Mumbai have no online MBA to price).

## Notes for whoever acts on this

1. **MKU and Mumbai are mode problems, not only fee problems.**
   - On the UGC-DEB register (https://deb.ugc.ac.in/Home/HEI_Prog_List, fetched 2026-11-27), MKU's MBA appears only under ODL, for 2023-24, 2024-25, 2025-26 and 2026-27 July.
   - MKU's online-mode entries cover BBA, B.Com, BA, MA, M.Com and M.Sc only. There is no online MBA.
   - University of Mumbai has no MBA in any mode. Its only online entry is MA (Sociology), and MMS is ODL.
   - Any "online MBA" page for either university describes a programme that does not exist. This needs Rishi's decision under the mode-unverified gate, not a fee edit.
2. **Mysore has three conflicting portal figures.**
   - The figures are 62,625 on the main MBA page, 92,625 on 11 specialisation pages and 202,940 on General Management. Two specialisation pages (Healthcare Administration Management, Pharma Biotechnology) print no fee.
   - None is labelled as a total, and every page carries the "fee revision is currently in process!" banner.
   - The uni-mysore.in pages link "University Website" to https://uni-mysore.ac.in/.
   - DEB lists Mysore's online MBA as General, Dual, Finance, HR, Marketing, Operation and SCM. Many uni-mysore.in specialisation pages (for example Data Science, Digital Marketing, Pharma) have no matching DEB row.
   - Recommendation: do not publish a single "total". Show the general MBA figure as published (INR 62,625.00) with a verify-on-portal note, or hold the fee until the revision is posted.
3. **The Yenepoya site figure (₹1,20,000) does appear in the portal's JavaScript bundle, but for a different programme.** It sits in a "₹ 40,000 \| ₹ 1,20,000" table, not on any MBA page. The MBA pages all state ₹25,000 per year and ₹50,000 total.
4. **Amity MCA:** the site's pair matches the portal's per-semester plan. If the site calls ₹1,99,000 "the total", that is the semester-plan effective fee. The lowest published all-in figure is the one-time plan at ₹1,83,080.

No UNCLEAR rows, so nothing was added to audits/QUESTIONS-FOR-RISHI.md. Items 1-2 (mode) are flagged above for the coordinator to route.
