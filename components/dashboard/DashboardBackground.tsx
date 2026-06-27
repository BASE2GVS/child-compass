import type { ReactNode } from "react";

/**
 * Pages inherit the shared app shell environment automatically.
 * This wrapper is kept for compatibility — it no longer adds a background layer.
 */
export default function DashboardBackground({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export { default as AppEnvironmentBackground } from "@/components/shell/AppEnvironmentBackground";

/** @deprecated Shell provides the environment */
export function ImmersiveAtmosphere() {
  return null;
}
