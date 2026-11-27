# QA: B3 batch 16, pre-merge (fix/b3-batch-16 at c9924b2, base ab8f561)

Checked 2026-11-27 by qa-checker. I did not do this work. No site edits, commits or pushes.

**VERDICT: FAIL** on three findings. F1 and F2 are text fixes in page-content JSON. F3 is a small metadata fix in the two app routes. Gates, typecheck, CRLF, JSON round-trip, the 404 set, Mysore and UPES all pass.

## Method

- **Fresh `next build`** of each commit in separate scratch worktrees:
  - base ab8f561: EXIT 0
  - branch c9924b2: EXIT 0. The build includes the app type check.
  - Compared all 2,335 prerendered pages in `.next/server/app`.
- **Head metadata:** extracted every tag from `<head>` with my own script, not the engineer's TSV: title, description, og:title, og:description, og:url, og:image, og:type, twitter:card, twitter:title, twitter:description, twitter:image, robots, canonical.
- **Visible text:** compared after `</head>`, with scripts and styles stripped.
- **Page-content JSON:** walked every string at both commits.
- **getExactFee:** recomputed myself with `npx tsx` against lib/data.ts and lib/fees.ts.
- **Live checks:** curl on edifyedu.in today, with ?cb= and a browser User-Agent.
- **Pre-commit:** ran `.husky/pre-commit` on a third worktree. Its index equals the c9924b2 tree (`git diff --cached --quiet c9924b2` passed).
- No servers were started this round.

## Test 1: OG/Twitter template (PASS on its own rules; F3 is collateral damage)

**Diff.** I read the full diff of all 7 app files.

- In layout.tsx, `feeStr` becomes `formatExactFeeShort(getExactFee(u, mainProg))`. With no publishable fee, the clause drops.
- The bba, bca and mca hubs and mca/[spec] add `twitter: { card: 'summary', title, description }`.
- bba/[spec] and bca/[spec] hoist title and description into consts and add `openGraph: { title, description, type: 'website' }` plus the same twitter block.

**Measured head changes.** 820 pages changed, all under bba, bca or mca. No profile, MBA hub or MBA spec page changed apart from the two 404 MBA shells.

| Field | Pages changed |
|---|---|
| twitter:description | 820 |
| twitter:title | 805 |
| og:description | 413 |
| og:title | 398 |
| og:url, og:image, twitter:image | 398 each (see F3) |
| meta description | 15 |
| `<title>` | 0 |

**Rule check, over all 820 pages, not a sample:**

- Every changed og:description and twitter:description now equals the page's own meta description: 0 violations.
- Every changed og:title and twitter:title now equals the page's own `<title>`: 0 violations.
- The og:title and twitter:title changes are therefore the page's own existing title copied across. They are not new title copy, so they pass under the brief's rule.

**30-pair sample.** I took every Nth page across bba, bca and mca hubs and specs. In all 30, twd == desc and ogd == desc. Examples:

- Alliance bba/finance: "total fees (₹1.7L–₹1.7L)" became "₹1,39,000 fees", the page's own BBA fee.
- dy-patil bca/web-development: "₹60K–₹2.0L" became "₹1,32,000 fees".
- marwadi bba: "₹60K–₹2.0L" became "₹79,000–₹90,000 fees".
- vit mca/computer-architecture: "₹1.6L–₹1.6L" became "fees on request".

The engineer's TSV agrees with my counts (d 15, og 413, tw 820).

**"total fees (" in og or twitter descriptions** drops from 772 pages to 3. The 3 left are all 404 shells: andhra/mca ₹62,200, integral/mca ₹1,10,000 and vignan/bba ₹90,000. Each prints the MBA figure on a non-MBA URL. This is the advisory the brief expected.

**The 15 description changes are all 404 shells:**

- andhra/mca, anna/mca, central-university-himachal-pradesh/mca, integral/mca, karnataka-state-open-university/mca, vignan/bba
- hindustan bba and bca
- madurai-kamaraj bca, mba and mca
- mumbai bba, bca, mba and mca

For all 15:

- **In the build:** robots "noindex", and the HTML carries the Next not-found markers.
- **Live today:** HTTP 404 with an empty body from the edge. Example headers from MKU mba: `HTTP/1.1 404 Not Found`, `cf-cache-status: MISS`. Because the edge returns no HTML, there is no meta robots tag to read. A 404 status is stronger than noindex.

**Protected pages:** check-protected-pages passed ("OK. 8 protected paths and 8 frozen posts checked").

### F3 (FAIL): og:image, twitter:image and og:url are lost on 398 BBA/BCA spec pages

- **What changed:**
  - In the base build, all 256 bba/[spec] and 142 bca/[spec] pages carry `og:image` and `twitter:image` (https://edifyedu.in/og.png), inherited from the university layout.
  - In the branch build, all 398 have none.
- **Cause:** bba/[spec] and bca/[spec] now set their own `openGraph` and `twitter` objects. In Next 14 those objects replace the layout's whole objects, including `images`.
- **Impact:** social and share cards for these pages lose their image.
- **og:url:** also dropped. The old value pointed at the university page, which was wrong, so this part is neutral.
- **Not new as a pattern:** BBA/BCA/MCA hubs and MCA specs already had no og:image at base (77 + 54 + 62 + 218 pages). This batch extends that gap to 398 more pages.
- **Fix:**
  - Add `images: [{ url: 'https://edifyedu.in/og.png', width: 1200, height: 630 }]` to the new openGraph object.
  - Add `images: ['https://edifyedu.in/og.png']` to twitter in the two spec routes.
  - Optionally do the same for the hubs and mca/[spec].

## Test 2: Mysore (PASS)

- **lib/data.ts** is not in the diff (122 files: 7 app files, lib/blog.ts, data/sitemap-lastmod.json, 112 page-content JSON files and FIX-LOG.md). The FIX-LOG records that the pd.fees clear was reverted because it would move check-fee-baseline from 205 to 206.
- **Karnataka H2:** "Mid-Range Tier: DSU, Christ, Alliance, and University of Mysore" became "DSU, Christ, Alliance, and University of Mysore".
  - The table of contents follows it, at 3 rendered spots.
  - The new anchor id is `dsu-christ-alliance-and-university-of-mysore`. No file in the repo links to the old `#mid-range-tier...` anchor.
- **updatedAt:** '2026-11-27' at both commits. It was already today from batch 15, so no further bump is possible.
- **check-blog-fees:** 1950, unchanged.

## Test 3: peer quotes (FAIL, see F1 and F2)

**Diff stats.**

- 112 files and 174 changed strings.
- 0 round-trip mismatches and 0 structural changes.
- No notation mangling: no "Rs Rs", "₹Rs", doubled labels, stray brackets or mixed ₹/Rs in a single string.

**My own getExactFee values for the 13 universities.** The rendered strings match these figures and labels exactly:

| University | getExactFee (MBA) |
|---|---|
| LPU | ₹2,00,000 list; ₹1,46,240–₹1,61,600 by payment plan |
| Uttaranchal | ₹1,48,000 before scholarship; ₹99,600–₹1,03,600 after scholarship |
| MUJ | ₹1,84,000 list; ₹1,56,400 after 15% discount |
| JAIN | ₹1,60,000–₹2,98,000 |
| Amrita | ₹1,76,000–₹2,60,000 |
| Amity | ₹2,07,000–₹2,25,000 |
| Shoolini | ₹1,30,000–₹1,58,000 |
| Symbiosis | ₹3,15,000–₹3,70,000 |
| Andhra | ₹62,200 |
| NMIMS | ₹1,96,000–₹2,20,000 |
| SMU | ₹1,20,000 |
| IGNOU | ₹66,000 |
| DPU | ₹1,89,400 |
| Madras, SRM Sikkim, Christ (MBA) | none |

**New numbers in the diff** are only these figures, plus "15" from the MUJ "after 15% discount" label.

**Sentences read.** I read every changed sentence: 174 strings, far more than the 40 required. Most read correctly. Some are clunky but true, for example "Uttaranchal at Rs 1,48,000 before scholarship, Rs 99,600 to Rs 1,03,600 after scholarship with NAAC A+ offers ...".

**Comparatives the engineer cut correctly:**

- Chitkara marketing: "LPU ... at a significantly lower fee".
- DSU IT systems: "Fee is higher than DSU" (SMU ₹1,20,000 is below DSU ₹1,30,000).
- MAHE healthcare: "Symbiosis ... at lower cost" and "MAHE ... is more expensive".
- Amity finance: "NMIMS charges more".
- LPU hub: "IGNOU ... below Rs.60,000".

**Deletions where getExactFee is none.**

- Madras "~Rs 20,000-40,000", SRM Sikkim "~Rs 1.10L" and Christ "Rs 60K-2L" are removed from peer lines.
- They left comparatives that only made sense with the deleted figure:
  - anna hub: "Lower fee but lower NIRF rank. Choose U Madras for budget-first decision"
  - andhra hub: "Similar fee but lower NIRF rank"
  - madras hub: "... much higher fee"
  - devi-ahilya hub: "SRM Sikkim is the cheaper of the two"
- None of the four renders on any built page (0 visible, 0 in RSC), so this is an advisory, not a fail.

**Christ MBA JSON.**

- It still says "Rs 60,000 to Rs 2,00,000" in 3 places.
- No MBA page for Christ is built: `universities/christ-university-online/` has only bba and mca. It is not in the sitemap.
- Live, /universities/christ-university-online/mba returns 307 to the university page, and that page does not contain the figure.
- Not rendered, not indexed. Advisory only, as the brief directed.

### F1 (FAIL): 6 peer quotes for in-scope universities were missed; all render visibly

The engineer's detector attributes a figure to the university named in the same sentence. It therefore cannot see "Fee is ..." sentences inside a `**vs X:**` block. My own vs-block scan found these, all visible in the branch build:

| Page | Text | getExactFee |
|---|---|---|
| amity mba/information-technology-management | vs LPU: "Fee is lower (around Rs 1,20,000)." | LPU ₹2,00,000 list; ₹1,46,240–₹1,61,600 |
| chandigarh mba/marketing | vs LPU: "Fee is around Rs 1,20,000." | same |
| chandigarh mba/marketing | vs MUJ: "Fee is Rs 1,60,000-1,99,000 depending on tier." | MUJ ₹1,84,000 list; ₹1,56,400 after 15% discount |
| chandigarh mba/finance | vs NMIMS: "Fee is Rs 2,05,000-2,10,000." | NMIMS ₹1,96,000–₹2,20,000 |
| chandigarh mba/banking-and-insurance | vs NMIMS: "Fee is higher at Rs 2,05,000-2,10,000." | same |
| sikkim-manipal mba/finance | vs MUJ: "Fee is approximately Rs 1,75,000." | MUJ ₹1,84,000 list; ₹1,56,400 after 15% discount |

The JSON sources are:

- amity-university-online-mba-information-technology-management.json
- chandigarh-university-online-mba-marketing.json
- chandigarh-university-online-mba-finance.json
- chandigarh-university-online-mba-banking-and-insurance.json
- sikkim-manipal-university-online-mba-finance.json

**Fix:** replace each figure with the getExactFee string and keep the labels. "Fee is lower" in the Amity IT block still holds against LPU's ₹2,00,000 list and can stay.

### F2 (FAIL): 3 visible comparatives now contradict the new figures

| Page | Sentence | Why it is now false |
|---|---|---|
| bits-pilani mba/business-analytics | "JAIN is NAAC A++ at nearly half the BITS Pilani WILP fee." | JAIN is now ₹1,60,000–₹2,98,000 against BITS ₹3,12,400. The top of the range is 95% of BITS. This is also a derived ratio. |
| chitkara mba/finance | "JAIN Finance (Rs 1,60,000 to Rs 2,98,000) and CU Finance (Rs 1,75,125) offer comparable or better accreditation at lower prices." | Chitkara is ₹2,00,000. JAIN's range runs to ₹2,98,000. |
| chitkara mba/international-finance-accounting | "JAIN International Finance ACCA (Rs 1,60,000 to Rs 2,98,000) offers a direct ACCA pathway at a lower fee." | Same. The ACCA track is likely at the top of JAIN's range. |

**Fix:** delete "nearly half the BITS Pilani WILP fee", "at lower prices" and "at a lower fee". Alternatively, make each sentence non-comparative.

## Test 4: UPES unrendered JSON (PASS, with an advisory)

- **"36 months":**
  - 0 occurrences in upes-online-mba-*.json.
  - The one remaining visible "36 months" on the site is DPU project-management "typically 36 months leading projects", which refers to PMI experience and is unrelated.
  - "Year 1", Year 2 and "NBFC": 0 occurrences in the UPES files.
- **"You want WES-recognised degree credentials."** is not a new claim. The old line was "You want an EMI option across up to 36 months with WES-recognised degree credentials", so only the EMI clause was removed.
- **Sourcing:**
  - lib/data.ts holds it for UPES: `approvals: [..., 'WES Recognised', 'QS Ranked']` at line 1016.
  - "WES-recognised" already appears in 11 UPES page-content files.
- *Advisory:* no audits/verify file covers UPES or its WES status. upesonline.ac.in/online-mba, fetched today, does not mention WES. If WES recognition matters, it needs a verify row. The file is also not rendered.

## Test 5: damage and gates (PASS)

**Page list and rendering.**

- The page list is identical: 2,335 pages in each build.
- 70 pages changed visibly: 69 spec pages plus the Karnataka post.
- 12 pages changed in JSON-LD. JSON-LD parse failures in the branch: 0.
- Pages containing undefined or NaN: 0. Pages with more unmirrored FAQ answers than base: 0.
- Unbalanced tag kinds on the 70 changed pages: 0.

**Files.**

- CRLF: 122 files changed. 0 have CR lines at either commit, and 0 trailing-newline changes.
- JSON: 431 files parse (check-page-content-json). The 112 changed files round-trip byte-identically through `JSON.stringify(_, null, 2)`.

**Pre-commit** on the staged ab8f561..c9924b2 tree: EXIT 0 ("all checks passed"). The working tree was unchanged after the run.

- check-fee-baseline: 205, unchanged.
- check-blog-fees: 1950, unchanged.
- verify-fees: 0 new mismatches.
- check-data-slim-drift: OK.
- check-protected-pages: OK.
- typecheck:scripts: OK.
- The app type check passes as part of `next build`.

**Diff scope:** only the item's files. That is the 7 app routes, lib/blog.ts (one H2), data/sitemap-lastmod.json (date bumps), 112 page-content JSON files and FIX-LOG.md.

## Advisories (not blocking)

- **A1.** Three 404 shells still print the MBA fee in their descriptions: andhra/mca ₹62,200, integral/mca ₹1,10,000 and vignan/bba ₹90,000. All three return 404 live.
- **A2.** JAIN's own pages still quote JAIN at "Rs 1,75,000-1,96,000" in their vs-Amity blocks: mba/finance, mba/general-management and mba/marketing, plus the HRM JSON. getExactFee gives ₹1,60,000–₹2,98,000. These are own-university quotes and outside the peer scope.
- **A3.** The Madras, SRM Sikkim and Christ fee deletions left orphan comparatives in the unrendered anna, andhra, madras and devi-ahilya hub JSONs (see test 3).
- **A4.** The Christ MBA JSON still says "Rs 60,000 to Rs 2,00,000". It is not built, and the live URL returns 307 to the university page.
- **A5.** No audits/verify row backs UPES WES recognition (see test 4).
- **A6.** The Andhra hub JSON still describes Andhra itself as "~Rs 14K-62K fee". It is an own quote and not rendered.

## Re-test needed after the fix

- F1: the 5 JSON files.
- F2: the 3 sentences.
- F3: og:image and twitter:image on bba/[spec] and bca/[spec].

Everything else above can carry over unless the fix touches other files.

## Scratch and cleanup

- Evidence is in C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/qa16/:
  - meta16rows.json: every page whose head changed, base and branch values
  - pairs16.txt: every changed JSON sentence
  - comp.txt: price comparatives inside changed strings
  - vsblock.txt: in-scope peer figures not matching getExactFee
  - d15.txt: the 15 description changes
  - precommit.log and dmg.out
- Worktrees q16base, q16br and q16gates have been removed. Their node_modules junctions were unlinked first.
