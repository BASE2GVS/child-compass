import type { ChildContext } from "@/lib/types/database";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import {
  understandMessage,
  type MessageIntent,
  type ConversationEngineInput,
} from "@/lib/conversation-engine/understand-message";
import {
  classifyPriority,
  type ConversationPriority,
} from "@/lib/conversation-engine/priority-engine";
import {
  rankAndRetrieveMemory,
  type RetrievedMemoryItem,
  MAX_MEMORY_ITEMS,
} from "@/lib/conversation-engine/memory-ranking";
import {
  formatCompactMemory,
  formatCompactMemoryForTrace,
} from "@/lib/conversation-engine/compact-memory";

export type ConversationEngineResult = {
  intent: MessageIntent;
  priority: ConversationPriority;
  retrievedMemory: RetrievedMemoryItem[];
  compactMemoryBlock: string;
  trace: {
    memoryCount: number;
    maxAllowed: number;
    items: string[];
  };
};

export function runConversationEngine(
  message: string,
  context: ChildContext,
  options?: {
    conversationHistory?: { role: string; content: string }[];
    parentMood?: ParentMood | null;
    preferReflection?: boolean;
  },
): ConversationEngineResult {
  const input: ConversationEngineInput = {
    message,
    conversationHistory: options?.conversationHistory ?? [],
    parentMood: options?.parentMood ?? null,
    preferReflection: options?.preferReflection,
  };

  const intent = understandMessage(input);
  const priority = classifyPriority(message, intent);
  const retrievedMemory = rankAndRetrieveMemory(message, context, intent);
  const compactMemoryBlock = formatCompactMemory(retrievedMemory);

  return {
    intent,
    priority,
    retrievedMemory,
    compactMemoryBlock,
    trace: {
      memoryCount: retrievedMemory.length,
      maxAllowed: MAX_MEMORY_ITEMS,
      items: formatCompactMemoryForTrace(retrievedMemory),
    },
  };
}

export { buildUrgentSafetyResponse } from "@/lib/conversation-engine/urgent-response";
export type { MessageIntent } from "@/lib/conversation-engine/understand-message";
export type { ConversationPriority } from "@/lib/conversation-engine/priority-engine";
export type { RetrievedMemoryItem } from "@/lib/conversation-engine/memory-ranking";
export { MAX_MEMORY_ITEMS } from "@/lib/conversation-engine/memory-ranking";
