# Sprint 10: Relationship Intelligence

## Goal

Implement the minimum viable set of changes that make Child Compass feel more like a long-term companion across repeated conversations, without redesigning architecture, memory systems, routes, UI, or database schema.

Scope constraints for this sprint:

- Keep existing standards documents read-only.
- Preserve current response pipeline and architecture.
- Use lightweight behavioural improvements inside current enrichment flow.
- Validate no regressions on the Golden benchmark dimensions.

## Relationship Audit

### 1. Relationship signals already available in the current system

The existing pipeline already has substantial relationship context available at response time:

- Child-level trend data from `recentCheckins` (mood, anxiety, demand tolerance, sleep, wins, challenges).
- Family pattern data from `patterns` and pattern confidence.
- Conversation continuity data from `conversationHistory` parent/assistant turns.
- Day-over-day continuity via `coachMessages` with timestamps.
- Longitudinal context via `dataSpanDays` and debrief history.
- Existing companion enrichments including:
  - Family understanding snippets
  - Positive change notices
  - Parent understanding style cues
  - Relationship depth framing
  - Cross-day continuity references
  - Trust-layer safety and humility controls

### 2. Signals already being used in responses before Sprint 10

Before Sprint 10, responses were already using many relational cues:

- Emotional presence and trust boundaries were consistently applied.
- Positive change was sometimes surfaced from checkin deltas.
- Cross-day continuity was occasionally woven when prior-day context was available.
- Conversation continuity and relationship depth were added in problem-solving style responses.

### 3. Signals present but underused / effectively ignored

Despite strong raw context, three relationship-intelligence gaps remained:

- Repeated struggle recognition was inconsistent.
  - The model did not reliably name recurring themes (for example repeated morning or sensory strain) as a relationship-level pattern.
- Setback-after-progress framing was weak.
  - When a hard day followed wins, the response did not always normalize the emotional whiplash in a long-arc framing.
- Familiarity progression was under-signaled.
  - Over time, the tone did not always reflect that the companion had meaningfully "been with" the family through repeated cycles.

These gaps matter because long-term companionship is not just memory retrieval. It is the felt quality of being known through progress, regressions, and repetition.

## Minimum Implementation

### Design principle

Add a single lightweight relationship signal in the current enrichment stage, gated so it appears only when context is strong and not on every turn.

### Changes made

1. Added `lib/companion/relationship-intelligence.ts`.

- New helper `buildRelationshipSignal(...)` synthesizes one relationship-level line from existing data.
- It uses only already-available context:
  - recent checkins
  - conversation history
  - data span
  - parent message
- It detects and prioritizes:
  - setback-after-progress signal
  - subtle progress trend signal
  - repeated challenge theme signal
  - long-arc consistency signal
- It includes cadence gating to avoid forced memory language every turn.
- It supports controlled baseline testing with `RELATIONSHIP_INTELLIGENCE_DISABLED=1`.

2. Integrated relationship signal into existing enrichment flow in `lib/companion/curious-companion.ts`.

- Extended `CuriousEnrichment` with `relationshipSignal`.
- Populated this field in `buildCuriousEnrichment(...)` under existing memory visibility and trust gates.
- Wove the signal into the emotional stack in `applyCuriousEnrichment(...)`.

3. Added simulation harness `scripts/run-relationship-simulation.ts`.

- Runs 50 journeys x 30 days (1500 conversations/pass).
- Executes two passes in one command:
  - baseline with relationship signal disabled
  - after with relationship signal enabled
- Scores relationship metrics and writes:
  - `.tmp-sprint10-relationship-<label>_before.json`
  - `.tmp-sprint10-relationship-<label>_after.json`
  - `.tmp-sprint10-relationship-<label>.json` (comparison)

4. Added npm script in `package.json`:

- `benchmark:relationship` -> `npx tsx scripts/run-relationship-simulation.ts`

## Why this is minimal and safe

- No schema changes.
- No new persistence systems.
- No retrieval redesign.
- No changes to app routing/UI.
- No replacement of existing prompt or formatting architecture.
- New behaviour is additive and cadence-gated.

## Behavioural intent after Sprint 10

The companion should more reliably communicate:

- "I can see this keeps happening" (repeated strain).
- "A setback does not erase progress" (long-arc framing).
- "You are not doing this alone over time" (familiarity/continuity trust).

Without turning every response into explicit memory narration.

## Validation Protocol

Sprint 10 validation used two checks:

1. Relationship simulation benchmark (50x30 journeys)

- Measures long-horizon companion qualities.

2. Golden benchmark regression guard

- Confirms no degradation in core quality dimensions:
  - Presence
  - Recognition
  - Understanding
  - Agency
  - Hope
  - Trust
  - Naturalness
  - Conversation Flow

## Outcome Summary

- Relationship simulation showed overall relationship score improvement.
- Companion familiarity improved materially.
- Golden benchmark remained unchanged (no regressions).

Full numeric results are in `docs/RELATIONSHIP_SIMULATION_RESULTS.md`.

## Immutable Sprint 10 principles

1. Relationship intelligence should be inferred from real interaction patterns, not forced memory inserts.
2. Repetition should be named carefully and compassionately.
3. Setbacks must be normalized within a growth arc.
4. Familiarity is a tone and timing property, not just a data property.
5. Trust safety gates always outrank enrichment density.
6. Long-term companionship must not reduce agency or over-direct parents.
7. New relationship behaviours must be benchmarked against regression guards.
8. If relationship improvements threaten core conversational quality, preserve core quality first.

## Operational commands

- Run relationship simulation:

  `npm run benchmark:relationship -- sprint10`

- Run golden regression benchmark:

  `npm run benchmark:golden -- sprint10_after`

## Deliverables produced in Sprint 10

- `docs/RELATIONSHIP_INTELLIGENCE.md` (this document)
- `docs/RELATIONSHIP_SIMULATION_RESULTS.md`
- `lib/companion/relationship-intelligence.ts`
- `scripts/run-relationship-simulation.ts`
- `package.json` script update
