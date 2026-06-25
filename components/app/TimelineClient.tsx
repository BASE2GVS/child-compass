"use client";

import { useState } from "react";
import { addTimelineEvent } from "@/lib/actions/checkin";
import type { TimelineEvent } from "@/lib/types/database";
import AppCard from "@/components/app/AppCard";

const eventTypes = [
  { value: "school", label: "School" },
  { value: "sleep", label: "Sleep" },
  { value: "meltdown", label: "Meltdown" },
  { value: "victory", label: "Victory" },
  { value: "appointment", label: "Appointment" },
  { value: "note", label: "Note" },
  { value: "other", label: "Other" },
] as const;

const typeColours: Record<string, string> = {
  school: "bg-blue-100 text-blue-700",
  sleep: "bg-indigo-100 text-indigo-700",
  meltdown: "bg-red-100 text-red-700",
  victory: "bg-emerald-100 text-emerald-700",
  appointment: "bg-amber-100 text-amber-700",
  note: "bg-slate-100 text-slate-700",
  ai_insight: "bg-[#14B8A6]/15 text-[#14B8A6]",
  checkin: "bg-violet-100 text-violet-700",
  other: "bg-slate-100 text-slate-600",
};

export default function TimelineClient({
  events,
  childId,
}: {
  events: TimelineEvent[];
  childId: string;
}) {
  const [showForm, setShowForm] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A]">Child Timeline™</h1>
          <p className="mt-2 text-slate-600">A chronological view of your child&apos;s journey</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-2xl bg-[#14B8A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0D9488]"
        >
          Add Event
        </button>
      </div>

      {showForm && (
        <AppCard>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Event type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm"
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-[#FAF8F4] px-4 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#14B8A6] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save Event
            </button>
          </form>
        </AppCard>
      )}

      <div className="relative space-y-0">
        <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-slate-200" />
        {events.length === 0 ? (
          <AppCard padding="lg">
            <p className="text-center text-slate-500">
              Events will appear here as you check in, debrief, and add notes.
            </p>
          </AppCard>
        ) : (
          events.map((event) => (
            <div key={event.id} className="relative flex gap-6 pb-8 pl-12">
              <div className="absolute left-3.5 h-3 w-3 rounded-full border-2 border-white bg-[#14B8A6] shadow" />
              <AppCard className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#0F172A]">{event.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(event.event_date).toLocaleString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${typeColours[event.event_type] || typeColours.other}`}>
                    {event.event_type.replace("_", " ")}
                  </span>
                </div>
                {event.description && (
                  <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                )}
              </AppCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
