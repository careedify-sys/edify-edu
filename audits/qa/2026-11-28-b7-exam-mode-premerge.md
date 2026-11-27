# QA pre-merge: B7 exam mode (fix/b7-exam-mode)

**Date:** 2026-11-28 · **Checker:** qa-checker (outsider, did not do the work)
**Branch:** fix/b7-exam-mode, commits e18db28 and 31b5517, on base f0c1fda
**Acceptance (OPERATING-PLAN B7):** each has a source or the counsellor line

## Verdict: FAIL (one wording defect, one-line fix; everything else passes)

The core change is correct. No exam mode is invented. I swept all 195 URLs for the 7 universities and found zero "from home", webcam, "proctored exams" or "no campus visit" claims. The gates pass at fee 205 and em-dash 227, and titles, meta and robots are unchanged. The fail is one new sentence in the shared spec-hub FAQ, which states something we do not know (F1).

## Method

- Separate worktrees in the scratchpad for the branch (31b5517) and the base (f0c1fda). node_modules was junctioned and removed with `cmd //c rmdir`, then both worktrees were removed. The engineer's worktree was not touched.
- Full husky pre-commit run in the branch worktree. check-gsc-404s needs the gitignored audit-data/, so I copied it in and resumed the hook from that step.
- `next build` on both trees, then `next start` on ports 4917 (branch) and 4918 (base). I fetched 36 sample URLs plus all 95 `/programs/mba/{spec}` hubs on both, parsed every JSON-LD block, and ran a sentence-level diff of visible text plus JSON-LD. I also swept all 195 valid-urls entries for the 7 universities on the branch. Both servers were stopped afterwards.

## Numbered findings

**F1 (FAIL, blocker). "Exam format differs by university" is said without support, including on 12 single-university hubs.**
`examSentenceForUniversities` (lib/exam-mode.ts) adds "Exam format differs by university." whenever any listed university is unconfirmed.
- On 12 hubs that list exactly one university, the sentence reads as false on its face. They appear in both the visible FAQ and the FAQPage schema. The hubs: biotechnology-management, business-management, direct-selling-management, food-technology-management, global-accounting, investment-management, operation-and-supply-chain-management, pharma-and-healthcare-management, real-estate-management, services-management, strategic-human-resource-management, tourism-management.
- On the other hubs where it appears (51 in total across the variants), nothing on record shows the formats differ. All the universities may well hold exams the same way.
- Fix: replace the prefix with a neutral sentence such as "Each university sets its own exam format." or drop it. One string in lib/exam-mode.ts, then re-render.

**F2 (PASS). Counsellor line on the 6 unverified universities and Shoolini.**
- `UNVERIFIED_EXAM_MODE` = dy-patil-university-online, graphic-era-university-online, nmims-online, sharda-university-online, mody-university-online, sathyabama-university-online, shoolini-university-online.
- Rendered on the branch, with the base showing the old claim each time:
  - SectionExams "Exam Mode" and SectionClasses "Assessments" on the hubs and programme pages.
  - The SectionAbout clause "with no mandatory campus visits" is dropped.
  - The UniProgramBody FAQ and FAQ schema say "Talk to our counsellor for how and where exams are held."
  - The UniSpecBody FAQs carry the same line (checked on the Sathyabama business-analytics spec page).
  - The profile FAQ and schema read "Assessments include internal assignments and end-semester exams. Talk to our counsellor...", replacing "via webcam from home or office".
  - Both profile stat cells read "Ask our counsellor" (base: "Online").
  - The compare table row reads "Not confirmed; ask our counsellor", and the compare FAQ and schema were checked on 4 NMIMS pairs.
  - university-answers Q7 reads "...has not published how and where its online MBA exams are held."
- Sweep result: 0 of 195 URLs carry a residual mode claim, and 165 carry the counsellor line.

**F3 (non-blocking, claim overstated). 30 URLs have neither a mode nor the counsellor line.**
- NMIMS profile and MBA hub: the first-hand block (lib/data/first-hand/nmims-online.ts) replaces the template exam FAQ. It describes the 75% rule and slot booking and states no mode. The NMIMS profile stat cell does say "Ask our counsellor". This rendering is unchanged from base.
- 6 NMIMS, 6 Sharda and 16 Shoolini spec pages: their content JSON carries no exam section.
- None of these 30 states a mode, so the acceptance test holds per university. But the engineer's "every rendered surface" claim is not literally true.

**F4 (PASS). Page-content JSON.**
- The DY Patil, NMIMS, Sharda and Shoolini MBA JSON no longer claims online, proctored, webcam or ID-for-proctoring. Graphic Era, Mody and Sathyabama JSON had no exam claim.
- A full regex sweep of every page-content file for the 7 universities found only an NMIMS admission sentence ("No campus visit is required for admission"), which is not about exams.
- Shoolini's exams body ("describes both AI-proctored online exams and exams invigilated on campus, and does not say which applies to online MBA students") matches the methodology PDF in the 16 Nov CSV and the Shoolini sheet row M6 ("AI-based proctoring software for conducting exams online/physically invigilated within the territory of the campus"). It invents nothing.
- The exams bodies are latent (not rendered), per the verify sheets. The rendered DY Patil FAQ edit is visible in the schema.

**F5 (PASS, with advisory). DSU moved to confirmed 'Online'.**
- audits/verify/dayananda-sagar-university-online-2026-11-18.md row M6 is MATCH: "Online Examination" on dsuonline.com/online-mba/, plus a disclosure titled "Details of Remote Proctored Online Examination" (the PDF was not opened). That supports 'Online'.
- The engineer's FIX-LOG line "Its wording is unchanged" is wrong. Confirming DSU adds two new rendered facts, both backed by M6:
  - Quick Facts "Exams: Online" on the DSU hub.
  - "Mode: Online classes; Online exams" on the profile.
- Advisory 1: DSU still prints "Online proctored examinations from home" and "online proctored exams via webcam from home or office", which pre-date this branch. M6 does not support "from home" or "webcam", and the audit's own tier table puts a "location not stated" university on "End-semester exams are online and proctored." This belongs with deferred item (4).
- Advisory 2: B2 on origin/main (audits/verify/b2-official-urls-2026-11-28.md, Q80) holds dsuonline.com UNVERIFIED as DSU's official site. If Q80 comes back "no", the M6 confirmation falls with it.

**F6 (PASS). VIT stays Exam Centre.** lib/data.ts:4856 'Exam Centre'. The VIT profile FAQ, spec FAQ and spec hubs print the exam-centre line. Nothing changed for VIT.

**F7 (PASS). The 22 confirmed rows are untouched, and examMode in lib/data.ts is unchanged.**
- `git diff f0c1fda fix/b7-exam-mode -- lib/data.ts lib/data-slim.ts` is empty, and lib/data.ts still has 142 'Online' and 2 'Exam Centre'.
- `CONFIRMED_EXAM_MODE` diff: the only change is the added DSU line. The set now holds 25 entries (22 audit Online + DSU + VIT + BITS), with no overlap with UNVERIFIED.

**F8 (PASS). The /programs/mba/{spec} FAQ is built through examSentenceForUniversities.**
- "AI-proctored from home" appears on 0 of 95 hubs (base: 95 of 95).
- The visible answer matches the FAQPage JSON-LD on 95 of 95, and every hub returns 200.
- `CONFIRMED_FROM_HOME` holds 11 ids, all confirmed 'Online'. They match the audit's "From home or anywhere (11)" list exactly: Amity, Amrita, Bharati Vidyapeeth, DPU Pune, LPU, Mangalayatan, MAHE, MUJ, SMU, Parul, Uttaranchal. The audit is also on this branch and on origin/main.
- Unit check: [] gives the neutral line, an all-from-home list gives "from home", a mixed confirmed-Online list gives "online at every university listed", and VIT plus BITS are named as exam centres.

**F9 (PASS). Titles, seoTitle, meta and robots are unchanged.** I compared title, meta description and robots on 36 sample URLs and 95 spec hubs between the base and branch builds: 0 differences. The JSON-LD block count per page is identical.

**F10 (PASS). No em dashes added, no invented modes, no visible official links.**
- The added diff lines contain 0 em dashes. The single em dash on /programs/mba/* is the pre-existing specFaqs Q1 and also appears on base.
- The only URL in the diff is a code comment in lib/exam-mode.ts.

**F11 (PASS). Gates.**
- The full husky pre-commit passes: "all checks passed", with check-gsc-404s run against the copied audit-data.
- check-fee-baseline: 205 suppressed, unchanged. check-em-dash-baseline: 227, unchanged. check-blog-fees: 1945, unchanged.
- The diff touches no baseline or allowlist file. The worktree was clean after the hook.

**F12 (PASS). Build and build diff.**
- `next build` exits 0 on both trees.
- JSON-LD parses on every probed page: 0 parse failures across 36 + 95 pages, and 0 "undefined" or "NaN" in text or JSON-LD.
- The sentence diff shows only exam-mode sentences changing, plus the DSU Quick Facts and profile additions (F5).

**F13 (PASS, log-only conflict). Merge cleanliness against origin/main 4ae8365 (fetched).**
- `git merge-tree` reports one conflict, in audits/FIX-LOG.md only. Both sides prepend entries at the top, so the fix is to keep both.
- No code file conflicts. origin/main's 4 commits since base touch lib/supabase/service.ts and audits only. Not merged.

**F14 (PASS). Deferred items are logged in FIX-LOG** (31b5517 entry, "Deferred, logged for later"):
- (1) the 30-40% / 60-70% weighting text in the DY Patil, Sharda and Shoolini exams bodies;
- (3) the NMIMS tagline "slot-based online exams" (I confirmed it is not rendered: `.tagline` is read only under app/admin);
- (4) about 111 default records still saying "from home".

**F15 (advisory, out of scope).**
- components/MBAHubClient.tsx:56 says "AI-proctored online exams" in the generic /programs/mba description, which is false for VIT and BITS. Suggest adding it to deferred item (4).
- Q29's "what stays as-is until answered" column says the Shoolini hub wording stays unchanged. This branch replaces it with the counsellor line, which is more conservative and matches the brief. Update the Q29 row when merging.

## To pass on rerun

Fix F1 (one string in lib/exam-mode.ts) and correct the FIX-LOG DSU sentence (F5). Rerun check-page-content-json and the 95-hub visible-vs-schema check.
