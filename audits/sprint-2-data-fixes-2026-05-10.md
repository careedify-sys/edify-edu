# Sprint 2 — Data Fixes (2026-05-10)

**Branch:** `ctr-sprint-1-data-first-titles`
**Authored:** Rishi Kumar (Senior Education Researcher, EdifyEdu) · 2026-05-10
**Scope:** Program-level fee data + redirect safety net + AICTE/uniType branching support. Builders introduced in Phase 1 are unchanged in their *logic*; this sprint adds the *data* they read from.

---

## 1. `programFees` additions (12 universities)

12 universities received a new `programFees` map keyed by lowercase program slug. Builder reads `uni.programFees[program.toLowerCase()]?.fee` first and falls back to `uni.feeMin` (then `uni.feeMax`) when no program-specific fee is set. NMIMS does not offer online BCA or MCA and was deliberately skipped.

| # | Uni | `programFees` |
|---|---|---|
| 1 | `amity-university-online` | `{ bca: { fee: 175000 }, mca: { fee: 199000 } }` |
| 2 | `lovely-professional-university-online` | `{ bca: { fee: 122400 }, mca: { fee: 129600 } }` |
| 3 | `manipal-university-jaipur-online` | `{ bca: { fee: 139500 }, mca: { fee: 158000 } }` |
| 4 | `galgotias-university-online` | `{ bca: { fee: 69000 }, mca: { fee: 74000 } }` |
| 5 | `sikkim-manipal-university-online` | `{ mca: { fee: 110000 } }` |
| 6 | `symbiosis-university-online` | `{ bca: { fee: 157500 } }` |
| 7 | `sharda-university-online` | `{ bca: { fee: 120000 }, mca: { fee: 120000 } }` |
| 8 | `vignan-university-online` | `{ bca: { fee: 108000 }, mca: { fee: 90000 } }` |
| 9 | `manipal-academy-higher-education-online` | `{ mca: { fee: 220000 } }` |
| 10 | `chandigarh-university-online` | `{ bca: { fee: 177000 }, mca: { fee: 155000 } }` |
| 11 | `noida-international-university-online` | `{ mca: { fee: 118000 } }` |
| 12 | `ignou-online` | `{ bca: { fee: 49800 }, mca: { fee: 50800 } }` |

Type extension on the `University` interface in `lib/data.ts`:

```ts
programFees?: Partial<Record<'mba' | 'bba' | 'mca' | 'bca' | 'mcom' | 'bcom' | 'btech' | 'mtech', { fee: number }>>
```

## 2. No-op program removals + defensive redirects

The original Sprint 2 plan called for removing `'BCA'` / `'MCA'` from the `programs` arrays of four universities. Pre-edit verification revealed every removal was already applied in a prior commit:

| Uni | Planned removal | Current state |
|---|---|---|
| `nmims-online` | drop `'BCA'`, `'MCA'` | `['MBA', 'BBA', 'B.Com']` — both already absent |
| `manipal-academy-higher-education-online` | drop `'BCA'` | `['MBA', 'MCA', 'BBA', 'B.Com', 'MSc']` — BCA already absent |
| `symbiosis-university-online` | drop `'MCA'` | `['MBA', 'BBA', 'BCA', 'MSc', 'BSc', 'MA']` — MCA already absent |
| `sikkim-manipal-university-online` | drop `'BCA'` | `['MBA', 'MCA', 'BBA', 'B.Com', 'BA', 'M.Com', 'MA']` — BCA already absent |

No code change to `programs` arrays. **Ten 301 redirects** added in `next.config.js` anyway as a defensive safety net for any historical Google index that may have cached the URLs from a prior catalogue state. Pre-check confirmed none of the five URL patterns are currently emitted in `lib/data/valid-urls.json`, so the redirects guard against external indexed records only, not against current site emissions:

- `/universities/nmims-online/bca` and `/bca/:spec*` → `/universities/nmims-online`
- `/universities/nmims-online/mca` and `/mca/:spec*` → `/universities/nmims-online`
- `/universities/manipal-academy-higher-education-online/bca` and `/bca/:spec*` → MAHE root
- `/universities/symbiosis-university-online/mca` and `/mca/:spec*` → Symbiosis root
- `/universities/sikkim-manipal-university-online/bca` and `/bca/:spec*` → SMU root

## 3. Deferred items

### Noida International — Online BCA fee deferred

Sprint 2 plan called for `bca: { fee: 108000 }` on Noida International. Pre-check found:

- `lib/data.ts` `programs` array: `['MBA', 'MCA', 'BBA']` — no BCA
- `lib/data/programs-manifest.json` — no `bca` entry
- `lib/data/page-content/noida-international-university-online-*` — only MBA-spec content; zero BCA files
- `lib/data/valid-urls.json` — no `/noida-international-university-online/bca` URLs

**Zero project evidence** that Noida International offers Online BCA. Per the project rule "do not add a program to the catalogue without basis," only `mca: { fee: 118000 }` was added. The BCA entry is queued for a future sprint pending verification against `niu.edu.in` or another authoritative source. If verification confirms, the work is a 2-line edit:

```ts
programs: ['MBA', 'MCA', 'BBA', 'BCA'],         // add 'BCA'
programFees: { bca: { fee: 108000 }, mca: { fee: 118000 } },  // add bca key
```

### TITLE_NAME audit for the unclassified 124 unis

Phase 1 classified 6 universities with `uniType` (Amity, NMIMS, LPU, IGNOU, Sikkim Manipal, MAHE). The remaining 124 are unclassified and the builder treats unset `uniType` as "private-equivalent" (no AICTE claim). Bulk classification CSV from the user is the next blocking input for Sprint 3.

## 4. Identity rules (locked, not to change)

### `.claude/settings.local.json` — Claude Code local state, not project source
- Added `.claude/settings.local.json` to `.gitignore` (new entry under "Claude Code local settings (do not commit)")
- File `git rm --cached`'d in this commit — no longer tracked from this point onward
- Future `git add .` operations will skip it via the gitignore rule

### Symbiosis SSODL identity rule
- `TITLE_NAME['symbiosis-university-online']` stays `'Symbiosis'` — search intent on Indian SERP is "Symbiosis online MBA," not "Symbiosis SSODL". Do not change for SEO.
- Any description that names the institution must use `uni.name` from `lib/data.ts`, which renders as **"Symbiosis School for Online and Digital Learning (SSODL), Pune Online"** — disambiguates from SCDL legacy.
- Page H1, body content, and schema follow the SSODL identity rule. Title does not.

### Galgotias tuition-only fee rule
- Galgotias `programFees` are tuition only (₹69K BCA, ₹74K MCA).
- Tuition deliberately excludes ₹1,200 registration + ₹4,000/year exam + ₹1,000 alumni per spec.
- Total course fees would render as ₹83.2K BCA / ₹84.2K MCA — **do not use these on titles or descriptions.** Tuition is the SERP-facing anchor.

### Sticker price rule (Amity, Chandigarh)
- Amity `programFees` use the semester-wise sticker price (`bca: 175000`, `mca: 199000`) — not the one-time-payment discount.
- Chandigarh `programFees` similarly use sticker prices.
- This is the standard "what you actually pay if you don't take the discount" — matches official portal display.

### `formatINR` P3 rounding rule
- Sub-₹1L values render with 1-decimal precision when rounding leaves a remainder, integer otherwise:
  - ₹49,800 → `₹49.8K`
  - ₹49,750 → `₹49.8K` (rounded)
  - ₹50,000 → `₹50K` (no trailing .0)
  - ₹50,800 → `₹50.8K`
  - ₹66,000 → `₹66K`
  - ₹83,200 → `₹83.2K`
  - ₹74,000 → `₹74K`
- ₹1L–₹10L unchanged: 2-decimal precision, trailing zeros stripped (₹2.07L, ₹1.5L, ₹2L).
- ≥₹10L unchanged: Cr with 1 decimal.

## 5. Sanity samples used to validate the builder

The 18-sample gate run at `scripts/sanity-check-titles.ts`:

| Block | Count | Samples |
|---|---|---|
| Phase 1 management | 6 | Amity MBA, NMIMS MBA, LPU MBA, IGNOU MBA, Sikkim Manipal MBA, MAHE MBA |
| Phase 1 ancillary | 2 | Verify (Amity), Compare pair (Amity vs NMIMS) |
| Phase 1 tech (uniType branching) | 4 | Amity MCA, NMIMS MCA, IGNOU MCA, MAHE MCA |
| **Sprint 2 programFees flow-through** | **6** | **Amity BCA, Amity MCA, MAHE MCA, IGNOU BCA, Galgotias BCA, Galgotias MCA** |

All 18 sample titles ≤60 chars, all 18 descriptions ≤155 chars (one minor 1-char overflow on Best-MBA hub at 61 chars; documented and accepted). All Sprint 2 samples confirmed `feeSource = programFees.<key>` not `feeMin` fallback.

## 6. Locked paths

Zero modifications under `app/universities/[id]/[program]/` or `app/universities/[id]/[program]/[spec]/`. Verified via `git diff --name-only`. Scope respected.

## 7. Next steps (post-commit, post-deploy decision)

- **Sprint 3 — Phase 4:** prepare diff for `app/universities/[id]/page.tsx` server file using the new builders. Do not commit until separate user sign-off.
- **Sprint 3 — Phase 5:** prepare removal of duplicate `BreadcrumbList` from `UniversityPageClient.tsx` lines 112-119. Schema-only fix, no UX change. Wait for separate sign-off.
- **uniType bulk classification:** user provides CSV / table for the remaining 124 unclassified universities; bulk-edit applied as a single classification commit.
- **Noida BCA verification:** if confirmed against `niu.edu.in`, apply the 2-line edit noted in §3 above.
