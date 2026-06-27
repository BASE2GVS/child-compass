"use client";

import { useState } from "react";
import { addTimelineEvent } from "@/lib/actions/checkin";
import { groupTimelineByDay } from "@/lib/dashboard/briefing";
import type { UnifiedTimelineItem } from "@/lib/types/database";
import {
  Button,
  EmptyState,
  FormSection,
  Input,
  Label,
  PremiumCard,
  Select,
  Textarea,
  TimelineCard,
} from "@/components/design-system";

const eventTypes = [
  { value: "school", label: "School" },
  { value: "sleep", label: "Sleep" },
  { value: "meltdown", label: "Meltdown" },
  { value: "victory", label: "Victory" },
  { value: "appointment", label: "Appointment" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
] as const;

export default function TimelineView({
  events,
  childId,
  childName,
}: {
  events: UnifiedTimelineItem[];
  childId: string;
  childName: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("note");
  const [loading, setLoading] = useState(false);

  const grouped = groupTimelineByDay(events);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await addTimelineEvent({ childId, eventType, title, description });
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "Add event"}
        </Button>
      </div>

      {showForm && (
        <PremiumCard>
          <FormSection title="Add to the story" description="Capture a moment that matters for your family.">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="eventType">Event type</Label>
                <Select id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  {eventTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save event"}
              </Button>
            </form>
          </FormSection>
        </PremiumCard>
      )}

      {events.length === 0 ? (
        <EmptyState
          illustration="timeline"
          title="Your story begins here"
          description={`Check-ins, debriefs, and insights will build ${childName}'s emotional journey over time.`}
          why="The timeline helps you spot patterns and share context with schools and therapists."
          actionLabel="Start today's check-in"
          actionHref={`/check-in?child=${childId}`}
        />
      ) : (
        <div className="space-y-12">
          {grouped.map(({ day, events: dayEvents }) => (
            <section key={day} aria-labelledby={`day-${day}`}>
              <h2 id={`day-${day}`} className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                {day}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {dayEvents.map((event) => (
                  <TimelineCard
                    key={event.id}
                    emoji={event.emoji}
                    label={event.label}
                    summary={event.summary}
                    time={new Date(event.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    bg={event.bg}
                    border={event.border}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
