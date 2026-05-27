# Run 4 Post-Verification Audit
*Generated: 2026-05-27 (revised with real audit data)*
*Corpus: 150 published posts (unchanged from run 3)*

---

## Sprint Context

| Commit | Change | Blogs |
|---|---|---|
| 1c8d874 | CTR rewrite: 5 titles + metas | 5 |
| 9c432e1 | Em dash removal: 513 instances | 56 confirmed (batches 7–13) |
| 7d8dc70 | Competitor links removed | 1 |
| 62f8c84 | NMIMS H hierarchy fix | 1 |
| 463186a | Locked-rule guard added | 0 (scripts only) |

---

## Part 1: Verification Results

### 1.1 — Sitemap Parity

Blog count in lib/blog.ts: **150**
Sitemap built dynamically from same source: **150**
**PASS — 150 of 150 present.**

### 1.2 — Build Integrity

`npx tsc --noEmit` — **0 errors. PASS.**

### 1.3 — Em Dash Regression

`node scripts/check-locked-rules.js` — **PASS. 0 em dashes. 0 competitor links.**

### 1.4 — Em Dash Collateral Damage (Real Audit)

Script: `scripts/audit-em-dash-collateral.js` (v2, fixed `content` field extraction)
Output: `scripts/seo-audit/08-EM-DASH-COLLATERAL-CHECK-V2.csv`
Sprint blogs checked: **56** (batches 7–13)

| Category | Count |
|---|---|
| No issues | 49 (87.5%) |
| Minor — 1 flag | 7 (12.5%) |
| Major — 2+ flags | 0 |

**Minor-flagged sprint blogs (7):**

| Slug | Issue | Severity |
|---|---|---|
| `is-online-mba-worth-it-2026` | 1 double space in prose | Minor — 1 spot |
| `how-to-choose-online-mba-university-india-2026` | 1 double space in prose | Minor — 1 spot |
| `online-manipal-mba-review-2026` | 1 double space in prose | Minor — 1 spot |
| `mat-exam-2026-eligibility-pattern-dates` | 1 double space in prose | Minor — 1 spot |
| `mba-vs-pgdm-online-india-2026` | 1 double space in prose | Minor — 1 spot |
| `distance-mba-kerala-programs-2026` | H1 in body | Pre-existing (not caused by em-dash sprint) |
| `mba-international-online-global-programs-2026` | 1 double space in prose | Minor — 1 spot |

All 6 double-space cases are single occurrences from `word — word` → `word  word` replacement. Easy one-line fixes. The H1 violation on `distance-mba-kerala-programs-2026` predates the em-dash sprint.

**No major issues. Em-dash removal: essentially CLEAN.**

#### Side finding: pre-existing H1-in-body violations (18 blogs, NOT sprint-related)

These are structural issues in newer blogs (BBA reviews, MBA spec pages, university reviews added before the sprint). Not caused by em-dash removal. Requires a separate fix sprint.

Affected slugs: `amity-online-bba-fees-2026`, `amity-online-bba-review-2026`, `bits-pilani-online-mba-review-2026`, `imt-ghaziabad-online-mba-review-2026`, `jain-online-mba-review-2026`, `mba-hr-management-online-india-2026`, `mba-pharmaceutical-management-online-india-2026`, `online-bba-degree-india-validity-2026`, `online-bba-in-india-2026`, `online-bba-programs-india-2026`, `online-mba-aviation-management-india-2026`, `online-mba-business-data-analytics-india-2026`, `online-mba-entrepreneurship-india-2026`, `online-mba-event-management-india-2026`, `online-mba-hospital-healthcare-management-india-2026`, `online-mba-supply-chain-management-india-2026`, `upes-online-mba-review-2026`, `xlri-online-mba-review-2026`

### 1.5 — CTR Rewrite Verification

| Slug | title | seoTitle | metaDescription | Status |
|---|---|---|---|---|
| `is-manipal-university-jaipur-fake-or-legit-2026` | Updated | Updated (56c, within spec) | Updated | VERIFIED |
| `amity-online-mba-review-2026` | Updated | Updated | Updated | VERIFIED |
| `smu-online-mba-review` | Updated | Updated | Updated | VERIFIED |
| `toughest-exams-india-world-2026` | Updated | — | Updated | VERIFIED |
| `career-after-bcom-jobs-salary-courses-2026` | Updated | — | Updated | VERIFIED |

**5 of 5 CTR rewrites verified.**

---

## Part 2: Cluster Status — Run 4

### Changes from Run 3

| Cluster | Run 3 | Run 4 | Driver |
|---|---|---|---|
| A3 Online BBA | DEVELOPING | **STRONG** | Hub sprint: 9 inbound links, 14 supporting posts |
| B1 MBA HR | MISSING | **DEVELOPING** | Hub wired: /programs/mba/specializations/hr-management (3 inbound) |
| B2 MBA Finance/FinTech | MISSING | **DEVELOPING** | Fintech spec hub live (2 inbound) |
| B4 MBA Ops/SCM/Logistics | MISSING | **DEVELOPING** | SCM hub (3 inbound) + logistics hub (2 inbound) |
| B5 MBA Analytics | MISSING | **DEVELOPING** | Analytics hub (3 inbound) |
| B6 MBA Healthcare/Hospitality | MISSING | **DEVELOPING** | Healthcare hub (3 inbound) + hospitality hub (2 inbound) |

No cluster regressed between run 3 and run 4.

### Run 4 Health Summary

| Status | Count | Clusters |
|---|---|---|
| STRONG | 3 | A1, A3, C-manipal |
| DEVELOPING | 9 | A2, B1, B2, B4, B5, B6, C-icfai, D1, D3 |
| WEAK | 22 | A4, A5, A6, A7, A8, B3, C-symbiosis, C-nmims, C-amrita, C-amity, C-lpu, C-chandigarh, C-ignou, C-jain, C-upes, C-other, D2, D4, D5, D7, E1, E2, F3 |
| MISSING | 8 | B7, C-du, D6, E3, F1, F2, F4 |

### CTR Sprint: No New Cannibalisation

5 title changes checked against `07-cannibalisation-flags.csv`. No new keyword overlaps introduced. BComm title now more differentiated from "Career After 12th Commerce 2026".

---

## Part 3: Remaining Open Items

### Spec hubs at 2 inbound (need 1 more each for solid DEVELOPING status)
- `/programs/mba/specializations/fintech` — 2 inbound
- `/programs/mba/specializations/logistics-management` — 2 inbound
- `/programs/mba/specializations/hospitality-management` — 2 inbound

### Large clusters with no hub (3+ supporting posts)
- E2 Salary Data — 7 posts, no hub
- E1 Career Paths — 15 posts, no hub
- D5 Admission/Eligibility — 7 posts, hub exists at `/guides/online-mba-eligibility-india` but not wired

### H1-in-body structural issues (18 blogs, pre-existing)
Separate fix sprint needed. Not caused by any recent sprint. See list in §1.4 above.

---

*Run 4 audit complete: 2026-05-27*
