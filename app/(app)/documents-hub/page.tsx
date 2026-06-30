import {

  getDocuments,

  getGeneratedReports,

} from "@/lib/data/queries";

import { loadJourneyPageContext, type JourneySearchParams } from "@/lib/journey/page-context";

import FamilyLibrary from "@/components/library/FamilyLibrary";



export const dynamic = "force-dynamic";



export default async function DocumentsHubPage({

  searchParams,

}: {

  searchParams: Promise<JourneySearchParams>;

}) {
  const context = await loadJourneyPageContext(searchParams);

  const [documents, generatedReports] = context.dataSourceMode === "example-family"
    ? [[], []]
    : await Promise.all([
        getDocuments(context.child.id),
        getGeneratedReports(context.child.id),
      ]);



  return (

    <FamilyLibrary

      child={context.child}

      familyChildren={context.children}

      familyId={context.child.family_id}

      documents={documents}

      generatedReports={generatedReports}

      parentName={context.profile.full_name}

      exampleFamilyId={context.exampleFamilyId}

    />

  );

}

