# Backup & Recovery — Child Compass 1.0

## What to back up

| Asset | Location | Frequency |
|-------|----------|-----------|
| PostgreSQL database | Supabase | Daily (Supabase Pro automatic backups) |
| Storage buckets | Supabase Storage | Weekly export or replication |
| Knowledge pack metadata | `data/knowledge-pack-meta.json` | On each publish |
| Pilot config | `data/pilot-config.json` | On change |
| Product analytics | `data/product-analytics.jsonl` | Weekly archive |

## Supabase backups

1. Enable **Point-in-Time Recovery** on Supabase Pro plan
2. Test restore to staging project quarterly
3. Document project ref and region in ops runbook

## Manual export

Families can self-serve via Settings → Export family data (`/api/export`).

For full database export (admin):

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql
```

## Recovery procedures

### Database corruption / bad migration

1. Stop deployments
2. Restore from latest Supabase backup or PITR
3. Re-run migrations on clean restore if needed
4. Verify RLS with test family account

### Accidental family deletion

1. Restore from backup to staging
2. Export affected family rows
3. Import into production with service role (careful FK order)
4. Notify family per POPIA breach protocol if applicable

### Application rollback

1. Revert to previous Vercel deployment
2. Ensure env vars unchanged
3. Verify `/help/status` all green

## Disaster recovery RTO/RPO targets

| Metric | Target |
|--------|--------|
| RPO (data loss) | < 24 hours (daily backup) |
| RTO (restoration) | < 4 hours |

Adjust with business requirements before public launch.

## Testing

Schedule quarterly restore drill:

1. Clone production to staging
2. Verify login, check-in, report generation
3. Document time to recover and gaps
