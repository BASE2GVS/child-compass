/**
 * Phase 7 — Living with the Family verification (75+ conversations).
 * Run: npm run test:life
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { buildCrossDayContinuity } from "@/lib/companion/cross-day-continuity";
import { buildPatientReturnWelcome } from "@/lib/companion/patient-companionship";
import { humanizeParentText, invitationForCheckin } from "@/lib/companion/human-language";
import { detectFamilyRhythm, buildRhythmNote } from "@/lib/companion/family-rhythms";
import { buildQuietAnticipation } from "@/lib/companion/quiet-anticipation";
import { buildContextualNextStep } from "@/lib/companion/contextual-next-step";
import { buildDailyWelcome, buildWelcomeContext } from "@/lib/companion/daily-welcome";
import { buildGentlePrompt } from "@/lib/companion/gentle-prompts";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  PatternFinding,
} from "@/lib/types/database";
import type { ParentMood } from "@/lib/companion/parent-checkin";

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
  successful_strategies: [],
  support_team: [],
  school_contacts: [],
  doctors: [],
  therapists: [],
  emergency_notes: null,
  created_at: "",
  updated_at: "",
};

const patterns: PatternFinding[] = [
  {
    id: "p1",
    child_id: "c1",
    family_id: "f1",
    category: "school",
    title: "Mornings",
    description: "Mornings can be hard after poor sleep",
    confidence: 0.7,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

function checkin(overrides: Partial<DailyCheckin> = {}): DailyCheckin {
  return {
    id: "1",
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: today,
    sleep_quality: 3,
    mood: 3,
    energy: 3,
    school_rating: 3,
    anxiety: 3,
    sensory_overload: 3,
    demand_tolerance: 3,
    appetite: 3,
    social_battery: 3,
    wins: [],
    challenges: [],
    notes: null,
    created_at: today,
    ...overrides,
  };
}

type Convo = {
  message: string;
  parentMood?: ParentMood | null;
  tag: string;
  coachHistory?: { role: string; content: string; created_at: string }[];
};

const CONVERSATIONS: Convo[] = [
  { message: "Good morning — how should we start today?", tag: "continuity" },
  { message: "How did today go?", tag: "continuity" },
  { message: "Still thinking about yesterday", tag: "continuity" },
  { message: "Amy refused school again", tag: "advice" },
  { message: "Rough morning at drop-off", tag: "advice" },
  { message: "She had a small win today", tag: "hopeful" },
  { message: "I'm exhausted", parentMood: "exhausted", tag: "heard" },
  { message: "I just need to talk", parentMood: "need_to_talk", tag: "heard" },
  { message: "Not looking for advice", tag: "heard" },
  { message: "Help", tag: "confused" },
  { message: "Bad day", tag: "overwhelmed" },
  { message: "What should I do about homework?", tag: "advice" },
  { message: "Prepare for tomorrow morning", tag: "planning" },
  { message: "Therapy was hard today", tag: "rhythm" },
  { message: "Grandparents visiting this weekend", tag: "planning" },
  { message: "Party this weekend", tag: "planning" },
  { message: "School was too loud", tag: "advice" },
  { message: "She won't wear shoes", tag: "advice" },
  { message: "Homework meltdown", tag: "advice" },
  { message: "Thanks for listening", tag: "warmth" },
  { message: "I'm okay today", parentMood: "okay", tag: "hopeful" },
  { message: "Today was difficult", parentMood: "difficult", tag: "overwhelmed" },
  { message: "I'm worried", parentMood: "worried", tag: "fear" },
  { message: "Something happened at school", tag: "confused" },
  { message: "Why did she meltdown?", tag: "reflection" },
  { message: "Help me understand what happened", tag: "reflection" },
  { message: "Still about the shoes", tag: "reflection" },
  { message: "Yes poor sleep again", tag: "reflection" },
  { message: "More context: she threw things", tag: "reflection" },
  { message: "I messed up again", tag: "guilt" },
  { message: "It's all my fault", tag: "guilt" },
  { message: "I'm completely overwhelmed", tag: "overwhelmed" },
  { message: "I can't cope anymore", tag: "overwhelmed" },
  { message: "Tell me what to do right now", tag: "advice" },
  { message: "How can I help her calm down?", tag: "advice" },
  { message: "Plan for sports day", tag: "planning" },
  { message: "Sunday evening and I'm dreading Monday", tag: "rhythm" },
  { message: "School morning was chaos", tag: "rhythm" },
  { message: "We have therapy tomorrow", tag: "anticipation" },
  { message: "Thinking about tomorrow", tag: "anticipation" },
  { message: "What is Timeline?", tag: "product" },
  { message: "Take me to reports", tag: "product" },
  { message: "ok", tag: "brief" },
  { message: "Short.", tag: "brief" },
  { message: "She recovered faster today", tag: "hopeful" },
  { message: "Nobody understands", tag: "heard" },
  { message: "Falling apart", tag: "overwhelmed" },
  { message: "Brutal day", tag: "overwhelmed" },
  { message: "I'm proud of how I handled it", tag: "hopeful" },
  { message: "Things felt a bit better this morning", tag: "hopeful" },
  { message: "How do I handle mornings?", tag: "advice" },
  { message: "Amy was naughty today", tag: "challenge" },
  { message: "She's so defiant", tag: "challenge" },
  { message: "I'm worried sick about school", tag: "fear" },
  { message: "I miss who she used to be", tag: "grief" },
  { message: "Rough morning", tag: "overwhelmed" },
  { message: "idk what's wrong", tag: "confused" },
  { message: "Nothing makes sense today", tag: "confused" },
  { message: "I feel so ashamed", tag: "shame" },
  { message: "I've been crying all day", tag: "crying" },
  { message: "I'm so angry at everything", tag: "angry" },
  { message: "That was so heavy", tag: "heard" },
  { message: "Will she ever get better?", tag: "boundary" },
  { message: "Should I change her medication?", tag: "boundary" },
  { message: "Help me now she's unsafe", tag: "emergency" },
  { message: "Visitors coming tonight", tag: "planning" },
  { message: "Birthday party stress", tag: "planning" },
  { message: "Holiday break starts soon", tag: "rhythm" },
  { message: "First day back after break", tag: "rhythm" },
  { message: "Quiet evening at home", tag: "warmth" },
  { message: "We talked yesterday about meltdowns", tag: "continuity" },
  { message: "Picking up from last time", tag: "continuity" },
  { message: "Morning check-in thoughts", tag: "continuity" },
  { message: "Afternoon update", tag: "advice" },
  { message: "Evening reflection", tag: "warmth" },
  { message: "Would it help to prepare?", tag: "anticipation" },
  { message: "Sleep was awful last night", tag: "anticipation" },
  { message: "Anxious about tomorrow", tag: "anticipation" },
  { message: "Just checking in", tag: "warmth" },
  { message: "Long day", tag: "heard" },
  { message: "Need a minute", tag: "brief" },
  { message: "Back again", tag: "return" },
];

const SOFTWARE_WORDS = /\b(Generate|Submit|Complete today's|streak|missed days|broken streak|reminder)\b/i;
const GUILT_WORDS = /\b(you missed|broken streak|failed to|should have checked|where have you been)\b/i;

async function main() {
  let failures = 0;
  let continuityCount = 0;
  let invitationCount = 0;
  let patientCount = 0;
  let microCount = 0;
  let anticipationCount = 0;
  let rhythmCount = 0;

  console.log("=== Phase 7 Living with the Family ===\n");

  // Module tests
  const crossDay = buildCrossDayContinuity(
    [
      {
        role: "parent",
        content: "Amy had a huge meltdown at school pickup yesterday",
        created_at: `${yesterday}T18:00:00.000Z`,
      },
    ],
    "Good morning",
  );
  if (!crossDay || !/yesterday|thinking about/i.test(crossDay)) {
    failures++;
    console.error("FAIL cross-day continuity module");
  } else {
    continuityCount++;
  }

  const patient = buildPatientReturnWelcome("Sam", "Amy", 5);
  if (!/good to see you|glad you're here/i.test(patient.headline)) {
    failures++;
    console.error("FAIL patient return welcome");
  } else if (/missed|streak|missed days/i.test(patient.headline + patient.subline)) {
    failures++;
    console.error("FAIL patient welcome has guilt language");
  } else {
    patientCount++;
  }

  const humanized = humanizeParentText("Complete today's check-in and Generate report");
  if (/Complete today's|Generate/i.test(humanized)) {
    failures++;
    console.error("FAIL humanizeParentText");
  }

  const invite = invitationForCheckin("Amy");
  if (!/would it help/i.test(invite)) {
    failures++;
    console.error("FAIL invitationForCheckin");
  } else {
    invitationCount++;
  }

  const rhythm = detectFamilyRhythm(new Date("2026-06-21T18:00:00"));
  if (!rhythm || rhythm.type !== "sunday_evening") {
    failures++;
    console.error("FAIL sunday evening rhythm");
  } else {
    rhythmCount++;
    const note = buildRhythmNote(rhythm, "Amy");
    if (note) rhythmCount++;
  }

  const ctxAnticipation = assembleChildContext(
    child,
    profile,
    [checkin({ sleep_quality: 2, anxiety: 4 })],
    [],
    patterns,
    [],
  );
  const anticipation = buildQuietAnticipation(ctxAnticipation, 17, new Date("2026-06-25T17:00:00"));
  if (!anticipation || !/tomorrow|wondering|prepare/i.test(anticipation)) {
    failures++;
    console.error("FAIL quiet anticipation");
  } else {
    anticipationCount++;
  }

  const nextNoCheckin = buildContextualNextStep({
    phase: "morning",
    childId: "c1",
    childName: "Amy",
    checkin: null,
    coachMessages: [],
    patterns,
  });
  if (/Complete today's|Generate|Skip for now/i.test(nextNoCheckin.primary.label)) {
    failures++;
    console.error("FAIL contextual next step language");
  } else if (/would it help/i.test(nextNoCheckin.primary.label)) {
    invitationCount++;
  }

  const welcomeCtx = buildWelcomeContext({
    parentName: "Sam",
    childName: "Amy",
    checkin: null,
    yesterdayCheckin: null,
    weekCheckins: [],
    coachMessages: [
      {
        id: "m1",
        session_id: "s1",
        role: "parent",
        content: "hi",
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        metadata: {},
      },
    ],
    patternsCount: 0,
    weeklyTrend: null,
  });
  const welcome = buildDailyWelcome(welcomeCtx);
  if (/missed our conversations|streak|missed days/i.test(welcome.headline + welcome.subline)) {
    failures++;
    console.error("FAIL daily welcome guilt language");
  } else if (/good to see|glad you're here|welcome back/i.test(welcome.headline)) {
    patientCount++;
  }

  const prompt = buildGentlePrompt({
    phase: "day",
    childId: "c1",
    childName: "Amy",
    hasCheckinToday: false,
    talkedToday: false,
    dismissedIds: [],
    hour: 13,
  });
  if (prompt && /would it help/i.test(prompt.message)) invitationCount++;

  // Coach pipeline conversations
  const baseContext = assembleChildContext(child, profile, [checkin()], [], patterns, []);
  const history: { role: "parent" | "assistant"; content: string }[] = [];

  console.log(`Conversations: ${CONVERSATIONS.length}\n`);

  for (const convo of CONVERSATIONS) {
    const coachMessages = convo.coachHistory ?? [
      {
        role: "parent",
        content: "Amy had a meltdown at school pickup",
        created_at: `${yesterday}T17:30:00.000Z`,
      },
      {
        role: "assistant",
        content: "That sounds exhausting.",
        created_at: `${yesterday}T17:31:00.000Z`,
      },
    ];

    const { response, enrichment, mode } = await generateCoachResponse(
      convo.message,
      baseContext,
      history,
      {
        parentMood: convo.parentMood ?? null,
        coachMessages,
      },
    );

    const formatted = formatCoachResponse(
      response,
      baseContext,
      memoryForMessage(baseContext, convo.message),
      convo.message,
      history,
      mode,
      enrichment,
    );

    if (SOFTWARE_WORDS.test(formatted)) {
      failures++;
      console.error(`FAIL software language: ${convo.message.slice(0, 40)}`);
    }

    if (GUILT_WORDS.test(formatted)) {
      failures++;
      console.error(`FAIL guilt language: ${convo.message.slice(0, 40)}`);
    }

    if (enrichment.crossDayContinuity && /yesterday|thinking about|how did today/i.test(formatted)) {
      continuityCount++;
    }

    if (/would it help|when you're ready|if you'd like/i.test(formatted)) {
      invitationCount++;
    }

    if (enrichment.quietAnticipation) anticipationCount++;
    if (enrichment.rhythmNote) rhythmCount++;
    if (enrichment.microMoment) microCount++;

    if (convo.tag === "return" && GUILT_WORDS.test(formatted)) {
      failures++;
      console.error(`FAIL return visit guilt: ${convo.message}`);
    }

    history.push({ role: "parent", content: convo.message });
    history.push({ role: "assistant", content: formatted.slice(0, 200) });
  }

  console.log(`Cross-day / continuity signals: ${continuityCount}`);
  console.log(`Invitation language: ${invitationCount}`);
  console.log(`Patient companionship: ${patientCount}`);
  console.log(`Quiet anticipation: ${anticipationCount}`);
  console.log(`Family rhythm notes: ${rhythmCount}`);
  console.log(`Micro moments: ${microCount}`);
  console.log(`Failures: ${failures}`);

  if (
    failures > 0 ||
    CONVERSATIONS.length < 75 ||
    continuityCount < 2 ||
    invitationCount < 5 ||
    patientCount < 1
  ) {
    console.error("\n❌ Phase 7 verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 7 verification PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
