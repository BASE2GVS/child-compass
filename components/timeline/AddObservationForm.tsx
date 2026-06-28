"use client";

import { useState } from "react";
import { addTimelineEventFromForm } from "@/lib/actions/checkin";
import FormSaveButton from "@/components/forms/FormSaveButton";
import DayTypeSelector from "@/components/timeline/DayTypeSelector";
import { Button, Input, Textarea } from "@/components/design-system";
import { SecondaryCard } from "@/components/framework/FrameworkCard";
import { inferDayType } from "@/lib/timeline/day-type";
import type { TimelineDayType } from "@/lib/types/database";
import { typeScale } from "@/components/design-system/tokens/typography";

const OBSERVATION_KINDS = [
  { kind: "observation", label: "Observation", emoji: "📝", eventType: "note" },
  { kind: "behaviour", label: "Behaviour", emoji: "🧠", eventType: "meltdown" },
  { kind: "funny", label: "Something funny", emoji: "😊", eventType: "victory" },
  { kind: "difficult", label: "Something difficult", emoji: "⚠", eventType: "meltdown" },
  { kind: "important", label: "Something important", emoji: "❤️", eventType: "note" },
] as const;

type AddObservationFormProps = {
  childId: string;
};

export default function AddObservationForm({ childId }: AddObservationFormProps) {
  const [open, setOpen] = useState(false);
  const [observationKind, setObservationKind] = useState<string>("observation");
  const [dayType, setDayType] = useState<TimelineDayType>(inferDayType());

  const selected = OBSERVATION_KINDS.find((k) => k.kind === observationKind) ?? OBSERVATION_KINDS[0];

  if (!open) {
    return (
      <div className="flex justify-center">
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          + Add to the story
        </Button>
      </div>
    );
  }

  return (
    <SecondaryCard padding="lg">
      <h2 className={typeScale.heading}>Add to the story</h2>
      <p className={`mt-2 ${typeScale.caption}`}>A quick note becomes part of your family timeline.</p>

      <form action={addTimelineEventFromForm} className="mt-6 space-y-5">
        <input type="hidden" name="childId" value={childId} />
        <input type="hidden" name="eventType" value={selected.eventType} />
        <input type="hidden" name="observationKind" value={observationKind} />
        <input type="hidden" name="dayType" value={dayType} />

        <div>
          <p className={`mb-3 ${typeScale.subheading}`}>What are you noticing?</p>
          <div className="flex flex-wrap gap-2">
            {OBSERVATION_KINDS.map((k) => {
              const active = observationKind === k.kind;
              return (
                <button
                  key={k.kind}
                  type="button"
                  onClick={() => setObservationKind(k.kind)}
                  aria-pressed={active}
                  className={`cc-fw-chip ${active ? "cc-fw-chip-active" : "cc-fw-chip-inactive"}`}
                >
                  <span aria-hidden>{k.emoji}</span>
                  {k.label}
                </button>
              );
            })}
          </div>
        </div>

        <DayTypeSelector value={dayType} onChange={setDayType} compact />

        <div>
          <label htmlFor="observation-title" className={typeScale.subheading}>
            In your own words
          </label>
          <Input
            id="observation-title"
            name="title"
            required
            placeholder="Amy slept until 08:10…"
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="observation-detail" className={typeScale.subheading}>
            Anything else to remember? <span className="font-normal text-[var(--cc-ink-faint)]">(optional)</span>
          </label>
          <Textarea
            id="observation-detail"
            name="description"
            rows={3}
            placeholder="Recovered after quiet time…"
            className="mt-2"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FormSaveButton variant="pill" savingLabel="Saving…">
            Save to timeline
          </FormSaveButton>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </SecondaryCard>
  );
}
