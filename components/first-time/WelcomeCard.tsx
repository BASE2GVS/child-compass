import { FrameworkButtonLink } from "@/components/framework";

type WelcomeCardProps = {
  title?: string;
  body: string;
  actionLabel: string;
  actionHref: string;
};

/** Calm one-message welcome — one button only */
export default function WelcomeCard({
  title = "Welcome",
  body,
  actionLabel,
  actionHref,
}: WelcomeCardProps) {
  return (
    <div className="mx-auto max-w-lg cc-flow-enter py-8 text-center sm:py-12">
      <h1 className="font-display text-3xl font-semibold text-[var(--cc-ink)] sm:text-4xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--cc-ink-muted)]">{body}</p>
      <FrameworkButtonLink href={actionHref} variant="pill" className="mt-8">
        {actionLabel}
      </FrameworkButtonLink>
    </div>
  );
}
