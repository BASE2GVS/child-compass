# Child Compass Version 2.0 — Intelligence Platform Architecture

Version 2.0 separates **reasoning** (AI engines) from **knowledge** (evidence base), and adds longitudinal, collaborative, and platform foundations.

## Module map

| Priority | Module | Location |
|----------|--------|----------|
| P1 Knowledge Engine | Versioned evidence packs + retrieval | `lib/knowledge/` |
| P2 Knowledge Graph | Event relationship model | `lib/knowledge-graph/` |
| P3 Longitudinal Insights | 30/90/180/365-day reviews | `lib/intelligence/longitudinal.ts` |
| P4 Care Team | Role permissions | `lib/care-team/` |
| P5 School Hub | Hub services | `lib/hubs/school-service.ts` |
| P6 Therapy Hub | Hub services | `lib/hubs/therapy-service.ts` |
| P7 Health Hub | Observations + page | `lib/hubs/health-service.ts`, `app/(app)/health/` |
| P8 Multi-Child | Family intelligence (isolated) | `lib/intelligence/family-intelligence.ts` |
| P9 Localisation | i18n framework | `lib/i18n/` |
| P10 Offline | Bundle cache | `lib/offline/` |
| P11 Observability | Metrics + errors | `lib/observability/` |
| P12 Scalability | Query limits | `lib/scalability/` |
| P13 Commercial | Plans + feature gates | `lib/commercial/` |
| P14 Enterprise | Org types scaffold | `lib/enterprise/` |

## Knowledge engine (P1)

- **Pack version:** `1.0.0` in `lib/knowledge/packs/v1/articles.ts`
- **Retrieval:** `retrieveKnowledge()`, `retrieveKnowledgeForMessage()`
- **Blending:** `blendKnowledgeWithFamily()` combines family history + evidence
- **Integration:** `child-context.ts`, `debrief-engine.ts`, `prompt-builder.ts`
- Knowledge is never invented — only articles from the versioned pack are cited

## Knowledge graph (P2)

- **Builder:** `buildFamilyKnowledgeGraph()` links sleep → school, sensory → mood, anxiety → school
- **Output:** Nodes, edges, natural-language insights
- Fed into AI prompts via `context.graphInsights`

## Longitudinal reviews (P3)

Report types: `review_30d`, `review_90d`, `review_6mo`, `review_annual`

Each compares **only the child's own history** — never other children.

## Database (migration 009)

- `health_observations` — Health Hub
- `care_team_observations` — shared care team notes
- Expanded `generated_reports.report_type` constraint
- Performance indexes on check-ins and patterns

## Environment variables

```
COMMERCIAL_PLAN_TIER=pilot|family|family_plus|enterprise
ENTERPRISE_ENABLED=false
OBSERVABILITY_ENABLED=true
```

## Principles

Every V2 capability must help parents understand **their** child better — using evidence, observed data, and calm professional language.
