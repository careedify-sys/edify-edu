# QA pre-merge: B7b default exam mode (fix/b7b-default-exam-mode)

**Date:** 2026-11-28 · **Checker:** qa-checker (outsider, did not do the work)
**Target:** cd6c11a, stacked on b677143 (B7, passed). Merge target for the conflict check: 63d5a6b (local main 5b67ad9 + B7).

## Verdict: PASS, with one required merge resolution (F8)

The tier rule is right for all 143 records. Outside the 11 from-home universities and the 7 hubs that list only them, the built site carries no "from home", no "No exam centre visit required" and no "via webcam". All gates and the build diff are clean.

Merging into 63d5a6b gives two conflicts that are not audit-only, and one of them is a content JSON. It has to be resolved by hand. Taking the B7b side would bring back "EdifyEdu", and main has no brand gate to catch that.

## Method

- Scratchpad worktrees at cd6c11a and b677143 (the build-diff base). I used b677143 rather than 63d5a6b so the 406-file brand rename would not swamp the diff.
- node_modules was junctioned in, the junctions were removed with `cmd //c rmdir`, then the worktrees were removed. The main node_modules is intact (417). The engineer's worktree was not touched.
- Ran the full husky pre-commit on cd6c11a, with audit-data/ copied in for check-gsc-404s.
- Ran `next build` on both trees.
- Ran `next start` on 4937 (B7b) and 4938 (base) after confirming both ports were free and nothing answered. Both servers were stopped afterwards.
- Fetched all 2,150 valid-urls on each build. For each phrase I counted hits separately in visible text, JSON-LD and the RSC payload.

## Numbered findings

**F1. Tier membership: PASS, 0 universities in the wrong tier.**
- I rebuilt the tiers by hand from the group lists in audits/exam-mode-verified-2026-11-16.md, plus DSU from audits/verify/dayananda-sagar-university-online-2026-11-18.md row M6. I compared that against `examTier()` over all 143 records in lib/data.ts.
- Result: centre 2 (VIT, BITS), fromHome 11, online **12**, unverified 7, unrecorded 111. 0 mismatches.
- The brief's "online: 14" is a counting slip. The FIX-LOG names the right 12: CHRIST, CU, Galgotias, GLA, JAIN, KL, Manav Rachna, UPES, VGU, Symbiosis, Kurukshetra, DSU. The 2 + 11 + 12 + 7 + 111 = 143 total confirms 12.

**F2. Where the claims now appear: PASS.** All 2,150 URLs return 200. Counts are per layer (visible / JSON-LD / RSC):

| Phrase | B7b build | Base build (b677143) |
|---|---|---|
| "from home" | 268 pages of the 11 + 7 hubs, on all three layers; 0 elsewhere | 1,180 pages (visible) |
| "No exam centre visit required" | 268 pages of the 11; 0 elsewhere | (not split) |
| "via webcam" | 11 pages of the 11 (JSON-LD); 0 elsewhere | 134 pages (JSON-LD) |

- The 7 hubs are agribusiness, analytics-and-data-science, digital-entrepreneurship, environmental-social-and-governance-esg, global-finance-market, hospitality-management and international-finance-and-accounting.
- No blog, compare or other university page carries any of the three.
- Spot checks per tier:
  - NIU (unrecorded): "Check the exam format with our counsellor before you enrol." in Exam Mode, Assessments and the profile FAQ and schema; "Ask our counsellor" in both stat cells; the SectionAbout clause is dropped.
  - UPES (online): "Exams are online." with no from-home, webcam or campus-visit claim; the stat cell shows "Online".
  - LPU (fromHome): keeps the from-home line.
  - VIT (centre): exam-centre lines.
  - Sharda (unverified): the counsellor line.

**F3. JSON edits: PASS.**
- I read all of them, not a sample: 65 changed string keys in 28 files. The count of 65 comes from the Jaypee red-flag renumber (one flag removed, so the later 3 flags each moved one index), which reconciles with the claimed 60.
- Every change is a deletion, or a deletion plus "Check the exam format with our counsellor before you enrol.", or "proctored" dropped from a weighting sentence. No replacement claim is invented.
- For confirmed universities, what remains is true to source:
  - CU, Galgotias, JAIN and UPES keep "proctored" (their sources say proctored).
  - Kurukshetra and Symbiosis now say only "online", matching sources that do not state proctoring.
  - DSU keeps its sourced 30:70 split and "All exams are online.".
- The sentences read well. The Jaypee flags array is now 3 clean items with no empty card.
- The kept 30-40 / 60-70 splits: no source or sourcing wording was added, so they read no more sourced than before. They remain unsourced typed figures, now sitting right after a counsellor line on about 12 unrecorded pages, for example Alliance, ARKA JAIN, Assam Don Bosco, Chitkara, SASTRA, Jaypee, MGR and Kurukshetra. This stays deferred item (1). It is not new in B7b.
- Pre-existing and not B7b's: IGNOU classes body "IGNOUs 67+ regional centres" (missing apostrophe, same on base).

**F4. The "has not confirmed" sentence: PASS.** "edifyedu.in has not confirmed how and where {X} holds its online MBA exams." is grammatical. In context: "...SRM Institute of Science and Technology holds its online MBA exams. Talk to our counsellor for how and where exams are held at both."
- It renders on 75 pages: 70 `/universities/{id}/mba` hubs and 5 MBA compare pairs.
- It renders on no non-MBA page. Hub answers are gated by `program === 'MBA'` (UniProgramBody.tsx:261), and none of the 10 BBA/BCA/MCA compare pairs carries it.
- Pre-existing wording nit, not blocking: "records VIT exams as Exam Centre".

**F5. Removed IGNOU and Jaypee claims had no source: PASS.**
- audits/verify/ has no row for IGNOU "800+ exam centres" or "Online TEE". The only "800+" hit is UPES "800+ Recruiters". IGNOU is not among the 31 in the exam-mode CSV.
- There is no "Voter ID", "driving licence" or "Aadhaar" anywhere in audits/verify/.
- audits/verify/jaypee-university-online-2026-11-16.md covers fees only.

**F6. JAIN and UPES webcam removal: PASS.**
- JAIN now reads "Proctored online exams are conducted at semester end." and "Exams are conducted online and proctored." Source: "Exams are conducted online through a proctored environment" (mba.onlinejain.com; verify sheet M6 MATCH).
- UPES now reads "End-semester exams are Online proctored." Source: "All exams are conducted and proctored Online on Code Tantra platform" (upesonline.ac.in/faqs).
- Both are true. Removing the webcam lines is the conservative choice and is accepted.
- UPES's "typical split is 30 percent internal and 70 percent" is pre-existing and unsourced; it falls under deferred item (1).

**F7. Gates and build: PASS.**
- Full pre-commit: "all checks passed".
- Fee 205, em-dash 227, blog-fees 1861, all unchanged.
- No baseline or allowlist file is in the diff, and the worktree was clean after the hook.
- `next build` exits 0 on both trees.
- Build diff over all 2,150 URLs: 0 changes to status, title, meta description, robots or JSON-LD block count. 0 JSON-LD parse failures and 0 undefined or NaN.
- "AI-proctored" appears on 0 pages.

**F8. Merge into 63d5a6b: 2 conflicts, not audit-only. Required resolution, not a code defect.**
`git merge-tree --write-tree 63d5a6b cd6c11a` reports these conflicts; everything else, including the other 27 JSONs and all components, auto-merges:
1. `lib/data/page-content/arka-jain-university-online-mba.json`, `sections.about.body`.
   - Main's brand rename changed "EdifyEdu verifies" to "edifyedu.in verifies". B7b deleted ", with no mandatory campus visits for online students" in the same string.
   - Resolve by keeping main's "edifyedu.in verifies" and B7b's shortened ending: "...The programme is only 2 years long (4 semesters)."
   - Taking the B7b side would bring back "EdifyEdu". In the merged tree this is the only file whose Edify or EdifyEdu count rises (0 to 1).
2. `data/sitemap-lastmod.json`: 13 conflict hunks.
   - Resolve by taking the later date per key, then let the hook's check-sitemap-lastmod confirm it, or rebuild with `npx tsx scripts/build-sitemap-lastmod.mjs`.
- Brand: no B7b-authored string uses "Edify" or "EdifyEdu". The one "EdifyEdu" in the added lines is pre-rename text carried through in that conflicting ARKA JAIN line.
- Main (63d5a6b) has **no brand gate**: nothing in .husky/pre-commit or scripts/ checks for "EdifyEdu". A bad resolution of conflict 1 would pass every hook, so check it by eye or with `grep -c EdifyEdu` on that file after the merge.

## Advisory (not blocking)

- The weighting splits are now the main unsourced exam figure left on the unrecorded tier (F3). Deferred item (1) should be scheduled.
- After the merge, rerun check-page-content-json and the 2,150-URL phrase sweep on the merged tree before pushing.
