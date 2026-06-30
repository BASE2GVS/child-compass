import JourneyOverviewExperience from "@/components/journey/JourneyOverviewExperience";
import { loadJourneyPageContext, type JourneySearchParams } from "@/lib/journey/page-context";

export const dynamic = "force-dynamic";

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<JourneySearchParams>;
}) {
  const context = await loadJourneyPageContext(searchParams);

  return (
    <JourneyOverviewExperience
      child={context.child}
      familyChildren={context.children}
      entries={context.entries}
      parentName={context.profile.full_name}
      exampleFamilyId={context.exampleFamilyId}
      exampleFamilies={context.exampleFamilies}
    />
  );
}
