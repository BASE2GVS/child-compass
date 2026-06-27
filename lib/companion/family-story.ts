import type { ChildContext } from "@/lib/types/database";

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.abs(Math.floor((db - da) / 86400000));
}

function hasImprovingTrend(context: ChildContext): boolean {
  const checkins = context.recentCheckins;
  if (checkins.length < 4) return false;

  const recent = checkins.slice(0, 2);
  const older = checkins.slice(-2);
  const recentMood = recent.reduce((s, c) => s + (c.mood ?? 3), 0) / recent.length;
  const olderMood = older.reduce((s, c) => s + (c.mood ?? 3), 0) / older.length;
  const recentAnxiety = recent.reduce((s, c) => s + (c.anxiety ?? 3), 0) / recent.length;
  const olderAnxiety = older.reduce((s, c) => s + (c.anxiety ?? 3), 0) / older.length;

  return recentMood > olderMood + 0.3 || recentAnxiety < olderAnxiety - 0.3;
}

export function buildFamilyStoryMoment(context: ChildContext): string | null {
  const name = context.child.nickname || context.child.first_name;
  const checkins = context.recentCheckins;
  if (checkins.length < 3) return null;

  const dates = checkins.map((c) => c.checkin_date).sort();
  const spanDays = daysBetween(dates[0], dates[dates.length - 1]);
  if (spanDays < 7) return null;

  const earlyHard = checkins.slice(-2).every(
    (c) => (c.mood ?? 3) <= 2 || (c.anxiety ?? 3) >= 4,
  );
  const improving = hasImprovingTrend(context);

  if (earlyHard && improving) {
    return `A few weeks ago, ${name}'s days looked heavier — I've noticed how far you've come together since then.`;
  }

  const earlyWins = checkins.slice(-3).flatMap((c) => c.wins ?? []);
  const recentWins = checkins.slice(0, 3).flatMap((c) => c.wins ?? []);
  if (recentWins.length > earlyWins.length && recentWins.length >= 2) {
    return `When we first started building a picture of your days, wins were harder to find — they're showing up more often now.`;
  }

  const timelineSpan =
    context.recentTimeline.length >= 2
      ? daysBetween(
          context.recentTimeline[context.recentTimeline.length - 1].date,
          context.recentTimeline[0].date,
        )
      : 0;

  if (timelineSpan >= 21 && improving) {
    return `Looking back over the past month, there's a real sense of your family finding its footing — not perfectly, but genuinely.`;
  }

  return null;
}
