"use client";

import { useState } from "react";
import { addTimelineEventFromForm } from "@/lib/actions/checkin";
import FormSaveButton from "@/components/forms/FormSaveButton";
import { Button, Input, Textarea } from "@/components/design-system";
import { SecondaryCard } from "@/components/framework/FrameworkCard";
import { typeScale } from "@/components/design-system/tokens/typography";

const eventTypes = [
  { value: "school", label: "School", emoji: "🏫" },
  { value: "sleep", label: "Sleep", emoji: "😴" },
  { value: "meltdown", label: "Difficult moment", emoji: "💛" },
  { value: "victory", label: "A win", emoji: "🌟" },
  { value: "appointment", label: "Appointment", emoji: "📅" },
  { value: "note", label: "A note", emoji: "📝" },
  { value: "other", label: "Other", emoji: "✨" },
] as const;

type AddMomentFormProps = {
  childId: string;
};

export default function AddMomentForm({ childId }: AddMomentFormProps) {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState("note");

  if (!open) {
    return (
      <div className="flex justify-center">
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          + Add a moment to the story
        </Button>
      </div>
    );
  }

  return (
    <SecondaryCard padding="lg">
      <h2 className={typeScale.heading}>Add to the story</h2>
      <p className={`mt-2 ${typeScale.caption}`}>Capture a moment that matters for your family.</p>

      <form action={addTimelineEventFromForm} className="mt-6 space-y-5">
        <input type="hidden" name="childId" value={childId} />
        <input type="hidden" name="eventType" value={eventType} />

        <div>
          <p className={`mb-3 ${typeScale.subheading}`}>What kind of moment?</p>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((t) => {
              const active = eventType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setEventType(t.value)}
                  aria-pressed={active}
                  className={`cc-fw-chip ${active ? "cc-fw-chip-active" : "cc-fw-chip-inactive"}`}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="moment-title" className={typeScale.subheading}>
            What happened?
          </label>
          <Input
            id="moment-title"
            name="title"
            required
            placeholder="A moment worth remembering…"
            className="mt-2"
          />
        </div>

        <div>
          <label htmlFor="moment-description" className={typeScale.subheading}>
            Anything else to remember? <span className="font-normal text-[var(--cc-ink-faint)]">(optional)</span>
          </label>
          <Textarea
            id="moment-description"
            name="description"
            rows={3}
            placeholder="How it felt, what helped…"
            className="mt-2"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FormSaveButton variant="pill" savingLabel="Saving…">
            Save this moment
          </FormSaveButton>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </SecondaryCard>
  );
}
