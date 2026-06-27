import type { ReactNode } from "react";
import CompanionPrimaryAction from "@/components/companion/Companion";
import CompanionVisitTracker from "@/components/companion/CompanionVisitTracker";
import DashboardBackground from "@/components/dashboard/DashboardBackground";
import EditorialCompanionHeader from "@/components/editorial/EditorialCompanionHeader";
import EditorialPageHero from "@/components/editorial/EditorialPageHero";
import EditorialParchment from "@/components/editorial/EditorialParchment";
import { editorialEnvironments, type EditorialVariant } from "@/components/editorial/environment-variants";
import { getPageAtmosphere } from "@/lib/companion/page-atmosphere";
import type { Child } from "@/lib/types/database";

type EditorialPageProps = {
  variant: EditorialVariant;
  eyebrow?: string;
  title: string;
  description?: string;
  parentName?: string | null;
  childName?: string | null;
  familyChildren?: Child[];
  activeChildId?: string;
  heroCompact?: boolean;
  heroAction?: ReactNode;
  primaryAction?: { label: string; href: string };
  companion?: boolean;
  id?: string;
  children: ReactNode;
  footer?: ReactNode;
  parchmentClassName?: string;
};

/** One title, one purpose, one action — nothing else in the hero */
export default function EditorialPage({
  variant,
  title,
  parentName,
  childName,
  familyChildren,
  activeChildId,
  heroCompact = true,
  heroAction,
  primaryAction,
  companion = true,
  id = "page-hero",
  children,
  footer,
  parchmentClassName,
}: EditorialPageProps) {
  const Environment = editorialEnvironments[variant];
  const atmosphere = getPageAtmosphere(variant, { parentName, childName });

  return (
    <DashboardBackground>
      <CompanionVisitTracker />
      <article className="today-editorial cc-flow-enter w-full pb-8 sm:pb-12">
        <EditorialPageHero
          id={id}
          compact={heroCompact}
          environment={<Environment className="h-full w-full scale-110" />}
        >
          <div className="space-y-4">
            <EditorialCompanionHeader
              id={id}
              variant={variant}
              title={title}
              purpose={atmosphere.purpose}
              parentName={parentName}
              childName={childName}
              companion={companion}
              familyChildren={familyChildren}
              activeChildId={activeChildId}
            />
            {primaryAction ? (
              <CompanionPrimaryAction label={primaryAction.label} href={primaryAction.href} />
            ) : null}
            {heroAction}
          </div>
        </EditorialPageHero>

        <EditorialParchment
          className={
            heroCompact
              ? "-mt-1 rounded-t-[2rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
              : parchmentClassName
          }
        >
          <div className="cc-flow-content cc-framework-rhythm">{children}</div>
        </EditorialParchment>

        {footer}
      </article>
    </DashboardBackground>
  );
}
