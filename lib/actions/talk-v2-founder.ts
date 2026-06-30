"use server";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPilotAdminEnabled, isPilotAdminUser } from "@/lib/pilot/config";
import { isTalkV2Enabled } from "@/lib/talk-v2/flags/feature-flag";
import {
  TALK_V2_CONTRACT_VERSION,
  type TalkV2MessageRequest,
  type TalkV2MessageResult,
} from "@/lib/talk-v2/contracts";
import {
  orchestrateTalkV2Message,
  type TalkV2OrchestratorInternal,
} from "@/lib/talk-v2/api/orchestrate-talk-v2-message";

const HARNESS_DATA_FILE = path.join(process.cwd(), "data", "talk-v2-founder-harness.json");
const GOLDEN_SUITE_FILE = path.join(process.cwd(), "data", "talk-v2-founder-golden-suite.json");

type FounderHarnessTurn = {
  id: string;
  requestId: string;
  message: string;
  result: TalkV2MessageResult;
  telemetry: TalkV2OrchestratorInternal | null;
  createdAt: string;
};

type FounderHarnessConversation = {
  id: string;
  sessionId: string;
  childId: string;
  scenario: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  turns: FounderHarnessTurn[];
};

type FounderHarnessStore = {
  conversations: FounderHarnessConversation[];
};

type GoldenScenario = {
  id: string;
  title: string;
  objective: string;
  turns: string[];
};

export type FounderHarnessData = {
  talkV2Enabled: boolean;
  conversations: FounderHarnessConversation[];
  goldenSuite: GoldenScenario[];
};

async function requireFounderAdmin() {
  if (!isPilotAdminEnabled()) redirect("/today");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const allowed = await isPilotAdminUser(user.email);
  if (!allowed) redirect("/today");

  return { user };
}

async function ensureParentDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readHarnessStore(): Promise<FounderHarnessStore> {
  try {
    const raw = await fs.readFile(HARNESS_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as FounderHarnessStore;
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
    };
  } catch {
    return { conversations: [] };
  }
}

async function writeHarnessStore(store: FounderHarnessStore): Promise<void> {
  await ensureParentDir(HARNESS_DATA_FILE);
  await fs.writeFile(HARNESS_DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

async function readGoldenSuite(): Promise<GoldenScenario[]> {
  try {
    const raw = await fs.readFile(GOLDEN_SUITE_FILE, "utf8");
    const parsed = JSON.parse(raw) as { scenarios?: GoldenScenario[] };
    return Array.isArray(parsed.scenarios) ? parsed.scenarios : [];
  } catch {
    return [];
  }
}

function sortByUpdated(conversations: FounderHarnessConversation[]): FounderHarnessConversation[] {
  return [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getTalkV2FounderHarnessData(): Promise<FounderHarnessData> {
  await requireFounderAdmin();
  const store = await readHarnessStore();
  const goldenSuite = await readGoldenSuite();

  return {
    talkV2Enabled: isTalkV2Enabled(),
    conversations: sortByUpdated(store.conversations),
    goldenSuite,
  };
}

export async function sendTalkV2FounderMessage(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  data?: FounderHarnessData;
}> {
  await requireFounderAdmin();

  const mode = String(formData.get("mode") || "continue");
  const message = String(formData.get("message") || "").trim();
  const childId = String(formData.get("childId") || "").trim();
  const scenario = String(formData.get("scenario") || "General parenting").trim();
  const selectedConversationId = String(formData.get("conversationId") || "").trim();
  const requestIdOverride = String(formData.get("requestId") || "").trim();

  if (!message) {
    return { ok: false, error: "Message is required" };
  }

  if (!childId) {
    return { ok: false, error: "Child ID is required" };
  }

  const store = await readHarnessStore();
  const now = new Date().toISOString();

  let conversation: FounderHarnessConversation | undefined;

  if (mode === "new") {
    const id = randomUUID();
    conversation = {
      id,
      sessionId: `founder-talk-v2-${id}`,
      childId,
      scenario: scenario || "General parenting",
      label: `${scenario || "General parenting"} (${childId})`,
      createdAt: now,
      updatedAt: now,
      turns: [],
    };
    store.conversations.push(conversation);
  } else {
    conversation = store.conversations.find((item) => item.id === selectedConversationId);
    if (!conversation) {
      return { ok: false, error: "Select an existing conversation or start a new one" };
    }
  }

  if (!isTalkV2Enabled()) {
    const turn: FounderHarnessTurn = {
      id: randomUUID(),
      requestId: requestIdOverride || randomUUID(),
      message,
      result: {
        version: TALK_V2_CONTRACT_VERSION,
        status: "disabled",
        error: "Talk V2 is not enabled.",
      },
      telemetry: null,
      createdAt: now,
    };

    conversation.turns.push(turn);
    conversation.updatedAt = now;
    await writeHarnessStore(store);

    return {
      ok: true,
      data: {
        talkV2Enabled: false,
        conversations: sortByUpdated(store.conversations),
        goldenSuite: await readGoldenSuite(),
      },
    };
  }

  const payload: TalkV2MessageRequest = {
    version: TALK_V2_CONTRACT_VERSION,
    childId,
    sessionId: conversation.sessionId,
    message,
  };

  const orchestration = await orchestrateTalkV2Message(payload, {
    requestId: requestIdOverride || randomUUID(),
  });

  const turn: FounderHarnessTurn = {
    id: randomUUID(),
    requestId: orchestration.internal.requestId,
    message,
    result: orchestration.result,
    telemetry: orchestration.internal,
    createdAt: now,
  };

  conversation.turns.push(turn);
  conversation.updatedAt = now;

  await writeHarnessStore(store);

  return {
    ok: true,
    data: {
      talkV2Enabled: isTalkV2Enabled(),
      conversations: sortByUpdated(store.conversations),
      goldenSuite: await readGoldenSuite(),
    },
  };
}

export async function resetTalkV2FounderConversation(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  data?: FounderHarnessData;
}> {
  await requireFounderAdmin();

  const conversationId = String(formData.get("conversationId") || "").trim();
  if (!conversationId) {
    return { ok: false, error: "Conversation ID is required" };
  }

  const store = await readHarnessStore();
  store.conversations = store.conversations.filter((item) => item.id !== conversationId);
  await writeHarnessStore(store);

  return {
    ok: true,
    data: {
      talkV2Enabled: isTalkV2Enabled(),
      conversations: sortByUpdated(store.conversations),
      goldenSuite: await readGoldenSuite(),
    },
  };
}
