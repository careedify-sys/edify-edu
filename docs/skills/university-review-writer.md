# University Review Writer — House Style Guide

Codified from live state guides (UP, Tamil Nadu, Maharashtra, Karnataka) on edifyedu.in.

---

## 1. Structure Pattern

Every state/region MBA roundup follows this skeleton:

1. **Byline** — `<p style="font-size:13px;color:#64748b;margin:0 0 20px"><em>Last updated {date} by Rishi Kumar, Senior Education Researcher and Founder, EdifyEdu. University data sourced from official portals, UGC-DEB entitlement list, NAAC accreditation database, and current edifyedu.in university profiles.</em></p>`
2. **Answer-first intro** — `<div class="callout-answer">` containing a `<p><strong>Short answer:</strong> ...` that names the best-value pick, the highest-NAAC pick, and the premium pick with linked university pages and fee figures. End with "Below is the full comparison."
3. **"Why {Region} Deserves Its Own Guide"** — H2. 2-3 paragraphs. State what makes this geography unique (fee spread, government vs private mix, cluster geography, NAAC density). Cross-link any existing city-level guide.
4. **Comparison table** — H2. Full-width responsive `<div style="overflow-x:auto">` wrapping a `<table>`. Navy header row (`background:#0f172a;color:#fff`). Columns: University (linked), City, NAAC, NIRF (Uni), MBA Fee, Specialisations. Best-value row gets `background:#f0fdf4`. Alternate rows `#f8fafc`.
5. **Tier deep-dives** — H2 per tier (Premium, Mid-Range, Value/Budget). Each university gets an H3, 2-3 paragraphs: accreditation facts, fee, EMI, trade-offs, cross-link to full review or comparison page.
6. **Exclusions section** — H2 "Which Universities Did Not Make This List?" — name excluded universities and state the reason (no MBA data, NAAC below threshold, not UGC-DEB entitled, not geographically in scope).
7. **FAQ** — 5 questions in the `faqs` array. One must address validity/UGC-DEB. One must address cheapest option. One must be location-specific. Answer-first format, 3-5 sentences each. All fees flagged as indicative. End with "Confirm with our counsellor on edifyedu.in before paying."
8. **Related reads grid** — `<div class="il-grid">` with 4-8 `<a class="il-card">` internal links covering related state guides, fee tool, reviews, compare pages, and /contact.
9. **Sources** — H2. Bulleted list with exactly three links: deb.ugc.ac.in, naac.gov.in, nirfindia.org. `rel="nofollow noopener" target="_blank"`.
10. **Disclaimer** — `<p class="disclaimer"><em>...</em></p>` stating fees are indicative, sourced from edifyedu.in profiles, and edifyedu.in earns no referral commission.

---

## 2. Post Metadata Fields

```
slug, title, h1Title, seoTitle, metaDescription, category: 'City Guides',
tags (6-8 long-tail keywords), publishedAt, readTime (14-18),
targetKeyword, relatedUniversities (array of slugs from lib/data.ts),
status: 'published' as const,
heroImage (Pexels URL), heroImageAttribution, heroImageAlt,
quickFacts (4 items: Region/State, Fee Range, Best Value, Duration),
faqs (5 objects with q and a keys), content (template literal)
```

- **seoTitle**: verdict-hook format. Include count, fee range, and "| Edify". Under 60 chars.
- **metaDescription**: under 155 chars. Include count, fee range, NAAC mention.

---

## 3. Fee Sourcing Rules

- ONLY use fees from `lib/data.ts` → `programDetails.MBA.fees`.
- If fee data is missing or looks wrong, write "Confirm with our counsellor" and link `/contact`.
- Never invent, round, or estimate fees.
- Always add: "All fees are indicative and subject to revision."
- Never say "verify on official portal." Say "Confirm with our counsellor on edifyedu.in."

---

## 4. NAAC and NIRF Rules

- Pull NAAC grade and NIRF rank from `lib/data.ts`.
- Cross-check against Supabase if available (Supabase is source of truth).
- NIRF ranks must ALWAYS state category (Management/University).
- `nirf: 999` means "Not ranked" in the table.
- If NAAC is below B++, add a `<div class="callout-warning">` flagging it.

---

## 5. Link Rules

### External (only these three domains)
- `deb.ugc.ac.in` — UGC-DEB entitlement
- `naac.gov.in` — NAAC grades
- `nirfindia.org` — NIRF rankings

### Internal (5-10 per post, zero duplicates)
- Every university mentioned links to `/universities/{slug}`
- Top picks link to `/verify/{slug}` if the route exists
- Link `/compare/{pair}` pages where relevant
- Link `/fees` fee comparison tool
- Link `/contact` in CTA sections
- Link related `/blog/{slug}` posts
- Cross-link existing city/state guides

---

## 6. Tone Rules

1. No em dashes. Use periods, commas, "and", "but", "or".
2. No H1 in body. Start at H2.
3. Short paragraphs: 2-4 sentences max.
4. Active voice only.
5. No AI filler: delve, comprehensive, testament, pivotal, landscape, navigate, robust, holistic, seamless, synergy, unlock, showcase, journey, realm, "in today's rapidly evolving", "it is important to note", "in conclusion".
6. No sentence-starters: Furthermore, Moreover, Additionally.
7. No fabricated stats. Only cite approved sources.
8. Verdict-hook seoTitle (e.g., "Best Online MBA in UP 2026: 14 Universities, Fees X to Y | Edify").
9. Honest NAAC tiering: call out low grades, highlight A++ density where real.
10. Comeback-after-gap framing where natural (career breaks, working professionals).

---

## 7. CSS Classes Available

| Class | Use |
|---|---|
| `.callout-answer` | Answer-first intro box |
| `.callout-key` | Yellow/amber key-fact callout |
| `.callout-warning` | Red verification warning |
| `.pull` | Pull quote / emphasised line |
| `.emi-block` | Green-bordered EMI math block |
| `.ilink` | Internal link button |
| `.cta-box` | Dark navy full-width CTA card |
| `.il-grid` | Grid wrapper for related-reads cards |
| `.il-card` | Individual internal link card |
| `.svg-figure` | Wrapper for inline SVG diagrams |
| `.disclaimer` | Disclaimer paragraph |

---

## 8. CTA Box Pattern

```html
<div class="cta-box" style="background:#0f172a;color:#fff;border-radius:12px;padding:24px;margin:32px 0;text-align:center">
  <p style="font-size:18px;font-weight:700;margin:0 0 8px">{Headline}</p>
  <p style="margin:0 0 12px">{Subtext}</p>
  <a href="/contact" style="...orange button styles...">Talk to a Counsellor</a>
  <p style="font-size:12px;margin:8px 0 0;opacity:0.7">No paid rankings. No referral commissions. Just data.</p>
</div>
```

---

## 9. Cannibalisation Guards

- State/region guides stay region-level. Do not compete with university-level review slugs.
- Cross-link university reviews rather than duplicating their content.
- If a city guide exists for a city within the region, cross-link it and keep the region guide broader.

---

## 10. Build and QA Checklist

- [ ] No em dashes in content
- [ ] No H1 tags in body
- [ ] No AI filler vocabulary
- [ ] All fees match lib/data.ts
- [ ] 5-10 internal links, zero duplicates
- [ ] Only 3 approved external domains linked
- [ ] FAQ has 5 questions with answer-first format
- [ ] seoTitle under 60 chars
- [ ] metaDescription under 155 chars
- [ ] Template literal uses plain backticks (not escaped)
- [ ] Post inserted before closing `]` of BLOG_POSTS array
- [ ] `npm run build` passes
