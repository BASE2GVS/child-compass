export type JourneyPhase = "morning" | "school" | "home" | "evening" | "reflection";

export const JOURNEY_PHASES: { id: JourneyPhase; label: string; icon: string }[] = [
  { id: "morning", label: "Morning", icon: "☀️" },
  { id: "school", label: "School", icon: "🏫" },
  { id: "home", label: "Home", icon: "🏠" },
  { id: "evening", label: "Evening", icon: "🌙" },
  { id: "reflection", label: "Reflection", icon: "✨" },
];

export type ScaleOption = {
  value: number;
  emoji: string;
  label: string;
  tint: string;
  ring: string;
};

export type CheckInStep =
  | {
      id: string;
      phase: JourneyPhase;
      type: "mood";
      title: (childName: string) => string;
      subtitle: string;
    }
  | {
      id: string;
      phase: JourneyPhase;
      type: "scale";
      field: ScaleField;
      title: (childName: string) => string;
      subtitle: string;
      options: ScaleOption[];
    }
  | {
      id: string;
      phase: JourneyPhase;
      type: "text";
      field: TextField;
      title: string;
      subtitle: string;
      placeholder: string;
      multiline?: boolean;
    }
  | {
      id: string;
      phase: "reflection";
      type: "complete";
      title: string;
      subtitle: string;
    };

export type ScaleField =
  | "sleepQuality"
  | "energy"
  | "schoolRating"
  | "anxiety"
  | "sensoryOverload"
  | "demandTolerance"
  | "appetite"
  | "socialBattery";

export type TextField = "wins" | "challenges" | "notes";

export const MOOD_OPTIONS: ScaleOption[] = [
  { value: 5, emoji: "😊", label: "Happy", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
  { value: 4, emoji: "🙂", label: "Calm", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
  { value: 3, emoji: "😐", label: "Okay", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
  { value: 2, emoji: "😟", label: "Anxious", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
  { value: 1, emoji: "😢", label: "Overwhelmed", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
];

export const ENCOURAGEMENT_BY_PHASE: Partial<Record<JourneyPhase, string>> = {
  school: "You're doing great.",
  home: "Thank you for noticing these little moments.",
  evening: "Small observations become meaningful over time.",
  reflection: "Almost there — you're walking through today beautifully.",
};

export function buildCheckInSteps(childName: string): CheckInStep[] {
  return [
    {
      id: "mood",
      phase: "morning",
      type: "mood",
      title: () => `How is ${childName} feeling today?`,
      subtitle: "Choose what feels closest — there are no wrong answers.",
    },
    {
      id: "sleep",
      phase: "morning",
      type: "scale",
      field: "sleepQuality",
      title: () => `How did ${childName} sleep last night?`,
      subtitle: "Rest shapes the whole day.",
      options: [
        { value: 1, emoji: "😴", label: "Restless night", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
        { value: 2, emoji: "😪", label: "Patchy sleep", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 3, emoji: "😐", label: "Okay sleep", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "😌", label: "Good rest", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 5, emoji: "✨", label: "Slept well", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
      ],
    },
    {
      id: "energy",
      phase: "morning",
      type: "scale",
      field: "energy",
      title: () => `How is ${childName}'s energy right now?`,
      subtitle: "Morning energy tells us a lot.",
      options: [
        { value: 1, emoji: "🪫", label: "Very low", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
        { value: 2, emoji: "😮‍💨", label: "Low", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 3, emoji: "😐", label: "Moderate", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "🙂", label: "Good energy", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 5, emoji: "⚡", label: "Full of energy", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
      ],
    },
    {
      id: "school",
      phase: "school",
      type: "scale",
      field: "schoolRating",
      title: () => `How was school for ${childName} today?`,
      subtitle: "School days carry a lot.",
      options: [
        { value: 1, emoji: "😣", label: "Really hard", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
        { value: 2, emoji: "😟", label: "Difficult", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 3, emoji: "😐", label: "Mixed", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "🙂", label: "Mostly good", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 5, emoji: "🌟", label: "Great day", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
      ],
    },
    {
      id: "anxiety",
      phase: "school",
      type: "scale",
      field: "anxiety",
      title: () => `How anxious did ${childName} seem today?`,
      subtitle: "Worry is information, not failure.",
      options: [
        { value: 1, emoji: "😌", label: "Very calm", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
        { value: 2, emoji: "🙂", label: "Mostly calm", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 3, emoji: "😐", label: "Some worry", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "😟", label: "Quite anxious", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 5, emoji: "😰", label: "Very anxious", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
      ],
    },
    {
      id: "sensory",
      phase: "home",
      type: "scale",
      field: "sensoryOverload",
      title: () => `Was sensory overload an issue for ${childName}?`,
      subtitle: "Lights, sounds, textures — they all count.",
      options: [
        { value: 1, emoji: "🌿", label: "Barely any", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
        { value: 2, emoji: "🙂", label: "A little", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 3, emoji: "😐", label: "Moderate", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "😣", label: "Quite a lot", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 5, emoji: "🔊", label: "Overwhelming", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
      ],
    },
    {
      id: "demand",
      phase: "home",
      type: "scale",
      field: "demandTolerance",
      title: () => `How was ${childName}'s demand tolerance?`,
      subtitle: "Requests, transitions, expectations.",
      options: [
        { value: 1, emoji: "🫠", label: "Very low", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
        { value: 2, emoji: "😮‍💨", label: "Low", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 3, emoji: "😐", label: "Mixed", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "🙂", label: "Pretty good", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 5, emoji: "💪", label: "Strong", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
      ],
    },
    {
      id: "appetite",
      phase: "home",
      type: "scale",
      field: "appetite",
      title: () => `How was ${childName}'s appetite today?`,
      subtitle: "Eating can tell us how the body is doing.",
      options: [
        { value: 1, emoji: "🚫", label: "Barely ate", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
        { value: 2, emoji: "🥄", label: "Picky", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 3, emoji: "😐", label: "Normal", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "🙂", label: "Good appetite", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 5, emoji: "🍽️", label: "Ate well", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
      ],
    },
    {
      id: "social",
      phase: "home",
      type: "scale",
      field: "socialBattery",
      title: () => `How is ${childName}'s social battery?`,
      subtitle: "Connection takes energy.",
      options: [
        { value: 1, emoji: "🪫", label: "Empty", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]/40" },
        { value: 2, emoji: "😮‍💨", label: "Low", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
        { value: 3, emoji: "😐", label: "Okay", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]/50" },
        { value: 4, emoji: "🙂", label: "Good", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
        { value: 5, emoji: "🔋", label: "Full", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
      ],
    },
    {
      id: "wins",
      phase: "evening",
      type: "text",
      field: "wins",
      title: "Any wins today?",
      subtitle: "Even tiny victories count — one per line if you like.",
      placeholder: "A moment that went well, a small step forward…",
      multiline: true,
    },
    {
      id: "challenges",
      phase: "evening",
      type: "text",
      field: "challenges",
      title: "What felt hard today?",
      subtitle: "Hard days are part of the story too.",
      placeholder: "What felt difficult or overwhelming…",
      multiline: true,
    },
    {
      id: "notes",
      phase: "evening",
      type: "text",
      field: "notes",
      title: "Anything else you'd like to remember?",
      subtitle: "Optional — whatever is on your heart.",
      placeholder: "A detail, a feeling, something you noticed…",
      multiline: true,
    },
    {
      id: "complete",
      phase: "reflection",
      type: "complete",
      title: "Today's story has been added.",
      subtitle: "Thank you for sharing today with me.",
    },
  ];
}
