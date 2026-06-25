# Deployment

## Vercel (recommended)

1. Connect repository.
2. Set environment variables (see `.env.example`).
3. Build: `npm run build`

### Pilot production env

```
PILOT_ADMIN_ENABLED=true
PILOT_ADMIN_EMAILS=you@yourdomain.com
PILOT_FEEDBACK_ENABLED=true
OPENAI_API_KEY=sk-...  # optional
```

## Pre-deploy

- Migrations applied
- Auth redirect URLs updated
- `npm run lint` and `npm run build` pass
- QA_CHECKLIST.md completed

## Analytics storage

`data/*.jsonl` is ephemeral on serverless unless persistent volume is mounted.

## Local dev

```bash
npm install
npm run dev
```
