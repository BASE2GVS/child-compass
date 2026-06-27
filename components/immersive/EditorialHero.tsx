import type { ReactNode } from "react";

type EditorialHeroProps = {
  id?: string;
  children: ReactNode;
  illustration: ReactNode;
  /** Soft tint behind the text panel */
  tint?: "warm" | "calm" | "garden" | "path" | "library" | "home" | "nature" | "school" | "therapy" | "help" | "search";
  className?: string;
};

const tints: Record<NonNullable<EditorialHeroProps["tint"]>, string> = {
  warm: "from-[#FFF8F0]/95 via-[#FFF8F0]/75 to-transparent",
  calm: "from-[#FAF5FF]/95 via-[#FAF5FF]/70 to-transparent",
  garden: "from-[#F5FBF8]/95 via-[#F5FBF8]/72 to-transparent",
  path: "from-[#FFFBF5]/95 via-[#FFFBF5]/70 to-transparent",
  library: "from-[#FFFBF5]/95 via-[#FFFBF5]/72 to-transparent",
  home: "from-[#FFF8F2]/95 via-[#FFF8F2]/70 to-transparent",
  nature: "from-[#F0FAF7]/95 via-[#F0FAF7]/72 to-transparent",
  school: "from-[#F8FBFF]/95 via-[#F8FBFF]/70 to-transparent",
  therapy: "from-[#FAF5FF]/95 via-[#FAF5FF]/72 to-transparent",
  help: "from-[#FFFBF5]/95 via-[#FFFBF5]/70 to-transparent",
  search: "from-[#F8F5FF]/95 via-[#F8F5FF]/72 to-transparent",
};

/**
 * Editorial hero — text on the left, a large illustration filling the right half.
 * Cards feel like paper laid over the page environment.
 */
export default function EditorialHero({
  id,
  children,
  illustration,
  tint = "warm",
  className = "",
}: EditorialHeroProps) {
  return (
    <header
      id={id}
      className={`animate-cc-fade-up relative min-h-[300px] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/50 shadow-[0_8px_40px_rgba(45,42,38,0.08),0_24px_64px_rgba(61,155,143,0.06)] backdrop-blur-xl motion-reduce:animate-none sm:min-h-[360px] lg:min-h-[400px] ${className}`}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      {/* Large editorial illustration — right half, edge to edge */}
      <div className="absolute inset-y-0 right-0 w-[58%] sm:w-[55%] lg:w-[52%]" aria-hidden>
        <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-none [&_svg]:object-cover">
          {illustration}
        </div>
        <div className={`absolute inset-0 bg-gradient-to-r ${tints[tint]}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
      </div>

      {/* Text content */}
      <div className="relative z-10 flex min-h-[300px] max-w-[58%] flex-col justify-center p-7 sm:min-h-[360px] sm:p-9 lg:min-h-[400px] lg:max-w-[52%] lg:p-10">
        {children}
      </div>
    </header>
  );
}
