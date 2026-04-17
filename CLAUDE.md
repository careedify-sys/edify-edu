# EdifyEdu Content Project — Claude Code Context

You are working on **EdifyEdu** (edifyedu.in), an independent, commission-free online education comparison platform for the Indian market. The codebase is Next.js 14 + Google Sheets CMS backend, hosted on Vercel. The founder and primary author is **Rishi Kumar**.

**Every response you produce must follow the rules in this file.** No exceptions.

---

## Project Facts (Never Fabricate These)

- **Site**: edifyedu.in
- **Stack**: Next.js 14, Google Sheets CMS, Vercel
- **Local dev path (founder's machine)**: `C:\Users\91706\Downloads\edify-v8-final\edify-next`
- **Lead form endpoint**: `https://formspree.io/f/mojpvgwz`
- **Author name across all content**: Rishi Kumar
- **Author role**: Senior Education Researcher · Founder, EdifyEdu
- **Positioning**: Independent, no paid rankings, no referral commissions, UGC-DEB/NAAC/NIRF data only

## Competitor Blacklist (Never Link, Never Cite)

The following are commercial competitors. Zero outbound links. Zero citations in content. You may reference them mentally for gap analysis only.

- CollegeVidya (collegevidya.com)
- Shiksha (shiksha.com)
- Careers360 (careers360.com)
- Jaro Education (jaroeducation.com)
- Padhaao (padhaao.com)
- AdmissionDiy (admissiondiy.com)
- SamarthEdu (samarthedu.in)
- KollegeApply (kollegeapply.com)
- PWMedharthi (pwmedharthi.com)
- DistanceEducationSchool (distanceeducationschool.com)
- DistanceEducation360 (distanceeducation360.com)
- MBADistanceEducation (mbadistanceeducation.info)
- OnlineUniversities (onlineuniversitiess.com)
- CollegeDekho (collegedekho.com)

## Approved External Sources (Primary Only, 3-5 Per Blog)

- Official university portal (`onlinemanipal.com`, `jaipur.manipal.edu`, `online.amity.edu`, etc.)
- `deb.ugc.ac.in` — UGC-DEB approved list
- `naac.gov.in` — NAAC accreditation database
- `nirfindia.org` — NIRF India Rankings
- `ugc.gov.in` — UGC official notifications

## House Style (Hard Rules)

1. **No em dashes (—)**. Replace with period, comma, or "and/but/or".
2. **No H1 inside blog body**. H1 is handled by the CMS template. Body starts at H2.
3. **Short paragraphs**: 2-4 sentences maximum.
4. **Active voice only**. Reject passive constructions.
5. **No AI-filler words**: `delve`, `comprehensive`, `testament`, `pivotal`, `landscape`, `navigate`, `robust`, `holistic`, `seamless`, `synergy`, `unlock`, `showcase`, `journey`, `realm`, `in today's rapidly evolving`, `it is important to note`, `in conclusion`.
6. **No sentence-starters**: `Furthermore,`, `Moreover,`, `Additionally,`.
7. **No fabricated stats**. If not sourced from the approved list above, do not include.
8. **All fees flagged as indicative** with verification directive to the official portal.
9. **Internal CTAs framed as neutral comparison**: "Edify compares public UGC/NAAC/NIRF data, no paid rankings".
10. **Never quote more than 15 words verbatim from any source**. Paraphrase aggressively.

## Brand Palette (Use Exactly These Hex Codes)

```
--navy:   #0f172a   (primary, headings, dark bars)
--orange: #f97316   (accent, CTAs, highlights)
--amber:  #B8892A   (secondary accent)
--green:  #10b981   (savings badges, success)
--red:    #ef4444   (warnings, do-not-apply column)
--slate:  #64748b   (muted text)
--bg:     #f1f5f9   (pull quote backgrounds)
```

## House CSS Classes (Required)

| Class | Purpose |
|---|---|
| `.callout-key` | Yellow/amber key-fact callout |
| `.callout-warning` | Red verification warning |
| `.pull` | Pull quote / emphasised single line |
| `.emi-block` | Green-bordered EMI math block |
| `.ilink` | Internal link button (Compare, Contact, Counsellor) |
| `.cta-box` | Dark navy full-width CTA card |
| `.svg-figure` | Wrapper for inline SVG diagrams with caption |

## Internal Linking Rules

- **5-10 internal links** per blog, zero duplicates.
- Allowed targets: `/compare`, `/contact`, `/blog/{slug}`, `/universities/{slug}`, `/guides/{slug}`, `/tools/{slug}`.
- Never the same URL twice in one post.

## Logo Reference Pattern

University logos live at `/public/logos/university_logos/{slug}.svg` served through the Next.js static path `/logos/university_logos/{slug}.svg`, or via the logos API route at `/api/logos?university={slug}`.

Slug matches the `/universities/{slug}` route. Example: `sikkim-manipal-university-online`, `nmims-online`, `manipal-university-jaipur-online`, `amity-university-online`.

Author avatars live at `/public/authors/rishi-avatar-sm.svg` (and `-md`, `-card`, `-xl` variants).

## CMS Output Format

EdifyEdu CMS uses an **11-column Excel/Sheets format**. Columns in this exact order:

1. Slug
2. Title
3. Meta Description
4. Category
5. Tags
6. Published Date
7. Read Time
8. Target Keyword
9. Status
10. FAQs JSON
11. Content HTML

**FAQs JSON schema (strict)**:
```json
[{"q": "Question?", "a": "Answer."}, ...]
```
Only `q` and `a` keys. No Markdown inside answers.

## Directory Structure (Outputs)

When producing blog files, always write to:

```
/content/blogs/{slug}/
  ├── {slug}.html              → Full standalone HTML preview
  ├── {slug}.cms.xlsx          → 11-column CMS import file
  ├── {slug}.meta.json         → Structured metadata snapshot
  └── {slug}.qa.md             → Quality assurance checklist results
```

## Available Custom Commands

Run these with `/command-name` in Claude Code:

- `/university-review` — generate a full university programme review blog
- `/seo-blog` — generate a general SEO blog on any topic
- `/humanize` — remove AI writing patterns from existing text

Each command reads a structured input file from `.claude/inputs/` and produces files in the output paths above.

## When You Are Uncertain

If any fact, fee, or accreditation status is not in the approved source list, **stop and ask the user**. Do not guess. Do not invent.

If the user's fee claim differs from the official portal, **present both numbers** and note the discrepancy. Do not silently override the official source.

If a university is not UGC-DEB entitled or NAAC grade is below B++, **flag it in the warning callout** and recommend the user consider alternatives.
