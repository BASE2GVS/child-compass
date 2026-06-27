import { redirect } from "next/navigation";

import {

  getDocuments,

  getFamilyContext,

  getGeneratedReports,

  getProfile,

} from "@/lib/data/queries";

import { resolveActiveChild } from "@/lib/utils/child-selection";

import FamilyLibrary from "@/components/library/FamilyLibrary";



export const dynamic = "force-dynamic";



export default async function DocumentsHubPage({

  searchParams,

}: {

  searchParams: Promise<{ child?: string }>;

}) {

  const params = await searchParams;

  const profile = await getProfile();

  if (!profile?.onboarding_completed) redirect("/onboarding");



  const { family, children } = await getFamilyContext();

  const child = await resolveActiveChild(children, params);

  if (!child || !family) redirect("/onboarding");



  const [documents, generatedReports] = await Promise.all([

    getDocuments(child.id),

    getGeneratedReports(child.id),

  ]);



  return (

    <FamilyLibrary

      child={child}

      familyChildren={children}

      familyId={family.id}

      documents={documents}

      generatedReports={generatedReports}

      parentName={profile.full_name}

    />

  );

}

