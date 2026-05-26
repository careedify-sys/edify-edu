# Revised Hub Sprint Plan — 150-Blog Corpus
*Generated: 2026-05-26*

---

## Key Finding Before Sprint Begins

**The original "build 4 spec hubs" task is already done.**

All 4 spec hub pages (HR, SCM, Analytics, Healthcare) were built in the previous session via the `[spec]` dynamic route at `app/programs/mba/specializations/[spec]/page.tsx`. They are live, indexed, and fully populated with university tables, FAQs, career paths, and CTAs.

**The sprint has shifted from BUILD to WIRE + EXTEND.**

---

## Sprint A: Wire Inbound Links to Existing Spec Hubs (Highest ROI, 1 Day)

These 4 pages are live but invisible to Google's link graph because no blog post links to them. Each injection below takes 5 minutes.

### A1 — Wire /programs/mba/specializations/hr-management

| Source Blog | Anchor Text | Section to Inject |
|---|---|---|
| `mba-hr-career-salary-scope-2026` | "compare online MBA HR programmes by fees" | salary/career section |
| `mba-hr-management-online-india-2026` | "full HR specialisation hub with university table" | conclusion |
| `amity-online-mba-hr-worth-it` | "compare MAHE, NMIMS and Amity HR fees" | comparison section |

### A2 — Wire /programs/mba/specializations/supply-chain-management

| Source Blog | Anchor Text | Section to Inject |
|---|---|---|
| `online-mba-supply-chain-management-india-2026` | "see all online MBA SCM programmes and fees" | conclusion |
| `mba-operations-management-career-2026` | "compare online MBA SCM universities" | career/program section |
| `online-mba-logistics-management-india-2026` | "MBA Supply Chain Management hub" | related programs section |

### A3 — Wire /programs/mba/specializations/business-analytics

| Source Blog | Anchor Text | Section to Inject |
|---|---|---|
| `mba-data-science-analytics-career-2026` | "compare online MBA Business Analytics programmes" | conclusion |
| `online-mba-business-data-analytics-india-2026` | "full Business Analytics hub with university table" | conclusion |
| `best-mba-specialization-india-2026` | "online MBA Business Analytics specialisation guide" | analytics section |

### A4 — Wire /programs/mba/specializations/healthcare-management

| Source Blog | Anchor Text | Section to Inject |
|---|---|---|
| `online-mba-hospital-healthcare-management-india-2026` | "compare online MBA Healthcare programmes by fees" | conclusion |
| `mba-pharmaceutical-management-online-india-2026` | "MBA Healthcare Management hub" | related section |
| `online-mba-hospitality-management-india-2026` | "see MBA Healthcare and Hospitality programmes" | comparison section |

---

## Sprint B: Wire /programs/bba Inbound Links (A3 is STRONG but 0 inbound, 0.5 Days)

A3 BBA cluster has 14 supporting posts and STRONG status — but the hub at `/programs/bba` has zero inbound links from those posts. This is a critical gap.

### B1 — Wire /programs/bba from top BBA posts

| Source Blog | Anchor Text |
|---|---|
| `best-online-bba-colleges-india-2026` | "compare all online BBA programmes on edifyedu.in" |
| `bba-full-form-course-details-eligibility-fees-2026` | "explore online BBA programmes in India" |
| `online-bba-india-2026` | "full BBA programmes hub with university fees" |
| `online-bba-fees-india-2026` | "compare BBA fees across universities" |
| `mba-vs-bba-which-is-better-2026` | "browse online BBA programmes" |

---

## Sprint C: Extend SPECS Object with 3 New Specialisations (1 Day)

Add `fintech`, `logistics-management`, and `hospitality-management` entries to the SPECS object in `app/programs/mba/specializations/[spec]/page.tsx`. Each new entry creates a live hub page instantly with zero additional routing work.

### C1 — Add `fintech` spec

- **Target keyword:** "online MBA fintech India 2026"
- **Trigger posts:** `online-mba-fintech-india-2026`, `mba-finance-career-salary-scope-2026`
- **specVariantMatch:** `n.includes('fintech') || n.includes('digital banking') || n.includes('digital finance')`
- **Career range:** ₹8L to ₹25L
- **Entry roles:** Fintech Analyst, Payments Ops, BFSI Tech Analyst
- **Supporting blogs to link:** `online-mba-fintech-india-2026`

### C2 — Add `logistics-management` spec

- **Target keyword:** "online MBA logistics management India 2026"
- **Trigger posts:** `online-mba-logistics-management-india-2026`, `online-mba-supply-chain-management-india-2026`
- **specVariantMatch:** `n.includes('logistics') || n.includes('transport') || n.includes('warehousing')`
- **Career range:** ₹5L to ₹22L
- **Entry roles:** Logistics Executive, Transport Coordinator, Warehouse Manager
- **Note:** Cross-link with existing supply-chain hub to avoid cannibalisation

### C3 — Add `hospitality-management` spec

- **Target keyword:** "online MBA hospitality management India 2026"
- **Trigger posts:** `online-mba-hospitality-management-india-2026`
- **specVariantMatch:** `n.includes('hospitality') || n.includes('hotel management') || n.includes('tourism')`
- **Career range:** ₹4L to ₹20L
- **Entry roles:** Hotel Operations Executive, F&B Manager, Guest Relations Manager

---

## Sprint D: Fix BBA Cannibalisation (0.5 Days)

Three BBA posts target the same head query. Differentiate them:

| Slug | Assign to this intent | Meta title adjustment |
|---|---|---|
| `online-bba-programs-india-2026` | Rankings / tier comparison | "Best Online BBA Programs India 2026: Tier 1 vs Tier 2 vs Tier 3 Ranked" |
| `online-bba-india-2026` | Admission guide | "Online BBA India 2026: Eligibility, Admission Process and Documents" |
| `online-bba-in-india-2026` | Hub overview (fees + universities) | "Online BBA in India 2026: Top Colleges, Fees and Career Guide" |

No content rewrite needed — just retitle the meta and update the H2 focus of each post to lock different intent signals.

---

## Sprint Priority Order

| # | Sprint | Effort | Impact | Status |
|---|---|---|---|---|
| 1 | A: Wire 4 spec hub inbound links | 1 day | High — unlocks link equity to existing hubs | Not started |
| 2 | B: Wire /programs/bba inbound links | 0.5 days | High — STRONG cluster with 0 inbound to hub | Not started |
| 3 | C1: Add fintech to SPECS | 2hrs | Medium — B2 moves from MISSING to content-backed | Not started |
| 4 | D: Fix 3-way BBA cannibalisation | 0.5 days | Medium — protects A3 STRONG status | Not started |
| 5 | C2+C3: Add logistics + hospitality to SPECS | 4hrs | Medium — B4/B6 get proper hubs | Not started |

**Total estimated effort: 4 days for full sprint.**

---

## What Changed vs Original Sprint Plan

| Original Plan | Revised Plan | Reason |
|---|---|---|
| Build B1 HR spec hub | Wire inbound links to existing hub | Hub already built via [spec] route |
| Build B4 SCM spec hub | Wire inbound + add logistics to SPECS | Hub exists; logistics spec needs adding |
| Build B5 Analytics spec hub | Wire inbound links to existing hub | Hub already built |
| Build B6 Healthcare spec hub | Wire inbound + add hospitality to SPECS | Hub exists; hospitality spec needs adding |
| — | Fix BBA 3-way cannibalisation | New risk from 12-blog import |
| — | Wire /programs/bba inbound | A3 now STRONG but hub has 0 inbound links |
