# Support Guide — Child Compass 1.0

For staff handling family support requests.

## Channels

| Channel | Location | Ticket type |
|---------|----------|-------------|
| Contact Support | `/help/contact` | `contact` |
| Report a Problem | `/help/report` | `bug` |
| Suggest a Feature | `/help/suggest` | `feature` |
| Account deletion | Settings → Delete account | `deletion` |
| Billing questions | `/help/contact` | `billing` |

Tickets are stored in `support_tickets` and visible in `/admin`.

## Response standards

- **First response:** Within 1 business day (South Africa timezone)
- **Tone:** Calm, empathetic, non-clinical — match the product voice
- **Escalation:** Safety concerns → advise local emergency services and clinician; do not provide crisis counselling in-app

## Common issues

### Trial expired

Direct family to **Settings → Your plan**. Selecting Family or Family Plus reactivates access. Payment collection is not live yet — plan selection is honour-system until Stripe is integrated.

### Cannot access Health Hub

Health Hub requires **Family Plus** (or active trial). Verify `family_subscriptions.plan_tier` and `status` in admin.

### AI seems wrong or too certain

Child Compass uses real family data only. Ask if they have recent check-ins. Review AI log for the family (hashed child id). Remind parents AI is not diagnostic.

### Data export

Settings → Export family data (`/api/export`). JSON export of family-scoped records.

### Account deletion

Deletion requests create a `deletion` ticket. Confirm identity via registered email. Process within 48 hours:

1. Export data if requested
2. Delete user via Supabase Auth admin
3. Cascade removes family data per FK constraints
4. Close ticket as `resolved`

## Privacy

Never share one family's data with another. Admin portal shows aggregate analytics only — no child names in product analytics events.

## System status communication

During outages, create a **critical** announcement in Admin portal and update status page checks if needed.
