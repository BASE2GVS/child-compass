import type { ReactNode } from "react";

type AppPageFrameProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Standard page frame inside the shell — centred, max 1500px.
 * All app pages already sit in cc-shell-content via AppShell;
 * use this for explicit page-level structure on new pages.
 */
export default function AppPageFrame({ children, className = "" }: AppPageFrameProps) {
  return <div className={`cc-shell-page ${className}`.trim()}>{children}</div>;
}
