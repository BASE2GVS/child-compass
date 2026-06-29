import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { CoachMode } from "@/lib/ai/coach-mode";
import type { CuriousEnrichment } from "@/lib/companion/curious-companion";
import { classifyParentNeed } from "@/lib/conversation/parent-need";
import { selectConversationStyle } from "@/lib/conversation/conversation-style";
import { formatNaturalReply } from "@/lib/conversation/natural-reply";
import { needsProfessionalHelp } from "@/lib/conversation/safety";
import { extractPriorAdviceTopics } from "@/lib/companion/conversation-memory";
import { applyCompanionVoice } from "@/lib/voice";

function hasAny(text: string, re: RegExp): boolean {
  return re.test(text);
}

function softenInstructionalLanguage(text: string): string {
  return text
    .replace(/\bYou should\b/gi, "I wonder whether")
    .replace(/\bYou need to\b/gi, "It may help to")
    .replace(/\bTry to\b/gi, "If it feels manageable, see whether you can")
    .replace(/\bStart by\b/gi, "One way to begin is")
    .replace(/\bYou could\b/gi, "I wonder whether you might")
    .replace(/\bIf it helps\b/gi, "If that feels manageable")
    .replace(/\bnext step\b/gi, "next gentle move");
}

function ensureCompanionSequence(text: string, need: string): string {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const first = paragraphs[0] ?? "";
  const merged = paragraphs.join(" ");

  const hasPresence = hasAny(first, /\b(hard|heavy|makes sense|you're not alone|i hear|that sounds|i'm here)\b/i);
  const hasUnderstanding = hasAny(merged, /\b(what may be happening|what matters now|right now|likely|in this moment)\b/i);
  const hasAgency = hasAny(merged, /\b(one (?:gentle|small) (?:step|thing)|next step|if it helps|tonight)\b/i);
  const hasHope = hasAny(merged, /\b(tomorrow|when you're ready|we can build|small win|one steadier moment|possible)\b/i);

  const out = [...paragraphs];

  if (!hasPresence) {
    out.unshift("That sounds really hard, and it makes sense this feels heavy right now. You're not alone in this.");
  } else if (!hasAny(first, /\b(you're not alone|i'm here)\b/i)) {
    out[0] = `${first} You're not alone in this.`.trim();
  }

  if (!hasUnderstanding && need !== "celebration" && need !== "presence_only") {
    out.splice(
      Math.min(1, out.length),
      0,
      "What may be happening right now is that everyone is running on low capacity, so even small demands can feel much bigger. What matters now is one steadier moment, not a perfect fix.",
    );
  }

  if (!hasAgency || !hasHope) {
    out.push(
      "One gentle step tonight is to lower demands and keep one predictable action you can both manage. Tomorrow can feel a little steadier with one small step.",
    );
  } else if (!hasHope) {
    out.push("Tomorrow can feel a little steadier with one small step.");
  }

  if (out.length < 3) {
    out.splice(
      1,
      0,
      "We'll keep this simple and focused on what matters most right now.",
    );
  }

  const groundedClose =
    "One small thing for tonight might be to lower pressure around one moment that usually gets stuck. Tomorrow could be a little steadier, and we can build from that.";

  const softened = out.map((p) => softenInstructionalLanguage(p));
  const withClose = softened.slice(0, 3);
  if (
    withClose.length &&
    hasAny(
      withClose[withClose.length - 1],
      /\b(one (?:gentle|small) (?:step|thing)|tonight|tomorrow|if that feels manageable|next gentle move|you might|try|start by)\b/i,
    )
  ) {
    withClose.pop();
  }
  withClose.push(groundedClose);

  return withClose.slice(0, 4).join("\n\n");
}

export { needsProfessionalHelp } from "@/lib/conversation/safety";

export function formatCoachResponse(
  response: DebriefResponse,
  context: ChildContext,
  _memoryReference: string | null,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[] = [],
  mode: CoachMode = "coaching",
  enrichment?: CuriousEnrichment,
): string {
  const need =
    enrichment?.parentNeed ??
    classifyParentNeed(parentMessage, { conversationHistory });

  const priorAdvice = extractPriorAdviceTopics(conversationHistory);
  const repeatAdvice = priorAdvice.some((a) =>
    response.suggested_response.toLowerCase().includes(a.toLowerCase().slice(0, 30)),
  );

  const style =
    enrichment?.conversationStyle ??
    selectConversationStyle(need, {
      lowConfidence: response.confidence_level < 0.55,
      repeatAdvice,
    });

  const styleWithSafety = needsProfessionalHelp(parentMessage)
    ? { ...style, includeProfessionalHelp: true }
    : style;

  const raw = formatNaturalReply(
    response,
    context,
    parentMessage,
    conversationHistory,
    styleWithSafety,
    enrichment,
  );
  const sequenced = ensureCompanionSequence(raw, need);

  const childName = context.child.nickname || context.child.first_name;

  return applyCompanionVoice(sequenced, {
    childName,
    parentMessage,
    conversationHistory,
    parentFeeling: enrichment?.parentStory?.parentFeeling ?? null,
    maxWords: 220,
  });
}
