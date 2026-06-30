"use client";

import { useMemo, useState, useTransition } from "react";
import {
  getTalkV2FounderHarnessData,
  resetTalkV2FounderConversation,
  sendTalkV2FounderMessage,
  type FounderHarnessData,
} from "@/lib/actions/talk-v2-founder";
import { Banner, Button, GlassCard, SectionHeader } from "@/components/design-system";

type Props = {
  initialData: FounderHarnessData;
};

export default function TalkV2FounderHarnessPanel({ initialData }: Props) {
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [mode, setMode] = useState<"new" | "continue">("new");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [childId, setChildId] = useState("");
  const [scenario, setScenario] = useState("General parenting");
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedConversation = useMemo(
    () => data.conversations.find((item) => item.id === selectedConversationId) || null,
    [data.conversations, selectedConversationId],
  );

  function refreshFromServer() {
    startTransition(async () => {
      const next = await getTalkV2FounderHarnessData();
      setData(next);
    });
  }

  function handleSend() {
    setError(null);
    setNotice(null);

    const formData = new FormData();
    formData.set("mode", mode);
    formData.set("message", message);
    formData.set("childId", childId || selectedConversation?.childId || "");
    formData.set("scenario", scenario);
    formData.set("conversationId", selectedConversationId);
    formData.set("requestId", requestId);

    startTransition(async () => {
      const result = await sendTalkV2FounderMessage(formData);
      if (!result.ok || !result.data) {
        setError(result.error || "Failed to send message");
        return;
      }

      setData(result.data);
      setMessage("");
      setNotice("Talk V2 founder turn completed.");

      if (mode === "new" && result.data.conversations.length > 0) {
        setMode("continue");
        setSelectedConversationId(result.data.conversations[0].id);
      }
    });
  }

  function handleReset() {
    if (!selectedConversationId) {
      setError("Select a conversation to reset");
      return;
    }

    setError(null);
    setNotice(null);
    const formData = new FormData();
    formData.set("conversationId", selectedConversationId);

    startTransition(async () => {
      const result = await resetTalkV2FounderConversation(formData);
      if (!result.ok || !result.data) {
        setError(result.error || "Failed to reset conversation");
        return;
      }

      setData(result.data);
      setSelectedConversationId("");
      setNotice("Conversation reset.");
    });
  }

  return (
    <div className="space-y-8">
      <Banner variant="info">
        <strong>TALK V2 FOUNDER HARNESS</strong> - Internal testing only. This panel always targets Talk V2 and never switches
        to Talk V1.
      </Banner>

      {data.talkV2Enabled ? (
        <Banner variant="success">Feature flag status: TALK_V2_ENABLED=true</Banner>
      ) : (
        <Banner variant="warning">
          Feature flag status: TALK_V2_ENABLED=false. Requests will return disabled until you enable the flag.
        </Banner>
      )}

      {notice && <Banner variant="success">{notice}</Banner>}
      {error && <Banner variant="warning">{error}</Banner>}

      <GlassCard padding="lg">
        <SectionHeader
          eyebrow="Founder"
          title="Run Talk V2 conversation"
          description="Start new or continue existing sessions, inspect telemetry, and validate continuity."
        />

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Mode</span>
            <select
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2"
              value={mode}
              onChange={(event) => setMode(event.target.value as "new" | "continue")}
            >
              <option value="new">Start new conversation</option>
              <option value="continue">Continue existing conversation</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Existing conversation</span>
            <select
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2"
              value={selectedConversationId}
              onChange={(event) => setSelectedConversationId(event.target.value)}
              disabled={mode !== "continue"}
            >
              <option value="">Select conversation</option>
              {data.conversations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} - {item.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Child ID</span>
            <input
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2"
              value={mode === "continue" ? selectedConversation?.childId || childId : childId}
              onChange={(event) => setChildId(event.target.value)}
              placeholder="child-uuid"
              disabled={mode === "continue" && Boolean(selectedConversation)}
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Scenario</span>
            <input
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2"
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
              placeholder="Sleep"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span>Request ID override (optional for idempotency checks)</span>
            <input
              className="w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2"
              value={requestId}
              onChange={(event) => setRequestId(event.target.value)}
              placeholder="leave empty for auto-generated UUID"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span>Parent message</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 py-2"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type the parent message for Talk V2..."
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" disabled={pending} onClick={handleSend}>
            Send to Talk V2
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={handleReset}>
            Reset selected conversation
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={refreshFromServer}>
            Refresh
          </Button>
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader
          eyebrow="Golden Suite"
          title="Founder scenarios"
          description="Run each scenario through multiple turns to confirm continuity and context carry-over."
        />
        <ul className="mt-4 space-y-3 text-sm">
          {data.goldenSuite.map((scenarioItem) => (
            <li key={scenarioItem.id} className="rounded-xl bg-[#F8FAFC] p-4">
              <p className="font-semibold text-[#0F172A]">{scenarioItem.title}</p>
              <p className="mt-1 text-[#475569]">{scenarioItem.objective}</p>
              <p className="mt-2 text-xs text-[#64748B]">Turns: {scenarioItem.turns.length}</p>
            </li>
          ))}
          {data.goldenSuite.length === 0 && <li className="text-[#64748B]">No golden scenarios loaded.</li>}
        </ul>
      </GlassCard>

      <GlassCard padding="lg">
        <SectionHeader
          eyebrow="Sessions"
          title="Conversation log"
          description="Each entry includes internal telemetry captured from the orchestrator."
        />

        <div className="mt-4 space-y-6">
          {data.conversations.map((conversation) => (
            <article key={conversation.id} className="rounded-2xl border border-[#E2E8F0] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-[#0F172A]">
                  TALK V2 - {conversation.label}
                </h3>
                <p className="text-xs text-[#64748B]">Conversation ID: {conversation.id}</p>
              </div>

              <p className="mt-1 text-xs text-[#64748B]">
                Session: {conversation.sessionId} - Updated: {conversation.updatedAt}
              </p>

              <ul className="mt-4 space-y-4">
                {conversation.turns.map((turn) => (
                  <li key={turn.id} className="rounded-xl bg-[#F8FAFC] p-3">
                    <p className="text-xs text-[#64748B]">{turn.createdAt} - Request ID: {turn.requestId}</p>
                    <p className="mt-2 text-sm font-medium text-[#0F172A]">Parent: {turn.message}</p>
                    <p className="mt-1 text-sm text-[#1E293B]">
                      Result: {turn.result.status === "accepted" ? turn.result.message : turn.result.error}
                    </p>

                    <details className="mt-2 text-xs text-[#334155]">
                      <summary className="cursor-pointer font-semibold">Telemetry</summary>
                      <pre className="mt-2 overflow-auto rounded-lg bg-[#0F172A] p-3 text-emerald-100">
                        {JSON.stringify(turn.telemetry, null, 2)}
                      </pre>
                    </details>
                  </li>
                ))}
                {conversation.turns.length === 0 && <li className="text-sm text-[#64748B]">No turns yet.</li>}
              </ul>
            </article>
          ))}
          {data.conversations.length === 0 && <p className="text-sm text-[#64748B]">No founder conversations yet.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
