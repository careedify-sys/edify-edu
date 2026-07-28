# Ticket: Verify Sathyabama Online MBA fee — data.ts vs blog conflict

**Status:** Open (needs portal verification)
**Created:** 2026-07-26
**Category:** Data accuracy — potential data.ts drift

## Problem

Blog `best-online-mba-colleges-india-2026` cites Sathyabama Online MBA at
`₹2.20 lakh`. `lib/data.ts`'s Sathyabama entry
(`sathyabama-university-online`) has:

- `programDetails.MBA.fees`: `'₹45K – ₹90K'`
- `programDetails.BBA.fees`: `'₹15K – ₹45K'`

One of the two is wrong. `₹45K` for a Deemed University MBA is
implausibly low — Sathyabama Deemed University's tuition band for online
programmes is typically in the ₹1.5L–₹2.5L range, matching what the
blog cites. **Data.ts is the likely culprit here**, not the blog.

## Fix

1. **Verify at sathyabama.ac.in** — pull current online MBA fee structure.
2. **Update `lib/data.ts`** with the current fee range.
3. **Optionally update Supabase** if Sathyabama is present there and the
   fee column is populated.

## Cross-refs

- Blog drift audit v2 (chat 2026-07-26): flagged as "genuine conflict,
  one side is wrong; ₹45K for a deemed university MBA looks implausibly
  low, so data.ts is the likely culprit — verify before changing either".
