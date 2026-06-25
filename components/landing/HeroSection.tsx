import Image from "next/image";
import Link from "next/link";
import Navbar from "./Navbar";

const debriefItems = [
  "Anxiety",
  "Transition Stress",
  "Suggested Support Plan",
] as const;

export default function HeroSection() {
  return (
    <section id="hero" className="bg-[#FAF8F4]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid min-h-[820px] items-center gap-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h1 className="max-w-[700px] text-6xl leading-[1.0] font-bold tracking-tight text-[#0F172A] xl:text-7xl">
              Understand your child.
              <br />
              Without feeling alone.
            </h1>

            <p className="mt-6 max-w-[600px] text-xl leading-relaxed text-slate-600">
              Practical support for PDA, Autism, ADHD and Anxiety.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-[#14B8A6] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#14B8A6]/25 transition-all hover:bg-[#0D9488] hover:shadow-xl"
              >
                Start Free
              </Link>

              <a
                href="#features"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-[#0F172A] transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-12 max-w-[420px] rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] transition-shadow hover:shadow-[0_35px_90px_rgba(15,23,42,0.14)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#14B8A6]/10">
                  <svg
                    className="h-5 w-5 text-[#14B8A6]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A]">
                  Parent Debrief™
                </h3>
              </div>

              <ul className="mt-4 space-y-2.5 text-slate-600">
                {debriefItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#14B8A6]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[40px] shadow-2xl">
            <Image
              src="/images/landing.jpg"
              alt="Family running together in a sunny meadow"
              width={1000}
              height={800}
              priority
              className="h-[min(800px,85vh)] w-full object-cover object-[58%_42%] lg:h-[800px]"
            />

            <div className="absolute bottom-5 left-5 max-w-[240px] rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-semibold leading-snug text-[#0F172A]">
                  AI learns your child&apos;s unique patterns
                </span>
              </div>
            </div>

            <div className="absolute top-5 right-5 rounded-2xl border border-white/60 bg-white/75 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-md">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs font-semibold text-[#0F172A]">Private &amp; Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
