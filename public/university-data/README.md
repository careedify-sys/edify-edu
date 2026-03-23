# Edify — Excel to Live Update System

## How it works

```
You fill Excel → Upload to Admin → Download generated .ts file → Push to GitHub → Vercel deploys → Live in 2 min
```

## Files you can update via Excel

| What to update | Admin page | Downloads |
|---|---|---|
| University data (all 127 unis) | /admin/excel-import | lib/data.ts |
| Blog posts | /admin/blog-import | lib/blog.ts |
| Guides | /admin/guides-import | app/guides/page.tsx |

## Excel templates

Each admin page has a "Download Template" button that gives you the exact format.

## University data columns (University_Matrix)
- University, Program, Degree, Specialisation, Fees, NIRF, NAAC, Location
- Sem 1-4 Syllabus, Research, Capstone
- Edify Recommends Skills, Projects, Internships
- **Highlight** (new) — the badge shown on cards e.g. "NIRF #18 · NAAC A++ · UGC DEB"
- Right For, Not Ideal For, Key Differentiator

## Logos
Place logo files in /public/logos/ with naming: University_Name.svg
They auto-show on cards and comparison page.
