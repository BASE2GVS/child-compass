import { redirect } from "next/navigation";

import { getFamilyContext, getProfile, getCheckins } from "@/lib/data/queries";

import { resolveActiveChild } from "@/lib/utils/child-selection";

import CheckInForm from "@/components/app/CheckInForm";



export const dynamic = "force-dynamic";



export default async function CheckInPage({

  searchParams,

}: {

  searchParams: Promise<{ child?: string; first?: string }>;

}) {

  const params = await searchParams;

  const profile = await getProfile();

  if (!profile?.onboarding_completed) redirect("/onboarding");



  const { children } = await getFamilyContext();

  if (children.length === 0) redirect("/onboarding");



  const child = await resolveActiveChild(children, params);

  if (!child) redirect("/onboarding");

  const priorCheckins = await getCheckins(child.id, 1);
  const isFirstCheckin = params.first === "1" || priorCheckins.length === 0;



  return (

    <CheckInForm

      childId={child.id}

      childName={child.nickname || child.first_name}

      familyChildren={children}

      parentName={profile.full_name}

      isFirstCheckin={isFirstCheckin}

    />

  );

}

