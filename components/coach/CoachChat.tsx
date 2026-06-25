"use client";

import { useState, useTransition } from "react";
import { sendCoachMessage } from "@/lib/actions/ecosystem";
import { aiCopy } from "@/lib/presentation/copy";
import type { CoachMessage } from "@/lib/types/database";
import {
  Button,
  GlassCard,
  PremiumCard,
  Textarea,
  ds,
} from "@/components/design-system";

function TypingIndicator() {
  return (
    <div className="mr-10 flex items-center gap-2 rounded-[24px] rounded-bl-md border border-[#E8E4DC] bg-white px-4 py-3" aria-live="polite">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6] motion-reduce:animate-none" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </span>
    </div>
  );
}

export default function CoachChat({
  childId,
  sessionId,
  history,
  childName,
}: {
  childId: string;
  sessionId: string;
  history: CoachMessage[];
  childName: string;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(history);
  const [isPending, startTransition] = useTransition();

  const quickPrompts = [
    "My daughter refuses homework.",
    "My son is anxious before school.",
    "How do I prepare for a birthday party?",
    "They're overwhelmed after school — what helps?",
  ];

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessage("");
    startTransition(async () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-parent-${Date.now()}`,
          session_id: sessionId,
          role: "parent",
          content: trimmed,
          metadata: {},
          created_at: new Date().toISOString(),
        },
      ]);
      await sendCoachMessage({ childId, sessionId, message: trimmed });
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <PremiumCard>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Ask Child Compass™</p>
        <h2 className="mt-2 text-xl font-bold text-[#0F172A]">Your AI companion</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          Practical coaching for {childName} — understanding, immediate advice, and gentle follow-up questions.
        </p>

        <p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Suggested prompts</p>
        <div className="mt-3 space-y-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submit(prompt)}
              disabled={isPending}
              className={`w-full rounded-xl bg-[#FAF8F4] px-4 py-3 text-left text-sm text-[#64748B] transition-all hover:bg-[#14B8A6]/10 hover:text-[#0D9488] ${ds.hoverLift}`}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="mt-6 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(message);
          }}
        >
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what happened and what support you need…"
            aria-label="Your message"
          />
          <Button type="submit" disabled={isPending || !message.trim()} className="w-full">
            {isPending ? aiCopy.coachThinking : "Ask Child Compass"}
          </Button>
        </form>
      </PremiumCard>

      <GlassCard className="flex min-h-[28rem] flex-col">
        <div className="mb-4 flex items-center gap-3 border-b border-[#F1EDE6] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-xs font-bold text-white">
            CC
          </div>
          <div>
            <p className="font-bold text-[#0F172A]">Conversation</p>
            <p className="text-xs text-[#94A3B8]">Persistent history with {childName}</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.length === 0 && !isPending && (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="text-4xl" aria-hidden="true">🤝</span>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#64748B]">
                Start a conversation — like talking to a specialist who knows your child&apos;s story.
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[90%] rounded-[24px] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "parent"
                  ? "ml-auto rounded-br-md bg-[#14B8A6] text-white"
                  : "mr-auto rounded-bl-md border border-[#E8E4DC] bg-white text-[#64748B]"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {isPending && <TypingIndicator />}
        </div>
      </GlassCard>
    </div>
  );
}
