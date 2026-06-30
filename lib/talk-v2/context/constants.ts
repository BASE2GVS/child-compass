export const CONTEXT_LIMITS = {
  recentConversation: 12,
  dailyCheckins: 14,
  timelineHighlights: 20,
  behaviourPatterns: 10,
  recentDebriefs: 10,
  relevantMemories: 8,
  familyStorySignals: 6,
} as const;

export const MEMORY_SOURCE_WEIGHT: Record<
  "profile" | "pattern" | "checkin" | "timeline" | "debrief",
  number
> = {
  profile: 1.0,
  pattern: 3.0,
  checkin: 1.5,
  timeline: 2.0,
  debrief: 2.5,
};

export const MEMORY_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "about",
  "they",
  "them",
  "their",
  "have",
  "been",
  "were",
  "what",
  "when",
  "where",
  "would",
  "could",
  "should",
  "your",
  "you",
]);
