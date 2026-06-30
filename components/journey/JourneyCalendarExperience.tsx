import Link from "next/link";
import EditorialPage from "@/components/editorial/EditorialPage";
import JourneySectionTabs from "@/components/journey/JourneySectionTabs";
import { collectCalendarView, formatJourneyDate } from "@/lib/journey/experience";
import {
  buildHelpfulPreparationNotes,
  buildPreparationDetails,
  buildWeekAhead,
  getMemoryContext,
} from "@/lib/journey/preparation-calendar";
import type { JourneyEntry } from "@/lib/journey/timeline";
import type { Child } from "@/lib/types/database";

type Props = {
  child: Child;
  familyChildren: Child[];
  entries: JourneyEntry[];
  parentName?: string | null;
  exampleFamilyId?: string | null;
};

export default function JourneyCalendarExperience({ child, familyChildren, entries, parentName, exampleFamilyId = null }: Props) {
  const childName = child.nickname || child.first_name;
  const calendar = collectCalendarView(entries);
  const memory = getMemoryContext(entries);
  const weekAhead = buildWeekAhead(calendar.upcoming);
  const helpfulNotes = buildHelpfulPreparationNotes(entries);

  return (
    <EditorialPage
      variant="track"
      title="Journey Calendar"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
    >
      <p className="mb-5 text-lg leading-relaxed text-[var(--cc-ink-muted)]">
        A future-focused view of upcoming appointments, school moments, family events, and key dates from your existing data.
      </p>

      <JourneySectionTabs active="calendar" childId={child.id} exampleFamilyId={exampleFamilyId} />

      <section className="mb-6 rounded-2xl bg-[#F6F1E7] p-5 ring-1 ring-[#E6DFD3]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">This Week Ahead</h2>
        {weekAhead.items.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">No upcoming moments are visible in the next 7 days.</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-3 py-1 text-[#345B59] ring-1 ring-[#E6DFD3]">Appointments: {weekAhead.appointments}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[#345B59] ring-1 ring-[#E6DFD3]">School events: {weekAhead.schoolEvents}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[#345B59] ring-1 ring-[#E6DFD3]">Birthdays: {weekAhead.birthdays}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[#345B59] ring-1 ring-[#E6DFD3]">Therapy: {weekAhead.therapy}</span>
              <span className="rounded-full bg-white px-3 py-1 text-[#345B59] ring-1 ring-[#E6DFD3]">Reminders: {weekAhead.reminders}</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[var(--cc-ink-soft)]">
              {weekAhead.items.map((entry) => (
                <li key={entry.id} className="rounded-lg bg-white px-3 py-2 ring-1 ring-[#E6DFD3]">
                  <span className="font-semibold text-[var(--cc-ink)]">{entry.title}</span>
                  <span className="ml-2 text-xs text-[var(--cc-ink-faint)]">{formatJourneyDate(entry.date)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {helpfulNotes.length > 0 ? (
        <section className="mb-6 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
          <h2 className="text-base font-semibold text-[var(--cc-ink)]">Helpful Notes</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--cc-ink-soft)]">
            {helpfulNotes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Upcoming</h2>
        {calendar.upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">No upcoming calendar moments are currently visible.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {calendar.upcoming.map((entry) => {
              const preparation = buildPreparationDetails(entry, child, memory);
              return (
                <li key={entry.id} className="rounded-xl bg-[#FAF8F4] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                      <p className="mt-1 text-xs text-[var(--cc-ink-faint)]">Child: {childName}</p>
                      <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{entry.summary}</p>
                      <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">Date & time: {formatJourneyDate(entry.date)}</p>
                    </div>
                    <Link href={entry.href} className="text-xs font-semibold text-[#245E5B] hover:underline">
                      Open
                    </Link>
                  </div>

                  {preparation.suggestions.length > 0 ? (
                    <div className="mt-3 rounded-lg bg-[#F6F1E7] px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#52706F]">Preparation</p>
                      <ul className="mt-2 space-y-1 text-xs text-[#345B59]">
                        {preparation.suggestions.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {preparation.checklist.length > 0 ? (
                    <div className="mt-3 rounded-lg bg-white px-3 py-3 ring-1 ring-[#E6DFD3]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#52706F]">Checklist</p>
                      <ul className="mt-2 space-y-1 text-xs text-[var(--cc-ink-soft)]">
                        {preparation.checklist.map((item) => (
                          <li key={item}>□ {item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Recently Completed</h2>
        {calendar.recent.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Completed moments will appear here automatically.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-[var(--cc-ink-soft)]">
            {calendar.recent.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#FAF8F4] px-3 py-2">
                <span>{entry.title}</span>
                <span className="text-xs text-[var(--cc-ink-faint)]">{formatJourneyDate(entry.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </EditorialPage>
  );
}
