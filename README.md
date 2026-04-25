# EdifyEdu Claude Code Setup

This package makes **Claude Code** produce consistent, house-style-compliant university review blogs every time. No more Claude Code "drifting" between runs.

## What's In This Package

```
claude-code/
├── CLAUDE.md                                      ← Project-level system prompt
└── .claude/
    ├── commands/
    │   └── university-review.md                   ← Custom slash command
    ├── inputs/
    │   ├── _template.json                          ← Copy this for new blogs
    │   └── sikkim-manipal-university-online.json  ← Worked example
    └── templates/
        ├── blog-structure.md                       ← Canonical section order
        └── qa-checklist.md                         ← Hard-gate QA checks
```

## How to Install

### Step 1. Copy these files into your Next.js repo root

From your local project folder (`C:\Users\91706\Downloads\edify-v8-final\edify-next`):

```bash
# From the edify-next folder
cp /path/to/claude-code/CLAUDE.md ./CLAUDE.md
cp -r /path/to/claude-code/.claude ./.claude
```

Your repo root will now contain:

```
edify-next/
├── CLAUDE.md              ← Claude Code auto-reads this on every run
├── .claude/
│   ├── commands/
│   ├── inputs/
│   └── templates/
├── app/
├── public/
└── package.json
```

### Step 2. Drop the author avatars into `public/authors/`

From the `avatars/` folder this session produced:

```bash
mkdir -p public/authors
cp rishi-avatar-sm.svg    public/authors/
cp rishi-avatar-md.svg    public/authors/
cp rishi-author-card.svg  public/authors/
cp rishi-ring-badge-xl.svg public/authors/
cp rishi-avatar-*.jpg     public/authors/   # fallbacks
```

### Step 3. Commit

```bash
git add CLAUDE.md .claude/ public/authors/
git commit -m "feat: add Claude Code config and author avatar SVGs"
git push
```

## How to Use

### For a new university review blog

```bash
# 1. From the edify-next repo, copy the template
cp .claude/inputs/_template.json .claude/inputs/amity-university-online.json

# 2. Open it in your editor and fill in every field
code .claude/inputs/amity-university-online.json

# 3. Run the slash command in Claude Code
claude
> /university-review amity-university-online
```

Claude Code will:
1. Read `CLAUDE.md` (project rules)
2. Read `.claude/commands/university-review.md` (the command recipe)
3. Read `.claude/inputs/amity-university-online.json` (your inputs)
4. Read the templates (structure + QA)
5. Run research → draft → humanize → QA
6. Write 4 files to `content/blogs/amity-university-online/`
7. Report a short summary

You do not re-explain the house style. You do not re-paste the competitor blacklist. You do not paste in the CSS classes. Claude Code reads them from `CLAUDE.md` on every run.

### For rewriting an existing blog

Same flow. Just set `current_blog_url` in the input JSON to the live EdifyEdu URL. Claude Code fetches the existing content, identifies what to keep and what to improve, and writes the new version to files.

### For testing locally

Open the generated HTML in any browser:

```bash
# Windows
start content/blogs/amity-university-online/amity-university-online.html

# Mac/Linux
open content/blogs/amity-university-online/amity-university-online.html
```

### For uploading to CMS

The `.cms.xlsx` file is ready to paste into your Google Sheets CMS backend. Open it, copy the row, paste into the blogs sheet. Your existing sync API handles the rest.

## Why This Fixes the Inconsistency

Claude Code was drifting because you were re-prompting it every time with slightly different instructions. With this setup:

| Inconsistency Source | Before | After |
|---|---|---|
| House style rules | Re-typed in prompt each run | Loaded from `CLAUDE.md` automatically |
| Section order | Described loosely each run | Locked in `blog-structure.md` |
| Competitor blacklist | Sometimes forgotten | Enforced from `CLAUDE.md` |
| Fee format | Varied per run | Fixed table template in `blog-structure.md` |
| Output location | You had to specify | Fixed in `/university-review` command |
| QA checks | Sometimes skipped | Hard-gate required by command |

The same inputs now produce the same outputs. If the output drifts, it is because an input changed, not because Claude Code changed.

## Maintenance

### To update house style
Edit `CLAUDE.md`. The next `/university-review` run picks it up automatically.

### To add a new blacklisted competitor
Add to the "Competitor Blacklist" section in `CLAUDE.md`.

### To add a new slash command
Create a new file in `.claude/commands/`. Example: `.claude/commands/seo-blog.md` for general SEO blogs, `.claude/commands/humanize.md` for humanising existing text.

### To rotate unique angles
Track which angles have been used in which blogs. The `university-review` command can pick from the menu, but you can also force specific ones via `unique_angles_to_prioritise` in the input JSON.

## Directory Output Convention

Every blog produces exactly these 4 files:

```
content/blogs/{slug}/
├── {slug}.html        ← Standalone preview (open in browser)
├── {slug}.cms.xlsx    ← 11-column import file (paste into CMS)
├── {slug}.meta.json   ← Metadata snapshot (for automation)
└── {slug}.qa.md       ← QA checklist results (for audit)
```

If any of these 4 files is missing or the QA says FAIL, the command has failed. Fix and retry.

## Extending to Other Content Types

The same pattern works for:

- Guides (`/seo-blog` command, guides/ directory)
- LinkedIn carousels (`/carousel` command, linkedin/ directory)
- Email newsletters (`/newsletter` command, emails/ directory)

Just create the command file in `.claude/commands/` and reuse the `CLAUDE.md` house rules.
