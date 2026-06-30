# Talk V2 Founder Testing Guide

This guide is for founder-only validation of Talk V2 behind the existing feature flag.

## Scope Rules
- No Talk V1 replacement.
- No broad rollout.
- No architecture changes.
- No new conversational layers.
- If quality is poor, fix only the responsible component: Context, Prompt, Provider, Validation, Repository, or Orchestrator.

## Prerequisites
- `PILOT_ADMIN_ENABLED=true`
- Founder account is allowed by pilot admin list.
- `TALK_V2_ENABLED=true` for active Talk V2 pipeline tests.
- `OPENAI_API_KEY` and `DATABASE_URL` set for full live run with persistence.

## Founder Harness
- Route: `/pilot-settings/talk-v2`
- Label in UI: `TALK V2 FOUNDER HARNESS`

Capabilities:
- Start new Talk V2 conversation.
- Continue existing conversation.
- Inspect per-turn internal telemetry (timings + stage events).
- Reset selected conversation.
- Verify feature-flag disabled behavior.

Data file used by harness:
- `data/talk-v2-founder-harness.json`

Golden suite source:
- `data/talk-v2-founder-golden-suite.json`

## Manual Test Loop
1. Open founder harness.
2. Pick a golden scenario.
3. Start new conversation with scenario and child ID.
4. Run all scenario turns in order.
5. Review telemetry after each turn.
6. Log findings with regression template.
7. If issue found, classify root cause and patch only that component.
8. Re-run same scenario to verify fix.

## Required Founder Pass Criteria
- Multi-turn continuity holds across all scenarios.
- Context remains relevant and non-hallucinatory.
- Safety behavior is deterministic.
- Latency is acceptable and telemetry present.
- Idempotent retry does not duplicate persistence.
- Feature flag gates Talk V2 correctly.

## Golden Scenarios Included
- Sleep (multi-turn continuity)
- Anxiety (multi-turn continuity)
- School (follow-up)
- Meltdown (escalation then recovery)
- Parent exhaustion (emotional support)
- PDA demand avoidance (several follow-ups)
- Medication (information seeking)
- General parenting (normal conversation)
