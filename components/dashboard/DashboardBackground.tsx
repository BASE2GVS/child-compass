import type { ReactNode } from "react";

export default function DashboardBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#14B8A6]/[0.07] blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-amber-100/30 blur-3xl" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
