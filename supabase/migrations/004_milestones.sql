-- 004 — the shared calendar
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Its own table rather than the generic `items` board because the crew's plan is
-- written as date *windows* ("3–16 de agosto") with several tasks sharing one
-- window, and `items` has a single due_date. Adding a start date there would put
-- a column on six sections that only one of them uses.
--
-- No sort_order: a calendar's order is chronological by definition, so rows sort
-- by (start_date, end_date, id) — deterministic without a column nothing sets.

create table if not exists public.milestones (
  id         uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date   date not null,
  title      text not null default '',
  owner      text,                        -- free text name, not a user FK
  status     text not null default 'todo',
  notes      text not null default '',
  updated_by text not null default '',
  updated_at timestamptz not null default now(),

  constraint milestones_status_valid check (
    status in ('todo', 'doing', 'done', 'blocked')
  ),
  -- A window that ends before it starts is a typo, not a plan
  constraint milestones_range_valid check (end_date >= start_date)
);

create index if not exists milestones_chrono_idx
  on public.milestones (start_date, end_date, id);

drop trigger if exists milestones_audit on public.milestones;
create trigger milestones_audit
  before insert or update on public.milestones
  for each row execute function public.set_audit_fields();

alter table public.milestones enable row level security;

drop policy if exists "authenticated full access" on public.milestones;
create policy "authenticated full access"
  on public.milestones for all
  to authenticated
  using (true)
  with check (true);
