import type {
  Child,
  ChildContext,
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
} from "@/lib/types/database";
import {
  buildFamilyMemory,
  formatMemoryReference,
  memoryReferenceForContext,
} from "@/lib/intelligence/memory";
import { buildFamilyKnowledgeGraph } from "@/lib/knowledge-graph/builder";
import { retrieveKnowledge } from "@/lib/knowledge/engine";

export type ChildContextData = ChildContext;

export function assembleChildContext(
  child: Child,
  profile: ChildProfile | null,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
  timeline: TimelineEvent[] = [],
): ChildContext {
  const memories = buildFamilyMemory({
    profile,
    checkins,
    debriefs,
    timeline,
    patterns,
  });

  const memoryReferences = memories
    .filter((m) => m.date)
    .slice(0, 8)
    .map(formatMemoryReference);

  const graph = buildFamilyKnowledgeGraph({ checkins, timeline, debriefs, profile });
  const graphInsights = graph.insights;

  const knowledgeArticles = retrieveKnowledge({
    diagnosis: child.diagnosis,
    limit: 3,
  });
  const knowledgeGuidance = knowledgeArticles.map((a) => `${a.title}: ${a.guidance[0]}`);

  return {
    child: {
      id: child.id,
      first_name: child.first_name,
      nickname: child.nickname,
      diagnosis: child.diagnosis,
      support_needs: child.support_needs,
      school: child.school,
      grade: child.grade,
      interests: child.interests,
    },
    profile: profile
      ? {
          strengths: profile.strengths,
          known_triggers: profile.known_triggers,
          calming_strategies: profile.calming_strategies,
          challenges: profile.challenges,
          successful_strategies: profile.successful_strategies,
        }
      : null,
    recentCheckins: checkins,
    recentDebriefs: debriefs.map((d) => ({
      parent_message: d.parent_message,
      likely_trigger: d.likely_trigger,
      created_at: d.created_at,
    })),
    patterns: patterns.map((p) => ({
      title: p.title,
      description: p.description,
      category: p.category,
      confidence: p.confidence,
    })),
    memoryReferences,
    knowledgeGuidance,
    graphInsights,
  };
}

export function memoryForMessage(context: ChildContext, parentMessage: string): string | null {
  const memories = buildFamilyMemory({
    profile: context.profile
      ? ({
          known_triggers: context.profile.known_triggers,
          calming_strategies: context.profile.calming_strategies,
          successful_strategies: context.profile.successful_strategies,
          strengths: context.profile.strengths,
          challenges: context.profile.challenges,
        } as ChildProfile)
      : null,
    checkins: context.recentCheckins,
    debriefs: [],
    timeline: [],
    patterns: context.patterns as PatternFinding[],
  });
  return memoryReferenceForContext(memories, parentMessage);
}
