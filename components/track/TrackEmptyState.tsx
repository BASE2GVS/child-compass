import { FrameworkButtonLink } from "@/components/framework";
import { EMPTY_HOPE } from "@/lib/first-time/copy";

type TrackEmptyStateProps = {
  childName: string;
  childId: string;
};

export default function TrackEmptyState({ childName, childId }: TrackEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/40 px-6 py-8 text-center">
      <p className="text-lg font-medium text-[var(--cc-ink)]">{EMPTY_HOPE}</p>
      <p className="mt-3 text-base text-[var(--cc-ink-muted)]">
        Check-ins and moments will build {childName}&apos;s timeline here.
      </p>
      <FrameworkButtonLink href={`/check-in?child=${childId}&first=1`} variant="pill" className="mt-6">
        Start today&apos;s check-in
      </FrameworkButtonLink>
    </div>
  );
}
