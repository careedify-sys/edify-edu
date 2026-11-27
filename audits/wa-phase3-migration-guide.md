# WhatsApp Phase 3 (referral campaigns): migration and deploy guide

Branch `feat/wa-3-campaigns`. Nothing here sends a message. Campaign sending stays OFF after the migration and after the deploy, until you type ENABLE in Campaign settings.

## Order (do not change it)

1. **You** run the migration in Supabase (step A) and the verification queries (step B).
2. **You** paste the results of step B into the chat.
3. I check them. Only then do I merge to main and push. That push is one Vercel deploy.
4. I run the live checks (step D). Sending stays off.

The code works without the migration: the new screens show "migration has not been run" and nothing can send. The migration also works without the code: every new object is unused until the code ships.

## A. Run the migration

1. Open Supabase, project for edifyedu.in, SQL Editor, New query.
2. Paste the whole of `supabase/migrations/20261203120000_whatsapp_campaigns.sql` (776 lines) and press Run.
3. It must end with "Success. No rows returned". It is safe to run twice.

What it adds:
- 5 tables: `wa_lists`, `wa_list_members`, `wa_templates`, `wa_campaigns`, `wa_campaign_recipients`. RLS on, no policies, grants revoked from anon and authenticated.
- 16 functions, plus 5 settings: daily budget ₹250, monthly budget ₹2,000, default batch 50, tax 18%, Meta 24-hour limit 250. All of them are editable in Campaign settings.
- 3 compatible changes to Phase 2:
  - `wa_consent` gains an `obtained_on` date and three more consent sources;
  - the inbox list shows only chats where the student wrote first;
  - inbox spend (`wa_month_usage`) leaves campaign messages out, so the ₹500 inbox cap stays separate.

## B. Verification queries (paste all three results back)

```sql
select count(*) as functions from pg_proc where proname in (
  'wa_import_numbers','wa_numbers_status','wa_campaign_ineligible','wa_campaign_add_recipients',
  'wa_campaign_claim','wa_campaign_finish','wa_campaign_release','wa_campaign_stats',
  'wa_campaign_spend','wa_record_marketing_opt_outs','wa_campaign_retention','wa_list_conversations',
  'wa_campaign_preview','wa_campaign_approve','wa_campaign_control','wa_campaign_stop_codes');
-- expect 16

select key, value from wa_settings where key like 'campaign%' order by key;
-- expect 6 rows: campaign_budget_daily_inr 250, campaign_budget_monthly_inr 2000,
-- campaign_daily_max 250, campaign_default_batch 50, campaign_tax_pct 18, campaigns_enabled false

select
  (select count(*) from information_schema.columns where table_name = 'wa_campaigns' and column_name = 'resumed_at') as resumed_at_col,
  (select count(*) from information_schema.columns where table_name = 'wa_consent' and column_name = 'obtained_on') as obtained_on_col,
  (select position('wa_campaign_recipients' in prosrc) > 0 from pg_proc where proname = 'wa_month_usage') as inbox_cap_separated,
  (select bool_and(relrowsecurity) from pg_class where relname in ('wa_lists','wa_list_members','wa_templates','wa_campaigns','wa_campaign_recipients')) as rls_on,
  (select count(*) from pg_class where relname in ('wa_lists','wa_list_members','wa_templates','wa_campaigns','wa_campaign_recipients')) as new_tables,
  (select count(*) from information_schema.role_table_grants
    where table_name in ('wa_lists','wa_list_members','wa_templates','wa_campaigns','wa_campaign_recipients')
      and grantee in ('anon','authenticated')) as api_grants;
-- expect 1, 1, true, true, 5, 0
```

The 16 includes `wa_list_conversations`, which existed before. The other checks in the third query catch a run that stopped halfway.

Never re-run the Phase 2 file (`20261202120000_whatsapp_inbox.sql`) after this one. It would put back the old inbox spend function, and campaign messages would count against the ₹500 cap again.

If `campaigns_enabled` shows `true`, stop and tell me before anything else.

## C. Rollback

1. First revert the code. I run `git revert` of the merge and push, and wait for that deploy to go live.
2. Then you run `supabase/migrations/20261203120000_whatsapp_campaigns.down.sql` in the SQL Editor.

The down file:
- deletes lists, the template cache, campaigns and recipient rows;
- restores the Phase 2 inbox list and inbox spend functions;
- keeps contacts, consent records and every message.

## D. After the deploy (I run these; nothing is sent)

- Logged out, every `/leads/whatsapp/*` page and the CSV export redirect to the login.
- Every page carries noindex.
- Logged in, all seven tabs load, and Campaign settings shows sending OFF.
- The 5-minute sweep log shows `campaign: off`, and the Phase 2 inbox counts are unchanged.
- Meta check (read-only): Campaign settings, then Check now. It shows the quality rating and messaging limit.

## Cost estimate (Meta marketing rate ₹0.8631 per delivered message, set 26 Nov; tax 18% assumed until you confirm GST)

| Recipients | Before tax | Tax 18% | Total | Days at ₹250/day |
|---:|---:|---:|---:|---:|
| 100 | ₹86.31 | ₹15.54 | ₹101.85 | 1 |
| 500 | ₹431.55 | ₹77.68 | ₹509.23 | 3 |
| 1,000 | ₹863.10 | ₹155.36 | ₹1,018.46 | 5 |
| 5,000 | ₹4,315.50 | ₹776.79 | ₹5,092.29 | 21 by the daily budget, but the ₹2,000 month covers about 1,963, so about 3 months |

- These are maximums: Meta bills only delivered messages, and its invoice is final.
- ₹250 a day covers about 245 messages, and ₹2,000 a month about 1,963.
- Meta's own 24-hour limit (250 unique people on a new number) also applies. Confirm your tier in WhatsApp Manager.

## Before the first real campaign (yours, not blocking the deploy)

1. Confirm the Meta messaging limit and GST. You said you will do this.
2. Record marketing consent per number, with its source, date and evidence. Your list has no consent column, so every imported number starts as "unknown", and unknown is never messaged.
3. Create a Marketing template and wait for Meta's approval. Its text must not need a name or other variables.
4. Type ENABLE in Campaign settings, then approve a small first campaign, for example 10 people.

## Resources

- Vercel: no new cron, function or env var. Campaigns run inside the existing 5-minute sweep, now up to 60 s, with campaign work capped at 50 s.
- Supabase: 5 small tables. Recipient rows are deleted after 24 months.
- No paid provider was added.
