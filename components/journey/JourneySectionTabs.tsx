import Link from "next/link";
import type { JourneySection } from "@/lib/journey/experience";

const TABS: Array<{ id: JourneySection; label: string; href: string }> = [
  { id: "overview", label: "Overview", href: "/journey" },
  { id: "timeline", label: "Timeline", href: "/journey/timeline" },
  { id: "calendar", label: "Calendar", href: "/journey/calendar" },
  { id: "milestones", label: "Milestones", href: "/journey/milestones" },
];

export default function JourneySectionTabs({
  active,
  childId,
  exampleFamilyId,
}: {
  active: JourneySection;
  childId: string;
  exampleFamilyId?: string | null;
}) {
  const query = exampleFamilyId ? `?child=${childId}&example=${exampleFamilyId}` : `?child=${childId}`;

  return (
    <nav aria-label="Journey sections" className="mb-7 flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const href = `${tab.href}${query}`;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-[#1D3B3A] text-white"
                : "bg-white text-[var(--cc-ink-muted)] ring-1 ring-[#D8D2C8] hover:bg-[#F6F1E7]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
