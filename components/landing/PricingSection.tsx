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
      "Ask Child Compass™",
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
      "Daily check-ins & gentle insights",
      "School & therapy notes",
      "Teacher Guide™ & PDA Passport™",
      "Thoughtful usage limits",
    ],
    popular: true,
    cta: "Get started",
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
      "More room for daily guidance",
    ],
    popular: false,
    cta: "Get started",
    showNoCard: false,
  },
] as const;

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-[var(--cc-paper-elevated)] py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">Plans</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--cc-ink)] lg:text-5xl">
              Simple, honest pricing
            </h2>
            <p className="mt-4 text-lg text-[var(--cc-ink-muted)]">
              Start free. Upgrade when you&apos;re ready. Cancel anytime.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <ScrollReveal key={plan.name}>
              <div
                className={`cc-card-lift relative flex h-full flex-col rounded-[2rem] border p-8 ${
                  plan.popular
                    ? "border-[var(--cc-teal)]/40 bg-gradient-to-br from-[var(--cc-cream-100)] to-white shadow-[0_24px_60px_var(--cc-teal-glow)] ring-1 ring-[var(--cc-teal)]/20"
                    : "border-[var(--cc-border-soft)] bg-white shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--cc-teal)] px-5 py-1.5 text-xs font-bold tracking-wide text-white shadow-md">
                    Most loved
                  </span>
                )}

                <h3 className="font-display text-xl font-semibold text-[var(--cc-ink)]">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-[var(--cc-ink)]">{plan.price}</span>
                  <span className="text-sm text-[var(--cc-ink-muted)]">/{plan.period}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--cc-ink-muted)]">{plan.description}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-[var(--cc-ink-muted)]">
                      <span className="mt-1 text-[var(--cc-teal)]" aria-hidden>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`cc-btn-alive mt-8 block w-full rounded-full py-3.5 text-center text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-[var(--cc-teal)] text-white shadow-[0_8px_24px_var(--cc-teal-glow)] hover:bg-[var(--cc-teal-deep)]"
                      : "border border-[var(--cc-border)] bg-white text-[var(--cc-ink)] hover:border-[var(--cc-teal)]/30"
                  }`}
                >
                  {plan.cta}
                </Link>

                {plan.showNoCard && (
                  <p className="mt-3 text-center text-xs text-[var(--cc-ink-faint)]">No credit card required</p>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
