import type { ReactNode } from "react";

import { typeScale } from "@/components/design-system/tokens/typography";

export function EditorialRule() {
  return <div className="cc-editorial-rule my-10 lg:my-12" aria-hidden />;
}

export function EditorialEyebrow({ children }: { children: ReactNode }) {
  return <p className={typeScale.eyebrow}>{children}</p>;
}

export function EditorialTitle({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <h1
      id={id}
      className="font-display text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight text-[var(--cc-ink)]"
    >
      {children}
    </h1>
  );
}

export function EditorialLead({ children }: { children: ReactNode }) {
  return <p className={typeScale.bodyLarge}>{children}</p>;
}

export function EditorialHeading({
  id,
  children,
  subtitle,
}: {
  id?: string;
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 id={id} className={typeScale.heading}>
        {children}
      </h2>
      {subtitle && <p className={`mt-2 ${typeScale.caption}`}>{subtitle}</p>}
    </div>
  );
}

export function EditorialSection({
  children,
  className = "",
  ruleBefore = false,
}: {
  children: ReactNode;
  className?: string;
  ruleBefore?: boolean;
}) {
  return (
    <section className={className}>
      {ruleBefore && <EditorialRule />}
      {children}
    </section>
  );
}

export default EditorialSection;
