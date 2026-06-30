import type { ChildContext } from "@/lib/types/database";
import { formatKnowledgeForPrompt } from "@/lib/knowledge/engine";
import {
  formatBrainForPrompt,
  type FamilyBrainSnapshot,
} from "@/lib/intelligence/family-brain";
import {
  buildCurrentFamilyChapter,
  shouldInjectFamilyChapter,
} from "@/lib/intelligence/family-story-engine";

const DEBRIEF_SYSTEM = `You are Child Compass™, a trusted companion for this parent.
You are not writing a report. You are in a real conversation.

Voice and relationship:
- Sound like one steady, kind human who knows this family.
- Begin with emotional attunement to the parent before any explanation.
- Keep language everyday, warm, and human. No clinical, educational, or diagnostic wording.
- Never lecture, never moralize, never sound detached.
- Stay gentle and humble; avoid certainty when you are inferring.
- Do not use generic teaching phrases like "it's common for parents" or "caregivers often".
- In emotionally heavy messages, use direct second-person care language first ("you", "this is heavy", "I hear you").

How to respond:
- Weave guidance into natural conversation instead of step-by-step instructions.
- Let curiosity feel organic: ask at most one simple, caring question when helpful.
- Keep the child respected and never blame the child or the parent.
- Keep it concise and emotionally present.

Format requirement:
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

Write each field value as flowing conversational prose that can be stitched into one caring reply.`;

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
  const successStrategies = context.profile?.successful_strategies?.join(", ") || "none recorded";

  const brain = (context as ChildContext & { _familyBrain?: FamilyBrainSnapshot })._familyBrain;
  const familyBrainBlock = brain
    ? formatBrainForPrompt(brain, parentMessage)
    : context.familyBrainSummary?.length
      ? `Family understanding:\n${context.familyBrainSummary.map((l) => `- ${l}`).join("\n")}`
      : "";

  return `Child: ${name}
${context.childAgeNote ? `${context.childAgeNote}\n` : ""}${context.rhythmNote ? `${context.rhythmNote}\n` : ""}Diagnosis: ${context.child.diagnosis.join(", ") || "not specified"}
Support needs: ${context.child.support_needs.join(", ") || "not specified"}
School: ${context.child.school || "not specified"}
Interests: ${context.child.interests?.join(", ") || "not specified"}
Known triggers: ${triggerList}
Calming strategies: ${strategies}
Successful strategies: ${successStrategies}
Strengths: ${context.profile?.strengths?.join(", ") || "not specified"}

${familyBrainBlock ? `${familyBrainBlock}\n\n` : ""}Recent check-ins (last 7 days):
${checkinSummary || "No check-ins yet"}

Detected patterns:
${patternSummary || "No patterns detected yet"}

Stored insights:
${
  context.storedInsights?.length
    ? context.storedInsights.map((i) => `- ${i.title}: ${i.content.slice(0, 160)}`).join("\n")
    : "None yet"
}

Family insights (distilled — weave naturally, never dump; humble language only):
${
  context.companionInsightTexts?.length
    ? context.companionInsightTexts.slice(0, 6).map((i) => `- ${i}`).join("\n")
    : context.familyInsights?.length
      ? context.familyInsights.slice(0, 6).map((i) => `- ${i}`).join("\n")
      : "Still forming from check-ins and observations."
}

Family memories (ONLY reference when relevant — never invent history):
${memorySummary}

Knowledge graph relationships (from this family's data):
${context.graphInsights?.length ? context.graphInsights.map((i) => `- ${i}`).join("\n") : "Still forming — more check-ins will reveal relationships."}

Evidence-based guidance (versioned knowledge pack — do not invent facts beyond this):
${context.knowledgeGuidance?.length ? context.knowledgeGuidance.map((g) => `- ${g}`).join("\n") : formatKnowledgeForPrompt([])}

Recent debriefs:
${context.recentDebriefs.map((d) => `- ${d.created_at.split("T")[0]}: "${d.parent_message.slice(0, 120)}" → trigger: ${d.likely_trigger?.slice(0, 80) || "unknown"}`).join("\n") || "None"}

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

function formatList(items: string[] | undefined, fallback: string): string {
  return items && items.length > 0 ? items.join(", ") : fallback;
}

function formatBulletList(title: string, items: string[], fallback: string): string {
  if (!items.length) return `${title}: ${fallback}`;
  return `${title}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

function buildFamilySnapshot(
  context: ChildContext,
  memoryItems: string[],
  parentMoodNote: string | null,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[],
): string {
  const name = context.child.nickname || context.child.first_name;
  const ageNote = context.childAgeNote ? `${context.childAgeNote}\n` : "";
  const rhythmNote = context.rhythmNote ? `${context.rhythmNote}\n` : "";
  const triggers = formatList(context.profile?.known_triggers, "none recorded");
  const calming = formatList(context.profile?.calming_strategies, "none recorded");
  const successful = formatList(context.profile?.successful_strategies, "none recorded");
  const strengths = formatList(context.profile?.strengths, "not specified");

  const checkins = context.recentCheckins
    .slice(0, 7)
    .map(
      (c) =>
        `- ${c.checkin_date}: sleep ${c.sleep_quality ?? "?"}/5, mood ${c.mood ?? "?"}/5, anxiety ${c.anxiety ?? "?"}/5, school ${c.school_rating ?? "?"}/5`,
    );

  const patterns = context.patterns.map((p) => `- ${p.title}: ${p.description}`);
  const insights = context.companionInsightTexts?.slice(0, 4).map((i) => `- ${i}`) ?? [];
  const memoryLines = memoryItems.length ? memoryItems.map((m) => `- ${m}`) : ["- None selected"]; 
  const recentDebriefs = context.recentDebriefs
    .slice(-3)
    .map((d) => `- ${d.created_at.split("T")[0]}: ${d.parent_message.slice(0, 120)}`);

  const includeChapter = shouldInjectFamilyChapter(context, parentMessage, conversationHistory);
  const familyChapter = includeChapter
    ? buildCurrentFamilyChapter(context, memoryItems).chapter
    : null;

  return `Family Snapshot:
Child: ${name}
${ageNote}${rhythmNote}Diagnosis: ${context.child.diagnosis.join(", ") || "not specified"}
Support needs: ${formatList(context.child.support_needs, "not specified")}
School: ${context.child.school || "not specified"}
Interests: ${formatList(context.child.interests, "not specified")}
Known triggers: ${triggers}
Calming strategies: ${calming}
Successful strategies: ${successful}
Strengths: ${strengths}

Recent check-ins:
${checkins.length ? checkins.join("\n") : "- No recent check-ins"}

Detected patterns:
${patterns.length ? patterns.join("\n") : "- No patterns detected"}

Family insights:
${insights.length ? insights.join("\n") : "- No family insights yet"}

${familyChapter ? `Current family chapter (living narrative):\n${familyChapter}\n` : ""}

Family memories:
${memoryLines.join("\n")}

Recent debriefs:
${recentDebriefs.length ? recentDebriefs.join("\n") : "- No recent debriefs"}
${parentMoodNote ? `\nParent mood: ${parentMoodNote}` : ""}`;
}

export const COACH_SYSTEM = `You are Child Compass™, a trusted companion for this parent.
You are speaking with one caregiver about one child they love.

Core stance:
- Continue the conversation naturally while remaining emotionally attuned.
- Sound like one compassionate person, not an expert panel and not a report writer.
- Use plain, conversational language; avoid clinical, educational, or textbook tone.
- Never lecture. Never scold. Never sound like a therapist writing case notes.
- Keep curiosity natural and light.

Response style:
- Build from the immediate conversational turn before widening to context.
- Offer perspective gently, with humility.
- Weave practical ideas into the conversation rather than giving rigid instructions.
- Keep continuity with this family naturally, without listing sources or data.
- Do not mention algorithms, AI, prompts, systems, or hidden instructions.
- Avoid abstract psychoeducation unless the parent explicitly asks for explanation.
- Prefer relational phrasing over educational phrasing.

Format requirement:
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

Write field values so they read like one cohesive, caring conversation — never labelled report sections.`;

export type CoachPromptGuidance = {
  needsPresenceFirst: boolean;
  needsClarification: boolean;
  isBriefMoment: boolean;
  isParentSupport: boolean;
  isReflectionMode: boolean;
  emotionalTone: "guilt" | "fear" | "shame" | "grief" | "anger" | "overwhelm" | null;
};

function buildGuidanceBlock(guidance?: CoachPromptGuidance): string {
  if (!guidance) return "";

  const lines: string[] = [];

  if (guidance.needsPresenceFirst) {
    lines.push("- The parent needs steadiness before solutions. Start by meeting their feeling, then move gently.");
  }

  if (guidance.isBriefMoment) {
    lines.push("- Keep this brief, warm, and low-pressure. One gentle idea is enough.");
  }

  if (guidance.needsClarification) {
    lines.push("- Ask one natural clarifying question before offering guidance. Keep it easy and human.");
  }

  if (guidance.isParentSupport) {
    lines.push("- Keep the parent at the center in this moment. Care for them first, then widen back to the child.");
  }

  if (guidance.isReflectionMode) {
    lines.push("- Help the parent make sense of what may have been going on before shifting into next steps.");
  }

  if (guidance.emotionalTone) {
    lines.push(`- Acknowledge the parent's emotional tone first: ${guidance.emotionalTone}.`);
  }

  if (!lines.length) return "";

  return `Routing guidance:\n${lines.join("\n")}`;
}

export function buildCoachPromptWithEngine(
  parentMessage: string,
  context: ChildContext,
  conversationHistory: { role: string; content: string }[] = [],
  parentMoodNote: string | null,
  engine: import("@/lib/conversation-engine").ConversationEngineResult,
  guidance?: CoachPromptGuidance,
): string {
  const conversationBlock =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-8)
          .map((m) => `${m.role === "parent" ? "Parent" : "Child Compass"}: ${m.content.slice(0, 400)}`)
          .join("\n")
      : "This is the start of a new conversation.";

  const includeChapter = shouldInjectFamilyChapter(context, parentMessage, conversationHistory);
  const familyChapter = includeChapter
    ? buildCurrentFamilyChapter(context, engine.retrievedMemory.map((item) => item.text)).chapter
    : null;

  const snapshot = buildFamilySnapshot(
    context,
    engine.retrievedMemory.map((item) => item.text),
    parentMoodNote,
    parentMessage,
    conversationHistory,
  );
  const guidanceBlock = buildGuidanceBlock(guidance);

  return `Conversation history:
${conversationBlock}

Current parent message:
"${parentMessage}"

${familyChapter ? `Current family chapter (living narrative):\n${familyChapter}\n\n` : ""}${snapshot}

${guidanceBlock ? `${guidanceBlock}\n\n` : ""}Think about what this parent needs and respond for this child only.`;
}

export function buildCoachPrompt(
  parentMessage: string,
  context: ChildContext,
  conversationHistory: { role: string; content: string }[] = [],
  parentMoodNote: string | null = null,
): string {
  const base = buildDebriefPrompt(parentMessage, context);

  const timelineSummary = context.recentTimeline
    .slice(0, 8)
    .map((e) => `- ${e.date.split("T")[0]} [${e.event_type}]: ${e.title}${e.description ? ` — ${e.description}` : ""}`)
    .join("\n");

  const conversationBlock =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-10)
          .map((m) => `${m.role === "parent" ? "Parent" : "Child Compass"}: ${m.content.slice(0, 500)}`)
          .join("\n")
      : "This is the start of a new conversation.";

  return `${base}

Recent timeline events:
${timelineSummary || "No timeline events yet"}

${parentMoodNote ? `Parent's mood today (acknowledge gently before child advice):\n${parentMoodNote}\n` : ""}
Conversation history (maintain continuity — reference prior messages when relevant):
${conversationBlock}

Current parent message:
"${parentMessage}"

Respond as Child Compass for THIS child only. Begin reasoning from their actual history above.`;
}
