import { redirect } from "next/navigation";

import { getCoachSession, getFamilyContext, getProfile } from "@/lib/data/queries";

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



  const { session, messages } = await getCoachSession(child.id);

  if (!session) redirect("/today");



  return (

    <CoachChat

      childId={child.id}

      childName={child.nickname || child.first_name}

      parentName={profile.full_name}

      familyChildren={children}

      sessionId={session.id}

      history={messages}

      reflectMode={params.reflect === "1"}

    />

  );

}

