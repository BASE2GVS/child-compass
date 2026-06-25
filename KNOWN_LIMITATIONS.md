# Known Limitations — v1.0.0-rc1

## Product

- Secure payments not live yet; plan selection in Settings is honour-system until Stripe/regional providers are integrated.
- Landing resource cards link to registration or Help FAQ; full library is in-app at Resource Library.
- Weather patterns only when noted in check-in text.
- Core flows require internet; offline bundle is partial (PDA passport cache only).

## AI

- Without OPENAI_API_KEY, local rule-based intelligence is used (still data-driven).
- Low check-in volume produces lower-confidence guidance.
- Does not diagnose or replace professionals.
- Memory only uses stored family data.

## Reports

- Empty profile sections prompt families to complete their child profile.
- PDF via browser Print; no dedicated PDF engine.
- Therapist Summary™ supplements, not replaces, clinical notes.

## Technical

- Analytics and logs use server-side JSONL in `data/` (ephemeral on serverless without persistent storage).
- Demo seed adds children to the admin family only.
- Rate limiting is in-memory per server instance.

## Security

- RLS isolates families; never expose service-role keys client-side.
- Restrict PILOT_ADMIN_EMAILS in production.
- Apply migrations `009`, `010`, `011` before pilot families.

## RC1 manual validation still required

- Cross-browser smoke test (Chrome, Safari, mobile)
- Full parent journey on staging with real Supabase project
- Sign-off on `LAUNCH_CHECKLIST.md`
