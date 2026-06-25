# Security Guide — Child Compass 1.0

Security posture for commercial launch in South Africa (POPIA-aware).

## Authentication

- Supabase Auth (email/password, email verification)
- Session cookies managed by `@supabase/ssr`
- Middleware refreshes sessions on protected routes

## Authorization & family isolation

- **Row Level Security (RLS)** on all family-scoped tables
- `get_user_family_ids()` used in policies
- Children, check-ins, debriefs, reports isolated per family
- New tables in `010_commercial_launch.sql` include RLS policies

## Subscription data

- `family_subscriptions`: members can SELECT own family row
- Plan changes via server actions with auth check
- Admin overrides require `PILOT_ADMIN_EMAILS` allowlist

## File storage

- Uploads via Supabase Storage with bucket policies
- User-scoped paths where applicable
- No public listing of family documents

## Secrets

| Secret | Exposure |
|--------|----------|
| `OPENAI_API_KEY` | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only, admin scripts |
| `NEXT_PUBLIC_*` | Client-safe only |

Never commit `.env.local`. Use `.env.example` as template.

## Rate limiting

- Coach messages: `rateLimitUserAction` — 30/min per user per action
- In-memory buckets — upgrade to Redis for production multi-instance

## AI trust & safety

- No diagnosis language in prompts (`coach-format.ts`, report generator)
- Confidence bands on AI outputs
- Knowledge pack citations via `lib/knowledge/`
- Escalation to professional help when appropriate

## Support & deletion

- Deletion requires typing `DELETE` + creates auditable ticket
- Support tickets RLS: users insert/view own tickets only

## Audit checklist

- [ ] RLS enabled on all public tables
- [ ] No service role key in client code
- [ ] HTTPS enforced in production
- [ ] Admin routes gated by email allowlist
- [ ] Export endpoint requires authenticated family member
- [ ] Error logs do not contain PII (when observability enabled)

## Reporting vulnerabilities

Contact via `/help/report` with subject "Security" or direct email to operations team.

## Future hardening

- Stripe webhook signature verification (when payments launch)
- WAF / DDoS protection at edge
- Centralised rate limiting (Upstash Redis)
- SOC2 / ISO roadmap for enterprise tier
