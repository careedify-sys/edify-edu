---
description: Generate a complete university programme review blog for EdifyEdu following house style exactly
argument-hint: <university-slug> [--fees=new] [--length=1800-2200]
allowed-tools: Read, Write, Edit, WebSearch, WebFetch, Bash
---

# /university-review Command

Generate a complete, SEO-optimised, CMS-ready university programme review blog for EdifyEdu following the house style exactly.

---

## Usage

```bash
/university-review <university-slug>
```

Example:
```bash
/university-review sikkim-manipal-university-online
/university-review amity-university-online --fees=new
/university-review nmims-online --length=2500
```

If no input file exists at `.claude/inputs/{slug}.json`, ask the user to fill one in using the template at `.claude/inputs/_template.json`. Do not invent inputs.

---

## Step-by-Step Workflow

Execute these steps in order. Do not skip steps. Do not re-order.

### STEP 1 — Load Inputs

Read `.claude/inputs/$ARGUMENTS.json`. It must contain:

```json
{
  "university_slug": "sikkim-manipal-university-online",
  "university_name": "Sikkim Manipal University",
  "programme": "Online MBA",
  "programme_full_name": "Online MBA with Dual Specialization",
  "target_keyword": "SMU online MBA review",
  "secondary_keywords": ["sikkim manipal online mba", "smu online mba fees 2026"],
  "official_portal_url": "https://www.onlinemanipal.com/online-mba-degree-dual-specialization-smu",
  "current_blog_url": "https://edifyedu.in/blog/smu-online-mba-review",
  "fees_override": {
    "sticker_total": 120000,
    "effective_total": 108000,
    "sticker_per_sem": 30000,
    "effective_per_sem": 27000,
    "emi_per_month": 4500,
    "application_fee": 500
  },
  "category": "Online MBA Programs",
  "target_word_count": 2000,
  "published_date": "2026-04-17"
}
```

If the file is missing or any required field is empty, stop and tell the user which fields are needed. Do not proceed with placeholders.

### STEP 2 — Fetch Existing Blog (if `current_blog_url` provided)

Use `WebFetch` on the current blog URL. Record:
- Current word count
- Heading structure
- Internal links already used (to avoid duplicates)
- Tags already applied
- CTAs already placed

### STEP 3 — SERP Research (Mandatory)

Run these searches:
1. `"{university_name} {programme} review"`
2. `"{university_name} {programme} fees {current_year}"`
3. `"{programme} {university_short_name} honest review"`

Extract from top 3-5 Indian results (skip international namesakes):
- Their heading structure
- Approximate word count
- Unique sections
- **Critical**: what gaps they leave

Never link to any site on the competitor blacklist in CLAUDE.md. Use them for gap analysis only.

### STEP 4 — Official Portal Verification

Use `WebFetch` on `official_portal_url`. Cross-check:
- Fee structure (sticker, per-sem, EMI, application fee)
- Specialization list
- Syllabus (semester-wise)
- Eligibility criteria
- Scholarship categories
- Accreditation (NAAC, UGC-DEB, NIRF)
- Hiring partners
- Faculty count and alumni count

If `fees_override` in the input file conflicts with the portal, present both and note the discrepancy. Do not silently override the official source.

### STEP 5 — Identify 3-5 Unique Angles

Find angles competitors miss. Use this as the menu:

- Career-combination framework for dual/multi specializations
- Scholarship category specifics (Northeast, defense, differently-abled, alumni)
- ABC (Academic Bank of Credits) / NEP 2020 credit portability
- Bundled foundation courses / free certifications
- Optional campus immersion events for online students
- "Who should NOT apply" reverse framing
- Sticker-vs-effective fee math with scholarship applied
- Cross-programme comparison inside the same parent group
- Specialization-specific salary bands by domain
- Drop-out refund policy under UGC rules

Lock the selected 3-5 angles before writing. Note them in the output QA file.

### STEP 6 — Draft the Blog

Use the structure template at `.claude/templates/blog-structure.md`. Follow it section by section:

1. H1 title (CMS renders this, do not include in body HTML)
2. Subtitle (1 line, 25-35 words)
3. Author meta row with avatar (use `/authors/rishi-avatar-sm.svg`)
4. University logo box (use `/logos/university_logos/{slug}.svg`)
5. PAS intro (50-80 words, hard cap)
6. Key snapshot callout
7. Hero SVG diagram (720×320)
8. Fee Structure section with comparison table + fee SVG
9. Unique Angle #1
10. Syllabus semester-by-semester + timeline SVG
11. Scholarships section
12. Unique Angle #2
13. Eligibility + warning callout
14. ABC / NEP / Foundation bonus sections (if applicable)
15. Mid-post CTA box
16. "Where it Falls Short" section
17. Apply/Don't Apply section + decision matrix SVG
18. Parent-group comparison table + comparison SVG (if applicable)
19. Final Word (2 paragraphs, never "conclusion")
20. End CTA box
21. Lead form (Formspree endpoint from CLAUDE.md)
22. FAQs (6-8 in accordion format)
23. Sources to Consult (3-5 primary)
24. Disclaimer block

### STEP 7 — Humanize Pass

Run the full blacklist scan defined in CLAUDE.md. Every hit must be fixed.

Verify:
- Zero em dashes
- Zero AI-filler words from the list
- Zero AI sentence-starters
- Varied sentence rhythm (not every line same length)
- At least one first-person or "your call" moment
- At least one honest hedge

### STEP 8 — Run QA Checklist

Fill out `.claude/templates/qa-checklist.md` row by row. Every row must pass. If any row fails, fix before proceeding.

### STEP 9 — Write Output Files

Write exactly these files to `/content/blogs/{slug}/`:

```
{slug}.html       → Standalone preview HTML with inline SVGs
{slug}.cms.xlsx   → 11-column CMS import file (use openpyxl)
{slug}.meta.json  → Structured metadata snapshot
{slug}.qa.md      → QA checklist results
```

Use the templates in `.claude/templates/` for the HTML structure and CMS format. Do not deviate.

### STEP 10 — Report Back

Output ONLY this summary to the user (do not dump the full blog into the chat):

```
✓ Generated review blog for {university_name} {programme}

Files written:
  content/blogs/{slug}/{slug}.html       ({X} KB)
  content/blogs/{slug}/{slug}.cms.xlsx   ({Y} KB)
  content/blogs/{slug}/{slug}.meta.json
  content/blogs/{slug}/{slug}.qa.md

Word count: ~{N}
Unique angles used: {list of 3-5}
Internal links: {count}/10
External sources: {count}/5
QA: {X}/15 rows passed

Open preview: file://content/blogs/{slug}/{slug}.html
Upload to CMS: content/blogs/{slug}/{slug}.cms.xlsx
```

If any QA row failed, list them explicitly in the output and do not claim success.

---

## Failure Modes to Avoid

- **Do not dump the full blog into chat.** Write to files, report the summary.
- **Do not fabricate fees or accreditation data.** Use the portal or stop.
- **Do not link to blacklisted competitors.** Ever.
- **Do not use em dashes.** Find-replace before writing.
- **Do not produce H1 inside body HTML.** H1 belongs to the CMS template.
- **Do not skip the QA checklist.** If you skip it, the output is invalid.
- **Do not duplicate internal links.** Same URL twice in one post = fail.

## What Success Looks Like

A `/university-review` call that produces:
- A preview HTML that renders correctly in any browser
- A CMS XLSX that imports without error into Google Sheets
- A meta.json with every field populated
- A qa.md where every row says "PASS"
- Summary output of under 10 lines

If any of those four files is missing or incomplete, the command has failed. Fix and retry before reporting success.
