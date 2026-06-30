import { getLLMProvider, isExternalLLMConfigured } from "@/lib/ai/future-provider";
import type { JourneyEntry } from "@/lib/journey/timeline";
import type { JourneyPeriodCard } from "@/lib/journey/experience";

export type StoryKind = "weekly" | "monthly" | "annual" | "family";

export type StoryDraft = {
  kind: StoryKind;
  periodId: string;
  periodLabel: string;
  text: string;
  sourceFacts: string[];
  usedLlm: boolean;
};

function trimToWordLimit(text: string, maxWords = 200): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ").trim();
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

  const strongClaims = normalizedDraft.match(/\b(always|never|dramatic|transformed|cured|guaranteed)\b/g) || [];
  if (strongClaims.length > 0) return false;

  const factWords = new Set(normalizedFacts.split(" ").filter((word) => word.length > 2));
  const draftWords = normalizedDraft.split(" ").filter((word) => word.length > 2);
  const unseen = draftWords.filter((word) => !factWords.has(word));
  return unseen.length <= Math.max(16, Math.floor(draftWords.length * 0.34));
}

function buildPeriodFacts(card: JourneyPeriodCard, kind: StoryKind): string[] {
  const facts = [
    `Story kind: ${kind}`,
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
  if (card.upcomingImportantEvent?.title) facts.push(`Upcoming important event: ${card.upcomingImportantEvent.title}`);
  return facts;
}

function buildAnnualFacts(entries: JourneyEntry[]): { periodId: string; periodLabel: string; facts: string[] } {
  const year = new Date().getFullYear();
  const yearEntries = entries.filter((entry) => new Date(entry.date).getFullYear() === year);
  const wins = yearEntries.filter((entry) => entry.filter === "milestones").length;
  const talks = yearEntries.filter((entry) => entry.filter === "conversations").length;
  const school = yearEntries.filter((entry) => /school/i.test(`${entry.title} ${entry.summary}`)).length;
  const therapy = yearEntries.filter((entry) => /therapy|appointment/i.test(`${entry.title} ${entry.summary}`)).length;

  return {
    periodId: `annual-${year}`,
    periodLabel: `Year ${year}`,
    facts: [
      `Story kind: annual`,
      `Period: Year ${year}`,
      `Journey events: ${yearEntries.length}`,
      `Talk conversations: ${talks}`,
      `Milestones recorded: ${wins}`,
      `School-related moments: ${school}`,
      `Therapy or appointment moments: ${therapy}`,
    ],
  };
}

function buildFamilyFacts(entries: JourneyEntry[]): { periodId: string; periodLabel: string; facts: string[] } {
  const total = entries.length;
  const talks = entries.filter((entry) => entry.filter === "conversations").length;
  const milestones = entries.filter((entry) => entry.filter === "milestones").length;
  const calendar = entries.filter((entry) => entry.filter === "calendar").length;
  const wins = entries.filter((entry) => /win|progress|breakthrough|success/i.test(`${entry.title} ${entry.summary}`)).length;
  const challenges = entries.filter((entry) => /challenge|difficult|anxiety|meltdown|overwhelm/i.test(`${entry.title} ${entry.summary}`)).length;

  return {
    periodId: "family-overview",
    periodLabel: "Family Journey Overview",
    facts: [
      "Story kind: family",
      "Period: Family Journey Overview",
      `Journey events: ${total}`,
      `Talk conversations: ${talks}`,
      `Milestones recorded: ${milestones}`,
      `Calendar moments: ${calendar}`,
      `Positive moments noted: ${wins}`,
      `Challenge moments noted: ${challenges}`,
    ],
  };
}

async function renderDraft(params: {
  kind: StoryKind;
  periodId: string;
  periodLabel: string;
  facts: string[];
}): Promise<StoryDraft> {
  const local = trimToWordLimit([
    `${params.periodLabel} includes ${params.facts.find((f) => f.startsWith("Journey events:"))?.replace("Journey events: ", "") || "recorded"} journey moments.`,
    params.facts.find((f) => f.startsWith("Main focus:")) || "Main focus details were limited in this period.",
    params.facts.find((f) => f.startsWith("Biggest win:")) || "Wins are reflected in recorded moments.",
    params.facts.find((f) => f.startsWith("Biggest challenge:")) || "Challenges are reflected where logged.",
    "This draft includes only facts recorded in Journey.",
  ].join(" "));

  if (!isExternalLLMConfigured()) {
    return {
      kind: params.kind,
      periodId: params.periodId,
      periodLabel: params.periodLabel,
      text: local,
      sourceFacts: params.facts,
      usedLlm: false,
    };
  }

  try {
    const provider = getLLMProvider();
    const raw = await provider.complete(
      [
        `Create a warm, calm ${params.kind} family reflection in under 200 words.`,
        "Use only supplied facts. Do not invent events, dates, numbers, or outcomes.",
        "If a detail is not listed, omit it.",
        "No bullet list.",
        "",
        "Facts:",
        ...params.facts.map((fact) => `- ${fact}`),
      ].join("\n"),
      {
        system: "You are a factual story formatter. Ground every sentence in provided facts.",
        temperature: 0.2,
        maxTokens: 320,
      },
    );

    const candidate = trimToWordLimit(raw, 200);
    if (!looksGrounded(candidate, params.facts)) {
      return {
        kind: params.kind,
        periodId: params.periodId,
        periodLabel: params.periodLabel,
        text: local,
        sourceFacts: params.facts,
        usedLlm: false,
      };
    }

    return {
      kind: params.kind,
      periodId: params.periodId,
      periodLabel: params.periodLabel,
      text: candidate,
      sourceFacts: params.facts,
      usedLlm: true,
    };
  } catch {
    return {
      kind: params.kind,
      periodId: params.periodId,
      periodLabel: params.periodLabel,
      text: local,
      sourceFacts: params.facts,
      usedLlm: false,
    };
  }
}

export async function generateWeeklyOrMonthlyStoryDraft(params: {
  kind: "weekly" | "monthly";
  card: JourneyPeriodCard;
}): Promise<StoryDraft> {
  return renderDraft({
    kind: params.kind,
    periodId: params.card.id,
    periodLabel: params.card.label,
    facts: buildPeriodFacts(params.card, params.kind),
  });
}

export async function generateAnnualStoryDraft(entries: JourneyEntry[]): Promise<StoryDraft> {
  const annual = buildAnnualFacts(entries);
  return renderDraft({
    kind: "annual",
    periodId: annual.periodId,
    periodLabel: annual.periodLabel,
    facts: annual.facts,
  });
}

export async function generateFamilyStoryDraft(entries: JourneyEntry[]): Promise<StoryDraft> {
  const family = buildFamilyFacts(entries);
  return renderDraft({
    kind: "family",
    periodId: family.periodId,
    periodLabel: family.periodLabel,
    facts: family.facts,
  });
}
