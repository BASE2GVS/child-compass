import { redirect } from "next/navigation";

import {

  getDashboardData,

  getProfile,

  getCoachSession,

  getCheckins,

} from "@/lib/data/queries";

import TodayContent from "@/components/today/TodayContent";

import DashboardBackground from "@/components/dashboard/DashboardBackground";

import { FirstTodayGuide } from "@/components/first-time";



export const dynamic = "force-dynamic";



export default async function TodayPage({

  searchParams,

}: {

  searchParams: Promise<{ child?: string; "first-checkin"?: string }>;

}) {

  const params = await searchParams;

  const profile = await getProfile();



  if (!profile?.onboarding_completed) redirect("/onboarding");



  const data = await getDashboardData(params);

  const name = profile?.full_name?.split(" ")[0] || "there";



  if (!data.activeChild) redirect("/onboarding");



  const childName = data.activeChild.nickname || data.activeChild.first_name;



  const [coach, anyCheckins, weekCheckins] = await Promise.all([

    getCoachSession(data.activeChild.id),

    getCheckins(data.activeChild.id, 1),

    getCheckins(data.activeChild.id, 7),

  ]);



  if (!coach.session) {

    redirect("/today");

  }



  const isBrandNew = anyCheckins.length === 0;



  if (isBrandNew) {

    return (

      <DashboardBackground>

        <FirstTodayGuide parentName={name} childName={childName} childId={data.activeChild.id} />

      </DashboardBackground>

    );

  }



  return (

    <div className="pb-4">

      <TodayContent

        parentName={name}

        childName={childName}

        childId={data.activeChild.id}

        childPhotoUrl={data.activeChild.photo_url}

        familyChildren={data.children}

        headlineInsight={data.headlineInsight}

        recommendation={data.recommendation}

        weeklyTrend={data.weeklyTrend}

        checkin={data.checkin}

        yesterdayCheckin={data.yesterdayCheckin}

        patterns={data.patterns}

        weekCheckins={weekCheckins}

        coachMessages={coach.messages}

        firstCheckinOffer={params["first-checkin"] === "1" && !data.hasDebrief}

      />

    </div>

  );

}

