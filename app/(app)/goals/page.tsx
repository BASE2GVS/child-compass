import { redirect } from "next/navigation";
import { addGoal, updateGoalProgress } from "@/lib/actions/ecosystem";
import { getFamilyContext, getGoals, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import EmptyState from "@/components/app/EmptyState";
import {
  Button,
  GlassCard,
  Input,
  PageHeader,
  PageShell,
  PremiumCard,
  ProgressBar,
  Select,
  StatusBadge,
  ds,
} from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function GoalsPage({
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

  const { goals } = await getGoals(child.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Progress"
        title="Goals"
        description="Track progress and celebrate achievements — small wins build confidence."
        familyChildren={children}
        activeChildId={child.id}
      />

      <PremiumCard>
        <h2 className="text-lg font-bold text-[#0F172A]">Create goal</h2>
        <form action={addGoal} className="mt-4 grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="childId" value={child.id} />
          <Input name="title" required placeholder="Goal title" />
          <Select name="category">
            <option value="morning_routine">Morning Routine</option>
            <option value="school_attendance">School Attendance</option>
            <option value="sleeping">Sleeping</option>
            <option value="homework">Homework</option>
            <option value="eating">Eating</option>
            <option value="independence">Independence</option>
            <option value="friendships">Friendships</option>
            <option value="communication">Communication</option>
            <option value="other">Other</option>
          </Select>
          <Input name="targetValue" type="number" defaultValue={5} min={1} />
          <Button type="submit" className="sm:col-span-3">
            Add goal
          </Button>
        </form>
      </PremiumCard>

      <div className="grid gap-5 sm:grid-cols-2">
        {goals.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState
              illustration="goals"
              title="No goals yet"
              description="Goals help you celebrate small wins and notice progress over time."
              why="Child Compass highlights achievements in your weekly review and parent wins."
              actionLabel="Create your first goal"
              actionHref={`/goals?child=${child.id}`}
              secondaryActionLabel="View dashboard"
              secondaryActionHref={`/dashboard?child=${child.id}`}
            />
          </div>
        ) : (
          goals.map((goal) => {
            const pct = goal.target_value ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
            return (
              <GlassCard key={goal.id} padding="sm" className={ds.hoverLift}>
                <StatusBadge label={goal.category.replace("_", " ")} tone="brand" />
                <p className="mt-2 font-bold text-[#0F172A]">{goal.title}</p>
                <div className="mt-4">
                  <ProgressBar label="Progress" value={pct} />
                </div>
                <p className="mt-2 text-xs text-[#94A3B8]">
                  {goal.current_value} / {goal.target_value || 0}
                </p>
                {goal.celebration_note && (
                  <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{goal.celebration_note}</p>
                )}
                <form action={updateGoalProgress} className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="goalId" value={goal.id} />
                  <input type="hidden" name="childId" value={child.id} />
                  <Input name="progressValue" type="number" defaultValue={1} className="w-20" />
                  <Input name="note" placeholder="Note" className="min-w-0 flex-1" />
                  <Button type="submit" variant="secondary">
                    Update
                  </Button>
                </form>
              </GlassCard>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
