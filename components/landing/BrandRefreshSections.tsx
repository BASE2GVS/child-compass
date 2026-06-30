import Link from "next/link";

function SectionWrap({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-[#102A43] sm:text-5xl">{title}</h2>
          <p className="mt-5 text-lg leading-relaxed text-[#334E68]">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function CorePillarsSection() {
  const pillars = [
    {
      icon: "💬",
      title: "Talk",
      copy: "Personalised conversations when you need support.",
    },
    {
      icon: "🌱",
      title: "Journey",
      copy: "Capture memories, milestones and progress over time.",
    },
    {
      icon: "📅",
      title: "Calendar",
      copy: "Plan ahead with reminders and preparation.",
    },
    {
      icon: "📈",
      title: "Insights",
      copy: "Recognise patterns and celebrate progress.",
    },
    {
      icon: "👧",
      title: "Child Profile",
      copy: "Everything important about your child in one place.",
    },
    {
      icon: "📚",
      title: "Knowledge",
      copy: "Evidence-based guidance and practical resources.",
    },
  ];

  return (
    <SectionWrap
      id="features"
      title="One Journey. One Place. Everything Together."
      subtitle="Talk, Journey, Calendar and Insights work together so every day connects to the bigger family story."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="group rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_6px_24px_rgba(16,42,67,0.08)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(16,42,67,0.14)]"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DBEAFE] text-2xl" aria-hidden>
              {pillar.icon}
            </div>
            <h3 className="text-xl font-semibold text-[#102A43]">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#486581]">{pillar.copy}</p>
          </article>
        ))}
      </div>
    </SectionWrap>
  );
}

export function WhyFamiliesChooseSection() {
  const points = [
    "Feels personal from the first conversation.",
    "Supports everyday parenting decisions with calm guidance.",
    "Builds trust through continuity, not one-off answers.",
    "Helps families notice progress even in difficult weeks.",
  ];

  return (
    <SectionWrap
      title="Why families choose Child Compass"
      subtitle="Because understanding your child should feel steady, human and hopeful."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {points.map((point) => (
          <div key={point} className="rounded-2xl border border-[#DBEAFE] bg-[#F8FAFC] p-5 text-[#102A43] shadow-[0_4px_14px_rgba(16,42,67,0.06)]">
            <p className="text-base leading-relaxed">{point}</p>
          </div>
        ))}
      </div>
    </SectionWrap>
  );
}

export function BuiltForFamiliesSection() {
  return (
    <SectionWrap
      id="resources"
      title="Built for Families"
      subtitle="Designed with privacy, trust and professional collaboration in mind."
    >
      <div className="grid gap-6 lg:grid-cols-4">
        <article className="rounded-3xl bg-white p-6 shadow-[0_6px_18px_rgba(16,42,67,0.08)]">
          <p className="text-2xl" aria-hidden>🔒</p>
          <h3 className="mt-4 text-lg font-semibold text-[#102A43]">Privacy First</h3>
          <p className="mt-2 text-sm text-[#486581]">Your family data stays protected with secure controls and clear boundaries.</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-[0_6px_18px_rgba(16,42,67,0.08)]">
          <p className="text-2xl" aria-hidden>🛡️</p>
          <h3 className="mt-4 text-lg font-semibold text-[#102A43]">Security by Design</h3>
          <p className="mt-2 text-sm text-[#486581]">A calm experience on the surface, robust protection underneath.</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-[0_6px_18px_rgba(16,42,67,0.08)]">
          <p className="text-2xl" aria-hidden>🏡</p>
          <h3 className="mt-4 text-lg font-semibold text-[#102A43]">Family-Centred</h3>
          <p className="mt-2 text-sm text-[#486581]">Every view reflects your child, your routines and your real family journey.</p>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-[0_6px_18px_rgba(16,42,67,0.08)]">
          <p className="text-2xl" aria-hidden>🤝</p>
          <h3 className="mt-4 text-lg font-semibold text-[#102A43]">Professional Collaboration</h3>
          <p className="mt-2 text-sm text-[#486581]">Share progress clearly with school, therapists and care teams when needed.</p>
        </article>
      </div>
    </SectionWrap>
  );
}

export function LandingCallToActionSection() {
  return (
    <section id="pricing" className="pb-24 pt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-[#DBEAFE] bg-gradient-to-br from-[#F8FAFC] via-white to-[#DBEAFE] p-10 text-center shadow-[0_14px_40px_rgba(16,42,67,0.10)] sm:p-14">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-[#102A43] sm:text-5xl">
            Every journey begins with understanding.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#334E68]">
            Support your family with calm, practical guidance that grows with your child over time.
          </p>
          <div className="mt-9">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-[#2F80ED] px-8 py-4 text-base font-semibold text-white shadow-[0_10px_22px_rgba(47,128,237,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1F6FD8]"
            >
              🌱 Start Your Journey
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
