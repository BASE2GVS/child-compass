# Child Compass — Pilot Guide

Version **1.0.0-pilot** · Release candidate for first real families.

## What this pilot is

Child Compass is an AI-assisted parenting companion for families raising neurodivergent children (PDA, Autism, ADHD, anxiety). The pilot validates whether daily check-ins, personalised intelligence, and shareable reports genuinely help parents feel more confident.

## Before you invite families

### 1. Environment

Copy `.env.example` to `.env.local` and configure Supabase keys. See DEPLOYMENT.md for full variable list.

### 2. Database

Run migrations per DATABASE_SETUP.md. Confirm RLS is enabled on all family tables.

### 3. Smoke test

Follow QA_CHECKLIST.md end-to-end before inviting anyone.

## Pilot family journey

1. Landing → Register → Verify email → Login
2. Onboarding → Create family → Add child
3. Dashboard → Daily check-in
4. Parent Debrief™ after difficult moments
5. Timeline — events accumulate automatically
6. Reports — Teacher Guide™, Therapist Summary™, Weekly/Monthly
7. Ask Child Compass™ on dashboard

Value increases with consistency: patterns strengthen after 5–7 check-ins.

## Developer tools (hidden)

| Route | Access | Purpose |
|-------|--------|---------|
| `/pilot-settings` | `PILOT_ADMIN_ENABLED=true` | Demo seed, diagnostics, analytics, AI logs |
| `/pilot-feedback` | Env or pilot config | Family feedback |

Seed demo data from Pilot Settings to add Erkie (PDA), Maya (Autism+Anxiety), and Leo (ADHD) with 21 days of check-ins.

## Support tone

AI output is warm, non-judgemental, and never diagnostic. Confidence is always explained. History is never invented.
