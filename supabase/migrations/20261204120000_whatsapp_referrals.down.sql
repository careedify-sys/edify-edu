-- Undo 20261204120000_whatsapp_referrals.sql. NOT run automatically.
-- Run only AFTER the Phase 4 code is reverted and that revert is live.
-- Deletes referrals, their activity, reward rules, automation rules and
-- history, and the media file records. Files in the 'wa-media' Storage
-- bucket are NOT deleted here: empty the bucket in the Supabase dashboard
-- if you want them gone. Messages, contacts, consent and campaigns stay.

drop trigger if exists wa_messages_auto_takeover on wa_messages;
drop function if exists wa_auto_takeover();
drop function if exists wa_auto_finish(uuid, text, uuid, text);
drop function if exists wa_auto_claim(uuid, text);
drop function if exists wa_auto_candidates(integer);
drop function if exists wa_campaign_referral_stats(uuid);
drop function if exists referral_count_open(text);
drop function if exists referral_submit(text,text,text,text,text,text,text,text,text,text,boolean,text,text);
drop function if exists wa_conversation_for_phone(text, text);
drop function if exists wa_reserve_template(uuid, uuid, uuid, text, jsonb, text);

-- Phase 1 wa_process_event, exactly as 20261201120000 created it.
create or replace function wa_process_event(p_event_id bigint)
returns jsonb language plpgsql set search_path = public as $$
declare
  ev record; v_payload jsonb; v_summary jsonb; v_state text; v_constraint text;
begin
  select id, state, raw_body into ev
    from wa_webhook_events where id = p_event_id
     for update skip locked;
  if not found then
    return jsonb_build_object('state', 'busy');
  end if;
  if ev.state = 'completed' then
    return jsonb_build_object('state', 'completed', 'already', true);
  end if;
  if ev.raw_body is null then
    update wa_webhook_events set state = 'failed', last_error = 'no raw body' where id = p_event_id;
    return jsonb_build_object('state', 'failed');
  end if;

  -- attempts was counted by wa_begin_attempt in its own transaction.

  begin
    begin
      v_payload := ev.raw_body::jsonb;
    exception when untranslatable_character then
      -- jsonb refuses \u0000; drop it rather than lose the whole delivery.
      v_payload := replace(ev.raw_body, '\u0000', '')::jsonb;
    end;
    v_summary := wa_apply_payload(v_payload);
    update wa_webhook_events
       set state = 'completed', processed_at = now(), last_error = null, summary = v_summary
     where id = p_event_id;
    return v_summary || jsonb_build_object('state', 'completed');
  exception when others then
    get stacked diagnostics v_state = returned_sqlstate, v_constraint = constraint_name;
    update wa_webhook_events
       set state = 'failed',
           last_error = left(v_state || coalesce(' ' || nullif(v_constraint, ''), ''), 120)
     where id = p_event_id;
    return jsonb_build_object('state', 'failed', 'sqlstate', v_state);
  end;
end $$;
drop function if exists wa_apply_template_events(jsonb);

drop table if exists wa_auto_replies;
drop table if exists wa_auto_rules;
alter table wa_conversations drop column if exists auto_off;
drop table if exists referral_form_opens;
drop table if exists referral_rate_hits;
drop table if exists referral_activity;
drop table if exists referrals;
drop table if exists referral_reward_rules;
drop index if exists wa_campaigns_ref_token_uidx;
alter table wa_campaigns drop column if exists ref_token;
alter table wa_templates drop column if exists header_file_id;
drop table if exists wa_media_files;
delete from wa_settings where key in ('referral_disclosure','referral_terms_version','referral_confirm_whatsapp');
-- Leads created by referrals (source 'referral') stay in the CRM.

select pg_notify('pgrst', 'reload schema');
