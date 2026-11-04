# AI-citation sprint: final report (2026-11-04)

Branch `feat/ai-citation-answers`, cut from `origin/main` at 9eea6da. Nine commits, not merged, not pushed. Every commit passed the pre-commit gates as they stand, with no baseline edits.

Every new section follows one format. The H2 is the question, using the university's name. A 40-60 word standalone lead comes next, then a table or 3-5 bullets, then a "Not published / not recorded" line. "Fee data last checked" appears only where `feeBreakdown.mba.source` carries a date. One builder (`lib/answers/university-answers.ts`) feeds blogs, hubs and comparison pages, so the same answer cannot be worded two ways.

## Where facts come from

| Fact | Source |
|---|---|
| Fee | `lib/fees.ts` getExactFee, which resolves through getDisplayFee. A suppressed fee shows the counsellor line, never an estimate. |
| NAAC | `lib/data.ts` naac. Cycle end dates come from `data/naac-verified.json` validTill; Chandigarh lapsed on 2026-09-09. |
| NIRF | `lib/data.ts` nirf / nirfMgt, rendered with formatNirfBadge and "(parent institution)". There is no 999 sentinel; an unranked university shows "No NIRF ranking". |
| Specialisations, eligibility, exam mode, duration | `lib/data.ts` programDetails.MBA, eligibility, examMode |
| Syllabus | `lib/data/syllabus-manifest.json` `_core` only (not the legacy MASTER_SYLLABUS fallback) |
| Validity | UGC Regulation 22, provenance row `ugc-reg22-equivalence` (deb.ugc.ac.in/FAQ) |
| Placements, WES, dual specialisation | `data/answer-provenance.json`: 19 rows, all fetched 2026-11-04 from the university's own officialUrl domain. onlinemanipal.com returned HTTP 403. |

External links in new copy go only to deb.ugc.ac.in, naac.gov.in and nirfindia.org (the renderer throws on anything else). There are no links to university sites, no em dashes and no "EdifyEdu" in new copy.

## Pages

### Review blogs, appended (Batch A1-A4, 20 posts)

Target query: "{university} online mba {fees / worth it / placements / valid / syllabus / exam / eligibility / UGC approved}". Sections sit between `<!-- ai-answers:start/end -->` markers, and FAQ items are appended. No fee figure was added to any review, because 24 reviews already carry MISMATCH fees for their own university.

| Post | Sections added | Facts left out (conflict) |
|---|---|---|
| /blog/amity-online-mba-review-2026 | syllabus; FAQs: good or bad, dual specialisation, WES | fee, spec count |
| /blog/muj-online-mba-review-2026 | Manipal 3-row table, worth it, eligibility, exams, syllabus; spec FAQs | fee |
| /blog/mahe-online-mba-review-2026 | Manipal table, validity, eligibility, exams, syllabus, approvals | fee |
| /blog/smu-online-mba-review | Manipal table, worth it | fee |
| /blog/chandigarh-university-online-mba-review | worth it (with the NAAC cycle end date); spec FAQ | fee, spec count, NIRF |
| /blog/symbiosis-online-mba-review-2026 | placements (none stated), exams, syllabus, approvals; SSODL vs SCDL FAQ | fee, spec count |
| /blog/nmims-online-mba-review-2026 | spec FAQ and legit-post link only | fee, NAAC, NIRF |
| /blog/online-mba-lpu-review-2026 | eligibility, exams | fee |
| /blog/uu-doon-online-mba-review | worth it, placements, validity, exams | fee |
| /blog/bits-pilani-online-mba-review-2026 | validity, exams, syllabus; "does BITS offer an MBA" FAQ (not BIT Mesra) | fee, spec count, NAAC, NIRF |
| /blog/srm-online-mba-2026 | worth it, validity, eligibility | fee (the post covers two SRMs) |
| /blog/jain-online-mba-review-2026 | eligibility, exams, syllabus | fee |
| /blog/dy-patil-online-mba-review | Pune vs Navi Mumbai table, worth it, eligibility | fee |
| /blog/galgotias-online-mba-review | placements | fee |
| /blog/amrita-online-mba-review | eligibility, exams, syllabus; ACCA/ESG FAQs | fee |
| /blog/parul-online-mba-review | worth it, exams | fee |
| /blog/bharati-vidyapeeth-online-mba-review | worth it, validity, exams | fee |
| /blog/upes-online-mba-review-2026 | exams, syllabus; oil-gas/power FAQs | fee |
| /blog/jamia-hamdard-mba-2026 | specialisations, eligibility; pharma FAQ | fee |
| /blog/christ-online-admission-guide | FAQ "does Christ have an online MBA" (no, per data.ts programmes) | none |

Where a legit post exists and the review did not already link it, the appendix links it for Q4/Q9 instead of repeating them.

### MBA hubs, new component (Batch A: 6 hubs, Batch D: 74 more)

URL: `/universities/{id}/mba`. The component is `components/QuickAnswers.tsx`. It renders only when the university has no review blog, is not Shoolini, the hub is indexable and at least 5 Q-sections are backed. FAQ items are appended to the existing list, and FAQBlock emits the page's single FAQPage. The per-hub sections and the 46 fact types left out because the hub's own JSON disagrees are in `audits/ai-citation-hub-answers-D-2026-11-04.md`.

Batch A hubs:
- **OP Jindal:** 7 sections, plus a "1 year" FAQ from duration "1 Year (12 Months)".
- **VIT:** 7 sections.
- **DY Patil Navi Mumbai:** 5 sections. Left out fee, NAAC and NIRF, because its JSON says NAAC A, Rs 41,000-1,69,000 and no NIRF rank.
- **Sharda:** 5 sections.
- **Chitkara:** 6 sections.
- **GLA:** 6 sections.

### Comparison pages (Batch B: 30 MBA pairs, 14 of them new)

New pages:
- /compare/amity-vs-dy-patil
- /compare/amity-vs-srm
- /compare/ignou-vs-amity
- /compare/symbiosis-vs-manipal
- /compare/dy-patil-vs-manipal
- /compare/jain-vs-manipal
- /compare/srm-vs-manipal
- /compare/nmims-vs-dy-patil
- /compare/nmims-vs-jain
- /compare/nmims-vs-mahe
- /compare/bits-pilani-vs-nmims
- /compare/vit-vs-srm
- /compare/jain-vs-amrita
- /compare/dy-patil-vs-symbiosis

Target query: "{A} vs {B} online mba". "Manipal" means MUJ and the page adds the 3-row Manipal table. "DY Patil" means Pune and the page adds the Pune/Navi Mumbai table.

Every MBA pair, old and new, gets:
- a verdict;
- a side-by-side table: fee tiers, payment modes, UGC-DEB, NAAC with cycle, NIRF with category and parent qualifier, specialisations, exam mode, placement disclosure, fee check date;
- the syllabus comparison;
- autocomplete FAQs.

Old pairs drop every NIRF figure from the new copy, and drop any fact their hand-written FAQs or verdicts state differently (`audits/ai-citation-pair-omissions-2026-11-04.md`). New pairs carry "edifyedu.in" in their title, description and intro, and their verdicts are data comparisons (`lib/answers/pair-verdict.ts`). Registration and links:
- registered in `scripts/lib/static-urls.js` and the /compare hub list;
- inbound links come through a new 4th slot in `lib/compare-links.ts`, so the existing 3 links on every post are unchanged and 40/40 pages are covered.

### Generic posts (Batch C, 2 posts)

| Post | Target query | Added | Source |
|---|---|---|---|
| /blog/is-online-mba-valid-india-2026 | is online mba valid in india | Reg 22 section (no FAQ; the post already asks it) | ugc-reg22-equivalence |
| /blog/online-mba-with-placement-india-2026 | which online mba publishes placement data | 8-university placement-disclosure table, plus FAQ | provenance rows for Amity, LPU, JAIN, UU, Galgotias, BV, UPES, Sharda |

## Research backlog (skipped for lack of data)

1. Q10 admission dates for every university: no admission_cycles data exists.
2. MUJ, MAHE, SMU placements and exam pattern: onlinemanipal.com returned 403. Fetch it from a browser, or have Rishi read it.
3. Q3 placements for every university outside the 9 with provenance rows.
4. NMIMS "banned": needs a ugc.gov.in notice.
5. LPU "for defence personnel": the /jai-jawan-scholarship page was not fetched.
6. AICTE and WES for every university except Amity (WES only).
7. Proctoring method, assignment weighting and passing mark: not recorded for any university.
8. Syllabi missing for DY Patil Navi Mumbai, SRMIST, BITS WILP and VIT, and for semesters 3-4 everywhere except IGNOU.
9. A business analytics specialisation post, a fee ladder that does not contradict the affordable post, and vit-vs-bennett (Bennett has no fee, NAAC or rank on record).
10. "3 years from 2027": no UGC notification exists; revisit only if one is issued.

## Flags

See `audits/ai-citation-flags-2026-11-04.md`:
- Shoolini is frozen (stale Rs 1.18L in its meta description).
- Every place the "EdifyEdu" brand string is emitted.
- The conflicts table: existing claims that disagree with data on blogs, hub JSON and pairs.ts.
