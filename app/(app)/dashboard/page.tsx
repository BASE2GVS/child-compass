import Link from "next/link";

import {

  getDashboardData,

  getProfile,

  getChildIntelligence,

  getCoachSession,

  getCheckins,

  getGeneratedReports,

} from "@/lib/data/queries";

import { greetingForHour } from "@/lib/ai/debrief-engine";

import DashboardContent from "@/components/dashboard/DashboardContent";

import GuidedTour from "@/components/dashboard/GuidedTour";



export const dynamic = "force-dynamic";



export default async function DashboardPage({

  searchParams,

}: {

  searchParams: Promise<{ child?: string; "first-checkin"?: string }>;

}) {

  const params = await searchParams;

  const profile = await getProfile();

  if (!profile?.onboarding_completed) {

    return (

      <div className="space-y-6">

        <h1 className="text-3xl font-bold text-[#0F172A] lg:text-4xl">Welcome to Child Compass™</h1>

        <div className="rounded-[32px] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">

          <p className="text-lg font-semibold text-[#0F172A]">Your account is ready.</p>

          <p className="mt-2 text-[#64748B]">

            Complete onboarding to create your family and first child before entering the dashboard.

          </p>

          <Link

            href="/onboarding"

            className="mt-5 inline-block rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0D9488]"

          >

            Continue Onboarding

          </Link>

        </div>

      </div>

    );

  }



  const data = await getDashboardData(params);

  const hour = new Date().getHours();

  const greeting = greetingForHour(hour);

  const name = profile?.full_name?.split(" ")[0] || "there";



  if (!data.activeChild) {

    return (

      <div className="space-y-6">

        <h1 className="text-3xl font-bold text-[#0F172A] lg:text-4xl">Dashboard</h1>

        <div className="rounded-[32px] bg-white p-8 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">

          <p className="text-lg font-semibold text-[#0F172A]">No child profile found yet.</p>

          <p className="mt-2 text-[#64748B]">

            Finish onboarding to create your family and first child.

          </p>

          <Link

            href="/onboarding"

            className="mt-5 inline-block rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#0D9488]"

          >

            Continue Onboarding

          </Link>

        </div>

      </div>

    );

  }



  const childName = data.activeChild.nickname || data.activeChild.first_name;



  const [intelligence, coach, weekCheckins, reports] = await Promise.all([

    getChildIntelligence(data.activeChild.id),

    getCoachSession(data.activeChild.id),

    getCheckins(data.activeChild.id, 7),

    getGeneratedReports(data.activeChild.id),

  ]);



  if (!coach.session) {

    return (

      <div className="rounded-[32px] bg-white p-8">

        <p className="text-[#64748B]">Unable to load session. Please refresh.</p>

      </div>

    );

  }



  return (

    <div className="pb-4">

      <DashboardContent

        greeting={greeting}

        parentName={name}

        childName={childName}

        childId={data.activeChild.id}

        familyChildren={data.children}

        headlineInsight={data.headlineInsight}

        recommendation={data.recommendation}

        weeklyTrend={data.weeklyTrend}

        timeline={data.timeline}

        checkin={data.checkin}

        yesterdayCheckin={data.yesterdayCheckin}

        patterns={data.patterns}

        intelligence={intelligence}

        weekCheckins={weekCheckins}

        coachSessionId={coach.session.id}

        coachMessages={coach.messages}

        hasDebrief={data.hasDebrief}

        reports={reports}

        firstCheckinOffer={params["first-checkin"] === "1" && !data.hasDebrief}

        journeyPhase={data.journeyPhase}
      />

      <GuidedTour />

    </div>

  );

}

