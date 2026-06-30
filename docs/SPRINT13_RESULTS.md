# Sprint 13 — Conversation Ownership Refactor

## Objective

Make the LLM the primary author of responses by removing unnecessary post-generation rewriting that made turn 2 sound like turn 1.

## Constraints followed

- No architecture/routing redesign
- No memory retrieval redesign
- No Family Story Engine redesign
- No new product features

## Phase 1 — Post-Generation Pipeline Audit (Before)

### End-to-end path after LLM returned

1. `lib/ai/response-parser.ts` -> `parseDebriefResponse`
- Why it exists: parse JSON output safely into `DebriefResponse`
- Changes wording: Yes, when fields are missing (fallback text)
- Changes emotional tone: Potentially (fallback phrasing)
- Injects template text: Yes (fallback defaults)
- Classification: KEEP

2. `lib/intelligence/coach-format.ts` -> `formatCoachResponse`
- Why it exists: response orchestration and final formatting pass
- Changes wording: Yes (via `ensureCompanionSequence` before refactor)
- Changes emotional tone: Yes
- Injects template text: Yes (opening, explanation, action, hopeful ending)
- Classification: SIMPLIFY

3. `lib/intelligence/coach-format.ts` -> `ensureCompanionSequence` (before)
- Why it existed: enforce presence/understanding/agency/hope structure
- Changes wording: Yes
- Changes emotional tone: Yes
- Injects template text: Yes
- Classification: REMOVE (from external-LLM path)

4. `lib/conversation/natural-reply.ts` -> `formatNaturalReply` (before)
- Why it exists: conversational assembly from response fields
- Changes wording: Yes (branch-based reconstruction)
- Changes emotional tone: Yes (forced emotional-first branches)
- Injects template text: Yes (step/closing fragments in multiple branches)
- Classification: SIMPLIFY

5. `lib/voice/voice-engine.ts` -> `applyCompanionVoice` (before)
- Why it exists: final voice polish
- Changes wording: Yes (AI-language stripping, phrase replacement, opening variation, sentence filtering)
- Changes emotional tone: Yes (opening variation + removals)
- Injects template text: Indirectly (opening replacement)
- Classification: SIMPLIFY

## Phase 2 — KEEP / SIMPLIFY / REMOVE Decisions

### KEEP

- `parseDebriefResponse` (JSON safety and schema normalization)
- Whitespace cleanup and word-limit trimming in voice layer
- Deduplication of repeated paragraphs

### SIMPLIFY

- `formatCoachResponse`: formatting orchestration only in ownership mode
- `formatNaturalReply`: return LLM-authored field flow directly in ownership mode
- `applyCompanionVoice`: formatting-only behavior in ownership mode

### REMOVE

- Automatic emotional opening injection in formatter (ownership mode)
- Automatic explanation injection in formatter (ownership mode)
- Automatic advice/hopeful ending injection in formatter (ownership mode)
- Forced opening variation and broad phrase rewriting in voice layer (ownership mode)

## Phase 3 — Prompt Simplification

Changed in `lib/ai/prompt-builder.ts`:

- Replaced emotional-first instruction:
  - From: "Be emotionally present first"
  - To: "Continue the conversation naturally while remaining emotionally attuned"
- Replaced first-turn framing bias:
  - From: "Start from the parent's feeling and lived moment"
  - To: "Build from the immediate conversational turn before widening to context"

## Phase 4 — Prompt Order

`buildCoachPromptWithEngine` reordered to prioritize conversation continuity:

1. Conversation history
2. Current parent message
3. Family Story (if injected)
4. Family Snapshot
5. Routing guidance

This makes active dialogue primary context and static context secondary.

## Phase 5 — Formatter Changes

File: `lib/intelligence/coach-format.ts`

- Removed template-sequence rewriting from ownership path.
- In ownership mode, `formatCoachResponse` now sends `formatNaturalReply` output directly to light voice formatting.
- No forced emotional opening/understanding/advice/hope paragraphs in ownership path.

## Phase 6 — Natural Reply Changes

File: `lib/conversation/natural-reply.ts`

- Added ownership path: if external LLM is configured and LLM fields are coherent, return composed LLM content directly (`emotional_interpretation`, `behaviour_explanation`, `suggested_response`, `tomorrow_plan`) with only minimal sanitation.
- Retained legacy branch for local fallback compatibility.

## Additional voice-layer simplification

File: `lib/voice/voice-engine.ts`

- Removed opening variation from active path.
- Reduced rewriting to minimal formatting tasks in active path.

## Functions removed vs simplified

### Removed from active ownership path

- `ensureCompanionSequence` templating effects (still retained for local fallback mode)
- Voice opening replacement behavior (`varyOpening`) from active execution path

### Simplified

- `formatCoachResponse`
- `formatNaturalReply`
- `applyCompanionVoice`

## Pipeline Before vs After

### Before

LLM JSON -> parser -> natural-reply branch rebuild -> formatter sequence injection -> voice rewriting/phrase replacement/opening variation -> user

### After (ownership mode)

LLM JSON -> parser -> minimal natural composition (LLM-authored fields) -> formatting-only voice cleanup -> user

## Phase 7 — Conversation Validation

Validation scenarios run:

1. Lienke follow-up
2. Hairdresser
3. School refusal
4. Parent burnout
5. Celebration

Artifacts:

- `.tmp-sprint13-convos-legacy.json`
- `.tmp-sprint13-convos-ownership.json`
- `.tmp-sprint13-convo-diff.json`

### Key continuity result

- Legacy mode repeated same opening on turn 2 for core follow-up scenarios.
- Ownership mode did not repeat identical opening on turn 2 in those scenarios.

Example (`lienke_followup`):

- Legacy turn 1 first line: "That sounds worrying. You're not alone in this."
- Legacy turn 2 first line: "That sounds worrying. You're not alone in this." (repeated)
- Ownership turn 1 first line != ownership turn 2 first line (continued, not template repeat)

## Benchmark Comparison

Baseline:

- `.tmp-sprint9-sprint13_before.json`

After:

- `.tmp-sprint9-sprint13_after.json`

### Metrics

- Presence: 8.968 -> 9.000 (delta +0.032)
- Recognition: 7.976 -> 8.008 (delta +0.032)
- Understanding: 7.678 -> 7.678 (delta +0.000)
- Agency: 8.000 -> 8.000 (delta +0.000)
- Hope: 8.000 -> 8.000 (delta +0.000)
- Trust: 9.196 -> 9.200 (delta +0.004)
- Naturalness: 9.100 -> 9.098 (delta -0.002)
- Conversation Flow: 8.992 -> 9.000 (delta +0.008)
- Overall: 8.556 -> 8.569 (delta +0.013)
- Hard-fail rate: 0.000 -> 0.000

Result: no material regression; overall improved.

## Notes

- Ownership path is activated when external LLM is configured.
- Local fallback mode retains legacy shaping compatibility to preserve existing non-LLM benchmark behavior.

## Conclusion

Sprint 13 completed.

- Turn-2 continuity issue traced to post-generation reshaping.
- Ownership-mode pipeline now minimizes rewriting and keeps LLM as primary author.
- Prompt ordering and stance now prioritize conversation continuity.
- Benchmarks remain stable with slight overall improvement.
