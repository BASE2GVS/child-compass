-- Sprint 3: Child intelligence + family ecosystem

create table if not exists coach_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'AI Child Coach',
  created_at timestamptz not null default now()
);

create table if not exists coach_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references coach_sessions(id) on delete cascade,
  role text not null check (role in ('parent', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists child_goals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in (
    'morning_routine', 'school_attendance', 'sleeping', 'homework',
    'eating', 'independence', 'friendships', 'communication', 'other'
  )),
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  target_value int default 5,
  current_value int not null default 0,
  celebration_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goal_updates (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references child_goals(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_value int not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  entry_date date not null default current_date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, entry_date)
);

create table if not exists visual_schedules (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  schedule_type text not null check (schedule_type in (
    'morning', 'after_school', 'bedtime', 'shopping', 'travel', 'appointments', 'custom'
  )),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists visual_schedule_items (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references visual_schedules(id) on delete cascade,
  label text not null,
  icon text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists school_hub_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in (
    'teacher_guide', 'support_plan', 'classroom_strategy',
    'transition_plan', 'exam_support', 'sensory_profile', 'attendance_summary'
  )),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists therapy_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  therapist_name text,
  session_date date not null default current_date,
  notes text,
  recommendations text[] not null default '{}',
  goals text[] not null default '{}',
  exercises text[] not null default '{}',
  progress text,
  created_at timestamptz not null default now()
);

create table if not exists family_access_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  invited_email text not null,
  invited_role text not null check (invited_role in ('grandparent', 'teacher', 'therapist', 'support_worker', 'caregiver')),
  permissions jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists resource_library_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('pda', 'autism', 'adhd', 'anxiety', 'school', 'sensory', 'transitions')),
  title text not null,
  description text,
  resource_type text not null check (resource_type in ('article', 'video', 'download')),
  url text,
  created_at timestamptz not null default now()
);

create table if not exists resource_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references resource_library_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

create index if not exists idx_coach_sessions_child on coach_sessions(child_id, created_at desc);
create index if not exists idx_coach_messages_session on coach_messages(session_id, created_at asc);
create index if not exists idx_child_goals_child on child_goals(child_id, created_at desc);
create index if not exists idx_habits_child on habits(child_id);
create index if not exists idx_habit_entries_child_date on habit_entries(child_id, entry_date desc);
create index if not exists idx_visual_schedules_child on visual_schedules(child_id, created_at desc);
create index if not exists idx_school_hub_entries_child on school_hub_entries(child_id, created_at desc);
create index if not exists idx_therapy_sessions_child on therapy_sessions(child_id, session_date desc);
create index if not exists idx_family_access_invites_family on family_access_invites(family_id, created_at desc);
create index if not exists idx_resource_items_category on resource_library_items(category);

create trigger child_goals_updated_at before update on child_goals
  for each row execute function update_updated_at();

alter table coach_sessions enable row level security;
alter table coach_messages enable row level security;
alter table child_goals enable row level security;
alter table goal_updates enable row level security;
alter table habits enable row level security;
alter table habit_entries enable row level security;
alter table visual_schedules enable row level security;
alter table visual_schedule_items enable row level security;
alter table school_hub_entries enable row level security;
alter table therapy_sessions enable row level security;
alter table family_access_invites enable row level security;
alter table resource_library_items enable row level security;
alter table resource_bookmarks enable row level security;

create policy "Members can manage coach sessions" on coach_sessions
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Members can manage coach messages" on coach_messages
  for all using (
    session_id in (
      select id from coach_sessions where family_id in (select get_user_family_ids())
    )
  );

create policy "Members can manage child goals" on child_goals
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Members can manage goal updates" on goal_updates
  for all using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );

create policy "Members can manage habits" on habits
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Members can manage habit entries" on habit_entries
  for all using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );

create policy "Members can manage visual schedules" on visual_schedules
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Members can manage visual schedule items" on visual_schedule_items
  for all using (
    schedule_id in (
      select id from visual_schedules where family_id in (select get_user_family_ids())
    )
  );

create policy "Members can manage school hub entries" on school_hub_entries
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Members can manage therapy sessions" on therapy_sessions
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Members can manage family invites" on family_access_invites
  for all using (family_id in (select get_user_family_ids()))
  with check (family_id in (select get_user_family_ids()));

create policy "Anyone authenticated can view resources" on resource_library_items
  for select using (auth.uid() is not null);

create policy "Admins can seed resources" on resource_library_items
  for insert with check (auth.uid() is not null);

create policy "Users can manage own bookmarks" on resource_bookmarks
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
