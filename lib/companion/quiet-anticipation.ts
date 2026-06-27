import type { ChildContext } from "@/lib/types/database";

function schoolAhead(date = new Date()): { ahead: boolean; when: string } {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDay();
  const todayDay = date.getDay();

  if (tomorrowDay >= 1 && tomorrowDay <= 5) {
    return { ahead: true, when: "tomorrow" };
  }
  if (todayDay === 0) {
    return { ahead: true, when: "tomorrow" };
  }
  if (todayDay === 5) {
    return { ahead: true, when: "Monday" };
  }
  return { ahead: false, when: "tomorrow" };
}

export function buildQuietAnticipation(
  context: ChildContext,
  hour = new Date().getHours(),
  date = new Date(),
): string | null {
  if (hour < 15) return null;

  const name = context.child.nickname || context.child.first_name;
  const { ahead, when } = schoolAhead(date);
  if (!ahead) return null;

  const schoolPattern = context.patterns.some(
    (p) =>
      p.category === "school" ||
      p.description.toLowerCase().includes("morning") ||
      p.description.toLowerCase().includes("school"),
  );

  const checkin = context.recentCheckins[0];
  const poorSleep = (checkin?.sleep_quality ?? 3) <= 2;
  const highAnxiety = (checkin?.anxiety ?? 3) >= 4;
  const whenCap = when.charAt(0).toUpperCase() + when.slice(1);

  if (schoolPattern && (poorSleep || highAnxiety)) {
    return `${whenCap} may ask a little more emotional energy from ${name} — only a gentle thought, not a prediction.`;
  }

  if (schoolPattern) {
    return `I'm wondering if school might feel a little challenging ${when} — would it help to prepare together?`;
  }

  if (poorSleep) {
    return `After a rough night, mornings can feel heavier — we can think about ${when} gently if you'd like.`;
  }

  return null;
}
