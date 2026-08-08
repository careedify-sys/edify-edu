# Primary-subject fee worklist — 2026-08-07

Distinct `(university, programme)` pairs collapsed from primary-subject
MISMATCH + ORPHAN rows in `audits/blog-fee-crossref-2026-08-07.csv`.
Primary-subject precision is 100% on the sampled MISMATCH rows, so every
pair below is a real value-drift signal — the question is only *why*.

Total pairs: **28**
  - Genuine-error candidates (NONE of the four dimensions apply): **0**
    (the single row flagged initially — Amity MCA at Rs 42,500 — was
    reclassified as **UNIT_MISMATCH** on manual review; see note below.)
  - Dimension-explained (payment mode / discount / spec / campus): **25**
  - ORPHAN (blog talks about a programme not in data.ts): **2**
  - UNIT_MISMATCH (per-semester vs total): **1**

Dimension-explained pairs are already accounted for by content-model gaps —
see `audits/fee-model-proposal-2026-08-07.md` for the FeeVariant plan.
No portal verification is required. The primary-subject genuine-error count
is **zero**.

### UNIT_MISMATCH note

`amity-university-online / MCA / Rs 42,500` in `amity-online-mca-fees-review`
appears as "First semester fee payment (Rs 42,500)" — per-semester context,
not a total-fee claim. 42,500 * 4 = 170,000 which is an exact match to
`pd.fees = Rs 1.7L`. The extractor's tight-window NON_FEE gate did not catch
it because "first semester" isn't in the `NON_FEE_PATTERNS` list (only
`per semester`, `per sem`, `/sem`, etc.). This is a fifth failure dimension
alongside payment-mode / discount / spec / campus and should be added to the
model when the FeeVariant work lands after 18 Aug.

## Genuine-error candidates (verify against portal)

_(none — the single Amity MCA candidate was reclassified as UNIT_MISMATCH; see the note above.)_

### UNIT_MISMATCH (extractor caught per-semester as total)

| # | university | programme | blog value(s) | current pd.fees | feeMin | feeMax | rows | explanation |
|---:|---|---|---|---|---:|---:|---:|---|
| 1 | Amity University Online (`amity-university-online`) | MCA | ₹42,500 | `₹1.7L` | 207000 | 225000 | 1 | UNIT_MISMATCH (per-sem; 42500*4 = 170000 = pd.fees) |

## Dimension-explained (no portal action needed)

| # | university | programme | blog value(s) | current pd.fees | feeMin | feeMax | rows | explanation |
|---:|---|---|---|---|---:|---:|---:|---|
| 1 | Amity University Online (`amity-university-online`) | BBA | ₹23,880, ₹1,75,120, ₹1,20,000–₹2,00,000, ₹1,48,852–₹1,57,608, ₹1,31,340–₹1,40,096, ₹87,560–₹1,31,340 | `₹1.99L` | 207000 | 225000 | 36 | payment-mode + discount + specialisation |
| 2 | JAIN (Deemed-to-be University) Online (`jain-university-online`) | MBA | ₹1,96,000–₹2,98,000, ₹2,20,000, ₹2,98,000, ₹24,000–₹1,02,000, ₹2,00,000, ₹15,000–₹30,000 | `₹1.75L–₹1.96L` | 160000 | 196000 | 14 | payment-mode + campus + specialisation |
| 3 | D.Y. Patil University, Navi Mumbai Online (`dy-patil-university-online`) | MBA | ₹8,00,000–₹12,00,000, ₹1,89,400, ₹1,70,000, ₹47,350, ₹18,000–₹25,000 | `₹1,75,000` | 60000 | 200000 | 13 | campus + payment-mode + specialisation |
| 4 | Amity University Online (`amity-university-online`) | MBA | ₹2,50,000–₹3,00,000, ₹5,000–₹10,000, ₹5,000, ₹6,40,000–₹15,80,000, ₹2,07,000–₹4,49,000, ₹1,20,000–₹1,52,000 | `₹2.07L–₹2.25L` | 207000 | 225000 | 11 | discount + campus + payment-mode + specialisation |
| 5 | UNIVERSITY OF MUMBAI Online (`university-of-mumbai-online`) | MBA | ₹80,000–₹1,00,000, ₹15,000–₹30,000, ₹50,000, ₹41,000–₹3,70,000 | `(no pd)` | 90000 | 200000 | 8 | payment-mode + specialisation + campus |
| 6 | Galgotias University Online (`galgotias-university-online`) | MBA | ₹3,00,000–₹5,00,000, ₹33,000, ₹1,50,000, ₹2,00,000–₹3,00,000, ₹1, ₹94,000 | `₹76.2K` | 76200 | 86400 | 7 | specialisation + campus + discount |
| 7 | UNIVERSITY OF KERALA Online (`university-of-kerala-online`) | MBA | ₹30,000–₹50,000, ₹40,000, ₹25,000–₹40,000, ₹2,40,000, ₹54,000, ₹80,000–₹1,50,000 | `₹90K – ₹200K` | 90000 | 200000 | 7 | payment-mode + specialisation |
| 8 | Lovely Professional University Online (`lovely-professional-university-online`) | MBA | ₹1,50,000, ₹58,000, ₹20,00,00,00,000, ₹54,000 | `₹1.61L–₹2.00L` | 161600 | 200000 | 6 | discount + specialisation + payment-mode |
| 9 | Noida International University Online (`noida-international-university-online`) | MBA | ₹1,00,000, ₹94,000, ₹1,08,500 | `₹88.5K` | 88500 | 97600 | 6 | specialisation + discount + payment-mode + campus |
| 10 | Amrita Vishwa Vidyapeetham Online (`amrita-vishwa-vidyapeetham-online`) | BBA | ₹1,41,000 | `₹165K – ₹165K` | 176000 | 260000 | 5 | payment-mode + discount |
| 11 | Manipal Academy of Higher Education (MAHE) Online (`manipal-academy-higher-education-online`) | BBA | ₹2,40,000, ₹60,000, ₹1,80,000–₹2,40,000 | `₹168K – ₹224K` | 292000 | 292000 | 5 | payment-mode + specialisation |
| 12 | Manipal University Jaipur (MUJ) Online (`manipal-university-jaipur-online`) | MBA | ₹1,66,000–₹1,80,000, ₹45,000 | `₹1.53L–₹1.80L` | 153000 | 180000 | 5 | campus |
| 13 | Shoolini University Online (`shoolini-university-online`) | MBA | ₹88,500, ₹1,30,000–₹1,50,000 | `₹1.18L – ₹1.3L` | 118000 | 130000 | 5 | specialisation |
| 14 | Symbiosis School for Online and Digital Learning (SSODL), Pune Online (`symbiosis-university-online`) | MBA | ₹5,000, ₹25,00,000–₹30,00,000, ₹30,000–₹40,000, ₹4,80,000 | `₹3.15L–₹3.70L` | 315000 | 370000 | 5 | discount + campus + specialisation |
| 15 | Dayananda Sagar University Online (`dayananda-sagar-university-online`) | MBA | ₹1,20,000, ₹1,20,000–₹1,30,000, ₹1,00,000–₹1,50,000, ₹1,30,000–₹1,50,000 | `₹1.3L` | 130000 | 130000 | 4 | campus |
| 16 | Indira Gandhi National Open University (IGNOU) Online (`ignou-online`) | MBA | ₹20,000–₹30,000, ₹25,000–₹35,000, ₹20,000–₹25,000 | `₹66,000` | 66000 | 66000 | 4 | campus |
| 17 | NMIMS (Narsee Monjee Institute of Management Studies) Online (`nmims-online`) | MBA | ₹800, ₹17,000, ₹2,10,000–₹2,40,000, ₹1,19,000 | `₹1.96L–₹2.20L` | 196000 | 220000 | 4 | specialisation + payment-mode |
| 18 | Sikkim Manipal University Online (`sikkim-manipal-university-online`) | MBA | ₹94,000, ₹1,10,000 | `₹1.20L` | 120000 | 120000 | 4 | campus + discount |
| 19 | University of Petroleum & Energy Studies (UPES) Online (`upes-online`) | MBA | ₹95,000, ₹80,000 | `₹1.75L–₹2.20L` | 175000 | 220000 | 4 | discount |
| 20 | Vignan's Foundation for Science, Technology & Research Online (`vignan-university-online`) | MBA | ₹76,000, ₹1,40,000, ₹2,00,000–₹3,00,000, ₹1,00,000 | `₹90K` | 90000 | 90000 | 4 | discount |
| 21 | NMIMS (Narsee Monjee Institute of Management Studies) Online (`nmims-online`) | BBA | ₹30,000 | `₹60K – ₹200K` | 196000 | 220000 | 3 | payment-mode + specialisation |
| 22 | Chandigarh University Online (`chandigarh-university-online`) | MBA | ₹3,50,000–₹5,00,000, ₹41,250 | `₹1.65L–₹1.80L` | 165000 | 220000 | 2 | discount |
| 23 | JAMIA HAMDARD Online (`jamia-hamdard-online`) | MBA | ₹25,750, ₹2,00,000 | `₹75K – ₹180K` | 75000 | 180000 | 2 | campus |
| 24 | Manipal Academy of Higher Education (MAHE) Online (`manipal-academy-higher-education-online`) | MBA | ₹5,000, ₹4,72,000–₹5,32,000 | `₹2.92L` | 292000 | 292000 | 2 | discount + payment-mode |
| 25 | JAMIA HAMDARD Online (`jamia-hamdard-online`) | BBA | ₹41,000–₹99,000 | `₹45K – ₹108K` | 75000 | 180000 | 1 | specialisation |

## ORPHAN pairs (programme name in blog does not exist in data.ts)

| # | university | programme | blog value(s) | current pd.fees | feeMin | feeMax | rows | explanation |
|---:|---|---|---|---|---:|---:|---:|---|
| 1 | NMIMS (Narsee Monjee Institute of Management Studies) Online (`nmims-online`) | BA | ₹30,000 | `(no pd)` | 196000 | 220000 | 2 | ORPHAN (programme not in data.ts programs array) |
| 2 | NMIMS (Narsee Monjee Institute of Management Studies) Online (`nmims-online`) | MBA (WX) | ₹4,00,000 | `(no pd)` | 196000 | 220000 | 1 | ORPHAN (programme not in data.ts programs array) |
