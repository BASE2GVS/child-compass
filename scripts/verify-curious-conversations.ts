/**
 * Phase 3 — Curious Companion verification (40+ conversations).
 * Run: npm run test:curious
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { detectCoachMode } from "@/lib/ai/coach-mode";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import {
  hasEnoughContext,
  shouldClarifyBeforeAdvice,
} from "@/lib/companion/curious-companion";
import { detectsJudgment } from "@/lib/companion/gentle-challenge";
import { isBriefMoment } from "@/lib/companion/brief-moments";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  PatternFinding,
  TimelineEvent,
} from "@/lib/types/database";

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const child: Child = {
  id: "c1",
  family_id: "f1",
  photo_url: null,
  first_name: "Amy",
  nickname: null,
  date_of_birth: null,
  gender: null,
  school: "Oak",
  grade: "2",
  diagnosis: ["Autism", "PDA"],
  support_needs: [],
  interests: [],
  favourite_activities: [],
  created_at: "",
  updated_at: "",
};

const profile: ChildProfile = {
  id: "p1",
  child_id: "c1",
  family_id: "f1",
  strengths: [],
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
    id: "1",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: today,
    sleep_quality: 3,
    mood: 4,
    energy: 3,
    school_rating: 4,
    anxiety: 2,
    sensory_overload: 2,
    demand_tolerance: 4,
    appetite: 3,
    social_battery: 3,
    wins: ["Calmer morning than last week"],
    challenges: [],
    notes: null,
    created_at: today,
  },
  {
    id: "2",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: yesterday,
    sleep_quality: 2,
    mood: 2,
    energy: 2,
    school_rating: 2,
    anxiety: 4,
    sensory_overload: 3,
    demand_tolerance: 2,
    appetite: 3,
    social_battery: 2,
    wins: [],
    challenges: ["School refusal"],
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
    description: "School refusal tends to follow poor sleep",
    confidence: 0.8,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const CONVERSATIONS = [
  "Help",
  "Bad day",
  "Something happened",
  "I'm exhausted",
  "That was so hard",
  "I can't cope",
  "Amy was just being naughty today",
  "She's so defiant",
  "What is Timeline?",
  "Amy refused school — meltdown at the door for 40 minutes",
  "Yes, poor sleep again",
  "Still about the shoes",
  "Prepare for sports day Friday",
  "Homework meltdown after school",
  "I'm worried",
  "Just need to talk",
  "ok",
  "more context: she threw things",
  "She recovered faster today actually",
  "Why did she do that?",
  "Planning tomorrow morning",
  "Take me to reports",
  "Generate a school report",
  "How do I invite my husband?",
  "She won't wear shoes",
  "Grandparents visiting Sunday",
  "Doctor appointment Tuesday",
  "Tell me about PDA?",
  "Help me now she's unsafe",
  "Rough morning",
  "idk what to do",
  "She was manipulative",
  "We talked about this — school again",
  "Thanks that helped",
  "Amy had another meltdown but I stayed calmer",
  "Short.",
  "I've been thinking about what you said — the sleep connection makes sense. She was up until 11pm.",
  "What should I do?",
  "Party this weekend",
  "She seemed happier at breakfast",
  "Follow up on the morning routine plan",
];

async function main() {
  const context = assembleChildContext(child, profile, checkins, [], patterns, [] as TimelineEvent[]);
  const history: { role: "parent" | "assistant"; content: string }[] = [];

  let clarifyCount = 0;
  let briefCount = 0;
  let challengeCount = 0;
  let thinkingCount = 0;
  let memoryWeaveCount = 0;
  let positiveCount = 0;
  let continuityCount = 0;
  let failures = 0;
  const uniqueBodies = new Set<string>();

  for (const message of CONVERSATIONS) {
    const mode = detectCoachMode(message);

    if (shouldClarifyBeforeAdvice(message, history, mode)) clarifyCount++;
    if (isBriefMoment(message)) briefCount++;
    if (detectsJudgment(message)) challengeCount++;

    const { response, mode: resolvedMode, enrichment } = await generateCoachResponse(
      message,
      context,
      history,
    );

    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, message),
      message,
      history,
      resolvedMode,
      enrichment,
    );

    uniqueBodies.add(formatted.slice(0, 120));

    if (/wonder|noticing|catches my attention|reminds me|pattern I'm/i.test(formatted)) thinkingCount++;
    if (
      /learning about|started noticing|beginning to understand|seems important for|mentioned before|seen this pattern/i.test(
        formatted,
      )
    ) {
      memoryWeaveCount++;
    }
    if (/noticed|steadier|worth noticing|calmer/i.test(formatted)) positiveCount++;
    if (/Building on|Continuing from|wonder if there could be another/i.test(formatted)) {
      continuityCount++;
    }
    if (/children with PDA/i.test(formatted)) {
      failures++;
      console.error("FAIL generic:", message);
    }

    if (message === "Help" && !/understand|ask something|before/i.test(formatted)) {
      failures++;
      console.error("FAIL clarify on Help");
    }

    if (message.includes("naughty") && !/wonder if there could be another/i.test(formatted)) {
      failures++;
      console.error("FAIL gentle challenge");
    }

    if (message === "I'm exhausted" && formatted.split("\n\n").length > 4) {
      failures++;
      console.error("FAIL brief response too long");
    }

    history.push({ role: "parent", content: message });
    history.push({ role: "assistant", content: formatted });
  }

  const followUpOk = hasEnoughContext(
    "She threw shoes and screamed for twenty minutes after I asked her to get dressed",
    history.filter((_, i) => i < history.length - 2),
  );

  console.log("=== Phase 3 Curious Companion ===");
  console.log(`Conversations: ${CONVERSATIONS.length}`);
  console.log(`Clarify-before-advice triggers: ${clarifyCount}`);
  console.log(`Brief moment triggers: ${briefCount}`);
  console.log(`Gentle challenge inputs: ${challengeCount}`);
  console.log(`Thinking-aloud in responses: ${thinkingCount}`);
  console.log(`Natural memory weaves: ${memoryWeaveCount}`);
  console.log(`Positive change notices: ${positiveCount}`);
  console.log(`Continuity/challenge phrases: ${continuityCount}`);
  console.log(`Unique response openings: ${uniqueBodies.size}/${CONVERSATIONS.length}`);
  console.log(`Follow-up has enough context: ${followUpOk}`);
  console.log(`Failures: ${failures}`);

  if (failures > 0 || clarifyCount < 3 || briefCount < 2 || uniqueBodies.size < 12) {
    console.error("\n❌ Phase 3 verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 3 verification PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
