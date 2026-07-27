-- WONJO PARTY — FICTIONAL seed data, for checking the rendering only.
--
-- The repo is public (SPEC.md, decision 6). Every name below is invented.
-- NEVER replace these with real artists, contacts or fees and commit it.
-- Real data goes into Supabase through the app, and only through the app.
--
-- Run in the Supabase SQL editor after schema.sql. Safe to delete the rows later:
--   delete from public.slots;

insert into public.slots
  (day_key, stage_key, start_time, end_time, format, artist_name, status, notes, sort_order)
values
  -- Friday · PLAYA
  ('day-1', 'stage-playa', '17:00', '18:00', 'talk',        'BUILDING WONJO',     'confirmed', '', 0),
  ('day-1', 'stage-playa', '21:00', '22:00', 'live',        'FATOU N.',           'confirmed', '', 1),
  ('day-1', 'stage-playa', '22:30', '00:00', 'dj',          'SIRA B.',            'contacted', 'waiting on their manager', 2),
  -- Friday · ISLA
  ('day-1', 'stage-isla',  '19:00', '20:30', 'performance', 'KUNTA COLLECTIVE',   'confirmed', '', 0),
  ('day-1', 'stage-isla',  null,    null,    'A/V',         'MADI & THE RIVER',   'idea',      'needs a projector', 1),

  -- Saturday · PLAYA
  ('day-2', 'stage-playa', '10:00', '12:00', 'workshop',    'KORA BASICS',        'confirmed', '', 0),
  ('day-2', 'stage-playa', '20:00', '21:00', 'live',        'BINTA & SONS',       'confirmed', '', 1),
  ('day-2', 'stage-playa', '21:30', '23:00', 'live',        'THE GROUNDNUT BAND', 'contacted', '', 2),
  ('day-2', 'stage-playa', '23:30', '02:00', 'dj',          'SELECTOR OUSMAN',    'idea',      '', 3),
  -- Saturday · ISLA
  ('day-2', 'stage-isla',  '16:00', '17:30', 'film',        'RIVER STORIES',      'confirmed', '', 0),
  ('day-2', 'stage-isla',  '22:00', '23:30', 'dj',          'AMINATA T.',         'cancelled', 'flights fell through', 1),

  -- Sunday · PLAYA
  ('day-3', 'stage-playa', '11:00', '13:00', 'workshop',    'DYEING WITH WONJO',  'confirmed', '', 0),
  ('day-3', 'stage-playa', '18:00', '19:30', 'performance', 'CLOSING CEREMONY',   'confirmed', '', 1),
  -- Sunday · ISLA
  ('day-3', 'stage-isla',  null,    null,    'live',        'JALI K.',            'idea',      'maybe an acoustic set', 0);
