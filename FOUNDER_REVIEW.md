# Founder Review — Sprint 8

**Date:** 25 June 2026  
**Reviewer role:** Product Design Director (parent walkthrough, browser only)  
**Scope:** Presentation friction only — no features, AI, backend, or database work

---

## Method

Used Child Compass as a parent would: morning → afternoon → evening mental model, every primary route, noting every hesitation. Reviewed live UI via browser screenshots and a full authenticated walkthrough. Fixed only what caused friction.

---

## Friction points discovered

### Global / shell

| Friction | Parent impact |
|---|---|
| **80vh editorial heroes** pushed real work below the fold on Check-in, My Child, Coach, School, Documents | Exhausted parent must scroll before doing the one thing they came for |
| **Black “Logout” button** dominated the header | Felt like enterprise software, not a companion |
| **“Your companion”** under the user name + sidebar tagline | Redundant, added reading |
| **Notifications bell** (non-functional) | Looked clickable, went nowhere — trust leak |
| **“More” nav had 9 items** | Software map, not a calm companion |
| **Help opened outside the app shell** | Context switch — sidebar disappeared, new layout, decorative hero, search cut off |
| **Search removed from nav** when trimming “More” | Hidden utility |

### Today

| Friction | Parent impact |
|---|---|
| New users saw setup card on Today (correct flow) but copy felt like “software onboarding” | Minor — expected for incomplete setup |
| Previously: two CTAs (hero Talk + focus button) | Fixed in Sprint 7 |

### Talk (Coach)

| Friction | Parent impact |
|---|---|
| Title “Talk with Child Compass” too long | Reading when they need safety |
| Hero consumed viewport; chat input required scroll | Hard at 11:30pm |

### Check-in

| Friction | Parent impact |
|---|---|
| “How is Amy feeling?” not visible without scroll | **Critical mum-test failure** |
| Large decorative illustration competed with the form | Eye didn’t know where to look |

### My Child

| Friction | Parent impact |
|---|---|
| Hero + bottom card both said “check in” | Duplicate messaging |
| Child status below fold | Understanding delayed |

### Track

| Friction | Parent impact |
|---|---|
| Acceptable after Sprint 7 — timeline visible with compact hero | Progress emotion works |

### Documents

| Friction | Parent impact |
|---|---|
| Empty state CTA “Start with a check-in” on Documents page | Wrong mental model (they came for organisation) |
| Duplicate hero CTA + body copy when empty | Too much reading |

### School / Therapy / Health

| Friction | Parent impact |
|---|---|
| Acceptable structure (one hero action + expandables) | Confidence / calm / reassurance targets met once hero shrunk |

### Help

| Friction | Parent impact |
|---|---|
| Separate public layout with 8-link sidebar + decorative hero | Support emotion → confusion |
| Search below the fold | Couldn’t find answer in 3 seconds |

### Login / Register

| Friction | Parent impact |
|---|---|
| Login had three lines of welcome copy | Unnecessary reading at the door |
| Register title too marketing-heavy | Fine but not “Apple simple” |

### Settings / Profile / Search

| Friction | Parent impact |
|---|---|
| Generally clear after Sprints 6–7 | Control emotion OK |

---

## Improvements made (Sprint 8)

1. **Compact heroes by default** — Editorial pages now use `heroCompact={true}`; title + purpose + action visible without scrolling; parchment spacing tightened.
2. **Header calm** — Logout → subtle “Sign out”; removed subtitle and notification bell; profile tap target kept at 40px+.
3. **Search in header** — Restored discoverability after trimming sidebar.
4. **Sidebar “More” trimmed** — 9 items → 5 (School, Therapy, Health, Help, Settings). Removed Children, Trends, Help Me Now, duplicate Search.
5. **Help inside app shell** — `/help` now lives in `(app)` route group; same sidebar, same world.
6. **Help simplified** — Search first, four common questions, contact/legal behind “Contact & legal”. Public FAQ layout also simplified.
7. **Talk renamed** — “Talk with Child Compass” → **Talk**; purpose → “You're safe here.”
8. **Documents empty CTA** — “Do today's check-in” (clear why: summaries need check-ins first).
9. **Login / Register** — One headline each; less copy.
10. **Emotional purpose lines** — Today → “One step for today”; Coach → “You're safe here.”

---

## What still needs work

| Area | Issue | Priority |
|---|---|---|
| **Onboarding → Today** | Fresh accounts still see setup card, not Today rhythm | Medium — copy/flow polish |
| **Mobile** | Not fully re-walked on phone viewport this sprint | High before pilot |
| **Help FAQ subpages** | Still use public help layout (acceptable for legal/FAQ) | Low |
| **Documents with content** | “Share” on hero + Share on card — watch for duplicate when library is full | Low |
| **Empty Track** | Single timeline entry is good; long-term empty state could feel warmer | Low |
| **Grandparent test** | Sidebar labels are good; Settings forms still dense | Medium |
| **11:30pm parent** | Much better with compact heroes; Talk still needs real-device check that keyboard + input feel natural | High |
| **Trends / Analytics** | Removed from nav — power users must use search | Acceptable for pilot |
| **Help Me Now** | Removed from sidebar — crisis path only via Talk starters | Revisit with clinical advisor |

---

## Emotion check (target vs. current)

| Page | Target | After Sprint 8 |
|---|---|---|
| Today | Hope | ✅ One focus action, calm hero |
| Talk | Safety | ✅ Shorter title, starters visible, compact hero |
| My Child | Understanding | ✅ Check-in CTA clear; story above fold |
| Track | Progress | ✅ Timeline visible |
| School | Confidence | ✅ Teacher guide is the one action |
| Therapy | Calm | ✅ Form in expandable |
| Health | Reassurance | ✅ Same pattern |
| Documents | Organisation | ⚠️ Empty state explains why; good enough |
| Help | Support | ✅ In-app, search first |
| Settings | Control | ✅ OK |

---

## Pilot readiness

### Would I put this in front of 100 pilot families tomorrow?

**Yes — with eyes open.**

Child Compass no longer fights the parent at the front door. The biggest failures from the walkthrough — **heroes that hid the work**, **Help leaving the app**, **header that looked like SaaS**, **navigation that felt like a product map** — are addressed.

It feels closer to **companion** than **software**: five primary destinations, one action per page, complexity behind “See more / History / Advanced.”

**Conditions for pilot:**

- Run a **mobile pass** (iPhone SE + Android) before week one.
- Sit with **3–5 real parents** for 20 minutes each and watch where they hesitate (no prompting).
- Monitor **Check-in completion** and **Talk first message** as emotional health metrics.

**Not blocking pilot:** Trends nav removal, Help Me Now path, illustration polish.

---

## Build status

| Check | Result |
|---|---|
| `npm run lint` | Pass (0 errors; pre-existing `<img>` warnings) |
| `npm run build` | Pass |

---

*This document is the Sprint 8 deliverable. Re-read after every future sprint that touches parent-facing UI.*
