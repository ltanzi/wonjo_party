-- 002 — the compilation artist list
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Its own table rather than the generic `items` board: the shape is an address
-- book with two yes/no flags, not a task with a status and a due date. Mirrors
-- the spreadsheet it replaces (Artista | Email | Compilación), with the second
-- flag added for whether the track has actually arrived.

create table if not exists public.compilation (
  id         uuid primary key default gen_random_uuid(),
  artist     text not null default '',
  email      text not null default '',
  confirmed  boolean not null default false, -- 'Compilación: si' in the sheet
  sent       boolean not null default false, -- track received
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
