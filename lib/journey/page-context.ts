import { redirect } from "next/navigation";
import { getFamilyContext, getProfile } from "@/lib/data/queries";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { loadJourneyEntries, type JourneyDataSourceMode } from "@/lib/journey/data-source";
import { getExampleFamilyById, listExampleFamilies } from "@/lib/example-families/library";

export type JourneySearchParams = { child?: string; example?: string };

export async function loadJourneyPageContext(
  searchParamsPromise: Promise<JourneySearchParams>,
  mode: JourneyDataSourceMode = "real-family",
) {
  const params = await searchParamsPromise;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  if (params.example) {
    const example = getExampleFamilyById(params.example);
    if (!example) redirect("/journey");

    const entries = await loadJourneyEntries({
      mode: "example-family",
      child: example.child,
      exampleFamilyId: example.id,
      limit: 240,
    });

    return {
      profile: { ...profile, full_name: example.parentName || profile.full_name },
      children: [example.child],
      child: example.child,
      entries,
      childQuery: `?child=${example.child.id}&example=${example.id}`,
      dataSourceMode: "example-family" as const,
      exampleFamilyId: example.id,
      exampleFamilies: listExampleFamilies(),
    };
  }

  const { children } = await getFamilyContext();
  const child = await resolveActiveChild(children, params);
  if (!child) redirect("/onboarding");

  const entries = await loadJourneyEntries({ mode, child, limit: 240 });

  return {
    profile,
    children,
    child,
    entries,
    childQuery: `?child=${child.id}`,
    dataSourceMode: "real-family" as const,
    exampleFamilyId: null,
    exampleFamilies: listExampleFamilies(),
  };
}
