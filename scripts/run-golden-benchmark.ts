import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { assembleChildContext, memoryForMessage } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import type { ParentMood } from "@/lib/companion/parent-checkin";
import type { Child, ChildProfile, DailyCheckin, PatternFinding } from "@/lib/types/database";

type MetricName =
  | "presence"
  | "recognition"
  | "understanding"
  | "agency"
  | "hope"
  | "naturalness"
  | "emotionalTiming"
  | "conversationFlow"
  | "trust";

type CategorySpec = {
  name: string;
  count: number;
  prompts: string[];
  mood?: ParentMood | null;
  expectedEmotion: "distress" | "celebration" | "practical" | "grief" | "fear" | "mixed";
  requiredOutcome: string;
};

type Scenario = {
  id: string;
  category: string;
  message: string;
  parentMood?: ParentMood | null;
  expectedEmotion: CategorySpec["expectedEmotion"];
  requiredOutcome: string;
};

type ScoredScenario = Scenario & {
  response: string;
  scores: Record<MetricName, number>;
  overall: number;
  penalties: number;
  hardFail: boolean;
  failureFlags: string[];
  rootCause: string;
};

const WEIGHTS: Record<MetricName, number> = {
  presence: 0.14,
  recognition: 0.12,
  understanding: 0.1,
  agency: 0.12,
  hope: 0.1,
  naturalness: 0.09,
  emotionalTiming: 0.12,
  conversationFlow: 0.08,
  trust: 0.13,
};

const OPENING_EMPATHY =
  /\b(hard|heavy|overwhelmed|exhausted|makes sense|that sounds|you're carrying|you're not alone|thank you for sharing|i hear you|that hurts|i'm here)\b/i;
const ADVICE_MARKERS =
  /\b(you should|you need to|do this|try to|start by|one thing (?:that )?(?:might|you could)|if it helps|next step|tonight)\b/i;
const ACTION_MARKERS =
  /\b(one thing|next step|tonight|tomorrow|try|start by|you could|if it helps)\b/i;
const REASSURANCE_FAKE = /\b(everything will be fine|it will all be okay|definitely|guarantee|always works)\b/i;
const CLINICAL_OR_TEACHER =
  /\b(antecedent|intervention|evidence-based|compliance|noncompliant|implement|protocol|caregiver should|it is important to)\b/i;
const SOFTWARE_LANGUAGE =
  /\b(data suggests|pattern detected|algorithm|knowledge graph|as an ai|assessment shows|submit|generate report|timeline \()\b/i;
const BLAME = /\b(if you were consistent|you failed to|you should have|your fault)\b/i;
const RECOGNITION_WORDS =
  /\b(feel|feeling|sounds|makes sense|carrying|heavy|guilt|ashamed|afraid|worried|grief|angry|exhausted|alone|overwhelmed)\b/i;
const UNDERSTANDING_WORDS =
  /\b(what may be happening|likely|pattern|because|in this moment|right now|what matters first|before)\b/i;
const HOPE_WORDS = /\b(next step|tomorrow|possible|we can|small|gentle|steady|when you're ready|build from)\b/i;

const CATEGORY_SPECS: CategorySpec[] = [
  {
    name: "Everyday parenting",
    count: 50,
    prompts: [
      "Today felt chaotic from breakfast onward.",
      "I'm trying to keep things steady but everything feels messy.",
      "I need help with ordinary days that keep going wrong.",
      "I don't need perfection, I just need today to feel less hard.",
      "How do we get through evenings without everyone exploding?",
    ],
    expectedEmotion: "mixed",
    requiredOutcome: "understood and capable",
  },
  { name: "PDA", count: 20, prompts: ["Any request sets her off.", "Demands become instant conflict.", "How do I ask without triggering panic?", "She hears everything as pressure.", "Even simple requests become battles."], expectedEmotion: "practical", requiredOutcome: "lower pressure and one low-demand step" },
  { name: "Autism", count: 30, prompts: ["Transitions are overwhelming again.", "Unexpected change led to shutdown.", "Noise at school was too much.", "How do I support without forcing?", "Today felt sensory-heavy from start to finish."], expectedEmotion: "practical", requiredOutcome: "dignity-preserving support" },
  { name: "ADHD", count: 25, prompts: ["Homework became another spiral.", "We lose the evening to reminders.", "I feel like I'm nagging all day.", "How do we reduce friction around tasks?", "We're stuck in repeat conflict loops."], expectedEmotion: "practical", requiredOutcome: "one realistic structure step" },
  { name: "Meltdowns", count: 30, prompts: ["The meltdown was huge and I feel shaken.", "She exploded and I froze.", "Public meltdown and everyone stared.", "I still feel panicked after tonight.", "I don't know what to do after a meltdown."], expectedEmotion: "distress", requiredOutcome: "calmer with immediate action" },
  { name: "Shutdowns", count: 20, prompts: ["She went completely silent again.", "He shut down and wouldn't respond.", "I can't tell if I should push or pause.", "We hit a wall and everything went quiet.", "Shutdowns leave me unsure what to do next."], expectedEmotion: "practical", requiredOutcome: "gentle next move" },
  { name: "School", count: 30, prompts: ["School refusal is getting worse.", "Drop-off was chaos again.", "Tomorrow morning already feels impossible.", "School keeps saying she needs to comply.", "I dread mornings now."], expectedEmotion: "fear", requiredOutcome: "less dread for tomorrow" },
  { name: "Sleep", count: 25, prompts: ["Sleep was awful and I'm wrecked.", "Bedtime is a nightly war.", "Nights are breaking us.", "I cannot do another bedtime battle.", "No one slept and I'm at my limit."], expectedEmotion: "distress", requiredOutcome: "one low-effort night step" },
  { name: "Food", count: 15, prompts: ["Meals are becoming a battleground.", "She refuses nearly everything.", "Dinner ended in tears.", "I feel judged about food all the time.", "How do we reduce meal stress tonight?"], expectedEmotion: "practical", requiredOutcome: "less shame and one meal step" },
  { name: "Haircuts", count: 8, prompts: ["Haircut day always ends badly.", "We need a haircut but panic starts early.", "I don't know how to prepare for haircuts.", "Last haircut was traumatic.", "How can we make the next haircut survivable?"], expectedEmotion: "fear", requiredOutcome: "prepared and less anxious" },
  { name: "Dentist", count: 8, prompts: ["Dentist tomorrow and we're both anxious.", "The last dentist visit was awful.", "I don't know how to prep without pressure.", "She's terrified of the dentist.", "How do we make the appointment manageable?"], expectedEmotion: "fear", requiredOutcome: "lower dread and one prep step" },
  { name: "Grandparents", count: 15, prompts: ["Grandparents keep judging our approach.", "Family says I'm too soft.", "Visits become conflict fast.", "I need one boundary phrase for this weekend.", "I feel alone in family criticism."], expectedEmotion: "mixed", requiredOutcome: "less isolated with one boundary step" },
  { name: "Marriage", count: 18, prompts: ["My partner and I disagree on everything right now.", "Co-parent conflict is draining me.", "We keep fighting about how to handle behavior.", "I need a calmer way to talk with my partner.", "Marriage strain is making parenting harder."], expectedEmotion: "mixed", requiredOutcome: "one stabilizing co-parent step" },
  { name: "Sibling conflict", count: 20, prompts: ["Siblings are fighting constantly.", "I can't meet everyone's needs.", "One child feels forgotten.", "Everything feels unfair to someone.", "How do I de-escalate sibling conflict tonight?"], expectedEmotion: "mixed", requiredOutcome: "less torn with one concrete step" },
  { name: "Burnout", count: 25, prompts: ["I'm completely burnt out.", "I have nothing left tonight.", "I feel numb and empty.", "I cannot think clearly anymore.", "Please keep this simple, I'm done."], mood: "exhausted", expectedEmotion: "distress", requiredOutcome: "emotional containment and tiny step" },
  { name: "Celebrations", count: 18, prompts: ["Today actually went well.", "She asked for help before melting down.", "We had a calm morning for once.", "I feel proud and scared it'll vanish.", "Can we hold onto this win?"], expectedEmotion: "celebration", requiredOutcome: "joy protected and confidence reinforced" },
  { name: "Success", count: 18, prompts: ["We made progress this week.", "Something finally clicked.", "I handled a hard moment better.", "I want to build on what's working.", "This feels like a real step forward."], expectedEmotion: "celebration", requiredOutcome: "confidence and reusable insight" },
  { name: "Grief", count: 15, prompts: ["I miss who she used to be.", "This grief keeps hitting me.", "I'm grieving the life I expected.", "I feel loss and guilt at once.", "Please don't try to fix this right now."], expectedEmotion: "grief", requiredOutcome: "accompanied and less alone" },
  { name: "Medication", count: 10, prompts: ["Should we change medication?", "I'm scared of getting meds wrong.", "Doctor mentioned meds and I'm unsettled.", "I need help preparing for a medication conversation.", "How do I think about this without panicking?"], expectedEmotion: "fear", requiredOutcome: "less fear and one next discussion step" },
  { name: "Therapy", count: 10, prompts: ["Therapy felt unhelpful today.", "I don't know if this therapist is the right fit.", "I'm exhausted by appointments.", "How do I prepare for tomorrow's therapy session?", "I feel uncertain about continuing therapy."], expectedEmotion: "mixed", requiredOutcome: "clarity and one coordination step" },
  { name: "Transitions", count: 20, prompts: ["Transitions keep blowing up.", "Leaving the house is a battle.", "Switching activities is the hardest part.", "How do I make transitions gentler?", "Every transition ends in tears."], expectedEmotion: "practical", requiredOutcome: "one low-friction transition move" },
  { name: "Anxiety", count: 20, prompts: ["I'm spiraling about tomorrow.", "Her anxiety is high and mine is too.", "What if this keeps getting worse?", "I can't stop thinking ahead.", "Please help me calm this loop."], expectedEmotion: "fear", requiredOutcome: "grounded and less spiraled" },
  { name: "Shopping", count: 10, prompts: ["Grocery trips are impossible lately.", "Shops are too overwhelming.", "I avoid stores now.", "How do we make one shopping trip manageable?", "Public shopping keeps ending in meltdown."], expectedEmotion: "fear", requiredOutcome: "one manageable outing plan" },
  { name: "Travel", count: 10, prompts: ["Travel this weekend feels impossible.", "Car rides are escalating again.", "I need one high-leverage travel prep step.", "I'm anxious about airport sensory overload.", "How do we survive this trip?"], expectedEmotion: "fear", requiredOutcome: "reduced overwhelm and one prep action" },
  { name: "Public outings", count: 18, prompts: ["Public outings leave me humiliated.", "Everyone stared when things escalated.", "I don't want to go out anymore.", "How do I try again after what happened?", "I feel exposed and judged in public."], expectedEmotion: "distress", requiredOutcome: "dignity restored and steadier re-entry" },
  { name: "Unexpected wins", count: 6, prompts: ["Unexpectedly, today went really well.", "We had a surprise calm moment.", "A hard trigger didn't explode this time.", "I did not expect that success.", "How do we keep this without pressure?"], expectedEmotion: "celebration", requiredOutcome: "joy preserved" },
  { name: "Unexpected setbacks", count: 6, prompts: ["We regressed badly today.", "After progress, we had a major setback.", "I feel defeated after this backslide.", "Everything fell apart again.", "How do we restart after this?"], expectedEmotion: "distress", requiredOutcome: "less defeated and restart-ready" },
];

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
  support_needs: ["Sensory", "Transitions"],
  interests: ["Drawing", "Animals"],
  favourite_activities: [],
  created_at: "",
  updated_at: "",
};

const profile: ChildProfile = {
  id: "p1",
  child_id: "c1",
  family_id: "f1",
  strengths: ["Creative", "Kind"],
  sensory_preferences: {},
  favourite_things: [],
  known_triggers: ["being rushed", "loud public places", "unexpected transitions"],
  calming_strategies: ["quiet corner", "visual countdown"],
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

function checkin(date: string, overrides: Partial<DailyCheckin> = {}): DailyCheckin {
  return {
    id: date,
    child_id: "c1",
    family_id: "f1",
    user_id: "u1",
    checkin_date: date,
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
    created_at: date,
    ...overrides,
  };
}

const today = new Date();
const d0 = today.toISOString().split("T")[0];
const d1 = new Date(today.getTime() - 86400000).toISOString().split("T")[0];
const d2 = new Date(today.getTime() - 172800000).toISOString().split("T")[0];

const patterns: PatternFinding[] = [
  {
    id: "pat1",
    child_id: "c1",
    family_id: "f1",
    category: "school",
    title: "Morning pressure pattern",
    description: "Hard mornings often follow poor sleep and rushed transitions.",
    confidence: 0.81,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "pat2",
    child_id: "c1",
    family_id: "f1",
    category: "sensory",
    title: "Public noise overload",
    description: "Crowded public environments correlate with escalations.",
    confidence: 0.74,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

function clamp(n: number): number {
  return Math.max(0, Math.min(10, Number(n.toFixed(2))));
}

function firstParagraph(text: string): string {
  return text.split(/\n\n+/)[0] || text;
}

function sentenceCount(text: string): number {
  return (text.match(/[.!?](?:\s|$)/g) ?? []).length || 1;
}

function countActionHints(text: string): number {
  const lower = text.toLowerCase();
  const candidates = [
    /\bone thing\b/g,
    /\bnext step\b/g,
    /\btonight\b/g,
    /\btomorrow\b/g,
    /\bif it helps\b/g,
    /\byou could\b/g,
    /\btry\b/g,
    /\bstart by\b/g,
  ];
  return candidates.reduce((acc, re) => acc + (lower.match(re)?.length ?? 0), 0);
}

function scoreScenario(response: string, scenario: Scenario): Omit<ScoredScenario, keyof Scenario | "response" | "rootCause"> & { rootCause: string } {
  const failureFlags: string[] = [];
  const fp = firstParagraph(response);
  const lower = response.toLowerCase();

  let presence = 5;
  if (OPENING_EMPATHY.test(fp)) presence += 3;
  if (ADVICE_MARKERS.test(fp)) presence -= 2;
  if (BLAME.test(fp)) presence -= 3;
  if (/\b(you're not alone|i'm here|makes sense)\b/i.test(fp)) presence += 1;

  let recognition = 5;
  if (RECOGNITION_WORDS.test(fp) || RECOGNITION_WORDS.test(response)) recognition += 2;
  if (/\bexactly|heavy|guilt|afraid|ashamed|overwhelmed|alone|proud\b/i.test(response)) recognition += 1;
  if (/\bthat sounds hard\b/i.test(response) && !/\b(tonight|tomorrow|this moment)\b/i.test(response)) recognition -= 0.5;
  if (scenario.expectedEmotion === "celebration" && /\b(proud|win|celebrate|huge)\b/i.test(response)) recognition += 1;

  let understanding = 5;
  if (UNDERSTANDING_WORDS.test(response)) understanding += 2;
  if (/\bwhat matters (?:first|now)\b/i.test(response)) understanding += 1;
  if (sentenceCount(response) > 11) understanding -= 1;
  if (/\b(antecedent|evidence-based|protocol|intervention)\b/i.test(response)) understanding -= 2;

  let agency = 5;
  const actionHints = countActionHints(response);
  if (ACTION_MARKERS.test(response)) agency += 2;
  if (/\b(one|small|gentle) (?:step|thing)\b/i.test(response)) agency += 1;
  if (actionHints >= 4) agency -= 2;
  if (actionHints >= 6) agency -= 2;
  if (!ACTION_MARKERS.test(response)) agency -= 1;

  let hope = 5;
  const lastParagraph = response.split(/\n\n+/).slice(-1)[0] || response;
  if (HOPE_WORDS.test(lastParagraph)) hope += 2;
  if (/\b(quietly|gently|small|next)\b/i.test(lastParagraph)) hope += 1;
  if (REASSURANCE_FAKE.test(response)) hope -= 3;

  let naturalness = 6.5;
  if (!SOFTWARE_LANGUAGE.test(response) && !CLINICAL_OR_TEACHER.test(response)) naturalness += 1.2;
  if (/\b(you're|it's|i'm|we can|let's|that sounds)\b/i.test(response)) naturalness += 0.8;
  if (response.includes("\n\n") && sentenceCount(response) <= 8) naturalness += 0.6;
  if (/\b(One thought —|Recommendation:|Strategy:)\b/i.test(response)) naturalness -= 0.8;
  if (SOFTWARE_LANGUAGE.test(response)) naturalness -= 3.2;
  if (CLINICAL_OR_TEACHER.test(response)) naturalness -= 1.8;

  let emotionalTiming = 6;
  if (!ADVICE_MARKERS.test(fp) && OPENING_EMPATHY.test(fp)) emotionalTiming += 3;
  if (ADVICE_MARKERS.test(fp)) emotionalTiming -= 2.5;
  if (scenario.expectedEmotion === "distress" && ADVICE_MARKERS.test(fp)) emotionalTiming -= 1;

  let conversationFlow = 6;
  const paragraphs = response.split(/\n\n+/).filter((p) => p.trim().length > 0);
  if (paragraphs.length >= 2 && paragraphs.length <= 4) conversationFlow += 2;
  if (paragraphs.length === 1) conversationFlow -= 1;
  if (paragraphs.length > 5) conversationFlow -= 1.2;
  if (OPENING_EMPATHY.test(paragraphs[0] || "") && ACTION_MARKERS.test(response) && HOPE_WORDS.test(lastParagraph)) {
    conversationFlow += 1;
  }

  let trust = 6;
  if (BLAME.test(response)) trust -= 4;
  if (REASSURANCE_FAKE.test(response)) trust -= 2;
  if (!SOFTWARE_LANGUAGE.test(response) && !CLINICAL_OR_TEACHER.test(response)) trust += 2;
  if (/\b(i might be wrong|if it helps|could be|may be)\b/i.test(response)) trust += 0.7;
  if (/\b(you're not alone|i'm here|makes sense)\b/i.test(response)) trust += 0.5;
  if (/\b(you should|you need to)\b/i.test(response)) trust -= 1.5;

  let hardFail = false;
  let penalties = 0;

  if (ADVICE_MARKERS.test(fp) && !OPENING_EMPATHY.test(fp)) {
    failureFlags.push("starts_with_advice_before_empathy");
    hardFail = true;
  }
  if (actionHints >= 6) {
    failureFlags.push("advice_overload");
    penalties += 1;
  }
  if (REASSURANCE_FAKE.test(response)) {
    failureFlags.push("generic_or_false_reassurance");
    penalties += 1;
  }
  if (CLINICAL_OR_TEACHER.test(response)) {
    failureFlags.push("clinical_or_teacher_language");
    penalties += 0.8;
  }
  if (SOFTWARE_LANGUAGE.test(response)) {
    failureFlags.push("software_language");
    penalties += 0.9;
  }
  if (sentenceCount(response) > 12) {
    failureFlags.push("over_explaining");
    penalties += 0.5;
  }

  const scores: Record<MetricName, number> = {
    presence: clamp(presence),
    recognition: clamp(recognition),
    understanding: clamp(understanding),
    agency: clamp(agency),
    hope: clamp(hope),
    naturalness: clamp(naturalness),
    emotionalTiming: clamp(emotionalTiming),
    conversationFlow: clamp(conversationFlow),
    trust: clamp(trust),
  };

  let overall = Object.entries(scores).reduce((acc, [k, v]) => acc + v * WEIGHTS[k as MetricName], 0);
  overall -= penalties;
  if (hardFail) overall = Math.min(overall, 5.9);
  overall = clamp(overall);

  const ranked = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const weakest = ranked.slice(0, 2).map(([k]) => k).join("+");
  const rootCause = failureFlags[0] ?? `low_${weakest}`;

  return { scores, overall, penalties, hardFail, failureFlags, rootCause };
}

function buildScenarios(): Scenario[] {
  const scenarios: Scenario[] = [];
  for (const spec of CATEGORY_SPECS) {
    for (let i = 0; i < spec.count; i++) {
      const base = spec.prompts[i % spec.prompts.length];
      const variant = i % 5;
      const suffix =
        variant === 0
          ? ""
          : variant === 1
            ? " Tonight feels heavy."
            : variant === 2
              ? " I need this to be realistic for today."
              : variant === 3
                ? " Please keep this simple."
                : " I want one gentle next step.";
      scenarios.push({
        id: `${spec.name.replace(/\s+/g, "_").toLowerCase()}_${String(i + 1).padStart(3, "0")}`,
        category: spec.name,
        message: `${base}${suffix}`.trim(),
        parentMood: spec.mood ?? null,
        expectedEmotion: spec.expectedEmotion,
        requiredOutcome: spec.requiredOutcome,
      });
    }
  }
  return scenarios;
}

async function run(label: string) {
  const context = assembleChildContext(
    child,
    profile,
    [
      checkin(d0, { mood: 2, anxiety: 4, demand_tolerance: 2, challenges: ["School morning chaos"] }),
      checkin(d1, { mood: 2, anxiety: 4, sleep_quality: 2, challenges: ["Evening meltdown"] }),
      checkin(d2, { mood: 3, anxiety: 3, wins: ["Asked for help before shutdown"] }),
    ],
    [],
    patterns,
    [],
  );

  const scenarios = buildScenarios();
  const history: { role: "parent" | "assistant"; content: string }[] = [];
  const results: ScoredScenario[] = [];

  for (const scenario of scenarios) {
    const { response, mode, enrichment } = await generateCoachResponse(
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

    const scored = scoreScenario(formatted, scenario);
    results.push({ ...scenario, response: formatted, ...scored });

    history.push({ role: "parent", content: scenario.message });
    history.push({ role: "assistant", content: formatted.slice(0, 280) });
    if (history.length > 24) history.splice(0, history.length - 24);
  }

  const avg = (key: MetricName | "overall") =>
    Number(
      (
        results.reduce((acc, r) => acc + (key === "overall" ? r.overall : r.scores[key]), 0) /
        results.length
      ).toFixed(3),
    );

  const byCategory = CATEGORY_SPECS.map((c) => {
    const rs = results.filter((r) => r.category === c.name);
    const hardFails = rs.filter((r) => r.hardFail).length;
    return {
      category: c.name,
      count: rs.length,
      overall: Number((rs.reduce((a, r) => a + r.overall, 0) / rs.length).toFixed(3)),
      trust: Number((rs.reduce((a, r) => a + r.scores.trust, 0) / rs.length).toFixed(3)),
      hope: Number((rs.reduce((a, r) => a + r.scores.hope, 0) / rs.length).toFixed(3)),
      hardFails,
    };
  });

  const lowest20 = [...results]
    .sort((a, b) => a.overall - b.overall)
    .slice(0, 20)
    .map((r) => ({
      id: r.id,
      category: r.category,
      message: r.message,
      overall: r.overall,
      weakest: Object.entries(r.scores).sort((a, b) => a[1] - b[1]).slice(0, 3),
      failureFlags: r.failureFlags,
      rootCause: r.rootCause,
      response: r.response,
    }));

  const summary = {
    label,
    timestamp: new Date().toISOString(),
    total: results.length,
    averages: {
      presence: avg("presence"),
      recognition: avg("recognition"),
      understanding: avg("understanding"),
      agency: avg("agency"),
      hope: avg("hope"),
      naturalness: avg("naturalness"),
      emotionalTiming: avg("emotionalTiming"),
      conversationFlow: avg("conversationFlow"),
      trust: avg("trust"),
      overall: avg("overall"),
    },
    hardFailRate: Number((results.filter((r) => r.hardFail).length / results.length).toFixed(4)),
    byCategory,
    lowest20,
  };

  const out = resolve(`.tmp-sprint9-${label}.json`);
  writeFileSync(out, JSON.stringify(summary, null, 2), "utf8");

  console.log(`Golden benchmark (${label}) complete: ${results.length} conversations`);
  console.log(`Overall: ${summary.averages.overall}`);
  console.log(`Presence: ${summary.averages.presence}`);
  console.log(`Recognition: ${summary.averages.recognition}`);
  console.log(`Understanding: ${summary.averages.understanding}`);
  console.log(`Agency: ${summary.averages.agency}`);
  console.log(`Hope: ${summary.averages.hope}`);
  console.log(`Naturalness: ${summary.averages.naturalness}`);
  console.log(`Conversation Flow: ${summary.averages.conversationFlow}`);
  console.log(`Trust: ${summary.averages.trust}`);
  console.log(`Hard-fail rate: ${summary.hardFailRate}`);
  console.log(`Saved: ${out}`);
}

const label = process.argv[2] || "before";

run(label).catch((err) => {
  console.error(err);
  process.exit(1);
});
