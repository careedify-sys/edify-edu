-- Two additions to `leads`:
--
-- 1. `imported` boolean — flags rows that came from the one-time CSV import
--    (which had unreliable timestamps) so the CRM can hide them from the
--    New/Fresh working views. Backfilled true for every row that exists
--    today; new inserts default to false, so /api/enquiry rows are never
--    marked as backlog.
--
-- 2. `last_submitted_at` timestamptz — always updated to now() on every
--    enquiry submission, whether it inserts a new row or updates an
--    existing one. Sorting the New tab by this column instead of
--    created_at means a repeat submission bubbles the lead back to the
--    top, which is what "New" is meant to signal.

alter table leads add column imported boolean not null default false;

-- Backfill: mark imported=true for every currently-existing row that came
-- from the one-time CSV import. Two signals identify imports precisely:
--   1) source = 'website'  → every one of the 214 imported rows has this
--      literal string in the source column (the sheet's Source column
--      value). Live /api/enquiry submissions instead store the referring
--      page path (e.g. '/blog/foo') or a specific string like
--      'sample_cert_request'.
--   2) created_at > now() + 1 day → the CSV had ambiguous US/DMY dates
--      that JS parsed as Dec 2026 for many rows. Real submissions can't
--      have future timestamps. Belt-and-braces.
update leads
   set imported = true
 where source = 'website'
    or created_at > now() + interval '1 day';

alter table leads add column last_submitted_at timestamptz;
update leads set last_submitted_at = created_at where last_submitted_at is null;
alter table leads
  alter column last_submitted_at set not null,
  alter column last_submitted_at set default now();

create index if not exists leads_last_submitted_idx on leads (last_submitted_at desc);
create index if not exists leads_imported_idx       on leads (imported);
