import Link from "next/link";
import { addHabit, toggleHabit } from "@/lib/actions/ecosystem";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import ExperienceHero from "@/components/experience/ExperienceHero";
import {
  Button,
  EmptyState,
  GlassCard,
  Input,
  PremiumCard,
  ProgressBar,
  ds,
} from "@/components/design-system";
import type { Child, Habit, HabitEntry } from "@/lib/types/database";

type HabitsExperienceProps = {
  child: Child;
  familyChildren: Child[];
  habits: Habit[];
  entries: HabitEntry[];
  today: string;
};

export default function HabitsExperience({ child, familyChildren, habits, entries, today }: HabitsExperienceProps) {
  const childName = child.nickname || child.first_name;

  return (
    <DashboardBackground>
      <div className="mx-auto max-w-6xl space-y-10 pb-8">
        <ExperienceHero
          variant="habits"
          eyebrow="☀️ Daily rhythms"
          title="Habits"
          description={`Friendly routines for ${childName} — brush teeth, get dressed, calm moments. Celebrate every small step.`}
          familyChildren={familyChildren}
          activeChildId={child.id}
        />

        <PremiumCard>
          <h2 className="font-display text-lg font-semibold text-[var(--cc-ink)]">Add a routine</h2>
          <form action={addHabit} className="mt-4 grid gap-4 sm:grid-cols-3">
            <input type="hidden" name="childId" value={child.id} />
            <Input name="title" required placeholder="Habit (e.g. Brush teeth)" className="sm:col-span-2" />
            <Input name="icon" placeholder="🪥" aria-label="Icon emoji" />
            <Button type="submit" className="sm:col-span-3">
              Add habit
            </Button>
          </form>
        </PremiumCard>

        {habits.length === 0 ? (
          <EmptyState
            illustration="habits"
            title="Routines grow with patience"
            description="Small daily habits build confidence — brushing teeth, getting dressed, or calming routines."
            why="Tracking helps you celebrate consistency and spot what supports your child."
            actionLabel="Add your first habit"
            actionHref={`/habits?child=${child.id}`}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {habits.map((habit) => {
              const completed = entries.some((e) => e.habit_id === habit.id && e.entry_date === today && e.completed);
              const weekly = entries.filter((e) => e.habit_id === habit.id).slice(0, 7);
              const weeklyPct = weekly.length ? Math.round((weekly.filter((e) => e.completed).length / weekly.length) * 100) : 0;

              return (
                <GlassCard key={habit.id} padding="sm" className={`${ds.hoverLift} min-h-[200px]`}>
                  <p className="text-4xl">{habit.icon || "✅"}</p>
                  <p className="mt-3 font-semibold text-[var(--cc-ink)]">{habit.title}</p>
                  <div className="mt-4">
                    <ProgressBar label="This week" value={weeklyPct} />
                  </div>
                  <form action={toggleHabit} className="mt-5">
                    <input type="hidden" name="habitId" value={habit.id} />
                    <input type="hidden" name="childId" value={child.id} />
                    <input type="hidden" name="entryDate" value={today} />
                    <input type="hidden" name="completed" value={completed ? "false" : "true"} />
                    <Button
                      type="submit"
                      variant={completed ? "secondary" : "primary"}
                      className={`w-full rounded-full ${completed ? "bg-emerald-50 text-emerald-700" : ""}`}
                    >
                      {completed ? "Done today ✓" : "Mark complete"}
                    </Button>
                  </form>
                </GlassCard>
              );
            })}
          </div>
        )}

        <GlassCard padding="sm" className="text-center">
          <Link href={`/check-in?child=${child.id}`} className="text-sm font-semibold text-[var(--cc-teal-deep)] hover:underline">
            Today&apos;s check-in →
          </Link>
        </GlassCard>
      </div>
    </DashboardBackground>
  );
}
