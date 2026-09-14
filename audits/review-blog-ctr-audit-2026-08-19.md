# Review-Blog CTR Audit — 2026-08-19

**Phase 1 (read-only).** Live-fetched from https://edifyedu.in/blog/{slug} on 2026-08-20 via Node fetch (see `scratchpad/audit-reviews.mjs`).

## Scope reconciliation

- Brief names 33 review blogs. `lib/blog.ts` contains 39 university-review candidates (grep for slug + review|worth|legit|verdict|honest, minus two generic worth-it posts). The 33 in GSC are a subset. All 39 audited below so the mapping is explicit.
- Note: `amity-online-mca-fees-review` (MCA, not MBA) and the four `is-<uni>-fake-or-legit-2026` posts may live in a different GSC cluster; flagged in the table below.

## Defect counters (all 39 pages)

| Defect | Count |
|---|---|
| HTTP 200 responses | 39 / 39 |
| meta description > 160 chars (SERP truncation risk) | **7** |
| schema "Online Online" double-word bug | **0** |
| missing `<link rel="canonical">` | 0 |
| canonical present but doesn't self-reference | 0 |
| no FAQPage JSON-LD emitted | 1 |
| no Article.about.Course sub-schema | 24 |

## Per-URL SEO snapshot

Sorted by CTR ascending (worst first). `ctr%` blank = not in the GSC excerpt supplied. `m` = meta, `t` = title.

| slug | http | ctr% | pos | m len | m fee@ | t len | t fee | t year | brand-lead | h1=t | canon | ld types | FAQ | doubleOnline |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| chandigarh-university-online-mba-review | 200 | 0.09 | 9.83 | 143 | — | 66 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| muj-online-mba-review-2026 | 200 | 0.13 | 7.43 | 152 | 54 | 46 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| nmims-online-mba-review-2026 | 200 | 0.14 | 10.01 | 138 | — | 62 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| galgotias-online-mba-review | 200 | 0.15 | 8.06 | 152 | 31 | 60 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| amity-online-mba-review-2026 | 200 | 0.17 | 7.92 | 137 | 32 | 66 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| dy-patil-online-mba-review | 200 | 0.23 | 8.38 | 145 | 30 | 67 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| smu-online-mba-review | 200 | 0.24 | 7.71 | 144 | 81 | 64 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| shoolini-online-mba-review | 200 | 0.25 | 8.3 | 156 | 36 | 68 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| symbiosis-online-mba-review-2026 | 200 | 0.33 | 7.7 | 148 | — | 51 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| arka-jain-online-mba-review | 200 | 0.58 | 7.14 | 141 | 30 | 70 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| bits-pilani-online-mba-review-2026 | 200 | 0.6 | 7.13 | 178 | 70 | 64 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| symbiosis-online-bba-review-2026 | 200 | 0.75 | 6.51 | 154 | 40 | 58 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| xlri-online-mba-review-2026 | 200 | 0.93 | 7.09 | 147 | 22 | 60 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| upes-online-mba-review-2026 | 200 | 1.02 | 7.22 | 180 | 36 | 57 |  | ✓ | ✓ | ✓ | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| amity-online-mba-hr-worth-it | 200 |  |  | 141 | — | 52 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+Article+WebPage+BreadcrumbList |  |  |
| ignou-online-mba-review-2026 | 200 |  |  | 116 | 23 | 62 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| online-manipal-mba-review-2026 | 200 |  |  | 135 | — | 73 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| mahe-online-mba-review-2026 | 200 |  |  | 156 | 65 | 50 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| is-manipal-university-jaipur-fake-or-legit-2026 | 200 |  |  | 156 | — | 60 |  |  | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| online-mba-lpu-review-2026 | 200 |  |  | 194 | 53 | 69 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| amity-online-mca-fees-review | 200 |  |  | 154 | 22 | 66 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| vignan-online-mba-review | 200 |  |  | 155 | 21 | 61 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| dsu-online-mba-review | 200 |  |  | 161 | 20 | 69 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| uu-doon-online-mba-review | 200 |  |  | 158 | 22 | 67 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| noida-international-university-online-mba-review | 200 |  |  | 168 | 18 | 73 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| jaypee-jiit-online-mba-review | 200 |  |  | 156 | 23 | 91 | ✓ | ✓ |  |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| amity-online-bba-review-2026 | 200 |  |  | 146 | 30 | 60 |  | ✓ | ✓ | ✓ | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| imt-ghaziabad-online-mba-review-2026 | 200 |  |  | 147 | 35 | 58 |  | ✓ | ✓ | ✓ | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| jain-online-mba-review-2026 | 200 |  |  | 163 | 32 | 71 | ✓ | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| amrita-online-bba-review-2026 | 200 |  |  | 160 | 47 | 54 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| lpu-online-bba-review-2026 | 200 |  |  | 151 | 28 | 56 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| mahe-online-bba-review-2026 | 200 |  |  | 156 | 29 | 60 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| nmims-online-bba-review-2026 | 200 |  |  | 151 | 30 | 61 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| chandigarh-online-bba-review-2026 | 200 |  |  | 149 | 50 | 65 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| muj-online-bba-review-2026 | 200 |  |  | 186 | 54 | 50 |  | ✓ | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| is-amity-university-online-fake-or-legit-2026 | 200 |  |  | 157 | — | 58 |  |  | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| is-chandigarh-university-online-fake-or-legit-2026 | 200 |  |  | 151 | 75 | 57 |  |  | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| is-lpu-online-fake-or-legit-2026 | 200 |  |  | 155 | 114 | 49 |  |  | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |
| is-dy-patil-online-fake-or-legit-2026 | 200 |  |  | 149 | 108 | 48 |  |  | ✓ |  | ok | Organization+WebSite+Person+FAQPage+Article+WebPage+BreadcrumbList | ✓ |  |

## Raw rendered fields — per URL

### chandigarh-university-online-mba-review

```
URL:           https://edifyedu.in/blog/chandigarh-university-online-mba-review
HTTP status:   200
CTR (GSC):     0.09%    pos 9.83
<title>        (66 chars): Chandigarh University Online MBA Review 2026: 23 Specs, PwC Tie-Up
<meta desc>    (143 chars): Chandigarh University Online MBA reviewed: fees after Early Bird scholarship, pros, cons, who it suits. Real student feedback, zero commission.
<h1>           Chandigarh University Online MBA Fees 2026: ₹1.65L Review and Honest Verdict
H1 = title?    false
og:title       Chandigarh University Online MBA Fees 2026: ₹1.65L Review and Honest Verdict
og:description Chandigarh University Online MBA reviewed: fees after Early Bird scholarship, pros, cons, who it suits. Real student feedback, zero commission.
canonical      https://edifyedu.in/blog/chandigarh-university-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Chandigarh University Online MBA Fees 2026: ₹1.65L Review and Honest Verdict
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### muj-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/muj-online-mba-review-2026
HTTP status:   200
CTR (GSC):     0.13%    pos 7.43
<title>        (46 chars): MUJ Online MBA Fees 2026: ₹1,80,000 + 13 Specs
<meta desc>    (152 chars): Manipal University Jaipur (MUJ) Online MBA fees 2026: ₹1,80,000 total (₹45,000 per semester × 4) plus ₹500 application fee. NAAC A+, 13 specialisations.
<h1>           MUJ Online MBA: Fees, 13 Specialisations and Review 2026
H1 = title?    false
og:title       MUJ Online MBA: Fees, 13 Specialisations and Review 2026
og:description Manipal University Jaipur (MUJ) Online MBA fees 2026: ₹1,80,000 total (₹45,000 per semester × 4) plus ₹500 application fee. NAAC A+, 13 specialisations.
canonical      https://edifyedu.in/blog/muj-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): MUJ Online MBA: Fees, 13 Specialisations and Review 2026
about.Course name: Manipal University Jaipur Online MBA
Meta > 160 chars?     no
Meta fee number offset: 54 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### nmims-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/nmims-online-mba-review-2026
HTTP status:   200
CTR (GSC):     0.14%    pos 10.01
<title>        (62 chars): NMIMS Online MBA Review 2026: Best Value for Mumbai BFSI Roles
<meta desc>    (138 chars): NMIMS Online MBA honest review: fees, specialisations, placement reality. Based on real student feedback. Zero commission, no sales pitch.
<h1>           NMIMS Online MBA Fees 2026: ₹1.96L to ₹2.2L Review and Honest Verdict
H1 = title?    false
og:title       NMIMS Online MBA Fees 2026: ₹1.96L to ₹2.2L Review and Honest Verdict
og:description NMIMS Online MBA honest review: fees, specialisations, placement reality. Based on real student feedback. Zero commission, no sales pitch.
canonical      https://edifyedu.in/blog/nmims-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): NMIMS Online MBA Fees 2026: ₹1.96L to ₹2.2L Review and Honest Verdict
about.Course name: NMIMS Online MBA
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### galgotias-online-mba-review

```
URL:           https://edifyedu.in/blog/galgotias-online-mba-review
HTTP status:   200
CTR (GSC):     0.15%    pos 8.06
<title>        (60 chars): Galgotias Online MBA Review 2026: Cheapest NAAC A+ at Rs 80K
<meta desc>    (152 chars): Galgotias Online MBA total fee ₹80,200 but the exam fee and one cost most sites skip changes the maths. Full breakdown, honest verdict, zero commission.
<h1>           Galgotias University Online MBA Fees 2026: ₹80,200 Review and Honest Rating
H1 = title?    false
og:title       Galgotias University Online MBA Fees 2026: ₹80,200 Review and Honest Rating
og:description Galgotias Online MBA total fee ₹80,200 but the exam fee and one cost most sites skip changes the maths. Full breakdown, honest verdict, zero commission.
canonical      https://edifyedu.in/blog/galgotias-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Galgotias University Online MBA Fees 2026: ₹80,200 Review and Honest Rating
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 31 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### amity-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/amity-online-mba-review-2026
HTTP status:   200
CTR (GSC):     0.17%    pos 7.92
<title>        (66 chars): Amity Online MBA Review 2026: Best Pick for International Careers?
<meta desc>    (137 chars): Amity Online MBA honest review: ₹2.07L to ₹4.49L fees, 14 specialisations, placement reality from real student feedback. Zero commission.
<h1>           Amity University Online MBA Fees 2026: ₹2.07L Review and Honest Assessment
H1 = title?    false
og:title       Amity University Online MBA Fees 2026: ₹2.07L Review and Honest Assessment
og:description Amity Online MBA honest review: ₹2.07L to ₹4.49L fees, 14 specialisations, placement reality from real student feedback. Zero commission.
canonical      https://edifyedu.in/blog/amity-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Amity University Online MBA Fees 2026: ₹2.07L Review and Honest Assessment
about.Course name: Amity University Online MBA
Meta > 160 chars?     no
Meta fee number offset: 32 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### dy-patil-online-mba-review

```
URL:           https://edifyedu.in/blog/dy-patil-online-mba-review
HTTP status:   200
CTR (GSC):     0.23%    pos 8.38
<title>        (67 chars): DY Patil Online MBA Review 2026: WES-Recognised, Tech-Forward Specs
<meta desc>    (145 chars): DY Patil Online MBA reviewed: ₹1,89,400 total fee, most affordable WES-recognised online MBA. Real student feedback, pros, cons. Zero commission.
<h1>           DY Patil Online MBA Fees 2026: ₹1,89,400 Review and Honest Verdict
H1 = title?    false
og:title       DY Patil Online MBA Fees 2026: ₹1,89,400 Review and Honest Verdict
og:description DY Patil Online MBA reviewed: ₹1,89,400 total fee, most affordable WES-recognised online MBA. Real student feedback, pros, cons. Zero commission.
canonical      https://edifyedu.in/blog/dy-patil-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): DY Patil Online MBA Fees 2026: ₹1,89,400 Review and Honest Verdict
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 30 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### smu-online-mba-review

```
URL:           https://edifyedu.in/blog/smu-online-mba-review
HTTP status:   200
CTR (GSC):     0.24%    pos 7.71
<title>        (64 chars): SMU Online MBA Review 2026: Rs 1.2L That Punches Above Its Price
<meta desc>    (144 chars): Old SMU reviews say avoid. The 2026 UGC-DEB online MBA is a different programme. ₹1.20L fee, NAAC A+, honest verdict from real student feedback.
<h1>           Sikkim Manipal (SMU) Online MBA Review 2026: Fees and Honest Verdict
H1 = title?    false
og:title       Sikkim Manipal (SMU) Online MBA Review 2026: Fees and Honest Verdict
og:description Old SMU reviews say avoid. The 2026 UGC-DEB online MBA is a different programme. ₹1.20L fee, NAAC A+, honest verdict from real student feedback.
canonical      https://edifyedu.in/blog/smu-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Sikkim Manipal (SMU) Online MBA Review 2026: Fees and Honest Verdict
about.Course name: Sikkim Manipal University Online MBA
Meta > 160 chars?     no
Meta fee number offset: 81 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### shoolini-online-mba-review

```
URL:           https://edifyedu.in/blog/shoolini-online-mba-review
HTTP status:   200
CTR (GSC):     0.25%    pos 8.3
<title>        (68 chars): Shoolini Online MBA Review 2026: Best for Pharma and Biotech Careers
<meta desc>    (156 chars): Shoolini University online MBA fees ₹1,18,000 to ₹1,30,000. NAAC A+, NIRF University #69, 16 specializations. QS #1 private. Honest review, zero commission.
<h1>           Shoolini Online MBA Fees 2026: ₹1.18L Review and Honest Rating
H1 = title?    false
og:title       Shoolini Online MBA Fees 2026: ₹1.18L Review and Honest Rating
og:description Shoolini University online MBA fees ₹1,18,000 to ₹1,30,000. NAAC A+, NIRF University #69, 16 specializations. QS #1 private. Honest review, zero commission.
canonical      https://edifyedu.in/blog/shoolini-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Shoolini Online MBA Fees 2026: ₹1.18L Review and Honest Rating
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 36 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### symbiosis-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/symbiosis-online-mba-review-2026
HTTP status:   200
CTR (GSC):     0.33%    pos 7.7
<title>        (51 chars): Symbiosis Online MBA Review 2026: Tier 1 or Tier 2?
<meta desc>    (148 chars): Is Symbiosis Online MBA Tier 1 or Tier 2? Honest review of fees, placements and who it suits. Compared using real student feedback. Zero commission.
<h1>           Symbiosis Online MBA Fees 2026: ₹3.15L to ₹3.70L SSODL Review and Honest Verdict
H1 = title?    false
og:title       Symbiosis Online MBA Fees 2026: ₹3.15L to ₹3.70L SSODL Review and Honest Verdict
og:description Is Symbiosis Online MBA Tier 1 or Tier 2? Honest review of fees, placements and who it suits. Compared using real student feedback. Zero commission.
canonical      https://edifyedu.in/blog/symbiosis-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Symbiosis Online MBA Fees 2026: ₹3.15L to ₹3.70L SSODL Review and Honest Verdict
about.Course name: Symbiosis Online (SSODL) Online MBA
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### arka-jain-online-mba-review

```
URL:           https://edifyedu.in/blog/arka-jain-online-mba-review
HTTP status:   200
CTR (GSC):     0.58%    pos 7.14
<title>        (70 chars): ARKA JAIN Online MBA Fees 2026, Rs. 1,08,500 | GenAI Sem 1 | JGI Group
<meta desc>    (141 chars): ARKA JAIN JGI Online MBA fees Rs 1,08,500 total. Generative AI compulsory in Semester 1. Full syllabus, fee breakdown and honest 2026 review.
<h1>           ARKA JAIN Online MBA Review 2026: Fees and GenAI Spec
H1 = title?    false
og:title       ARKA JAIN Online MBA Review 2026: Fees and GenAI Spec
og:description ARKA JAIN JGI Online MBA fees Rs 1,08,500 total. Generative AI compulsory in Semester 1. Full syllabus, fee breakdown and honest 2026 review.
canonical      https://edifyedu.in/blog/arka-jain-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): ARKA JAIN Online MBA Review 2026: Fees and GenAI Spec
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 30 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### bits-pilani-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/bits-pilani-online-mba-review-2026
HTTP status:   200
CTR (GSC):     0.6%    pos 7.13
<title>        (64 chars): BITS Pilani Online MBA (WILP) Fees 2026: ₹2.97L, NIRF #16 Review
<meta desc>    (178 chars): Bits Pilani Online MBA 2026: BITS Pilani WILP Online MBA 2026 review: ₹2.97L total fee. NAAC A++, NIRF #16 Overall 2025, 8 specs incl. FinTech, Analytics, Manufacturing. Engin...
<h1>           BITS Pilani Online MBA Review 2026: WILP Fees & Honest Take
H1 = title?    false
og:title       BITS Pilani Online MBA Review 2026: WILP Fees & Honest Take
og:description Bits Pilani Online MBA 2026: BITS Pilani WILP Online MBA 2026 review: ₹2.97L total fee. NAAC A++, NIRF #16 Overall 2025, 8 specs incl. FinTech, Analytics, Manufacturing. Engin...
canonical      https://edifyedu.in/blog/bits-pilani-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): BITS Pilani Online MBA Review 2026: WILP Fees & Honest Take
about.Course name: 
Meta > 160 chars?     YES
Meta fee number offset: 70 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### symbiosis-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/symbiosis-online-bba-review-2026
HTTP status:   200
CTR (GSC):     0.75%    pos 6.51
<title>        (58 chars): Symbiosis Online BBA Review 2026: Fees, SSODL, Honest Take
<meta desc>    (154 chars): Symbiosis online BBA review 2026: SSODL ₹1,65,000 fees, NIRF #19, NAAC A++, Symbiosis International Deemed University Pune branch, BBA progression to MBA.
<h1>           Symbiosis Online BBA (SSODL): Fees and Honest Take
H1 = title?    false
og:title       Symbiosis Online BBA Review 2026: Fees, SSODL, Honest Take
og:description Symbiosis online BBA review 2026: SSODL ₹1,65,000 fees, NIRF #19, NAAC A++, Symbiosis International Deemed University Pune branch, BBA progression to MBA.
canonical      https://edifyedu.in/blog/symbiosis-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Symbiosis Online BBA Review 2026: Fees, SSODL, Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 40 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### xlri-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/xlri-online-mba-review-2026
HTTP status:   200
CTR (GSC):     0.93%    pos 7.09
<title>        (60 chars): XLRI Online MBA 2026: ₹14.4L PGDM Review, NIRF #9 Management
<meta desc>    (147 chars): XLRI Online MBA 2026: ₹14.4L PGDM (not UGC-DEB MBA). 3+ yrs exp required, AACSB/AMBA accredited, NIRF #9 mgmt. Worth it? Honest review by EdifyEdu.
<h1>           XLRI Online MBA Review 2026: ₹14.4L Worth It? Honest Take
H1 = title?    false
og:title       XLRI Online MBA Review 2026: ₹14.4L Worth It? Honest Take
og:description XLRI Online MBA 2026: ₹14.4L PGDM (not UGC-DEB MBA). 3+ yrs exp required, AACSB/AMBA accredited, NIRF #9 mgmt. Worth it? Honest review by EdifyEdu.
canonical      https://edifyedu.in/blog/xlri-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): XLRI Online MBA Review 2026: ₹14.4L Worth It? Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 22 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### upes-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/upes-online-mba-review-2026
HTTP status:   200
CTR (GSC):     1.02%    pos 7.22
<title>        (57 chars): UPES Online MBA Review 2026: Fees, 11 Specs & Honest Take
<meta desc>    (180 chars): UPES Online MBA 2026 honest review: ₹1.75L total fee. UGC-DEB, NAAC A, NIRF #36 Management 2025 / #45 University 2025. 11 specs with unique Oil & Gas, Power, Infrastructure tracks.
<h1>           UPES Online MBA Review 2026: Fees, 11 Specs & Honest Take
H1 = title?    true
og:title       UPES Online MBA Review 2026: Fees, 11 Specs & Honest Take
og:description UPES Online MBA 2026 honest review: ₹1.75L total fee. UGC-DEB, NAAC A, NIRF #36 Management 2025 / #45 University 2025. 11 specs with unique Oil & Gas, Power, Infrastructure tracks.
canonical      https://edifyedu.in/blog/upes-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): UPES Online MBA Review 2026: Fees, 11 Specs & Honest Take
about.Course name: 
Meta > 160 chars?     YES
Meta fee number offset: 36 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### amity-online-mba-hr-worth-it

```
URL:           https://edifyedu.in/blog/amity-online-mba-hr-worth-it
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (52 chars): Is Amity Online MBA HR Worth It? Honest Verdict 2026
<meta desc>    (141 chars): Amity University online MBA HR review 2026, fees, HR+Finance dual specialisation, NAAC A+ accreditation, and who this program actually suits.
<h1>           Is Amity Online MBA in HR Actually Worth It?
H1 = title?    false
og:title       Is Amity Online MBA HR Worth It? Honest Verdict 2026
og:description Amity University online MBA HR review 2026, fees, HR+Finance dual specialisation, NAAC A+ accreditation, and who this program actually suits.
canonical      https://edifyedu.in/blog/amity-online-mba-hr-worth-it   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, Article, WebPage, BreadcrumbList
FAQPage present? false
Article headline (schema): Is Amity Online MBA HR Worth It? Honest Verdict 2026
about.Course name: Amity University Online MBA
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### ignou-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/ignou-online-mba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (62 chars): IGNOU Online MBA Review 2026: Rs 66K Fees, Zero Placement Cell
<meta desc>    (116 chars): IGNOU Online MBA costs ₹66,000 total. But is it still worth it in 2026? Validity, placement reality, honest verdict.
<h1>           IGNOU Online MBA: Is It Still Worth It in 2026?
H1 = title?    false
og:title       IGNOU Online MBA: Is It Still Worth It in 2026?
og:description IGNOU Online MBA costs ₹66,000 total. But is it still worth it in 2026? Validity, placement reality, honest verdict.
canonical      https://edifyedu.in/blog/ignou-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): IGNOU Online MBA: Is It Still Worth It in 2026?
about.Course name: IGNOU Online MBA
Meta > 160 chars?     no
Meta fee number offset: 23 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### online-manipal-mba-review-2026

```
URL:           https://edifyedu.in/blog/online-manipal-mba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (73 chars): Online Manipal MBA 2026: MAHE vs MUJ vs SMU Fees, NIRF, Honest Comparison
<meta desc>    (135 chars): Compare Online Manipal MBA from MAHE, MUJ and SMU on fees, specialisations, rankings and student feedback. Full honest review for 2026.
<h1>           Online Manipal MBA Review 2026: MAHE vs MUJ vs SMU Compared
H1 = title?    false
og:title       Online Manipal MBA Review 2026: MAHE vs MUJ vs SMU Compared
og:description Compare Online Manipal MBA from MAHE, MUJ and SMU on fees, specialisations, rankings and student feedback. Full honest review for 2026.
canonical      https://edifyedu.in/blog/online-manipal-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Online Manipal MBA Review 2026: MAHE vs MUJ vs SMU Compared
about.Course name: Manipal Academy of Higher Education Online MBA
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### mahe-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/mahe-online-mba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (50 chars): MAHE Online MBA Fees 2026: ₹2,92,000, NIRF Rank 39
<meta desc>    (156 chars): Manipal Academy of Higher Education (MAHE) Online MBA fees 2026: ₹2,92,000. NIRF Management rank 39, NAAC A++ (3.65), AACSB accredited. Top-tier online MBA.
<h1>           MAHE Online MBA: Fees, Specialisations and Review 2026
H1 = title?    false
og:title       MAHE Online MBA: Fees, Specialisations and Review 2026
og:description Manipal Academy of Higher Education (MAHE) Online MBA fees 2026: ₹2,92,000. NIRF Management rank 39, NAAC A++ (3.65), AACSB accredited. Top-tier online MBA.
canonical      https://edifyedu.in/blog/mahe-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): MAHE Online MBA: Fees, Specialisations and Review 2026
about.Course name: Manipal Academy of Higher Education Online MBA
Meta > 160 chars?     no
Meta fee number offset: 65 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### is-manipal-university-jaipur-fake-or-legit-2026

```
URL:           https://edifyedu.in/blog/is-manipal-university-jaipur-fake-or-legit-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (60 chars): Is Manipal University Jaipur Fake? No. NAAC A+, UGC Approved
<meta desc>    (156 chars): Manipal University Jaipur is NOT fake. UGC-recognised since 2011, NAAC A+ accredited, NIRF Management rank 81. Degree validity confirmed, red flags checked.
<h1>           Is Manipal University Jaipur Fake or Legit? 2026
H1 = title?    false
og:title       Is Manipal University Jaipur Fake or Legit? 2026
og:description Manipal University Jaipur is NOT fake. UGC-recognised since 2011, NAAC A+ accredited, NIRF Management rank 81. Degree validity confirmed, red flags checked.
canonical      https://edifyedu.in/blog/is-manipal-university-jaipur-fake-or-legit-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Is Manipal University Jaipur Fake or Legit? 2026
about.Course name: Manipal University Jaipur Online MBA
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       false
Title brand-leads?    true
"Online Online" bug?  false
```

### online-mba-lpu-review-2026

```
URL:           https://edifyedu.in/blog/online-mba-lpu-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (69 chars): LPU Online MBA Review 2026: Dual Specialisation, NAAC A++ at Rs 1.46L
<meta desc>    (194 chars): Lovely Professional University (LPU) online MBA fees ₹1,46,240 lumpsum or ₹40,400/semester. 12 specializations, NAAC A++, NIRF Management #44. Honest review with placement data. Zero commission.
<h1>           LPU Online MBA Fees 2026: Lovely Professional University Review and Honest Take
H1 = title?    false
og:title       LPU Online MBA Fees 2026: Lovely Professional University Review and Honest Take
og:description Lovely Professional University (LPU) online MBA fees ₹1,46,240 lumpsum or ₹40,400/semester. 12 specializations, NAAC A++, NIRF Management #44. Honest review with placement data. Zero commission.
canonical      https://edifyedu.in/blog/online-mba-lpu-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): LPU Online MBA Fees 2026: Lovely Professional University Review and Honest Take
about.Course name: LPU Online MBA
Meta > 160 chars?     YES
Meta fee number offset: 53 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### amity-online-mca-fees-review

```
URL:           https://edifyedu.in/blog/amity-online-mca-fees-review
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (66 chars): Amity Online MCA Review 2026: Worth Rs 1.7L for FinTech and Cyber?
<meta desc>    (154 chars): Amity Online MCA fees Rs 1.7L total (Rs 42,500 per semester). Review of all 6 specialisations, HCLTech and Paytm tie-ups and comparison with alternatives.
<h1>           Amity Online MCA: Fees, Specialisations and Honest Review 2026
H1 = title?    false
og:title       Amity Online MCA: Fees, Specialisations and Honest Review 2026
og:description Amity Online MCA fees Rs 1.7L total (Rs 42,500 per semester). Review of all 6 specialisations, HCLTech and Paytm tie-ups and comparison with alternatives.
canonical      https://edifyedu.in/blog/amity-online-mca-fees-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Amity Online MCA: Fees, Specialisations and Honest Review 2026
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 22 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### vignan-online-mba-review

```
URL:           https://edifyedu.in/blog/vignan-online-mba-review
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (61 chars): Vignan Online MBA Fees 2026, Rs. 90,000 Total | Honest Review
<meta desc>    (155 chars): Vignan Online MBA at Rs. 90,000 total. NAAC A+ ranked. Full fee breakdown, semester-wise syllabus, 7 specializations and honest review of who should apply.
<h1>           Vignan Online MBA 2026: Fees, Syllabus, Honest Review
H1 = title?    false
og:title       Vignan Online MBA 2026: Fees, Syllabus, Honest Review
og:description Vignan Online MBA at Rs. 90,000 total. NAAC A+ ranked. Full fee breakdown, semester-wise syllabus, 7 specializations and honest review of who should apply.
canonical      https://edifyedu.in/blog/vignan-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Vignan Online MBA 2026: Fees, Syllabus, Honest Review
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 21 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### dsu-online-mba-review

```
URL:           https://edifyedu.in/blog/dsu-online-mba-review
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (69 chars): DSU Online MBA Fees 2026, Rs. 1,30,000 Total | Dayananda Sagar Review
<meta desc>    (161 chars): DSU Online MBA fees Rs 1,30,000 total (Rs 32,875 first semester). NAAC A++ Bangalore university. Fee breakdown, specialisations, syllabus and honest 2026 review.
<h1>           DSU Online MBA Review 2026: Fees and Honest Rating
H1 = title?    false
og:title       DSU Online MBA Review 2026: Fees and Honest Rating
og:description DSU Online MBA fees Rs 1,30,000 total (Rs 32,875 first semester). NAAC A++ Bangalore university. Fee breakdown, specialisations, syllabus and honest 2026 review.
canonical      https://edifyedu.in/blog/dsu-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): DSU Online MBA Review 2026: Fees and Honest Rating
about.Course name: 
Meta > 160 chars?     YES
Meta fee number offset: 20 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### uu-doon-online-mba-review

```
URL:           https://edifyedu.in/blog/uu-doon-online-mba-review
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (67 chars): UU Doon Online MBA Fees 2026, Rs. 94,000 Total | Uttaranchal Review
<meta desc>    (158 chars): UU Doon Online MBA at Rs. 94,000 total (after 30% scholarship). NAAC A+, Dehradun. Full fee breakdown, 8 specializations, syllabus and honest review for 2026.
<h1>           Uttaranchal University Online MBA Review 2026: Fees
H1 = title?    false
og:title       Uttaranchal University Online MBA Review 2026: Fees
og:description UU Doon Online MBA at Rs. 94,000 total (after 30% scholarship). NAAC A+, Dehradun. Full fee breakdown, 8 specializations, syllabus and honest review for 2026.
canonical      https://edifyedu.in/blog/uu-doon-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Uttaranchal University Online MBA Review 2026: Fees
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 22 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### noida-international-university-online-mba-review

```
URL:           https://edifyedu.in/blog/noida-international-university-online-mba-review
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (73 chars): NIU Online MBA Fees 2026, Rs. 88,500 | 10 Specializations | SPSS Training
<meta desc>    (168 chars): NIU Online MBA at Rs. 88,500 after early-bird discount. NAAC A+, Greater Noida. 10 specializations, SPSS training, detailed healthcare & agri syllabi and honest review.
<h1>           NIU Online MBA Review 2026: Fees and Honest Rating
H1 = title?    false
og:title       NIU Online MBA Review 2026: Fees and Honest Rating
og:description NIU Online MBA at Rs. 88,500 after early-bird discount. NAAC A+, Greater Noida. 10 specializations, SPSS training, detailed healthcare & agri syllabi and honest review.
canonical      https://edifyedu.in/blog/noida-international-university-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): NIU Online MBA Review 2026: Fees and Honest Rating
about.Course name: 
Meta > 160 chars?     YES
Meta fee number offset: 18 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### jaypee-jiit-online-mba-review

```
URL:           https://edifyedu.in/blog/jaypee-jiit-online-mba-review
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (91 chars): JIIT Online MBA Review 2026, IT Business Analytics, AI in Business, Rs 1,75,000 Full Review
<meta desc>    (156 chars): Jaypee JIIT Online MBA Rs 1,75,000. Built for tech professionals. AI in Business in Semester 3, IT Analytics with Blockchain, mandatory internship included.
<h1>           Jaypee JIIT Online MBA Review 2026: Fees and IT Track
H1 = title?    false
og:title       Jaypee JIIT Online MBA Review 2026: Fees and IT Track
og:description Jaypee JIIT Online MBA Rs 1,75,000. Built for tech professionals. AI in Business in Semester 3, IT Analytics with Blockchain, mandatory internship included.
canonical      https://edifyedu.in/blog/jaypee-jiit-online-mba-review   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Jaypee JIIT Online MBA Review 2026: Fees and IT Track
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 23 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    false
"Online Online" bug?  false
```

### amity-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/amity-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (60 chars): Amity Online BBA Review 2026: Fees, Curriculum & Honest Take
<meta desc>    (146 chars): Amity Online BBA review 2026: ₹1,75,120 One-Time / ₹33,200 sem / 0% EMI ₹7,877 monthly. UGC-DEB, NAAC A+, NIRF #49, WASC, QAA, WES. Pros and cons.
<h1>           Amity Online BBA Review 2026: Fees, Curriculum & Honest Take
H1 = title?    true
og:title       Amity Online BBA Review 2026: Fees, Curriculum & Honest Take
og:description Amity Online BBA review 2026: ₹1,75,120 One-Time / ₹33,200 sem / 0% EMI ₹7,877 monthly. UGC-DEB, NAAC A+, NIRF #49, WASC, QAA, WES. Pros and cons.
canonical      https://edifyedu.in/blog/amity-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Amity Online BBA Review 2026: Fees, Curriculum & Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 30 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### imt-ghaziabad-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/imt-ghaziabad-online-mba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (58 chars): IMT Ghaziabad Online MBA Review 2026: CDL PGDM Fees & Take
<meta desc>    (147 chars): IMT Ghaziabad CDL Online MBA 2026: ₹2.20L AICTE PGDM (not UGC-DEB). 6 specs, Delhi NCR brand. Honest review: fees, placement, and who should apply.
<h1>           IMT Ghaziabad Online MBA Review 2026: CDL PGDM Fees & Take
H1 = title?    true
og:title       IMT Ghaziabad Online MBA Review 2026: CDL PGDM Fees & Take
og:description IMT Ghaziabad CDL Online MBA 2026: ₹2.20L AICTE PGDM (not UGC-DEB). 6 specs, Delhi NCR brand. Honest review: fees, placement, and who should apply.
canonical      https://edifyedu.in/blog/imt-ghaziabad-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): IMT Ghaziabad Online MBA Review 2026: CDL PGDM Fees & Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 35 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### jain-online-mba-review-2026

```
URL:           https://edifyedu.in/blog/jain-online-mba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (71 chars): Jain University Online MBA Fees 2026: ₹1.96L to ₹2.98L, NAAC A++ Review
<meta desc>    (163 chars): Jain University online MBA fees ₹1,96,000 to ₹2,98,000 by specialization. NAAC A++ (3.71), NIRF Management #73. 18 specializations. Honest review, zero commission.
<h1>           Jain Online MBA Fees 2026: ₹1.96L to ₹2.98L Review and Honest Take
H1 = title?    false
og:title       Jain Online MBA Fees 2026: ₹1.96L to ₹2.98L Review and Honest Take
og:description Jain University online MBA fees ₹1,96,000 to ₹2,98,000 by specialization. NAAC A++ (3.71), NIRF Management #73. 18 specializations. Honest review, zero commission.
canonical      https://edifyedu.in/blog/jain-online-mba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Jain Online MBA Fees 2026: ₹1.96L to ₹2.98L Review and Honest Take
about.Course name: 
Meta > 160 chars?     YES
Meta fee number offset: 32 (in first 120)
Title has fee number? true
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### amrita-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/amrita-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (54 chars): Amrita Online BBA Review 2026: AHEAD Fees, Honest Take
<meta desc>    (160 chars): Amrita online BBA review 2026: AHEAD programme ₹1,41,000 fees, NIRF top tier, NAAC A++, Amrita Vishwa Vidyapeetham brand at structurally accessible online tier.
<h1>           Amrita AHEAD Online BBA: Fees and an Honest Take
H1 = title?    false
og:title       Amrita Online BBA Review 2026: AHEAD Fees, Honest Take
og:description Amrita online BBA review 2026: AHEAD programme ₹1,41,000 fees, NIRF top tier, NAAC A++, Amrita Vishwa Vidyapeetham brand at structurally accessible online tier.
canonical      https://edifyedu.in/blog/amrita-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Amrita Online BBA Review 2026: AHEAD Fees, Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 47 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### lpu-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/lpu-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (56 chars): LPU Online BBA Review 2026: Fees, 20% Grant, Honest Take
<meta desc>    (151 chars): LPU online BBA review 2026: ₹1,22,400 net fees with 20% grant, NIRF #38, NAAC A++, Lovely Professional University Punjab North India IT corridor brand.
<h1>           LPU Online BBA: Fees, 20% Grant and Honest Take
H1 = title?    false
og:title       LPU Online BBA Review 2026: Fees, 20% Grant, Honest Take
og:description LPU online BBA review 2026: ₹1,22,400 net fees with 20% grant, NIRF #38, NAAC A++, Lovely Professional University Punjab North India IT corridor brand.
canonical      https://edifyedu.in/blog/lpu-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): LPU Online BBA Review 2026: Fees, 20% Grant, Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 28 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### mahe-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/mahe-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (60 chars): MAHE Online BBA Review 2026: Fees, Honors Track, Honest Take
<meta desc>    (156 chars): MAHE online BBA review 2026: ₹1,80,000 fees, NIRF #4 institution, NAAC A++, BBA Honors 4-year track at CGPA 8, 5 specialisations, 15% first-sem scholarship.
<h1>           MAHE Online BBA: Fees, Honors Track and Honest Take
H1 = title?    false
og:title       MAHE Online BBA Review 2026: Fees, Honors Track, Honest Take
og:description MAHE online BBA review 2026: ₹1,80,000 fees, NIRF #4 institution, NAAC A++, BBA Honors 4-year track at CGPA 8, 5 specialisations, 15% first-sem scholarship.
canonical      https://edifyedu.in/blog/mahe-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): MAHE Online BBA Review 2026: Fees, Honors Track, Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 29 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### nmims-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/nmims-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (61 chars): NMIMS Online BBA Review 2026: Fees, BA Electives, Honest Take
<meta desc>    (151 chars): NMIMS online BBA review 2026: ₹1,50,000 standard or ₹1,80,000 BA electives, NIRF top 100, NAAC A++, NMIMS deemed university Mumbai BFSI corridor brand.
<h1>           NMIMS Online BBA: Fees, BA Electives and Honest Take
H1 = title?    false
og:title       NMIMS Online BBA Review 2026: Fees, BA Electives, Honest Take
og:description NMIMS online BBA review 2026: ₹1,50,000 standard or ₹1,80,000 BA electives, NIRF top 100, NAAC A++, NMIMS deemed university Mumbai BFSI corridor brand.
canonical      https://edifyedu.in/blog/nmims-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): NMIMS Online BBA Review 2026: Fees, BA Electives, Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 30 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### chandigarh-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/chandigarh-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (65 chars): Chandigarh Online BBA Review 2026: Fees, Scholarship, Honest Take
<meta desc>    (149 chars): Chandigarh University Online BBA review 2026: net ₹1,31,250 with 25% Early Bird, NIRF #28 highest in Tier 2, NAAC A+, ACCA tie-up, 4 specialisations.
<h1>           Chandigarh University Online BBA: Fees, Scholarship and Honest Take
H1 = title?    false
og:title       Chandigarh Online BBA Review 2026: Fees, Scholarship, Honest Take
og:description Chandigarh University Online BBA review 2026: net ₹1,31,250 with 25% Early Bird, NIRF #28 highest in Tier 2, NAAC A+, ACCA tie-up, 4 specialisations.
canonical      https://edifyedu.in/blog/chandigarh-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Chandigarh Online BBA Review 2026: Fees, Scholarship, Honest Take
about.Course name: 
Meta > 160 chars?     no
Meta fee number offset: 50 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### muj-online-bba-review-2026

```
URL:           https://edifyedu.in/blog/muj-online-bba-review-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (50 chars): MUJ Online BBA Review 2026: Fees, EMI, Honest Take
<meta desc>    (186 chars): MUJ online BBA review 2026: Manipal University Jaipur ₹1,39,500 inclusive fees, EMI ₹3,875/month (lowest in Tier 2), NAAC A+, Manipal Group institutional legacy, 7 specialisation tracks.
<h1>           MUJ Online BBA: Fees, EMI Options and Honest Take
H1 = title?    false
og:title       MUJ Online BBA Review 2026: Fees, EMI, Honest Take
og:description MUJ online BBA review 2026: Manipal University Jaipur ₹1,39,500 inclusive fees, EMI ₹3,875/month (lowest in Tier 2), NAAC A+, Manipal Group institutional legacy, 7 specialisation tracks.
canonical      https://edifyedu.in/blog/muj-online-bba-review-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): MUJ Online BBA Review 2026: Fees, EMI, Honest Take
about.Course name: 
Meta > 160 chars?     YES
Meta fee number offset: 54 (in first 120)
Title has fee number? false
Title has year?       true
Title brand-leads?    true
"Online Online" bug?  false
```

### is-amity-university-online-fake-or-legit-2026

```
URL:           https://edifyedu.in/blog/is-amity-university-online-fake-or-legit-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (58 chars): Is Amity University Online Fake? No. NAAC A+, UGC Approved
<meta desc>    (157 chars): Amity University Online is not fake. UGC-DEB approved, NAAC A+ accredited. Degrees valid for PSU and government jobs. Five Amity Online fee quotes explained.
<h1>           Is Amity University Online Fake or Legit? 2026
H1 = title?    false
og:title       Is Amity University Online Fake or Legit? 2026
og:description Amity University Online is not fake. UGC-DEB approved, NAAC A+ accredited. Degrees valid for PSU and government jobs. Five Amity Online fee quotes explained.
canonical      https://edifyedu.in/blog/is-amity-university-online-fake-or-legit-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Is Amity University Online Fake or Legit? 2026
about.Course name: Amity University Online MBA
Meta > 160 chars?     no
Meta fee number offset: none
Title has fee number? false
Title has year?       false
Title brand-leads?    true
"Online Online" bug?  false
```

### is-chandigarh-university-online-fake-or-legit-2026

```
URL:           https://edifyedu.in/blog/is-chandigarh-university-online-fake-or-legit-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (57 chars): Is Chandigarh University Online Fake? No, NAAC A+ UGC-DEB
<meta desc>    (151 chars): Chandigarh University Online is not fake. UGC-DEB, NAAC A+. MBA list price Rs 2.20L; early-bird price Rs 1.65L (25% concession). Degrees are PSU-valid.
<h1>           Is Chandigarh University Online Fake or Legit? 2026
H1 = title?    false
og:title       Is Chandigarh University Online Fake or Legit? 2026
og:description Chandigarh University Online is not fake. UGC-DEB, NAAC A+. MBA list price Rs 2.20L; early-bird price Rs 1.65L (25% concession). Degrees are PSU-valid.
canonical      https://edifyedu.in/blog/is-chandigarh-university-online-fake-or-legit-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Is Chandigarh University Online Fake or Legit? 2026
about.Course name: Chandigarh University Online MBA
Meta > 160 chars?     no
Meta fee number offset: 75 (in first 120)
Title has fee number? false
Title has year?       false
Title brand-leads?    true
"Online Online" bug?  false
```

### is-lpu-online-fake-or-legit-2026

```
URL:           https://edifyedu.in/blog/is-lpu-online-fake-or-legit-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (49 chars): Is LPU Online Fake? No, NAAC A++ UGC-DEB Approved
<meta desc>    (155 chars): LPU Online is not fake. NAAC A++, UGC-DEB entitled online mode from a Punjab Act 2005 university. Online MBA list Rs 2,00,000; current portal grants apply.
<h1>           Is LPU Online Fake or Legit? 2026
H1 = title?    false
og:title       Is LPU Online Fake or Legit? 2026
og:description LPU Online is not fake. NAAC A++, UGC-DEB entitled online mode from a Punjab Act 2005 university. Online MBA list Rs 2,00,000; current portal grants apply.
canonical      https://edifyedu.in/blog/is-lpu-online-fake-or-legit-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Is LPU Online Fake or Legit? 2026
about.Course name: LPU Online MBA
Meta > 160 chars?     no
Meta fee number offset: 114 (in first 120)
Title has fee number? false
Title has year?       false
Title brand-leads?    true
"Online Online" bug?  false
```

### is-dy-patil-online-fake-or-legit-2026

```
URL:           https://edifyedu.in/blog/is-dy-patil-online-fake-or-legit-2026
HTTP status:   200
CTR (GSC):     n/a%    pos n/a
<title>        (48 chars): Is DY Patil Online MBA Fake? No, NAAC A++ Deemed
<meta desc>    (149 chars): DPU-COL Pune Online is not fake. NAAC A++ deemed university, UGC-DEB entitled, and the online MBA sits on a Rs 1,89,400 list. Full 2026 audit inside.
<h1>           Is Dr. D.Y. Patil Vidyapeeth Pune Online (DPU-COL) Fake or Legit? 2026
H1 = title?    false
og:title       Is Dr. D.Y. Patil Vidyapeeth Pune Online (DPU-COL) Fake or Legit? 2026
og:description DPU-COL Pune Online is not fake. NAAC A++ deemed university, UGC-DEB entitled, and the online MBA sits on a Rs 1,89,400 list. Full 2026 audit inside.
canonical      https://edifyedu.in/blog/is-dy-patil-online-fake-or-legit-2026   (self-ref: true)
JSON-LD types  Organization, WebSite, Person, FAQPage, Article, WebPage, BreadcrumbList
FAQPage present? true
Article headline (schema): Is Dr. D.Y. Patil Vidyapeeth Pune Online (DPU-COL) Fake or Legit? 2026
about.Course name: Dr. D.Y. Patil Vidyapeeth, Pune Online (DPU-COL) Online MBA
Meta > 160 chars?     no
Meta fee number offset: 108 (in first 120)
Title has fee number? false
Title has year?       false
Title brand-leads?    true
"Online Online" bug?  false
```

---

## Phase 3 — Hub ↔ Blog cross-linking (read-only)

For each review blog, the matching university programme hub was fetched. Numbers are counts of `<a href="...">` matches in rendered HTML.

Legend: `b→h` = number of links in blog pointing at the hub path. `h→b` = links in hub pointing at the blog. `hubIdx` = "y" if hub emits index (else noindex).

| slug | blog | hub | b→h | h→b | blog canon self | hub canon self | crossCanon | hubIdx | LeadForm | EndCta | VerdictTop | WhatsApp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| amity-online-mba-hr-worth-it | 200 | 308 | 0 | 0 | ✓ | ✗ | — | y |  |  |  | ✓ |
| amity-online-mba-review-2026 | 200 | 200 | 3 | 1 | ✓ | ✓ | — | y |  |  | ✓ | ✓ |
| is-amity-university-online-fake-or-legit-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| is-manipal-university-jaipur-fake-or-legit-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  | ✓ | ✓ |
| muj-online-mba-review-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| online-manipal-mba-review-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| mahe-online-mba-review-2026 | 200 | 200 | 1 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| nmims-online-mba-review-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| symbiosis-online-mba-review-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| ignou-online-mba-review-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| online-mba-lpu-review-2026 | 200 | 200 | 1 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| is-lpu-online-fake-or-legit-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| smu-online-mba-review | 200 | 200 | 1 | 1 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| chandigarh-university-online-mba-review | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| is-chandigarh-university-online-fake-or-legit-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| galgotias-online-mba-review | 200 | 200 | 1 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| dy-patil-online-mba-review | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| is-dy-patil-online-fake-or-legit-2026 | 200 | 200 | 2 | 1 | ✓ | ✓ | — | y |  |  |  | ✓ |
| upes-online-mba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| xlri-online-mba-review-2026 | 200 | 404 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| bits-pilani-online-mba-review-2026 | 200 | 308 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| arka-jain-online-mba-review | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| shoolini-online-mba-review | 200 | 200 | 1 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| jain-online-mba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| imt-ghaziabad-online-mba-review-2026 | 200 | 404 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| dsu-online-mba-review | 200 | 404 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| vignan-online-mba-review | 200 | 308 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| jaypee-jiit-online-mba-review | 200 | 308 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| uu-doon-online-mba-review | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| noida-international-university-online-mba-review | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| amrita-online-bba-review-2026 | 200 | 308 | 0 | 0 | ✓ | ✗ | — | y | ✓ |  |  | ✓ |
| lpu-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | NO | ✓ |  |  | ✓ |
| mahe-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| nmims-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | NO | ✓ |  |  | ✓ |
| symbiosis-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | NO | ✓ |  |  | ✓ |
| chandigarh-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | NO | ✓ |  |  | ✓ |
| muj-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| amity-online-bba-review-2026 | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y | ✓ |  |  | ✓ |
| amity-online-mca-fees-review | 200 | 200 | 0 | 0 | ✓ | ✓ | — | y |  |  |  | ✓ |

### Phase 3 counters

| Signal | Count / 39 |
|---|---|
| Blog has ZERO link to matching hub | **23** |
| Hub has ZERO link back to blog | **25** |
| BOTH directions unlinked | **23** |
| Matching hub is noindexed | 4 |
| Any cross-canonical (bug) | 0 |
| Blog with NO LeadForm + NO EndCta + NO VerdictTop | **12** |


---

## Phase 1 Analysis — top-quartile vs bottom-quartile structural comparison

Groups drawn from the CTR figures in the brief (16 May–15 Aug 2026 GSC window).

**Top quartile (CTR ≥ 0.50%) — 5 pages, control group, do not touch:**

| slug | ctr% | pos | title | title has fee/number? |
|---|---|---|---|---|
| upes-online-mba-review-2026 | 1.02 | 7.22 | UPES Online MBA Review 2026: Fees, 11 Specs & Honest Take | "11 Specs" |
| xlri-online-mba-review-2026 | 0.93 | 7.09 | XLRI Online MBA 2026: ₹14.4L PGDM Review, NIRF #9 Management | ₹14.4L + NIRF #9 |
| symbiosis-online-bba-review-2026 | 0.75 | 6.51 | Symbiosis Online BBA Review 2026: Fees, SSODL, Honest Take | SSODL disambiguator |
| bits-pilani-online-mba-review-2026 | 0.60 | 7.13 | BITS Pilani Online MBA (WILP) Fees 2026: ₹2.97L, NIRF #16 Review | ₹2.97L + NIRF #16 + WILP |
| arka-jain-online-mba-review | 0.58 | 7.14 | ARKA JAIN Online MBA Fees 2026, Rs. 1,08,500 \| GenAI Sem 1 \| JGI Group | Rs 1,08,500 + GenAI hook |

**Bottom quartile (CTR < 0.22%) — 5 pages, mentioned in the brief:**

| slug | ctr% | pos | title | title has fee/number? |
|---|---|---|---|---|
| chandigarh-university-online-mba-review | 0.09 | 9.83 | Chandigarh University Online MBA Review 2026: 23 Specs, PwC Tie-Up | "23 Specs" + PwC |
| muj-online-mba-review-2026 | 0.13 | 7.43 | MUJ Online MBA Fees 2026: ₹1,80,000 + 13 Specs | ₹1,80,000 + 13 Specs |
| nmims-online-mba-review-2026 | 0.14 | 10.01 | NMIMS Online MBA Review 2026: Best Value for Mumbai BFSI Roles | subjective only |
| galgotias-online-mba-review | 0.15 | 8.06 | Galgotias Online MBA Review 2026: Cheapest NAAC A+ at Rs 80K | Rs 80K + NAAC A+ |
| amity-online-mba-review-2026 | 0.17 | 7.92 | Amity Online MBA Review 2026: Best Pick for International Careers? | subjective only |

### What differs structurally between top and bottom

Head-markup structure is **identical** across all 39 pages:

| feature | top-5 | bottom-5 |
|---|---|---|
| HTTP 200 | 5/5 | 5/5 |
| self-canonical | 5/5 | 5/5 |
| brand-lead title | 5/5 | 5/5 |
| year in title | 5/5 | 5/5 |
| meta description within 155-chars-safe | 3/5 (BITS 178, UPES 180 over) | 5/5 (all under) |
| FAQPage JSON-LD | 5/5 | 5/5 |
| Article+WebPage+Breadcrumb JSON-LD | 5/5 | 5/5 |
| h1 = title | 2/5 (UPES, XLRI) | 0/5 |

The **only material split** in what Google sees is one editorial pattern, not a mechanical defect:

- **All 5 top pages** carry a concrete number or unambiguous entity in the title (fee amount, NIRF rank, WILP/SSODL disambiguator, spec count paired with named hook). None uses a subjective adjective as the primary hook.
- **2 of 5 bottom pages** (NMIMS, Amity) lead with subjective positioning ("Best Value for", "Best Pick for International Careers?") with no concrete number in the title.
- **3 of 5 bottom pages** (Chandigarh, MUJ, Galgotias) do carry concrete numbers in the title yet still underperform, which means concreteness alone does not close the gap. Chandigarh's "23 Specs, PwC Tie-Up" hook is factual but reads as feature-list rather than a benefit; MUJ's title trades "Review" for "Fees" (identity as a review page fainter); Galgotias' "Cheapest NAAC A+ at Rs 80K" is factually strong but the SERP position at 8.06 with 35,762 impressions and only 55 clicks suggests the brand pull is genuinely weak — searchers who type "Galgotias" trust the OU/hub answer less, not the title.

**Honest finding:** at position ~7–10, the same template renders 0.09%–1.02%. Nothing in the rendered HTML explains a 10× spread. Most of the delta is brand pull — UPES, XLRI, BITS, Symbiosis, Arka Jain all pull people who searched the brand deliberately, while Chandigarh, MUJ, NMIMS, Galgotias, Amity share the SERP with heavy-brand competitors (official university sites, established comparison portals). The template-level fixes that are safe to ship are the two mechanical ones below; anything else would be a title rewrite gamble.

### Two known-defect classes checked across all 39

**A. Meta description over 160 characters** — **7 offenders:**

| slug | meta len | note |
|---|---|---|
| online-mba-lpu-review-2026 | **194** | trailing "Zero commission." drops off SERP |
| muj-online-bba-review-2026 | **186** | trailing "7 specialisation tracks." drops off |
| upes-online-mba-review-2026 | **180** | top-quartile — safe mechanical clamp only |
| bits-pilani-online-mba-review-2026 | **178** | top-quartile — trailing "Engin..." already truncated |
| noida-international-university-online-mba-review | **168** | |
| jain-online-mba-review-2026 | **163** | |
| dsu-online-mba-review | **161** | |

BITS is particularly bad: `"Bits Pilani Online MBA 2026: BITS Pilani WILP Online MBA 2026 review..."` — the string starts with a stub "Bits Pilani Online MBA 2026:" followed by the actual sentence "BITS Pilani WILP Online MBA 2026 review: ..." which looks like a stale keyword-stuffing prefix left over from a template. The fee `₹2.97L` sits at offset 70, safely in first-120, so a clamp that removes the prefix leaves the fee intact.

**B. Schema "Online Online" double-word bug (Article.about.Course.name)** — **0 consecutive-word matches**, but **1 non-consecutive variant found:**

- `symbiosis-online-mba-review-2026` → `about.Course.name = "Symbiosis Online (SSODL) Online MBA"`. The strip regex in [app/blog/[slug]/page.tsx:236](app/blog/[slug]/page.tsx#L236) is `.replace(/\s+Online\s*$/i, '')`, which only strips a trailing " Online". Symbiosis's `universityName` in [lib/internal-links.ts:47](lib/internal-links.ts#L47) is `"Symbiosis Online (SSODL)"` — ends with `)`, not `Online`, so the strip does not apply, and the composed value has `Online` twice with the parenthetical between them. This is functionally the same defect the Galgotias fix targeted, just missed by the regex. Applies to 1 of 39 today; will re-occur any time a universityName ends in a parenthetical alias.

Confirmed by inspecting [app/blog/[slug]/page.tsx:230-243](app/blog/[slug]/page.tsx#L230) and [lib/internal-links.ts:47](lib/internal-links.ts#L47).

### Canonical audit

All 39 pages emit `<link rel="canonical">` and all self-reference their own `/blog/{slug}` URL. No missing canonicals, no mismatches. Nothing to fix here.

### JSON-LD types

All 39 emit `Organization + WebSite + Person + Article + WebPage + BreadcrumbList`. FAQPage present on 38 of 39 (`amity-online-mba-hr-worth-it` has empty `faqs: []` in [lib/blog.ts:58-60](lib/blog.ts#L58), so the FAQPage block is deliberately suppressed by the guard at [app/blog/[slug]/page.tsx:185](app/blog/[slug]/page.tsx#L185)). Not a defect — Google refuses empty-mainEntity FAQPage. Leave as-is.

---

## Phase 3 findings — hub/blog cross-linking

### The single biggest structural finding of this audit

Every top-quartile page (UPES, XLRI, BITS, Arka Jain, Symbiosis-BBA) has:
- **zero links from blog → hub** (b→h = 0)
- **zero links from hub → blog** (h→b = 0)
- and in three cases, no working hub at all:
  - `xlri-online-mba-review-2026` → matching hub `/universities/xlri-online/mba` returns **404**
  - `bits-pilani-online-mba-review-2026` → hub `/universities/bits-pilani-online/mba` returns **308** (redirect, not resolved)
  - `symbiosis-online-bba-review-2026` → hub `/universities/symbiosis-university-online/bba` responds 200 but emits **`noindex`**

The blogs are pulling in the traffic and the funnel to the lead form terminates at the generic in-article `BlogLeadForm` component only. There is no path from the SERP click to the hub's Formspree form for any of the five best converters.

### Which blogs ARE fully wired to their hub

11 of 39 have functioning bidirectional links:

- 3 Amity MBA blogs → amity-university-online/mba hub
- 2 MUJ blogs → manipal-university-jaipur-online/mba hub
- 2 LPU blogs → lovely-professional-university-online/mba hub
- 2 MAHE / Online Manipal blogs → manipal-academy-higher-education-online/mba hub
- IGNOU, NMIMS, Symbiosis(MBA), SMU, is-Chandigarh-fake-or-legit, is-dy-patil-fake-or-legit → their matching hubs

The linkage is driven by [lib/internal-links.ts:18-172](lib/internal-links.ts#L18): a static `UNIVERSITY_PROGRAM_LINKS` map. If a blog slug is not listed under `blogs:` for a university, both `getUniversityFromBlog()` and `getProgramBlogLinks()` return null, so `BlogRelatedLinks` and `ProgramBlogLinks` render nothing.

**28 of 39 blogs have no entry in that map, so no bidirectional linking is possible today.** That includes:

- Every one of the top-5 converters (they were never wired)
- `chandigarh-university-online-mba-review` (bottom, 0.09% CTR) — only the "is-fake-or-legit" Chandigarh blog is wired, not the review
- `galgotias-online-mba-review`, `dy-patil-online-mba-review` — both bottom-quartile, their hubs are in the map with empty `blogs: []`
- All 8 BBA review blogs (BBA program not represented in the map at all)
- Every one of the "long-tail" reviews (IMT, DSU, Vignan, Jaypee, UU Doon, Noida International, Amrita, Jain, Shoolini)

### Hub health issues surfaced by this pass

- **5 hubs are noindexed** (via `shouldIndexProgrammeHub()` in [lib/seo/should-index.ts](lib/seo/should-index.ts)): `lpu-online-bba`, `nmims-online-bba`, `symbiosis-online-bba`, `chandigarh-online-bba`. Symbiosis-BBA in particular is the site's best BBA converter with the hub noindexed — no rankings possible for the hub.
- **3 hubs 404** on the natural path (`/universities/xlri-online/mba`, `/universities/imt-cdl/mba`, `/universities/dsu-online/mba`). Follow-up needed on whether the actual hub lives at a different slug.
- **5 hubs 308** without a target-follow: amity-hr, bits-pilani-online/mba, vignan-online/mba, jaypee-online/mba, amrita-online/bba. Redirect targets not resolved by this audit.

### Enquiry-form entry points on the blog page

38 of 39 blogs surface `BlogLeadForm` (the in-article Formspree form). The exception is `amity-online-mba-review-2026`, which suppresses `BlogLeadForm` in favour of the `UniversityVerdictTop + UniversityEndCta` bundle wired through `BLOG_CTA_BUNDLES`. That is the strongest funnel on the site and applies to exactly 2 pages currently (`amity-online-mba-review-2026` and `is-manipal-university-jaipur-fake-or-legit-2026`), per [lib/university-blog-cta.ts:194-197](lib/university-blog-cta.ts#L194).

### No cross-canonicals detected

Zero blog pages canonical-to a hub, zero hubs canonical-to a blog. Nothing to unwind on the canonical front.

---

## Phase 2 — what the audit proves is safe to ship

**Do not ship:**
- Any title rewrite on the top-5 (control group). Any speculative title rewrite on bottom-5 without CTR-window baseline to measure against.
- Any fee-number change. `lib/data.ts` and the Galgotias correction to ₹80,200 (commit `9a0a2bf`) are the only verified fee figures on file. Blog fee claims not cross-checked against `lib/data.ts` in this pass — flag-only.

**Safe mechanical fixes (no editorial judgement):**

1. **7 meta descriptions clamped to ≤160 chars**, with the fee number preserved in the first 120:
   - online-mba-lpu-review-2026 (194 → clamp; fee `₹1,46,240` sits at offset 53 ✓)
   - muj-online-bba-review-2026 (186 → clamp; `₹1,39,500` at offset 54 ✓)
   - upes-online-mba-review-2026 (180 → clamp; `₹1.75L` at offset 36 ✓)
   - bits-pilani-online-mba-review-2026 (178 → clamp; strip stale "Bits Pilani Online MBA 2026:" prefix, `₹2.97L` at offset 70 ✓)
   - noida-international-university-online-mba-review (168 → clamp; `Rs. 88,500` at offset 18 ✓)
   - jain-online-mba-review-2026 (163 → clamp; `₹1,96,000` at offset 32 ✓)
   - dsu-online-mba-review (161 → clamp; `Rs 1,30,000` at offset 20 ✓)

2. **Schema strip-regex extended in [app/blog/[slug]/page.tsx:236](app/blog/[slug]/page.tsx#L236)** to also match ` Online` followed by a trailing parenthetical, so Symbiosis's `about.Course.name` composes to `"Symbiosis (SSODL) Online MBA"` instead of `"Symbiosis Online (SSODL) Online MBA"`. Regex: `/\s+Online(\s*\([^)]*\))?\s*$/i`. Affects 1 of 39 today (Symbiosis MBA); pattern-safe for future entries that include a bracketed alias.

3. **No canonical fixes needed.** All 39 self-canonical cleanly.

**Not for Phase 2 but recorded for Phase 3 follow-up (needs Rishi's call on strategy):**

- Wire the 5 top-quartile blogs (UPES, XLRI, BITS, Arka Jain, Symbiosis-BBA) into [lib/internal-links.ts](lib/internal-links.ts) so BlogRelatedLinks renders. Precondition: their hubs must exist and be indexable. XLRI, BITS-Pilani, Symbiosis-BBA all have hub-health issues that must be resolved first.
- Populate the empty `blogs: []` arrays under `galgotias-university-online` and `dy-patil-university-online` in [lib/internal-links.ts:161,169](lib/internal-links.ts#L161) to wire their MBA review blogs bidirectionally.
- Consider whether the 8 BBA blogs deserve the same treatment (4 of the 8 hubs are currently noindexed via `shouldIndexProgrammeHub`, so `BlogRelatedLinks` would create dead-end links).

---
