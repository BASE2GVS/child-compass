import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import LandingAuthNav from "./LandingAuthNav";
import { MorningArt } from "@/components/illustrations/CompanionArtFamily";

export default function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--cc-bg)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 top-20 h-96 w-96 rounded-full bg-[var(--cc-amber)]/12 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[var(--cc-teal-wash)]/40 blur-3xl" />
      </div>

      <Navbar authSlot={<LandingAuthNav />} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid min-h-[min(820px,90vh)] items-center gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:py-16">
          <div className="animate-cc-fade-up motion-reduce:animate-none">
            <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">Your daily companion</p>
            <h1 className="mt-4 max-w-[700px] font-display text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--cc-ink)] xl:text-6xl">
              Understand your child.
              <br />
              Without feeling alone.
            </h1>

            <p className="mt-6 max-w-[560px] text-xl leading-relaxed text-[var(--cc-ink-muted)]">
              Practical, warm support for PDA, Autism, ADHD and anxiety — built around your family&apos;s real story.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register" className="cc-btn-alive rounded-full bg-[var(--cc-teal)] px-8 py-4 text-base font-semibold text-white shadow-[0_8px_28px_var(--cc-teal-glow)] transition-all hover:bg-[var(--cc-teal-deep)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                Start free
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 z-10 hidden w-44 animate-cc-float motion-reduce:animate-none lg:block">
              <MorningArt />
            </div>
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_24px_80px_rgba(45,42,38,0.12)]">
              <Image
                src="/images/landing.jpg"
                alt="Family running together in a sunny meadow"
                width={1000}
                height={800}
                priority
                className="h-[min(640px,70vh)] w-full object-cover object-[58%_42%] lg:h-[720px]"
              />
              <div className="absolute bottom-5 left-5 max-w-[240px] rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-md">
                <p className="text-xs font-semibold leading-snug text-[var(--cc-ink)]">
                  Learns your child&apos;s unique patterns — gently, over time
                </p>
              </div>
              <div className="absolute top-5 right-5 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-md">
                <p className="text-xs font-semibold text-[var(--cc-ink)]">Private &amp; secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
