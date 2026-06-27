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
import { buildFamilyInsights } from "@/lib/companion/family-insights";
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

  const baseContext: ChildContext = {
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
    recentTimeline: timeline.slice(0, 12).map((e) => ({
      date: e.event_date,
      title: e.title,
      description: e.description,
      event_type: e.event_type,
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

  const insightItems = buildFamilyInsights(baseContext);
  const checkinDates = checkins.map((c) => c.checkin_date).sort();
  const dataSpanDays =
    checkinDates.length >= 2
      ? Math.floor(
          (new Date(checkinDates[checkinDates.length - 1]).getTime() -
            new Date(checkinDates[0]).getTime()) /
            86400000,
        )
      : 0;

  return {
    ...baseContext,
    familyInsights: insightItems.map((i) => i.text),
    dataSpanDays,
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
    debriefs: context.recentDebriefs.map((d, i) => ({
      id: `ctx-${i}`,
      parent_message: d.parent_message,
      likely_trigger: d.likely_trigger,
      created_at: d.created_at,
      suggested_response: null,
      tomorrow_plan: null,
    })) as ParentDebrief[],
    timeline: context.recentTimeline.map((e, i) => ({
      id: `tl-${i}`,
      child_id: context.child.id,
      user_id: "",
      event_type: e.event_type,
      title: e.title,
      description: e.description,
      event_date: e.date,
      metadata: {},
    })) as TimelineEvent[],
    patterns: context.patterns as PatternFinding[],
  });
  return memoryReferenceForContext(memories, parentMessage);
}
