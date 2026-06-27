"use client";



import { useMemo, useState } from "react";

import { CompanionExpandable } from "@/components/companion";

import EditorialPage from "@/components/editorial/EditorialPage";

import JourneyFilters from "@/components/track/JourneyFilters";

import JournalCard from "@/components/track/JournalCard";

import MemoryCard from "@/components/track/MemoryCard";

import TrackEmptyState from "@/components/track/TrackEmptyState";

import AddMomentForm from "@/components/track/AddMomentForm";

import {

  filterTimelineEvents,

  isMemoryMoment,

  type ThemeFilter,

  type TimeFilter,

} from "@/components/track/track-filters";

import { groupTimelineByDay } from "@/lib/dashboard/briefing";

import type { Child, UnifiedTimelineItem } from "@/lib/types/database";



type TrackJournalProps = {

  events: UnifiedTimelineItem[];

  child: Child;

  familyChildren: Child[];

  parentName?: string | null;

};



export default function TrackJournal({ events, child, familyChildren, parentName }: TrackJournalProps) {

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const [themeFilter, setThemeFilter] = useState<ThemeFilter>("all");



  const childName = child.nickname || child.first_name;

  const filtered = useMemo(

    () => filterTimelineEvents(events, timeFilter, themeFilter),

    [events, timeFilter, themeFilter],

  );



  const memories = useMemo(() => filtered.filter(isMemoryMoment).slice(0, 4), [filtered]);

  const memoryIds = useMemo(() => new Set(memories.map((m) => m.id)), [memories]);

  const timelineEvents = useMemo(

    () => filtered.filter((e) => !memoryIds.has(e.id)),

    [filtered, memoryIds],

  );

  const grouped = useMemo(() => groupTimelineByDay(timelineEvents), [timelineEvents]);



  const hasEvents = events.length > 0;

  const hasFiltered = filtered.length > 0;



  return (

    <EditorialPage

      variant="track"

      title="Track"

      parentName={parentName}

      childName={childName}

      familyChildren={familyChildren}

      activeChildId={child.id}

      primaryAction={
        !hasEvents
          ? { label: "Start check-in", href: `/check-in?child=${child.id}&first=1` }
          : { label: "Add a moment", href: "#add-moment" }
      }

    >

      {!hasEvents && <TrackEmptyState childName={childName} childId={child.id} />}



      {hasEvents && !hasFiltered && (

        <p className="text-base text-[var(--cc-ink-muted)]">Nothing matches this filter yet.</p>

      )}



      {timelineEvents.length > 0 && (

        <div className="relative space-y-10">

          {grouped.map(({ day, events: dayEvents }) => {

            const rawById = new Map(timelineEvents.map((e) => [e.id, e]));

            let entryIndex = 0;



            return (

              <div key={day}>

                <h3 className="mb-4 font-display text-lg font-medium text-[var(--cc-ink-muted)]">{day}</h3>

                <div className="space-y-6">

                  {dayEvents.map((emotional) => {

                    const raw = rawById.get(emotional.id);

                    if (!raw) return null;

                    entryIndex += 1;

                    return <JournalCard key={raw.id} event={raw} index={entryIndex} />;

                  })}

                </div>

              </div>

            );

          })}

        </div>

      )}



      <CompanionExpandable label="Find a moment">

        <JourneyFilters

          timeFilter={timeFilter}

          themeFilter={themeFilter}

          onTimeChange={setTimeFilter}

          onThemeChange={setThemeFilter}

        />

      </CompanionExpandable>



      {memories.length > 0 && (

        <CompanionExpandable label="Saved moments">

          <div className="mt-4 space-y-6">

            {memories.map((event) => (

              <MemoryCard key={`memory-${event.id}`} event={event} />

            ))}

          </div>

        </CompanionExpandable>

      )}



      {hasEvents && (
        <CompanionExpandable label="Add a moment" className="mt-10">
          <div id="add-moment">
            <AddMomentForm childId={child.id} />
          </div>
        </CompanionExpandable>
      )}
    </EditorialPage>

  );

}


