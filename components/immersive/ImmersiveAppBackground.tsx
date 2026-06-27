"use client";

import type { ReactNode } from "react";

/**
 * @deprecated The app shell provides the shared environment.
 * Kept as a passthrough for existing page wrappers.
 */
export default function ImmersiveAppBackground({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** @deprecated Use AppEnvironmentBackground from @/components/shell */
export function PageCanvas() {
  return null;
}

/** @deprecated Use AppEnvironmentBackground */
export function ImmersiveAtmosphere() {
  return null;
}

export function AmbientPageScene() {
  return null;
}

export function AmbientPageSceneSecondary() {
  return null;
}
