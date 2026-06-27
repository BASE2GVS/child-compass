import CheckInHeroArt from "@/components/check-in/illustrations/CheckInHeroArt";
import type { Child } from "@/lib/types/database";
import ChildSwitcher from "@/components/app/ChildSwitcher";

type CheckInHeroProps = {
  childName: string;
  childId: string;
  familyChildren: Child[];
};

export default function CheckInHero({ childName, childId, familyChildren }: CheckInHeroProps) {
  return (
    <header
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FDF6E8] via-[#FFFCF8] to-[#E8F6F3]/70 shadow-[0_4px_24px_rgba(45,42,38,0.06),0_12px_48px_rgba(45,42,38,0.04)]"
      aria-labelledby="checkin-hero-heading"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#E8C47A]/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-[#A8D5CC]/25 blur-3xl" aria-hidden />

      <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_minmax(180px,240px)] lg:items-center">
        <div className="max-w-xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">
              ☀️ Let&apos;s take a moment together
            </p>
            {familyChildren.length > 1 && (
              <ChildSwitcher familyChildren={familyChildren} activeChildId={childId} />
            )}
          </div>

          <div>
            <h1
              id="checkin-hero-heading"
              className="font-display text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--cc-ink)] sm:text-4xl"
            >
              How has today been for {childName}?
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--cc-ink-muted)]">
              We&apos;ll walk through today gently — one question at a time.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[240px] lg:justify-self-end">
          <CheckInHeroArt className="animate-cc-breathe motion-reduce:animate-none drop-shadow-sm" />
        </div>
      </div>
    </header>
  );
}
