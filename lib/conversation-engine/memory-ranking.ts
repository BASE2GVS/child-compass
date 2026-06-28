import type { ChildContext } from "@/lib/types/database";
import type { FamilyBrainSnapshot } from "@/lib/intelligence/family-brain";
import { selectBrainContextForMessage } from "@/lib/intelligence/family-brain";
import type { MessageIntent } from "@/lib/conversation-engine/understand-message";

export type RetrievedMemoryItem = {
  category: string;
  text: string;
  score: number;
};

const MAX_MEMORY_ITEMS = 3;

function scoreTerms(text: string, message: string): number {
  const terms = message.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const lower = text.toLowerCase();
  return terms.filter((t) => lower.includes(t)).length;
}

function addCandidate(
  pool: RetrievedMemoryItem[],
  category: string,
  text: string,
  baseScore: number,
  message: string,
) {
  if (!text?.trim()) return;
  pool.push({ category, text: text.trim(), score: baseScore + scoreTerms(text, message) });
}

export function rankAndRetrieveMemory(
  message: string,
  context: ChildContext,
  intent: MessageIntent,
): RetrievedMemoryItem[] {
  if (intent === "presence" || intent === "emotional_support" || intent === "information" || intent === "celebration") {
    return [];
  }

  const pool: RetrievedMemoryItem[] = [];
  const brain = (context as ChildContext & { _familyBrain?: FamilyBrainSnapshot })._familyBrain;

  if (context.profile?.known_triggers?.length) {
    for (const trigger of context.profile.known_triggers) {
      addCandidate(pool, "profile_trigger", trigger, 2, message);
    }
  }

  if (context.profile?.calming_strategies?.length) {
    for (const strategy of context.profile.calming_strategies) {
      addCandidate(pool, "calming_strategy", strategy, 2, message);
    }
  }

  if (context.profile?.successful_strategies?.length) {
    for (const strategy of context.profile.successful_strategies) {
      addCandidate(pool, "successful_strategy", strategy, 2, message);
    }
  }

  for (const pattern of context.patterns.slice(0, 3)) {
    addCandidate(pool, "pattern", pattern.description, 2, message);
  }

  if (context.recentCheckins[0]) {
    const c = context.recentCheckins[0];
    addCandidate(
      pool,
      "recent_checkin",
      `Recent day: mood ${c.mood ?? "?"}/5, sleep ${c.sleep_quality ?? "?"}/5, anxiety ${c.anxiety ?? "?"}/5`,
      1,
      message,
    );
  }

  if (brain) {
    const selected = selectBrainContextForMessage(brain, message, 2);
    for (const line of selected.memoryLines) {
      addCandidate(pool, "family_brain", line.replace(/^On \w+[^:]*:\s*/i, "").replace(/^Yesterday:\s*/i, ""), 2, message);
    }
    for (const line of selected.insightLines.slice(0, 1)) {
      addCandidate(pool, "family_insight", line, 1, message);
    }
  }

  const deduped = new Map<string, RetrievedMemoryItem>();
  for (const item of pool.sort((a, b) => b.score - a.score)) {
    const key = item.text.slice(0, 80).toLowerCase();
    if (!deduped.has(key)) deduped.set(key, item);
  }

  return [...deduped.values()].slice(0, MAX_MEMORY_ITEMS);
}

export { MAX_MEMORY_ITEMS };
