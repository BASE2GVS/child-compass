import ChildSwitcher from "@/components/app/ChildSwitcher";
import { aiCopy } from "@/lib/presentation/copy";
import type { Child } from "@/lib/types/database";
import type { BriefingPayload } from "@/lib/dashboard/briefing";

type DailyBriefingProps = {
  greeting: string;
  parentName: string;
  childName: string;
  briefing: BriefingPayload;
  familyChildren: Child[];
  activeChildId: string;
};

export default function DailyBriefing({
  greeting,
  parentName,
  childName,
  briefing,
  familyChildren,
  activeChildId,
}: DailyBriefingProps) {
  const confidencePct = Math.round(briefing.overallConfidence * 100);

  return (
    <section
      className="animate-fade-in overflow-hidden rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-[0_24px_64px_rgba(15,23,42,0.07)] backdrop-blur-sm lg:p-10"
      aria-labelledby="daily-briefing-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14B8A6]">
            Daily AI Briefing
          </p>
          <h1 id="daily-briefing-heading" className="mt-3 text-3xl font-bold tracking-tight text-[#0F172A] lg:text-4xl">
            {greeting}, {parentName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-3 text-lg font-medium text-[#475569]">
            {aiCopy.briefingIntro.replace("today", `today for ${childName}`)}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]" aria-label={`Briefing confidence ${confidencePct} percent`}>
            {confidencePct}% briefing confidence
          </p>
        </div>
        {familyChildren.length > 1 && (
          <ChildSwitcher familyChildren={familyChildren} activeChildId={activeChildId} />
        )}
      </div>

      <div className="mt-10 space-y-0 divide-y divide-[#F1EDE6] rounded-[28px] bg-[#FAF8F4]/60 p-2">
        {briefing.sections.map((section) => (
          <article key={section.label} className="flex gap-4 px-4 py-5 first:pt-4 last:pb-4">
            <span className="text-2xl" aria-hidden="true">
              {section.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                {section.label}
              </h2>
              <p className="mt-1 text-base leading-relaxed text-[#0F172A]">{section.message}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
