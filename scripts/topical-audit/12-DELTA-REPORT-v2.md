# Topical Authority Audit — Delta Report v2
**Baseline:** 137-blog audit (2026-05-26, run 2)
**Current:** 150-blog audit (2026-05-26, run 3)
**New posts imported this session:** 12 (8 BBA, 4 MBA spec)
**Sitemap parity:** 150/150 — `getPublishedPosts()` in `app/sitemap.ts` auto-includes all published posts. No manual action needed.

---

## 1. Cluster Status Changes: 137 → 150

| Cluster | Old Status | New Status | Trigger |
|---|---|---|---|
| A3 Online BBA | DEVELOPING | **STRONG** | 14 supporting posts + hub at /programs/bba (threshold: 8+) |
| B1 MBA HR | MISSING | **WEAK** | 3 posts, no hub (amity-hr-worth-it + mba-hr-career + mba-hr-management) |
| B4 MBA Ops/SCM/Logistics | MISSING | **WEAK** | 3 posts, no hub (operations-career + supply-chain + logistics) |
| B6 MBA Healthcare/Hospitality | MISSING | **WEAK** | 3 posts, no hub (hospital + pharmaceutical + hospitality) |
| C-nmims | WEAK | **DEVELOPING** | nmims-online-bba-review added → 3 supporting posts + hub |
| C-symbiosis | WEAK | **DEVELOPING** | symbiosis-online-bba-review added → 3 supporting posts + hub |

### Unchanged (strengthened but not crossed threshold)
| Cluster | Old | Posts Before | Posts After | Blocker |
|---|---|---|---|---|
| B2 MBA Finance/FinTech | MISSING | 1 | 2 | Still no hub |
| B5 MBA Analytics | MISSING | 2 | 2 | Still no hub |
| C-amrita | WEAK | 2 total | 3 total | Hub + 2 supporting = still WEAK |
| C-lpu | WEAK | 3 total | 4 total | Still WEAK (needs 3 supporting; has 2 + hub) |
| C-manipal | STRONG | 9 | 10 | Already STRONG; mahe-bba-review adds depth |

---

## 2. Updated Cluster Scorecard (150 blogs)

| Cluster | Posts | Hub | Status |
|---|---|---|---|
| A1 Online MBA in India | 57 | /best-online-mba-india | STRONG |
| A2 Online MCA in India | 4 | /programs/mca | DEVELOPING |
| **A3 Online BBA in India** | **14** | **/programs/bba** | **STRONG** |
| A4 Online BCA in India | 1 | /programs/bca | WEAK |
| A5 Online MA in India | 3 | /programs/ma | WEAK |
| A8 Online BCom in India | 2 | /programs/bcom | WEAK |
| **B1 MBA HR** | **3** | None | **WEAK** |
| B2 MBA Finance/FinTech | 2 | None | MISSING |
| B3 MBA Marketing | 2 | None | MISSING |
| **B4 MBA Ops/SCM/Logistics** | **3** | None | **WEAK** |
| B5 MBA Analytics | 2 | None | MISSING |
| **B6 MBA Healthcare/Hospitality** | **3** | None | **WEAK** |
| B8 MBA International Business | 2 | None | MISSING |
| C-manipal | 10 | /universities/... | STRONG |
| **C-nmims** | **4** | /universities/... | **DEVELOPING** |
| **C-symbiosis** | **4** | /universities/... | **DEVELOPING** |
| C-amity | 3 | /universities/... | WEAK |
| C-amrita | 3 | /universities/... | WEAK |
| C-lpu | 4 | /universities/... | WEAK |
| C-chandigarh | 3 | /universities/... | WEAK |
| C-ignou | 3 | /universities/... | WEAK |
| C-jain | 2 | /universities/... | WEAK |
| C-upes | 2 | /universities/... | WEAK |
| C-icfai | 4 | /universities/... | DEVELOPING |
| D1 Comparisons | 4 | /compare | DEVELOPING |
| D2 Online vs Distance MBA | 2 | None | WEAK |
| D3 UGC-DEB / Accreditation | 2 | /guides/... | WEAK |
| D5 Admission / Eligibility | 3 | None | WEAK |
| E1 Career After Programs | 4 | None | WEAK |
| E2 Salary Data | 7 | None | WEAK |

**Summary: STRONG 3 (+1) | DEVELOPING 5 (+2) | WEAK 17 (net +2) | MISSING 8 (-4)**

---

## 3. New Cannibalisation Risks (12 new posts)

### HIGH — 3-way BBA intent conflict
All three target the same head query ("online BBA programs India 2026"):

| Slug | Target Keyword |
|---|---|
| `online-bba-india-2026` | online bba india |
| `online-bba-in-india-2026` | online bba in india |
| `online-bba-programs-india-2026` | online bba programs india |

**Recommended fix:** Differentiate intent sharply.
- `online-bba-india-2026` → hub/overview page (top universities, fees, eligibility overview)
- `online-bba-programs-india-2026` → comparison/ranking page (tier table, NIRF scores, verdict)
- `online-bba-in-india-2026` → admission guide (process, documents, timeline)
Ensure H1, meta title, and opening paragraph signal different intent. No cross-linking on matching anchor text.

### MEDIUM — Logistics vs SCM overlap
- `online-mba-logistics-management-india-2026` — "online MBA logistics India"
- `online-mba-supply-chain-management-india-2026` — "online MBA supply chain India"

**Recommended fix:** Keep both but differentiate. SCM covers procurement + vendor network + inventory. Logistics covers transport, last-mile, warehouse execution. Cross-link with distinct anchor text. Neither is dominant yet; both can rank independently.

### LOW — BBA university reviews competing on "best online BBA" head term
5 BBA university reviews now live: amrita, lpu, mahe, nmims, symbiosis-bba plus amity-bba. Each should target university-specific long-tail ("NMIMS online BBA review", "Symbiosis online BBA fees") rather than competing on the head term. Ensure `best-online-bba-colleges-india-2026` is the canonical hub for the head term and all 5 reviews link to it.

---

## 4. New Orphan Posts (12 new — zero inbound internal links)

All 12 new posts are live with zero inbound links from existing posts. Priority injection order:

| New Post | Suggested Source Posts (already have high traffic or authority) | Anchor Text |
|---|---|---|
| `best-online-bba-colleges-india-2026` | `bba-full-form-course-details-eligibility-fees-2026`, `mba-vs-bba-which-is-better-2026`, `career-after-12th-commerce-courses-jobs-2026` | "best online BBA colleges India" |
| `online-bba-fees-india-2026` | `online-bba-in-india-2026`, `bba-full-form-course-details-eligibility-fees-2026`, `affordable-online-mba-india-2026` | "online BBA fees comparison" |
| `online-bba-india-2026` | `best-online-bba-colleges-india-2026`, `career-after-12th-commerce-courses-jobs-2026` | "online BBA guide India" |
| `online-mba-fintech-india-2026` | `mba-finance-career-salary-scope-2026`, `best-mba-specialization-india-2026`, `online-mba-salary-india-2026` | "MBA FinTech specialisation" |
| `online-mba-logistics-management-india-2026` | `online-mba-supply-chain-management-india-2026`, `mba-operations-management-career-2026`, `best-mba-specialization-india-2026` | "MBA Logistics Management guide" |
| `online-mba-hospitality-management-india-2026` | `online-mba-hospital-healthcare-management-india-2026`, `best-mba-specialization-india-2026`, `career-after-mba-jobs-salary-scope-2026` | "MBA Hospitality Management" |
| `online-mba-real-estate-management-india-2026` | `best-mba-specialization-india-2026`, `career-after-mba-jobs-salary-scope-2026`, `mba-scope-india-2026` | "MBA Real Estate Management" |
| `amrita-online-bba-review-2026` | `best-online-bba-colleges-india-2026`, `online-bba-programs-india-2026` | "Amrita online BBA review" |
| `lpu-online-bba-review-2026` | `best-online-bba-colleges-india-2026`, `online-bba-programs-india-2026` | "LPU online BBA review" |
| `mahe-online-bba-review-2026` | `best-online-bba-colleges-india-2026`, `online-bba-programs-india-2026` | "MAHE online BBA review" |
| `nmims-online-bba-review-2026` | `best-online-bba-colleges-india-2026`, `nmims-online-mba-review-2026` | "NMIMS online BBA review" |
| `symbiosis-online-bba-review-2026` | `best-online-bba-colleges-india-2026`, `symbiosis-online-mba-review-2026` | "Symbiosis online BBA review" |

---

## 5. Did the Original 4-Hub Sprint Priorities Change?

**Original sprint (from 09-BUILD-PLAN.md):** Build spec hubs for B1 HR, B4 SCM, B5 Analytics, B6 Healthcare.

**Critical finding:** All 4 spec hub PAGES ALREADY EXIST via the `[spec]` dynamic route at `app/programs/mba/specializations/[spec]/page.tsx`. The SPECS object defines:
- `/programs/mba/specializations/hr-management` ✓
- `/programs/mba/specializations/supply-chain-management` ✓
- `/programs/mba/specializations/business-analytics` ✓
- `/programs/mba/specializations/healthcare-management` ✓

**The hub pages are live but have zero inbound links from the blog corpus.** The sprint priority is not "build hubs" — it is "wire inbound links to the existing hubs."

**What is genuinely missing (no spec definition in SPECS object):**
- `/programs/mba/specializations/fintech` — B2 now has 2 posts; worth adding SPECS entry
- `/programs/mba/specializations/logistics-management` — B4 logistics post now live; could be added
- `/programs/mba/specializations/hospitality-management` — B6 hospitality post now live; could be added

---

*Generated: 2026-05-26 | Corpus: 150 published posts | Prev corpus: 137*
