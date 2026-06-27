const QUIET_LINES = [
  "You're doing better than you probably realise.",
  "Small steps count. Especially on hard days.",
  "You don't have to hold it all alone.",
  "Showing up — even tired — is enough.",
  "Your care for your child matters more than perfection.",
];

function pickLine(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return QUIET_LINES[h % QUIET_LINES.length];
}

export default function QuietReflection({
  parentName,
  dateKey = new Date().toISOString().split("T")[0],
}: {
  parentName: string;
  dateKey?: string;
}) {
  const line = pickLine(`${parentName}-${dateKey}`);

  return (
    <footer className="px-4 py-5 text-center sm:py-6">
      <blockquote className="mx-auto max-w-lg">
        <p className="font-display text-base font-medium leading-snug text-[var(--cc-ink-soft)] sm:text-lg">
          &ldquo;{line}&rdquo;
        </p>
      </blockquote>
      <p className="mt-2 text-[10px] text-[var(--cc-ink-faint)]">— Child Compass</p>
    </footer>
  );
}
