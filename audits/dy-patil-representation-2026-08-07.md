# DY Patil — how it's currently represented in lib/data.ts — 2026-08-07

Two separate entries exist. They are correctly distinguished at the record level; the
conflation is happening in the blog extractor's alias map, not in the data.

## Entry 1 — Navi Mumbai

- `id`: `dy-patil-university-online`
- `name`: `D.Y. Patil University, Navi Mumbai Online`
- `abbr`: `DPUNM`
- `city / state`: Sector 7 / Maharashtra 400706
- NIRF: 91 · NAAC: A++
- `programs`: MBA, BBA, BCA
- Program fees:
  - MBA `₹1,75,000`
  - BBA `₹1,30,000`
  - BCA `₹1,32,000`
- `programFees` override: `{ bba: 130000, bca: 132000 }` (Sprint 2 verified 2026-08-04)
- `feeMin / feeMax`: 60000 / 200000

Explicit comment in the file: `DY Patil University Navi Mumbai is not separately ranked
in NIRF. NIRF #44 (University 2024) belongs to Dr. D.Y. Patil Vidyapeeth, Pune — a
different institution. Do not attribute that rank to this record.`

## Entry 2 — Pune

- `id`: `dr-dy-patil-vidyapeeth-online`
- `name`: `Dr. D.Y. Patil Vidyapeeth, Pune – Centre for Online Learning (DPU-COL) Online`
- `abbr`: `DDPVP`
- `city / state`: Sant Tukaram Nagar / Maharashtra 411018
- NIRF: 41 · NAAC: A++
- `programs`: MBA, MCA
- Program fees:
  - MBA `₹1.89L`
  - MCA `₹1.9L`
- `feeMin / feeMax`: 189400 / 189400

## Are Pune and Navi Mumbai distinguishable today?

**In lib/data.ts: yes.** Two distinct ids, distinct NIRF, distinct city/state, distinct
programme sets, distinct fees. The file even carries a warning comment against confusing
their NIRF ranks.

**In blog prose and in the extractor: no.** The blogs write "DY Patil" or "D.Y. Patil"
without a campus qualifier, and the extractor's alias map (`scripts/lib/blog-fee-scan.mjs`)
resolves both `'dy patil'` and `'d.y. patil'` to `dy-patil-university-online` (Navi
Mumbai). Every "DY Patil MBA ₹1,89,400" reference in the blogs — which is a Pune price —
is attributed to the Navi Mumbai record (which has MBA at ₹1,75,000), producing a false
MISMATCH.

The fix here is at two layers:

1. **Alias layer** (short-term): `'dy patil pune'`, `'dpu-col'`, `'dpu col'`,
   `'d.y. patil vidyapeeth'`, `'dr d.y. patil'`, `'dpu pune'` → `dr-dy-patil-vidyapeeth-online`.
   Keep the bare `'dy patil'` alias resolving to Navi Mumbai (the older, more heavily
   referenced entry) but downgrade its confidence.
2. **Blog copy layer** (medium-term): audit blog copy that says "DY Patil MBA
   ₹1,89,400" and either add the "Pune" qualifier or link to the Pune record. That's
   an editorial task, not an extractor one — the DPU-Pune blog post P C10
   (`distance-mba-meaning-what-is-it-2026`) is one of the confirmed real cases.

No further schema work needed at this record; the data model already handles the campus
split. The proposal in `fee-model-proposal-2026-08-07.md` addresses the *other* three
dimensions (payment mode, discount state, specialisation) which lib/data.ts still lacks.
