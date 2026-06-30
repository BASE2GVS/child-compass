import {
  TALK_V2_CONTRACT_VERSION,
  type FamilyContext,
  type FamilyContextCompleteness,
  type FamilyContextRequest,
} from "@/lib/talk-v2/contracts";
import { fetchContextData } from "@/lib/talk-v2/context/context-repository";
import { rankRelevantMemories } from "@/lib/talk-v2/context/memory-ranking";
import { buildFamilyStory } from "@/lib/talk-v2/context/family-story";
import { detectContextIntents } from "@/lib/talk-v2/context/intent-detection";
import { detectConversationState } from "@/lib/talk-v2/context/conversation-state";
import { selectContextByIntent } from "@/lib/talk-v2/context/context-selection";
import { TALK_V2_SAFETY_RULES } from "@/lib/talk-v2/safety/safety-rules";

type BuildFamilyContextInput = FamilyContextRequest & {
  supabase: any;
};

function toCompleteness(context: Omit<FamilyContext, "completeness">): FamilyContextCompleteness {
  const sections: Array<{ key: keyof Omit<FamilyContextCompleteness, "missingSections" | "coveragePercent">; hasData: boolean }> = [
    { key: "childProfile", hasData: Boolean(context.childProfile) },
    { key: "recentConversation", hasData: context.recentConversation.length > 0 },
    { key: "dailyCheckins", hasData: context.dailyCheckins.length > 0 },
    { key: "timelineHighlights", hasData: context.timelineHighlights.length > 0 },
    { key: "behaviourPatterns", hasData: context.behaviourPatterns.length > 0 },
    { key: "relevantMemories", hasData: context.relevantMemories.length > 0 },
    { key: "familyStory", hasData: Boolean(context.familyStory) },
    { key: "safetyRules", hasData: context.safetyRules.length > 0 },
  ];

  const missingSections = sections.filter((s) => !s.hasData).map((s) => s.key);
  const coveragePercent = Math.round(((sections.length - missingSections.length) / sections.length) * 100);

  return {
    childProfile: sections[0].hasData ? "complete" : "empty",
    recentConversation: sections[1].hasData ? "complete" : "empty",
    dailyCheckins: sections[2].hasData ? "complete" : "empty",
    timelineHighlights: sections[3].hasData ? "complete" : "empty",
    behaviourPatterns: sections[4].hasData ? "complete" : "empty",
    relevantMemories: sections[5].hasData ? "complete" : "empty",
    familyStory: sections[6].hasData ? "complete" : "empty",
    safetyRules: sections[7].hasData ? "complete" : "empty",
    missingSections,
    coveragePercent,
  };
}

export async function buildFamilyContext(input: BuildFamilyContextInput): Promise<FamilyContext> {
  const detectedIntents = detectContextIntents(input.parentMessage);

  const fetched = await fetchContextData({
    supabase: input.supabase,
    childId: input.childId,
    sessionId: input.sessionId,
  });

  const childProfile = fetched.child
    ? {
        childId: fetched.child.id,
        firstName: fetched.child.first_name,
        nickname: fetched.child.nickname,
        diagnosis: fetched.child.diagnosis || [],
        supportNeeds: fetched.child.support_needs || [],
        school: fetched.child.school,
        grade: fetched.child.grade,
        strengths: fetched.profile?.strengths || [],
        knownTriggers: fetched.profile?.known_triggers || [],
        calmingStrategies: fetched.profile?.calming_strategies || [],
        successfulStrategies: fetched.profile?.successful_strategies || [],
        challenges: fetched.profile?.challenges || [],
      }
    : null;

  const recentConversationAll = fetched.recentConversation.map((m) => ({
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
  }));

  const dailyCheckinsAll = fetched.dailyCheckins.map((c) => ({
    date: c.checkin_date,
    sleepQuality: c.sleep_quality,
    mood: c.mood,
    anxiety: c.anxiety,
    schoolRating: c.school_rating,
    wins: c.wins || [],
    challenges: c.challenges || [],
    notes: c.notes,
  }));

  const timelineHighlightsAll = fetched.timelineHighlights.map((t) => ({
    date: t.event_date,
    type: t.event_type,
    title: t.title,
    description: t.description,
  }));

  const behaviourPatternsAll = fetched.behaviourPatterns.map((p) => ({
    category: p.category,
    title: p.title,
    description: p.description,
    confidence: p.confidence,
  }));

  const conversationState = detectConversationState({
    parentMessage: input.parentMessage,
    intents: detectedIntents,
    recentConversation: recentConversationAll,
    timelineHighlights: timelineHighlightsAll,
  });

  const selected = selectContextByIntent({
    intents: detectedIntents,
    conversationState: conversationState.detectedState,
    recentConversation: recentConversationAll,
    dailyCheckins: dailyCheckinsAll,
    timelineHighlights: timelineHighlightsAll,
    behaviourPatterns: behaviourPatternsAll,
    recentDebriefs: fetched.recentDebriefs,
  });

  const relevantMemories = rankRelevantMemories({
    parentMessage: input.parentMessage,
    profile: fetched.profile,
    patterns: selected.behaviourPatterns,
    checkins: selected.dailyCheckins,
    timeline: selected.timelineHighlights,
    debriefs: selected.recentDebriefs,
  });

  const familyStory = buildFamilyStory({
    profile: fetched.profile,
    checkins: selected.dailyCheckins,
    timeline: selected.timelineHighlights,
    patterns: selected.behaviourPatterns,
    debriefs: selected.recentDebriefs,
  });

  const base: Omit<FamilyContext, "completeness"> = {
    version: TALK_V2_CONTRACT_VERSION,
    childId: input.childId,
    sessionId: input.sessionId,
    childProfile,
    recentConversation: selected.recentConversation,
    dailyCheckins: selected.dailyCheckins,
    timelineHighlights: selected.timelineHighlights,
    behaviourPatterns: selected.behaviourPatterns,
    relevantMemories,
    familyStory,
    conversationState,
    safetyRules: TALK_V2_SAFETY_RULES,
    selectionMetadata: selected.metadata,
  };

  return {
    ...base,
    completeness: toCompleteness(base),
  };
}
