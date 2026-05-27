# Sprint Tracker — Topical Authority
*Single source of truth for all topical authority sprint work on edifyedu.in*

---

## Sprints completed

### Sprint 1: Initial audit (Run 1, 119 blogs)
- **Date:** 2026-05-26 (pre-import baseline)
- **Corpus:** 119 published posts, 41 clusters mapped
- **Tool:** `scripts/topical-audit/generate-audit.js`
- **Outcome:** 2 STRONG / 4 DEVELOPING / 23 WEAK / 12 MISSING

---

### Sprint 2: 18-blog import + spec hub discovery + first link injections (Run 2–3)
- **Date:** 2026-05-26–27
- **Commits:** `67db69b` `d87b9dd` (meta retitles) → `b69ca24` through `507d8f1` (hub wiring)
- 18 blogs imported (BBA reviews, MBA spec pages, UPES, JAIN, XLRI)
- 4 spec hubs found pre-built in SPECS object: HR, SCM, Analytics, Healthcare
- 19 link injections wired from existing posts to those 4 hubs
- A3 BBA cluster received 9 inbound links to `/programs/bba` hub (0 → 9)
- **Outcome:** A3 Online BBA → **STRONG** / B1 HR + B4 SCM + B5 Analytics + B6 Healthcare/Hospitality → **DEVELOPING**
- 3 STRONG / 9 DEVELOPING / 22 WEAK / 8 MISSING (Run 3 baseline = Run 4 pre-sprint)

---

### Sprint 3: 3 new spec hubs + BBA cannibalisation fix
- **Date:** 2026-05-26–27
- **Commits:** `e6dcfef` (FinTech hub) `ec03463` (Logistics + Hospitality hubs) `280645e` `ae4f156` (link injections)
- FinTech, Logistics Management, Hospitality Management hubs added to SPECS object
- 4 link injections wired to new hubs (each at 2 inbound on completion)
- 3 meta retitles to resolve BBA cannibalisation: `online-bba-india-2026` → admission guide, `online-bba-in-india-2026` → hub overview, `online-bba-programs-india-2026` differentiated
- B2 Finance/FinTech → **DEVELOPING** (2 inbound links, hub live)
- Scorecard after this sprint: same as Run 4 baseline above (Sprint 4 didn't change cluster status)

---

### Sprint 4: CTR rewrites + em-dash removal + hygiene
- **Date:** 2026-05-27
- **Commits:** `1c8d874` `9c432e1` `7d8dc70` `62f8c84` `463686a`
- 5 CTR rewrites (MUJ, Amity, SMU, Toughest Exams, BComm) — top 5 of V2 CTR target list
- 513 em dashes removed across 63 blogs (all 7 batches)
- Competitor outbound links removed from `online-manipal-mba-review-2026`
- NMIMS H2/H3 hierarchy fixed
- Locked-rule guard installed (`scripts/check-locked-rules.js` → `.git/hooks/pre-commit`)
- **No cluster status changes** (hygiene only)
- Baseline confirmed: 3 STRONG / 9 DEVELOPING / 22 WEAK / 8 MISSING

---

### Sprint 5: Bucket 1 + D5 wiring + E1/E2 hub build + double-space cleanup
- **Date:** 2026-05-27
- **Commits:** `1bc8bf5` `bb1e7ec` `69e22cc` `af0e029` `c7340ad` `1a9400b` `72d2c3a` `f0e4305` `19ad641`
- **Bucket 1 — 3 link injections** (push FinTech, Logistics, Hospitality from 2 → 3 inbound each):
  - `best-mba-specialization-india-2026` → `/programs/mba/specializations/fintech`
  - `mba-operations-management-career-2026` → `/programs/mba/specializations/logistics-management`
  - `career-after-mba-jobs-salary-scope-2026` → `/programs/mba/specializations/hospitality-management`
- **D5 — 7 link injections** to existing hub `/guides/online-mba-eligibility-india`:
  - Source blogs: entrance-exams, MAT, CMAT, CAT, eligibility-criteria, admission-process, GD-topics
- **E1 hub built:** `/guides/career-after-mba-india` (~12,400 chars, 8 inbound links from blog.ts)
- **E2 hub built:** `/guides/salary-after-mba-india` (~10,600 chars, 7 inbound links from blog.ts)
- **Double-space cleanup:** 0 prose double-spaces remaining (9 locations fixed across 7 blogs + Pexels attributions)
- **Outcome:** 3 STRONG / **12 DEVELOPING** / **20 WEAK** / **7 MISSING**
  - E1 (career-after-mba-india): WEAK → **DEVELOPING**
  - E2 (salary-after-mba-india): WEAK → **DEVELOPING**
  - D5 (admission/eligibility): WEAK → **DEVELOPING**

---

## Scorecard history

| After sprint | STRONG | DEVELOPING | WEAK | MISSING | Total |
|---|---|---|---|---|---|
| Run 1 baseline | 2 | 4 | 23 | 12 | 41 |
| Sprint 2 (hub wiring) | 3 | 9 | 22 | 8 | 42 |
| Sprint 4 (hygiene) | 3 | 9 | 22 | 8 | 42 |
| Sprint 5 (Bucket 1+D5+E1+E2) | **3** | **12** | **20** | **7** | 42 |

---

## Pending

### Immediate (small, no new writing)
- Pull GSC data export for E1, E2, D5 hubs (~2026-06-10, first meaningful impressions)
- Submit 86 invisible blogs to GSC manually (from `scripts/seo-audit/` invisible list)
- Note current GSC baseline before CTR rewrites land: 791 clicks / 279K impressions (last 90 days)

### Wait for data (check 2026-06-10)
- Compare clicks and impressions for the 5 CTR-rewritten blogs vs pre-sprint baseline
- Check first impressions on E1, E2, D5 hubs (new pages, expect 0–low initially)
- Decision gate: if any CTR-rewritten blog shows CTR lift > 1 pp, scale to remaining 15 rewrites

### Hygiene sprint (when ready, ~1 day)
- Fix 18 H1-in-body violations (pre-existing, not sprint-caused — see `16-POST-VERIFICATION-AUDIT.md` §1.4)
- Audit FAQ schema for 40 blogs missing `FAQPage` structured data
- 15 remaining CTR rewrites (rows 6–20 of V2 CTR target list)

### Content sprints (large, defer until GSC signals justify)
- **MCA cluster** (A2 → STRONG): 8–10 new posts, ~2 weeks
- **WEAK university clusters** (7 universities, see `17-TOPICAL-AUTHORITY-PENDING.md` Bucket 3): 2–3 posts each
- **WEAK program clusters**: BCA (A4), MA (A5), BCom (A8) — each needs 2–3 posts to reach DEVELOPING

### Decision point: Bucket 3 (WEAK universities)
Don't build until GSC shows 500+ impressions/month for any cluster's existing posts.
Lowest-effort: C-amity and C-lpu each need only 1 post to reach DEVELOPING.

---

*Last updated: 2026-05-27 | Next review: 2026-06-10 (GSC data pull)*
