# Changelog

All notable changes to Child Compass are documented here.

## [1.0.0] — 2026-06-25

### Commercial Launch Preparation

- **Per-family subscriptions** — trial tracking, plan tiers, usage limits, grace periods (`family_subscriptions`)
- **Subscription UI** — Settings plan card with usage meters and upgrade prompts (ZAR pricing)
- **Feature gating** — Health Hub, longitudinal reports, and daily limits wired to family subscription
- **Admin portal** (`/admin`) — families, subscriptions, knowledge packs, flags, announcements, tickets, analytics
- **Help Centre** — FAQ, contact, report problem, suggest feature, system status, privacy, terms
- **Knowledge pack manager** — draft/publish metadata with version history in admin
- **Rate limiting** — coach message throttling per user
- **Operations docs** — LAUNCH_CHECKLIST, OPERATIONS_GUIDE, SUPPORT_GUIDE, ADMIN_GUIDE, SECURITY_GUIDE, BACKUP_RECOVERY
- **Pilot launch kit** — welcome email templates and onboarding guide
- **Migrations** — `010_commercial_launch.sql`, `011_support_public_insert.sql`

## [2.0.0] — 2026-06-25

### Intelligence Platform

- **Knowledge Engine** — versioned evidence packs (PDA, Autism, ADHD, anxiety, sensory, school) separate from AI reasoning
- **Family Knowledge Graph** — relationships between sleep, mood, school, sensory, homework, visitors
- **Longitudinal reviews** — 30-day, 90-day, 6-month, and annual reports (self-comparison only)
- **Care team permissions** — role-based access model for teachers, therapists, grandparents
- **School & Therapy Hub services** — structured summaries from existing hub data
- **Health Hub** — optional medication, appointments, sleep, nutrition tracking
- **Multi-child intelligence** — family overview without mixing child histories
- **i18n framework** — `lib/i18n` with externalised copy catalog
- **Offline bundle** — PDA Passport, calming strategies, reports cached client-side
- **Observability** — performance timing and error logging
- **Commercial scaffold** — plan tiers and feature gating (no payment provider)
- **Enterprise scaffold** — organisation types for future schools/clinics
- **Migration 009** — health observations, care team observations, report types, indexes

## [1.0.0-pilot] — 2026-06-25

### Release Candidate — Pilot Launch

First release candidate for real pilot families.

#### Intelligence (Sprint 7)
- AI Memory layer — dated recall from check-ins, wins, debriefs, timeline, and profile
- Expanded pattern engine — homework, visitors, holidays, school refusal, recovery, weather notes
- Predictive insights on dashboard with confidence explanations
- Structured Ask Child Compass™ coaching responses
- Weekly Family Review (local + optional LLM)
- Smart goal auto-tracking from check-ins
- Teacher Guide™ and Therapist Summary™ enriched from family data
- Family celebrations and first-30-days journey guidance
- AI confidence bands (High / Medium / Low) across guidance

#### Pilot readiness (Phase 2)
- Hidden **Pilot Settings** admin page (`/pilot-settings`)
- Hidden **Pilot Feedback** page (`/pilot-feedback`)
- Privacy-respecting product analytics (hashed family IDs, no PII)
- AI interaction logging (summaries only, hashed child IDs)
- Demo data seed — Erkie (PDA), Maya (Autism+Anxiety), Leo (ADHD) with 21 days of check-ins
- Diagnostics export for developers
- Fixed stub routes: `/plans`, `/resources`, `/help-me-now`
- Fixed check-in redirect (first-checkin offer only on first check-in)
- Settings billing copy updated for pilot programme

#### Premium experience (Sprint 6)
- Design system, motion, skeletons, empty states, warm microcopy
- Report layout with print/PDF support
