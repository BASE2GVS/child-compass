# Database Setup

Child Compass uses Supabase (PostgreSQL + Auth + Row Level Security).

## Setup

1. Create a Supabase project.
2. Apply migrations from `supabase/migrations/` in order, or use `supabase/baseline/001_production_schema.sql`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
4. Configure Auth: Site URL, redirect URLs, email confirmation.

## Row Level Security

All family tables use RLS. Users access only children in their `family_members` family.

## Core tables

| Table | Purpose |
|-------|---------|
| families, family_members | Tenancy |
| children, child_profiles | Child data |
| daily_checkins | Daily ratings |
| parent_debriefs | Debrief sessions |
| pattern_findings | Patterns |
| generated_reports | Saved reports |
| timeline_events | Timeline |

## Triggers

`daily_checkins` syncs `family_id` from `children` on insert.

## Troubleshooting

- Empty dashboard: complete onboarding (`profiles.onboarding_completed`).
- Check-in fails: verify `family_members` membership.
- Empty reports: add check-ins or profile details.
