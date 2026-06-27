import type { ReactNode } from "react";

export default function EditorialParchment({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`today-parchment relative z-10 -mt-10 rounded-t-[2.5rem] border-0 bg-gradient-to-b from-white/62 via-white/52 to-transparent px-6 py-12 shadow-[0_-12px_48px_rgba(45,42,38,0.04)] backdrop-blur-xl sm:-mt-12 sm:px-10 sm:py-14 lg:-mt-16 lg:rounded-t-[3rem] lg:px-14 lg:py-16 ${className}`}
    >
      {children}
    </div>
  );
}
