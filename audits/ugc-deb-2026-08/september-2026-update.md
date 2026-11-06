# UGC-DEB September 2026 lists vs the August reconciliation

**Run date:** 2026-11-06. Inputs supplied by Rishi:

- `140_upload_RecognitionDetails_20260922125223.pdf`: addendum with a period-of-recognition column, 22 rows (August: 18).
- `140_upload_RecognitionDetails_202609...22125253 (1).pdf`: main list, 49 pages, 126 rows (August: 124).

Neither PDF has a mode column, so neither proves Online over ODL. See the REVA note in README.md.

## Main list: what changed since August

| HEI | Change | On site? | Action |
|---|---|---|---|
| Karnavati University (Gujarat) | New row: BCA, B.Com (Hons), BBA, MBA, MCA | No record | None. Adding a university needs fees and a portal check |
| Thapar Institute (Punjab) | Present in both lists (row 73 has no full stop after the number, so naive parsers miss it) | No record | None |
| CHRIST (Deemed) | +BBA, +M.Com (count 7 to 9) | Yes. BBA already listed, M.Com not | None. M.Com would create new URLs |
| University of Calicut | +B.Com (Hons) 4 years (9 to 10) | Yes | Description updated to ten programmes |
| Savitribai Phule Pune University | +M.Sc (Computer Applications) (5 to 6) | Yes | None. Description makes no count claim |
| NMIMS | MBA (Working Executive) renamed only | Yes | None |

Every other row is unchanged. Amity, Jamia Millia and MATS showed up as false diffs from name matching and were checked by hand.

## Addendum: what changed since August

| HEI | Change | On site? | Action |
|---|---|---|---|
| TERI School of Advanced Studies | New: MBA (Sustainability Management), Aug 2026 to Jan 2027 only | No | None |
| Usha Martin University | New: BBA (Hons), BCA (Hons), MBA HR/Finance/Marketing, MCA from Aug 2026 | No | None |
| Yashwantrao Chavan Maharashtra Open University | New: BCA, MBA, B.Com, MCA from Aug 2026 | No | None |
| R.N.B. Global University | New: MBA (Marketing and Finance, Marketing and HRM) from Aug 2026 | No | None |
| Silver Oak University | New second block from Aug 2026 to 2030-31: B.Com (Hons) 4 yr, B.Sc and M.Sc Data Science, MBA Marketing/HR/Finance | Yes | Description and notFor updated |
| Dr. B.R. Ambedkar Open University | +MBA (General) as item 5 (the row still says count 04) | Yes | Description and notFor updated, ODL-mode caution added |

The other 16 rows carry the same periods and programmes as in August, so their pages are still correct.

## Not done (needs Rishi)

1. New programme URLs for the added grants: Silver Oak (B.Com, B.Sc, M.Sc, MBA specs), Calicut B.Com, CHRIST M.Com, SPPU M.Sc, BRAOU MBA. Each one adds hub pages and a programs-manifest / valid-urls regeneration. BRAOU MBA also has an open mode question.
2. Six universities from the September lists have no site record: Karnavati, Thapar, TERI SAS, Usha Martin, YCMOU, R.N.B. Global.
