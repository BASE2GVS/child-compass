import { redirect } from "next/navigation";

import { getCoachSession, getFamilyContext, getProfile, getCompanionInsights } from "@/lib/data/queries";
import { headlineCompanionInsight } from "@/lib/intelligence/insight-engine";

import { resolveActiveChild } from "@/lib/utils/child-selection";

import CoachChat from "@/components/coach/CoachChat";



export const dynamic = "force-dynamic";



export default async function CoachPage({

  searchParams,

}: {

  searchParams: Promise<{ child?: string; reflect?: string }>;

}) {

  const params = await searchParams;

  const profile = await getProfile();

  if (!profile?.onboarding_completed) redirect("/onboarding");



  const { children } = await getFamilyContext();

  const child = await resolveActiveChild(children, params);

  if (!child) redirect("/onboarding");



  const [{ session, messages }, companionInsights] = await Promise.all([
    getCoachSession(child.id),
    getCompanionInsights(child.id),
  ]);

  if (!session) redirect("/today");

  const openingInsight = headlineCompanionInsight(companionInsights);

  return (
    <CoachChat
      childId={child.id}
      childName={child.nickname || child.first_name}
      parentName={profile.full_name}
      familyChildren={children}
      sessionId={session.id}
      history={messages}
      reflectMode={params.reflect === "1"}
      openingInsight={openingInsight}
    />
  );

}

