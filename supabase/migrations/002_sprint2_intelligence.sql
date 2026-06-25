-- Sprint 2: Intelligence, documents, patterns, reports, notifications

-- Extend profiles
alter table profiles add column if not exists timezone text default 'UTC';
alter table profiles add column if not exists country text;
alter table profiles add column if not exists relationship_to_child text;
alter table profiles add column if not exists emergency_contact jsonb not null default '{}';
alter table profiles add column if not exists notification_preferences jsonb not null default '{
  "daily_checkin": true,
  "weekly_summary": true,
  "new_insight": true,
  "appointments": true,
  "school_reminder": true
}';

-- Extend parent_debriefs with full AI response fields
alter table parent_debriefs add column if not exists emotional_interpretation text;
alter table parent_debriefs add column if not exists long_term_recommendation text;
alter table parent_debriefs add column if not exists confidence_level real check (confidence_level between 0 and 1);

-- Extend child_profiles
alter table child_profiles add column if not exists medical_history text;
alter table child_profiles add column if not exists medication text[] default '{}';
alter table child_profiles add column if not exists challenges text[] default '{}';
alter table child_profiles add column if not exists successful_strategies text[] default '{}';
alter table child_profiles add column if not exists support_team jsonb not null default '[]';
alter table child_profiles add column if not exists school_contacts jsonb not null default '[]';
alter table child_profiles add column if not exists doctors jsonb not null default '[]';
alter table child_profiles add column if not exists therapists jsonb not null default '[]';
alter table child_profiles add column if not exists emergency_notes text;

-- Pattern findings
create table if not exists pattern_findings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
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

-- Generated reports
create table if not exists generated_reports (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null check (report_type in (
    'parent_debrief', 'teacher_guide', 'pda_passport',
    'school_support', 'weekly_summary', 'monthly_progress'
  )),
  title text not null,
  content jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Documents (Document Centre)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
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

-- Notification queue (architecture only)
create table if not exists notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  child_id uuid references children(id) on delete cascade,
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

-- Expand timeline event types
alter table timeline_events drop constraint if exists timeline_events_event_type_check;
alter table timeline_events add constraint timeline_events_event_type_check check (event_type in (
  'school', 'sleep', 'meltdown', 'victory', 'appointment', 'note',
  'ai_insight', 'checkin', 'debrief', 'report', 'other'
));

-- Indexes
create index if not exists idx_pattern_findings_child on pattern_findings(child_id, created_at desc);
create index if not exists idx_reports_child on generated_reports(child_id, created_at desc);
create index if not exists idx_documents_family on documents(family_id, created_at desc);
create index if not exists idx_documents_child on documents(child_id, created_at desc);
create index if not exists idx_insights_child on ai_insights(child_id, created_at desc);
create index if not exists idx_insights_unread on ai_insights(family_id, is_read) where is_read = false;
create index if not exists idx_notification_queue_user on notification_queue(user_id, scheduled_for);
create index if not exists idx_family_members_invited on family_members(invited_email) where invited_email is not null;

-- Triggers
create trigger pattern_findings_updated_at before update on pattern_findings
  for each row execute function update_updated_at();

-- Fix family invite: allow admins to invite caregivers
drop policy if exists "Users can insert own membership" on family_members;
create policy "Users can insert own membership" on family_members
  for insert with check (
    user_id = auth.uid()
    or (
      invited_email is not null
      and family_id in (select get_user_family_ids())
    )
  );

-- RLS for new tables
alter table pattern_findings enable row level security;
alter table generated_reports enable row level security;
alter table documents enable row level security;
alter table notification_queue enable row level security;

create policy "Members can view pattern findings" on pattern_findings
  for select using (family_id in (select get_user_family_ids()));
create policy "Members can manage pattern findings" on pattern_findings
  for all using (family_id in (select get_user_family_ids()));

create policy "Members can view reports" on generated_reports
  for select using (family_id in (select get_user_family_ids()));
create policy "Members can insert reports" on generated_reports
  for insert with check (
    user_id = auth.uid() and family_id in (select get_user_family_ids())
  );

create policy "Members can view documents" on documents
  for select using (family_id in (select get_user_family_ids()));
create policy "Members can insert documents" on documents
  for insert with check (
    user_id = auth.uid() and family_id in (select get_user_family_ids())
  );
create policy "Members can delete documents" on documents
  for delete using (family_id in (select get_user_family_ids()));

create policy "Users can view own notifications" on notification_queue
  for select using (user_id = auth.uid());
create policy "Users can insert own notifications" on notification_queue
  for insert with check (user_id = auth.uid());
create policy "Users can update own notifications" on notification_queue
  for update using (user_id = auth.uid());

-- Storage bucket (run in Supabase dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('family-documents', 'family-documents', false);
