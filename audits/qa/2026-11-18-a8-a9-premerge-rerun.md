# QA pre-merge rerun: A8 + A9 (fix/a8-a9-trust @ 35ffee3, on 457d044, base f2f80c5)

Checked 2026-11-18 by qa-checker. This reruns `2026-11-18-a8-a9-premerge.md` after 35ffee3. That commit fixes F1 (the hub syllabus) and the exam-row advisory.

## Verdict: PASS

| # | Check | Result |
|---|---|---|
| 1 | F1 acceptance: BITS hub has no syllabus section; no hub renders "Organizational", "â€", or a subject ending " of"/" and" in any semester (HTML and RSC payload) | PASS |
| 2 | Each of the 24 `CONFIRMED_EXAM_MODE` ids is marked confirmed in `audits/exam-mode-verified-2026-11-16.csv` | PASS (22 from the CSV, plus VIT and BITS) |
| 3 | `syllabus-manifest.json` diff changes only mojibake characters | PASS |
| 4 | A9 strings and BITS DEB claims still 0 | PASS |
| 5 | Gates pass, no baseline raised | PASS |
| 6 | Titles unchanged | PASS (19 of 19) |
| - | Fresh `npm run build` | PASS (exit 0) |

## Build

- Before building, I confirmed no build or dev server was running in the worktree. The earlier :3123 server had already been stopped.
- `npm run build` (prebuild + `next build`) exited 0. The new BUILD_ID is `e7szSl-Qw6yvTRZ9Zv-cz`, written 2026-11-18 15:43:08 +0530.
- Prebuild again rewrote 13 generated JSON files with line-ending changes only (`git diff --ignore-cr-at-eol` was empty). I restored them with `git checkout --`, and the tree is clean.
- For the render spot check I ran `npx next start -p 3123` in the worktree. Afterwards I stopped only PID 13976, whose command line was verified as the worktree's `next start -p 3123`.

## 1. F1 (PASS)

**The code.** `components/UniProgramBody.tsx` now uses `getManifestCoreSyllabus()` from `lib/syllabus.ts`.
- It reads only `syllabus-manifest.json` `_core` for that university and programme.
- It has no first-spec, `MASTER_SYLLABUS` or `UNIVERSITY_SYLLABUS` fallback.
- If any subject fails `looksTruncatedSubject()`, it withholds the whole syllabus.
- When it returns null, the hub renders `RequestSyllabusCard`.

**My own check** (written to a file, no regex built in the shell). It covers every hub, `universities/<id>/<prog>.html` plus its `.rsc`:
- It searches HTML and RSC for `Organizational"`, `Organizational<` and `â€`.
- Where a "Syllabus: Semester-wise" section exists, it parses the `"syllabus":{...}` prop from the RSC payload. That prop carries every semester, including the closed accordions that are absent from the HTML.
- It splits each semester the way `SectionSyllabus` does (on `,`, `;` and `|`) and flags any chip ending " of", " and", " or", " in", " for", " the", " &", ",", "/", "-", "(" or "–", or containing "â€".

**Proof that it catches defects.** I copied the Amity MBA hub, injected "Principles of", "Business Ethics and" and the mojibake "OOPâ€™s" into **semester 2**, and added an `Organizational` span. The check reported all 5 problems, so it does read semesters beyond the first.

**Branch result:**
- 336 hub files; 59 render a syllabus section (down from 124 on 457d044). 0 problems.
- `bits-pilani-work-integrated-online/mba`: no syllabus section, and the request card is present.
- The NMIMS MBA hub renders its syllabus with no mojibake.
- MUJ's "Organizational" hit is "Organizational Behaviour", a full subject name.

**Comma split.** All 62 manifest `_core` entries were checked, and 0 subjects contain `,`, `;` or `|`. So the client-side split cannot cut a real subject into pieces.

**The 19 hubs with neither a syllabus section nor a request card** are noindexed stubs with no `<h2>` and no body, for example alliance/mca, nmims/mca and university-of-mumbai/mba. They render no UniProgramBody, so no empty card is involved.

## 2. Exams row: CONFIRMED_EXAM_MODE (PASS)

I parsed `audits/exam-mode-verified-2026-11-16.csv`:
- 22 rows carry `examMode_change` = `none; 'Online' confirmed`. All 22 are in `CONFIRMED_EXAM_MODE` as 'Online', and none is missing.
- The 2 extra entries:
  - `vit-university-online` is 'Exam Centre'. The CSV row reads `'Online' to 'Exam Centre'` and `lib/data.ts` has examMode 'Exam Centre'.
  - `bits-pilani-work-integrated-online` is 'Exam Centre', per the BITS verify sheet "Exam mode (M6)" row (MATCH) and `lib/data.ts`.
- Excluded, as they should be: DSU, DY Patil University, Graphic Era, NMIMS, Sharda, Mody and Sathyabama (all `unverified`) and Shoolini (`ambiguous`).

**Built output:**
- The QuickFacts Exams row appears on 585 of 610 pages for confirmed universities, and on 0 of 1,176 pages for unconfirmed ones.
- The profile banner exam clause appears on 24 of 24 confirmed profiles and 0 unconfirmed. Amity: "Online classes; Online exams". VIT and BITS: "Online classes; exams in person at designated centres". NMIMS: "Online classes".

Note, not blocking: per the CSV, KL, Kurukshetra, Manav Rachna, MAHE, MUJ and SMU were confirmed from search-index snippets, not fetched pages. The CSV still marks them confirmed, so they meet the rule as written.

## 3. Manifest diff (PASS)

`git diff 457d044..35ffee3 -- lib/data/syllabus-manifest.json` has 35 lines changed in place, and the line count is unchanged (20,311). A character-level diff of every changed line shows exactly two kinds of replacement and nothing else:
- `â€“` became `–`: 26 word-level changes, including "Quantitative Methods–I" (NMIMS, 7) and "Minor Project – 1/2" (Bharati Vidyapeeth MCA).
- `â€™` became `’`: "OOP’s" (Mangalayatan MCA, 2).

45 `â€` sequences remain in the manifest. All are in spec-level entries, none in `_core`, so hubs never read them. Spec pages render them exactly as before this branch: Shoolini MBA 16, Amrita MCA 3, Shoolini MCA 3, Dr MGR MBA 2, and one each for Arka Jain, JAIN, Uttaranchal, Manav Rachna and Mysore. This is not caused by this branch; it is listed as follow-up below.

## 4. Detector (PASS)

This is the same substring detector as the first run, already proven on the f2f80c5 build there, run over all 1,786 `universities/**/*.html`.
- **A9:** 0 raw and 0 visible for "20,000 - ", "25% fee waiver", "Alumni referral", "100% Online", "(Regular)", "hours/week", "provides placement assistance through", "Included in total (usually)", "common across all specialisations", "Core Subjects in", "Scholarship Alert" and "Fee Discounts Available".
- **BITS:** 0 for "UGC-DEB entitled", "appears on the UGC-DEB", "QS World", "Goa university", `alt="UGC DEB"`, "Yes: UGC DEB" and "Your UGC-DEB ID". Visible "UGC DEB Approved" and "UGC-DEB approved" are both 0.
- **Residuals are identical to the first run and each is accounted for:**
  - Edify's coupon block "Save up to ₹5,000"
  - CU's sourced early-bird fee plan
  - JAIN and LPU's own "LMS ... within 48 hours" FAQ
  - one Bharati Vidyapeeth comparison line
  - the site footer, author schema and ItemList "UGC DEB approved" on BITS pages
  - BITS's true campus list "Pilani, Goa, Hyderabad, and Dubai"

## 5. Gates and baselines (PASS)

- I ran `sh .husky/pre-commit` in the worktree. It exited 0, ending with `pre-commit: all checks passed`, and the tree was unchanged afterwards.
- 35ffee3 touches no file under `data/`, `scripts/` or `.husky/`.
- Across the whole branch (f2f80c5..35ffee3), the only baseline files changed are `data/city-state-baseline.json` (noCity 43 to 42) and `data/em-dash-baseline.json` (SectionCoreSubjects entry dropped, UniProgramBody 5 to 4). Both went down, as verified in the first run.
- 35ffee3 adds no line with an em dash and no URL.

## 6. Titles (PASS)

35ffee3 touches no `app/` file. I compared the `<title>` of the branch build against the live site (main), fetched with `?cb=qa1118`, for 19 pages:
- all 11 BITS pages (profile, MBA hub and its 9 specialisations)
- the profile and MBA hub of Amity, NMIMS, MUJ and IGNOU

All 19 are identical.

## Rendering spot check (PASS)

| Page | Status | H1 | JSON-LD | Notes |
|---|---|---|---|---|
| BITS profile | 200 | 1 | 8/8 | no "undefined", "NaN" or mojibake |
| BITS MBA hub | 200 | 1 | 9/9 | no syllabus section; request card shown |
| NMIMS MBA hub | 200 | 1 | 11/11 | manifest syllabus, clean |
| Amity MBA hub | 200 | 1 | 11/11 | manifest syllabus |
| MUJ MBA hub | 200 | 1 | 11/11 | "Organizational Behaviour" only |

## Follow-ups (not blocking this merge)

- 45 mojibake sequences remain in spec-level manifest entries (listed in section 3). They render on spec pages today, as they did on main.
- These first-run advisories still stand:
  - BITS profile `forWho` (employment required) disagrees with the hub `whoCanApply` (50%, experience not mandatory). The eligibility fix was deferred.
  - Older BITS hub text reads "NAAC A++ not A++".
