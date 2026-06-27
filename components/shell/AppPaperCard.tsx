"use client";

import type { ReactNode } from "react";
import { shellTokens, type ShellShadow } from "./shell-tokens";

type AppPaperCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: ShellShadow;
};

const paddingClass = {
  none: "",
  sm: "cc-shell-paper--sm",
  md: "cc-shell-paper--md",
  lg: "cc-shell-paper--lg",
};

const shadowClass: Record<ShellShadow, string> = {
  paper: "cc-shadow-paper",
  card: "cc-shadow-card",
  float: "cc-shadow-float",
  hero: "cc-shadow-hero",
  teal: "cc-shadow-teal",
};

/** Warm paper surface — the shared card system */
export default function AppPaperCard({
  children,
  className = "",
  as: Tag = "div",
  padding = "md",
  shadow = "card",
}: AppPaperCardProps) {
  return (
    <Tag
      className={`${shellTokens.card.base} ${paddingClass[padding]} ${shadowClass[shadow]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
