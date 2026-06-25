-- Child Compass initial schema
-- Run in Supabase SQL Editor or via Supabase CLI

create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Families
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Family members
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'parent' check (role in ('parent', 'caregiver', 'admin')),
  invited_email text,
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

-- Children
create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  photo_url text,
  first_name text not null,
  nickname text,
  date_of_birth date,
  gender text,
  school text,
  grade text,
  diagnosis text[] default '{}',
  support_needs text[] default '{}',
  interests text[] default '{}',
  favourite_activities text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Extended child profiles
create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique references children(id) on delete cascade,
  strengths text[] default '{}',
  sensory_preferences jsonb not null default '{}',
  favourite_things text[] default '{}',
  known_triggers text[] default '{}',
  calming_strategies text[] default '{}',
  support_network jsonb not null default '[]',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Daily check-ins
create table if not exists daily_checkins (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date,
  sleep_quality smallint check (sleep_quality between 1 and 5),
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  school_rating smallint check (school_rating between 1 and 5),
  anxiety smallint check (anxiety between 1 and 5),
  sensory_overload smallint check (sensory_overload between 1 and 5),
  demand_tolerance smallint check (demand_tolerance between 1 and 5),
  appetite smallint check (appetite between 1 and 5),
  social_battery smallint check (social_battery between 1 and 5),
  wins text[] default '{}',
  challenges text[] default '{}',
  notes text,
  created_at timestamptz not null default now(),
  unique (child_id, checkin_date)
);

-- Parent debriefs
create table if not exists parent_debriefs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_message text not null,
  likely_trigger text,
  behaviour_explanation text,
  suggested_response text,
  things_not_to_say text[] default '{}',
  tomorrow_plan text,
  follow_up_questions text[] default '{}',
  created_at timestamptz not null default now()
);

-- Timeline events
create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'school', 'sleep', 'meltdown', 'victory', 'appointment', 'note', 'ai_insight', 'checkin', 'other'
  )),
  title text not null,
  description text,
  event_date timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- AI insights
create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  insight_type text not null,
  title text not null,
  content text not null,
  confidence real check (confidence between 0 and 1),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_family_members_user on family_members(user_id);
create index if not exists idx_children_family on children(family_id);
create index if not exists idx_checkins_child_date on daily_checkins(child_id, checkin_date desc);
create index if not exists idx_timeline_child_date on timeline_events(child_id, event_date desc);
create index if not exists idx_debriefs_child on parent_debriefs(child_id, created_at desc);
create index if not exists idx_insights_family on ai_insights(family_id, created_at desc);

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger families_updated_at before update on families
  for each row execute function update_updated_at();
create trigger children_updated_at before update on children
  for each row execute function update_updated_at();
create trigger child_profiles_updated_at before update on child_profiles
  for each row execute function update_updated_at();
create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table children enable row level security;
alter table child_profiles enable row level security;
alter table daily_checkins enable row level security;
alter table parent_debriefs enable row level security;
alter table timeline_events enable row level security;
alter table ai_insights enable row level security;

-- Helper: user's family ids
create or replace function get_user_family_ids()
returns setof uuid as $$
  select family_id from family_members where user_id = auth.uid();
$$ language sql security definer stable;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Families policies
create policy "Members can view their families" on families
  for select using (id in (select get_user_family_ids()));
create policy "Authenticated users can create families" on families
  for insert with check (auth.uid() is not null);
create policy "Members can update their families" on families
  for update using (id in (select get_user_family_ids()));

-- Family members policies
create policy "Members can view family members" on family_members
  for select using (family_id in (select get_user_family_ids()));
create policy "Users can insert own membership" on family_members
  for insert with check (user_id = auth.uid());
create policy "Members can update family members" on family_members
  for update using (family_id in (select get_user_family_ids()));

-- Children policies
create policy "Members can view children" on children
  for select using (family_id in (select get_user_family_ids()));
create policy "Members can insert children" on children
  for insert with check (family_id in (select get_user_family_ids()));
create policy "Members can update children" on children
  for update using (family_id in (select get_user_family_ids()));
create policy "Members can delete children" on children
  for delete using (family_id in (select get_user_family_ids()));

-- Child profiles policies
create policy "Members can view child profiles" on child_profiles
  for select using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can manage child profiles" on child_profiles
  for all using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );

-- Daily checkins policies
create policy "Members can view checkins" on daily_checkins
  for select using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can insert checkins" on daily_checkins
  for insert with check (
    user_id = auth.uid() and
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can update checkins" on daily_checkins
  for update using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );

-- Parent debriefs policies
create policy "Members can view debriefs" on parent_debriefs
  for select using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can insert debriefs" on parent_debriefs
  for insert with check (
    user_id = auth.uid() and
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );

-- Timeline policies
create policy "Members can view timeline" on timeline_events
  for select using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can insert timeline" on timeline_events
  for insert with check (
    user_id = auth.uid() and
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can update timeline" on timeline_events
  for update using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );
create policy "Members can delete timeline" on timeline_events
  for delete using (
    child_id in (select id from children where family_id in (select get_user_family_ids()))
  );

-- AI insights policies
create policy "Members can view insights" on ai_insights
  for select using (family_id in (select get_user_family_ids()));
create policy "Members can insert insights" on ai_insights
  for insert with check (family_id in (select get_user_family_ids()));
create policy "Members can update insights" on ai_insights
  for update using (family_id in (select get_user_family_ids()));
