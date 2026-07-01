import type {
  ClinicalContext,
  ClinicalContextBudget,
  ClinicalContextBudgetResult,
  ClinicalContextFact,
  ClinicalContextSectionName,
} from "@/lib/talk-v2/contracts";

const DEFAULT_BUDGET: ClinicalContextBudget = {
  maxFacts: 24,
  sectionLimits: {
    childProfile: 8,
    currentSituation: 5,
    parentGoal: 1,
    relevantJourney: 5,
    previousAttempts: 3,
    knownSuccesses: 3,
    knownFailures: 3,
    recentChanges: 3,
    openQuestions: 2,
  },
};

function sortFacts(facts: ClinicalContextFact[]): ClinicalContextFact[] {
  return facts.slice().sort((a, b) => {
    const aTime = a.source.occurredAt || "";
    const bTime = b.source.occurredAt || "";
    if (aTime !== bTime) return bTime.localeCompare(aTime);
    if (a.label !== b.label) return a.label.localeCompare(b.label);
    return a.text.localeCompare(b.text);
  });
}

function limitSection(facts: ClinicalContextFact[], limit: number): ClinicalContextFact[] {
  if (limit <= 0) return [];
  return sortFacts(facts).slice(0, limit);
}

export function applyClinicalContextBudget(
  context: ClinicalContext,
  budget: ClinicalContextBudget = DEFAULT_BUDGET,
): ClinicalContextBudgetResult {
  const selected: ClinicalContext = {
    ...context,
    childProfile: context.childProfile,
    currentSituation: limitSection(context.currentSituation, budget.sectionLimits.currentSituation),
    parentGoal: context.parentGoal,
    relevantJourney: limitSection(context.relevantJourney, budget.sectionLimits.relevantJourney),
    previousAttempts: limitSection(context.previousAttempts, budget.sectionLimits.previousAttempts),
    knownSuccesses: limitSection(context.knownSuccesses, budget.sectionLimits.knownSuccesses),
    knownFailures: limitSection(context.knownFailures, budget.sectionLimits.knownFailures),
    recentChanges: limitSection(context.recentChanges, budget.sectionLimits.recentChanges),
    openQuestions: limitSection(context.openQuestions, budget.sectionLimits.openQuestions),
    sourceSummary: context.sourceSummary,
  };

  const childProfileFacts = context.childProfile ? context.childProfile.diagnosis.length + context.childProfile.supportNeeds.length + context.childProfile.strengths.length + context.childProfile.knownTriggers.length + context.childProfile.calmingStrategies.length + context.childProfile.successfulStrategies.length + context.childProfile.challenges.length + 5 : 0;
  const selectedFactCount =
    childProfileFacts +
    selected.currentSituation.length +
    (selected.parentGoal ? 1 : 0) +
    selected.relevantJourney.length +
    selected.previousAttempts.length +
    selected.knownSuccesses.length +
    selected.knownFailures.length +
    selected.recentChanges.length +
    selected.openQuestions.length;

  const omittedFactCount =
    Math.max(0, context.currentSituation.length - selected.currentSituation.length) +
    Math.max(0, context.relevantJourney.length - selected.relevantJourney.length) +
    Math.max(0, context.previousAttempts.length - selected.previousAttempts.length) +
    Math.max(0, context.knownSuccesses.length - selected.knownSuccesses.length) +
    Math.max(0, context.knownFailures.length - selected.knownFailures.length) +
    Math.max(0, context.recentChanges.length - selected.recentChanges.length) +
    Math.max(0, context.openQuestions.length - selected.openQuestions.length);

  const selectedSections: ClinicalContextSectionName[] = [];
  const omittedSections: ClinicalContextSectionName[] = [];

  const sectionStatus: Array<{ section: ClinicalContextSectionName; hasFacts: boolean }> = [
    { section: "childProfile", hasFacts: Boolean(context.childProfile) },
    { section: "currentSituation", hasFacts: selected.currentSituation.length > 0 },
    { section: "parentGoal", hasFacts: Boolean(selected.parentGoal) },
    { section: "relevantJourney", hasFacts: selected.relevantJourney.length > 0 },
    { section: "previousAttempts", hasFacts: selected.previousAttempts.length > 0 },
    { section: "knownSuccesses", hasFacts: selected.knownSuccesses.length > 0 },
    { section: "knownFailures", hasFacts: selected.knownFailures.length > 0 },
    { section: "recentChanges", hasFacts: selected.recentChanges.length > 0 },
    { section: "openQuestions", hasFacts: selected.openQuestions.length > 0 },
  ];

  for (const entry of sectionStatus) {
    if (entry.hasFacts) selectedSections.push(entry.section);
    else omittedSections.push(entry.section);
  }

  return {
    context: selected,
    selectedFactCount,
    omittedFactCount,
    selectedSections,
    omittedSections,
  };
}

export { DEFAULT_BUDGET as TALK_V2_CLINICAL_CONTEXT_BUDGET };