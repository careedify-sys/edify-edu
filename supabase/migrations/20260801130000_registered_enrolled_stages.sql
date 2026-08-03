-- Split the old "Converted" stage into two precise steps:
--   Registered — student filled the admission form (fees not necessarily paid)
--   Enrolled   — student has paid, real conversion / final win
--
-- Migration:
-- 1. Every existing 'Converted' row means "paid" in the old model, so it maps
--    to 'Enrolled'. (There are only a handful in the DB — this is safe.)
-- 2. Swap the CHECK constraint on leads.stage to accept the new stages and
--    forbid 'Converted'.
-- 3. Nudge PostgREST to reload its schema cache.

-- ORDER MATTERS: the UPDATE must run WHILE the check constraint is absent,
-- otherwise setting stage='Enrolled' on a 'Converted' row would violate the
-- old constraint (which doesn't include 'Enrolled') and roll the whole
-- transaction back.

alter table leads drop constraint if exists leads_stage_check;

update leads set stage = 'Enrolled' where stage = 'Converted';

alter table leads add constraint leads_stage_check
  check (stage in ('Fresh','Follow-up','Interested','Next session','Registered','Enrolled','Not interested'));

select pg_notify('pgrst', 'reload schema');
