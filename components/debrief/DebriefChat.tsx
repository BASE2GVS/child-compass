"use client";

import { useState } from "react";
import { createDebrief } from "@/lib/actions/debrief";
import type { ParentDebrief } from "@/lib/types/database";
import { actionCopy, aiCopy } from "@/lib/presentation/copy";
import {
  Banner,
  Button,
  GlassCard,
  PremiumCard,
  StatusBadge,
  Textarea,
} from "@/components/design-system";

const sectionMeta: Record<string, { accent: string; icon: string }> = {
  "Likely Trigger": { accent: "border-amber-200 bg-amber-50/80", icon: "⚡" },
  "Behaviour Explanation": { accent: "border-blue-200 bg-blue-50/80", icon: "🧠" },
  "Emotional Interpretation": { accent: "border-purple-200 bg-purple-50/80", icon: "💜" },
  "Suggested Response": { accent: "border-emerald-200 bg-emerald-50/80", icon: "✅" },
  "Things NOT to Say": { accent: "border-rose-200 bg-rose-50/80", icon: "🚫" },
  "Tomorrow's Plan": { accent: "border-teal-200 bg-[#14B8A6]/10", icon: "🌅" },
  "Long-term Recommendation": { accent: "border-indigo-200 bg-indigo-50/80", icon: "🌱" },
};

function confidenceTone(level: number | null | undefined): "success" | "warning" | "brand" {
  if (!level) return "brand";
  if (level >= 0.85) return "success";
  if (level >= 0.7) return "brand";
  return "warning";
}

function confidenceLabel(level: number | null | undefined): string {
  if (!level) return "Moderate confidence";
  if (level >= 0.85) return "High confidence";
  if (level >= 0.7) return "Good confidence";
  return "Moderate confidence";
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#E8E4DC] bg-white px-4 py-3" aria-live="polite" aria-label="Child Compass is thinking">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      <span className="text-xs text-[#94A3B8]">{aiCopy.debriefThinking}</span>
    </div>
  );
}

function ExpandableSection({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(label === "Suggested Response");
  const meta = sectionMeta[label] ?? { accent: "border-slate-200 bg-white", icon: "💡" };

  return (
    <article className={`overflow-hidden rounded-[24px] border ${meta.accent}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
          <span aria-hidden="true">{meta.icon}</span>
          {label}
        </span>
        <span className="text-xs text-[#94A3B8]">{open ? "Hide" : "Why?"}</span>
      </button>
      {open && (
        <div className="border-t border-black/5 px-5 pb-5 pt-3 animate-fade-in">
          <p className="text-sm leading-relaxed text-[#64748B]">{content}</p>
        </div>
      )}
    </article>
  );
}

export default function DebriefChat({
  childId,
  childName,
  history: initialHistory,
}: {
  childId: string;
  childName: string;
  history: ParentDebrief[];
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [active, setActive] = useState<ParentDebrief | null>(initialHistory[0] || null);
  const [error, setError] = useState<string | null>(null);
  const [showAha, setShowAha] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

  const suggestedPrompts = [
    "School refusal this morning — help me understand",
    "Meltdown after a change in routine",
    "They shut down when I asked about homework",
  ];

  function selectDebrief(debrief: ParentDebrief) {
    setActive(debrief);
    setRevealKey((k) => k + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    const result = await createDebrief(childId, message.trim());
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.debrief) {
      const debrief = result.debrief;
      if (history.length === 0) setShowAha(true);
      setHistory((prev) => [debrief, ...prev]);
      setActive(debrief);
      setRevealKey((k) => k + 1);
      setMessage("");
    }
    setLoading(false);
  }

  const sections = active
    ? [
        { label: "Likely Trigger", content: active.likely_trigger },
        { label: "Behaviour Explanation", content: active.behaviour_explanation },
        { label: "Emotional Interpretation", content: active.emotional_interpretation },
        { label: "Suggested Response", content: active.suggested_response },
        { label: "Things NOT to Say", content: active.things_not_to_say?.join(" · ") },
        { label: "Tomorrow's Plan", content: active.tomorrow_plan },
        { label: "Long-term Recommendation", content: active.long_term_recommendation },
      ].filter((s) => s.content)
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <PremiumCard>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Parent Debrief™</p>
        <h2 className="mt-2 text-xl font-bold text-[#0F172A]">Tell us what happened</h2>
        <p className="mt-2 text-sm text-[#64748B]">
          Describe the situation in your own words. Child Compass responds with calm, personalised guidance.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="rounded-xl bg-[#FAF8F4] px-3 py-2 text-left text-xs text-[#64748B] transition-colors hover:bg-[#14B8A6]/10 hover:text-[#0D9488]"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={`My daughter refused school again today…`}
            aria-label="Describe what happened"
          />
          {error && <Banner variant="warning">{error}</Banner>}
          <Button type="submit" disabled={loading || !message.trim()} className="w-full">
            {loading ? aiCopy.debriefThinking : actionCopy.getGuidance}
          </Button>
        </form>

        {history.length > 0 && (
          <div className="mt-8 border-t border-[#F1EDE6] pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Recent debriefs</p>
            <ul className="space-y-2">
              {history.slice(0, 8).map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => selectDebrief(d)}
                    className={`w-full rounded-xl px-4 py-3 text-left text-xs transition-all ${
                      active?.id === d.id
                        ? "bg-[#14B8A6]/10 font-semibold text-[#0D9488]"
                        : "bg-[#FAF8F4] text-[#64748B] hover:bg-[#14B8A6]/5"
                    }`}
                  >
                    {d.parent_message.slice(0, 72)}…
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PremiumCard>

      <GlassCard className="min-h-[32rem]">
        {showAha && (
          <Banner variant="success">
            <strong>Child Compass has started learning about {childName}.</strong> The more you share, the better the guidance becomes.
          </Banner>
        )}

        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-sm font-bold text-white shadow-md">
              CC
            </div>
            <div>
              <p className="font-bold text-[#0F172A]">Child Compass</p>
              <p className="text-xs text-[#94A3B8]">Guidance for {childName}</p>
            </div>
          </div>
          {active?.confidence_level != null && (
            <StatusBadge label={confidenceLabel(active.confidence_level)} tone={confidenceTone(active.confidence_level)} />
          )}
        </div>

        {loading && <TypingIndicator />}

        {!loading && active ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-[24px] rounded-br-md bg-[#14B8A6] px-5 py-3.5 text-sm leading-relaxed text-white shadow-md">
                {active.parent_message}
              </div>
            </div>

            {!loading && (
              <div key={revealKey} className="space-y-3 animate-fade-in">
                {sections.map((s) => (
                  <ExpandableSection key={s.label} label={s.label} content={s.content!} />
                ))}
              </div>
            )}

            {active.follow_up_questions?.length > 0 && !loading && (
              <div className="rounded-[24px] border border-[#E8E4DC] bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Suggested follow-ups</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.follow_up_questions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setMessage(q)}
                      className="rounded-xl bg-[#FAF8F4] px-3 py-2 text-xs text-[#64748B] hover:bg-[#14B8A6]/10"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#14B8A6]/15 to-indigo-100/50 text-4xl" aria-hidden="true">
              💬
            </div>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-[#64748B]">
              Share what happened today and receive calm, evidence-informed support — tailored to {childName}.
            </p>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
