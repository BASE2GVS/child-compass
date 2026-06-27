import { FrameworkButtonLink } from "@/components/framework";
import CompanionVisitTracker from "@/components/companion/CompanionVisitTracker";
import { FIRST_TODAY_BODY } from "@/lib/first-time/copy";

type FirstTodayGuideProps = {
  parentName: string;
  childName: string;
  childId: string;
};

/** Brand-new parent — calm, one CTA, room to breathe */
export default function FirstTodayGuide({ parentName, childName, childId }: FirstTodayGuideProps) {
  const firstName = parentName.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-lg cc-flow-enter py-16 text-center sm:py-24">
      <CompanionVisitTracker />
      <p className="text-sm font-medium text-[var(--cc-teal-deep)]">Welcome, {firstName}</p>
      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-[var(--cc-ink)] sm:text-4xl">
        Let&apos;s start gently with {childName}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-[var(--cc-ink-muted)]">{FIRST_TODAY_BODY}</p>
      <FrameworkButtonLink href={`/check-in?child=${childId}&first=1`} variant="pill" className="mt-10">
        Start today&apos;s check-in
      </FrameworkButtonLink>
    </div>
  );
}
