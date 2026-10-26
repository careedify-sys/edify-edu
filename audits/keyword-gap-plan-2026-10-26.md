# Keyword gap plan, 26 Oct 2026

Source: Semrush India export from Rishi, `keyword-gap-online-programs-2026-10-26.csv`
(746 rows, 654 "Missing", 92 "Behind"). A working copy of the CSV sits next to this
file as `keyword-gap-online-programs-2026-10-26.csv`.

**Read this first.** "Missing" in the export means edifyedu.in does not rank in
Google's top 100. It does NOT mean the page is absent. Coverage was checked against
the live inventory on 26 Oct 2026: 226 blog posts, 143 universities, 10 programme
hubs (`/programs/{ba,bba,bca,bcom,bsc,ma,mba,mca,mcom,msc}`), 8 guides, 125 `/verify`
pages. Re-count before trusting these numbers (see memory `project_blog_inventory_saturated`).

Rules carried from the workbook's own brief (Start here tab):
- P1 first, then P2. Skip every open/state university row.
- Group keywords into one page. Never one thin page per keyword.
- Answer the main query in the first 30% of the page, question headings, "Last verified" date.
- Fees only from `lib/data.ts` via `getDisplayFee`. Missing fact → counsellor CTA + blocked list.
- External links only to `deb.ugc.ac.in`, `naac.gov.in`, `nirfindia.org` (and `ugc.gov.in`, which CLAUDE.md approves and which every UGC-regulation post needs).
- "Validity explainer" rows (online LLB, B.Ed, B.Tech/M.Tech, PhD): do not write. List for Rishi.
- Branch per batch: `seo/keyword-gap-batch-N`.

---

## Where the 428 P1/P2 rows actually land

| Bucket | Rows | Monthly searches | Action |
|---|---|---|---|
| A. Page exists, does not rank (uni hubs, programme hubs, MBA blogs) | ~300 | ~330,000 | Improve track, not new writing |
| B. Genuine gap, no page on the site | ~70 | ~60,000 | **Write. This is the queue below.** |
| C. Validity explainers (B.Ed, LLB, B.Tech/M.Tech, PhD) | 32 | ~38,400 | Parked for Rishi |
| D. Institutions not in lib/data.ts (IIT, IIM certs, Welingkar, MICA, NALSAR, MIT, unlisted "fake" unis) | ~20 | ~15,000 | Parked: no data to stand on |
| E. Certification / MOOC (CFA, CMA, ACCA, taxation, PMP, Six Sigma) | ~12 | ~12,000 | Out of scope, same call as the 2 Oct keyword map |

Bucket A is dominated by navigational brand queries ("amity university online", 22,200;
"online manipal", 6,600; "lpuonline"). The official portal owns those SERPs. The
`/universities/{id}` hubs already exist. Treat them as an improve task, never a new page.

---

## Bucket B: the writing queue (one by one, in this order)

Status key: TODO, WRITING, SHIPPED (commit), BLOCKED (reason).

| # | Page | Target URL | Keywords (monthly) | Why it is a real gap | Status |
|---|---|---|---|---|---|
| 1 | UGC fake universities list 2026 | `/blog/ugc-fake-universities-list-2026` | ugc fake universities list 8,100; ugc fake university list 4,400; fake university list 880; ugc fake university list 2026 880; fake degree 720; "ugc identified 32 fake universities" 720+480+260; list of fake universities in india 590; + 6 tails ≈ **17,400** | No page lists the UGC-declared fake universities. `/verify` covers 125 legit unis, not the fake list | SHIPPED 26 Oct |
| 2 | How online degree exams work in India | `/blog/how-online-degree-exams-work-india` | how do online exams work 18,100 (KD 17); gla online exam 880; amity online exam 210; srm online exam 210 ≈ **19,400** | Nothing on proctoring, exam pattern or what happens if the connection drops | SHIPPED 26 Oct |
| 3 | UGC-DEB explained: what it is, DEB ID, how to check | `/blog/ugc-deb-id-explained` | deb ugc 8,100; ugc deb 8,100; ugc deb id 2,400; deb.ugc.ac.in deb id 880 ≈ **19,480** | Guide `how-to-check-ugc-deb-approval` covers checking a university. Nobody explains the student DEB ID | SHIPPED 26 Oct |
| 4 | Two degrees at the same time: UGC rules | `/blog/ugc-two-degrees-simultaneously-rules` | ugc allows two degrees simultaneously 2,900 | No page | SHIPPED 26 Oct |
| 5 | UGC biannual admissions (January and July intake) | `/blog/ugc-biannual-admissions-january-july-intake` | ugc biannual admissions 1,900 | No page. Directly useful for the Jan 2027 intake | SHIPPED 26 Oct |
| 6 | UGC fee refund policy | `/blog/ugc-fee-refund-policy` | ugc refund policy 2023-24 1,300 | No page. Applies to every online admission | TODO |
| 7 | Online degree courses in India (pillar) | `/blog/online-degree-courses-india` | online degree courses 5,400; online university in india 880; online degree courses in india 720; online degree in india 480; online graduation degree 1,300; accredited online degrees 1,300 ≈ **10,080** | No cross-programme pillar. Links down to all 10 programme hubs | TODO |
| 8 | Online master's / PG courses in India | `/blog/online-masters-pg-courses-india` | online masters, online pg courses, online postgraduate courses, online master degree courses ≈ **7,710** | No PG pillar above MBA/MCA/MA/MSc/MCom hubs | TODO |
| 9 | Online bachelor's / UG courses in India | `/blog/online-bachelors-ug-courses-india` | online graduation degree, online ug courses, online bachelor's degree in india ≈ **3,500** (psychology rows held, see C) | No UG pillar above BA/BBA/BCA/BCom/BSc hubs | TODO |
| 10 | Online degree scholarships | `/blog/online-degree-scholarships-india` | online degree scholarships 590 | No page. Needs per-uni facts from data; may block | TODO |

Batch 1 = items 1 to 6 (UGC regulation cluster, ≈62,000/mo, all answerable from `ugc.gov.in`).
Batch 2 = items 7 to 10 (pillars that link the existing hubs).

### Why these first (AEO/GEO reasoning)
- From `audits/spam-update-decline-2026-10-06.md`: `/verify` over-indexes AI citations at
  2.6x its ranking share because a regulator-status judgement cannot be restated in one line.
  Items 1 to 6 are the same shape: a question whose correct answer is a dated regulator fact.
- Perplexity already cites edifyedu.in for method (memory `project_ai_citation_work`).
- These are low-KD (12 to 44) and not one more MBA post, which the inventory memory says
  is saturated.

### Writing spec for every Bucket B page
1. First 2-3 sentences answer the query outright, with the date checked.
2. H2s phrased as the questions people search.
3. A table where the answer is a list (fake universities by state, exam pattern, intake dates).
4. FAQ block of 5-7 real questions (FAQPage schema comes from the blog template).
5. "Last verified: {date}" and the `ugc.gov.in` / `deb.ugc.ac.in` notice cited by name and date.
6. 5-10 internal links, no duplicates: `/verify`, `/verify/{slug}`, `/guides/how-to-check-ugc-deb-approval`,
   `/guides/is-online-degree-valid-india`, `/programs/{x}`, `/compare`, `/contact`.
7. House style: no em dashes, no filler words, active voice, 2-4 sentence paragraphs, body starts at H2.
8. Run `npx tsx scripts/check-blog-fees.mjs` and the full pre-commit gate before each commit.

---

## Bucket A: improve existing pages (separate track, after Batch 2)

Highest value "Behind" rows where we already rank 11-100:

| Page | Keywords | Our position |
|---|---|---|
| `/universities/symbiosis-university-online/mba` | symbiosis online mba 4,400; ...fees 2,100 | 47, 50 |
| `/universities/amity-university-online/mba` | amity online mba fees ×3, 5,900 | 54-61 |
| `/universities/nmims-online/mba` | nmims online mba fees 4,400 | 38 |
| `/universities/upes-online` | upes online 4,400 | 40 |
| `/universities/lovely-professional-university-online/mba` | lpu online mba (+fees) 2,900 | 47-59 |
| `/universities/uttaranchal-university-online` | uu online 2,400 | 28 |
| `/best-online-mba-india` | best online mba in india, top 10 ... 2,370 | 41-61 |
| `/programs/bsc` | bsc online 1,570 | 27-79 |
| `/programs/bba` | online bba programs/in india 1,110 | 40-51 |

Caveat: `/best-online-mba-india` is one of three pages cannibalising "best online MBA"
(memory `project_keyword_map_oct2026`). Needs Rishi's consolidation call first.
The fee-query rows repeat memory `project_fee_query_gap`: review blogs outrank fee hubs.

---

## Bucket C: parked for Rishi (do not write without an answer)

| Topic | Monthly | Question that must be answered first |
|---|---|---|
| Online B.Ed | 17,810 | Does NCTE recognise any online-mode B.Ed in 2026, or only ODL (IGNOU-type)? If none, the page is a "not allowed, here is the ODL route" explainer. Confirm before writing |
| Online LLB / LLM | 7,880 | BCI does not recognise online LLB for enrolment as an advocate. Is an online LLM (UGC) in scope, and do we say so? |
| Online B.Tech / M.Tech | 6,820 | AICTE online-mode rules for working professionals (2025 framework). Which universities are actually approved? |
| Online PhD / DBA | 5,920 | UGC PhD Regulations 2022 bar online/distance PhD. Is a "not valid, here is why" page wanted? Foreign online DBA? |
| Online psychology degree | ~2,600 | UGC barred allied/healthcare programmes, incl. psychology, from ODL/online from July 2025 (verify on ugc.gov.in). Write as a validity explainer? |
| Online PGDM | 1,310 | AICTE status of online PGDM. Is it in scope? |

### Bucket C update, 26 Oct: the UGC notice answers three of these
UGC public notice F.No. 1-34/2024 (DEB-I), 11 Nov 2024 (deb.ugc.ac.in/Uploads/Notices_Upload/UGC_20241112154715_1.pdf)
lists programmes **prohibited in ODL and Online mode**: Engineering, Medical, Physiotherapy, OT and para-medical,
Pharmacy, Nursing, Dental, Architecture, **Law**, Agriculture, Horticulture, Hotel Management, Catering Technology,
Culinary Sciences, Aircraft Maintenance, Visual Arts and Sports, Aviation. Yoga and **Tourism & Hospitality
Management at UG and PG level are not permitted online**. **M.Phil and Ph.D. are prohibited** in ODL and Online.
So online B.Tech, LLB and PhD explainers can be written as "not permitted, here is the source" pages if Rishi
wants them. B.Ed (NCTE) and psychology (2025 healthcare rule) still need their own primary source.

**Flag for Rishi:** `/blog/online-mba-hospitality-management-india-2026` and
`/blog/online-mba-hospitality-hotel-professionals-india-2026` exist. An MBA with a hospitality specialisation is
still an MBA, so this may be fine, but the notice bars "Tourism & Hospitality Management programmes at UG and PG
level" online. Worth a read before the next GSC push on those posts.

The same notice names Periyar University, NALSAR and Suresh Gyan Vihar as debarred from ODL or Online for
2024-25 / 2025-26 sessions. Dated; re-check before quoting.

## Bucket D: parked, no data

- IIT / IIM / IIIT online courses (≈16,000): mostly certificates and executive programmes, not UGC-DEB degrees. `iim-online-mba-india-2026` already exists for the MBA side.
- Legitimacy posts for institutions outside lib/data.ts: Vinayaka Mission, CV Raman, Rabindranath Tagore, Shri Venkateshwara, Suresh Gyan Vihar, MIT SDE (≈2,300). `/verify` is keyed to Supabase records; these have none. If one appears in the UGC fake list it gets covered by item 1.
- Welingkar, MICA, NALSAR, SP Jain: not in lib/data.ts.

---

## Progress log

Append one line per shipped page: date, item #, URL, commit, keywords covered, blocked facts.

- 2026-10-26 · #1 · `/blog/ugc-fake-universities-list-2026` · ~17,400/mo (13 keywords) · source: ugc.gov.in/universitydetails/Fakeuniversity, list dated Feb 2026, 32 names, checked 26 Oct. No overlap with lib/data.ts. Also answers the Bucket D 'X fake' queries (Vinayaka Mission, CV Raman, etc.) with the narrow fact 'not on the Feb 2026 list' plus the DEB check. Blocked facts: none.
- 2026-10-26 · #2 · `/blog/how-online-degree-exams-work-india` · ~19,400/mo · source: UGC ODL & Online Regulations 2020 (Reg 2(y), 15, 16, 22, Annexure II) from deb.ugc.ac.in/Regulations. University-specific exam rows (GLA, Amity, SRM) answered generically, no per-uni claims. Blocked facts: each university's disconnection/re-test policy (not public in the regulation).
- 2026-10-26 · #3 · `/blog/ugc-deb-id-explained` · ~19,500/mo · sources: deb.ugc.ac.in/StudentDEBId (steps, helplines, 13 Oct 2026 deadline for Aug 2026 session) and UGC notice 11 Nov 2024 (581st meeting, mandatory from Oct 2024 session, lifelong). Blocked facts: none.
- 2026-10-26 · #4 · `/blog/ugc-two-degrees-simultaneously-rules` · 2,900/mo · sources: UGC guidelines April 2022 (ugc.gov.in/pdfnews/5729348) and June 2025 modification after 589th meeting (pdfnews/6493421). Blocked facts: none.
- 2026-10-26 · #5 · `/blog/ugc-biannual-admissions-january-july-intake` · 1,900/mo · sources: UGC UG/PG Regulations 2025 (Gazette 2 Apr 2025, cl. 3 and 4.0), ODL/Online Regs 2020 Reg 2(b), DEB portal (13 Oct 2026 cut-off), DEB notice Apr 2025. Blocked facts: the January 2027 session last date is not yet published on DEB; post says so instead of guessing. Update the post when DEB notifies it.
