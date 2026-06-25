# Child Compass™

AI-assisted parenting companion for families raising neurodivergent children.

**Version 1.0.0-pilot** — Release candidate for pilot families.

## Quick start

```bash
npm install
cp .env.example .env.local   # add Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pilot documentation

| Document | Purpose |
|----------|---------|
| [PILOT_GUIDE.md](./PILOT_GUIDE.md) | Running the pilot programme |
| [QA_CHECKLIST.md](./QA_CHECKLIST.md) | Pre-launch verification |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to Vercel |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Supabase migrations & RLS |
| [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md) | Pilot scope & limits |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |

## Verify

```bash
npm run lint
npm run build
```

## Hidden pilot routes

- `/pilot-settings` — admin tools (`PILOT_ADMIN_ENABLED=true`)
- `/pilot-feedback` — family feedback (`PILOT_FEEDBACK_ENABLED=true` or pilot config)
