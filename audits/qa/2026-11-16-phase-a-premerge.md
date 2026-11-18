# QA pre-merge: Phase A trust batch (fix/phase-a-trust @ 9e1dde4)

Checked 2026-11-16 by qa-checker, as an outsider. Base: `chore/agent-team` (d035bce = merge-base). Working tree left as found (`git status` shows only the four pre-existing untracked/modified audit paths).

## Verdict: FAIL (2 content findings, 1 check not run)

| # | Check | Result |
|---|---|---|
| 1 | Diff scope and diff review | PASS on scope; FINDING on A2 sameAs (see F2) |
| 2 | No new fact without a source | FAIL (F1: new llms.txt sentence overclaims) |
| 3 | `npm run build` exit 0 | NOT RUN (see below) |
| 4 | All pre-commit gates | PASS |
| 5 | C3 gate proof | PASS |
| 6 | Built-output checks | PASS (against the existing .next, see caveat) |
| 7 | CSP syntax and client fetch targets | PASS |

## Findings

**F1 (check 2, FAIL). The new llms.txt sentence adds a claim the site does not support.**
`public/llms.txt` line 3 and `scripts/build-llms-txt.mjs:140` now say: "Fees and approvals are checked against university portals and the UGC-DEB register; each page shows when it was last updated."
- "each page shows when it was last updated": in the built static HTML (scripts stripped), only 3 of 143 university profiles show a visible Updated/Reviewed/Verified date. Examples with none: `ignou-online`, `alliance-university-online`, `alagappa-university-online`, `adichunchanagiri-university-online`. `compare.html` shows none either.
- "Fees ... are checked against university portals": the gate output says `check-official-urls: OK (143 universities, 23 with a confirmed portal, 23 with a fee verified against it)`. 23 of 143 does not support an unqualified "fees are checked".
The old sentence was a bigger overclaim, but this one is still a claim without a source. Suggested fix: drop "each page shows when it was last updated" and scope the fee part, e.g. "Fees are checked against the university portal where a page says so". The `--check` gate requires the script and the public file to change together.

**F2 (check 1, finding). sameAs now asserts identity between distinct universities.**
`sameAs` means "this entity is the same as the thing at this URL". From `lib/data.ts`:
- `manipal-university-jaipur-online` (line 1499), `sikkim-manipal-university-online` (1756) and `manipal-academy-higher-education-online` (2481) all have `officialUrl: 'https://www.onlinemanipal.com'`. Three different universities now each claim `sameAs` the same URL. That invites the same entity merge A2 set out to stop (audit S2), between three universities instead of between Edify and one.
- `ignou-online` (9232) has `officialUrl: 'https://ignouiop.samarth.edu.in'`. That is an admissions portal, not IGNOU's identity URL.
Values do come from existing `officialUrl`, so no fact was invented. But `officialUrl` is a "where to verify fees" field, not an identity field. Suggested fix: omit `sameAs` where an `officialUrl` is shared by more than one record, and for the IGNOU admissions portal. Rishi or the engineer should decide. Not a build or gate failure.

## Check 3: build NOT RUN

The `next start -p 3107` (PID 24876) serves this repo's own `.next` directory. Running `npm run build` in place would rewrite `.next` under that server, which the brief said not to touch. I tried an isolated build in a detached git worktree in the scratchpad, but that action was denied by the permission system, and I did not work around it.

What exists instead:
- `.next/BUILD_ID` = `766kxYDZTZiOC5FYGHan0`, written 2026-11-16 18:16:29 +0530. Commit 9e1dde4 is 18:18:26 +0530, two minutes later.
- Every built artefact checked in step 6 reflects every item in the batch: robots, not-found, admin-login, schema, sameAs and CSP in routes-manifest. So `.next` is consistent with 9e1dde4, but that does not prove a clean build of the commit exits 0.
- `npx tsc --noEmit -p tsconfig.scripts.json` passed inside the gates. That covers scripts/ only, not app/.
To close this, stop 3107 (or use a separate checkout) and run `npm run build`.

## Check 1: diff scope (PASS)

`git diff --stat chore/agent-team..fix/phase-a-trust`:
```
 .husky/pre-commit               |   8 +++
 app/admin-login/layout.tsx      |  12 ++++
 app/not-found.tsx               |  10 +++
 app/robots.ts                   |  23 ++++---
 app/universities/[id]/page.tsx  |  31 ++-------
 audits/FIX-LOG.md               |  16 +++++
 components/BlogCTACard.tsx      |   2 +-
 next.config.js                  |   4 +-
 public/llms.txt                 |   2 +-
 scripts/build-llms-txt.mjs      |   2 +-
 scripts/check-schema-claims.mjs | 147 ++++++++++++++++++++++++++++++++++++++++
 11 files changed, 214 insertions(+), 43 deletions(-)
```
These are exactly the 11 expected files. `lib/` is unchanged (`git diff --quiet ... -- lib`).

Diff review:
- robots.ts: `ADMIN_BLOCKED` and `API_BLOCKED` are deleted, and all 9 groups use `BLOCKED`. `BLOCKED` itself is unchanged, so no disallow was dropped.
- page.tsx: the Review block, `NAAC_SCORE_MAP`, `naacRatingValue` and `telephone` are removed. `sameAs` is spread in only when `u.officialUrl` is truthy.
- not-found.tsx: `robots: null` and `alternates.canonical: null`.
- admin-login/layout.tsx: a server layout with `robots: { index: false, follow: false }`. It returns children unchanged.
- next.config.js: web3forms is removed from script-src and connect-src, and anthropic and github are removed from connect-src. Nothing else changed.
- BlogCTACard: a one-word spelling change.
- FIX-LOG has a WHY for every item.

## Check 2: no new fact (FAIL, see F1)

No fee, grade or rank was added anywhere in the diff. sameAs values are the 23 existing `officialUrl` entries in `lib/data.ts` (`grep -c "officialUrl:" lib/data.ts` = 23; built pages: 23 university nodes carry sameAs). F1 is the only new unsourced statement. F2 concerns meaning, not provenance.

## Check 4: gates (PASS)

`sh .husky/pre-commit` exit 0. Tail of the output:
```
pre-commit: check-schema-claims
check-schema-claims: OK (258 files scanned, no NAAC review/rating, no telephone on a university node).
...
check-official-urls: OK (143 universities, 23 with a confirmed portal, 23 with a fee verified against it).
pre-commit: typecheck:scripts
pre-commit: all checks passed
```
`git status` was unchanged afterwards.

## Check 5: C3 gate proof (PASS)

```
node scripts/check-schema-claims.mjs                      -> OK ... exit 0
git show 9e1dde4~1:"app/universities/[id]/page.tsx" > "app/universities/[id]/page.tsx"
node scripts/check-schema-claims.mjs                      -> 5 finding(s), exit 1
  page.tsx:146 "ratingValue" near a NAAC reference
  page.tsx:173 "'@type': 'Review'" near a NAAC reference
  page.tsx:179 "reviewRating" near a NAAC reference
  page.tsx:181 "ratingValue" near a NAAC reference
  page.tsx:156 telephone inside a CollegeOrUniversity/EducationalOrganization schema node
git checkout -- "app/universities/[id]/page.tsx"
node scripts/check-schema-claims.mjs                      -> OK, exit 0
git status --short -- "app/universities/[id]/page.tsx"    -> (empty)
```
The audit file the gate points to (`audits/seo-aeo-geo-audit-2026-11-16.md`) exists.

## Check 6: built output (PASS, against the existing .next)

- `grep -l ratingValue .next/server/app/universities/*.html` gives 0 of 143. `"@type":"Review"` also gives 0 of 143.
- JSON-LD parsed from all 143 profiles: 823 CollegeOrUniversity/EducationalOrganization nodes, 0 with telephone, 23 with sameAs, 0 Review nodes, 0 parse errors. Every `telephone` key sits on a `ContactPoint` (Edify's own Organization).
- `nmims-online.html` university node: `{"@id":"https://edifyedu.in/universities/nmims-online#university","sameAs":["https://online.nmims.edu"]}`, with no telephone.
- `university-of-calicut-online.html`: "Grade ." count 0.
- `_not-found.html`: exactly one robots meta, `<meta name="robots" content="noindex"/>`, and a `rel="canonical"` count of 0.
- `admin-login.html`: `<meta name="robots" content="noindex, nofollow"/>`. Minor and out of scope: it still inherits `<link rel="canonical" href="https://edifyedu.in"/>` from the root layout. That is harmless with noindex but contradictory.
- `robots.txt.body`: 9 groups (*, Googlebot, Googlebot-Image, Bingbot, GPTBot, ClaudeBot, PerplexityBot, CCBot, FacebookBot), and all 9 have the identical 8 Disallow lines: /admin/ /api/ /blog/write /blog/new /admin/excel-import/ /university-data/ /compare? /dashboard/.
- FIX-LOG says `public/robots.txt` (tracked, older and shorter) shadows the route only locally. Confirmed: live `https://edifyedu.in/robots.txt?cb=qa1116` serves the app/robots.ts format (`User-Agent: *` ... with the pre-merge Googlebot list), `x-matched-path: /robots.txt`. Still, the stale tracked file is a trap worth deleting in a later batch.
- `public/llms.txt`: "independently verified" count 0 (but see F1).
- `components/BlogCTACard.tsx:72`: `edifyedu.in earns zero commissions. Independent advice only.`
- No regression from the not-found change. `universities/nmims-online/mba.html` has `index, follow` and canonical `https://edifyedu.in/universities/nmims-online/mba`; `universities/nmims-online.html` has `index, follow` and canonical `https://edifyedu.in/universities/nmims-online`.

## Check 7: CSP (PASS)

I evaluated `next.config.js` `headers()` under NODE_ENV=production: one distinct CSP value with 8 directives (default-src, script-src, style-src, font-src, img-src, connect-src, frame-src, frame-ancestors), joined by `; `. Every source token matches a keyword, scheme or host pattern, and there are 0 malformed tokens. There is one doubled space in script-src, from the empty production `'unsafe-eval'` slot. That predates this batch, is also live today, and is harmless because sources are whitespace-separated. The built `.next/routes-manifest.json` connect-src matches, with 0 occurrences of web3forms, api.anthropic or api.github.

Client fetch targets:
- Every client-side fetch in components/, lib/ and app/ is same-origin: `/api/enquiry` (lib/submitEnquiry.ts, the only lead path), `/api/events`, `/api/helpdesk`, `/api/verify/log`, `/api/reviews`, `/api/log-error`, `/api/pexels` and `/api/admin-auth`.
- Absolute-URL fetches exist only server-side: `app/api/generate-blog` (anthropic), `app/api/publish-to-github` and `app/api/cms/sync` (github), `lib/indexnow.ts` and `lib/pexels.ts`. CSP does not govern these.
- There are no references to web3forms, api.anthropic or api.github in public/, components/, lib/ or non-api app/, and none in `.next/static`. No live form posts to a removed host.
