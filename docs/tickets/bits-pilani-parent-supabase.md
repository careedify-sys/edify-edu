# Ticket: Add BITS Pilani (parent) to Supabase

**Status:** Open
**Created:** 2026-07-26
**Category:** Data pipeline — Supabase coverage gap

## Problem

Supabase's `universities` and `accreditations` tables cover BIT Mesra
Ranchi (as `birla-institute-of-technology-online`, NIRF University #92,
NAAC A) but **not BITS Pilani** (the parent institution running the WILP
online MBA at NIRF #7 University, NIRF #16 Overall).

Consequence: `lib/data.ts` currently carries a
`bits-pilani-work-integrated-online` entry (nirf=7, NAAC A+, fee
₹2,98,400) with **no Supabase backing**. When `scripts/sync-from-supabase.js`
runs, it cannot verify or correct these values because there's no
authoritative row to compare against. Every future NIRF/NAAC audit will
re-surface this as an unverified island.

The gap was exposed during the BIT Mesra slug rename audit
(chat 2026-07-26, commit 923c3f9): initial "BITS #16 drift" investigation
required manual nirfindia.org verification because Supabase couldn't
answer the question.

## Fix

1. **Insert a row in Supabase `universities`** for BITS Pilani (parent):
   - slug: `birla-institute-of-technology-and-science-pilani-online` (or
     whatever the existing Supabase slug convention prefers)
   - name: `Birla Institute of Technology and Science, Pilani`
   - ugc_deb_status, ugc_deb_valid_till populated per current portal

2. **Insert `accreditations` rows** covering every category BITS Pilani
   holds in NIRF 2025 (verified at nirfindia.org):
   - NIRF Overall #16
   - NIRF University #7
   - NIRF Engineering #11
   - NIRF Research #18
   - NIRF Pharmacy (if applicable — likely top 10)
   - NAAC — current grade + score + cycle

3. **Add slug mapping** to `SUPA_TO_SITE_SLUG` in
   `scripts/sync-from-supabase.js`:
   ```
   'birla-institute-of-technology-and-science-pilani-online': 'bits-pilani-work-integrated-online',
   ```
   (WILP is the online-programme entity in site data; parent BITS Pilani
   in Supabase feeds it via this mapping.)

4. **Re-run sync-from-supabase.js** to reconcile any drift between
   Supabase and `lib/data.ts` for the WILP entry.

## Verification after fix

- `scripts/sync-from-supabase.js --dry` reports either 0 corrections
  (data.ts already matches new Supabase truth) or a specific delta to
  review before applying.
- Chat 2026-07-26's "Supabase check" scratchpad, re-run with `%bits%`
  filter, returns two universities (BIT Mesra + BITS Pilani) instead of one.
- Highlight generator emits correctly labelled ranks for BITS Pilani WILP
  on cards.

## Cross-refs

- Commit `923c3f9` — BIT Mesra slug rename (mentions this ticket in the
  commit message)
- Commit `13e7bc5` — 308 redirects for legacy URLs
- Commit `206d7ba` — blog label fixes for BITS Pilani NIRF #16 Overall
- Blog audit report v2 (chat 2026-07-26): confirmed BITS Pilani parent
  ranks in NIRF 2025 are University #7, Overall #16, Engineering #11,
  Research #18 — verified via web search, not Supabase, because Supabase
  does not carry BITS Pilani.
- Related: `docs/tickets/nirf-band-support.md` (Supabase schema
  extension for NIRF rank bands, needed for Galgotias case).
