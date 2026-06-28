/**
 * Phase 4 — Insight Engine verification.
 * Run: npm run test:insights
 */
import {
  buildCompanionInsights,
  insightForMessage,
  insightsForReport,
  headlineCompanionInsight,
  type CompanionInsight,
} from "@/lib/intelligence/insight-engine";
import type {
  AIInsight,
  Child,
  ChildProfile,
  DailyCheckin,
  PatternFinding,
  UnifiedTimelineItem,
} from "@/lib/types/database";

const today = new Date().toISOString().split("T")[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];

function lastMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

function lastSunday(): string {
  const d = new Date(lastMonday());
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

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
  interests: ["drawing"],
  favourite_activities: [],
  created_at: "",
  updated_at: "",
};

const profile: ChildProfile = {
  id: "p1",
  child_id: "c1",
  family_id: "f1",
  strengths: ["creative"],
  sensory_preferences: {},
  favourite_things: ["drawing"],
  known_triggers: ["crowded shops", "being rushed"],
  calming_strategies: ["quiet corner"],
  support_network: [],
  notes: "",
  medical_history: null,
  medication: ["melatonin evening"],
  challenges: ["morning transitions", "shopping centres"],
  successful_strategies: ["visual timer", "two choices at transitions"],
  support_team: [],
  school_contacts: [],
  doctors: [],
  therapists: [{ name: "Sarah", role: "OT" }],
  emergency_notes: null,
  created_at: "",
  updated_at: "",
};

function mkCheckin(
  date: string,
  mood: number,
  anxiety: number,
  sleep: number,
  school: number,
  sensory = 3,
  wins: string[] = [],
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
    challenges: [],
    notes: null,
    created_at: date,
  };
}

const monday = lastMonday();
const sunday = lastSunday();

const checkins: DailyCheckin[] = [
  mkCheckin(monday, 2, 4, 3, 2, 4, [], "weekday"),
  mkCheckin(sunday, 3, 3, 2, 3, 3, [], "weekend"),
  mkCheckin(today, 4, 2, 4, 4, 2, ["Two choices worked at breakfast"], "weekday"),
  mkCheckin(weekAgo, 2, 4, 2, 2, 4, [], "weekend"),
  mkCheckin(twoWeeksAgo, 4, 2, 4, 4, 2, ["Recovered after quiet time"], "weekend"),
  mkCheckin(new Date(Date.now() - 21 * 86400000).toISOString().split("T")[0], 3, 3, 2, 2, 3, [], "weekday"),
  mkCheckin(new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0], 5, 2, 4, 4, 2, [], "weekend"),
  mkCheckin(new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0], 5, 2, 4, 4, 2, [], "weekend"),
  mkCheckin(new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0], 2, 4, 2, 2, 4, [], "weekday"),
  mkCheckin(new Date(Date.now() - 35 * 86400000).toISOString().split("T")[0], 2, 4, 2, 2, 4, [], "weekday"),
];

const patterns: PatternFinding[] = [
  {
    id: "p1",
    child_id: "c1",
    family_id: "f1",
    category: "sleep",
    title: "Sleep and school",
    description: "On days with poor sleep, school tends to be more challenging.",
    confidence: 0.82,
    evidence: { occurrences: 3 },
    is_active: true,
    created_at: "",
    updated_at: today,
  },
  {
    id: "p2",
    child_id: "c1",
    family_id: "f1",
    category: "school",
    title: "Monday anxiety",
    description: "Anxiety tends to peak on Monday mornings.",
    confidence: 0.75,
    evidence: { occurrences: 4 },
    is_active: true,
    created_at: "",
    updated_at: today,
  },
];

const unifiedTimeline: UnifiedTimelineItem[] = [
  {
    id: "u1",
    source: "timeline",
    category: "challenges",
    event_type: "meltdown",
    title: "Sensory overload at shopping centre",
    description: "Busy supermarket trip.",
    event_date: `${weekAgo}T15:00:00Z`,
    day_type: "weekend",
    metadata: {},
    ref_id: "e1",
  },
  {
    id: "u2",
    source: "timeline",
    category: "challenges",
    event_type: "meltdown",
    title: "Difficult moment after shoe shopping",
    description: "Crowded shop.",
    event_date: `${twoWeeksAgo}T11:00:00Z`,
    metadata: {},
    ref_id: "e2",
  },
  {
    id: "u3",
    source: "health",
    category: "medication",
    event_type: "medication",
    title: "Melatonin taken",
    description: "Evening dose.",
    event_date: `${today}T20:00:00Z`,
    metadata: {},
    ref_id: "h1",
  },
  {
    id: "u4",
    source: "health",
    category: "medication",
    event_type: "medication",
    title: "Melatonin taken",
    description: "Evening dose.",
    event_date: `${weekAgo}T20:00:00Z`,
    metadata: {},
    ref_id: "h2",
  },
  {
    id: "u5",
    source: "therapy",
    category: "therapy",
    event_type: "appointment",
    title: "Therapy with Sarah",
    description: "Regulation strategies.",
    event_date: `${twoWeeksAgo}T14:00:00Z`,
    metadata: {},
    ref_id: "t1",
  },
  {
    id: "u6",
    source: "therapy",
    category: "therapy",
    event_type: "appointment",
    title: "OT session",
    description: "Transitions work.",
    event_date: `${weekAgo}T14:00:00Z`,
    metadata: {},
    ref_id: "t2",
  },
];

const aiInsights: AIInsight[] = [
  {
    id: "i1",
    child_id: "c1",
    family_id: "f1",
    insight_type: "pattern",
    title: "Recovery improving",
    content: "Recovery after sensory overload has become noticeably quicker.",
    confidence: 0.8,
    is_read: false,
    created_at: today,
  },
];

const input = {
  child,
  profile,
  checkins,
  debriefs: [],
  patterns,
  timelineEvents: [],
  unifiedTimeline,
  aiInsights,
  goals: [],
  goalUpdates: [],
  habits: [],
  habitEntries: [],
};

function assert(condition: boolean, label: string, failures: string[]) {
  if (condition) {
    console.log(`✓ ${label}`);
    return 1;
  }
  console.log(`✗ ${label}`);
  failures.push(label);
  return 0;
}

function hasTopic(insights: CompanionInsight[], topic: string): boolean {
  return insights.some((i) => i.topics.includes(topic) || i.body.toLowerCase().includes(topic));
}

function hasPrefix(insights: CompanionInsight[], prefix: string): boolean {
  return insights.some((i) => i.displayText.startsWith(prefix));
}

function hasSupport(insights: CompanionInsight[]): boolean {
  return insights.some((i) => i.supportingEvents.length > 0);
}

function run() {
  const insights = buildCompanionInsights(input);
  const failures: string[] = [];
  let passed = 0;

  console.log("=== Insight Engine — Phase 4 verification ===\n");
  console.log(`Generated ${insights.length} companion insights\n`);

  passed += assert(insights.length >= 6, "Generates multiple insights from family data", failures);
  passed += assert(hasSupport(insights), "Insights include supporting events", failures);
  passed += assert(
    insights.every((i) => !/\d+%|\d\.\d+ confidence/i.test(i.displayText)),
    "No numeric confidence in display text",
    failures,
  );
  passed += assert(
    insights.every((i) => i.confidenceLabel.length > 0),
    "Every insight has a language confidence label",
    failures,
  );

  console.log("\n--- Pattern categories ---");
  passed += assert(hasTopic(insights, "school") || hasTopic(insights, "morning"), "School patterns", failures);
  passed += assert(hasTopic(insights, "weekend") || hasTopic(insights, "weekday"), "Weekend/weekday rhythm", failures);
  passed += assert(hasTopic(insights, "sleep"), "Sleep relationships", failures);
  passed += assert(hasTopic(insights, "shopping") || hasTopic(insights, "sensory"), "Shopping/sensory", failures);
  passed += assert(hasTopic(insights, "medication"), "Medication observations", failures);
  passed += assert(hasTopic(insights, "therapy"), "Therapy progress", failures);
  passed += assert(
    hasTopic(insights, "transition") || hasTopic(insights, "strategy") || hasTopic(insights, "choice"),
    "Transitions / strategies",
    failures,
  );

  console.log("\n--- Insight types (humble prefixes) ---");
  passed += assert(hasPrefix(insights, "We're beginning to notice"), "Noticing prefix", failures);
  passed += assert(hasPrefix(insights, "Something positive") || hasPrefix(insights, "A strategy that's helping"), "Positive or strategy prefix", failures);
  passed += assert(hasPrefix(insights, "Something worth watching"), "Watching prefix (shopping)", failures);

  console.log("\n--- Coach relevance ---");
  const schoolMatch = insightForMessage(insights, "Monday school morning was hard again");
  passed += assert(Boolean(schoolMatch), "Coach: school/morning message matches insight", failures);

  const shoppingMatch = insightForMessage(insights, "Should we avoid the supermarket this weekend?");
  passed += assert(Boolean(shoppingMatch), "Coach: shopping message matches insight", failures);

  console.log("\n--- Reports ---");
  const teacherInsights = insightsForReport(insights, "teacher_guide");
  passed += assert(teacherInsights.length >= 1, "Teacher Guide gets child-specific insights", failures);
  const passportInsights = insightsForReport(insights, "pda_passport");
  passed += assert(passportInsights.length >= 1, "Passport gets child-specific insights", failures);
  const weeklyInsights = insightsForReport(insights, "weekly_summary");
  passed += assert(weeklyInsights.length >= 1, "Family Summary gets child-specific insights", failures);

  console.log("\n--- Headline ---");
  const headline = headlineCompanionInsight(insights);
  passed += assert(Boolean(headline?.displayText), "Headline insight available for Today", failures);

  console.log("\n--- Sample insights ---");
  for (const i of insights.slice(0, 5)) {
    console.log(`  • ${i.displayText}`);
    if (i.supportingEvents[0]) {
      console.log(`    ↳ ${i.supportingEvents[0].label}`);
    }
  }

  console.log(`\n${passed} checks passed, ${failures.length} failed`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  console.log("\nAll insight engine checks passed.");
}

run();
