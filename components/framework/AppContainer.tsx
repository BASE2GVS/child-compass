import type { ReactNode } from "react";
import type { FrameworkRhythmSlot } from "./framework-tokens";

type AppContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * ONE application container — every authenticated page lives here.
 * Centred editorial column, max 1500px, shared vertical rhythm.
 */
export default function AppContainer({ children, className = "" }: AppContainerProps) {
  return (
    <div className={`cc-framework-container ${className}`.trim()}>
      <div className="cc-framework-rhythm">{children}</div>
    </div>
  );
}

type AppPageSectionProps = {
  children: ReactNode;
  slot: FrameworkRhythmSlot;
  className?: string;
  id?: string;
};

/** Vertical rhythm regions — header → hero → primary → supporting → reflection */
export function AppPageSection({ children, slot, className = "", id }: AppPageSectionProps) {
  return (
    <section id={id} className={`cc-rhythm-${slot} ${className}`.trim()}>
      {children}
    </section>
  );
}
