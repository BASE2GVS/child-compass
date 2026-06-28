import type { ParentFeeling } from "@/lib/conversation/parent-emotion";
import {
  pickCompanionOpening,
  isGenericOpening,
  isCelebrationOpening,
  type OpeningMood,
} from "@/lib/voice/openings";

const AI_LANGUAGE_PATTERNS: RegExp[] = [
  /I've noticed that[^.!?]*[.!?]?\s*/gi,
  /I've noticed[^.!?]*[.!?]?\s*/gi,
  /Based on your information[^.!?]*[.!?]?\s*/gi,
  /Based on (?:the |your )?(?:data|information)[^.!?]*[.!?]?\s*/gi,
  /The data suggests[^.!?]*[.!?]?\s*/gi,
  /According to your timeline[^.!?]*[.!?]?\s*/gi,
  /Known triggers?[:\s][^.!?]*[.!?]?\s*/gi,
  /Patterns? indicate[^.!?]*[.!?]?\s*/gi,
  /This behaviour may[^.!?]*[.!?]?\s*/gi,
  /This behavior may[^.!?]*[.!?]?\s*/gi,
  /We have identified[^.!?]*[.!?]?\s*/gi,
  /The assessment shows[^.!?]*[.!?]?\s*/gi,
  /From (?:\w+'s )?data[^.!?]*[.!?]?\s*/gi,
  /Pattern we've noticed[^.!?]*[.!?]?\s*/gi,
  /We're still learning[^.!?]*[.!?]?\s*/gi,
  /We're still building[^.!?]*[.!?]?\s*/gi,
  /This may indicate[^.!?]*[.!?]?\s*/gi,
  /There are several possibilities[^.!?]*[.!?]?\s*/gi,
  /Beneath today's situation[^.!?]*[.!?]?\s*/gi,
  /may be communicating an unmet need[^.!?]*[.!?]?\s*/gi,
  /may be feeling overwhelmed or unable[^.!?]*[.!?]?\s*/gi,
  /nervous system is elevated[^.!?]*[.!?]?\s*/gi,
  /protective response — not necessarily defiance[^.!?]*[.!?]?\s*/gi,
  /Only seen this a couple of times[^.!?]*[.!?]?\s*/gi,
  /I'd like to understand it better before calling it a pattern[^.!?]*[.!?]?\s*/gi,
  /I wonder whether a few factors overlapped[^.!?]*[.!?]?\s*/gi,
  /I'm here whenever you need to pick this up again[^.!?]*[.!?]?\s*/gi,
  /I've started noticing that[^.!?]*[.!?]?\s*/gi,
  /One thing I've been learning about[^.!?]*[.!?]?\s*/gi,
  /I'm beginning to understand that[^.!?]*[.!?]?\s*/gi,
  /This seems important for[^.!?]*[.!?]?\s*/gi,
  /This feels similar to[^.!?]*[.!?]?\s*/gi,
  /There's an echo here of[^.!?]*[.!?]?\s*/gi,
  /This connects to[^.!?]*[.!?]?\s*/gi,
  /What stands out to me is[^.!?]*[.!?]?\s*/gi,
  /Something I'm sitting with is[^.!?]*[.!?]?\s*/gi,
  /One thread could be[^.!?]*[.!?]?\s*/gi,
  /Something that might be at play is[^.!?]*[.!?]?\s*/gi,
  /We're still early in learning[^.!?]*[.!?]?\s*/gi,
  /We've only seen this a couple of times[^.!?]*[.!?]?\s*/gi,
  /This could be related to a few different things[^.!?]*[.!?]?\s*/gi,
  /may be overwhelmed or unable[^.!?]*[.!?]?\s*/gi,
  /nervous system was already under strain[^.!?]*[.!?]?\s*/gi,
  /With [^.!?]* PDA profile[^.!?]*[.!?]?\s*/gi,
  /perceived demands[^.!?]*[.!?]?\s*/gi,
  /automatic threat response[^.!?]*[.!?]?\s*/gi,
  /Use declarative language instead of direct requests[^.!?]*[.!?]?\s*/gi,
  /Offer indirect choices[^.!?]*[.!?]?\s*/gi,
  /Allow recovery time without discussion[^.!?]*[.!?]?\s*/gi,
  /this family responds well when[^.!?]*[.!?]?\s*/gi,
  /has come up before[^.!?]*[.!?]?\s*/gi,
  /For \w+ specifically:[^.!?]*[.!?]?\s*/gi,
  /Sunday evening is often when[^.!?]*[.!?]?\s*/gi,
  /Timeline \([^)]+\):[^.!?]*[.!?]?\s*/gi,
  /On \d{4}-\d{2}-\d{2}[^.!?]*[.!?]?\s*/gi,
  /Strategies that have helped[^.!?]*[.!?]?\s*/gi,
  /Earlier in this conversation you asked about[^.!?]*[.!?]?\s*/gi,
  /Building on what you said about[^.!?]*[.!?]?\s*/gi,
  /Continuing from our earlier messages[^.!?]*[.!?]?\s*/gi,
  /I'm not sure yet —[^.!?]*[.!?]?\s*/gi,
  /I'm still forming a picture[^.!?]*[.!?]?\s*/gi,
  /I could be wrong —[^.!?]*[.!?]?\s*/gi,
  /I'm not certain yet, but[^.!?]*[.!?]?\s*/gi,
];

const PHRASE_REPLACEMENTS: [RegExp, string][] = [
  [/One thought —/gi, "One thing that might be worth trying —"],
  [/Something you could try/gi, "One thing that might be worth trying"],
  [/Suggested strategy/gi, "One thing that might be worth trying"],
  [/Strategy:/gi, "Something worth trying:"],
  [/Recommendation:/gi, "Something families often find helpful:"],
  [/Based on previous observations/gi, "From what you've shared before"],
  [/The data suggests/gi, "I wonder if"],
  [/Known trigger/gi, "something that tends to set things off"],
  [/your child\b/gi, "__CHILD__"],
  [/Your child\b/g, "__CHILD__"],
  [/Do not /g, "Don't "],
  [/Cannot /g, "Can't "],
  [/It is /g, "It's "],
  [/That is /g, "That's "],
  [/I am /g, "I'm "],
  [/We are /g, "We're "],
  [/Let us /g, "Let's "],
  [
    /Thank you for telling me that — it helps me understand we may need to think about this differently\./gi,
    "Thank you — that helps me see we might need a different angle.",
  ],
];

const BANNED_SENTENCE_RE =
  /started noticing|been learning about|beginning to understand|feels similar to|PDA profile|perceived demands|declarative language|indirect choices|recovery time without|nervous system|could be related to a few different|this family responds well|has come up before|may be overwhelmed or unable|For \w+ specifically|known trigger|pattern we've noticed|visual preparation|Sunday evening is often|data suggests|assessment shows|we have identified|patterns indicate/i;

function filterBannedSentences(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const kept = sentences.filter((s) => !BANNED_SENTENCE_RE.test(s));
  return kept.join(" ").trim();
}

function repairFragments(text: string, childName: string): string {
  const nameEsc = childName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .replace(/\bWe've\s+(?=[A-Z])/g, "")
    .replace(/\bWe're\s+(?=[A-Z])/g, "")
    .replace(new RegExp(`\\b${nameEsc}\\s+${nameEsc}\\b`, "gi"), childName)
    .replace(new RegExp(`\\b${nameEsc}\\s+With\\b`, "gi"), "")
    .replace(/\.\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function dropBrokenSentences(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const kept = sentences.filter((s) => {
    const t = s.trim();
    if (t.length < 12) return false;
    if (/^We've\s/i.test(t) && t.split(/\s+/).length < 6) return false;
    if (/^Amy\s+Amy/i.test(t)) return false;
    return true;
  });
  return kept.join(" ").trim();
}

function dedupeParagraphs(text: string): string {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of paragraphs) {
    const key = p.trim().toLowerCase().slice(0, 50);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p.trim());
  }
  return unique.join("\n\n");
}

const FILLER_PATTERNS = [
  /\bIt could be that\b/gi,
  /\bIt may be that\b/gi,
  /\bThere are several possibilities\b/gi,
  /\bThis may indicate\b/gi,
];

export type VoiceOptions = {
  childName: string;
  parentMessage: string;
  conversationHistory?: { role: string; content: string }[];
  parentFeeling?: ParentFeeling | null;
  maxWords?: number;
};

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function feelingToMood(feeling?: ParentFeeling | null): OpeningMood {
  if (!feeling) return "neutral";
  if (feeling === "proud" || feeling === "hopeful") return "celebration";
  if (
    ["exhausted", "overwhelmed", "heartbroken", "frustrated", "guilty", "upset", "lonely"].includes(
      feeling,
    )
  ) {
    return "heavy";
  }
  return "neutral";
}

function stripAiLanguage(text: string): string {
  let result = text;
  for (const pattern of AI_LANGUAGE_PATTERNS) {
    result = result.replace(pattern, "");
  }
  for (const pattern of FILLER_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result;
}

function applyPhraseReplacements(text: string, childName: string): string {
  let result = text;
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/__CHILD__/g, childName);
}

function varyOpening(
  text: string,
  seed: string,
  priorAssistant: string[],
  mood: OpeningMood,
): string {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  if (!paragraphs.length) return text;

  const first = paragraphs[0].trim();
  if (isCelebrationOpening(first)) return text;
  if (!isGenericOpening(first)) return text;

  paragraphs[0] = pickCompanionOpening(seed, priorAssistant, mood);
  return paragraphs.join("\n\n");
}

function trimToWordLimit(text: string, maxWords: number): string {
  if (wordCount(text) <= maxWords) return text;

  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  const questionIdx = paragraphs.findIndex((p) => p.trim().endsWith("?"));

  while (paragraphs.length > 1 && wordCount(paragraphs.join("\n\n")) > maxWords) {
    let removeIdx = paragraphs.length - 1;
    if (removeIdx === questionIdx && paragraphs.length > 1) {
      removeIdx = paragraphs.length - 2;
    }
    if (removeIdx < 1) break;
    paragraphs.splice(removeIdx, 1);
  }

  let result = paragraphs.join("\n\n");
  if (wordCount(result) > maxWords) {
    const words = result.split(/\s+/);
    result = words.slice(0, maxWords).join(" ");
    if (!result.endsWith(".") && !result.endsWith("?")) result += "…";
  }

  return result;
}

function cleanWhitespace(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ \./g, ".")
    .trim();
}

function polishParagraphs(text: string, childName: string): string {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  return paragraphs
    .map((p) => dropBrokenSentences(filterBannedSentences(p)))
    .map((p) => repairFragments(p, childName))
    .filter((p) => p.trim().length > 0)
    .join("\n\n");
}

export function applyCompanionVoice(text: string, options: VoiceOptions): string {
  if (!text?.trim()) return text;

  const priorAssistant = (options.conversationHistory ?? [])
    .filter((m) => m.role === "assistant")
    .map((m) => m.content);

  const seed =
    options.parentMessage + priorAssistant.map((t) => t.slice(0, 20)).join("") + text.length;
  const mood = feelingToMood(options.parentFeeling);
  const maxWords = options.maxWords ?? 220;

  let result = stripAiLanguage(text);
  result = applyPhraseReplacements(result, options.childName);
  result = polishParagraphs(result, options.childName);
  result = dedupeParagraphs(result);
  result = varyOpening(result, seed, priorAssistant, mood);
  result = trimToWordLimit(result, maxWords);
  result = cleanWhitespace(result);

  return result;
}

export function hasAiLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "i've noticed",
    "based on your information",
    "the data suggests",
    "known triggers",
    "patterns indicate",
    "we have identified",
    "the assessment shows",
    "we're still learning",
  ].some((p) => lower.includes(p));
}
