import type {
  AIInsight,
  DailyCheckin,
  DocumentRecord,
  GeneratedReport,
  HealthObservation,
  ParentDebrief,
  SchoolHubEntry,
  TherapySession,
  TimelineDayType,
  UnifiedTimelineItem,
} from "@/lib/types/database";
import { categoryMeta, resolveCategory } from "@/lib/timeline/categories";
import { dayTypeContext, dayTypeLabel, inferDayType } from "@/lib/timeline/day-type";

export type TimelinePresentation = {
  headline: string;
  lines: string[];
  categoryLabel: string;
  categoryEmoji: string;
  dayTypeLabel: string | null;
  dayContext: string | null;
};

function item(
  partial: Omit<UnifiedTimelineItem, "category"> & { category?: UnifiedTimelineItem["category"] },
): UnifiedTimelineItem {
  const category =
    partial.category ??
    resolveCategory({
      source: partial.source,
      event_type: partial.event_type,
      title: partial.title,
      description: partial.description,
      metadata: partial.metadata,
    });
  return { ...partial, category };
}

function checkinLines(c: DailyCheckin): string[] {
  const lines: string[] = [];
  if (c.sleep_quality != null) lines.push(`Sleep quality ${c.sleep_quality}/5`);
  if (c.mood != null) lines.push(`Mood ${c.mood}/5`);
  if (c.energy != null) lines.push(`Energy ${c.energy}/5`);
  if (c.anxiety != null && c.anxiety >= 4) lines.push(`Higher anxiety today (${c.anxiety}/5)`);
  if (c.sensory_overload != null && c.sensory_overload >= 4) {
    lines.push(`Sensory overload noted (${c.sensory_overload}/5)`);
  }
  for (const win of c.wins ?? []) {
    if (win.trim()) lines.push(win.trim());
  }
  for (const challenge of c.challenges ?? []) {
    if (challenge.trim()) lines.push(challenge.trim());
  }
  if (c.notes?.trim()) lines.push(c.notes.trim());
  return lines;
}

export function buildCheckinItem(c: DailyCheckin): UnifiedTimelineItem {
  const dayType = (c.day_type as TimelineDayType | null) ?? inferDayType(new Date(c.checkin_date));
  const lines = checkinLines(c);
  const title =
    dayType === "weekend"
      ? "Weekend check-in"
      : dayType === "school_holiday"
        ? "School holiday check-in"
        : dayType === "holiday"
          ? "Holiday check-in"
          : "Daily check-in";

  return item({
    id: `checkin-${c.id}`,
    source: "checkin",
    event_type: "checkin",
    title,
    description: lines.join("\n"),
    event_date: `${c.checkin_date}T12:00:00Z`,
    day_type: dayType,
    metadata: { checkin_id: c.id, ref_table: "daily_checkins" },
    ref_id: c.id,
  });
}

export function buildDebriefItem(d: ParentDebrief): UnifiedTimelineItem {
  return item({
    id: `debrief-${d.id}`,
    source: "debrief",
    event_type: "debrief",
    category: "child_compass",
    title: "Talked with Child Compass",
    description: d.likely_trigger || d.parent_message.slice(0, 240),
    event_date: d.created_at,
    metadata: { debrief_id: d.id, ref_table: "parent_debriefs" },
    ref_id: d.id,
  });
}

export function buildInsightItem(i: AIInsight): UnifiedTimelineItem {
  return item({
    id: `insight-${i.id}`,
    source: "insight",
    event_type: "ai_insight",
    category: "child_compass",
    title: i.title,
    description: i.content,
    event_date: i.created_at,
    metadata: { insight_id: i.id, ref_table: "ai_insights" },
    ref_id: i.id,
  });
}

export function buildReportItem(r: GeneratedReport): UnifiedTimelineItem {
  const label = r.report_type.replace(/_/g, " ");
  return item({
    id: `report-${r.id}`,
    source: "report",
    event_type: "report",
    category: "documents",
    title: r.title,
    description: `${label} summary created`,
    event_date: r.created_at,
    metadata: { report_id: r.id, report_type: r.report_type, ref_table: "generated_reports" },
    ref_id: r.id,
  });
}

export function buildHealthItem(h: HealthObservation): UnifiedTimelineItem {
  const type = h.observation_type;
  let title = h.title;
  if (type === "medication") title = h.value ? `Medication: ${h.title}` : h.title;
  if (type === "sleep") title = h.title || "Sleep note";
  if (type === "appointment") title = h.title || "Health appointment";

  return item({
    id: `health-${h.id}`,
    source: "health",
    event_type: type,
    title,
    description: [h.value, h.notes].filter(Boolean).join(" — ") || null,
    event_date: `${h.observed_date}T09:00:00Z`,
    metadata: { health_id: h.id, ref_table: "health_observations" },
    ref_id: h.id,
  });
}

export function buildSchoolItem(e: SchoolHubEntry): UnifiedTimelineItem {
  return item({
    id: `school-${e.id}`,
    source: "school",
    event_type: "school",
    title: e.title,
    description: e.content.slice(0, 280),
    event_date: e.created_at,
    metadata: { school_entry_id: e.id, entry_type: e.entry_type, ref_table: "school_hub_entries" },
    ref_id: e.id,
  });
}

export function buildTherapyItem(s: TherapySession): UnifiedTimelineItem {
  return item({
    id: `therapy-${s.id}`,
    source: "therapy",
    event_type: "appointment",
    category: "therapy",
    title: s.therapist_name ? `Therapy with ${s.therapist_name}` : "Therapy session",
    description: s.notes || s.progress,
    event_date: `${s.session_date}T14:00:00Z`,
    metadata: { therapy_session_id: s.id, ref_table: "therapy_sessions" },
    ref_id: s.id,
  });
}

export function buildDocumentItem(d: DocumentRecord): UnifiedTimelineItem {
  return item({
    id: `document-${d.id}`,
    source: "document",
    event_type: "report",
    category: "documents",
    title: d.title,
    description: `${d.category} uploaded`,
    event_date: d.created_at,
    metadata: { document_id: d.id, ref_table: "documents" },
    ref_id: d.id,
  });
}

export function buildManualTimelineItem(e: {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  event_date: string;
  metadata: Record<string, unknown>;
}): UnifiedTimelineItem {
  const dayType = (e.metadata?.day_type as TimelineDayType | undefined) ?? null;
  return item({
    id: `event-${e.id}`,
    source: "timeline",
    event_type: e.event_type,
    title: e.title,
    description: e.description,
    event_date: e.event_date,
    day_type: dayType,
    metadata: { ...e.metadata, ref_table: "timeline_events" },
    ref_id: e.id,
  });
}

export function presentTimelineEntry(
  event: UnifiedTimelineItem,
  childName?: string,
): TimelinePresentation {
  const meta = categoryMeta(event.category);
  const lines = (event.description ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let headline = event.title;
  if (event.source === "checkin" && childName && lines[0]?.toLowerCase().includes("sleep")) {
    headline = lines[0].replace(/Sleep quality/i, `${childName} slept well`) || event.title;
  }

  return {
    headline,
    lines: lines.length > 0 && lines[0] !== headline ? lines : lines.slice(1),
    categoryLabel: meta.label,
    categoryEmoji: meta.emoji,
    dayTypeLabel: dayTypeLabel(event.day_type),
    dayContext: dayTypeContext(event.day_type),
  };
}
