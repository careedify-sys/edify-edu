# QA: B1 provenance fields + B2 ACU officialUrl, pre-merge

- **Date run:** 2026-11-28
- **Branch:** fix/b1-provenance
  - 7b1c3d5 (B2 ACU)
  - fb461de (B1)
  - Cut from 9f15601.
- **Checker:** qa-checker, working as an outsider.
- **Worktrees:** b1base (9f15601) and b1tip (fb461de), both mine. The engineer's worktree was not touched.

## Verdict: FAIL

Two blockers:

- **F1:** a new, unsourced DEB claim renders on 92 non-MBA pages.
- **F2:** the gate's KNOWN_GAPS list can grow, despite the "only shrinks" claim.

Everything else passes.

## Blockers

### F1. The DEB session line renders on programmes the sheets did not check

The new line reads: "UGC-DEB entitled, Online mode, 2026-27 session. Register checked 18 Nov 2026". In the built HTML it appears on 199 pages.

**What the source covers.** Every `deb` provenance entry cites its sheet's row "UGC-DEB entitlement for the online MBA". All 7 sheets record only the MASTER OF BUSINESS ADMINISTRATION Online(OL) 2026-27 row.

**What renders.** `debSessionLine(u)` takes no programme argument. UniHero shows it whenever `modeVerified && !basis`, so it prints on every programme hub and spec page.

**Where it renders:**

| University | BBA | BCA | MCA | Non-MBA total |
|---|---:|---:|---:|---:|
| Amity | 4 | 9 | 7 | 20 |
| DY Patil | 0 | 0 | 7 | 7 |
| Galgotias | 5 | 3 | 2 | 10 |
| JAIN | 6 | 6 | 13 | 25 |
| Shoolini | 6 | 6 | 6 | 18 |
| Symbiosis | 2 | 2 | 0 | 4 |
| Uttaranchal | 4 | 2 | 2 | 8 |
| **Total** | | | | **92** |

On those 92 pages the line states a 2026-27 Online entitlement for that programme. No sheet in audits/verify/ records that check, so this is a new fact without a source row.

The remaining 107 pages are:
- 7 profiles;
- the MBA hubs and MBA spec pages (100). These are covered by the sheets.

**Fix:**
- Gate `debSessionLine` on `program === 'MBA'`, as `feeCheckedLine` already is.
- On the profile, name the programme, for example "Online MBA: UGC-DEB entitled, Online mode, 2026-27 session."
- Alternatively, record per-programme DEB rows in the sheets first.

### F2. KNOWN_GAPS is not a ratchet

The header says "the known-gap list only shrinks" and "no id may be added without a QUESTIONS-FOR-RISHI row". Neither is enforced.

`validate()` checks only two things:
- a gap id is in QUEUE_10;
- a gap does not also carry `fee`.

**Reproduced in my worktree** (scratchpad qab1/loophole.cjs):
1. Removed BITS's dated `fee` provenance.
2. Added `'bits-pilani-work-integrated-online': 'Q999: no such question'` to KNOWN_GAPS.
3. Ran `--self-test`: OK, 8 caught.
4. Ran the gate: "OK (7 fees dated, 3 known gaps ... Q999 ...)", exit 0.

I restored both files afterwards. So a dated fee can be swapped for a gap with an invented question number, and nothing fails.

**Fix:**
- Freeze the permitted gap ids, either as a const that may only lose entries or by comparing against `git show HEAD:scripts/check-fee-provenance.mts`.
- Require the cited Q number to exist as a row in audits/QUESTIONS-FOR-RISHI.md.
- Add a 9th self-test case for "new gap added".

## Checks that pass

1. **Acceptance test (OPERATING-PLAN B1): PASS.**
   - I injected a missing `checkedOn` on the Galgotias fee in my worktree.
   - Gate: "galgotias-university-online.fee: missing checkedOn", exit 1.
   - After restoring: OK, exit 0.
2. **Provenance facts vs sheets: PASS, all 29 checked.** There are 8 universities. Amity has no naac entry, BITS no deb, and Uttaranchal no nirf.
   - **Matches:** for every fact, the value, sourceUrl and checkedOn (2026-11-18) match the cited sheet's MATCH row.
   - **Fees:** every fee value equals the fee the page prints.
   - **NAAC sessions:** every cycle and declaration date matches the sheet:
     - BITS: cycle 4, 29-11-2024
     - Galgotias: cycle 1, 16-08-2022
     - JAIN: cycle 2, 06-12-2021
     - SIU: cycle 3, 20-12-2022
     - DPU: cycle 3, 08-02-2022
     - UU: cycle 1, 11-01-2022
     - Shoolini: cycle 2, 21-11-2024
   - **NIRF:** every NIRF rank matches the sheet and the record. The ranks are BITS U7, Galgotias M 101-125, JAIN U62/M73, SIU U24, DPU U41, Amity U22/M49 and Shoolini U69.
   - **Dates:** no invented checkedOn.
   - **Domains:**
     - deb, naac and nirf sources sit on deb.ugc.ac.in, naac.gov.in and nirfindia.org.
     - Fee sources sit on each record's own officialUrl host. Each host is CONFIRMED in the B2 sheet.
   - **Minor 1:** JAIN's nirf `sourceUrl` is UniversityRanking.html, but the value also carries Management #73. The sheet cites ManagementRanking.html for that half. The URL covers only one of the two ranks. Advisory.
   - **Minor 2:** only the BITS sheet spells out the full NAAC xlsx URL. The others say "NAAC xlsx row N", which is the same file. Advisory.
3. **Gaps: PASS.**
   - DSU (Q80) and ACU (Q81) are on KNOWN_GAPS.
   - Amity has no naac entry, per Q24.
   - BITS has no deb entry; its sheet records zero DEB register rows.
   - Q81 has 6 cells.
4. **Rendered fee date: PASS.**
   - "Fee checked 18 Nov 2026 on the university portal" appears on exactly 16 pages: the profile and MBA hub of the 8 universities.
   - It does not appear on spec pages or non-MBA hubs.
   - It contains no link and no em dash. There are 0 em dashes in the added code.
5. **Two dates on Amity and Symbiosis: advisory, not contradictory.**
   - The profile and hub show both "Fees checked on 13 November 2026" (feeVerifiedOn) and "Fee checked 18 Nov 2026 on the university portal".
   - Both sheets say the 18 Nov read found the figures unchanged, so the two dates refer to the same fee.
   - The wording and date formats differ, which is confusing.
   - Suggestion: set feeVerifiedOn to 2026-11-18 (the sheet supports it), or show only one line.
6. **Gate wiring: PASS.**
   - The self-test reports 8 of 8 caught.
   - The gate is wired into .husky/pre-commit right after check-fee-baseline, with both `--self-test` and the real run.
   - .husky only gains lines, and no other script changed, so no existing gate is weakened. The gap ratchet itself is weak (F2).
7. **B2 sameAs: PASS.** Each university's JSON-LD sameAs holds only its own domain:
   - ACU: `https://acuonline.edu.in` (new; it had none before)
   - BITS: `https://bits-pilani-wilp.ac.in`
   - DY Patil: `https://www.dypatilonline.com`
   - Shoolini: `https://shoolini.online`

   **Advisory, not this branch:** DSU already emits sameAs `https://dsuonline.com` from 9f15601. The B2 sheet rates that domain UNVERIFIED (Q80).
8. **Full husky pre-commit: PASS, exit 0.** I ran it from the branch's .husky, with fb461de staged on 9f15601.
   - fee: 205
   - em-dash: 227
   - blog-fees: 1945, unchanged against this base
   - salary: 1913, equal to its baseline
   - check-fee-provenance: OK
   - check-official-urls: 30 confirmed
   - Result: "all checks passed"
9. **Build: PASS.**
   - Both builds exit 0, with the same 2,335 pages.
   - 1,799 files changed: 1,786 under /universities plus 12 blog pages and blog.html. The /universities changes are mostly chunk ids and the provenance object in the RSC payload, which is not visible. A sample unrelated page (LPU MBA) is byte-identical in size.
   - Visible changes: only the two new lines, on 201 pages.
   - Heads changed: 0. Titles or metas changed: 0.
   - JSON-LD changed on 1 page (ACU sameAs).
   - JSON-LD parse errors: 0. undefined/NaN: 0. Tag balance changes: 0.

## Merge checks (not merged)

- **Into origin/main 0746967.** Not clean, but the conflict is docs only.
  - audits/QUESTIONS-FOR-RISHI.md conflicts: main adds Q80 and the branch adds Q81 on the same line after Q79.
  - Resolution: keep both, Q80 then Q81.
  - audits/FIX-LOG.md and lib/data.ts merge automatically.
- **With fix/b7-exam-mode 31b5517.** Not clean, but the conflict is docs only.
  - audits/FIX-LOG.md conflicts.
  - components/UniversityPageClient.tsx merges automatically. B7 changes the exam-mode import, the FAQ answer and the "Exam Mode" rows. B1 adds a provenance import and two lines near the fee and the approvals. The edits are in different places with no semantic overlap.
