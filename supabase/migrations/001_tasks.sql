-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Tasks table
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  description text,
  status      text check (status in ('todo', 'in_progress', 'done')) not null default 'todo',
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  position    integer not null default 0
);

-- Automatically update updated_at on row change
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at_column();

-- Row Level Security: users can only access their own tasks
alter table tasks enable row level security;

create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Index for faster per-user queries
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_user_status_idx on tasks(user_id, status);
