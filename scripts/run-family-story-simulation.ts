import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { assembleChildContext, memoryForMessage } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { buildCurrentFamilyChapter } from "@/lib/intelligence/family-story-engine";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
} from "@/lib/types/database";
import type { CoachMessageTurn } from "@/lib/companion/cross-day-continuity";

type StoryMetric =
  | "storyCoherence"
  | "narrativeContinuity"
  | "memoryUsefulness"
  | "relationshipDepth"
  | "parentRecognition"
  | "companionFamiliarity";

type DayRow = {
  journeyId: string;
  day: number;
  message: string;
  chapter: string;
  response: string;
  scores: Record<StoryMetric, number>;
  overallRelationshipScore: number;
};

type JourneyNarrativeCheck = {
  journeyId: string;
  chapterEvolves: boolean;
  avoidsStaleRepetition: boolean;
  recognisesTurningPoints: boolean;
  preservesMeaningfulProgress: boolean;
  reflectsSetbacksWithoutDefiningFamily: boolean;
};

const WEIGHTS: Record<StoryMetric, number> = {
  storyCoherence: 0.2,
  narrativeContinuity: 0.16,
  memoryUsefulness: 0.15,
  relationshipDepth: 0.16,
  parentRecognition: 0.16,
  companionFamiliarity: 0.17,
};

const NAMES = ["Amy", "Noah", "Mia", "Leo", "Ava", "Eli", "Ruby", "Max", "Isla", "Finn"];

const THEME_ORDER = [
  "morning",
  "school",
  "sleep",
  "sensory",
  "transition",
  "meltdown",
  "celebration",
  "setback",
] as const;

const PARENT_RECOGNITION_MARKERS = /\b(hard|heavy|makes sense|you are carrying|you're not alone|i hear you|that sounds)\b/i;
const FAMILIARITY_MARKERS = /\b(your family|this season|you've been|again|still|lately|we can keep building)\b/i;
const DEPTH_MARKERS = /\b(what you've been living through|long arc|setback|progress|chapter|pattern)\b/i;

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Number(n.toFixed(2))));
}

function seeded(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h / 4294967295;
}

function dateFor(offsetDays: number): string {
  return new Date(Date.now() - offsetDays * 86400000).toISOString().split("T")[0];
}

function childFor(journey: number): Child {
  const name = NAMES[journey % NAMES.length];
  return {
    id: `fs-child-${journey}`,
    family_id: `fs-family-${journey}`,
    photo_url: null,
    first_name: name,
    nickname: journey % 5 === 0 ? `${name}y` : null,
    date_of_birth: null,
    gender: null,
    school: "Oak Primary",
    grade: `${(journey % 4) + 1}`,
    diagnosis: journey % 2 === 0 ? ["Autism", "PDA"] : ["ADHD", "Anxiety"],
    support_needs: ["Transitions", "Sensory", "Regulation"],
    interests: ["Drawing", "Animals", "Minecraft"],
    favourite_activities: [],
    created_at: "",
    updated_at: "",
  };
}

function profileFor(childId: string, familyId: string): ChildProfile {
  return {
    id: `fs-profile-${childId}`,
    child_id: childId,
    family_id: familyId,
    strengths: ["kind", "curious", "funny"],
    sensory_preferences: {},
    favourite_things: [],
    known_triggers: ["being rushed", "unexpected changes", "crowded places"],
    calming_strategies: ["quiet corner", "visual countdown", "co-regulated breathing"],
    support_network: [],
    notes: null,
    medical_history: null,
    medication: [],
    challenges: [],
    successful_strategies: ["transition preview", "offering two choices"],
    support_team: [],
    school_contacts: [],
    doctors: [],
    therapists: [],
    emergency_notes: null,
    created_at: "",
    updated_at: "",
  };
}

function patternsFor(childId: string, familyId: string): PatternFinding[] {
  return [
    {
      id: `fs-pattern-${childId}-1`,
      child_id: childId,
      family_id: familyId,
      category: "school",
      title: "Morning pressure pattern",
      description: "Mornings are harder when sleep is poor and transitions feel rushed.",
      confidence: 0.8,
      evidence: {},
      is_active: true,
      created_at: "",
      updated_at: "",
    },
    {
      id: `fs-pattern-${childId}-2`,
      child_id: childId,
      family_id: familyId,
      category: "sensory",
      title: "Public sensory pattern",
      description: "Crowded noise often raises anxiety and lowers demand tolerance.",
      confidence: 0.75,
      evidence: {},
      is_active: true,
      created_at: "",
      updated_at: "",
    },
  ];
}

function themeFor(journey: number, day: number): (typeof THEME_ORDER)[number] {
  return THEME_ORDER[(journey + day) % THEME_ORDER.length];
}

function messageFor(theme: string, day: number, childName: string): { text: string; mood: ParentMood | null } {
  const early = day <= 30;
  const middle = day > 30 && day <= 60;

  if (theme === "morning") {
    return {
      text: early
        ? `Morning was chaos again and I already feel defeated before school for ${childName}.`
        : `Mornings are a bit up and down lately; today slid back and I need one gentle reset.`,
      mood: "worried",
    };
  }
  if (theme === "school") {
    return {
      text: middle
        ? `School refusal is still inconsistent. We had some better days but I'm scared of losing progress.`
        : `Drop-off blew up again and I'm spiraling about tomorrow.`,
      mood: "worried",
    };
  }
  if (theme === "sleep") {
    return {
      text: `Sleep has been rough and we're all exhausted. Please keep this very simple.`,
      mood: "exhausted",
    };
  }
  if (theme === "sensory") {
    return {
      text: `Public noise was too much today. We did recover, but I still feel shaken by it.`,
      mood: "need_to_talk",
    };
  }
  if (theme === "transition") {
    return {
      text: `Transitions are still hard. Is there one thing we should repeat tomorrow?`,
      mood: null,
    };
  }
  if (theme === "meltdown") {
    return {
      text: `The meltdown was intense and I feel discouraged again.`,
      mood: "need_to_talk",
    };
  }
  if (theme === "celebration") {
    return {
      text: `We had a calmer day and ${childName} asked for help before escalating. I want to protect this progress.`,
      mood: null,
    };
  }
  return {
    text: `We had a setback after better days and I feel like we're back at the start. How do we recover without panic?`,
    mood: "need_to_talk",
  };
}

function checkinFor(journey: number, day: number, theme: string, date: string): DailyCheckin {
  const phase = day > 60 ? 1.2 : day > 30 ? 0.7 : 0.2;
  const wobble = (seeded(`${journey}-${day}-story`) - 0.5) * 1.1;

  let mood = 2.3 + phase + wobble;
  let anxiety = 3.8 - phase + Math.abs(wobble) * 0.45;
  let demand = 2.2 + phase + wobble * 0.35;
  let sleep = 2.4 + phase * 0.6;

  if (theme === "sleep") {
    sleep -= 0.8;
    anxiety += 0.4;
  }
  if (theme === "sensory") {
    anxiety += 0.5;
    demand -= 0.3;
  }
  if (theme === "setback" || theme === "meltdown") {
    mood -= 0.6;
    anxiety += 0.6;
  }
  if (theme === "celebration") {
    mood += 0.7;
    anxiety -= 0.4;
  }

  const wins =
    theme === "celebration"
      ? ["Asked for help before escalation", "Recovered faster after school"]
      : day % 12 === 0
        ? ["One calmer transition today"]
        : [];

  const challenges = [
    theme === "morning"
      ? "Morning transition to school felt rushed"
      : theme === "school"
        ? "School drop-off distress"
        : theme === "sleep"
          ? "Bedtime resistance and repeated waking"
          : theme === "sensory"
            ? "Noise overload in crowded places"
            : theme === "transition"
              ? "Activity switch conflict"
              : "Meltdown recovery took longer than hoped",
  ];

  return {
    id: `fs-checkin-${journey}-${day}`,
    child_id: `fs-child-${journey}`,
    family_id: `fs-family-${journey}`,
    user_id: `fs-user-${journey}`,
    checkin_date: date,
    sleep_quality: clamp(sleep),
    mood: clamp(mood),
    energy: clamp(2.8 + phase * 0.6 + wobble * 0.2),
    school_rating: clamp(2.5 + phase * 0.7 + wobble * 0.25),
    anxiety: clamp(anxiety),
    sensory_overload: clamp(3.2 + (theme === "sensory" ? 1 : 0) - phase * 0.4),
    demand_tolerance: clamp(demand),
    appetite: clamp(3 + wobble * 0.2),
    social_battery: clamp(3 + wobble * 0.2),
    wins,
    challenges,
    notes: challenges[0],
    created_at: `${date}T20:00:00.000Z`,
  };
}

function tokenize(value: string): Set<string> {
  const words = value.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  return new Set(words);
}

function jaccard(a: string, b: string): number {
  const aa = tokenize(a);
  const bb = tokenize(b);
  if (!aa.size && !bb.size) return 1;
  let inter = 0;
  for (const t of aa) if (bb.has(t)) inter++;
  const union = aa.size + bb.size - inter;
  return union ? inter / union : 1;
}

function chapterScores(chapter: string, previousChapter: string | null): Pick<Record<StoryMetric, number>, "storyCoherence" | "narrativeContinuity" | "memoryUsefulness" | "companionFamiliarity"> {
  const words = chapter.trim().split(/\s+/).filter(Boolean).length;
  const hasCoreParts =
    /\b(working through|chapter)\b/i.test(chapter) &&
    /\b(what is still hard|still hard)\b/i.test(chapter) &&
    /\b(what has helped|helped)\b/i.test(chapter) &&
    /\b(should not be forgotten|not be forgotten)\b/i.test(chapter);

  let storyCoherence = 5;
  if (words >= 140 && words <= 280) storyCoherence += 2;
  if (hasCoreParts) storyCoherence += 2;
  if (words > 310) storyCoherence -= 1;

  let narrativeContinuity = 5;
  if (/\b(progress|setback|again|still|lately|season|long arc|chapter)\b/i.test(chapter)) narrativeContinuity += 2;
  if (previousChapter) {
    const overlap = jaccard(previousChapter, chapter);
    if (overlap > 0.96) narrativeContinuity -= 2;
    if (overlap >= 0.72 && overlap <= 0.93) narrativeContinuity += 1;
  }

  let memoryUsefulness = 5;
  if (/\b(morning|school|sleep|sensory|transition|meltdown|recovery|strategy)\b/i.test(chapter)) memoryUsefulness += 2;
  if (/\b(asked for help|calmer|recovered faster|countdown|choice)\b/i.test(chapter)) memoryUsefulness += 1.5;

  let companionFamiliarity = 5;
  if (/\b(this family|this season|you have kept showing up|living through)\b/i.test(chapter)) companionFamiliarity += 2;
  if (/\b(not be forgotten)\b/i.test(chapter)) companionFamiliarity += 1;

  return {
    storyCoherence: clamp(storyCoherence),
    narrativeContinuity: clamp(narrativeContinuity),
    memoryUsefulness: clamp(memoryUsefulness),
    companionFamiliarity: clamp(companionFamiliarity),
  };
}

function responseScores(response: string): Pick<Record<StoryMetric, number>, "relationshipDepth" | "parentRecognition" | "companionFamiliarity"> {
  let relationshipDepth = 5;
  if (DEPTH_MARKERS.test(response)) relationshipDepth += 2;
  if (/\b(one gentle step|next step|tomorrow)\b/i.test(response)) relationshipDepth += 1;

  let parentRecognition = 5;
  if (PARENT_RECOGNITION_MARKERS.test(response)) parentRecognition += 2.5;
  if (/\b(you should|you need to)\b/i.test(response)) parentRecognition -= 1.5;

  let familiarity = 5;
  if (FAMILIARITY_MARKERS.test(response)) familiarity += 2;

  return {
    relationshipDepth: clamp(relationshipDepth),
    parentRecognition: clamp(parentRecognition),
    companionFamiliarity: clamp((familiarity + relationshipDepth * 0.25) / 1.25),
  };
}

function buildLegacyMemorySummary(context: ReturnType<typeof assembleChildContext>): string {
  const name = context.child.nickname || context.child.first_name;
  const memories = context.memoryReferences.slice(0, 6);
  const patterns = context.patterns.slice(0, 3).map((p) => p.description);
  const wins = context.recentCheckins.slice(0, 4).flatMap((c) => c.wins ?? []).slice(0, 3);

  const lines = [
    `Family summary for ${name}:`,
    "Recent relevant memories:",
    ...memories.map((m) => `- ${m}`),
    "Active patterns:",
    ...patterns.map((p) => `- ${p}`),
    "Recent wins:",
    ...wins.map((w) => `- ${w}`),
  ];

  return lines.join(" ");
}

function overall(scores: Record<StoryMetric, number>): number {
  const weighted = (Object.keys(WEIGHTS) as StoryMetric[])
    .reduce((sum, key) => sum + scores[key] * WEIGHTS[key], 0);
  return clamp(weighted);
}

function evaluateJourney(rows: DayRow[]): JourneyNarrativeCheck {
  const chapters = rows.map((r) => r.chapter);
  let staleDays = 0;
  let turningPoints = 0;
  let balancedSetbacks = 0;

  for (let i = 1; i < chapters.length; i++) {
    if (jaccard(chapters[i - 1], chapters[i]) > 0.96) staleDays++;
  }

  for (const row of rows) {
    if (/\b(progress|turning point|asked for help|recovered faster|small wins)\b/i.test(row.chapter)) {
      turningPoints++;
    }
    if (/\b(setback|hard)\b/i.test(row.chapter) && /\b(progress|still real|small wins|long arc)\b/i.test(row.chapter)) {
      balancedSetbacks++;
    }
  }

  const firstWeek = rows.slice(0, 7).reduce((s, r) => s + r.overallRelationshipScore, 0) / 7;
  const finalWeek = rows.slice(-7).reduce((s, r) => s + r.overallRelationshipScore, 0) / 7;

  return {
    journeyId: rows[0]?.journeyId ?? "unknown",
    chapterEvolves: new Set(chapters).size >= 20,
    avoidsStaleRepetition: staleDays <= 10,
    recognisesTurningPoints: turningPoints >= 12,
    preservesMeaningfulProgress: finalWeek >= firstWeek,
    reflectsSetbacksWithoutDefiningFamily: balancedSetbacks >= 8,
  };
}

async function runPass(label: string, disableEngine: boolean) {
  process.env.FAMILY_STORY_ENGINE_DISABLED = disableEngine ? "1" : "0";

  const rows: DayRow[] = [];
  const journeyChecks: JourneyNarrativeCheck[] = [];

  for (let journey = 0; journey < 50; journey++) {
    const child = childFor(journey);
    const profile = profileFor(child.id, child.family_id);
    const patterns = patternsFor(child.id, child.family_id);
    const checkins: DailyCheckin[] = [];
    const debriefs: ParentDebrief[] = [];
    const history: { role: "parent" | "assistant"; content: string }[] = [];
    const coachMessages: CoachMessageTurn[] = [];
    const perJourneyRows: DayRow[] = [];
    let previousChapter: string | null = null;

    for (let day = 1; day <= 90; day++) {
      const theme = themeFor(journey, day);
      const date = dateFor(90 - day);
      const prompt = messageFor(theme, day, child.nickname || child.first_name);
      const checkin = checkinFor(journey, day, theme, date);
      checkins.unshift(checkin);

      const context = assembleChildContext(child, profile, checkins, debriefs, patterns, []);
      const chapter = disableEngine
        ? buildLegacyMemorySummary(context)
        : buildCurrentFamilyChapter(context, context.memoryReferences).chapter;

      const generated = await generateCoachResponse(prompt.text, context, history, {
        parentMood: prompt.mood,
        coachMessages,
      });

      const response = formatCoachResponse(
        generated.response,
        context,
        memoryForMessage(context, prompt.text),
        prompt.text,
        history,
        generated.mode,
        generated.enrichment,
      );

      const c = chapterScores(chapter, previousChapter);
      const r = responseScores(response);
      const combined: Record<StoryMetric, number> = {
        storyCoherence: c.storyCoherence,
        narrativeContinuity: c.narrativeContinuity,
        memoryUsefulness: c.memoryUsefulness,
        relationshipDepth: r.relationshipDepth,
        parentRecognition: r.parentRecognition,
        companionFamiliarity: clamp((c.companionFamiliarity + r.companionFamiliarity) / 2),
      };

      const row: DayRow = {
        journeyId: `journey-${journey + 1}`,
        day,
        message: prompt.text,
        chapter,
        response,
        scores: combined,
        overallRelationshipScore: overall(combined),
      };

      rows.push(row);
      perJourneyRows.push(row);
      previousChapter = chapter;

      history.push({ role: "parent", content: prompt.text });
      history.push({ role: "assistant", content: response.slice(0, 320) });
      if (history.length > 40) history.splice(0, history.length - 40);

      coachMessages.push({ role: "parent", content: prompt.text, created_at: `${date}T20:00:00.000Z` });
      coachMessages.push({ role: "assistant", content: response.slice(0, 500), created_at: `${date}T20:05:00.000Z` });
      if (coachMessages.length > 180) coachMessages.splice(0, coachMessages.length - 180);

      debriefs.unshift({
        id: `fs-debrief-${journey}-${day}`,
        child_id: child.id,
        family_id: child.family_id,
        user_id: `fs-user-${journey}`,
        parent_message: prompt.text,
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
      if (debriefs.length > 35) debriefs.splice(35);
    }

    journeyChecks.push(evaluateJourney(perJourneyRows));
  }

  const avg = (key: StoryMetric | "overallRelationshipScore") => {
    const value =
      key === "overallRelationshipScore"
        ? rows.reduce((sum, r) => sum + r.overallRelationshipScore, 0) / rows.length
        : rows.reduce((sum, r) => sum + r.scores[key], 0) / rows.length;
    return Number(value.toFixed(3));
  };

  const trueRate = (selector: (r: JourneyNarrativeCheck) => boolean) =>
    Number((journeyChecks.filter(selector).length / journeyChecks.length).toFixed(3));

  const summary = {
    label,
    timestamp: new Date().toISOString(),
    journeys: 50,
    daysPerJourney: 90,
    totalConversations: rows.length,
    averages: {
      storyCoherence: avg("storyCoherence"),
      narrativeContinuity: avg("narrativeContinuity"),
      memoryUsefulness: avg("memoryUsefulness"),
      relationshipDepth: avg("relationshipDepth"),
      parentRecognition: avg("parentRecognition"),
      companionFamiliarity: avg("companionFamiliarity"),
      overallRelationshipScore: avg("overallRelationshipScore"),
    },
    journeyValidationRates: {
      chapterEvolves: trueRate((r) => r.chapterEvolves),
      avoidsStaleRepetition: trueRate((r) => r.avoidsStaleRepetition),
      recognisesTurningPoints: trueRate((r) => r.recognisesTurningPoints),
      preservesMeaningfulProgress: trueRate((r) => r.preservesMeaningfulProgress),
      reflectsSetbacksWithoutDefiningFamily: trueRate((r) => r.reflectsSetbacksWithoutDefiningFamily),
    },
    journeyChecks,
    lowest20: [...rows]
      .sort((a, b) => a.overallRelationshipScore - b.overallRelationshipScore)
      .slice(0, 20)
      .map((r) => ({
        journeyId: r.journeyId,
        day: r.day,
        overallRelationshipScore: r.overallRelationshipScore,
        weakest: Object.entries(r.scores).sort((a, b) => a[1] - b[1]).slice(0, 3),
        message: r.message,
        chapter: r.chapter,
        response: r.response,
      })),
  };

  const out = resolve(`.tmp-sprint11-family-story-${label}.json`);
  writeFileSync(out, JSON.stringify(summary, null, 2), "utf8");

  console.log(`Family story simulation (${label}) complete: ${summary.totalConversations} conversations`);
  console.log(`Overall Relationship Score: ${summary.averages.overallRelationshipScore}`);
  console.log(`Story Coherence: ${summary.averages.storyCoherence}`);
  console.log(`Narrative Continuity: ${summary.averages.narrativeContinuity}`);
  console.log(`Memory Usefulness: ${summary.averages.memoryUsefulness}`);
  console.log(`Relationship Depth: ${summary.averages.relationshipDepth}`);
  console.log(`Parent Recognition: ${summary.averages.parentRecognition}`);
  console.log(`Companion Familiarity: ${summary.averages.companionFamiliarity}`);
  console.log(`Saved: ${out}`);

  return summary;
}

async function run(label: string) {
  const before = await runPass(`${label}_before`, true);
  const after = await runPass(`${label}_after`, false);

  const delta = {
    storyCoherence: Number((after.averages.storyCoherence - before.averages.storyCoherence).toFixed(3)),
    narrativeContinuity: Number((after.averages.narrativeContinuity - before.averages.narrativeContinuity).toFixed(3)),
    memoryUsefulness: Number((after.averages.memoryUsefulness - before.averages.memoryUsefulness).toFixed(3)),
    relationshipDepth: Number((after.averages.relationshipDepth - before.averages.relationshipDepth).toFixed(3)),
    parentRecognition: Number((after.averages.parentRecognition - before.averages.parentRecognition).toFixed(3)),
    companionFamiliarity: Number((after.averages.companionFamiliarity - before.averages.companionFamiliarity).toFixed(3)),
    overallRelationshipScore: Number((after.averages.overallRelationshipScore - before.averages.overallRelationshipScore).toFixed(3)),
  };

  const compare = {
    label,
    timestamp: new Date().toISOString(),
    journeys: 50,
    daysPerJourney: 90,
    beforeFile: `.tmp-sprint11-family-story-${label}_before.json`,
    afterFile: `.tmp-sprint11-family-story-${label}_after.json`,
    before: before.averages,
    after: after.averages,
    beforeJourneyValidationRates: before.journeyValidationRates,
    afterJourneyValidationRates: after.journeyValidationRates,
    delta,
  };

  const out = resolve(`.tmp-sprint11-family-story-${label}.json`);
  writeFileSync(out, JSON.stringify(compare, null, 2), "utf8");
  console.log(`Comparison saved: ${out}`);
}

const label = process.argv[2] || "sprint11";

run(label).catch((err) => {
  console.error(err);
  process.exit(1);
});
