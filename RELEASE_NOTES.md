# Release Notes — v1.0.0-rc1

**Release Candidate 1** — 25 June 2026

Feature freeze. This release prepares Child Compass for controlled pilot families in South Africa.

## Highlights

- Per-family subscriptions with 14-day trial, usage limits, and grace periods
- Settings plan card with ZAR pricing (R149 Family / R249 Family Plus)
- Admin portal at `/admin` for operations team
- Help Centre with FAQ, privacy, terms, contact, and system status
- Intelligence platform: patterns, coach, debrief, reports, knowledge engine

## RC1 stability fixes

- Auth middleware protects `/admin`
- Onboarding hydration fix (no localStorage SSR mismatch)
- Landing pricing aligned with in-app plans
- Security headers on all routes
- Document delete requires family authorisation
- Help form success feedback

## Upgrade notes

1. Apply migrations: `009_v2_platform.sql`, `010_commercial_launch.sql`, `011_support_public_insert.sql`
2. Set `PILOT_ADMIN_ENABLED=true` and `PILOT_ADMIN_EMAILS` for operators
3. Run `npm run lint` and `npm run build`
4. Complete manual QA per `RC1_REPORT.md`

## Not included

- Stripe or regional payment processing
- Public marketing launch
- New features (code freeze)

See `CHANGELOG.md` for full version history.
