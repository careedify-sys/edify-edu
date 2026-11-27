# QA pre-merge rerun: B7 exam mode, round 2 (fix/b7-exam-mode)

**Date:** 2026-11-28 · **Checker:** qa-checker (outsider)
**Branch tip:** b677143 (round 2), on merge 2eed551, which brings in origin/main 0a8999e
**Previous report:** audits/qa/2026-11-28-b7-exam-mode-premerge.md (FAIL on F1)

## Verdict: PASS

## Method

- Two scratchpad worktrees, one at b677143 and one at origin/main 0a8999e. node_modules was junctioned in and the junctions were removed with `cmd //c rmdir` before the worktrees were removed. The main node_modules is intact (417 entries before and after).
- Ran the full husky pre-commit on b677143. origin/main is an ancestor of the tip, so this is the merged state. audit-data/ was copied in for check-gsc-404s.
- Ran `next build` on both trees.
- Started `next start` on 4927 (branch) and 4928 (main) after confirming both ports were free and nothing answered on 4927. Both servers were stopped afterwards.
- Fetched all 95 `/programs/mba/{spec}` hubs. For each hub I took the `uniIds` prop passed to MBASpecHubClient from the RSC payload, so every sentence could be checked against the universities actually listed. I also fetched the 36 sample URLs from round 1.

## Numbered findings

1. **F1 fix: PASS.**
   - "Exam format differs" appears on 0 of 95 hubs.
   - "Each university sets its own exam format." appears on 36 hubs, every one listing 2 or more universities. There are 0 occurrences where fewer than 2 are listed.
   - All 39 single-university hubs carry a sentence true for that university:
     - "Exams are online." on 16 hubs (Symbiosis, JAIN, Chandigarh, UPES, GLA; all confirmed 'Online').
     - The "from home" line where the university is in the from-home 11 (MUJ, Amity, Amrita).
     - The BITS exam-centre line on 3 hubs.
     - The counsellor line for Shoolini, NMIMS and Sharda.
     - The neutral line for universities with no record (Mizoram, Chitkara, Integral, JSS, Manonmaniam Sundaranar, IGNOU).

2. **Sentence variants checked against an independent set: PASS, 0 mismatches.**
   - I rebuilt the sets by hand from the group lists in audits/exam-mode-verified-2026-11-16.md: the from-home 11, plus 9 online-proctored and 2 online-only, plus DSU from sheet row M6. Exam centres are VIT and BITS.
   - "Exams are online." (16 hubs): 1 university each, all confirmed 'Online'.
   - "Exams are online at every university listed here." (3 hubs): 2 to 4 universities each, all confirmed 'Online'.
   - "...can be taken from home." (7 hubs): every listed university is in the audit's "From home or anywhere (11)".
   - The mixed variants name exam-centre universities only when VIT or BITS is listed. They add the counsellor line only when an unverified university is listed, and the neutral line only when the unconfirmed universities have no record.

3. **Visible FAQ matches the schema: PASS on 95 of 95.** All 95 return 200, all JSON-LD parses, and there is no undefined or NaN.

4. **FIX-LOG DSU correction: PASS.** The round-1 sentence "Its wording is unchanged" is gone. The entry now names the two facts backed by row M6: Quick Facts "Exams: Online" on the DSU hub, and "Online classes; Online exams" on the DSU profile. It also records the dependency on Q80 and the rule that DSU comes out of the confirmed list if Q80 comes back "no". The older "from home" and webcam lines are assigned to deferred item (4).

5. **MBAHubClient.tsx:56: PASS.**
   - New wording: "...recorded lectures and interactive discussion forums; exam format varies by university, so ask our counsellor."
   - It states no mode, and it is true on /programs/mba, which lists VIT and BITS (exam centres) beside online universities.
   - "AI-proctored" appears 0 times on /programs/mba. This page has no FAQPage schema, before or after.
   - "AI-proctored" appears 0 times on all 95 spec hubs. origin/main has 285 occurrences there (3 per hub).

6. **Q29 row: PASS.** It has 6 cells, the same as Q28. The "what stays" cell now describes the Shoolini counsellor line and the exams body.

7. **lib/specFaqs.ts merge resolution: PASS.**
   - main's IGNOU "Rs 16,000 per semester" line is kept. It renders 3 times on /programs/mba/finance: visible text, JSON-LD and the RSC payload.
   - B7's `${examSentenceForUniversities(unis)}` is kept.
   - The diff of specFaqs.ts against origin/main is only the B7 import, the comment, the new parameter and the exam sentence.

8. **Gates: PASS.**
   - The full pre-commit passes: "all checks passed".
   - check-fee-baseline: 205, unchanged. check-em-dash-baseline: 227, unchanged. check-blog-fees: 1861, unchanged. check-blog-salaries: 1549 and 47, both at baseline.
   - The worktree was clean after the hook.
   - The diff against origin/main touches no baseline or allowlist file. It covers 21 files: the round-1 set plus MBAHubClient.tsx, FIX-LOG and QUESTIONS.

9. **Build: PASS.**
   - `next build` exits 0 on both trees.
   - Branch against main: 0 differences in title, meta description, robots or JSON-LD block count, across 95 hubs and 36 sample URLs.
   - 0 JSON-LD parse failures and 0 undefined or NaN.
   - 0 residual "from home", webcam or "no campus visit" claims on the sample pages for the 7 universities.

10. **Merge check: PASS, no conflicts.** origin/main 0a8999e is an ancestor of b677143, so the merge is a fast-forward. `git merge-tree --write-tree origin/main fix/b7-exam-mode` exits 0. Not merged.

## Carried forward (advisory, not blocking)

- DSU still prints "from home" and webcam wording that row M6 does not support. This is now logged as deferred item (4).
- 30 URLs (NMIMS first-hand pages, and the Sharda and Shoolini spec pages built from content JSON) state no mode and carry no counsellor line. That was acceptable in round 1 and is unchanged.
