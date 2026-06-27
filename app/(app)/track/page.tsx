import { redirect } from "next/navigation";

import { getFamilyContext, getProfile, getUnifiedTimeline } from "@/lib/data/queries";

import { resolveActiveChild } from "@/lib/utils/child-selection";

import TrackJournal from "@/components/track/TrackJournal";



export const dynamic = "force-dynamic";



export default async function TrackHubPage({

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



  const events = await getUnifiedTimeline(child.id);



  return <TrackJournal events={events} child={child} familyChildren={children} parentName={profile.full_name} />;

}

