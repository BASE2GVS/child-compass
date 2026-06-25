# Child Compass 1.0 — Launch Checklist

Use this checklist before onboarding paying families in South Africa.

## Product readiness

- [ ] All pages load without placeholder copy or dead routes
- [ ] Onboarding completes and starts 14-day trial subscription
- [ ] Settings shows plan, usage meters, and upgrade options
- [ ] Feature gating works (Health Hub, longitudinal reports, usage limits)
- [ ] Help Centre, FAQ, Privacy, Terms, and System Status are live
- [ ] Footer links resolve correctly from landing page

## Commercial

- [ ] `family_subscriptions` migration applied (`010_commercial_launch.sql`)
- [ ] Trial → expired flow tested (adjust `trial_ends_at` in DB for test family)
- [ ] Upgrade/downgrade from Settings updates `plan_tier`
- [ ] Grace period on cancellation (7 days) verified
- [ ] Stripe / regional payment integration planned (not required for pilot billing)

## Admin & operations

- [ ] `PILOT_ADMIN_ENABLED=true` and `PILOT_ADMIN_EMAILS` set for operators
- [ ] `/admin` portal accessible to admins only
- [ ] Support tickets flow from Help forms to `support_tickets` table
- [ ] Knowledge pack metadata visible in admin
- [ ] Feature flags and announcements tested

## Trust & safety

- [ ] AI responses include confidence indicators
- [ ] No diagnostic language in coach, debrief, or reports
- [ ] Escalation guidance present where uncertainty is high
- [ ] Privacy Centre and data export documented

## QA

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual E2E: register → onboard → check-in → debrief → coach → report
- [ ] Security review completed (see `SECURITY_GUIDE.md`)
- [ ] Accessibility spot-check (keyboard nav, contrast, form labels)

## Deployment

- [ ] Environment variables set per `.env.example`
- [ ] Supabase RLS policies verified for new tables
- [ ] Backup strategy documented (`BACKUP_RECOVERY.md`)
- [ ] `OPERATIONS_GUIDE.md` handed to on-call operator

## Pilot launch

- [ ] Welcome email template sent (`docs/pilot/WELCOME_EMAIL.md`)
- [ ] Pilot onboarding guide shared (`docs/pilot/PILOT_ONBOARDING.md`)
- [ ] Feedback process communicated (`/pilot-feedback` if enabled)

---

**Sign-off**

| Role | Name | Date |
|------|------|------|
| Product | | |
| Engineering | | |
| Operations | | |
