const trustPills = [
  {
    label: "PDA Aware",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    label: "Autism Friendly",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    label: "ADHD Support",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    label: "Private & Secure",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    label: "AI Personalised",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
] as const;

export default function TrustBar() {
  return (
    <section className="border-y border-slate-200/60 bg-white/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-10 lg:flex-row lg:justify-between lg:px-8">
        <div className="flex flex-col items-center gap-2.5 text-center lg:items-start lg:text-left">
          <div className="flex items-center gap-1 text-[#14B8A6]">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-600">
            Helping families understand PDA, Autism, ADHD &amp; Anxiety.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
          {trustPills.map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-5 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/30 hover:shadow-md"
            >
              <svg
                className="h-4 w-4 text-[#14B8A6]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={pill.icon} />
              </svg>
              <span className="text-xs font-semibold text-[#0F172A]">{pill.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
