import assert from "node:assert/strict";
import { TALK_V2_CONTRACT_VERSION } from "@/lib/talk-v2/contracts";
import { buildFamilyContext } from "@/lib/talk-v2/context/family-context-engine";
import { detectContextIntents } from "@/lib/talk-v2/context/intent-detection";

function makeSupabaseFixture() {
  const now = new Date().toISOString();

  const tables: Record<string, any[]> = {
    children: [
      {
        id: "child-1",
        family_id: "fam-1",
        first_name: "Lienke",
        nickname: null,
        diagnosis: ["Autism"],
        support_needs: ["predictability"],
        school: "Primary",
        grade: "3",
      },
    ],
    child_profiles: [
      {
        child_id: "child-1",
        strengths: ["curiosity"],
        known_triggers: ["sudden transitions", "loud spaces"],
        calming_strategies: ["quiet corner"],
        successful_strategies: ["visual timer", "bedtime countdown"],
        challenges: ["school refusal", "sleep disruption"],
      },
    ],
    coach_messages: [
      {
        id: "m1",
        session_id: "session-1",
        role: "parent",
        content: "School mornings are getting harder.",
        metadata: {},
        created_at: now,
      },
      {
        id: "m2",
        session_id: "session-1",
        role: "assistant",
        content: "Let us review school routines.",
        metadata: {},
        created_at: now,
      },
    ],
    daily_checkins: [
      {
        child_id: "child-1",
        checkin_date: "2026-06-29",
        sleep_quality: 2,
        mood: 2,
        anxiety: 4,
        school_rating: 1,
        wins: ["Bedtime was calmer"],
        challenges: ["Woke repeatedly during the night"],
        notes: "Sleep was very broken",
      },
      {
        child_id: "child-1",
        checkin_date: "2026-06-28",
        sleep_quality: 4,
        mood: 3,
        anxiety: 3,
        school_rating: 1,
        wins: ["Entered class after visual schedule"],
        challenges: ["School refusal at drop-off"],
        notes: "Teacher transition support helped",
      },
    ],
    timeline_events: [
      {
        child_id: "child-1",
        event_date: "2026-06-29",
        event_type: "sleep",
        title: "Frequent night waking",
        description: "Needed reassurance three times",
      },
      {
        child_id: "child-1",
        event_date: "2026-06-28",
        event_type: "school",
        title: "Late school arrival",
        description: "Transition difficulties at gate",
      },
    ],
    pattern_findings: [
      {
        child_id: "child-1",
        category: "sleep",
        title: "Sleep disruption",
        description: "Poor sleep increases next-day anxiety",
        confidence: 0.86,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        child_id: "child-1",
        category: "school",
        title: "School transition",
        description: "Rushed mornings increase refusal",
        confidence: 0.81,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ],
    parent_debriefs: [
      {
        child_id: "child-1",
        parent_message: "I feel drained after school mornings.",
        likely_trigger: "Transition demand spike",
        created_at: now,
      },
    ],
  };

  return {
    from(table: string) {
      let working = (tables[table] || []).slice();
      const api = {
        select(_fields: string) {
          return api;
        },
        eq(column: string, value: string | boolean) {
          working = working.filter((row) => row[column] === value);
          return api;
        },
        order(column: string, options: { ascending: boolean }) {
          const asc = options.ascending;
          working = working.slice().sort((a, b) => {
            const av = String(a[column] || "");
            const bv = String(b[column] || "");
            return asc ? av.localeCompare(bv) : bv.localeCompare(av);
          });
          return api;
        },
        limit(count: number) {
          return Promise.resolve({ data: working.slice(0, count) });
        },
        maybeSingle() {
          return Promise.resolve({ data: working[0] || null });
        },
        single() {
          return Promise.resolve({ data: working[0] || null });
        },
      };
      return api;
    },
  };
}

async function run() {
  const intentsA = detectContextIntents("Sleep has been broken and anxiety is high at bedtime.");
  const intentsB = detectContextIntents("School refusal keeps happening at drop-off and teacher handover.");
  assert.ok(intentsA.includes("sleep"));
  assert.ok(intentsA.includes("anxiety"));
  assert.ok(intentsB.includes("school"));

  const supabase = makeSupabaseFixture();

  const sleepContext = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    parentMessage: "Sleep has been broken and anxiety is high at bedtime.",
    supabase,
  });

  const schoolContext = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    parentMessage: "School refusal keeps happening at drop-off and teacher handover.",
    supabase,
  });

  assert.ok(sleepContext.selectionMetadata.detectedIntents.includes("sleep"));
  assert.ok(schoolContext.selectionMetadata.detectedIntents.includes("school"));

  const sleepPatternTitles = sleepContext.behaviourPatterns.map((p) => p.title.toLowerCase()).join(" ");
  const schoolPatternTitles = schoolContext.behaviourPatterns.map((p) => p.title.toLowerCase()).join(" ");
  const sleepTimelineTitles = sleepContext.timelineHighlights.map((t) => t.title.toLowerCase());
  const schoolTimelineTitles = schoolContext.timelineHighlights.map((t) => t.title.toLowerCase());

  assert.ok(sleepPatternTitles.includes("sleep"));
  assert.ok(schoolPatternTitles.includes("school"));
  assert.notDeepEqual(sleepContext.behaviourPatterns, schoolContext.behaviourPatterns);
  assert.notDeepEqual(sleepTimelineTitles, schoolTimelineTitles);

  console.log("Intent example A:", sleepContext.selectionMetadata.detectedIntents.join(", "));
  console.log("Selected patterns A:", sleepContext.behaviourPatterns.map((p) => p.title).join(", "));
  console.log("Selected timeline A:", sleepContext.timelineHighlights.map((t) => t.title).join(", "));
  console.log("Selected sources A:", sleepContext.selectionMetadata.selectedContextSources.join(", "));
  console.log("Intent example B:", schoolContext.selectionMetadata.detectedIntents.join(", "));
  console.log("Selected patterns B:", schoolContext.behaviourPatterns.map((p) => p.title).join(", "));
  console.log("Selected timeline B:", schoolContext.timelineHighlights.map((t) => t.title).join(", "));
  console.log("Selected sources B:", schoolContext.selectionMetadata.selectedContextSources.join(", "));
  console.log("Talk V2 intent and context selection checks passed.");
}

run();
