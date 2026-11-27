-- WhatsApp Phase 4: referral marketing.
--
-- Additive. Run after 20261203120000_whatsapp_campaigns.sql. Undo with
-- 20261204120000_whatsapp_referrals.down.sql.
--
--  1. Media files (template header images, documents sent from the inbox).
--     Bytes live in the private Storage bucket 'wa-media'; this table holds
--     the record and Meta's media id with its expiry.
--  2. Templates: header file, campaign token for the referral link.
--  3. Template status webhook (message_template_status_update).
--  4. Template sends from the inbox, inside or outside the 24-hour window.
--  5. Referrals, their activity, reward rules, rate limits, form opens.
--  6. Rule-based automation for replies to referral campaigns (OFF).
--  7. Campaign referral funnel.
--
-- Every new switch starts OFF. All tables: RLS on, no policies, no grants to
-- anon or authenticated; the server uses service_role only.

-- ── 1. Media files ──────────────────────────────────────────────────────────
create table if not exists wa_media_files (
  id                 uuid primary key default gen_random_uuid(),
  purpose            text not null check (purpose in ('template_header','outbound')),
  kind               text not null check (kind in ('image','document')),
  file_name          text not null check (char_length(file_name) between 1 and 200),
  mime               text not null check (mime in ('image/jpeg','image/png','application/pdf',
                       'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                       'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
                       'text/plain')),
  size_bytes         integer not null check (size_bytes between 1 and 4194304),
  sha256             text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  storage_path       text not null unique,
  meta_media_id      text,
  meta_media_expires timestamptz,
  created_by         text,
  created_at         timestamptz not null default now(),
  deleted_at         timestamptz,
  check (kind <> 'image' or mime in ('image/jpeg','image/png'))
);
create index if not exists wa_media_files_created_idx on wa_media_files (created_at desc);

-- ── 2. Templates and campaigns ──────────────────────────────────────────────
alter table wa_templates add column if not exists header_file_id uuid references wa_media_files(id) on delete set null;
-- Random, the same for every recipient of one campaign. It fills the {{1}} at
-- the end of the referral link button, so /refer?c=<token> names the
-- campaign without naming the student.
alter table wa_campaigns add column if not exists ref_token text not null
  default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
create unique index if not exists wa_campaigns_ref_token_uidx on wa_campaigns (ref_token);

-- ── 3. Template status webhook ──────────────────────────────────────────────
-- Applies message_template_status_update and message_template_quality_update
-- changes to the cached templates. Unknown templates are ignored; Sync picks
-- them up. Returns how many rows changed.
create or replace function wa_apply_template_events(p jsonb)
returns integer language plpgsql set search_path = public as $$
declare ent jsonb; ch jsonb; val jsonb; n int := 0; v_reason text; v_rows int;
begin
  for ent in select * from jsonb_array_elements(case when jsonb_typeof(p->'entry') = 'array' then p->'entry' else '[]' end) loop
    for ch in select * from jsonb_array_elements(case when jsonb_typeof(ent->'changes') = 'array' then ent->'changes' else '[]' end) loop
      val := ch->'value';
      if jsonb_typeof(val) <> 'object' or coalesce(val->>'message_template_id', '') = '' then continue; end if;
      if ch->>'field' = 'message_template_status_update' and coalesce(val->>'event', '') ~ '^[A-Z_]{3,30}$' then
        v_reason := nullif(nullif(coalesce(val #>> '{rejection_info,reason}', val->>'reason'), 'NONE'), '');
        update wa_templates
           set status = val->>'event',
               reason = case when val->>'event' in ('REJECTED','PAUSED','DISABLED','FLAGGED') then left(v_reason, 300) else null end,
               category = case when coalesce(val->>'message_template_category', '') in ('MARKETING','UTILITY','AUTHENTICATION')
                               then val->>'message_template_category' else category end,
               synced_at = now()
         where meta_id = val->>'message_template_id';
        get diagnostics v_rows = row_count; n := n + v_rows;
      elsif ch->>'field' = 'message_template_quality_update' and coalesce(val->>'new_quality_score', '') ~ '^[A-Z_]{3,20}$' then
        update wa_templates set quality = val->>'new_quality_score', synced_at = now()
         where meta_id = val->>'message_template_id';
        get diagnostics v_rows = row_count; n := n + v_rows;
      end if;
    end loop;
  end loop;
  return n;
end $$;

-- Same as Phase 1, plus the template events above. The down file restores
-- the Phase 1 body.
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

  begin
    begin
      v_payload := ev.raw_body::jsonb;
    exception when untranslatable_character then
      v_payload := replace(ev.raw_body, '\u0000', '')::jsonb;
    end;
    v_summary := wa_apply_payload(v_payload);
    v_summary := v_summary || jsonb_build_object('templates', wa_apply_template_events(v_payload));
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

-- ── 4. Template sends from the inbox ────────────────────────────────────────
-- An approved template may go out whether or not the 24-hour window is open.
-- Rules, checked under the same lock as wa_reserve_outbound:
--  * inbox sending switched on;
--  * template APPROVED, Marketing or Utility;
--  * not opted out; a Marketing template also needs marketing consent
--    (wa_campaign_ineligible is null);
--  * the monthly inbox cap: estimated service spend plus every inbox template
--    this month (charged at the higher of the marketing and utility rates,
--    conservative) plus this one must fit.
create or replace function wa_reserve_template(
  p_conv uuid, p_client_ref uuid, p_template uuid, p_body text, p_payload jsonb, p_sent_by text
) returns table (message_id uuid, is_new boolean, send_state text, wamid text, blocked text)
language plpgsql set search_path = public as $$
declare
  v_old record; v_conv record; v_t record; v_s jsonb; v_tz text; v_u jsonb; v_id uuid;
  v_srate numeric; v_trate numeric; v_mrate numeric; v_urate numeric; v_free numeric; v_cap numeric; v_extra numeric := 0;
  v_sent numeric; v_billable numeric; v_service_paid numeric; v_tpl_sent numeric;
begin
  perform pg_advisory_xact_lock(hashtext('wa_reserve_outbound'));

  select m.id, m.send_state, m.wamid, m.conversation_id into v_old from wa_messages m where m.client_ref = p_client_ref;
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
  select cv.contact_id into v_conv from wa_conversations cv where cv.id = p_conv;
  if not found then
    return query select null::uuid, false, null::text, null::text, 'no_conversation'::text; return;
  end if;
  select * into v_t from wa_templates where id = p_template;
  if not found or v_t.status <> 'APPROVED' or v_t.category not in ('MARKETING','UTILITY') then
    return query select null::uuid, false, null::text, null::text, 'template_not_approved'::text; return;
  end if;
  if wa_contact_opted_out(v_conv.contact_id) then
    return query select null::uuid, false, null::text, null::text, 'opted_out'::text; return;
  end if;
  if v_t.category = 'MARKETING' and wa_campaign_ineligible(v_conv.contact_id) is not null then
    return query select null::uuid, false, null::text, null::text, 'no_marketing_consent'::text; return;
  end if;

  v_tz := case when jsonb_typeof(v_s->'billing_timezone') = 'string' then v_s->>'billing_timezone' else 'Asia/Kolkata' end;
  begin v_u := wa_month_usage(v_tz); exception when others then v_u := wa_month_usage('Asia/Kolkata'); end;
  if v_s->'rates'->>'currency' = 'INR' then
    if jsonb_typeof(v_s->'rates'->'service') = 'number' then v_srate := (v_s->'rates'->>'service')::numeric; end if;
    if jsonb_typeof(v_s->'rates'->'marketing') = 'number' then v_mrate := (v_s->'rates'->>'marketing')::numeric; end if;
    if jsonb_typeof(v_s->'rates'->'utility') = 'number' then v_urate := (v_s->'rates'->>'utility')::numeric; end if;
  end if;
  v_trate := case when v_t.category = 'MARKETING' then v_mrate else v_urate end;
  if v_trate is null or v_trate < 0 or v_trate > 100 or v_srate is null or v_srate < 0 or v_srate > 100 then
    return query select null::uuid, false, null::text, null::text, 'rate_missing'::text; return;
  end if;
  if jsonb_typeof(v_s->'free_service_allowance'->'per_month') = 'number' then
    v_free := floor((v_s->'free_service_allowance'->>'per_month')::numeric);
    if v_free < 0 or v_free > 1000000 then v_free := null; end if;
  end if;
  if jsonb_typeof(v_s->'monthly_cap_inr') = 'number' then
    v_cap := (v_s->>'monthly_cap_inr')::numeric;
    if v_cap < 0 or v_cap > 10000000 then v_cap := null; end if;
  end if;
  if v_cap is null then
    return query select null::uuid, false, null::text, null::text, 'cap_missing'::text; return;
  end if;
  begin
    if jsonb_typeof(v_s->'cap_override'->'extra_inr') = 'number'
       and (v_s->'cap_override'->>'month_start')::timestamptz = (v_u->>'month_start')::timestamptz then
      v_extra := greatest(0, least((v_s->'cap_override'->>'extra_inr')::numeric, 10000000));
    end if;
  exception when others then v_extra := 0; end;

  v_sent := (v_u->>'service_delivered')::numeric + (v_u->>'service_in_flight')::numeric;
  v_billable := (v_u->>'meta_billable')::numeric;
  v_service_paid := greatest(case when v_free is null then v_sent else v_sent - v_free end, 0);
  -- Inbox templates this month that did not fail (in flight counts).
  select count(*) into v_tpl_sent from wa_messages m
   where m.direction = 'outbound' and m.type = 'template' and m.created_at >= (v_u->>'month_start')::timestamptz
     and coalesce(m.send_state, '') <> 'failed' and coalesce(m.status, '') <> 'failed'
     and not exists (select 1 from wa_campaign_recipients r where r.message_id = m.id);
  if round(greatest(v_service_paid * v_srate + v_tpl_sent * greatest(coalesce(v_mrate, 0), coalesce(v_urate, 0)),
                    v_billable * greatest(v_srate, coalesce(v_mrate, 0), coalesce(v_urate, 0))), 4) + v_trate
     > v_cap + v_extra + 0.000000001 then
    return query select null::uuid, false, null::text, null::text, 'cap_reached'::text; return;
  end if;

  insert into wa_messages (conversation_id, direction, client_ref, type, body, payload, sent_by, send_state)
  values (p_conv, 'outbound', p_client_ref, 'template', p_body, p_payload, p_sent_by, 'sending')
  returning wa_messages.id into v_id;
  return query select v_id, true, 'sending'::text, null::text, null::text;
end $$;

-- A conversation for a number typed in by staff. Creates the contact if new
-- (phone_source 'import'); returns the conversation id. Nothing is sent.
create or replace function wa_conversation_for_phone(p_phone text, p_phone_number_id text)
returns uuid language plpgsql set search_path = public as $$
declare v_contact uuid;
begin
  if p_phone !~ '^\+[1-9][0-9]{7,14}$' then raise exception 'bad_phone' using errcode = 'P0001'; end if;
  select id into v_contact from wa_contacts where phone_e164 = p_phone;
  if v_contact is null then
    insert into wa_contacts (phone_e164, wa_id, phone_source) values (p_phone, substr(p_phone, 2), 'import')
    on conflict (phone_e164) do nothing returning id into v_contact;
    if v_contact is null then select id into v_contact from wa_contacts where phone_e164 = p_phone; end if;
  end if;
  return wa_upsert_conversation(v_contact, p_phone_number_id);
end $$;

-- ── 5. Referrals ────────────────────────────────────────────────────────────
create table if not exists referral_reward_rules (
  id          uuid primary key default gen_random_uuid(),
  label       text not null check (char_length(btrim(label)) between 1 and 80),
  programme   text check (programme is null or char_length(programme) <= 40),
  university_id text check (university_id is null or university_id ~ '^[a-z0-9-]{2,80}$'),
  amount_inr  integer not null check (amount_inr between 1 and 100000),
  conditions  text not null default '' check (char_length(conditions) <= 1000),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists referrals (
  id                      uuid primary key default gen_random_uuid(),
  ref_code                text not null unique check (ref_code ~ '^EDU-REF-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$'),
  referrer_name           text not null check (char_length(btrim(referrer_name)) between 2 and 80),
  referrer_phone          text not null check (referrer_phone ~ '^\+[1-9][0-9]{7,14}$'),
  referred_name           text not null check (char_length(btrim(referred_name)) between 2 and 80),
  referred_phone          text not null check (referred_phone ~ '^\+[1-9][0-9]{7,14}$'),
  programme               text check (programme is null or char_length(programme) <= 40),
  preferred_university_id text check (preferred_university_id is null or preferred_university_id ~ '^[a-z0-9-]{2,80}$'),
  preferred_university    text check (preferred_university is null or char_length(preferred_university) <= 120),
  final_university        text check (final_university is null or char_length(final_university) <= 120),
  referrer_note           text check (referrer_note is null or char_length(referrer_note) <= 1000),
  -- The referrer ticked "my friend agreed to be contacted for education
  -- guidance". This is contact permission for counselling only. It is never
  -- marketing consent and is not written to wa_consent.
  referred_permission     boolean not null check (referred_permission),
  terms_version           text not null check (char_length(terms_version) between 1 and 20),
  referrer_wa_optin       boolean not null default false,
  campaign_id             uuid references wa_campaigns(id) on delete set null,
  attribution             text not null default 'none' check (attribution in ('link','phone_match','none')),
  lead_id                 uuid references leads(id) on delete set null,
  stage                   text not null default 'new' check (stage in ('new','contact_attempted','contacted','counselling',
                            'follow_up','application_started','admission_confirmed','reward_approved','reward_paid','closed')),
  flags                   text[] not null default '{}',
  review_state            text not null default 'clear' check (review_state in ('clear','needs_review','resolved')),
  next_follow_up          date,
  admission_confirmed_on  date,
  reward_rule_id          uuid references referral_reward_rules(id) on delete set null,
  reward_amount_inr       integer check (reward_amount_inr is null or reward_amount_inr between 0 and 100000),
  reward_due_on           date generated always as (admission_confirmed_on + 7) stored,
  reward_approved_at      timestamptz,
  reward_approved_by      text,
  reward_paid_on          date,
  payment_ref             text check (payment_ref is null or char_length(btrim(payment_ref)) between 1 and 100),
  closed_reason           text check (closed_reason is null or char_length(closed_reason) <= 300),
  -- For a later referrer status page. Unused now; such a page must verify
  -- the referrer's phone first. A referral id alone never shows anything.
  portal_secret_hash      text,
  ip_hash                 text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint referrals_admission_needs_date check (stage not in ('admission_confirmed','reward_approved','reward_paid') or admission_confirmed_on is not null),
  constraint referrals_approved_needs_amount check (stage not in ('reward_approved','reward_paid') or (reward_amount_inr is not null and reward_approved_at is not null)),
  constraint referrals_paid_needs_ref check (stage <> 'reward_paid' or (reward_paid_on is not null and payment_ref is not null)),
  constraint referrals_paid_after_admission check (reward_paid_on is null or reward_paid_on >= admission_confirmed_on),
  constraint referrals_review_before_reward check (stage not in ('reward_approved','reward_paid') or review_state <> 'needs_review')
);
create index if not exists referrals_created_idx  on referrals (created_at desc);
create index if not exists referrals_stage_idx    on referrals (stage);
create index if not exists referrals_referred_idx on referrals (referred_phone);
create index if not exists referrals_referrer_idx on referrals (referrer_phone);
create index if not exists referrals_campaign_idx on referrals (campaign_id);
create index if not exists referrals_due_idx      on referrals (reward_due_on) where stage in ('admission_confirmed','reward_approved');
-- One reward per referred student.
create unique index if not exists referrals_one_reward_uidx on referrals (referred_phone) where stage in ('reward_approved','reward_paid');

create table if not exists referral_activity (
  id          uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  kind        text not null check (kind in ('system','note','call','stage','reward','whatsapp')),
  body        text not null check (char_length(body) between 1 and 2000),
  actor       text,
  created_at  timestamptz not null default now()
);
create index if not exists referral_activity_ref_idx on referral_activity (referral_id, created_at desc);

create table if not exists referral_rate_hits (
  bucket text not null check (char_length(bucket) <= 100),
  at     timestamptz not null default now()
);
create index if not exists referral_rate_hits_idx on referral_rate_hits (bucket, at);

create table if not exists referral_form_opens (
  campaign_id uuid not null references wa_campaigns(id) on delete cascade,
  day         date not null,
  opens       integer not null default 0 check (opens >= 0),
  primary key (campaign_id, day)
);

drop trigger if exists referrals_set_updated_at on referrals;
create trigger referrals_set_updated_at before update on referrals for each row execute function set_updated_at();
drop trigger if exists referral_reward_rules_set_updated_at on referral_reward_rules;
create trigger referral_reward_rules_set_updated_at before update on referral_reward_rules for each row execute function set_updated_at();

insert into wa_settings (key, value) values
  ('referral_disclosure',       '""'::jsonb),
  ('referral_terms_version',    '"2026-11-27"'::jsonb),
  ('referral_confirm_whatsapp', 'false'::jsonb)
on conflict (key) do nothing;

-- One submission from /refer, all in one transaction. p_code comes from the
-- server's random generator; 'code_taken' asks it to try another.
-- Outcomes: created, repeat (same pair within 24 hours: the earlier id is
-- returned, nothing new is stored), rate_limited, code_taken.
create or replace function referral_submit(
  p_code text, p_referrer_name text, p_referrer_phone text, p_referred_name text, p_referred_phone text,
  p_programme text, p_pref_uni_id text, p_pref_uni text, p_note text, p_terms_version text,
  p_wa_optin boolean, p_campaign_token text, p_ip_hash text
) returns table (ref_code text, outcome text, referral_id uuid)
language plpgsql set search_path = public as $$
declare
  v_prev record; v_flags text[] := '{}'; v_campaign uuid; v_attr text := 'none'; v_lead uuid;
  v_digits text := regexp_replace(p_referred_phone, '[^0-9]', '', 'g'); v_id uuid;
begin
  -- Serialise per referred number so two simultaneous submissions cannot
  -- both miss each other.
  perform pg_advisory_xact_lock(hashtext('referral_submit:' || p_referred_phone));

  select r.id, r.ref_code into v_prev from referrals r
   where r.referrer_phone = p_referrer_phone and r.referred_phone = p_referred_phone
     and r.created_at > now() - interval '24 hours'
   order by r.created_at desc limit 1;
  if found then
    return query select v_prev.ref_code, 'repeat'::text, v_prev.id; return;
  end if;

  delete from referral_rate_hits where at < now() - interval '2 days';
  if p_ip_hash is not null and (select count(*) from referral_rate_hits where bucket = 'ip:' || p_ip_hash and at > now() - interval '1 hour') >= 5 then
    return query select null::text, 'rate_limited'::text, null::uuid; return;
  end if;
  if (select count(*) from referral_rate_hits where bucket = 'ph:' || p_referrer_phone and at > now() - interval '1 day') >= 10 then
    return query select null::text, 'rate_limited'::text, null::uuid; return;
  end if;
  if exists (select 1 from referrals r where r.ref_code = p_code) then
    return query select null::text, 'code_taken'::text, null::uuid; return;
  end if;

  if p_referrer_phone = p_referred_phone then v_flags := array_append(v_flags, 'self_referral'); end if;
  if exists (select 1 from referrals r where r.referred_phone = p_referred_phone) then v_flags := array_append(v_flags, 'already_referred'); end if;
  select l.id into v_lead from leads l where regexp_replace(l.phone, '[^0-9]', '', 'g') = v_digits limit 1;
  if v_lead is not null then v_flags := array_append(v_flags, 'existing_lead'); end if;
  if exists (select 1 from referrals r where r.referrer_phone = p_referrer_phone and r.created_at > now() - interval '24 hours') then
    v_flags := array_append(v_flags, 'many_from_referrer');
  end if;

  if coalesce(p_campaign_token, '') ~ '^[0-9a-f]{16}$' then
    select c.id into v_campaign from wa_campaigns c where c.ref_token = p_campaign_token;
    if v_campaign is not null then v_attr := 'link'; end if;
  end if;
  if v_campaign is null then
    select r.campaign_id into v_campaign
      from wa_campaign_recipients r join wa_contacts ct on ct.id = r.contact_id
     where ct.phone_e164 = p_referrer_phone and r.claimed_at > now() - interval '30 days' and r.message_id is not null
     order by r.claimed_at desc limit 1;
    if v_campaign is not null then v_attr := 'phone_match'; end if;
  end if;

  if v_lead is null then
    insert into leads (name, phone, program, university, source, message)
    values (left(btrim(p_referred_name), 80), v_digits, nullif(p_programme, ''), nullif(p_pref_uni, ''), 'referral',
            'Referred via /refer (' || p_code || ')')
    on conflict do nothing returning id into v_lead;
    if v_lead is null then
      select l.id into v_lead from leads l where regexp_replace(l.phone, '[^0-9]', '', 'g') = v_digits limit 1;
    end if;
  end if;

  insert into referrals (ref_code, referrer_name, referrer_phone, referred_name, referred_phone, programme,
                         preferred_university_id, preferred_university, referrer_note, referred_permission, terms_version,
                         referrer_wa_optin, campaign_id, attribution, lead_id, flags, review_state, ip_hash)
  values (p_code, btrim(p_referrer_name), p_referrer_phone, btrim(p_referred_name), p_referred_phone, nullif(p_programme, ''),
          nullif(p_pref_uni_id, ''), nullif(p_pref_uni, ''), nullif(btrim(coalesce(p_note, '')), ''), true, p_terms_version,
          coalesce(p_wa_optin, false), v_campaign, v_attr, v_lead, v_flags,
          case when cardinality(v_flags) > 0 then 'needs_review' else 'clear' end, p_ip_hash)
  returning id into v_id;

  insert into referral_activity (referral_id, kind, body, actor)
  values (v_id, 'system', 'Submitted on /refer' || case when cardinality(v_flags) > 0 then '. Flags: ' || array_to_string(v_flags, ', ') else '' end, 'system');
  if v_lead is not null then
    insert into lead_activity (lead_id, type, remark) values (v_lead, 'note', 'Referral ' || p_code || ' submitted on /refer');
  end if;

  insert into referral_rate_hits (bucket) values ('ph:' || p_referrer_phone);
  if p_ip_hash is not null then insert into referral_rate_hits (bucket) values ('ip:' || p_ip_hash); end if;

  return query select p_code, 'created'::text, v_id;
end $$;

-- A /refer page load carrying a campaign token. Counted per campaign per day.
-- These are page opens, not button clicks: Meta does not report clicks.
create or replace function referral_count_open(p_token text)
returns boolean language plpgsql set search_path = public as $$
declare v_c uuid;
begin
  if coalesce(p_token, '') !~ '^[0-9a-f]{16}$' then return false; end if;
  select id into v_c from wa_campaigns where ref_token = p_token;
  if v_c is null then return false; end if;
  insert into referral_form_opens (campaign_id, day, opens) values (v_c, (now() at time zone 'Asia/Kolkata')::date, 1)
  on conflict (campaign_id, day) do update set opens = least(referral_form_opens.opens + 1, 1000000);
  return true;
end $$;

-- The referral half of a campaign report.
create or replace function wa_campaign_referral_stats(p_campaign uuid)
returns jsonb language sql stable set search_path = public as $$
  with r as (select * from referrals where campaign_id = p_campaign)
  select jsonb_build_object(
    'form_opens',        coalesce((select sum(opens) from referral_form_opens where campaign_id = p_campaign), 0),
    'submitted',         (select count(*) from r),
    'by_link',           (select count(*) from r where attribution = 'link'),
    'by_phone_match',    (select count(*) from r where attribution = 'phone_match'),
    'unique_valid',      (select count(distinct referred_phone) from r where stage <> 'closed' and not ('self_referral' = any(flags))),
    'contacted',         (select count(*) from r where stage not in ('new','contact_attempted','closed')),
    'applications',      (select count(*) from r where stage in ('application_started','admission_confirmed','reward_approved','reward_paid')),
    'admissions',        (select count(*) from r where stage in ('admission_confirmed','reward_approved','reward_paid')),
    'rewards_pending_n', (select count(*) from r where stage = 'reward_approved'),
    'rewards_pending_inr', coalesce((select sum(reward_amount_inr) from r where stage = 'reward_approved'), 0),
    'rewards_paid_n',    (select count(*) from r where stage = 'reward_paid'),
    'rewards_paid_inr',  coalesce((select sum(reward_amount_inr) from r where stage = 'reward_paid'), 0)
  )
$$;

-- ── 6. Automation for replies to referral campaigns ─────────────────────────
-- The global switch is the existing 'automation_enabled' setting (false).
alter table wa_conversations add column if not exists auto_off boolean not null default false;

create table if not exists wa_auto_rules (
  key        text primary key check (key in ('interested','know_more','reward','call_me')),
  enabled    boolean not null default true,
  keywords   text[] not null default '{}' check (cardinality(keywords) <= 30),
  reply      text not null check (char_length(reply) between 1 and 1024),
  updated_at timestamptz not null default now(),
  updated_by text
);
insert into wa_auto_rules (key, keywords, reply) values
  ('interested', array['yes','interested','i am interested','refer','i want to refer','refer a friend'],
   E'Thank you for your interest in our referral programme!\n\nYou can submit your friend''s details using the link below:\nhttps://edifyedu.in/refer\n\nAfter submitting the form, you will receive a unique referral ID for future communication.'),
  ('know_more', array['know more','more details','details','how does it work','info','tell me more'],
   E'How the edifyedu.in referral programme works:\n\n1. Refer someone interested in pursuing an online degree.\n2. Our team provides education counselling and university comparison guidance.\n3. If the referred student completes an eligible admission, you qualify for the applicable referral reward.\n4. The reward is disbursed within 7 days of confirmed admission, subject to programme terms.\n\nSubmit a referral: https://edifyedu.in/refer'),
  ('reward', array['reward','payment','money','cash','how much','when will i get paid','amount'],
   E'Eligible referral rewards are paid within 7 calendar days of a confirmed admission, subject to the referral programme terms. The amount depends on the programme, the university and the eligibility conditions, and our team confirms it with you after admission.\n\nTerms: https://edifyedu.in/refer#terms'),
  ('call_me', array['call me','call','callback','call back','please call','call me back'],
   E'Thank you. Our team will call you on this number soon.')
on conflict (key) do nothing;

create table if not exists wa_auto_replies (
  inbound_message_id  uuid primary key references wa_messages(id) on delete cascade,
  conversation_id     uuid not null references wa_conversations(id) on delete cascade,
  rule                text not null,
  state               text not null check (state in ('claimed','sent','failed','skipped')),
  reason              text,
  outbound_message_id uuid references wa_messages(id) on delete set null,
  created_at          timestamptz not null default now()
);
create index if not exists wa_auto_replies_conv_idx on wa_auto_replies (conversation_id);

-- Inbound messages from the last 2 hours that automation has not looked at,
-- from contacts a referral campaign reached in the last 30 days.
create or replace function wa_auto_candidates(p_limit integer)
returns table (message_id uuid, conversation_id uuid, contact_id uuid, type text, body text, created_at timestamptz)
language sql stable set search_path = public as $$
  select m.id, m.conversation_id, cv.contact_id, m.type, m.body, m.created_at
    from wa_messages m join wa_conversations cv on cv.id = m.conversation_id
   where m.direction = 'inbound' and m.created_at > now() - interval '2 hours'
     and m.type in ('text','button','interactive')
     and not exists (select 1 from wa_auto_replies a where a.inbound_message_id = m.id)
     and exists (select 1 from wa_campaign_recipients r
                  where r.contact_id = cv.contact_id and r.message_id is not null and r.claimed_at > now() - interval '30 days')
   order by m.created_at
   limit greatest(1, least(p_limit, 50))
$$;

-- Decide and record, under a per-conversation lock, whether automation may
-- answer this inbound message with this rule. Writes exactly one
-- wa_auto_replies row per inbound message, so a webhook retry or a second
-- worker cannot answer twice. Returns 'ok' or the reason it may not.
create or replace function wa_auto_claim(p_message uuid, p_rule text)
returns text language plpgsql set search_path = public as $$
declare v_m record; v_cv record; v_why text; v_rows int;
begin
  select m.id, m.conversation_id, m.created_at, m.direction into v_m from wa_messages m where m.id = p_message;
  if not found or v_m.direction <> 'inbound' then return 'no_message'; end if;
  perform pg_advisory_xact_lock(hashtext('wa_auto:' || v_m.conversation_id::text));
  select cv.id, cv.contact_id, cv.auto_off, cv.last_inbound_at into v_cv from wa_conversations cv where cv.id = v_m.conversation_id;

  v_why := case
    when (select value from wa_settings where key = 'automation_enabled') is distinct from 'true'::jsonb then 'automation_off'
    when p_rule is null then 'no_rule'
    when not exists (select 1 from wa_auto_rules where key = p_rule and enabled) then 'rule_off'
    when v_cv.auto_off then 'conversation_off'
    when v_m.created_at <= now() - interval '2 hours' then 'too_old'
    when v_cv.last_inbound_at is null or v_cv.last_inbound_at <= now() - interval '23 hours' then 'window_closed'
    when wa_contact_opted_out(v_cv.contact_id) or wa_campaign_ineligible(v_cv.contact_id) in ('opted_out','marketing_no') then 'opted_out'
    when (select count(*) from wa_auto_replies a where a.conversation_id = v_cv.id and a.state in ('claimed','sent')) >= 4 then 'cap'
    -- A staff reply after this message means a person has taken over.
    when exists (select 1 from wa_messages o where o.conversation_id = v_cv.id and o.direction = 'outbound'
                  and o.created_at > v_m.created_at and coalesce(o.sent_by, '') not in ('automation', 'system', '')
                  and coalesce(o.sent_by, '') not like 'campaign:%') then 'taken_over'
    else null end;

  insert into wa_auto_replies (inbound_message_id, conversation_id, rule, state, reason)
  values (p_message, v_m.conversation_id, coalesce(p_rule, 'none'), case when v_why is null then 'claimed' else 'skipped' end, v_why)
  on conflict (inbound_message_id) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 0 then return 'duplicate'; end if;
  return coalesce(v_why, 'ok');
end $$;

create or replace function wa_auto_finish(p_message uuid, p_state text, p_outbound uuid, p_reason text)
returns void language sql set search_path = public as $$
  update wa_auto_replies set state = p_state, outbound_message_id = p_outbound, reason = left(p_reason, 200)
   where inbound_message_id = p_message and state = 'claimed' and p_state in ('sent','failed')
$$;

-- A staff reply switches automation off for that conversation.
create or replace function wa_auto_takeover()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.direction = 'outbound' and coalesce(new.sent_by, '') not in ('automation', 'system', '')
     and coalesce(new.sent_by, '') not like 'campaign:%' then
    update wa_conversations set auto_off = true where id = new.conversation_id and not auto_off;
  end if;
  return new;
end $$;
drop trigger if exists wa_messages_auto_takeover on wa_messages;
create trigger wa_messages_auto_takeover after insert on wa_messages for each row execute function wa_auto_takeover();

-- ── Storage bucket (Supabase only; skipped where storage is absent) ─────────
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('wa-media', 'wa-media', false, 4194304)
    on conflict (id) do update set public = false;
  end if;
end $$;

-- ── Access ──────────────────────────────────────────────────────────────────
alter table wa_media_files        enable row level security;
alter table referral_reward_rules enable row level security;
alter table referrals             enable row level security;
alter table referral_activity     enable row level security;
alter table referral_rate_hits    enable row level security;
alter table referral_form_opens   enable row level security;
alter table wa_auto_rules         enable row level security;
alter table wa_auto_replies       enable row level security;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on table wa_media_files, referral_reward_rules, referrals, referral_activity, referral_rate_hits,
                        referral_form_opens, wa_auto_rules, wa_auto_replies from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on table wa_media_files, referral_reward_rules, referrals, referral_activity, referral_rate_hits,
                        referral_form_opens, wa_auto_rules, wa_auto_replies from authenticated;
  end if;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'wa_apply_template_events(jsonb)', 'wa_process_event(bigint)',
    'wa_reserve_template(uuid,uuid,uuid,text,jsonb,text)', 'wa_conversation_for_phone(text,text)',
    'referral_submit(text,text,text,text,text,text,text,text,text,text,boolean,text,text)',
    'referral_count_open(text)', 'wa_campaign_referral_stats(uuid)',
    'wa_auto_candidates(integer)', 'wa_auto_claim(uuid,text)', 'wa_auto_finish(uuid,text,uuid,text)', 'wa_auto_takeover()'
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
