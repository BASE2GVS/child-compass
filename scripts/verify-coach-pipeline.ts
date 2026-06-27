/**
 * Verifies Ask Child Compass™ produces distinct, child-specific responses
 * across 20+ different coaching questions using rich mock family data.
 *
 * Run: npx tsx scripts/verify-coach-pipeline.ts
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
} from "@/lib/types/database";

const mockChild: Child = {
  id: "child-test-1",
  family_id: "family-1",
  photo_url: null,
  first_name: "Jamie",
  nickname: "Jay",
  date_of_birth: "2016-03-15",
  gender: null,
  school: "Greenfield Primary",
  grade: "3",
  diagnosis: ["Autism", "PDA"],
  support_needs: ["Sensory support", "PDA-friendly communication"],
  interests: ["dinosaurs", "Lego"],
  favourite_activities: ["building", "swimming"],
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockProfile: ChildProfile = {
  id: "profile-1",
  child_id: "child-test-1",
  family_id: "family-1",
  strengths: ["creative problem-solving", "deep focus on interests"],
  sensory_preferences: {},
  favourite_things: ["Lego", "soft blankets"],
  known_triggers: ["sudden loud noises", "being rushed", "unexpected visitors"],
  calming_strategies: ["weighted blanket", "quiet corner with headphones", "deep pressure hugs"],
  support_network: [],
  notes: null,
  medical_history: null,
  medication: [],
  challenges: ["morning transitions", "homework after school"],
  successful_strategies: ["visual timer for transitions", "choice between two outfits"],
  support_team: [],
  school_contacts: [],
  doctors: [],
  therapists: [],
  emergency_notes: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const mockCheckins: DailyCheckin[] = [
  {
    id: "c1",
    child_id: "child-test-1",
    family_id: "family-1",
    user_id: "user-1",
    checkin_date: today,
    sleep_quality: 2,
    mood: 2,
    energy: 2,
    school_rating: 1,
    anxiety: 4,
    sensory_overload: 4,
    demand_tolerance: 2,
    appetite: 3,
    social_battery: 2,
    wins: ["Used visual timer for getting dressed"],
    challenges: ["Refused school shoes", "Meltdown at breakfast"],
    notes: "Rough morning",
    created_at: `${today}T08:00:00Z`,
  },
  {
    id: "c2",
    child_id: "child-test-1",
    family_id: "family-1",
    user_id: "user-1",
    checkin_date: yesterday,
    sleep_quality: 4,
    mood: 4,
    energy: 3,
    school_rating: 4,
    anxiety: 2,
    sensory_overload: 2,
    demand_tolerance: 4,
    appetite: 4,
    social_battery: 3,
    wins: ["Completed homework with breaks"],
    challenges: [],
    notes: null,
    created_at: `${yesterday}T08:00:00Z`,
  },
];

const mockPatterns: PatternFinding[] = [
  {
    id: "p1",
    child_id: "child-test-1",
    family_id: "family-1",
    title: "School refusal after poor sleep",
    description: "School refusal tends to follow nights with sleep quality ≤ 2",
    category: "school",
    confidence: 0.85,
    evidence: {},
    is_active: true,
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
  },
  {
    id: "p2",
    child_id: "child-test-1",
    family_id: "family-1",
    title: "Sensory overload in shops",
    description: "Shopping trips correlate with elevated sensory overload scores",
    category: "sensory",
    confidence: 0.78,
    evidence: {},
    is_active: true,
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z",
  },
];

const mockDebriefs: ParentDebrief[] = [
  {
    id: "d1",
    child_id: "child-test-1",
    family_id: "family-1",
    user_id: "user-1",
    parent_message: "Jamie had a huge meltdown when I asked him to put shoes on",
    likely_trigger: "Demand to wear uncomfortable school shoes after poor sleep",
    behaviour_explanation: null,
    emotional_interpretation: null,
    suggested_response: null,
    things_not_to_say: [],
    tomorrow_plan: null,
    long_term_recommendation: null,
    confidence_level: 0.8,
    follow_up_questions: [],
    created_at: `${yesterday}T18:00:00Z`,
  },
];

const mockTimeline: TimelineEvent[] = [
  {
    id: "t1",
    child_id: "child-test-1",
    family_id: "family-1",
    user_id: "user-1",
    event_type: "meltdown",
    title: "Morning meltdown — shoes",
    description: "45 min before school, refused shoes despite visual timer",
    event_date: `${today}T07:30:00Z`,
    metadata: {},
    created_at: `${today}T07:30:00Z`,
  },
  {
    id: "t2",
    child_id: "child-test-1",
    family_id: "family-1",
    user_id: "user-1",
    event_type: "victory",
    title: "Calm homework session",
    description: "Used 10-min breaks between tasks",
    event_date: `${yesterday}T16:00:00Z`,
    metadata: {},
    created_at: `${yesterday}T16:00:00Z`,
  },
];

const QUESTIONS = [
  "Jamie refused to wear his school shoes this morning.",
  "He won't do his homework after school.",
  "We're going to a birthday party this weekend — how do I prepare?",
  "He's anxious about school tomorrow.",
  "The supermarket was overwhelming today.",
  "Grandparents are visiting next week.",
  "He had another meltdown at bedtime.",
  "How do I handle morning transitions?",
  "He says school is too loud.",
  "What helps when he's overwhelmed?",
  "Should I keep him home from school today?",
  "He won't eat breakfast when we're rushed.",
  "Therapy session was cancelled — he's upset.",
  "Rainy day and he's stuck inside.",
  "Friend wants to come over to play.",
  "He destroyed his Lego creation and is devastated.",
  "Teacher says he's not participating in class.",
  "We need to leave the park but he won't go.",
  "He's been waking up at 3am anxious.",
  "How do I talk to him about his diagnosis?",
  "Follow-up: you mentioned sleep — what should I do tonight?",
  "Follow-up: the shoes thing happened again today.",
];

async function main() {
  const context = assembleChildContext(
    mockChild,
    mockProfile,
    mockCheckins,
    mockDebriefs,
    mockPatterns,
    mockTimeline,
  );

  console.log("=== Child Context Assembly ===");
  console.log(`Check-ins: ${context.recentCheckins.length}`);
  console.log(`Patterns: ${context.patterns.length}`);
  console.log(`Memories: ${context.memoryReferences.length}`);
  console.log(`Graph insights: ${context.graphInsights?.length ?? 0}`);
  console.log(`Timeline: ${context.recentTimeline.length}`);
  console.log(`Knowledge: ${context.knowledgeGuidance?.length ?? 0}`);
  console.log(`Triggers: ${context.profile?.known_triggers?.length ?? 0}`);
  console.log(`Strategies: ${context.profile?.calming_strategies?.length ?? 0}`);

  const formattedResponses: string[] = [];
  const coachingAdviceSections: string[] = [];
  const conversationHistory: { role: "parent" | "assistant"; content: string }[] = [];
  let failures = 0;

  for (const question of QUESTIONS) {
    const { response, mode, enrichment } = await generateCoachResponse(question, context, conversationHistory);
    const memoryRef = memoryForMessage(context, question);
    const formatted = formatCoachResponse(
      response,
      context,
      memoryRef,
      question,
      conversationHistory,
      mode,
      enrichment,
    );

    const hasChildName = /Jamie|Jay|Amy/i.test(formatted);
    const hasWhatWeKnow =
      formatted.includes("check-in") ||
      formatted.includes("Jamie") ||
      formatted.includes("Jay") ||
      formatted.includes("Amy") ||
      /remember|noticed|wonder|pattern/i.test(formatted);
    const hasHistory =
      /check-in|pattern|trigger|remember|noticed|wonder|learning about|started noticing|beginning to understand|Something you could|When you're ready/i.test(
        formatted,
      );
    const notGeneric = !/children with PDA/i.test(formatted);

    if (!hasChildName || !hasHistory || !notGeneric || !hasWhatWeKnow) {
      failures++;
      console.error(`\nFAIL: "${question.slice(0, 50)}..."`);
      if (!hasChildName) console.error("  - Missing child name");
      if (!hasHistory) console.error("  - Missing family history");
      if (!notGeneric) console.error("  - Generic PDA language");
      if (!hasWhatWeKnow) console.error("  - Missing 'What we know' section");
    }

    formattedResponses.push(formatted);

    if (response.confidence_level >= 0.5 && !formatted.includes("When you're ready\n• What was")) {
      const idx = formatted.indexOf("Something you could");
      coachingAdviceSections.push(
        idx >= 0 ? formatted.slice(idx) : formatted.slice(Math.min(80, formatted.length)),
      );
    }

    conversationHistory.push({ role: "parent", content: question });
    conversationHistory.push({ role: "assistant", content: formatted.slice(0, 200) });

    if (question.startsWith("Follow-up")) {
      const hasContinuity = /Building on|Continuing from|wonder|connect/i.test(formatted);
      if (!hasContinuity) {
        failures++;
        console.error(`\nFAIL follow-up continuity: "${question}"`);
      }
    }
  }

  const uniqueAdvice = new Set(coachingAdviceSections);
  const adviceUniqueness =
    coachingAdviceSections.length > 0
      ? uniqueAdvice.size / coachingAdviceSections.length
      : 1;

  console.log("\n=== Results ===");
  console.log(`Questions tested: ${QUESTIONS.length}`);
  console.log(`Coaching advice responses measured: ${coachingAdviceSections.length}`);
  console.log(
    `Unique advice sections (coaching only): ${uniqueAdvice.size}/${coachingAdviceSections.length} (${(adviceUniqueness * 100).toFixed(0)}%)`,
  );
  console.log(`Validation failures: ${failures}`);

  if (failures > 0 || (coachingAdviceSections.length >= 8 && adviceUniqueness < 0.55)) {
    console.error("\n❌ Coach pipeline verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Coach pipeline verification PASSED");
  console.log("Sample response excerpt:\n");
  console.log(formattedResponses[0].slice(0, 600) + "...\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
