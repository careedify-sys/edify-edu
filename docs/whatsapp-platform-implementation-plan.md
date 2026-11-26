# WhatsApp Business platform: Phase 0 audit and implementation plan

Status: **DRAFT, awaiting Rishi's approval.** Nothing here has been built, deployed, migrated or sent.
Prepared 26 Nov 2026 on branch `docs/whatsapp-platform-plan` (from `origin/main` at `41bb96f`).

Scope of this document: Phase 0 only. It audits what exists, proposes the design for Phases 1 to 7, and lists the decisions that need Rishi before Phase 1 starts. The first release is Phase 1 + Phase 2: durable message storage, a secure inbox, manual replies, phone visibility and calling.

---

## 0. Summary

- **The webhook is live but stores nothing.** `app/api/whatsapp/webhook/route.ts` (commit `199d859`, on `main`) verifies signatures correctly but dedupes in memory and throws the message away. Phase 1 replaces the handler body, not the signature code.
- **There is no `/admin` dashboard to extend.** `app/admin/` is the retired CMS, which CLAUDE.md puts off-limits. The working admin surface is the **Leads CRM at `/leads`**. Recommendation: build the inbox at **`/leads/whatsapp`**, which inherits the existing auth guard, the `noindex` headers and the CRM's styling with no change to middleware, robots or the CMS. (Decision D1.)
- **Admin auth is one shared password + email OTP, and the session cookie is a single static token.** That is enough for Rishi alone. It cannot say *which* counsellor sent a message, so per-user audit trails need per-user accounts before anyone else gets access. (Decision D2.)
- **No new paid infrastructure is needed** for Phases 1 to 4. The existing Vercel Pro project and Supabase database cover it. Phase 5 needs one scheduled worker, which an existing Vercel cron slot can carry once `CRON_SECRET` is linked (today it is not, so the existing daily cron 401s).
- **Meta now charges for manual replies.** Since 1 Oct 2026, service (free-form) messages are billed per delivered message after 1,000 free per business number per month. The inbox therefore shows a running count and an estimated cost, and the plan asks for a monthly cap. (Decision D6.)
- **Two Meta account deadlines need checking now** (Section 12): the INR billing migration (non-INR messaging accounts of eligible Indian customers stop delivering from 1 Jan 2027), and confirming a payment method is on file.

---

## 1. Existing infrastructure assessment

### 1.1 What exists

| Area | Where | Finding |
|---|---|---|
| WhatsApp webhook | `app/api/whatsapp/webhook/route.ts`, `lib/whatsapp/signature.ts`, `lib/whatsapp/dedupe.ts`, `docs/whatsapp-webhook.md` | GET verify (constant-time token compare, challenge regex). POST: 1 MB cap, HMAC-SHA256 over raw bytes, parses `messages` and `statuses`, logs counts only. Handlers are empty. Dedupe is a per-instance `Map` and marks a key *before* the (empty) handler runs. Always returns 200 for a signed payload. |
| Admin auth | `middleware.ts:200` (`PROTECTED_PATHS = ['/admin','/admin/cms','/blog/write','/leads']`), `app/api/admin-auth`, `app/api/admin-verify-otp`, `lib/admin-otp.ts` | Password (`ADMIN_SECRET`) then a 6-digit OTP emailed via Resend to `ADMIN_OTP_EMAIL`; pending state in an HMAC-signed cookie. On success the cookie `edify_admin_session` is set to the constant `ADMIN_SESSION_TOKEN` for 24 h. Middleware compares with `===`. No user identity, no server-side session list, no revocation short of rotating the token. |
| Admin authorisation in server code | `app/leads/actions.ts` `requireAdmin()` | Timing-safe compare of the cookie against `ADMIN_SESSION_TOKEN`, called at the top of every server action. This is the pattern to reuse; middleware does **not** cover `/api/*` routes. |
| CRM | `app/leads/*` (page, `LeadsClient.tsx` 899 lines, `actions.ts`, `leads.css`), `app/api/leads`, `app/api/enquiry` | Tables `leads` and `lead_activity`. `leads.phone` is stored canonical as 12 digits `91XXXXXXXXXX` with a unique index on the digits. Stages: Fresh, Follow-up, Interested, Next session, Registered, Enrolled, Not interested. `lead_activity.type` is `call` or `note`, with outcome/reason/remark. `next_call_date/time` drive call scheduling. Attribution columns (`channel`, `utm_*`, `landing_page`) since 12 Nov. |
| CRM scale | `app/leads/page.tsx` | Loads **every** lead and **every** activity row in one request, unpaginated. Fine at ~300 to 1,000 leads. The WhatsApp inbox must not copy this pattern. |
| Supabase | `lib/supabase/{client,server,service}.ts`, `supabase/migrations/*.sql` (5 files) | All CRM access is server-side with the service-role key; tables have RLS **enabled with no policies**, so anon and authenticated roles are denied. Migrations are plain SQL files that are run by hand in the SQL editor (no Supabase CLI link in the repo). No Supabase Auth users. |
| Rate limiting | `lib/rate-limit.ts` | In-memory sliding window per instance. Adequate for login; not a real limit across instances. |
| Cron | `vercel.json` (`/api/cron/due-calls`, daily 08:00 IST) | Authenticates with `Bearer $CRON_SECRET`. `CRON_SECRET` is a team shared var linked to no project (found 25 Nov), so every run 401s and the daily call list never sends. |
| Robots / indexing | `app/robots.ts` disallows `/admin/`, `/api/`; `next.config.js` sends `X-Robots-Tag: noindex, nofollow, noarchive` on `/leads`, `/leads/:path*`, `/admin*`; `app/leads/layout.tsx` sets `robots: noindex` | Anything under `/leads/` and `/api/` is already hidden from crawlers with no change. |
| Email | Resend (`RESEND_API_KEY`) | Reusable for "new WhatsApp message" alerts if wanted (Phase 2 optional). |
| Tests | `lib/*.test.ts`, run with `npx tsx <file>` and `node:assert` | No test runner or CI. Plan follows the same convention. |
| Pre-commit | `.husky/pre-commit` (fee, em-dash, first-hand and other content gates) | Content gates; none checks API routes. Em-dash baseline applies to `app/**/*.tsx`, so new UI files must avoid em dashes. |
| Privacy policy | `app/privacy-policy/page.tsx` lines 52 and 79 | Mentions contacting leads on WhatsApp and that WhatsApp's policy applies if a user starts a chat. Says nothing about storing WhatsApp messages, retention, or opt-out. Needs an update before Phase 2 ships (Decision D8). |
| Deploy controls | `vercel.json` `git.deploymentEnabled` main-only, `ignoreCommand` skips docs-only pushes | Feature branches do not build on Vercel. A push of this plan alone would not build. |

### 1.2 Does the webhook receive real messages?

The code counts `messages[]` and `statuses[]` separately and logs `messageTypes`. Rishi reports successful inbound and outbound tests and multiple POST 200s. I could not read the Vercel runtime logs from this session, so **I have not confirmed** that a log line with `"messages":1` (as opposed to only statuses) exists. Check before Phase 1 ships: Vercel, edify-edu-dh2m, Logs, filter `[whatsapp-webhook] received`, and confirm at least one line has `"messages":` above 0. Phase 1 makes this measurable in the database anyway.

### 1.3 Environment variables

The code reads `WHATSAPP_VERIFY_TOKEN` and `META_APP_SECRET` (both team shared vars linked to edify-edu-dh2m, per the 25 Nov audit). I tried to list env var names and link state through the Vercel CLI and the session's permission guard blocked it, so I did **not** check `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` or `WHATSAPP_BUSINESS_ACCOUNT_ID`. Rishi's check is in Section 12 (B2). Note the trap from the cron incident: a **shared** var that is not linked to edify-edu-dh2m does not exist at runtime, and env changes only apply to builds made after them.

### 1.4 Security and performance risks found

| # | Risk | Severity | Handling |
|---|---|---|---|
| R1 | Webhook acknowledges with 200 before anything is stored; a crash or cold instance loses the message for good. | High once we depend on it | Phase 1: persist first, 200 only after the insert commits; 500 if the DB write fails so Meta retries. |
| R2 | In-memory dedupe does not hold across instances. | High once handlers have side effects | Phase 1: UNIQUE constraints in Postgres. |
| R3 | Single static admin session token, no per-user identity, `===` compare in middleware. | Medium | Phase 2 uses `requireAdmin()` (timing-safe) in every WhatsApp route. Per-user accounts are Decision D2. |
| R4 | `/api/*` routes are not covered by the middleware guard. | High for new routes | Every `/api/whatsapp/admin/*` route calls a shared guard first; a test enumerates the route files and fails if any lacks it. |
| R5 | Incoming text is attacker-controlled (stored XSS). | High | Render as React text only; never `dangerouslySetInnerHTML`; no auto-linking in Phase 2 (links shown as plain text with a copy button). |
| R6 | Media and documents from users can be malicious. | Medium | Never auto-download; fetch on demand through an admin-only proxy with size and MIME allowlist, served with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`. Not stored in Phase 2. |
| R7 | Access token leaks (logs, client bundle). | High | Token read only in `lib/whatsapp/graph.ts` behind the `typeof window` guard; never logged; error bodies from Meta are scrubbed before logging. |
| R8 | Phone numbers and messages in logs. | High (privacy) | Keep the existing "counts only" rule; add a lint-style test that greps `lib/whatsapp` and `app/api/whatsapp` for `console.*` calls with message/phone identifiers. |
| R9 | Replies cost money since 1 Oct 2026. | Medium | Show count of the 1,000 free service messages used this month, estimated cost, and a hard monthly cap (D6). |
| R10 | `/leads` loads all rows unpaginated. | Low today | Not touched by this project; the WhatsApp pages are paginated from day one. |

### 1.5 Platform limits that matter

Exact quotas depend on the current Vercel Pro and Supabase plan, which I could not read from here. Rishi confirms the Supabase plan in B3. The design keeps within Vercel Pro's included usage and the Supabase free tier's 500 MB database at the volumes in Section 7.

- **Vercel functions:** each webhook call is short (one signature check and one Postgres round trip, typically well under 1 s). No long-running function is introduced. The campaign worker (Phase 5) runs in bounded batches well under the function time limit.
- **Vercel cron:** the project has one cron today. Phase 1 adds a retry sweeper, and Phase 5 extends the same route instead of adding another.
- **Supabase:** Realtime would need a browser-side client with RLS read policies and Supabase Auth, which the project does not use. The plan uses short, visibility-aware polling instead (Section 7).

### 1.6 Is more infrastructure needed?

No for Phases 1 to 4. Phase 5's queue lives in Postgres and is drained by a Vercel cron, so no Redis, queue service or paid WhatsApp provider is needed. The one optional addition worth discussing later is Supabase Storage for archiving media (Decision D9). It is off by default.

---

## 2. Proposed architecture

```
Meta Cloud API ──POST──> /api/whatsapp/webhook  (verify HMAC on raw body)
                              │
                              ├─ INSERT wa_webhook_events (raw, body_sha256 UNIQUE)  ← durable acceptance
                              │      fail → 500 (Meta retries)
                              ├─ rpc wa_process_event(id)   ← one Postgres transaction:
                              │      claim row (pending→processing, SKIP LOCKED)
                              │      upsert contact (phone / BSUID / username)
                              │      upsert conversation, insert message (wamid UNIQUE)
                              │      insert status (wamid+status UNIQUE), recompute rollup
                              │      mark completed  | on error: failed, attempts+1
                              └─ 200 EVENT_RECEIVED (even if processing failed: the row is stored)

/api/cron/whatsapp-sweep (every 5 min, Phase 1)  → re-runs pending/failed events (attempts < 5),
                                                    purges raw payloads older than 30 days
Admin browser (/leads/whatsapp) ──fetch──> /api/whatsapp/admin/*  (requireAdmin, rate limit)
                                              ├─ reads: paginated SQL views
                                              └─ send: insert outbound row (client_ref UNIQUE) → Graph API → store wamid
```

Key design choices:

1. **Persist, then process, in the same request.** The raw event row is the durable record. Processing runs inline as one Postgres function call, so the common case completes in one invocation and needs no queue. If processing throws, the event stays `failed` and the sweeper retries it. A processing failure never loses the message, because the raw payload is already committed.
2. **Idempotency lives in constraints, not code.** Whole-delivery retries collide on `body_sha256`. Individual messages collide on `wamid`, statuses on `(wamid, status)`. Any number of concurrent instances can process the same payload and the result is the same.
3. **Processing is SQL (a `security definer` function), not TypeScript loops.** One round trip per webhook, atomic, and it keeps the claim/lock logic in one place. TypeScript only verifies, inserts and calls the function.
4. **Out-of-order statuses.** Every status is kept in `wa_message_statuses`. The message's displayed status is the highest rank seen (`sent` 1, `delivered` 2, `read` 3, `played` 3), so a late `delivered` never overwrites `read`. `failed` is stored with its error and shown separately. A status that arrives before we have stored the wamid of our own outbound message (possible if Meta's webhook beats the API response) is kept and joined later on wamid.
5. **Outbound is never blindly retried.** Before calling Meta, the server inserts the outbound message with a random `client_ref` and state `sending`. On a clear API error it becomes `failed` with Meta's code. On a timeout or network error it becomes `unknown`, and the UI shows "Delivery uncertain, check before resending". Resending is a deliberate admin action that creates a new row. The Cloud API documents no idempotency key for `/messages` that I could find, so we cannot make a retry safe on Meta's side.
6. **Graph API version is pinned in config.** `WHATSAPP_GRAPH_VERSION` (non-secret, default `v26.0`, the current version released 29 Jul 2026). One place to bump it.
7. **No automatic outbound messages in Phases 1 to 4.** There is no code path that sends without an admin click. Phase 7 adds automation behind a database flag that is off by default.

### 2.1 Phone numbers, BSUIDs and usernames

Meta began adding business-scoped user IDs (BSUIDs) to webhooks in April 2026. Users who turn on a WhatsApp username may have their phone number left out of webhooks. Per Meta's BSUID page, the number is still included when, for that business phone number, we messaged or called them in the last 30 days, they messaged or called us in the last 30 days, or they are in our contact book.

What we store per contact:

| Field | Source |
|---|---|
| `wa_id` / `phone_e164` | `contacts[].wa_id`, `messages[].from`, `statuses[].recipient_id` when present |
| `bsuid` | `contacts[].user_id`, `messages[].from_user_id`, `statuses[].recipient_user_id` |
| `parent_bsuid` | `statuses[].recipient_parent_user_id` when present |
| `username` | `contacts[].profile.username` |
| `profile_name` | `contacts[].profile.name` |

Matching rule: find the contact by `bsuid` first, then by `phone_e164`. When a later event carries both, fill in whichever was missing. A `user_changed_number` system message moves the contact to the new number and BSUID, keeps the old values in history, and flags the linked lead for review. It never rewrites `leads.phone` automatically.

**Contact book.** Meta stores the phone number and BSUID of anyone we exchange messages or calls with, scoped to the business portfolio. It needs no integration and can be switched off in Business settings, which deletes its data. Recommendation: leave it on, because it is what keeps phone numbers visible for counselling calls. Our deletion workflow (Section 6.6) also calls `DELETE /<PHONE_NUMBER_ID>/contact_book?bsuid=` so a "forget me" request clears Meta's copy too.

**Requesting a number the user has hidden.** Inside the 24-hour window, the counsellor can send an interactive `request_contact_info` message ("Share your number so a counsellor can call you"). Outside the window, the same request needs an approved template with a `REQUEST_CONTACT_INFO` button (utility or marketing category). The user's reply arrives as `messages[].type = "contacts"` with `contacts[].origin = "contact_request"`. We store the number, mark its source as `contact_request`, and record the user's permission for counselling calls only if the request text asked for that and they replied. We never try to derive a hidden number any other way.

---

## 3. Database schema

Conventions follow the existing migrations: plain SQL in `supabase/migrations/`, `create ... if not exists`, RLS enabled with **no policies** (service role only), `set_updated_at()` trigger reused, additive only. Prefix `wa_` keeps the tables grouped and clearly separate from `leads`.

Phase 1 migration: `supabase/migrations/20261201120000_whatsapp_core.sql` (date set when written).

```sql
-- Contacts: one row per WhatsApp user, identified by phone and/or BSUID.
create table wa_contacts (
  id               uuid primary key default gen_random_uuid(),
  phone_e164       text unique,          -- '+919696539529'; null when hidden
  wa_id            text,                 -- digits as Meta sends them
  bsuid            text unique,          -- 'IN.1349...' style
  parent_bsuid     text,
  username         text,
  profile_name     text,
  phone_source     text check (phone_source in ('webhook','contact_request','crm_link','import')),
  lead_id          uuid references leads(id) on delete set null,
  lead_link_method text check (lead_link_method in ('auto_phone','manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wa_contacts_identity check (phone_e164 is not null or bsuid is not null)
);
create index wa_contacts_lead_idx on wa_contacts (lead_id);

create table wa_contact_identity_history (   -- number changes, BSUID regenerations
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references wa_contacts(id) on delete cascade,
  old_phone_e164 text, old_bsuid text, new_phone_e164 text, new_bsuid text,
  reason text not null, occurred_at timestamptz not null default now()
);

-- Conversations: one per contact per business number.
create table wa_conversations (
  id                    uuid primary key default gen_random_uuid(),
  contact_id            uuid not null references wa_contacts(id) on delete cascade,
  phone_number_id       text not null,
  last_message_at       timestamptz,
  last_inbound_at       timestamptz,     -- drives the 24 h customer service window
  last_message_preview  text,            -- first 120 chars, shown in the list
  unread_count          integer not null default 0,
  status                text not null default 'open' check (status in ('open','archived')),
  assigned_to           text,            -- counsellor id once D2 exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contact_id, phone_number_id)
);
create index wa_conversations_list_idx on wa_conversations (status, last_message_at desc);

-- Messages, both directions.
create table wa_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references wa_conversations(id) on delete cascade,
  direction        text not null check (direction in ('inbound','outbound')),
  wamid            text unique,          -- null only while an outbound send is in flight
  client_ref       uuid unique,          -- outbound idempotency key we generate
  type             text not null,        -- text, image, document, audio, video, sticker, location, contacts, interactive, button, reaction, template, system, unsupported
  body             text,                 -- UTF-8; any script, emoji
  payload          jsonb,                -- type-specific fields (media id, mime, caption, template name and params)
  reply_to_wamid   text,
  sent_by          text,                 -- 'admin' until D2, then the user id
  send_state       text check (send_state in ('sending','accepted','failed','unknown')),
  status           text,                 -- highest status seen: sent, delivered, read, played, failed
  status_rank      smallint not null default 0,
  error_code       integer,
  error_title      text,
  meta_timestamp   timestamptz,          -- Meta's own timestamp
  created_at       timestamptz not null default now()
);
create index wa_messages_conv_idx on wa_messages (conversation_id, created_at desc);

-- Every status event, kept for audit and for out-of-order reconciliation.
create table wa_message_statuses (
  id          bigint generated always as identity primary key,
  wamid       text not null,
  status      text not null,
  occurred_at timestamptz not null,
  pricing     jsonb,                     -- billable, pricing_model, type, category, subtype
  error       jsonb,
  unique (wamid, status)
);

-- Raw webhook deliveries: durable acceptance and retry.
create table wa_webhook_events (
  id            bigint generated always as identity primary key,
  body_sha256   text not null unique,
  payload       jsonb,                   -- nulled by the sweeper after 30 days
  state         text not null default 'pending' check (state in ('pending','processing','completed','failed')),
  attempts      smallint not null default 0,
  last_error    text,                    -- error class only, never payload content
  received_at   timestamptz not null default now(),
  processed_at  timestamptz
);
create index wa_webhook_events_todo_idx on wa_webhook_events (state, received_at)
  where state in ('pending','failed','processing');

-- Consent, per purpose, append-only (latest row per contact+purpose wins).
create table wa_consent (
  id          bigint generated always as identity primary key,
  contact_id  uuid not null references wa_contacts(id) on delete cascade,
  purpose     text not null check (purpose in ('service','counselling_call','utility_updates','marketing')),
  granted     boolean not null,
  source      text not null,             -- 'inbound_message','contact_request','web_form','csv_import','admin','opt_out_keyword'
  evidence    text,                      -- e.g. wamid of the message that gave or withdrew it
  recorded_by text,
  recorded_at timestamptz not null default now()
);
create index wa_consent_lookup_idx on wa_consent (contact_id, purpose, recorded_at desc);

-- Internal notes on a conversation (never sent).
create table wa_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references wa_conversations(id) on delete cascade,
  body text not null, created_by text not null,
  created_at timestamptz not null default now()
);

-- Audit trail for every admin action that sends, links, exports or deletes.
create table wa_audit_log (
  id          bigint generated always as identity primary key,
  actor       text not null,
  action      text not null,             -- send_text, send_template, request_contact_info, link_lead, export, delete_contact, ...
  target_type text, target_id text,
  detail      jsonb,                     -- ids and counts only, no message bodies
  ip_hash     text,
  created_at  timestamptz not null default now()
);

-- Configurable settings and spend controls (one row per key).
create table wa_settings (
  key text primary key, value jsonb not null, updated_at timestamptz not null default now()
);
-- seeds: sending_enabled=false, automation_enabled=false, campaigns_enabled=false,
--        monthly_service_cap=null, rates={} (entered from Meta's INR rate card)

alter table wa_contacts enable row level security;  -- and every other wa_ table
```

Later phases add (separate migrations):

- **Phase 2:** `wa_call_tasks` (contact, due_at, outcome, remark, created_by). Call outcomes for linked contacts are also written to the existing `lead_activity` table as `type='call'`, so the existing CRM timeline and the daily due-calls email include them.
- **Phase 3:** `wa_tags`, `wa_contact_tags`, `wa_imports` and `wa_import_rows` (preview before commit). Fields Rishi listed that `leads` lacks (specialisation, admission status, batch, assigned counsellor) go in a `lead_profile` side table keyed on `lead_id`, so the existing CRM code and its `select` lists are untouched.
- **Phase 4:** `wa_templates` (name, language, category, components jsonb, status, rejection reason, synced_at).
- **Phase 5:** `wa_campaigns`, `wa_campaign_recipients` (`unique (campaign_id, contact_id)`, state, wamid, attempt, error), `wa_spend_ledger`.

Processing functions (Phase 1, same migration): `wa_process_event(event_id bigint)`, `wa_claim_events(limit int)` (uses `for update skip locked` so two sweeper runs never take the same row), and `wa_status_rank(text)`. All are `security definer` with `search_path` pinned and `execute` revoked from `anon` and `authenticated`.

Phone normalisation: `phone_e164` is `+` plus Meta's digits. Linking to a lead compares `regexp_replace(leads.phone,'[^0-9]','','g')` with the digits, which matches the existing unique index on `leads`. Numbers typed by admins go through one validator (`lib/whatsapp/phone.ts`): strip non-digits, 10 digits starting 6 to 9 become `+91...`, otherwise require a country code and 8 to 15 digits.

Unicode: Postgres `text` is UTF-8. Hindi, Tamil, emoji and the rest are stored as sent. Previews are cut by code points, not bytes.

Retention (proposal, Decision D7):

| Data | Kept | Then |
|---|---|---|
| `wa_webhook_events.payload` | 30 days | payload set to null; row kept for idempotency |
| Messages, statuses, notes | 24 months after last activity | deleted by the sweeper |
| Consent records | as long as the contact exists, plus 3 years after withdrawal | deleted |
| Audit log | 3 years | deleted |
| Contact deletion request | immediate | contact cascade-deleted, Meta contact book entry deleted, audit row keeps only the action and a hash |

---

## 4. Admin dashboard structure

Route base `/leads/whatsapp` (Decision D1). Server components fetch the first page; a small client component handles the composer and polling. Styling reuses `app/leads/leads.css` variables (navy `#0f172a`, accent per the CRM's palette; the brief's "gold" maps to the house amber `#B8892A`).

| Route | Phase | Content |
|---|---|---|
| `/leads/whatsapp` | 2 | Two-pane inbox. Left: conversation list (search by name or number, filters Open / Unread / Archived / Window open / Linked to lead / Unlinked, unread badge, last message preview, window countdown). Right: thread with bubbles, timestamps, status ticks (sent, delivered, read, failed with reason), "load older" pagination. |
| (right panel) | 2 | Contact card: name, profile name, username, **full phone number** when known, **Call now** (`tel:+91...`), **Copy number**, BSUID shown only in a details fold, linked lead (stage, programme, university, next call) with link to `/leads`, "Link to lead" search, "Create lead" (needs a phone number), call reminder (date/time), log call outcome, counselling-call permission state, notes. |
| (composer) | 2 | Free text when the 24 h window is open, with the remaining time shown. When closed, the text box is disabled and a template picker appears (from Phase 4; until then, "Window closed, a template is needed" with no send). "Request phone number" button when no number is known. Monthly service-message counter and estimated cost beside Send. |
| `/leads/whatsapp/contacts` | 3 | Contact table, segments, tags, consent, CSV import with preview. |
| `/leads/whatsapp/templates` | 4 | Sync, create, preview, status, rejection reason. |
| `/leads/whatsapp/campaigns` | 5 | Campaign list, builder, eligibility count, cost estimate, confirm, progress, pause, cancel, export. |
| `/leads/whatsapp/analytics` | 6 | Counts and rates from stored data, estimated vs Meta-billed spend. |
| `/leads/whatsapp/settings` | 2 | Kill switches (sending, campaigns, automation), monthly cap, rate table, opt-out keywords. |

The CRM's existing lead page gets one small addition in Phase 2: a "WhatsApp" link on leads that have a linked conversation. That is the only edit to existing CRM files, and it is optional.

Mobile: the two panes collapse to list then thread, and Call now sits in the thread header so a counsellor on a phone can tap straight to the dialler.

---

## 5. API endpoint requirements

All under `app/api/whatsapp/`. Every `admin/*` route starts with `requireAdmin()` (moved from `app/leads/actions.ts` to `lib/admin-guard.ts`, with the leads actions importing it, so there is one implementation), then a per-route rate limit, then input validation. Responses carry `Cache-Control: no-store`. Request bodies are validated with small hand-written guards (the project has no zod; adding it is optional).

| Method and path | Phase | Purpose |
|---|---|---|
| `GET /api/whatsapp/webhook` | exists | Meta verification. Unchanged. |
| `POST /api/whatsapp/webhook` | 1 | Verify, persist, process, 200. Replaces the in-memory dedupe. |
| `GET /api/cron/whatsapp-sweep` | 1 | `Bearer CRON_SECRET`. Retries pending and failed events, resets stuck `processing` rows older than 5 minutes, applies retention. |
| `GET /api/whatsapp/admin/conversations?cursor&filter&q` | 2 | Keyset-paginated list (25 per page). |
| `GET /api/whatsapp/admin/conversations/:id/messages?before` | 2 | Keyset-paginated thread (50 per page). |
| `GET /api/whatsapp/admin/changes?since` | 2 | Cheap poll: returns conversation ids changed since a timestamp, and the unread total. One indexed query. |
| `POST /api/whatsapp/admin/conversations/:id/read` | 2 | Zero the unread count. Also sends Meta a read receipt only if Decision D10 says so. |
| `POST /api/whatsapp/admin/conversations/:id/archive` | 2 | Archive or unarchive. |
| `POST /api/whatsapp/admin/send` | 2 | `{conversationId, clientRef, kind: 'text'|'request_contact_info', text?}`. Checks: sending enabled, window open, monthly cap, rate limit (10 per minute per session), text length (4,096 max). Writes audit log. |
| `POST /api/whatsapp/admin/contacts/:id/link-lead` | 2 | Link or unlink a lead. |
| `POST /api/whatsapp/admin/contacts/:id/create-lead` | 2 | Creates a `leads` row with `source='whatsapp'`, `channel='whatsapp'`, using the same insert rules as `/api/enquiry`. |
| `POST /api/whatsapp/admin/contacts/:id/consent` | 2 | Record or withdraw a consent purpose. |
| `POST /api/whatsapp/admin/call-tasks` and `PATCH .../:id` | 2 | Schedule a call, record outcome. |
| `POST /api/whatsapp/admin/notes` | 2 | Internal note. |
| `GET /api/whatsapp/admin/media/:messageId` | 2 | On-demand media proxy (allowlisted MIME, size cap, attachment disposition). |
| `GET/POST /api/whatsapp/admin/settings` | 2 | Kill switches, cap, rates. |
| `/api/whatsapp/admin/contacts/*`, `.../imports/*` | 3 | Contact CRUD, segments, CSV import preview and commit. |
| `/api/whatsapp/admin/templates/*` | 4 | Sync from `GET /<WABA_ID>/message_templates`, create via `POST`, delete. |
| `/api/whatsapp/admin/campaigns/*` | 5 | CRUD, estimate, confirm-launch, pause, cancel, export. |
| `GET /api/cron/whatsapp-sweep` (extended) | 5 | Also drains campaign batches. |

Outbound Graph calls live only in `lib/whatsapp/graph.ts`: `sendText`, `sendInteractiveRequestContactInfo`, `sendTemplate`, `getMediaUrl`, `listTemplates`, `deleteContactBookEntry`. Each takes an explicit `AbortSignal` timeout (10 s) and maps Meta errors to our states.

---

## 6. Security considerations

### 6.1 Authentication and authorisation
- Pages under `/leads/whatsapp` are covered by the existing middleware guard and 2FA login. No new login.
- Every API route calls `requireAdmin()` itself, since middleware does not guard `/api/*`. A test (`lib/whatsapp/routes-guard.test.ts`) walks `app/api/whatsapp/admin/**/route.ts` and fails if a file does not import and call the guard.
- CSRF: the session cookie is `SameSite=Strict`, and mutating routes also require `Content-Type: application/json` and a same-origin `Origin` header.
- Per-user identity (who sent what) is Decision D2. Until then `sent_by='admin'` and the audit log records the hashed IP.

### 6.2 Database
- RLS on every `wa_` table with no policies: only the service role can read or write, which is the posture of `leads` and `reviews`.
- `security definer` functions pin `search_path` and revoke execute from `anon` and `authenticated`.
- The anon key in the browser bundle can do nothing with these tables. Test: an anon-key `select` on each table returns zero rows or an error.

### 6.3 Webhook
- Signature check stays as built (raw bytes, timing-safe). Body cap stays at 1 MB.
- Unknown `field` values, unknown message types and malformed entries are stored with the raw event and marked `completed` with nothing projected (type `unsupported`), never thrown.
- Logs: counts and types only, as today.

### 6.4 Content rendering
- Message bodies are plain React text nodes. Profile names and usernames likewise.
- Media and documents are never rendered inline from an untrusted URL. Images are shown only through the proxy after an explicit click; documents always download.

### 6.5 Secrets
- `WHATSAPP_ACCESS_TOKEN` should be a **System User** token with only `whatsapp_business_messaging` and `whatsapp_business_management`, not a personal or temporary token (Decision D4).
- No `NEXT_PUBLIC_` prefix on any WhatsApp variable. A build check greps `.next/static` for the token prefix and fails if found.

### 6.6 Privacy and consent
- An inbound message implies consent to a **reply** within the service window only. It is not consent to marketing.
- An existing CRM lead is not WhatsApp marketing consent. Lead-form wording today covers "contact you via WhatsApp or phone" for guidance. That supports service and counselling-call purposes for people who submitted a form, not promotions (Decision D8 asks Rishi to confirm the wording and update the privacy policy).
- Opt-out keywords (STOP, UNSUBSCRIBE, and Hindi equivalents to be agreed) received in any message record `marketing=false` and `utility_updates=false` at once. Meta's `user_preferences` webhook, which reports a user stopping marketing messages, is also subscribed and recorded.
- Deletion: an admin "Delete contact" action removes the contact and all messages, calls Meta's contact book delete for the BSUID, and keeps one audit row with no personal data.
- India's DPDP Act 2023 applies to this data. The privacy policy update (D8) should state what is stored, why, for how long, and how to withdraw. I am not giving legal advice; Rishi may want a lawyer to read the final wording.

---

## 7. Estimated hosting and database resource consumption

Assumptions (to be replaced with real numbers after two weeks of Phase 1): 100 inbound and 100 outbound messages a day, one or two admins working 8 hours a day.

| Source | Calculation | Per month |
|---|---|---|
| Webhook: inbound messages | 100/day | ~3,000 invocations |
| Webhook: outbound statuses | 100 sent × ~3 statuses (sent, delivered, read) | ~9,000 invocations |
| Sweeper cron | every 5 min | ~8,600 invocations, most return after one indexed query |
| Inbox polling | `changes` every 15 s while the tab is visible, 8 h/day, 2 admins; stops when hidden | ~115,000 invocations |
| Admin reads and sends | estimate | ~10,000 invocations |
| **Total functions** | | **~145,000 invocations, each typically under 300 ms** |

Polling is the largest item. It can be cut by half with 30 s polling or by pausing after 5 minutes of no input. Both are settings, not code changes. The webhook itself is under 10% of the load.

Database storage:

| Table | Row size incl. indexes (est.) | Rows per month | Per month |
|---|---|---|---|
| `wa_messages` | ~1 KB | 6,000 | ~6 MB |
| `wa_message_statuses` | ~0.4 KB | 9,000 | ~4 MB |
| `wa_webhook_events` (payload kept 30 days) | ~3 KB | 12,000 | ~36 MB rolling, not growing |
| Everything else | | | <1 MB |

So about 10 MB of permanent growth a month and ~36 MB of rolling raw payloads: comfortable inside a 500 MB database for years at this volume. Database load is a few queries per invocation, all on indexes.

Campaigns (Phase 5): a 1,000-recipient campaign drained 50 per minute takes 20 cron runs of a few seconds each. Negligible next to polling.

Build cost: the whole project ships in about four production deploys (Section 11), in line with the batching rule.

**Meta charges are the real cost, not hosting.** Since 1 Oct 2026, manual replies (service messages) are charged per delivered message after the first 1,000 free per business number per month, and utility templates sent inside the window are charged too. Rates come from Meta's INR rate card, which Rishi enters into settings (D6). The status webhook's `pricing` object (`billable`, `category`, `type`, `subtype`) is stored, so actual billable counts can be checked against the estimate.

---

## 8. Required environment variables

All server-only, set on Vercel project **edify-edu-dh2m** (not as unlinked shared vars), Production scope, marked Sensitive where secret.

| Name | Secret | Used by | Status |
|---|---|---|---|
| `WHATSAPP_VERIFY_TOKEN` | yes | webhook GET | linked to dh2m (25 Nov audit) |
| `META_APP_SECRET` | yes | webhook POST signature | linked to dh2m (25 Nov audit) |
| `WHATSAPP_ACCESS_TOKEN` | yes | all Graph calls | added per Rishi, not deployed; link state unchecked |
| `WHATSAPP_PHONE_NUMBER_ID` | no, keep server-only | send, contact book, media | unchecked |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | no, keep server-only | templates | unchecked |
| `WHATSAPP_GRAPH_VERSION` | no | Graph URL | new, optional, default `v26.0` |
| `CRON_SECRET` | yes | sweeper and existing due-calls cron | **exists but unlinked from dh2m**; both crons 401 until linked |
| `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` | key yes | DB | existing |
| `ADMIN_SESSION_TOKEN` | yes | admin guard | existing |

Phase 1 runs without the access token (it only receives). Phase 2 needs the token, phone number id and `CRON_SECRET`.

---

## 9. Development phases

Each phase is its own branch from `origin/main`, its own QA pass by qa-checker, and its own merge. No phase starts until the previous one is live and checked.

| Phase | Branch | Delivers | Ships to production? | Depends on |
|---|---|---|---|---|
| 1 | `feat/wa-1-durable-webhook` | Migration, `wa_process_event`, new webhook body, sweeper cron, tests. Webhook still sends nothing. | Yes, with Phase 2 or alone (D5) | D1, D7, B3, migration run by Rishi |
| 2 | `feat/wa-2-inbox` | Inbox, manual replies in window, request contact info, phone visibility, Call now, copy, link and create lead, call reminders and outcomes, notes, archive, settings and kill switches, privacy policy update. | Yes | Phase 1 live, D2, D4, D6, D8, B1, B2 |
| 3 | `feat/wa-3-contacts` | Contacts, segments, tags, consent screens, CSV import with preview (no sends). | Yes | Phase 2 live |
| 4 | `feat/wa-4-templates` | Template sync, create, preview, status; template sends to one contact outside the window. | Yes | Phase 3, templates approved by Meta |
| 5 | `feat/wa-5-campaigns` | Queue, campaign builder, eligibility, cost estimate, caps, confirm, pause, cancel, auto-pause on error rate or quality drop, export. Ships with `campaigns_enabled=false`. | Yes, disabled | Phases 2 to 4 passed QA, D11 |
| 6 | `feat/wa-6-analytics` | Dashboard from stored data; estimated vs billed. | Yes | Phase 5 data |
| 7 | `feat/wa-7-automation` | Workflow engine with loop guards, AI reply drafts shown to the admin only. Every workflow off by default. | Yes, disabled | Explicit approval per workflow |

Content freeze note: CLAUDE.md freezes new public content pages until 9 Jan 2027. This project adds no public pages (all routes are under `/leads/` or `/api/`). The privacy policy edit in Phase 2 is a change to an existing legal page, not new content; it is listed as D8 for Rishi to approve.

Future (not scheduled): WhatsApp Business Calling API. Meta supports user-initiated calls wherever Cloud API is available, and business-initiated calls outside the US, Canada, Egypt, Vietnam and Nigeria, subject to per-user call permissions and a messaging limit of at least 2,000 unique recipients a day. It needs WebRTC handling in the browser and its own pricing. Revisit after Phase 2 shows how many counselling calls start from WhatsApp.

---

## 10. Testing strategy

All automated tests use mock data and run with `npx tsx <file>` like the existing `lib/*.test.ts`. No test calls the real Graph API: `lib/whatsapp/graph.ts` takes an injectable `fetch`. Database tests run against a **separate Supabase project or a local Postgres** (Decision B4), never the production database.

| Area | Test |
|---|---|
| Signature | valid, wrong secret, missing header, wrong prefix, non-hex, re-serialised JSON (must fail), 1 MB + 1 byte |
| Idempotency | same payload twice, same payload concurrently from 10 parallel requests: one event row, one message row |
| DB failure | event insert fails → 500; processing throws → 200, event `failed`, sweeper later completes it |
| Stuck processing | row left `processing` for 6 minutes is reclaimed once |
| Out-of-order statuses | `read` then `delivered` then `sent` leaves status `read`; status before outbound wamid is stored joins up later |
| Payload variety | text in Hindi and Tamil, emoji, image, document, location, contacts (`origin` both values), reaction, interactive reply, unsupported type, system `user_changed_number`, username-only sender with no phone |
| Phone | normalisation table: 10-digit Indian, with +91, with 0 prefix, foreign, too short, letters |
| Lead linking | exact digit match links once; different formatting still matches; no match leaves unlinked |
| Authorisation | every admin route without cookie → 401; wrong cookie → 401; route-guard walker test |
| RLS | anon key cannot select from any `wa_` table |
| Window | send at 23 h 59 m allowed, at 24 h 1 m refused with "template needed" |
| Consent | STOP sets marketing and utility false; marketing send refused for that contact |
| Spend cap | send refused once the month's estimated spend reaches the cap |
| Outbound uncertainty | Graph timeout → `unknown`, no automatic retry, UI warning |
| Logging | grep test: no `console.*` in WhatsApp code prints body, phone, name or payload |
| XSS | `<img src=x onerror=alert(1)>` as message text renders as text |
| Secrets | built `.next/static` contains no access token or app secret |
| UI | inbox at 375 px and 1280 px; keyboard send; unread badge; Call now opens `tel:` |
| Site regression | `npm run build`, `npm run lint`, pre-commit gates, qa-checker pre-merge and live checks; enquiry form still creates a lead; `/leads` still loads; sitemap and robots unchanged (diff of built `robots.txt` and `sitemap.xml`) |

Manual end-to-end test after deploy: Rishi's own second phone only. No student is messaged during development or QA.

---

## 11. Deployment and rollback strategy

1. **Migrations first, by Rishi.** Each phase's SQL is additive and is run in the Supabase SQL editor before its deploy, the same way `lead_attribution` was. Every migration has a matching `down` file (`drop table` of the new tables only) kept beside it, never run automatically. No existing table changes in Phases 1 and 2.
2. **One deploy per phase.** Merge to `main` only after build, lint, gates and qa-checker pass. Phase 1 and 2 can go together if Rishi prefers fewer deploys (D5).
3. **Kill switches before code rollback.** `wa_settings.sending_enabled`, `campaigns_enabled` and `automation_enabled` stop all outbound activity within one request, with no deploy.
4. **Webhook rollback.** If the new webhook misbehaves, `git revert` restores the receive-only version. Events already stored stay in the tables. Meta retries any delivery that got a non-200, for a limited period, so a short outage loses nothing.
5. **Live checks after each deploy:** GET verify with the token returns the challenge; unsigned POST returns 401; a test message from Rishi's phone appears in the inbox; homepage, a university page, `/compare`, `/leads` and the enquiry form still work (`?cb=` to bypass Cloudflare's HTML cache); `robots.txt` and `sitemap.xml` unchanged.
6. **What cannot be undone by git:** running a migration, changing Vercel env vars, Meta app settings and the contact book setting. All are Rishi's actions and listed in Section 12.

---

## 12. Blockers and decisions requiring Rishi's approval

### Blockers (need Rishi's action before Phase 1 or 2 can ship)

| # | Blocker | Why | Rishi's action |
|---|---|---|---|
| B1 | Link `CRON_SECRET` to edify-edu-dh2m | The sweeper cron needs it, and the existing daily call-list email has been failing with 401 because of it | Vercel, team env vars, `CRON_SECRET`, link to edify-edu-dh2m, Production. Redeploy comes with the next merge. |
| B2 | Confirm WhatsApp env vars | I could not read env state from this session | In Vercel, edify-edu-dh2m, Settings, Environment Variables, confirm `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` are present for Production, linked to this project (not only shared), and Sensitive. |
| B3 | Supabase plan and size | Sizing and retention assume the free tier's 500 MB | Tell me the plan, or paste the database size from Supabase, Settings, Usage. |
| B4 | Test database | Tests must never touch production | Approve creating a free second Supabase project for development, or I use a local Postgres in Docker. |
| B5 | Meta billing currency | Meta: eligible Indian customers must move messaging accounts to INR by 31 Dec 2026, or messages stop from 1 Jan 2027 | Check WhatsApp Manager, billing, for an INR notice and migrate if shown. |
| B6 | Payment method on the WhatsApp account | Meta stopped delivering service messages from 1 Oct 2026 for integrations without one | Your outbound test suggests it is fine; confirm a card or prepaid UPI balance is set. |
| B7 | Confirm real messages reach the webhook | Section 1.2 | Vercel Logs: one `[whatsapp-webhook] received` line with `"messages":` above 0. |

### Decisions

| # | Decision | Recommendation |
|---|---|---|
| D1 | Where the inbox lives: `/admin/whatsapp` (your brief) or `/leads/whatsapp` | **`/leads/whatsapp`.** `app/admin/` is the retired CMS that CLAUDE.md says not to touch, and its layout would wrap our pages. `/leads/` already has the guard, noindex headers and CRM styling. |
| D2 | Who uses the inbox | If only you: keep the shared login for Phases 1 and 2. If counsellors will log in: add per-user accounts (email + OTP, a `admin_users` table, signed per-user session) as a small Phase 2a, so every send is attributed. |
| D3 | Lead auto-linking | Auto-link a contact to a lead when the phone digits match exactly; everything else manual. |
| D4 | Access token type | System User token with only `whatsapp_business_messaging` and `whatsapp_business_management`. Confirm the token in Vercel is that kind and not a 24-hour or personal token. |
| D5 | Deploy batching | Ship Phases 1 and 2 together as one deploy, so the inbox arrives with the storage it reads. |
| D6 | Spend controls for replies | Set a monthly cap for billed service messages (for example "stop sending after 1,000 free + N billed"), and enter INR rates from Meta's rate card in settings. I will not hardcode rates. |
| D7 | Retention | As in Section 3: raw payloads 30 days, messages 24 months, consent while the contact exists + 3 years, audit 3 years. |
| D8 | Privacy policy and consent wording | Approve an edit to `/privacy-policy` describing WhatsApp message storage, purpose, retention and opt-out, and confirm the lead-form wording counts as consent for service replies and counselling calls only. |
| D9 | Media archiving | Off. Fetch media on demand only; revisit Supabase Storage if counsellors need documents kept. |
| D10 | Read receipts to students | Do not send blue ticks automatically when an admin opens a thread; add a "Mark read on WhatsApp" button instead. |
| D11 | Campaign approvals | Phase 5 launch requires two clicks with the recipient count and estimated cost on screen, plus a typed confirmation for any campaign above a threshold you choose. |
| D12 | Opt-out keywords | STOP, UNSUBSCRIBE, and Hindi equivalents (for example "band karo"); you confirm the list. |

### Not blocked, ready to start on approval

Phase 1 code and tests can start as soon as D1 and B4 are answered. Nothing touches production until the migration is run and the branch passes QA.

---

## Sources

- Meta, Business-scoped user IDs: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-scoped-user-ids/
- Meta, WhatsApp pricing: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Meta, non-template message pricing (1 Oct 2026): https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages
- Meta, Cloud API changelog: https://developers.facebook.com/documentation/business-messaging/whatsapp/changelog
- Meta, Graph API v26.0: https://developers.facebook.com/docs/graph-api/changelog/version26.0
- Meta, Cloud API Calling: https://developers.facebook.com/documentation/business-messaging/whatsapp/calling

Pages read 26 Nov 2026. Meta's BSUID page references a 5 Nov 2026 changelog entry that the changelog page did not show when read; re-read both before Phase 1 code is written.
