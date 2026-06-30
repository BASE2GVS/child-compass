import type { FamilyContext } from "@/lib/talk-v2/contracts";

export function serializeFamilyContext(context: FamilyContext): string {
  // Keep order stable for deterministic prompt generation.
  const compact = {
    version: context.version,
    childId: context.childId,
    sessionId: context.sessionId,
    childProfile: context.childProfile,
    conversationState: context.conversationState,
    behaviourPatterns: context.behaviourPatterns,
    dailyCheckins: context.dailyCheckins,
    timelineHighlights: context.timelineHighlights,
    relevantMemories: context.relevantMemories,
    familyStory: context.familyStory,
    safetyRules: context.safetyRules,
    completeness: context.completeness,
    selectionMetadata: context.selectionMetadata,
  };

  return JSON.stringify(compact);
}
