import type { ReactNode } from "react";
import { FrameworkButtonLink } from "@/components/framework";

type CompanionPrimaryActionProps = {
  label: string;
  href: string;
  className?: string;
};

/** One obvious next step — never five equal buttons */
export default function CompanionPrimaryAction({
  label,
  href,
  className = "",
}: CompanionPrimaryActionProps) {
  return (
    <div className={`cc-companion-primary ${className}`.trim()}>
      <FrameworkButtonLink href={href} variant="pill">
        {label}
      </FrameworkButtonLink>
    </div>
  );
}

export function CompanionPrimaryActionButton({
  label,
  onClick,
  disabled,
  type = "button",
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <div className="cc-companion-primary">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="cc-fw-btn cc-fw-btn-pill cc-fw-btn-md disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  );
}

/** Purposeful pause — not empty space */
export function CompanionBreath({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return <div className={`cc-companion-breath cc-companion-breath--${size}`} aria-hidden />;
}

/** Occasional human touch — use sparingly */
export function CompanionMicroMoment({ children }: { children: ReactNode }) {
  return <p className="cc-companion-micro">{children}</p>;
}

/** Hide secondary detail until the parent asks for it */
export function CompanionExpandable({
  label,
  children,
  defaultOpen = false,
  className = "",
}: {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details className={`cc-companion-expand ${className}`.trim()} open={defaultOpen || undefined}>
      <summary className="cc-companion-expand__trigger">{label}</summary>
      <div className="cc-companion-expand__body">{children}</div>
    </details>
  );
}

export function CompanionWelcomeLine({ children }: { children: ReactNode }) {
  return <p className="cc-companion-welcome">{children}</p>;
}

export function CompanionPurposeLine({ children }: { children: ReactNode }) {
  return <p className="cc-companion-purpose">{children}</p>;
}
