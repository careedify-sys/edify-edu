# Malformed specialisation names — 2026-09-13

Found while cleaning up the generic-slug 404 class (commit a178bd0). Three
import defects were publishing specialisation pages for things that are not
specialisations, and truncating the names of ones that are.

## Defect 1 — a comma-separated list split across the array

`lib/data.ts` held 13 `specs` arrays where one parenthesised string had been
split on its internal commas. SPPU's BCA is the clearest case:

```
specs: ['General (C', 'C++', 'Java', 'Python', 'Web', 'DBMS',
        'Android', 'Dot Net', 'Software Testing)']
```

That was written as `General (C, C++, Java, Python, Web, DBMS, Android, Dot
Net, Software Testing)` — one General programme with those subjects in it. Split,
it published nine specialisation pages and claimed SPPU offers a BCA
specialisation in Dot Net and in Web. It does not. The unbalanced parentheses at
each end are what makes the split detectable.

The same corruption is present in `data/EdifyEdu_Unified_Programs_v3.xlsx`, in
two shapes: as `General – C++` / `General – Java` rows, and as comma fragments
that kept their leading space (`" Accounting"`, `" Finance"`, `" IoT"`). The
workbook is downstream of the same splitter, not an independent source, so it
does not settle the question.

**Fixed:** each group collapsed to the single specialisation it was written as.
Nothing was invented; the surviving name is the head of the original string.

| university | programme | was | now |
|---|---|---|---|
| savitribai-phule-pune-university-online | BCA | 9 specs | General |
| mangalayatan-university-online | BCA | 6 specs | General |
| mangalayatan-university-online | MSc | 6 specs | Pure Mathematics |
| mangalayatan-university-online | M.Com | 4 specs | General |
| uttaranchal-university-online | BCA | 6 specs | General |
| parul-university-online | BCA | 5 specs | General |
| parul-university-online | M.Com | 3 specs | General |
| kurukshetra-university-online | M.Com | 3 specs | General Commerce |
| galgotias-university-online | BCA | 4 specs | General Management, Elective-based |

## Defect 2 — names truncated at import

Four entries were cut mid-string, losing the closing parenthesis:

- `"General Business Administration (option for Data A"` (Amity BBA, GLA BBA)
- `"Computer Applications (4 specialisations available"` (Amity BCA, GLA BCA)
- `"Business Analytics specialization with data-focuse"` (Chandigarh BBA)

The workbook holds the untruncated originals. In every case the parenthetical is
a note to the reader rather than part of the name, so the head is the
specialisation: `General Business Administration`, `Computer Applications`,
`Business Analytics`.

## Defect 3 — placeholder text published as a specialisation

Six workbook rows carry `(contact university for specialisation…)` or similar.
One of them listed five names in a single cell and published a page slugged
`finance-marketing-human-resources-operations-strategy-contact-university-for-specialisation-structure`.

**Fixed** in `scripts/build-valid-urls.js` rather than in the workbook, so the
repair survives the next refresh of it and shows up in a diff:

- a trailing placeholder parenthetical is stripped and the slug re-derived
- a cell listing several names is treated as carrying no specialisation, because
  splitting it would invent slugs (`strategy`, `human-resources`) that no source
  states — `lib/data.ts` already lists those universities' specialisations
- spec rows for the five (university, programme) pairs in `SPLIT_FRAGMENT_PAIRS`
  are skipped, and `backfill-manifest-from-data.js` supplies the corrected ones

## URL impact

51 specialisation URLs retired, 49 of them in the sitemap. Four carried Search
Console history and are the reason these are 301s and not 404s:

| URL | clicks | impressions | position |
|---|---|---|---|
| /savitribai-phule-pune-university-online/bca/general-c | 1 | 386 | 9.95 |
| /savitribai-phule-pune-university-online/bca/web | 3 | 342 | 8.70 |
| /mangalayatan-university-online/msc/statistics | 1 | 19 | 5.32 |
| /mangalayatan-university-online/msc/pure-mathematics-algebra | 1 | 16 | 7.06 |

Each retired URL 301s to the specialisation that actually exists, per university,
in `next.config.js`. Verified against a running server: all 51 redirect as
intended and all 15 destinations render 200.

## Guard

`npx tsx scripts/check-spec-names.ts` fails on any spec name with unbalanced
parentheses, placeholder text, or a multi-name cell. It runs on pre-commit, so
neither defect can come back through `lib/data.ts`. The workbook path is covered
by the repair in `build-valid-urls.js`, whose counters print on every run.
