import type { DayPhase } from "@/lib/companion/daily-rhythm";

export type GentlePrompt = {
  id: string;
  message: string;
  href: string;
  cta: string;
};

export function gentlePromptStorageKey(date = new Date()): string {
  return `cc-gentle-dismissed-${date.toISOString().split("T")[0]}`;
}

export function buildGentlePrompt(input: {
  phase: DayPhase;
  childId: string;
  childName: string;
  hasCheckinToday: boolean;
  talkedToday: boolean;
  dismissedIds: string[];
  hour?: number;
}): GentlePrompt | null {
  const hour = input.hour ?? new Date().getHours();
  const qs = `?child=${input.childId}`;

  const candidates: GentlePrompt[] = [];

  if (input.phase === "day" && !input.hasCheckinToday && hour >= 11 && hour < 16) {
    candidates.push({
      id: "checkin-invite",
      message: `Would it help to tell me how today went for ${input.childName}?`,
      href: `/check-in${qs}`,
      cta: "When you're ready",
    });
  }

  if (input.phase === "day" && input.hasCheckinToday && !input.talkedToday && hour >= 12) {
    candidates.push({
      id: "talk-offer",
      message: "Would it help to talk about how the day is going?",
      href: `/coach${qs}`,
      cta: "Talk together",
    });
  }

  if (input.phase === "day" && hour >= 15 && hour < 18) {
    candidates.push({
      id: "tomorrow-prep",
      message: "Would you like to think about tomorrow — gently, without pressure?",
      href: `/coach${qs}&q=${encodeURIComponent("Help me think about tomorrow")}`,
      cta: "Think about tomorrow",
    });
  }

  const available = candidates.find((c) => !input.dismissedIds.includes(c.id));
  return available ?? null;
}
