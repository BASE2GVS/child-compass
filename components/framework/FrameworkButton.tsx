import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { frameworkButton, type FrameworkButtonVariant } from "./framework-tokens";

type FrameworkButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: FrameworkButtonVariant;
};

/** One button language — Primary, Secondary, Ghost, Pill */
export function FrameworkButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: FrameworkButtonProps) {
  return (
    <button className={`${frameworkButton[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function FrameworkButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: FrameworkButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${frameworkButton[variant]} ${className}`.trim()}>
      {children}
    </Link>
  );
}
