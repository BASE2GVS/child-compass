import { Suspense } from "react";
import { CompanionExpandable } from "@/components/companion";
import FormFeedbackBanner from "@/components/forms/FormFeedbackBanner";

import EditorialPage from "@/components/editorial/EditorialPage";

import LibraryReportsSection from "@/components/library/LibraryReportsSection";

import LibraryDocumentsSection from "@/components/library/LibraryDocumentsSection";

import RecentlyShared from "@/components/library/RecentlyShared";

import type { Child, DocumentRecord, GeneratedReport } from "@/lib/types/database";



type FamilyLibraryProps = {

  child: Child;

  familyChildren: Child[];

  familyId: string;

  documents: DocumentRecord[];

  generatedReports: GeneratedReport[];

  parentName?: string | null;

};



export default function FamilyLibrary({

  child,

  familyChildren,

  familyId,

  documents,

  generatedReports,

  parentName,

}: FamilyLibraryProps) {

  const childName = child.nickname || child.first_name;

  const isEmpty = documents.length === 0 && generatedReports.length === 0;



  return (

    <EditorialPage

      variant="documents"

      title="Documents"

      parentName={parentName}

      childName={childName}

      familyChildren={familyChildren}

      activeChildId={child.id}

      primaryAction={
        isEmpty
          ? { label: "Do today's check-in", href: `/check-in?child=${child.id}` }
          : { label: "Share a summary", href: "#featured-summary" }
      }

    >

      <Suspense fallback={null}>
        <FormFeedbackBanner successMessage="✓ Added to your library" />
      </Suspense>

      <LibraryReportsSection

        childId={child.id}

        generatedReports={generatedReports}

        childName={childName}

        isEmpty={isEmpty}

      />



      {!isEmpty && (

        <CompanionExpandable label="What you've saved">

          <RecentlyShared reports={generatedReports} />

          <LibraryDocumentsSection

            documents={documents}

            familyId={familyId}

            childId={child.id}

            childName={childName}

          />

        </CompanionExpandable>

      )}



      {isEmpty && documents.length > 0 && (

        <CompanionExpandable label="Uploaded files">

          <LibraryDocumentsSection

            documents={documents}

            familyId={familyId}

            childId={child.id}

            childName={childName}

          />

        </CompanionExpandable>

      )}

    </EditorialPage>

  );

}


