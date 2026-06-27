import type { ElementType, ReactNode } from "react";
import { shellTokens, type ShellTypography } from "./shell-tokens";

type AppTypographyProps = {
  as?: ElementType;
  variant: ShellTypography;
  className?: string;
  children: ReactNode;
  id?: string;
};

/** Shared editorial typography — every page inherits these scales */
export default function AppTypography({
  as,
  variant,
  className = "",
  children,
  id,
}: AppTypographyProps) {
  const Tag = as ?? defaultTag[variant];
  return (
    <Tag id={id} className={`${shellTokens.typography[variant]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

const defaultTag: Record<ShellTypography, ElementType> = {
  display: "h1",
  title: "h1",
  heading: "h2",
  lead: "p",
  body: "p",
  caption: "p",
  eyebrow: "p",
};

export function AppDisplay(props: Omit<AppTypographyProps, "variant">) {
  return <AppTypography variant="display" {...props} />;
}

export function AppTitle(props: Omit<AppTypographyProps, "variant">) {
  return <AppTypography variant="title" {...props} />;
}

export function AppHeading(props: Omit<AppTypographyProps, "variant">) {
  return <AppTypography variant="heading" {...props} />;
}

export function AppLead(props: Omit<AppTypographyProps, "variant">) {
  return <AppTypography variant="lead" {...props} />;
}

export function AppEyebrow(props: Omit<AppTypographyProps, "variant">) {
  return <AppTypography variant="eyebrow" {...props} />;
}
