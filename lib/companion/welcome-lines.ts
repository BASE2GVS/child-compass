import type { EditorialVariant } from "@/components/editorial/environment-variants";
import type { DayPhase } from "@/lib/companion/daily-rhythm";

export type WelcomeContext = {
  parentName?: string | null;
  childName?: string | null;
  variant: EditorialVariant;
  phase?: DayPhase;
  /** Whole days since last visit (0 = same day or first visit) */
  daysAway: number;
};

function firstName(name?: string | null): string {
  if (!name?.trim()) return "there";
  return name.trim().split(/\s+/)[0]!;
}

function pick<T>(items: T[], seed: number): T {
  return items[Math.abs(seed) % items.length]!;
}

/** One subtle welcome line — varies by day, never nags on every click */
export function pickWelcomeLine(ctx: WelcomeContext): string {
  const parent = firstName(ctx.parentName);
  const child = ctx.childName?.trim() || "your child";
  const daySeed = new Date().getDate() + new Date().getMonth() * 31 + ctx.variant.length;

  if (ctx.daysAway >= 14) {
    return pick(
      [
        `Good to see you again, ${parent}.`,
        `You're back — let's take today one step at a time.`,
        `${parent}, we've kept your place warm.`,
      ],
      daySeed,
    );
  }

  if (ctx.daysAway >= 2) {
    return pick(
      [
        "Welcome back.",
        "It's good to see you.",
        "Let's continue where we left off.",
      ],
      daySeed,
    );
  }

  if (ctx.variant === "today") {
    if (ctx.phase === "morning") {
      return pick(
        [
          `Good morning, ${parent}.`,
          "A new day — we'll take it gently.",
          "Here when you're ready.",
        ],
        daySeed,
      );
    }
    if (ctx.phase === "evening") {
      return pick(
        [
          `Good evening, ${parent}.`,
          "Let's close the day gently.",
          "You made it through today.",
        ],
        daySeed,
      );
    }
    return pick(
      [
        `Hello, ${parent}.`,
        "We're here with you today.",
        "One step at a time.",
      ],
      daySeed,
    );
  }

  const byVariant: Partial<Record<EditorialVariant, string[]>> = {
    coach: [
      "I'm listening.",
      "What's on your mind?",
      "Take your time.",
    ],
    child: [
      `Thinking of ${child} today.`,
      "Your child's story keeps growing.",
      "Here's what we know so far.",
    ],
    checkin: [
      "Whenever you're ready.",
      "No rush — share what feels true.",
      "How was today?",
    ],
    track: [
      "Your story together.",
      "Every moment you've shared matters.",
      "Look back whenever it helps.",
    ],
    documents: [
      "What you've learned, ready to share.",
      "Your family's words, in one place.",
      "Take what you need.",
    ],
    school: [
      "Home and school, side by side.",
      "Teachers are partners, not judges.",
      "Share what helps.",
    ],
    therapy: [
      "What supports your child.",
      "Every small win counts.",
      "You're doing important work.",
    ],
    health: [
      "How they've been feeling.",
      "Gentle notes, over time.",
      "Trust what you notice.",
    ],
    settings: [
      "Make this yours.",
      "Your family, your way.",
      "Only what you need.",
    ],
    help: [
      "You're not alone.",
      "Ask anything — we'll walk you through it.",
      "We're here.",
    ],
    search: [
      "Let's find it together.",
      "What do you need?",
      "I'll help you look.",
    ],
  };

  const pool = byVariant[ctx.variant] ?? ["Good to see you."];
  return pick(pool, daySeed);
}
