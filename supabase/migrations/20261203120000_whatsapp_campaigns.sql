-- WhatsApp Phase 3: contact lists, marketing consent, templates and campaigns.
--
-- Additive. Phase 1 and Phase 2 tables keep every column and row. Three Phase 2
-- objects change in a compatible way, and the down file restores the functions:
--  - wa_month_usage leaves campaign messages out, so they never count
--    against the Rs 500 inbox cap (campaigns have their own budgets);
--  - wa_consent gains an optional obtained_on date and three more sources;
--  - wa_list_conversations lists only conversations with an inbound message,
--    so campaign sends never bury real chats. Before this release every
--    conversation starts with an inbound message, so the live inbox looks
--    the same whether or not this has run.
--
-- Nothing here sends anything. campaigns_enabled stays false (Phase 1 set
-- it), and a campaign also needs the owner's approval, a template Meta has
-- APPROVED, recorded marketing consent per recipient and budgets.
--
-- Verify after running:
--   select count(*) from pg_proc where proname in (
--     'wa_import_numbers','wa_numbers_status','wa_campaign_ineligible','wa_campaign_add_recipients',
--     'wa_campaign_claim','wa_campaign_finish','wa_campaign_release','wa_campaign_stats',
--     'wa_campaign_spend','wa_record_marketing_opt_outs','wa_campaign_retention','wa_list_conversations',
--     'wa_campaign_preview','wa_campaign_approve','wa_campaign_control','wa_campaign_stop_codes');
--   -- expect 16
--   select key from wa_settings where key like 'campaign%' order by key;
--   -- expect 6: campaign_budget_daily_inr, campaign_budget_monthly_inr,
--   --   campaign_daily_max, campaign_default_batch, campaign_tax_pct, campaigns_enabled

-- ── Lists ───────────────────────────────────────────────────────────────────
create table if not exists wa_lists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 80),
  created_by  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  archived_at timestamptz
);
create unique index if not exists wa_lists_name_uidx on wa_lists (lower(btrim(name))) where archived_at is null;

create table if not exists wa_list_members (
  list_id    uuid not null references wa_lists(id) on delete cascade,
  contact_id uuid not null references wa_contacts(id) on delete cascade,
  source     text not null check (source in ('paste','file','inbox','crm','list')),
  added_by   text not null,
  added_at   timestamptz not null default now(),
  primary key (list_id, contact_id)
);
create index if not exists wa_list_members_contact_idx on wa_list_members (contact_id);

-- ── Consent: a date and the sources Rishi's records can have ─────────────────
alter table wa_consent add column if not exists obtained_on date;
alter table wa_consent drop constraint if exists wa_consent_source_check;
alter table wa_consent add constraint wa_consent_source_check check (source in
  ('lead_form','whatsapp_message','phone_call','admin_entry','enrolment_record','referral_reply','other'));

-- ── Templates (a cache of what Meta holds) ──────────────────────────────────
create table if not exists wa_templates (
  id           uuid primary key default gen_random_uuid(),
  meta_id      text unique,
  name         text not null check (name ~ '^[a-z0-9_]+$' and char_length(name) <= 512),
  language     text not null,
  category     text not null check (category in ('MARKETING','UTILITY','AUTHENTICATION')),
  status       text not null,
  components   jsonb not null default '[]'::jsonb,
  reason       text,
  quality      text,
  submitted_by text,
  created_at   timestamptz not null default now(),
  synced_at    timestamptz,
  unique (name, language)
);

-- ── Campaigns ───────────────────────────────────────────────────────────────
create table if not exists wa_campaigns (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(btrim(name)) between 1 and 100),
  status          text not null default 'draft'
                  check (status in ('draft','approved','sending','paused','completed','cancelled')),
  template_id     uuid references wa_templates(id) on delete restrict,
  scheduled_at    timestamptz,
  batch_size      integer not null default 50 check (batch_size between 1 and 200),
  daily_max       integer not null default 250 check (daily_max between 1 and 100000),
  budget_inr      numeric(12,2) check (budget_inr >= 0),
  approval        jsonb,          -- what the owner approved: template, recipients, budget, rate, tax, cost
  approved_by     text,
  approved_at     timestamptz,
  paused_reason   text,
  resumed_at      timestamptz,    -- Meta stop errors before this were seen by the owner, who resumed
  duplicated_from uuid references wa_campaigns(id) on delete set null,
  created_by      text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz
);
create index if not exists wa_campaigns_status_idx on wa_campaigns (status, scheduled_at);

create table if not exists wa_campaign_recipients (
  id          bigint generated always as identity primary key,
  campaign_id uuid not null references wa_campaigns(id) on delete cascade,
  contact_id  uuid not null references wa_contacts(id) on delete cascade,
  state       text not null default 'queued'
              check (state in ('queued','sending','accepted','failed','unknown','skipped','cancelled')),
  skip_reason text,
  client_ref  uuid not null unique default gen_random_uuid(),
  message_id  uuid references wa_messages(id) on delete set null,
  error_code  integer,
  claimed_at  timestamptz,
  finished_at timestamptz,
  unique (campaign_id, contact_id)
);
create index if not exists wa_campaign_recipients_queue_idx on wa_campaign_recipients (campaign_id, state, id);
create index if not exists wa_campaign_recipients_contact_idx on wa_campaign_recipients (contact_id);
create index if not exists wa_campaign_recipients_claimed_idx on wa_campaign_recipients (claimed_at) where claimed_at is not null;
create index if not exists wa_messages_reply_to_idx on wa_messages (reply_to_wamid) where reply_to_wamid is not null;

alter table wa_lists               enable row level security;
alter table wa_list_members        enable row level security;
alter table wa_templates           enable row level security;
alter table wa_campaigns           enable row level security;
alter table wa_campaign_recipients enable row level security;
-- RLS with no policies already denies the API roles; revoking the grants too
-- means a policy added by mistake later still exposes nothing.
revoke all on table wa_lists, wa_list_members, wa_templates, wa_campaigns, wa_campaign_recipients from anon, authenticated;

drop trigger if exists wa_lists_set_updated_at on wa_lists;
create trigger wa_lists_set_updated_at before update on wa_lists for each row execute function set_updated_at();
drop trigger if exists wa_campaigns_set_updated_at on wa_campaigns;
create trigger wa_campaigns_set_updated_at before update on wa_campaigns for each row execute function set_updated_at();

-- An approved campaign cannot change what was approved. Editing means going
-- back to draft, which clears the approval.
create or replace function wa_campaign_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.status <> 'draft' and (
       new.template_id is distinct from old.template_id or new.budget_inr is distinct from old.budget_inr
    or new.batch_size is distinct from old.batch_size or new.daily_max is distinct from old.daily_max
    or new.approval is distinct from old.approval and new.status <> 'draft') then
    raise exception 'campaign_locked' using errcode = 'P0001';
  end if;
  if new.status = 'draft' then
    new.approval := null; new.approved_by := null; new.approved_at := null;
  end if;
  return new;
end $$;
drop trigger if exists wa_campaigns_guard on wa_campaigns;
create trigger wa_campaigns_guard before update on wa_campaigns for each row execute function wa_campaign_guard();

create or replace function wa_campaign_recipients_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  -- FOR SHARE waits for an approval in progress (it holds FOR UPDATE), so a
  -- row cannot slip in between the approval snapshot and the status change.
  if (select status from wa_campaigns where id = new.campaign_id for share) <> 'draft' then
    raise exception 'campaign_locked' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists wa_campaign_recipients_guard on wa_campaign_recipients;
create trigger wa_campaign_recipients_guard before insert on wa_campaign_recipients
  for each row execute function wa_campaign_recipients_guard();

-- ── Settings ────────────────────────────────────────────────────────────────
-- Budgets include the estimated tax. Rishi's figures of 27 Nov 2026: ₹250 a
-- day, ₹2,000 a month, batches of 50; all editable in Settings. A budget set
-- to null blocks sending. campaign_daily_max is Meta's 24-hour messaging
-- limit for the whole business; 250 is the documented limit for a new
-- portfolio until Rishi reads his real one. GST 18% is an assumption until
-- he checks a Meta invoice.
insert into wa_settings (key, value) values
  ('campaign_budget_daily_inr',   '250'::jsonb),
  ('campaign_budget_monthly_inr', '2000'::jsonb),
  ('campaign_default_batch',      '50'::jsonb),
  ('campaign_tax_pct',            '18'::jsonb),
  ('campaign_daily_max',          '250'::jsonb)
on conflict (key) do nothing;

-- ── Contacts from a paste or a file ─────────────────────────────────────────
-- Numbers arrive already normalised by lib/whatsapp/phones.ts; anything that
-- is not +91 and 10 mobile digits is refused here as well.
create or replace function wa_import_numbers(p_numbers text[], p_list uuid, p_source text, p_actor text)
returns jsonb language plpgsql set search_path = public as $$
declare v_valid text[]; v_new int; v_added int; v_in_list int;
begin
  if coalesce(array_length(p_numbers, 1), 0) > 20000 then raise exception 'too_many' using errcode = 'P0001'; end if;
  select coalesce(array_agg(distinct x), '{}') into v_valid from unnest(p_numbers) x where x ~ '^\+91[6-9][0-9]{9}$';
  with ins as (
    insert into wa_contacts (phone_e164, wa_id, phone_source)
    select x, substr(x, 2), 'import' from unnest(v_valid) x
    on conflict (phone_e164) do nothing returning 1)
  select count(*) into v_new from ins;
  v_added := 0; v_in_list := 0;
  if p_list is not null then
    if not exists (select 1 from wa_lists where id = p_list and archived_at is null) then
      raise exception 'no_list' using errcode = 'P0001';
    end if;
    select count(*) into v_in_list from wa_list_members m join wa_contacts ct on ct.id = m.contact_id
     where m.list_id = p_list and ct.phone_e164 = any (v_valid);
    with ins as (
      insert into wa_list_members (list_id, contact_id, source, added_by)
      select p_list, ct.id, p_source, p_actor from wa_contacts ct where ct.phone_e164 = any (v_valid)
      on conflict do nothing returning 1)
    select count(*) into v_added from ins;
    update wa_lists set updated_at = now() where id = p_list;
  end if;
  return jsonb_build_object('received', coalesce(array_length(p_numbers, 1), 0), 'valid', array_length(v_valid, 1),
                            'new_contacts', v_new, 'added_to_list', v_added, 'already_in_list', v_in_list);
end $$;

-- ── Eligibility, checked again at the moment of sending ─────────────────────
-- null when a marketing template may go to this contact; otherwise why not.
-- Unknown consent is not consent. A STOP, or the "Stop promotions" button,
-- after the latest marketing record overrides a Yes.
create or replace function wa_is_marketing_opt_out(p_type text, p_body text)
returns boolean language sql immutable set search_path = public as $$
  select p_type in ('text','button','interactive')
     and (wa_is_opt_out(p_body) or coalesce(p_body ~* '^\s*stop promotions\s*[.!]*\s*$', false))
$$;

create or replace function wa_campaign_ineligible(p_contact uuid)
returns text language sql stable set search_path = public as $$
  with c as (
    select granted, recorded_at, obtained_on from wa_consent
     where contact_id = p_contact and purpose = 'marketing' order by recorded_at desc limit 1
  )
  -- A STOP wins over a Yes recorded later unless the Yes was OBTAINED after
  -- the STOP: an old admission form typed in today must not undo last
  -- week's STOP. Same-day counts as after the STOP (conservative).
  select case
    when (select phone_e164 from wa_contacts where id = p_contact) is null then 'no_phone'
    when wa_contact_opted_out(p_contact) then 'opted_out'
    when exists (select 1 from wa_messages m join wa_conversations cv on cv.id = m.conversation_id
                  where cv.contact_id = p_contact and m.direction = 'inbound'
                    and wa_is_marketing_opt_out(m.type, m.body)
                    and (m.created_at > coalesce((select recorded_at from c), '-infinity'::timestamptz)
                         or (m.created_at at time zone 'Asia/Kolkata')::date
                            >= coalesce((select obtained_on from c), ((select recorded_at from c) at time zone 'Asia/Kolkata')::date))) then 'opted_out'
    when not exists (select 1 from c) then 'no_consent'
    when exists (select 1 from c where not granted) then 'marketing_no'
    -- Same rule for a recorded No (the sweep writes one for every STOP): a
    -- later-entered Yes must have been obtained after it.
    when exists (select 1 from wa_consent n, c
                  where n.contact_id = p_contact and n.purpose = 'marketing' and not n.granted
                    and (n.recorded_at at time zone 'Asia/Kolkata')::date
                        >= coalesce(c.obtained_on, (c.recorded_at at time zone 'Asia/Kolkata')::date)) then 'marketing_no'
    else null end
$$;

-- The validation report: for each normalised number, whether it is already a
-- contact, its marketing consent and whether it has opted out. Read-only;
-- previewing a paste or a file creates nothing.
create or replace function wa_numbers_status(p_numbers text[])
returns table (phone text, contact_id uuid, marketing text, opted_out boolean, lists integer)
language sql stable set search_path = public as $$
  with n as (select distinct x as phone from unnest(p_numbers[1:20000]) x where x ~ '^\+91[6-9][0-9]{9}$')
  select n.phone, ct.id,
         case when ct.id is null then 'unknown'
              else coalesce((select case when c.granted then 'yes' else 'no' end from wa_consent c
                              where c.contact_id = ct.id and c.purpose = 'marketing'
                              order by c.recorded_at desc limit 1), 'unknown') end,
         case when ct.id is null then false else coalesce(wa_campaign_ineligible(ct.id) = 'opted_out', false) end,
         case when ct.id is null then 0 else (select count(*)::int from wa_list_members m where m.contact_id = ct.id) end
    from n left join wa_contacts ct on ct.phone_e164 = n.phone
$$;

-- Run by the sweep: an opt-out word or the "Stop promotions" button becomes a
-- recorded marketing No, so the history shows why a number is excluded.
create or replace function wa_record_marketing_opt_outs()
returns integer language plpgsql set search_path = public as $$
declare v_n integer;
begin
  with hits as (
    select cv.contact_id, max(m.created_at) as at
      from wa_messages m join wa_conversations cv on cv.id = m.conversation_id
     where m.direction = 'inbound' and m.created_at > now() - interval '3 days'
       and wa_is_marketing_opt_out(m.type, m.body)
     group by cv.contact_id
  ), ins as (
    insert into wa_consent (contact_id, purpose, granted, source, evidence, recorded_by)
    select h.contact_id, 'marketing', false, 'whatsapp_message',
           'Opt-out reply received ' || to_char(h.at at time zone 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI') || ' IST', 'system'
      from hits h
     where not exists (select 1 from wa_consent c where c.contact_id = h.contact_id
                        and c.purpose = 'marketing' and c.recorded_at >= h.at)
    returning 1
  ) select count(*)::int into v_n from ins;
  return v_n;
end $$;

-- ── Recipients ──────────────────────────────────────────────────────────────
-- Draft campaigns only (the trigger refuses otherwise). p_exclude_campaign
-- leaves out everyone a previous campaign already reached, so a duplicated
-- campaign never resends.
create or replace function wa_campaign_add_recipients(
  p_campaign uuid, p_contacts uuid[], p_list uuid, p_exclude_campaign uuid
) returns integer language plpgsql set search_path = public as $$
declare v_n int;
begin
  with src as (
    select unnest(coalesce(p_contacts, '{}')) as contact_id
    union
    select m.contact_id from wa_list_members m where p_list is not null and m.list_id = p_list
  ), ins as (
    insert into wa_campaign_recipients (campaign_id, contact_id)
    select p_campaign, s.contact_id from src s
     where exists (select 1 from wa_contacts ct where ct.id = s.contact_id)
       and (p_exclude_campaign is null or not exists (
             select 1 from wa_campaign_recipients r where r.campaign_id = p_exclude_campaign
                and r.contact_id = s.contact_id and r.state in ('sending','accepted','unknown')))
    on conflict (campaign_id, contact_id) do nothing returning 1
  ) select count(*)::int into v_n from ins;
  return v_n;
end $$;

-- ── Spend so far (estimates; Meta's own billing comes from status webhooks) ──
-- A claimed message counts as charged unless Meta reported it failed. That is
-- conservative: Meta bills marketing per delivered message.
create or replace function wa_campaign_spend(p_tz text)
returns jsonb language sql stable set search_path = public as $$
  with b as (
    select (date_trunc('day', now() at time zone p_tz)) at time zone p_tz as day_start,
           (date_trunc('month', now() at time zone p_tz)) at time zone p_tz as month_start
  ), charged as (
    select r.campaign_id, r.claimed_at from wa_campaign_recipients r
      left join wa_messages m on m.id = r.message_id
     where r.state in ('sending','accepted','unknown') and coalesce(m.status, '') <> 'failed'
       and r.claimed_at >= (select month_start from b)
  )
  select jsonb_build_object(
    'day_start', (select day_start from b), 'month_start', (select month_start from b),
    'today', (select count(*) from charged, b where claimed_at >= b.day_start),
    'month', (select count(*) from charged),
    'last_24h_reached', (select count(distinct r.contact_id) from wa_campaign_recipients r
                          where r.claimed_at > now() - interval '24 hours' and r.state in ('sending','accepted','unknown'))
  )
$$;

-- Meta error codes that mean "stop the whole campaign", not "this number
-- failed". Kept in step with STOP_CODES in lib/whatsapp/campaign-worker.ts.
--   190 token expired · 4 / 80007 / 130429 rate limits · 368 policy block
--   131031 account locked · 131042 payment problem · 131048 spam rate limit
--   132000 / 132012 template parameters · 132001 template missing
--   132015 template paused · 132016 template disabled
-- 131049 (Meta's per-user marketing limit) and 131026 (not reachable) fail
-- only that recipient.
create or replace function wa_campaign_stop_codes()
returns integer[] language sql immutable set search_path = public as $$
  select array[190, 4, 80007, 130429, 368, 131031, 131042, 131048, 132000, 132001, 132012, 132015, 132016]
$$;

-- What the owner sees and approves. Recounts eligibility now, prices it at
-- today's rate and tax, and refuses unless the campaign budget covers it.
-- p_seen_recipients and p_seen_template guard against approving a screen
-- that is out of date.
create or replace function wa_campaign_preview(p_campaign uuid)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  v_c record; v_t record; v_s jsonb; v_rate numeric; v_tax numeric; v_ok int; v_total int; v_skip jsonb; v_text text;
begin
  select * into v_c from wa_campaigns where id = p_campaign;
  if not found then return jsonb_build_object('error', 'no_campaign'); end if;
  select * into v_t from wa_templates where id = v_c.template_id;
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_s from wa_settings;
  if jsonb_typeof(v_s->'rates'->'marketing') = 'number' then v_rate := (v_s->'rates'->>'marketing')::numeric; end if;
  v_tax := case when jsonb_typeof(v_s->'campaign_tax_pct') = 'number' then (v_s->>'campaign_tax_pct')::numeric else 18 end;
  select count(*) filter (where e is null), count(*),
         coalesce(jsonb_object_agg(e, n) filter (where e is not null), '{}'::jsonb)
    into v_ok, v_total, v_skip
    from (select e, count(*) over (partition by e) n from
           (select wa_campaign_ineligible(r.contact_id) e from wa_campaign_recipients r
             where r.campaign_id = p_campaign and r.state = 'queued') x) y;
  select string_agg(t, E'\n\n') into v_text from (
    select case c->>'type' when 'HEADER' then c->>'text' when 'BODY' then c->>'text' when 'FOOTER' then c->>'text' end t
      from jsonb_array_elements(coalesce(v_t.components, '[]'::jsonb)) c
     where c->>'type' in ('HEADER','BODY','FOOTER') and c ? 'text') z;
  return jsonb_build_object(
    'template_id', v_c.template_id, 'template_name', v_t.name, 'template_status', v_t.status,
    'category', v_t.category, 'preview', v_text,
    'recipients_queued', v_total, 'eligible', v_ok, 'excluded', v_skip,
    'rate', v_rate, 'tax_pct', v_tax,
    'cost_before_tax', round(v_ok * coalesce(v_rate, 0), 2),
    'cost_with_tax', round(v_ok * coalesce(v_rate, 0) * (1 + v_tax / 100), 2),
    'budget_inr', v_c.budget_inr);
end $$;

create or replace function wa_campaign_approve(p_campaign uuid, p_actor text, p_seen_eligible int, p_seen_template uuid)
returns text language plpgsql set search_path = public as $$
declare v_p jsonb; v_status text;
begin
  select status into v_status from wa_campaigns where id = p_campaign for update;
  if v_status is null then return 'no_campaign'; end if;
  if v_status <> 'draft' then return 'not_draft'; end if;
  v_p := wa_campaign_preview(p_campaign);
  if v_p->>'template_status' is distinct from 'APPROVED' then return 'template_not_approved'; end if;
  if v_p->>'rate' is null then return 'rate_missing'; end if;
  if (v_p->>'eligible')::int = 0 then return 'no_eligible_recipients'; end if;
  if (v_p->>'eligible')::int <> p_seen_eligible or (v_p->>'template_id')::uuid is distinct from p_seen_template then return 'preview_changed'; end if;
  if (v_p->>'budget_inr') is null or (v_p->>'cost_with_tax')::numeric > (v_p->>'budget_inr')::numeric then return 'over_budget'; end if;
  -- Only the people counted as eligible in the approval can be messaged:
  -- the rest are skipped now, so consent recorded later cannot grow the
  -- campaign past what was approved. Back to draft puts them back.
  update wa_campaign_recipients set state = 'skipped', skip_reason = wa_campaign_ineligible(contact_id), finished_at = now()
   where campaign_id = p_campaign and state = 'queued' and wa_campaign_ineligible(contact_id) is not null;
  update wa_campaigns set status = 'approved', approval = v_p, approved_by = p_actor, approved_at = now(), paused_reason = null
   where id = p_campaign;
  return null;
end $$;

-- Pause, resume, cancel, or back to draft (only before anything was sent).
create or replace function wa_campaign_control(p_campaign uuid, p_action text)
returns text language plpgsql set search_path = public as $$
declare v_c record;
begin
  select * into v_c from wa_campaigns where id = p_campaign for update;
  if not found then return 'no_campaign'; end if;
  if p_action = 'pause' then
    if v_c.status not in ('approved','sending') then return 'bad_state'; end if;
    update wa_campaigns set status = 'paused', paused_reason = 'owner' where id = p_campaign;
  elsif p_action = 'resume' then
    if v_c.status <> 'paused' then return 'bad_state'; end if;
    update wa_campaigns set status = case when v_c.started_at is null then 'approved' else 'sending' end,
                            paused_reason = null, resumed_at = now() where id = p_campaign;
  elsif p_action = 'cancel' then
    if v_c.status in ('completed','cancelled') then return 'bad_state'; end if;
    update wa_campaign_recipients set state = 'cancelled', finished_at = now()
     where campaign_id = p_campaign and state = 'queued';
    update wa_campaigns set status = 'cancelled', completed_at = now() where id = p_campaign;
  elsif p_action = 'unapprove' then
    if v_c.status not in ('approved','paused') then return 'bad_state'; end if;
    if exists (select 1 from wa_campaign_recipients where campaign_id = p_campaign and claimed_at is not null) then
      return 'already_sending';
    end if;
    -- Nothing was claimed, so every skipped row was skipped at approval.
    update wa_campaign_recipients set state = 'queued', skip_reason = null, finished_at = null
     where campaign_id = p_campaign and state = 'skipped' and claimed_at is null;
    update wa_campaigns set status = 'draft', paused_reason = null where id = p_campaign;
  else
    return 'bad_action';
  end if;
  return null;
end $$;

-- ── The send queue ──────────────────────────────────────────────────────────
-- Step 1, under a lock: check every rule, skip ineligible recipients, reserve
-- budget and create the outbound rows. Returns the rows to send, or one row
-- with blocked set. Nothing is reserved when a rule blocks.
create or replace function wa_campaign_claim(p_campaign uuid, p_limit int, p_pnid text)
returns table (recipient_id bigint, client_ref uuid, phone text, blocked text)
language plpgsql set search_path = public as $$
declare
  v_c record; v_s jsonb; v_tz text; v_sp jsonb; v_rate numeric; v_tax numeric; v_unit numeric;
  v_daily numeric; v_monthly numeric; v_gmax int; v_room int; v_campaign_charged int;
  v_r record; v_why text; v_conv uuid; v_msg uuid; v_n int := 0; v_scanned int := 0; v_tpl record;
begin
  perform pg_advisory_xact_lock(hashtext('wa_campaign_claim'));

  select * into v_c from wa_campaigns where id = p_campaign for update;
  if not found then return query select null::bigint, null::uuid, null::text, 'no_campaign'; return; end if;

  -- A send that never came back (the function died mid-call) is uncertain.
  -- It is never resent; the owner sees it as "unknown".
  update wa_messages m set send_state = 'unknown'
    from wa_campaign_recipients r
   where r.campaign_id = p_campaign and r.state = 'sending' and r.claimed_at < now() - interval '10 minutes'
     and m.id = r.message_id and m.send_state = 'sending';
  update wa_campaign_recipients set state = 'unknown', finished_at = now()
   where campaign_id = p_campaign and state = 'sending' and claimed_at < now() - interval '10 minutes';

  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into v_s from wa_settings;
  if v_s->'campaigns_enabled' is distinct from 'true'::jsonb then
    return query select null::bigint, null::uuid, null::text, 'campaigns_off'; return;
  end if;
  if v_c.status = 'approved' and (v_c.scheduled_at is null or v_c.scheduled_at <= now()) then
    update wa_campaigns set status = 'sending', started_at = coalesce(started_at, now()) where id = p_campaign;
    v_c.status := 'sending';
  end if;
  if v_c.status <> 'sending' then
    return query select null::bigint, null::uuid, null::text, 'not_sending'; return;
  end if;

  select * into v_tpl from wa_templates where id = v_c.template_id;
  if not found or v_tpl.status <> 'APPROVED' or v_tpl.category <> (v_c.approval->>'category') then
    update wa_campaigns set status = 'paused', paused_reason = 'template_not_approved' where id = p_campaign;
    return query select null::bigint, null::uuid, null::text, 'template_not_approved'; return;
  end if;

  -- A Meta error that means "stop" on any message of this campaign pauses it.
  if exists (select 1 from wa_campaign_recipients r join wa_messages m on m.id = r.message_id
              where r.campaign_id = p_campaign and m.status = 'failed'
                and m.error_code = any (wa_campaign_stop_codes())
                -- Only errors after the owner last resumed, or resuming could never work.
                and greatest(r.finished_at, (select max(s.received_at) from wa_message_statuses s
                                              where s.wamid = m.wamid and s.status = 'failed'))
                    > coalesce(v_c.resumed_at, '-infinity'::timestamptz)) then
    update wa_campaigns set status = 'paused', paused_reason = 'meta_error' where id = p_campaign;
    return query select null::bigint, null::uuid, null::text, 'meta_error'; return;
  end if;

  if jsonb_typeof(v_s->'rates'->'marketing') = 'number' and v_s->'rates'->>'currency' = 'INR' then
    v_rate := (v_s->'rates'->>'marketing')::numeric;
  end if;
  if v_rate is null or v_rate <= 0 or v_rate > 100 then
    return query select null::bigint, null::uuid, null::text, 'rate_missing'; return;
  end if;
  -- The rate went up after approval: the approved cost no longer holds.
  if v_rate > coalesce((v_c.approval->>'rate')::numeric, 0) + 0.000001 then
    update wa_campaigns set status = 'paused', paused_reason = 'rate_changed' where id = p_campaign;
    return query select null::bigint, null::uuid, null::text, 'rate_changed'; return;
  end if;
  v_tax := case when jsonb_typeof(v_s->'campaign_tax_pct') = 'number' then (v_s->>'campaign_tax_pct')::numeric else 18 end;
  v_unit := v_rate * (1 + greatest(v_tax, 0) / 100);
  if jsonb_typeof(v_s->'campaign_budget_daily_inr') = 'number' then v_daily := (v_s->>'campaign_budget_daily_inr')::numeric; end if;
  if jsonb_typeof(v_s->'campaign_budget_monthly_inr') = 'number' then v_monthly := (v_s->>'campaign_budget_monthly_inr')::numeric; end if;
  if v_daily is null or v_monthly is null or v_c.budget_inr is null then
    return query select null::bigint, null::uuid, null::text, 'budget_missing'; return;
  end if;
  v_gmax := case when jsonb_typeof(v_s->'campaign_daily_max') = 'number' then (v_s->>'campaign_daily_max')::int else 250 end;

  v_tz := case when jsonb_typeof(v_s->'billing_timezone') = 'string' then v_s->>'billing_timezone' else 'Asia/Kolkata' end;
  begin v_sp := wa_campaign_spend(v_tz); exception when others then v_sp := wa_campaign_spend('Asia/Kolkata'); end;
  select count(*) into v_campaign_charged from wa_campaign_recipients r left join wa_messages m on m.id = r.message_id
   where r.campaign_id = p_campaign and r.state in ('sending','accepted','unknown') and coalesce(m.status, '') <> 'failed';

  v_room := least(greatest(coalesce(p_limit, 0), 0), v_c.batch_size,
    floor((v_c.budget_inr + 0.000001) / v_unit)::int - v_campaign_charged,
    floor((v_monthly + 0.000001) / v_unit)::int - (v_sp->>'month')::int,
    floor((v_daily + 0.000001) / v_unit)::int - (v_sp->>'today')::int,
    v_gmax - (v_sp->>'last_24h_reached')::int,
    v_c.daily_max - (select count(*)::int from wa_campaign_recipients r where r.campaign_id = p_campaign
                      and r.claimed_at > now() - interval '24 hours' and r.state in ('sending','accepted','unknown')));

  if floor((v_c.budget_inr + 0.000001) / v_unit)::int - v_campaign_charged <= 0 then
    update wa_campaigns set status = 'paused', paused_reason = 'campaign_budget_reached' where id = p_campaign;
    return query select null::bigint, null::uuid, null::text, 'campaign_budget_reached'; return;
  end if;
  if floor((v_monthly + 0.000001) / v_unit)::int - (v_sp->>'month')::int <= 0 then
    update wa_campaigns set status = 'paused', paused_reason = 'monthly_budget_reached' where id = p_campaign;
    return query select null::bigint, null::uuid, null::text, 'monthly_budget_reached'; return;
  end if;
  if v_room <= 0 then
    -- Daily budget or a 24-hour limit: wait, the next day continues.
    return query select null::bigint, null::uuid, null::text, 'daily_limit'; return;
  end if;

  for v_r in
    select r.id, r.client_ref, r.contact_id, ct.phone_e164 from wa_campaign_recipients r
      join wa_contacts ct on ct.id = r.contact_id
     where r.campaign_id = p_campaign and r.state = 'queued'
     order by r.id limit 2000
     for update of r skip locked
  loop
    exit when v_n >= v_room or v_scanned >= 2000;
    v_scanned := v_scanned + 1;
    v_why := wa_campaign_ineligible(v_r.contact_id);
    if v_why is not null then
      update wa_campaign_recipients set state = 'skipped', skip_reason = v_why, finished_at = now() where id = v_r.id;
      continue;
    end if;
    v_conv := wa_upsert_conversation(v_r.contact_id, p_pnid);
    insert into wa_messages (conversation_id, direction, client_ref, type, body, payload, sent_by, send_state)
    values (v_conv, 'outbound', v_r.client_ref, 'template', v_c.approval->>'preview',
            jsonb_build_object('template', jsonb_build_object('name', v_tpl.name, 'language', v_tpl.language), 'campaign_id', p_campaign),
            'campaign:' || p_campaign, 'sending')
    returning id into v_msg;
    update wa_campaign_recipients set state = 'sending', message_id = v_msg, claimed_at = now() where id = v_r.id;
    v_n := v_n + 1;
    return query select v_r.id, v_r.client_ref, v_r.phone_e164, null::text;
  end loop;

  if v_n = 0 and not exists (select 1 from wa_campaign_recipients where campaign_id = p_campaign and state in ('queued','sending')) then
    update wa_campaigns set status = 'completed', completed_at = now() where id = p_campaign;
    return query select null::bigint, null::uuid, null::text, 'completed'; return;
  end if;
end $$;

-- Step 2: record Meta's answer through the Phase 2 function, then the
-- recipient. An error that means stop pauses the campaign at once.
create or replace function wa_campaign_finish(
  p_client_ref uuid, p_wamid text, p_state text, p_error_code int, p_error_title text
) returns void language plpgsql set search_path = public as $$
declare v_campaign uuid;
begin
  perform wa_finish_outbound(p_client_ref, p_wamid, p_state, p_error_code, p_error_title);
  update wa_campaign_recipients set state = p_state, error_code = p_error_code, finished_at = now()
   where client_ref = p_client_ref and state = 'sending'
  returning campaign_id into v_campaign;
  if v_campaign is not null and p_state = 'failed' and p_error_code = any (wa_campaign_stop_codes()) then
    update wa_campaigns set status = 'paused', paused_reason = 'meta_error_' || p_error_code
     where id = v_campaign and status = 'sending';
  end if;
end $$;

-- Claimed but never handed to Meta (the run ran out of time): safe to put
-- back, because no request was made. Only for rows still 'sending' whose
-- message has no wamid.
create or replace function wa_campaign_release(p_client_refs uuid[])
returns integer language plpgsql set search_path = public as $$
declare v_n int;
begin
  with r as (
    update wa_campaign_recipients r set state = 'queued', message_id = null, claimed_at = null
     where r.client_ref = any (p_client_refs) and r.state = 'sending'
       and exists (select 1 from wa_messages m where m.client_ref = r.client_ref and m.wamid is null and m.send_state = 'sending')
    returning r.client_ref)
  , d as (delete from wa_messages m using r where m.client_ref = r.client_ref returning 1)
  select count(*)::int into v_n from d;
  return v_n;
end $$;

-- ── Reporting ───────────────────────────────────────────────────────────────
-- Replies count only with evidence: the reply quotes the campaign message or
-- presses its button (context.id is the campaign wamid). Messages from a
-- recipient within 7 days without that link are reported separately as
-- "messaged after the campaign, not confirmed".
create or replace function wa_campaign_stats(p_campaign uuid)
returns jsonb language sql stable set search_path = public as $$
  with r as (
    select r.*, m.wamid, m.status as mstatus, m.status_rank, cv.id as conv_id, ct.id as cid
      from wa_campaign_recipients r
      left join wa_messages m on m.id = r.message_id
      left join wa_conversations cv on cv.id = m.conversation_id
      join wa_contacts ct on ct.id = r.contact_id
     where r.campaign_id = p_campaign
  ), replies as (
    select distinct r.cid from r join wa_messages i on i.reply_to_wamid = r.wamid and i.direction = 'inbound'
     where r.wamid is not null
  ), after as (
    select distinct r.cid from r join wa_messages i on i.conversation_id = r.conv_id and i.direction = 'inbound'
     where r.claimed_at is not null and i.created_at > r.claimed_at and i.created_at < r.claimed_at + interval '7 days'
       and r.cid not in (select cid from replies)
  ), optouts as (
    select distinct r.cid from r join wa_consent c on c.contact_id = r.cid and c.purpose = 'marketing' and not c.granted
     where r.claimed_at is not null and c.recorded_at > r.claimed_at
  ), billed as (
    select count(distinct s.wamid) filter (where s.pricing->>'billable' = 'true') as billable
      from wa_message_statuses s where s.wamid in (select wamid from r where wamid is not null)
  )
  select jsonb_build_object(
    'total',      (select count(*) from r),
    'queued',     (select count(*) from r where state = 'queued'),
    'processing', (select count(*) from r where state = 'sending'),
    'skipped',    (select count(*) from r where state = 'skipped'),
    'skipped_by_reason', (select coalesce(jsonb_object_agg(skip_reason, n), '{}'::jsonb) from
                           (select skip_reason, count(*) n from r where state = 'skipped' group by skip_reason) x),
    'cancelled',  (select count(*) from r where state = 'cancelled'),
    'unknown',    (select count(*) from r where state = 'unknown'),
    'sent',       (select count(*) from r where state = 'accepted'),
    'delivered',  (select count(*) from r where status_rank >= 2),
    'read',       (select count(*) from r where status_rank >= 3),
    'failed',     (select count(*) from r where state = 'failed' or (state = 'accepted' and mstatus = 'failed')),
    'replies',    (select count(*) from replies),
    'messaged_after_unconfirmed', (select count(*) from after),
    'opt_outs',   (select count(*) from optouts),
    'meta_billable', (select billable from billed)
  )
$$;

-- ── Inbox spend: campaigns are not inbox messages ──────────────────────────
-- Phase 2's wa_month_usage counted every billable Meta status, so marketing
-- messages sent by campaigns would have been charged against the Rs 500
-- inbox cap (wa_reserve_outbound reads meta_billable). Campaign messages
-- are left out here; they have their own budgets (wa_campaign_spend).
create index if not exists wa_campaign_recipients_message_idx on wa_campaign_recipients (message_id) where message_id is not null;
create or replace function wa_month_usage(p_tz text)
returns jsonb language sql stable set search_path = public as $$
  with b as (
    select (date_trunc('month', now() at time zone p_tz)) at time zone p_tz as start_at
  ), o as (
    select m.* from wa_messages m, b
     where m.direction = 'outbound' and m.created_at >= b.start_at
       and not exists (select 1 from wa_campaign_recipients r where r.message_id = m.id)
  ), st as (
    select s.wamid,
           bool_or(s.pricing->>'billable' = 'true')  as billable,
           bool_or(s.pricing->>'billable' = 'false') as free
      from wa_message_statuses s, b
     where s.received_at >= b.start_at and s.pricing is not null
       and not exists (select 1 from wa_messages m join wa_campaign_recipients r on r.message_id = m.id
                        where m.wamid = s.wamid)
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

-- ── Inbox list: real chats only ─────────────────────────────────────────────
-- Same as Phase 2 plus one line: a conversation appears once the student has
-- written (last_inbound_at set). A campaign reply surfaces it as normal.
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
    select s, d, '%' || replace(replace(replace(s, '\', '\\'), '%', '\%'), '_', '\_') || '%' as like_s from q
  )
  select cv.id, cv.contact_id, cv.status, cv.unread_count,
         coalesce(cv.last_message_at, cv.created_at), cv.last_inbound_at, cv.last_message_preview,
         ct.phone_e164, ct.bsuid, ct.username, ct.profile_name,
         ct.lead_id, l.name, l.stage, cv.updated_at
    from wa_conversations cv
    join wa_contacts ct on ct.id = cv.contact_id
    left join leads l on l.id = ct.lead_id
    cross join pat
   where cv.last_inbound_at is not null
     and (p_status is null or cv.status = p_status)
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

-- ── Retention (Q-WA2: 24 months) ────────────────────────────────────────────
-- Recipient rows go 24 months after they finished. Contacts, and with them
-- list membership and consent, already follow wa_apply_retention.
create or replace function wa_campaign_retention()
returns integer language plpgsql set search_path = public as $$
declare v_n int;
begin
  with d as (delete from wa_campaign_recipients where id in (
      select id from wa_campaign_recipients
       where coalesce(finished_at, claimed_at) < now() - interval '24 months' limit 5000) returning 1)
  select count(*)::int into v_n from d;
  return v_n;
end $$;

-- ── Privileges ──────────────────────────────────────────────────────────────
do $$
declare f text;
begin
  foreach f in array array[
    'wa_campaign_guard()', 'wa_campaign_recipients_guard()',
    'wa_numbers_status(text[])', 'wa_import_numbers(text[],uuid,text,text)',
    'wa_is_marketing_opt_out(text,text)', 'wa_campaign_ineligible(uuid)', 'wa_record_marketing_opt_outs()',
    'wa_campaign_add_recipients(uuid,uuid[],uuid,uuid)', 'wa_campaign_spend(text)',
    'wa_campaign_claim(uuid,integer,text)', 'wa_campaign_finish(uuid,text,text,integer,text)',
    'wa_campaign_release(uuid[])', 'wa_campaign_stats(uuid)', 'wa_campaign_retention()',
    'wa_campaign_stop_codes()', 'wa_campaign_preview(uuid)', 'wa_campaign_approve(uuid,text,integer,uuid)',
    'wa_campaign_control(uuid,text)',
    'wa_list_conversations(text,text,boolean,timestamptz,uuid,integer)'
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
