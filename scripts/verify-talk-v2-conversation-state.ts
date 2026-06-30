import assert from "node:assert/strict";
import { TALK_V2_CONTRACT_VERSION } from "@/lib/talk-v2/contracts";
import { detectContextIntents } from "@/lib/talk-v2/context/intent-detection";
import { detectConversationState } from "@/lib/talk-v2/context/conversation-state";
import { buildFamilyContext } from "@/lib/talk-v2/context/family-context-engine";

function makeStateFixture() {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();

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
        known_triggers: ["rushed transitions"],
        calming_strategies: ["quiet corner"],
        successful_strategies: ["visual timer", "weighted blanket"],
        challenges: ["sleep disruption", "school refusal"],
      },
    ],
    coach_messages: [
      {
        id: "m1",
        session_id: "session-1",
        role: "parent",
        content: "Lienke isn't sleeping.",
        metadata: {},
        created_at: yesterday,
      },
      {
        id: "m2",
        session_id: "session-1",
        role: "assistant",
        content: "Try a bedtime routine with a weighted blanket.",
        metadata: {},
        created_at: yesterday,
      },
    ],
    daily_checkins: [
      {
        child_id: "child-1",
        checkin_date: "2026-06-29",
        sleep_quality: 2,
        mood: 2,
        anxiety: 4,
        school_rating: 2,
        wins: ["Slept through once"],
        challenges: ["Night waking returned"],
        notes: "Sleep was uneven again",
      },
    ],
    timeline_events: [
      {
        child_id: "child-1",
        event_date: "2026-06-29",
        event_type: "sleep",
        title: "Slept through night",
        description: "One stable night after weighted blanket",
      },
      {
        child_id: "child-1",
        event_date: "2026-06-30",
        event_type: "sleep",
        title: "Night waking returned",
        description: "Woke three times again",
      },
    ],
    pattern_findings: [
      {
        child_id: "child-1",
        category: "sleep",
        title: "Sleep disruption",
        description: "Broken sleep predicts next-day anxiety",
        confidence: 0.8,
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ],
    parent_debriefs: [
      {
        child_id: "child-1",
        parent_message: "We tried the weighted blanket and bedtime countdown.",
        likely_trigger: "Sleep pressure mismatch",
        created_at: yesterday,
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

function runClassifierChecks() {
  const history = [
    { role: "parent" as const, content: "Lienke isn't sleeping.", createdAt: "2026-06-29T20:00:00.000Z" },
    { role: "assistant" as const, content: "Try a weighted blanket and a consistent bedtime routine.", createdAt: "2026-06-29T20:01:00.000Z" },
  ];

  const timeline = [
    { date: "2026-06-29", type: "sleep", title: "Slept through night", description: null },
    { date: "2026-06-30", type: "sleep", title: "Night waking returned", description: null },
  ];

  const messageA = "She isn't sleeping.";
  const stateA = detectConversationState({
    parentMessage: messageA,
    intents: detectContextIntents(messageA),
    recentConversation: [],
    timelineHighlights: timeline,
  });
  assert.equal(stateA.detectedState, "NEW_TOPIC");

  const messageB = "We've already tried that.";
  const stateB = detectConversationState({
    parentMessage: messageB,
    intents: ["sleep"],
    recentConversation: history,
    timelineHighlights: timeline,
  });
  assert.equal(stateB.detectedState, "FOLLOW_UP");

  const messageC = "She slept much better.";
  const stateC = detectConversationState({
    parentMessage: messageC,
    intents: detectContextIntents(messageC),
    recentConversation: history,
    timelineHighlights: timeline,
  });
  assert.equal(stateC.detectedState, "PROGRESS");

  const messageD = "It's getting worse again.";
  const stateD = detectConversationState({
    parentMessage: messageD,
    intents: ["sleep"],
    recentConversation: history,
    timelineHighlights: timeline,
  });
  assert.equal(stateD.detectedState, "SETBACK");

  const messageE = "Can you clarify what you mean?";
  const stateE = detectConversationState({
    parentMessage: messageE,
    intents: ["sleep"],
    recentConversation: history,
    timelineHighlights: timeline,
  });
  assert.equal(stateE.detectedState, "CLARIFICATION");

  console.log("State example A:", messageA, "->", stateA.detectedState);
  console.log("State example B:", messageB, "->", stateB.detectedState);
  console.log("State example C:", messageC, "->", stateC.detectedState);
  console.log("State example D:", messageD, "->", stateD.detectedState);
  console.log("State example E:", messageE, "->", stateE.detectedState);
}

async function runEngineChecks() {
  const supabase = makeStateFixture();

  const followUpContext = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    parentMessage: "We've already tried the weighted blanket.",
    supabase,
  });

  const progressContext = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    parentMessage: "She finally slept much better.",
    supabase,
  });

  const setbackContext = await buildFamilyContext({
    version: TALK_V2_CONTRACT_VERSION,
    childId: "child-1",
    sessionId: "session-1",
    parentMessage: "It is getting worse again.",
    supabase,
  });

  assert.equal(followUpContext.conversationState.detectedState, "FOLLOW_UP");
  assert.equal(progressContext.conversationState.detectedState, "PROGRESS");
  assert.equal(setbackContext.conversationState.detectedState, "SETBACK");

  assert.equal(followUpContext.selectionMetadata.conversationState, "FOLLOW_UP");
  assert.equal(progressContext.selectionMetadata.conversationState, "PROGRESS");
  assert.equal(setbackContext.selectionMetadata.conversationState, "SETBACK");

  assert.ok(followUpContext.recentConversation.length > 0);
  assert.ok(progressContext.dailyCheckins.length > 0);
  assert.ok(setbackContext.timelineHighlights.length > 0);

  console.log("Engine state FOLLOW_UP selected sources:", followUpContext.selectionMetadata.selectedContextSources.join(", "));
  console.log("Engine state PROGRESS selected sources:", progressContext.selectionMetadata.selectedContextSources.join(", "));
  console.log("Engine state SETBACK selected sources:", setbackContext.selectionMetadata.selectedContextSources.join(", "));
}

async function run() {
  runClassifierChecks();
  await runEngineChecks();
  console.log("Talk V2 conversation state checks passed.");
}

run();
