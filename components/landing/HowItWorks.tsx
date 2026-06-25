import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Tell Child Compass about today",
    description: "Describe what happened in your own words. No forms, no jargon — just speak like a parent.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    number: "02",
    title: "AI understands what happened",
    description: "Child Compass connects behaviour to triggers, patterns, and your child's unique profile.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  },
  {
    number: "03",
    title: "Receive personalised guidance",
    description: "Get calm, actionable advice — what to do now, what to avoid, and what to try tomorrow.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    number: "04",
    title: "Life becomes calmer",
    description: "Over time, patterns emerge. You respond with confidence instead of guessing.",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
] as const;

export default function HowItWorks() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From overwhelmed to understood — in four simple steps.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative mt-16">
          <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-[#14B8A6] via-[#14B8A6]/30 to-transparent lg:left-1/2 lg:-ml-px" />

          <div className="space-y-14">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number}>
                <div
                  className={`relative flex flex-col gap-6 lg:flex-row lg:items-center ${
                    index % 2 === 1 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 1 ? "lg:text-right" : ""}`}>
                    <span className="text-sm font-bold text-[#14B8A6]">{step.number}</span>
                    <h3 className="mt-1 text-xl font-bold text-[#0F172A]">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-slate-600">{step.description}</p>
                  </div>

                  <div className="relative z-10 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-4 border-[#FAF8F4] bg-[#14B8A6] text-white shadow-lg transition-transform hover:scale-105 lg:mx-8">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>

                  <div className="hidden flex-1 lg:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
