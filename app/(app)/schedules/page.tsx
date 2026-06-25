import { redirect } from "next/navigation";
import { addVisualSchedule } from "@/lib/actions/ecosystem";
import { getFamilyContext, getProfile, getVisualSchedules } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import {
  Button,
  GlassCard,
  Input,
  PageHeader,
  PageShell,
  PremiumCard,
  Select,
  StatusBadge,
  Textarea,
  ds,
} from "@/components/design-system";

export const dynamic = "force-dynamic";

export default async function SchedulesPage({
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

  const { schedules, items } = await getVisualSchedules(child.id);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Routines"
        title="Visual Schedules"
        description="Create predictable routines with visual steps — morning, bedtime, transitions, and more."
        familyChildren={children}
        activeChildId={child.id}
      />

      <PremiumCard>
        <form action={addVisualSchedule} className="grid gap-4 sm:grid-cols-2">
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
          <Textarea
            name="steps"
            rows={4}
            placeholder="Steps (one per line)"
            className="sm:col-span-2"
          />
          <Button type="submit" className="sm:col-span-2">
            Save schedule
          </Button>
        </form>
      </PremiumCard>

      <div className="grid gap-5 sm:grid-cols-2">
        {schedules.map((schedule) => {
          const scheduleItems = items.filter((i) => i.schedule_id === schedule.id);
          return (
            <GlassCard key={schedule.id} padding="sm" className={ds.hoverLift}>
              <StatusBadge label={schedule.schedule_type.replace("_", " ")} tone="brand" />
              <p className="mt-2 font-bold text-[#0F172A]">{schedule.title}</p>
              <ol className="mt-4 space-y-2">
                {scheduleItems.map((item, idx) => (
                  <li key={item.id} className="rounded-xl bg-[#FAF8F4] px-4 py-2.5 text-sm text-[#64748B]">
                    {idx + 1}. {item.icon || "🧩"} {item.label}
                  </li>
                ))}
              </ol>
            </GlassCard>
          );
        })}
      </div>
    </PageShell>
  );
}
