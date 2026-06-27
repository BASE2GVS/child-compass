export type ParentMood =
  | "okay"
  | "difficult"
  | "exhausted"
  | "worried"
  | "need_to_talk"
  | "skipped";

export const PARENT_MOOD_OPTIONS: { id: ParentMood; label: string }[] = [
  { id: "okay", label: "I'm okay" },
  { id: "difficult", label: "Today was difficult" },
  { id: "exhausted", label: "I'm exhausted" },
  { id: "worried", label: "I'm worried" },
  { id: "need_to_talk", label: "I just need to talk" },
];

export function parentMoodStorageKey(date = new Date()): string {
  return `cc-parent-mood-${date.toISOString().split("T")[0]}`;
}

export function parentMoodAcknowledgement(mood: ParentMood, parentName: string, childName: string): string {
  switch (mood) {
    case "okay":
      return `Thank you for checking in with yourself, ${parentName}. That steadiness helps you and ${childName}.`;
    case "difficult":
      return "Today sounds heavy. You don't have to hold it alone — I'm here to help you think it through.";
    case "exhausted":
      return "Exhaustion is real, and it counts. Let's keep things simple today — small steps only.";
    case "worried":
      return "Worry makes sense when you care this much. Tell me what's on your mind when you're ready.";
    case "need_to_talk":
      return "I'm listening. You can talk about yourself, about your child, or about both — whatever you need.";
    default:
      return "";
  }
}

export function parentMoodForPrompt(mood: ParentMood | null | undefined): string | null {
  if (!mood || mood === "skipped") return null;
  const map: Record<Exclude<ParentMood, "skipped">, string> = {
    okay: "The parent said they are feeling okay today.",
    difficult: "The parent said today was difficult for them personally.",
    exhausted: "The parent said they are exhausted.",
    worried: "The parent said they are worried.",
    need_to_talk: "The parent said they just need to talk — prioritise listening and supporting the parent, not only the child.",
  };
  return map[mood];
}
