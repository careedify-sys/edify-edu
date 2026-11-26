# EdifyEdu Operating Plan

## Status (updated end of every session)
- **Done:** Phase A (f2f80c5), A5, A8 + A9 (35ffee3), D4 fees for NIU, Alliance, Sharda, JIIT (1021c26), B3 batch 1 (1ed2ea6, 18 Nov), B3 batches 2 and 3 (b9e18b2) and B3 batch 4 (b3b04f8, 19 Nov), B3 batch 5 (9e76268) and B3 batch 6 (6fc160b, 25 Nov), B3 batch 7 (51b60d1, 26 Nov), B3 batch 8 (a1a83a5) and B3 batch 9 (218303f) and B3 batch 10 (c91cf91) and B3 batch 11 (8a3d15c) and B3 batch 12 (8baa285, 26 Nov), B3 batch 13 (dd2c07f, 27 Nov), all live and checked; verify sheets for the 10 queue universities plus Vignan; NAAC audit of all 143 (audits/naac-audit-2026-11-19.md).
- **In progress:** none. Next (B3 batch 14): spec-page content JSONs print derived EMIs (MAHE 12,167 x6, LPU 6,733 x9, Jindal 6,319 x6); amity-online-mca-fees-review FAQ "Rs 1,70,000 total" vs programFees.mca 1,99,000; amity-vs-manipal "Rs 54,000 saved" derived from old MUJ fee; UPES posts Rs 1,75,000 vs getExactFee 1,75,000-2,20,000; placement post sector LPA ranges; nmims-vs-symbiosis "monthly difference" wording; Mysore/Yenepoya fees stated in Karnataka post but getExactFee none (portal check). BLOCKED on Rishi: Q58 BBA EMI cluster, Q59 rule 4d fallback. why-2026 qualitative bullets need a source decision; salary-calculator ROLES unsourced (Rishi call); Q52 stale (spec salary ranges removed in batch 9); ~24 university-reported "highest package" figures (fact-checker against portals); ~2,500 other blog salary figures (unsourced); coupon template prints officialUrl in visible copy (site-wide decision); MAHE/SMU/SRM Sikkim/Amity Coursera claims (no record either way, Q56). After 5 Dec (freeze lifts): fix frozen metaDescriptions with false claims (DY Patil "most affordable WES", "Cheapest Online MBA" titles, salary-guide and mba-marketing LPA metas, Shoolini "QS #1 private", Jamia "nobody else").
- **Blocked:** none in D4.
- **Waiting on Rishi:** Q1, Q2, Q7 (28 Nov guard baseline), Q8-Q51. Urgent: NAAC (Q20 DY Patil, Q24/Q43 Amity, Q28 Uttaranchal, Q42 nine ungraded, Q46 end dates, Q47 lapsed cycles). One answer settles many: Q27 (Jan 2027 intake), Q46 (NAAC end dates). See audits/QUESTIONS-FOR-RISHI.md.
- **Next:** B1 provenance fields, then B4 answer-first block.

**Created:** 16 Nov 2026 · **Owner:** Rishi Kumar · **Review:** every Monday
**Built from:** the First Priorities & Daily Improvement Playbook (16 Nov), the SEO + AEO + GEO audit (`audits/seo-aeo-geo-audit-2026-11-16.md`), the ranking plan tracker (`audits/ranking-plan-tracker.md`) and `audits/FIX-LOG.md`.

---

## 0. How this file works

The work is scattered because each new idea starts its own track. From now on there are three files, and each has one job:

| File | Job | Who updates it |
|---|---|---|
| **`audits/OPERATING-PLAN.md`** (this file) | **What** we do, in what order, and why. The one backlog. | Updated each Monday, and whenever an item opens or closes |
| `audits/ranking-plan-tracker.md` | **What shipped**: batch log, commits, live checks, check dates | After every merge |
| `audits/FIX-LOG.md` | **Why** each fix was made | After every fix |

**The rule:** if a task is not in Section 4 of this file, it does not get worked. A new idea goes to the bottom of the backlog with a priority, and the next Monday review decides it.

---

## 1. Where we stand

### 1.1 Why it feels like "a few here, a few there"

Since 1 Aug 2026, main has taken **635 commits**. They are spread across at least nine tracks that ran side by side:

1. keyword-gap blog batches (7 batches)
2. coupon pages
3. the Online DBA section
4. first-hand content rounds (Amity, NMIMS, MUJ)
5. fee sweeps (MUJ, UU, CU, IGNOU, BITS, Bharati)
6. spam-update recovery
7. AI-visibility rounds
8. title rescue
9. spec-page noindex and fact fixes

Each track was sensible on its own. Together they never finished one page type to a standard. The playbook's order is the fix: **health first, then facts, then core templates, then expansion.**

### 1.2 Numbers we start from

| Measure | Value | Source |
|---|---|---|
| Sitemap URLs (live) | 2,301 | live sitemap, 16 Nov |
| Clicks, 11 Aug to 10 Nov | 12,855 (tools 8,202 · blog 2,555 · spec 804 · verify 453 · hubs 400 · university pages 51) | tracker baseline |
| Brand clicks (3 months) | 39 | tracker baseline |
| Hub impressions per day, Sep to Oct | 1,003 to 554 (**-45%**) | `audits/hub-spec-ranking-drop-2026-11-05.md` |
| "nmims online mba fees" rank | hub #43 | Semrush, 12 Nov |
| Referring domains | 57 | Semrush, 12 Nov |
| Blog posts | 266 | live sitemap |

**What it says:** 64% of clicks come from calculators. The pages that should win students, the university and MBA pages, earn 451 clicks between them. **The core templates are the gap, not the number of pages.**

---

## 2. Done so far, mapped to the playbook

Status: ✅ done and verified live · 🟡 partly done · ❌ not started

### Playbook steps

| Step | Status | Evidence |
|---|---|---|
| 1. Record current state | ✅ | SEO/AEO/GEO audit 16 Nov; spec inventory 14 Nov; GSC join 14 Nov |
| 2. Prioritise | 🟡 | Ranking plan has batches and check dates, but no single ranked backlog until this file |
| 3. Improve core pages | 🟡 | First-hand content on Amity, NMIMS and MUJ university pages and MBA hubs (13 Nov). No written page standard; the other ~140 universities are untouched |
| 4. Improve data daily | 🟡 | Fee sweeps and gates exist. No provenance fields (source URL, session, checked date) |
| 5. Measure | 🟡 | GSC check dates set to 9 Jan. No weekly scorecard. No AI prompt panel |

### Playbook priorities

| Pri | Workstream | Status | What is done | What is missing |
|---|---|---|---|---|
| P0 | Indexing / canonical health | ✅ | 361/361 sampled URLs return 200, are self-canonical and indexable; 71 noindex hubs out of sitemap (adb2848); 686 near-copy spec pages noindexed (cb2744b); soft-404 and redirect fixes; lastmod from git history | 4 low cleanups (audit T1, T2, T3, T5) |
| P0 | Critical factual accuracy | 🟡 | 1,022 fake testimonials and 126 employer lists removed; NIRF category gate; NAAC from Supabase; fee gates (blog, hub text, red flags, page-content facts); exam mode checked on 31 universities; DEB ID explainer on every hub | **S1: invented NAAC rating in schema on 143 pages (Critical).** S2: Edify's phone on the university entity. 263 spec fee MISMATCH left. 125-row placeholder fee cluster. 7 exam modes unverified |
| P1 | Core templates | 🟡 | `/programs/mba` answers fees, cheapest, one-year and best, with a data table; first-hand blocks on 3 universities | No written standard for the 3 core page types. Official university link (`officialUrl`) on only 23 records and not rendered as a source link |
| P1 | Internal linking | ✅ | Owner links: 149 in 79 posts plus 49 template pages; verify pages linked from hubs; spec link starvation fixed | MUJ review to hub link (waits for a real update) |
| P1 | Content usefulness | 🟡 | 51 spec JSONs fixed (overlap 86% to 41%); 513 spec pages on the improve worklist | 945 indexed spec pages still on the generic fallback (49-78% shared text); worklist decision due 26 Dec |
| P2 | AEO coverage | 🟡 | Answer posts (NMIMS government or private, CDOE, worth-it); `/programs/mba` answers | No question-to-page map; fee answer not above the fold on hubs |
| P2 | GEO measurement | ❌ | `llms.txt` exists; AI crawlers allowed | No prompt panel; `llms.txt` overclaims "all data independently verified" |
| P2 | Authority / distribution | 🟡 | YouTube reviews embedded; brand in body text | 57 referring domains; LinkedIn, Quora and HARO all on Rishi's list, not started |

---

## 3. The strategy: three phases, each with an exit gate

A phase ends when its **exit gate** passes, not on a date. The dates are targets.

### Phase A: Trust and stability (17 to 30 Nov)

**Goal:** nothing on the site states a fact we cannot back up, and the 14 Nov noindex has settled.

- Fix S1 and S2 (schema), and the 4 low technical items, in one deploy.
- Correct the `llms.txt` claim.
- Write the three **page standards** (Section 6) as checklists.
- 21 Nov and 28 Nov checks from the tracker.

**Exit gate:** zero `Review`/`ratingValue` in university schema on all 143 pages · 28 Nov check passes (clicks outside `/tools` within 15% of ~350 a week) · three standards approved by Rishi.

### Phase B: Core templates and data (1 to 31 Dec)

**Goal:** the top 10 universities have a university page and an MBA hub that meet the standard, with every volatile fact sourced and dated.

- Add provenance to `lib/data.ts`: `{ value, sourceUrl, checkedOn, session }` for fee, DEB entitlement, NAAC and NIRF. Render the checked date beside the fee and the DEB session beside the approval. The fee gate fails on a missing `checkedOn`.
- Render the university's official site as a source link on the profile and the hub.
- Bring 10 universities to the standard, one per working day, through the daily routine (Section 5).
- Answer-first block on each hub: total fee, eligibility, exam mode, each with its date.
- 26 Dec: apply the existing spec rule to the 513 worklist (improved pages stay, the rest get noindexed).

**Exit gate:** 10 universities pass the standard checklist · `checkedOn` present on every fee for those 10 · 26 Dec spec decision applied.

### Phase C: Measure, then extend (Jan 2027)

**Goal:** prove what moved, then copy it.

- Week 1: AI prompt panel baseline (25 prompts, Section 7).
- 9 Jan: full re-test against the baseline (GSC 3 months plus Semrush).
- Extend the standard to the next 10 universities, then to the MCA and BBA hubs, **only for the page types that moved**.

**Exit gate:** a dated scorecard showing which page types gained, and a decision on what to scale.

### Content freeze until the Phase B exit

**Decided (D1): the freeze runs until the 9 Jan 2027 re-test and covers blog, coupon, DBA, compare, programme and Q&A pages.** The original draft said until the Phase B exit, with two exceptions:

- worth-it posts for SMU, Symbiosis and Parul, once Rishi's first-hand notes exist
- an existing page whose facts change

Reason: 266 posts already exist, the playbook says the first improvement "is not another blog post", and blog impressions are not where the student-decision gap is. **This is a recommendation; it needs Rishi's yes (Decision D1).**

---

## 4. The backlog (the only list we work from)

Order = priority. Effort: XS under 1h · S half a day · M 1-2 days · L 3+ days.

| ID | Pri | Item | Owner | Phase | Effort | Status | Acceptance test |
|---|---|---|---|---|---|---|---|
| A1 | **Critical** | Remove the invented NAAC `Review` from university schema (audit S1) | site-engineer | A | XS | Done 18 Nov (live f2f80c5) | `curl` all 143 profiles: 0 `"@type":"Review"`, 0 `ratingValue` |
| A2 | High | Remove Edify's phone from the university entity; `sameAs` to the official site where `officialUrl` exists (S2) | site-engineer | A | S | Done 18 Nov (live f2f80c5) | NMIMS and Calicut JSON-LD: no `telephone` on the university node |
| A3 | Low | Batch: `/admin-login` noindex, one robots disallow list, clean 404 meta, prune CSP origins (T1, T2, T3, T5) | site-engineer | A | S | Done 18 Nov (live f2f80c5) | probes in the audit return the expected values |
| A4 | Medium | `llms.txt`: replace "all data is independently verified" with a claim that is true | site-engineer | A | XS | Done 18 Nov (live f2f80c5) | text matches what pages show |
| A4b | Low | D5 spelling fix in `BlogCTACard.tsx:72` | site-engineer | A | XS | Done 18 Nov (live f2f80c5) | rendered line reads "edifyedu.in earns zero commissions" |
| A8 | **Critical** | BITS WILP is labelled UGC-DEB entitled (lib/data.ts:7580, its MBA JSON :21 and :103) but has zero rows in the DEB register 2020-27; its basis is Institution of Eminence status (UGC 548th meeting, 09.09.2020). State the true basis. Also fix location (Pilani, Rajasthan), the fake specs in its TL;DR, and the "QS World" wording on a QS Asia rank | site-engineer | A | S | Done 18 Nov (live 35ffee3) | BITS pages carry no "UGC-DEB" approval claim; register basis shown |
| A9 | **High** | Unsourced claims in shared components on every university page: scholarship "Save up to Rs 20,000-40,000" and 25% merit/early-bird (UniversityPageClient.tsx:361,389,717-719); "100% Online" (QuickFactsCard.tsx:13, UniversityPageClient.tsx:614); "MBA (Regular)" (QuickFactsCard.tsx:16); class hours and "replay within 48 hours" (SectionClasses.tsx:12,21); placement assistance (SectionPlacements.tsx:21); generic syllabus (SectionCoreSubjects.tsx:10-17); "Included in total (usually)" exam fee (FeeBreakdown.tsx:84). Remove, or render only from a sourced per-university field | site-engineer | A | M | Done 18 Nov (live 35ffee3) | grep of all built university pages finds none of these strings unless the record carries a sourced field |
| A5 | High | Write 3 page standards as `audits/PAGE-STANDARDS.md` (from Section 6) | site-engineer | A | S | Done 16 Nov (audits/PAGE-STANDARDS.md) | file exists; every line is checkable on a rendered page |
| A6 | High | 21 Nov and 28 Nov checks | seo-analyst | A | XS | Date-locked | results written into the tracker |
| D4 | Medium | Fee pages for NIU, Sharda, Alliance, JIIT (D4 rule) | fact-checker, then site-engineer | A/B | S | Done 18 Nov (live 1021c26) | one sheet per university in audits/verify/; data changed only on a published total |
| B1 | High | Provenance fields in `lib/data.ts` and their rendering; fee gate requires `checkedOn` | site-engineer | B | M | Open | gate fails on an injected missing date, passes after |
| B2 | Medium | Official site in schema `sameAs` only (D6: no visible links); fill `officialUrl` for the top 10 | fact-checker, then site-engineer | B | S | Open | top 10 profiles carry `sameAs` to their own domain |
| B3 | High | Top 10 universities to the standard (daily routine) | fact-checker, then site-engineer | B | L | Open | 10/10 pass the checklist |
| B4 | High | Answer-first block on MBA hubs (fee, eligibility, exam mode, dates) | site-engineer | B | M | Open | above the fold on the top 10 hubs |
| B5 | High | 26 Dec spec decision on the 513 worklist (existing rule) | seo-analyst, then site-engineer | B | S | Date-locked (26 Dec) | applied, sitemap and robots agree |
| B6 | Medium | Resolve 263 spec fee MISMATCH (NIU, Alliance, Sharda first) | fact-checker, then site-engineer | B | M | Follows D4 | MISMATCH count reaches 0 or each is allowlisted |
| B7 | Medium | 7 unverified exam modes; counsellor wording after 28 Nov | fact-checker | B | S | Date-locked (28 Nov) | each has a source or the counsellor line |
| C1 | Medium | AI prompt panel: build 25 prompts, run the baseline | seo-analyst | C | S | Open | dated CSV with cited URLs and fidelity |
| C2 | Medium | 9 Jan re-test and scale decision | seo-analyst | C | S | Date-locked (9 Jan) | scorecard written |
| C3 | Medium | Regression gate: schema claims (no NAAC review, no phone on the university) | site-engineer | A/B | S | Done 18 Nov (check-schema-claims gate in pre-commit) | fails on an injected defect |
| C4 | Low | Placeholder fee cluster (125 rows): unlock hubs one portal check at a time | fact-checker | ongoing | daily | Ongoing | each unlocked hub has `checkedOn` |
| QA | n/a | Every item above is checked by qa-checker before merge and after deploy | qa-checker | all | n/a | Standing | audits/qa/{date}-{item}.md says PASS |
| P1 | Rishi | Request indexing, first-hand notes, student reviews, LinkedIn/Quora/HARO | Rishi | ongoing | n/a | Rishi only | logged in the tracker |

**Parked (not before Phase C):** new keyword-gap posts, DBA Q&A posts, more coupon pages, the MCA/BBA spec JSON rollout, title changes on review posts (frozen to 5 Dec in any case).

---

## 5. The daily routine (60 to 90 minutes)

One record, done properly, beats ten touched.

| Min | Step | Output |
|---|---|---|
| 10 | Take the next university from the queue below | one record in scope |
| 30 | Check the official portal and `deb.ugc.ac.in` (HEI programme list, mode column) for fee components, session, eligibility, exam mode and syllabus | saved URLs, screenshots in `data/first-hand/` |
| 20 | Update `lib/data.ts` with `checkedOn` and `sourceUrl`; Claude runs the gates | commit on the day's branch |
| 10 | Check the rendered page on mobile: fee, date, links, title | pass/fail per standard item |
| 5 | One line in the tracker batch log: what changed, source, date, next review date | log entry |

**Deploys:** one merge per batch of 3 to 5 universities, not one per university (every push is a paid Vercel deploy).

**Working queue (data-led, 16 Nov; `audits/queue-ranking-2026-11-16.md`).** Ranked by October 2026 impressions on the MBA cluster (profile + MBA hub + MBA spec pages + MBA review post), kept only if also top 10 for Sep-Oct. Q1 (the Phase A prompt's D3) overrides this if it arrives.
1. BITS Pilani WILP (8,748 impr / 45 clicks, Oct; fee never checked)
2. Galgotias (3,934 / 5)
3. JAIN (2,743 / 6)
4. Dayananda Sagar (1,857 / 16; fee never checked)
5. Symbiosis (1,866 / 8)
6. Dr. D.Y. Patil Vidyapeeth (1,784 / 1; fee never checked)
7. Amity (1,343 / 4)
8. Uttaranchal (1,172 / 7)
9. Shoolini (1,084 / 9; fee never checked)
10. Adichunchanagiri (841 / 9; MBA hub at position 5.2)

NMIMS, MUJ, SMU, LPU, Chandigarh, Amrita and UPES dropped out: each under 900 Oct cluster impressions, or a hub at position 49+ with 0 clicks. Searches for brand MBAs land on the review posts, not the hubs, which is the B4 answer-first problem.

**Original proposal (superseded):**
1. NMIMS
2. Amity
3. Manipal University Jaipur
4. Sikkim Manipal
5. Symbiosis
6. LPU
7. Chandigarh
8. JAIN
9. Amrita
10. UPES

The first five already have review posts and owner links, so their hubs gain first.

---

## 6. Page standards (draft, for approval in Phase A)

A page "meets standard" only when every line is true on the rendered page.

**Online MBA hub (`/programs/mba`)**
- [ ] Scope sentence (how many universities, which session)
- [ ] Comparison table from `lib/data.ts`, with the fee methodology stated
- [ ] Eligibility overview
- [ ] Links to every indexable university MBA hub
- [ ] Sources (UGC-DEB, NIRF) and an update date

**University profile (`/universities/{id}`)**
- [ ] Official name, location, official site link
- [ ] UGC-DEB entitlement with session and a link
- [ ] NAAC grade with cycle validity, or nothing
- [ ] NIRF with category and year
- [ ] Links to its online programmes
- [ ] Schema without invented ratings
- [ ] Checked date

**University MBA hub (`/universities/{id}/mba`)**
- [ ] Exact degree title, duration and mode
- [ ] Eligibility as printed by the university
- [ ] DEB entitlement for the session
- [ ] Fee components (total, per semester or year, registration, exam, add-ons) with `checkedOn` and the portal link
- [ ] Exam mode with source
- [ ] Semester-wise syllabus with its version
- [ ] Learning model, kept apart from marketing claims
- [ ] No placement or salary figure without a published source
- [ ] Answer-first block at the top

**Comparison page (`/compare/{pair}`)**
- [ ] Same criteria for both universities
- [ ] Dated facts
- [ ] "Who each suits" line
- [ ] Links to both MBA hubs

---

## 7. Measurement

### Weekly scorecard (every Monday, one row per week, kept below)

| Week | Critical open | Sitemap URLs | Clicks (non-tools) | Impr hubs/day | Universities at standard | Facts with `checkedOn` | Prompts cited / run | Leads |
|---|---|---|---|---|---|---|---|---|
| 16 Nov (baseline) | 1 (S1) | 2,301 | ~350/wk (Aug-Nov avg) | 554 (Oct) | 0 | 26 fee dates, unrendered | not run | from Sheets |
| W43 19-25 Oct (Windsor) | | | 212 (tools 573) | univ. section 9,532 impr/wk | | | | |
| W44 26 Oct-1 Nov | | | 194 (tools 725) | 11,121 | | | | |
| W45 2-8 Nov | | | 144 (tools 630) | 8,496 | | | | |
| W46 9-15 Nov (noindex live 14 Nov) | 1 (S1) | 2,301 | 151 (tools 436) | 8,861 | 0 | 26 | not run | |

Weekly source from 16 Nov: Windsor.ai, Search Console connector, property `sc-domain:edifyedu.in`, ISO weeks. Site totals: W43 784 clicks / 148,597 impr; W44 919 / 172,800; W45 774 / 139,896; W46 587 / 117,132. The 350 guard baseline is questioned in Q7.

Rules: GSC trend from Chart.csv; page segments from Pages.csv only (Queries.csv is capped); never subtract two Pages exports.

### AI prompt panel (Phase C)

- 25 prompts: 4 category, 5 fees, 3 syllabus, 3 recognition, 4 comparison, 3 eligibility, 3 decision.
- Engines: ChatGPT Search, Perplexity, Gemini.
- 3 runs each, monthly. Log the fields from the playbook (ID, exact prompt, platform/date, target URL, mentioned vs cited, cited URL, other sources, gap, action, retest date).
- Store in `audits/geo-panel/YYYY-MM.csv`.

### Calendar (all in one place)

| Date | What |
|---|---|
| Every Monday | Backlog review and scorecard row |
| 21 Nov | URL Inspection on changed pages (tracker) |
| 28 Nov | Noindex settle check; Phase A exit |
| 5 Dec | Review-title freeze ends |
| 7 Dec | Brand searches (monthly) |
| 12 Dec | Owner pages and worth-it post ranking check |
| 26 Dec | Spec worklist decision; Phase B exit target |
| Early Jan | AI prompt panel baseline |
| 9 Jan | Full re-test; Phase C scale decision |

---

## 8. Rules that keep it on track

- One bounded task at a time. State the scope, show the evidence, wait for the yes, then do it.
- No page is created, deleted, noindexed or redirected because of a similarity score, an SEO tool score, or one AI answer. Decide per URL with GSC data.
- No fact changes without a portal or regulator source. No typed fees in prose: fees render from data.
- Re-probe any worklist older than a few days before acting on it.
- Every fix gets a FIX-LOG entry with the why, and a tracker line with the commit.

---

## 9. Rishi's decisions (final, 16 Nov 2026; never ask again)

| ID | Decision |
|---|---|
| D1 | **Content freeze is ON until the 9 Jan 2027 re-test.** No new blog, coupon, DBA, compare, programme or Q&A pages. This replaces the "until Phase B exit" wording in Section 3. |
| D2 | **Approved:** A1 + A2 + A3 + A4 ship as one deploy. |
| D3 | As set out in the Phase A prompt. That file is not in the repo (Q1), so the Section 5 order stands until it arrives. |
| D4 | No longer waits on Rishi. fact-checker reads the official MBA fee pages for NIU, Sharda, Alliance and JIIT (`jaypee-university-online`). Where a page publishes a total, use that total exactly as published and record the URL and date. Where a page shows only parts, or contradicts itself, keep that hub's fee suppressed and add one question to the questions file. |
| D5 | Change "EdifyEdu" to "edifyedu.in" in the commission line of `components/BlogCTACard.tsx:72` (the card on the Amity review and every post that uses it). Spelling only, no other word. It then matches "edifyedu.in earns zero commissions" elsewhere. |
| D6 | No links to official university sites in visible copy. B2 is narrowed to schema `sameAs` only. |
