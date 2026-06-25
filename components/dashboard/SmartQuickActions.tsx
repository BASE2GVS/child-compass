import Link from "next/link";
import type { DailyCheckin } from "@/lib/types/database";

type SmartQuickActionsProps = {
  childId: string;
  checkin: DailyCheckin | null;
  hasDebrief: boolean;
};

type Action = {
  href: string;
  title: string;
  description: string;
  priority: number;
};

export default function SmartQuickActions({
  childId,
  checkin,
  hasDebrief,
}: SmartQuickActionsProps) {
  const qs = `?child=${childId}`;

  const candidates: Action[] = [
    {
      href: `/check-in${qs}`,
      title: checkin ? "Update Today's Check-In" : "Complete Morning Check-In",
      description: checkin
        ? "Adjust today's snapshot if things have shifted."
        : "Unlock today's briefing in under two minutes.",
      priority: checkin ? 3 : 1,
    },
    {
      href: `/debrief${qs}`,
      title: hasDebrief ? "Continue Parent Debrief™" : "Start Parent Debrief™",
      description: "Understand behaviour with calm, personalised guidance.",
      priority: hasDebrief ? 4 : 2,
    },
    {
      href: `/teacher-guide${qs}`,
      title: "Create Teacher Guide™",
      description: "Share classroom strategies tailored to your child.",
      priority: 5,
    },
    {
      href: `/reports${qs}`,
      title: "Review Weekly Report",
      description: "See patterns, highlights, and progress summaries.",
      priority: 6,
    },
    {
      href: `/pda-passport${qs}`,
      title: "Open PDA Passport™",
      description: "Shareable profile for teachers and carers.",
      priority: 7,
    },
    {
      href: `/children/${childId}`,
      title: "Child Profile",
      description: "Strengths, triggers, and support strategies.",
      priority: 8,
    },
    {
      href: `/documents${qs}`,
      title: "Documents",
      description: "Medical reports, school letters, and plans.",
      priority: 9,
    },
    {
      href: `/timeline${qs}`,
      title: "Emotional Timeline",
      description: "The full story of wins and challenges.",
      priority: 10,
    },
  ];

  const actions = candidates.sort((a, b) => a.priority - b.priority).slice(0, 6);

  return (
    <section aria-labelledby="smart-actions-heading">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">
        Smart Quick Actions
      </p>
      <h2 id="smart-actions-heading" className="mt-2 text-2xl font-bold text-[#0F172A]">
        Suggested for right now
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-[24px] border border-white/60 bg-white/90 p-5 shadow-[0_6px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <h3 className="font-bold text-[#0F172A] group-hover:text-[#14B8A6]">{action.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{action.description}</p>
            <span className="mt-3 inline-block text-xs font-semibold text-[#14B8A6]">Go →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
