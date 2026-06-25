/** Unified spacing scale — use everywhere for consistent rhythm */
export const space = {
  page: "space-y-10",
  section: "space-y-8",
  card: "space-y-5",
  field: "space-y-2",
  inline: "gap-3",
} as const;

export const ds = {
  card: "rounded-[32px] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]",
  glass: "rounded-[32px] border border-white/60 bg-white/85 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur-sm",
  input:
    "w-full min-h-[48px] rounded-2xl border-0 bg-[#FAF8F4] px-4 py-3.5 text-base text-[#0F172A] outline-none ring-1 ring-[#E8E4DC] transition-shadow placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#14B8A6]/30 disabled:opacity-60",
  label: "mb-1.5 block text-sm font-semibold text-[#0F172A]",
  hint: "mt-1.5 text-xs leading-relaxed text-[#94A3B8]",
  fieldError: "mt-1.5 text-xs font-medium text-rose-600",
  eyebrow: "text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]",
  heading: "text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl",
  subtext: "mt-2 max-w-2xl text-base leading-relaxed text-[#64748B]",
  btnPrimary:
    "inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#14B8A6] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(20,184,166,0.28)] transition-all duration-200 hover:bg-[#0D9488] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/50 active:scale-[0.98] disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  btnSecondary:
    "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8E4DC] bg-white px-6 py-3.5 text-sm font-semibold text-[#0F172A] shadow-sm transition-all duration-200 hover:bg-[#FAF8F4] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/30 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  hoverLift:
    "transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  fadeIn: "animate-fade-in",
  stagger: "animate-stagger-in",
} as const;
