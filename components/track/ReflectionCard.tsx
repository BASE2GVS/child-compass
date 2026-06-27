type ReflectionCardProps = {
  message: string;
};

export default function ReflectionCard({ message }: ReflectionCardProps) {
  return (
    <aside
      className="animate-cc-fade-up rounded-[1.25rem] border border-dashed border-[var(--cc-teal)]/25 bg-[var(--cc-teal-wash)]/30 px-6 py-5 text-center motion-reduce:animate-none"
      role="note"
    >
      <p className="font-display text-lg italic leading-relaxed text-[var(--cc-ink-muted)]">{message}</p>
    </aside>
  );
}
