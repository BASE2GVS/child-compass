import CheckInCompleteArt from "@/components/check-in/illustrations/CheckInCompleteArt";
import { FrameworkButton } from "@/components/framework";

type CheckInCompleteProps = {
  childName: string;
  loading?: boolean;
  onSubmit: () => void;
};

export default function CheckInComplete({
  childName,
  loading = false,
  onSubmit,
}: CheckInCompleteProps) {
  return (
    <div className="animate-cc-celebrate flex flex-col items-center py-4 text-center motion-reduce:animate-none sm:py-8">
      <div className="relative">
        <CheckInCompleteArt className="animate-cc-breathe motion-reduce:animate-none" />
        <span className="animate-cc-sparkle absolute -right-2 top-4 text-2xl motion-reduce:animate-none" aria-hidden>
          ✨
        </span>
        <span className="animate-cc-sparkle absolute -left-3 bottom-8 text-xl motion-reduce:animate-none" style={{ animationDelay: "0.8s" }} aria-hidden>
          🌿
        </span>
      </div>
      <h2 className="mt-8 font-display text-2xl font-semibold text-[var(--cc-ink)] sm:text-3xl">
        Today&apos;s story has been added
      </h2>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--cc-ink-muted)]">
        Thank you for sharing today with me. {childName}&apos;s journey is richer because you noticed.
      </p>
      <FrameworkButton
        type="button"
        variant="pill"
        onClick={onSubmit}
        disabled={loading}
        className="mt-10 w-full max-w-sm sm:w-auto"
      >
        {loading ? "Saving your story…" : "Return to Today"}
      </FrameworkButton>
    </div>
  );
}
