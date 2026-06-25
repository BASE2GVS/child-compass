-- Child Compass™ — Production baseline schema
-- Apply this ONE file to a brand-new Supabase project (SQL Editor or psql).
-- Ownership model: families.owner_id + family_id on all tenant data. No legacy columns.

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
create extension if not exists "pgcrypto";

-- =============================================================================
-- HELPER FUNCTIONS (no table dependencies)
-- =============================================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- PROFILES
-- =============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  timezone text default 'UTC',
  country text,
  relationship_to_child text,
  emergency_contact jsonb not null default '{}',
  notification_preferences jsonb not null default '{
    "daily_checkin": true,
    "weekly_summary": true,
    "new_insight": true,
    "appointments": true,
    "school_reminder": true
  }',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- =============================================================================
-- FAMILIES & MEMBERS
-- =============================================================================
create table public.families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  country text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_families_owner_id on public.families(owner_id);

create trigger families_updated_at
  before update on public.families
  for each row execute function public.update_updated_at();

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'parent', 'caregiver', 'admin')),
  invited_email text,
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create index idx_family_members_family_id on public.family_members(family_id);
create index idx_family_members_user_id on public.family_members(user_id);
create index idx_family_members_invited on public.family_members(invited_email) where invited_email is not null;

-- =============================================================================
-- CHILDREN & PROFILES
-- =============================================================================
create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  photo_url text,
  first_name text not null,
  nickname text,
  date_of_birth date,
  gender text,
  school text,
  grade text,
  diagnosis text[] not null default '{}',
  support_needs text[] not null default '{}',
  interests text[] not null default '{}',
  favourite_activities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_children_family on public.children(family_id);

create trigger children_updated_at
  before update on public.children
  for each row execute function public.update_updated_at();

-- Tenant helper functions (require families, family_members, children)
create or replace function public.get_user_family_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select family_id from public.family_members where user_id = auth.uid();
$$;

create or replace function public.is_family_owner(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.families f
    where f.id = p_family_id and f.owner_id = auth.uid()
  );
$$;

create or replace function public.sync_family_id_from_child()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  resolved_family_id uuid;
begin
  if new.child_id is null then
    return new;
  end if;

  select family_id into resolved_family_id from public.children where id = new.child_id;
  if resolved_family_id is null then
    raise exception 'child_id % does not belong to a family', new.child_id;
  end if;

  new.family_id := resolved_family_id;
  return new;
end;
$$;

create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null unique references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  strengths text[] not null default '{}',
  sensory_preferences jsonb not null default '{}',
  favourite_things text[] not null default '{}',
  known_triggers text[] not null default '{}',
  calming_strategies text[] not null default '{}',
  support_network jsonb not null default '[]',
  notes text,
  medical_history text,
  medication text[] not null default '{}',
  challenges text[] not null default '{}',
  successful_strategies text[] not null default '{}',
  support_team jsonb not null default '[]',
  school_contacts jsonb not null default '[]',
  doctors jsonb not null default '[]',
  therapists jsonb not null default '[]',
  emergency_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_child_profiles_family on public.child_profiles(family_id);

create trigger child_profiles_updated_at
  before update on public.child_profiles
  for each row execute function public.update_updated_at();

create trigger child_profiles_sync_family_id
  before insert or update of child_id on public.child_profiles
  for each row execute function public.sync_family_id_from_child();

-- =============================================================================
-- DAILY CHECK-INS
-- =============================================================================
create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
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
  wins text[] not null default '{}',
  challenges text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  unique (child_id, checkin_date)
);

create index idx_daily_checkins_child_date on public.daily_checkins(child_id, checkin_date desc);
create index idx_daily_checkins_family on public.daily_checkins(family_id);

create trigger daily_checkins_sync_family_id
  before insert or update of child_id on public.daily_checkins
  for each row execute function public.sync_family_id_from_child();

-- =============================================================================
-- PARENT DEBRIEFS™
-- =============================================================================
create table public.parent_debriefs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_message text not null,
  likely_trigger text,
  behaviour_explanation text,
  emotional_interpretation text,
  suggested_response text,
  things_not_to_say text[] not null default '{}',
  tomorrow_plan text,
  long_term_recommendation text,
  confidence_level real check (confidence_level between 0 and 1),
  follow_up_questions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_parent_debriefs_child on public.parent_debriefs(child_id, created_at desc);
create index idx_parent_debriefs_family on public.parent_debriefs(family_id);

create trigger parent_debriefs_sync_family_id
  before insert or update of child_id on public.parent_debriefs
  for each row execute function public.sync_family_id_from_child();

-- =============================================================================
-- TIMELINE
-- =============================================================================
create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'school', 'sleep', 'meltdown', 'victory', 'appointment', 'note',
    'ai_insight', 'checkin', 'debrief', 'report', 'other'
  )),
  title text not null,
  description text,
  event_date timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_timeline_child_date on public.timeline_events(child_id, event_date desc);
create index idx_timeline_family on public.timeline_events(family_id);

create trigger timeline_events_sync_family_id
  before insert or update of child_id on public.timeline_events
  for each row execute function public.sync_family_id_from_child();

-- =============================================================================
-- AI INSIGHTS
-- =============================================================================
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  insight_type text not null,
  title text not null,
  content text not null,
  confidence real check (confidence between 0 and 1),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_ai_insights_family on public.ai_insights(family_id, created_at desc);
create index idx_ai_insights_child on public.ai_insights(child_id, created_at desc);
create index idx_ai_insights_unread on public.ai_insights(family_id, is_read) where is_read = false;

-- =============================================================================
-- PATTERN FINDINGS
-- =============================================================================
create table public.pattern_findings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  category text not null check (category in (
    'sleep', 'school', 'mood', 'sensory', 'food', 'exercise',
    'appointments', 'travel', 'weather', 'general'
  )),
  title text not null,
  description text not null,
  confidence real check (confidence between 0 and 1),
  evidence jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pattern_findings_child on public.pattern_findings(child_id, created_at desc);
create index idx_pattern_findings_family on public.pattern_findings(family_id);

create trigger pattern_findings_updated_at
  before update on public.pattern_findings
  for each row execute function public.update_updated_at();

-- =============================================================================
-- GENERATED REPORTS
-- =============================================================================
create table public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null check (report_type in (
    'parent_debrief', 'teacher_guide', 'pda_passport',
    'school_support', 'weekly_summary', 'monthly_progress'
  )),
  title text not null,
  content jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_generated_reports_child on public.generated_reports(child_id, created_at desc);
create index idx_generated_reports_family on public.generated_reports(family_id);

-- =============================================================================
-- DOCUMENTS
-- =============================================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in (
    'medical', 'ot', 'speech', 'psychology', 'school',
    'letters', 'assessments', 'support_plans', 'other'
  )),
  title text not null,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null default 0,
  created_at timestamptz not null default now()
);

create index idx_documents_family on public.documents(family_id, created_at desc);
create index idx_documents_child on public.documents(child_id, created_at desc);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
create table public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'daily_checkin', 'appointment', 'weekly_summary',
    'new_insight', 'school_reminder'
  )),
  title text not null,
  body text not null,
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_notification_queue_user on public.notification_queue(user_id, scheduled_for);
create index idx_notification_queue_family on public.notification_queue(family_id);

-- =============================================================================
-- FAMILY ECOSYSTEM (Sprint 3 features)
-- =============================================================================
create table public.coach_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'AI Child Coach',
  created_at timestamptz not null default now()
);

create index idx_coach_sessions_child on public.coach_sessions(child_id, created_at desc);

create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.coach_sessions(id) on delete cascade,
  role text not null check (role in ('parent', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_coach_messages_session on public.coach_messages(session_id, created_at asc);

create table public.child_goals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
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

create index idx_child_goals_child on public.child_goals(child_id, created_at desc);

create trigger child_goals_updated_at
  before update on public.child_goals
  for each row execute function public.update_updated_at();

create table public.goal_updates (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.child_goals(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  progress_value int not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_habits_child on public.habits(child_id);

create table public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  entry_date date not null default current_date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, entry_date)
);

create index idx_habit_entries_child_date on public.habit_entries(child_id, entry_date desc);

create table public.visual_schedules (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  schedule_type text not null check (schedule_type in (
    'morning', 'after_school', 'bedtime', 'shopping', 'travel', 'appointments', 'custom'
  )),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_visual_schedules_child on public.visual_schedules(child_id, created_at desc);

create table public.visual_schedule_items (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.visual_schedules(id) on delete cascade,
  label text not null,
  icon text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.school_hub_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in (
    'teacher_guide', 'support_plan', 'classroom_strategy',
    'transition_plan', 'exam_support', 'sensory_profile', 'attendance_summary'
  )),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_school_hub_entries_child on public.school_hub_entries(child_id, created_at desc);

create table public.therapy_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  therapist_name text,
  session_date date not null default current_date,
  notes text,
  recommendations text[] not null default '{}',
  goals text[] not null default '{}',
  exercises text[] not null default '{}',
  progress text,
  created_at timestamptz not null default now()
);

create index idx_therapy_sessions_child on public.therapy_sessions(child_id, session_date desc);

create table public.family_access_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invited_email text not null,
  invited_role text not null check (invited_role in (
    'grandparent', 'teacher', 'therapist', 'support_worker', 'caregiver'
  )),
  permissions jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_family_access_invites_family on public.family_access_invites(family_id, created_at desc);

create table public.resource_library_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'pda', 'autism', 'adhd', 'anxiety', 'school', 'sensory', 'transitions'
  )),
  title text not null,
  description text,
  resource_type text not null check (resource_type in ('article', 'video', 'download')),
  url text,
  created_at timestamptz not null default now()
);

create index idx_resource_library_category on public.resource_library_items(category);

create table public.resource_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resource_library_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, resource_id)
);

-- =============================================================================
-- AUTH BOOTSTRAP — profiles on signup
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    emergency_contact,
    notification_preferences
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    '{}'::jsonb,
    '{
      "daily_checkin": true,
      "weekly_summary": true,
      "new_insight": true,
      "appointments": true,
      "school_reminder": true
    }'::jsonb
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        updated_at = now();

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to postgres, supabase_auth_admin;
grant insert on table public.profiles to supabase_auth_admin;

-- =============================================================================
-- RPC — transactional family onboarding bootstrap
-- =============================================================================
create or replace function public.complete_family_onboarding(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_family_id uuid;
  v_child_id uuid;
  v_child jsonb := coalesce(payload->'child', '{}'::jsonb);
  v_diagnosis text[] := coalesce(
    array(select jsonb_array_elements_text(v_child->'diagnosis')),
    '{}'::text[]
  );
  v_support_needs text[] := coalesce(
    array(select jsonb_array_elements_text(v_child->'supportNeeds')),
    '{}'::text[]
  );
  v_interests text[] := coalesce(
    array(select jsonb_array_elements_text(v_child->'interests')),
    '{}'::text[]
  );
  v_favourite_activities text[] := coalesce(
    array(select jsonb_array_elements_text(v_child->'favouriteActivities')),
    '{}'::text[]
  );
  v_strengths text[] := coalesce(
    array(select jsonb_array_elements_text(v_child->'strengths')),
    '{}'::text[]
  );
  v_known_triggers text[] := coalesce(
    array(select jsonb_array_elements_text(v_child->'knownTriggers')),
    '{}'::text[]
  );
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.families (owner_id, name, country, timezone)
  values (
    v_user,
    payload->>'familyName',
    nullif(payload->>'country', ''),
    coalesce(nullif(payload->>'timezone', ''), 'UTC')
  )
  returning id into v_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (v_family_id, v_user, 'owner');

  insert into public.children (
    family_id,
    photo_url,
    first_name,
    nickname,
    date_of_birth,
    gender,
    school,
    grade,
    diagnosis,
    support_needs,
    interests,
    favourite_activities
  )
  values (
    v_family_id,
    nullif(v_child->>'photoUrl', ''),
    v_child->>'firstName',
    nullif(v_child->>'nickname', ''),
    nullif(v_child->>'dateOfBirth', '')::date,
    nullif(v_child->>'gender', ''),
    nullif(v_child->>'school', ''),
    nullif(v_child->>'grade', ''),
    v_diagnosis,
    v_support_needs,
    v_interests,
    v_favourite_activities
  )
  returning id into v_child_id;

  insert into public.child_profiles (child_id, family_id, strengths, known_triggers)
  values (v_child_id, v_family_id, v_strengths, v_known_triggers);

  if coalesce(nullif(payload->>'inviteEmail', ''), '') <> '' then
    insert into public.family_members (family_id, invited_email, role)
    values (v_family_id, payload->>'inviteEmail', 'caregiver');
  end if;

  update public.profiles
  set
    onboarding_completed = true,
    country = nullif(payload->>'country', ''),
    timezone = coalesce(nullif(payload->>'timezone', ''), 'UTC')
  where id = v_user;

  insert into public.ai_insights (family_id, child_id, insight_type, title, content, confidence)
  values (
    v_family_id,
    v_child_id,
    'welcome',
    format('Welcome to %s''s journey', v_child->>'firstName'),
    format(
      'Child Compass will learn %s''s unique patterns over time. Start with today''s check-in to build their profile.',
      v_child->>'firstName'
    ),
    1
  );

  return jsonb_build_object('success', true, 'childId', v_child_id, 'familyId', v_family_id);
end;
$$;

grant execute on function public.complete_family_onboarding(jsonb) to authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.child_profiles enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.parent_debriefs enable row level security;
alter table public.timeline_events enable row level security;
alter table public.ai_insights enable row level security;
alter table public.pattern_findings enable row level security;
alter table public.generated_reports enable row level security;
alter table public.documents enable row level security;
alter table public.notification_queue enable row level security;
alter table public.coach_sessions enable row level security;
alter table public.coach_messages enable row level security;
alter table public.child_goals enable row level security;
alter table public.goal_updates enable row level security;
alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;
alter table public.visual_schedules enable row level security;
alter table public.visual_schedule_items enable row level security;
alter table public.school_hub_entries enable row level security;
alter table public.therapy_sessions enable row level security;
alter table public.family_access_invites enable row level security;
alter table public.resource_library_items enable row level security;
alter table public.resource_bookmarks enable row level security;

-- profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- families
create policy "Owners and members can view families" on public.families
  for select using (
    owner_id = auth.uid()
    or id in (select public.get_user_family_ids())
  );
create policy "Authenticated users can create own family" on public.families
  for insert with check (auth.uid() is not null and owner_id = auth.uid());
create policy "Owners can update families" on public.families
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners can delete families" on public.families
  for delete using (owner_id = auth.uid());

-- family_members
create policy "Members can read family members" on public.family_members
  for select using (
    user_id = auth.uid()
    or public.is_family_owner(family_id)
    or family_id in (select public.get_user_family_ids())
  );
create policy "Owners can insert family members" on public.family_members
  for insert with check (
    public.is_family_owner(family_id)
    or (
      user_id = auth.uid()
      and role = 'owner'
      and exists (
        select 1 from public.families f
        where f.id = family_id and f.owner_id = auth.uid()
      )
    )
  );
create policy "Owners can update family members" on public.family_members
  for update using (public.is_family_owner(family_id))
  with check (public.is_family_owner(family_id));
create policy "Owners can delete family members" on public.family_members
  for delete using (public.is_family_owner(family_id));

-- children
create policy "Members can view children" on public.children
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert children" on public.children
  for insert with check (family_id in (select public.get_user_family_ids()));
create policy "Members can update children" on public.children
  for update using (family_id in (select public.get_user_family_ids()));
create policy "Members can delete children" on public.children
  for delete using (family_id in (select public.get_user_family_ids()));

-- child_profiles
create policy "Members can view child profiles" on public.child_profiles
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can manage child profiles" on public.child_profiles
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

-- daily_checkins
create policy "Members can view checkins" on public.daily_checkins
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert checkins" on public.daily_checkins
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Members can update checkins" on public.daily_checkins
  for update using (family_id in (select public.get_user_family_ids()));

-- parent_debriefs
create policy "Members can view debriefs" on public.parent_debriefs
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert debriefs" on public.parent_debriefs
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );

-- timeline_events
create policy "Members can view timeline" on public.timeline_events
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert timeline" on public.timeline_events
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Members can update timeline" on public.timeline_events
  for update using (family_id in (select public.get_user_family_ids()));
create policy "Members can delete timeline" on public.timeline_events
  for delete using (family_id in (select public.get_user_family_ids()));

-- ai_insights
create policy "Members can view insights" on public.ai_insights
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert insights" on public.ai_insights
  for insert with check (family_id in (select public.get_user_family_ids()));
create policy "Members can update insights" on public.ai_insights
  for update using (family_id in (select public.get_user_family_ids()));

-- pattern_findings
create policy "Members can view pattern findings" on public.pattern_findings
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can manage pattern findings" on public.pattern_findings
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

-- generated_reports
create policy "Members can view reports" on public.generated_reports
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert reports" on public.generated_reports
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );

-- documents
create policy "Members can view documents" on public.documents
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert documents" on public.documents
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Members can delete documents" on public.documents
  for delete using (family_id in (select public.get_user_family_ids()));

-- notification_queue
create policy "Users can view own notifications" on public.notification_queue
  for select using (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Users can insert own notifications" on public.notification_queue
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Users can update own notifications" on public.notification_queue
  for update using (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );

-- ecosystem tables (family_id scoped)
create policy "Members can manage coach sessions" on public.coach_sessions
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Members can manage coach messages" on public.coach_messages
  for all using (
    session_id in (
      select id from public.coach_sessions
      where family_id in (select public.get_user_family_ids())
    )
  );

create policy "Members can manage child goals" on public.child_goals
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Members can manage goal updates" on public.goal_updates
  for all using (
    child_id in (select id from public.children where family_id in (select public.get_user_family_ids()))
  );

create policy "Members can manage habits" on public.habits
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Members can manage habit entries" on public.habit_entries
  for all using (
    child_id in (select id from public.children where family_id in (select public.get_user_family_ids()))
  );

create policy "Members can manage visual schedules" on public.visual_schedules
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Members can manage visual schedule items" on public.visual_schedule_items
  for all using (
    schedule_id in (
      select id from public.visual_schedules
      where family_id in (select public.get_user_family_ids())
    )
  );

create policy "Members can manage school hub entries" on public.school_hub_entries
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Members can manage therapy sessions" on public.therapy_sessions
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Members can manage family invites" on public.family_access_invites
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

create policy "Anyone authenticated can view resources" on public.resource_library_items
  for select using (auth.uid() is not null);

create policy "Authenticated users can seed resources" on public.resource_library_items
  for insert with check (auth.uid() is not null);

create policy "Users can manage own bookmarks" on public.resource_bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
insert into storage.buckets (id, name, public)
values
  ('family-documents', 'family-documents', false),
  ('child-photos', 'child-photos', false)
on conflict (id) do nothing;

create policy "Authenticated users can read family documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'family-documents');

create policy "Authenticated users can upload family documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'family-documents');

create policy "Authenticated users can delete family documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'family-documents');

create policy "Authenticated users can read child photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'child-photos');

create policy "Authenticated users can upload child photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'child-photos');

create policy "Authenticated users can delete child photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'child-photos');
