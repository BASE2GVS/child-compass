import Link from "next/link";
import EditorialPage from "@/components/editorial/EditorialPage";
import ExampleFamilySelector from "@/components/example/ExampleFamilySelector";
import { getDayPhase } from "@/lib/companion/daily-rhythm";
import { saveEveningReflection } from "@/lib/actions/companion";
import { buildJourneyOverview, formatJourneyDate } from "@/lib/journey/experience";
import {
  buildHelpfulPreparationNotes,
  buildPreparationDetails,
  collectTodayAhead,
  getMemoryContext,
} from "@/lib/journey/preparation-calendar";
import type { JourneyEntry } from "@/lib/journey/timeline";
import type { Child } from "@/lib/types/database";

type Props = {
  parentName?: string | null;
  child: Child;
  familyChildren: Child[];
  entries: JourneyEntry[];
  reflectionSaved?: boolean;
  reflectionError?: boolean;
  exampleFamilyId?: string | null;
  exampleFamilies?: Array<{ id: string; label: string; childId: string }>;
};

function firstName(name?: string | null): string {
  const value = (name || "").trim();
  return value ? value.split(" ")[0] : "there";
}

function greetingLine(parentName?: string | null): string {
  const phase = getDayPhase();
  const name = firstName(parentName);
  if (phase === "morning") return `Good Morning, ${name}.`;
  if (phase === "evening") return `Good Evening, ${name}.`;
  return `Good Afternoon, ${name}.`;
}

export default function DailyCompanionHome({
  parentName,
  child,
  familyChildren,
  entries,
  reflectionSaved = false,
  reflectionError = false,
  exampleFamilyId = null,
  exampleFamilies = [],
}: Props) {
  const childName = child.nickname || child.first_name;
  const overview = buildJourneyOverview(entries, { parentName, childName });
  const todayAhead = collectTodayAhead(entries);
  const memory = getMemoryContext(entries);
  const notes = buildHelpfulPreparationNotes(entries);
  const query = exampleFamilyId ? `?child=${child.id}&example=${exampleFamilyId}` : `?child=${child.id}`;

  const preparationItems = todayAhead
    .map((entry) => ({ entry, prep: buildPreparationDetails(entry, child, memory) }))
    .filter(({ prep }) => prep.suggestions.length > 0 || prep.checklist.length > 0);

  const shortcuts = [
    { label: "🌱 Journey", href: `/journey${query}` },
    { label: "💬 Talk", href: `/coach${query}` },
    { label: "📅 Calendar", href: `/journey/calendar${query}` },
    { label: "⭐ Milestones", href: `/journey/milestones${query}` },
  ];

  return (
    <EditorialPage
      variant="today"
      title="Home"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={child.id}
    >
      <ExampleFamilySelector items={exampleFamilies} activeExampleId={exampleFamilyId} />

      <section className="rounded-2xl bg-[#F6F1E7] p-6 ring-1 ring-[#E6DFD3]">
        <p className="text-3xl font-display text-[var(--cc-ink)]">{greetingLine(parentName)}</p>
        <p className="mt-2 text-base text-[var(--cc-ink-soft)]">Here&apos;s how {childName}&apos;s day is looking.</p>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Today&apos;s Snapshot</h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--cc-ink-soft)]">{overview.todayJourneySummary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#F6F1E7] px-3 py-1 text-[#345B59]">Tone: {overview.emotionalTone}</span>
          {overview.focusAreas.slice(0, 3).map((focus) => (
            <span key={focus} className="rounded-full bg-[#EAF3FF] px-3 py-1 text-[#274C77]">
              Focus: {focus}
            </span>
          ))}
        </div>
        {overview.recentChallenges[0] ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-faint)]">Needs attention: {overview.recentChallenges[0].title}</p>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Today Ahead</h2>
        {todayAhead.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">No events are visible for today from your current journey data.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {todayAhead.map((entry) => (
              <li key={entry.id} className="rounded-xl bg-[#FAF8F4] p-3">
                <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{entry.summary}</p>
                <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">{formatJourneyDate(entry.date)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {preparationItems.length > 0 ? (
        <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
          <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Preparation</h2>
          <div className="mt-4 space-y-3">
            {preparationItems.map(({ entry, prep }) => (
              <article key={entry.id} className="rounded-xl bg-[#FAF8F4] p-3">
                <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                {prep.suggestions.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-[#345B59]">
                    {prep.suggestions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                ) : null}
                {prep.checklist.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-[var(--cc-ink-soft)]">
                    {prep.checklist.map((item) => (
                      <li key={item}>□ {item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Recent Wins</h2>
        {overview.recentWins.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Positive moments will appear here as they are recorded.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {overview.recentWins.slice(0, 4).map((entry) => (
              <li key={entry.id} className="rounded-lg bg-[#FAF8F4] px-3 py-2 text-sm text-[var(--cc-ink-soft)]">
                <span className="font-semibold text-[var(--cc-ink)]">✓ {entry.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl bg-[#F6F1E7] p-5 ring-1 ring-[#E6DFD3]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Gentle Insight</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--cc-ink-soft)]">{notes[0] || overview.helpfulInsights[0]}</p>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Continue Your Journey</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <Link key={item.label} href={item.href} className="rounded-xl bg-[#FAF8F4] px-4 py-3 text-sm font-semibold text-[var(--cc-ink)] ring-1 ring-[#E6DFD3] hover:bg-[#F6F1E7]">
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3] shadow-[0_2px_14px_rgba(45,42,38,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Evening Reflection</h2>
        <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">How did today go with {childName}?</p>
        <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">
          A quick reflection helps Child Compass understand your family&apos;s journey over time.
        </p>

        {reflectionSaved ? (
          <p className="mt-3 rounded-lg bg-[#F6F1E7] px-3 py-2 text-xs text-[#345B59]">Reflection saved to your journey.</p>
        ) : null}
        {reflectionError ? (
          <p className="mt-3 rounded-lg bg-[#FFF3F3] px-3 py-2 text-xs text-[#8A1F1F]">We could not save that reflection. Please try again.</p>
        ) : null}

        <form action={saveEveningReflection} className="mt-4 space-y-3">
          <input type="hidden" name="childId" value={child.id} />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              name="response"
              value="better"
              className="rounded-full bg-[#EAF3FF] px-4 py-2 text-xs font-semibold text-[#274C77]"
            >
              Better than expected
            </button>
            <button
              type="submit"
              name="response"
              value="same"
              className="rounded-full bg-[#F6F1E7] px-4 py-2 text-xs font-semibold text-[#345B59]"
            >
              About the same
            </button>
            <button
              type="submit"
              name="response"
              value="harder"
              className="rounded-full bg-[#FFF3F3] px-4 py-2 text-xs font-semibold text-[#8A1F1F]"
            >
              More difficult than expected
            </button>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-[#52706F]" htmlFor="reflection-note">
            Optional note
          </label>
          <textarea
            id="reflection-note"
            name="note"
            maxLength={240}
            rows={3}
            placeholder="Add a short reflection (optional)"
            className="w-full rounded-xl border border-[#D8D2C8] bg-[#FAF8F4] px-3 py-2 text-sm text-[var(--cc-ink-soft)]"
          />
          <p className="text-xs text-[var(--cc-ink-faint)]">Takes less than 30 seconds and is completely optional.</p>
        </form>
      </section>

      <section className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-[#E6DFD3]">
        <h2 className="text-base font-semibold text-[var(--cc-ink)]">Companion Stories (Coming Later)</h2>
        <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">
          Morning Brief, Evening Reflection, Weekly Story, Monthly Story and Family Story modules will appear here in future stages.
        </p>
      </section>
    </EditorialPage>
  );
}
