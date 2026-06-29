import type { ChildContext } from "@/lib/types/database";

type ThemeKey = "morning" | "school" | "sleep" | "sensory" | "transition" | "meltdown";

const THEME_PATTERNS: Record<ThemeKey, RegExp> = {
  morning: /\b(morning|breakfast|drop[- ]?off|before school|rush(ed|ing)?)\b/i,
  school: /\b(school|teacher|class|homework|attendance|refus(al|e))\b/i,
  sleep: /\b(sleep|bedtime|night|wake|tired|exhausted)\b/i,
  sensory: /\b(sensory|noise|loud|crowd(ed)?|bright|overwhelm(ed|ing)?)\b/i,
  transition: /\b(transition|switch|change|leave|leaving|stop|stopping)\b/i,
  meltdown: /\b(meltdown|shutdown|explod(ed|ing)|spiral)\b/i,
};

const THEME_LABEL: Record<ThemeKey, string> = {
  morning: "mornings",
  school: "school-related moments",
  sleep: "sleep and bedtime",
  sensory: "sensory overload moments",
  transition: "transitions",
  meltdown: "meltdown cycles",
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

function detectTheme(text: string): ThemeKey | null {
  const value = text.toLowerCase();
  for (const key of Object.keys(THEME_PATTERNS) as ThemeKey[]) {
    if (THEME_PATTERNS[key].test(value)) return key;
  }
  return null;
}

function repeatedChallengeTheme(context: ChildContext): ThemeKey | null {
  const counts = new Map<ThemeKey, number>();
  const recent = context.recentCheckins.slice(0, 6);

  for (const checkin of recent) {
    const lines = [...(checkin.challenges ?? []), checkin.notes ?? ""];
    for (const line of lines) {
      const theme = detectTheme(line);
      if (!theme) continue;
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || ranked[0][1] < 2) return null;
  return ranked[0][0];
}

function progressSignal(context: ChildContext): string | null {
  const recent = context.recentCheckins;
  if (recent.length < 3) return null;

  const today = recent[0];
  const prior = recent.slice(1, 4);
  const avgMood = prior.reduce((sum, c) => sum + (c.mood ?? 3), 0) / prior.length;
  const avgAnxiety = prior.reduce((sum, c) => sum + (c.anxiety ?? 3), 0) / prior.length;
  const avgDemand = prior.reduce((sum, c) => sum + (c.demand_tolerance ?? 3), 0) / prior.length;

  if ((today.mood ?? 3) >= avgMood + 0.6) {
    return "There is a small upward shift here, even if the day still felt messy.";
  }
  if ((today.anxiety ?? 3) <= avgAnxiety - 0.6) {
    return "I can see a subtle easing in the anxiety load compared with recent days.";
  }
  if ((today.demand_tolerance ?? 3) >= avgDemand + 0.7) {
    return "Capacity seems to be inching up a little, which is meaningful progress.";
  }

  return null;
}

function setbackSignal(context: ChildContext): string | null {
  const recent = context.recentCheckins;
  if (recent.length < 3) return null;

  const today = recent[0];
  const yesterday = recent[1];
  const hadRecentWin = recent.slice(1, 4).some((c) => (c.wins?.length ?? 0) > 0);

  if (!hadRecentWin) return null;

  const moodDrop = (today.mood ?? 3) <= (yesterday.mood ?? 3) - 1;
  const anxietySpike = (today.anxiety ?? 3) >= (yesterday.anxiety ?? 3) + 1;
  if (!moodDrop && !anxietySpike) return null;

  return "A setback after progress can feel especially discouraging, and it still fits the long arc of change.";
}

export function buildRelationshipSignal(
  context: ChildContext,
  parentMessage: string,
  conversationHistory: { role: string; content: string }[],
): string | null {
  if (process.env.RELATIONSHIP_INTELLIGENCE_DISABLED === "1") return null;

  const parentTurns = conversationHistory.filter((m) => m.role === "parent").length;
  if (parentTurns < 2) return null;

  const continuityAsked =
    /\b(again|still|lately|this week|yesterday|today|regress(ed|ion)?|setback|progress|better|worse)\b/i.test(
      parentMessage,
    );

  const cadenceSeed = `${parentMessage}|${parentTurns}|${context.recentCheckins[0]?.checkin_date ?? ""}`;
  const cadenceHit = hashSeed(cadenceSeed) % 3 === 0;
  if (!continuityAsked && !cadenceHit) return null;

  const setback = setbackSignal(context);
  if (setback) return setback;

  const progress = progressSignal(context);
  if (progress) return progress;

  const repeated = repeatedChallengeTheme(context);
  if (repeated) {
    return `I can see how ${THEME_LABEL[repeated]} keep showing up in this season, and that repetition is exhausting.`;
  }

  if (parentTurns >= 6 && (context.dataSpanDays ?? 0) >= 10) {
    return "You've kept showing up through hard days and calmer days, and that consistency is building trust over time.";
  }

  return null;
}
