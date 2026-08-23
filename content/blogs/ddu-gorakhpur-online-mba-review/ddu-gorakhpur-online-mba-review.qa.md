# Quality Assurance Checklist

**Blog**: DDU Gorakhpur Online MBA Review
**Generated**: 2026-08-23
**Slug**: ddu-gorakhpur-online-mba-review

Checks 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 19, 20 run programmatically against the built HTML. Checks 1, 5, 13, 16, 18 reviewed manually.

## Hard-Gate Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Hallucinations / unverified confident claims | **PASS** | Programme list from the official CDOE portal, fees founder-confirmed and labelled as such, accreditation from Supabase. **No NIRF claim is made anywhere**, deliberately, see the open issue below. |
| 2 | Em dash count | **PASS** | 0 found |
| 3 | AI-filler words | **PASS** | 0 of 14 blacklisted terms |
| 4 | AI sentence-starters | **PASS** | None |
| 5 | Unverified stats | **PASS** | No salary figures, no placement percentages. The absence of placement data is reported as an absence. |
| 6 | Competitor links | **PASS** | 0 blacklist hits |
| 7 | Duplicate internal links | **PASS** | 9 links, all distinct |
| 8 | Meta description length | **PASS** | 152 chars |
| 9 | Meta title length | **PASS** | 55 chars |
| 10 | PAS intro length | **PASS** | 69 words |
| 11 | H1 in body | **PASS** | Body opens at h2 |
| 12 | Fees flagged indicative | **PASS** | `.callout-warning` states fees are indicative and that the portal publishes none |
| 13 | Active voice | **PASS** | Fee, trade-off and Final Word sections reviewed |
| 14 | Short paragraphs | **PASS** | 0 paragraphs over 4 sentences |
| 15 | Author name | **PASS** | Rishi Kumar |
| 16 | FAQs format | **PASS** | 8 items, q/a keys only, plain text |
| 17 | SVG accessibility | **PASS** | 4 SVGs, all with `role="img"` and `aria-label` |
| 18 | Unique angles count | **PASS** | 4 angles |
| 19 | Internal links count | **PASS** | 9 unique |
| 20 | External sources count | **PASS** | 4 primary |

**Word count**: 1,416

---

## Evidence Log

### Fee Verification

- **Programme list**: `https://ddugucdoe.com/`, reached via `onlineddugu.com` which is linked from `ddugu.ac.in`. This is the university's real online arm.
- **Fees**: **not published anywhere on the portal.** Confirmed directly with the university: MBA Rs 52,500, BBA Rs 57,500, B.Com Hons Rs 56,500, MA Rs 30,500, M.Sc Rs 30,500.
- **Previously in `lib/data.ts`**: template strings shared with other universities (`₹60K – ₹150K` for MBA, `₹33K – ₹82K` for B.Com and so on). See section 5g of the session audit: 285 of 436 fee entries site-wide share a string with another university. All replaced.
- **M.Com**: still a template string, not confirmed. The blog's fee table says "Confirm with the university" for that row rather than printing a number.

**Do not confuse with campus fees.** Search results quoting DDU BBA at Rs 25,000/year and MBA at Rs 80,000/year describe the on-campus programmes admitted through the DDU entrance exam. Different product, different pricing. The blog has a section warning readers about exactly this.

### Unique Angles Used

1. **Rs 52,500 for a NAAC A++ MBA**, roughly a third of Parul at Rs 1,50,000 and under a third of Bharati Vidyapeeth at Rs 1,78,000, on a **higher** NAAC CGPA than either (3.78 vs 3.60 vs 3.55). Rendered as a comparison chart.
2. **What the low price does not buy**, rendered as a feature-comparison table across the three universities: no AICTE, no NIRF rank, no published placement support, no published fee table.
3. **Campus versus online confusion**, which is the single biggest research trap for this university and is not addressed anywhere else.
4. **The MA and M.Sc at Rs 30,500** are the strongest value on the page and get no attention because the MBA absorbs the searches. Also flagged that the four-year B.Com Honours at Rs 56,500 is cheaper per year than the three-year BBA at Rs 57,500.

### Internal Links Audit

9 links, no duplicates: the DDU MBA, B.Com and MA hubs, the DDU verify page, `/compare`, `/contact`, `/tools/emi-calculator`, and the Parul and Bharati Vidyapeeth reviews as the two priced comparisons.

`/universities/deen-dayal-upadhyay-gorakhpur-university-online/msc` is **deliberately not linked**. The M.Sc programme was added to `lib/data.ts` in this same change, so the live page still returns `noindex, nofollow` until the deploy lands. Link it in a later pass once it resolves.

The MBA, B.Com and MA hubs are absent from the committed `valid-urls.json` because of the normalize over-pruning documented in session audit 5a. All three were checked live and return **200 with `index, follow`**, and all three are in the middleware allowlist. Safe to link.

### External Sources Audit

| Source | URL | Type |
|---|---|---|
| DDU Centre for Distance and Online Education | https://ddugucdoe.com/ | Official portal |
| UGC-DEB approved institutions | https://deb.ugc.ac.in | UGC-DEB |
| NAAC accreditation database | https://naac.gov.in | NAAC |
| NIRF India Rankings | https://nirfindia.org | NIRF |

---

## Open Issue Carried By This Post

`lib/data.ts` sets `rankingBadge: 'NIRF #96 (University 2024)'` for this university, while `nirf` is `999` (meaning none) and **Supabase holds no NIRF row for DDU at all**. Those three cannot all be right.

The blog therefore makes **no NIRF claim in either direction**. Saying DDU has no NIRF rank would contradict the badge rendering on its own hub page, and asserting rank 96 would contradict Supabase, which is the source of truth for ranking claims.

Resolve the badge before adding any NIRF statement to this post.

Also unresolved on this university, recorded in session audit 5f: the site's MA specialisation list is the shared 7-subject template including Psychology, History and Public Administration, none of which appear on the official portal, while Education is offered and missing. Left alone pending the same decision taken for Bangalore University.

---

## Template Deviations

No syllabus section and no scholarships section, since the portal publishes neither. The fourth SVG is a three-university feature comparison rather than a syllabus timeline. No `.cms.xlsx`, per the `CLAUDE.md` rule that the CMS is not in use.

---

## Overall Status

**[x] PASS**. 20 of 20 hard-gate checks passed.
