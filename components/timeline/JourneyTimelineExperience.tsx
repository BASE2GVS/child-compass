"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EditorialPage from "@/components/editorial/EditorialPage";
import JourneySectionTabs from "@/components/journey/JourneySectionTabs";
import type { Child } from "@/lib/types/database";
import type { JourneyEntry, JourneyFilter } from "@/lib/journey/timeline";

type Props = {
  child: Child;
  familyChildren: Child[];
  entries: JourneyEntry[];
  parentName?: string | null;
  exampleFamilyId?: string | null;
};

type GroupName = "Today" | "Yesterday" | "This Week" | "This Month" | "Earlier";

const FILTERS: Array<{ id: JourneyFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "conversations", label: "Conversations" },
  { id: "health", label: "Health" },
  { id: "sleep", label: "Sleep" },
  { id: "school", label: "School" },
  { id: "milestones", label: "Milestones" },
  { id: "calendar", label: "Calendar" },
  { id: "reports", label: "Reports" },
  { id: "memories", label: "Memories" },
];

function groupNameForDate(dateIso: string): GroupName {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const date = new Date(dateIso);
  if (date >= todayStart) return "Today";
  if (date >= yesterdayStart) return "Yesterday";
  if (date >= weekStart) return "This Week";
  if (date >= monthStart) return "This Month";
  return "Earlier";
}

function prettyDate(dateIso: string): string {
  return new Date(dateIso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchesSearch(entry: JourneyEntry, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [entry.title, entry.summary, entry.childName, entry.sourceLabel]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export default function JourneyTimelineExperience({ child, familyChildren, entries, parentName, exampleFamilyId = null }: Props) {
  const [filter, setFilter] = useState<JourneyFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      entries.filter((entry) => (filter === "all" ? true : entry.filter === filter)).filter((entry) => matchesSearch(entry, search)),
    [entries, filter, search],
  );

  const grouped = useMemo(() => {
    const result: Record<GroupName, JourneyEntry[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Earlier: [],
    };

    for (const entry of filtered) {
      result[groupNameForDate(entry.date)].push(entry);
    }

    return result;
  }, [filtered]);

  const sections: GroupName[] = ["Today", "Yesterday", "This Week", "This Month", "Earlier"];
  const childName = child.nickname || child.first_name;

  return (
    <EditorialPage
      variant="track"
      title="Journey"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
    >
      <p className="mb-6 text-lg leading-relaxed text-[var(--cc-ink-muted)]">
        A living timeline of your family journey, built from your existing conversations, check-ins, events, reports,
        calendar moments, and memories.
      </p>

      <JourneySectionTabs active="timeline" childId={child.id} exampleFamilyId={exampleFamilyId} />

      <div className="mb-6 grid gap-3 rounded-2xl bg-[#FAF8F4] p-4 sm:grid-cols-[2fr_1fr]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search journey history"
          className="rounded-xl border border-[#D8D2C8] bg-white px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as JourneyFilter)}
          className="rounded-xl border border-[#D8D2C8] bg-white px-3 py-2 text-sm"
        >
          {FILTERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === item.id
                ? "bg-[#1D3B3A] text-white"
                : "bg-white text-[var(--cc-ink-muted)] ring-1 ring-[#D8D2C8]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--cc-ink-muted)]">No journey items match your current filters.</p>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => {
            const items = grouped[section];
            if (!items.length) return null;

            return (
              <section key={section} className="space-y-4">
                <h2 className="font-display text-2xl text-[var(--cc-ink)]">{section}</h2>
                <div className="space-y-3">
                  {items.map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-2xl bg-white p-4 shadow-[0_2px_14px_rgba(45,42,38,0.06)] ring-1 ring-[#E6DFD3]"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[#204A48]">
                          <span className="mr-2" aria-hidden>
                            {entry.icon}
                          </span>
                          {entry.title}
                        </p>
                        <span className="text-xs text-[var(--cc-ink-faint)]">{prettyDate(entry.date)}</span>
                      </div>
                      <p className="text-sm text-[var(--cc-ink-soft)]">{entry.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--cc-ink-faint)]">
                        <span>Child: {entry.childName}</span>
                        <span>Source: {entry.sourceLabel}</span>
                        <Link href={entry.href} className="font-semibold text-[#245E5B] hover:underline">
                          Open original item
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </EditorialPage>
  );
}
