# QA: B3 batch 17 round 2, pre-merge rerun (fix/b3-batch-17 at 23da39d, parent 6e30448, base 78b2b7b)

Checker: qa-checker (outsider review). Date: 2026-11-27.

**Method**
- **Fresh builds:** 78b2b7b and 23da39d in clean worktrees (`next build`, both EXIT 0). I compared the prerendered HTML in `.next/server/app` page by page.
- **Pre-commit:** run on a 78b2b7b worktree with the 23da39d tree checked out and staged.
- **Peer detectors:** two of my own variants of the round-1 detector, never the engineer's newer scripts:
  - one scans only the `**vs X (...):**` header text;
  - one scans each block with its header included.
- **FeeBreakdown check:** a whole-site scan of visible text, base against branch, for the three generic phrases.

## Verdict: PASS

| # | Item | Result |
|---|---|---|
| F1 | FeeBreakdown unsourced lines on the six universities | PASS |
| F2 | Header and body peer quotes | PASS |
| F3 | Amity premium tier on healthcare specs | PASS |
| Adv | SRM, NIU, SMU (CU Tier 2), JAIN ACCA | PASS |
| R | Regression and gates | PASS |

## F1: PASS
- **The code change:** components/FeeBreakdown.tsx adds the six ids to `NO_UNSOURCED_FEE_COMPONENTS` (+7/-1). Nothing else in the component changed.
- **The six universities are clean.** Built pages printing "lending partners", "semester-wise or in full" or "Study Material", base → branch:

  | University | Base | Branch |
  |---|---|---|
  | Amrita | 5 | 0 |
  | ARKA | 2 | 0 |
  | CU | 14 | 0 |
  | Chitkara | 2 | 0 |
  | Kurukshetra | 4 | 0 |
  | LPU | 33 | 0 |

  Every base occurrence came from the FeeBreakdown template. No JSON prose used these phrases, so nothing sourced was lost on these pages.
- **Other universities are untouched.** The same scan gives identical counts at base and branch for all 49 other universities that print the lines. Examples: Amity 22/22, BV 32/32, MUJ 20/20, Parul 31/31, Vignan and Yenepoya still 0.
- **Totals are unchanged.** The six universities have 128 pages with a fee block. A script compared 101 of them with base and found the same total and per-semester figure on each, only without the Study Material row. The other 27 are CU MBA pages, where the total is too long for that script; I checked two of them by hand (the hub and business-analytics) and both carry the same four-option labelled fee.
  - Amrita: ₹1,76,000–₹2,60,000
  - ARKA: ₹1,08,500
  - Chitkara: ₹2,00,000
  - Kurukshetra: MBA ₹1,02,000, BBA ₹72,661
  - LPU: MBA, BBA, BCA and MCA labelled
  - CU: the MBA four-option labelled fee with labelled per-semester figures, plus BBA, BCA and MCA
- **No new EMI rows.** "EMI starts from" appears on 0 of these pages at base and at branch.
- **Wording:** the block now reads "Confirm the payment schedule with our counsellor before you pay." This is the existing Vignan and Yenepoya branch.

## F2: PASS
- **Header-only scan:**
  - source at 23da39d: 238 figures, 0 flagged (round 1 found 51 in 37 files);
  - built HTML: 182 figures, 0 flagged (round 1 found 37 on 28 pages).
- **Header-inclusive scan:** 0 PARTIAL and 0 UNLABELLED in source and in HTML. The remaining peer rows fall into two groups:
  - **18 figures (9 quotes):** the Amity premium-tier quotes from F3. My detector has no spec tier, so it compares them against the standard tier; F3 below confirms them against getFeePlans.
  - **Three DIFF rows, all detector misattributions:**
    - bits-pilani-work-integrated-online/mba/business-analytics: "(Rs 2,92,000 vs Rs 3,12,400)". Rs 3,12,400 is BITS's own fee (getExactFee ₹3,12,400), not MAHE's. MAHE is ₹2,92,000.
    - chandigarh-university-online/mba/business-analytics: "If the budget allows Rs 1,75,125, CU delivers ...". This is CU's own figure, wrongly attributed to the LPU block header. The sentence is unchanged since base.
    - dy-patil-university-online/mba/finance: the page title "DY Patil Navi Mumbai MBA Finance 2026: ₹1,75,000". The "DY Patil" alias maps to the Pune university, but this is the Navi Mumbai university's own fee (getExactFee ₹1,75,000).
  - **One PROG-NOT-OFFERED row:** dy-patil-university-online/bba/aviation. It has the same alias cause and is unchanged since round 1.
- **Chitkara IFA header** now reads "**vs general Finance MBAs (CU, MUJ):**". The block body carries no fee figure.
- **Every rewritten header matches getExactFee and its labels:**
  - Amity standard: Rs 2,07,000 to Rs 2,25,000
  - CU: Rs 1,75,125 to Rs 2,38,000 by certificate option and Early Bird discount
  - MUJ: Rs 1,84,000 list, Rs 1,56,400 after 15% discount
  - BV: Rs 1,78,000 total, Rs 1,68,000 paid in full
  - UPES: Rs 1,75,000 to Rs 2,20,000

## F3: PASS
- **Nine premium quotes.** There are exactly nine instances of "Rs 3,02,680 one-time to Rs 3,29,000 semester-wise", across 6 JSONs:

  | Page | Instances |
  |---|---|
  | chandigarh-university-online-mba-hospital-management | 1 |
  | galgotias-university-online-mba-healthcare-management | 2 (header and body) |
  | lovely-professional-university-online-mba-healthcare-management | 2 |
  | manipal-academy-higher-education-online-mba-healthcare-management | 1 |
  | sikkim-manipal-university-online-mba-healthcare | 1 |
  | symbiosis-university-online-mba-hospital-and-health-care-management | 2 |

  All nine render in the build. They match getFeePlans premium for Amity healthcare specs: one-time 3,02,680, semester 3,29,000, annual 3,12,560 within the range.
- **No healthcare quote left on the standard tier.** On every healthcare, hospital, ACCA or pharma JSON, no Amity healthcare quote still carries a standard figure.
- **The standard-tier quotes are correct by spec:**
  - The bharati-vidyapeeth hospitality page compares Amity Hospitality Management, which is not in the premium specs list.
  - The JAIN ACCA page compares Amity Finance, with "(no ACCA pathway)" removed.
  - The MAHE pharma page uses a generic Amity MBA.
- **Symbiosis healthcare reads cleanly.**
  - "at a lower fee", "If fee is the primary concern," "at a significantly lower cost" and "at lower cost" are all removed.
  - No cost comparative or derived gap remains in the file. Symbiosis is ₹3,15,000–₹3,70,000, which overlaps Amity premium, so no direction would have been safe.

## Advisories applied: PASS
- **SRM IST:** "Rs 1,50,000 to Rs 1,89,000 fee" in the SRM IST, Christ, JMI and VIT JSONs matches getExactFee ₹1,50,000–₹1,89,000. "fixed" is gone, and so is "Rs 1.89L fixed" on SRM's own page.
- **NIU:** "UPES ... a stronger credential at a higher fee". The direction is correct: UPES ₹1,75,000–₹2,20,000 against NIU ₹1,18,000.
- **SMU (finance and ops/SCM):** "CU ... PwC co-teaching (Tier 2) at Rs 1,90,400 to Rs 2,38,000 with 3 certificates". This matches the CU feeBreakdown: 3 certificates, 1,90,400 after 20% Early Bird, 2,38,000 list.
- **JAIN ACCA:** "(no ACCA pathway)" is dropped.

## Regression and gates: PASS
- **Build:** both EXIT 0, with the same page list of 2,335.
- **Base 78b2b7b → 23da39d:**
  - 228 pages changed visibly, 103 in JSON-LD. The rise from round 1's 162 comes from the FeeBreakdown rows leaving hub, BBA, BCA and MCA pages of the six universities.
  - JSON-LD: 0 parse failures. 0 pages gain unmirrored FAQ answers. 0 pages with undefined or NaN.
  - Meta: 0 head-field changes (title, description, og, twitter, canonical, robots).
  - Tags: across all 2,335 built pages, 0 new tag imbalances against base.
- **Files:**
  - JSON round-trip: 225 changed JSONs, 0 mismatches.
  - CRLF: 229 files, 0 with CR lines at either commit, 0 trailing-newline changes.
- **Pre-commit** on the staged 78b2b7b..23da39d tree (index equal to the 23da39d tree, unchanged after the run): EXIT 0.
  - fee baseline 205, blog-fees 1950, em-dash 228: all unchanged;
  - verify-fees: 0 new mismatches;
  - NAAC consistency: 0 mismatches;
  - protected pages OK; data-slim drift OK;
  - page-content-json and page-content-facts: 431 files;
  - sitemap-lastmod: OK, 428 entries.
- **Full diff 6e30448..23da39d:** 51 files, all read.
  - 49 page-content JSONs: header quotes, the premium tier, SRM and JMI/VIT/Christ "fixed", NIU, SMU, JAIN ACCA and Symbiosis.
  - components/FeeBreakdown.tsx: the set only.
  - audits/FIX-LOG.md: 59 lines appended, 0 deleted.
  - Nothing under app/ or lib/data.ts, and no CMS paths.
- **Round 1 items:** none of the round 1 PASS items regressed. The JAIN tiers and FAQ, the Amrita range, the deletions for universities with no fee, the thresholds, the EMI sources and the FAQ removals are untouched by round 2, apart from the lines listed above.

## Advisories (non-blocking, out of scope)
1. **JMI fee on the SRM IST page.** srm-institute-science-technology-online-mba.json quotes "Jamia Millia Islamia Online: ... Rs 50,000 fixed fee", but JMI has no publishable fee (getExactFee returns none). This was reported by the engineer and confirmed here.
2. **CU business-analytics.** It says "If the budget allows Rs 1,75,125": CU's own Early Bird net with no label. This predates the batch.
3. **CU per-semester figure.** The CU FeeBreakdown per-semester "₹43,781 with 1 certificate after Early Bird" is unchanged since base. I did not trace it to a published figure in this pass.
4. **Detector gap.** My detector's "DY Patil" alias resolves to the Pune university. Any future scan should treat dy-patil-university-online pages as that university's own pages.
