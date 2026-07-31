-- CRM: leads + activity timeline
-- Server-only access via service_role. RLS on, no permissive policies => anon/authenticated denied.

create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  phone          text not null,
  email          text,
  city           text,
  program        text,
  university     text,
  source         text,
  message        text,
  preferred_time text,
  stage          text not null default 'Fresh'
                 check (stage in ('Fresh','Follow-up','Interested','Next session','Converted','Not interested')),
  next_call_date date,
  next_call_time time,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create unique index if not exists leads_phone_digits_uidx
  on leads ((regexp_replace(phone, '[^0-9]', '', 'g')));

create index if not exists leads_stage_idx     on leads (stage);
create index if not exists leads_next_call_idx on leads (next_call_date);

create table if not exists lead_activity (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  occurred_on   date not null default current_date,
  occurred_time time,
  type          text not null check (type in ('call','note')),
  outcome       text,
  reason        text,
  remark        text,
  created_at    timestamptz not null default now()
);

create index if not exists lead_activity_lead_idx on lead_activity (lead_id, occurred_on);

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists leads_set_updated_at on leads;
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- Lock down. Server uses service_role which bypasses RLS.
alter table leads         enable row level security;
alter table lead_activity enable row level security;
