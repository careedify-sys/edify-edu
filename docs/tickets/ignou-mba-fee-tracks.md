# Ticket: Verify IGNOU Online MBA fee — which track does data.ts represent?

**Status:** Open (needs portal verification)
**Created:** 2026-07-26
**Category:** Data accuracy — Supabase source

## Problem

The blog audit surfaced multiple IGNOU MBA fee figures in circulation, none
of which agree cleanly:

| Source | Figure | Context |
|---|---|---|
| `lib/data.ts` `programDetails.MBA.fees` | `'₹66,000'` | Current site source of truth |
| Multiple blog bodies | `Rs 31,500` | Cited as "IGNOU MBA distance", "IGNOU MBAOL", the "cheapest UGC-DEB MBA" |
| Blog `is-online-mba-worth-it-2026` FAQ | `₹58,000` | Cited as "IGNOU Online MBA total fee for 2026" |

IGNOU offers multiple MBA tracks (regular MBA, MBAOL for open learning, MBA
Banking and Finance, etc). It is plausible that all three figures are correct
for different tracks. Without portal verification we cannot say which figure
data.ts's `'₹66,000'` represents, or whether the blog-cited figures are
stale or refer to different tracks entirely.

## Fix

1. **Manual verification at ignou.ac.in** — pull the current-cycle fee
   structure for every MBA track IGNOU offers. Capture:
   - Track name (MBA, MBAOL, MBA Banking, etc.)
   - Total programme fee
   - Per-semester breakdown
   - Whether the track is currently open for admission
2. **Update Supabase accreditations table** — none needed, this is fee data.
   Update the appropriate `universities`/`fees` table row instead.
3. **Update data.ts** — either:
   - Store fee as a range if multiple tracks exist (`'₹31,500–₹66,000'`), OR
   - Add separate entries per track if the tracks are distinct enough to
     warrant it (unusual — usually one entry per university per programme)
4. **Reconcile blog bodies** — once track-to-figure mapping is verified,
   update blog references to label the track explicitly (`IGNOU MBAOL fee
   is Rs 31,500` vs `IGNOU MBA regular fee is Rs 66,000`) rather than
   quoting a bare number.

## Blogs affected

At least these carry conflicting IGNOU fee figures:

- `mba-fees-india-complete-guide-2026`
- `affordable-online-mba-india-2026`
- `is-online-mba-worth-it-2026`
- `online-mba-vs-distance-mba-difference-2026`

## Cross-refs

- Blog drift audit v2 (chat 2026-07-26): IGNOU flagged as "genuinely needs
  verification — don't guess".
- Supabase check (chat 2026-07-26): Supabase's `accreditations` table holds
  IGNOU with NAAC A++ but no fee data. Fee lives in `lib/data.ts` only.
