import Link from "next/link";
import EditorialPage from "@/components/editorial/EditorialPage";
import ExampleFamilySelector from "@/components/example/ExampleFamilySelector";
import JourneySectionTabs from "@/components/journey/JourneySectionTabs";
import { buildJourneyOverview, buildPreparationSuggestion, formatJourneyDate } from "@/lib/journey/experience";
import type { JourneyEntry } from "@/lib/journey/timeline";
import type { Child } from "@/lib/types/database";

type Props = {
  child: Child;
  familyChildren: Child[];
  entries: JourneyEntry[];
  parentName?: string | null;
  exampleFamilyId?: string | null;
  exampleFamilies?: Array<{ id: string; label: string; childId: string }>;
};

function rangeLabel(startDate: string, endDate: string): string {
  return `${startDate} to ${endDate}`;
}

export default function JourneyOverviewExperience({
  child,
  familyChildren,
  entries,
  parentName,
  exampleFamilyId = null,
  exampleFamilies = [],
}: Props) {
  const childName = child.nickname || child.first_name;
  const overview = buildJourneyOverview(entries, { parentName, childName });
  const query = exampleFamilyId ? `?child=${child.id}&example=${exampleFamilyId}` : `?child=${child.id}`;

  return (
    <EditorialPage
      variant="track"
      title="Journey"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
    >
      <ExampleFamilySelector items={exampleFamilies} activeExampleId={exampleFamilyId} />

      <div className="cc-premium-panel mb-8 space-y-3 rounded-2xl p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#52706F]">Good Morning</p>
        <h2 className="font-display text-3xl text-[var(--cc-ink)]">{overview.greeting}</h2>
        <p className="text-sm text-[var(--cc-ink-soft)]">How is my child doing today?</p>
      </div>

      <JourneySectionTabs active="overview" childId={child.id} exampleFamilyId={exampleFamilyId} />

      <section className="grid gap-4">
        <article className="cc-premium-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#52706F]">Today&apos;s Journey</h2>
          <p className="mt-3 text-xl leading-relaxed text-[var(--cc-ink)]">{overview.todayJourneySummary}</p>
          <div className="mt-4 inline-flex rounded-full bg-white/62 px-3 py-1 text-xs font-semibold text-[#345B59] ring-1 ring-white/72">
            Emotional tone: {overview.emotionalTone}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="cc-premium-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#52706F]">Current Focus</h2>
          {overview.focusAreas.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Focus areas will appear as more moments are recorded.</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {overview.focusAreas.map((focus) => (
                <li key={focus} className="rounded-full bg-[#EAF3FF] px-3 py-1 text-xs font-semibold text-[#274C77]">
                  {focus}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-[var(--cc-ink-faint)]">Logged moments this week: {overview.thisWeekCount}</p>
        </article>

        <article className="cc-premium-panel rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Recent Wins</h2>
          {overview.recentWins.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Wins from your timeline will show here as they are captured.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {overview.recentWins.map((entry) => (
                <li key={entry.id} className="cc-premium-panel-soft rounded-xl p-3">
                  <p className="text-sm font-semibold text-[var(--cc-ink)]">✓ {entry.title}</p>
                  <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{entry.summary}</p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--cc-ink-faint)]">
                    <span>{formatJourneyDate(entry.date)}</span>
                    <Link href={entry.href} className="font-semibold text-[#245E5B] hover:underline">
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="cc-premium-panel rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Upcoming Events</h2>
          {overview.upcomingEvents.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">No upcoming events are currently visible from your existing data.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {overview.upcomingEvents.map((entry) => (
                <li key={entry.id} className="cc-premium-panel-soft rounded-xl p-3">
                  <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                  <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{formatJourneyDate(entry.date)}</p>
                  <div className="mt-2 text-xs text-[var(--cc-ink-faint)]">
                    <Link href={entry.href} className="font-semibold text-[#245E5B] hover:underline">
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Looking Ahead</h2>
        {overview.upcomingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">No upcoming events are currently visible from your existing data.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {overview.upcomingEvents.map((entry) => {
              const suggestion = buildPreparationSuggestion(entry, child);
              return (
                <li key={entry.id} className="cc-premium-panel-soft rounded-xl p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                      <p className="mt-1 text-xs text-[var(--cc-ink-faint)]">{formatJourneyDate(entry.date)}</p>
                    </div>
                    <Link href={entry.href} className="text-xs font-semibold text-[#245E5B] hover:underline">
                      Open
                    </Link>
                  </div>
                  {suggestion ? <p className="mt-2 text-xs text-[#345B59]">{suggestion}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Gentle Insights</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--cc-ink-soft)]">
          {overview.helpfulInsights.map((insight) => (
            <li key={insight}>• {insight}</li>
          ))}
        </ul>

        {overview.recentChallenges.length > 0 ? (
          <div className="cc-premium-panel-soft mt-5 rounded-xl p-3 text-sm text-[var(--cc-ink-soft)]">
            <p className="font-semibold text-[var(--cc-ink)]">Recent challenges to hold gently</p>
            <p className="mt-1">{overview.recentChallenges[0].title}</p>
          </div>
        ) : null}
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Journey History</h2>
        <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">
          Period-based chapters built from your existing journey data.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#52706F]">Recent Weeks</h3>
            {overview.recentWeeks.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Weekly chapters will appear as more journey moments are logged.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {overview.recentWeeks.map((period) => (
                  <details key={period.id} className="cc-premium-panel-soft rounded-xl p-4" name="recent-weeks">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--cc-ink)]">{period.label}</p>
                        <span className="text-xs text-[var(--cc-ink-faint)]">{period.eventCount} events</span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--cc-ink-faint)]">{rangeLabel(period.startDate, period.endDate)}</p>
                    </summary>

                    <ul className="mt-3 space-y-1 text-sm text-[var(--cc-ink-soft)]">
                      <li>Main focus: {period.mainFocus || "Not enough data"}</li>
                      <li>Biggest win: {period.biggestWin || "Not enough data"}</li>
                      <li>Biggest challenge: {period.biggestChallenge || "Not enough data"}</li>
                      <li>Journey events: {period.eventCount}</li>
                      <li>Talk conversations: {period.conversationCount}</li>
                      <li>
                        Upcoming important event: {period.upcomingImportantEvent ? period.upcomingImportantEvent.title : "None recorded"}
                      </li>
                    </ul>

                    <Link href={`/journey/timeline${query}`} className="mt-3 inline-block text-xs font-semibold text-[#245E5B] hover:underline">
                      Open period in timeline
                    </Link>
                    <Link
                      href={`/journey/story/weekly/${period.id}${query}`}
                      className="ml-4 mt-3 inline-block text-xs font-semibold text-[#345B59] hover:underline"
                    >
                      ✨ View Story
                    </Link>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#52706F]">Recent Months</h3>
            {overview.recentMonths.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Monthly chapters will appear as more journey moments are logged.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {overview.recentMonths.map((period) => (
                  <details key={period.id} className="cc-premium-panel-soft rounded-xl p-4" name="recent-months">
                    <summary className="cursor-pointer list-none">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--cc-ink)]">{period.label}</p>
                        <span className="text-xs text-[var(--cc-ink-faint)]">{period.eventCount} events</span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--cc-ink-faint)]">{rangeLabel(period.startDate, period.endDate)}</p>
                    </summary>

                    <ul className="mt-3 space-y-1 text-sm text-[var(--cc-ink-soft)]">
                      <li>Main focus: {period.mainFocus || "Not enough data"}</li>
                      <li>Biggest win: {period.biggestWin || "Not enough data"}</li>
                      <li>Biggest challenge: {period.biggestChallenge || "Not enough data"}</li>
                      <li>Milestones recorded: {period.milestoneCount}</li>
                      <li>Talk conversations: {period.conversationCount}</li>
                      <li>Therapy-related events: {period.therapyCount}</li>
                    </ul>

                    <Link href={`/journey/timeline${query}`} className="mt-3 inline-block text-xs font-semibold text-[#245E5B] hover:underline">
                      Open period in timeline
                    </Link>
                    <Link
                      href={`/journey/story/monthly/${period.id}${query}`}
                      className="ml-4 mt-3 inline-block text-xs font-semibold text-[#345B59] hover:underline"
                    >
                      ✨ View Story
                    </Link>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-[var(--cc-ink)]">Journey Stories</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link href={`/journey/story/annual${query}`} className="rounded-full bg-white/62 px-3 py-1 font-semibold text-[#345B59] ring-1 ring-white/70">
            Annual Story
          </Link>
          <Link href={`/journey/story/family${query}`} className="rounded-full bg-white/62 px-3 py-1 font-semibold text-[#345B59] ring-1 ring-white/70">
            Family Story
          </Link>
        </div>
        <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">
          Weekly, monthly, annual and family drafts are generated on demand from existing journey facts.
        </p>
      </section>
    </EditorialPage>
  );
}
