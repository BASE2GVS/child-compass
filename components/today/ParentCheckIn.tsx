"use client";

import { useState } from "react";
import {
  parentMoodAcknowledgement,
  parentMoodStorageKey,
  type ParentMood,
} from "@/lib/companion/parent-checkin";

const MOOD_CHOICES: {
  id: ParentMood;
  emoji: string;
  label: string;
  tint: string;
  ring: string;
}[] = [
  { id: "okay", emoji: "😊", label: "Calm", tint: "bg-[#E8F6F3]", ring: "ring-[#A8D5CC]" },
  { id: "okay", emoji: "🙂", label: "Okay", tint: "bg-[#F0F5EE]", ring: "ring-[#B8D4C8]" },
  { id: "worried", emoji: "😟", label: "Worried", tint: "bg-[#F3EFFA]", ring: "ring-[#C9B8E0]" },
  { id: "exhausted", emoji: "😴", label: "Exhausted", tint: "bg-[#FBF4E6]", ring: "ring-[#E8C47A]" },
  { id: "need_to_talk", emoji: "❤️", label: "I just need someone", tint: "bg-[#FBEFEC]", ring: "ring-[#E8A598]" },
];

function readStoredMood(): ParentMood | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(parentMoodStorageKey());
    return (stored as ParentMood) || null;
  } catch {
    return null;
  }
}

type ParentCheckInProps = {
  parentName: string;
  childName: string;
  onMoodSelected?: (mood: ParentMood) => void;
};

export default function ParentCheckIn({ parentName, childName, onMoodSelected }: ParentCheckInProps) {
  const [mood, setMood] = useState<ParentMood | null>(readStoredMood);
  const [dismissed, setDismissed] = useState(false);

  function select(selected: ParentMood) {
    setMood(selected);
    try {
      localStorage.setItem(parentMoodStorageKey(), selected);
    } catch {
      // ignore
    }
    onMoodSelected?.(selected);
    if (selected === "skipped") setDismissed(true);
  }

  if (dismissed || mood === "skipped") return null;

  if (mood) {
    const ack = parentMoodAcknowledgement(mood, parentName, childName);
    return (
      <div className="rounded-[1.75rem] border border-white/58 bg-gradient-to-br from-[#F3EFFA]/42 to-white/52 p-8 shadow-[0_8px_24px_rgba(45,42,38,0.07)] backdrop-blur-xl">
        <p className="font-display text-xl font-medium leading-relaxed text-[var(--cc-ink-soft)]">
          {ack}
        </p>
        <button
          type="button"
          onClick={() => select("skipped")}
          className="mt-4 text-sm font-semibold text-[var(--cc-ink-faint)] hover:text-[var(--cc-teal)]"
        >
          Change how I&apos;m feeling
        </button>
      </div>
    );
  }

  return (
    <section
      className="rounded-[1.75rem] border border-white/58 bg-white/56 p-8 shadow-[0_8px_24px_rgba(45,42,38,0.07)] backdrop-blur-xl sm:p-10"
      aria-labelledby="parent-checkin-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cc-teal)]">
        A moment for you
      </p>
      <h2 id="parent-checkin-heading" className="mt-2 font-display text-2xl font-semibold text-[var(--cc-ink)]">
        How are you feeling?
      </h2>
      <p className="mt-2 text-base text-[var(--cc-ink-muted)]">
        Optional — {childName} benefits when you&apos;re supported too.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {MOOD_CHOICES.map((choice) => (
          <button
            key={`${choice.id}-${choice.label}`}
            type="button"
            onClick={() => select(choice.id)}
            className={`flex min-h-[4.5rem] items-center gap-4 rounded-2xl ${choice.tint} px-5 py-4 text-left ring-1 ${choice.ring} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-teal)]`}
          >
            <span className="text-3xl" aria-hidden="true">
              {choice.emoji}
            </span>
            <span className="text-base font-semibold text-[var(--cc-ink)]">{choice.label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => select("skipped")}
        className="mt-6 w-full text-center text-sm font-medium text-[var(--cc-ink-faint)] hover:text-[var(--cc-ink-muted)]"
      >
        Skip for now
      </button>
    </section>
  );
}
