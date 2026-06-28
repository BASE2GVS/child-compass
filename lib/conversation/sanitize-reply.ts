/** Remove memory-dump phrasing from visible replies — memory influences, never announces. */
const MEMORY_DUMP_PATTERNS = [
  /On \d{4}-\d{2}-\d{2}[^.!?]*[.!?]?/gi,
  /Timeline \([^)]+\):[^.!?]*[.!?]?/gi,
  /Pattern we've noticed[^.!?]*[.!?]?/gi,
  /Known triggers for[^.!?]*[.!?]?/gi,
  /From [^']+'s data:[^.!?]*[.!?]?/gi,
  /Strategies that have helped[^.!?]*[.!?]?/gi,
  /Recent win:[^.!?]*[.!?]?/gi,
  /Recent challenge:[^.!?]*[.!?]?/gi,
  /Earlier in this conversation you asked about:[^.!?]*[.!?]?/gi,
  /We're still building[^.!?]*[.!?]?/gi,
  /Continuing from our earlier messages[^.!?]*[.!?]?/gi,
  /Building on what you said about[^.!?]*[.!?]?/gi,
];

const MEMORY_OPENER_PATTERNS = [
  /^One thing I've been learning about[^.!?]*[.!?]?\s*/i,
  /^I've started noticing that[^.!?]*[.!?]?\s*/i,
  /^I'm beginning to understand that[^.!?]*[.!?]?\s*/i,
  /^This seems important for[^.!?]*[.!?]?\s*/i,
  /^Yesterday[^.!?]*[.!?]?\s*/i,
  /^On \w+day[^.!?]*[.!?]?\s*/i,
  /^Earlier you told me[^.!?]*[.!?]?\s*/i,
  /^Timeline[^.!?]*[.!?]?\s*/i,
];

const BANNED_EMOTION_PHRASES = [
  /I know exactly how you feel/gi,
  /I totally understand/gi,
];

export function sanitizeForNaturalConversation(text: string): string {
  if (!text?.trim()) return "";

  let result = text;
  for (const pattern of MEMORY_DUMP_PATTERNS) {
    result = result.replace(pattern, "");
  }
  for (const pattern of MEMORY_OPENER_PATTERNS) {
    result = result.replace(pattern, "");
  }
  for (const pattern of BANNED_EMOTION_PHRASES) {
    result = result.replace(pattern, "");
  }

  return result.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

const TEMPLATE_HEADERS =
  /^(Something you could try|Phrases to avoid|A gentle next step|Looking ahead|One thought for you|When you're ready|Understanding|Why this might happen|Suggested wording)\s*$/im;

export function hasTemplateHeaders(text: string): boolean {
  return TEMPLATE_HEADERS.test(text);
}
