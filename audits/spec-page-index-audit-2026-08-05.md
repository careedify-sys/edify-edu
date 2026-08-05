# Spec-Page Index Audit — 2026-08-05

Report only. No code changes. Written to support the spec-page policy decision
after the 18 August GSC read. Sprint 3 Task 1 (hub-page thin gate) is a
separate change that does not touch spec-page metadata.

## 1. Counts

Source: `lib/data/valid-urls.json` (regenerated from `data/EdifyEdu_Unified_Programs_v3.xlsx`)
plus `lib/data/page-content/*.json` (348 files: 49 hub JSONs + 299 spec JSONs).

| Metric | Count |
|---|---|
| Total spec URLs in `valid-urls.json` (4-segment `/universities/{u}/{p}/{s}`) | **2,180** |
| Specs WITH a page-content JSON | 299 |
| Specs WITHOUT a page-content JSON | **1,881** |

Breakdown of no-JSON specs by programme:

| Programme | No-JSON specs |
|---|---:|
| MBA | 510 |
| BBA | 278 |
| MCA | 251 |
| MA | 227 |
| BCA | 194 |
| M.Com | 144 |
| B.Com | 143 |
| BA | 107 |
| MSc | 24 |
| BSc | 3 |

## 2. What a no-JSON spec page actually renders

The template lives in `components/UniSpecBody.tsx`. When
`getSpecPageContent(uni, program, spec)` returns `null` the file switches into
the "generic path" branch (`UniSpecBody.tsx` line 604). This branch is not an
empty template. It renders the following sections, all sourced from `data.ts`
fields plus a small number of generic content registries:

| Section | Component | Data source |
|---|---|---|
| ApprovalBadges row | `ApprovalBadges` | `u.approvals`, `u.naac`, `u.nirf`, `u.nirfMgt`, `u.nirfEng`, `u.highlight` |
| About + programme overview | `SectionAbout` | `u.description`, `pd` (per-programme data.ts entry), generic spec copy from `lib/content.ts` |
| Who can apply | `SectionWhoCanApply` | `u.eligibility`, `u.eligibilityPct`, `u.forWho`, `u.notFor` |
| Classes / delivery | `SectionClasses` | `u.examMode`, generic class-mode copy |
| Exams | `SectionExams` | `pd.duration`, generic exam-format copy |
| Curriculum overview | `CurriculumDive` | Static generic block |
| Syllabus (when authored) OR "Request syllabus" card | `SectionSyllabus` / `RequestSyllabusCard` | `lib/syllabus.ts` keyed on `u.id + program` |
| Fee breakdown | `FeeBreakdown` | `u.feeMin`, `u.feeMax`, `pd.fees`, `u.emiFrom`, `u.programFees[program]` |
| EMI plans | `EMIPlans` | `u.emiFrom`, `pd.fees` |
| Sample certificate | `SampleCertificate` | `u.id`, `u.name` |
| Admission steps | `AdmissionSteps` | Static generic block |
| Placements | `SectionPlacements` | `pd.roles`, `pd.avgSalary`, `pd.topCompanies`, `pd.careerOutcome`, `pd.internshipType` |
| Beyond admission | `BeyondAdmissionSection` | Static generic block |
| Top hirers | `TopHirers` | `pd.topCompanies` |
| Reviews | `ReviewsBlock` | `lib/reviews-data.ts` keyed on `u.id + program` |
| Red flags | `RedFlagsBlock` | `u.naac`, `u.nirf`, `u.approvals`, `u.programs`, generic red-flag rules |
| Comparison table | `ComparisonTable` | `getUniversitiesByProgram(program)` (peers with the same programme) |
| Honest verdict | `HonestVerdict` | `u.naac`, `u.nirf`, `u.feeMin`, `u.feeMax`, generic verdict rules |
| FAQ | `FAQBlock` | `lib/specFaqs.ts` keyed on `program + spec` |
| Sticky lead card | `StickyLeadCard` | `u.id`, `u.name`, formspree endpoint |
| Coupon | `CouponCard` | `lib/coupons.ts` keyed on `u.id + program` |
| Quick facts | `QuickFactsCard` | `u.naac`, `u.nirf`, `u.feeMin`, `pd.duration` |

The generic-path page is not blank. It carries: real accreditation badges,
university description, eligibility, fee breakdown, EMI, placement roles /
salary band / top hirers, comparison peers, and lead capture. What it lacks
relative to a JSON-authored page is: the TL;DR, the specialisation-specific
"about" body, the specialisation-specific hiring / skills / comparisons /
verdict copy, and the specialisation-specific FAQ.

## 3. Full sample page — no-JSON generic-path rendering

**URL:** `/universities/aligarh-muslim-university-online/ba/economics`

Data pulled from `lib/data.ts` (line 3142 onward):

| Field | Value |
|---|---|
| University name | Aligarh Muslim University Online |
| City / state | Aligarh, Uttar Pradesh |
| NAAC | A+ |
| NIRF | #10 (University 2025) |
| Approvals | UGC DEB, NAAC A+, NIRF #10 (University 2025) |
| Eligibility | Graduation with 50% marks from recognized university |
| eligibilityPct | 50 |
| Programme (BA) fees | ₹28,000 – ₹28,000 |
| Duration | 3 Years |
| Roles | Management Trainee, Business Analyst, Operations Executive |
| avgSalary | ₹4L – ₹12L per annum |
| topCompanies | TCS, Infosys, Wipro, HDFC Bank |
| internshipType | Industry project and virtual internship |
| careerOutcome | "UGC DEB approved BA from Aligarh Muslim University – recognised for corporate hiring." |

The generic-path page therefore renders a full accreditation badge row
(NAAC A+, NIRF #10, UGC DEB), an eligibility block, a fee breakdown
(₹28,000 fixed), an EMI plan derived from that fee, roles / salary /
top hirers, plus the generic curriculum, admission-steps, and FAQ
blocks. It is not blank. It is a page whose distinguishing content
is the accreditation badges and the fee row; everything else is
generic-per-programme.

The specialisation-specific bits ("Economics" versus "Political
Science" versus "History") come only from `lib/content.ts` and
`lib/specFaqs.ts`, which are keyed on the spec slug, not on the
uni + spec pair. So the four Aligarh Muslim BA specialisation pages
today differ from each other only in title, meta, and a couple of
copy paragraphs; everything else is the same across the four.

## 4. Sitemap declaration

`app/sitemap.ts` (line 129, header comment):
`0.70 /universities/{slug}/{prog}/{spec} (all ~2,123 spec pages — now index,follow)`

The file's filter block (`app/sitemap.ts` line 131) explicitly INCLUDES every
`/universities/{u}/{p}/{s}` path from `valid-urls.json`, including all 1,881
no-JSON ones. It only strips MBA spec slugs that are redirect sources and MBA
spec pages for the two `NO_MBA_DATA_UNIS` (`madurai-kamaraj-university-online`,
`university-of-mumbai-online`).

Confirmed: **all 1,881 no-JSON spec pages are declared in the sitemap** and are
served as `index, follow`.

## 5. What this audit is deliberately NOT deciding

- Whether the 1,881 no-JSON spec pages should be deindexed. That is a
  policy call to make after the 18 August GSC read, based on impression /
  click / index-rate data per programme type and per specialisation slug.
- Whether some spec slugs (e.g. `general-management`, `general-commerce`,
  `english`) should be redirected to the parent hub page instead of being
  standalone pages.
- Whether the generic-path template should be enriched (spec-aware "about"
  copy, spec-aware FAQ, spec-aware hiring data) so that the 1,881 pages
  become genuinely different from each other.

All three are follow-ups. Sprint 3 Task 1's hub gate does not depend on any
of them.
