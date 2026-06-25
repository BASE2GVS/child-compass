import ScrollReveal from "./ScrollReveal";

const responseSections = [
  {
    label: "Likely trigger",
    content: "Transition from home to school after a disrupted weekend sleep routine.",
    color: "bg-amber-50 text-amber-900 border-amber-200",
    dot: "bg-amber-400",
  },
  {
    label: "Why it happened",
    content:
      "Her nervous system was already elevated. The demand to leave felt threatening — not defiant, but protective.",
    color: "bg-blue-50 text-blue-900 border-blue-200",
    dot: "bg-blue-400",
  },
  {
    label: "Immediate response",
    content:
      "Lower demands. Offer two choices she controls. Validate: \"This feels really hard today.\"",
    color: "bg-emerald-50 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-400",
  },
  {
    label: "What NOT to say",
    content: "\"Everyone goes to school.\" \"You're being difficult.\" \"Fine, stay home then.\"",
    color: "bg-red-50 text-red-900 border-red-200",
    dot: "bg-red-400",
  },
  {
    label: "Tomorrow's support plan",
    content:
      "Earlier wake-up with calm sensory input. Visual schedule. Teacher heads-up about Monday transitions.",
    color: "bg-[#14B8A6]/10 text-teal-900 border-[#14B8A6]/30",
    dot: "bg-[#14B8A6]",
  },
] as const;

export default function ParentDebriefShowcase() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#14B8A6]">
              Flagship Feature
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              AI Parent Debrief™
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Describe what happened. Receive calm, personalised guidance in seconds — not generic
              parenting advice.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-14">
          <div className="mx-auto max-w-5xl scale-100 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_40px_100px_rgba(15,23,42,0.12)] lg:scale-[1.08] lg:origin-center">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-sm font-semibold text-slate-600">Parent Debrief™</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-emerald-600">Online</span>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_1.25fr]">
              <div className="border-b border-slate-100 bg-white p-7 lg:border-b-0 lg:border-r">
                <p className="text-xs font-medium text-slate-400">Today, 7:42 AM</p>
                <div className="mt-4 flex justify-end">
                  <div className="max-w-[300px] rounded-[22px] rounded-br-md bg-[#14B8A6] px-5 py-4 text-sm leading-relaxed text-white shadow-md">
                    She refused school again.
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#14B8A6]/15">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6]" />
                  </div>
                  <p className="text-sm text-slate-500">
                    Child Compass is analysing
                    <span className="animate-blink-cursor">|</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 bg-[#FAF8F4] p-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14B8A6] text-xs font-bold text-white shadow-sm">
                      CC
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#0F172A]">Child Compass</span>
                      <p className="text-xs text-slate-400">7:42 AM</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Ready
                  </span>
                </div>

                {responseSections.map((section) => (
                  <div
                    key={section.label}
                    className={`rounded-2xl border p-4 shadow-sm ${section.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${section.dot}`} />
                      <p className="text-xs font-bold uppercase tracking-wide opacity-80">
                        {section.label}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
