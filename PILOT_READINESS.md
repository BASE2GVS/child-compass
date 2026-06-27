# Pilot Readiness — Sprint 11

**Question:** Would a parent want to come back tomorrow?

**Scope:** Presentation and rhythm only. No new features, architecture changes, or added complexity.

---

## What changed

### The app feels alive
- **Companion welcome lines** on every page — time-of-day and return-aware (*Good morning*, *Welcome back*, *Good to see you again* after two weeks away).
- **`CompanionVisitTracker`** remembers last visit locally (no database) so returning parents feel continuity.
- **Today hero** acknowledges the parent before the greeting — same warmth as other pages.

### Today — clearer in ten seconds
- **One focal block:** emotional cue → short heading → one sentence → one button (*Check in*, *Talk*, *Continue*).
- **Child story** only appears when there is something to show (check-in or insight) — empty space when there is nothing to say.

### Silence — room to breathe
- Removed from Today: journey strip (*3 of 5 moments*), optional mood picker, gentle prompt nudges, and the *When you're ready for more* expandable.
- **Settings:** plan and account details tucked behind expandables — calm first screen.
- **Help:** five essential answers visible; five more behind *More questions*.
- **Therapy / Health:** note forms closed by default — open when needed.
- **Track:** *Add a moment* behind an expandable.

### Memory — pick up after time away
- After **2+ days:** *Welcome back* / *Let's continue where we left off*.
- After **14+ days:** *Good to see you again* / *We've kept your place warm*.
- **Today** still leads with one obvious next step — same anchor whether yesterday or last month.

---

## What was removed

| Removed | Why |
|---------|-----|
| Today's journey progress strip | Felt like app gamification, not daily rhythm |
| Parent mood inline picker on Today | Extra decision on an already full morning |
| Gentle prompt nudges inside Today expandable | Competed with the single primary step |
| *When you're ready for more* expandable on Today | Hid useful things; also added noise when open |
| Child story block when empty | Silence is better than placeholder copy |
| Subscription usage meters on Settings landing | Overwhelming for grandparents; plan is expandable |
| Five Help FAQs from the main scroll | Wall of text; split into top 5 + more |
| Open-by-default forms on Therapy and Health | Too much form before the parent is ready |

---

## Remaining concerns

| Concern | Notes |
|---------|--------|
| **Check-in length** | Still ~10 steps — fine for rhythm once started, but first visit may feel long |
| **Onboarding wizard** | Multi-step setup before first value — unchanged this sprint |
| **Goals / Habits / Schedules / Trends** | Still reachable via Track nav; not simplified this sprint |
| **Mobile walkthrough** | Welcome lines and hierarchy not re-tested on a phone in this sprint |
| **Landing / marketing pages** | In-app voice is aligned; public site not updated |
| **Welcome line on every page visit** | Rotates by day, not session — intentional warmth; watch for fatigue in pilot |

---

## Final recommendation

**Pilot: Yes.**

Child Compass now behaves more like a daily companion than a dashboard. Today answers *How are we doing?* in ten seconds. Returning parents get continuity without tutorials. Settings, Help, and secondary pages leave space instead of filling it.

**Before inviting families:**

1. Walk **one full day** yourself — morning check-in, afternoon Talk, evening Today — on phone and desktop.
2. Run **2–3 parent sessions** and listen for *"where do I go?"* — not feature requests.
3. After two weeks of real use, ask only: **"Would you come back tomorrow?"**

Stop here. No new features before pilot.

---

*Sprint 11 — The "I Don't Want to Leave" Sprint · Child Compass 3.0 · Final presentation sprint*
