-- habits table matching the schema already created manually:
-- id, user_id, name, frequency, color, created_at
-- This script additionally adds the completion column used by the app's
-- "check off a habit" feature, and enables row-level security.

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  frequency text,
  color text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.habits add column if not exists completed_at timestamptz;

alter table public.habits enable row level security;

create policy if not exists "users can read own habits"
  on public.habits for select
  to authenticated
  using (auth.uid() = user_id);

create policy if not exists "users can create own habits"
  on public.habits for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy if not exists "users can update own habits"
  on public.habits for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "users can delete own habits"
  on public.habits for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.habits to authenticated;