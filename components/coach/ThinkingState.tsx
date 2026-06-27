"use client";

import { useEffect, useState } from "react";

const THINKING_PHRASES = [
  "Reflecting on what you've shared…",
  "Give me a moment…",
  "Thinking with you…",
];

export default function ThinkingState() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % THINKING_PHRASES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="mr-4 flex max-w-[85%] items-start gap-3 sm:mr-8"
      aria-live="polite"
      aria-label="Thinking"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A8D5CC] to-[#8FCEC4] text-lg shadow-sm"
        aria-hidden
      >
        🌿
      </div>
      <div className="rounded-[1.5rem] rounded-bl-md bg-gradient-to-br from-[#E8F6F3] via-[#F0FAF8] to-[#F3EFFA] px-5 py-4 shadow-[0_2px_12px_rgba(45,42,38,0.05)]">
        <p className="text-base font-medium text-[var(--cc-ink-muted)] transition-opacity duration-500">
          {THINKING_PHRASES[phraseIndex]}
        </p>
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-pulse rounded-full bg-[var(--cc-teal)]/50 motion-reduce:animate-none"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
