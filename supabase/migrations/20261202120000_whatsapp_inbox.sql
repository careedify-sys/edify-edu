-- WhatsApp Phase 2: inbox at /leads/whatsapp.
--
-- Additive only. Nothing here changes a Phase 1 table, column or function, so
-- the live webhook keeps working whether or not this has run. The inbox page
-- shows "Run the Phase 2 migration" until it has.
--
-- Run in the Supabase SQL editor BEFORE the Phase 2 deploy goes live, then run
--   select key from wa_settings order by key;
-- and expect: billing_timezone, campaigns_enabled, cap_override,
-- free_service_allowance, last_sweep, monthly_cap_inr, rates,
-- sending_enabled, automation_enabled.
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

-- Monthly usage reads outbound rows by time.
create index if not exists wa_messages_outbound_idx
  on wa_messages (created_at) where direction = 'outbound';

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
  ('last_sweep', 'null'::jsonb)
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
  select cv.id, cv.contact_id, cv.status, cv.unread_count,
         cv.last_message_at, cv.last_inbound_at, cv.last_message_preview,
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

-- Outbound step 1: reserve the row before calling Meta. client_ref makes a
-- double click or a retried request return the same row instead of sending
-- twice.
create or replace function wa_begin_outbound(
  p_conv uuid, p_client_ref uuid, p_type text, p_body text, p_payload jsonb, p_sent_by text
) returns table (message_id uuid, is_new boolean, send_state text, wamid text)
language plpgsql set search_path = public as $$
declare v_id uuid;
begin
  insert into wa_messages (conversation_id, direction, client_ref, type, body, payload, sent_by, send_state)
  values (p_conv, 'outbound', p_client_ref, p_type, p_body, p_payload, p_sent_by, 'sending')
  on conflict (client_ref) do nothing
  returning wa_messages.id into v_id;
  if v_id is not null then
    return query select v_id, true, 'sending'::text, null::text;
  else
    return query select m.id, false, m.send_state, m.wamid from wa_messages m where m.client_ref = p_client_ref;
  end if;
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

-- ── Privileges ──────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'wa_list_conversations(text,text,boolean,timestamptz,uuid,integer)',
    'wa_conversations_changed(timestamptz)',
    'wa_leads_by_digits(text)',
    'wa_begin_outbound(uuid,uuid,text,text,jsonb,text)',
    'wa_finish_outbound(uuid,text,text,integer,text)',
    'wa_month_usage(text)'
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
