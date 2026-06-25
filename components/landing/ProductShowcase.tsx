import ScrollReveal from "./ScrollReveal";

const documents = [
  {
    title: "Parent Debrief",
    subtitle: "Monday School Refusal",
    headerBg: "bg-[#14B8A6]",
    status: "Complete",
    statusColor: "bg-emerald-100 text-emerald-700",
    lines: ["Likely trigger: Poor sleep + loud assembly", "Immediate: Lower demands, offer choices"],
    progress: 100,
    showChart: false,
  },
  {
    title: "Teacher Guide",
    subtitle: "Classroom Strategies",
    headerBg: "bg-indigo-500",
    status: "Ready to share",
    statusColor: "bg-indigo-100 text-indigo-700",
    lines: ["Approach with curiosity, not correction", "Allow movement breaks"],
    progress: 100,
    showChart: false,
  },
  {
    title: "Support Plan",
    subtitle: "Morning Routine",
    headerBg: "bg-emerald-500",
    status: "3 steps",
    statusColor: "bg-emerald-100 text-emerald-700",
    lines: ["Step 1: Wake 15 min earlier", "Step 2: Sensory breakfast", "Step 3: Visual schedule"],
    progress: 75,
    showChart: false,
  },
  {
    title: "School Letter",
    subtitle: "PDA-Aware Request",
    headerBg: "bg-amber-500",
    status: "Draft",
    statusColor: "bg-amber-100 text-amber-700",
    lines: ["Dear Mrs. Thompson,", "I wanted to share context about demands…"],
    progress: 60,
    showChart: false,
    signature: true,
  },
  {
    title: "PDA Passport",
    subtitle: "Child Profile",
    headerBg: "bg-violet-500",
    status: "Verified",
    statusColor: "bg-violet-100 text-violet-700",
    lines: ["What helps: Advance notice, choice", "Avoid: Surprise demands"],
    progress: 100,
    showChart: false,
  },
  {
    title: "Weekly Report",
    subtitle: "Week of 14 June",
    headerBg: "bg-rose-500",
    status: "Generated",
    statusColor: "bg-rose-100 text-rose-700",
    lines: ["3 calmer mornings", "Pattern: Mondays after assemblies"],
    progress: 100,
    showChart: true,
  },
  {
    title: "Trigger Report",
    subtitle: "Sensory Analysis",
    headerBg: "bg-orange-500",
    status: "High confidence",
    statusColor: "bg-orange-100 text-orange-700",
    lines: ["Fluorescent lighting + crowds", "Peak difficulty: 2–4pm"],
    progress: 88,
    showChart: true,
  },
  {
    title: "Regulation Graph",
    subtitle: "7-Day Overview",
    headerBg: "bg-cyan-500",
    status: "Updated",
    statusColor: "bg-cyan-100 text-cyan-700",
    lines: ["Best day: Thursday (low demands)", "Anxiety trending down"],
    progress: 100,
    showChart: true,
  },
] as const;

export default function ProductShowcase() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              See what Child Compass creates
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Real documents you can use, share, and act on — not generic templates.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map((doc) => (
            <ScrollReveal key={doc.title}>
              <div className="group overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
                <div className={`${doc.headerBg} px-4 py-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-white/90">
                      {doc.title}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${doc.statusColor}`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-white">{doc.subtitle}</p>
                </div>

                <div className="p-4">
                  <ul className="space-y-2">
                    {doc.lines.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-xs text-slate-600">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {line}
                      </li>
                    ))}
                  </ul>

                  {doc.showChart && (
                    <div className="mt-3 flex items-end gap-1">
                      {[40, 65, 35, 80, 55, 70, 45].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-[#14B8A6]/30 transition-colors group-hover:bg-[#14B8A6]/50"
                          style={{ height: `${h * 0.4}px` }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progress</span>
                      <span>{doc.progress}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-[#14B8A6] transition-all group-hover:bg-[#0D9488]"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                  </div>

                  {"signature" in doc && doc.signature && (
                    <p className="mt-3 border-t border-slate-100 pt-3 font-serif text-xs italic text-slate-400">
                      With warmth, Sarah M.
                    </p>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
