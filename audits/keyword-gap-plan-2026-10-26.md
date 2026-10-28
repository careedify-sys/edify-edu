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
| 6 | UGC fee refund policy | `/blog/ugc-fee-refund-policy` | ugc refund policy 2023-24 1,300 | No page. Applies to every online admission | SHIPPED 26 Oct |
| 7 | Online degree courses in India (pillar) | `/blog/online-degree-courses-india` | online degree courses 5,400; online university in india 880; online degree courses in india 720; online degree in india 480; online graduation degree 1,300; accredited online degrees 1,300 ≈ **10,080** | No cross-programme pillar. Links down to all 10 programme hubs | SHIPPED 26 Oct |
| 8 | Online master's / PG courses in India | `/blog/online-masters-pg-courses-india` | online masters, online pg courses, online postgraduate courses, online master degree courses ≈ **7,710** | No PG pillar above MBA/MCA/MA/MSc/MCom hubs | SHIPPED 26 Oct |
| 9 | Online bachelor's / UG courses in India | `/blog/online-bachelors-ug-courses-india` | online graduation degree, online ug courses, online bachelor's degree in india ≈ **3,500** (psychology rows held, see C) | No UG pillar above BA/BBA/BCA/BCom/BSc hubs | SHIPPED 26 Oct |
| 10 | Online degree scholarships | `/blog/online-degree-scholarships-india` | online degree scholarships 590 | Anchored on UGC Reg 14(2) (fees public, pay university only, reserved waivers per govt orders). Only UU 30% and MUJ 15% as worked examples; no per-uni ranking. Old MBA scholarship post had 0 impressions in 6 months, linked as child | SHIPPED 2026-10-26 (local commit) |
| 11 | Online degree admission process (all programmes) | `/blog/online-degree-admission-process-india` | lpu online admission 590 (brand row, hub owns it); bca online application form 590; b.com online admission form 590; mba online admission 480; online ba registration 320; b.sc online admission 320+260; mba apply online 260; bba/bca online admission 210 each; bsc online form 210; apply diploma online 390 ≈ **4,400** | Only the MBA had an admission page. Dated "2020-2023 form" variants answered by the current cycle | SHIPPED 2026-10-28 |

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
| Online B.Ed | 17,810 | **SHIPPED 27 Oct** as /blog/online-bed-course-india. NCTE Regs 2014 Appendix 10: ODL B.Ed only for trained in-service elementary teachers or face-to-face TE graduates; open univs/ODL directorates only; 6 months contact + 3 months teaching practice. No NCTE norm for online mode; UGC notice para 6(xviii). |
| Online LLB / LLM | 7,880 | **SHIPPED 27 Oct** as /blog/online-llb-llm-india. DEB notice 11 Nov 2024 para 6(ix): Law incl. allied domains prohibited ODL+online; Aug 2026 DEB list has no law programme; Equivalence Regs 2025 Reg 1(2) exclude Law. Fixed fabricated online-LLM list in the LLM guide. |
| Online B.Tech / M.Tech | 6,820 | **SHIPPED 27 Oct** as /blog/online-btech-mtech-india. UGC notice para 6(i) + UGC Regs 2020 Reg 4(C)(ii) lab proviso (why MCA is allowed) + AICTE APH 2024-27 cl. 5.1(b) no ODL for engineering; working professionals = AICTE flexible timings (PIB 6 Dec 2023), in class. |
| Online PhD / DBA | 5,920 | **SHIPPED 27 Oct** as /blog/online-phd-in-india. PhD Regs 2022 Reg 13(3) + DEB notice 11 Nov 2024. Final 2025 Equivalence Regs do NOT carry the draft's online exclusion: foreign online DBA is case by case, franchise excluded (Reg 3(4)). |
| Online psychology degree | ~2,600 | **ANSWERED 26 Oct:** UGC public notice F.No. 4-1/2025 (DEB-NER), 12 Aug 2025 (592nd meeting): no ODL/Online Psychology, Microbiology, Food & Nutrition Science, Biotechnology, Clinical Nutrition & Dietetics from July-Aug 2025; recognitions withdrawn. See data defect below. |
| Online PGDM | 1,310 | **SHIPPED 27 Oct** as /blog/online-pgdm-india. VALID with AICTE approval for ODL/OL mode (APH 2024-27 cl. 5.1(a),(e)); standalone bar NBA 700/1000 or NIRF top-200 institution (5.3.8). Corrected mba-vs-pgdm post, which said online PGDM was effectively not possible. |

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
- 2026-10-26 · #6 · `/blog/ugc-fee-refund-policy` · 1,300/mo · sources: UGC Fee Refund Policy 2024-25 (12 Jun 2024, 580th meeting), UGC notice 27 Oct 2025 (policy continues, cut-off 31 Oct 2025), Oct 2018 refund table, Student Grievance Regs 2023. Rs 1,000 and Rs 5,000 are UGC caps, allowlisted in data/blog-fee-allowlist.json with the UGC letters as source. Blocked facts: none. **Batch 1 complete.**
- 2026-10-26 · #7 · `/blog/online-degree-courses-india` · ~10,080/mo · sources: ODL/Online Regs 2020 Reg 3(B) (NAAC 3.26 / NIRF top-100 twice in three cycles), 3rd Amendment May 2024, UGC notice 11 Nov 2024 (prohibited list), DEB notice Apr 2025 (578th meeting, no AICTE NOC for mgmt/CA at central/state/private unis), DEB OL page (no lab programmes online). Counts from lib/data.ts u.programs on 26 Oct. Internal links capped at 10 per house rule, so the table does not link the 10 hubs; the hubs are not in the CLAUDE.md allowed-target list anyway. Blocked facts: none. No fee range quoted on purpose.

## Data defect found 26 Oct (outside this content plan, needs Rishi's call)

lib/data.ts still lists **29 online BA/MA Psychology programme rows across 26 universities**, and
**32 `/universities/{id}/{ba|ma}/psychology` URLs are in valid-urls.json** as indexed pages. UGC withdrew
recognition for Psychology as a specialisation in ODL/Online mode from the July-August 2025 session
(notice F.No. 4-1/2025 (DEB-NER), 12 Aug 2025, deb.ugc.ac.in/Uploads/Notices_Upload/UGC_20250814162155_1.pdf).
Also `/blog/ma-distance-learning-india-2026` mentions online psychology. Fix needs: drop the spec from
lib/data.ts and data-slim, regenerate allowlists/valid-urls/canonical map, and redirect the 32 URLs to
their programme hub (check-gsc-404s requires a redirect for any URL with GSC history).

## Also found: one-year online PG (28 Jul 2026)
UGC circular F.No. 7-2/2026 (DEB-NWR), 28 Jul 2026: universities entitled for a two-year online PG may
offer a one-year online PG in the same discipline, only to four-year honours graduates; MBA/MCA
eligibility follows the regulator. Feeds item 8 and the "one year online mba" row (P1).
- 2026-10-26 · #7 patch · added the Aug 2025 NCAHP/psychology ban to `/blog/online-degree-courses-india` (warning box, FAQ, figure, sources).
- 2026-10-26 · #8 · `/blog/online-masters-pg-courses-india` · ~7,700/mo · sources: UG/PG Regs 2025 eligibility (3-yr 120 cr / 4-yr 160 cr; any-discipline PG via entrance), UGC circular 7-2/2026 (DEB-NWR) 28 Jul 2026 (one-year online PG for 4-yr Honours only), ODL/Online Regs 2020. Specialisation counts from lib/data.ts with name variants merged. Psychology deliberately left out of the subject chart while its status is under discussion with Rishi. Blocked facts: none.
- 2026-10-26 · #9 · `/blog/online-bachelors-ug-courses-india` · ~3,500/mo (+ '1 year bachelor degree online', 'bfa online', 'computer science bachelor online' tails) · sources: UG/PG Regs 2025 (Class 12 incl. open schooling), ODL/Online Regs 2020 Reg 4 (same credits and duration), Nov 2024 prohibited list (engineering, visual arts), 28 Jul 2026 circular. Blocked facts: none.
- 2026-10-26 · Bucket A part 1 · merged ee50ab9 · NIRF category on every templated rank (gate added), brand-led overview titles with labelled MBA fee for all 143 /universities/{id}, MBA override fixes (NMIMS NAAC A++ and Narsee Monjee, Chandigarh Mgmt #32, fee-led LPU/NMIMS/DY Patil/MAHE titles). Details: audits/FIX-LOG.md 2026-10-26. Measure in GSC from ~2026-11-23 (28 days after deploy), Pages.csv, control = untouched hubs.
- Bucket A part 2 DONE 2026-10-26: answer-first intros on Amity, LPU, NMIMS, Chandigarh, Symbiosis MBA hubs (unbacked claims removed, see FIX-LOG).
- Bucket A part 3 DONE 2026-10-26: duplicate titles were 404 build artifacts (no fix); fixed overview MBA fee on 404 hubs, 26 caps names, 8 cities, "Based in Pune". Open: iiit-bangalore-online slug is IIIT Hyderabad; its NAAC A++ vs "NAAC A" conflict.
- Bucket A part 4 DONE 2026-10-26: "Online Online" removed from 14 template lines (descriptions, schema).
- Bucket A improve track: all listed items done ("Based in Pune" fixed in part 3).
- Bucket A part 5 2026-10-27: /programs/bsc and /programs/bba plus all 200 non-MBA spec pages (wrong-programme titles, MBA fees, salary stats). Remaining Bucket A rows: UPES and Uttaranchal overviews; /best-online-mba-india needs Rishi.
- Item 10 SHIPPED 2026-10-26. Writing queue 1-10 complete. Remaining: Bucket C validity explainers (need Rishi), psychology dispute, measure Bucket A ~23 Nov.

- 2026-10-27 · BA / MA / MSc programme hubs (export rows: online BA 8,120/mo, online MA 5,620/mo, online MSc 5,540/mo): titles, descriptions and hub copy rewritten for the head terms. Measure with Bucket A ~23 Nov.
- 2026-10-27 · one year online mba (720) + 1 year online mba (390): answered inside /blog/1-year-mba-india-executive-mba-2026 from UGC circular 7-2/2026; Jindal claims corrected.
- 2026-10-27 · online mba fees cluster (~5,900/mo): /fees retitled "Online MBA & Degree Fees 2026: 125 Universities Compared". IGNOU ₹31,500 vs ₹66,000 conflict in posts awaiting Rishi.
- 2026-10-27 · online msw programs (590) + masters in social work online (390): /blog/online-msw-india from the UGC-DEB HEI register (5 online, 29 ODL for 2026-27).
- 2026-10-27 · worth-it cluster (3,240/mo): is-online-mba-worth-it-2026 rewritten without fabricated stats.
- 2026-10-27 · diploma cluster (~5,200/mo): /blog/online-diploma-courses-india (8 online PG diplomas 2026-27; engineering diplomas barred). "online courses after 12th" already covered by online-bachelors-ug-courses-india.
- 2026-10-27 · MBA spec rows: healthcare/hospital administration (1,000) and HR (800) hub titles fixed.
- 2026-10-27 · MBA head terms (~14,600/mo): /programs/mba retitled with "Courses"; working-professionals and executive MBA titles fixed.
- 2026-10-27 · BBA / BCA / MCA hubs (bba online 2,900; online bba course 1,600; online mca course 1,900; mca online 1,300; bca online 1,300; online bca course 1,300; degree/program tails ≈ 13,400/mo): hub titles "Online {X} Courses in India 2026: N UGC-DEB Universities" (57 chars), descriptions 132-136 chars, H1s aligned. BCA/MCA added to PROGRAM_HUB_SEO_SLUGS so the collision gate covers them.
- 2026-10-27 · B.Com / M.Com hubs (mcom online 880; online b com course 480; online mcom course 390; bcom online 390; bcom online classes 210 ≈ 2,350/mo): same "Courses" title pattern (59 chars), the "Admissions 2026 open" template promise dropped. UPES (4,400) and UU (2,400) rows checked: brand-led titles already shipped in Bucket A part 1, nothing to change in metadata.
- 2026-10-27 · IGNOU admission cluster (ignou online admission 6,600; ignou online registration 6,600; dated 2021/2022 variants 4,200; apply/portal/form tails; IGNOU MBA admission rows ≈ 24,450/mo): /blog/ignou-online-admission-guide from IGNOU's two Samarth portals (ODL and online), their admission FAQs, the MBAOL page and the Common Prospectus July 2026. No dated "2021" text: the post answers the current cycle and says the July 2026 registration was closed on 27 Oct.
- 2026-10-27 · Amity portal cluster (amityonline com 5,400; amityonline.com 3,600; amity online com / amity online.com 2,900 each; amigo amity online 1,900; www amityonline com 1,900; amigo.amityonline 590; amity online digital campus 720; amity online exam 210 ≈ 21,780/mo): /blog/amity-online-student-portal-login from amigo.amityonline.com, the amityonline.com FAQ and contact page. "Digital campus" is not a term Amity uses on those pages, so the post does not define it.
- 2026-10-27 · LPU LMS cluster (lms lpu online 3,600; lpu online lms login 1,600 ≈ 5,200/mo): /blog/lpu-online-lms-login from lms.lpuonline.com and lpuonline.com/contact-us.
- 2026-10-27 · Brand navigational rows (amity online 90,500; lpu online 12,100; jain online 8,100; manipal online 5,400 etc.) checked: overview titles already lead with the brand; the official sites own these queries. No metadata change.
- 2026-10-27 · computing cluster (computer science online course 2,400; online cs degree 1,000; data science online degree 880; online cyber security degree 480 ≈ 4,760/mo): /blog/online-computer-science-degree-india. Rule from UGC 2020 Regs Reg 4 (coding exception) and the Nov 2024 prohibited list; specialisation counts from lib/data.ts via getResolvableProgrammes. Psychology rows (~3,400/mo) stay parked: Rishi holds that online psychology is valid. CFA/CMA/ACCA/FRM rows (~3,700/mo) parked: professional bodies are not on the approved source list.
- 2026-10-28 · #11 · `/blog/online-degree-admission-process-india` · ~4,400/mo (admission & eligibility cluster) · sources: UGC ODL/Online Regs 2020 Regs 2(b), 4, 14, 22; UG/PG Regs 2025; DEB notice 11 Nov 2024; circular 7-2/2026; Fee Refund Policy 2024-25 + 27 Oct 2025 notice. Programme counts from lib/data.ts via getResolvableProgrammes on 28 Oct (BBA 77, B.Com 56, BCA 54, BA 27, BSc 2). No rupee figure. Blocked facts: January 2027 DEB cut-off not yet published.
- 2026-10-28 · Remaining export rows after #11: (a) university application-portal rows (Amrita 850, SASTRA ~810, Christ 260, LPU 590) need each portal read first, same pattern as the Amity/LPU portal posts; (b) "difference between online and distance learning" 420, only an MBA-specific post exists; (c) small tails (public policy ~710, library science ~680, BMS, DCA) need a DEB register check before writing; (d) psychology, CFA/CMA/ACCA, taxation, IIM certificates stay parked. Flag for Rishi: /blog/online-mba-admission-process-india-2026 carries unsourced figures ("60 percent of delays", early-bird waiver amounts per university).
- 2026-10-28 · #11 live check: 200, index,follow, self-canonical, in sitemap.xml, title/meta/H1 match source, Article + FAQPage (7 Q) + BreadcrumbList schema, zero rupee figures rendered (source has none), all 57 internal hrefs return 200 with no redirect. No mismatch.
- 2026-10-28 · Rishi's Semrush read (India, 28 Oct): online-vs-distance comparison is ~270/mo (odl full form and distance mba are off-target); portal admission intent is ~1,400/mo, login queries (amity online login 33,100, srm online portal 1,900) are existing students. Both deprioritised.
- 2026-10-28 · Amity / MUJ online MBA review blogs: NOT written, both already exist (`/blog/amity-online-mba-review-2026`, `/blog/muj-online-mba-review-2026`; no duplicate slugs). Diagnosis below; no change made.

### Amity / MUJ MBA review diagnosis, 28 Oct
Both posts: 200, index,follow, self-canonical, in sitemap. Linked from their MBA hubs (2 links each) and from other posts (Amity 13, MUJ 8). Not linked from the university overview pages. Indexing and linking are not the problem.

| Query (India/mo) | Our best URL and Semrush position |
|---|---|
| amity online mba 8,100 | no edifyedu.in URL in the top 100 |
| amity online mba fees 2,400 / amity mba online fees 1,900 / amity university online mba fees 1,600 | /universities/amity-university-online/mba at 54 / 54 / 61 |
| amity online mba review 140; amity online review 170 | the review blog at 11-12 (only queries it ranks for) |
| manipal jaipur fees 6,600 | /universities/manipal-university-jaipur-online at 41 |
| manipal university jaipur mba fees 1,900 | /compare/manipal-jaipur-vs-manipal-mahe 20, overview 63, MBA hub 75 |
| muj review blog | not checked: Semrush API units hit zero mid-run |

GSC (3 months to 8 Oct): Amity review 11,231 impressions, 0.15% CTR, avg position 7.79 (long-tail mix). MUJ review 1,669 impressions, 0.12%, 7.49. Amity MBA hub 591 impressions at avg 43.

Why they do not rank for the ~20,000/mo:
1. **Intent.** Both titles say "review". The Amity post ranks 11-12 for the review queries, about 450/mo combined. The volume sits on the navigational head term ("amity online mba", where the official portal and aggregators hold the SERP) and on fee queries, where Google picks the hub, not the blog.
2. **Fee queries split across 3-4 URLs.** For "manipal university jaipur mba fees" three edifyedu.in URLs rank at once (20, 63, 75) and the compare page beats the hub. Same pattern as memory `project_fee_query_gap`.
3. **Amity post `title` and `seoTitle` disagree** ("...Fees 2026: ₹2.07L Review..." vs "...Who It Actually Suits"). The live <title> uses seoTitle, so the fee wording never reaches the SERP.
4. Site-wide context: the Sep 2026 spam-update decline (memory `project_spam_update_decline_oct2026`); measure before reworking.
Not a problem: `/review/{slug}` URLs Semrush still lists are noindex review-submission forms.
Decision needed from Rishi: which single URL owns "{uni} online mba fees" (hub or review), before retitling either.

## Next gap after the review decision: portal admission guides (parked 28 Oct)
Admission intent only, no login pages: lpu online admission 590, amity online admission 260, amity online portal 210 (only the admission side), cu online admission 210, nmims online portal 170 (admission side) ≈ 1,400/mo. Read each official admission page first; same pattern as the Amity/LPU portal posts. Do not target "amity online login" (33,100) or "srm online portal" (1,900).
