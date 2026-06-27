/**
 * Phase 2 companion conversation verification — 25+ scenarios.
 * Run: npx tsx scripts/verify-companion-conversations.ts
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { detectCoachMode } from "@/lib/ai/coach-mode";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { buildDailyWelcome, buildWelcomeContext } from "@/lib/companion/daily-welcome";
import { needsClarification } from "@/lib/companion/conversation-intelligence";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  PatternFinding,
  TimelineEvent,
} from "@/lib/types/database";

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const mockChild: Child = {
  id: "c1",
  family_id: "f1",
  photo_url: null,
  first_name: "Amy",
  nickname: null,
  date_of_birth: null,
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

const mockProfile: ChildProfile = {
  id: "p1",
  child_id: "c1",
  family_id: "f1",
  strengths: ["creative"],
  sensory_preferences: {},
  favourite_things: [],
  known_triggers: ["being rushed"],
  calming_strategies: ["quiet corner"],
  support_network: [],
  notes: null,
  medical_history: null,
  medication: [],
  challenges: [],
  successful_strategies: ["visual timer"],
  support_team: [],
  school_contacts: [],
  doctors: [],
  therapists: [],
  emergency_notes: null,
  created_at: "",
  updated_at: "",
};

const checkins: DailyCheckin[] = [
  {
    id: "ci1",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: today,
    sleep_quality: 3,
    mood: 2,
    energy: 2,
    school_rating: 2,
    anxiety: 4,
    sensory_overload: 3,
    demand_tolerance: 2,
    appetite: 3,
    social_battery: 2,
    wins: ["Used quiet corner"],
    challenges: ["Morning rush"],
    notes: null,
    created_at: today,
  },
  {
    id: "ci2",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: yesterday,
    sleep_quality: 2,
    mood: 2,
    energy: 2,
    school_rating: 1,
    anxiety: 4,
    sensory_overload: 4,
    demand_tolerance: 2,
    appetite: 3,
    social_battery: 2,
    wins: [],
    challenges: ["Meltdown at breakfast"],
    notes: null,
    created_at: yesterday,
  },
];

const patterns: PatternFinding[] = [
  {
    id: "pat1",
    child_id: "c1",
    family_id: "f1",
    category: "school",
    title: "Morning pattern",
    description: "Difficult mornings follow poor sleep",
    confidence: 0.8,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const CONVERSATIONS: { message: string; parentMood?: "exhausted" | "worried" | "need_to_talk" | "okay" }[] = [
  { message: "Help" },
  { message: "I'm exhausted and don't know what to do", parentMood: "exhausted" },
  { message: "What is Timeline?" },
  { message: "How do I invite my husband?" },
  { message: "Amy refused school this morning — she had a meltdown at the door." },
  { message: "Why should I complete today's check-in?" },
  { message: "Prepare for a birthday party this weekend" },
  { message: "I'm worried about her therapist appointment", parentMood: "worried" },
  { message: "Generate a report for school" },
  { message: "Take me to the school hub" },
  { message: "She won't wear her shoes again" },
  { message: "I just need to talk", parentMood: "need_to_talk" },
  { message: "Bad day" },
  { message: "What should I do about homework?" },
  { message: "Something happened after school" },
  { message: "I'm okay today", parentMood: "okay" },
  { message: "How do I use Child Compass?" },
  { message: "Amy seems anxious every morning lately" },
  { message: "Can you explain the pattern you're seeing?" },
  { message: "We need help right now — she's unsafe" },
  { message: "What is the Teacher Guide?" },
  { message: "Planning tomorrow's morning routine" },
  { message: "Tell me about PDA in general" },
  { message: "Follow-up: the shoes thing happened again" },
  { message: "Navigate to documents" },
  { message: "I'm struggling as a parent" },
  { message: "Show me track page" },
];

async function main() {
  const context = assembleChildContext(mockChild, mockProfile, checkins, [], patterns, [] as TimelineEvent[]);
  const history: { role: "parent" | "assistant"; content: string }[] = [];

  let failures = 0;
  const modes = new Set<string>();
  const welcomeVariants = new Set<string>();
  const hasNextStep = { count: 0 };
  const hasClarify = { count: 0 };
  const hasWarmTone = { count: 0 };

  for (const scenario of [
    { yesterdayWasDifficult: true, weekCheckinCount: 2 },
    { daysSinceLastCoachMessage: 5, weekCheckinCount: 1 },
    { weeklyTrend: "improving" as const, weekCheckinCount: 4, patternsCount: 2 },
    { coachMessagesThisWeek: 3, hasCheckinToday: false },
    { hour: 20, weekCheckinCount: 3 },
  ]) {
    const w = buildDailyWelcome({
      parentName: "Gerhard",
      childName: "Amy",
      hour: scenario.hour ?? 9,
      dateKey: `2026-06-${20 + welcomeVariants.size}`,
      hasCheckinToday: scenario.hasCheckinToday ?? true,
      weekCheckinCount: scenario.weekCheckinCount ?? 2,
      daysSinceLastCoachMessage: scenario.daysSinceLastCoachMessage ?? null,
      yesterdayWasDifficult: scenario.yesterdayWasDifficult ?? false,
      recentDifficultDays: 1,
      coachMessagesThisWeek: scenario.coachMessagesThisWeek ?? 1,
      patternsCount: scenario.patternsCount ?? 1,
      weeklyTrend: scenario.weeklyTrend ?? "stable",
      isFirstVisitToday: true,
    });
    welcomeVariants.add(w.headline);
  }

  for (const convo of CONVERSATIONS) {
    const mode = detectCoachMode(convo.message, { parentMood: convo.parentMood ?? null });
    modes.add(mode);

    if (needsClarification(convo.message, history)) hasClarify.count++;

    const { response, mode: resolvedMode, enrichment } = await generateCoachResponse(
      convo.message,
      context,
      history,
      { parentMood: convo.parentMood ?? null },
    );

    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, convo.message),
      convo.message,
      history,
      resolvedMode,
      enrichment,
    );

    if (formatted.includes("One thought for you") || formatted.includes("When you're ready")) {
      hasNextStep.count++;
    }
    if (
      formatted.includes("What I'm hearing") ||
      formatted.includes("Making sense of") ||
      formatted.includes("wonder") ||
      formatted.includes("remember") ||
      formatted.includes("noticed")
    ) {
      hasWarmTone.count++;
    }

    const notRobotic = !/children with PDA/i.test(formatted);

    if (!notRobotic) {
      failures++;
      console.error(`FAIL generic language: ${convo.message.slice(0, 40)}`);
    }

    history.push({ role: "parent", content: convo.message });
    history.push({ role: "assistant", content: formatted.slice(0, 150) });
  }

  console.log("=== Phase 2+3 Companion Verification ===");
  console.log(`Conversations tested: ${CONVERSATIONS.length}`);
  console.log(`Unique welcome headlines (5 samples): ${welcomeVariants.size}/5`);
  console.log(`Unique modes detected: ${modes.size} — ${[...modes].join(", ")}`);
  console.log(`Responses with next-step offer: ${hasNextStep.count}/${CONVERSATIONS.length}`);
  console.log(`Responses with warm section headers: ${hasWarmTone.count}/${CONVERSATIONS.length}`);
  console.log(`Clarifying paths triggered: ${hasClarify.count}`);
  console.log(`Failures: ${failures}`);

  if (failures > 0 || welcomeVariants.size < 2 || hasWarmTone.count < 8) {
    console.error("\n❌ Phase 2 verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 2 verification PASSED");
  console.log("\nSample welcome:", buildDailyWelcome(
    buildWelcomeContext({
      parentName: "Gerhard",
      childName: "Amy",
      checkin: checkins[0],
      yesterdayCheckin: checkins[1],
      weekCheckins: checkins,
      coachMessages: [],
      patternsCount: 1,
      weeklyTrend: "improving",
    }),
  ).headline);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
