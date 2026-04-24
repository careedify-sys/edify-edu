# Phase 5 Content Generation — Rules Memo

Reference this document in all Phase 5 batch prompts before generating content.

---

## CRITICAL: "Online Online" Duplication Rule

**Problem discovered in Batch 2 (Phase 4.7):** Several university names in `lib/data.ts` already end with the word "Online" (e.g., `"Amity University Online"`, `"NMIMS Online"`, `"Noida International University Online"`, `"UPES Online"`). When generating TL;DR or hero body text, the agent appended `" Online MBA"` → producing `"Amity University Online Online MBA"`.

**Rule:**

When writing TL;DR, hero body, intro, or any sentence containing a degree reference:

1. Check `uni.name` from `lib/data.ts` first.
2. If `uni.name` ENDS WITH `"Online"`:
   - Write: `"{uni.name} {degree}"` → e.g., `"Amity University Online MBA"`
   - NOT: `"{uni.name} Online {degree}"` → WRONG: `"Amity University Online Online MBA"`
3. If `uni.name` does NOT end with `"Online"` (e.g., `"Chandigarh University"`, `"Symbiosis International University"`):
   - Use: `"{uni.name} Online {degree}"` → e.g., `"Chandigarh University Online MBA"`
4. When in doubt: use `getShortUniversityName(uni.name)` which strips trailing `"Online"` to produce a clean base, then append `" Online {degree}"`.

**Known clean names (do NOT add Online before degree):**
- Amity University Online
- NMIMS Online (Narsee Monjee Institute of Management Studies Online)
- UPES Online (University of Petroleum & Energy Studies Online)
- Noida International University Online
- IGNOU Online
- LPU Online (Lovely Professional University Online)
- JAIN University Online
- Any uni whose `lib/data.ts` name field ends with "Online"

**Known names that need "Online" added:**
- Chandigarh University → "Chandigarh University Online MBA"
- Symbiosis School for Online and Digital Learning (SSODL) → check name in data.ts
- Dr. D.Y. Patil Vidyapeeth, Pune (DPU-COL) → check — name ends in "Online Learning (DPU-COL)"

**Automated fix script:** `scripts/fix-online-online.js` — run after any batch to catch regressions.

---

## §8 Syllabus Rule (Tightened — Batch 2+)

- List EVERY subject from `lib/data/syllabus-manifest.json` verbatim
- One subject per line with a UNIQUE 10-15 word description
- No summary bullets, no catch-alls, no "examples:" meta-entries
- For `_core` structure: Sem 1-2 in full; Sem 3-4 list shared subjects then link to spec pages

---

## EdifyEdu Brand Discipline

- Max 5 body mentions per 3000-word page
- Allowed: §2 About (commission disclaimer), §9 fees reconfirm, §16 Beyond Admission, §20 Verdict closer (optional), one FAQ (optional)
- Batch 2 and 3 achieved 3 per page consistently — maintain this

---

## Sheet-Slug-Map Aliases (current)

| Sheet name | Canonical uni slug |
|---|---|
| lpu-online_MBA | lovely-professional-university-online |
| chandigarh-online_MBA | chandigarh-university-online |
| smu-online_MBA | sikkim-manipal-university-online |
| dy-patil-online_MBA | dr-dy-patil-vidyapeeth-online |
| niu-online_MBA | noida-international-university-online |
| mahe-online_MBA | manipal-academy-higher-education-online |
| amrita-online_MBA | amrita-vishwa-vidyapeetham-online |

Add new aliases here after adding them to `scripts/sheet-slug-map.json`.

---

## Output Format

Use NAMED-KEY format (Batch 2+ standard). Columns: A=key, B=heading, C=content, D=word_count.
Keys: `tldr`, `intro`, `about_h2/about_body`, `ugc_deb_h2/ugc_deb_body`, `abc_h2/abc_body`, `syllabus_h2/syllabus_body`, `reviews_h2/reviews_body`, `red_flags_h2/red_flags_body`, `faqs_h2`, `faq_1`/`faq_1_a`…`faq_10`/`faq_10_a`.

---

## NIRF DATA INTEGRITY RULE (Phase 4.8 — added 2026-04-21)

### Source Priority for Online MBA Pages

When setting `nirf`, `nirfMgt`, `rankingBadge`, and `approvals` in `lib/data.ts` and JSON content:

1. **Management 2025** (nirfindia.org → Management category) — use first; most relevant for MBA credentials
2. **University 2025** (nirfindia.org → University category) — fallback when Management rank unavailable
3. **Overall 2025** — last resort only
4. **nirf: 999** — when not listed in any NIRF 2025 category or only in a band (101+) with no individual rank

### Badge Format

- `rankingBadge: 'NIRF #X (Management 2025)'` — when Management rank is available
- `rankingBadge: 'NIRF #X (University 2025)'` — when only University rank is available
- `rankingBadge: 'NIRF band 101-125 (Management 2025 band — no individual rank)'` — for band-only entries
- No badge or NAAC-only badge — when not in NIRF 2025 at all

### data.ts Fields

- `nirf` — University category rank (or 999 if not listed)
- `nirfMgt` — Management category rank (add this field when available, even if nirf is already set)
- `rankingBadge` — displayed credential; always use the Management rank if available (more relevant to MBA)
- `approvals` array — update NIRF entry to match the badge (Management first if available)

### Anti-Patterns (Never Do These)

- Do NOT copy a previous uni's rankingBadge when adding a new slug — always fetch fresh from nirfindia.org
- Do NOT use year-2024 data if 2025 data is published (NIRF publishes annually, usually August)
- Do NOT set nirf: 0 — use nirf: 999 for unranked
- Do NOT show a specific rank (e.g., #101) if the university is only in a band (101-125); show the band range
- Do NOT show NIRF rank in content if the uni dropped out of all 2025 lists — pivot to NAAC/WES credentials

### Constituent Institution Rule

When a ranked constituent institution (e.g., TAPMI inside MAHE, SIBM inside Symbiosis) is ranked separately from the parent university, use the **parent university's** NIRF rank for the online MBA page. Online MBA is offered by the parent, not the constituent. Note the distinction in the about_body if relevant.

### Scripts

- `scripts/nirf-2025-patch.py` — patches `lib/data.ts` for all 34 uni slugs (run once per NIRF cycle)
- `scripts/nirf-json-patch.py` — patches NIRF mentions in all 34 `lib/data/page-content/*-mba.json` files

NOT the numbered-key format used in Batch 1 (which also works but is legacy).

---

## STRICT PLACEMENT RULE (effective Batch 5+)

The 80/20 EdifyEdu brand cap is MAXIMUM 5 mentions per page, but they MUST be only in these 5 allowed slots. Any mention outside these slots is a rule violation and must be stripped.

**Allowed slots (and only these):**
1. `about_body` — commission-free disclosure sentence
2. `fees_body` — "EdifyEdu reconfirms fees..." mandated closer
3. `beyond_admission_body` — branded section (unlimited mentions OK here since this IS the branded section)
4. `verdict_body` — optional closer "If undecided, counsellor call is free"
5. One FAQ answer — optional

**Explicitly forbidden slots:**
- `coupon_body` (do not disclaim coupon codes when UI offers them)
- `hirers_body` (no brand disclaimer in Top Hirers)
- `placements_body` (no brand disclaimer in Placements)
- `review_intro` or review bodies (reviews are student voices, not brand voice)
- `red_flags_body` (red flags are editorial limits of the UNI, not brand self-reference)
- `syllabus_body` (syllabus is program-specific, not brand-related)

**Before completing any page:** grep the generated content for "EdifyEdu" and confirm all occurrences are in the 5 allowed slots only.

**Historical note:** Batch 4 had 2 rogue mentions (`coupon_body`, `hirers_body`). These shipped as-is but must not repeat in Batch 5+.

---

## SPEC PAGE STRUCTURE RULE (Phase 7.1+)

All spec pages (including future unis NMIMS, Chandigarh, LPU, etc) MUST use:

**1. §5 Who Hires — structured with labelled lines:**
- Lead sentence: "{Spec} MBA graduates from {uni} are hired across these industries and roles:"
- **Industries:** {4-6 industries, comma-separated}
- **Entry-level roles:** {3-4 role titles}
- **Mid-level roles (3-5 years experience):** {3-4 role titles}
- **Senior roles (7+ years):** {2-3 role titles}
- **Top hiring organisations:** {4-6 named companies relevant to spec}
- NOT dense prose paragraphs. Total 180-220 words.

**2. §6 Skills You Develop — structured with bullets:**
- Lead sentence: "The {Spec} specialisation builds skills that {industry} employers test in {role type}:"
- **Technical skills:** 3-4 bullets at 10-15 words each
- **Applied skills:** 2 bullets at 10-15 words each
- **Soft skills:** short paragraph covering 2-3 interpersonal skills (~30 words)
- NOT dense prose. Total 180-220 words.

**3. §7 Comparisons — bold labels, NO inline URL syntax:**
- Format: `**vs [Peer Uni Name] MBA:** [40-60 word comparison text]`
- BAD: `Amity vs Manipal Online MBA (/universities/xxx/mba): text`
- GOOD: `**vs Manipal (MAHE) Online MBA:** text`
- 2-3 peers per spec. Total 160-200 words.

**4. §8 Fees — correct per-spec data, no registration fee assumption:**
- Template: "The total program fee for the [Uni] MBA in [Spec] is ₹X,XX,XXX across 4 semesters. Per-semester fee is ₹XX,XXX. [Uni] does not charge a separate registration fee."
- Include: total fee, per-semester fee, EMI amount and tenure
- Check if uni actually has a registration fee — do NOT assume. If none, state explicitly.
- Amity standard specs: ₹2,25,000 total / ₹56,300 sem / ₹8,906 EMI (24 months)
- Amity Healthcare spec: ₹3,29,000 total / ₹82,300 sem / ₹13,023 EMI (24 months)

**5. Mobile-first principle:**
- Indian online MBA users are 80% mobile. Every section must be scannable.
- Labelled sections, bullets, short paragraphs. No paragraph longer than 3 sentences.

**Violation of these rules requires spec page regeneration before ship.**

---

## SPEC PAGE RENDERING RULES (Phase 7.2 v2+)

1. **Inline bold in JSON content fields** (§3 About, §5 Who Hires, §6 Skills, §7 Comparisons, §8 Fees, §9 Certificate) is rendered via the `renderBoldInline` / `renderParagraphsWithBold` helpers in `UniSpecBody.tsx`. Content can safely use `**text**` syntax. The helpers convert to `<strong>` tags at render time. No `whitespace-pre-line` needed — paragraphs separated by `\n\n` render as `<p>` blocks.

2. **Sample Degree Certificate on spec pages**: `SampleCertificate` component renders first (checks `getSampleDegree(uniId, program)` — image if mapped, `RequestSampleCertCard` fallback). Certificate body text renders below as a small `text-xs` supporting caption. Do NOT use text-only descriptions — users need to see the actual cert where available.

3. **Factual accuracy on degree certificate**: per UGC-DEB 2020 regulations, "online" IS identified on the certificate to denote the learning mode. This is a feature, not a limitation — it validates that the student could hold full-time work during the programme. The template phrase is: "identifies the online learning mode per UGC-DEB 2020 regulations." Never claim "does not display the word online."

4. **New spec additions** (like NMIMS IT Management): when adding a spec that was not previously in the manifest, ALWAYS include full Sem 1-4 structure. Sem 1+2 pulls from `_core` shared subjects, Sem 3+4 from user-provided verbatim data. Never ship a spec page with partial semester data. Set `hasSyllabusData: true` and populate `sem1Subjects` through `sem4Subjects`.

5. **Comparisons heading in UniSpecBody**: uses `cleanName` (dynamic) not hardcoded "Amity". Safe for all universities using the specJson path.

6. **NMIMS fee structure** (locked as of Phase 7.2 v2): 3-option template — Annual (Rs 1,05,000/yr = Rs 2,10,000), Semester (Rs 55,000/sem = Rs 2,20,000), Upfront discounted (Rs 1,96,000). Plus Rs 1,200 admission processing, Rs 10,000 registration (counts toward fees), Rs 800 exam fee per subject per attempt. 20% discount for Armed Forces and dependents. DD in favour of 'SVKM's NMIMS' payable at Mumbai.

---

## FIRST-BATCH QA RULE (Phase 7.3+)

The first spec batch for any new uni (MUJ, LPU, Chandigarh, etc) must include a user mobile screenshot review of at least 1 spec page post-deploy, before proceeding to the next uni's spec batch.

This catches:
- Rendering bugs specific to that uni's data shape
- Content quality issues the rubric didn't flag
- Visual/mobile readability issues

Do not fire Batch N+1 until user has confirmed Batch N renders cleanly on mobile.

---

## SPEC ROUTING RULE (Phase 7.3 — 2026-04-21)

**Problem:** `SpecializationGrid.tsx` previously derived chip `href` by calling a local `toSlug(displayName)` function on the human-readable spec name. This breaks whenever `toSlug(displayName) !== actual-manifest-slug` (e.g., "IT and FinTech" → "it-and-fintech" vs actual "it-fintech"; "Finance & Accounting Management" → "finance-accounting-management" vs "finance-and-accounting-management").

**Rule:** For any university that has spec-level pages (currently Amity, MUJ, NMIMS), the `specs` array in `lib/data.ts` MUST use `{ slug: string; name: string }` tuples, not plain strings. The `slug` value MUST exactly match the JSON filename segment and the `syllabus-manifest.json` key.

**How to add a new spec-page university:**
1. Add all spec entries as `{ slug, name }` tuples in `lib/data.ts` under that university's `specs` array.
2. The `slug` must match the JSON file at `lib/data/page-content/{uni-id}-mba-{slug}.json` and the manifest key in `lib/data/programs-manifest.json`.
3. Run `npx tsc --noEmit` — must pass clean before committing.
4. Run `node scripts/fix-online-online.js --apply` — must show 0 modifications.
5. Do NOT derive routing slugs from display names at render time. Always use `specSlug(s)` from `lib/data.ts`.

---

## UNIVERSAL EMI LANGUAGE RULE (Phase 7 Batch 12 — 2026-04-21)

**Problem:** Earlier content named specific marketing partners (Jaro Education, upGrad, Online Manipal, etc.) or NBFC partners (Avanse, GrayQuest, Fibe) in EMI sections. This creates legal and reputational risk and is factually unreliable as partner agreements change.

**Rule:** Every Indian online MBA uni routes EMI through external marketing partners, not directly through the university. This is standard practice for online MBA enrolment.

Content must say:
- For INTEREST-BEARING EMI (SSODL, most unis): "EMI is available through the university's marketing partner. This is interest-bearing EMI, not zero-cost. Contact our counsellor for current EMI tenure options and approval terms."
- For ZERO-COST EMI (MUJ, NMIMS): "24-month zero-cost EMI is available through the university's marketing partner. Contact our counsellor for current EMI terms and NBFC partner details."

**Do NOT name:**
- Specific marketing partners: Jaro Education, upGrad, Online Manipal, Emeritus, etc.
- Specific NBFC partners: Avanse, GrayQuest, Fibe, Propelld, etc.
- Use generic "marketing partner" / "NBFC partners" only.

**How to apply:** Apply this rule to all new spec pages, all university MBA pages, and any content revision involving fee or EMI sections. Grep new content for partner names before committing.

---

## JSON SCHEMA VALIDATION LESSON (Phase 7 Batch 13 — 2026-04-21)

**Problem:** Spec JSON generation can silently produce incorrect field types. In Batch 12 SSODL, `whoHires`, `skills`, and `comparisons` were written as plain strings instead of `{body: string}` objects. UniSpecBody.tsx accesses `.body` on these fields, so plain strings rendered as empty sections without errors.

**Pre-commit self-check rubric for every new spec JSON:**

1. `sections.whoHires` must be `{body: string}`, NOT `"string"` directly
2. `sections.skills` must be `{body: string}`, NOT `"string"` directly
3. `sections.comparisons` must be `{body: string}`, NOT `"string"` directly
4. `sections.fees` must be `{body: string}`, NOT `"string"` directly
5. `sections.about` must be `{body: string}`, NOT `"string"` directly
6. `sections.certificate` must be `{body: string}`, NOT `"string"` directly
7. `sections.syllabus` must NOT contain `sem1Subjects` or `sem2Subjects` (Sem 3-4 only for spec pages)
8. `sections.syllabus.note` must reference the main uni MBA page for core subjects

**Manifest slug alignment:** Always verify spec_slug in programs-manifest.json before writing filename and data.ts tuple. Do NOT assume slugs from display names. For LPU: `healthcare-management` (NOT `hospital-healthcare-management`), `logistics-supply-chain-management` (NOT `logistics-and-supply-chain-management`).

**Zero em dash rule:** Never use U+2014 (—) in any JSON content on Windows. The Write tool double-encodes it to mojibake. Use ` - ` (space-hyphen-space) or rewrite the sentence.

---

## UNIVERSAL EMI LANGUAGE RULE (Phase 7.3+) — expanded banned list per audit 2919b08

Marketing/enrolment partners (never name):
- Jaro Education
- upGrad
- Online Manipal

NBFC/lending partners (never name):
- Avanse
- GrayQuest
- Fibe
- Propelld
- Eduvanz

Always use generic phrasing: "the university's marketing partner" OR "NBFC lending partners". Never name specific partners in editorial content.

Pre-commit validation grep (should return zero for all):
```
rg 'Jaro|upGrad|Online Manipal|Avanse|GrayQuest|Fibe|Propelld|Eduvanz' lib/data/page-content/
```

---

## TRAFFIC RANK CURATION RULE (Phase 7.4+) — Rule #14

Each shipped university has a position in the TRAFFIC_ORDER array in components/Navbar.tsx (integer index, ascending = higher traffic). Ranks are manually curated from GSC dashboard and updated monthly. New batches inherit next available rank at bottom; user adjusts after 30 days of traffic data.

Current order (as of 2026-04-24): Amity > NMIMS > MUJ > SSODL > LPU > JAIN > UPES > CU > SMU > Shoolini > Amrita > IGNOU > DPU > MAHE > JIIT > Galgotias > Uttaranchal > NIU > Sharda (19 traffic-ranked unis, rest appended alphabetically).

---

## DATA CONSISTENCY CASCADE RULE (Phase 7.5+) — Rule #15

Hub pages (e.g., /programs/mba) summarise data from child pages (main MBA + spec pages). Any fact on a hub page MUST match the fact on the corresponding child pages: fees, NIRF rank + category, NAAC grade, UGC-DEB status, scholarships, EMI structure, specialisations list.

Before publishing any hub page, run a four-way consistency audit (hub <> lib/data.ts <> main MBA page JSON <> spec page JSON). Any mismatch: halt and resolve to single source of truth. No hub page ships with internal contradictions.

EMI claims specifically: do NOT claim "zero-cost EMI" unless the university explicitly offers it. Use "EMI options available (confirm interest structure with counsellor)" as the safe default. The EMIPlans component now hides entirely when emiFrom = 0.

