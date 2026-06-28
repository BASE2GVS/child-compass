"use client";

import { Suspense, useMemo, useState } from "react";
import { CompanionExpandable } from "@/components/companion";
import FormFeedbackBanner from "@/components/forms/FormFeedbackBanner";
import EditorialPage from "@/components/editorial/EditorialPage";
import JourneyFilters from "@/components/track/JourneyFilters";
import JournalCard, { groupTimelineDays } from "@/components/track/JournalCard";
import MemoryCard from "@/components/track/MemoryCard";
import TrackEmptyState from "@/components/track/TrackEmptyState";
import AddObservationForm from "@/components/timeline/AddObservationForm";
import {
  filterTimelineEvents,
  isMemoryMoment,
  type ThemeFilter,
  type TimeFilter,
} from "@/components/track/track-filters";
import GentleInsight from "@/components/insights/GentleInsight";
import type { CompanionInsight } from "@/lib/intelligence/insight-engine";
import type { Child, UnifiedTimelineItem } from "@/lib/types/database";

type FamilyTimelineProps = {
  events: UnifiedTimelineItem[];
  child: Child;
  familyChildren: Child[];
  parentName?: string | null;
  companionInsights?: CompanionInsight[];
};

export default function FamilyTimeline({ events, child, familyChildren, parentName, companionInsights = [] }: FamilyTimelineProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ThemeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const childName = child.nickname || child.first_name;

  const filtered = useMemo(
    () => filterTimelineEvents(events, timeFilter, categoryFilter, searchQuery),
    [events, timeFilter, categoryFilter, searchQuery],
  );

  const memories = useMemo(() => filtered.filter(isMemoryMoment).slice(0, 4), [filtered]);
  const memoryIds = useMemo(() => new Set(memories.map((m) => m.id)), [memories]);
  const timelineEvents = useMemo(
    () => filtered.filter((e) => !memoryIds.has(e.id)),
    [filtered, memoryIds],
  );
  const grouped = useMemo(() => groupTimelineDays(timelineEvents), [timelineEvents]);

  const hasEvents = events.length > 0;
  const hasFiltered = filtered.length > 0;

  return (
    <EditorialPage
      variant="track"
      title="Timeline"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
      primaryAction={
        !hasEvents
          ? { label: "Start check-in", href: `/check-in?child=${child.id}&first=1` }
          : undefined
      }
    >
      <Suspense fallback={null}>
        <FormFeedbackBanner successMessage="✓ Added to your timeline" />
      </Suspense>

      <p className="mb-8 text-lg leading-relaxed text-[var(--cc-ink-muted)]">
        The story of your family — check-ins, notes, wins, and everything in between.
      </p>

      {companionInsights.length > 0 && (
        <CompanionExpandable label="What we're noticing" className="mb-10">
          <div className="mt-4 space-y-4">
            {companionInsights.slice(0, 3).map((insight) => (
              <GentleInsight key={insight.id} insight={insight} />
            ))}
          </div>
        </CompanionExpandable>
      )}

      {!hasEvents && <TrackEmptyState childName={childName} childId={child.id} />}

      {hasEvents && !hasFiltered && (
        <p className="text-base text-[var(--cc-ink-muted)]">Nothing matches this filter yet.</p>
      )}

      {timelineEvents.length > 0 && (
        <div className="relative space-y-10">
          {grouped.map(({ label, dayType, events: dayEvents }) => {
            let entryIndex = 0;
            return (
              <div key={label}>
                <div className="mb-4">
                  <h3 className="font-display text-lg font-medium text-[var(--cc-ink)]">{label}</h3>
                  {dayType && (
                    <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">{dayType}</p>
                  )}
                </div>
                <div className="space-y-6">
                  {dayEvents.map((event) => {
                    entryIndex += 1;
                    return (
                      <JournalCard
                        key={event.id}
                        event={event}
                        index={entryIndex}
                        childName={childName}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasEvents && (
        <CompanionExpandable label="Search and filter" className="mt-10">
          <JourneyFilters
            timeFilter={timeFilter}
            themeFilter={categoryFilter}
            searchQuery={searchQuery}
            onTimeChange={setTimeFilter}
            onThemeChange={setCategoryFilter}
            onSearchChange={setSearchQuery}
          />
        </CompanionExpandable>
      )}

      {memories.length > 0 && (
        <CompanionExpandable label="Moments to remember">
          <div className="mt-4 space-y-6">
            {memories.map((event) => (
              <MemoryCard key={`memory-${event.id}`} event={event} />
            ))}
          </div>
        </CompanionExpandable>
      )}

      {hasEvents && (
        <CompanionExpandable label="Add to the story" className="mt-10">
          <div id="add-moment">
            <AddObservationForm childId={child.id} />
          </div>
        </CompanionExpandable>
      )}
    </EditorialPage>
  );
}
