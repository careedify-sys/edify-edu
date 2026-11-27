# QA pre-merge rerun: B3 batch 23, rebased, plus round 2

- **Commits.** Branch fix/b3-batch-23 is at 24663a8 (round 2). Its parent is 4d7bec8, which is batch 23 rebased onto 21d475a.
- **Base.** 21d475a (batch 22 round 3).
- **Checker.** qa-checker, 2026-11-27.
- **Method.**
  - Scratch worktrees at 21d475a and 24663a8, each with a full `npm run build` (both exit 0).
  - The 21d475a..24663a8 patch staged on a clean tree, then the real pre-commit run on it.
  - A whole-site built-HTML diff.
  - A page-level ₹66,000 and "no total" scan of all 2335 built pages.
  - An independent scanAllPosts row diff.
  - The full 4d7bec8..24663a8 diff read. The range-diff for the rebase was also read.

## Verdict: FAIL (F1 and F2)

The rebase, F3, A1, A2, A3, A4, A6 and every gate pass. Two items fail.

**F1 (FAIL).** Three built blog pages still print IGNOU ₹66,000 and also say "No total published".

**F2 (FAIL).**
- The Q70 row has 10 table cells, not 6, because its text contains unescaped `|` characters. That breaks the markdown table Rishi answers in.
- Its scope also leaves out the blog meta surfaces.

Both fixes are small.

## F1 rule: no page prints IGNOU ₹66,000 and says "no total"

**Scan.**
- Every page in .next/server/app at 24663a8 was scanned for ₹66,000, Rs 66,000 or 66000 in:
  - the visible body;
  - JSON-LD;
  - the head;
  - the RSC payload.
- On the same page I searched for: "no (programme) total", "not (as) a programme total", "No total published", "publishes no total", "does not publish a total" and "without a total".

**Detector proven.** At base it flags working-professionals ("This is a template, not a total") as a known non-IGNOU match.

**Result at 24663a8.** 49 pages print 66,000. 3 of them also carry the claim.

| Page | 66,000 printed | Same page says |
|---|---|---|
| /blog/online-mba-fintech-india-2026 | metaDescription "fee ranges ₹66,000 to ₹2,25,000": head ×3, Article JSON-LD description ×2, visible dek ×1 | IGNOU row "No total published" |
| /blog/online-mba-hospitality-management-india-2026 | same | same |
| /blog/online-mba-real-estate-management-india-2026 | same ("verified fee ranges ₹66,000 to ₹2,25,000") | same |

**Why the engineer's sweep missed these.** The FIX-LOG says the 6 "No total published" blog cells "are on pages that do not render ₹66,000". That holds for distance-mba-kolkata, is-distance-mba-worth-it and logistics. It does not hold for these 3. The same FIX-LOG lists all three as "metaDescription hits".

**Fix.** On those three posts, make the IGNOU cell read like the hub's: "₹16,000 per semester (₹18,000 for the 3rd)", or "See per-semester column". This needs no meta change. Optionally do the same on the other three for consistency.

**Other pages.**
- **IGNOU MBA hub.** It now says "IGNOU publishes the MBA fee per semester and charges registration and development fees on top" in its FAQ. The tldr says "fees charged per semester". There is no "no total" claim, so the hub passes the rule.
- **Hub FAQ.** The FAQPage answer matches the page-content source and appears in the page payload. The other 9 FAQs follow the same accordion pattern.

## ignou-vs-lpu FAQ2 revert: PASS

- **Source.** pairs.ts FAQ2 is back to "IGNOU MBA costs Rs 66,000 total. LPU costs Rs 1,61,600 to Rs 2,00,000." This is dead text: page.tsx substitutes the getExactFee answer.
- **Built FAQPage.**
  - FAQ1: "charging Rs 16,000 per semester (Rs 18,000 for the 3rd) plus registration and development fees".
  - FAQ2: "IGNOU: ₹66,000. LPU: ₹2,00,000 list; ...".
- **Contradiction check.** There is no internal contradiction. 3 × 16,000 + 18,000 = 66,000, and no answer says that no total exists.
- **Advisory.** The ₹66,000 is the semester sum. It leaves out the registration and development fees that FAQ1 mentions, so it is a floor, not the full cost. The Q70 decision covers this.

## F2: Q70 (FAIL on cell count; numbering and rename pass)

**Numbering: PASS.**
- Q70 is the next free number. Before it, the highest is Q69 on both the branch and origin/main.
- The uncommitted QUESTIONS file in the main checkout has no Q70.

**FIX-LOG references: PASS.**
- The FIX-LOG now says Q70 in the batch 23 entry ("Q70; first filed as Q29 ...").
- The round 2 entry says Q70.
- No stale IGNOU "Q29" reference remains in the repo. The remaining Q29 mentions are the Shoolini question.

**Cells: FAIL.** The row splits into 10 cells, not 6. It contains four bare `|` characters:
- three inside quoted page titles: "... ₹66,000, NAAC A++ | EdifyEdu", "... NAAC A++ | edifyedu.in", "... UGC-DEB Approved | EdifyEdu";
- one in `'ignou-online|mba'`.

The effect on the rendered table:
- the Question cell is cut at the first title;
- "What's pre-filled" and "What stays" receive fragments;
- the "Rishi's answer" column holds part of the question.

Fix: escape each as `\|`, or reword. The round 1 Q29 row had the same 10-cell problem.

**Scope: mostly accurate, one gap.**

The row says about 42 pages, JSON-LD on 8, 6 titles plus metas, and 2 /compare descriptions. It lists the right classes: profile, hub plus 5 specs, the 2 compares, /fees, /universities, the peer profile cards, the andhra, srm-sikkim and madras hubs and specs, and the frozen posts and related cards.

I measured 49 pages printing 66,000 (48 visibly) and 15 with it in JSON-LD. The difference is blog metaDescriptions, which Q70 does not mention:
- distance-mba-meaning: "fees ₹66,000 to ₹2.25L";
- fintech, hospitality and real-estate: "₹66,000 to ₹2,25,000";
- is-ignou-fake-or-legit: JSON-LD ×1.

These metas print in the head, in the Article JSON-LD, as the visible dek, and on /blog/page/6. The lib/data.ts change Q70 asks about would not touch them, because they are hand-written meta. Q70 should say so, so that Rishi knows approval leaves these 4 or 5 metas in place.

## F3: the split is right and the 31 are listed (PASS)

- **My scan.** scanAllPosts at 21d475a vs 24663a8, as a multiset by (slug, raw). Unverified rows go from 2184 to 2122:
  - 30 deleted;
  - 1 became MATCH: is-ignou-fake-or-legit "Rs 50,800";
  - 31 became NON_FEE;
  - 0 new unverified rows.
- **Against round 1.** This equals the round 1 numbers.
- **The 31 rows.** They match the FIX-LOG list one for one. The FIX-LOG also names the university each figure belongs to:
  - is-ignou-fake ×4;
  - admission-guide ×1;
  - how-to-choose ×1;
  - affordable ×1;
  - mba-fees guide ×5;
  - kolkata ×1;
  - kerala ×1;
  - distance-meaning ×1;
  - chennai ×5;
  - best-online-mba ×2;
  - fintech ×2;
  - hospitality ×3;
  - logistics ×3;
  - real-estate ×1.
- **Batch 25 scope.** The FIX-LOG adds them to the batch 25 exemption scope.

## Advisories from round 1

**A1: PASS.**
- The BITS reason is corrected. Both "Overall #16" and "University #7" are NIRF 2025 facts, and the edit was a category change.
- The BITS review's "#16 Overall" is now described as correct.

**A2: PASS. VIT without a year is acceptable.**
- "2025" was added to 9 JAIN cells:
  - 6 × "NIRF 2025 Management 73": mahe review, mba-after-engineering, mba-hr-career, mba-data-science, mba-for-commerce, dy-patil review;
  - 3 × "NIRF 2025 University 62": career-after-12th-arts, best-computer ×2.
- "2025" was added to 6 MAHE cells: "NIRF 2025 University category rank 3." in the 6 profession posts.
- I checked each insertion in the word diff; each inserts only "2025". None of these posts is in FREEZE_SLUGS.
- The 2 VIT "NIRF University 14" cells keep no year. This is acceptable:
  - the category is named, which check-nirf-category requires;
  - lib/data.ts has no nirfYear for VIT;
  - no repo sheet dates the figure.
- Round 1 matched VIT University 14 to nirfindia.org 2025. Add the year once a verify row records it.

**A3: PASS.**
- **SMU wording.** The new wording is "SMU lists ₹1,20,000 in total." getExactFee(sikkim-manipal-university-online, MBA) returns `{kind: exact, min 120000, max 120000}` with no label, and formatExactFee gives "₹1,20,000". So the sentence is consistent with the fee engine, and the fee carries no list or discount label to misquote.
- **No source sheet.** No audits/verify sheet holds SMU's fee. Advisory only.
- **The file does not render.** The edit is inert:
  - getSpecPageContent loads `ignou-online-mba-{specSlug}.json`;
  - the built IGNOU spec routes are finance, marketing, operations, hr-management and services-management;
  - ignou-online-mba-financial-management.json therefore never loads;
  - "SMU lists" appears on 0 built pages.

**A4: PASS.**
- "(under Rs 1 lakh)" is removed from is-distance-mba-worth-it, and no IGNOU "under Rs 1 lakh" or "under ₹1 lakh" remains in lib/blog.ts.
- All 5 mixed ranges are split:
  - mba-fees guide: "IGNOU Rs 16,000 per semester; others up to Rs 1.61L";
  - fintech, hospitality, logistics and real-estate: "IGNOU ₹16,000 per semester; Amity up to ₹2,25,000 total".
- No "per semester (IGNOU) (up) to" form is left in lib, page-content or pairs.

**A6: PASS. The table never renders, as the engineer says.**
- ignou-online-mba.json comparisons now gives NMIMS NAAC A++ and NIRF Management #24, consistent with lib/data.ts nirfMgt 24.
- The hub renders through UniProgramBody, which reads only tldr, faqs, redFlags, abcId and ugcDeb from page-content. `sections.comparisons` is read only by UniSpecBody, for spec pages, and the hub JSON is not a spec file.
- The built hub, the 5 spec pages and the profile contain none of the table's text: 0 hits for "Rs.1,56,400 after 15% discount", "Management #24" and "Management #15".

## Rebase check: PASS

- `git range-diff 7efc2cc..0ab2db3 21d475a..4d7bec8` differs only in four places:
  - the commit-message gates line (salary 1913 → 1902);
  - the FIX-LOG intro ("then onto batch 22 round 3 (21d475a)");
  - the FIX-LOG salary sentence and gates line (1902);
  - data/blog-salary-baseline.json (total 1902, mba-scope 22 → 21 against the new base).
- The rest is context only: the neighbouring batch 22 round 3 entry, and the online-mba-salary H2 that round 3 renamed.
- Code and content hunks are identical. The same 36 files change, and the insertions differ by 1 line (442 vs 443: one blank FIX-LOG line).
- **Cosmetic.** The batch 23 FIX-LOG entry's last line now runs straight into "## 2026-11-27 B3 batch 22 round 3" with no blank line between. It still parses as a heading.

## Regression and gates: PASS

**Pages and title/meta**
- The page list is the same 2335 pages at 21d475a and 24663a8.
- The normalised diff shows 127 changed pages: 98 visible, 68 with JSON-LD changes.
- Only 3 descriptions changed: /compare/amity-vs-chandigarh, chandigarh-vs-lpu and manipal-jaipur-vs-chandigarh (description and og:description). Each inserts "up to" before "25% Early Bird", which round 1 accepted and sourced to batch20 row 3c.
- Every other head change is `article:modified_time` (54).
- No title changed.

**JSON-LD and tags**
- JSON-LD parses on all 2335 pages, with 0 undefined and 0 NaN.
- No page's tag balance changed.

**Line endings**
- No CR at either end of any of the 36 changed files. Line endings are preserved.
- Round 1's "uniformly CRLF" reflects a working-copy view; the committed blobs are LF.

**Staged pre-commit**
- Staged 21d475a..24663a8 (36 files): "all checks passed", exit 0.

| Gate | Result |
|---|---|
| fee | 205 |
| blog-fees | 1889 |
| em-dash | 227 |
| salary | 1902 |
| salary ext | 65 |
| check-blog-updated-at | 45 posts, all dated |
| protected-pages | 8/8 |
| check-nirf-category | OK |
| check-hub-fee-text | 0 |
| string-truncation | no new |

**Added numbers in round 2**
- Every number added in round 2 is one of:
  - "2025", in the NIRF year insertions;
  - NMIMS "#24", sourced to FIX-LOG 2026-10-27 NIRF 2025;
  - "66,000" in the dead pairs.ts revert.
- No em dashes and no banned words.

## Advisories (not blocking)

- **Hub FAQ question.** The IGNOU hub FAQ question still reads "What is the total fee for IGNOU MBA?". The answer no longer gives a total, while the hero shows "Total Fees ₹66,000". It is consistent, but evasive; Q70 settles it.
- **Remaining "No total published" cells.** The other three, in distance-mba-kolkata, is-distance-mba-worth-it and logistics, are on pages without ₹66,000 today. They become contradictions if any of those metas or related cards gains the figure.
- **Line references.** Line numbers in the FIX-LOG A6 note ("page.tsx lines 117-120") will drift. Cite the function instead.

## Cleanup

- Worktrees removed after their junctions.
- Main node_modules: 417 entries.
- Ports 3941 and 3942 free.
- No site edits, commits or pushes.
