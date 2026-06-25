"use client";

import { useState } from "react";
import type { IntelligenceItem } from "@/lib/dashboard/briefing";

type IntelligenceInsightCardProps = {
  item: IntelligenceItem;
};

export default function IntelligenceInsightCard({ item }: IntelligenceInsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const confidencePct = Math.round(item.confidence * 100);
  const panelId = `why-${item.title.replace(/\s/g, "-").toLowerCase()}`;

  return (
    <article className="group rounded-[28px] border border-white/50 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
          style={{ backgroundColor: item.accentBg, color: item.accent }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
            <span className="rounded-full bg-[#FAF8F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
              {confidencePct}% confidence
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{item.explanation}</p>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="mt-3 rounded-xl px-2 py-1 text-xs font-semibold text-[#14B8A6] transition-colors hover:bg-[#14B8A6]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40"
          >
            {expanded ? "Hide why" : "Why?"}
          </button>
          {expanded && (
            <p
              id={panelId}
              className="mt-2 rounded-2xl bg-[#FAF8F4] px-4 py-3 text-sm leading-relaxed text-[#475569] animate-fade-in"
            >
              {item.why}
            </p>
          )}
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#F1EDE6]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${confidencePct}%`, backgroundColor: item.accent }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
