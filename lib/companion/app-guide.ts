import type { DebriefResponse } from "@/lib/types/database";

type AppGuideEntry = {
  keywords: string[];
  title: string;
  path: string;
  explanation: string;
};

const APP_GUIDES: AppGuideEntry[] = [
  {
    keywords: ["timeline", "history", "what happened"],
    title: "Timeline",
    path: "/timeline",
    explanation:
      "Timeline is your family's story — check-ins, wins, meltdowns, and reflections in one place. It helps you and Child Compass see patterns over time.",
  },
  {
    keywords: ["check-in", "check in", "checkin", "morning check"],
    title: "Daily Check-In",
    path: "/check-in",
    explanation:
      "Check-In takes about two minutes each day. It captures sleep, mood, school, and wins — the foundation for personalised guidance.",
  },
  {
    keywords: ["track", "goals", "habits", "schedules"],
    title: "Track",
    path: "/track",
    explanation:
      "Track brings together check-ins, timeline, goals, habits, and visual schedules — everything that helps you follow your child's journey.",
  },
  {
    keywords: ["school hub", "school page", "teacher"],
    title: "School",
    path: "/school",
    explanation:
      "School helps you prepare for conversations with teachers, share strategies, and keep school notes in one place.",
  },
  {
    keywords: ["report", "weekly report", "generate report"],
    title: "Reports",
    path: "/reports",
    explanation:
      "Reports turn your family's data into summaries you can read or share with professionals — weekly highlights, patterns, and recommendations.",
  },
  {
    keywords: ["teacher guide"],
    title: "Teacher Guide™",
    path: "/teacher-guide",
    explanation:
      "Teacher Guide creates a classroom-ready summary of what helps your child — strategies, triggers, and strengths teachers can use.",
  },
  {
    keywords: ["passport", "pda passport"],
    title: "PDA Passport™",
    path: "/pda-passport",
    explanation:
      "PDA Passport is a shareable profile explaining your child's needs — useful for teachers, carers, and family members.",
  },
  {
    keywords: ["invite", "husband", "wife", "partner", "caregiver", "co-parent"],
    title: "Family Settings",
    path: "/settings",
    explanation:
      "To invite your partner or a caregiver, go to Settings → Family. They'll receive access to your shared family space.",
  },
  {
    keywords: ["compass", "my child", "regulation", "gauge"],
    title: "My Child",
    path: "/compass",
    explanation:
      "My Child shows regulation, emotional state, and intelligence gauges — a living picture of how your child is doing right now.",
  },
  {
    keywords: ["document", "documents hub", "calm plan", "emergency plan"],
    title: "Documents",
    path: "/documents-hub",
    explanation:
      "Documents holds reports, uploaded files, Teacher Guide, PDA Passport, and your Emergency Calm Plan — everything shareable in one place.",
  },
  {
    keywords: ["today", "home", "dashboard"],
    title: "Today",
    path: "/today",
    explanation:
      "Today is your daily home — briefing, what to do next, and a quick way to ask Child Compass anything.",
  },
  {
    keywords: ["why check-in", "why should i check", "complete check-in"],
    title: "Why check-in matters",
    path: "/check-in",
    explanation:
      "Daily check-ins aren't about perfection — they're how Child Compass learns your child's rhythms. Even rough days help. Two minutes unlocks personalised guidance.",
  },
];

function matchGuide(message: string): AppGuideEntry | null {
  const lower = message.toLowerCase();
  for (const guide of APP_GUIDES) {
    if (guide.keywords.some((k) => lower.includes(k))) return guide;
  }
  if (lower.includes("what is") || lower.includes("what's") || lower.includes("how do i")) {
    return APP_GUIDES.find((g) => g.keywords.some((k) => lower.includes(k.split(" ")[0]))) ?? null;
  }
  return null;
}

export function buildProductHelpResponse(
  message: string,
  childName: string,
): DebriefResponse | null {
  const guide = matchGuide(message);
  if (!guide) return null;

  return {
    likely_trigger: "You're exploring how Child Compass works — that's a good question.",
    behaviour_explanation: `${guide.title}: ${guide.explanation}`,
    emotional_interpretation:
      "You shouldn't have to learn complicated software. Ask me about any page, button, or feature — I'll explain plainly.",
    suggested_response: `Open ${guide.title} here: ${guide.path} — or tell me what you're trying to do and I'll guide you step by step.`,
    things_not_to_say: ["Figure it out yourself.", "It's in the settings somewhere."],
    tomorrow_plan: `Try opening ${guide.title} when you have a quiet moment. No rush.`,
    long_term_recommendation: `The more you use ${guide.title}, the more useful it becomes alongside conversations about ${childName}.`,
    confidence_level: 0.95,
    follow_up_questions: [
      "Would you like directions to another part of Child Compass?",
      `Is there something specific you're trying to do for ${childName}?`,
    ],
  };
}

export function isProductHelpMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("what is") ||
    lower.includes("what's") ||
    lower.includes("how do i") ||
    lower.includes("where is") ||
    lower.includes("what does") ||
    lower.includes("this button") ||
    lower.includes("this page") ||
    lower.includes("this icon") ||
    matchGuide(message) !== null
  );
}

export function isNavigationMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("take me to") ||
    lower.includes("go to") ||
    lower.includes("show me") ||
    lower.includes("open ") ||
    lower.includes("navigate")
  );
}
