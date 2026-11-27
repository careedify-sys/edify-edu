-- Undo 20261203120000_whatsapp_campaigns.sql. NOT run automatically.
-- Run only AFTER the campaign code is reverted and that revert is live.
-- Deletes lists, templates cache, campaigns and their recipient rows.
-- Contacts created by imports stay (they are ordinary wa_contacts rows and
-- follow the 24-month retention), as do consent records and every message.
-- The wider wa_consent source list and the obtained_on column stay: rows may
-- use them, and narrowing would fail or lose evidence. Both are harmless to
-- the Phase 2 code.

drop function if exists wa_campaign_retention();
drop function if exists wa_campaign_stats(uuid);
drop function if exists wa_campaign_release(uuid[]);
drop function if exists wa_campaign_finish(uuid, text, text, integer, text);
drop function if exists wa_campaign_claim(uuid, integer, text);
drop function if exists wa_campaign_control(uuid, text);
drop function if exists wa_campaign_approve(uuid, text, integer, uuid);
drop function if exists wa_campaign_preview(uuid);
drop function if exists wa_campaign_stop_codes();
drop function if exists wa_campaign_spend(text);
drop function if exists wa_campaign_add_recipients(uuid, uuid[], uuid, uuid);
drop function if exists wa_record_marketing_opt_outs();
drop function if exists wa_numbers_status(text[]);
drop function if exists wa_campaign_ineligible(uuid);
drop function if exists wa_is_marketing_opt_out(text, text);
drop function if exists wa_import_numbers(text[], uuid, text, text);

drop table if exists wa_campaign_recipients;
drop table if exists wa_campaigns;
drop function if exists wa_campaign_recipients_guard();
drop function if exists wa_campaign_guard();
drop table if exists wa_templates;
drop table if exists wa_list_members;
drop table if exists wa_lists;
drop index if exists wa_messages_reply_to_idx;

delete from wa_settings where key in
  ('campaign_budget_daily_inr', 'campaign_budget_monthly_inr', 'campaign_default_batch', 'campaign_tax_pct', 'campaign_daily_max');

-- Phase 2 inbox list, exactly as 20261202120000_whatsapp_inbox.sql left it.
create or replace function wa_list_conversations(
  p_status text, p_search text, p_unread_only boolean,
  p_before_at timestamptz, p_before_id uuid, p_limit int
) returns table (
  id uuid, contact_id uuid, status text, unread_count int,
  last_message_at timestamptz, last_inbound_at timestamptz, last_message_preview text,
  phone_e164 text, bsuid text, username text, profile_name text,
  lead_id uuid, lead_name text, lead_stage text, updated_at timestamptz
) language sql stable set search_path = public as $$
  with q as (
    select nullif(btrim(coalesce(p_search, '')), '') as s,
           regexp_replace(coalesce(p_search, ''), '[^0-9]', '', 'g') as d
  ), pat as (
    -- Escape LIKE wildcards so a search for "50%" matches literally.
    select s, d, '%' || replace(replace(replace(s, '\', '\\'), '%', '\%'), '_', '\_') || '%' as like_s from q
  )
  -- last_message_at falls back to created_at so the keyset paging key is never null.
  select cv.id, cv.contact_id, cv.status, cv.unread_count,
         coalesce(cv.last_message_at, cv.created_at), cv.last_inbound_at, cv.last_message_preview,
         ct.phone_e164, ct.bsuid, ct.username, ct.profile_name,
         ct.lead_id, l.name, l.stage, cv.updated_at
    from wa_conversations cv
    join wa_contacts ct on ct.id = cv.contact_id
    left join leads l on l.id = ct.lead_id
    cross join pat
   where (p_status is null or cv.status = p_status)
     and (not coalesce(p_unread_only, false) or cv.unread_count > 0)
     and (p_before_at is null
          or (coalesce(cv.last_message_at, cv.created_at), cv.id) < (p_before_at, coalesce(p_before_id, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
     and (pat.s is null
          or ct.profile_name ilike pat.like_s
          or ct.username     ilike pat.like_s
          or l.name          ilike pat.like_s
          or (length(pat.d) >= 4 and ct.phone_e164 like '%' || pat.d || '%'))
   order by coalesce(cv.last_message_at, cv.created_at) desc, cv.id desc
   limit least(greatest(coalesce(p_limit, 30), 1), 50);
$$;
revoke all on function wa_list_conversations(text,text,boolean,timestamptz,uuid,integer) from public;

select pg_notify('pgrst', 'reload schema');
