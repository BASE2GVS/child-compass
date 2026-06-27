# Relationship Sprint — Sprint 10

**Goal:** Child Compass should feel present, calm, interested, and supportive — never like software waiting for a command.

**Scope:** Copy, tone, and presentation simplification only. No new features, pages, colours, AI reasoning, or database changes.

---

## Emotional questions — one per page

Every primary page hero now states a single emotional question via `lib/companion/page-atmosphere.ts` and matching nav descriptions in `lib/navigation/parent-nav.ts`:

| Page | Emotional question |
|------|-------------------|
| Today | How are we doing? |
| Talk | Can someone help me think? |
| My Child | Who is my child becoming? |
| Track | What have we been through together? |
| Check-in | How was today? |
| Documents | What have we learned? |
| School | How can we work together? |
| Therapy | What is helping? |
| Health | How is my child feeling? |
| Settings | How do I make Child Compass mine? |
| Help | Will someone help me? |

---

## Friction removed

| Area | Before | After |
|------|--------|-------|
| **School** | Separate "Insight" expandable (felt like a second page purpose) | One gentle paragraph when something is noticed |
| **Therapy** | Duplicate hero CTA + form; "Advanced" section | Form only; optional fields under "More detail (optional)" |
| **Today** | "See more" (software habit) | "When you're ready for more" |
| **Track** | "Filter" / "Memories" | "Find a moment" / "Saved moments" |
| **Documents** | "History & uploads" | "What you've saved" |
| **My Child** | "More about…" expandable | "As we learn about…" — depth stays behind one door |
| **Settings** | Plan buried in "Account & family details" | Subscription visible; details in "Your details" |
| **Contextual next steps** | "Talk to Child Compass" (brand-heavy, long) | "Talk" — one word, kitchen-table natural |

---

## Language improved

**Product → parent language (examples):**

- Manage your account → *How do I make Child Compass mine?*
- Log [child]'s day → *How was today?*
- Generate / reports / Coach messages → *Share / summaries / conversations*
- Help Centre → *Help*
- New AI insight → *Something new I noticed*
- Notification preferences → *Gentle nudges*
- Daily check-in reminder → *Check-in invitation*
- Child Compass is thinking… → *Give me a moment…* / *Thinking with you…*
- Health Hub + longitudinal reviews → *wellbeing notes and longer reviews*
- Analytics / dashboard references in parent copy → *patterns* / removed

**Central modules updated:**

- `lib/companion/page-atmosphere.ts` — emotional questions on every variant
- `lib/companion/contextual-next-step.ts` — companion voice for Today CTAs
- `lib/companion/human-language.ts` — expanded product-term replacements
- `lib/presentation/copy.ts` — first-person companion voice ("I've noticed", "I'm reflecting")
- `lib/navigation/parent-nav.ts` — nav tooltips match emotional questions

**Page-level copy:** Settings, Help, School, Therapy, Health, Documents, Track, Search, Profile, Goals, Trends (analytics), Coach thinking state, subscription labels, My Child understanding section.

---

## Moments simplified

- **School insight** no longer hidden behind a labelled panel — reads like a friend noticing something.
- **Therapy** drops redundant primary action; one clear path to add a session note.
- **Empty / secondary states** use invitation language, not system messages (carried forward from Sprint 9, aligned here).
- **Goals & Trends** empty states lose internal product explanations ("Child Compass highlights…", "why trends help") — one encouragement, one action.

---

## Pages reviewed — would a parent miss them?

| Page | Verdict | Action |
|------|---------|--------|
| Today, Talk, My Child, Check-in, Documents | **Yes** — core relationship loop | Kept; copy aligned |
| Track, School, Therapy, Health, Help, Settings | **Yes** — specific life contexts | Kept; one question each |
| Search | **Sometimes** — find something quickly | Kept; warmer placeholder and empty state |
| Goals, Habits, Schedules, Trends | **Only if already using** — not first-week | Left in place (routes unchanged); softened copy; not promoted in nav |
| Dashboard, Analytics (as names) | **No** as product language | Redirects/labels unchanged technically; parent-facing text avoids "dashboard" |

No routes removed — sprint constraint was presentation, not architecture.

---

## Lint & build

```
npm run lint   → PASS (0 errors, 6 pre-existing warnings)
npm run build  → PASS
```

---

## Product recommendation

**Would I recommend this to my sister if her child had just been diagnosed?**

**Yes — with warmth and honesty.**

Child Compass now speaks in one voice: a calm companion at the kitchen table, not a platform asking for input. Every main screen answers one emotional question. Product vocabulary is largely gone from parent-facing surfaces.

**Before pilot, still worth:**

1. **One live hour** as a parent (not a developer) — especially Settings/plan language and check-in length.
2. **Mobile pass** — nav labels are emotional questions; confirm they read well on small screens.
3. **Landing/marketing pages** — Footer still says "Help Centre" in places; in-app is aligned.

The relationship is built in the daily loop: *How are we doing?* → *How was today?* → *Can someone help me think?* That loop now sounds like the same person throughout.

---

*Sprint 10 — The Relationship Sprint · Child Compass 3.0*
