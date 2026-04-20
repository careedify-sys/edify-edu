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
