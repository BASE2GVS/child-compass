import type { ReactNode } from "react";
import { frameworkCard, type FrameworkCardVariant } from "./framework-tokens";

const paddingMap = {
  sm: "cc-fw-pad-sm",
  md: "cc-fw-pad-md",
  lg: "cc-fw-pad-lg",
} as const;

type FrameworkCardProps = {
  children: ReactNode;
  variant?: FrameworkCardVariant;
  padding?: keyof typeof paddingMap;
  className?: string;
  as?: "div" | "section" | "article";
};

/** Four card styles — Hero, Primary, Secondary, Supporting */
export default function FrameworkCard({
  children,
  variant = "primary",
  padding = "md",
  className = "",
  as: Tag = "div",
}: FrameworkCardProps) {
  return (
    <Tag className={`${frameworkCard[variant]} ${paddingMap[padding]} ${className}`.trim()}>
      {children}
    </Tag>
  );
}

export function HeroCard(props: Omit<FrameworkCardProps, "variant">) {
  return <FrameworkCard variant="hero" padding="lg" {...props} />;
}

export function PrimaryCard(props: Omit<FrameworkCardProps, "variant">) {
  return <FrameworkCard variant="primary" {...props} />;
}

export function SecondaryCard(props: Omit<FrameworkCardProps, "variant">) {
  return <FrameworkCard variant="secondary" {...props} />;
}

export function SupportingCard(props: Omit<FrameworkCardProps, "variant">) {
  return <FrameworkCard variant="supporting" padding="sm" {...props} />;
}
