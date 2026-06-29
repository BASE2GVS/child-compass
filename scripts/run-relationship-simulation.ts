import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { assembleChildContext, memoryForMessage } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
} from "@/lib/types/database";
import type { CoachMessageTurn } from "@/lib/companion/cross-day-continuity";

type RelationshipMetric =
  | "emotionalContinuity"
  | "memoryRelevance"
  | "trustGrowth"
  | "hopeGrowth"
  | "conversationConsistency"
  | "companionFamiliarity";

type DayScore = {
  journeyId: string;
  day: number;
  message: string;
  response: string;
  scores: Record<RelationshipMetric, number>;
  overall: number;
};

const WEIGHTS: Record<RelationshipMetric, number> = {
  emotionalContinuity: 0.2,
  memoryRelevance: 0.16,
  trustGrowth: 0.17,
  hopeGrowth: 0.16,
  conversationConsistency: 0.16,
  companionFamiliarity: 0.15,
};

const CHILD_NAMES = [
  "Amy",
  "Noah",
  "Mia",
  "Leo",
  "Ava",
  "Eli",
  "Ruby",
  "Max",
  "Isla",
  "Finn",
];

const CHECKIN_THEMES = ["morning", "school", "sleep", "sensory", "transition", "meltdown"] as const;

const DISTRESS_MARKERS = /\b(hard|heavy|overwhelmed|exhausted|alone|shaken|discouraging|that makes sense|you're not alone|i hear you)\b/i;
const CONTINUITY_MARKERS = /\b(yesterday|today|again|still|lately|this week|building on|progress|setback|long arc|kept showing up)\b/i;
const MEMORY_MARKERS = /\b(you mentioned|you shared|for your family|for amy|for noah|for mia|for leo|for ava|for eli|for ruby|for max|for isla|for finn)\b/i;
const TRUST_NEGATIVE = /\b(your fault|you should have|if you were consistent|noncompliant|protocol|caregiver should|as an ai)\b/i;
const TRUST_POSITIVE = /\b(makes sense|you're not alone|i might be wrong|if it helps|we can keep this simple)\b/i;
const HOPE_MARKERS = /\b(next step|tonight|tomorrow|small|gentle|steadier|possible|when you're ready)\b/i;
const FAMILIARITY_MARKERS = /\b(your family|we can|we'll|you've|for you both|this season)\b/i;

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Number(n.toFixed(2))));
}

function seeded(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h / 4294967295;
}

function toDateString(offsetDays: number): string {
  return new Date(Date.now() - offsetDays * 86400000).toISOString().split("T")[0];
}

function buildChild(journey: number): Child {
  const name = CHILD_NAMES[journey % CHILD_NAMES.length];
  return {
    id: `child-${journey}`,
    family_id: `family-${journey}`,
    photo_url: null,
    first_name: name,
    nickname: journey % 4 === 0 ? `${name}y` : null,
    date_of_birth: null,
    gender: null,
    school: "Oak Primary",
    grade: `${(journey % 4) + 1}`,
    diagnosis: journey % 2 === 0 ? ["Autism", "PDA"] : ["ADHD", "Anxiety"],
    support_needs: ["Transitions", "Sensory", "Emotional regulation"],
    interests: ["Drawing", "Animals", "Minecraft"],
    favourite_activities: [],
    created_at: "",
    updated_at: "",
  };
}

function buildProfile(childId: string, familyId: string): ChildProfile {
  return {
    id: `profile-${childId}`,
    child_id: childId,
    family_id: familyId,
    strengths: ["curious", "kind", "creative"],
    sensory_preferences: {},
    favourite_things: [],
    known_triggers: ["being rushed", "unexpected changes", "crowded places"],
    calming_strategies: ["quiet corner", "visual countdown", "co-regulated breathing"],
    support_network: [],
    notes: null,
    medical_history: null,
    medication: [],
    challenges: [],
    successful_strategies: ["previewing transitions", "offering two choices"],
    support_team: [],
    school_contacts: [],
    doctors: [],
    therapists: [],
    emergency_notes: null,
    created_at: "",
    updated_at: "",
  };
}

function buildPatterns(childId: string, familyId: string): PatternFinding[] {
  return [
    {
      id: `pattern-${childId}-1`,
      child_id: childId,
      family_id: familyId,
      category: "school",
      title: "Morning demand pattern",
      description: "Mornings are harder when sleep is poor and transitions are rushed.",
      confidence: 0.79,
      evidence: {},
      is_active: true,
      created_at: "",
      updated_at: "",
    },
    {
      id: `pattern-${childId}-2`,
      child_id: childId,
      family_id: familyId,
      category: "sensory",
      title: "Noise overload pattern",
      description: "Crowded environments tend to raise anxiety and reduce demand tolerance.",
      confidence: 0.74,
      evidence: {},
      is_active: true,
      created_at: "",
      updated_at: "",
    },
  ];
}

function dayTheme(journey: number, day: number): (typeof CHECKIN_THEMES)[number] {
  return CHECKIN_THEMES[(journey + day) % CHECKIN_THEMES.length];
}

function parentMessage(theme: string, day: number, childName: string): { message: string; mood: ParentMood | null } {
  const phase = day <= 10 ? "early" : day <= 20 ? "middle" : "late";

  if (theme === "morning") {
    return {
      message:
        phase === "early"
          ? `Morning was chaos again and I feel like I'm failing ${childName} before school.`
          : `Another hard morning. We had a better day last week, but today slid again and I need one gentle step.`,
      mood: "worried",
    };
  }

  if (theme === "school") {
    return {
      message:
        phase === "late"
          ? `School refusal is still up and down, but there were tiny wins this week. How do we keep momentum?`
          : `School drop-off blew up again and I'm spiraling about tomorrow.`,
      mood: "worried",
    };
  }

  if (theme === "sleep") {
    return {
      message:
        phase === "middle"
          ? `Sleep has been rough for days and both of us are exhausted. Please keep this simple.`
          : `Bedtime was hard again and no one slept well.`,
      mood: "exhausted",
    };
  }

  if (theme === "sensory") {
    return {
      message:
        phase === "late"
          ? `The shop was overwhelming today. We recovered faster than before, but it still rattled us.`
          : `Public noise tipped everything over again and I froze.`,
      mood: "need_to_talk",
    };
  }

  if (theme === "transition") {
    return {
      message:
        phase === "middle"
          ? `Transitions are still our hardest point. Is there one thing we can repeat tomorrow?`
          : `Switching activities became a huge battle again.`,
      mood: null,
    };
  }

  return {
    message:
      phase === "late"
        ? `We had a setback after some progress and I feel discouraged. How do we restart without pressure?`
        : `The meltdown was intense and I still feel shaky.`,
    mood: "need_to_talk",
  };
}

function buildCheckin(
  journey: number,
  day: number,
  theme: string,
  date: string,
): DailyCheckin {
  const improvementPhase = day > 18 ? 1 : day > 10 ? 0.6 : 0.2;
  const wobble = (seeded(`${journey}-${day}`) - 0.5) * 1.2;

  let mood = 2.4 + improvementPhase + wobble;
  let anxiety = 3.8 - improvementPhase + Math.abs(wobble) * 0.5;
  let demand = 2.2 + improvementPhase + wobble * 0.4;
  let sleep = 2.4 + improvementPhase * 0.6;

  if (theme === "sleep") {
    sleep -= 0.8;
    anxiety += 0.4;
  }
  if (theme === "sensory") {
    anxiety += 0.5;
    demand -= 0.3;
  }
  if (theme === "meltdown") {
    mood -= 0.5;
    anxiety += 0.6;
  }

  const wins = day % 5 === 0 ? ["Asked for help before escalation"] : [];
  const challenges = [
    theme === "morning"
      ? "Morning transition to school felt rushed"
      : theme === "school"
        ? "School drop-off distress"
        : theme === "sleep"
          ? "Bedtime resistance and repeated waking"
          : theme === "sensory"
            ? "Noise overload in public spaces"
            : theme === "transition"
              ? "Activity transition conflict"
              : "Meltdown recovery took longer than expected",
  ];

  return {
    id: `checkin-${journey}-${day}`,
    child_id: `child-${journey}`,
    family_id: `family-${journey}`,
    user_id: `user-${journey}`,
    checkin_date: date,
    sleep_quality: clamp(sleep),
    mood: clamp(mood),
    energy: clamp(2.8 + improvementPhase * 0.6 + wobble * 0.2),
    school_rating: clamp(2.5 + improvementPhase * 0.8 + wobble * 0.3),
    anxiety: clamp(anxiety),
    sensory_overload: clamp(3.2 + (theme === "sensory" ? 1 : 0) - improvementPhase * 0.5),
    demand_tolerance: clamp(demand),
    appetite: clamp(3 + wobble * 0.2),
    social_battery: clamp(3 + wobble * 0.2),
    wins,
    challenges,
    notes: challenges[0],
    created_at: `${date}T20:00:00.000Z`,
  };
}

function scoreDay(response: string, message: string): Record<RelationshipMetric, number> {
  const paragraphs = response.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const words = response.trim().split(/\s+/).length;
  const lower = response.toLowerCase();

  let emotionalContinuity = 5;
  if (DISTRESS_MARKERS.test(response)) emotionalContinuity += 2;
  if (CONTINUITY_MARKERS.test(response)) emotionalContinuity += 2;
  if (/\b(you should|you need to)\b/i.test(response)) emotionalContinuity -= 1;

  let memoryRelevance = 5;
  if (MEMORY_MARKERS.test(response)) memoryRelevance += 2;
  if (/\b(morning|school|sleep|sensory|transition|meltdown)\b/i.test(response) && /\b(morning|school|sleep|sensory|transition|meltdown)\b/i.test(message)) {
    memoryRelevance += 1.5;
  }
  if (/\b(generic|in general)\b/i.test(response)) memoryRelevance -= 1;

  let trustGrowth = 6;
  if (TRUST_POSITIVE.test(response)) trustGrowth += 1.5;
  if (TRUST_NEGATIVE.test(response)) trustGrowth -= 4;
  if (!/\b(guarantee|always works|definitely)\b/i.test(response)) trustGrowth += 0.5;

  let hopeGrowth = 5;
  const ending = paragraphs[paragraphs.length - 1] || response;
  if (HOPE_MARKERS.test(ending)) hopeGrowth += 2.5;
  if (/\b(small|gentle|one step)\b/i.test(response)) hopeGrowth += 1;
  if (/\b(nothing helps|hopeless|never)\b/i.test(response)) hopeGrowth -= 2;

  let conversationConsistency = 6;
  if (paragraphs.length >= 2 && paragraphs.length <= 4) conversationConsistency += 2;
  if (words >= 80 && words <= 230) conversationConsistency += 1;
  if (/\b(protocol|intervention|caregiver should|algorithm)\b/i.test(lower)) conversationConsistency -= 2;

  let companionFamiliarity = 5;
  if (FAMILIARITY_MARKERS.test(response)) companionFamiliarity += 2;
  if (/\b(your family|for you both|this season|you've kept showing up)\b/i.test(response)) companionFamiliarity += 1;
  if (/\bparent should\b/i.test(response)) companionFamiliarity -= 1;

  return {
    emotionalContinuity: clamp(emotionalContinuity),
    memoryRelevance: clamp(memoryRelevance),
    trustGrowth: clamp(trustGrowth),
    hopeGrowth: clamp(hopeGrowth),
    conversationConsistency: clamp(conversationConsistency),
    companionFamiliarity: clamp(companionFamiliarity),
  };
}

function overall(scores: Record<RelationshipMetric, number>): number {
  const weighted = (Object.keys(WEIGHTS) as RelationshipMetric[])
    .reduce((sum, metric) => sum + scores[metric] * WEIGHTS[metric], 0);
  return clamp(weighted);
}

async function runPass(label: string, disableRelationship: boolean) {
  process.env.RELATIONSHIP_INTELLIGENCE_DISABLED = disableRelationship ? "1" : "0";

  const allScores: DayScore[] = [];

  for (let journey = 0; journey < 50; journey++) {
    const child = buildChild(journey);
    const profile = buildProfile(child.id, child.family_id);
    const patterns = buildPatterns(child.id, child.family_id);
    const checkins: DailyCheckin[] = [];
    const debriefs: ParentDebrief[] = [];
    const history: { role: "parent" | "assistant"; content: string }[] = [];
    const coachMessages: CoachMessageTurn[] = [];

    for (let day = 1; day <= 30; day++) {
      const theme = dayTheme(journey, day);
      const date = toDateString(30 - day);
      const { message, mood } = parentMessage(theme, day, child.nickname || child.first_name);
      const checkin = buildCheckin(journey, day, theme, date);
      checkins.unshift(checkin);

      const context = assembleChildContext(
        child,
        profile,
        checkins,
        debriefs,
        patterns,
        [],
      );

      const generated = await generateCoachResponse(message, context, history, {
        parentMood: mood,
        coachMessages,
      });

      const text = formatCoachResponse(
        generated.response,
        context,
        memoryForMessage(context, message),
        message,
        history,
        generated.mode,
        generated.enrichment,
      );

      const scores = scoreDay(text, message);
      allScores.push({
        journeyId: `journey-${journey + 1}`,
        day,
        message,
        response: text,
        scores,
        overall: overall(scores),
      });

      history.push({ role: "parent", content: message });
      history.push({ role: "assistant", content: text.slice(0, 320) });
      if (history.length > 30) history.splice(0, history.length - 30);

      coachMessages.push({ role: "parent", content: message, created_at: `${date}T20:00:00.000Z` });
      coachMessages.push({ role: "assistant", content: text.slice(0, 500), created_at: `${date}T20:05:00.000Z` });
      if (coachMessages.length > 120) coachMessages.splice(0, coachMessages.length - 120);

      debriefs.unshift({
        id: `debrief-${journey}-${day}`,
        child_id: child.id,
        family_id: child.family_id,
        user_id: `user-${journey}`,
        parent_message: message,
        likely_trigger: generated.response.likely_trigger,
        behaviour_explanation: generated.response.behaviour_explanation,
        emotional_interpretation: generated.response.emotional_interpretation,
        suggested_response: generated.response.suggested_response,
        things_not_to_say: generated.response.things_not_to_say,
        tomorrow_plan: generated.response.tomorrow_plan,
        long_term_recommendation: generated.response.long_term_recommendation,
        confidence_level: generated.response.confidence_level,
        follow_up_questions: generated.response.follow_up_questions,
        created_at: `${date}T20:05:00.000Z`,
      });
      if (debriefs.length > 20) debriefs.splice(20);
    }
  }

  const avg = (metric: RelationshipMetric | "overall") => {
    const value =
      metric === "overall"
        ? allScores.reduce((sum, s) => sum + s.overall, 0) / allScores.length
        : allScores.reduce((sum, s) => sum + s.scores[metric], 0) / allScores.length;
    return Number(value.toFixed(3));
  };

  const byJourney = Array.from({ length: 50 }, (_, i) => {
    const id = `journey-${i + 1}`;
    const rows = allScores.filter((s) => s.journeyId === id);
    return {
      journeyId: id,
      overall: Number((rows.reduce((sum, r) => sum + r.overall, 0) / rows.length).toFixed(3)),
      firstWeek: Number((rows.slice(0, 7).reduce((sum, r) => sum + r.overall, 0) / 7).toFixed(3)),
      finalWeek: Number((rows.slice(23).reduce((sum, r) => sum + r.overall, 0) / 7).toFixed(3)),
      trustFinalWeek: Number((rows.slice(23).reduce((sum, r) => sum + r.scores.trustGrowth, 0) / 7).toFixed(3)),
      hopeFinalWeek: Number((rows.slice(23).reduce((sum, r) => sum + r.scores.hopeGrowth, 0) / 7).toFixed(3)),
    };
  });

  const summary = {
    label,
    timestamp: new Date().toISOString(),
    journeys: 50,
    daysPerJourney: 30,
    totalConversations: allScores.length,
    averages: {
      emotionalContinuity: avg("emotionalContinuity"),
      memoryRelevance: avg("memoryRelevance"),
      trustGrowth: avg("trustGrowth"),
      hopeGrowth: avg("hopeGrowth"),
      conversationConsistency: avg("conversationConsistency"),
      companionFamiliarity: avg("companionFamiliarity"),
      overallRelationship: avg("overall"),
    },
    byJourney,
    lowest20: [...allScores]
      .sort((a, b) => a.overall - b.overall)
      .slice(0, 20)
      .map((r) => ({
        journeyId: r.journeyId,
        day: r.day,
        overall: r.overall,
        message: r.message,
        response: r.response,
        weakest: Object.entries(r.scores).sort((a, b) => a[1] - b[1]).slice(0, 3),
      })),
  };

  const out = resolve(`.tmp-sprint10-relationship-${label}.json`);
  writeFileSync(out, JSON.stringify(summary, null, 2), "utf8");

  console.log(`Relationship simulation (${label}) complete: ${summary.totalConversations} conversations`);
  console.log(`Overall Relationship: ${summary.averages.overallRelationship}`);
  console.log(`Emotional Continuity: ${summary.averages.emotionalContinuity}`);
  console.log(`Memory Relevance: ${summary.averages.memoryRelevance}`);
  console.log(`Trust Growth: ${summary.averages.trustGrowth}`);
  console.log(`Hope Growth: ${summary.averages.hopeGrowth}`);
  console.log(`Conversation Consistency: ${summary.averages.conversationConsistency}`);
  console.log(`Companion Familiarity: ${summary.averages.companionFamiliarity}`);
  console.log(`Saved: ${out}`);

  return summary;
}

async function run(label: string) {
  const before = await runPass(`${label}_before`, true);
  const after = await runPass(`${label}_after`, false);

  const delta = {
    emotionalContinuity: Number((after.averages.emotionalContinuity - before.averages.emotionalContinuity).toFixed(3)),
    memoryRelevance: Number((after.averages.memoryRelevance - before.averages.memoryRelevance).toFixed(3)),
    trustGrowth: Number((after.averages.trustGrowth - before.averages.trustGrowth).toFixed(3)),
    hopeGrowth: Number((after.averages.hopeGrowth - before.averages.hopeGrowth).toFixed(3)),
    conversationConsistency: Number((after.averages.conversationConsistency - before.averages.conversationConsistency).toFixed(3)),
    companionFamiliarity: Number((after.averages.companionFamiliarity - before.averages.companionFamiliarity).toFixed(3)),
    overallRelationship: Number((after.averages.overallRelationship - before.averages.overallRelationship).toFixed(3)),
  };

  const comparison = {
    label,
    timestamp: new Date().toISOString(),
    journeys: 50,
    daysPerJourney: 30,
    beforeFile: `.tmp-sprint10-relationship-${label}_before.json`,
    afterFile: `.tmp-sprint10-relationship-${label}_after.json`,
    before: before.averages,
    after: after.averages,
    delta,
  };

  const out = resolve(`.tmp-sprint10-relationship-${label}.json`);
  writeFileSync(out, JSON.stringify(comparison, null, 2), "utf8");

  console.log(`Comparison saved: ${out}`);
}

const label = process.argv[2] || "sprint10";

run(label).catch((err) => {
  console.error(err);
  process.exit(1);
});
