-- Reviews: first-party student reviews collected via /review/[university-slug].
-- Security posture matches the leads table: RLS on, no permissive policies,
-- all access via service_role from server code. The /api/reviews route
-- enforces the application rules (POST forces verified=false; GET returns
-- verified=true only).

create table if not exists reviews (
  id              uuid primary key default gen_random_uuid(),
  university_slug text not null,
  programme       text,
  student_name    text not null,
  city            text,
  rating          smallint not null check (rating between 1 and 5),
  review_body     text not null,
  enrolment_year  smallint check (enrolment_year between 2000 and 2100),
  verified        boolean not null default false,
  source          text not null default 'form'
                  check (source in ('form','email','manual')),
  created_at      timestamptz not null default now()
);

create index if not exists reviews_university_slug_idx on reviews (university_slug);
create index if not exists reviews_verified_idx        on reviews (verified);
create index if not exists reviews_created_at_idx      on reviews (created_at desc);

-- Lock down. Server uses service_role which bypasses RLS.
alter table reviews enable row level security;
