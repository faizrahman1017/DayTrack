-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null check (char_length(btrim(title)) > 0),
  type        text not null default 'work'   check (type in ('work','personal')),
  priority    text not null default 'medium' check (priority in ('high','medium','low')),
  date        date not null,
  time        text not null default '' check (time = '' or time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  completed   boolean not null default false,
  note_type   text not null default 'none'   check (note_type in ('none','text','list')),
  note_text   text not null default '',
  checklist   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title         text not null default '',
  content_type  text not null default 'text' check (content_type in ('text','list')),
  body          text not null default '',
  checklist     jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, date);
create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);

-- Row Level Security: every user can only see and touch their own rows.
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

create policy "tasks_select_own" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);

create policy "notes_select_own" on public.notes for select to authenticated using ((select auth.uid()) = user_id);
create policy "notes_insert_own" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "notes_update_own" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "notes_delete_own" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);
