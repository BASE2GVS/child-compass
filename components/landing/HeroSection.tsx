import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";
import LandingAuthNav from "./LandingAuthNav";

export default function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/images/hero/hero-family-journey-sky.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_28%] sm:object-[60%_30%] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-white/80 to-white/22" />
      </div>

      <Navbar authSlot={<LandingAuthNav />} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid min-h-[min(820px,90vh)] items-center gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:py-16">
          <div className="animate-cc-fade-up motion-reduce:animate-none">
            <p className="text-sm font-semibold tracking-wide text-[#2F80ED]">Family-first support</p>
            <h1 className="mt-4 max-w-[760px] font-display text-5xl font-semibold leading-[1.05] tracking-tight text-[#102A43] xl:text-6xl">
              Every child has their own journey.
            </h1>

            <p className="mt-6 max-w-[620px] text-2xl leading-relaxed text-[#334E68]">
              Helping your family navigate every step with confidence.
            </p>

            <p className="mt-4 max-w-[620px] text-lg leading-relaxed text-[#486581]">
              Child Compass brings understanding, progress, confidence, memories and your family journey into one calm place you can trust.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register" className="cc-btn-alive rounded-full bg-[#2F80ED] px-8 py-4 text-base font-semibold text-white shadow-[0_10px_22px_rgba(47,128,237,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1F6FD8] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                🌱 Start Your Journey
              </Link>
              <a href="#features" className="rounded-full border border-[#BFDBFE] bg-white/85 px-7 py-4 text-base font-semibold text-[#102A43] shadow-[0_8px_18px_rgba(16,42,67,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white">
                ▶ Watch Overview
              </a>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
