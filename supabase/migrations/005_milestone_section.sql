-- 005 — a calendar entry belongs to a section, not a person
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Each section already has one person keeping it, so naming the area answers
-- "whose is this" and gains a colour the month can be scanned by. No check
-- constraint on section_key, for the same reason day_key and stage_key have
-- none: the keys live in src/config.ts and a constraint here would mean a
-- migration every time that file changes.

alter table public.milestones
  add column if not exists section_key text;

-- Don't lose a name that was already typed into owner: fold it into notes,
-- which is where free text belongs now.
update public.milestones
   set notes = case when notes = '' then owner else notes || ' · ' || owner end
 where owner is not null
   and owner <> '';

alter table public.milestones
  drop column if exists owner;
