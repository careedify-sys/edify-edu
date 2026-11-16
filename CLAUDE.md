# EdifyEdu — Claude Code Context

You are working on **EdifyEdu** (edifyedu.in), an independent, commission-free online education comparison platform for the Indian market. The codebase is Next.js 14, hosted on Vercel. The founder is **Rishi Kumar**.

**Every response you produce must follow the rules in this file.** No exceptions.

> **Before starting any coding task**, read `CODEBASE_MAP.md` in the project root. It maps every URL to its file, every data source to its location, and every common fix to where to make it. Do not guess file locations — look them up there first.

> **CMS is not in use.** Do not touch `app/admin/`, `app/api/cms/`, `app/blog/write/`, or anything related to Google Sheets / CMS sync. Ignore those files completely.

---

## Project Facts (Never Fabricate These)

- **Site**: edifyedu.in
- **Stack**: Next.js 14, Vercel
- **Lead form endpoint**: `https://formspree.io/f/mojpvgwz`
- **Author name across all content**: Rishi Kumar
- **Author role**: Senior Education Researcher · Founder, EdifyEdu
- **Positioning**: Independent, no paid rankings, no referral commissions, UGC-DEB/NAAC/NIRF data only

## Competitor Blacklist (Never Link, Never Cite)

Zero outbound links. Zero citations in content. Gap analysis only.

- CollegeVidya, Shiksha, Careers360, Jaro Education, Padhaao, AdmissionDiy
- SamarthEdu, KollegeApply, PWMedharthi, DistanceEducationSchool
- DistanceEducation360, MBADistanceEducation, OnlineUniversities, CollegeDekho

## Approved External Sources (3-5 Per Blog)

- Official university portals (`onlinemanipal.com`, `online.amity.edu`, etc.)
- `deb.ugc.ac.in` — UGC-DEB approved list
- `naac.gov.in` — NAAC accreditation database
- `nirfindia.org` — NIRF India Rankings
- `ugc.gov.in` — UGC official notifications

## House Style (Hard Rules)

1. **No em dashes (—)**. Use a period, comma, or "and/but/or".
2. **No H1 inside blog body**. Body starts at H2.
3. **Short paragraphs**: 2-4 sentences maximum.
4. **Active voice only**.
5. **No AI-filler words**: `delve`, `comprehensive`, `testament`, `pivotal`, `landscape`, `navigate`, `robust`, `holistic`, `seamless`, `synergy`, `unlock`, `showcase`, `journey`, `realm`, `in today's rapidly evolving`, `it is important to note`, `in conclusion`.
6. **No sentence-starters**: `Furthermore,`, `Moreover,`, `Additionally,`.
7. **No fabricated stats**. Only cite approved sources above.
8. **All fees flagged as indicative** with verification directive to official portal.
9. **Internal CTAs framed as neutral**: "Edify compares public UGC/NAAC/NIRF data, no paid rankings".
10. **Never quote more than 15 words verbatim from any source**.

## Brand Palette (Use Exactly These Hex Codes)

```
--navy:   #0f172a   (primary, headings, dark bars)
--orange: #f97316   (accent, CTAs, highlights)
--amber:  #B8892A   (secondary accent)
--green:  #10b981   (savings badges, success)
--red:    #ef4444   (warnings)
--slate:  #64748b   (muted text)
--bg:     #f1f5f9   (pull quote backgrounds)
```

## House CSS Classes

| Class | Purpose |
|---|---|
| `.callout-key` | Yellow/amber key-fact callout |
| `.callout-warning` | Red verification warning |
| `.pull` | Pull quote / emphasised single line |
| `.emi-block` | Green-bordered EMI math block |
| `.ilink` | Internal link button |
| `.cta-box` | Dark navy full-width CTA card |
| `.svg-figure` | Wrapper for inline SVG diagrams with caption |

## Internal Linking Rules

- **5-10 internal links** per blog, zero duplicates.
- Allowed targets: `/compare`, `/contact`, `/blog/{slug}`, `/universities/{slug}`, `/guides/{slug}`, `/tools/{slug}`.
- Never the same URL twice in one post.

## Logo Reference Pattern

University logos: `/logos/university_logos/{slug}.svg`
Slug matches the `/universities/{slug}` route.
Author avatar: `/public/authors/rishi-avatar-sm.svg` (also `-md`, `-card`, `-xl`).

## When You Are Uncertain

- If any fact, fee, or accreditation status is not from the approved list, **stop and ask**.
- If the user's fee claim differs from the official portal, **present both numbers**.
- If a university is not UGC-DEB entitled or NAAC below B++, **flag it in a warning callout**.

## Available Custom Commands

- `/university-review` — generate a full university programme review blog
- `/seo-blog` — generate a general SEO blog on any topic
- `/humanize` — remove AI writing patterns from existing text

## Autonomy rules (Rishi, 16 Nov 2026)
Rishi does not want to be asked for permission. Work the plan continuously.

1. audits/OPERATING-PLAN.md is the work list.
   - Take the top item that is neither BLOCKED nor date-locked, and give it to its owner agent.
   - Have qa-checker verify it.
   - Log it in the tracker and the fix log, tick it off, and take the next item.
   - Keep going until no unblocked item is left.
2. Never use AskUserQuestion. Never end a turn on a question while unblocked work remains.
   - A question only Rishi can answer goes in audits/QUESTIONS-FOR-RISHI.md.
   - Mark that item BLOCKED and move on.
3. Rishi's decisions in OPERATING-PLAN.md are final. Never ask them again.
4. Stop and tell Rishi only in these cases:
   - (a) the 28 Nov guard fails;
   - (b) a gate can only pass by weakening it;
   - (c) a live check fails and git revert doesn't fix it;
   - (d) the action can't be undone with git revert: a force push, a history rewrite, a Vercel, DNS, env or Cloudflare change, or deleting URLs without redirects.
   For anything else, decide using the plan, the playbook rules and this file, and note the decision in the fix log.
5. Deploys:
   - Batch them as the plan says.
   - Merge to main and push only after the gates and qa-checker pass.
   - Run the live check after each deploy. If it fails, git revert, push, log it, and continue with the next item.
6. Date-locked items wait for their date: the 28 Nov guard, the 26 Dec spec decision and the 9 Jan re-test. Never pull them forward.
7. Content freeze until 9 Jan 2027: no new blog, coupon, DBA, compare, programme or Q&A pages.
8. At the end of every session, put a 5-line status at the top of OPERATING-PLAN.md: done, in progress, blocked, waiting on Rishi, next.
9. Start every session by reading that status and audits/QUESTIONS-FOR-RISHI.md. Apply any answers Rishi has written, then continue the loop.
