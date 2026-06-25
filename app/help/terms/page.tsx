export const metadata = { title: "Terms of Service — Child Compass" };

export default function TermsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Terms of Service</h1>
      <p className="mt-4 text-sm text-[#94A3B8]">Effective: Version 1.0 commercial launch</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#64748B]">
        <section>
          <h2 className="font-bold text-[#0F172A]">1. Service description</h2>
          <p className="mt-2">
            Child Compass™ is a subscription platform operated by VYRONSOFT. It provides parenting support tools,
            pattern insights, and AI-assisted guidance for families of neurodivergent children.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-[#0F172A]">2. Not medical advice</h2>
          <p className="mt-2">
            Child Compass does not provide medical diagnosis, treatment, or emergency services. Always consult qualified
            professionals for clinical decisions.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-[#0F172A]">3. Subscriptions</h2>
          <p className="mt-2">
            Plans are billed monthly in South African Rand unless otherwise stated. Trials convert to paid plans unless
            cancelled. Payment processing via Stripe and regional providers will be introduced separately.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-[#0F172A]">4. Acceptable use</h2>
          <p className="mt-2">
            You must not misuse the platform, attempt to access other families&apos; data, or use Child Compass in ways
            that harm children or violate applicable law.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-[#0F172A]">5. Contact</h2>
          <p className="mt-2">
            <a href="/help/contact" className="text-[#14B8A6] hover:underline">
              Contact support
            </a>{" "}
            for billing, privacy, or account questions.
          </p>
        </section>
      </div>
    </div>
  );
}
