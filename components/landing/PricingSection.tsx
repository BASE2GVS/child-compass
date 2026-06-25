import ScrollReveal from "./ScrollReveal";
import Link from "next/link";

const plans = [
  {
    name: "Free trial",
    price: "R0",
    period: "14 days",
    description: "Full Family Plus access while you explore Child Compass.",
    features: [
      "Daily check-ins & Parent Debrief™",
      "Ask Child Compass™ AI coach",
      "Reports for teachers & therapists",
      "Health Hub included during trial",
    ],
    popular: false,
    cta: "Start free trial",
    showNoCard: true,
  },
  {
    name: "Family",
    price: "R149",
    period: "per month",
    description: "Core support for everyday parenting with up to 3 children.",
    features: [
      "Daily check-ins & intelligence",
      "School & Therapist Hubs",
      "Teacher Guide™ & PDA Passport™",
      "Usage limits apply — see Settings",
    ],
    popular: true,
    cta: "Get Started",
    showNoCard: false,
  },
  {
    name: "Family Plus",
    price: "R249",
    period: "per month",
    description: "Complete support including health tracking and longitudinal reviews.",
    features: [
      "Everything in Family",
      "Health Hub",
      "30/90/180/365-day reviews",
      "Higher daily limits",
    ],
    popular: false,
    cta: "Get Started",
    showNoCard: false,
  },
] as const;

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              Simple pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <ScrollReveal key={plan.name}>
              <div
                className={`relative flex h-full flex-col rounded-[32px] border p-8 transition-all duration-300 ${
                  plan.popular
                    ? "scale-[1.02] border-[#14B8A6] bg-[#FAF8F4] shadow-[0_40px_100px_rgba(20,184,166,0.18)] ring-2 ring-[#14B8A6]/20"
                    : "border-slate-100 bg-white shadow-sm hover:-translate-y-1 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#14B8A6] px-5 py-1.5 text-xs font-bold tracking-wide text-white shadow-md">
                    Most Popular
                  </span>
                )}

                <h3 className="text-xl font-bold text-[#0F172A]">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#0F172A]">{plan.price}</span>
                  <span className="text-sm text-slate-500">/{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{plan.description}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#14B8A6]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`mt-8 block w-full rounded-2xl py-3.5 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-[#14B8A6] text-white shadow-lg shadow-[#14B8A6]/25 hover:bg-[#0D9488] hover:shadow-xl"
                      : "border border-slate-200 bg-white text-[#0F172A] hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {plan.cta}
                </Link>

                {plan.showNoCard && (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    No credit card required.
                  </p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
