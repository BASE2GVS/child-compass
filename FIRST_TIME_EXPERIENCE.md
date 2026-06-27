# First Five Minutes — Sprint 9

**Goal:** A brand-new parent can discover how to use Child Compass naturally — no video, no docs, no help request — within five minutes of signing up.

**Scope:** Presentation and onboarding copy only. No new features, AI changes, or database changes.

---

## Onboarding improvements

### 1. First login → welcome, not the app
- **`OnboardingWizard` step 0** reduced to one sentence (`WELCOME_ONE_LINER`) and a single **Let's begin** button — no trial bullets or feature lists.
- **Post-setup screen** says *You're ready* and routes to **first check-in** (`/check-in?child=…&first=1`), not a generic Today dump.
- **`signIn`** redirects incomplete profiles to `/onboarding` instead of `/today`.

### 2. First Today — guided, not empty cards
- **`FirstTodayGuide`** shown when the child has **zero check-ins ever** — warm welcome, one sentence about learning together, one CTA: *Start today's check-in*.
- Removed **GuidedTour** from Today (extra friction for new parents).
- Incomplete onboarding on `/today` now **redirects** to `/onboarding` instead of showing a legacy card.

### 3. First Coach conversation — intro + four starters
- Empty chat shows **`FIRST_COACH_INTRO`** instead of illustration-only empty state.
- **`SuggestedConversations`** `firstVisit` mode: exactly **four** plain-language starters, no expandable list.
- **Gentle celebration** after the first completed exchange (`FIRST_COACH_CELEBRATION`).

### 4. First check-in — why before what
- **`FirstCheckinIntro`** banner before the first question when `?first=1` or no prior check-ins.
- Copy: *The small moments you share help me understand your family more naturally over time.*

### 5. First My Child page — celebrate possibilities
- **`FirstMyChildIntro`** when no check-ins exist — *We're only just beginning to get to know [name]…*
- Primary action links to first check-in with `&first=1`.

### 6. Empty states — hope, not absence
- Shared **`EMPTY_HOPE`** copy: *We're just getting started.*
- **Track**, **Documents/Library**, **ChildTodayStory**, and **Library reports** empty states updated with hopeful language and a single next step (usually check-in).

### 7. Help — ten answers, no searching
- **`HelpCentreExperience`** lists **10 common parent questions with inline answers** — no search required to get started.
- Contact, FAQ, and Privacy linked at the foot.

### 8. Success moments — gentle, never loud
- **`GentleSuccess`** component for quiet celebrations.
- **First check-in:** banner on Today after redirect (`?first-checkin=1`).
- **First conversation:** banner after first Coach reply.
- **First report:** banner on report view when `?first=1`.

### 9. Shared copy module
- **`lib/first-time/copy.ts`** — single source for first-time messaging across pages.

---

## First-five-minutes walkthrough (intended path)

| Step | What the parent sees | Time |
|------|----------------------|------|
| 1 | Register / log in → **Welcome** + one sentence + **Let's begin** | ~30s |
| 2 | Short family + child setup (existing wizard) | ~2–3 min |
| 3 | *You're ready* → **first check-in** with *why it matters* | ~2 min |
| 4 | Return to **Today** with gentle celebration + nudge to **Talk** | ~30s |
| 5 | **Talk** intro + four starters, or **Help** if stuck | optional |

A parent who completes setup + one check-in has used the core loop within five minutes.

---

## Remaining friction

| Area | Issue | Severity |
|------|-------|----------|
| **Onboarding wizard steps 1–4** | Family/child/invite/finish still multi-step — necessary for data, but adds time before first value | Medium |
| **Check-in length** | Full check-in flow unchanged (~10 steps) — first visit may exceed five minutes if parent completes everything | Medium |
| **Today after first check-in** | Full Today editorial (focus feature, child story, expandable) appears — richer but no longer single-CTA | Low |
| **Contextual next step copy** | Still says *Talk to Child Compass* in places while nav says *Talk* | Low |
| **First timeline moment** | No dedicated celebration when Track gets its first entry (check-in creates one; celebration is on Today instead) | Low |
| **Mobile** | Not re-walked on real devices this sprint | Medium (pilot) |
| **Email verification** | New accounts may hit verify-email before onboarding — depends on Supabase config | Config-dependent |

---

## Lint & build

```
npm run lint   → PASS (0 errors, 6 pre-existing warnings)
npm run build  → PASS
```

---

## Final recommendation

**Pilot-ready for first-time parents: Yes, with one live test.**

The zero-to-first-check-in path is now intentional: welcome → setup → why → check-in → gentle celebration → Talk intro. Empty states and Help no longer dead-end or apologise for missing data.

**Before pilot:**

1. **Delete a test account and walk the path once** on desktop and phone — confirm onboarding + first check-in fits your target time budget.
2. **Run 2–3 parent sessions** and watch where they hesitate (especially onboarding steps 2–4 and check-in length).
3. **Align copy** — change remaining *Talk to Child Compass* strings to *Talk* for consistency.

Child Compass should now feel discoverable to a non-technical parent within the first five minutes **after** account setup. Setup itself remains the main time cost — that is expected until a lighter “minimum viable child profile” is considered post-pilot.

---

*Sprint 9 — The First Five Minutes · Child Compass 3.0*
