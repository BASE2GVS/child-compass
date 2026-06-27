import type { ReactNode } from "react";

const tones = {
  lavender: "from-[#F3EFFA]/85 via-[#EDE8F8]/75 to-[#E8F6F3]/65",
  amber: "from-[#FBF4E6]/90 via-[#FDF0E0]/80 to-[#F5E6C8]/70",
  mint: "from-[#E8F6F3]/85 via-[#D4EDE8]/75 to-[#E8F6F3]/60",
  peach: "from-[#FBEFEC]/80 via-[#F5D4C8]/70 to-[#FBF4E6]/60",
} as const;

export default function EditorialBand({
  label,
  children,
  tone = "lavender",
}: {
  label: string;
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <div
      className={`relative -mx-6 bg-gradient-to-r ${tones[tone]} px-6 py-10 sm:-mx-10 sm:px-10 sm:py-12 lg:-mx-16 lg:px-16 lg:py-14`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cc-ink-faint)]">{label}</p>
      <div className="mt-4 max-w-4xl font-display text-xl leading-snug text-[var(--cc-ink)] sm:text-2xl lg:text-[1.65rem]">
        {children}
      </div>
    </div>
  );
}
