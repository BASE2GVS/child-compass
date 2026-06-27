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
    quote: "School mornings are calmer. We still have hard days — but now we know what to do.",
    author: "David R.",
    detail: "Parent of an 11-year-old",
  },
] as const;

export default function TestimonialSection() {
  return (
    <section className="bg-[var(--cc-cream-100)] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-wide text-[var(--cc-teal-deep)]">Real families</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[var(--cc-ink)] lg:text-5xl">
              What parents say
            </h2>
            <p className="mt-4 text-lg text-[var(--cc-ink-muted)]">Real struggles. Real change. Real relief.</p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <ScrollReveal key={t.author}>
              <blockquote className="cc-card-lift flex h-full flex-col rounded-[2rem] border border-[var(--cc-border-soft)] bg-white p-8 shadow-sm">
                <div className="flex gap-0.5 text-[var(--cc-amber)]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-5 flex-1 text-lg leading-relaxed text-[var(--cc-ink)]">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-3 border-t border-[var(--cc-border-soft)] pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--cc-teal-wash)] text-sm font-bold text-[var(--cc-teal-deep)]">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--cc-ink)]">{t.author}</p>
                    <p className="text-xs text-[var(--cc-ink-muted)]">{t.detail}</p>
                  </div>
                </footer>
              </blockquote>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
