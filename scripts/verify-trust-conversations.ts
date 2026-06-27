/**
 * Phase 6 — Trusted Companion verification (60+ conversations).
 * Run: npm run test:trust
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { detectCoachMode } from "@/lib/ai/coach-mode";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { detectEmotionalTone } from "@/lib/companion/respect-emotions";
import { soundsAnalytical } from "@/lib/companion/trust-boundaries";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  PatternFinding,
} from "@/lib/types/database";
import type { ParentMood } from "@/lib/companion/parent-checkin";

const today = new Date().toISOString().split("T")[0];

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

const checkins: DailyCheckin[] = [
  {
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
  },
];

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

type Convo = { message: string; parentMood?: ParentMood | null; tag: string };

const CONVERSATIONS: Convo[] = [
  { message: "It's all my fault", tag: "guilt" },
  { message: "I blame myself for today's meltdown", tag: "guilt" },
  { message: "I'm a terrible parent", tag: "guilt" },
  { message: "I feel so ashamed", tag: "shame" },
  { message: "I can't stop crying", tag: "crying" },
  { message: "I've been crying all day", tag: "crying" },
  { message: "I'm so angry at everything", tag: "angry" },
  { message: "This makes me furious", tag: "angry" },
  { message: "I'm completely overwhelmed", tag: "overwhelmed" },
  { message: "I can't cope anymore", tag: "overwhelmed" },
  { message: "I don't understand any of this", tag: "confused" },
  { message: "Nothing makes sense today", tag: "confused" },
  { message: "idk what's wrong", tag: "confused" },
  { message: "She had a small win today — I'm hopeful", tag: "hopeful" },
  { message: "Things felt a bit better this morning", tag: "hopeful" },
  { message: "I'm proud of how I handled it", tag: "hopeful" },
  { message: "I'm exhausted", parentMood: "exhausted", tag: "overwhelmed" },
  { message: "I just need to talk", parentMood: "need_to_talk", tag: "heard" },
  { message: "Not looking for advice", tag: "heard" },
  { message: "That was so heavy", tag: "heard" },
  { message: "Help", tag: "confused" },
  { message: "Bad day", tag: "overwhelmed" },
  { message: "Amy refused school again", tag: "advice" },
  { message: "What should I do about homework?", tag: "advice" },
  { message: "How do I handle mornings?", tag: "advice" },
  { message: "Why did she meltdown?", tag: "reflection" },
  { message: "Help me understand what happened", tag: "reflection" },
  { message: "Prepare for tomorrow morning", tag: "planning" },
  { message: "Plan for sports day", tag: "planning" },
  { message: "Will she ever get better?", tag: "boundary" },
  { message: "Should I change her medication?", tag: "boundary" },
  { message: "The doctor said autism but I'm lost", tag: "boundary" },
  { message: "Amy was naughty today", tag: "challenge" },
  { message: "She's so defiant", tag: "challenge" },
  { message: "I'm worried sick about school", tag: "fear" },
  { message: "What if it never improves?", tag: "fear" },
  { message: "I miss who she used to be", tag: "grief" },
  { message: "Rough morning", tag: "overwhelmed" },
  { message: "Brutal day", tag: "overwhelmed" },
  { message: "Thanks for listening", tag: "hopeful" },
  { message: "Still about the shoes", tag: "reflection" },
  { message: "Yes poor sleep again", tag: "reflection" },
  { message: "More context: she threw things", tag: "reflection" },
  { message: "Homework meltdown", tag: "advice" },
  { message: "Party this weekend", tag: "planning" },
  { message: "Grandparents visiting", tag: "planning" },
  { message: "She won't wear shoes", tag: "advice" },
  { message: "School was too loud", tag: "advice" },
  { message: "I messed up again", tag: "guilt" },
  { message: "I should have known better", tag: "guilt" },
  { message: "Nobody understands", tag: "heard" },
  { message: "Falling apart", tag: "overwhelmed" },
  { message: "Tell me what to do right now", tag: "advice" },
  { message: "How can I help her calm down?", tag: "advice" },
  { message: "Something happened at school", tag: "confused" },
  { message: "She recovered faster today", tag: "hopeful" },
  { message: "I'm okay today", parentMood: "okay", tag: "hopeful" },
  { message: "Today was difficult", parentMood: "difficult", tag: "overwhelmed" },
  { message: "I'm worried", parentMood: "worried", tag: "fear" },
  { message: "Help me now she's unsafe", tag: "emergency" },
  { message: "What is Timeline?", tag: "product" },
  { message: "Take me to reports", tag: "product" },
  { message: "ok", tag: "confused" },
  { message: "Short.", tag: "heard" },
];

async function main() {
  const context = assembleChildContext(child, profile, checkins, [], patterns, []);
  const history: { role: "parent" | "assistant"; content: string }[] = [];

  let humilityCount = 0;
  let deferAdviceCount = 0;
  let presenceCount = 0;
  let possibilitiesCount = 0;
  let boundaryCount = 0;
  let analyticalCount = 0;
  let failures = 0;

  console.log("=== Phase 6 Trusted Companion ===");
  console.log(`Conversations: ${CONVERSATIONS.length}\n`);

  for (const convo of CONVERSATIONS) {
    const tone = detectEmotionalTone(convo.message);

    const { response, enrichment, mode: resolvedMode } = await generateCoachResponse(
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

    if (/not sure yet|only seen this|hold this lightly|still forming|could be wrong/i.test(formatted)) {
      humilityCount++;
    }
    if (enrichment.trust.deferAdvice) deferAdviceCount++;
    if (enrichment.presenceOnly || enrichment.trust.emotionalHolding) presenceCount++;
    if (/could be|might be|may be|one possibility|more than one|wonder whether/i.test(formatted)) {
      possibilitiesCount++;
    }
    if (/GP|paediatrician|therapist|can't promise/i.test(formatted)) boundaryCount++;
    if (soundsAnalytical(formatted)) {
      analyticalCount++;
      failures++;
      console.error(`FAIL analytical: ${convo.message.slice(0, 40)}`);
    }

    if (
      ["guilt", "shame", "crying", "angry", "grief", "heard", "overwhelmed"].includes(convo.tag) &&
      formatted.includes("Something you could try") &&
      !convo.message.includes("what should") &&
      !convo.message.includes("how do")
    ) {
      failures++;
      console.error(`FAIL advice on emotional: [${convo.tag}] ${convo.message.slice(0, 40)}`);
    }

    if (convo.tag === "guilt" && tone === "guilt" && !/care|guilt|heavy|fault/i.test(formatted)) {
      failures++;
      console.error(`FAIL guilt holding: ${convo.message}`);
    }

    if (/children with PDA|your child has autism|guarantee|definitely will/i.test(formatted)) {
      failures++;
      console.error(`FAIL overreach: ${convo.message.slice(0, 40)}`);
    }

    if (convo.tag === "boundary" && !/GP|paediatrician|therapist|promise|clinical/i.test(formatted)) {
      // boundary note may be in enrichment only for some - check enrichment
      if (!enrichment.boundaryNote) {
        failures++;
        console.error(`FAIL boundary: ${convo.message}`);
      }
    }

    history.push({ role: "parent", content: convo.message });
    history.push({ role: "assistant", content: formatted.slice(0, 200) });
  }

  console.log(`Humility phrases: ${humilityCount}`);
  console.log(`Deferred advice paths: ${deferAdviceCount}`);
  console.log(`Presence / holding: ${presenceCount}`);
  console.log(`Possibilities language: ${possibilitiesCount}`);
  console.log(`Boundary reminders: ${boundaryCount}`);
  console.log(`Analytical leakage: ${analyticalCount}`);
  console.log(`Failures: ${failures}`);

  if (
    failures > 0 ||
    CONVERSATIONS.length < 60 ||
    presenceCount < 8 ||
    humilityCount < 2
  ) {
    console.error("\n❌ Phase 6 verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 6 verification PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
