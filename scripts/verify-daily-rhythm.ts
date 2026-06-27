/**
 * Phase 5 — Daily rhythm verification (50+ scenarios).
 * Run: npm run test:rhythm
 */
import { getDayPhase } from "@/lib/companion/daily-rhythm";
import { buildMorningGuide } from "@/lib/companion/morning-guide";
import { buildEveningReflection } from "@/lib/companion/evening-reflection";
import { buildDayJourney } from "@/lib/companion/day-journey";
import { buildContextualNextStep } from "@/lib/companion/contextual-next-step";
import { buildGentlePrompt } from "@/lib/companion/gentle-prompts";
import type { CoachMessage, DailyCheckin, PatternFinding } from "@/lib/types/database";

const today = new Date().toISOString().split("T")[0];

function ci(
  date: string,
  mood = 3,
  sleep = 3,
  school = 3,
  wins: string[] = [],
  challenges: string[] = [],
): DailyCheckin {
  return {
    id: date,
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: date,
    sleep_quality: sleep,
    mood,
    energy: 3,
    school_rating: school,
    anxiety: 3,
    sensory_overload: 3,
    demand_tolerance: 3,
    appetite: 3,
    social_battery: 3,
    wins,
    challenges,
    notes: null,
    created_at: date,
  };
}

const patterns: PatternFinding[] = [
  {
    id: "p1",
    child_id: "c1",
    family_id: "f1",
    category: "school",
    title: "Mornings",
    description: "School mornings need extra emotional energy",
    confidence: 0.8,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const SCENARIOS: {
  name: string;
  hour: number;
  checkin: DailyCheckin | null;
  messages: CoachMessage[];
  expectPrimary?: string;
}[] = [];

for (let h = 5; h <= 22; h++) {
  SCENARIOS.push({
    name: `hour-${h}-no-checkin`,
    hour: h,
    checkin: null,
    messages: [],
    expectPrimary: h < 11 || h >= 18 ? "checkin" : "checkin",
  });
}

for (let i = 0; i < 35; i++) {
  SCENARIOS.push({
    name: `with-checkin-${i}`,
    hour: 8 + (i % 12),
    checkin: ci(today, 2 + (i % 3), 2 + (i % 2), 3),
    messages: i % 3 === 0
      ? [{
          id: `m${i}`,
          role: "parent" as const,
          content: "help",
          session_id: "s",
          metadata: {},
          created_at: `${today}T10:00:00Z`,
        }]
      : [],
  });
}

let failures = 0;

for (const s of SCENARIOS) {
  const phase = getDayPhase(s.hour);

  const morning = buildMorningGuide({
    parentName: "Sam",
    childName: "Amy",
    checkin: s.checkin,
    yesterdayCheckin: null,
    weekCheckins: s.checkin ? [s.checkin] : [],
    coachMessages: s.messages,
    patterns,
    recommendation: null,
    headlineInsight: null,
    weeklyTrend: null,
  });

  if (!morning.greeting || !morning.gentleRecommendation) {
    failures++;
    console.error(`FAIL morning empty: ${s.name}`);
  }

  if (/pattern|graph|knowledge|AI|algorithm/i.test(morning.greeting + morning.noticing)) {
    failures++;
    console.error(`FAIL tech language morning: ${s.name}`);
  }

  const evening = buildEveningReflection({
    childName: "Amy",
    checkin: s.checkin,
    yesterdayCheckin: null,
    coachMessages: s.messages,
    patterns,
    weeklyTrend: "stable",
  });

  if (!evening.learned || !evening.encouraging || !evening.tomorrowMind) {
    failures++;
    console.error(`FAIL evening empty: ${s.name}`);
  }

  const journey = buildDayJourney({
    phase,
    hasCheckinToday: Boolean(s.checkin),
    coachMessages: s.messages,
    hasPatterns: true,
  });

  if (journey.length !== 5) {
    failures++;
    console.error(`FAIL journey steps: ${s.name}`);
  }

  const next = buildContextualNextStep({
    phase,
    childId: "c1",
    childName: "Amy",
    checkin: s.checkin,
    coachMessages: s.messages,
    patterns,
  });

  if (!next.primary.label) {
    failures++;
    console.error(`FAIL no primary action: ${s.name}`);
  }

  const prompt = buildGentlePrompt({
    phase: phase === "day" ? "day" : "morning",
    childId: "c1",
    childName: "Amy",
    hasCheckinToday: Boolean(s.checkin),
    talkedToday: s.messages.length > 0,
    dismissedIds: [],
    hour: s.hour,
  });

  if (prompt && /interrupt|must|required/i.test(prompt.message)) {
    failures++;
    console.error(`FAIL pushy prompt: ${s.name}`);
  }
}

const morningPhases = [5, 8, 10].map((h) => getDayPhase(h));
const eveningPhases = [18, 20, 22].map((h) => getDayPhase(h));

if (!morningPhases.every((p) => p === "morning")) {
  failures++;
  console.error("FAIL morning phase detection");
}
if (!eveningPhases.every((p) => p === "evening")) {
  failures++;
  console.error("FAIL evening phase detection");
}

const noCheckinNext = buildContextualNextStep({
  phase: "morning",
  childId: "c1",
  childName: "Amy",
  checkin: null,
  coachMessages: [],
  patterns,
});
if (noCheckinNext.primary.id !== "checkin") {
  failures++;
  console.error("FAIL no-checkin should suggest checkin");
}

console.log("=== Phase 5 Daily Rhythm ===");
console.log(`Scenarios: ${SCENARIOS.length}`);
console.log(`Failures: ${failures}`);

if (failures > 0 || SCENARIOS.length < 50) {
  console.error("\n❌ Phase 5 verification FAILED");
  process.exit(1);
}

console.log("\n✅ Phase 5 verification PASSED");
