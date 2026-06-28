import type { ChildContext, DebriefResponse } from "@/lib/types/database";
import type { CoachMode } from "@/lib/ai/coach-mode";
import type { CuriousEnrichment } from "@/lib/companion/curious-companion";
import { classifyParentNeed } from "@/lib/conversation/parent-need";
import { selectConversationStyle } from "@/lib/conversation/conversation-style";
import { formatNaturalReply } from "@/lib/conversation/natural-reply";
import { needsProfessionalHelp } from "@/lib/conversation/safety";
import { extractPriorAdviceTopics } from "@/lib/companion/conversation-memory";

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

  return formatNaturalReply(
    response,
    context,
    parentMessage,
    conversationHistory,
    styleWithSafety,
    enrichment,
  );
}
