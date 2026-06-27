import { useState } from "react";
import { parentMoodStorageKey, type ParentMood } from "@/lib/companion/parent-checkin";

function readStoredMood(): ParentMood | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(parentMoodStorageKey());
    return (stored as ParentMood) || null;
  } catch {
    return null;
  }
}

export function useParentMood(): ParentMood | null {
  const [mood] = useState<ParentMood | null>(readStoredMood);
  return mood;
}

export function readParentMoodSync(): ParentMood | null {
  return readStoredMood();
}
