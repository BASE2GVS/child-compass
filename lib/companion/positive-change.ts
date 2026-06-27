import type { ChildContext } from "@/lib/types/database";

export function noticePositiveChange(context: ChildContext): string | null {
  const name = context.child.nickname || context.child.first_name;
  const checkins = context.recentCheckins;
  if (checkins.length < 2) return null;

  const today = checkins[0];
  const prior = checkins.slice(1, 4);

  const avgMood = prior.reduce((s, c) => s + (c.mood ?? 3), 0) / prior.length;
  const avgAnxiety = prior.reduce((s, c) => s + (c.anxiety ?? 3), 0) / prior.length;

  if ((today.mood ?? 3) > avgMood + 0.5) {
    return `I've noticed ${name}'s mood has been a little steadier lately.`;
  }

  if ((today.anxiety ?? 3) < avgAnxiety - 0.5) {
    return `${name} seems a touch less anxious compared to recent days — that's worth noticing.`;
  }

  if (today.wins?.length && !prior[0]?.wins?.length) {
    return `You recorded a win today — "${today.wins[0].slice(0, 60)}" — that matters.`;
  }

  if ((today.school_rating ?? 3) > (prior[0]?.school_rating ?? 3)) {
    return `School felt a bit more manageable for ${name} today than recently.`;
  }

  const improvingPattern = context.patterns.find((p) =>
    p.description.toLowerCase().includes("improv"),
  );
  if (improvingPattern) {
    return `I've noticed mornings have become a little calmer for ${name}.`;
  }

  return null;
}
