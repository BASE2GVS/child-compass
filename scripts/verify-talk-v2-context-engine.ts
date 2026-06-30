import assert from "node:assert/strict";
import { buildFamilyContext } from "@/lib/talk-v2/context/family-context-engine";
import { TALK_V2_CONTRACT_VERSION } from "@/lib/talk-v2/contracts";

function makeFakeSupabase() {
  const now = new Date().toISOString();

  const children = [
    {
      id: "child-1",
      first_name: "Lienke",
      nickname: null,
      diagnosis: ["Autism"],
      support_needs: ["predictability"],
      school: "Primary",
      grade: "3",
    },
  ];

  const profiles = [
    {
      child_id: "child-1",
      strengths: ["curiosity"],
      known_triggers: ["sudden transitions"],
      calming_strategies: ["quiet corner"],
      successful_strategies: ["visual timer"],
      challenges: ["school refusal"],
    },
  ];

  const coachMessages = [
    {
      id: "m1",
      session_id: "session-1",
      role: "parent",
      content: "School morning was hard again.",
      metadata: {},
      created_at: now,
    },
  ];

  const checkins = [
    {
      child_id: "child-1",
      checkin_date: "2026-06-29",
      sleep_quality: 2,
      mood: 2,
      anxiety: 4,
      school_rating: 1,
      wins: ["Used timer once"],
      challenges: ["Refused school"],
      notes: "Transitions were difficult",
    },
  ];

  const timelineEvents = [
    {
      child_id: "child-1",
      event_date: "2026-06-29",
      event_type: "school",
      title: "Late school arrival",
      description: "Needed extra settling time",
    },
  ];

  const patterns = [
    {
      child_id: "child-1",
      category: "school",
      title: "School morning load",
      description: "Rushed mornings increase refusal",
      confidence: 0.8,
      created_at: now,
      updated_at: now,
      is_active: true,
    },
  ];

  const debriefs = [
    {
      child_id: "child-1",
      parent_message: "I feel drained after mornings.",
      likely_trigger: "Demand spike in morning",
      created_at: now,
    },
  ];

  const tableData: Record<string, any[]> = {
    children,
    child_profiles: profiles,
    coach_messages: coachMessages,
    daily_checkins: checkins,
    timeline_events: timelineEvents,
    pattern_findings: patterns,
    parent_debriefs: debriefs,
  };

  return {
    from(table: string) {
      const rows = tableData[table] || [];
      let working = rows.slice();

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
            const av = String(a[column] ?? "");
            const bv = String(b[column] ?? "");
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
  const supabase = makeFakeSupabase();
  const context = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    parentMessage: "School refusal happened again this morning.",
    supabase,
  });

  assert.equal(context.version, TALK_V2_CONTRACT_VERSION);
  assert.equal(context.childId, "child-1");
  assert.equal(context.sessionId, "session-1");
  assert.equal(context.childProfile?.firstName, "Lienke");
  assert.equal(context.recentConversation.length, 1);
  assert.equal(context.dailyCheckins.length, 1);
  assert.equal(context.timelineHighlights.length, 1);
  assert.equal(context.behaviourPatterns.length, 1);
  assert.ok(context.relevantMemories.length > 0);
  assert.ok(context.familyStory);
  assert.equal(context.safetyRules.length > 0, true);
  assert.equal(context.completeness.safetyRules, "complete");

  const emptySupabase = {
    from() {
      const api = {
        select() {
          return api;
        },
        eq() {
          return api;
        },
        order() {
          return api;
        },
        limit() {
          return Promise.resolve({ data: [] });
        },
        maybeSingle() {
          return Promise.resolve({ data: null });
        },
        single() {
          return Promise.resolve({ data: null });
        },
      };
      return api;
    },
  };

  const emptyContext = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "missing-child",
    sessionId: "session-x",
    parentMessage: "Need help",
    supabase: emptySupabase,
  });

  assert.equal(emptyContext.childProfile, null);
  assert.equal(emptyContext.recentConversation.length, 0);
  assert.equal(emptyContext.dailyCheckins.length, 0);
  assert.equal(emptyContext.timelineHighlights.length, 0);
  assert.equal(emptyContext.behaviourPatterns.length, 0);
  assert.equal(emptyContext.relevantMemories.length, 0);
  assert.equal(emptyContext.familyStory, null);
  assert.equal(emptyContext.completeness.childProfile, "empty");
  assert.equal(emptyContext.completeness.safetyRules, "complete");

  console.log("Talk V2 context engine checks passed.");
}

run();
