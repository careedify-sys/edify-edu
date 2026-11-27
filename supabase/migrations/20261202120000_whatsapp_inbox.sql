-- WhatsApp Phase 2: inbox at /leads/whatsapp.
--
-- Additive only. Nothing here changes a Phase 1 table, column or function, so
-- the live webhook keeps working whether or not this has run. The inbox page
-- shows "Run the Phase 2 migration" until it has.
--
-- Run in the Supabase SQL editor BEFORE the Phase 2 deploy goes live, then run
--   select key from wa_settings order by key;
-- and expect these 10 keys: automation_enabled, billing_timezone,
-- campaigns_enabled, cap_override, free_service_allowance, last_retention,
-- last_sweep, monthly_cap_inr, rates, sending_enabled.
--
-- Access: service_role only. RLS on with no policies; functions revoked from
-- public, anon and authenticated.

-- ── Tables ──────────────────────────────────────────────────────────────────

-- Internal notes on a conversation. Never sent to the student.
create table if not exists wa_notes (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references wa_conversations(id) on delete cascade,
  actor           text not null,
  body            text not null check (char_length(body) between 1 and 4000),
  created_at      timestamptz not null default now()
);
create index if not exists wa_notes_conv_idx on wa_notes (conversation_id, created_at desc);

-- Consent is append-only: the current answer for a purpose is the latest row.
-- Starting a chat is NOT consent to calls or promotions (D8), so nothing
-- writes here automatically; an admin records it with the evidence.
create table if not exists wa_consent (
  id          uuid primary key default gen_random_uuid(),
  contact_id  uuid not null references wa_contacts(id) on delete cascade,
  purpose     text not null check (purpose in ('service','counselling_call','utility','marketing')),
  granted     boolean not null,
  source      text not null check (source in ('lead_form','whatsapp_message','phone_call','admin_entry')),
  evidence    text check (char_length(evidence) <= 500),
  recorded_by text not null,
  recorded_at timestamptz not null default now()
);
create index if not exists wa_consent_contact_idx on wa_consent (contact_id, purpose, recorded_at desc);

-- Who did what. Detail holds ids and settings values, never message text or
-- phone numbers.
create table if not exists wa_audit_log (
  id         bigint generated always as identity primary key,
  actor      text not null,
  action     text not null,
  target     text,
  detail     jsonb,
  created_at timestamptz not null default now()
);
create index if not exists wa_audit_log_created_idx on wa_audit_log (created_at desc);

-- Monthly usage, opt-out scans and retention read messages by time.
create index if not exists wa_messages_created_idx on wa_messages (created_at);
create index if not exists wa_message_statuses_received_idx on wa_message_statuses (received_at);

alter table wa_notes     enable row level security;
alter table wa_consent   enable row level security;
alter table wa_audit_log enable row level security;

-- ── Settings ────────────────────────────────────────────────────────────────
-- Rates verified 26 Nov 2026 from Meta's INR list-rate card (linked from the
-- WhatsApp pricing page as "INR list rates"), effective 1 Oct 2026, India row.
-- They are data, editable in the inbox settings by the owner. Meta can change
-- them on the first day of any quarter, so the page shows verified_on.
insert into wa_settings (key, value) values
  ('monthly_cap_inr', '500'::jsonb),
  ('rates', jsonb_build_object(
      'currency', 'INR', 'market', 'India',
      'effective_from', '2026-10-01', 'verified_on', '2026-11-26',
      'source', 'Meta WhatsApp pricing page, INR list rates',
      'service', 0.115, 'utility', 0.115, 'authentication', 0.115,
      'authentication_international', 2.4971, 'marketing', 0.8631)),
  ('free_service_allowance', jsonb_build_object(
      'per_month', 1000, 'verified_on', '2026-11-26',
      'source', 'Meta WhatsApp pricing page: 1,000 free service messages per business number per month')),
  -- Meta resets the free tier at midnight in the Messaging account time zone.
  -- Asia/Kolkata is an assumption until checked in WhatsApp Manager.
  ('billing_timezone', '"Asia/Kolkata"'::jsonb),
  ('cap_override', 'null'::jsonb),
  ('last_sweep', 'null'::jsonb),
  ('last_retention', 'null'::jsonb)
on conflict (key) do nothing;

-- ── Functions ───────────────────────────────────────────────────────────────

-- Inbox list, newest first, keyset paged on (last_message_at, id).
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

-- Conversations touched since the last poll. Cheap: one indexed range scan.
create or replace function wa_conversations_changed(p_since timestamptz)
returns setof uuid language sql stable set search_path = public as $$
  select id from wa_conversations where updated_at > p_since order by updated_at desc limit 50;
$$;

-- Leads whose phone digits match exactly. Uses leads_phone_digits_uidx. A
-- 12-digit Indian number also matches a lead stored without the 91.
create or replace function wa_leads_by_digits(p_digits text)
returns table (id uuid, name text, stage text, phone text)
language sql stable set search_path = public as $$
  select l.id, l.name, l.stage, l.phone from leads l
   where regexp_replace(l.phone, '[^0-9]', '', 'g') = any (
           array[p_digits] ||
           case when p_digits ~ '^91[6-9][0-9]{9}$' then array[right(p_digits, 10)] else array[]::text[] end)
   limit 5;
$$;

-- Opt-out words. Kept in step with STOP_WORDS in lib/whatsapp/inbox-service.ts;
-- a test feeds the same list to both.
create or replace function wa_is_opt_out(p_body text)
returns boolean language sql immutable set search_path = public as $$
  select coalesce(p_body ~* '^\s*(stop|unsubscribe|stop all|band karo|mat bhejo|no more messages)\s*[.!]*\s*$', false)
$$;

-- True when the student must not be messaged: the latest 'service' consent
-- record is a No, or an opt-out message arrived after the latest record. The
-- second case covers the minutes before the sweep records the opt-out.
create or replace function wa_contact_opted_out(p_contact uuid)
returns boolean language sql stable set search_path = public as $$
  with c as (
    select granted, recorded_at from wa_consent
     where contact_id = p_contact and purpose = 'service'
     order by recorded_at desc limit 1
  )
  select exists (select 1 from c where not granted)
      or exists (
        select 1 from wa_messages m
          join wa_conversations cv on cv.id = m.conversation_id
         where cv.contact_id = p_contact and m.direction = 'inbound' and m.type = 'text'
           and wa_is_opt_out(m.body)
           and m.created_at > coalesce((select recorded_at from c), '-infinity'::timestamptz))
$$;

-- Outbound step 1: check every rule and reserve the row, in one transaction
-- that holds a lock, so two replies sent at the same moment cannot both fit
-- the last rupee of the cap. Nothing is written when a rule blocks the send.
-- blocked is null on success, else one of: bad_ref, sending_off,
-- no_conversation, window_closed, opted_out, rate_missing, cap_missing,
-- cap_reached. A reused client_ref returns the first row (double click or a
-- retried request), so a student is never sent the same reply twice.
create or replace function wa_reserve_outbound(
  p_conv uuid, p_client_ref uuid, p_type text, p_body text, p_payload jsonb, p_sent_by text
) returns table (message_id uuid, is_new boolean, send_state text, wamid text, blocked text)
language plpgsql set search_path = public as $$
declare
  v_old record; v_conv record; v_s jsonb; v_tz text; v_u jsonb; v_id uuid;
  v_rate numeric; v_free numeric; v_cap numeric; v_extra numeric := 0;
  v_sent numeric; v_billable numeric; v_paid_before numeric;
begin
  perform pg_advisory_xact_lock(hashtext('wa_reserve_outbound'));

  select m.id, m.send_state, m.wamid, m.conversation_id into v_old
    from wa_messages m where m.client_ref = p_client_ref;
  if found then
    if v_old.conversation_id is distinct from p_conv then
      return query select null::uuid, false, null::text, null::text, 'bad_ref'::text; return;
    end if;
    return query select v_old.id, false, v_old.send_state, v_old.wamid, null::text; return;
  end if;

  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_s from wa_settings;
  if v_s->'sending_enabled' is distinct from 'true'::jsonb then
    return query select null::uuid, false, null::text, null::text, 'sending_off'::text; return;
  end if;

  select cv.contact_id, cv.last_inbound_at into v_conv from wa_conversations cv where cv.id = p_conv;
  if not found then
    return query select null::uuid, false, null::text, null::text, 'no_conversation'::text; return;
  end if;
  if v_conv.last_inbound_at is null or v_conv.last_inbound_at <= now() - interval '24 hours' then
    return query select null::uuid, false, null::text, null::text, 'window_closed'::text; return;
  end if;
  if wa_contact_opted_out(v_conv.contact_id) then
    return query select null::uuid, false, null::text, null::text, 'opted_out'::text; return;
  end if;

  -- Cap. Same arithmetic as summariseSpend in lib/whatsapp/spend.ts: in-flight
  -- rows count as delivered, Meta's billable count wins when higher, an
  -- unknown free tier counts as none, a missing rate or cap blocks.
  v_tz := case when jsonb_typeof(v_s->'billing_timezone') = 'string' then v_s->>'billing_timezone' else 'Asia/Kolkata' end;
  begin
    v_u := wa_month_usage(v_tz);
  exception when others then
    v_u := wa_month_usage('Asia/Kolkata');
  end;
  if v_s->'rates'->>'currency' = 'INR' and jsonb_typeof(v_s->'rates'->'service') = 'number' then
    v_rate := (v_s->'rates'->>'service')::numeric;
    if v_rate < 0 or v_rate > 100 then v_rate := null; end if;
  end if;
  if jsonb_typeof(v_s->'free_service_allowance'->'per_month') = 'number' then
    v_free := floor((v_s->'free_service_allowance'->>'per_month')::numeric);
    if v_free < 0 or v_free > 1000000 then v_free := null; end if;
  end if;
  if jsonb_typeof(v_s->'monthly_cap_inr') = 'number' then
    v_cap := (v_s->>'monthly_cap_inr')::numeric;
    if v_cap < 0 or v_cap > 10000000 then v_cap := null; end if;
  end if;
  begin
    if jsonb_typeof(v_s->'cap_override'->'extra_inr') = 'number'
       and (v_s->'cap_override'->>'month_start')::timestamptz = (v_u->>'month_start')::timestamptz then
      v_extra := greatest(0, least((v_s->'cap_override'->>'extra_inr')::numeric, 10000000));
    end if;
  exception when others then
    v_extra := 0;
  end;

  v_sent := (v_u->>'service_delivered')::numeric + (v_u->>'service_in_flight')::numeric;
  v_billable := (v_u->>'meta_billable')::numeric;
  if v_free is null or v_sent + 1 > v_free or v_billable > 0 then
    if v_rate is null then
      return query select null::uuid, false, null::text, null::text, 'rate_missing'::text; return;
    end if;
    if v_cap is null then
      return query select null::uuid, false, null::text, null::text, 'cap_missing'::text; return;
    end if;
    v_paid_before := greatest(case when v_free is null then v_sent else v_sent - v_free end, v_billable, 0);
    if round(v_paid_before * v_rate, 4) + v_rate > v_cap + v_extra + 0.000000001 then
      return query select null::uuid, false, null::text, null::text, 'cap_reached'::text; return;
    end if;
  end if;

  insert into wa_messages (conversation_id, direction, client_ref, type, body, payload, sent_by, send_state)
  values (p_conv, 'outbound', p_client_ref, p_type, p_body, p_payload, p_sent_by, 'sending')
  returning wa_messages.id into v_id;
  return query select v_id, true, 'sending'::text, null::text, null::text;
end $$;

-- Outbound step 2: record Meta's answer. A status webhook can arrive before
-- this runs, so the status is recomputed from wa_message_statuses here.
create or replace function wa_finish_outbound(
  p_client_ref uuid, p_wamid text, p_state text, p_error_code int, p_error_title text
) returns void language plpgsql set search_path = public as $$
declare v_conv uuid; v_body text; v_type text;
begin
  if p_state not in ('accepted','failed','unknown') then
    raise exception 'bad state %', p_state;
  end if;
  update wa_messages set
    wamid       = coalesce(nullif(p_wamid, ''), wamid),
    send_state  = p_state,
    error_code  = coalesce(p_error_code, error_code),
    error_title = coalesce(left(p_error_title, 200), error_title)
  where client_ref = p_client_ref and direction = 'outbound'
  returning conversation_id, body, type into v_conv, v_body, v_type;

  if v_conv is null then
    return;
  end if;
  if nullif(p_wamid, '') is not null then
    perform wa_recompute_status(p_wamid);
  end if;
  if p_state = 'accepted' then
    update wa_conversations set
      last_message_at      = now(),
      last_message_preview = left(coalesce(v_body, '[' || v_type || ']'), 120)
    where id = v_conv;
  end if;
end $$;

-- This month's usage. Meta bills service (non-template) messages per
-- DELIVERED message, so the estimate counts delivered rows and, separately,
-- rows still in flight so the cap check can be conservative. meta_billable
-- and meta_free come from the pricing object on status webhooks and are
-- Meta's own answer; the inbox shows both.
create or replace function wa_month_usage(p_tz text)
returns jsonb language sql stable set search_path = public as $$
  with b as (
    select (date_trunc('month', now() at time zone p_tz)) at time zone p_tz as start_at
  ), o as (
    select m.* from wa_messages m, b
     where m.direction = 'outbound' and m.created_at >= b.start_at
  ), st as (
    select s.wamid,
           bool_or(s.pricing->>'billable' = 'true')  as billable,
           bool_or(s.pricing->>'billable' = 'false') as free
      from wa_message_statuses s, b
     where s.received_at >= b.start_at and s.pricing is not null
     group by s.wamid
  )
  select jsonb_build_object(
    'month_start',       (select start_at from b),
    'service_delivered', (select count(*) from o where type <> 'template' and status_rank >= 2),
    'service_in_flight', (select count(*) from o where type <> 'template' and status_rank < 2
                            and send_state in ('sending','accepted','unknown') and coalesce(status, '') <> 'failed'),
    'service_failed',    (select count(*) from o where type <> 'template' and (send_state = 'failed' or status = 'failed')),
    'templates_sent',    (select count(*) from o where type = 'template' and send_state = 'accepted'),
    'meta_billable',     (select count(*) from st where billable),
    'meta_free',         (select count(*) from st where free and not billable)
  );
$$;

-- Opt-outs, run by the sweep every 5 minutes. An inbound opt-out message with
-- no consent record after it becomes a No for replies AND for calls, as the
-- privacy policy promises ("we stop messaging and calling you"). Only the
-- last 3 days are scanned; older ones were recorded by earlier runs.
create or replace function wa_record_opt_outs()
returns integer language plpgsql set search_path = public as $$
declare v_n integer;
begin
  with hits as (
    select cv.contact_id, max(m.created_at) as at
      from wa_messages m join wa_conversations cv on cv.id = m.conversation_id
     where m.direction = 'inbound' and m.type = 'text'
       and m.created_at > now() - interval '3 days'
       and wa_is_opt_out(m.body)
     group by cv.contact_id
  ), todo as (
    select h.contact_id, h.at from hits h
     where not exists (
       select 1 from wa_consent c
        where c.contact_id = h.contact_id and c.purpose = 'service' and c.recorded_at >= h.at)
  ), ins as (
    insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by)
    select t.contact_id, p.purpose, false, 'whatsapp_message',
           'Opt-out message received ' || to_char(t.at at time zone 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI') || ' IST',
           'system'
      from todo t cross join (values ('service'), ('counselling_call')) as p(purpose)
    returning 1
  ) select count(*)::int into v_n from ins;
  return v_n / 2;
end $$;

-- Retention (Q-WA2, approved 27 Nov 2026): messages, notes, delivery
-- statuses and the audit log are deleted 24 months after they were written,
-- and a contact with no activity for 24 months is deleted with everything
-- attached (conversations, consent, identity history). Raw webhook bodies
-- go after 30 days in wa_purge_raw_bodies. Runs from the sweep at most once
-- every 20 hours and deletes at most 5,000 rows per table per run, so one
-- run stays short. Returns null when it was not due.
create or replace function wa_apply_retention()
returns jsonb language plpgsql set search_path = public as $$
declare
  v_cut timestamptz := now() - interval '24 months';
  v_last timestamptz; v_r jsonb; n1 int; n2 int; n3 int; n4 int; n5 int; n6 int; n7 int;
begin
  begin
    v_last := (select (value->>'at')::timestamptz from wa_settings where key = 'last_retention');
  exception when others then v_last := null;
  end;
  if v_last is not null and v_last > now() - interval '20 hours' then
    return null;
  end if;

  with d as (delete from wa_contacts where id in (
      select ct.id from wa_contacts ct
       where ct.created_at < v_cut
         and not exists (select 1 from wa_conversations cv where cv.contact_id = ct.id
                          and coalesce(cv.last_message_at, cv.created_at) >= v_cut)
       limit 5000) returning 1)
  select count(*) into n1 from d;
  with d as (delete from wa_messages where id in (
      select id from wa_messages where created_at < v_cut limit 5000) returning 1)
  select count(*) into n2 from d;
  with d as (delete from wa_notes where id in (
      select id from wa_notes where created_at < v_cut limit 5000) returning 1)
  select count(*) into n3 from d;
  with d as (delete from wa_message_statuses where id in (
      select id from wa_message_statuses where received_at < v_cut limit 5000) returning 1)
  select count(*) into n4 from d;
  with d as (delete from wa_contact_identity_history where id in (
      select id from wa_contact_identity_history where occurred_at < v_cut limit 5000) returning 1)
  select count(*) into n5 from d;
  with d as (delete from wa_audit_log where id in (
      select id from wa_audit_log where created_at < v_cut limit 5000) returning 1)
  select count(*) into n6 from d;
  -- Event rows hold a hash and counts only; their raw body is already gone.
  with d as (delete from wa_webhook_events where id in (
      select id from wa_webhook_events where received_at < v_cut and raw_body is null limit 5000) returning 1)
  select count(*) into n7 from d;
  -- A preview is message text; clear it once the messages behind it are gone.
  update wa_conversations set last_message_preview = null
   where last_message_preview is not null and last_message_at < v_cut;

  v_r := jsonb_build_object('at', now(), 'contacts', n1, 'messages', n2, 'notes', n3,
                            'statuses', n4, 'identity', n5, 'audit', n6, 'events', n7);
  insert into wa_settings (key, value, updated_at) values ('last_retention', v_r, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  return v_r;
end $$;

-- CRM call and message blocks from WhatsApp consent (QA R1). The CRM at
-- /leads reads this so its Call now and WhatsApp buttons keep the privacy
-- policy's promises for leads linked to a WhatsApp contact:
--  - no_call: the contact's latest counselling-call record is a No, or the
--    student opted out, or the lead was created from WhatsApp and nobody has
--    recorded a call Yes (starting a chat is not permission to call);
--  - no_message: the student opted out of WhatsApp messages.
-- Leads from the enquiry form with no WhatsApp link are not listed: the form
-- is the student asking for a call, as the policy says.
create or replace function wa_crm_contact_blocks()
returns table (lead_id uuid, no_call boolean, no_message boolean)
language sql stable set search_path = public as $$
  with linked as (
    select ct.id as contact_id, ct.lead_id from wa_contacts ct where ct.lead_id is not null
  ), latest as (
    select distinct on (c.contact_id, c.purpose) c.contact_id, c.purpose, c.granted
      from wa_consent c join linked l on l.contact_id = c.contact_id
     order by c.contact_id, c.purpose, c.recorded_at desc
  ), per_contact as (
    select l.lead_id, l.contact_id,
           exists (select 1 from latest x where x.contact_id = l.contact_id and x.purpose = 'counselling_call' and not x.granted) as call_no,
           exists (select 1 from latest x where x.contact_id = l.contact_id and x.purpose = 'counselling_call' and x.granted) as call_yes,
           wa_contact_opted_out(l.contact_id) as msg_no
      from linked l
  ), per_lead as (
    select p.lead_id, bool_or(p.call_no) as call_no, bool_or(p.call_yes) as call_yes, bool_or(p.msg_no) as msg_no
      from per_contact p group by p.lead_id
  ), flags as (
    select p.lead_id,
           p.call_no or p.msg_no or (ld.source = 'whatsapp' and not p.call_yes) as no_call,
           p.msg_no as no_message
      from per_lead p join leads ld on ld.id = p.lead_id
    union all
    -- Created from WhatsApp, then unlinked: still no recorded call Yes.
    select ld.id, true, false from leads ld
     where ld.source = 'whatsapp' and not exists (select 1 from wa_contacts ct where ct.lead_id = ld.id)
  )
  select f.lead_id, f.no_call, f.no_message from flags f where f.no_call or f.no_message;
$$;

-- ── Privileges ──────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'wa_list_conversations(text,text,boolean,timestamptz,uuid,integer)',
    'wa_conversations_changed(timestamptz)',
    'wa_leads_by_digits(text)',
    'wa_is_opt_out(text)',
    'wa_contact_opted_out(uuid)',
    'wa_reserve_outbound(uuid,uuid,text,text,jsonb,text)',
    'wa_finish_outbound(uuid,text,text,integer,text)',
    'wa_month_usage(text)',
    'wa_record_opt_outs()',
    'wa_apply_retention()',
    'wa_crm_contact_blocks()'
  ] loop
    execute format('revoke all on function %s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on function %s from anon', f);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on function %s from authenticated', f);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant execute on function %s to service_role', f);
    end if;
  end loop;
end $$;

select pg_notify('pgrst', 'reload schema');
