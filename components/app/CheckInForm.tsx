"use client";

import { useState } from "react";
import { saveCheckin } from "@/lib/actions/checkin";
import SliderField from "@/components/app/SliderField";
import {
  Banner,
  Button,
  GlassCard,
  PremiumCard,
  ProgressBar,
  Textarea,
} from "@/components/design-system";
import { actionCopy, aiCopy } from "@/lib/presentation/copy";

const MOOD_EMOJIS = ["😢", "😕", "😐", "🙂", "😊"];

type Step =
  | { id: "welcome"; title: string; subtitle: string }
  | { id: "sliders"; fields: { key: string; label: string; value: number; set: (v: number) => void; low?: string; high?: string }[]; title: string; subtitle: string }
  | { id: "reflection"; title: string; subtitle: string }
  | { id: "celebration"; title: string; subtitle: string };

export default function CheckInForm({
  childId,
  childName,
}: {
  childId: string;
  childName: string;
}) {
  const [sleepQuality, setSleepQuality] = useState(3);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [schoolRating, setSchoolRating] = useState(3);
  const [anxiety, setAnxiety] = useState(3);
  const [sensoryOverload, setSensoryOverload] = useState(3);
  const [demandTolerance, setDemandTolerance] = useState(3);
  const [appetite, setAppetite] = useState(3);
  const [socialBattery, setSocialBattery] = useState(3);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [notes, setNotes] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const steps: Step[] = [
    {
      id: "welcome",
      title: `How is ${childName} feeling today?`,
      subtitle: "Tap the emoji that feels closest — there are no wrong answers.",
    },
    {
      id: "sliders",
      title: "Rest & energy",
      subtitle: "Sleep and energy shape the whole day.",
      fields: [
        { key: "sleep", label: "Sleep", value: sleepQuality, set: setSleepQuality, low: "Poor", high: "Great" },
        { key: "energy", label: "Energy", value: energy, set: setEnergy, low: "Low", high: "High" },
      ],
    },
    {
      id: "sliders",
      title: "School & emotions",
      subtitle: "Help Child Compass understand today's demands.",
      fields: [
        { key: "school", label: "School", value: schoolRating, set: setSchoolRating, low: "Hard", high: "Good" },
        { key: "anxiety", label: "Anxiety", value: anxiety, set: setAnxiety, low: "Calm", high: "High" },
      ],
    },
    {
      id: "sliders",
      title: "Regulation",
      subtitle: "Sensory load and demand tolerance matter.",
      fields: [
        { key: "sensory", label: "Sensory overload", value: sensoryOverload, set: setSensoryOverload, low: "Low", high: "High" },
        { key: "demand", label: "Demand tolerance", value: demandTolerance, set: setDemandTolerance, low: "Low", high: "High" },
      ],
    },
    {
      id: "sliders",
      title: "Body & connection",
      subtitle: "Appetite and social battery complete the picture.",
      fields: [
        { key: "appetite", label: "Appetite", value: appetite, set: setAppetite },
        { key: "social", label: "Social battery", value: socialBattery, set: setSocialBattery, low: "Empty", high: "Full" },
      ],
    },
    {
      id: "reflection",
      title: "Celebrate & reflect",
      subtitle: "Wins matter as much as challenges.",
    },
    {
      id: "celebration",
      title: "Ready to save?",
      subtitle: "Child Compass will use this to personalise your dashboard.",
    },
  ];

  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const result = await saveCheckin({
      childId,
      sleepQuality,
      mood,
      energy,
      schoolRating,
      anxiety,
      sensoryOverload,
      demandTolerance,
      appetite,
      socialBattery,
      wins: wins.split("\n").filter(Boolean),
      challenges: challenges.split("\n").filter(Boolean),
      notes,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setComplete(true);
    setLoading(false);
  }

  if (complete) {
    return (
      <GlassCard padding="lg" className="text-center animate-fade-in">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#14B8A6]/20 to-emerald-100 text-5xl" aria-hidden="true">
          🎉
        </div>
        <h2 className="mt-6 text-2xl font-bold text-[#0F172A]">You did it!</h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[#64748B]">
          {aiCopy.checkinSaved} {childName}&apos;s dashboard now reflects today.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/dashboard" className="rounded-2xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0D9488]">
            View dashboard
          </a>
          <a href={`/children/${childId}`} className="rounded-2xl border border-[#E8E4DC] bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#FAF8F4]">
            Child profile
          </a>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProgressBar label={`Step ${stepIndex + 1} of ${steps.length}`} value={progress} />

      <PremiumCard padding="lg" className="animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#14B8A6]">Daily Check-In</p>
        <h2 className="mt-2 text-2xl font-bold text-[#0F172A]">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{step.subtitle}</p>

        {step.id === "welcome" && (
          <div className="mt-8 flex justify-center gap-3" role="radiogroup" aria-label="Mood">
            {MOOD_EMOJIS.map((emoji, i) => {
              const value = i + 1;
              return (
                <button
                  key={emoji}
                  type="button"
                  role="radio"
                  aria-checked={mood === value}
                  onClick={() => setMood(value)}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition-all ${
                    mood === value
                      ? "scale-110 bg-[#14B8A6]/15 ring-2 ring-[#14B8A6]/40 shadow-md"
                      : "bg-[#FAF8F4] hover:bg-[#14B8A6]/10"
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}

        {step.id === "sliders" && (
          <div className="mt-8 space-y-6">
            {step.fields.map((field) => (
              <SliderField
                key={field.key}
                label={field.label}
                name={field.key}
                value={field.value}
                onChange={field.set}
                lowLabel={field.low}
                highLabel={field.high}
              />
            ))}
          </div>
        )}

        {step.id === "reflection" && (
          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">Today&apos;s wins 🌟</label>
              <Textarea rows={3} value={wins} onChange={(e) => setWins(e.target.value)} placeholder="One line per win — every small victory counts" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">Today&apos;s challenges</label>
              <Textarea rows={3} value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="What felt hard today?" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">Anything else?</label>
              <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Free notes for your family story" />
            </div>
          </div>
        )}

        {step.id === "celebration" && (
          <div className="mt-8 rounded-2xl bg-[#FAF8F4] p-6 text-center">
            <p className="text-4xl" aria-hidden="true">{MOOD_EMOJIS[mood - 1]}</p>
            <p className="mt-3 text-sm text-[#64748B]">
              You&apos;re building a meaningful record for {childName}. This takes courage.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6">
            <Banner variant="warning">{error}</Banner>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {stepIndex > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStepIndex((i) => i - 1)}>
              {actionCopy.goBack}
            </Button>
          )}
          {stepIndex < steps.length - 1 ? (
            <Button type="button" onClick={() => setStepIndex((i) => i + 1)}>
              {actionCopy.continue}
            </Button>
          ) : (
            <Button type="button" disabled={loading} onClick={handleSubmit}>
              {loading ? "Saving your check-in…" : actionCopy.saveCheckin}
            </Button>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
