# QA: WhatsApp Phase 2 (inbox), pre-merge RE-CHECK

- Date: 2026-11-27
- Branch: feat/wa-2-inbox, worktree edify-wa-plan. HEAD a295cf0 plus UNCOMMITTED fixes (17 modified files, 5 new: lib/whatsapp/opt-out.ts, app/leads/PrivateAreaGuard.tsx, scripts/whatsapp/cap-race.mjs, docs/whatsapp-inbox.md, audits/verify/meta-whatsapp-inr-rates-2026-11-26.md)
- Previous report: audits/qa/2026-11-27-whatsapp-phase2-premerge.md (PASS WITH FIXES, S1-S3, N1-N11)
- Reviewer: qa-checker (independent; did not write this code). Read-only review plus local tests. No build, no dev server, no Meta call, no production DB.

## Verdict: PASS WITH FIXES

There are no blockers. The three earlier findings (S1-S3) are fixed in code and tested. Opt-outs now block sends in the database under a lock. Call now needs a recorded Yes. The Rs 500 cap held in a real-Postgres race that I reran myself: 3 of 20 reserved. Third-party tags are skipped on /leads and /admin-login.

Two should-fix items remain before deploy. Both are small:
- **R1:** the CRM call path ignores WhatsApp consent, but the policy now says calls stop.
- **R2:** a new duplicate-send path, introduced by the S3 fix.

R3 is a hazard in the race script. Fix it before anyone runs the script from the repo root.

## Tests (all pass, 93 total)

| Suite | Result |
|---|---|
| `npx tsx lib/whatsapp/graph-spend.test.mts` | 21 passed |
| `npx tsx lib/whatsapp/inbox-service.test.mts` | 17 passed |
| `npx tsx lib/whatsapp/ingest.test.mts` | 14 passed |
| `PGLITE_MODULE=... npx tsx lib/whatsapp/sql.test.mts` | 41 passed (41 `ok` lines counted) |
| `npx tsc --noEmit -p .`, filtered to whatsapp, app/leads, app/layout, privacy-policy, admin-login, middleware | 0 errors |
| Real-Postgres race, rerun by me (`scratchpad/pgreal`, `node race.mjs <worktree>`) | `locked : {"ok":3,"capped":17,"rows":3}`, `unlocked : {"ok":20,"capped":0,"rows":20}`, PASS |

The scratchpad `race.mjs` is identical to `scripts/whatsapp/cap-race.mjs` except for the 3-line header comment (checked with `diff`).

I also ran the four inline tag scripts from `app/layout.tsx` in a Node `vm` sandbox with a fake `document`:

| Path | Scripts injected | clarity / fbq / gtag / Tawk_API / dataLayer |
|---|---|---|
| `/`, `/blog/x` | 4 | function / function / function / object / 3 entries |
| `/leads`, `/leads/whatsapp`, `/admin-login` | 0 | all undefined |
| `/leadsx`, `/admin-loginx` (near-miss controls) | 4 | all defined |

All four scripts parse and run, and the near-miss controls show that the guard does not over-match.

## The 10 owner conditions

### 1. QA blockers S1-S3 resolved: PASS
- **S1 (retention).** `wa_apply_retention()` (`supabase/migrations/20261202120000_whatsapp_inbox.sql:368-417`):
  - It deletes messages, notes, statuses, identity history, audit rows and hash-only webhook events older than 24 months.
  - It deletes contacts inactive for 24 months; their conversations, consent and history cascade (Phase 1 FKs are `on delete cascade`, core.sql:36,48,65; wa_notes and wa_consent cascade at inbox.sql:21,33).
  - It clears old previews, records `last_retention`, and runs at most once every 20 hours.
  - The sweep calls it in `app/api/cron/whatsapp-sweep/route.ts:75-76` via `store.ts:83-87`.
  - Raw bodies are still nulled at 30 days by Phase 1 `wa_purge_raw_bodies` (core.sql:524-532), on every sweep (`route.ts:71`).
  - Q-WA2 is recorded as approved in QUESTIONS-FOR-RISHI.
  - Code deletes messages 24 months after they are *written*. That is earlier than the policy's "24 months after your last message", so the code is stricter than the promise. Fine.
  - SQL test "retention deletes 24-month-old data and inactive contacts, keeps recent data, runs once a day" passes.
- **S2 (privacy vs calls and STOP).** Policy 3(d) (`app/privacy-policy/page.tsx:83`) now says STOP, UNSUBSCRIBE or "band karo" is recorded automatically, and other wording is recorded by a person:
  - The sweep's `wa_record_opt_outs` writes service **and** counselling_call No (inbox.sql:334-359).
  - A manual service No also writes a call No (`inbox-service.ts:200-206`).
  - Call now is a hard block (see condition 3).
  - Inside the inbox, the code keeps the policy. Outside it, it does not (R1).
- **S3 (stale client_ref).**
  - A blocked reservation writes nothing: every `blocked` branch in `wa_reserve_outbound` returns before the insert (inbox.sql:192-258).
  - The client keys by exact `conv + kind + trimmed text` (`InboxClient.tsx:322-326,346`). It clears the key after any server answer (`:350`) and keeps it only on a thrown network error (`:357-359`).
  - A reused key from another conversation returns `bad_ref` (inbox.sql:193-195), which also closes N6.
  - This fix opens a narrow new path, R2.

### 2. STOP and recorded opt-outs prevent outbound: PASS
- `wa_is_opt_out` (inbox.sql:148-151) is the same regex as `STOP_WORDS` (`lib/whatsapp/opt-out.ts:4`). The SQL test feeds `OPT_OUT_SAMPLES` to both (`sql.test.mts:521`).
- `wa_contact_opted_out` (inbox.sql:156-170) is true when either:
  - the latest service consent is No; or
  - a STOP text arrived after it, so sending is blocked before the sweep runs. The test "a STOP message blocks the next reply at once" passes.
- `wa_reserve_outbound` checks it under the lock (inbox.sql:211-213). The service layer checks it early (`inbox-service.ts:118-120`), and the mock does the same (`inbox-mock.ts:163-165`).
- **Every send path is covered.** `sendMessage` has one caller (`inbox-service.ts:146`), and it comes after `reserveOutbound` (`:135`). `request_phone` goes through the same `sendReply` (`:102,123-125`), so STOP blocks it too.
- **Server-side scope.** The cron only records consent and never sends. No path skips the check.

### 3. Call permission before Call now: PASS (inbox). See R1 for outside the inbox
- `canCall` = latest counselling_call is Yes, and there is no opt-out hint and no service No (`inbox-service.ts:90`).
- When `callBlock` is set, the UI renders a disabled `<button>` with no `tel:` href (`InboxClient.tsx:424-446`). There is no override and no confirm dialog.
- **Ways to call without permission from inside the inbox:**
  - (a) **Copy number** always works (`:444`). This is deliberate and documented in docs/whatsapp-inbox.md.
  - (b) **Open the CRM** / the linked lead. `LeadsClient.tsx:714` renders `tel:+${wa}` gated only on stage (`:636`), with no WhatsApp consent check. This includes leads created from a WhatsApp contact by `createLeadFromContact`. See R1.

### 4. Rs 500 cap safe under concurrency: PASS
- `pg_advisory_xact_lock(hashtext('wa_reserve_outbound'))` is the first statement (inbox.sql:188), before any read. The SQL test asserts this ordering, and the reserve and insert happen in the same transaction (`:260-263`).
- I reran the real-Postgres race: 3/20 reserved with the lock and 20/20 without it, so the detector catches an overspend.
- **Arithmetic vs `summariseSpend` (`lib/whatsapp/spend.ts:104-133`).** These match:
  - sent = delivered + in-flight;
  - paid when the free tier is null, or sent+1 > free, or meta_billable > 0;
  - paid_before = max(sent - free, or sent if free is null; meta_billable; 0);
  - charges rounded to 4 dp, plus the rate, compared with cap + extra + 1e-9;
  - rate missing gives rate_missing, cap missing gives cap_missing;
  - the override applies only when month_start is the same instant.
- **Differences found (all nits, none can overspend):**
  - (a) SQL clamps `extra_inr` above 1e7 down to 1e7, while TS treats it as no override. The UI limits it to 1e5, so this is unreachable.
  - (b) SQL does not require the override's `by`/`at`. `overrideCap` always writes them, so this is unreachable from the UI.
  - (c) TS accepts numeric *strings* for rate, cap and free. SQL accepts JSON numbers only, so SQL fails closed: the UI may say "allowed" while the server blocks. `updateBilling` writes numbers.
  - (d) TS rounds the budget (cap + extra) to 4 dp and SQL does not. The difference is below 0.0001 rupee.

### 5. Existing CRM auth and lead functionality unaffected: PASS
- `git diff origin/main...HEAD` and the working tree show no change to `middleware.ts`, `app/admin-login`, `app/api/enquiry`, `lib/supabase`, `lib/submitEnquiry.ts`, `next.config.js` or `vercel.json`.
- Outside whatsapp, app/leads changes only:
  - one "WhatsApp inbox" nav link (`LeadsClient.tsx:451`, committed);
  - the `app/leads/layout.tsx` wrapper, which keeps `className="leads-scope"` and adds `data-clarity-mask` plus `<PrivateAreaGuard/>` (uncommitted).

### 6. Third-party tags cannot collect inbox content: PASS
- `IS_PRIVATE_PATH` (`app/layout.tsx:228-229`) wraps Clarity, Meta Pixel, GA/Ads and Tawk (`:255-261`).
- gtag.js is now injected inside the guard, and `window.gtag` is defined only on public pages (sandbox run above).
- `MetaPixel.tsx` and `MetaPixelEvents.tsx` are not imported anywhere. No other `next/script` or tag loader exists.
- Callers handle undefined globals:
  - `BottomNav.tsx:32`, `lib/analytics.ts:20` and `lib/submitEnquiry.ts:39,42` use `typeof === 'function'`;
  - `LeadPrompt.tsx:205-240` uses optional chaining inside try;
  - `PrivateAreaGuard.tsx:16-17` uses optional chaining inside try.
- **No in-app route from a public page into /leads.** No public page links to `/leads` or `/admin-login`. `/admin-login` is itself private and `router.push`es to `/leads`. The guard is therefore a true second line of defence.
- Nit: if a client-side navigation from a public page into /leads ever happened, Pixel and GA would keep running. The guard stops only Clarity and Tawk.
- Nit: the GA snippet declares a global `var g` on public pages.

### 7. Migration SQL, run instructions and rollback exact: PASS
- **Seeded keys.** Phase 1 seeds 3 keys (core.sql:117-121) and Phase 2 seeds 7 (inbox.sql:68-85), for 10 in total. These are exactly the 10 listed in the header (inbox.sql:9-11), in docs/whatsapp-inbox.md step 3, and in the SQL test assertion (`sql.test.mts:387`).
- **Nothing else writes wa_settings.** On origin/main, no code writes to wa_settings: `recordSweep` exists only on this branch. So "exactly 10" holds in production.
- **Down file.** It drops all 10 new functions with exact signatures, both new indexes, the 3 new tables (their indexes go with them) and all 7 new keys, including `last_retention`. The test "down migration removes everything it added and nothing else" passes.
- **Doc check.** The optional pg_proc check (11 = 10 + `wa_purge_raw_bodies`) is correct.
- **Rollback order** (code revert first, down migration only after it is live) is correct.
- Nit: the doc's race-script command does not work as written (R3).

### 8. Compatible with the LIVE Phase 1 webhook: PASS
- **No Phase 1 object is created or replaced.** I compared every `create or replace function` and index name in core.sql with inbox.sql: no name collides. Phase 1 files and `lib/whatsapp/ingest.ts` are unchanged against origin/main.
- **Before the migration runs (Phase 2 code deployed):**
  - the webhook is untouched;
  - `recordOptOuts` and `applyRetention` get a PostgREST error and return null without throwing (`store.ts:77-87`), so the sweep still runs its Phase 1 work;
  - the inbox shows the migration banner, and `sending_enabled` is false.
- **After the migration runs, with main still deployed:**
  - main never calls the new functions;
  - the only side effects are two extra indexes and 7 settings rows.
- The non-concurrent index build briefly blocks writes. This is documented.

### 9. Retry cron executing: NOT CHECKABLE LOCALLY (code: PASS)
- `recordSweep` writes `last_sweep` on success (`route.ts:86`) and on failure (`:79`). `wa_apply_retention` writes `last_retention` (inbox.sql:414-415).
- **Phase 1 retries run first** (`route.ts:57-72`). The Phase 2 steps run after them and return null on an RPC error (`store.ts:77-87`). A thrown network error still lands in the existing catch only after the retries are done.
- The cron runs every 5 minutes (`vercel.json:16`). Whether it actually executes needs Vercel logs or the inbox Health card after deploy.

### 10. Connection check read-only: PASS on code (NOT CHECKABLE LOCALLY for real values)
- **GET only.** `checkConnection` makes only GET calls: `debug_token` (`graph.ts:167`), the phone number (`:208`), the WABA (`:232`) and the WABA's phone_numbers (`:242`). The only POST is `sendMessage` (`:102`).
- **No secret leaves the module.** The report holds states, token type, expiry, scopes, display number, WABA name, currency and timezone id. No token or secret is returned, and `graph.ts` has no `console.*`. The audit row stores `vars` and the problem count only (`inbox-service.ts:362`).

## Also confirmed
- **No automated replies or bulk campaigns.** `sendMessage` has one caller and is reached only from the Send and Ask-for-phone buttons. There is no timer or cron that sends. The sweep writes consent rows only.
- **House style.** There are no em dashes or banned words in the inbox UI, the guard, the service strings, the privacy policy or the runbook (grep returned nothing).
- **Privacy policy section 3 vs code:**
  - (a) and (b) are kept.
  - (c) and (d) are kept inside the inbox but not in the CRM (R1).
  - (e) is kept (code is stricter).
  - (f) now promises the enquiry record is deleted on request. The runbook says this is a manual Supabase delete.
  - (g) now names Cloudflare.
- **Earlier nits:**
  - Fixed: N1 (`inboxMode` removed), N2 (display-side `safeErrorTitle` in `inbox-repo.ts:184-185`; the regex now covers `.` and `()`), N3, N4 (wording), N6, N8 (v4 UUID fallback), N10 (`coalesce(last_message_at, created_at)`), N11 (verify row added).
  - Still open, as accepted earlier: N5 (send rate limit), N7 (double reads), N9 (tints).

## Findings

### R1. should-fix before deploy: the CRM still calls students who opted out on WhatsApp, or who never gave call permission
- **Where:**
  - `app/privacy-policy/page.tsx:78` ("We call you only if you ask us to") and `:83` ("we record it automatically and stop messaging and calling you");
  - `app/leads/LeadsClient.tsx:636,714` (the `tel:` link is gated only on stage);
  - `inbox-service.ts:237-266` (`createLeadFromContact` puts WhatsApp contacts into the CRM).
- **Failure scenario.** A student shares their number on WhatsApp, and the counsellor presses Create lead. The lead appears in /leads with a working Call button and enters the due-calls flow, although nobody recorded a counselling-call Yes. Or a linked student replies STOP: the sweep records No for calls, but /leads cannot see wa_consent and still offers Call.
- **Fix (either):**
  - (a) show the WhatsApp call-consent state on the CRM lead card and disable `tel:` when the linked contact has a call No or an opt-out (a small read of `wa_consent` by `lead_id`); or
  - (b) narrow the policy wording to what the code does, for example: "the WhatsApp inbox blocks messages and calls; our counsellors check this before calling".
- This was offered as a follow-up last round. It moves up because the policy text now says calls stop "automatically".

### R2. should-fix: a server error after Meta accepts a message makes the next Send a duplicate
- **Where:**
  - `InboxClient.tsx:350` (`ref.current = null` on every server answer, including errors);
  - `inbox-service.ts:146-147` (`finishOutbound` runs after Meta accepted);
  - `inbox-repo.ts:276` (`fail()` throws);
  - `actions.ts:55-63` (`run()` turns the throw into `{ok:false, error:'Something went wrong (code). Try again.'}`).
- **Failure scenario.** Meta accepts the reply, then the `wa_finish_outbound` RPC fails (a transient Supabase error). The client gets `ok:false`, drops the key and keeps the text. The toast says "Try again". The counsellor presses Send, a fresh key passes the reservation, and the student receives the same message twice. Before this round, the key was kept on `!ok`, so the retry returned the first row.
- **Fix:**
  - wrap `finishOutbound` (and anything after `sendMessage`) in `sendReply` in try/catch, and return `{ok:true, state:'unknown', error:'Sent to Meta but not recorded. Check the thread before sending again.'}`; or
  - on the client, drop the key only when `r.ok` or `'blocked' in r`.
- Add a test with a repo whose `finishOutbound` throws.

### R3. should-fix (tooling hazard): `scripts/whatsapp/cap-race.mjs` deletes `./data` in the current directory
- **Where:** `scripts/whatsapp/cap-race.mjs:16-17`: `rmSync(join(process.cwd(), 'data'), { recursive: true, force: true })`.
- **Failure scenario.** Someone runs the script from the repo root, the natural place since it lives in the repo. It wipes the repo's `data/` folder. That folder holds 28 tracked files (recoverable from git) and untracked ones such as `data/Skills` (not recoverable).
- **A second problem pushes people towards that mistake.** The documented command `node <repo>/scripts/whatsapp/cap-race.mjs <repo>` (docs/whatsapp-inbox.md, last line) cannot resolve `embedded-postgres` or `pg`. ESM resolves bare imports from the script's own folder, and the repo has neither package. The author ran a *copy* placed in the scratch folder.
- **Fix:** use a dedicated temp folder (`mkdtempSync(join(os.tmpdir(), 'wa-race-'))`), and change the doc to "copy the script into that folder, then run it".

### Nits
- Opt-out recorded but the student later asks for a call: the counsellor must record service Yes as well as counselling_call Yes, because `canCall` also requires no service No. The UI copy says "The student opted out, so calls are blocked too", which is enough of a hint.
- The cap arithmetic differences (a)-(d) under condition 4 are unreachable from the UI and none of them can overspend.
- `safeErrorTitle` now also redacts dates such as `2026-11-27` in Meta error titles. This is cosmetic.

## Before deploy (unchanged from the plan)
- Fix R1-R3, or log R1 as a decision in the fix log with the reworded policy.
- Commit the working-tree changes. They are uncommitted now, and this review covers the working tree as of 27 Nov.
- Rishi runs the migration and pastes the `select key from wa_settings order by key` result, which should show exactly 10 rows.
- `sending_enabled` stays false until the connection check passes.
- After deploy, the inbox Health card must show a sweep within 5 minutes (condition 9).

## Addendum (27 Nov 2026): R1-R3 re-check, working tree still uncommitted

### Verdict: PASS WITH FIXES
R1, R2 and R3 are fixed. No blocker remains. One small should-fix is left (R4). Two doc nits are left.

### Tests
- `graph-spend`: 21 passed.
- `inbox-service`: 18 passed, including "QA R2: recording fails after Meta accepted...".
- `ingest`: 14 passed.
- `sql`: 42 passed, including "QA R1: CRM blocks calls and messages...".
- Filtered `tsc`: 0 errors.
- I reran the race myself using a copy of the new `cap-race.mjs`: locked 3/20, unlocked 20/20, PASS. The listing of the run folder was identical before and after the run.

### R1: FIXED
- **SQL** (`wa_crm_contact_blocks`, inbox.sql:428-457). Each case checked against the code and the test (`sql.test.mts` R1 block):

| Case | Result |
|---|---|
| Enquiry lead, unlinked | No block |
| Enquiry lead, linked, no record | No block |
| `source='whatsapp'` with no call Yes | noCall |
| Call No, even on an enquiry lead | noCall |
| Opt-out by STOP text or by a recorded service No | noCall and noMessage (via `wa_contact_opted_out`) |
| WhatsApp lead that was unlinked | noCall (union branch) |

- Several contacts on one lead combine with `bool_or`, which is conservative.
- **Privileges.** The function is granted to service_role only, and the test asserts that anon is rejected. `.down.sql:7` drops it.
- **Runbook.** The runbook says 11 functions, and the pg_proc check expects 12.
- **page.tsx cannot break the CRM** (`app/leads/page.tsx:43-55`):
  - supabase-js returns `error` instead of throwing, so any error leaves `contactBlocks` empty;
  - the try/catch covers anything else;
  - the cost is one extra RPC after the leads query. It has no timeout, but neither do the existing queries.
- **UI** (`LeadsClient.tsx:640-643,721-734`):
  - `canCall` now also requires `!noCall`, so the `tel:` href is removed;
  - the WhatsApp button is disabled for noMessage, and `.wa-box` cannot get `show`, so the `wa.me` link stays hidden (leads.css:210-212);
  - a red note explains the block.
- **No other CRM behaviour changed.** The diff is limited to the optional `contactBlocks` prop with an `{}` default and the lines above. Keyboard shortcuts set outcomes only and never dial.
- **Privacy policy.** 3(c) and 3(d) now hold in both the inbox and the CRM detail pane.

### R2: FIXED
- `inbox-service.ts:151-160`: after Meta answers, failures in `finishOutbound` and `audit` return `ok:true`, with state `unknown` (or `failed`), and never throw.
- `InboxClient.tsx:351` drops the key only on `r.ok || 'blocked' in r`. Other errors keep it, so a retry returns the same row.
- A changed text still gets a new key through `keyFor`.
- The test proves Meta is called once and the retry comes back as a duplicate.

### R3: FIXED
- `cap-race.mjs` now uses `mkdtempSync(join(tmpdir(), 'wa-cap-race-'))`. It has no `rmSync` and no `cwd`.
- The header and `docs/whatsapp-inbox.md:125` say to copy the script into an empty folder outside the repo.

### Remaining
- **R4 (should-fix, small).** The daily due-calls email (`app/api/cron/due-calls/route.ts:54-60`) still lists active leads with their phone numbers and ignores `wa_crm_contact_blocks`:
  - it includes "fresh, no calls" leads, which covers new leads created from WhatsApp;
  - it also includes linked leads that sent STOP.

  This nudges someone to call a student the policy says we will not call. Fix: drop or tag blocked leads in that email, using the same best-effort RPC. If not fixed now, log it as a tracked follow-up.
- **Doc nit.** `docs/whatsapp-inbox.md:15` still says "41 SQL tests". It is now 42.
- **Unchanged.** Commit the working tree before merge. The migration paste must show exactly 10 settings keys.
