# Ticket: NIRF Rank-Band Support in Supabase

**Status:** Open
**Created:** 2026-07-26
**Category:** Data pipeline

## Problem

NIRF publishes exact ranks for the top 100 institutions in each category and
groups the rest into bands (101-150, 151-200, etc). Our Supabase
`accreditations` table currently stores only the `rank` integer column, with
no representation for bands. As a result:

- Galgotias University Online holds an NIRF Management **Band 101-125 (2025)**
  ranking. Because Supabase has no way to store this, its NIRF Management row
  is absent from the `accreditations` table (only Pharmacy #55 and Law #36
  are present).
- The highlight generator at `lib/highlight.ts:buildHighlight()` treats a
  missing rank as unranked and drops the rank clause entirely per Rule 2
  (never render placeholder ranks).
- Galgotias's live card therefore shows only `NAAC A+` — silently dropping
  a genuine NIRF signal the university legitimately holds.

Any other university in the 101-200 rank band faces the same issue.

## Fix

### Schema change (Supabase)

Extend `accreditations` table with a way to represent bands. Two options:

**Option A — dedicated columns:**
```sql
ALTER TABLE accreditations
  ADD COLUMN rank_band_low  INT NULL,
  ADD COLUMN rank_band_high INT NULL;
```

`rank_band_low` and `rank_band_high` populated when the institution is in a
band; the existing `rank` column stays as-is for exact ranks. Populate
Galgotias's NIRF Management row with `category='Management', rank=NULL,
rank_band_low=101, rank_band_high=125`.

**Option B — band string column:**
```sql
ALTER TABLE accreditations
  ADD COLUMN rank_band TEXT NULL; -- e.g. "101-125"
```

Simpler to read, harder to sort/query. Recommend Option A.

### Generator change

Once the schema is in place, extend the sync-from-supabase pipeline to carry
`rank_band_low` / `rank_band_high` through to `lib/data.ts` and
`lib/data-slim.ts` (e.g. as `nirfMgtBand?: string`), then teach
`buildHighlight` and `formatRank` to emit `NIRF Band 101-125 Management 2025`
when a band is set and no exact rank is present.

Rule 2 stays intact: the generator still never renders 999 or any
placeholder. A band is real NIRF data, not a placeholder.

### Verification

After the schema + code changes, Galgotias's card must show
`NIRF Band 101-125 Management 2025 · NAAC A+` instead of the current
NAAC-only display.

## Cross-refs

- Commit `ee0c457` — highlight generator introduced with the 999-drop rule.
- Commit that introduces this ticket resolves the labelling/audit work in the
  chat thread of 2026-07-26.
- Related concern flagged during the same audit: Supabase does not store the
  NIRF edition year (`cycle` column is null on every row). The generator
  currently sources the year from `NIRF_EDITION_YEAR` in `lib/constants.ts`;
  when the schema is extended for bands, populating `cycle` at the same time
  would let the generator derive the year from the data instead of a code
  constant.
