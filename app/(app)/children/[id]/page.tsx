import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getCheckins,
  getChild,
  getChildIntelligence,
  getInsights,
  getProfile,
  getUnifiedTimeline,
} from "@/lib/data/queries";
import { buildChildCardSummary } from "@/lib/presentation/child-summary";
import { groupTimelineByDay } from "@/lib/dashboard/briefing";
import ChildProfileEditor from "@/components/profile/ChildProfileEditor";
import {
  AIInsightCard,
  GlassCard,
  PageHeader,
  PageShell,
  PremiumCard,
  ProgressRing,
  SectionHeader,
  StatusBadge,
  TimelineCard,
  ds,
} from "@/components/design-system";

export const dynamic = "force-dynamic";

function TagList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-[#94A3B8]">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-xl bg-[#FAF8F4] px-3 py-1.5 text-sm text-[#64748B]">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ChildProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { child, profile: childProfile } = await getChild(id);
  if (!child) notFound();

  const [checkins, intelligence, timeline, insights] = await Promise.all([
    getCheckins(id, 1),
    getChildIntelligence(id),
    getUnifiedTimeline(id, 6),
    getInsights(id, 3),
  ]);

  const displayName = child.nickname || child.first_name;
  const summary = buildChildCardSummary(displayName, checkins[0] ?? null, intelligence);
  const groupedTimeline = groupTimelineByDay(timeline);
  const isEditing = edit === "true";

  if (isEditing) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Profile"
          title={`Edit ${displayName}'s profile`}
          description="Keep information up to date for better AI guidance."
          actions={
            <Link href={`/children/${id}`} className={ds.btnSecondary}>
              Cancel
            </Link>
          }
        />
        <ChildProfileEditor child={child} profile={childProfile} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className={`${ds.glass} overflow-hidden`}>
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#14B8A6]/30 p-8 lg:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/10 text-4xl font-bold text-white backdrop-blur-sm">
                  {child.first_name.charAt(0)}
                </div>
                <span className="absolute -bottom-2 -right-2 text-3xl" aria-hidden="true">
                  {summary.moodEmoji}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Child profile</p>
                <h1 className="mt-1 text-3xl font-bold text-white lg:text-4xl">{displayName}</h1>
                <p className="mt-1 text-white/70">{child.school || "School not set"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label={summary.moodLabel} tone="brand" />
                  {child.diagnosis?.map((d) => (
                    <StatusBadge key={d} label={d} tone="neutral" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/check-in?child=${id}`} className={ds.btnPrimary}>
                Check-In
              </Link>
              <Link href={`/coach?child=${id}&reflect=1`} className={ds.btnSecondary}>
                Reflect
              </Link>
              <Link href={`/children/${id}?edit=true`} className={ds.btnSecondary}>
                Edit
              </Link>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80">{summary.aiSummary}</p>
        </div>
        <div className="grid gap-6 p-8 sm:grid-cols-3">
          <ProgressRing label="School readiness" value={summary.schoolReadiness} />
          <GlassCard padding="sm" className="sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Today&apos;s recommendation</p>
            <p className="mt-2 text-sm leading-relaxed text-[#0F172A]">{summary.todayRecommendation}</p>
          </GlassCard>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumCard>
          <SectionHeader eyebrow="Strengths" title="What shines" />
          <TagList items={childProfile?.strengths || []} empty="Add strengths in edit mode" />
        </PremiumCard>
        <PremiumCard>
          <SectionHeader eyebrow="Triggers" title="Known triggers" />
          <TagList items={childProfile?.known_triggers || []} empty="Triggers help Child Compass predict difficult moments" />
        </PremiumCard>
        <PremiumCard>
          <SectionHeader eyebrow="Sensory" title="Sensory profile" />
          <TagList
            items={[...(childProfile?.calming_strategies || []), ...(child.support_needs || [])]}
            empty="Sensory needs and calming strategies appear here"
          />
        </PremiumCard>
        <PremiumCard>
          <SectionHeader eyebrow="Communication" title="How to connect" />
          <TagList
            items={childProfile?.successful_strategies || []}
            empty="Successful strategies guide debrief and coach responses"
          />
        </PremiumCard>
        <PremiumCard>
          <SectionHeader eyebrow="Support team" title="School & care" />
          <TagList items={child.school ? [child.school] : []} empty="Add school information in edit mode" />
        </PremiumCard>
        <PremiumCard>
          <SectionHeader eyebrow="Medical" title="Health notes" />
          {childProfile?.medical_history || childProfile?.medication?.length ? (
            <div className="space-y-2 text-sm text-[#64748B]">
              {childProfile.medical_history && <p>{childProfile.medical_history}</p>}
              {childProfile.medication?.map((m) => (
                <p key={m}>• {m}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#94A3B8]">Medical information is optional and private to your family</p>
          )}
        </PremiumCard>
      </div>

      {insights.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="AI"
            title="Recent observations"
            description="Patterns Child Compass has noticed from your family's journey"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <AIInsightCard
                key={insight.id}
                title={insight.title}
                content={insight.content}
                confidence={insight.confidence ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {groupedTimeline.length > 0 && (
        <section>
          <SectionHeader
            title="Timeline"
            action={
              <Link href={`/timeline?child=${id}`} className="text-sm font-semibold text-[#14B8A6] hover:text-[#0D9488]">
                View full story →
              </Link>
            }
          />
          <div className="space-y-6">
            {groupedTimeline.slice(0, 1).map(({ day, events }) => (
              <div key={day}>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#94A3B8]">{day}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {events.map((event) => (
                    <TimelineCard
                      key={event.id}
                      emoji={event.emoji}
                      label={event.label}
                      summary={event.summary}
                      time={new Date(event.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      bg={event.bg}
                      border={event.border}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
