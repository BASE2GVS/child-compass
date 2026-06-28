/**
 * Generate conversation-review.md — 20 real conversation transcripts for manual review.
 * Run: npm run generate:conversation-review
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
  { parent: "I'm falling apart." },
  { parent: "Amy was amazing at swimming today." },
  { parent: "I don't know what to do anymore." },
];

function feelingRationale(story: {
  parentFeeling: string;
  firstNeed: string;
  parentIsFocus: boolean;
  whatHappened: string | null;
}): string {
  const parts = [
    `Detected parent feeling: **${story.parentFeeling}**.`,
    `First need: **${story.firstNeed}**.`,
  ];
  if (story.parentIsFocus) parts.push("Parent is the focus — child analysis deferred.");
  if (story.whatHappened) parts.push(`Situation: "${story.whatHappened.slice(0, 80)}".`);
  return parts.join(" ");
}

async function main() {
  const context = assembleChildContext(child, profile, checkins, [], patterns, []);
  const lines: string[] = [
    "# Child Compass 4.1 — Conversation Review",
    "",
    "Phase 3: Emotion Before Information",
    "",
    "20 complete conversation transcripts for manual founder review.",
    "Each entry shows the parent message, Child Compass reply, and why that emotional approach was chosen.",
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

    const { response, enrichment, mode } = await generateCoachResponse(convo.parent, context, history);
    const formatted = formatCoachResponse(
      response,
      context,
      memoryForMessage(context, convo.parent),
      convo.parent,
      history,
      mode,
      enrichment,
    );

    lines.push("**Child Compass:**");
    lines.push("");
    lines.push(formatted.split("\n").map((l) => (l ? l : "")).join("\n"));
    lines.push("");
    lines.push(`**Why this approach:** ${feelingRationale(enrichment.parentStory)}`);
    if (enrichment.isCuriosityMode) lines.push("Chose curiosity after emotional acknowledgement — not coaching yet.");
    lines.push("");

    if (convo.followUp) {
      history.push({ role: "parent", content: convo.parent });
      history.push({ role: "assistant", content: formatted });

      lines.push(`**Parent (follow-up):** ${convo.followUp}`);
      lines.push("");

      const follow = await generateCoachResponse(convo.followUp, context, history);
      const followFormatted = formatCoachResponse(
        follow.response,
        context,
        memoryForMessage(context, convo.followUp),
        convo.followUp,
        history,
        follow.mode,
        follow.enrichment,
      );

      lines.push("**Child Compass (follow-up):**");
      lines.push("");
      lines.push(followFormatted);
      lines.push("");
      lines.push(
        `**Why this approach:** ${feelingRationale(follow.enrichment.parentStory)} Acknowledged the parent's answer before continuing.`,
      );
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  const outPath = join(process.cwd(), "conversation-review.md");
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath} (${REVIEW_CONVERSATIONS.length} conversations)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
