import type { ReactNode } from "react";
import Link from "next/link";
import { radius } from "./tokens/radius";
import { typeScale } from "./tokens/typography";
import { touchTarget } from "./tokens/spacing";

/** Navigation surface tokens — sidebar & mobile nav inherit these */
export const navTokens = {
  shell:
    "border-[var(--cc-border-soft)] bg-[var(--cc-paper)]/95 backdrop-blur-md",
  item: `flex items-center gap-3 ${radius.md} px-4 py-3 text-sm font-medium transition-colors`,
  itemIdle: "text-[var(--cc-ink-muted)] hover:bg-[var(--cc-cream-100)] hover:text-[var(--cc-ink)]",
  itemActive: "bg-[var(--cc-teal-wash)] text-[var(--cc-teal-deep)] font-semibold",
  mobileBar:
    "fixed right-0 bottom-0 left-0 z-40 border-t border-[var(--cc-border-soft)] bg-[var(--cc-paper)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md shadow-[0_-4px_24px_rgba(45,42,38,0.05)] lg:hidden",
  mobileItem: `flex min-w-0 flex-1 flex-col items-center gap-1 ${radius.md} px-1 py-3 transition-colors`,
} as const;

export function NavLink({
  href,
  active,
  icon,
  label,
  shortLabel,
  emphasize,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  shortLabel?: string;
  emphasize?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={label}
      className={`${navTokens.mobileItem} ${touchTarget} ${
        active ? "text-[var(--cc-teal)]" : "text-[var(--cc-ink-faint)]"
      } ${emphasize && !active ? "text-[var(--cc-ink)]" : ""}`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center ${radius.md} transition-colors ${
          emphasize
            ? active
              ? "bg-[var(--cc-teal)] text-white"
              : "bg-[var(--cc-teal-wash)] text-[var(--cc-teal)]"
            : ""
        }`}
      >
        {icon}
      </span>
      <span className="max-w-full truncate text-[11px] font-semibold">{shortLabel ?? label}</span>
    </Link>
  );
}

export function SidebarNavLink({
  href,
  active,
  icon,
  label,
  description,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  label: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${navTokens.item} ${touchTarget} ${
        active ? navTokens.itemActive : navTokens.itemIdle
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--cc-cream-100)] text-[var(--cc-teal)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate">{label}</span>
        {description && <span className={`block truncate ${typeScale.micro}`}>{description}</span>}
      </span>
    </Link>
  );
}

export function NavSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className={`px-4 pb-2 pt-6 ${typeScale.eyebrow}`}>{children}</p>
  );
}
