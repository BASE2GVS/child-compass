# Admin Guide — Child Compass 1.0

Internal portal for developers and operators.

## Access

Set environment variables:

```
PILOT_ADMIN_ENABLED=true
PILOT_ADMIN_EMAILS=you@company.com,ops@company.com
```

Routes:

| Route | Purpose |
|-------|---------|
| `/admin` | Commercial admin portal (1.0) |
| `/pilot-settings` | Pilot tooling, demo seed, diagnostics |
| `/pilot-feedback` | Review pilot feedback (if enabled) |

Non-admin users are redirected to `/dashboard`.

## Admin portal sections

### Platform health

Environment checks: Supabase, AI provider, analytics, observability.

### Engagement

Anonymous counts: check-ins, debriefs, reports, event breakdown. No personal family data.

### Families & subscriptions

- View recent families and subscription rows
- Change plan tier (`family`, `family_plus`, `pilot`)
- Trigger grace-period cancellation

### Knowledge pack

- View current pack version and status from `data/knowledge-pack-meta.json`
- Publish with changelog and evidence notes
- Inserts row into `knowledge_pack_versions`

### Feature flags

Toggle flags in `feature_flags` table. Seeded flags: `health_hub`, `longitudinal_reports`, `offline_bundle`.

### System announcements

Broadcast info/warning/critical messages to authenticated users via `system_announcements`.

### Support tickets

Recent tickets from Help Centre forms and deletion requests.

### AI logs & errors

- AI logs: anonymised child hashes, confidence, summaries
- Errors: from `data/error-events.jsonl` when observability enabled

## Pilot settings (legacy)

`/pilot-settings` retains demo seed, pilot config file, and export diagnostics for field testing.

## Security

- Admin routes use `noindex` robots meta
- Never share admin credentials
- Service role key only on server — never in client bundle
