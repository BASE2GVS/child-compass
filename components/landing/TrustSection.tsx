import ScrollReveal from "./ScrollReveal";

const pillars = [
  { label: "PDA-informed strategies", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { label: "Autism understanding", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { label: "ADHD knowledge", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { label: "Anxiety research", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { label: "Practical parenting", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { label: "AI pattern recognition", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
] as const;

export default function TrustSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Built on trust
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Child Compass combines evidence-informed understanding with the lived experience of
              families navigating PDA, Autism, ADHD and Anxiety every day.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <ScrollReveal key={pillar.label}>
              <div className="flex items-center gap-5 rounded-[24px] border border-slate-100 bg-white px-7 py-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/20 hover:shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14B8A6]/15 to-[#14B8A6]/5">
                  <svg
                    className="h-6 w-6 text-[#14B8A6]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={pillar.icon} />
                  </svg>
                </div>
                <span className="text-sm font-semibold leading-snug text-[#0F172A]">{pillar.label}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
