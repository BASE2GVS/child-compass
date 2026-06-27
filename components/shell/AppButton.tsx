import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { shellTokens, type ShellButtonVariant } from "./shell-tokens";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ShellButtonVariant;
  size?: "md" | "lg";
};

const sizeClass = {
  md: "cc-btn-md",
  lg: "cc-btn-lg",
};

/** Shared button styles — primary, secondary, ghost */
export function AppButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      className={`${shellTokens.button[variant]} ${sizeClass[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function AppButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: ShellButtonVariant;
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`${shellTokens.button[variant]} ${sizeClass[size]} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
