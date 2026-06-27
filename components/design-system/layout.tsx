import type { ReactNode } from "react";
import ChildSwitcher from "@/components/app/ChildSwitcher";
import type { Child } from "@/lib/types/database";
import { ds, space } from "./tokens";
import { typeScale } from "./tokens/typography";
import { layoutSpace } from "./tokens/spacing";
import { motion } from "./tokens/motion";

export function PageHeader({
  eyebrow,
  title,
  description,
  familyChildren,
  activeChildId,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  familyChildren?: Child[];
  activeChildId?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={`flex flex-wrap items-start justify-between gap-6 ${motion.fadeUp}`}>
      <div className="max-w-3xl">
        {eyebrow && <p className={ds.eyebrow}>{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-3" : ""} ${typeScale.title}`}>{title}</h1>
        {description && <p className={ds.subtext}>{description}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        {familyChildren && familyChildren.length > 1 && activeChildId && (
          <ChildSwitcher familyChildren={familyChildren} activeChildId={activeChildId} />
        )}
      </div>
    </header>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className={ds.eyebrow}>{eyebrow}</p>}
        <h2 className={`${eyebrow ? "mt-2" : ""} ${typeScale.heading}`}>{title}</h2>
        {description && <p className={`mt-2 ${typeScale.caption}`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={layoutSpace.card}>
      <div>
        <h3 className={typeScale.cardTitle}>{title}</h3>
        {description && <p className={`mt-1.5 ${typeScale.caption}`}>{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className={`${space.page} pb-8 ${motion.fadeIn}`}>{children}</div>;
}

export function ContentSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${layoutSpace.section} ${className}`}>{children}</section>;
}
