# Quality Assurance Checklist

**Blog**: Parul University Online MBA Review
**Generated**: 2026-08-23
**Slug**: parul-online-mba-review

Checks 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 19, 20 were run programmatically against the built HTML, not eyeballed. Checks 1, 5, 13, 16, 18 were reviewed manually.

## Hard-Gate Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Hallucinations / unverified confident claims | **PASS** | Every fee, rank and approval traces to the official portal or the Supabase accreditation tables. Portal claims (700+ hiring partners, 100% placement assistance) are attributed to the portal, not asserted as fact. |
| 2 | Em dash count | **PASS** | 0 found |
| 3 | AI-filler words | **PASS** | 0 of 14 blacklisted terms |
| 4 | AI sentence-starters | **PASS** | No Furthermore / Moreover / Additionally / In conclusion |
| 5 | Unverified stats | **PASS** | No salary figures, no placement percentages and no invented statistics appear. The absence of that data is itself called out in the "Falls Short" section. |
| 6 | Competitor links | **PASS** | 0 blacklist hits. Third-party fee figures are cited as unnamed "Third-party A to D" with no links. |
| 7 | Duplicate internal links | **PASS** | 10 links, all distinct |
| 8 | Meta description length | **PASS** | 153 chars |
| 9 | Meta title length | **PASS** | 57 chars |
| 10 | PAS intro length | **PASS** | 80 words (cap is 80) |
| 11 | H1 in body | **PASS** | No h1 tag. Body opens at h2. |
| 12 | Fees flagged indicative | **PASS** | `.callout-warning` states fees are indicative and links to the portal for verification |
| 13 | Active voice | **PASS** | Fee, eligibility and Final Word sections reviewed line by line |
| 14 | Short paragraphs | **PASS** | 0 paragraphs over 4 sentences |
| 15 | Author name | **PASS** | Rishi Kumar |
| 16 | FAQs format | **PASS** | 8 items, q/a keys only, plain text values, no Markdown |
| 17 | SVG accessibility | **PASS** | 4 SVGs, all with `role="img"` and `aria-label` |
| 18 | Unique angles count | **PASS** | 5 angles, all absent from the SERP competitors reviewed |
| 19 | Internal links count | **PASS** | 10 unique (range is 5 to 10) |
| 20 | External sources count | **PASS** | 4 primary (range is 3 to 5) |

**Word count**: 1,955 (target 2,000)

---

## Evidence Log

### Research Phase

SERP reviewed for "Parul University online MBA review 2026" and "Parul University online MBA fees", blacklisted domains excluded from the search.

**Gaps identified in competitor coverage:**

1. **Every competitor fee figure disagrees with the official portal.** Totals found in circulation: Rs 99,000, Rs 1,00,000, Rs 90,000 (as a "Limited Period Offer"), Rs 80,000 (one-time), and Rs 25,000 per semester. The official portal states Rs 1,50,000 total and Rs 37,500 per semester. Not one competitor page carried the portal figure.
2. **NIRF claims are published without a category.** Competitors write "NIRF ranked" next to MBA content. Parul's only verified NIRF entry is Pharmacy #41, and the portal separately claims Top 50 Innovation 2023. Neither is a Management rank.
3. **At least one competitor asserts AICTE approval.** The official page does not mention AICTE, and our records show `aicte_listed: false` on all ten Parul online programmes.
4. **Nobody connects the Pharmacy rank to the Pharmaceutical Management specialisation.** This is the one place Parul has genuine institutional substance behind a specialisation label.
5. **Nobody flags the missing disclosures.** No application fee, no EMI terms, no scholarship rules and no online-cohort placement data are published anywhere official.

### Fee Verification

- **Portal source**: https://paruluniversity.online/postgraduate/online-mba-program/
- **Portal fee**: INR 1,50,000 total. Cross-checked against the portal index page, which lists INR 37,500 per semester. 37,500 x 4 semesters = 1,50,000, so the two official pages agree.
- **Existing site data**: `lib/data.ts` carries INR 1,50,000 for Parul MBA, which matches the portal exactly.
- **Discrepancy present**: **No** for MBA. Third-party figures conflict, but no official source does.
- **Resolution**: Used the portal figure. The third-party spread is published in the blog as a comparison chart with no outbound links, since the discrepancy is itself the story.

> **Out of scope but recorded**: while verifying MBA, the portal revealed fee errors in `lib/data.ts` for other Parul programmes. MCA is stored as "Rs 30K" when Rs 30,000 is the per-semester figure and the real total is Rs 1,20,000. BA is stored as Rs 60K to Rs 70K when the portal implies Rs 1,11,000. B.Com appears in neither the portal nor Supabase yet has a live page. The user chose not to change fee data in this pass. Details are in the input file under `_sibling_programme_fees_verified`.

### Unique Angles Used

1. **The fee figures in circulation are all wrong.** Four different third-party totals, none matching the portal. Rendered as a comparison chart.
2. **The NIRF category trap.** Pharmacy #41 and Innovation Top 50 are both real; neither is Management. Parul holds no Management rank at all.
3. **Pharmaceutical Management has real institutional backing.** The NIRF Pharmacy rank means the subject department has independently measured standing, which is rare for a pharma MBA specialisation. Hedged appropriately: a strong pharmacy faculty does not automatically mean a strong pharma MBA curriculum.
4. **The circulating AICTE claim is unsupported.** Not on the official page, not in our records.
5. **Forensic Accounting and Corporate Fraud Investigation is genuinely rare** in Indian online MBA catalogues.

### Internal Links Audit

| URL | Link Text | Section |
|---|---|---|
| /blog/naac-accreditation-explained-grades-india-2026 | guide to NAAC grades and what they actually measure | NIRF category trap |
| /universities/parul-university-online/mba/pharmaceutical-management | MBA in Pharmaceutical Management | Pharma edge |
| /verify/parul-university-online | Parul verification page | Eligibility and approvals |
| /compare | Compare online MBA programmes | Mid-post CTA |
| /tools/emi-calculator | Work out the EMI on Rs 1,50,000 | Mid-post CTA |
| /guides/is-online-degree-valid-india | guide on whether an online degree is valid in India | Skip it if buying signalling |
| /universities/parul-university-online/mba | full Parul online MBA breakdown | Final Word |
| /universities/parul-university-online/mca | Parul online MCA page | Final Word |
| /contact | Request a free counselling call | End CTA |
| /blog/ugc-deb-approved-universities-list-2026 | UGC-DEB approved universities list | Disclaimer |

10 links, no duplicates. Every target was verified live: all return 200, and the two `/universities/parul-university-online/mba*` targets are present in the production sitemap with `index, follow`.

> Note: `/universities/parul-university-online/mba` and its pharmaceutical-management spec page are **absent from the committed `valid-urls.json`** because the normalize pass over-prunes. They are live, indexable and in the production sitemap. See section 5a of `audits/seo-internal-links-session-2026-08-23.md`. Do not "fix" these links on the basis of the committed file.

### External Sources Audit

| Source | URL | Type |
|---|---|---|
| Parul University Online MBA programme page | https://paruluniversity.online/postgraduate/online-mba-program/ | Official portal |
| UGC-DEB approved institutions | https://deb.ugc.ac.in | UGC-DEB |
| NAAC accreditation database | https://naac.gov.in | NAAC |
| NIRF India Rankings | https://nirfindia.org | NIRF |

4 primary sources. No competitors, no aggregators.

---

## Template Deviations

Two deliberate departures from `.claude/templates/blog-structure.md`, both to avoid fabricating content:

1. **Syllabus section and syllabus timeline SVG omitted.** The official portal publishes no semester-wise syllabus for the online MBA. Writing one would mean inventing course content. The required fourth SVG slot is filled instead by a credentials-by-category chart, which is fully data-backed and carries the review's central argument.
2. **Scholarships section omitted.** The portal states no scholarship categories. The absence is called out in "Falls Short" rather than filled with guesses.

Also skipped per the input file: campus immersion and foundation courses, neither of which the portal offers for online students.

A `.cms.xlsx` was **not** generated. `CLAUDE.md` states the CMS is not in use, and that instruction overrides step 9 of the command. The existing `content/blogs/smu-online-mba-review/` folder follows the same `.body.html` plus `.meta.json` convention used here.

---

## Overall Status

**[x] PASS**. 20 of 20 hard-gate checks passed.

**Shipping note**: `status` is set to `draft` in the meta file, not `published`. Fee pages change per intake cycle, so a human should re-confirm the Rs 1,50,000 figure on the live portal before this goes live. To publish, add the post object to `lib/blog.ts` with `status: 'published'` and add a `parul-university-online` entry to `UNIVERSITY_PROGRAM_LINKS` in `lib/internal-links.ts` so `BlogRelatedLinks` renders and the blog passes authority back to the hub.
