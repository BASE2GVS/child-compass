import { getLLMProvider, isExternalLLMConfigured } from "@/lib/ai/future-provider";
import type { JourneyPeriodCard } from "@/lib/journey/experience";

export type WeeklyStoryDraft = {
  periodId: string;
  periodLabel: string;
  text: string;
  sourceFacts: string[];
  usedLlm: boolean;
};

function buildSourceFacts(card: JourneyPeriodCard): string[] {
  const facts: string[] = [
    `Period: ${card.label}`,
    `Date range: ${card.startDate} to ${card.endDate}`,
    `Journey events: ${card.eventCount}`,
    `Talk conversations: ${card.conversationCount}`,
  ];

  if (card.mainFocus) facts.push(`Main focus: ${card.mainFocus}`);
  if (card.biggestWin) facts.push(`Biggest win: ${card.biggestWin}`);
  if (card.biggestChallenge) facts.push(`Biggest challenge: ${card.biggestChallenge}`);
  if (card.milestoneCount > 0) facts.push(`Milestones recorded: ${card.milestoneCount}`);
  if (card.therapyCount > 0) facts.push(`Therapy-related events: ${card.therapyCount}`);
  if (card.upcomingImportantEvent?.title) {
    facts.push(`Upcoming important event: ${card.upcomingImportantEvent.title}`);
  }

  return facts;
}

function trimToWordLimit(text: string, maxWords = 200): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ").trim();
}

function buildLocalDraft(childName: string, card: JourneyPeriodCard): string {
  const lines: string[] = [];
  lines.push(`${card.label} held ${card.eventCount} journey moments for ${childName}.`);

  if (card.mainFocus) {
    lines.push(`The main focus was ${card.mainFocus.toLowerCase()}.`);
  }

  if (card.biggestWin) {
    lines.push(`A bright spot this week was ${card.biggestWin.toLowerCase()}.`);
  }

  if (card.biggestChallenge) {
    lines.push(`A harder moment was ${card.biggestChallenge.toLowerCase()}.`);
  }

  lines.push(`${card.conversationCount} Talk conversation${card.conversationCount === 1 ? "" : "s"} were recorded.`);

  if (card.upcomingImportantEvent?.title) {
    lines.push(`Looking ahead, ${card.upcomingImportantEvent.title.toLowerCase()} is coming up.`);
  }

  lines.push("This draft reflects only the moments recorded in Journey.");
  return trimToWordLimit(lines.join(" "));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numbersInText(value: string): string[] {
  const matches = value.match(/\b\d+\b/g);
  return matches || [];
}

function looksGrounded(candidate: string, facts: string[]): boolean {
  const draftNumbers = new Set(numbersInText(candidate));
  const factNumbers = new Set(numbersInText(facts.join(" ")));
  for (const value of draftNumbers) {
    if (!factNumbers.has(value)) return false;
  }

  const normalizedFacts = normalizeText(facts.join(" "));
  const normalizedDraft = normalizeText(candidate);
  if (!normalizedDraft) return false;

  const strongClaims = normalizedDraft.match(/\b(improved|worse|always|never|major|dramatic|transformed|cured)\b/g) || [];
  if (strongClaims.length > 0) return false;

  // Keep a lightweight grounding check: if the draft introduces many unseen words,
  // fall back to template to avoid accidental invention.
  const factWords = new Set(normalizedFacts.split(" ").filter((word) => word.length > 2));
  const draftWords = normalizedDraft.split(" ").filter((word) => word.length > 2);
  const unseen = draftWords.filter((word) => !factWords.has(word));
  return unseen.length <= Math.max(14, Math.floor(draftWords.length * 0.32));
}

export async function generateWeeklyStoryDraft(input: {
  childName: string;
  card: JourneyPeriodCard;
}): Promise<WeeklyStoryDraft> {
  const sourceFacts = buildSourceFacts(input.card);
  const local = buildLocalDraft(input.childName, input.card);

  if (!isExternalLLMConfigured()) {
    return {
      periodId: input.card.id,
      periodLabel: input.card.label,
      text: local,
      sourceFacts,
      usedLlm: false,
    };
  }

  try {
    const provider = getLLMProvider();
    const prompt = [
      "Create a warm, calm weekly family reflection.",
      "Only use facts listed below. Do not add facts, numbers, events, dates, or diagnoses.",
      "If a detail is missing, omit it.",
      "Max 200 words.",
      "No bullet list.",
      "",
      "Facts:",
      ...sourceFacts.map((fact) => `- ${fact}`),
    ].join("\n");

    const raw = await provider.complete(prompt, {
      system:
        "You are a factual family story assistant. You must not invent details. Stay grounded in supplied facts only.",
      temperature: 0.2,
      maxTokens: 320,
    });

    const candidate = trimToWordLimit(raw, 200);
    if (!looksGrounded(candidate, sourceFacts)) {
      return {
        periodId: input.card.id,
        periodLabel: input.card.label,
        text: local,
        sourceFacts,
        usedLlm: false,
      };
    }

    return {
      periodId: input.card.id,
      periodLabel: input.card.label,
      text: candidate,
      sourceFacts,
      usedLlm: true,
    };
  } catch {
    return {
      periodId: input.card.id,
      periodLabel: input.card.label,
      text: local,
      sourceFacts,
      usedLlm: false,
    };
  }
}
