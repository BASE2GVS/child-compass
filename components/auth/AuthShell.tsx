import type { ReactNode } from "react";
import Link from "next/link";
import { HopeArt } from "@/components/illustrations/CompanionArtFamily";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--cc-bg)] px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[var(--cc-amber)]/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[var(--cc-teal-wash)]/50 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-[var(--cc-lavender)]/15 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-4xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
        <div className="hidden text-center lg:block lg:text-left">
          <Link href="/" className="inline-block">
            <p className="font-display text-2xl font-semibold text-[var(--cc-ink)]">Child Compass™</p>
            <p className="mt-1 text-sm text-[var(--cc-ink-muted)]">Your daily companion</p>
          </Link>
          <div className="mt-10 animate-cc-float motion-reduce:animate-none">
            <HopeArt />
          </div>
          <p className="mt-8 max-w-sm font-display text-3xl font-semibold leading-snug text-[var(--cc-ink)]">
            Understand your child. Without feeling alone.
          </p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-[var(--cc-ink-muted)]">
            Simple to start. No pressure.
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--cc-ink-faint)]">
            Warm, practical support for PDA, Autism, ADHD and anxiety.
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center lg:max-w-none">
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="inline-block">
              <p className="font-display text-xl font-semibold text-[var(--cc-ink)]">Child Compass™</p>
            </Link>
          </div>
          <div className="animate-cc-fade-up">{children}</div>
        </div>
      </div>
    </div>
  );
}
