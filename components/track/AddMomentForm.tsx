"use client";

import { useState } from "react";
import { addTimelineEvent } from "@/lib/actions/checkin";
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("note");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await addTimelineEvent({ childId, eventType, title, description });
    setLoading(false);
  }

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

      <form onSubmit={handleAdd} className="mt-6 space-y-5">
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
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="How it felt, what helped…"
            className="mt-2"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="pill" disabled={loading}>
            {loading ? "Saving…" : "Save this moment"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </SecondaryCard>
  );
}
