import ScrollReveal from "./ScrollReveal";

const compassMetrics = [
  { label: "Anxiety", value: 72, color: "#F59E0B" },
  { label: "Energy", value: 45, color: "#14B8A6" },
  { label: "Regulation", value: 38, color: "#6366F1" },
  { label: "Sensory Load", value: 81, color: "#EC4899" },
  { label: "Demand Tolerance", value: 29, color: "#EF4444" },
  { label: "Social Battery", value: 52, color: "#8B5CF6" },
  { label: "Recovery", value: 64, color: "#14B8A6" },
] as const;

function MetricRing({
  label,
  value,
  color,
  index,
  total,
}: {
  label: string;
  value: number;
  color: string;
  index: number;
  total: number;
}) {
  const angle = (index / total) * 360 - 90;
  const radius = 130;
  const x = 160 + radius * Math.cos((angle * Math.PI) / 180);
  const y = 160 + radius * Math.sin((angle * Math.PI) / 180);

  return (
    <div
      className="absolute flex flex-col items-center transition-transform duration-300 hover:scale-105"
      style={{ left: x - 40, top: y - 28, width: 80 }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full border-4 bg-white shadow-md"
        style={{ borderColor: color }}
      >
        <span className="text-xs font-bold text-[#0F172A]">{value}</span>
      </div>
      <span className="mt-1.5 text-center text-[10px] font-semibold leading-tight text-slate-600">
        {label}
      </span>
    </div>
  );
}

export default function ChildCompassShowcase() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <ScrollReveal>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#14B8A6]">
                Signature Feature
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
                Your Child&apos;s Compass™
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                A living picture of how your child is doing right now — and what they need most.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Child Compass learns{" "}
                <strong className="font-semibold text-[#0F172A]">your</strong> child over time. No
                two children are the same.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="relative mx-auto h-[320px] w-[320px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#14B8A6]/5 to-[#14B8A6]/15 shadow-[0_30px_80px_rgba(15,23,42,0.08)]" />
              <div className="absolute inset-8 animate-rotate-slow rounded-full border-2 border-dashed border-[#14B8A6]/25" />
              <svg className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#14B8A6" strokeOpacity="0.15" strokeWidth="2" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="85"
                  className="animate-progress-ring"
                />
              </svg>
              <div className="absolute inset-16 flex animate-gentle-pulse flex-col items-center justify-center rounded-full bg-white shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#14B8A6]">
                  Today
                </span>
                <span className="mt-1 text-2xl font-bold text-[#0F172A]">Elevated</span>
                <span className="mt-1 text-center text-xs text-slate-500">
                  Needs calm &amp; low demands
                </span>
              </div>

              <div className="relative h-full w-full">
                {compassMetrics.map((metric, i) => (
                  <MetricRing
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    color={metric.color}
                    index={i}
                    total={compassMetrics.length}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
