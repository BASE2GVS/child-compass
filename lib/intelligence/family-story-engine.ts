import type { ChildContext } from "@/lib/types/database";

export type StoryCategory =
  | "Progress"
  | "Ongoing challenge"
  | "Parent emotion"
  | "Child strength"
  | "Child struggle"
  | "Family relationship"
  | "Successful strategy"
  | "Unsuccessful strategy"
  | "Important milestone"
  | "Current concern";

export type StorySignal = {
  category: StoryCategory;
  text: string;
  source:
    | "checkin_win"
    | "checkin_challenge"
    | "checkin_note"
    | "pattern"
    | "memory"
    | "debrief"
    | "profile_strength"
    | "profile_strategy"
    | "timeline";
};

const PARENT_EMOTION = /\b(overwhelmed|exhausted|worried|afraid|guilty|shaken|discouraged|alone|drained|spiraling|failing|grief|grieving)\b/i;
const TURNING_POINT = /\b(finally|first time|for the first time|better today|steady|steadier|asked for help|recovered faster|win|progress)\b/i;
const SETBACK = /\b(setback|regress|slid|again|fell apart|backslide|meltdown|shutdown|hard day)\b/i;
const RELATIONSHIP = /\b(partner|co-parent|husband|wife|grandparent|grandma|grandad|sibling|brother|sister|family)\b/i;

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function compactSentence(text: string, max = 130): string {
  const t = normalize(text);
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function pickTop(items: string[], count: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (!item || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= count) break;
  }
  return out;
}

function scoreNeedForStory(
  context: ChildContext,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[],
): number {
  const parentTurns = conversationHistory.filter((m) => m.role === "parent").length;
  const explicitStoryAsk =
    /\b(lately|again|still|this week|this month|progress|setback|backslide|for months|what's changing|what are we missing)\b/i.test(
      parentMessage,
    );
  const dataDepth =
    Math.min(context.recentCheckins.length, 10) +
    Math.min(context.patterns.length, 4) +
    Math.min(context.recentDebriefs.length, 5);

  let score = 0;
  if (explicitStoryAsk) score += 3;
  if (parentTurns >= 4) score += 2;
  if ((context.dataSpanDays ?? 0) >= 14) score += 2;
  if (dataDepth >= 8) score += 2;
  if (parentMessage.length < 35 && !explicitStoryAsk) score -= 1;
  return score;
}

function classifyMemoryLine(line: string): StoryCategory {
  const lower = line.toLowerCase();
  if (TURNING_POINT.test(lower)) return "Progress";
  if (SETBACK.test(lower)) return "Current concern";
  if (/\b(quiet|recovery|calm|regulate|co-regulated|countdown|visual timer|choice)\b/i.test(lower)) {
    return "Successful strategy";
  }
  if (/\b(didn't work|did not work|made it worse|backfired|failed)\b/i.test(lower)) {
    return "Unsuccessful strategy";
  }
  if (/\b(school|sleep|sensory|transition|morning|bedtime)\b/i.test(lower)) {
    return "Ongoing challenge";
  }
  return "Current concern";
}

export function buildStorySignals(context: ChildContext, memoryItems: string[] = []): StorySignal[] {
  const out: StorySignal[] = [];

  for (const strength of context.profile?.strengths ?? []) {
    out.push({ category: "Child strength", text: strength, source: "profile_strength" });
  }

  for (const strategy of context.profile?.successful_strategies ?? []) {
    out.push({ category: "Successful strategy", text: strategy, source: "profile_strategy" });
  }
  for (const strategy of context.profile?.calming_strategies ?? []) {
    out.push({ category: "Successful strategy", text: strategy, source: "profile_strategy" });
  }

  for (const p of context.patterns) {
    out.push({ category: "Ongoing challenge", text: p.description, source: "pattern" });
  }

  for (const c of context.recentCheckins.slice(0, 8)) {
    for (const win of c.wins ?? []) {
      out.push({
        category: TURNING_POINT.test(win) ? "Important milestone" : "Progress",
        text: win,
        source: "checkin_win",
      });
    }
    for (const challenge of c.challenges ?? []) {
      out.push({ category: "Child struggle", text: challenge, source: "checkin_challenge" });
      out.push({ category: "Current concern", text: challenge, source: "checkin_challenge" });
      if (/\b(didn't work|did not work|backfired|made it worse)\b/i.test(challenge)) {
        out.push({
          category: "Unsuccessful strategy",
          text: challenge,
          source: "checkin_challenge",
        });
      }
    }
    if (c.notes?.trim()) {
      const note = c.notes.trim();
      out.push({
        category: PARENT_EMOTION.test(note) ? "Parent emotion" : "Current concern",
        text: note,
        source: "checkin_note",
      });
    }
  }

  for (const d of context.recentDebriefs.slice(0, 8)) {
    out.push({ category: "Current concern", text: d.parent_message, source: "debrief" });
    if (PARENT_EMOTION.test(d.parent_message)) {
      out.push({ category: "Parent emotion", text: d.parent_message, source: "debrief" });
    }
    if (RELATIONSHIP.test(d.parent_message)) {
      out.push({ category: "Family relationship", text: d.parent_message, source: "debrief" });
    }
    if (TURNING_POINT.test(d.parent_message)) {
      out.push({ category: "Important milestone", text: d.parent_message, source: "debrief" });
    }
    if (d.likely_trigger) {
      out.push({ category: "Child struggle", text: d.likely_trigger, source: "debrief" });
    }
  }

  for (const m of memoryItems) {
    const category = classifyMemoryLine(m);
    out.push({ category, text: m, source: "memory" });
  }

  return out;
}

function topByCategory(signals: StorySignal[], category: StoryCategory, limit: number): string[] {
  const list = signals
    .filter((s) => s.category === category)
    .map((s) => compactSentence(s.text));
  return pickTop(list, limit);
}

function renderClause(items: string[], fallback: string): string {
  if (!items.length) return fallback;
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function trimToWordWindow(text: string, minWords: number, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}.`;
}

export function buildCurrentFamilyChapter(
  context: ChildContext,
  memoryItems: string[] = [],
): { chapter: string; signals: StorySignal[] } {
  const name = context.child.nickname || context.child.first_name;
  const signals = buildStorySignals(context, memoryItems);

  const progress = topByCategory(signals, "Progress", 2);
  const milestones = topByCategory(signals, "Important milestone", 2);
  const challenges = topByCategory(signals, "Ongoing challenge", 2);
  const struggles = topByCategory(signals, "Child struggle", 2);
  const parentEmotion = topByCategory(signals, "Parent emotion", 2);
  const strengths = topByCategory(signals, "Child strength", 2);
  const helpful = topByCategory(signals, "Successful strategy", 2);
  const unhelpful = topByCategory(signals, "Unsuccessful strategy", 1);
  const relationships = topByCategory(signals, "Family relationship", 1);
  const concerns = topByCategory(signals, "Current concern", 2);

  const chapter = [
    `Right now, this family is in a chapter of trying to make daily life feel steadier for ${name}, especially around ${renderClause(
      challenges.length ? challenges : concerns,
      "the moments that keep becoming heavy",
    )}.`,
    `There are signs of real movement: ${renderClause(
      progress.length || milestones.length ? [...progress, ...milestones].slice(0, 3) : ["small wins are showing up more often"],
      "small wins are showing up more often",
    )}.`,
    `What is still hard is ${renderClause(
      struggles.length ? struggles : concerns,
      "how quickly hard moments can return after a better day",
    )}, and that can make progress feel fragile even when it is real.`,
    `Emotionally, the parent is carrying ${renderClause(
      parentEmotion,
      "a heavy mix of worry, fatigue, and pressure to get it right",
    )}, while still continuing to show up with care.`,
    `What has helped is ${renderClause(
      helpful,
      "keeping demands lower and using predictable, gentle structure",
    )}${unhelpful.length ? `, and it is worth remembering that ${unhelpful[0]} has not helped.` : "."}`,
    `What should not be forgotten is ${name}'s strengths in ${renderClause(
      strengths,
      "adaptation and connection",
    )}${relationships.length ? `, and the role of family relationships such as ${relationships[0]}` : ""}.`,
  ].join(" ");

  return {
    chapter: trimToWordWindow(chapter, 150, 260),
    signals,
  };
}

export function shouldInjectFamilyChapter(
  context: ChildContext,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[],
): boolean {
  if (process.env.FAMILY_STORY_ENGINE_DISABLED === "1") return false;

  const score = scoreNeedForStory(context, parentMessage, conversationHistory);
  if (score >= 5) return true;

  const explicitContinuity =
    /\b(again|still|lately|this week|this month|progress|setback|backslide|for months|pattern)\b/i.test(
      parentMessage,
    );
  if (explicitContinuity && score >= 3) return true;

  // Deterministic cadence to avoid injecting the chapter in every turn.
  const seed = `${parentMessage}|${conversationHistory.length}|${context.recentCheckins[0]?.checkin_date ?? ""}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return score >= 4 && h % 3 === 0;
}
