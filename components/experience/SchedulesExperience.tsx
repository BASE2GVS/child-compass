import { addVisualSchedule } from "@/lib/actions/ecosystem";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import ExperienceHero from "@/components/experience/ExperienceHero";
import {
  Button,
  EmptyState,
  GlassCard,
  Input,
  PremiumCard,
  Select,
  StatusBadge,
  Textarea,
  ds,
} from "@/components/design-system";
import type { Child, VisualSchedule, VisualScheduleItem } from "@/lib/types/database";

const SCHEDULE_PHASES = [
  { type: "morning", label: "Morning", emoji: "☀️" },
  { type: "after_school", label: "School", emoji: "🏫" },
  { type: "bedtime", label: "Evening", emoji: "🌙" },
] as const;

type SchedulesExperienceProps = {
  child: Child;
  familyChildren: Child[];
  schedules: VisualSchedule[];
  items: VisualScheduleItem[];
};

export default function SchedulesExperience({ child, familyChildren, schedules, items }: SchedulesExperienceProps) {
  const childName = child.nickname || child.first_name;

  const byPhase = SCHEDULE_PHASES.map((phase) => ({
    ...phase,
    schedules: schedules.filter((s) => s.schedule_type === phase.type),
  }));

  return (
    <DashboardBackground>
      <div className="mx-auto max-w-6xl space-y-10 pb-8">
        <ExperienceHero
          variant="schedule"
          eyebrow="🌅 Your day, visualised"
          title="Schedules"
          description={`Morning, school, and evening — predictable steps that help ${childName} feel safe.`}
          familyChildren={familyChildren}
          activeChildId={child.id}
        />

        <PremiumCard>
          <h2 className="font-display text-lg font-semibold text-[var(--cc-ink)]">Create a schedule</h2>
          <form action={addVisualSchedule} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="childId" value={child.id} />
            <Input name="title" required placeholder="Schedule title" />
            <Select name="scheduleType">
              <option value="morning">Morning Routine</option>
              <option value="after_school">After School</option>
              <option value="bedtime">Bedtime</option>
              <option value="shopping">Shopping</option>
              <option value="travel">Travel</option>
              <option value="appointments">Appointments</option>
              <option value="custom">Custom</option>
            </Select>
            <Textarea name="steps" rows={4} placeholder="Steps (one per line)" className="sm:col-span-2" />
            <Button type="submit" className="sm:col-span-2">
              Save schedule
            </Button>
          </form>
        </PremiumCard>

        {schedules.length === 0 ? (
          <EmptyState
            illustration="habits"
            title="Visual steps, calmer days"
            description={`Visual schedules help ${childName} with mornings, bedtime, and transitions.`}
            why="Predictability reduces anxiety — one step at a time."
            actionLabel="Create your first schedule"
            actionHref={`/schedules?child=${child.id}`}
          />
        ) : (
          <div className="space-y-10">
            {byPhase.map(
              (phase) =>
                phase.schedules.length > 0 && (
                  <section key={phase.type}>
                    <h2 className="mb-4 font-display text-xl font-semibold text-[var(--cc-ink)]">
                      {phase.emoji} {phase.label}
                    </h2>
                    <div className="relative space-y-5 pl-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-[var(--cc-teal)]/20">
                      {phase.schedules.map((schedule) => {
                        const scheduleItems = items.filter((i) => i.schedule_id === schedule.id);
                        return (
                          <GlassCard key={schedule.id} padding="sm" className={`relative ${ds.hoverLift}`}>
                            <span className="absolute -left-6 top-6 h-3 w-3 rounded-full bg-[var(--cc-teal)]/50 ring-4 ring-[#FAF8F4]" aria-hidden />
                            <StatusBadge label={schedule.schedule_type.replace(/_/g, " ")} tone="brand" />
                            <p className="mt-2 font-semibold text-[var(--cc-ink)]">{schedule.title}</p>
                            <ol className="mt-4 space-y-2">
                              {scheduleItems.map((item, idx) => (
                                <li key={item.id} className="rounded-2xl bg-[#FAF8F4] px-4 py-3 text-sm text-[var(--cc-ink-muted)]">
                                  {idx + 1}. {item.icon || "🧩"} {item.label}
                                </li>
                              ))}
                            </ol>
                          </GlassCard>
                        );
                      })}
                    </div>
                  </section>
                ),
            )}

            {schedules.filter((s) => !["morning", "after_school", "bedtime"].includes(s.schedule_type)).length > 0 && (
              <section>
                <h2 className="mb-4 font-display text-xl font-semibold text-[var(--cc-ink)]">Other routines</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {schedules
                    .filter((s) => !["morning", "after_school", "bedtime"].includes(s.schedule_type))
                    .map((schedule) => {
                      const scheduleItems = items.filter((i) => i.schedule_id === schedule.id);
                      return (
                        <GlassCard key={schedule.id} padding="sm" className={ds.hoverLift}>
                          <StatusBadge label={schedule.schedule_type.replace(/_/g, " ")} tone="brand" />
                          <p className="mt-2 font-semibold text-[var(--cc-ink)]">{schedule.title}</p>
                          <ol className="mt-4 space-y-2">
                            {scheduleItems.map((item, idx) => (
                              <li key={item.id} className="rounded-2xl bg-[#FAF8F4] px-4 py-2.5 text-sm text-[var(--cc-ink-muted)]">
                                {idx + 1}. {item.icon || "🧩"} {item.label}
                              </li>
                            ))}
                          </ol>
                        </GlassCard>
                      );
                    })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardBackground>
  );
}
