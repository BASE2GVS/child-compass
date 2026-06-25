import ScrollReveal from "./ScrollReveal";

const familyCards = [
  {
    title: "School mornings end in tears",
    description: "Getting out the door feels impossible. Every day starts with guilt and exhaustion.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Simple requests become arguments",
    description: "Putting on shoes or brushing teeth can spiral into a full meltdown.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    title: "Family outings feel impossible",
    description: "You cancel plans because you never know what might trigger a crisis.",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Homework becomes a battle",
    description: "After school is a war zone. Learning feels like punishment for both of you.",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    title: "Your child melts down unexpectedly",
    description: "It seems to come from nowhere — but there is always a reason underneath.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Teachers don't understand",
    description: "School sees behaviour. You see a child who is overwhelmed and trying their best.",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Siblings feel forgotten",
    description: "Your other children need you too, but crisis always takes priority.",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "You're exhausted",
    description: "You love your child deeply. You are also running on empty.",
    icon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  },
] as const;

export default function FamilyRecognitionSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Does this sound like your family?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              You are not alone. Thousands of parents navigate these moments every single day.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {familyCards.map((card, i) => (
            <ScrollReveal key={card.title} className={`delay-[${i * 50}ms]`}>
              <div className="group flex min-h-[200px] flex-col rounded-[28px] border border-slate-100/80 bg-white p-7 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#14B8A6]/20 hover:shadow-[0_24px_60px_rgba(15,23,42,0.09)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14B8A6]/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#14B8A6]/15">
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
                <h3 className="mt-5 text-base font-bold leading-snug text-[#0F172A]">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{card.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
