/**
 * Smart Documents foundation verification.
 * Run: npm run test:documents
 */
import { prepareSmartDocument } from "@/lib/documents";
import type { DocumentInput } from "@/lib/documents/document-input";
import type { Child, ChildProfile, DailyCheckin, PatternFinding } from "@/lib/types/database";

const child: Child = {
  id: "c1",
  family_id: "f1",
  photo_url: null,
  first_name: "Amy",
  nickname: null,
  date_of_birth: "2018-03-15",
  gender: null,
  school: "Oak Primary",
  grade: "2",
  diagnosis: ["Autism"],
  support_needs: ["Quiet space"],
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
  sensory_preferences: { noise: "sensitive to loud spaces" },
  favourite_things: ["Lego"],
  known_triggers: ["crowded shops"],
  calming_strategies: ["quiet corner"],
  support_network: [],
  notes: "Responds well to visual schedules.",
  medical_history: "None recorded",
  medication: ["melatonin"],
  challenges: ["morning transitions"],
  successful_strategies: ["two choices", "visual timer"],
  support_team: [{ name: "Dr Patel", role: "GP", phone: "0123" }],
  school_contacts: [],
  doctors: [],
  therapists: [],
  emergency_notes: "Call Mum first",
  created_at: "",
  updated_at: "",
};

const checkin: DailyCheckin = {
  id: "ci1",
  child_id: "c1",
  family_id: "f1",
  user_id: "u1",
  checkin_date: "2026-06-20",
  day_type: "weekday",
  sleep_quality: 3,
  mood: 4,
  energy: 3,
  school_rating: 3,
  anxiety: 2,
  sensory_overload: 2,
  demand_tolerance: 3,
  appetite: 3,
  social_battery: 3,
  wins: ["Two choices worked at breakfast"],
  challenges: ["Busy morning"],
  notes: null,
  created_at: "",
};

const input: DocumentInput = {
  child,
  profile,
  checkins: [checkin],
  debriefs: [],
  patterns: [
    {
      id: "p1",
      child_id: "c1",
      family_id: "f1",
      category: "school",
      title: "Mornings",
      description: "School mornings can be demanding.",
      confidence: 0.8,
      evidence: {},
      is_active: true,
      created_at: "",
      updated_at: "",
    },
  ] as PatternFinding[],
  timelineEvents: [],
  unifiedTimeline: [],
  aiInsights: [],
  goals: [],
  goalUpdates: [],
  habits: [],
  habitEntries: [],
  healthObservations: [],
  therapySessions: [],
  schoolEntries: [],
  uploadedDocuments: [],
  coachHighlights: [],
  activeGoals: [{ id: "g1", child_id: "c1", family_id: "f1", user_id: "u1", title: "Calmer mornings", category: "school", status: "active", target_value: 5, current_value: 2, celebration_note: null, created_at: "", updated_at: "" }],
};

function run() {
  let passed = 0;
  let failed = 0;

  for (const type of ["pda_passport", "teacher_guide", "weekly_summary"] as const) {
    const doc = prepareSmartDocument(type, input, []);
    const hasRealData = doc.sections.some(
      (s) =>
        (Array.isArray(s.body) ? s.body : [s.body]).some(
          (line) => typeof line === "string" && line.includes("Amy"),
        ) ||
        (Array.isArray(s.body) ? s.body : [s.body]).some(
          (line) => typeof line === "string" && line.includes("visual timer"),
        ),
    );
    const allPlaceholder = doc.sections.every((s) => {
      const lines = Array.isArray(s.body) ? s.body : [s.body];
      return lines.every((l) => l.includes("still getting to know"));
    });
    if (doc.sections.length >= 5 && hasRealData && !allPlaceholder) {
      console.log(`✓ ${type} pre-populates (${doc.sections.length} sections)`);
      passed++;
    } else {
      console.log(`✗ ${type} failed prep check`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

run();
