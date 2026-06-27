type GentleSuccessProps = {
  message: string;
  className?: string;
};

/** Quiet celebration — one line, never overdone */
export default function GentleSuccess({ message, className = "" }: GentleSuccessProps) {
  return (
    <p
      className={`rounded-2xl border border-[var(--cc-teal)]/15 bg-[var(--cc-teal)]/8 px-5 py-4 text-base leading-relaxed text-[var(--cc-ink-soft)] ${className}`}
      role="status"
    >
      {message}
    </p>
  );
}
