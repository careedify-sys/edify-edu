# QA pre-merge rerun: Phase A trust batch (fix/phase-a-trust @ 76d1c3f)

Checked 2026-11-18 by qa-checker. This reruns `2026-11-16-phase-a-premerge.md` after 76d1c3f, which fixes F1 (llms.txt claim) and F2 (sameAs).

## Verdict: FAIL (F1 still open; everything else PASS)

| # | Check | Result |
|---|---|---|
| 1 | `git diff 9e1dde4..76d1c3f --stat` scope | PASS |
| 2 | F1: llms.txt sentence literally true; `build-llms-txt --check` | FAIL on truth; `--check` PASS |
| 3 | F2: sameAs on 19 files, none on MUJ/SMU/MAHE/IGNOU, no shared host | PASS |
| 4 | Schema, schema gate, all gates, robots, not-found, admin-login, CSP | PASS |
| - | `npm run build` | PASS (exit 0, fresh build, see below) |

## Build

The instruction was to rebuild only if `.next` predated 76d1c3f. It did: the old `.next/BUILD_ID` was written 2026-11-16 18:32:06 +0530, and 76d1c3f was committed (and authored) 2026-11-18 10:22:01 +0530. The old build already showed 19 sameAs nodes, so the fix had evidently been built before it was committed. Even so, I rebuilt to tie the output to the commit.

- `npm run build` (prebuild + `next build`, Next.js 14.2.35) exited 0. The new BUILD_ID is `vnsh-NywbjaWgEpmt-3K8`, written 2026-11-18 10:25:43 +0530.
- I did not touch port 3107.
- Post-build, `lib/data/valid-urls.json` showed as modified, but `git diff --ignore-cr-at-eol` was empty (line endings only), so I restored it with `git checkout --`. `git status` then showed only the pre-existing audit paths, which are not mine.

## 1. Diff scope (PASS)

```
 app/universities/[id]/page.tsx | 32 ++++++++++++++++++++++++++++++--
 audits/FIX-LOG.md              |  5 +++++
 public/llms.txt                |  2 +-
 scripts/build-llms-txt.mjs     |  2 +-
 4 files changed, 37 insertions(+), 4 deletions(-)
```
These are exactly the four expected files. In page.tsx, `schemaSameAs()` returns null when no officialUrl is set, when the host (minus `www.`) is shared by 2+ records in `UNIVERSITIES`, or when the host is `samarth.edu.in` or one of its subdomains. The function is called twice in the spread, which is harmless.

## 2. F1 (FAIL)

`public/llms.txt` line 3 and `scripts/build-llms-txt.mjs:140` both read:

> Where a page shows a checked date, that is when the fee was compared with the university's own fee page.

`npx tsx scripts/build-llms-txt.mjs --check` passes: `check-llms-txt: OK (143 universities, 25 with a current verified NAAC grade)`, exit 0.

It is still not literally true. The sentence covers every page that shows a "checked" date, and many built pages show "checked <date>" for something other than a fee. I scanned every `.html` under `.next/server/app`, with scripts and tags stripped:

- **124 `/verify/*` pages:** "Source: deb.ugc.ac.in officers page, checked November 2026" (`components/verify/UgcDebContacts.tsx:97`). This is a UGC-DEB contact check, not a fee check.
- **`universities/amity-university-online.html`:** "WSCUC institution record, checked Nov 2026", "QAA, 1 Sep 2023 announcement, checked Nov 2026" and "Amity's site, checked Nov 2026". These are accreditation sources from `lib/data/first-hand/amity-university-online.ts`.
- **`universities/manipal-university-jaipur-online.html` and `/mba.html`:** "Online Manipal, checked Nov 2026" and "Document list as published by Online Manipal, checked Nov 2026".
- **`universities/{amity-university-online,nmims-online,manipal-university-jaipur-online}/mba.html`:** "What <uni> says (checked November 2026)". This is a placements claim (`components/FirstHandMbaSections.tsx:93`).
- **About 30 blog posts:** "... in one box (checked November 2026)" fact boxes, plus "deb.ugc.ac.in checked October 2026", "ugc.gov.in ... checked Oct 2026", and similar.
- **`guides/how-to-check-ugc-deb-approval.html`:** officers list "checked November 2026".

The fee labels themselves are consistent: every "Fees checked <month> 2026" instance found was beside a fee table.

Suggested wording, which is true as written: "Where a fee table shows a 'Fees checked' date, that is when the fee was compared with the university's own fee page." Change both files together so `--check` keeps passing.

## 3. F2 (PASS)

JSON-LD was parsed from all 143 `.next/server/app/universities/*.html`:
- Exactly 19 files have `sameAs` on the `#university` node, and the aggregate count is 19 CollegeOrUniversity nodes with sameAs.
- `manipal-university-jaipur-online`, `sikkim-manipal-university-online`, `manipal-academy-higher-education-online` and `ignou-online` have none.
- Duplicate hosts among the 19: `[]`.
- The 19 are: alliance (allianceonline.edu.in), amity (amityonline.com), bharati-vidyapeeth (bharatividyapeethonline.com), desh-bhagat (dbuonline.in), galgotias (galgotiasonline.edu.in), ggsipu (cdoe.ipu.ac.in), jain (onlinejain.com), jaypee (www.jiitonline.com), jss (jssuni.edu.in), lpu (www.lpuonline.com), marwadi (marwadiuniversity.online), mats (matsuniversityonline.com), nmims (online.nmims.edu), niu (niuonline.edu.in), pp-savani (www.ppsu.ac.in), sharda (shardaonline.ai), symbiosis (ssodl.edu.in), upes (upesonline.ac.in), uttaranchal (onlineuu.in).

## 4. Everything else still holds (PASS)

- **Schema in built profiles:** ratingValue 0/143 and `"@type":"Review"` 0/143. Across 823 university-typed nodes, 0 carry a telephone, and every `telephone` key sits on a `ContactPoint`. NMIMS node: `sameAs ["https://online.nmims.edu"]` with no telephone. Calicut: "Grade ." count 0.
- **`node scripts/check-schema-claims.mjs`:** `OK (258 files scanned, ...)`, exit 0.
- **`sh .husky/pre-commit`:** exit 0, ending with `pre-commit: all checks passed`. The tree was unchanged afterwards.
- **`_not-found.html`:** a single `<meta name="robots" content="noindex"/>` and a canonical count of 0.
- **`admin-login.html`:** `<meta name="robots" content="noindex, nofollow"/>`.
- **`universities/nmims-online/mba.html`:** `index, follow`, with a self canonical `https://edifyedu.in/universities/nmims-online/mba`.
- **`robots.txt.body`:** all 9 groups have the identical list `/admin/ /api/ /blog/write /blog/new /admin/excel-import/ /university-data/ /compare? /dashboard/`.
- **CSP:**
  - `routes-manifest.json` connect-src has no web3forms, api.anthropic or api.github (0 occurrences).
  - The `next.config.js` headers evaluated under production give 8 directives and 0 malformed sources.
  - The one doubled space comes from the empty production `'unsafe-eval'` slot. It predates this batch and is harmless.
  - The client fetch targets are unchanged from the 2026-11-16 check: all same-origin `/api/*`.
