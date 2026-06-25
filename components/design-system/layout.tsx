import type { ReactNode } from "react";
import ChildSwitcher from "@/components/app/ChildSwitcher";
import type { Child } from "@/lib/types/database";
import { ds, space } from "./tokens";

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
    <header className={`flex flex-wrap items-start justify-between gap-6 ${ds.fadeIn}`}>
      <div className="max-w-3xl">
        {eyebrow && <p className={ds.eyebrow}>{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-2" : ""} ${ds.heading}`}>{title}</h1>
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
        <h2 className={`${eyebrow ? "mt-2" : ""} text-2xl font-bold text-[#0F172A]`}>{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{description}</p>}
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
    <section className={space.card}>
      <div>
        <h3 className="text-lg font-bold text-[#0F172A]">{title}</h3>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-[#64748B]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className={`${space.page} pb-8 ${ds.fadeIn}`}>{children}</div>;
}
