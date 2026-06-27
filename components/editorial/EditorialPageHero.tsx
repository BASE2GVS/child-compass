import type { ReactNode } from "react";

type EditorialPageHeroProps = {
  id?: string;
  environment: ReactNode;
  children: ReactNode;
  compact?: boolean;
  className?: string;
};

/** Approved full-viewport hero — illustration on the right, typography on the left */
export default function EditorialPageHero({
  id,
  environment,
  children,
  compact = false,
  className = "",
}: EditorialPageHeroProps) {
  if (compact) {
    return (
      <header id={id} className={`relative px-1 pb-2 pt-2 sm:px-2 ${className}`}>
        {children}
      </header>
    );
  }

  return (
    <header
      id={id}
      className={`relative -mx-2 min-h-[min(80vh,48rem)] overflow-hidden sm:-mx-4 lg:-mx-6 ${className}`}
    >
      <div className="absolute inset-y-0 right-0 w-[52%] sm:w-[50%] lg:w-[48%]" aria-hidden>
        <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:object-cover">
          {environment}
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#FFF8F0]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F0]/50 via-transparent to-transparent" />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#FFF8F0]/90 via-[#FFF8F0]/50 to-transparent lg:via-[#FFF8F0]/30"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[min(80vh,48rem)] flex-col justify-end px-2 pb-10 pt-28 sm:px-6 sm:pb-14 lg:justify-center lg:px-10 lg:pb-20">
        <div className="max-w-2xl space-y-6 lg:max-w-3xl lg:space-y-8">{children}</div>
      </div>
    </header>
  );
}
