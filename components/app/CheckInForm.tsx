"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { saveCheckin } from "@/lib/actions/checkin";
import EditorialPage from "@/components/editorial/EditorialPage";
import DayTypeSelector from "@/components/timeline/DayTypeSelector";
import { Banner, Button } from "@/components/design-system";
import { inferDayType } from "@/lib/timeline/day-type";
import type { TimelineDayType } from "@/lib/types/database";
import EmotionalChoices from "@/components/check-in/EmotionalChoices";
import PaperTextarea from "@/components/check-in/PaperTextarea";
import CheckInComplete from "@/components/check-in/CheckInComplete";
import { FirstCheckinIntro } from "@/components/first-time";
import {
  buildCheckInSteps,
  MOOD_OPTIONS,
  type ScaleField,
  type TextField,
} from "@/components/check-in/check-in-steps";
import type { Child } from "@/lib/types/database";

type CheckInFormProps = {
  childId: string;
  childName: string;
  familyChildren: Child[];
  parentName?: string | null;
  isFirstCheckin?: boolean;
};

export default function CheckInForm({
  childId,
  childName,
  familyChildren,
  parentName,
  isFirstCheckin = false,
}: CheckInFormProps) {
  const steps = useMemo(() => buildCheckInSteps(childName), [childName]);

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
  const [dayType, setDayType] = useState<TimelineDayType>(inferDayType());

  const [stepIndex, setStepIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[stepIndex];

  const scaleSetters: Record<ScaleField, (v: number) => void> = {
    sleepQuality: setSleepQuality,
    energy: setEnergy,
    schoolRating: setSchoolRating,
    anxiety: setAnxiety,
    sensoryOverload: setSensoryOverload,
    demandTolerance: setDemandTolerance,
    appetite: setAppetite,
    socialBattery: setSocialBattery,
  };

  const scaleValues: Record<ScaleField, number> = {
    sleepQuality,
    energy,
    schoolRating,
    anxiety,
    sensoryOverload,
    demandTolerance,
    appetite,
    socialBattery,
  };

  const textSetters: Record<TextField, (v: string) => void> = {
    wins: setWins,
    challenges: setChallenges,
    notes: setNotes,
  };

  const textValues: Record<TextField, string> = {
    wins,
    challenges,
    notes,
  };

  const goNext = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setAnimating(false);
      }, 280);
    }
  }, [stepIndex, steps.length]);

  const goBack = useCallback(() => {
    if (stepIndex > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStepIndex((i) => i - 1);
        setAnimating(false);
      }, 280);
    }
  }, [stepIndex]);

  const scheduleAdvance = useCallback(
    (advance: () => void) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const delay = reduced ? 80 : 420;
      advanceTimer.current = setTimeout(advance, delay);
    },
    [],
  );

  function handleScaleChoice(field: ScaleField, value: number) {
    scaleSetters[field](value);
    if (stepIndex < steps.length - 1) {
      scheduleAdvance(goNext);
    }
  }

  function handleMoodChoice(value: number) {
    setMood(value);
    scheduleAdvance(goNext);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    const result = await saveCheckin({
      childId,
      dayType,
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
    }
  }

  const title =
    step.type === "mood" || step.type === "scale"
      ? step.title(childName)
      : step.title;

  return (
    <EditorialPage
      variant="checkin"
      title="Check-in"
      parentName={parentName}
      childName={childName}
      familyChildren={familyChildren}
      activeChildId={childId}
    >
      {isFirstCheckin && stepIndex === 0 && step.type !== "complete" && <FirstCheckinIntro />}
      <article
        className={`cc-flow-enter rounded-[1.5rem] bg-white/40 p-6 backdrop-blur-md sm:p-10 ${
          animating ? "animate-cc-slide-out motion-reduce:animate-none" : "animate-cc-slide-in motion-reduce:animate-none"
        }`}
        aria-live="polite"
        key={step.id}
      >
        {step.type !== "complete" && (
          <header>
            <h2 className="font-display text-2xl font-semibold leading-snug text-[var(--cc-ink)] sm:text-3xl">
              {title}
            </h2>
            {stepIndex === 0 && (
              <div className="mt-6">
                <DayTypeSelector value={dayType} onChange={setDayType} />
              </div>
            )}
          </header>
        )}

        {step.type === "mood" && (
          <EmotionalChoices
            options={MOOD_OPTIONS}
            value={mood}
            onChange={handleMoodChoice}
            groupLabel={`How is ${childName} feeling today?`}
            disabled={loading || animating}
          />
        )}

        {step.type === "scale" && (
          <EmotionalChoices
            options={step.options}
            value={scaleValues[step.field]}
            onChange={(v) => handleScaleChoice(step.field, v)}
            groupLabel={title}
            disabled={loading || animating}
          />
        )}

        {step.type === "text" && (
          <>
            <PaperTextarea
              id={`checkin-${step.field}`}
              value={textValues[step.field]}
              onChange={textSetters[step.field]}
              placeholder={step.placeholder}
              label={step.title}
              rows={step.multiline ? 5 : 3}
              disabled={loading}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              {stepIndex > 0 && (
                <Button type="button" variant="secondary" onClick={goBack}>
                  Back
                </Button>
              )}
              <Button type="button" variant="pill" onClick={goNext} className="flex-1 sm:flex-none">
                Continue
              </Button>
            </div>
          </>
        )}

        {step.type === "complete" && (
          <CheckInComplete childName={childName} loading={loading} onSubmit={handleSubmit} />
        )}

        {error && (
          <div className="mt-6">
            <Banner variant="warning">{error}</Banner>
          </div>
        )}

        {step.type !== "text" && step.type !== "complete" && stepIndex > 0 && (
          <div className="mt-8">
            <Button type="button" variant="secondary" onClick={goBack}>
              Back
            </Button>
          </div>
        )}
      </article>
    </EditorialPage>
  );
}
