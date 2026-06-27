import Link from "next/link";
import { redirect } from "next/navigation";
import { getCheckins, getChildIntelligence, getFamilyContext, getFamilyIntelligenceSnapshot, getProfile } from "@/lib/data/queries";
import { buildChildCardSummary } from "@/lib/presentation/child-summary";
import ChildProfileCard from "@/components/children/ChildProfileCard";
import {
  Button,
  EmptyState,
  FormSection,
  Input,
  Label,
  PageHeader,
  PageShell,
  PremiumCard,
} from "@/components/design-system";
import { addChild } from "@/lib/actions/profile";

export const dynamic = "force-dynamic";

export default async function ChildrenPage() {
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { children } = await getFamilyContext();
  const familyIntel = children.length > 1 ? await getFamilyIntelligenceSnapshot() : null;

  const summaries = await Promise.all(
    children.map(async (child) => {
      const [checkins, intelligence] = await Promise.all([
        getCheckins(child.id, 1),
        getChildIntelligence(child.id),
      ]);
      const summary = buildChildCardSummary(
        child.nickname || child.first_name,
        checkins[0] ?? null,
        intelligence,
      );
      return { child, ...summary };
    }),
  );

  return (
    <PageShell>
      <PageHeader
        eyebrow="Family"
        title="Your children"
        description="Beautiful profiles with mood, school readiness, and today's gentle guidance."
        actions={
          <Link
            href={children.length === 1 ? `/check-in?child=${children[0].id}` : "/today"}
            className="rounded-2xl bg-[#14B8A6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(20,184,166,0.28)] hover:bg-[#0D9488]"
          >
            {children.length === 1 ? "Check in" : "Go to Today"}
          </Link>
        }
      />

      {familyIntel && (
        <PremiumCard padding="lg">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Family overview</p>
          <p className="mt-2 text-sm text-[#64748B]">{familyIntel.familyNote}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {familyIntel.children.map((snap) => (
              <div key={snap.childId} className="rounded-2xl bg-[#FAF8F4] px-4 py-3">
                <p className="font-semibold text-[#0F172A]">{snap.childName}</p>
                <p className="mt-1 text-sm text-[#64748B]">{snap.headline}</p>
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {children.length === 0 ? (
        <EmptyState
          illustration="family"
          title="Add your first child"
          description="Child Compass learns from each child's unique profile to offer calm, personalised guidance."
          why="A complete profile helps us understand triggers, strengths, and what works for your family."
          actionLabel="Set up your family"
          actionHref="/onboarding"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {summaries.map(({ child, ...card }) => (
            <ChildProfileCard key={child.id} child={child} {...card} />
          ))}
        </div>
      )}

      <PremiumCard padding="lg">
        <FormSection
          title="Add another child"
          description="Each child gets their own profile, timeline, and AI companion."
        >
          <form action={addChild} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div>
              <Label htmlFor="nickname">Nickname</Label>
              <Input id="nickname" name="nickname" />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" name="gender" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add child</Button>
            </div>
          </form>
        </FormSection>
      </PremiumCard>
    </PageShell>
  );
}
