-- 003 — where the track file actually lives
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- `not null default ''` rather than nullable, matching artist and email: the app
-- treats empty string as "not set" everywhere, so one representation of absence
-- is fewer branches than two.

alter table public.compilation
  add column if not exists drive_link text not null default '';
