# Page standards

**Version 1 · 16 Nov 2026 · Backlog A5 · Applies to the Phase B daily queue**

A page meets the standard only when every line is true **on the rendered page** (check the live HTML, not the source). qa-checker ticks each line and records PASS or FAIL in `audits/qa/`.

Rules that apply to every line:
- Every volatile fact (fee, UGC-DEB entitlement, NAAC grade, NIRF rank, exam mode, eligibility) comes from `lib/data.ts` or a fact-checker sheet in `audits/verify/` with a source URL and a checked date.
- No visible links to official university sites (D6). The source is recorded in `audits/verify/` and in schema `sameAs` where the URL belongs to that university alone.
- No placement figures, salary figures, hirer lists or testimonials without a published source.
- NIRF always names its category and year. NAAC appears only with a current, unexpired cycle.
- No typed fee in prose. Fees render from data.
- House style from CLAUDE.md: no em dashes, short paragraphs, no filler words.

---

## 1. Online MBA hub (`/programs/mba`)

| # | Requirement | How to check |
|---|---|---|
| H1 | Scope sentence: how many universities are compared and for which intake | visible in the first screen |
| H2 | Comparison table built from `lib/data.ts` (fee, duration, NAAC, NIRF with category) | table rows equal the indexable MBA hubs |
| H3 | Fee methodology stated: what "total" means and that fees are indicative | sentence near the table |
| H4 | Eligibility overview | section present |
| H5 | Links to every indexable university MBA hub, none to noindexed ones | crawl the links |
| H6 | UGC-DEB and NIRF named as sources, plus an update date | visible |

## 2. University profile (`/universities/{id}`)

| # | Requirement | How to check |
|---|---|---|
| P1 | Official name and location (city, state), or no location if unknown | matches `lib/data.ts`; no "Online" as a city |
| P2 | UGC-DEB entitlement with the academic session and a link to deb.ugc.ac.in | visible |
| P3 | NAAC grade with cycle validity, or nothing | matches Supabase via `scripts/lib/supabase-uni-map.mjs` |
| P4 | NIRF rank with category and year, or nothing | gate check-nirf-category passes |
| P5 | Links to each indexable online programme hub of that university | crawl the links |
| P6 | Schema: no invented rating, no Edify phone on the university node, `sameAs` only for a URL unique to that university | check-schema-claims passes |
| P7 | A checked date for the fee shown | visible next to the fee |

## 3. University MBA hub (`/universities/{id}/mba`)

| # | Requirement | How to check |
|---|---|---|
| M1 | **Answer-first block** at the top: total fee (or counsellor line if suppressed), eligibility, exam mode, each with its checked date | first screen on mobile |
| M2 | Exact degree title, duration and mode | matches the verify sheet |
| M3 | Eligibility as printed by the university, not a typed default | matches the verify sheet |
| M4 | UGC-DEB entitlement for the current session | link to deb.ugc.ac.in |
| M5 | Fee components: total, per semester or year, registration, exam, add-ons, each as published | matches the verify sheet; no figure summed by us |
| M6 | Exam mode with source (Online, Exam Centre, or counsellor line) | matches `audits/exam-mode-verified-*.md` |
| M7 | Semester-wise syllabus with its version or year, or no syllabus | matches the syllabus manifest |
| M8 | Learning model, kept apart from marketing claims | wording check |
| M9 | No placement or salary figure without a published source | grep the rendered text |
| M10 | Links: profile, verify page, review post if one exists, relevant compare pages | crawl the links |

## 4. Comparison page (`/compare/{pair}`)

| # | Requirement | How to check |
|---|---|---|
| C1 | Same criteria for both universities | table rows symmetric |
| C2 | Facts dated, fees from data | no typed fee |
| C3 | "Who each suits" line for each university | visible |
| C4 | Links to both MBA hubs and both profiles | crawl the links |

---

**Done means:** a university counts as "at standard" in the scorecard when its profile (P1-P7) and MBA hub (M1-M10) both pass on the live site, recorded in `audits/qa/`.
