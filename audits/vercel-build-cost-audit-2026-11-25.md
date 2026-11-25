# Vercel build-cost audit, 25 Nov 2026

Cycle so far: $11.51 of $20. Build CPU: $8.23 (71.5%). 13 days left.
Status: repo changes #2 and #3 shipped on branch chore/vercel-build-cost (25 Nov). #1 and #4 are Vercel settings and wait on Rishi.

## Bottom line

The main cause is not the app. **Three Vercel projects build every commit.** Only one of them serves edifyedu.in. The other two cost about two thirds of all Build CPU and serve nothing.

Turning off Git builds on the two duplicate projects cuts Build CPU by about 67% on its own. Add "production builds only" and a docs-only skip and the cut reaches about 75-80%. None of this touches a page that Google sees.

## Evidence

### 1. Three projects build the same repo (largest cost, ~67%)

`npx vercel project ls` on 25 Nov:

| Project | Serves | Last updated |
|---|---|---|
| `edify-edu-dh2m` | **edifyedu.in** (matches `.vercel/project.json`) | 14s ago |
| `edify-next` | edify-next-...vercel.app | 14s ago |
| `edify-edu` | edify-edu-...vercel.app | 14s ago |

All three updated within the same 14 seconds. `vercel ls edify-next` and `vercel ls edify-edu` show the same deploy pattern: same ages, same Production/Preview split, a build started 33-48s before the listing. Each duplicate shows 19 finished deploys in 11 days, each 1-2 minutes.

Same commit, three full builds. With equal build lengths, the two duplicates use 2/3 of Build CPU. That is about **$5.50 of the $8.23**.

A side risk: `vercel.json` defines a daily cron (`/api/cron/due-calls`, 08:00 IST). Cron runs on every project's production deploy. If `CRON_SECRET` and the Resend key were copied to the duplicates, the reminder email could go out up to three times a day.

### 2. Preview deployments on branch pushes (~37% of the live project's builds)

The duplicate lists show 7 Preview builds out of 19 in 11 days (37%). Previews come from pushing work branches (`feat/*`, `fix/*`, `seo/*`). 10 branches were pushed since 8 Nov. 42 remote branches exist.

Nobody uses the preview URLs. qa-checker runs a local `next build` before merge, and the live check runs against edifyedu.in after deploy. `vercel.json` has no `git.deploymentEnabled` rule, so every branch push builds on all three projects.

### 3. Docs-only deploys (small but pure waste)

Of 111 first-parent commits on `main` since 8 Nov, **12 touch only `audits/` or root `.md` files**. Example: `9f95f7a` (25 Nov) changed only `audits/FIX-LOG.md`. When a docs-only commit is the tip of a push, Vercel rebuilds all 2,338 pages to ship no change. There is no `ignoreCommand` in `vercel.json`.

I cannot tell from git alone how many of the 12 were push tips. Expect a few builds per cycle.

### 4. Push frequency on main

Commits per day on `main`: 24 (12 Nov), 39 (13 Nov), 28/27/28 (27-29 Oct). The batch-deploy rule from 27 Oct helped: Nov averages fewer pushes. Batching still matters because every push is now three builds, not one.

### 5. Static generation (not the main problem)

Last local build (`.next/prerender-manifest.json`, 18 Nov) prerendered **2,338 routes**: 1,787 under `/universities`, 279 `/blog`, 125 `/verify`, 42 `/compare`, 33 `/tools`, 25 `/coupons`.

Builds finish in 1-2 minutes, so generation is not wasteful per build. The fix is fewer builds, not fewer pages.

I do **not** recommend moving pages to on-demand ISR. `/blog/[slug]`, `/universities/[id]` and `/blog/page/[n]` use `dynamicParams = false` on purpose: it is the only way unknown slugs return a real 404 (see the soft-404 notes). Loosening it to save seconds risks soft-404s in GSC.

`/verify/[slug]` (125 pages) queries Supabase at build time with `revalidate = 3600`. This adds network wait to each build and hourly ISR work at runtime. It is minor and is a freshness choice, so I left it.

### 6. Google Sheets CMS requests during builds: none found

No file in `app/`, `lib/`, `components/`, `middleware.ts` or the 7 prebuild scripts references `sheets.googleapis`, `docs.google.com/spreadsheets` or a Sheets env var outside the ignored CMS folders. The only network call in `prebuild` is `scripts/build-verify-slugs.js`, which reads one Supabase table. **Sheets is not a build cost.**

### 7. Build cache

The 7 `prebuild` scripts write JSON with no timestamps, so outputs stay byte-identical when data does not change. They do not bust the webpack cache. Fonts are self-hosted since 3 Oct, so builds make no Google Fonts call. I found no cache-busting pattern in the repo.

Not verified: whether Vercel logs "Restored build cache" on each build. The CLI call to read build logs was blocked in this session.

### 8. Build machine type

Not verified. `vercel project inspect` does not print the machine type. Builds of 1-2 minutes fit the Standard machine. If Enhanced or Turbo is on for any project, it multiplies the per-minute rate with no benefit at this build length.

## Recommendations, ranked

| # | Change | Est. Build CPU cut | SEO / site risk | Who | Undo |
|---|---|---|---|---|---|
| 1 | Disconnect Git (or delete) `edify-next` and `edify-edu` | **~67%** | None. Neither serves edifyedu.in | Rishi, Vercel dashboard | Reconnect Git |
| 2 | Build `main` only: `"git": {"deploymentEnabled": {"**": false, "main": true}}` in `vercel.json` | ~37% of what is left | None. Previews are not indexed or used | Code, 1 commit | `git revert` |
| 3 | Skip docs-only pushes with an `ignoreCommand` that compares `$VERCEL_GIT_PREVIOUS_SHA..HEAD` and skips only when every changed file is under `audits/`, `docs/`, `reports/`, `.claude/` or a root-level `.md` | ~5-10% | None if the path list stays narrow. Never skip on a global `*.md`: `content/blogs/*` holds `.md` files | Code, 1 commit | `git revert` |
| 4 | Confirm the build machine is Standard on `edify-edu-dh2m` | 0% or large | None | Rishi, dashboard | Toggle back |
| 5 | Keep batching: one push per finished batch, as the plan says | Ongoing | None | Process | n/a |

**Combined estimate:** #1 alone takes Build CPU from ~$8.23 to ~$2.75 per comparable period. #2 and #3 take it to roughly $1.5-1.8. That is a **75-80% cut**, above the 50-70% target.

Not recommended: ISR on hub, blog or university pages, `dynamicParams` changes, or removing prebuild guards. Each saves seconds and risks soft-404s, stale fees or broken sitemap gates.

## Why I stopped before changing anything

- #1 and #4 are Vercel settings. CLAUDE.md rule 4(d) says Vercel changes go to Rishi.
- #2 and #3 are repo changes and revertible, but they change how every future deploy behaves. You asked for the report first.

## Gaps in this audit

- I could not list the live project's own deploys or read build logs. The CLI calls were blocked in this session. The duplicate projects' lists stand in for it, since all three build the same commits.
- The dollar split per project is an estimate from equal build lengths. Vercel → Usage → filter by project gives the exact split.
- I could not see the cycle start date. 19 deploys in 11 days per project is the observed rate.
