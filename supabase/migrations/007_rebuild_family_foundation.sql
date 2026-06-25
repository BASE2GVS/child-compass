-- 007: Rebuild Family multi-tenant foundation (development reset).
-- Permanent architecture: every family is a secure tenant identified by owner_id.

-- ---------------------------------------------------------------------------
-- STEP 1: Remove obsolete bootstrap artifacts
-- ---------------------------------------------------------------------------
drop trigger if exists families_bootstrap_owner on public.families;
drop function if exists public.bootstrap_family_owner_membership();

-- ---------------------------------------------------------------------------
-- STEP 2: Drop dependent RLS policies (all known policy names + dynamic sweep)
-- ---------------------------------------------------------------------------
drop policy if exists "Members can view their families" on public.families;
drop policy if exists "Authenticated users can create families" on public.families;
drop policy if exists "Authenticated users can create own first family" on public.families;
drop policy if exists "Authenticated users can create own family" on public.families;
drop policy if exists "Members can update their families" on public.families;
drop policy if exists "Owners and members can view families" on public.families;
drop policy if exists "Owners can update families" on public.families;
drop policy if exists "Owners can delete families" on public.families;

drop policy if exists "Members can view family members" on public.family_members;
drop policy if exists "Users can insert own membership" on public.family_members;
drop policy if exists "Members can update family members" on public.family_members;
drop policy if exists "Owners can manage family members" on public.family_members;
drop policy if exists "Members can read own membership" on public.family_members;

drop policy if exists "Members can view children" on public.children;
drop policy if exists "Members can insert children" on public.children;
drop policy if exists "Members can update children" on public.children;
drop policy if exists "Members can delete children" on public.children;

drop policy if exists "Members can view child profiles" on public.child_profiles;
drop policy if exists "Members can manage child profiles" on public.child_profiles;

drop policy if exists "Members can view checkins" on public.daily_checkins;
drop policy if exists "Members can insert checkins" on public.daily_checkins;
drop policy if exists "Members can update checkins" on public.daily_checkins;

drop policy if exists "Members can view debriefs" on public.parent_debriefs;
drop policy if exists "Members can insert debriefs" on public.parent_debriefs;

drop policy if exists "Members can view timeline" on public.timeline_events;
drop policy if exists "Members can insert timeline" on public.timeline_events;
drop policy if exists "Members can update timeline" on public.timeline_events;
drop policy if exists "Members can delete timeline" on public.timeline_events;

drop policy if exists "Members can view insights" on public.ai_insights;
drop policy if exists "Members can insert insights" on public.ai_insights;
drop policy if exists "Members can update insights" on public.ai_insights;

drop policy if exists "Members can view documents" on public.documents;
drop policy if exists "Members can insert documents" on public.documents;
drop policy if exists "Members can delete documents" on public.documents;

drop policy if exists "Members can view reports" on public.generated_reports;
drop policy if exists "Members can insert reports" on public.generated_reports;

drop policy if exists "Members can view pattern findings" on public.pattern_findings;
drop policy if exists "Members can manage pattern findings" on public.pattern_findings;

drop policy if exists "Users can view own notifications" on public.notification_queue;
drop policy if exists "Users can insert own notifications" on public.notification_queue;
drop policy if exists "Users can update own notifications" on public.notification_queue;

do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'families', 'family_members', 'children', 'child_profiles',
        'daily_checkins', 'parent_debriefs', 'timeline_events', 'ai_insights',
        'documents', 'generated_reports', 'pattern_findings', 'notification_queue'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- STEP 3: Development reset — clear tenant data (preserve auth.users + profiles)
-- ---------------------------------------------------------------------------
truncate table public.families restart identity cascade;

update public.profiles set onboarding_completed = false;

-- ---------------------------------------------------------------------------
-- STEP 4: Rebuild families (owner_id is the sole ownership column)
-- ---------------------------------------------------------------------------
alter table public.families drop column if exists created_by;

alter table public.families
  add column if not exists owner_id uuid references auth.users(id) on delete restrict;

alter table public.families
  alter column owner_id set not null;

create index if not exists idx_families_owner_id on public.families(owner_id);

-- ---------------------------------------------------------------------------
-- STEP 5: Rebuild family_members
-- ---------------------------------------------------------------------------
alter table public.family_members drop constraint if exists family_members_role_check;
alter table public.family_members add constraint family_members_role_check
  check (role in ('owner', 'parent', 'caregiver', 'admin'));

create index if not exists idx_family_members_family_id on public.family_members(family_id);
create index if not exists idx_family_members_user_id on public.family_members(user_id);

-- ---------------------------------------------------------------------------
-- STEP 6: Ensure family_id on all tenant tables (no orphans)
-- ---------------------------------------------------------------------------
alter table public.child_profiles
  add column if not exists family_id uuid references public.families(id) on delete cascade;

alter table public.daily_checkins
  add column if not exists family_id uuid references public.families(id) on delete cascade;

alter table public.parent_debriefs
  add column if not exists family_id uuid references public.families(id) on delete cascade;

alter table public.timeline_events
  add column if not exists family_id uuid references public.families(id) on delete cascade;

update public.child_profiles cp
set family_id = c.family_id
from public.children c
where cp.child_id = c.id and cp.family_id is null;

update public.daily_checkins dc
set family_id = c.family_id
from public.children c
where dc.child_id = c.id and dc.family_id is null;

update public.parent_debriefs pd
set family_id = c.family_id
from public.children c
where pd.child_id = c.id and pd.family_id is null;

update public.timeline_events te
set family_id = c.family_id
from public.children c
where te.child_id = c.id and te.family_id is null;

alter table public.child_profiles
  alter column family_id set not null;

alter table public.daily_checkins
  alter column family_id set not null;

alter table public.parent_debriefs
  alter column family_id set not null;

alter table public.timeline_events
  alter column family_id set not null;

create index if not exists idx_child_profiles_family on public.child_profiles(family_id);
create index if not exists idx_daily_checkins_family on public.daily_checkins(family_id);
create index if not exists idx_parent_debriefs_family on public.parent_debriefs(family_id);
create index if not exists idx_timeline_events_family on public.timeline_events(family_id);

-- Rename legacy created_by columns on ecosystem tables to user_id
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'child_goals' and column_name = 'created_by'
  ) then
    alter table public.child_goals rename column created_by to user_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'visual_schedules' and column_name = 'created_by'
  ) then
    alter table public.visual_schedules rename column created_by to user_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'school_hub_entries' and column_name = 'created_by'
  ) then
    alter table public.school_hub_entries rename column created_by to user_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'therapy_sessions' and column_name = 'created_by'
  ) then
    alter table public.therapy_sessions rename column created_by to user_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'family_access_invites' and column_name = 'created_by'
  ) then
    alter table public.family_access_invites rename column created_by to user_id;
  end if;
end $$;

-- Auto-sync family_id from child_id on insert/update
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

drop trigger if exists child_profiles_sync_family_id on public.child_profiles;
create trigger child_profiles_sync_family_id
  before insert or update of child_id on public.child_profiles
  for each row execute function public.sync_family_id_from_child();

drop trigger if exists daily_checkins_sync_family_id on public.daily_checkins;
create trigger daily_checkins_sync_family_id
  before insert or update of child_id on public.daily_checkins
  for each row execute function public.sync_family_id_from_child();

drop trigger if exists parent_debriefs_sync_family_id on public.parent_debriefs;
create trigger parent_debriefs_sync_family_id
  before insert or update of child_id on public.parent_debriefs
  for each row execute function public.sync_family_id_from_child();

drop trigger if exists timeline_events_sync_family_id on public.timeline_events;
create trigger timeline_events_sync_family_id
  before insert or update of child_id on public.timeline_events
  for each row execute function public.sync_family_id_from_child();

-- ---------------------------------------------------------------------------
-- STEP 7: Tenant helpers
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- STEP 8: RLS — families
-- ---------------------------------------------------------------------------
alter table public.families enable row level security;

create policy "Owners and members can view families" on public.families
  for select using (
    owner_id = auth.uid()
    or id in (select public.get_user_family_ids())
  );

create policy "Authenticated users can create own family" on public.families
  for insert with check (
    auth.uid() is not null
    and owner_id = auth.uid()
  );

create policy "Owners can update families" on public.families
  for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can delete families" on public.families
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- STEP 9: RLS — family_members
-- ---------------------------------------------------------------------------
alter table public.family_members enable row level security;

create policy "Members can read own membership" on public.family_members
  for select using (
    user_id = auth.uid()
    or public.is_family_owner(family_id)
    or family_id in (select public.get_user_family_ids())
  );

create policy "Owners can manage family members" on public.family_members
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

-- ---------------------------------------------------------------------------
-- STEP 10: RLS — family-scoped data tables
-- ---------------------------------------------------------------------------
alter table public.children enable row level security;
create policy "Members can view children" on public.children
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert children" on public.children
  for insert with check (family_id in (select public.get_user_family_ids()));
create policy "Members can update children" on public.children
  for update using (family_id in (select public.get_user_family_ids()));
create policy "Members can delete children" on public.children
  for delete using (family_id in (select public.get_user_family_ids()));

alter table public.child_profiles enable row level security;
create policy "Members can view child profiles" on public.child_profiles
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can manage child profiles" on public.child_profiles
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

alter table public.daily_checkins enable row level security;
create policy "Members can view checkins" on public.daily_checkins
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert checkins" on public.daily_checkins
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Members can update checkins" on public.daily_checkins
  for update using (family_id in (select public.get_user_family_ids()));

alter table public.parent_debriefs enable row level security;
create policy "Members can view debriefs" on public.parent_debriefs
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert debriefs" on public.parent_debriefs
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );

alter table public.timeline_events enable row level security;
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

alter table public.ai_insights enable row level security;
create policy "Members can view insights" on public.ai_insights
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert insights" on public.ai_insights
  for insert with check (family_id in (select public.get_user_family_ids()));
create policy "Members can update insights" on public.ai_insights
  for update using (family_id in (select public.get_user_family_ids()));

alter table public.documents enable row level security;
create policy "Members can view documents" on public.documents
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert documents" on public.documents
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );
create policy "Members can delete documents" on public.documents
  for delete using (family_id in (select public.get_user_family_ids()));

alter table public.generated_reports enable row level security;
create policy "Members can view reports" on public.generated_reports
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can insert reports" on public.generated_reports
  for insert with check (
    user_id = auth.uid()
    and family_id in (select public.get_user_family_ids())
  );

alter table public.pattern_findings enable row level security;
create policy "Members can view pattern findings" on public.pattern_findings
  for select using (family_id in (select public.get_user_family_ids()));
create policy "Members can manage pattern findings" on public.pattern_findings
  for all using (family_id in (select public.get_user_family_ids()))
  with check (family_id in (select public.get_user_family_ids()));

alter table public.notification_queue enable row level security;
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

-- ---------------------------------------------------------------------------
-- STEP 11: Transactional onboarding RPC
-- ---------------------------------------------------------------------------
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
