"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Smooth fade when navigating between app pages */
export default function AppShellTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="cc-page-enter">
      {children}
    </div>
  );
}
