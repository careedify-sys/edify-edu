# QA pre-merge: B3 batch 5 (fix/b3-batch-5 at eff1c32)

Date: 2026-11-25 · Checker: qa-checker (outsider re-check, no site edits) · Base: 8af7d35

## Overall verdict: FAIL

Do not merge. Five blocking defects are rendered on indexed pages. Each one needs a single text edit, listed under "Fixes required" at the end. The refactor (test 2), the regression checks (test 8) and every gate pass.

| # | Test | Result |
|---|------|--------|
| 1 | Listing cards: gated fee only | FAIL (2 of 143 cards) |
| 2 | Server-wrapper refactor of / and /universities | PASS |
| 3 | Shoolini QS / SEBI-MCA / RERA / blank lines | FAIL (1 MCA clause left) |
| 4 | Dr MGR ranges, gaps, "X is cheaper" | FAIL |
| 5 | Kurukshetra "central university" | FAIL (1 variant left) |
| 6 | Exclusivity claims | FAIL (2 broken rewrites, plus leftovers in the edited files) |
| 7 | Salary-premium whyChoose and SpecializationGrid | FAIL (1 whyChoose pay claim left) |
| 8 | Regression, gates, baselines | PASS |

## Method

- **Base build:** clean scratch worktree `scratchpad/qab5base` at 8af7d35. node_modules was junctioned from the main checkout and audit-data/ was copied in. `npm run build` exited 0 with 2360/2360 static pages.
- **Branch build:** built independently in `scratchpad/qab5branch` at eff1c32, exit 0. The engineer's own `.next` (BUILD_ID 10:37, after the 10:33 commit, clean tree) produced identical text: 0 of 2335 pages differ from my build.
- **Text comparison:** title, meta description, canonical, robots, JSON-LD and visible text were extracted from every prerendered HTML page in both builds (`scratchpad/qab5/extract.mjs`). Detectors are plain substrings in `scratchpad/qab5/detect.mjs`, `ctx.mjs`, `cards.mjs` and `cardcheck.mjs`.
- **Detectors proven on the base first:** every detector below fires on the base before its branch 0 counts. The T8 detectors (undefined, NaN, empty ₹) found nothing on either build, so they were proven by injection: 3 of 3 caught. The em-dash gate was proven by injecting an em dash into the moved HomePageClient.tsx: it FAILs with "1 em dash(es), baseline allows 0".
- **Interactivity:** both builds were run under `next start` (3105 branch, 3106 base) and driven by headless Chrome over CDP (`scratchpad/qab5/cdp.cjs`).
- **Pre-commit:** `.husky/pre-commit` was run on a staged copy of 8af7d35..eff1c32 (`scratchpad/qab5gates`). It ended "all checks passed", exit 0, and the hook made no extra changes.

## Test 1: listing cards. FAIL

- **Raw-range detector:** fires on the base (125 of 143 /universities cards and 4 of 6 homepage cards differ from the gated fee) and is 0 on the branch.
- **Card vs gated fee:** on /universities, 143 of 143 cards equal `formatExactFeeShort(getExactFee(u,'MBA'))` or the counsellor line. That is 56 published, 65 suppressed and 22 with no MBA. EMI never appears beside a non-gated fee (0). On the homepage, 6 of 6 cards match.
- **Card vs the profile's own "All Programs" row:** 141 of 143 agree. 2 do not:
  - `university-of-mumbai-online`: the card says "MBA total fees ₹90,000–₹2,00,000, EMI ₹3,750/mo". The profile prints only "MA Contact our counsellor…" and never prints an MBA fee. The MBA hub is noindex and MBA is not in the programme allowlist.
  - `madurai-kamaraj-university-online`: the card says "MBA total fees ₹75,000–₹1,80,000, EMI ₹3,125/mo". The profile prints no MBA row; every listed programme is on the counsellor line.
  - Cause: `lib/card-fees.ts:22` iterates `u.programs`, but the profile lists `getResolvableProgrammes(u)` (`app/universities/[id]/page.tsx:249`).
- **Spot-check, 10 universities, card vs profile on the branch:**

| University | Base card | Branch card | Profile |
|---|---|---|---|
| MAHE (published) | ₹2.9L | MBA ₹2,92,000 + EMI | MBA ₹2,92,000 |
| Galgotias (published) | ₹80K | MBA ₹80,200 | MBA ₹80,200 |
| Kurukshetra (published) | ₹1.0L | MBA ₹1,02,000 + EMI | MBA ₹1,02,000 |
| Chitkara (published) | ₹2.0L | MBA ₹2,00,000 + EMI | MBA ₹2,00,000 |
| Uttaranchal (published, labelled) | ₹100K – ₹1.5L | MBA ₹1,48,000 + EMI | MBA ₹1,48,000 |
| Dr MGR (suppressed) | ₹1.4L + EMI | counsellor, no EMI | MBA counsellor |
| Yenepoya (suppressed) | ₹60K – ₹2.0L + EMI | counsellor, no EMI | MBA counsellor |
| Alagappa (no MBA) | ₹60K – ₹2.0L + EMI | counsellor, no EMI | B.Com ₹60,100 (no MBA row) |
| Univ. of Mumbai | ₹90K – ₹2.0L + EMI | **MBA ₹90,000–₹2,00,000 + EMI** | **no MBA row (MA counsellor)** |
| Madurai Kamaraj | ₹75K – ₹1.8L + EMI | **MBA ₹75,000–₹1,80,000 + EMI** | **no MBA row** |

- **Hub card grids:** /programs/mba, /programs/bba, /programs/mca and /programs/mba/finance (dynamic, fetched from `next start`) are byte-identical in their card fee blocks, base vs branch. On /programs/mba, 116 of 121 cards equal the short gated fee. The other 5 print the labelled detail form of the same gated fee (MUJ, LPU, CU, Uttaranchal, BVP), which is unchanged from base.
- **Advisory (not blocking):** two controls in `components/UniversitiesListClient.tsx` still use the ungated UNIS_SLIM fees:
  - "Fees Low → High" / "Fees High → Low" sort on feeMin/feeMax (lines 41-42).
  - The Max Fees slider filters on feeMin (line 36).
  - Effect on the branch: the first 5 cards under "Fees Low → High" all print the counsellor line, ordered by hidden placeholder values.

## Test 2: server-wrapper refactor. PASS

- **Route table:** `○ /` and `○ /universities` are static in both builds. The / route goes from 17.6 kB to 17.7 kB, /universities from 6.04 kB to 6.06 kB, and First Load JS shared is 87.4 kB in both.
- **Metadata:** title, description, canonical and JSON-LD are byte-identical for / and /universities. robots is unchanged.
- **Visible text, word-level diff:**
  - Homepage: only the 6 fee strings change, "Total" becomes "MBA total", and "· QS #1 Pvt" goes from the Shoolini brand tag (twice, marquee duplicate).
  - /universities: only fee, label and EMI tokens change.
- **Moved code:**
  - `diff --strip-trailing-cr` of base app/page.tsx against components/HomePageClient.tsx shows only the CardFees import and prop, the Shoolini tag and the AnimatedUniGrid prop.
  - The 5 em dashes were all inside JSX comments (lines 152, 155, 336, 342, 382) and are now colons. Nothing visible changed.
  - Base app/universities/page.tsx against UniversitiesListClient.tsx shows only the prop and the card fee block.
  - HomePageClient.tsx has mixed CRLF/LF line endings. This is cosmetic.
- **Interactivity, CDP on `next start`, base and branch identical apart from fees:**
  - /universities: 143 found; search "amity" gives 1, cleared gives 143; sort feeAsc and name A–Z give the same order as base; Filters, then the MCA chip, gives 74 (labels now read "MCA total fees" with 0 EMI, against 58 EMI on base); slider at 100000 gives 54; Clear all gives 143; "Enquire" opens the form.
  - Homepage: 6 cards animate to opacity 1; "Speak with an Advisor" and "Check Eligibility" both open the enquiry form.
  - Console: no hydration errors and no exceptions on either build. The only errors are the tawk.to CORS block on localhost, which is the same on base.

## Test 3: Shoolini. FAIL

- **Detector counts, base then branch:**
  - "QS #1": 24 to 19, and every remaining hit is the frozen meta or another university's qsRank
  - "#1 Private": 12 to 0
  - "QS World ranked with strong": 1 to 0
  - "SEBI and MCA": 3 to 0
  - "MCA direct selling": 2 to 0
  - "SEBI Collective": 1 to 0
  - "SEBI MFD": 1 to 0
  - RERA FAQ: 2 to 0, in both text and FAQPage LD
  - `\n\n\n\n` in Shoolini JSONs: 0
- **What still mentions QS for Shoolini (all allowed):**
  1. Q30 highlights block (`lib/data.ts:1551` claim, `:1596` verifyNote) on 36 Shoolini hub and spec pages: "QS World University Rankings 2027 Ranked the No. 1 private university in India, and #452 globally", plus "Rankings are as published by QS and Times Higher Education…".
  2. Q30 "QS Ranked" approvals chip (`lib/data.ts:1458`, `:2844`) on the profile, hubs and specs.
  3. Frozen review metaDescription "QS #1 private" (`lib/blog.ts:29809`). It appears in the meta, the LD and the visible excerpt on /blog/shoolini-online-mba-review and the /blog/page/8 card.
  - Nothing else. The homepage tag is now "NAAC A+" and the lib/content.ts MCA highlight QS line is gone.
- **FAIL:** one MCA direct-selling clause survived on an indexed page, /universities/shoolini-university-online/mba/direct-selling-management.
  - Location: `lib/data/page-content/shoolini-university-online-mba-direct-selling-management.json:124`
  - Text: `"You want DSA regulatory compliance (MCA 2021), compensation plan design, and network management content in an academic MBA programme."`
  - The FIX-LOG itself says the 2021 rules are Consumer Affairs, not MCA.

## Test 4: Dr MGR. FAIL

- **Removed (detectors fire on base source):** "1.36-1.41L" 7 to 0; "Rs 49,600 to Rs 54,600" 2 to 0; "Rs 36,400 to Rs 41,400" 1 to 0.
- **The comparisons are unsupported because Dr MGR's own fee is suppressed:**
  - `getExactFee(dr-mgr, 'MBA')` = `{kind:'none'}`.
  - The profile and spec fee boxes print "Total Fees: Contact our counsellor for current fee details".
  - Every "X is cheaper", "lower fee" and "wins on fee" claim therefore compares against a fee the site does not publish.
  - Uttaranchal's gated fee is ₹1,48,000, which is above Dr MGR's Rs 1,41,000 range top. So "Uttaranchal is cheaper" also points the wrong way against the gated figure.
- **Rendered on indexed pages** (finance, healthcare-management, information-systems are `index, follow`):
  - `dr-mgr-educational-research-institute-online-mba-finance.json:90`: "Vignan is cheaper.", "Vignan wins on fee."
  - Same file `:128`: "Vignan at Rs 90,000 or Kurukshetra at Rs 1,02,000 offer NAAC A+ finance MBAs at lower fees". Kurukshetra is also A++, not A+.
  - `…-healthcare-management.json:90`: "Vignan is cheaper.", "Vignan wins on fee.", "NIU is cheaper.", "Sharda is more expensive.", "Dr. MGR is the stronger choice at a lower fee."
  - Same line also says "Dr. MGR has NAAC A+ (higher accreditation)" against NIU, which is false: NIU is A+ in lib/data.ts.
  - Same file `:128`: "…offer healthcare MBAs at lower fees"
  - `…-information-systems.json:90`: "Vignan is cheaper.", "Vignan wins on fee.", "JIIT is more expensive.", "Dr. MGR offers NAAC A+ at a lower fee…", "Dr. MGR wins on fee…"
  - Same file `:128`: "…offer IT/IS MBAs at lower fees"
  - `…-online-mba.json:52`: "Amrita … Stronger national NIRF ranking and NAAC grade at a lower fee."
- **In source on noindex pages** (hr-management, marketing, operations). These render the thin fallback today but print if the hubs are indexed later:
  - `…-human-resource-management.json:86`: "Galgotias is cheaper." and "Uttaranchal is cheaper." Both sentences were written in this commit.
  - Same file `:124`
  - `…-marketing-management.json:90`: "Vignan is cheaper.", "Galgotias is cheaper."
  - Same file `:128`
  - `…-operations-management.json:90`: "Vignan is cheaper…", "Alliance is more expensive.", "…at a lower fee…", "Dr. MGR wins on fee…"
  - Same file `:128`
- **Related, not part of this test's literal scope:** the same three indexed spec pages print "Rs 1,36,000 to Rs 1,41,000" 12 times each, beside a fee box that says "Contact our counsellor". The profile hero description also says "Total fees: ₹1.41L". This is pre-existing, but it is the root of the comparisons above.

## Test 5: Kurukshetra. FAIL

- "central university" on Kurukshetra pages went from 1 rendered and 5 in source to 0. No new claim was added: "state" and "public" were already in the sentences, and A++ matches lib/data.ts.
- **FAIL:** the variant "central government university" survives on the indexed page /universities/kurukshetra-university-online/mba (Red Flag 2).
  - Location: `lib/data/page-content/kurukshetra-university-online-mba.json:66`
  - Text: `"Placement support at a central government university is primarily alumni networking and job board access, not structured corporate placement."`

## Test 6: exclusivity. FAIL

- **Detector counts, base then branch:**
  - "the only": 171 to 118
  - "only UGC-DEB": 3541 to 3537
  - "no other": 55 to 9
  - "unique": 225 to 216
  - "rarest": 23 to 0
  - "monopoly": 2 to 1
  - "nobody else": 14 to 9
  - "only university": 5 to 5
  - "India's only": 7 to 2
  - "India's only NAAC A++": 5 to 0
- **Named Q53 claims are all gone:**
  - Alliance: "a Business Analytics & AI track" / "Explicit AI focus"
  - JAIN sentence deleted; "Amity offers them"
  - CU aviation: FAQ, Quick Answer and "Single university monopoly" removed
  - Amrita "rarest thing on the list" and "almost no online-MBA provider carries a NIRF rank"
  - The 5 Amrita "India's only NAAC A++" lines. The replacement "Amrita holds NAAC A++ accreditation" matches lib/data.ts (A++, NIRF University 8).
- **Classification of what remains:**
  - Frozen meta (allowed): the Jamia review "edge nobody else offers online" and the Shoolini "QS #1 private".
  - Scoped (allowed): "in our index", "of the two", "in this grant", "on this list", "the only Manipal group option" and "the only JAIN MBA specialisation".
  - Generic or unrelated (allowed): "the only authoritative source", "only UGC-DEB approved degrees are accepted" (boilerplate, 3537 hits), the GIFT City IFSC, exam prep, "monopoly risks", "the only one in the index", and the attributed "Amity says it is the only…".
  - Self-claims on the homepage, pre-existing and out of scope: "India's Only Unbiased Online Education Platform" and "No other platform lets you cross-check…".
- **FAIL A: two rewrites introduced broken text on indexed pages.**
  - `lib/data/page-content/bharati-vidyapeeth-university-online-mba-infrastructure.json:13`, about.body: "Bharati Vidyapeeth is one of them." now dangles. Its antecedent ("Fewer than five UGC-DEB approved universities offer this track") was deleted. Rendered on /universities/bharati-vidyapeeth-university-online/mba/infrastructure.
  - `lib/blog.ts:23133`: `<li><strong>If budget is below Rs 1.20 lakh:</strong></li>` is now an empty bullet that renders "If budget is below Rs 1.20 lakh:" with nothing after it, on /blog/jamia-hamdard-mba-2026. Jamia's MBA fee is also suppressed (`getExactFee` none), so it cannot be refilled with a fee.
- **FAIL B: unscoped market-exclusivity claims of the same class remain in the very JSON blocks this commit edited.** The FIX-LOG says "139 -> 0", but that holds only for the curated pattern list. The broad set ("unique", "extremely rare", "no direct peer", "no comparable peer", "almost no") still finds:
  - `bharati-vidyapeeth-university-online-mba-event-management.json`:
    - `:9` "Extremely rare online MBA specialisation"
    - `:13` "extremely rare … almost no peer programmes … functionally unique among NIRF-ranked online universities"
    - `:27` "Almost no Indian online university offers Event Management…" and "This is a unique offering. No comparable peer exists at the NIRF-ranked online MBA level."
    - `:56` "No comparable peer exists online."
  - `bharati-vidyapeeth-university-online-mba-infrastructure.json`:
    - `:11` "Almost no peer universities offer this spec at this fee point."
    - `:27` "an extremely rare online MBA specialisation. Few UGC-DEB approved universities offer it."
  - `bharati-vidyapeeth-university-online-mba-sports.json`:
    - `:11` and `:13` "One of the most unique online MBA specialisations in India. Almost no …"
    - `:27` "extremely rare … virtually no direct peer … both unique and difficult to benchmark"
  - `symbiosis-university-online-mba-agri-operations-management.json:106`: "SSODL's Agri Operations Management is unique - no direct peer online MBA offers a dedicated agri operations specialisation in India." This contradicts the DPU-COL Agri Business page.
  - `upes-online-mba-oil-and-gas-management.json:70`: "There is no direct peer comparison for this specialisation."
  - `upes-online-mba-power-management.json:70`: "No direct peer comparison exists at equivalent accreditation levels."
  - `bits-pilani-work-integrated-online-mba-strategy-consulting.json`:
    - `:11`, `:54` and `:77` "extremely rare in the Indian online MBA market"
    - `:13` and `:77` "one of the very few programmes"
- **Advisories in edited text (pre-existing facts, not introduced):**
  - `dr-dy-patil-vidyapeeth-online-mba-agri-business.json:66` (indexed): "Symbiosis at approximately ₹1,70,000 with NAAC A" and "DPU wins on NAAC grade (A++ vs A)". Symbiosis is A++ in lib/data.ts and its gated MBA fee is ₹3,15,000–₹3,70,000.
  - `sikkim-manipal-university-online-mba-finance.json`: "the most affordable UGC-DEB approved online Finance MBA among NAAC A+ institutions". This is false on our own data: Galgotias (A+) is ₹80,200 and Vignan (A+) is ₹90,000.
  - `amrita-vishwa-vidyapeetham-online-mba-artificial-intelligence.json`: "the strongest credential available in the online MBA space".
  - UPES pages call its Infrastructure track unique, while BVP Infrastructure exists.

## Test 7: salary. FAIL

- **Removed (fires on base, 0 on branch):**
  - "Highest salary premium": 66 to 0
  - "Entry-level cloud engineers earn": 46 to 0
  - "Highest average starting salary": 94 to 0
  - "earn premiums for measurable": 100 to 0
  - "30 to 40 percent above": 32 to 0
  - "premium consulting rates": 53 to 0
  - "rare and premium-priced": 27 to 0
  - "high income with flexibility": 40 to 0
  - "premium salaries" on university pages: 0
  - Amrita AI "command significant salary premiums": 0
- **SpecializationGrid:** "career scope, and salary data" went from 317 to 0, and "detailed syllabus and career scope." went from 0 to 317.
- **Q52 pages:** all 7 /programs/mba/specializations/* are byte-identical to base in title, desc, LD and text.
- **FAIL:** one pay-superlative whyChoose item survives, rendered on 93 HR spec pages.
  - Location: `lib/content.ts:930`
  - Text: `'HR Analytics and HR Technology are the highest-paying HR sub-functions'`
- **Advisory:** `lib/content.ts:826`, the Finance overview "Finance is consistently India's highest-paying MBA specialisation", renders on about 94 finance spec pages. It is the same claim as the removed whyChoose item "Highest average starting salary among all MBA specialisations".

## Test 8: regression. PASS

- **Pages:** 2335 in both builds, with no page only in one.
- **Head tags:** 0 titles, 0 meta descriptions, 0 canonicals and 0 robots changed.
- **JSON-LD:** changed on 44 pages. 22 are dateModified only; 22 are the intended FAQ/answer removals.
- **Blog posts:**
  - 27 updatedAt values became 2026-11-25. check-blog-updated-at reports "27 post(s) with content changes, all dated".
  - No title or meta change in the build.
  - check-protected-pages: "8 protected paths and 8 frozen posts checked" OK.
- **data/sitemap-lastmod.json:** 41 entries changed, all to 2026-11-25.
- **Diff read in full:** I checked every sentence present in eff1c32 but absent from 8af7d35 across all 59 files. No new fee, rank, grade, salary, date or eligibility value was introduced. Every rewritten fact traces to lib/data.ts:
  - JAIN nirfMgt 73
  - Lucknow, Kurukshetra and Amrita naac A++
  - UPES and AMET MBA specs
  - CU Airlines & Airport Management
- **No undefined, NaN or empty "₹":** 0 on both builds. The detectors were proven by injection.
- **JSON:** all 47 changed .json files parse; check-page-content-json reports 431 files OK.
- **Gates:** `.husky` and `scripts/` are unchanged (empty `git diff --stat`). data/fee-mismatch-baseline.json and the allowlists are unchanged.
- **Baselines (down only):** blog-fee went 2021 to 2020 (online-mba-maharashtra-2026 went 17 to 16). The em-dash baseline dropped `app/page.tsx: 5`.
- **Em-dash moves:** app/page.tsx, HomePageClient.tsx, UniversitiesListClient.tsx and lib/card-fees.ts all have 0 em dashes. The base's 5 were the JSX comments now turned into colons. The injected-dash control shows the gate does count HomePageClient.tsx, so the moved dashes are not hidden.
- **.husky/pre-commit on the staged copy:** all checks passed, exit 0. check-fee-wording is warn-only (593).
- **Scope:** the diff touches only the item's files, including audits/FIX-LOG.md.

## Fixes required (then re-run QA)

1. `lib/card-fees.ts:22`: replace `for (const p of u.programs) {` with `for (const p of getResolvableProgrammes(u)) {`, adding `import { getResolvableProgrammes } from './seo/safe-internal-links'`. Mumbai and Madurai cards then fall to the counsellor line with no EMI, which matches their profiles.
2. `lib/data/page-content/shoolini-university-online-mba-direct-selling-management.json:124`: change to `"You want compensation plan design and network management content in an academic MBA programme."`
3. Dr MGR: delete every fee-direction clause on lines 86/90 and 124/128 of the six spec JSONs and on `…-online-mba.json:52`. These are "X is cheaper.", "X is more expensive.", "X wins on fee.", "…at a lower fee…", "Dr. MGR wins on fee…", "…offer … MBAs at (significantly) lower fees…" and "…the stronger choice at a lower fee". Keep the curriculum comparisons. While on healthcare `:90`, also delete "(higher accreditation)" in the NIU paragraph (NIU is A+). The alternative is to publish Dr MGR's fee through getExactFee with a verify sheet, which is Rishi's call.
4. `lib/data/page-content/kurukshetra-university-online-mba.json:66`: change to `"Placement support at Kurukshetra University Online is primarily alumni networking and job board access, not structured corporate placement."`
5. `lib/data/page-content/bharati-vidyapeeth-university-online-mba-infrastructure.json:13`: delete `Bharati Vidyapeeth is one of them.\n\n`.
6. `lib/blog.ts:23133`: delete the whole line `  <li><strong>If budget is below Rs 1.20 lakh:</strong></li>`. Jamia's MBA fee is suppressed, so nothing can go in it.
7. Exclusivity leftovers (test 6, FAIL B): cut the clauses listed under test 6 back to the factual part, the same way the commit treated "the only" and "rarest" (for example "This is a unique offering. No comparable peer exists at the NIRF-ranked online MBA level." becomes nothing). The files are BVP event-management `:9/:13/:27/:56`, BVP infrastructure `:11/:27`, BVP sports `:11/:13/:27`, Symbiosis agri-ops `:106`, UPES oil-gas `:70`, UPES power `:70` and BITS strategy-consulting `:11/:13/:54/:77`.
8. `lib/content.ts:930`: remove `'HR Analytics and HR Technology are the highest-paying HR sub-functions',` from the HR whyChoose array.

For the fixing session, three notes:

- Use `"central government university"` as a detector, not only `"central university"`.
- Use `"MCA 2021"` as a detector, not only the SEBI/MCA strings.
- Each edit to lib/blog.ts and the page-content JSON will re-date the post or URL through the hooks. That is expected.

## Evidence files (scratchpad, not committed)

All under C:/Users/91706/AppData/Local/Temp/claude/4989ee246e828ad6/b8b6c658-5c86-4f0f-8a0d-9476c306dede/scratchpad/:

- Builds: qab5-base-build.log, qab5-branch-build.log
- Pre-commit: qab5-precommit.log
- Detector output: qab5/det-base.txt and qab5/det-branch.txt (base and branch counts)
- Card checks: qab5/cards-base-unis.txt, qab5/cards-branch-unis.txt, qab5/cards-*-home.txt and qab5/fees-all.jsonl (gated fees)
- Page diff: qab5/pagediff-out.txt (added and removed sentences)
- Interactivity: qab5/cdp-base.json, qab5/cdp-branch.json
- Worktrees: qab5base, qab5branch, qab5gates
