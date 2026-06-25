-- Version 2.0 platform extensions

-- Expand report types (therapist + longitudinal reviews)
alter table public.generated_reports drop constraint if exists generated_reports_report_type_check;
alter table public.generated_reports add constraint generated_reports_report_type_check check (report_type in (
  'parent_debrief', 'teacher_guide', 'pda_passport', 'school_support',
  'weekly_summary', 'monthly_progress', 'therapist_summary',
  'review_30d', 'review_90d', 'review_6mo', 'review_annual'
));

-- Health Hub observations
create table if not exists public.health_observations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  observation_type text not null check (observation_type in (
    'medication', 'appointment', 'sleep', 'nutrition', 'exercise', 'growth', 'note'
  )),
  title text not null,
  notes text,
  value text,
  observed_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_health_observations_child on public.health_observations(child_id, observed_date desc);
create index if not exists idx_health_observations_family on public.health_observations(family_id);

alter table public.health_observations enable row level security;
create policy "Members can manage health observations" on public.health_observations
  for all using (family_id in (select public.get_user_family_ids()));

-- Care team shared observations
create table if not exists public.care_team_observations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  observer_role text not null,
  observer_name text,
  observation text not null,
  observed_date date not null default current_date,
  shared_with_care_team boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_care_observations_child on public.care_team_observations(child_id, observed_date desc);

alter table public.care_team_observations enable row level security;
create policy "Members can manage care observations" on public.care_team_observations
  for all using (family_id in (select public.get_user_family_ids()));

-- Scalability indexes
create index if not exists idx_daily_checkins_child_date_range on public.daily_checkins(child_id, checkin_date desc);
create index if not exists idx_pattern_findings_child_active on public.pattern_findings(child_id, is_active, confidence desc);

-- Accept care team invites (status workflow)
alter table public.family_access_invites drop constraint if exists family_access_invites_status_check;
alter table public.family_access_invites add constraint family_access_invites_status_check
  check (status in ('pending', 'accepted', 'revoked', 'expired'));
