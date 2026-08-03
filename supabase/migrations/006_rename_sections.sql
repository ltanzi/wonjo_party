-- 006 — rename four sections
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
--   LINE-UP       → BOOKING      (rename)
--   BUDGET        → FINANCE      (rename)
--   TEAM          → VOLUNTEERS   (rename)
--   DALLOU / SITE → WORKSHOPS    (replacement; the site page was never used)
--
-- Keys are renamed rather than only the labels. A key mismatch is invisible —
-- rows keep the old value, no page queries them, nothing errors — so the moment
-- to fix it is while there is little data. See the warning in src/config.ts.

-- Board items. 'lineup' never appears here: the line-up is a bespoke page backed
-- by the slots table, not a section of the generic board.
update public.items set section_key = 'finance'    where section_key = 'budget';
update public.items set section_key = 'volunteers' where section_key = 'team';

-- Calendar entries. Defensive: only matters if the first import ran before the
-- rename, in which case those rows would otherwise point at keys that no longer
-- exist and would render with no colour.
update public.milestones set section_key = 'booking'    where section_key = 'lineup';
update public.milestones set section_key = 'finance'    where section_key = 'budget';
update public.milestones set section_key = 'volunteers' where section_key = 'team';

-- DALLOU / SITE is deliberately not migrated to WORKSHOPS — the house build and
-- the daytime programme are different things, so inheriting rows would be wrong.
-- The page was confirmed unused, so none are expected. To be certain:
--
--   select count(*) from public.items where section_key = 'site';
--
-- Anything that turns up there is now invisible to the app; move or delete it.
