import { redirect } from "next/navigation";
import StoryReader from "@/components/journey/StoryReader";
import { buildJourneyOverview } from "@/lib/journey/experience";
import { loadJourneyPageContext, type JourneySearchParams } from "@/lib/journey/page-context";
import { generateWeeklyOrMonthlyStoryDraft } from "@/lib/journey/story";

export const dynamic = "force-dynamic";

export default async function WeeklyStoryDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ periodId: string }>;
  searchParams: Promise<JourneySearchParams>;
}) {
  const { periodId } = await params;
  const context = await loadJourneyPageContext(searchParams);

  const childName = context.child.nickname || context.child.first_name;
  const overview = buildJourneyOverview(context.entries, {
    parentName: context.profile.full_name,
    childName,
  });

  const card = overview.recentWeeks.find((week) => week.id === periodId);
  if (!card) {
    redirect(`/journey?child=${context.child.id}`);
  }

  const draft = await generateWeeklyOrMonthlyStoryDraft({
    kind: "weekly",
    card,
  });

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
