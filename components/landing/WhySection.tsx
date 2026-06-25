import ScrollReveal from "./ScrollReveal";

const insightCards = [
  {
    title: "Hidden Triggers",
    description:
      "Loud environments, unexpected changes, hunger, fatigue, and sensory overload can all build beneath the surface before a meltdown appears.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    title: "Emotional Regulation",
    description:
      "Your child's nervous system is working overtime. They are not choosing to struggle — their body is signalling overwhelm.",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    title: "Demand Avoidance",
    description:
      "When demands feel threatening, even gentle requests can trigger resistance. Understanding PDA changes how you respond — and what actually helps.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
] as const;

export default function WhySection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Child Compass understands <span className="text-[#14B8A6]">why</span>
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600">
              Behaviour is communication. Your child isn&apos;t broken. They&apos;re overwhelmed.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {insightCards.map((card) => (
            <ScrollReveal key={card.title}>
              <div className="h-full rounded-[32px] border border-slate-100 bg-[#FAF8F4] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14B8A6]/10">
                  <svg
                    className="h-6 w-6 text-[#14B8A6]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#0F172A]">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
