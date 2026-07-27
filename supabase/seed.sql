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

-- ---------------------------------------------------------------- board items
-- Also fictional. Delete with:  delete from public.items;

insert into public.items
  (section_key, title, owner, status, notes, due_date, sort_order)
values
  ('production',    'Generator + fuel for three days', 'Lamin', 'doing',   'two quotes in, waiting on a third', '2026-11-30', 0),
  ('production',    'Sound system for PLAYA',          'Lamin', 'todo',    '', null, 1),
  ('production',    'Shade structure over ISLA',       null,    'blocked', 'needs the site plan first', null, 2),
  ('production',    'Stage decking',                   'Omar',  'done',    '', null, 3),

  ('logistics',     'Airport pickups, 14 Jan',         'Awa',   'todo',    '', '2027-01-10', 0),
  ('logistics',     'Beds for visiting artists',       'Awa',   'doing',   'six confirmed, need four more', null, 1),
  ('logistics',     'Water and ice supply',            null,    'todo',    '', null, 2),

  ('communication', 'Poster artwork',                  'Ikram', 'doing',   '', '2026-10-15', 0),
  ('communication', 'Announce the first names',        'Ikram', 'blocked', 'waiting on the line-up to firm up', null, 1),
  ('communication', 'Instagram account',               'Ikram', 'done',    '', null, 2),

  ('compilation',   'Collect tracks from artists',     null,    'todo',    '', '2026-12-01', 0),
  ('compilation',   'Mastering',                       null,    'todo',    '', null, 1),

  ('budget',        'Sound system quote',              'Lamin', 'done',    'EUR 1,200 for the weekend', null, 0),
  ('budget',        'Set the artist fee ceiling',      'Ikram', 'doing',   '', null, 1),

  ('site',          'Shower block',                    'Omar',  'doing',   'walls up, no plumbing yet', '2026-12-15', 0),
  ('site',          'Clear the ground by the river',   'Omar',  'todo',    'this becomes ISLA', null, 1),
  ('site',          'Well and pump',                   'Omar',  'done',    '', null, 2),

  ('team',          'Ikram Bouloum — line-up',         'Ikram', 'done',    '', null, 0),
  ('team',          'Find a stage manager',            null,    'todo',    '', null, 1);
