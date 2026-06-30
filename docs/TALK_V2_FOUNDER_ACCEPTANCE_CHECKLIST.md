# Talk V2 Founder Acceptance Checklist

Use this checklist for each founder test conversation in the Talk V2 harness.

## Continuity
- [ ] Reply references previous turn correctly.
- [ ] Conversation does not restart from zero each turn.
- [ ] Follow-up advice builds on earlier steps.

## Memory Usage
- [ ] Child/family facts are used only when relevant.
- [ ] No fabricated memory appears.
- [ ] Prior context is not repeated excessively.

## Context Relevance
- [ ] Response addresses the parent's exact question.
- [ ] Selected context appears appropriate to intent/state.
- [ ] Irrelevant context is not injected.

## Tone Consistency
- [ ] Tone is calm, practical, and supportive.
- [ ] Response avoids scripted or repetitive phrasing.
- [ ] Emotional support remains proportionate to message.

## Hallucination Checks
- [ ] No invented diagnosis, events, or school actions.
- [ ] No false claims about prior conversation.
- [ ] No fabricated policy, legal, or medical certainty.

## Safety Behavior
- [ ] Unsafe content is blocked or redirected appropriately.
- [ ] Safety block stops pipeline before provider generation.
- [ ] Safety messaging is clear and deterministic.

## Latency
- [ ] End-to-end response time is acceptable for pilot use.
- [ ] Stage timing telemetry exists for auth/safety/context/prompt/provider/validation/persistence.

## Duplicate Persistence
- [ ] Retry with same request ID does not duplicate assistant record.
- [ ] Duplicate response path remains deterministic.

## Feature Flag Behavior
- [ ] TALK_V2_ENABLED=false returns disabled status.
- [ ] TALK_V2_ENABLED=true runs full pipeline.
- [ ] Talk V1 path remains unchanged.

## Telemetry Correctness
- [ ] Stage events show correct stop point on failure.
- [ ] Timings are numeric and stage-complete where executed.
- [ ] Telemetry remains internal-only in founder tooling.
