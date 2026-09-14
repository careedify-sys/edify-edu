# Coupon cluster expansion worklist, 2026-09-13

Seven universities hold a coupon code in `lib/coupons.ts` but have no
`/coupons/*` landing page. Each is blocked on one specific fact. Nothing here
needs new research on our side except where marked "official portal".

Every NAAC and NIRF value below was read from the Supabase `accreditations`
table on 2026-09-13 and cross-checked against `lib/data.ts`. Where the two
disagreed, that disagreement is the blocker and is named.

**Why this matters:** coupons convert at 3.00% CTR, the best of any page type on
the site, against 0.46% for blog. Each page is small. The constraint is verified
facts, not effort.

---

## 1. Galgotias — SHIPPED 2026-09-14, one question still open

| | |
|---|---|
| id | `galgotias-university-online` |
| NAAC | **A+**, score 3.37, cycle 1, valid to 2029-08-16 (verified) |
| NIRF | **none claimable.** Supabase holds only Pharmacy #55 and Law #36. No University rank, no Management rank |
| MBA fee | Rs 80,200 (`lib/data.ts` and `data/fees-hub-data.json` agree) |
| Review blog | `/blog/galgotias-online-mba-review` |
| Official portal | galgotiasonline.edu.in |
| Coupon code | `GALG2026-5K` |

**Why it was the top candidate.** Galgotias is the single largest cluster on the
site at **39,939 impressions**, and at Rs 80,200 it sits at the low end of the
NAAC A+ programmes we track. Note that "low end" is as far as our data goes: a
large share of fee rows are placeholder ranges, so do not turn this into a
"cheapest in India" claim on the page. The guard in
`scripts/check-coupon-claims.mts` will block it.

**The blocker is a contradiction inside EdifyEdu's own content:**

- `lib/data/page-content/galgotias-university-online-mba.json` says Galgotias
  "offers need-based and merit-based scholarships", with concessions for defence
  personnel, government employees and group-institution alumni.
- The Galgotias specialisation pages say the opposite: "Scholarships: None
  offered", and "no scholarships or fee waivers available".

Both are live and indexed. A coupon page has to state one of them, and picking
either without checking makes the site contradict itself on a third page.

**Shipped** as `/coupons/galgotias-online-mba-discount-coupon-2026` with no
claim about scholarships in either direction, which is correct under both
possible truths. **Still needed:** one answer on whether Galgotias runs any
scholarship scheme, from the official portal. If the answer is no, the page can
carry an angle competitors will not have: a NAAC A+ online MBA at Rs 80,200 that
runs no university scholarship, so the coupon is the only reduction available.
Stated that way it is checkable and needs no superlative.

**As shipped:** `Not ranked in the NIRF 2025 top 100`, and no scholarship claim
in either direction. Pharmacy #55 and Law #36 are real but irrelevant to an MBA
page, so neither is quoted.

---

## 2. Sharda — blocked on the fee

| | |
|---|---|
| NAAC | **A+**, score 3.27, valid to 2030-01-17 (verified) |
| NIRF | **#87 University** (verified). No Management rank |
| Fee | **conflict.** `lib/data.ts` Rs 1,40,000 to Rs 1,54,500; `fees-hub` Rs 1,50,000 |

`sharda-university-online` is already on the `verify-fees` drift allowlist as
"verify manually", so this conflict is known and parked. **Needs: the current
MBA fee from the official portal.**

---

## 3. Uttaranchal — blocked on the fee

| | |
|---|---|
| NAAC | **A+**, score 3.3, valid to 2029-01-11 (verified) |
| NIRF | **none claimable.** Supabase holds only Pharmacy #75 |
| Fee | **conflict.** `lib/data.ts` Rs 94,000 to Rs 98,000; `fees-hub` Rs 1,10,000 |

Also on the `verify-fees` drift allowlist. **Needs: the current MBA fee.**

---

## 4. Graphic Era — blocked on the fee

| | |
|---|---|
| NAAC | **A+**, score 3.29, valid to 2029-08-23 (verified) |
| NIRF | **#48 University**, **#52 Management** (both verified) |
| Fee | Rs 75,000 to Rs 1,80,000, a spread wide enough to be a placeholder range |

Accreditation is the cleanest of any candidate here, including a real Management
rank, which is the rank an MBA page should state. **Needs: the MBA-specific fee.**

---

## 5. KL University — blocked on NAAC

| | |
|---|---|
| NAAC | `lib/data.ts` says A++, **Supabase holds no NAAC row at all** |
| NIRF | **#26 University**, **#70 Management** (both verified) |
| Fee | Rs 73,500, both sources agree |

The fee is clean and the NIRF ranks are verified. The only gap is the NAAC grade,
which cannot be claimed from the source of truth. Two ways forward: backfill the
Supabase NAAC row from the NAAC database, or publish the page with the NIRF ranks
and no NAAC claim.

---

## 6. VIT — blocked on verification

| | |
|---|---|
| NAAC | `lib/data.ts` says A++, **not found in Supabase** |
| NIRF | `lib/data.ts` says #14, **not found in Supabase** |
| Fee | Rs 1,60,000, both sources agree |

VIT did not come back from the Supabase `universities` table on the searches run,
so neither claim is verifiable today. Same shape as the Amrita, DDU and SPPU gap
already recorded. **Needs: the Supabase row, or a decision to skip VIT.**

---

## 7. Christ — wrong programme

| | |
|---|---|
| NAAC | **A+**, score 3.42 (verified). `fees-hub` said A++ and has been corrected |
| NIRF | **#63 University**, **#57 Management** (both verified) |
| Programmes | MCA, B.Com, BBA. **No MBA** |

Every coupon page on the site is an online MBA page, and Christ does not offer
one. Building `christ-online-mba-discount-coupon-2026` would market a programme
that does not exist.

Christ is a good candidate for the **first non-MBA coupon page** instead, on MCA
or BBA. That is a new page shape rather than another row, so it is a separate
decision.

---

## Also open, found while checking the above

**BIT Mesra is filed under the id `bits-pilani-online`** in
`data/fees-hub-data.json`. Those are two different universities, and the id is
not in `lib/data.ts`, so `/fees` renders a link to
`/universities/bits-pilani-online`, which is in neither `valid-urls.json` nor the
redirect map and therefore 404s.

BIT Mesra generates real enquiries (3 leads on 288 impressions per the August
lead audit) and is absent from `lib/data.ts` altogether. Fixing it properly means
adding the university with verified data, not renaming a row.

---

## Suggested order

1. ~~Galgotias~~ **shipped 2026-09-14.** The scholarship question is still open
   and would let the page carry a real discounts table.
2. **Graphic Era**, as soon as the MBA fee is confirmed. Cleanest accreditation
   of the remaining set, including a Management rank.
3. **Sharda** and **Uttaranchal**, with the rest of the `verify-fees` drift
   allowlist, since they are the same job.
4. **KL**, after a NAAC backfill or a decision to publish without the grade.
5. **VIT** and **Christ** last, since both need a decision before any writing.
