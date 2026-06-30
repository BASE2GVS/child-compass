import { redirect } from "next/navigation";
import DailyCompanionHome from "@/components/home/DailyCompanionHome";
import { loadJourneyPageContext } from "@/lib/journey/page-context";

export const dynamic = "force-dynamic";

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; example?: string; reflectionSaved?: string; reflectionError?: string }>;
}) {
  const context = await loadJourneyPageContext(searchParams);
  if (!context.child) redirect("/onboarding");

  const params = await searchParams;
  const reflectionSaved = params.reflectionSaved === "1";
  const reflectionError = params.reflectionError === "1";

  return (
    <div className="pb-4">
      <DailyCompanionHome
        parentName={context.profile.full_name}
        child={context.child}
        familyChildren={context.children}
        entries={context.entries}
        reflectionSaved={reflectionSaved}
        reflectionError={reflectionError}
        exampleFamilyId={context.exampleFamilyId}
        exampleFamilies={context.exampleFamilies}
      />
    </div>
  );
}

