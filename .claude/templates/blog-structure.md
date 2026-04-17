# Blog Structure Template

This is the canonical section order for every EdifyEdu university review blog. The `/university-review` command writes the blog following this template exactly. No sections skipped, no sections re-ordered.

---

## Section Order

| # | Section | Length | Required? | Notes |
|---|---|---|---|---|
| 1 | H1 title | 1 line | YES (meta only, not in body HTML) | Handled by CMS template |
| 2 | Subtitle | 25-35 words | YES | Single line, appears under H1 |
| 3 | Author meta row | — | YES | Uses `rishi-avatar-sm.svg` |
| 4 | University logo box | — | YES | Uses `/logos/university_logos/{slug}.svg` |
| 5 | PAS intro | 50-80 words HARD CAP | YES | Problem → Agitation → Solution preview |
| 6 | Key snapshot callout | 4-6 data points | YES | `.callout-key` class |
| 7 | Hero SVG | 720×320 | YES | Branded dark card with fees + duration |
| 8 | Fee Structure H2 | 2-3 paragraphs + table | YES | Sticker vs effective + SVG |
| 9 | EMI block | 2-3 sentences | YES | `.emi-block` class |
| 10 | Unique Angle #1 H2 | 3-5 paragraphs | YES | Pick from the menu |
| 11 | Syllabus H2 + timeline SVG | 4 callouts (1 per sem) | YES | 720×200 timeline SVG |
| 12 | Scholarships H2 | Numbered list + 1 paragraph | CONDITIONAL | Skip if none offered |
| 13 | Unique Angle #2 H2 | 2-3 paragraphs | YES | Pick from the menu |
| 14 | Eligibility H2 | 2 paragraphs + warning callout | YES | `.callout-warning` with UGC-DEB + NAAC links |
| 15 | Mid-post CTA box | — | YES | `.cta-box` with Compare + Counsellor buttons |
| 16 | "Falls Short" H2 | 3 limitations, 1 paragraph each | YES | Honest framing |
| 17 | Apply/Don't Apply H2 | Decision matrix SVG + 2 paragraphs | YES | 720×360 SVG |
| 18 | Parent-group comparison | Table + SVG | CONDITIONAL | Only if programme has peer group |
| 19 | Final Word H2 | 2 paragraphs | YES | Never "In conclusion" |
| 20 | End CTA box | — | YES | `.cta-box` with Counselling button |
| 21 | Lead form | — | YES | Formspree endpoint |
| 22 | FAQs H2 | 6-8 accordion items | YES | q/a JSON schema |
| 23 | Sources H2 | 3-5 primary only | YES | No competitor links |
| 24 | Disclaimer block | 3-4 sentences | YES | `.disclaimer` class |

---

## Heading Hierarchy Rules

- **No H1 inside body HTML**. The CMS template renders H1 from the title field.
- **H2** opens each major section listed above.
- **H3** for subsections inside Apply/Don't Apply only.
- **Never H4 or deeper**.

---

## Required SVG Figures

Every blog must include these 4 SVGs minimum. Add 2 more if unique angles warrant:

1. **Hero snapshot** (720×320) — fees + duration + accreditation
2. **Fee comparison** (720×280) — sticker vs effective bars
3. **Syllabus timeline** (720×200) — 4 semesters with credits
4. **Apply/Don't Apply matrix** (720×360) — green vs red split

Optional (add if relevant):
5. **Dual-spec combinations** (720×420) — for multi-spec programmes
6. **Peer-group comparison** (720×280) — for programmes with peer group

---

## Fee Section Template

Every fee section follows this exact pattern:

```html
<h2>Fee Structure (YYYY, with Discount Math)</h2>

<p>[Opening paragraph: state the sticker price, mention scholarship exists, 
one-line transition.]</p>

<!-- SVG: Fee comparison bars (720×280) -->
<div class="svg-figure">...</div>

<table>
  <thead>
    <tr><th>Component</th><th>Sticker (MRP)</th><th>After Scholarship*</th></tr>
  </thead>
  <tbody>
    <tr><td>Full course fee</td><td>INR X</td><td>INR Y</td></tr>
    <tr><td>Per semester</td><td>INR A</td><td>INR B</td></tr>
    <tr><td>EMI starting at</td><td>INR P</td><td>INR Q</td></tr>
    <tr><td>Application fee</td><td>INR 500</td><td>INR 500</td></tr>
  </tbody>
</table>

<p style="font-size:13px;color:var(--muted)"><em>*Scholarship eligibility details...</em></p>

<div class="emi-block">
  <strong>EMI reality check:</strong> [2-3 sentences of honest math]
</div>

<p>Fees are indicative. Verify on <a href="{official_url}">{official_host}</a> 
and cross-check UGC-DEB at <a href="https://deb.ugc.ac.in">deb.ugc.ac.in</a>.</p>
```

---

## PAS Intro Template

The intro is always 50-80 words. Structure:

- **Sentence 1-2 (Problem)**: the target reader's situation
- **Sentence 3 (Agitation)**: why the usual options fall short
- **Sentence 4-5 (Solution preview)**: what this post delivers

**Example (72 words, for SMU)**:
> You want a Manipal-branded MBA. You do not want to spend INR 3 lakh to get one. And you want two specializations on the transcript, not one. That is the exact niche Sikkim Manipal University Online MBA is built for. This 2026 review walks through the revised fee structure, the dual specialization mechanics most reviews oversimplify, the scholarship schemes people actually qualify for, and the honest cases where SMU is the wrong choice.

---

## "Who Should Not Apply" Framing

The section title is always: **"Who Should Apply, and Who Should Not"**.

Structure:
- H3 "Apply if you are" followed by 1 paragraph with 4-5 profile types
- H3 "Do not apply if you are" followed by 1 paragraph with 4-5 disqualifiers

Use full sentences, not bulleted lists. The paragraph format builds more trust.

---

## Final Word Rules

- Section title is **"Final Word"**, never "Conclusion".
- Exactly 2 paragraphs.
- Paragraph 1: state the honest overall verdict.
- Paragraph 2: situate it against the reader's decision process, not a cheer or a summary.
- Never end with "The future is bright" or similar.
