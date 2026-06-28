/**
 * Phase 1 — Conversation Intelligence verification (30+ conversations).
 * Run: npm run test:conversation
 */
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { classifyParentNeed, type ParentNeed } from "@/lib/conversation/parent-need";
import { hasTemplateHeaders } from "@/lib/conversation/sanitize-reply";
import { shouldBeCurious } from "@/lib/conversation/curiosity-engine";
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
    description: "Poor sleep often precedes harder mornings",
    confidence: 0.7,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const TEMPLATE_MARKERS = [
  "Something you could try",
  "Phrases to avoid",
  "A gentle next step",
  "Looking ahead",
  "One thought for you",
  "When you're ready",
];

const MEMORY_DUMP_MARKERS = [
  "Earlier you told me",
  "Timeline (",
  "Known triggers for",
  "Pattern we've noticed",
  "From Amy's data:",
  "Continuing from our earlier messages",
  "Building on what you said about",
];

type Scenario = {
  message: string;
  expectedNeed?: ParentNeed;
  parentMood?: ParentMood;
  noAdvice?: boolean;
  noTemplate?: boolean;
  noMemoryDump?: boolean;
};

const SCENARIOS: Scenario[] = [
  { message: "I'm exhausted.", expectedNeed: "emotional_support", noAdvice: true },
  { message: "I don't know what to do.", expectedNeed: "problem_solving" },
  { message: "I've tried everything and nothing works.", expectedNeed: "new_ideas" },
  { message: "Amy had a fantastic day today!", expectedNeed: "celebration", noAdvice: true },
  { message: "I'm worried about school tomorrow.", expectedNeed: "preparation" },
  { message: "I just need to vent.", expectedNeed: "presence_only", noAdvice: true },
  { message: "I don't want advice right now.", expectedNeed: "presence_only", noAdvice: true },
  { message: "Nobody understands what this is like.", expectedNeed: "being_heard", noAdvice: true },
  { message: "How do I handle morning meltdowns?", expectedNeed: "problem_solving" },
  { message: "She recovered faster today than usual.", expectedNeed: "celebration" },
  { message: "Plan for sports day this weekend.", expectedNeed: "preparation" },
  { message: "What else can we try? We've already tried the quiet corner.", expectedNeed: "new_ideas" },
  { message: "I'm falling apart.", expectedNeed: "emotional_support", noAdvice: true },
  { message: "Rough day.", expectedNeed: "emotional_support", parentMood: "difficult" },
  { message: "Tell me what to do about homework refusal.", expectedNeed: "problem_solving" },
  { message: "Just listen — I'm not asking for fixes.", expectedNeed: "presence_only", noAdvice: true },
  { message: "Best day we've had in months.", expectedNeed: "celebration" },
  { message: "Worried about the dentist appointment tomorrow.", expectedNeed: "preparation" },
  { message: "I'm so tired I can't think straight.", expectedNeed: "emotional_support" },
  { message: "Out of ideas for bedtime battles.", expectedNeed: "new_ideas" },
  { message: "Help", expectedNeed: "problem_solving" },
  { message: "She was amazing at swimming today.", expectedNeed: "celebration" },
  { message: "Getting ready for grandparents visiting.", expectedNeed: "preparation" },
  { message: "I feel like I'm failing her.", expectedNeed: "emotional_support", noAdvice: true },
  { message: "Need to be heard for a minute.", expectedNeed: "being_heard" },
  { message: "School trip is tomorrow and I'm anxious.", expectedNeed: "preparation" },
  { message: "We tried visual schedules — doesn't work anymore.", expectedNeed: "new_ideas" },
  { message: "How should I respond when she hits?", expectedNeed: "problem_solving" },
  { message: "I'm burnt out.", expectedNeed: "emotional_support", parentMood: "exhausted" },
  { message: "Lovely calm evening finally.", expectedNeed: "celebration" },
  { message: "Something happened at school", expectedNeed: "problem_solving" },
  { message: "Just talking — no questions please.", expectedNeed: "presence_only", noAdvice: true },
];

type CuriosityScenario = {
  message: string;
  expectCurious: boolean;
  questionPattern?: RegExp;
  noAdvice?: boolean;
  parentMood?: ParentMood;
};

const CURIOSITY_SCENARIOS: CuriosityScenario[] = [
  {
    message: "Amy stole from her sister.",
    expectCurious: true,
    questionPattern: /sister's room|what usually happens/i,
  },
  {
    message: "Amy refuses to bath.",
    expectCurious: true,
    questionPattern: /bath time|hardest/i,
  },
  {
    message: "Amy screamed all morning.",
    expectCurious: true,
    questionPattern: /different from most mornings|before things escalated/i,
  },
  {
    message: "I've tried everything.",
    expectCurious: true,
    questionPattern: /already tried|closest to helping/i,
  },
  {
    message: "Something happened at school.",
    expectCurious: true,
    questionPattern: /before things felt difficult|part of school/i,
  },
  {
    message: "She had a meltdown.",
    expectCurious: true,
    questionPattern: /before things escalated|tell me a little more/i,
  },
  {
    message: "I'm exhausted.",
    expectCurious: false,
    noAdvice: true,
  },
  {
    message: "I just need to vent.",
    expectCurious: false,
    noAdvice: true,
  },
  {
    message: "I'm crying and I can't stop.",
    expectCurious: false,
    noAdvice: true,
  },
  {
    message: "Amy had a fantastic day!",
    expectCurious: false,
  },
  {
    message: "How do I handle morning meltdowns?",
    expectCurious: true,
    questionPattern: /typical hard moment|before things/i,
  },
  {
    message: "She hit her brother.",
    expectCurious: true,
    questionPattern: /before that happened/i,
  },
  {
    message: "Homework meltdown again.",
    expectCurious: true,
    questionPattern: /homework|before things/i,
  },
  {
    message: "Help",
    expectCurious: true,
    questionPattern: /\?$/,
  },
  {
    message: "Bedtime was a disaster.",
    expectCurious: true,
    questionPattern: /bedtime|before things/i,
  },
  {
    message: "I'm burnt out.",
    expectCurious: false,
    parentMood: "exhausted",
  },
  {
    message: "Out of ideas — nothing works anymore.",
    expectCurious: true,
    questionPattern: /already tried|closest to helping/i,
  },
  {
    message: "She won't wear her shoes.",
    expectCurious: true,
    questionPattern: /hardest|tell me a little more/i,
  },
  {
    message: "Bad day.",
    expectCurious: false,
  },
  {
    message: "She meltdown at school when the fire alarm went off during lunch because it was unexpected.",
    expectCurious: false,
  },
];

type MultiTurnScenario = {
  turns: { parent: string; expectCurious?: boolean; expectAcknowledgment?: boolean }[];
};

const MULTI_TURN: MultiTurnScenario[] = [
  {
    turns: [
      { parent: "Amy stole from her sister.", expectCurious: true },
      {
        parent: "She slips in, grabs a toy, and runs back to her room.",
        expectAcknowledgment: true,
      },
    ],
  },
  {
    turns: [
      { parent: "Amy refuses to bath.", expectCurious: true },
      {
        parent: "The water running seems to upset her and she clings to the doorway.",
        expectAcknowledgment: true,
      },
    ],
  },
];

function questionCount(text: string): number {
  return (text.match(/\?/g) ?? []).length;
}

async function runCuriosityPhase(context: ReturnType<typeof assembleChildContext>) {
  let failures = 0;
  let curiousCount = 0;
  let skippedCorrectly = 0;

  console.log("\n=== Phase 2 — Curiosity Before Coaching ===");
  console.log(`Curiosity scenarios: ${CURIOSITY_SCENARIOS.length}\n`);

  for (const scenario of CURIOSITY_SCENARIOS) {
    const history: { role: "parent" | "assistant"; content: string }[] = [];
    const need = classifyParentNeed(scenario.message, {
      parentMood: scenario.parentMood ?? null,
      conversationHistory: history,
    });
    const curious = shouldBeCurious({
      message: scenario.message,
      conversationHistory: history,
      parentNeed: need,
      parentMood: scenario.parentMood ?? null,
      mode: "coaching",
    });

    if (curious !== scenario.expectCurious) {
      console.error(
        `FAIL curiosity gate: "${scenario.message.slice(0, 45)}" expected ${scenario.expectCurious}, got ${curious}`,
      );
      failures++;
    } else if (curious) {
      curiousCount++;
    } else {
      skippedCorrectly++;
    }

    const { response, enrichment, mode } = await generateCoachResponse(
      scenario.message,
      context,
      history,
      { parentMood: scenario.parentMood ?? null },
    );

    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, scenario.message),
      scenario.message,
      history,
      mode,
      enrichment,
    );

    if (scenario.expectCurious) {
      if (!enrichment.isCuriosityMode) {
        console.error(`FAIL not curiosity mode: "${scenario.message.slice(0, 45)}"`);
        failures++;
      }
      if (questionCount(formatted) !== 1) {
        console.error(
          `FAIL question count (${questionCount(formatted)}): "${scenario.message.slice(0, 45)}"`,
        );
        failures++;
      }
      if (/One thought —|Something you could try|Phrases to avoid/i.test(formatted)) {
        console.error(`FAIL advice during curiosity: "${scenario.message.slice(0, 45)}"`);
        failures++;
      }
      if (scenario.questionPattern && !scenario.questionPattern.test(formatted)) {
        console.error(`FAIL question quality: "${scenario.message.slice(0, 45)}"`);
        failures++;
      }
    }

    if (scenario.noAdvice && /One thought —|Something you could try/i.test(formatted)) {
      console.error(`FAIL advice when presence/emotional: "${scenario.message.slice(0, 45)}"`);
      failures++;
    }
  }

  for (const multi of MULTI_TURN) {
    const history: { role: "parent" | "assistant"; content: string }[] = [];

    for (let i = 0; i < multi.turns.length; i++) {
      const turn = multi.turns[i];
      const { response, enrichment, mode } = await generateCoachResponse(
        turn.parent,
        context,
        history,
      );

      const formatted = formatCoachResponse(
        response,
        context,
        memoryForMessage(context, turn.parent),
        turn.parent,
        history,
        mode,
        enrichment,
      );

      if (turn.expectCurious && !enrichment.isCuriosityMode) {
        console.error(`FAIL multi-turn curiosity turn ${i + 1}: "${turn.parent.slice(0, 40)}"`);
        failures++;
      }

      if (turn.expectAcknowledgment && !/helps me understand|helpful context|picture more clearly|important piece/i.test(formatted)) {
        console.error(`FAIL acknowledgment turn ${i + 1}: "${turn.parent.slice(0, 40)}"`);
        failures++;
      }

      history.push({ role: "parent", content: turn.parent });
      history.push({ role: "assistant", content: formatted });
    }
  }

  console.log(`Curious when needed: ${curiousCount}`);
  console.log(`Present when not: ${skippedCorrectly}`);
  console.log(`Curiosity failures: ${failures}`);

  if (failures > 0 || curiousCount < 8) {
    console.error("\n❌ Phase 2 curiosity verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 2 curiosity verification PASSED");
}

const EMOTION_SCENARIOS: {
  message: string;
  expectFeeling?: string;
  expectAckPattern: RegExp;
  parentFocus?: boolean;
  noBanned?: boolean;
}[] = [
  {
    message: "Amy screamed for an hour.",
    expectFeeling: "exhausted",
    expectAckPattern: /exhausting|incredibly long|drained/i,
  },
  {
    message: "Amy stole from her sister.",
    expectAckPattern: /really hard|both children|look after/i,
  },
  {
    message: "I've tried everything.",
    expectFeeling: "frustrated",
    expectAckPattern: /effort|already put/i,
  },
  {
    message: "Amy had an amazing day.",
    expectFeeling: "proud",
    expectAckPattern: /smiled|wonderful|matter/i,
  },
  {
    message: "I'm so upset.",
    parentFocus: true,
    expectAckPattern: /upset|stay with you|listening|hard/i,
  },
  {
    message: "I'm exhausted.",
    expectAckPattern: /exhausting|carrying|hard/i,
  },
  {
    message: "I feel like a terrible parent.",
    expectFeeling: "guilty",
    expectAckPattern: /guilt|care|heavy/i,
  },
  {
    message: "Nobody understands.",
    expectFeeling: "lonely",
    expectAckPattern: /lonely|on your own|listening/i,
  },
  {
    message: "Amy refuses to bath.",
    expectAckPattern: /difficult|hard|exhausting/i,
  },
  {
    message: "Just need to vent.",
    expectAckPattern: /hard|listening|carry/i,
  },
  {
    message: "Worried about school tomorrow.",
    expectFeeling: "worried",
    expectAckPattern: /worry|weighing|hard|difficult/i,
  },
  {
    message: "She was amazing at swimming today.",
    expectFeeling: "proud",
    expectAckPattern: /wonderful|smiled|matter|notice/i,
  },
  {
    message: "I'm falling apart.",
    expectAckPattern: /exhausting|overwhelm|hard|carry/i,
  },
  {
    message: "Homework meltdown again.",
    expectAckPattern: /exhausting|frustrating|difficult|hard/i,
  },
  {
    message: "I don't know what to do anymore.",
    expectAckPattern: /confusing|difficult|hard|worry/i,
  },
  {
    message: "Bad day.",
    expectAckPattern: /hard|difficult|exhausting|carry/i,
  },
  {
    message: "Bedtime was a disaster.",
    expectAckPattern: /exhausting|difficult|hard|frustrating/i,
  },
  {
    message: "I'm so angry about today.",
    expectFeeling: "frustrated",
    expectAckPattern: /frustrating|hard|sense|angry/i,
  },
  {
    message: "Something happened at school.",
    expectAckPattern: /difficult|confusing|hard|worry/i,
  },
  {
    message: "Out of ideas — nothing works.",
    expectAckPattern: /effort|frustrating|hard|tried/i,
  },
];

function firstTwoSentences(text: string): string {
  const parts = text.split(/\n\n+/);
  return parts.slice(0, 2).join(" ");
}

async function runEmotionPhase(context: ReturnType<typeof assembleChildContext>) {
  let failures = 0;
  let ackHits = 0;

  console.log("\n=== Phase 3 — Emotion Before Information ===");
  console.log(`Emotion scenarios: ${EMOTION_SCENARIOS.length}\n`);

  for (const scenario of EMOTION_SCENARIOS) {
    const history: { role: "parent" | "assistant"; content: string }[] = [];
    const { response, enrichment, mode } = await generateCoachResponse(
      scenario.message,
      context,
      history,
    );

    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, scenario.message),
      scenario.message,
      history,
      mode,
      enrichment,
    );

    const opening = firstTwoSentences(formatted);

    if (!scenario.expectAckPattern.test(opening)) {
      console.error(`FAIL emotional ack: "${scenario.message.slice(0, 45)}"`);
      console.error(`  Opening: ${opening.slice(0, 120)}`);
      failures++;
    } else {
      ackHits++;
    }

    if (scenario.expectFeeling && enrichment.parentStory.parentFeeling !== scenario.expectFeeling) {
      console.error(
        `FAIL feeling: "${scenario.message.slice(0, 45)}" expected ${scenario.expectFeeling}, got ${enrichment.parentStory.parentFeeling}`,
      );
      failures++;
    }

    if (scenario.parentFocus && /^Amy\b/i.test(opening.split(".")[0] ?? "")) {
      console.error(`FAIL parent focus — child first: "${scenario.message}"`);
      failures++;
    }

    if (/I know exactly how you feel|I totally understand/i.test(formatted)) {
      console.error(`FAIL banned phrase: "${scenario.message.slice(0, 45)}"`);
      failures++;
    }

    if (/Yesterday|On Thursday|Timeline|Earlier you told me/i.test(opening)) {
      console.error(`FAIL memory opener: "${scenario.message.slice(0, 45)}"`);
      failures++;
    }

    if (enrichment.isCuriosityMode) {
      const qIndex = formatted.indexOf("?");
      const beforeQuestion = formatted.slice(0, qIndex);
      if (!/difficult|hard|exhausting|effort|smiled|worry|frustrating|lonely|upset|carry|listening/i.test(beforeQuestion)) {
        console.error(`FAIL empathy before curiosity: "${scenario.message.slice(0, 45)}"`);
        failures++;
      }
    }
  }

  console.log(`Emotional acknowledgements: ${ackHits}/${EMOTION_SCENARIOS.length}`);
  console.log(`Emotion failures: ${failures}`);

  if (failures > 0 || ackHits < 18) {
    console.error("\n❌ Phase 3 emotion verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Phase 3 emotion verification PASSED");
}

function paragraphCount(text: string): number {
  return text.split(/\n\n+/).filter((p) => p.trim()).length;
}

async function main() {
  const context = assembleChildContext(child, profile, checkins, [], patterns, []);
  let failures = 0;
  const paragraphCounts: number[] = [];
  let templateHits = 0;
  let memoryDumpHits = 0;
  let adviceOnEmotional = 0;
  let classificationMisses = 0;

  console.log("=== Conversation Intelligence Phase 1 ===");
  console.log(`Scenarios: ${SCENARIOS.length}\n`);

  for (const scenario of SCENARIOS) {
    const history: { role: "parent" | "assistant"; content: string }[] = [];

    const classified = classifyParentNeed(scenario.message, {
      parentMood: scenario.parentMood ?? null,
      conversationHistory: history,
    });

    const { response, enrichment, mode } = await generateCoachResponse(
      scenario.message,
      context,
      history,
      { parentMood: scenario.parentMood ?? null },
    );

    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, scenario.message),
      scenario.message,
      history,
      mode,
      enrichment,
    );

    paragraphCounts.push(paragraphCount(formatted));

    if (scenario.expectedNeed && enrichment.parentNeed !== scenario.expectedNeed) {
      if (classified !== scenario.expectedNeed) {
        classificationMisses++;
        console.error(
          `FAIL classify: "${scenario.message.slice(0, 45)}" expected ${scenario.expectedNeed}, got ${enrichment.parentNeed}`,
        );
        failures++;
      }
    }

    if (hasTemplateHeaders(formatted) || TEMPLATE_MARKERS.some((m) => formatted.includes(m))) {
      templateHits++;
      console.error(`FAIL template: "${scenario.message.slice(0, 45)}"`);
      failures++;
    }

    for (const marker of MEMORY_DUMP_MARKERS) {
      if (formatted.includes(marker)) {
        memoryDumpHits++;
        console.error(`FAIL memory dump "${marker}": "${scenario.message.slice(0, 45)}"`);
        failures++;
        break;
      }
    }

    if (scenario.noAdvice && /One thought —|Something you could try|Phrases to avoid/i.test(formatted)) {
      adviceOnEmotional++;
      console.error(`FAIL advice when not wanted: "${scenario.message.slice(0, 45)}"`);
      failures++;
    }

    if (!formatted.trim()) {
      console.error(`FAIL empty reply: "${scenario.message}"`);
      failures++;
    }
  }

  const uniqueCounts = new Set(paragraphCounts).size;
  const minCount = Math.min(...paragraphCounts);
  const maxCount = Math.max(...paragraphCounts);

  console.log(`Classification misses: ${classificationMisses}`);
  console.log(`Template markers found: ${templateHits}`);
  console.log(`Memory dump markers: ${memoryDumpHits}`);
  console.log(`Unwanted advice: ${adviceOnEmotional}`);
  console.log(`Paragraph variety: ${uniqueCounts} distinct counts (${minCount}–${maxCount})`);
  console.log(`Failures: ${failures}`);

  if (
    failures > 0 ||
    SCENARIOS.length < 30 ||
    templateHits > 0 ||
    uniqueCounts < 3
  ) {
    console.error("\n❌ Conversation Intelligence verification FAILED");
    process.exit(1);
  }

  console.log("\n✅ Conversation Intelligence Phase 1 PASSED");

  await runCuriosityPhase(context);
  await runEmotionPhase(context);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
