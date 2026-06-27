import { FIRST_CHECKIN_WHY } from "@/lib/first-time/copy";

export default function FirstCheckinIntro() {
  return (
    <p className="mb-8 rounded-2xl border border-white/50 bg-white/45 px-5 py-4 text-base leading-relaxed text-[var(--cc-ink-soft)]">
      {FIRST_CHECKIN_WHY}
    </p>
  );
}
