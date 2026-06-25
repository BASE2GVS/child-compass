import { redirect } from "next/navigation";
import { addSchoolHubEntry } from "@/lib/actions/ecosystem";
import { getFamilyContext, getProfile, getSchoolHubEntries } from "@/lib/data/queries";
import { schoolHubInsight } from "@/lib/hubs/school-service";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import {
  Button,
  EmptyState,
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

const ENTRY_TYPES = [
  { value: "teacher_guide", label: "Teacher Guide™" },
  { value: "support_plan", label: "Support Plan™" },
  { value: "classroom_strategy", label: "Classroom Strategies" },
  { value: "transition_plan", label: "Transition Plan" },
  { value: "exam_support", label: "Exam Support" },
  { value: "sensory_profile", label: "Sensory Profile" },
  { value: "attendance_summary", label: "Attendance Summary" },
] as const;

export default async function SchoolPage({
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

  const entries = await getSchoolHubEntries(child.id);
  const insight = schoolHubInsight(entries);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Education"
        title="School Hub"
        description={`Collaborative school planning for ${child.nickname || child.first_name} — professional, print-ready documents.`}
        familyChildren={children}
        activeChildId={child.id}
      />

      {insight && (
        <GlassCard padding="sm">
          <p className="text-sm text-[#64748B]">{insight}</p>
        </GlassCard>
      )}

      <PremiumCard>
        <h2 className="text-lg font-bold text-[#0F172A]">Create school document</h2>
        <form action={addSchoolHubEntry} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="childId" value={child.id} />
          <Select name="entryType">
            {ENTRY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Input name="title" required placeholder="Title" />
          <Textarea name="content" required rows={4} placeholder="Professional plan content…" className="sm:col-span-2" />
          <Button type="submit" className="sm:col-span-2">
            Save to School Hub
          </Button>
        </form>
      </PremiumCard>

      {entries.length === 0 ? (
        <EmptyState
          illustration="school"
          title="No school documents yet"
          description="Create support plans, sensory profiles, and transition strategies to share with teachers."
          why="School-friendly documents help everyone support your child consistently."
          actionLabel="Create your first document"
          actionHref={`/school?child=${child.id}`}
          secondaryActionLabel="Open Teacher Guide™"
          secondaryActionHref={`/teacher-guide?child=${child.id}`}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {entries.map((entry) => (
            <GlassCard key={entry.id} padding="sm" className={ds.hoverLift}>
              <StatusBadge label={entry.entry_type.replace("_", " ")} tone="brand" />
              <p className="mt-2 font-bold text-[#0F172A]">{entry.title}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#64748B]">{entry.content}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
