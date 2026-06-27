import { redirect } from "next/navigation";
import { getFamilyContext, getGlobalSearchResults, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import SearchExperience from "@/components/experience/SearchExperience";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; child?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, { child: params.child });
  const results = await getGlobalSearchResults(params.q || "", child?.id);
  const query = params.q || "";

  const resultGroups = [
    {
      title: "Children",
      items: results.children.map((item) => ({
        key: item.id,
        label: item.nickname || item.first_name,
        href: `/children/${item.id}`,
      })),
    },
    {
      title: "Reports",
      items: results.reports.map((item) => ({
        key: item.id,
        label: item.title,
        href: `/reports/${item.id}`,
      })),
    },
    {
      title: "Timeline",
      items: results.timeline.map((item) => ({
        key: item.id,
        label: item.title,
        href: `/timeline?child=${item.child_id}`,
      })),
    },
    {
      title: "Documents",
      items: results.documents.map((item) => ({
        key: item.id,
        label: item.title,
        href: "/documents",
      })),
    },
  ];

  return <SearchExperience query={query} childId={child?.id} results={resultGroups} parentName={profile.full_name} />;
}
