import { redirect } from "next/navigation";
import { getProfile, getResourceLibrary } from "@/lib/data/queries";
import ResourceLibraryExperience from "@/components/experience/ResourceLibraryExperience";

export const dynamic = "force-dynamic";

export default async function ResourceLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const resources = await getResourceLibrary(params.q);

  return <ResourceLibraryExperience resources={resources} query={params.q || ""} />;
}
