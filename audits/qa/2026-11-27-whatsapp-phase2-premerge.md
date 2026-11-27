# QA: WhatsApp Phase 2 (internal inbox), pre-merge

- Date: 2026-11-27
- Branch: feat/wa-2-inbox, worktree edify-wa-plan
- Diff reviewed: 9522c13..HEAD (2eb8ed8, a295cf0), 23 files, +3460/-22
- Reviewer: qa-checker (independent; did not write this code)
- Scope: read-only review plus local tests. No build, no push, no Meta API call, no production DB.

## Verdict: PASS WITH FIXES

The security core is sound. Every action is authenticated, owner-only actions are gated, no secrets leak, nothing sends without a person pressing a button, and the window, opt-out and cap checks all run on the server. The SQL is locked down. Three should-fix items stop this being a clean PASS. Two are privacy-policy promises the code does not keep (S1, S2). The third is a client idempotency-key bug that can silently swallow a reply (S3). Fix all three before merge. The nits can wait.

## Tests (all pass, 84 total)

| Suite | Result |
|---|---|
| `npx tsx lib/whatsapp/graph-spend.test.mts` | 21 passed |
| `npx tsx lib/whatsapp/inbox-service.test.mts` | 15 passed |
| `npx tsx lib/whatsapp/ingest.test.mts` | 14 passed |
| `PGLITE_MODULE=... npx tsx lib/whatsapp/sql.test.mts` | 34 passed (includes down migration, grants/RLS, LIKE escape, client_ref idempotency, usage counts, delete cascade) |

I did not run `npm run build`, as instructed. The caller reports that it passed. PGlite has a single connection, so I checked cap behaviour under concurrent sends by reading the code, not by running it (see B4 in the plan).

## Diff scope

The commits touch only the listed files, plus `docs/whatsapp-platform-implementation-plan.md` (section 12 decision record) and `audits/QUESTIONS-FOR-RISHI.md` (Q-WA1 status). Both are expected. Lead forms are untouched. The worktree also has an uncommitted change to `audits/QUESTIONS-FOR-RISHI.md` and an untracked `docs/whatsapp-inbox.md`. Neither is in the reviewed commits, so decide on purpose whether they ride along.

## Checks that pass

- **Auth on every action.** Every export in `app/leads/whatsapp/actions.ts` except `inboxMode` goes through `run()`. `run()` calls `currentActor()`, which uses a timing-safe compare against `ADMIN_SESSION_TOKEN` and fails closed when the token is unset (`lib/whatsapp/admin-session.ts:13-24`). The service layer then gates each call with `can()`. `inboxCallOutcome` and `inboxSchedule` gate on `record_call` and then call the CRM's own `saveOutcome` and `quickSchedule`, which run `requireAdmin()` again (`app/leads/actions.ts:90,172`). This matters because a server action can be POSTed to any route, not just `/leads`. The middleware alone would not protect it.
- **Owner-only actions.** `setSending` (toggle_sending), `updateBilling` (edit_settings), `overrideCap`, `connectionCheck` and `deleteContactData` all gate in `inbox-service.ts` before doing anything. `access.ts` OWNER_ONLY holds exactly those five. The test "counsellor cannot touch settings or the cap" passes. A counsellor can read settings and spend through `loadSettings` ('view'). That view holds no secrets.
- **Secrets.** The token and app secret are used only in `graph.ts` request headers and the debug_token query, which goes to graph.facebook.com over HTTPS. They are never returned, logged or audited. `failure()` and `fail()` pass the PostgREST code only, never the message. `ConnectionReport` returns only states, token type, expiry, scopes, the business display number and WABA name. The audit row for the connection check stores `vars` and a problem count. `InboxClient.tsx` imports server modules as types only, and the static test enforces this.
- **Error titles.** Send-path Meta errors go through `safeErrorTitle` (`graph.ts:44-47`). See N2 for the status-webhook path.
- **No automatic sends.** `sendMessage` has one caller (`inbox-service.ts:141`, reached only from `inboxSend`). `inboxSend` is called only from the Send and Ask-for-phone buttons (`InboxClient.tsx:329`). The cron sweep only retries webhook ingestion and writes `last_sweep`. It does not send. `sending_enabled` is seeded false in Phase 1 and the check is `!== true` (`inbox-service.ts:102`). No auto-reply, campaign or read-receipt path exists (D10 respected: `markRead` is local only).
- **Idempotency and no retry.** `wa_begin_outbound` reserves on `client_ref unique` before calling Meta. `graph.ts` makes one HTTP call, with no retry. A timeout, network error, 5xx or bad response becomes `'unknown'`, is recorded and is never retried. The client clears the text on unknown and shows "Check the thread before sending it again".
- **Server-side enforcement.** The 24-hour window (`inbox-service.ts:109`), opt-out via latest `service` consent = false (`:113`) and the cap (`:134`) are all checked in the service, not only in the UI.
- **Cap arithmetic.** The reserved row is counted in flight before `capAllows` runs. `serviceSent > freePerMonth` is therefore correct: message 1,000 is free and 1,001 is paid. `chargesInr > budgetInr` includes the current message, so the last message that fits is allowed and the next is blocked. No off-by-one found. **Concurrency:** each send reserves before it reads usage, so two simultaneous sends both see both rows. The worst case is a false block, never an overspend. Rows stuck in 'sending', 'accepted' or 'unknown' stay counted (conservative). Meta's own billable count wins when it is higher. A missing rate, free tier or cap fails closed.
- **Rates.** No rate is hardcoded in code. Rates are seeded as settings with source, effective_from and verified_on (`migration:68-84`) and are editable by the owner only. Today I confirmed from Meta's pricing page that there are 1,000 free service messages per business number per month, resetting at midnight in the Messaging account time zone, which matches the `billing_timezone` setting. I could not re-read the INR figures (0.115 / 0.115 / 0.115 / 2.4971 / 0.8631) because Meta serves the card as a download. They rest on the author's 26 Nov reading (see N11).
- **BSUID and REQUEST_CONTACT_INFO payloads** match Meta's business-scoped user ID docs, read today: the `recipient` field replaces `to`, and the payload is `interactive.type = request_contact_info` with `action.name = request_contact_info`.
- **XSS.** There is no `dangerouslySetInnerHTML` anywhere in the inbox. Bodies, names, usernames and error titles render as React text nodes. The only data-built href is `tel:${phone}`, and the fixed `tel:` scheme blocks `javascript:`.
- **SQL.** All 6 new functions pin `search_path = public` and are revoked from public, anon and authenticated, with execute granted to service_role (`migration:229-251`). The test confirms anon and authenticated are refused. RLS is on for all 3 new tables, with no policies. Search escapes `\`, `%` and `_` (`:103`), and the test checks that `%` matches literally. The limit is clamped to 1-50. The down migration is tested.
- **Mock mode.** `mockEnabled()` requires `NODE_ENV !== 'production'` (`actions.ts:22-24`). `next build` and `next start` and every Vercel deployment run with NODE_ENV=production, so `WA_INBOX_MOCK=1` in Vercel env has no effect.
- **Uncrawlable.** The page sets metadata `robots: {index:false, follow:false}`. `next.config.js:876` applies `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store` to `/leads/:path*`. `middleware.ts:597` protects `/leads/*`.
- **Requirements 1-10.**
  1. The full phone is shown whenever it is known (`fmtPhone`). The list falls back to the phone when there is no name.
  2. Call now (`tel:`) and Copy number are present.
  3. Ask for phone sends REQUEST_CONTACT_INFO when no number is known.
  4. Link lead, with suggestions only and no auto-link (D3 still open).
  5. Create lead, with a duplicate-phone check and 23505 handling.
  6. Outcomes, reminders and notes go through the CRM actions.
  7. The palette vars are exact (`whatsapp.css:5-6`) and the Edify logo is used. See N9.
  8. `recordSweep` writes `last_sweep` on success and on failure, and the inbox shows it as stale after 15 minutes. The cron runs every 5 minutes in `vercel.json`.
  9. The inbox polls every 15 seconds only while the tab is visible, with one cheap query when nothing changed. See N7.
  10. No automation and no campaigns.
- **House style.** No em dashes and no banned filler words in the new user-facing text (privacy policy, inbox UI, service error strings).

## Privacy policy: which promises the code keeps

| Promise (app/privacy-policy/page.tsx) | Status |
|---|---|
| Stores messages, status, profile name, username, phone when shared, notes, consent | Implemented |
| Number seen only if the student chooses to share it | Implemented (REQUEST_CONTACT_INFO; nothing derives a hidden number) |
| A person replies to every message, no automated replies | Implemented (no send path except the buttons) |
| Starting a chat is not call or promo permission | Implemented in data (nothing writes wa_consent automatically). The UI shows a warning but does not block calls (S2) |
| "We call you only if you ask us to" (l.78) | **Not enforced.** Call now has a "Call anyway?" override, and the CRM at /leads cannot see WhatsApp consent (S2) |
| No promotional or bulk WhatsApp | Implemented (no campaign code; campaigns_enabled false) |
| "Reply STOP ... We record it and stop messaging and calling you" (l.83) | **Partly.** STOP shows a banner only. Messaging stops once a person records service = No. Calling is never blocked (S2) |
| Raw delivery record deleted after 30 days | Implemented (`wa_purge_raw_bodies` nulls raw_body 30 days after receipt; runs in the 5-minute sweep) |
| Messages, notes and contact details kept up to 24 months after the last message, then deleted (l.88) | **Not implemented.** No retention job exists, and D7 is still open in section 12 (S1) |
| Consent records kept while contact details are held | Implemented (cascade on contact delete). This differs from the D7 proposal ("+3 years after withdrawal"), another reason to settle D7 |
| Deletion on request within 30 days | Implemented as a manual, owner-only "Delete WhatsApp data" action. The CRM lead (name, phone) is kept, and `wa_message_statuses` rows stay (N4) |
| Processors: Meta, Supabase, Vercel | Accurate, but probably incomplete (N3) |
| Lead forms unchanged | Confirmed, not in the diff |

## Findings

### S1. should-fix: the policy promises 24-month deletion, but nothing implements it and D7 is still open
- **Where:** `app/privacy-policy/page.tsx:88`. No retention code exists in `app/api/cron/whatsapp-sweep/route.ts` or the migration.
- **Failure scenario:** The policy goes live publishing a retention period Rishi has not approved (Q-WA1 lists D7 as "Still open"). The code also never deletes messages. If D7 is later decided differently (for example 12 months), the published policy was wrong from day one. If nobody builds the job, messages from Nov 2026 are still held in Dec 2028, against a published promise under the DPDP Act.
- **Fix (pick one before merge):**
  - (a) Put D7 in QUESTIONS-FOR-RISHI as the blocker for this sentence, and ship wording without a number, for example "kept only as long as needed to answer you, and deleted on request".
  - (b) Get D7 approved, and add the retention delete to the sweep (or a monthly cron) in this branch or a tracked follow-up item due well before Nov 2028.

### S2. should-fix: the opt-out and call promises are stronger than the code
- **Where:** `app/privacy-policy/page.tsx:78` and `:83`; `app/leads/whatsapp/InboxClient.tsx:403-409` (Call now confirm-and-continue); `inbox-service.ts:371-375` (STOP is a hint only).
- **Failure scenario:** A student replies "STOP". The inbox shows a red banner, and the counsellor records "Replies on WhatsApp: No" as the banner says. Nothing records counselling_call = No. Next day the counsellor opens the linked lead in `/leads` (which knows nothing about WhatsApp consent) and calls. Even from the inbox, Call now only asks "Call anyway?". The policy said "We record it and stop messaging and calling you" and "We call you only if you ask us to".
- **Fix:**
  - When service = No is recorded from the opt-out banner, also record counselling_call = No (one click, same evidence).
  - Make Call now a hard block, with no override, when counselling_call is explicitly No.
  - Surface the WhatsApp call-consent state on the CRM lead card. This can be a follow-up.
  - Or reword the policy to describe what actually happens: "a counsellor records it and we stop".

### S3. should-fix: an idempotency key reused after a server-side reservation can swallow or misreport a reply
- **Where:** `app/leads/whatsapp/InboxClient.tsx:325-339` (the ref rotates only when `r.ok`), together with `inbox-service.ts:127-139` (a cap block returns `ok:false` after the row was reserved and marked failed).
- **Failure scenario 1:** The cap blocks a reply, so the server reserves row X, marks it failed and returns `ok:false`. The client keeps the same ref. The owner raises the cap and the counsellor presses Send again. `wa_begin_outbound` finds X, returns `is_new:false, state:'failed'`, and the UI shows "Blocked by the monthly cap" or "Meta refused the message". The reply is never sent until the page is reloaded. Pressing "Ask for phone number" in the same thread hits the same stale row, because both buttons share one ref.
- **Failure scenario 2:** A network error occurs on Send and the ref is kept, which is correct. The counsellor then edits the text and presses Send. The server returns the first attempt's row as a duplicate. If that row was accepted, the client clears the edited text and says "Sent", but the edited text was never sent.
- **Fix:**
  - Have the server return `{ok:true, state:'failed', error}` (or a `reserved:true` flag) for the cap block, so the client rotates the ref.
  - Rotate the ref whenever the text or the kind changes after a failed attempt.
  - Optionally, have `wa_begin_outbound` return `duplicate:false`-style mismatch info when `p_conv` or `p_body` differ from the stored row (see N6).

### Nits (can follow later)
- **N1** `actions.ts:65`: `inboxMode()` is an exported server action with no session check. It reveals only 'mock' or 'live', which is always 'live' in production. To fix, move it out of the `'use server'` file or put it behind `run()`.
- **N2** The Phase 1 status-webhook path writes Meta's status error title unredacted (`20261201120000_whatsapp_core.sql:273`), and Phase 2 now renders it (`InboxClient.tsx:87`). Only the owner sees it, but the "phone digits stripped" guarantee covers the send path only. `safeErrorTitle` also misses dot-separated numbers ("98765.43210"). To fix, apply the same redaction at display or in the ingest function.
- **N3** `privacy-policy:96-100`: if edifyedu.in is proxied through Cloudflare (the project notes say HTML is cached there), webhook bodies cross Cloudflare in transit. Consider naming it as a processor.
- **N4** Delete contact (`inbox-service.ts:360-367`) leaves `wa_message_statuses` rows (wamid, pricing, error jsonb; no FK) and keeps the CRM lead. That is fine for billing counts. The policy at l.93 says "contact details we hold about you" are deleted, which a DPDP request reader would take to include the lead. Clarify the wording or the process.
- **N5** The plan's send rate limit (10 per minute per session, plan line 331) is not implemented. This is low risk with one user and the cap in place.
- **N6** `wa_begin_outbound` (`migration:147-162`) returns the existing row for a reused client_ref without checking `p_conv`. Refs are random UUIDs and owner-only, so this is theoretical.
- **N7** Requirement 9: `loadThread` reads the contact and lead twice (once inside `repo.getConversation`, then again), about 2 extra queries per thread load. The thread also reloads every 15 seconds for 10 minutes after a send. This is cheap, but it is free to trim.
- **N8** `InboxClient.tsx:61`: the `newRef` fallback is not a UUID, so the server would reply "Bad request" in a non-secure context. Production is HTTPS, so there is no impact.
- **N9** `whatsapp.css` adds tints outside the 7 palette codes (#047857, #ea580c, #1e293b, #a7f3d0, #fecaca, #fef2f2, #fdf6e7, #ecd9a8, #ecfdf5, #fff7ed, #f8fafc, #e2e8f0). The core variables are exact. Accept these as hover and background tints, or derive them from the palette.
- **N10** Load more (`InboxClient.tsx:136-140`) passes `last_message_at`. If that is null, `p_before_at` is null and page 1 comes back again. This is unlikely, because Phase 1 sets it on every inbound message.
- **N11** There is no `audits/verify/` source row for the Meta INR rates. They appear only in the admin inbox, not on public pages, but add a row (Meta pricing page, "INR list rates" card, India row, read 26 Nov 2026) so the next rate-card change has a baseline.

## Before deploy (not QA blockers, from the plan)
- Rishi runs `20261202120000_whatsapp_inbox.sql` and pastes the `select key from wa_settings order by key` result. Nine keys are expected.
- `sending_enabled` stays false until Rishi switches it on after the connection check passes.
- B5 (INR billing migration by 31 Dec 2026) is still open, and the connection check flags a non-INR currency.
