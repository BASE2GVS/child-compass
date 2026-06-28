"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sendCoachMessage } from "@/lib/actions/ecosystem";
import { readParentMoodSync } from "@/lib/companion/use-parent-mood";
import type { CoachMessage } from "@/lib/types/database";
import type { Child } from "@/lib/types/database";
import { Banner } from "@/components/design-system";
import { FrameworkButton, FrameworkButtonLink } from "@/components/framework";
import EditorialPage from "@/components/editorial/EditorialPage";
import { EditorialTitle } from "@/components/editorial/EditorialSection";
import EditorialParchment from "@/components/editorial/EditorialParchment";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import SuggestedConversations from "@/components/coach/SuggestedConversations";
import ThinkingState from "@/components/coach/ThinkingState";
import { FIRST_COACH_INTRO, FIRST_COACH_CELEBRATION } from "@/lib/first-time/copy";
import { GentleSuccess } from "@/components/first-time";
import EmptyConversationArt from "@/components/coach/illustrations/EmptyConversationArt";
import { MessageList, companionTouchForSession } from "@/components/coach/ChatBubbles";

import GentleInsight from "@/components/insights/GentleInsight";

export default function CoachChat({
  childId,
  sessionId,
  history,
  childName,
  parentName,
  familyChildren,
  reflectMode = false,
  openingInsight = null,
}: {
  childId: string;
  sessionId: string;
  history: CoachMessage[];
  childName: string;
  parentName?: string | null;
  familyChildren: Child[];
  reflectMode?: boolean;
  openingInsight?: {
    displayText: string;
    confidenceLabel: string;
    supportingEvents?: { label: string; date?: string }[];
  } | null;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(history);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showFirstConversationCelebration, setShowFirstConversationCelebration] = useState(false);
  const hadConversationRef = useRef(history.some((m) => m.role === "parent"));
  const tempIdRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasConversation = messages.length > 0 || isPending;
  const isFirstVisit = history.length === 0;
  const companionTouch = isFirstVisit ? null : companionTouchForSession(messages.length);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isPending]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setError(null);
    setMessage("");

    const tempParentId = `tmp-parent-${++tempIdRef.current}`;
    const optimisticParent: CoachMessage = {
      id: tempParentId,
      session_id: sessionId,
      role: "parent",
      content: trimmed,
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticParent]);

    startTransition(async () => {
      try {
        const result = await sendCoachMessage({
          childId,
          sessionId,
          message: trimmed,
          preferReflection: reflectMode,
          parentMood: readParentMoodSync(),
        });

        if (result?.error) {
          setMessages((prev) => prev.filter((m) => m.id !== tempParentId));
          setError(result.error);
          return;
        }

        if (result?.assistantMessage) {
          if (!hadConversationRef.current) {
            hadConversationRef.current = true;
            setShowFirstConversationCelebration(true);
          }
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempParentId),
            {
              id: result.parentMessageId || tempParentId,
              session_id: sessionId,
              role: "parent",
              content: trimmed,
              metadata: {},
              created_at: new Date().toISOString(),
            },
            {
              id: result.assistantMessageId || `tmp-assistant-${++tempIdRef.current}`,
              session_id: sessionId,
              role: "assistant",
              content: result.assistantMessage,
              metadata: result.pipeline || {},
              created_at: new Date().toISOString(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempParentId));
        setError("Something went wrong. Please try again — your message was not lost.");
      }
    });
  }

  const chatPanel = (
    <section className="cc-flow-enter flex flex-col overflow-hidden rounded-[1.5rem] bg-white/35 backdrop-blur-md animate-cc-fade-in motion-reduce:animate-none" aria-label="Your conversation">
      <div className="flex min-h-[20rem] flex-1 flex-col sm:min-h-[24rem]">
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:space-y-8 sm:px-8 sm:py-8">
          {!hasConversation && (
            <div className="flex flex-col items-center py-6 text-center sm:py-10">
              {openingInsight && (
                <div className="mb-6 w-full max-w-lg text-left">
                  <GentleInsight insight={openingInsight} />
                </div>
              )}
              {isFirstVisit ? (
                <>
                  <p className="max-w-md font-display text-xl leading-relaxed text-[var(--cc-ink)] sm:text-2xl">
                    {FIRST_COACH_INTRO}
                  </p>
                  <p className="mt-4 text-sm text-[var(--cc-ink-muted)]">Tap a starter below, or type your own.</p>
                </>
              ) : (
                <>
                  <EmptyConversationArt className="w-full max-w-md animate-cc-breathe motion-reduce:animate-none" />
                  {companionTouch && (
                    <p className="mt-6 max-w-sm font-display text-xl text-[var(--cc-ink-muted)]">{companionTouch}</p>
                  )}
                </>
              )}
            </div>
          )}

          {showFirstConversationCelebration && hasConversation && (
            <GentleSuccess message={FIRST_COACH_CELEBRATION} className="mx-auto max-w-lg" />
          )}

          {hasConversation && companionTouch && messages.length > 0 && messages.length % 3 === 0 && (
            <p className="text-center text-sm italic text-[var(--cc-ink-muted)]">{companionTouch}</p>
          )}

          <MessageList messages={messages} />
          {isPending && <ThinkingState />}
          <div ref={chatEndRef} />
        </div>

        {error && (
          <div className="px-4 py-3 sm:px-8">
            <Banner variant="warning">{error}</Banner>
          </div>
        )}

        <form
          className="bg-white/25 p-4 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit(message);
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="sr-only" htmlFor="coach-message">
              Your message
            </label>
            <textarea
              ref={textareaRef}
              id="coach-message"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(message);
                }
              }}
              placeholder="What's on your mind?"
              disabled={isPending}
              className="min-h-[3.5rem] flex-1 resize-none rounded-2xl border border-white/60 bg-white/80 px-5 py-3.5 text-base leading-relaxed text-[var(--cc-ink)] placeholder:text-[var(--cc-ink-muted)]/70 focus:border-[var(--cc-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--cc-teal)]/25 disabled:opacity-60 sm:min-h-[4rem]"
            />
            <FrameworkButton
              type="submit"
              variant="pill"
              disabled={isPending || !message.trim()}
              className="shrink-0 sm:min-h-[4rem]"
            >
              Send
            </FrameworkButton>
          </div>
        </form>
      </div>
    </section>
  );

  const backLink = (
    <FrameworkButtonLink href="/today" variant="secondary" className="mb-4 inline-flex">
      ← Return to Today
    </FrameworkButtonLink>
  );

  if (hasConversation) {
    return (
      <DashboardBackground>
        <article className="today-editorial w-full pb-10">
          <header className="cc-flow-enter px-2 pb-4 pt-2">
            {backLink}
            <EditorialTitle id="coach-compact-heading">
              {reflectMode ? "Reflect" : "Talk"}
            </EditorialTitle>
          </header>
          <EditorialParchment className="-mt-0 rounded-[2rem]">{chatPanel}</EditorialParchment>
        </article>
      </DashboardBackground>
    );
  }

  return (
    <EditorialPage
      variant="coach"
      title={reflectMode ? "Reflect" : "Talk"}
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={childId}
    >
      {backLink}
      <SuggestedConversations
        childName={childName}
        reflectMode={reflectMode}
        firstVisit={isFirstVisit}
        disabled={isPending}
        onSelect={submit}
      />
      {chatPanel}
    </EditorialPage>
  );
}
