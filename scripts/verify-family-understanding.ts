/**
 * Phase 4 — Family Understanding verification (50+ conversations).
 * Run: npm run test:family
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { detectCoachMode } from "@/lib/ai/coach-mode";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { buildFamilyInsights } from "@/lib/companion/family-insights";
import { needsPresenceFirst } from "@/lib/companion/emotional-presence";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
} from "@/lib/types/database";
import type { ParentMood } from "@/lib/companion/parent-checkin";

const today = new Date().toISOString().split("T")[0];
const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0];
const monthAgo = new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const child: Child = {
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

const profile: ChildProfile = {
  id: "p1",
  child_id: "c1",
  family_id: "f1",
  strengths: ["creative"],
  sensory_preferences: {},
  favourite_things: [],
  known_triggers: ["being rushed", "unexpected change"],
  calming_strategies: ["quiet corner", "visual timer"],
  support_network: [],
  notes: null,
  medical_history: null,
  medication: [],
  challenges: ["morning transitions", "unexpected change"],
  successful_strategies: ["visual timer", "picture schedule"],
  support_team: [],
  school_contacts: [],
  doctors: [],
  therapists: [],
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
  wins: string[] = [],
  challenges: string[] = [],
): DailyCheckin {
  return {
    id: `ci-${date}`,
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: date,
    sleep_quality: sleep,
    mood,
    energy: 3,
    school_rating: school,
    anxiety,
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

const checkins: DailyCheckin[] = [
  checkin(today, 4, 2, 3, 4, ["Used quiet corner", "Calmer breakfast"], []),
  checkin(yesterday, 3, 3, 3, 3, ["Visual timer worked"], ["Morning rush"]),
  checkin(weekAgo, 2, 4, 2, 2, [], ["School refusal"]),
  checkin(twoWeeksAgo, 2, 4, 2, 1, [], ["Meltdown at door"]),
  checkin(monthAgo, 2, 5, 1, 1, [], ["Morning meltdown"]),
];

const patterns: PatternFinding[] = [
  {
    id: "pat1",
    child_id: "c1",
    family_id: "f1",
    category: "school",
    title: "Morning pattern",
    description: "School refusal tends to follow poor sleep",
    confidence: 0.85,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "pat2",
    child_id: "c1",
    family_id: "f1",
    category: "transition",
    title: "Change pattern",
    description: "Unexpected change is especially hard for Amy",
    confidence: 0.8,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const timeline: TimelineEvent[] = [
  {
    id: "t1",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    event_type: "meltdown",
    title: "Morning meltdown",
    description: "Refused shoes for 40 minutes",
    event_date: `${monthAgo}T07:30:00Z`,
    metadata: {},
    created_at: `${monthAgo}T07:30:00Z`,
  },
  {
    id: "t2",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    event_type: "victory",
    title: "Calm morning",
    description: "Visual timer helped transition",
    event_date: `${today}T07:45:00Z`,
    metadata: {},
    created_at: `${today}T07:45:00Z`,
  },
];

type Convo = { message: string; parentMood?: ParentMood | null };

const CONVERSATIONS: Convo[] = [
  { message: "Help" },
  { message: "Bad day" },
  { message: "I'm exhausted", parentMood: "exhausted" },
  { message: "I just need to talk", parentMood: "need_to_talk" },
  { message: "That was so heavy" },
  { message: "Not looking for advice — just needed to share" },
  { message: "Worst day. Completely drained." },
  { message: "Amy was just being naughty today" },
  { message: "She's so defiant" },
  { message: "I blame myself after days like this" },
  { message: "I'm worried before school starts", parentMood: "worried" },
  { message: "Prepare for sports day Friday" },
  { message: "Plan tomorrow morning step by step" },
  { message: "Why did she meltdown at the door?" },
  { message: "Help me understand what happened" },
  { message: "Amy refused school — meltdown at the door for 40 minutes" },
  { message: "Yes, poor sleep again" },
  { message: "Still about the shoes" },
  { message: "Homework meltdown after school" },
  { message: "Unexpected visitor threw her off" },
  { message: "Party this weekend — she's anxious" },
  { message: "Grandparents visiting Sunday" },
  { message: "She won't wear shoes" },
  { message: "Morning transitions are killing us" },
  { message: "School was too loud today" },
  { message: "She recovered faster today actually" },
  { message: "Amy had another meltdown but I stayed calmer" },
  { message: "She seemed happier at breakfast" },
  { message: "Short." },
  { message: "ok" },
  { message: "idk what to do" },
  { message: "What should I do?" },
  { message: "What is Timeline?" },
  { message: "Take me to reports" },
  { message: "How do I invite my husband?" },
  { message: "Tell me about PDA?" },
  { message: "Help me now she's unsafe" },
  { message: "Doctor appointment Tuesday" },
  { message: "Thanks that helped" },
  { message: "We talked about this — school again" },
  { message: "Follow up on the morning routine plan" },
  { message: "I've been thinking about what you said — sleep connection makes sense" },
  { message: "More context: she threw things" },
  { message: "Rough morning" },
  { message: "She was manipulative" },
  { message: "Planning tomorrow morning" },
  { message: "Another planning question for tomorrow" },
  { message: "Generate a school report" },
  { message: "I'm okay today", parentMood: "okay" },
  { message: "Today was difficult", parentMood: "difficult" },
  {
    message:
      "Long message about how the morning went with lots of detail about shoes and breakfast and the bus and how Amy was crying and I felt helpless but we eventually got there.",
  },
  { message: "Brutal day" },
  { message: "I had to get this out somewhere" },
];

async function main() {
  const context = assembleChildContext(child, profile, checkins, [] as ParentDebrief[], patterns, timeline);
  const insights = buildFamilyInsights(context);
  const history: { role: "parent" | "assistant"; content: string }[] = [];

  let understandingCount = 0;
  let parentNoticeCount = 0;
  let presenceCount = 0;
  let noAdviceCount = 0;
  let relationshipCount = 0;
  let storyCount = 0;
  let oldMemoryLanguage = 0;
  let failures = 0;

  console.log("=== Phase 4 Family Understanding ===");
  console.log(`Family insights built: ${insights.length}`);
  console.log(`Data span days: ${context.dataSpanDays}`);
  console.log(`Conversations: ${CONVERSATIONS.length}\n`);

  for (const convo of CONVERSATIONS) {
    const mode = detectCoachMode(convo.message, { parentMood: convo.parentMood ?? null });

    if (needsPresenceFirst(convo.message, history, convo.parentMood, mode)) {
      // counted after response
    }

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

    if (
      /learning about|started noticing|beginning to understand|seems important for/i.test(formatted)
    ) {
      understandingCount++;
    }
    if (/you often|you tend|you usually|glad you're letting/i.test(formatted)) {
      parentNoticeCount++;
    }
    if (enrichment.presenceOnly || enrichment.isBrief) {
      presenceCount++;
    }
    if (!formatted.includes("Something you could try") && !formatted.includes("When you're ready")) {
      noAdviceCount++;
    }
    if (/knowing your family|more we talk|recognise your family/i.test(formatted)) {
      relationshipCount++;
    }
    if (/few weeks ago|when we first|how far you've come|finding its footing/i.test(formatted)) {
      storyCount++;
    }
    if (/I remember something similar/i.test(formatted)) {
      oldMemoryLanguage++;
    }

    const notGeneric = !/children with PDA/i.test(formatted);
    if (!notGeneric) {
      failures++;
      console.error(`FAIL generic: ${convo.message.slice(0, 40)}`);
    }

    if (convo.message.includes("naughty") && !/another explanation/i.test(formatted)) {
      failures++;
      console.error("FAIL gentle challenge on naughty");
    }

    if (convo.message.includes("just need to talk") && formatted.includes("Something you could try")) {
      failures++;
      console.error("FAIL advice on need_to_talk");
    }

    if (convo.message.includes("Not looking for advice") && formatted.includes("Something you could try")) {
      failures++;
      console.error("FAIL advice when parent declined");
    }

    history.push({ role: "parent", content: convo.message });
    history.push({ role: "assistant", content: formatted.slice(0, 180) });
  }

  console.log(`Family understanding phrases: ${understandingCount}`);
  console.log(`Parent noticed: ${parentNoticeCount}`);
  console.log(`Presence / brief responses: ${presenceCount}`);
  console.log(`No immediate advice: ${noAdviceCount}`);
  console.log(`Growing relationship phrases: ${relationshipCount}`);
  console.log(`Family story moments: ${storyCount}`);
  console.log(`Old 'I remember' language: ${oldMemoryLanguage}`);
  console.log(`Failures: ${failures}`);

  if (
    failures > 0 ||
    understandingCount < 5 ||
    presenceCount < 4 ||
    noAdviceCount < 8 ||
    oldMemoryLanguage > 0 ||
    insights.length < 3
  ) {
    console.error("\n❌ Phase 4 verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 4 verification PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
