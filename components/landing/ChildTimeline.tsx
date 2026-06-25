import ScrollReveal from "./ScrollReveal";

const timelineEvents = [
  { label: "Poor sleep" },
  { label: "High sensory load" },
  { label: "Maths lesson" },
  { label: "Loud assembly" },
] as const;

export default function ChildTimeline() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#14B8A6]">
              Signature Feature
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Child Timeline™
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Child Compass finds patterns parents often miss. This is one of our biggest
              differentiators.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-14">
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="grid lg:grid-cols-2">
              <div className="border-b border-slate-100 p-8 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Monday</p>
                    <p className="text-xs text-slate-500">School refusal</p>
                  </div>
                </div>

                <div className="my-6 flex justify-center">
                  <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Child Compass detects
                </p>
                <div className="mt-3 space-y-2">
                  {timelineEvents.map((event) => (
                    <div
                      key={event.label}
                      className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-2.5"
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="text-sm font-medium text-amber-900">{event.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#FAF8F4] to-[#14B8A6]/5 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14B8A6] text-sm font-bold text-white shadow-md">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">Three weeks later…</p>
                    <p className="text-xs font-semibold text-[#14B8A6]">Pattern discovered</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border-2 border-[#14B8A6]/40 bg-white p-6 shadow-[0_20px_60px_rgba(20,184,166,0.15)] ring-4 ring-[#14B8A6]/10">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#14B8A6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      AI Discovery
                    </span>
                    <span className="text-xs text-slate-400">High confidence</span>
                  </div>
                  <p className="mt-4 text-lg font-bold leading-relaxed text-[#0F172A]">
                    School refusal happens after loud Monday assemblies.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Across 6 Mondays, refusal occurred within 2 hours of assembly in 5 cases.
                    Recommended: ear defenders, assembly opt-out, and a calm re-entry plan.
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <svg className="h-4 w-4 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Patterns emerge automatically as you use Child Compass.
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
