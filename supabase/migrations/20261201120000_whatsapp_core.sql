-- WhatsApp Phase 1: durable webhook storage and processing.
-- Plan: docs/whatsapp-platform-implementation-plan.md (sections 2 and 3).
--
-- Additive only. Creates new wa_* tables and functions; touches no existing
-- table. Undo with 20261201120000_whatsapp_core.down.sql.
--
-- Security posture matches leads and reviews: RLS on, no policies, so the
-- anon and authenticated roles see nothing. Only server code using the
-- service_role key reads or writes. Functions are SECURITY INVOKER, with
-- EXECUTE revoked from public, anon and authenticated.
--
-- Run in the Supabase SQL editor BEFORE the deploy that ships the new webhook.
-- Until it has run, the webhook returns 500 and Meta retries, so run it first.

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists wa_contacts (
  id               uuid primary key default gen_random_uuid(),
  phone_e164       text unique,        -- '+919696539529'; null while hidden by a username
  wa_id            text,               -- digits exactly as Meta sent them
  bsuid            text unique,        -- business-scoped user id, e.g. 'IN.1349...'
  parent_bsuid     text,
  username         text,
  profile_name     text,
  phone_source     text check (phone_source in ('webhook','contact_request','crm_link','import')),
  lead_id          uuid references leads(id) on delete set null,
  lead_link_method text check (lead_link_method in ('auto_phone','manual')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint wa_contacts_identity check (phone_e164 is not null or bsuid is not null)
);
create index if not exists wa_contacts_lead_idx on wa_contacts (lead_id);

create table if not exists wa_contact_identity_history (
  id              uuid primary key default gen_random_uuid(),
  contact_id      uuid not null references wa_contacts(id) on delete cascade,
  old_phone_e164  text,
  old_bsuid       text,
  new_phone_e164  text,
  new_bsuid       text,
  reason          text not null,
  occurred_at     timestamptz not null default now()
);
create index if not exists wa_identity_history_contact_idx on wa_contact_identity_history (contact_id);

create table if not exists wa_conversations (
  id                   uuid primary key default gen_random_uuid(),
  contact_id           uuid not null references wa_contacts(id) on delete cascade,
  phone_number_id      text not null,
  last_message_at      timestamptz,
  last_inbound_at      timestamptz,    -- start of the 24 h customer service window
  last_message_preview text,
  unread_count         integer not null default 0,
  status               text not null default 'open' check (status in ('open','archived')),
  assigned_to          text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (contact_id, phone_number_id)
);
create index if not exists wa_conversations_list_idx on wa_conversations (status, last_message_at desc);
create index if not exists wa_conversations_updated_idx on wa_conversations (updated_at desc);

create table if not exists wa_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references wa_conversations(id) on delete cascade,
  direction       text not null check (direction in ('inbound','outbound')),
  wamid           text unique,         -- null only while an outbound send is in flight
  client_ref      uuid unique,         -- outbound idempotency key we generate (Phase 2)
  type            text not null,
  body            text,
  payload         jsonb,
  reply_to_wamid  text,
  sent_by         text,
  send_state      text check (send_state in ('sending','accepted','failed','unknown')),
  status          text,                -- highest status seen
  status_rank     smallint not null default 0,
  error_code      integer,
  error_title     text,
  meta_timestamp  timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists wa_messages_conv_idx on wa_messages (conversation_id, created_at desc);

create table if not exists wa_message_statuses (
  id          bigint generated always as identity primary key,
  wamid       text not null,
  status      text not null,
  occurred_at timestamptz,
  pricing     jsonb,
  error       jsonb,
  received_at timestamptz not null default now(),
  unique (wamid, status)
);

-- One row per signed webhook delivery. raw_body is the exact text Meta sent,
-- kept as text (not jsonb) so a payload jsonb refuses (for example a \u0000
-- escape) is still stored and can be retried after a fix.
create table if not exists wa_webhook_events (
  id           bigint generated always as identity primary key,
  body_sha256  text not null unique,
  raw_body     text,                   -- nulled 30 days after completion
  state        text not null default 'pending'
               check (state in ('pending','processing','completed','failed')),
  attempts     smallint not null default 0,
  last_error   text,                   -- SQLSTATE and constraint name only, never content
  summary      jsonb,                  -- counts by type, no content
  received_at  timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists wa_webhook_events_todo_idx
  on wa_webhook_events (received_at) where state in ('pending','processing','failed');

create table if not exists wa_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
insert into wa_settings (key, value) values
  ('sending_enabled',    'false'::jsonb),
  ('campaigns_enabled',  'false'::jsonb),
  ('automation_enabled', 'false'::jsonb)
on conflict (key) do nothing;

-- updated_at triggers reuse set_updated_at() from the CRM migration.
drop trigger if exists wa_contacts_set_updated_at on wa_contacts;
create trigger wa_contacts_set_updated_at before update on wa_contacts
  for each row execute function set_updated_at();
drop trigger if exists wa_conversations_set_updated_at on wa_conversations;
create trigger wa_conversations_set_updated_at before update on wa_conversations
  for each row execute function set_updated_at();

alter table wa_contacts                 enable row level security;
alter table wa_contact_identity_history enable row level security;
alter table wa_conversations            enable row level security;
alter table wa_messages                 enable row level security;
alter table wa_message_statuses         enable row level security;
alter table wa_webhook_events           enable row level security;
alter table wa_settings                 enable row level security;

-- ── Helpers ─────────────────────────────────────────────────────────────────

create or replace function wa_status_rank(p_status text)
returns smallint language sql immutable set search_path = public as $$
  select case p_status
    when 'sent' then 1 when 'delivered' then 2 when 'read' then 3 when 'played' then 4
    else 0 end::smallint
$$;

-- Phone digits, or null unless the input is phone-shaped: optional +, then
-- 8 to 15 digits with spaces, dashes or brackets. A BSUID such as
-- 'IN.1349...' is NOT a phone and returns null.
create or replace function wa_digits(p text)
returns text language sql immutable set search_path = public as $$
  select case when regexp_replace(coalesce(p, ''), '[[:space:]()-]', '', 'g') ~ '^[+]?[0-9]{8,15}$'
              then regexp_replace(p, '[^0-9]', '', 'g') end
$$;

create or replace function wa_epoch(p text)
returns timestamptz language sql immutable set search_path = public as $$
  select case when p ~ '^[0-9]{1,12}$' then to_timestamp(p::bigint) else null end
$$;

-- Find or create a contact from whatever identity a webhook carries.
-- BSUID wins when it and the phone point at two different rows; the rows are
-- not merged automatically (a person can share a phone with a family member).
create or replace function wa_upsert_contact(
  p_wa_id text, p_bsuid text, p_parent_bsuid text,
  p_username text, p_profile_name text, p_phone_source text
) returns uuid language plpgsql set search_path = public as $$
declare
  v_digits text := wa_digits(p_wa_id);
  v_phone  text := case when v_digits is not null then '+' || v_digits end;
  v_bsuid  text := nullif(btrim(coalesce(p_bsuid, '')), '');
  v_by_bsuid uuid;
  v_by_phone uuid;
  v_id uuid;
begin
  if v_phone is null and v_bsuid is null then
    return null;
  end if;

  if v_bsuid is not null then
    select id into v_by_bsuid from wa_contacts where bsuid = v_bsuid;
  end if;
  if v_phone is not null then
    select id into v_by_phone from wa_contacts where phone_e164 = v_phone;
  end if;

  if v_by_bsuid is null and v_by_phone is null then
    insert into wa_contacts (phone_e164, wa_id, bsuid, parent_bsuid, username, profile_name, phone_source)
    values (v_phone, v_digits, v_bsuid, p_parent_bsuid, p_username, p_profile_name,
            case when v_phone is not null then p_phone_source end)
    on conflict do nothing
    returning id into v_id;
    if v_id is not null then
      return v_id;
    end if;
    -- Lost a race with a concurrent insert: read the winner.
    select id into v_id from wa_contacts
     where (v_bsuid is not null and bsuid = v_bsuid)
        or (v_phone is not null and phone_e164 = v_phone)
     order by (bsuid = v_bsuid) desc nulls last
     limit 1;
    return v_id;
  end if;

  v_id := coalesce(v_by_bsuid, v_by_phone);

  update wa_contacts c set
    phone_e164   = case when c.phone_e164 is null and v_phone is not null
                         and (v_by_phone is null or v_by_phone = c.id) then v_phone else c.phone_e164 end,
    wa_id        = case when c.phone_e164 is null and v_phone is not null
                         and (v_by_phone is null or v_by_phone = c.id) then v_digits else c.wa_id end,
    phone_source = case when c.phone_e164 is null and v_phone is not null
                         and (v_by_phone is null or v_by_phone = c.id) then p_phone_source else c.phone_source end,
    bsuid        = coalesce(c.bsuid, case when v_by_bsuid is null then v_bsuid end),
    parent_bsuid = coalesce(p_parent_bsuid, c.parent_bsuid),
    username     = coalesce(p_username, c.username),
    profile_name = coalesce(p_profile_name, c.profile_name)
  where c.id = v_id;

  return v_id;
end $$;

create or replace function wa_upsert_conversation(p_contact uuid, p_phone_number_id text)
returns uuid language plpgsql set search_path = public as $$
declare v_id uuid;
begin
  insert into wa_conversations (contact_id, phone_number_id)
  values (p_contact, coalesce(nullif(p_phone_number_id, ''), 'unknown'))
  on conflict (contact_id, phone_number_id) do nothing
  returning id into v_id;
  if v_id is null then
    select id into v_id from wa_conversations
     where contact_id = p_contact and phone_number_id = coalesce(nullif(p_phone_number_id, ''), 'unknown');
  end if;
  return v_id;
end $$;

-- Text to show for a message, whatever its type.
create or replace function wa_message_body(m jsonb)
returns text language sql immutable set search_path = public as $$
  select coalesce(
    m #>> '{text,body}',
    m #>> '{image,caption}', m #>> '{video,caption}', m #>> '{document,caption}',
    m #>> '{button,text}',
    m #>> '{interactive,button_reply,title}', m #>> '{interactive,list_reply,title}',
    m #>> '{reaction,emoji}',
    m #>> '{location,name}',
    m #>> '{system,body}'
  )
$$;

-- Re-derive a message's displayed status from every status row we hold.
-- Highest rank wins, so a late 'delivered' never overwrites 'read'. 'failed'
-- shows only while nothing reached 'delivered'.
create or replace function wa_recompute_status(p_wamid text)
returns void language plpgsql set search_path = public as $$
declare
  v_best text; v_rank smallint; v_failed jsonb; v_has_failed boolean; v_code text;
begin
  select status, wa_status_rank(status) into v_best, v_rank
    from wa_message_statuses where wamid = p_wamid and wa_status_rank(status) > 0
   order by wa_status_rank(status) desc limit 1;
  select true, error into v_has_failed, v_failed from wa_message_statuses where wamid = p_wamid and status = 'failed';
  v_has_failed := coalesce(v_has_failed, false);
  v_code := v_failed #>> '{0,code}';

  update wa_messages set
    status      = case when v_has_failed and coalesce(v_rank, 0) < 2 then 'failed' else coalesce(v_best, status) end,
    status_rank = greatest(status_rank, coalesce(v_rank, 0)),
    error_code  = case when v_code ~ '^-?[0-9]{1,9}$' then v_code::integer else error_code end,
    error_title = case when v_has_failed then coalesce(left(v_failed #>> '{0,title}', 200), error_title) else error_title end
  where wamid = p_wamid;
end $$;

-- ── Apply one payload ───────────────────────────────────────────────────────
-- Only field = 'messages' is projected in Phase 1. Every other field is kept
-- in wa_webhook_events.raw_body and counted, so nothing is lost.
create or replace function wa_apply_payload(p jsonb)
returns jsonb language plpgsql set search_path = public as $$
declare
  ent jsonb; ch jsonb; val jsonb; m jsonb; s jsonb; c jsonb;
  v_pnid text; v_from text; v_from_bsuid text; v_profile jsonb;
  v_contact uuid; v_conv uuid; v_msg uuid; v_type text; v_ts timestamptz;
  v_new_phone text; v_new_bsuid text; v_old record;
  n_msg int := 0; n_dup int := 0; n_status int := 0; n_status_dup int := 0; n_other int := 0;
  types jsonb := '{}'::jsonb;
begin
  for ent in select * from jsonb_array_elements(case when jsonb_typeof(p->'entry') = 'array' then p->'entry' else '[]' end) loop
    for ch in select * from jsonb_array_elements(case when jsonb_typeof(ent->'changes') = 'array' then ent->'changes' else '[]' end) loop
      if ch->>'field' is distinct from 'messages' or jsonb_typeof(ch->'value') <> 'object' then
        n_other := n_other + 1;
        continue;
      end if;
      val := ch->'value';
      v_pnid := val #>> '{metadata,phone_number_id}';

      -- Incoming messages
      for m in select * from jsonb_array_elements(case when jsonb_typeof(val->'messages') = 'array' then val->'messages' else '[]' end) loop
        if jsonb_typeof(m->'id') is distinct from 'string' then continue; end if;
        v_from := m->>'from';
        v_from_bsuid := m->>'from_user_id';
        v_type := coalesce(m->>'type', 'unknown');
        v_ts := coalesce(wa_epoch(m->>'timestamp'), now());

        select x into v_profile
          from jsonb_array_elements(case when jsonb_typeof(val->'contacts') = 'array' then val->'contacts' else '[]' end) x
         where (v_from is not null and x->>'wa_id' = v_from)
            or (v_from_bsuid is not null and x->>'user_id' = v_from_bsuid)
         limit 1;

        v_contact := wa_upsert_contact(
          coalesce(v_from, v_profile->>'wa_id'),
          coalesce(v_from_bsuid, v_profile->>'user_id'),
          v_profile->>'parent_user_id',
          v_profile #>> '{profile,username}',
          v_profile #>> '{profile,name}',
          'webhook');
        if v_contact is null then continue; end if;   -- no identity at all: raw event keeps it

        v_conv := wa_upsert_conversation(v_contact, v_pnid);

        v_msg := null;
        insert into wa_messages (conversation_id, direction, wamid, type, body, payload, reply_to_wamid, meta_timestamp)
        values (v_conv, 'inbound', m->>'id', v_type, wa_message_body(m), m, m #>> '{context,id}', v_ts)
        on conflict (wamid) do nothing
        returning id into v_msg;

        if v_msg is null then
          n_dup := n_dup + 1;
          continue;
        end if;
        n_msg := n_msg + 1;
        types := jsonb_set(types, array[v_type], to_jsonb(coalesce((types->>v_type)::int, 0) + 1));

        update wa_conversations set
          last_message_at      = greatest(coalesce(last_message_at, v_ts), v_ts),
          last_inbound_at      = case when v_type = 'system' then last_inbound_at
                                      else greatest(coalesce(last_inbound_at, v_ts), v_ts) end,
          last_message_preview = case when v_ts >= coalesce(last_message_at, v_ts)
                                      then left(coalesce(wa_message_body(m), '[' || v_type || ']'), 120)
                                      else last_message_preview end,
          unread_count         = unread_count + case when v_type in ('system','reaction') then 0 else 1 end,
          status               = 'open'
        where id = v_conv;

        -- Phone shared through REQUEST_CONTACT_INFO: only the sender's own
        -- number, and only when the reply says it came from our request.
        if v_type = 'contacts' then
          for c in select * from jsonb_array_elements(case when jsonb_typeof(m->'contacts') = 'array' then m->'contacts' else '[]' end) loop
            if c->>'origin' = 'contact_request' then
              v_new_phone := wa_digits(coalesce(c #>> '{phones,0,wa_id}', c #>> '{phones,0,phone}'));
              if v_new_phone is not null and not exists (select 1 from wa_contacts where phone_e164 = '+' || v_new_phone) then
                update wa_contacts set phone_e164 = '+' || v_new_phone, wa_id = v_new_phone, phone_source = 'contact_request'
                 where id = v_contact and phone_e164 is null;
              end if;
            end if;
          end loop;
        end if;

        -- Number or BSUID change. Field names differ across API versions, so
        -- accept both spellings; an unknown shape changes nothing.
        if v_type = 'system' and m #>> '{system,type}' in ('user_changed_number', 'customer_changed_number') then
          v_new_phone := wa_digits(coalesce(m #>> '{system,wa_id}', m #>> '{system,new_wa_id}'));
          v_new_bsuid := coalesce(m #>> '{system,user_id}', m #>> '{system,new_user_id}');
          select phone_e164, bsuid into v_old from wa_contacts where id = v_contact;
          -- Apply a new value only if it changes something and no other
          -- contact owns it; history records exactly what was applied.
          if v_new_phone is null or '+' || v_new_phone is not distinct from v_old.phone_e164
             or exists (select 1 from wa_contacts where phone_e164 = '+' || v_new_phone) then
            v_new_phone := null;
          end if;
          if v_new_bsuid is null or v_new_bsuid is not distinct from v_old.bsuid
             or exists (select 1 from wa_contacts where bsuid = v_new_bsuid) then
            v_new_bsuid := null;
          end if;
          if v_new_phone is not null or v_new_bsuid is not null then
            insert into wa_contact_identity_history (contact_id, old_phone_e164, old_bsuid, new_phone_e164, new_bsuid, reason)
            values (v_contact, v_old.phone_e164, v_old.bsuid,
                    case when v_new_phone is not null then '+' || v_new_phone end, v_new_bsuid, m #>> '{system,type}');
            update wa_contacts set
              phone_e164 = coalesce('+' || v_new_phone, phone_e164),
              wa_id      = coalesce(v_new_phone, wa_id),
              bsuid      = coalesce(v_new_bsuid, bsuid)
            where id = v_contact;
          end if;
        end if;
      end loop;

      -- Delivery statuses for messages we sent
      for s in select * from jsonb_array_elements(case when jsonb_typeof(val->'statuses') = 'array' then val->'statuses' else '[]' end) loop
        if jsonb_typeof(s->'id') is distinct from 'string' or jsonb_typeof(s->'status') is distinct from 'string' then continue; end if;
        insert into wa_message_statuses (wamid, status, occurred_at, pricing, error)
        values (s->>'id', s->>'status', wa_epoch(s->>'timestamp'), s->'pricing', s->'errors')
        on conflict (wamid, status) do nothing;
        if not found then
          n_status_dup := n_status_dup + 1;
          continue;
        end if;
        n_status := n_status + 1;
        perform wa_recompute_status(s->>'id');

        -- Fill a missing phone or BSUID on the recipient we already know.
        select cv.contact_id into v_contact
          from wa_messages wm join wa_conversations cv on cv.id = wm.conversation_id
         where wm.wamid = s->>'id';
        if v_contact is not null then
          update wa_contacts set
            phone_e164   = '+' || wa_digits(s->>'recipient_id'),
            wa_id        = wa_digits(s->>'recipient_id'),
            phone_source = 'webhook'
          where id = v_contact and phone_e164 is null and wa_digits(s->>'recipient_id') is not null
            and not exists (select 1 from wa_contacts where phone_e164 = '+' || wa_digits(s->>'recipient_id'));
          update wa_contacts set bsuid = s->>'recipient_user_id'
          where id = v_contact and bsuid is null and s->>'recipient_user_id' is not null
            and not exists (select 1 from wa_contacts where bsuid = s->>'recipient_user_id');
        end if;
      end loop;
    end loop;
  end loop;

  return jsonb_build_object(
    'messages', n_msg, 'duplicates', n_dup, 'statuses', n_status,
    'status_duplicates', n_status_dup, 'other_fields', n_other, 'messageTypes', types);
end $$;

-- ── Ingest and process ──────────────────────────────────────────────────────

-- Step 1, called by the webhook before it answers Meta: store the delivery.
-- Idempotent on the body hash. Returns the event id and its current state.
create or replace function wa_ingest_event(p_sha256 text, p_raw text)
returns table (event_id bigint, event_state text) language plpgsql set search_path = public as $$
begin
  insert into wa_webhook_events (body_sha256, raw_body)
  values (p_sha256, p_raw)
  on conflict (body_sha256) do nothing;
  return query select id, state from wa_webhook_events where body_sha256 = p_sha256;
end $$;

-- Step 2a: count an attempt. Called as its OWN request before Step 2, so the
-- count is committed even if processing later dies with a statement timeout
-- or a dropped connection (errors that roll back the whole transaction and
-- that no exception handler can catch). Returns false once 5 attempts are
-- used or the event is already completed.
create or replace function wa_begin_attempt(p_event_id bigint)
returns boolean language plpgsql set search_path = public as $$
begin
  update wa_webhook_events
     set attempts = attempts + 1,
         state = 'processing'
   where id = (select id from wa_webhook_events
                where id = p_event_id and state <> 'completed' and attempts < 5
                  for update skip locked);
  return found;
end $$;

-- Step 2: project one stored event into contacts, conversations, messages
-- and statuses. The row lock (SKIP LOCKED) means two callers never process
-- the same event at once; the second returns 'busy'. Claim, work and the
-- final state commit together, so a crash rolls back to the earlier state
-- and the sweeper retries it. A failure inside the work is caught, undone,
-- and recorded as 'failed' with the SQLSTATE only.
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

-- Events the sweeper should retry: stored over a minute ago (so the live
-- request has finished), not completed, under 5 attempts, at most 7 days
-- old. Fewest attempts first, so a stuck event cannot crowd out new ones.
create or replace function wa_events_to_retry(p_limit int)
returns setof bigint language sql stable set search_path = public as $$
  select id from wa_webhook_events
   where state in ('pending', 'processing', 'failed')
     and attempts < 5
     and received_at < now() - interval '1 minute'
     and received_at > now() - interval '7 days'
   order by attempts, received_at
   limit greatest(1, least(p_limit, 100))
$$;

-- Retention: drop raw payloads 30 days after receipt, whatever the state
-- (retries stop at 7 days). Rows stay, so the
-- body hash still blocks a late duplicate delivery.
create or replace function wa_purge_raw_bodies()
returns integer language sql set search_path = public as $$
  with u as (
    update wa_webhook_events set raw_body = null
     where raw_body is not null
       and received_at < now() - interval '30 days'
    returning 1
  ) select count(*)::int from u
$$;

create or replace function wa_exhausted_count()
returns integer language sql stable set search_path = public as $$
  select count(*)::int from wa_webhook_events
   where state <> 'completed'
     and (attempts >= 5 or received_at <= now() - interval '7 days')
$$;

-- ── Privileges ──────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'wa_status_rank(text)', 'wa_digits(text)', 'wa_epoch(text)',
    'wa_upsert_contact(text,text,text,text,text,text)', 'wa_upsert_conversation(uuid,text)',
    'wa_message_body(jsonb)', 'wa_recompute_status(text)', 'wa_apply_payload(jsonb)',
    'wa_ingest_event(text,text)', 'wa_begin_attempt(bigint)', 'wa_process_event(bigint)', 'wa_events_to_retry(integer)',
    'wa_purge_raw_bodies()', 'wa_exhausted_count()'
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
