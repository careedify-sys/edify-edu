# WhatsApp inbox (Phase 2) runbook

The inbox lives at `/leads/whatsapp`, behind the existing CRM login. It shows WhatsApp conversations stored by the Phase 1 webhook and lets a person reply by hand. Nothing is sent automatically. Campaigns and automation stay off (`campaigns_enabled` and `automation_enabled` are false, and no code reads them as true).

## Migration

File: `supabase/migrations/20261202120000_whatsapp_inbox.sql`.

**What it does.** Additive only:
- 3 new tables: `wa_notes`, `wa_consent`, `wa_audit_log`;
- 2 new indexes: `wa_messages (created_at)` and `wa_message_statuses (received_at)`;
- 11 new functions;
- 7 new settings rows.

It does not alter or replace any Phase 1 table, column or function, so the live webhook and the live sweep keep working whether or not it has run. It was checked on PGlite (42 SQL tests) and on a real PostgreSQL server with every migration applied in order (`scripts/whatsapp/cap-race.mjs`).

**How to run it.**

1. Open the Supabase dashboard, then SQL Editor, then New query.
2. Paste the whole file and press Run. It is safe to run twice: everything is `if not exists`, `create or replace` or `on conflict do nothing`. The two index builds lock `wa_messages` and `wa_message_statuses` against writes for as long as they take, which is milliseconds at today's size. A webhook arriving in that moment waits; it is not lost.
3. Run this check and paste the result:

   ```sql
   select key from wa_settings order by key;
   ```

   Expect exactly 10 rows: `automation_enabled`, `billing_timezone`, `campaigns_enabled`, `cap_override`, `free_service_allowance`, `last_retention`, `last_sweep`, `monthly_cap_inr`, `rates`, `sending_enabled`.

4. Optional second check, which should return 12:

   ```sql
   select count(*) from pg_proc where proname in ('wa_list_conversations','wa_conversations_changed','wa_leads_by_digits','wa_is_opt_out','wa_contact_opted_out','wa_reserve_outbound','wa_finish_outbound','wa_month_usage','wa_record_opt_outs','wa_apply_retention','wa_crm_contact_blocks') or proname = 'wa_purge_raw_bodies';
   ```

   That is the 11 Phase 2 functions plus Phase 1's `wa_purge_raw_bodies`, which should still be present.

Deploy only after the 10-row result is in hand. Without the migration, the page loads, shows a red banner and blocks sending. The sweep logs "opt-out step failed" but keeps doing its Phase 1 work.

**Rollback.**

1. Revert the Phase 2 merge commit on main and push. That is one Vercel build. The Phase 2 tables are harmless without the code.
2. Only if the tables must go as well, and only after step 1 is live, run `20261202120000_whatsapp_inbox.down.sql`. It deletes inbox notes, consent records (including recorded opt-outs) and the audit log. Phase 1 tables, stored messages and the webhook are untouched.

## After the deploy

1. Open `/leads/whatsapp`, then **Settings**.
2. Press **Check WhatsApp connection**. Each of `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` and `META_APP_SECRET` should read `ok`. The token should be `SYSTEM_USER` and expire `never` (D4). No value is ever shown.
3. Under **Health**, the retry job should say it last ran within 5 minutes. If it says "No run recorded yet" 10 minutes after the deploy, the cron is not running (requirement 8).
4. Sending stays **off** until the owner switches it on in Settings.

## What blocks a reply

Every rule is checked twice:
- once in the page, which gives a clear message;
- once in the database, inside `wa_reserve_outbound`. This is the authoritative check. It runs under a lock, so two replies at the same moment are checked one after the other.

When a rule blocks, nothing is written and nothing reaches Meta. A reply is refused when:

- sending is switched off;
- the student's last message is more than 24 hours old (a template is needed, which comes in a later phase);
- the student opted out (see below);
- the reply would take this month's estimated charges over the cap. The cap is ₹500 by default, and the owner can raise it for one month.

A reply that Meta does not confirm (timeout or a Meta server error) is marked "not confirmed" and never retried, so a student is never messaged twice by accident.

**Concurrency proof.** `scripts/whatsapp/cap-race.mjs` sends 20 reservations at once from 20 separate connections against a real PostgreSQL server, with room in the cap for 3.
- Result on 27 Nov 2026: 3 reserved, 17 refused.
- The same race against a copy of the function without the lock let all 20 through, which shows the test catches an overspend.

## Opt-outs and calls

- **STOP and similar words.** A message that is only STOP, UNSUBSCRIBE, STOP ALL, "band karo", "mat bhejo" or "no more messages" blocks replies at once. Within 5 minutes the sweep records a No for both "Replies on WhatsApp" and "Counselling calls" (recorded by `system`).
- **Other words.** If a student opts out in their own words, the person reading records a No under Consent. A No to replies also records a No to calls.
- **Resuming.** Replies resume only when a person records a new Yes with evidence. Another message from the student does not unblock on its own.
- **Call now.** It works only when the latest "Counselling calls" record is a Yes and the student has not opted out. Starting a chat is not permission to call. Copy number always works, so the CRM keeps working.
- **The CRM at /leads follows the same rules** for leads linked to a WhatsApp contact (`wa_crm_contact_blocks`). After a call No or an opt-out, its Call button is disabled. After an opt-out, its WhatsApp button is disabled too. A lead created from WhatsApp has Call disabled until a call Yes is recorded. Enquiry-form leads with no WhatsApp link are unchanged. Before the migration runs, the list is empty and the CRM behaves as before.

## Retention (Q-WA2, approved 27 Nov 2026)

- **Raw webhook bodies:** deleted 30 days after receipt. Phase 1 `wa_purge_raw_bodies` does this on every sweep run.
- **Messages, notes, delivery statuses, identity history and the audit log:** deleted 24 months after they were written.
- **Contacts with no activity for 24 months:** deleted with everything attached, by `wa_apply_retention` from the sweep. It runs at most once every 20 hours and deletes at most 5,000 rows per table per run. The last run's counts are in the `last_retention` setting.
- **Consent records:** kept while the contact exists, as the privacy policy says.
- **Privacy deletion requests:** the owner uses **Delete WhatsApp data** on the contact. The linked CRM lead is separate. If the student asks for that too, delete it in Supabase by hand, because the CRM has no delete button.

## Third-party tags

The root layout does not load Microsoft Clarity, the Meta Pixel, Google Analytics or Ads, or the Tawk chat on `/leads`, `/leads/*` or `/admin-login`. Clarity records page text and would otherwise capture messages and lead details. As a second guard, the `/leads` layout:
- marks its content `data-clarity-mask`;
- stops Clarity and shuts down Tawk if either is already running from a client-side navigation.

## Rates

Seeded from Meta's INR list-rate card, India row, effective 1 Oct 2026, read 26 Nov 2026. Per delivered message:
- service ₹0.115;
- utility ₹0.115;
- authentication ₹0.115;
- authentication-international ₹2.4971;
- marketing ₹0.8631.

Each business number also gets 1,000 free service messages per month. All of these are settings, and the source row is in `audits/verify/meta-whatsapp-inr-rates-2026-11-26.md`. Meta can change rates on the first day of a quarter (1 Jan, 1 Apr, 1 Jul, 1 Oct), so re-check the card then and update Settings.

## Local development

```
WA_INBOX_MOCK=1 ADMIN_SESSION_TOKEN=local-mock-session npx next dev -p 3107
```

You can also use the `wa-inbox-mock` entry in `.claude/launch.json`.

1. Set the cookie `edify_admin_session=local-mock-session` in the browser.
2. Open `/leads/whatsapp`.

Mock mode uses fake contacts and a fake Meta, and nothing is sent or saved. It is ignored when `NODE_ENV` is `production`.

## Tests

```
npx tsx lib/whatsapp/graph-spend.test.mts
npx tsx lib/whatsapp/inbox-service.test.mts
npx tsx lib/whatsapp/ingest.test.mts
PGLITE_MODULE=file:///<dir>/node_modules/@electric-sql/pglite/dist/index.js npx tsx lib/whatsapp/sql.test.mts
```

To run the real-Postgres race, copy `scripts/whatsapp/cap-race.mjs` into an empty folder outside the repo, run `npm init -y && npm i embedded-postgres pg@8` there, then `node cap-race.mjs <repo>`. The database lives in a temporary OS folder.
