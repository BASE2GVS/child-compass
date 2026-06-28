import type { RetrievedMemoryItem } from "@/lib/conversation-engine/memory-ranking";

export function formatCompactMemory(items: RetrievedMemoryItem[]): string {
  if (!items.length) {
    return "Relevant memory:\n(none selected — respond from the parent's message and conversation only)";
  }

  const lines = items.map((item) => `• ${item.text}`);
  return `Relevant memory (integrate silently — never list or cite sources in your reply):\n${lines.join("\n")}`;
}

export function formatCompactMemoryForTrace(items: RetrievedMemoryItem[]): string[] {
  return items.map((i) => `[${i.category}] ${i.text}`);
}
