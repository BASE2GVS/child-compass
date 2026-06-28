import { redirect } from "next/navigation";

import {

  getChild,

  getCheckins,

  getChildIntelligence,

  getFamilyContext,

  getInsights,

  getPatterns,

  getProfile,

  getUnifiedTimeline,
  getCompanionInsights,
} from "@/lib/data/queries";

import { resolveActiveChild } from "@/lib/utils/child-selection";

import MyChildContent from "@/components/my-child/MyChildContent";



export const dynamic = "force-dynamic";



export default async function CompassPage({

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



  const [

    { profile: childProfile },

    checkins,

    intelligence,

    insights,

    timeline,

    patterns,

    companionInsights,

  ] = await Promise.all([

    getChild(child.id),

    getCheckins(child.id, 14),

    getChildIntelligence(child.id),

    getInsights(child.id, 5),

    getUnifiedTimeline(child.id, 8),

    getPatterns(child.id),

    getCompanionInsights(child.id),

  ]);



  const today = new Date().toISOString().split("T")[0];

  const checkin = checkins.find((c) => c.checkin_date === today) ?? checkins[0] ?? null;



  return (

    <MyChildContent

      child={child}

      childProfile={childProfile}

      familyChildren={children}

      checkin={checkin}

      checkins={checkins}

      intelligence={intelligence}

      insights={insights}

      patterns={patterns}

      timeline={timeline}
      companionInsights={companionInsights}
      parentName={profile.full_name}

    />

  );

}

