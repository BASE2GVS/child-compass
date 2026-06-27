import Link from "next/link";

import { CompanionExpandable } from "@/components/companion";

import EditorialPage from "@/components/editorial/EditorialPage";

const TOP_QUESTIONS = [
  {
    q: "How do I do my first check-in?",
    a: "Tap Today, then Check in. It takes about two minutes — a few simple questions about how your child is doing.",
  },
  {
    q: "What is Talk?",
    a: "Your private conversation space. Share what's on your mind, or just think out loud.",
  },
  {
    q: "Is my family's data private?",
    a: "Yes. Your information stays within your family account. We never sell your data.",
  },
  {
    q: "Do I need to check in every day?",
    a: "No pressure. Even a few moments now and then help us understand your family more naturally.",
  },
  {
    q: "How do I get more help?",
    a: "Email us anytime from Contact support below.",
  },
];

const MORE_QUESTIONS = [
  {
    q: "What is Child Compass?",
    a: "A calm companion for parents — daily check-ins, gentle insights, and someone to talk to when days feel hard.",
  },
  {
    q: "How long does a check-in take?",
    a: "Most parents finish in two to three minutes. Skip anything that doesn't feel right today.",
  },
  {
    q: "Can I share information with teachers?",
    a: "After a few check-ins, Documents offers gentle summaries you can share with school.",
  },
  {
    q: "Where are my documents?",
    a: "Open Documents from the menu. Summaries appear as your family's story grows.",
  },
  {
    q: "What is My Child?",
    a: "A living picture of your child — strengths, patterns, and what you've noticed together.",
  },
];

export default function HelpCentreExperience({ parentName }: { parentName?: string | null }) {
  const firstName = parentName?.split(" ")[0];

  return (
    <EditorialPage variant="help" title="Help" parentName={parentName}>
      <p className="max-w-2xl text-lg text-[var(--cc-ink-muted)]">
        {firstName ? `${firstName}, ` : ""}you&apos;re not alone.
      </p>

      <dl className="mt-8 max-w-2xl divide-y divide-[var(--cc-border-soft)]/60">
        {TOP_QUESTIONS.map((item) => (
          <div key={item.q} className="py-5">
            <dt className="text-base font-semibold text-[var(--cc-ink)]">{item.q}</dt>
            <dd className="mt-2 text-base leading-relaxed text-[var(--cc-ink-muted)]">{item.a}</dd>
          </div>
        ))}
      </dl>

      <CompanionExpandable label="More questions" className="mt-6 max-w-2xl">
        <dl className="divide-y divide-[var(--cc-border-soft)]/60">
          {MORE_QUESTIONS.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="text-base font-semibold text-[var(--cc-ink)]">{item.q}</dt>
              <dd className="mt-2 text-base leading-relaxed text-[var(--cc-ink-muted)]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </CompanionExpandable>

      <div className="mt-10 flex flex-wrap gap-4 text-base">
        <Link href="/help/contact" className="font-semibold text-[var(--cc-teal-deep)] hover:underline">
          Contact support
        </Link>
        <Link href="/help/faq" className="font-medium text-[var(--cc-ink-muted)] hover:underline">
          Full FAQ
        </Link>
      </div>
    </EditorialPage>
  );
}
