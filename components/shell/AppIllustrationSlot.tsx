import type { ReactNode } from "react";

type AppIllustrationSlotProps = {
  children: ReactNode;
  /** Bleed illustration beyond its column — hero pattern */
  bleed?: boolean;
  className?: string;
  align?: "center" | "end" | "start";
};

/**
 * Shared illustration positioning — right column in hero grids,
 * centred in feature rows. Pages place art here; shell handles layout.
 */
export default function AppIllustrationSlot({
  children,
  bleed = false,
  className = "",
  align = "center",
}: AppIllustrationSlotProps) {
  const alignClass =
    align === "end" ? "items-end" : align === "start" ? "items-start" : "items-center";

  return (
    <div
      className={`cc-shell-illustration ${bleed ? "cc-shell-illustration--bleed" : ""} ${alignClass} ${className}`.trim()}
      aria-hidden
    >
      {children}
    </div>
  );
}

/** Standard hero grid — 45% copy, 55% illustration on desktop */
export function AppHeroGrid({
  copy,
  illustration,
  className = "",
}: {
  copy: ReactNode;
  illustration?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`cc-shell-hero ${className}`.trim()}>
      <div className="cc-shell-hero__copy">{copy}</div>
      {illustration && <div className="cc-shell-hero__art">{illustration}</div>}
    </div>
  );
}
