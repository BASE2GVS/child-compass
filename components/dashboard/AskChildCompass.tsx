"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { sendCoachMessage } from "@/lib/actions/ecosystem";
import type { CoachMessage } from "@/lib/types/database";

const PROMPTS = [
  "He won't wear shoes.",
  "We have a birthday party.",
  "He's refusing school.",
  "We're visiting grandparents.",
  "Homework is impossible.",
];

type AskChildCompassProps = {
  childId: string;
  childName: string;
  sessionId: string;
  recentMessages: CoachMessage[];
};

export default function AskChildCompass({
  childId,
  childName,
  sessionId,
  recentMessages,
}: AskChildCompassProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(recentMessages.slice(-4));
  const [isPending, startTransition] = useTransition();

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setMessage("");
    startTransition(async () => {
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
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
    <section
      className="rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm"
      aria-labelledby="ask-compass-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
            Ask Child Compass™
          </p>
          <h2 id="ask-compass-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
            Gentle guidance, whenever you need it
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Warm, practical support for {childName} — not a chatbot, your parenting companion.
          </p>
        </div>
        <Link
          href={`/coach?child=${childId}`}
          className="rounded-2xl border border-[#14B8A6]/20 bg-[#14B8A6]/5 px-4 py-2 text-sm font-semibold text-[#14B8A6] transition-colors hover:bg-[#14B8A6]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40"
        >
          Open full session →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="list" aria-label="Suggested questions">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => submit(prompt)}
            disabled={isPending}
            className="rounded-2xl bg-[#FAF8F4] px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-all hover:bg-[#14B8A6]/10 hover:text-[#0D9488] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div
        className="mt-6 max-h-72 space-y-4 overflow-y-auto rounded-[24px] bg-gradient-to-b from-[#FAF8F4] to-white p-5"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#14B8A6] text-xs font-bold text-white">
              CC
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-relaxed text-[#64748B] shadow-sm">
              I&apos;m here when you need me. Ask about mornings, meltdowns, school, or anything
              on your mind about {childName}.
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "parent" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${
                  msg.role === "parent" ? "bg-[#0F172A] text-white" : "bg-[#14B8A6] text-white"
                }`}
                aria-hidden="true"
              >
                {msg.role === "parent" ? "You" : "CC"}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "parent"
                    ? "rounded-tr-md bg-[#0F172A] text-white"
                    : "rounded-tl-md bg-white text-[#475569]"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        className="mt-4 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(message);
        }}
      >
        <label htmlFor="ask-compass-input" className="sr-only">
          Ask Child Compass about {childName}
        </label>
        <input
          id="ask-compass-input"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Ask about ${childName}…`}
          className="flex-1 rounded-2xl border-0 bg-[#FAF8F4] px-4 py-3.5 text-sm text-[#0F172A] outline-none ring-1 ring-[#E8E4DC] transition-shadow focus:ring-2 focus:ring-[#14B8A6]/40"
        />
        <button
          type="submit"
          disabled={isPending || !message.trim()}
          className="shrink-0 rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#0D9488] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/50 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Thinking…" : "Ask"}
        </button>
      </form>
    </section>
  );
}
