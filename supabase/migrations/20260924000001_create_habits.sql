create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "users can read own habits"
  on public.habits for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users can create own habits"
  on public.habits for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can update own habits"
  on public.habits for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own habits"
  on public.habits for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on table public.habits to authenticated;