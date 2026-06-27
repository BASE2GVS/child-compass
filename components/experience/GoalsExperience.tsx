import Link from "next/link";
import { addGoal, updateGoalProgress } from "@/lib/actions/ecosystem";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import ExperienceHero from "@/components/experience/ExperienceHero";
import {
  Button,
  EmptyState,
  GlassCard,
  Input,
  PremiumCard,
  ProgressBar,
  Select,
  StatusBadge,
  ds,
} from "@/components/design-system";
import type { Child, ChildGoal } from "@/lib/types/database";

type GoalsExperienceProps = {
  child: Child;
  familyChildren: Child[];
  goals: ChildGoal[];
};

export default function GoalsExperience({ child, familyChildren, goals }: GoalsExperienceProps) {
  const childName = child.nickname || child.first_name;

  return (
    <DashboardBackground>
      <div className="mx-auto max-w-6xl space-y-10 pb-8">
        <ExperienceHero
          variant="goals"
          eyebrow="🌱 Growing together"
          title="Goals"
          description={`Celebrate ${childName}'s journey — small steps, big heart. Progress without pressure.`}
          familyChildren={familyChildren}
          activeChildId={child.id}
        />

        <PremiumCard>
          <h2 className="font-display text-lg font-semibold text-[var(--cc-ink)]">Start something new</h2>
          <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">What would feel good to work toward together?</p>
          <form action={addGoal} className="mt-5 grid gap-4 sm:grid-cols-3">
            <input type="hidden" name="childId" value={child.id} />
            <Input name="title" required placeholder="Goal title" className="sm:col-span-3" />
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
            <Input name="targetValue" type="number" defaultValue={5} min={1} aria-label="Target progress" />
            <Button type="submit">Add goal</Button>
          </form>
        </PremiumCard>

        {goals.length === 0 ? (
          <EmptyState
            illustration="goals"
            title="Every journey starts with one step"
            description="Goals help you notice progress and celebrate wins — encouragement, not pressure."
            actionLabel="Add a first goal"
            actionHref={`/goals?child=${child.id}`}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {goals.map((goal) => {
              const pct = goal.target_value ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100)) : 0;
              return (
                <GlassCard key={goal.id} padding="sm" className={ds.hoverLift}>
                  <StatusBadge label={goal.category.replace(/_/g, " ")} tone="brand" />
                  <p className="mt-2 font-semibold text-[var(--cc-ink)]">{goal.title}</p>
                  <div className="mt-4">
                    <ProgressBar label="Your journey" value={pct} />
                  </div>
                  {goal.celebration_note && (
                    <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">🎉 {goal.celebration_note}</p>
                  )}
                  <form action={updateGoalProgress} className="mt-4 flex flex-wrap gap-2">
                    <input type="hidden" name="goalId" value={goal.id} />
                    <input type="hidden" name="childId" value={child.id} />
                    <Input name="progressValue" type="number" defaultValue={1} className="w-20" aria-label="Progress amount" />
                    <Input name="note" placeholder="A note to remember…" className="min-w-0 flex-1" />
                    <Button type="submit" variant="secondary">
                      Celebrate progress
                    </Button>
                  </form>
                </GlassCard>
              );
            })}
          </div>
        )}

        <GlassCard padding="sm" className="text-center text-sm text-[var(--cc-ink-muted)]">
          <Link href={`/today?child=${child.id}`} className="font-semibold text-[var(--cc-teal-deep)] hover:underline">
            Return to Today →
          </Link>
        </GlassCard>
      </div>
    </DashboardBackground>
  );
}
