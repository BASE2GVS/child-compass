import type { ReactNode } from "react";
import { radius } from "./tokens/radius";
import { typeScale } from "./tokens/typography";

export type ChipTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "mint"
  | "lavender"
  | "amber"
  | "coral";

const chipStyles: Record<ChipTone, string> = {
  neutral: "bg-[var(--cc-cream-200)] text-[var(--cc-ink-muted)]",
  brand: "bg-[var(--cc-teal-wash)] text-[var(--cc-teal-deep)]",
  success: "bg-[var(--cc-success-wash)] text-[var(--cc-success)]",
  warning: "bg-[var(--cc-warning-wash)] text-[var(--cc-warning)]",
  danger: "bg-[var(--cc-danger-wash)] text-[var(--cc-danger)]",
  mint: "bg-[var(--cc-teal-wash)]/60 text-[var(--cc-teal-deep)]",
  lavender: "bg-[var(--cc-lavender)]/20 text-[var(--cc-ink-soft)]",
  amber: "bg-[var(--cc-amber)]/20 text-[var(--cc-ink-soft)]",
  coral: "bg-[var(--cc-coral)]/20 text-[var(--cc-ink-soft)]",
};

export function StatusChip({
  label,
  tone = "neutral",
  icon,
}: {
  label: string;
  tone?: ChipTone;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${radius.pill} px-3 py-1.5 text-xs font-semibold ${chipStyles[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
}

/** @deprecated use StatusChip */
export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "brand" | "neutral";
}) {
  const map: Record<string, ChipTone> = {
    success: "success",
    warning: "warning",
    danger: "danger",
    brand: "brand",
    neutral: "neutral",
  };
  return <StatusChip label={label} tone={map[tone]} />;
}

export function DotIndicator({
  tone = "brand",
  pulse = false,
  label,
}: {
  tone?: ChipTone;
  pulse?: boolean;
  label: string;
}) {
  const dotColors: Record<ChipTone, string> = {
    neutral: "bg-[var(--cc-ink-faint)]",
    brand: "bg-[var(--cc-teal)]",
    success: "bg-[var(--cc-success)]",
    warning: "bg-[var(--cc-warning)]",
    danger: "bg-[var(--cc-danger)]",
    mint: "bg-[var(--cc-mint)]",
    lavender: "bg-[var(--cc-lavender)]",
    amber: "bg-[var(--cc-amber)]",
    coral: "bg-[var(--cc-coral)]",
  };
  return (
    <span className={`inline-flex items-center gap-2 ${typeScale.caption}`}>
      <span
        className={`h-2 w-2 rounded-full ${dotColors[tone]} ${pulse ? "animate-cc-breathe" : ""}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
