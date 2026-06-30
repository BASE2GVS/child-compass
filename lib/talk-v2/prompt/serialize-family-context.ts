import type { FamilyContext } from "@/lib/talk-v2/contracts";

function formatList(items: string[]): string {
  if (!items.length) return "none";
  return items.join(", ");
}

function extractSessionCorrections(context: FamilyContext): string[] {
  const corrections: string[] = [];

  for (const turn of context.recentConversation) {
    if (turn.role !== "parent") continue;
    const text = turn.content.trim();
    if (!text) continue;

    const lower = text.toLowerCase();
    const looksLikeCorrection =
      lower.includes("does not") ||
      lower.includes("doesn't") ||
      lower.includes("is not") ||
      lower.includes("isn't") ||
      lower.includes("not like") ||
      lower.startsWith("no,") ||
      lower.includes("actually") ||
      lower.includes("instead");

    if (looksLikeCorrection) corrections.push(text);
  }

  const unique = Array.from(new Set(corrections));
  return unique.slice(-6);
}

export function serializeFamilyContext(context: FamilyContext): string {
  const profile = context.childProfile;
  const corrections = extractSessionCorrections(context);

  const lines: string[] = [
    "[Child Anchor]",
    `child_id: ${context.childId}`,
    `name: ${profile?.firstName || "unknown"}`,
    `nickname: ${profile?.nickname || "none"}`,
    `diagnosis: ${formatList(profile?.diagnosis || [])}`,
    `support_needs: ${formatList(profile?.supportNeeds || [])}`,
    `strengths: ${formatList(profile?.strengths || [])}`,
    `known_triggers: ${formatList(profile?.knownTriggers || [])}`,
    `calming_strategies: ${formatList(profile?.calmingStrategies || [])}`,
    `successful_strategies: ${formatList(profile?.successfulStrategies || [])}`,
    `challenges: ${formatList(profile?.challenges || [])}`,
    "",
    "[Session Corrections From Parent]",
    corrections.length ? corrections.map((item, index) => `${index + 1}. ${item}`).join("\n") : "none",
    "",
    "[Conversation State]",
    `state: ${context.conversationState.detectedState}`,
    `confidence: ${context.conversationState.confidence}`,
    `reasoning_code: ${context.conversationState.reasoningCode}`,
    "",
    "[Recent Conversation]",
    context.recentConversation.length
      ? context.recentConversation
          .map((turn) => `${turn.role}: ${turn.content}`)
          .join("\n")
      : "none",
    "",
    "[Relevant Memories]",
    context.relevantMemories.length
      ? context.relevantMemories
          .map((memory, index) => `${index + 1}. (${memory.source}) ${memory.text}`)
          .join("\n")
      : "none",
    "",
    "[Behaviour Patterns]",
    context.behaviourPatterns.length
      ? context.behaviourPatterns
          .map((pattern, index) => `${index + 1}. ${pattern.title}: ${pattern.description}`)
          .join("\n")
      : "none",
    "",
    "[Daily Checkins]",
    context.dailyCheckins.length
      ? context.dailyCheckins
          .map(
            (checkin, index) =>
              `${index + 1}. ${checkin.date} wins=${formatList(checkin.wins)} challenges=${formatList(checkin.challenges)} notes=${checkin.notes || "none"}`,
          )
          .join("\n")
      : "none",
    "",
    "[Timeline Highlights]",
    context.timelineHighlights.length
      ? context.timelineHighlights
          .map(
            (item, index) =>
              `${index + 1}. ${item.date} ${item.type}: ${item.title}${item.description ? ` (${item.description})` : ""}`,
          )
          .join("\n")
      : "none",
    "",
    "[Family Story Signals]",
    context.familyStory?.signals?.length
      ? context.familyStory.signals
          .map((signal, index) => `${index + 1}. ${signal.kind}: ${signal.text}`)
          .join("\n")
      : "none",
    "",
    "[Selection Metadata]",
    `detected_intents: ${formatList(context.selectionMetadata.detectedIntents)}`,
    `selected_sources: ${formatList(context.selectionMetadata.selectedContextSources)}`,
    `omitted_sources: ${formatList(context.selectionMetadata.omittedContextSources)}`,
  ];

  return lines.join("\n");
}
