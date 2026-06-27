"use client";

import ChildSwitcher from "@/components/app/ChildSwitcher";
import CompanionWelcome from "@/components/companion/CompanionWelcome";
import { CompanionPurposeLine } from "@/components/companion/Companion";
import { EditorialTitle } from "@/components/editorial/EditorialSection";
import type { EditorialVariant } from "@/components/editorial/environment-variants";
import type { DayPhase } from "@/lib/companion/daily-rhythm";
import type { Child } from "@/lib/types/database";

type EditorialCompanionHeaderProps = {
  id: string;
  variant: EditorialVariant;
  title: string;
  purpose: string;
  parentName?: string | null;
  childName?: string | null;
  phase?: DayPhase;
  familyChildren?: Child[];
  activeChildId?: string;
  companion?: boolean;
};

export default function EditorialCompanionHeader({
  id,
  variant,
  title,
  purpose,
  parentName,
  childName,
  phase,
  familyChildren,
  activeChildId,
  companion = true,
}: EditorialCompanionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-2">
        <CompanionWelcome
          variant={variant}
          parentName={parentName}
          childName={childName}
          phase={phase}
        />
        <EditorialTitle id={`${id}-heading`}>{title}</EditorialTitle>
        {companion ? <CompanionPurposeLine>{purpose}</CompanionPurposeLine> : null}
      </div>
      {familyChildren && familyChildren.length > 1 && activeChildId && (
        <ChildSwitcher familyChildren={familyChildren} activeChildId={activeChildId} />
      )}
    </div>
  );
}
