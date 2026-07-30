-- WONJO PARTY — schema
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Design notes (see SPEC.md):
--   * day_key / stage_key / section_key are stable slugs, never indices or labels,
--     so renaming a stage in src/config.ts can never orphan a row.
--   * One flat RLS policy per table: any authenticated user has full access.
--     Anonymous users get nothing, which is what makes the public anon key safe.
--   * updated_by / updated_at are set by trigger from the JWT, never trusted
--     from the client.

-- ---------------------------------------------------------------- audit trigger

create or replace function public.set_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', 'unknown');
  return new;
end;
$$;

-- ------------------------------------------------------------------ line-up

create table if not exists public.slots (
  id          uuid primary key default gen_random_uuid(),
  day_key     text not null,
  stage_key   text not null,
  start_time  time,                    -- null until scheduling happens
  end_time    time,
  format      text not null default 'live',
  artist_name text not null default '',
  status      text not null default 'idea',
  notes       text not null default '',
  sort_order  int  not null default 0, -- ordering within a stage when times are null
  updated_by  text not null default '',
  updated_at  timestamptz not null default now(),

  constraint slots_status_valid check (
    status in ('idea', 'contacted', 'confirmed', 'cancelled')
  ),
  constraint slots_format_valid check (
    format in ('live', 'dj', 'A/V', 'performance', 'workshop', 'talk', 'film')
  )
);

create index if not exists slots_day_stage_idx
  on public.slots (day_key, stage_key, start_time nulls last, sort_order);

drop trigger if exists slots_audit on public.slots;
create trigger slots_audit
  before insert or update on public.slots
  for each row execute function public.set_audit_fields();

alter table public.slots enable row level security;

drop policy if exists "authenticated full access" on public.slots;
create policy "authenticated full access"
  on public.slots for all
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------- generic board (pass 2)

create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  section_key text not null,
  title       text not null default '',
  owner       text,                    -- free text name, not a user FK
  status      text not null default 'todo',
  notes       text not null default '',
  due_date    date,
  sort_order  int  not null default 0,
  updated_by  text not null default '',
  updated_at  timestamptz not null default now(),

  constraint items_status_valid check (
    status in ('todo', 'doing', 'done', 'blocked')
  )
);

create index if not exists items_section_idx
  on public.items (section_key, sort_order);

drop trigger if exists items_audit on public.items;
create trigger items_audit
  before insert or update on public.items
  for each row execute function public.set_audit_fields();

alter table public.items enable row level security;

drop policy if exists "authenticated full access" on public.items;
create policy "authenticated full access"
  on public.items for all
  to authenticated
  using (true)
  with check (true);

-- --------------------------------------------------------- compilation list

create table if not exists public.compilation (
  id         uuid primary key default gen_random_uuid(),
  artist     text not null default '',
  email      text not null default '',
  confirmed  boolean not null default false, -- 'Compilación: si' in the old sheet
  sent       boolean not null default false, -- track received
  drive_link text not null default '',       -- Google Drive URL for the file
  sort_order int not null default 0,
  updated_by text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists compilation_order_idx on public.compilation (sort_order);

drop trigger if exists compilation_audit on public.compilation;
create trigger compilation_audit
  before insert or update on public.compilation
  for each row execute function public.set_audit_fields();

alter table public.compilation enable row level security;

drop policy if exists "authenticated full access" on public.compilation;
create policy "authenticated full access"
  on public.compilation for all
  to authenticated
  using (true)
  with check (true);
