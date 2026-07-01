import {
  TALK_V2_CONTRACT_VERSION,
  type ClinicalContext,
  type ClinicalContextFact,
  type ClinicalContextFactSource,
} from "@/lib/talk-v2/contracts";
import type { ContextRepositoryOutput } from "@/lib/talk-v2/context/context-repository";

type ClinicalContextInput = {
  childId: string;
  sessionId: string;
  parentMessage: string;
  data: ContextRepositoryOutput;
};

function stripWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function factId(section: ClinicalContextFact["section"], label: string, text: string): string {
  return `${section}:${label}:${stripWhitespace(text).toLowerCase().slice(0, 96)}`;
}

function createFact(params: {
  section: ClinicalContextFact["section"];
  label: string;
  text: string;
  source: ClinicalContextFactSource;
}): ClinicalContextFact {
  return {
    id: factId(params.section, params.label, params.text),
    section: params.section,
    label: params.label,
    text: stripWhitespace(params.text),
    source: params.source,
  };
}

function latestByDate<T>(items: T[], count: number, getDate: (item: T) => string): T[] {
  return items
    .slice()
    .sort((a, b) => getDate(b).localeCompare(getDate(a)))
    .slice(0, count);
}

function latestCheckin(data: ContextRepositoryOutput) {
  return data.dailyCheckins.slice().sort((a, b) => b.checkin_date.localeCompare(a.checkin_date))[0] || null;
}

function previousCheckin(data: ContextRepositoryOutput) {
  return data.dailyCheckins.slice().sort((a, b) => b.checkin_date.localeCompare(a.checkin_date))[1] || null;
}

function makeChildProfileFacts(data: ContextRepositoryOutput) {
  const child = data.child;
  const profile = data.profile;
  if (!child && !profile) return [];

  const facts: ClinicalContextFact[] = [];
  if (child) {
    facts.push(
      createFact({ section: "childProfile", label: "child_name", text: child.first_name, source: { kind: "child_profile", sourceId: child.id } }),
      createFact({ section: "childProfile", label: "diagnosis", text: child.diagnosis.length ? child.diagnosis.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: child.id } }),
      createFact({ section: "childProfile", label: "support_needs", text: child.support_needs.length ? child.support_needs.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: child.id } }),
      createFact({ section: "childProfile", label: "school", text: child.school || "not recorded", source: { kind: "child_profile", sourceId: child.id } }),
      createFact({ section: "childProfile", label: "grade", text: child.grade || "not recorded", source: { kind: "child_profile", sourceId: child.id } }),
    );
  }

  if (profile) {
    const strengths = profile.strengths ?? [];
    const knownTriggers = profile.known_triggers ?? [];
    const calmingStrategies = profile.calming_strategies ?? [];
    const successfulStrategies = profile.successful_strategies ?? [];
    const challenges = profile.challenges ?? [];
    const medication = profile.medication ?? [];

    facts.push(
      createFact({ section: "childProfile", label: "strengths", text: strengths.length ? strengths.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: profile.child_id } }),
      createFact({ section: "childProfile", label: "known_triggers", text: knownTriggers.length ? knownTriggers.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: profile.child_id } }),
      createFact({ section: "childProfile", label: "calming_strategies", text: calmingStrategies.length ? calmingStrategies.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: profile.child_id } }),
      createFact({ section: "childProfile", label: "successful_strategies", text: successfulStrategies.length ? successfulStrategies.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: profile.child_id } }),
      createFact({ section: "childProfile", label: "challenges", text: challenges.length ? challenges.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: profile.child_id } }),
      createFact({ section: "childProfile", label: "medication", text: medication.length ? medication.join(", ") : "not recorded", source: { kind: "child_profile", sourceId: profile.child_id } }),
    );
  }

  return facts;
}

function makeCurrentSituationFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const latest = latestCheckin(input.data);

  facts.push(
    createFact({
      section: "currentSituation",
      label: "parent_message",
      text: input.parentMessage,
      source: { kind: "parent_message", sourceId: input.sessionId },
    }),
  );

  if (latest) {
    const parts: string[] = [];
    if (latest.sleep_quality != null) parts.push(`sleep ${latest.sleep_quality}/5`);
    if (latest.mood != null) parts.push(`mood ${latest.mood}/5`);
    if (latest.anxiety != null) parts.push(`anxiety ${latest.anxiety}/5`);
    if (latest.school_rating != null) parts.push(`school ${latest.school_rating}/5`);
    if (latest.wins.length) parts.push(`wins: ${latest.wins.join(", ")}`);
    if (latest.challenges.length) parts.push(`challenges: ${latest.challenges.join(", ")}`);
    if (latest.notes) parts.push(`notes: ${latest.notes}`);

    facts.push(
      createFact({
        section: "currentSituation",
        label: "latest_checkin",
        text: parts.join(" • ") || "latest check-in recorded",
        source: { kind: "checkin", sourceId: latest.checkin_date, occurredAt: latest.checkin_date },
      }),
    );
  }

  const recentTimeline = latestByDate(input.data.timelineHighlights, 3, (item) => item.event_date);
  for (const item of recentTimeline) {
    facts.push(
      createFact({
        section: "currentSituation",
        label: "recent_timeline",
        text: `${item.event_date}: ${item.event_type} — ${item.title}${item.description ? ` (${item.description})` : ""}`,
        source: { kind: "timeline", sourceId: `${item.event_date}:${item.title}`, occurredAt: item.event_date },
      }),
    );
  }

  return facts;
}

function makeRelevantJourneyFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const timeline = latestByDate(input.data.timelineHighlights, 6, (item) => item.event_date);
  const debriefs = input.data.recentDebriefs.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3);
  const conversation = input.data.recentConversation.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);

  for (const item of timeline) {
    facts.push(
      createFact({
        section: "relevantJourney",
        label: item.event_type,
        text: `${item.event_date}: ${item.title}${item.description ? ` — ${item.description}` : ""}`,
        source: { kind: "timeline", sourceId: `${item.event_date}:${item.title}`, occurredAt: item.event_date },
      }),
    );
  }

  for (const debrief of debriefs) {
    facts.push(
      createFact({
        section: "relevantJourney",
        label: "debrief",
        text: `${debrief.created_at.split("T")[0]}: ${debrief.parent_message}`,
        source: { kind: "debrief", sourceId: debrief.id, occurredAt: debrief.created_at },
      }),
    );
  }

  for (const turn of conversation) {
    facts.push(
      createFact({
        section: "relevantJourney",
        label: turn.role,
        text: `${turn.created_at.split("T")[0]}: ${turn.role} — ${turn.content}`,
        source: { kind: turn.role === "parent" ? "parent_message" : "coach_message", sourceId: turn.id, occurredAt: turn.created_at },
      }),
    );
  }

  return facts;
}

function extractExplicitAttempts(texts: string[], section: ClinicalContextFact["section"], sourceKind: ClinicalContextFactSource["kind"], sourceId: string) {
  const attempts: ClinicalContextFact[] = [];
  for (const text of texts) {
    const compact = stripWhitespace(text);
    if (!compact) continue;
    attempts.push(
      createFact({
        section,
        label: "attempt",
        text: compact,
        source: { kind: sourceKind, sourceId },
      }),
    );
  }
  return attempts;
}

function makePreviousAttemptsFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const recentParentTurns = input.data.recentConversation.filter((turn) => turn.role === "parent").slice(-6);
  for (const turn of recentParentTurns) {
    const lower = turn.content.toLowerCase();
    if (/(tried|already tried|used|we used|we did|we've done|we have done|we did try|last time|before|again)/i.test(lower)) {
      facts.push(
        createFact({
          section: "previousAttempts",
          label: "conversation_attempt",
          text: turn.content,
          source: { kind: "parent_message", sourceId: turn.id, occurredAt: turn.created_at },
        }),
      );
    }
  }

  for (const debrief of input.data.recentDebriefs.slice(0, 6)) {
    facts.push(
      ...extractExplicitAttempts([debrief.parent_message], "previousAttempts", "debrief", debrief.id),
    );
  }

  return facts;
}

function makeSuccessFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const profile = input.data.profile;
  const latest = latestCheckin(input.data);

  if (profile) {
    for (const strategy of profile.successful_strategies || []) {
      facts.push(
        createFact({
          section: "knownSuccesses",
          label: "successful_strategy",
          text: strategy,
          source: { kind: "child_profile", sourceId: profile.child_id },
        }),
      );
    }
  }

  if (latest?.wins?.length) {
    for (const win of latest.wins) {
      facts.push(
        createFact({
          section: "knownSuccesses",
          label: "win",
          text: win,
          source: { kind: "checkin", sourceId: latest.checkin_date, occurredAt: latest.checkin_date },
        }),
      );
    }
  }

  for (const item of input.data.timelineHighlights.slice().sort((a, b) => b.event_date.localeCompare(a.event_date))) {
    const text = `${item.title} ${item.description || ""}`.toLowerCase();
    if (text.includes("worked") || text.includes("helped") || text.includes("better") || text.includes("win") || text.includes("success") || item.event_type === "victory") {
      facts.push(
        createFact({
          section: "knownSuccesses",
          label: "timeline_success",
          text: `${item.event_date}: ${item.title}${item.description ? ` — ${item.description}` : ""}`,
          source: { kind: "timeline", sourceId: `${item.event_date}:${item.title}`, occurredAt: item.event_date },
        }),
      );
    }
  }

  return facts;
}

function makeFailureFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const profile = input.data.profile;
  const latest = latestCheckin(input.data);

  if (profile) {
    for (const challenge of profile.challenges || []) {
      facts.push(
        createFact({
          section: "knownFailures",
          label: "challenge",
          text: challenge,
          source: { kind: "child_profile", sourceId: profile.child_id },
        }),
      );
    }
  }

  if (latest?.challenges?.length) {
    for (const challenge of latest.challenges) {
      facts.push(
        createFact({
          section: "knownFailures",
          label: "checkin_challenge",
          text: challenge,
          source: { kind: "checkin", sourceId: latest.checkin_date, occurredAt: latest.checkin_date },
        }),
      );
    }
  }

  for (const debrief of input.data.recentDebriefs.slice(0, 6)) {
    const text = `${debrief.parent_message} ${debrief.likely_trigger || ""}`.toLowerCase();
    if (text.includes("didn't work") || text.includes("did not work") || text.includes("doesn't work") || text.includes("does not work") || text.includes("tried") || text.includes("again")) {
      facts.push(
        createFact({
          section: "knownFailures",
          label: "debrief_failure",
          text: debrief.parent_message,
          source: { kind: "debrief", sourceId: debrief.id, occurredAt: debrief.created_at },
        }),
      );
    }
  }

  return facts;
}

function makeRecentChangesFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const latest = latestCheckin(input.data);
  const previous = previousCheckin(input.data);

  if (latest && previous) {
    const comparisons: Array<[string, number | null, number | null]> = [
      ["sleep", latest.sleep_quality, previous.sleep_quality],
      ["mood", latest.mood, previous.mood],
      ["anxiety", latest.anxiety, previous.anxiety],
      ["school", latest.school_rating, previous.school_rating],
    ];

    for (const [label, current, prior] of comparisons) {
      if (current == null || prior == null || current === prior) continue;
      facts.push(
        createFact({
          section: "recentChanges",
          label,
          text: `${label} changed from ${prior}/5 to ${current}/5 between ${previous.checkin_date} and ${latest.checkin_date}`,
          source: { kind: "checkin", sourceId: latest.checkin_date, occurredAt: latest.checkin_date },
        }),
      );
    }
  }

  const latestTimeline = latestByDate(input.data.timelineHighlights, 2, (item) => item.event_date);
  for (const item of latestTimeline) {
    facts.push(
      createFact({
        section: "recentChanges",
        label: "timeline_change",
        text: `${item.event_date}: ${item.title}${item.description ? ` — ${item.description}` : ""}`,
        source: { kind: "timeline", sourceId: `${item.event_date}:${item.title}`, occurredAt: item.event_date },
      }),
    );
  }

  return facts;
}

function makeOpenQuestionsFacts(input: ClinicalContextInput) {
  const facts: ClinicalContextFact[] = [];
  const child = input.data.child;
  const profile = input.data.profile;

  if (!child?.school) {
    facts.push(createFact({ section: "openQuestions", label: "school", text: "Child school is not recorded.", source: { kind: "child_profile", sourceId: child?.id } }));
  }
  if (!child?.grade) {
    facts.push(createFact({ section: "openQuestions", label: "grade", text: "Child grade is not recorded.", source: { kind: "child_profile", sourceId: child?.id } }));
  }
  if (profile && !(profile.medication ?? []).length) {
    facts.push(createFact({ section: "openQuestions", label: "medication", text: "Medication list is not recorded.", source: { kind: "child_profile", sourceId: profile.child_id } }));
  }
  if (!input.data.recentConversation.some((turn) => turn.role === "parent")) {
    facts.push(createFact({ section: "openQuestions", label: "conversation", text: "No parent conversation history is recorded for this session.", source: { kind: "parent_message", sourceId: input.sessionId } }));
  }

  return facts;
}

export function buildClinicalContext(input: ClinicalContextInput): ClinicalContext {
  const childProfile = makeChildProfileFacts(input.data);
  const currentSituation = makeCurrentSituationFacts(input);
  const relevantJourney = makeRelevantJourneyFacts(input);
  const previousAttempts = makePreviousAttemptsFacts(input);
  const knownSuccesses = makeSuccessFacts(input);
  const knownFailures = makeFailureFacts(input);
  const recentChanges = makeRecentChangesFacts(input);
  const openQuestions = makeOpenQuestionsFacts(input);

  return {
    version: TALK_V2_CONTRACT_VERSION,
    childId: input.childId,
    sessionId: input.sessionId,
    childProfile: input.data.child
      ? {
          childId: input.data.child.id,
          firstName: input.data.child.first_name,
          nickname: input.data.child.nickname,
          diagnosis: input.data.child.diagnosis || [],
          supportNeeds: input.data.child.support_needs || [],
          school: input.data.child.school,
          grade: input.data.child.grade,
          strengths: input.data.profile?.strengths || [],
          knownTriggers: input.data.profile?.known_triggers || [],
          calmingStrategies: input.data.profile?.calming_strategies || [],
          successfulStrategies: input.data.profile?.successful_strategies || [],
          challenges: input.data.profile?.challenges || [],
        }
      : null,
    currentSituation,
    parentGoal: stripWhitespace(input.parentMessage) || null,
    relevantJourney,
    previousAttempts,
    knownSuccesses,
    knownFailures,
    recentChanges,
    openQuestions,
    sourceSummary: [
      `child_profile:${childProfile.length}`,
      `current_situation:${currentSituation.length}`,
      `relevant_journey:${relevantJourney.length}`,
      `previous_attempts:${previousAttempts.length}`,
      `known_successes:${knownSuccesses.length}`,
      `known_failures:${knownFailures.length}`,
      `recent_changes:${recentChanges.length}`,
      `open_questions:${openQuestions.length}`,
    ],
  };
}