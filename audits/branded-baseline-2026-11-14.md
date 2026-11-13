# Branded-query baseline, 2026-11-14

Read-only snapshot taken before sprint 1 (branch `feat/branded-sprint-1`), so later GSC reads can be compared against a fixed starting point.

## How this was measured

- Source: the production build of commit 7c60022 (= origin/main at the time), `.next/server/app/**/*.html`, 2331 prerendered pages. Routes rendered on demand (for example M.Com hubs) are not in that set, so a link that only exists on such a page is not counted.
- Title, H1, canonical and robots are read from the built HTML of each owner page.
- Word count: visible text of `<main>` (or `<body>`) after removing header, nav, footer, aside, forms, scripts, styles and SVG.
- An inbound link is counted once per linking page (distinct pages, not link instances). Self-links are excluded.
- **Body link**: the `<a>` sits inside a sentence, meaning its nearest `<p>`/`<li>` carries at least 40 characters of text besides the anchor, it is not inside a table, and it is not inside header, nav, footer, aside or a breadcrumb. On blog pages it must also be inside the `.prose-article` container, which holds `post.content`.
- **Box link**: everything else: nav, footer, breadcrumbs, related-links boxes (BlogRelatedLinks, UniversityEndCta, "Explore X on edifyedu.in"), cards, chips and table cells. A page with both a body and a box link counts as body only.
- Spot check: the NMIMS review links its hub three times, twice in comparison tables and once in the "Explore NMIMS" box, and the classifier puts it under box, which is correct.

## Owner pages

| Page | Title | H1 | Canonical | Robots | Words | Inbound body | Inbound box only | Any |
|---|---|---|---|---|---|---|---|---|
| /blog/nmims-online-mba-review-2026 | NMIMS Online MBA Fees 2026: ₹1,96,000–₹2,20,000 and Review | NMIMS Online MBA Fees 2026: ₹1,96,000–₹2,20,000, Specialisations and Our Review | self | index, follow | 3,086 | 13 | 11 | 24 |
| /universities/nmims-online/mba | NMIMS Online MBA: Specialisations, Eligibility and Admission | NMIMS Online MBA Admission 2026: Specialisations and Eligibility | self | index, follow | 3,986 | 4 | 21 | 25 |
| /blog/amity-online-mba-review-2026 | Amity Online MBA Fees 2026: ₹2,07,000–₹2,25,000 and Review | Amity University Online MBA Fees 2026: ₹2,07,000 One-Time or ₹2,25,000 Semester-Wise, Specialisations and Our Review | self | index, follow | 5,319 | 26 | 13 | 39 |
| /universities/amity-university-online/mba | Amity Online MBA: Specialisations, Eligibility and Admission | Amity University Online MBA Admission 2026: Specialisations and Eligibility | self | index, follow | 3,934 | 4 | 38 | 42 |
| /blog/muj-online-mba-review-2026 | MUJ Online MBA Fees 2026: ₹1,84,000 (₹1,56,400 After 15%) | Manipal University Jaipur (MUJ) Online MBA Fees 2026: ₹1,84,000 List, ₹1,56,400 After the 15% Discount, Specialisations and Our Review | self | index, follow | 2,752 | 16 | 7 | 23 |
| /universities/manipal-university-jaipur-online/mba | MUJ Online MBA: Specialisations, Eligibility and Admission | Manipal University Jaipur (MUJ) Online MBA Admission 2026: Specialisations and Eligibility | self | index, follow | 3,744 | 0 | 30 | 30 |
| /blog/smu-online-mba-review | SMU Online MBA Fees 2026: ₹1,20,000 and Review | Sikkim Manipal University (SMU) Online MBA Fees 2026: ₹1,20,000, Specialisations and Our Review | self | index, follow | 2,633 | 10 | 9 | 19 |
| /universities/sikkim-manipal-university-online/mba | Sikkim Manipal Online MBA: Specialisations and Admission | Sikkim Manipal University Online MBA Admission 2026: Specialisations and Eligibility | self | index, follow | 3,362 | 0 | 18 | 18 |
| /blog/symbiosis-online-mba-review-2026 | Symbiosis Online MBA Fees 2026: ₹3,70,000 and Review | Symbiosis (SSODL) Online MBA Fees 2026: ₹3,70,000, or ₹3,15,000 With the Work-Experience Scholarship | self | index, follow | 3,250 | 10 | 9 | 19 |
| /universities/symbiosis-university-online/mba | Symbiosis Online MBA: Specialisations and Admission | Symbiosis School for Online and Digital Learning (SSODL), Pune Online MBA Admission 2026: Specialisations and Eligibility | self | index, follow | 4,034 | 4 | 26 | 30 |

## Sibling links between owners

| University | Hub links review in body | Review links hub in body |
|---|---|---|
| NMIMS | yes | no (table or box only) |
| Amity | yes | yes |
| MUJ | yes | no (table or box only) |
| SMU | yes | no (table or box only) |
| Symbiosis | yes | yes |

## Linking pages

### /blog/nmims-online-mba-review-2026

Body (13): `/blog/amity-online-mba-review-2026`, `/blog/how-to-choose-online-mba-university-india-2026`, `/blog/is-nmims-online-fake-or-legit-2026`, `/blog/nmims-online-admission-guide`, `/blog/symbiosis-online-mba-review-2026`, `/universities/nmims-online/mba`, `/universities/nmims-online/mba/business-analytics`, `/universities/nmims-online/mba/business-management`, `/universities/nmims-online/mba/finance`, `/universities/nmims-online/mba/hr-management`, `/universities/nmims-online/mba/information-technology-management`, `/universities/nmims-online/mba/marketing`, `/universities/nmims-online/mba/operations-and-data-sciences-management`

Box only (11): `/blog/best-online-mba-colleges-india-2026`, `/blog/distance-mba-colleges-mumbai-2026`, `/blog/is-nmims-government-or-private`, `/blog/nmims-online-bba-review-2026`, `/blog/nmims-vs-symbiosis-online-mba-2026`, `/blog/online-mba-pune-university-2026`, `/blog/online-mba-with-placement-india-2026`, `/blog/page/7`, `/blog/what-is-nmims-cdoe`, `/blog/xlri-online-mba-review-2026`, `/coupons/nmims-online-mba-discount-coupon-2026`

### /universities/nmims-online/mba

Body (4): `/blog/career-after-bcom-jobs-salary-courses-2026`, `/blog/career-after-mba-jobs-salary-scope-2026`, `/blog/is-nmims-online-fake-or-legit-2026`, `/blog/noida-international-university-online-mba-review`

Box only (21): `/blog/amity-online-mba-review-2026`, `/blog/bharati-vidyapeeth-online-mba-review`, `/blog/iim-online-mba-india-2026`, `/blog/is-nmims-government-or-private`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`, `/blog/nmims-online-admission-guide`, `/blog/nmims-online-mba-review-2026`, `/blog/online-manipal-mba-review-2026`, `/blog/smu-online-mba-review`, `/blog/symbiosis-online-mba-review-2026`, `/blog/what-is-nmims-cdoe`, `/universities/nmims-online`, `/universities/nmims-online/bba`, `/universities/nmims-online/mba/business-analytics`, `/universities/nmims-online/mba/business-management`, `/universities/nmims-online/mba/finance`, `/universities/nmims-online/mba/hr-management`, `/universities/nmims-online/mba/information-technology-management`, `/universities/nmims-online/mba/marketing`, `/universities/nmims-online/mba/operations-and-data-sciences-management`

### /blog/amity-online-mba-review-2026

Body (26): `/blog/amity-online-admission-guide`, `/blog/amity-online-mba-hr-worth-it`, `/blog/amity-online-student-portal-login`, `/blog/distance-mba-meaning-what-is-it-2026`, `/blog/online-mba-delhi-ncr-2026`, `/blog/symbiosis-online-mba-review-2026`, `/universities/amity-university-online/mba`, `/universities/amity-university-online/mba/business-analytics`, `/universities/amity-university-online/mba/data-science`, `/universities/amity-university-online/mba/digital-entrepreneurship`, `/universities/amity-university-online/mba/digital-marketing`, `/universities/amity-university-online/mba/entrepreneurship-and-leadership-management`, `/universities/amity-university-online/mba/finance-and-accounting-management`, `/universities/amity-university-online/mba/general-management`, `/universities/amity-university-online/mba/global-finance-market`, `/universities/amity-university-online/mba/healthcare-management`, `/universities/amity-university-online/mba/hospitality-management`, `/universities/amity-university-online/mba/hr-management`, `/universities/amity-university-online/mba/human-resource-analytics`, `/universities/amity-university-online/mba/information-technology-management`, `/universities/amity-university-online/mba/insurance-management`, `/universities/amity-university-online/mba/international-business`, `/universities/amity-university-online/mba/international-finance-acca`, `/universities/amity-university-online/mba/marketing-sales-management`, `/universities/amity-university-online/mba/production-and-operations-management`, `/universities/amity-university-online/mba/retail`

Box only (13): `/blog/amity-online-bba-review-2026`, `/blog/amity-vs-manipal-online-mba-2026`, `/blog/best-online-mba-colleges-india-2026`, `/blog/distance-mba-kerala-programs-2026`, `/blog/icfai-distance-mba-2026`, `/blog/icfai-online-mba-fees-2026`, `/blog/is-amity-university-online-fake-or-legit-2026`, `/blog/jain-vs-amity-online-mba-2026`, `/blog/jamia-hamdard-mba-2026`, `/blog/muj-online-bba-review-2026`, `/blog/online-mba-for-working-professionals-india`, `/blog/page/7`, `/coupons/amity-online-mba-discount-coupon-2026`

### /universities/amity-university-online/mba

Body (4): `/blog/amity-online-mba-review-2026`, `/blog/career-after-bcom-jobs-salary-courses-2026`, `/blog/is-amity-university-online-fake-or-legit-2026`, `/blog/noida-international-university-online-mba-review`

Box only (38): `/blog/amity-online-mba-hr-worth-it`, `/blog/bharati-vidyapeeth-online-mba-review`, `/blog/career-after-mba-jobs-salary-scope-2026`, `/blog/iim-online-mba-india-2026`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`, `/blog/nmims-online-mba-review-2026`, `/blog/online-manipal-mba-review-2026`, `/blog/smu-online-mba-review`, `/blog/symbiosis-online-mba-review-2026`, `/programs/mba/specializations/business-analytics`, `/programs/mba/specializations/healthcare-management`, `/programs/mba/specializations/hospitality-management`, `/programs/mba/specializations/hr-management`, `/universities/amity-university-online`, `/universities/amity-university-online/bba`, `/universities/amity-university-online/bca`, `/universities/amity-university-online/mba/business-analytics`, `/universities/amity-university-online/mba/data-science`, `/universities/amity-university-online/mba/digital-entrepreneurship`, `/universities/amity-university-online/mba/digital-marketing`, `/universities/amity-university-online/mba/entrepreneurship-and-leadership-management`, `/universities/amity-university-online/mba/finance-and-accounting-management`, `/universities/amity-university-online/mba/general-management`, `/universities/amity-university-online/mba/global-finance-market`, `/universities/amity-university-online/mba/healthcare-management`, `/universities/amity-university-online/mba/hospitality-management`, `/universities/amity-university-online/mba/hr-management`, `/universities/amity-university-online/mba/human-resource-analytics`, `/universities/amity-university-online/mba/information-technology-management`, `/universities/amity-university-online/mba/insurance-management`, `/universities/amity-university-online/mba/international-business`, `/universities/amity-university-online/mba/international-finance-acca`, `/universities/amity-university-online/mba/marketing-sales-management`, `/universities/amity-university-online/mba/production-and-operations-management`, `/universities/amity-university-online/mba/retail`, `/universities/amity-university-online/mca`, `/verify/amity-university-online`

### /blog/muj-online-mba-review-2026

Body (16): `/blog/amity-online-mba-review-2026`, `/universities/manipal-university-jaipur-online/mba`, `/universities/manipal-university-jaipur-online/mba/ai-for-business`, `/universities/manipal-university-jaipur-online/mba/analytics-and-data-science`, `/universities/manipal-university-jaipur-online/mba/bfsi-banking-financial-services-and-insurance`, `/universities/manipal-university-jaipur-online/mba/digital-marketing`, `/universities/manipal-university-jaipur-online/mba/finance`, `/universities/manipal-university-jaipur-online/mba/hr-management`, `/universities/manipal-university-jaipur-online/mba/information-system-management`, `/universities/manipal-university-jaipur-online/mba/international-business`, `/universities/manipal-university-jaipur-online/mba/it-fintech`, `/universities/manipal-university-jaipur-online/mba/marketing`, `/universities/manipal-university-jaipur-online/mba/operations`, `/universities/manipal-university-jaipur-online/mba/project-management`, `/universities/manipal-university-jaipur-online/mba/retail`, `/universities/manipal-university-jaipur-online/mba/supply-chain-management`

Box only (7): `/blog/amity-vs-manipal-online-mba-2026`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-bba-review-2026`, `/blog/online-manipal-mba-review-2026`, `/blog/page/11`, `/blog/smu-online-mba-review`, `/coupons/manipal-jaipur-online-mba-discount-coupon-2026`

### /universities/manipal-university-jaipur-online/mba

Body (0): none

Box only (30): `/blog/amity-online-mba-review-2026`, `/blog/bharati-vidyapeeth-online-mba-review`, `/blog/is-manipal-university-jaipur-fake-or-legit-2026`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`, `/blog/nmims-online-mba-review-2026`, `/blog/online-degree-scholarships-india`, `/blog/online-manipal-mba-review-2026`, `/blog/smu-online-mba-review`, `/blog/symbiosis-online-mba-review-2026`, `/programs/mba/specializations/fintech`, `/programs/mba/specializations/supply-chain-management`, `/universities/manipal-university-jaipur-online`, `/universities/manipal-university-jaipur-online/bba`, `/universities/manipal-university-jaipur-online/bca`, `/universities/manipal-university-jaipur-online/mba/ai-for-business`, `/universities/manipal-university-jaipur-online/mba/analytics-and-data-science`, `/universities/manipal-university-jaipur-online/mba/bfsi-banking-financial-services-and-insurance`, `/universities/manipal-university-jaipur-online/mba/digital-marketing`, `/universities/manipal-university-jaipur-online/mba/finance`, `/universities/manipal-university-jaipur-online/mba/hr-management`, `/universities/manipal-university-jaipur-online/mba/information-system-management`, `/universities/manipal-university-jaipur-online/mba/international-business`, `/universities/manipal-university-jaipur-online/mba/it-fintech`, `/universities/manipal-university-jaipur-online/mba/marketing`, `/universities/manipal-university-jaipur-online/mba/operations`, `/universities/manipal-university-jaipur-online/mba/project-management`, `/universities/manipal-university-jaipur-online/mba/retail`, `/universities/manipal-university-jaipur-online/mba/supply-chain-management`, `/universities/manipal-university-jaipur-online/mca`

### /blog/smu-online-mba-review

Body (10): `/blog/galgotias-online-mba-review`, `/blog/online-mba-northeast-india-2026`, `/blog/uu-doon-online-mba-review`, `/universities/sikkim-manipal-university-online/mba`, `/universities/sikkim-manipal-university-online/mba/finance`, `/universities/sikkim-manipal-university-online/mba/healthcare`, `/universities/sikkim-manipal-university-online/mba/human-resources`, `/universities/sikkim-manipal-university-online/mba/marketing`, `/universities/sikkim-manipal-university-online/mba/operations-supply-chain-management`, `/universities/sikkim-manipal-university-online/mba/systems-it-management`

Box only (9): `/blog/arka-jain-online-mba-review`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`, `/blog/noida-international-university-online-mba-review`, `/blog/online-manipal-mba-review-2026`, `/blog/online-mba-real-estate-management-india-2026`, `/blog/page/7`, `/blog/shoolini-online-mba-review`, `/coupons/smu-online-mba-discount-coupon-2026`

### /universities/sikkim-manipal-university-online/mba

Body (0): none

Box only (18): `/blog/amity-online-mba-review-2026`, `/blog/bharati-vidyapeeth-online-mba-review`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`, `/blog/nmims-online-mba-review-2026`, `/blog/online-manipal-mba-review-2026`, `/blog/smu-online-mba-review`, `/blog/symbiosis-online-mba-review-2026`, `/universities/sikkim-manipal-university-online`, `/universities/sikkim-manipal-university-online/bba`, `/universities/sikkim-manipal-university-online/mba/finance`, `/universities/sikkim-manipal-university-online/mba/healthcare`, `/universities/sikkim-manipal-university-online/mba/human-resources`, `/universities/sikkim-manipal-university-online/mba/marketing`, `/universities/sikkim-manipal-university-online/mba/operations-supply-chain-management`, `/universities/sikkim-manipal-university-online/mba/systems-it-management`, `/universities/sikkim-manipal-university-online/mca`, `/verify/sikkim-manipal-university-online`

### /blog/symbiosis-online-mba-review-2026

Body (10): `/universities/symbiosis-university-online/mba`, `/universities/symbiosis-university-online/mba/agri-operations-management`, `/universities/symbiosis-university-online/mba/business-analytics`, `/universities/symbiosis-university-online/mba/finance`, `/universities/symbiosis-university-online/mba/hospital-and-health-care-management`, `/universities/symbiosis-university-online/mba/hr-management`, `/universities/symbiosis-university-online/mba/international-business`, `/universities/symbiosis-university-online/mba/logistics-and-supply-chain-management`, `/universities/symbiosis-university-online/mba/marketing`, `/universities/symbiosis-university-online/mba/operations`

Box only (9): `/blog/amity-online-mba-review-2026`, `/blog/best-online-mba-colleges-india-2026`, `/blog/distance-mba-meaning-what-is-it-2026`, `/blog/nmims-vs-symbiosis-online-mba-2026`, `/blog/online-mba-pune-university-2026`, `/blog/online-mba-with-placement-india-2026`, `/blog/page/11`, `/blog/symbiosis-online-bba-review-2026`, `/coupons/symbiosis-ssodl-online-mba-discount-coupon-2026`

### /universities/symbiosis-university-online/mba

Body (4): `/blog/career-after-bcom-jobs-salary-courses-2026`, `/blog/career-after-mba-jobs-salary-scope-2026`, `/blog/online-mba-maharashtra-2026`, `/blog/symbiosis-online-mba-review-2026`

Box only (26): `/blog/amity-online-mba-review-2026`, `/blog/best-online-mba-colleges-india-2026`, `/blog/bharati-vidyapeeth-online-mba-review`, `/blog/iim-online-mba-india-2026`, `/blog/mahe-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`, `/blog/nmims-online-mba-review-2026`, `/blog/online-manipal-mba-review-2026`, `/blog/online-mba-pune-university-2026`, `/blog/smu-online-mba-review`, `/programs/mba/specializations/business-analytics`, `/programs/mba/specializations/healthcare-management`, `/programs/mba/specializations/hr-management`, `/programs/mba/specializations/supply-chain-management`, `/universities/symbiosis-university-online`, `/universities/symbiosis-university-online/bba`, `/universities/symbiosis-university-online/bca`, `/universities/symbiosis-university-online/mba/agri-operations-management`, `/universities/symbiosis-university-online/mba/business-analytics`, `/universities/symbiosis-university-online/mba/finance`, `/universities/symbiosis-university-online/mba/hospital-and-health-care-management`, `/universities/symbiosis-university-online/mba/hr-management`, `/universities/symbiosis-university-online/mba/international-business`, `/universities/symbiosis-university-online/mba/logistics-and-supply-chain-management`, `/universities/symbiosis-university-online/mba/marketing`, `/universities/symbiosis-university-online/mba/operations`

