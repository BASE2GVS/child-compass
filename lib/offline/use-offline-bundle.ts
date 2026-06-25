"use client";

import { useCallback, useEffect, useState } from "react";
import type { OfflineBundle } from "@/lib/offline/types";
import { offlineStorageKey } from "@/lib/offline/types";

function readInitialOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function readStoredBundle(childId: string): OfflineBundle | null {
  try {
    const raw = localStorage.getItem(offlineStorageKey(childId));
    return raw ? (JSON.parse(raw) as OfflineBundle) : null;
  } catch {
    return null;
  }
}

export function useOfflineBundle(childId: string) {
  const [bundle, setBundle] = useState<OfflineBundle | null>(() =>
    typeof window !== "undefined" ? readStoredBundle(childId) : null,
  );
  const [isOnline, setIsOnline] = useState(readInitialOnline);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const saveBundle = useCallback(
    (next: OfflineBundle) => {
      localStorage.setItem(offlineStorageKey(childId), JSON.stringify(next));
      setBundle(next);
    },
    [childId],
  );

  return { bundle, isOnline, saveBundle };
}
