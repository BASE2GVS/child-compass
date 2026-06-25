import ScrollReveal from "./ScrollReveal";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-36">
      <div className="absolute inset-0 bg-[#FAF8F4]" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#14B8A6]/6" />
      <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#14B8A6]/8" />
      <div className="absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-amber-100/50" />
      <div className="absolute bottom-1/4 left-1/3 h-32 w-32 rounded-full bg-[#14B8A6]/10" />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <ScrollReveal>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#0F172A] lg:text-5xl xl:text-6xl">
            You don&apos;t have to figure this out alone.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-600">
            Start understanding your child today.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-2xl bg-[#14B8A6] px-10 py-4 text-base font-semibold text-white shadow-lg shadow-[#14B8A6]/25 transition-all hover:bg-[#0D9488] hover:shadow-xl"
            >
              Start Free
            </Link>
            <a
              href="#features"
              className="rounded-2xl border border-slate-200 bg-white px-10 py-4 text-base font-semibold text-[#0F172A] transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            >
              See Demo
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
