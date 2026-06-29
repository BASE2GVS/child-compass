# Sprint 11 — Family Story Engine

## Objective

Transform Child Compass from memory retrieval behavior into ongoing narrative understanding:

- From: "What memories are relevant?"
- To: "What chapter is this family living through?"

This sprint intentionally keeps architecture stable:

- No schema changes
- No routing changes
- No LLM provider changes
- No UI changes
- No edits to Conversation Bible, Companion Equation, or QA Engine

## Part 1 — Story Audit

## Existing memory sources reviewed

The existing architecture already provides these memory sources at prompt-time:

1. Check-ins (`recentCheckins`)
- Wins
- Challenges
- Parent notes
- Numeric trends (mood/anxiety/sleep/school/demand)

2. Debriefs (`recentDebriefs`)
- Parent message history
- Trigger context

3. Profile (`profile`)
- Child strengths
- Known triggers
- Calming strategies
- Successful strategies

4. Patterns (`patterns`)
- Ongoing family patterns and confidence

5. Timeline/brain-derived memories (`memoryReferences`, `familyBrainSummary`, `companionInsightTexts`)
- Distilled historical lines
- Cross-time relational observations

## Story category classification model

Each memory is classified into one of the required categories:

- Progress
- Ongoing challenge
- Parent emotion
- Child strength
- Child struggle
- Family relationship
- Successful strategy
- Unsuccessful strategy
- Important milestone
- Current concern

### Classification coverage by source

- Check-in wins -> Progress or Important milestone
- Check-in challenges -> Child struggle + Current concern
- Check-in notes -> Parent emotion (if emotional signal) else Current concern
- Debrief parent messages -> Current concern; Parent emotion where emotional language exists; Family relationship when relational references appear
- Debrief triggers -> Child struggle
- Profile strengths -> Child strength
- Profile calming/successful strategies -> Successful strategy
- Patterns -> Ongoing challenge
- Memory references -> classified by semantic cues:
  - strategy/regulation cues -> Successful strategy
  - explicit failed attempt cues -> Unsuccessful strategy
  - repeated stress/theme cues -> Ongoing challenge or Current concern
  - progress language -> Progress

## Implementation details

New module added:

- `lib/intelligence/family-story-engine.ts`

Core functions:

- `buildStorySignals(context, memoryItems)`
  - Converts existing memory/context data into categorized story signals.
- `buildCurrentFamilyChapter(context, memoryItems)`
  - Synthesizes a 150-260 word narrative chapter.
- `shouldInjectFamilyChapter(context, parentMessage, conversationHistory)`
  - Materiality gate for prompt injection.

## Part 2 — Narrative Synthesis

The Family Chapter synthesis layer is lightweight and uses only existing data. It does not retrieve additional memories and does not alter persistence.

Output shape:

- Natural 150-260 word chapter (target window inside requested 150-300)
- Covers:
  - What the family has been working through
  - What is getting easier
  - What remains difficult
  - Parent emotional load
  - What has helped
  - What should not be forgotten

Narrative style constraints implemented:

- Reads as a thoughtful family narrative (not list/report format)
- Balances setbacks with momentum
- Preserves strengths and relationship context

## Part 3 — Narrative Injection

Injection happens only when materially useful.

Integration point:

- `lib/ai/prompt-builder.ts` in `buildFamilySnapshot(...)`

Gating behavior:

- Hard off-switch for validation: `FAMILY_STORY_ENGINE_DISABLED=1`
- Inject chapter when need score is sufficiently high (explicit continuity/progress/setback asks, deeper context, stronger data span)
- Deterministic cadence guard to avoid chapter injection on every message

Result:

- No prompt-size inflation on short/simple turns
- No forced chapter in every response

## Why this is architecture-safe

- No schema or storage changes
- No retrieval expansion
- No route/UI work
- No provider changes
- Additive, isolated synthesis + prompt wiring only

## Files changed for Sprint 11

- `lib/intelligence/family-story-engine.ts`
- `lib/ai/prompt-builder.ts`
- `scripts/run-family-story-simulation.ts`
- `package.json` (script registration)

## Validation protocol

1. Family Story simulation benchmark (50 journeys x 90 days)
- Command: `npm run benchmark:family-story -- sprint11`
- Generates before/after/comparison artifacts under `.tmp-sprint11-family-story-*.json`

2. Golden benchmark regression guard
- Commands:
  - `npm run benchmark:golden -- sprint11_before`
  - `npm run benchmark:golden -- sprint11_after`

## Acceptance framing

Sprint 11 is successful when long-horizon context is synthesized as a living chapter and improves relationship-level quality without degrading core conversation quality.

Measured results and regression outcomes are in:

- `docs/FAMILY_STORY_SIMULATION_RESULTS.md`
