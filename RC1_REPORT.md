# Release Candidate 1 — Regression & QA Report

**Version:** `v1.0.0-rc1`  
**Date:** 2026-06-25  
**Scope:** Code freeze — bugs, polish, stability, security, accessibility, performance only.

---

## Build verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 46 routes compiled |
| TypeScript | Pass |

---

## Regression summary (46 routes)

### Public / marketing
| Route | Status | Notes |
|-------|--------|-------|
| `/` | Pass | Landing sections render; pricing aligned to R149/R249 |
| `/login`, `/register`, `/forgot-password`, `/verify-email` | Pass | Auth forms present |
| `/help`, `/help/*` | Pass | Help Centre complete; form success feedback added |
| `/help-me-now` | Pass | Crisis guidance page |
| `/plans`, `/resources` | Pass | Redirect to `/#pricing`, `/#resources` |

### App (authenticated)
| Route | Status | Notes |
|-------|--------|-------|
| `/onboarding` | Pass | Hydration fix applied (localStorage after mount) |
| `/dashboard` | Pass | Core hub |
| `/check-in`, `/debrief`, `/coach` | Pass | Usage limits enforced |
| `/children`, `/children/[id]` | Pass | Profile management |
| `/timeline`, `/goals`, `/habits`, `/schedules` | Pass | Daily tools |
| `/reports`, `/reports/[id]`, `/reports/view/[type]` | Pass | All report types; longitudinal gated |
| `/school`, `/therapy`, `/health` | Pass | Health gated to Family Plus |
| `/documents` | Pass | Upload validation (10MB, type whitelist) |
| `/analytics`, `/compass`, `/search` | Pass | Intelligence surfaces |
| `/calm-plan`, `/pda-passport`, `/teacher-guide` | Pass | Document generators |
| `/resource-library` | Pass | In-app resources live |
| `/settings`, `/profile` | Pass | Subscription card, export, deletion |
| `/admin`, `/pilot-settings`, `/pilot-feedback` | Pass | Admin gated by email allowlist |
| `/api/export` | Pass | Auth + family membership required |

**Broken links:** None identified in app navigation or footer.

---

## RC1 fixes applied

1. `/admin` added to auth middleware protected routes
2. Onboarding hydration — localStorage read after mount (prevents SSR mismatch)
3. Landing pricing aligned with in-app tiers (R149 / R249 / 14-day trial)
4. FAQ resource card links to `/help/faq`
5. Security headers added (`next.config.ts`)
6. Document delete authorisation — verifies family membership before delete
7. Help form success/error feedback via query params
8. Image optimisation — AVIF/WebP formats enabled

---

## Cross-browser QA

| Environment | Status | Notes |
|-------------|--------|-------|
| Chrome (desktop) | Manual required | Dev server running; automated cross-browser not executed in CI |
| Edge | Manual required | Chromium-based — expected parity with Chrome |
| Safari | Manual required | Test onboarding date inputs and file upload |
| Firefox | Manual required | Test form submissions and print reports |
| Mobile (375px) | Code review | Responsive layouts use Tailwind breakpoints; sidebar hidden on mobile |
| Tablet | Code review | Grid layouts adapt at `sm:` / `lg:` |

**Recommendation:** Complete 30-minute manual pass on Chrome mobile + Safari before pilot.

---

## Performance summary

| Area | Assessment |
|------|------------|
| Dashboard | Server-rendered; data via Supabase queries with limits in `query-limits.ts` |
| Report generation | Server action; AI call is primary latency (~2–8s with OpenAI) |
| AI coach/debrief | Rate-limited; cached intelligence via `lib/intelligence/cache.ts` |
| Images | Next.js Image + AVIF/WebP |
| Bundle | No new modules added in RC1; build completes in ~45s |
| Lazy loading | Next.js automatic code splitting per route |

**Bottlenecks (known):** AI latency depends on `OPENAI_API_KEY`; without it, rule-based fallback is faster but less nuanced.

---

## Accessibility summary

| Criterion | Status |
|-----------|--------|
| Keyboard navigation | Focus rings on sidebar links and design-system inputs |
| Screen readers | `aria-label` on search inputs; `role="status"` on form success |
| ARIA | Nav `aria-label="Main navigation"`; help form alerts |
| Contrast | Teal `#14B8A6` on cream `#FAF8F4` — WCAG AA for body text |
| Focus order | Logical DOM order in forms and wizards |
| Touch targets | Buttons min 48px via design tokens |
| Reduced motion | `prefers-reduced-motion` disables animations in `globals.css` |

**Gap:** Full screen-reader audit of coach/debrief chat not automated — recommend manual VoiceOver pass.

---

## Security summary

| Control | Status |
|---------|--------|
| Authentication | Supabase Auth + middleware session refresh |
| Authorisation | RLS on family tables; admin email allowlist |
| `/admin` protection | Middleware + page guard (fixed in RC1) |
| File uploads | Type whitelist, 10MB max, sanitised paths |
| Document delete | Family membership verified (fixed in RC1) |
| Rate limits | Coach messages: 30/min per user |
| Secrets | Server-only; no keys in client bundle |
| Headers | X-Frame-Options, nosniff, Referrer-Policy (added RC1) |
| Export API | 401 without auth; 404 without family |
| Error handling | Generic messages to users; details in server logs |

---

## Commercial review

| Item | Status |
|------|--------|
| 14-day trial on onboarding | Working |
| Trial countdown in Settings | Working |
| Usage meters (check-ins, reports, coach) | Working |
| Upgrade prompts on limit/feature gate | Working |
| Grace period on cancellation | 7 days in subscription service |
| Help Centre, Privacy, Terms | Live |
| Landing pricing vs in-app | Aligned in RC1 |
| Stripe payments | Not integrated (by design) |

---

## Pilot experience (parent journey)

| Step | Ready? |
|------|--------|
| Understand value from landing/onboarding | Yes — trial messaging clear |
| Complete onboarding | Yes — autosave, hydration fixed |
| First check-in | Yes — redirects with celebration on first |
| Parent Debrief™ | Yes — confidence bands in responses |
| Find help | Yes — sidebar + footer + Help Centre |

---

## Documentation review

| Document | Current? |
|----------|----------|
| `DEPLOYMENT.md` | Yes |
| `OPERATIONS_GUIDE.md` | Yes |
| `SUPPORT_GUIDE.md` | Yes |
| `ADMIN_GUIDE.md` | Yes |
| `SECURITY_GUIDE.md` | Yes |
| `BACKUP_RECOVERY.md` | Yes |
| `KNOWN_LIMITATIONS.md` | Updated RC1 |
| `CHANGELOG.md` | Yes — v1.0.0 section |
| `LAUNCH_CHECKLIST.md` | Yes |
| `docs/pilot/PILOT_LAUNCH_KIT.md` | Yes |

---

## Remaining known issues

1. **Landing resource cards** — 4 of 6 still marked "Coming Soon" (in-app Resource Library is live)
2. **Payment collection** — Plan selection works; Stripe not connected
3. **Analytics/logs** — JSONL files ephemeral on serverless without persistent volume
4. **Cross-browser** — Not machine-verified; manual QA required
5. **Offline mode** — Partial scaffold only; requires internet for core flows
6. **Rate limiting** — In-memory; not suitable for multi-instance without Redis

---

## Final recommendation

### **Ready for Pilot** (not public launch)

RC1 is stable enough for controlled pilot families with manual validation. Apply database migrations (`009`, `010`, `011`) before onboarding real families. Complete a 30-minute cross-browser smoke test and one full parent journey on staging.

**Not ready for unrestricted public launch** until: Stripe/regional payments, persistent analytics storage, and manual QA sign-off on `LAUNCH_CHECKLIST.md`.

---

## Version tag

```
v1.0.0-rc1
```

Tag after migrations applied and staging smoke test passes.
