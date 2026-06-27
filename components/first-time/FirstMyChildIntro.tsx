import { firstMyChildIntro } from "@/lib/first-time/copy";

export default function FirstMyChildIntro({ childName }: { childName: string }) {
  return (
    <p className="text-lg leading-relaxed text-[var(--cc-ink-soft)]">{firstMyChildIntro(childName)}</p>
  );
}
