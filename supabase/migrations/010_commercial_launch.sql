-- Commercial launch: per-family subscriptions and usage tracking

create table if not exists public.family_subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families(id) on delete cascade,
  plan_tier text not null default 'trial' check (plan_tier in (
    'trial', 'family', 'family_plus', 'pilot', 'enterprise'
  )),
  status text not null default 'trialing' check (status in (
    'trialing', 'active', 'past_due', 'grace', 'canceled', 'expired'
  )),
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  grace_ends_at timestamptz,
  canceled_at timestamptz,
  usage jsonb not null default '{"reports_month":0,"coach_today":0,"checkins_today":0,"usage_date":null}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_family_subscriptions_status on public.family_subscriptions(status, plan_tier);

create trigger family_subscriptions_updated_at
  before update on public.family_subscriptions
  for each row execute function public.set_updated_at();

alter table public.family_subscriptions enable row level security;

create policy "Members can view family subscription" on public.family_subscriptions
  for select using (family_id in (select public.get_user_family_ids()));

-- System announcements (admin-managed)
create table if not exists public.system_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.system_announcements enable row level security;
create policy "Anyone authenticated can read active announcements" on public.system_announcements
  for select using (
    is_active = true
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  );

-- Feature flags (admin-managed)
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.feature_flags enable row level security;
create policy "Authenticated users can read feature flags" on public.feature_flags
  for select using (auth.uid() is not null);

-- Knowledge pack versions (admin-managed metadata; articles in filesystem)
create table if not exists public.knowledge_pack_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  changelog text,
  evidence_notes text,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create unique index if not exists idx_knowledge_pack_version on public.knowledge_pack_versions(version);

alter table public.knowledge_pack_versions enable row level security;
create policy "Authenticated users can read published packs" on public.knowledge_pack_versions
  for select using (status = 'published' or auth.uid() is not null);

-- Support tickets (contact / report problem)
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  ticket_type text not null check (ticket_type in (
    'contact', 'bug', 'feature', 'billing', 'privacy', 'deletion'
  )),
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_support_tickets_status on public.support_tickets(status, created_at desc);

alter table public.support_tickets enable row level security;
create policy "Users can insert own tickets" on public.support_tickets
  for insert with check (user_id = auth.uid());
create policy "Users can view own tickets" on public.support_tickets
  for select using (user_id = auth.uid());

-- Expand report types if not already done
alter table public.generated_reports drop constraint if exists generated_reports_report_type_check;
alter table public.generated_reports add constraint generated_reports_report_type_check check (report_type in (
  'parent_debrief', 'teacher_guide', 'pda_passport', 'school_support',
  'weekly_summary', 'monthly_progress', 'therapist_summary',
  'review_30d', 'review_90d', 'review_6mo', 'review_annual'
));

-- Seed default knowledge pack record
insert into public.knowledge_pack_versions (version, status, changelog, evidence_notes, published_at)
values (
  '1.0.0',
  'published',
  'Initial evidence-based knowledge pack for PDA, Autism, ADHD, anxiety, sensory, and school support.',
  'Curated from widely recommended neurodiversity-affirming practices. Subject to expert clinical review.',
  now()
) on conflict do nothing;

-- Seed trial-friendly feature flags
insert into public.feature_flags (key, enabled, description) values
  ('health_hub', true, 'Health Hub module'),
  ('longitudinal_reports', true, '30/90/180/365-day reviews'),
  ('offline_bundle', true, 'Offline PDA passport cache')
on conflict (key) do nothing;
