import Link from "next/link";
import EditorialPage from "@/components/editorial/EditorialPage";
import JourneySectionTabs from "@/components/journey/JourneySectionTabs";
import { collectMilestones, formatJourneyDate } from "@/lib/journey/experience";
import type { JourneyEntry } from "@/lib/journey/timeline";
import type { Child } from "@/lib/types/database";

type Props = {
  child: Child;
  familyChildren: Child[];
  entries: JourneyEntry[];
  parentName?: string | null;
  exampleFamilyId?: string | null;
};

function groupByYear(entries: JourneyEntry[]): Record<string, JourneyEntry[]> {
  return entries.reduce<Record<string, JourneyEntry[]>>((acc, entry) => {
    const year = new Date(entry.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {});
}

export default function JourneyMilestonesExperience({ child, familyChildren, entries, parentName, exampleFamilyId = null }: Props) {
  const childName = child.nickname || child.first_name;
  const milestones = collectMilestones(entries);
  const grouped = groupByYear(milestones);
  const years = Object.keys(grouped).sort();

  return (
    <EditorialPage
      variant="track"
      title="Journey Milestones"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
    >
      <p className="mb-5 text-lg leading-relaxed text-[var(--cc-ink-muted)]">
        A chronological view of important moments across your family story, gathered from existing timeline and event data.
      </p>

      <JourneySectionTabs active="milestones" childId={child.id} exampleFamilyId={exampleFamilyId} />

      {milestones.length === 0 ? (
        <p className="text-sm text-[var(--cc-ink-soft)]">Milestones will appear here as your family journey grows.</p>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <section key={year} className="space-y-3">
              <h2 className="font-display text-2xl text-[var(--cc-ink)]">{year}</h2>
              <div className="space-y-3">
                {grouped[year].map((entry) => (
                  <article key={entry.id} className="cc-premium-panel rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                        <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{entry.summary}</p>
                        <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">{formatJourneyDate(entry.date)}</p>
                      </div>
                      <Link href={entry.href} className="text-xs font-semibold text-[#245E5B] hover:underline">
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </EditorialPage>
  );
}
