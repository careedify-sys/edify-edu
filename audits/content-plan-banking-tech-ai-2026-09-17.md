# Content plan: banking, tech and AI audiences

**Date:** 17 September 2026
**Source data:** GSC export 18 Aug to 14 Sep 2026 (28 days), `lib/blog.ts` runtime
inventory, `lib/data.ts` specialisation index, Supabase `accreditations` table.

---

## 1. Where the site stands

| | value |
|---|---:|
| Published posts before this batch | 180 (197 rows: 14 redirected, 3 draft) |
| Site clicks, 28 days | 4,446 |
| Site impressions, 28 days | 987,942 |
| Site CTR | 0.45% |
| CGPA calculator share of impressions | 480,027 (**49%**) |
| Blog share of impressions | 242,426 (25%) across 183 pages |

The single largest traffic source is a calculator that converts CGPA to
percentage. It earns 45% of site clicks and converts nothing. Everything below is
about building demand that can actually become a lead.

## 2. The three target clusters had no footprint

| query cluster | impressions, 28 days | clicks | position |
|---|---:|---:|---:|
| `mba in business analytics` (+ `... online`) | 146 | 1 | **72.3** |
| `mba in finance` / `mba finance online` / `online mba in finance` / `online mba finance` / `mba finance` | ~716 | **0** | **68 to 77** |
| `bits pilani mba for working professionals` | 278 | **0** | 9.6 |
| bank promotion, MBA in AI, MBA in IT management | **no queries at all** | 0 | n/a |

Position 68 to 77 is page seven. These clusters are a net-new bet, not a rescue.

## 3. What the site already ranks for tells us the format

| existing post | impressions | clicks | position |
|---|---:|---:|---:|
| `govt-jobs-after-mba-india-2026` | 15,723 | 190 | 6.73 |
| `mca-vs-btech-which-is-better-2026` | 4,950 | 11 | 6.80 |
| `investment-banking-career-india-salary-qualification` | 1,597 | 7 | 16.72 |
| `data-science-salary-india-2026-scope-jobs` | 548 | 0 | 14.19 |
| `mba-data-science-analytics-career-2026` | 344 | 0 | 27.15 |
| `online-mba-for-working-professionals-india` | 133 | 0 | 29.20 |

**Career-intent and comparison posts rank on page one. Programme-intent pages sit
on page seven.** Every post in this plan is therefore written as career or
decision content, not as a programme brochure.

## 4. Written in this batch (12 posts, published 17 September 2026)

### Banking and BFSI
| slug | angle | target keyword |
|---|---|---|
| `online-mba-bank-employees-promotion-2026` | Your bank's promotion policy and UGC entitlement are two different documents | online mba for bank employees |
| `online-mba-bfsi-india-2026` | The exact banking labels that exist, and the many that do not | online mba bfsi |
| `mba-vs-jaiib-caiib-bank-officers-2026` | Certification is depth inside a bank, a degree is portability out of it | mba vs caiib |
| `online-mba-banking-insurance-vs-finance-vs-bfsi-2026` | Three labels, three desks, one elective list that decides it | mba banking and insurance vs finance |

### Tech and IT professionals
| slug | angle | target keyword |
|---|---|---|
| `online-mba-it-professionals-india-2026` | IT firms promote on bands, not degrees; the degree changes lanes and employers | online mba for it professionals |
| `mba-tech-lead-to-engineering-manager-india-2026` | The jump is evidenced by scope; read three job ads before spending two years | mba for engineering manager |
| `online-mba-information-technology-management-india-2026` | Who carries the label, and what the curriculum does and does not contain | online mba in information technology management |
| `online-mba-vs-ms-vs-executive-pgp-software-engineers-2026` | One of the three is often a diploma, not a degree | mba vs ms for software engineers |

### AI and data
| slug | angle | target keyword |
|---|---|---|
| `online-mba-artificial-intelligence-india-2026` | One university carries a plain AI label; the better-accredited ones say data science | online mba in artificial intelligence |
| `mba-ai-vs-mca-ai-vs-mtech-ai-india-2026` | Eligibility decides this before preference does | mba in ai vs mtech in ai |
| `mba-data-science-vs-business-analytics-2026` | Analytics is the common, honest label; data science oversells inside an MBA | mba data science vs business analytics |
| `online-mba-ai-eligibility-maths-coding-2026` | Admission needs no maths; the coursework needs spreadsheet literacy | online mba in ai eligibility |

## 5. Backlog, ranked, to write only after the October GSC read

Do not write these before pulling GSC around 15 October. If the batch above shows
no impressions after four weeks, these clusters have no Indian volume and the
backlog should be dropped rather than worked through.

| # | proposed slug | angle | depends on |
|---|---|---|---|
| 1 | `online-mba-credit-risk-analyst-india-2026` | The internal transfer from branch banking to a credit or risk desk | nothing |
| 2 | `online-mba-nbfc-career-india-2026` | Non-banking financial companies as the realistic exit from a PSB | nothing |
| 3 | `online-mba-product-manager-india-2026` | Engineer to product manager, the other common lane change | nothing |
| 4 | `online-mba-cyber-security-management-india-2026` | Security as a management subject; pairs with the existing cyber security salary post | check `lib/data.ts` for a security-labelled spec first |
| 5 | `mba-for-government-bank-po-aspirants-2026` | Whether to do an MBA while preparing for banking examinations | nothing |
| 6 | `online-mba-while-on-h1b-or-abroad-2026` | Indian online MBA taken by Indians working overseas; UGC recognition abroad | needs a WES / equivalence source decision |
| 7 | `mba-analytics-capstone-portfolio-2026` | What to build during an analytics MBA so it is worth something at interview | nothing |
| 8 | `online-mba-sponsored-by-employer-india-2026` | Employer sponsorship, bonds, NOC and what to negotiate | nothing |

## 6. Constraints that will apply to every post in this cluster

1. **Zero rupee figures.** `scripts/check-blog-fees.mjs` rejects any currency figure
   in a new slug unless it MATCHes `getDisplayFee()` or is allowlisted. There is also
   no approved source for Indian salary data, so salary tables would be fabrication.
   Route every money question to the official portal.
2. **Accreditation only where Supabase confirms it.** Manipal University Jaipur,
   Dayananda Sagar and BITS Pilani have no rows in the `accreditations` table. Name
   their specialisations, claim nothing about their grades.
3. **Chandigarh University's NAAC A+ validity date (2026-09-09) has passed.** Say the
   status needs a direct check rather than asserting the grade.
4. **NIRF ranks always carry their category.** Management is the relevant category on
   an MBA page.
5. **No outbound link to any commercial aggregator.** IIBF and similar professional
   bodies are named in text without a hyperlink, pending a decision on whether to add
   them to the approved-source list in `CLAUDE.md`.

## 7. Open questions for Rishi

- **Should `iibf.org.in` join the approved external sources?** The MBA vs JAIIB/CAIIB
  post names IIBF but cannot link it under the current list, which weakens it.
- **Hero images.** These twelve ship without one. 173 of the previous 197 posts carry a
  Pexels hero via `scripts/add-pexels-images-to-blogs.js`. Worth a follow-up run.
- **Do we want the placeholder-fee cluster cleaned before writing more programme-intent
  content?** Programme pages cannot outrank review blogs while their fees are fiction.
