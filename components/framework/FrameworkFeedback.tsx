import { EditorialIllustration, type IllustrationName } from "@/components/design-system/illustrations";
import { FrameworkButtonLink } from "./FrameworkButton";
import { HeroTitle, BodyText, CaptionText } from "./FrameworkTypography";
import { SecondaryCard } from "./FrameworkCard";

/** Empty state — illustration, explanation, one CTA */
export function FrameworkEmptyState({
  icon,
  illustration,
  title,
  description,
  why,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  illustration?: IllustrationName;
  title: string;
  description: string;
  why?: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="cc-fw-empty">
      <SecondaryCard padding="lg" className="w-full max-w-lg text-center">
        {illustration ? (
          <EditorialIllustration name={illustration} className="mx-auto animate-cc-breathe motion-reduce:animate-none" />
        ) : (
          <div className="cc-fw-empty-icon" aria-hidden>
            {icon}
          </div>
        )}
        <HeroTitle as="h2" className="mt-6 text-2xl sm:text-3xl">
          {title}
        </HeroTitle>
        <BodyText className="mt-3">{description}</BodyText>
        {why && <CaptionText className="mt-4">{why}</CaptionText>}
        <div className="mt-8">
          <FrameworkButtonLink href={actionHref} variant="pill">
            {actionLabel}
          </FrameworkButtonLink>
        </div>
      </SecondaryCard>
    </div>
  );
}

/** Warm success — no technical tone */
export function FrameworkSuccess({ message }: { message: string }) {
  return (
    <div className="cc-fw-success" role="status">
      <p className="font-semibold text-[var(--cc-ink)]">Done — thank you</p>
      <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">{message}</p>
    </div>
  );
}

/** Calm error — never scary */
export function FrameworkError({ message }: { message: string }) {
  return (
    <div className="cc-fw-error" role="alert">
      <p className="font-semibold text-[var(--cc-ink)]">That didn&apos;t quite work</p>
      <p className="mt-2 text-sm text-[var(--cc-ink-muted)]">{message}</p>
      <p className="mt-2 text-xs text-[var(--cc-ink-faint)]">Your information is safe. Please try again when you&apos;re ready.</p>
    </div>
  );
}

/** Re-export skeletons — shimmer everywhere, no spinners */
export {
  ShimmerBlock,
  SkeletonLoader,
  SkeletonCard,
  SkeletonChart,
  SkeletonPage,
  SkeletonReport,
  LoadingPulse,
} from "@/components/design-system/feedback";
