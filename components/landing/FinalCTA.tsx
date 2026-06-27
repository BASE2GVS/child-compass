import ScrollReveal from "./ScrollReveal";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--cc-cream-100)] via-white to-[var(--cc-teal-wash)]/30" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[var(--cc-teal)]/8 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[var(--cc-lavender)]/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <ScrollReveal>
          <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">You&apos;re not alone</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--cc-ink)] lg:text-5xl xl:text-6xl">
            You don&apos;t have to figure this out alone.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-[var(--cc-ink-muted)]">
            Start understanding your child today — gently, at your own pace.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="cc-btn-alive rounded-full bg-[var(--cc-teal)] px-10 py-4 text-base font-semibold text-white shadow-[0_8px_28px_var(--cc-teal-glow)] transition-all hover:bg-[var(--cc-teal-deep)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Start free
            </Link>
            <a
              href="#features"
              className="cc-btn-alive rounded-full border border-[var(--cc-border)] bg-white px-10 py-4 text-base font-semibold text-[var(--cc-ink)] shadow-sm transition-all hover:border-[var(--cc-teal)]/30"
            >
              See how it works
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
