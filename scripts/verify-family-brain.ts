/**
 * Phase 3 — Family Brain verification (30+ questions).
 * Run: npm run test:brain
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { memoryForMessage } from "@/lib/ai/child-context";
import { buildFamilyBrain, selectBrainContextForMessage } from "@/lib/intelligence/family-brain";
import type {
  AIInsight,
  Child,
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
  UnifiedTimelineItem,
} from "@/lib/types/database";

const today = new Date().toISOString().split("T")[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

const child: Child = {
  id: "c1",
  family_id: "f1",
  photo_url: null,
  first_name: "Amy",
  nickname: null,
  date_of_birth: "2018-03-15",
  gender: null,
  school: "Oak Primary",
  grade: "2",
  diagnosis: ["Autism", "PDA"],
  support_needs: ["Sensory"],
  interests: ["drawing", "Lego"],
  favourite_activities: [],
  created_at: "",
  updated_at: "",
};

const profile: ChildProfile = {
  id: "p1",
  child_id: "c1",
  family_id: "f1",
  strengths: ["creative", "funny"],
  sensory_preferences: { noise: "sensitive" },
  favourite_things: ["drawing", "quiet corners"],
  known_triggers: ["being rushed", "unexpected change", "crowded shops"],
  calming_strategies: ["quiet corner", "visual timer"],
  support_network: [],
  notes: "Dad uses visual countdown at transitions.",
  medical_history: null,
  medication: ["melatonin evening"],
  challenges: ["morning transitions", "shopping centres"],
  successful_strategies: ["visual timer", "picture schedule", "Dad's countdown"],
  support_team: [{ name: "Dr Patel", role: "paediatrician" }],
  school_contacts: [],
  doctors: [],
  therapists: [{ name: "Sarah", role: "OT" }],
  emergency_notes: null,
  created_at: "",
  updated_at: "",
};

function checkin(
  date: string,
  mood: number,
  anxiety: number,
  sleep: number,
  school: number,
  sensory = 3,
  wins: string[] = [],
  challenges: string[] = [],
  day_type: DailyCheckin["day_type"] = "weekday",
): DailyCheckin {
  return {
    id: `ci-${date}`,
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: date,
    day_type,
    sleep_quality: sleep,
    mood,
    energy: 3,
    school_rating: school,
    anxiety,
    sensory_overload: sensory,
    demand_tolerance: 3,
    appetite: 3,
    social_battery: 3,
    wins,
    challenges,
    notes: null,
    created_at: date,
  };
}

const checkins: DailyCheckin[] = [
  checkin(today, 3, 3, 3, 3, 3, ["Used visual timer before school"], []),
  checkin(weekAgo, 2, 4, 2, 2, 4, [], ["Sensory overload at shopping centre"], "weekend"),
  checkin(twoWeeksAgo, 4, 2, 4, 4, 2, ["Recovered after 20 minutes quiet time"], [], "weekend"),
];

const patterns: PatternFinding[] = [
  {
    id: "p1",
    child_id: "c1",
    family_id: "f1",
    category: "sleep",
    title: "Poor sleep predicts harder school days",
    description: "On days with poor sleep, school tends to be more challenging.",
    confidence: 0.82,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "p2",
    child_id: "c1",
    family_id: "f1",
    category: "mood",
    title: "Mondays have highest anxiety",
    description: "Anxiety tends to peak on Mondays.",
    confidence: 0.75,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const unifiedTimeline: UnifiedTimelineItem[] = [
  {
    id: "u1",
    source: "timeline",
    category: "challenges",
    event_type: "meltdown",
    title: "Sensory overload at shopping centre",
    description: "Recovered after quiet time in the car.",
    event_date: `${weekAgo}T15:00:00Z`,
    day_type: "weekend",
    metadata: { observation_kind: "difficult" },
    ref_id: "e1",
  },
  {
    id: "u2",
    source: "health",
    category: "medication",
    event_type: "medication",
    title: "Melatonin taken",
    description: "Evening dose as usual.",
    event_date: `${today}T20:00:00Z`,
    metadata: {},
    ref_id: "h1",
  },
  {
    id: "u3",
    source: "therapy",
    category: "therapy",
    event_type: "appointment",
    title: "Therapy with Sarah",
    description: "Worked on regulation strategies.",
    event_date: `${twoWeeksAgo}T14:00:00Z`,
    metadata: {},
    ref_id: "t1",
  },
];

const aiInsights: AIInsight[] = [
  {
    id: "i1",
    child_id: "c1",
    family_id: "f1",
    insight_type: "pattern",
    title: "Shopping sensory",
    content: "Shopping remains one of Amy's biggest sensory challenges.",
    confidence: 0.85,
    is_read: false,
    created_at: today,
  },
];

const QUESTIONS = [
  "What helps Amy during shopping?",
  "Why is Monday so hard?",
  "She refused school again today",
  "Poor sleep last night — what should I expect?",
  "Therapy was yesterday — anything to watch for?",
  "What calming strategies have worked before?",
  "Tell me about Dad's countdown",
  "How long does she take to recover?",
  "Weekend mornings are easier — is that normal for us?",
  "What triggers should I watch for?",
  "Medication question — anything from our notes?",
  "School mornings have been better lately",
  "She had a win today with the visual timer",
  "Grandma is visiting — any tips from our history?",
  "Homework meltdown after school",
  "Sensory overload at the supermarket",
  "What does Amy enjoy?",
  "Who is on our support team?",
  "Unexpected change ruined the morning",
  "Quiet time helped yesterday",
  "What patterns are you noticing?",
  "Should I worry about shopping this weekend?",
  "Bedtime was late — tomorrow's plan?",
  "Therapy week felt heavy",
  "What has Child Compass learned about Amy?",
  "School note from teacher — where do we stand?",
  "Meltdown at shoes shop",
  "Choices worked at breakfast",
  "Holiday routine — what helps?",
  "Give me hope from our story",
];

function run() {
  const brain = buildFamilyBrain({
    child,
    profile,
    checkins,
    debriefs: [] as ParentDebrief[],
    patterns,
    timelineEvents: [] as TimelineEvent[],
    unifiedTimeline,
    aiInsights,
    goals: [],
    goalUpdates: [],
    habits: [],
    habitEntries: [],
  });

  const context = assembleChildContext(
    child,
    profile,
    checkins,
    [],
    patterns,
    [],
    {
      child,
      profile,
      checkins,
      debriefs: [],
      patterns,
      timelineEvents: [],
      unifiedTimeline,
      aiInsights,
    },
  );

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  console.log("=== Family Brain — 30 question verification ===\n");
  console.log(`Understanding lines: ${brain.understanding.length}`);
  console.log(`Memory pool: ${brain.memories.length}`);
  console.log(`Insights: ${brain.insightItems.length}\n`);

  for (const q of QUESTIONS) {
    const selected = selectBrainContextForMessage(brain, q);
    const memory = memoryForMessage(context, q);
    const hasFamilySignal =
      selected.understanding.some((l) => l.length > 10) ||
      selected.memoryLines.length > 0 ||
      selected.insightLines.length > 0 ||
      Boolean(memory);

    if (hasFamilySignal) {
      passed++;
      console.log(`✓ ${q.slice(0, 55)}${q.length > 55 ? "…" : ""}`);
    } else {
      failed++;
      failures.push(q);
      console.log(`✗ ${q}`);
    }
  }

  const shopping = selectBrainContextForMessage(brain, "What helps Amy during shopping?");
  const shoppingOk =
    shopping.understanding.some((l) => /shop|sensory|quiet|crowd/i.test(l)) ||
    shopping.memoryLines.some((l) => /shop|sensory|quiet|crowd/i.test(l)) ||
    shopping.insightLines.some((l) => /shop|sensory/i.test(l));

  console.log("\n=== Founder test: shopping ===");
  if (shoppingOk) {
    console.log("✓ Shopping answer draws from THIS family's history");
    passed++;
  } else {
    console.log("✗ Shopping answer lacks family-specific signals");
    failed++;
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log("\nFailed questions:");
    failures.forEach((f) => console.log(`  - ${f}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

run();
