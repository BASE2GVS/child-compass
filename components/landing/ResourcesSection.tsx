import ScrollReveal from "./ScrollReveal";
import Link from "next/link";

const resources = [
  {
    title: "Understanding PDA",
    description: "Learn what demand avoidance really means — and what actually helps.",
    href: "/register",
    cta: "Start your free trial",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "Autism & Anxiety",
    description: "How overlapping profiles affect behaviour, regulation, and daily life.",
    href: "/register",
    cta: "Explore in Child Compass",
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    title: "School Support",
    description: "Practical guides for communicating with teachers and SENCOs.",
    href: "/register",
    cta: "Explore in Child Compass",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    title: "Teacher Resources",
    description: "Classroom strategies that respect PDA, Autism, ADHD and Anxiety.",
    href: "/register",
    cta: "Explore in Child Compass",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    title: "Family Guides",
    description: "Support for siblings, grandparents, and extended family members.",
    href: "/register",
    cta: "Explore in Child Compass",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "Frequently Asked Questions",
    description: "Answers to the questions parents ask most about Child Compass.",
    href: "/help/faq",
    cta: "Read the FAQ",
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
] as const;

export default function ResourcesSection() {
  return (
    <section id="resources" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Resources
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Guides and gentle support for every stage of your journey — inside Child Compass and here on the Help Centre.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ScrollReveal key={resource.title}>
              <Link
                href={resource.href}
                className="group relative block h-full rounded-[28px] border border-slate-100 bg-[#FAF8F4] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#14B8A6]/25 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#14B8A6]/10 transition-colors group-hover:bg-[#14B8A6]/15">
                  <svg
                    className="h-5 w-5 text-[#14B8A6]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={resource.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 text-base font-bold text-[#0F172A]">{resource.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{resource.description}</p>
                <p className="mt-4 text-sm font-semibold text-[#14B8A6]">{resource.cta} →</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
