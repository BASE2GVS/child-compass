"use client";

import { useState } from "react";
import Link from "next/link";
import { buildGentlePrompt, gentlePromptStorageKey } from "@/lib/companion/gentle-prompts";
import type { DayPhase } from "@/lib/companion/daily-rhythm";

type GentlePromptSectionProps = {
  phase: DayPhase;
  childId: string;
  childName: string;
  hasCheckinToday: boolean;
  talkedToday: boolean;
};

function readDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(gentlePromptStorageKey());
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function GentlePromptSection({
  phase,
  childId,
  childName,
  hasCheckinToday,
  talkedToday,
}: GentlePromptSectionProps) {
  const [dismissedIds, setDismissedIds] = useState(readDismissed);
  const [hidden, setHidden] = useState(false);

  if (phase !== "day" || hidden) return null;

  const prompt = buildGentlePrompt({
    phase,
    childId,
    childName,
    hasCheckinToday,
    talkedToday,
    dismissedIds,
  });

  if (!prompt) return null;

  function dismiss() {
    setHidden(true);
    try {
      const ids = readDismissed();
      if (!ids.includes(prompt!.id)) {
        localStorage.setItem(gentlePromptStorageKey(), JSON.stringify([...ids, prompt!.id]));
      }
      setDismissedIds([...ids, prompt!.id]);
    } catch {
      // ignore
    }
  }

  return (
    <aside
      className="rounded-2xl border border-dashed border-[var(--cc-teal)]/25 bg-[#E8F6F3]/30 px-6 py-5"
      aria-label="Optional suggestion"
    >
      <p className="text-base leading-relaxed text-[var(--cc-ink-soft)]">{prompt.message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link
          href={prompt.href}
          className="text-sm font-semibold text-[var(--cc-teal-deep)] hover:underline"
        >
          {prompt.cta}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm text-[var(--cc-ink-faint)] hover:text-[var(--cc-ink-muted)]"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}
