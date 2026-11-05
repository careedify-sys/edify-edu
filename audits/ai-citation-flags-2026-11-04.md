# AI-citation sprint: flags (2026-11-04)

Report only. Every item here touches existing content, so under Rule Zero none
of it was changed on `feat/ai-citation-answers`. Rishi decides each fix.

**Update 4 Nov 2026 (fix/citation-flags):** FLAG 1 meta description and the FLAG 3 NAAC, NIRF, spec-count, hub-JSON and internal-links rows are fixed; see audits/FIX-LOG.md. BITS NAAC was a data.ts error (A++ is correct). Open: review-post fee MISMATCHes, SMU Rs 84,000, WES claims, FLAG 2 brand string.

**Update 5 Nov 2026:** the second pass closed every open item except the " | EdifyEdu" title suffix, which Rishi decides. See the 2026-11-05 FIX-LOG entry.

Line numbers are `lib/blog.ts` on `origin/main` at `9eea6da` unless stated.

## FLAG 1: Shoolini (frozen)

- Rishi verified on 4 Nov 2026 from the official MBA page: regular Rs 2,00,000; with Pay After Placement Rs 1,58,000 (Rs 1,34,300 before placement as Rs 33,575 x 4, plus Rs 23,700 after); opting out of PAP Rs 1,30,000 (Rs 32,500 x 4).
- The stale Rs 1.18L lives in the review's `metaDescription` at `lib/blog.ts:29167` ("fees ₹1,18,000 to ₹1,30,000"). The live title in the repo is now "Shoolini Online MBA Review 2026: Pharma and Biotech" (`lib/blog.ts:29164-29166`), so the "Fees 2026: Rs 1.18L" title the AI Overview quotes is Google's cached copy of an older title, and the meta description still feeds it the figure.
- `lib/data.ts` MBA fee for Shoolini resolves through getExactFee to Rs 1,30,000 to Rs 1,58,000 (the opt-out and PAP figures). The Rs 2,00,000 regular fee is not in data.ts.
- Skipped: every Shoolini Q-section, the Shoolini rows on comparison pages and the fee ladder, and Shoolini in Batch D. `FROZEN_UNIVERSITIES` in `lib/answers/targets.ts` enforces this.

## FLAG 2: brand string "EdifyEdu"

Where the brand is emitted (not changed):

| Place | File:line | Value |
|---|---|---|
| Default `<title>` | `app/layout.tsx:57` | "... \| EdifyEdu" |
| Title template (every page using it) | `app/layout.tsx:58` | `'%s \| EdifyEdu'` |
| Default meta description | `app/layout.tsx:60` | "... free at EdifyEdu." |
| OpenGraph title / description | `app/layout.tsx:88-89` | "... \| EdifyEdu" |
| Twitter title | `app/layout.tsx:93` | "... \| EdifyEdu" |
| og:site_name | `app/layout.tsx:85` | `edifyedu.in` (already correct) |
| Organization schema `name` | `app/layout.tsx:137` | `edifyedu.in` (correct); `alternateName` lists "EdifyEdu" at `:138` |
| WebSite schema `name` | `app/layout.tsx:185` | `edifyedu.in` (correct); `alternateName` "EdifyEdu" at `:186` |
| Person schema description | `app/layout.tsx:209` | "Founder of EdifyEdu ..." |
| Compare pair title | `app/compare/[pair]/page.tsx:62` | "... Fees and Verdict \| EdifyEdu" |
| Compare pair intro | `app/compare/[pair]/page.tsx:189` | "EdifyEdu takes no referral commissions ..." |
| Web manifest | `public/manifest.json:2-3` | "Edify — Online Degrees India" / "Edify" (also carries an em dash) |
| Blog posts | `lib/blog.ts` | 548 occurrences, mostly bylines ("Founder, EdifyEdu") |
| Other app/components | 56 files | e.g. `app/methodology/page.tsx` (11), `components/MBAHubClient.tsx` (6) |

The two schema `name` fields and og:site_name already say edifyedu.in. The title template is the most likely source of the "EdifyEdu" label in AI Overview citations, because it is appended to almost every `<title>`.

## FLAG 3: existing claims that conflict with data or with a new sourced answer

New copy was written to avoid each conflict (the `omit` list in `lib/answers/blog-plan.ts`). The existing claim is unchanged.

| Page | Existing claim (file:line) | Data / source | Treatment in new copy |
|---|---|---|---|
| /blog/bits-pilani-online-mba-review-2026 | "with NAAC A++ accreditation (the highest possible NAAC grade)" `lib/blog.ts:36929` | `lib/data.ts` naac A+ | no NAAC in the BITS appendix |
| same | "BITS WILP MBA offers 8 specialisations" `lib/blog.ts:36960` | data.ts 9 specs | no spec count |
| same | "NIRF #16 Overall 2025" `lib/blog.ts:36883` (also :5443, :36338) | data.ts nirf 7 (University), no Management rank | no NIRF |
| /blog/vignan-online-mba-review | "It holds NAAC A+ accreditation" `lib/blog.ts:27231` (and two more in the post) | data.ts naac A++ | Vignan got no section (only Q3 was missing, no source) |
| /blog/chandigarh-university-online-mba-review | "NIRF University 25" `lib/blog.ts:30013, :30037, :30076` | data.ts nirf 19 University, nirfMgt 32 | no NIRF and no spec count in the Q2 section |
| same | spec count 23 in the post vs data.ts 26 | data.ts | no spec count |
| same | NAAC A+ presented as current | `data/naac-verified.json` validTill 2026-09-09 (lapsed per Supabase snapshot) | Q2 bullet states the cycle end date |
| /blog/amity-online-mba-review-2026 | "14 specialisations" in metaDescription `lib/blog.ts:23099` and FAQs `:23112, :23114`; NIRF "Management 2024" `:23112` | data.ts 19 specs, NIRF 2025 | no spec count; no fee (9 MISMATCH fee figures on the post) |
| /blog/nmims-online-mba-review-2026 | 2 MISMATCH fee figures (scripts/lib/blog-fee-scan.mjs) | getDisplayFee | FAQ only, no fee, no NAAC/NIRF |
| /blog/dy-patil-online-mba-review | 12 MISMATCH fee figures | getDisplayFee | DY Patil table printed without the fee column |
| 24 review posts in total | MISMATCH fee figures for their own university | see `audits/ai-citation-coverage-2026-11-04.csv` column `conflict_note` | no fee in any appended blog section |
| `lib/internal-links.ts:262-271` | registers `dy-patil-online-mba-review` under `dy-patil-university-online` (Navi Mumbai) | the post reviews Dr. D.Y. Patil Vidyapeeth, Pune (relatedUniversities, Rs 1,89,400, 23 "Pune" mentions) | BlogRelatedLinks and the CollegeOrUniversity JSON-LD on that post point at the wrong university. Mapped to Pune in `lib/answers/targets.ts`; the existing entry is untouched |
| `app/compare/[pair]/pairs.ts:21, :51, :81, :88, :96` and more | NMIMS "NIRF #17 Management" | data.ts nirfMgt 24 (see memory: #17 is IIFT) | the page's own at-a-glance table already prints #24 from data, so the contradiction pre-exists on those pages. New compare sections print no NIRF figure on any pair whose hand-written FAQ or verdict states one |
| `app/compare/[pair]/pairs.ts:21` | "NMIMS has NIRF #17 Management ... Symbiosis (SSODL) has NAAC A++" etc. | same | same |
| `app/compare/[pair]/pairs.ts` (amrita-vs-nmims) | "Amrita degrees are WES recognised"; "NMIMS also has WES recognition" | no provenance row | not repeated |

### Hub page-content JSON conflicts (QuickAnswers left these facts out)

Full list: `audits/ai-citation-hub-answers-A-2026-11-04.md` (regenerate with `npx tsx scripts/audit-hub-answer-conflicts.mts`). The ones that are real data disagreements:

| Hub JSON (lib/data/page-content) | Existing sentence | Data |
|---|---|---|
| dy-patil-university-online MBA | "NAAC A, WES Recognised, 11 Specialisations" (hero headline) | data.ts naac A++; the hub hero badge already prints A++, so the hub contradicts itself |
| same | "Programme fee ranges from Rs 41,000 to Rs 1,69,000" | getExactFee Rs 1,75,000 (the hub title prints Rs 1,75,000) |
| same | "does not have a confirmed NIRF rank in standard categories" | data.ts nirf 91 (University) |
| same | "Dr. DY Patil Vidyapeeth Online (Pune): NAAC A+" | data.ts DPU naac A++ |
| chitkara-university-online MBA | "ranges from approximately Rs 50,000 to Rs 3,00,000" | getExactFee Rs 2,00,000 |
| sharda-university-online MBA | "Rs 1,40,000 total fee" | getDisplayFee suppresses the Sharda MBA fee |

### Comparison pairs: existing FAQ and verdict text that disagrees with data

Full list: `audits/ai-citation-pair-omissions-2026-11-04.md`. Beyond the NMIMS #17 rows above, the hand-written pairs also state, among others: MUJ "NIRF #3 University" (manipal-jaipur-vs-manipal-mahe), NMIMS "NIRF #8 University" (amrita-vs-nmims), Amity and JAIN University ranks that differ from data.ts (amity-vs-jain), SMU "effective fee Rs 84,000" (sikkim-manipal-vs-amity). The new sections omit NIRF on every old pair, and omit fee, NAAC or spec count where the scanner found a mismatch.

### Comparison link slot (lib/compare-links.ts)

Letting the 14 new pairs compete for the existing 3 link slots per post would have swapped a link on 82 of 179 posts. Instead the existing 3 are unchanged and a new pair takes a 4th slot (166 new links, 40/40 pages covered). If Rishi prefers the old cap, set `MAX_DERIVED_EXTRA` to 0, but then srm-vs-manipal and nmims-vs-dy-patil have no inbound post link and the gate fails.

## Not fixable additively, skipped

- Q10 admission dates: no admission_cycles data exists in the repo, so no "when does admission open" section was written for any university.
- NMIMS "is nmims online mba banned": no ugc.gov.in notice was fetched; skipped.
- LPU "for defence personnel": lpuonline.com links /jai-jawan-scholarship with no text on the home page; not fetched further; skipped.
- Manipal (MUJ, MAHE, SMU) placement and exam answers: onlinemanipal.com returned HTTP 403 on 4 Nov 2026.
- vit-vs-bennett: verified 4 Nov 2026 by script. Bennett University Online has getExactFee kind "none" for MBA, no NAAC grade in lib/data.ts, no NIRF rank and 1 MBA specialisation, so a comparison page would be a table of blanks on one side. Not built.
- nmims-online-vs-mba-wx: NMIMS carries no 'MBA (WX)' programme in lib/data.ts. Skipped.
- "is online mba going to be 3 years from 2027": searched ugc.gov.in and deb.ugc.ac.in on 4 Nov 2026. No notification found; DEB notices from 2025-2026 still list the MBA at 2 years, and the draft 2024 minimum-standards regulations say a PG degree is normally 1 or 2 years. No page built.
- Batch C fee ladder on affordable-online-mba-india-2026: the post's own ladder carries MISMATCH figures for IGNOU, Mangalayatan, SMU and LPU (blog-fee-scan), so a getExactFee ladder would contradict it. Not added.
- Batch C placement table on online-mba-with-placement-india-2026: Symbiosis (SSODL) left out. The post says SSODL leads "with active placement cells", while the SSODL pages read carry no placement statement (provenance ssodl-no-placement-statement). The same post states "Average packages range Rs 4-12 LPA" with no source.
- Batch C posts already answering their question in their own H2 (no appendix): online-mba-without-entrance-exam-india-2026, ugc-deb-approved-universities-list-2026, best-online-mba-colleges-india-2026 ("How I Ranked"), and the pharma, supply chain and hospital/healthcare specialisation posts ("Which universities offer ..."). No business analytics specialisation post exists; a new one is in the research backlog.
