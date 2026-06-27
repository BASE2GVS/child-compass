import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ds } from "./tokens";
import { radius } from "./tokens/radius";
import { shadows } from "./tokens/shadows";
import { motion } from "./tokens/motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "pill" | "fab";
export type ButtonSize = "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: ds.btnPrimary,
  secondary: ds.btnSecondary,
  ghost: ds.btnGhost,
  pill: ds.btnPill,
  fab: ds.btnFab,
};

const sizeClass: Record<ButtonSize, string> = {
  md: "",
  lg: "min-h-14 px-8 py-4 text-base",
};

export function EmotionalButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmotionalButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  if (variant === "fab") {
    return (
      <Link href={href} className={`${ds.btnFab} ${className}`} aria-label={typeof children === "string" ? children : undefined}>
        {children}
      </Link>
    );
  }
  return (
    <Link href={href} className={`${variantClass[variant]} ${sizeClass[size]} ${className}`}>
      {children}
    </Link>
  );
}

/** Floating action button — fixed position helper */
export function FloatingActionButton({
  href,
  label,
  icon,
  className = "",
}: {
  href: string;
  label: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`fixed right-6 bottom-24 z-30 flex h-14 w-14 items-center justify-center ${radius.pill} bg-[var(--cc-teal)] text-white ${shadows.tealGlow} transition-all duration-200 hover:bg-[var(--cc-teal-deep)] hover:scale-105 ${motion.press} motion-reduce:hover:scale-100 lg:bottom-8 ${className}`}
    >
      {icon}
    </Link>
  );
}

/** @deprecated use EmotionalButton — kept for backward compatibility */
export { EmotionalButton as ButtonV3 };
