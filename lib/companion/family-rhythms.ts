export type FamilyRhythmType =
  | "school_morning"
  | "sunday_evening"
  | "weekend"
  | "therapy_day"
  | "holiday_week";

export type FamilyRhythmContext = {
  type: FamilyRhythmType;
  label: string;
};

export function detectFamilyRhythm(date = new Date()): FamilyRhythmContext | null {
  const day = date.getDay();
  const hour = date.getHours();
  const month = date.getMonth();
  const dom = date.getDate();

  if (day === 0 && hour >= 16) {
    return { type: "sunday_evening", label: "Sunday evening" };
  }

  if (day >= 1 && day <= 5 && hour < 11) {
    return { type: "school_morning", label: "school morning" };
  }

  if (day === 0 || day === 6) {
    return { type: "weekend", label: "the weekend" };
  }

  if (month === 11 && dom >= 20) {
    return { type: "holiday_week", label: "the holiday season" };
  }

  if (month === 6 || month === 7) {
    return { type: "holiday_week", label: "the school break" };
  }

  return null;
}

export function buildRhythmNote(
  rhythm: FamilyRhythmContext,
  childName: string,
): string | null {
  switch (rhythm.type) {
    case "school_morning":
      return `${rhythm.label}s can ask a lot of ${childName} — we'll take it gently.`;
    case "sunday_evening":
      return `${rhythm.label} is often when the week ahead sits on your mind — I'm here if it helps.`;
    case "weekend":
      return `Weekends have their own rhythm for ${childName} — no rush today.`;
    case "therapy_day":
      return `Therapy days can take something out of everyone — extra gentleness may help.`;
    case "holiday_week":
      return `Transitions and holidays can stir things up for ${childName} — we can go slowly.`;
    default:
      return null;
  }
}

export function detectTherapyDayFromMessage(message: string): boolean {
  return /therapy|therapist|appointment|session/i.test(message);
}
