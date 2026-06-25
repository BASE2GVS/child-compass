import { redirect } from "next/navigation";
import { addHabit, toggleHabit } from "@/lib/actions/ecosystem";
import { getFamilyContext, getHabits, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import {
  Button,
  EmptyState,
  GlassCard,
  Input,
  PageHeader,
  PageShell,
  PremiumCard,
  ProgressBar,
  ds,
} from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function HabitsPage({
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

  const { habits, entries } = await getHabits(child.id);
  const today = new Date().toISOString().split("T")[0];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Daily"
        title="Habit Tracker"
        description="Build consistency with visual daily habits — celebrate every small step."
        familyChildren={children}
        activeChildId={child.id}
      />

      <PremiumCard>
        <form action={addHabit} className="grid gap-4 sm:grid-cols-3">
          <input type="hidden" name="childId" value={child.id} />
          <Input name="title" required placeholder="Habit (e.g. Brush Teeth)" />
          <Input name="icon" placeholder="Icon (e.g. 🪥)" />
          <Button type="submit">Add habit</Button>
        </form>
      </PremiumCard>

      {habits.length === 0 ? (
        <EmptyState
          illustration="habits"
          title="No habits yet"
          description="Small daily habits build confidence — brushing teeth, getting dressed, or calming routines."
          why="Tracking habits helps you celebrate consistency and spot what supports your child."
          actionLabel="Add your first habit"
          actionHref={`/habits?child=${child.id}`}
          secondaryActionLabel="Start today's check-in"
          secondaryActionHref={`/check-in?child=${child.id}`}
        />
      ) : (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => {
          const completed = entries.some((e) => e.habit_id === habit.id && e.entry_date === today && e.completed);
          const weekly = entries.filter((e) => e.habit_id === habit.id).slice(0, 7);
          const weeklyPct = weekly.length ? Math.round((weekly.filter((e) => e.completed).length / weekly.length) * 100) : 0;

          return (
            <GlassCard key={habit.id} padding="sm" className={ds.hoverLift}>
              <p className="text-3xl">{habit.icon || "✅"}</p>
              <p className="mt-2 font-bold text-[#0F172A]">{habit.title}</p>
              <div className="mt-4">
                <ProgressBar label="Weekly completion" value={weeklyPct} />
              </div>
              <form action={toggleHabit} className="mt-4">
                <input type="hidden" name="habitId" value={habit.id} />
                <input type="hidden" name="childId" value={child.id} />
                <input type="hidden" name="entryDate" value={today} />
                <input type="hidden" name="completed" value={completed ? "false" : "true"} />
                <Button
                  type="submit"
                  variant={completed ? "secondary" : "primary"}
                  className={`w-full ${completed ? "bg-emerald-50 text-emerald-700" : ""}`}
                >
                  {completed ? "Completed today ✓" : "Mark complete"}
                </Button>
              </form>
            </GlassCard>
          );
        })}
      </div>
      )}
    </PageShell>
  );
}
