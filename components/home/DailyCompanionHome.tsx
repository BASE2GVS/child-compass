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

      <section className="cc-premium-panel rounded-2xl p-6">
        <p className="text-3xl font-display text-[var(--cc-ink)]">{greetingLine(parentName)}</p>
        <p className="mt-2 text-base text-[var(--cc-ink-soft)]">Here&apos;s how {childName}&apos;s day is looking.</p>
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Today&apos;s Snapshot</h2>
        <p className="mt-3 text-base leading-relaxed text-[var(--cc-ink-soft)]">{overview.todayJourneySummary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/62 px-3 py-1 text-[#345B59] ring-1 ring-white/72">Tone: {overview.emotionalTone}</span>
          {overview.focusAreas.slice(0, 3).map((focus) => (
            <span key={focus} className="rounded-full bg-white/56 px-3 py-1 text-[#274C77] ring-1 ring-white/68">
              Focus: {focus}
            </span>
          ))}
        </div>
        {overview.recentChallenges[0] ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-faint)]">Needs attention: {overview.recentChallenges[0].title}</p>
        ) : null}
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Today Ahead</h2>
        {todayAhead.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">No events are visible for today from your current journey data.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {todayAhead.map((entry) => (
              <li key={entry.id} className="cc-premium-panel-soft rounded-xl p-3">
                <p className="text-sm font-semibold text-[var(--cc-ink)]">{entry.title}</p>
                <p className="mt-1 text-sm text-[var(--cc-ink-soft)]">{entry.summary}</p>
                <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">{formatJourneyDate(entry.date)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {preparationItems.length > 0 ? (
        <section className="cc-premium-panel mt-8 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Preparation</h2>
          <div className="mt-4 space-y-3">
            {preparationItems.map(({ entry, prep }) => (
              <article key={entry.id} className="cc-premium-panel-soft rounded-xl p-3">
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

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Recent Wins</h2>
        {overview.recentWins.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--cc-ink-soft)]">Positive moments will appear here as they are recorded.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {overview.recentWins.slice(0, 4).map((entry) => (
              <li key={entry.id} className="cc-premium-panel-soft rounded-lg px-3 py-2 text-sm text-[var(--cc-ink-soft)]">
                <span className="font-semibold text-[var(--cc-ink)]">✓ {entry.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Gentle Insight</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--cc-ink-soft)]">{notes[0] || overview.helpfulInsights[0]}</p>
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Continue Your Journey</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((item) => (
            <Link key={item.label} href={item.href} className="cc-premium-panel-soft rounded-xl px-4 py-3 text-sm font-semibold text-[var(--cc-ink)] hover:bg-white/72">
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-[var(--cc-ink)]">Evening Reflection</h2>
        <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">How did today go with {childName}?</p>
        <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">
          A quick reflection helps Child Compass understand your family&apos;s journey over time.
        </p>

        {reflectionSaved ? (
          <p className="cc-premium-panel-soft mt-3 rounded-lg px-3 py-2 text-xs text-[#345B59]">Reflection saved to your journey.</p>
        ) : null}
        {reflectionError ? (
          <p className="mt-3 rounded-lg border border-white/56 bg-[#FFF3F3]/72 px-3 py-2 text-xs text-[#8A1F1F] backdrop-blur-sm">We could not save that reflection. Please try again.</p>
        ) : null}

        <form action={saveEveningReflection} className="mt-4 space-y-3">
          <input type="hidden" name="childId" value={child.id} />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              name="response"
              value="better"
              className="rounded-full border border-white/66 bg-white/58 px-4 py-2 text-xs font-semibold text-[#274C77] backdrop-blur-sm"
            >
              Better than expected
            </button>
            <button
              type="submit"
              name="response"
              value="same"
              className="rounded-full border border-white/66 bg-white/56 px-4 py-2 text-xs font-semibold text-[#345B59] backdrop-blur-sm"
            >
              About the same
            </button>
            <button
              type="submit"
              name="response"
              value="harder"
              className="rounded-full border border-white/66 bg-[#FFF3F3]/74 px-4 py-2 text-xs font-semibold text-[#8A1F1F] backdrop-blur-sm"
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
            className="w-full rounded-xl border border-white/66 bg-white/62 px-3 py-2 text-sm text-[var(--cc-ink-soft)] backdrop-blur-sm"
          />
          <p className="text-xs text-[var(--cc-ink-faint)]">Takes less than 30 seconds and is completely optional.</p>
        </form>
      </section>

      <section className="cc-premium-panel mt-8 rounded-2xl p-5">
        <h2 className="text-base font-semibold text-[var(--cc-ink)]">Companion Stories (Coming Later)</h2>
        <p className="mt-2 text-sm text-[var(--cc-ink-soft)]">
          Morning Brief, Evening Reflection, Weekly Story, Monthly Story and Family Story modules will appear here in future stages.
        </p>
      </section>
    </EditorialPage>
  );
}
