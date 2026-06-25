export const metadata = { title: "Help Centre — Child Compass" };

export default function HelpCentrePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#0F172A]">Help Centre</h1>
      <p className="mt-4 text-[#64748B] leading-relaxed">
        Practical support for using Child Compass with your family. We are here to help you get the most from daily
        check-ins, Parent Debrief™, reports, and AI guidance — always alongside professional care.
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        <li>
          <strong>Getting started:</strong> Complete onboarding, then your first daily check-in. Child Compass learns
          from real family data — the more consistent you are, the more helpful patterns become.
        </li>
        <li>
          <strong>Parent Debrief™:</strong> End-of-day reflection that connects mood, demands, and wins without
          judgement.
        </li>
        <li>
          <strong>Ask Child Compass™:</strong> Context-aware coaching with confidence indicators. Not a diagnosis or
          replacement for therapists.
        </li>
        <li>
          <strong>Reports:</strong> Teacher guides, PDA passports, and therapist summaries you can share with your care
          team.
        </li>
      </ul>
    </div>
  );
}
