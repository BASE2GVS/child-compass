import { redirect } from "next/navigation";
import { addTherapySession } from "@/lib/actions/ecosystem";
import { therapyInsight } from "@/lib/hubs/therapy-service";
import { getFamilyContext, getProfile, getTherapySessions } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import {
  Button,
  EmptyState,
  GlassCard,
  Input,
  PageHeader,
  PageShell,
  PremiumCard,
  StatusBadge,
  Textarea,
  ds,
} from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function TherapyPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const sessions = await getTherapySessions(child.id);
  const insight = therapyInsight(sessions);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Support"
        title="Therapist Hub"
        description="Secure session notes and recommendations — share context with your child's therapy team."
        familyChildren={children}
        activeChildId={child.id}
      />

      {insight && (
        <GlassCard padding="sm">
          <p className="text-sm text-[#64748B]">{insight}</p>
        </GlassCard>
      )}

      <PremiumCard>
        <h2 className="text-lg font-bold text-[#0F172A]">Add therapy session</h2>
        <form action={addTherapySession} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="childId" value={child.id} />
          <Input name="therapistName" placeholder="Therapist name" />
          <Input name="sessionDate" type="date" />
          <Textarea name="notes" rows={3} placeholder="Session notes" className="sm:col-span-2" />
          <Textarea name="recommendations" rows={2} placeholder="Recommendations (one per line)" />
          <Textarea name="goals" rows={2} placeholder="Goals (one per line)" />
          <Textarea name="exercises" rows={2} placeholder="Exercises (one per line)" className="sm:col-span-2" />
          <Textarea name="progress" rows={2} placeholder="Progress summary" className="sm:col-span-2" />
          <Button type="submit" className="sm:col-span-2">
            Save session
          </Button>
        </form>
      </PremiumCard>

      {sessions.length === 0 ? (
        <EmptyState
          illustration="therapy"
          title="No therapy sessions yet"
          description="Record session notes, goals, and exercises to build a complete therapy history."
          why="Therapy notes help Child Compass understand what strategies work between appointments."
          actionLabel="Add your first session"
          actionHref={`/therapy?child=${child.id}`}
          secondaryActionLabel="View child profile"
          secondaryActionHref={`/children/${child.id}`}
        />
      ) : (
        <div className="space-y-5">
          {sessions.map((session) => (
            <GlassCard key={session.id} padding="sm" className={ds.hoverLift}>
              <StatusBadge label={session.session_date} tone="brand" />
              <p className="mt-2 font-bold text-[#0F172A]">{session.therapist_name || "Therapy session"}</p>
              {session.notes && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#64748B]">{session.notes}</p>}
              <div className="mt-4 grid gap-2 text-xs text-[#94A3B8] sm:grid-cols-3">
                <p>Recommendations: {session.recommendations.length}</p>
                <p>Goals: {session.goals.length}</p>
                <p>Exercises: {session.exercises.length}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
