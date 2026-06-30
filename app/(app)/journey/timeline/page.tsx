import JourneyTimelineExperience from "@/components/timeline/JourneyTimelineExperience";
import { loadJourneyPageContext, type JourneySearchParams } from "@/lib/journey/page-context";

export const dynamic = "force-dynamic";

export default async function JourneyTimelinePage({
  searchParams,
}: {
  searchParams: Promise<JourneySearchParams>;
}) {
  const context = await loadJourneyPageContext(searchParams);

  return (
    <JourneyTimelineExperience
      child={context.child}
      familyChildren={context.children}
      entries={context.entries}
      parentName={context.profile.full_name}
      exampleFamilyId={context.exampleFamilyId}
    />
  );
}
