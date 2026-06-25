# Operations Guide — Child Compass 1.0

Guide for developers and administrators operating Child Compass in production.

## Architecture overview

- **Frontend:** Next.js (App Router), hosted on Vercel or equivalent
- **Database:** Supabase PostgreSQL with Row Level Security
- **AI:** OpenAI via server-side actions (no keys in client)
- **File storage:** Supabase Storage for uploads
- **Analytics:** File-based product events (`data/product-analytics.jsonl`) — anonymous, no child names
- **Subscriptions:** Per-family records in `family_subscriptions` (no payment provider yet)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin operations |
| `OPENAI_API_KEY` | AI coach, debrief, reports |
| `PILOT_ADMIN_ENABLED` | `true` to enable `/admin` and `/pilot-settings` |
| `PILOT_ADMIN_EMAILS` | Comma-separated admin emails |
| `PRODUCT_ANALYTICS_ENABLED` | `true` to log product events |
| `OBSERVABILITY_ENABLED` | `true` to log errors and performance |

## Daily operations

1. Check **System Status** at `/help/status` or `/admin` health panel
2. Review open **support tickets** in Admin portal
3. Monitor error log at `data/error-events.jsonl` (when observability enabled)
4. Review AI logs at `data/ai-logs.jsonl` for quality drift

## Subscription management

- Families receive a **14-day trial** on onboarding (`ensureFamilySubscription`)
- Trial grants effective **Family Plus** tier access
- After trial expiry, `canUseProduct` becomes false until plan selected
- Admins can override plans via `/admin` → Families & subscriptions

## Migrations

Apply in order:

```bash
supabase db push
# or run SQL files in supabase/migrations/ sequentially
```

Critical for 1.0: `009_v2_platform.sql`, `010_commercial_launch.sql`

## Incident response

1. Check `/help/status` and admin error panel
2. Verify Supabase dashboard for outages
3. Post system announcement via Admin portal if user-facing
4. Document incident in support ticket with `ticket_type: bug`

## Scaling notes

- Rate limiting is in-memory per instance (`lib/security/rate-limit.ts`) — move to Redis for multi-instance
- Product analytics file grows over time — rotate or ship to warehouse
- Query limits in `lib/scalability/query-limits.ts` protect heavy endpoints

## Related guides

- `ADMIN_GUIDE.md` — Admin portal features
- `SUPPORT_GUIDE.md` — Handling family support
- `SECURITY_GUIDE.md` — Security posture
- `BACKUP_RECOVERY.md` — Backup and restore
