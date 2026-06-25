import type { ChildContext } from "@/lib/types/database";
import { formatKnowledgeForPrompt } from "@/lib/knowledge/engine";

const DEBRIEF_SYSTEM = `You are Child Compass™, a warm, neurodiversity-affirming parenting assistant.
Respond ONLY with valid JSON matching this schema:
{
  "likely_trigger": "string",
  "behaviour_explanation": "string",
  "emotional_interpretation": "string",
  "suggested_response": "string",
  "things_not_to_say": ["string"],
  "tomorrow_plan": "string",
  "long_term_recommendation": "string",
  "confidence_level": 0.0-1.0,
  "follow_up_questions": ["string"]
}
Be compassionate, practical, and never blame the child. Avoid clinical jargon.`;

export function buildDebriefPrompt(parentMessage: string, context: ChildContext): string {
  const name = context.child.nickname || context.child.first_name;
  const checkinSummary = context.recentCheckins
    .slice(0, 7)
    .map(
      (c) =>
        `${c.checkin_date}: sleep ${c.sleep_quality}/5, mood ${c.mood}/5, anxiety ${c.anxiety}/5, school ${c.school_rating}/5`,
    )
    .join("\n");

  const patternSummary = context.patterns
    .map((p) => `- ${p.title}: ${p.description}`)
    .join("\n");

  const memorySummary =
    context.memoryReferences.length > 0
      ? context.memoryReferences.map((m) => `- ${m}`).join("\n")
      : "No dated family memories yet — only use patterns and check-ins above.";

  const triggerList = context.profile?.known_triggers?.join(", ") || "none recorded";
  const strategies = context.profile?.calming_strategies?.join(", ") || "none recorded";

  return `Child: ${name}
Diagnosis: ${context.child.diagnosis.join(", ") || "not specified"}
Support needs: ${context.child.support_needs.join(", ") || "not specified"}
School: ${context.child.school || "not specified"}
Known triggers: ${triggerList}
Calming strategies: ${strategies}
Strengths: ${context.profile?.strengths?.join(", ") || "not specified"}

Recent check-ins (last 7 days):
${checkinSummary || "No check-ins yet"}

Detected patterns:
${patternSummary || "No patterns detected yet"}

Family memories (ONLY reference these when relevant — never invent history):
${memorySummary}

Knowledge graph relationships (from this family's data):
${context.graphInsights?.length ? context.graphInsights.map((i) => `- ${i}`).join("\n") : "Still forming — more check-ins will reveal relationships."}

Evidence-based guidance (versioned knowledge pack — do not invent facts beyond this):
${context.knowledgeGuidance?.length ? context.knowledgeGuidance.map((g) => `- ${g}`).join("\n") : formatKnowledgeForPrompt([])}

Recent debriefs:
${context.recentDebriefs.map((d) => `- ${d.parent_message.slice(0, 120)}`).join("\n") || "None"}

Parent message today:
"${parentMessage}"

Provide personalised guidance for this parent about ${name}.`;
}

export function buildInsightPrompt(
  childName: string,
  checkinData: string,
  patterns: string,
): string {
  return `Analyse the following data for ${childName} and generate ONE actionable parenting insight.
Write in warm, reassuring language (2-3 sentences). Focus on what the parent can do today.

Check-in data:
${checkinData}

Patterns:
${patterns}

Respond with JSON: { "title": "short headline", "content": "insight text", "confidence": 0.0-1.0, "insight_type": "daily|pattern|recommendation" }`;
}

export function buildWeeklySummaryPrompt(childName: string, weekData: string): string {
  return `Create a weekly summary for ${childName}'s parent.
Data from the past 7 days:
${weekData}

Respond with JSON:
{
  "headline": "string",
  "highlights": ["string"],
  "challenges": ["string"],
  "recommendations": ["string"],
  "regulation_trend": "improving|stable|declining"
}`;
}

export { DEBRIEF_SYSTEM };
