import ScrollReveal from "./ScrollReveal";

const testimonials = [
  {
    quote:
      "For the first time someone explained WHY my son behaves this way. I finally stopped blaming myself.",
    author: "Sarah M.",
    detail: "Parent of a 9-year-old",
  },
  {
    quote:
      "We've stopped blaming ourselves. Child Compass helped us see the demand underneath the meltdown.",
    author: "James & Priya K.",
    detail: "Parents of twins",
  },
  {
    quote:
      "Our teacher finally understands our daughter. The Teacher Guide changed everything at school.",
    author: "Emma L.",
    detail: "Parent of a 7-year-old",
  },
  {
    quote:
      "School mornings are calmer. We still have hard days — but now we know what to do.",
    author: "David R.",
    detail: "Parent of an 11-year-old",
  },
] as const;

export default function TestimonialSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-[#0F172A] lg:text-5xl">
              What parents say
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Real families. Real struggles. Real change.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <ScrollReveal key={t.author}>
              <div className="h-full rounded-[32px] border border-slate-100 bg-[#FAF8F4] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <div className="flex gap-0.5 text-[#14B8A6]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="mt-5 text-lg leading-relaxed text-[#0F172A]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-200/80 pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14B8A6]/15 text-sm font-bold text-[#14B8A6]">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.detail}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
