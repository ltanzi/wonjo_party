-- 001 — drop the country column, rename the Dj format to dj
--
-- Run once in the Supabase SQL editor. Safe to re-run: every statement guards
-- itself. schema.sql has been updated to match, so a fresh project does not
-- need this file.
--
-- Order matters. The format check constraint still names 'Dj', so the rows have
-- to be renamed with the constraint dropped, then the new one added.

alter table public.slots drop column if exists country;

alter table public.slots drop constraint if exists slots_format_valid;

update public.slots set format = 'dj' where format = 'Dj';

alter table public.slots
  add constraint slots_format_valid check (
    format in ('live', 'dj', 'A/V', 'performance', 'workshop', 'talk', 'film')
  );
