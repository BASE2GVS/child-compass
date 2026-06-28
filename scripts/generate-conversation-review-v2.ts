/**
 * Generate conversation-review-v2.md — Conversation Engine 5.0 review transcripts.
 * Run: npm run generate:conversation-review-v2
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import { memoryForMessage } from "@/lib/ai/child-context";
import { formatCoachResponse } from "@/lib/intelligence/coach-format";
import { runConversationEngine } from "@/lib/conversation-engine";
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

const REVIEW_CONVERSATIONS: { parent: string; followUp?: string }[] = [
  { parent: "Amy screamed for an hour." },
  { parent: "Amy stole from her sister." },
  { parent: "I've tried everything." },
  { parent: "Amy had an amazing day." },
  { parent: "I'm so upset." },
  { parent: "I'm exhausted." },
  { parent: "Amy refuses to bath." },
  { parent: "Something happened at school." },
  { parent: "I feel like a terrible parent." },
  { parent: "Nobody understands what this is like." },
  {
    parent: "Amy stole from her sister.",
    followUp: "She slips in, grabs a toy, and runs back to her room.",
  },
  { parent: "Worried about school tomorrow." },
  { parent: "Homework meltdown again." },
  { parent: "She recovered faster today than usual." },
  { parent: "I just need to vent." },
  { parent: "How do I handle morning meltdowns?" },
  { parent: "Bedtime was a disaster." },
  { parent: "She won't eat anything today." },
  { parent: "Amy was amazing at swimming today." },
  { parent: "I don't know what to do anymore." },
];

async function runTurn(
  context: ReturnType<typeof assembleChildContext>,
  message: string,
  history: { role: "parent" | "assistant"; content: string }[],
) {
  const engine = runConversationEngine(message, context, { conversationHistory: history });
  const { response, enrichment, mode } = await generateCoachResponse(message, context, history);
  const formatted = formatCoachResponse(
    response,
    context,
    memoryForMessage(context, message),
    message,
    history,
    mode,
    enrichment,
  );
  return { engine, formatted, enrichment };
}

async function main() {
  const context = assembleChildContext(child, profile, checkins, [], patterns, []);
  const lines: string[] = [
    "# Child Compass 5.0 — Conversation Engine Review",
    "",
    "Architecture: understand message → determine needs → retrieve max 5 memory items → LLM/reason → one continuous reply.",
    "",
    "---",
    "",
  ];

  let index = 0;
  for (const convo of REVIEW_CONVERSATIONS) {
    index++;
    const history: { role: "parent" | "assistant"; content: string }[] = [];

    lines.push(`## Conversation ${index}`);
    lines.push("");
    lines.push(`**Parent:** ${convo.parent}`);
    lines.push("");

    const turn = await runTurn(context, convo.parent, history);

    lines.push(`**Engine:** intent=${turn.engine.intent}, priority=${turn.engine.priority}, memory=${turn.engine.trace.memoryCount}/${turn.engine.trace.maxAllowed}`);
    if (turn.engine.trace.items.length) {
      lines.push(`**Retrieved:** ${turn.engine.trace.items.join("; ")}`);
    }
    lines.push("");
    lines.push("**Child Compass:**");
    lines.push("");
    lines.push(turn.formatted);
    lines.push("");
    lines.push(
      `**Review notes:** Parent feeling=${turn.enrichment.parentStory.parentFeeling}. First need=${turn.enrichment.parentStory.firstNeed}. ${turn.enrichment.isCuriosityMode ? "Curiosity mode — no coaching yet." : "Coaching/presence path."}`,
    );
    lines.push("");

    if (convo.followUp) {
      history.push({ role: "parent", content: convo.parent });
      history.push({ role: "assistant", content: turn.formatted });

      lines.push(`**Parent (follow-up):** ${convo.followUp}`);
      lines.push("");

      const follow = await runTurn(context, convo.followUp, history);
      lines.push(`**Engine:** intent=${follow.engine.intent}, memory=${follow.engine.trace.memoryCount} items`);
      lines.push("");
      lines.push("**Child Compass (follow-up):**");
      lines.push("");
      lines.push(follow.formatted);
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  const outPath = join(process.cwd(), "conversation-review-v2.md");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
