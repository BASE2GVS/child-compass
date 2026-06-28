/**
 * Generate voice-review.md — 50 conversations for manual voice quality review.
 * Run: npm run generate:voice-review
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  PatternFinding,
} from "@/lib/types/database";

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
  calming_strategies: ["quiet corner", "music during bath"],
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
    mood: 3,
    energy: 3,
    school_rating: 3,
    anxiety: 3,
    sensory_overload: 3,
    demand_tolerance: 3,
    appetite: 3,
    social_battery: 3,
    wins: ["Calmer bath with music"],
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
    category: "sensory",
    title: "Bath",
    description: "Evening baths harder after busy school days",
    confidence: 0.7,
    evidence: {},
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const MESSAGES = [
  "Amy screamed for an hour.",
  "Amy stole from her sister.",
  "I've tried everything.",
  "Amy had an amazing day.",
  "I'm so upset.",
  "I'm exhausted.",
  "Amy refuses to bath.",
  "Something happened at school.",
  "I feel like a terrible parent.",
  "Nobody understands what this is like.",
  "Worried about school tomorrow.",
  "Homework meltdown again.",
  "She recovered faster today than usual.",
  "I just need to vent.",
  "How do I handle morning meltdowns?",
  "Bedtime was a disaster.",
  "She won't eat anything today.",
  "Amy was amazing at swimming today.",
  "I don't know what to do anymore.",
  "She hit her brother.",
  "Grandparents visiting this weekend.",
  "Amy won't wear her shoes.",
  "School was too loud today.",
  "I'm falling apart.",
  "Thanks for listening.",
  "Rough morning.",
  "She had a meltdown at the shop.",
  "Party this Saturday — dreading it.",
  "Amy calmed down faster than usual.",
  "I messed up again.",
  "Tell me what to do about bedtime.",
  "She's been so defiant lately.",
  "Sports day is tomorrow.",
  "I miss who she used to be.",
  "Homework took three hours.",
  "She found the transition hard.",
  "I'm worried sick.",
  "Best day in months.",
  "Amy hid under the table.",
  "I can't cope anymore.",
  "School trip next week.",
  "She threw things at me.",
  "Lovely calm evening.",
  "What should I say when she hits?",
  "Amy refused to get in the car.",
  "I'm so angry about today.",
  "She wouldn't eat breakfast.",
  "Help — I don't know where to start.",
  "We tried the visual timer — didn't work.",
  "She said she hates herself.",
];

async function main() {
  const context = assembleChildContext(child, profile, checkins, [], patterns, []);
  const voiceHistory: { role: "parent" | "assistant"; content: string }[] = [];
  const lines: string[] = [
    "# Child Compass 5.1 — Voice Review",
    "",
    "Fifty conversations for manual review. Cover the names — could one compassionate person have written them all?",
    "",
    "---",
    "",
  ];

  for (let i = 0; i < MESSAGES.length; i++) {
    const message = MESSAGES[i];
    const history: { role: "parent" | "assistant"; content: string }[] = [];

    const { response, enrichment, mode } = await generateCoachResponse(message, context, history);
    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, message),
      message,
      voiceHistory,
      mode,
      enrichment,
    );

    voiceHistory.push({ role: "assistant", content: formatted });

    lines.push(`## ${i + 1}`);
    lines.push("");
    lines.push(`**Parent:** ${message}`);
    lines.push("");
    lines.push("**Child Compass:**");
    lines.push("");
    lines.push(formatted);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const outPath = join(process.cwd(), "voice-review.md");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath} (${MESSAGES.length} conversations)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
