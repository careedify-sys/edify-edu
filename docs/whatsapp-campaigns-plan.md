# WhatsApp Phase 3: referral campaigns (plan, 27 Nov 2026)

Branch `feat/wa-3-campaigns`, worktree `../edify-wa-campaigns`, cut from the live Phase 2 code (f0f6866 plus log commit 0b13290).
Rishi's brief of 27 Nov is the spec. This file records how it maps onto the code that already exists, and the decisions taken.

## What already exists and gets reused

| Need | Existing piece |
|---|---|
| Login and owner check | `currentActor()` + `can(actor, action)` in `lib/whatsapp/access.ts`; new actions are added there |
| Phone-keyed contacts | `wa_contacts.phone_e164` (unique), `phone_source` already allows `'import'` |
| Consent and opt-out | `wa_consent` (append-only, latest row wins), `wa_is_opt_out`, the sweep's `wa_record_opt_outs` |
| Sending | `sendMessage()` in `graph.ts`: `accepted` / `failed` / `unknown`, never retried blindly |
| Status tracking | `wa_messages.wamid` + `wa_recompute_status` from status webhooks, already handles out-of-order and duplicate events |
| Spend | `wa_month_usage` (Meta's own `billable` flag), the `rates` setting already holds marketing 0.8631 |
| Worker | the existing 5-minute `whatsapp-sweep` cron. No new cron |
| Kill switch | `campaigns_enabled` setting, already `false` in production |
| Privacy | `/leads/*` is behind the login, `noindex`, and third-party tags skip it |

## Decisions

1. **Phone is the only required field.** Name, university and the rest are optional. Numbers become `wa_contacts` rows with `phone_source = 'import'`. That makes consent, opt-out and the inbox work unchanged.
2. **Only Indian mobile numbers are accepted** (+91, 10 digits starting 6-9). Others are reported as invalid, never guessed. Excel scientific notation (`9.19877E+11`) has already lost digits, so it is flagged as corrupted, not repaired.
3. **Excel is read in the browser** with a small built-in reader (unzip plus a sheet XML scan) using the browser's own decompression. The file never reaches the server, only the phone column does. The repo's `xlsx` 0.18.5 has known security advisories and stays confined to offline scripts. No new dependency.
4. **Consent.** Unknown counts as No. Rishi's file has no consent column, so the eligible count is 0 until consent is recorded. Consent can be recorded for selected contacts or a whole list in one action, with source, date and evidence required and an audit entry. No message is ever sent to ask for consent. Q-WA4 asks what students agreed to at enrolment.
5. **Eligibility is checked again at the moment of sending**, inside the same locked SQL step that reserves budget. Approval or scheduling never freezes it.
6. **Approval binds to a snapshot**: template, recipient count, cost and budget. Any change after approval sends the campaign back to draft. Only the owner can approve. Nothing sends unless `campaigns_enabled` is on as well.
7. **Budgets are separate from the ₹500 inbox cap.** A campaign budget, plus daily and monthly campaign budgets. A missing budget blocks sending, as a missing cap does in Phase 2. Reservation is atomic under an advisory lock (the Phase 2 pattern, proven with a real-Postgres race test).
8. **Queue in the database, processed by the sweep.** Each run claims at most the configured batch (default 50, hard max 200) inside a 25-second time budget. 5,000 messages at 50 per run take about 8 hours. A larger batch is faster, but Meta's messaging limit is the real ceiling.
9. **Meta's messaging limit** caps unique users reached outside a customer service window per 24 hours: 250 for a new portfolio, 2,000 after the scaling path. The daily maximum defaults to 250 and the connection check reads `whatsapp_business_manager_messaging_limit` to show the real tier.
10. **Automatic pause** on any of: the template is no longer APPROVED, phone quality is RED or flagged, account restriction or spam-rate error codes, three failures in a row, or a budget reached. `131049` (Meta's per-user marketing limit) fails that one recipient and is never retried, as Meta advises.
11. **Uncertain sends** (timeout or 5xx) are marked `unknown` and never retried automatically. The owner reviews them.
12. **Inbox.** Campaign sends create a conversation per recipient but do not move it to the top. The inbox default list shows conversations with at least one inbound message, so 5,000 sends do not bury real chats. A reply then surfaces it normally, labelled with the campaign.
13. **Reply attribution only with evidence.** A reply counts for a campaign when it quotes the campaign message or presses its button (`context.id` = campaign wamid). Other messages within 7 days are shown as "messaged after campaign (not confirmed)" and are not counted as replies.
14. **Templates.** Create and submit via `POST /{WABA}/message_templates` (body, optional text header, footer, quick-reply and URL buttons, no variables needed). Sync via GET. Rejection reasons are stored when Meta returns them. Referral invitations are Marketing, and the form does not offer Utility for them.
15. **Costs shown as estimates.** Marketing rate × eligible recipients, plus GST at a configurable rate (18% assumed until checked on a Meta invoice). Meta bills marketing per delivered message, so the estimate is an upper bound. Actual figures come from the `billable` flag on status webhooks.
16. **Exports are CSV** (Excel opens them), with formula-injection guarding on every cell.
17. **Navigation.** Inbox, Contacts, Lists, Templates, Campaigns, Reports and Settings, as tabs under `/leads/whatsapp`, all behind the existing login.

## Milestones (one production deploy at the end)

1. Phone parsing, the paste box, the CSV and XLSX readers, and the validation report (pure code, unit tested).
2. Migration `20261203120000_whatsapp_campaigns.sql`, additive with a down file: lists, list members, template cache, campaigns, recipients, consent `obtained_at` and sources, claim/finish/stats functions, budget settings.
3. Contacts and Lists pages, consent recording, export.
4. Templates: create, submit, sync and status.
5. Campaign wizard: recipients, validation, template, preview, schedule, batch, cost, approval, drafts, duplicate.
6. Worker in the sweep: claim, send, finish, pause, resume, cancel, auto-pause.
7. Tracking: per-campaign stats, reply attribution, reports, CSV export.
8. QA: unit and SQL tests, real-Postgres race test for the claim, qa-checker, gates, build. Then the migration SQL goes to Rishi, then deploy approval.

## Resource estimate (marketing rate ₹0.8631, GST 18% assumed)

| Recipients | Meta cost before GST | With 18% GST | Extra Vercel work | Extra Supabase rows |
|---|---|---|---|---|
| 100 | ₹86.31 | ₹101.85 | about 300 webhook calls, under a minute of function time | about 800 |
| 500 | ₹431.55 | ₹509.23 | about 1,500 webhook calls | about 4,000 |
| 1,000 | ₹863.10 | ₹1,018.46 | about 3,000 webhook calls | about 8,000 |
| 5,000 | ₹4,315.50 | ₹5,092.29 | about 15,000 webhook calls, about 4 minutes of function time | about 40,000 (roughly 20 MB) |

The figures assume every message is delivered and read. The sending itself reuses the sweep runs that already happen 288 times a day, so it adds no invocations. Webhooks dominate: about 3 status events per message (sent, delivered, read). Vercel Pro includes 1M invocations a month. Statuses and events are cleared by the existing retention rules.
