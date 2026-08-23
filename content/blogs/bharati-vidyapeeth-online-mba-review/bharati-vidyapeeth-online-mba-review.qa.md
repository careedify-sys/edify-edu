# Quality Assurance Checklist

**Blog**: Bharati Vidyapeeth Online MBA Review
**Generated**: 2026-08-23
**Slug**: bharati-vidyapeeth-online-mba-review

Checks 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 19, 20 were run programmatically against the built HTML. Checks 1, 5, 13, 16, 18 were reviewed manually.

## Hard-Gate Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Hallucinations / unverified confident claims | **PASS** | Every fee, rank and approval traces to the official programme page or the Supabase accreditation tables. The absence of a placement claim is reported as an absence, not filled in. |
| 2 | Em dash count | **PASS** | 0 found |
| 3 | AI-filler words | **PASS** | 0 of 14 blacklisted terms |
| 4 | AI sentence-starters | **PASS** | None |
| 5 | Unverified stats | **PASS** | No salary figures, no placement percentages, no invented statistics. The one engagement claim about the Sports page is stated qualitatively ("more engagement per view than any other Bharati page we publish") rather than as a number. |
| 6 | Competitor links | **PASS** | 0 blacklist hits. The Rs 1,60,000 figure is attributed to unnamed "third-party listing pages" with no links. |
| 7 | Duplicate internal links | **PASS** | 9 links, all distinct |
| 8 | Meta description length | **PASS** | 156 chars |
| 9 | Meta title length | **PASS** | 58 chars |
| 10 | PAS intro length | **PASS** | 71 words |
| 11 | H1 in body | **PASS** | Body opens at h2 |
| 12 | Fees flagged indicative | **PASS** | `.callout-warning` states fees are indicative and links to the portal |
| 13 | Active voice | **PASS** | Fee, eligibility and Final Word sections reviewed |
| 14 | Short paragraphs | **PASS** | 0 paragraphs over 4 sentences |
| 15 | Author name | **PASS** | Rishi Kumar |
| 16 | FAQs format | **PASS** | 8 items, q/a keys only, plain text |
| 17 | SVG accessibility | **PASS** | 4 SVGs, all with `role="img"` and `aria-label` |
| 18 | Unique angles count | **PASS** | 5 angles |
| 19 | Internal links count | **PASS** | 9 unique |
| 20 | External sources count | **PASS** | 4 primary |

**Word count**: 1,618

---

## Evidence Log

### Fee Verification

- **Portal source**: https://bharatividyapeethonline.com/courses/mba/
- **Portal figure**: Rs 1,76,000, described as tuition plus exam fees. Plus Rs 1,000 registration and Rs 1,000 admission, both non-refundable. Backlog exams Rs 400 per subject.
- **All-in**: Rs 1,78,000
- **Prior site value**: Rs 1.6L in `lib/data.ts`, understating by Rs 16,000
- **Discrepancy present**: **Yes**, and it is the lead angle
- **Resolution**: Corrected `lib/data.ts` to Rs 1,76,000 in commit `ae8fdcd`, and updated three existing blogs that quoted the old figure. The Rs 1,60,000 spread is published in this blog as a comparison chart with no outbound links.

The university's own fee-structure page publishes figures only as images, so BBA, BCA and MCA totals could not be read by fetching. Those were confirmed separately by the founder: BBA Rs 1,29,000, BCA Rs 1,29,000, MCA Rs 1,46,000.

### Unique Angles Used

1. **The real cost is Rs 1,78,000, not the Rs 1,60,000 everyone quotes.** Two non-refundable charges sit on top of a headline fee that is itself Rs 16,000 higher than the circulating figure.
2. **The approval stack is genuinely rare at this price.** UGC-DEB plus AICTE listing plus NBA accreditation. Most competitors in this band have UGC-DEB only. This is the strongest reason to choose the programme.
3. **NIRF University 59 but no Management rank.** Same category discipline applied as in the Parul review, but here the university genuinely holds a University rank, so the framing is "use it for what it is" rather than "there is nothing".
4. **Fourth-cycle NAAC A++ is a different signal from first-cycle A++.** Four assessments, top grade held. Rarely explained anywhere.
5. **Sports Management and the niche seven.** Very few Indian universities offer Sports Management as an online MBA track. Hospitality, Agribusiness, Event and Infrastructure sit in the same bracket.

### Internal Links Audit

| URL | Link Text | Section |
|---|---|---|
| /blog/naac-accreditation-explained-grades-india-2026 | explainer on NAAC grades | NIRF rank |
| /universities/bharati-vidyapeeth-university-online/mba/sports | Bharati Vidyapeeth Sports Management page | Specialisations |
| /verify/bharati-vidyapeeth-online | Bharati Vidyapeeth verification page | Eligibility |
| /compare | Compare online MBA programmes | Mid-post CTA |
| /tools/emi-calculator | Work out the monthly cost | Mid-post CTA |
| /blog/parul-online-mba-review | Parul University online MBA review | Skip it if standard |
| /universities/bharati-vidyapeeth-university-online/mba | full Bharati Vidyapeeth MBA breakdown | Final Word |
| /universities/bharati-vidyapeeth-university-online/mca | online MCA page | Final Word |
| /contact | Request a free counselling call | End CTA |

9 links, no duplicates. All targets verified present in `valid-urls.json`, the verify slug list, the blog index or as an app route before writing.

### External Sources Audit

| Source | URL | Type |
|---|---|---|
| Bharati Vidyapeeth Online MBA programme page | https://bharatividyapeethonline.com/courses/mba/ | Official portal |
| UGC-DEB approved institutions | https://deb.ugc.ac.in | UGC-DEB |
| NAAC accreditation database | https://naac.gov.in | NAAC |
| NIRF India Rankings | https://nirfindia.org | NIRF |

---

## Template Deviations

Same two as the Parul review, for the same reason. The official page publishes no semester-wise syllabus and states no scholarship categories, so those sections are omitted rather than invented. The fourth SVG slot carries a credentials-by-category chart instead of a syllabus timeline.

No `.cms.xlsx` generated, per the `CLAUDE.md` rule that the CMS is not in use.

---

## Overall Status

**[x] PASS**. 20 of 20 hard-gate checks passed.

Published with `status: 'published'` in `lib/blog.ts`, with a
`bharati-vidyapeeth-university-online` entry added to `UNIVERSITY_PROGRAM_LINKS`
so `BlogRelatedLinks` renders and the post feeds authority back to the hub.
