import StoryReader from "@/components/journey/StoryReader";
import { loadJourneyPageContext, type JourneySearchParams } from "@/lib/journey/page-context";
import { generateAnnualStoryDraft } from "@/lib/journey/story";

export const dynamic = "force-dynamic";

export default async function AnnualStoryDraftPage({
  searchParams,
}: {
  searchParams: Promise<JourneySearchParams>;
}) {
  const context = await loadJourneyPageContext(searchParams);
  const draft = await generateAnnualStoryDraft(context.entries);

  return (
    <StoryReader
      child={context.child}
      familyChildren={context.children}
      parentName={context.profile.full_name}
      draft={draft}
      backHref={`/journey${context.childQuery}`}
    />
  );
}
