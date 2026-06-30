import { createClient } from "@/lib/supabase/server";
import type {
  Child,
  ChildProfile,
  CoachMessage,
  CoachSession,
  DailyCheckin,
  GeneratedReport,
  HealthObservation,
  TherapySession,
  TimelineEvent,
  VisualSchedule,
} from "@/lib/types/database";

export type JourneyFilter =
  | "all"
  | "conversations"
  | "health"
  | "sleep"
  | "school"
  | "milestones"
  | "calendar"
  | "reports"
  | "memories";

export type JourneySource =
  | "conversation"
  | "checkin"
  | "timeline"
  | "milestone"
  | "report"
  | "calendar"
  | "memory";

export type JourneyEntry = {
  id: string;
  source: JourneySource;
  filter: JourneyFilter;
  icon: string;
  title: string;
  summary: string;
  childId: string;
  childName: string;
  date: string;
  sourceLabel: string;
  href: string;
};

function truncate(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}...`;
}

function toReportLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function sourceHref(source: JourneySource, childId: string, refId?: string): string {
  if (source === "conversation") return `/coach?child=${childId}`;
  if (source === "checkin") return `/check-in?child=${childId}`;
  if (source === "timeline" || source === "milestone") return `/timeline?child=${childId}`;
  if (source === "calendar") return `/schedules?child=${childId}`;
  if (source === "report" && refId) return `/reports/${refId}?child=${childId}`;
  if (source === "report") return `/documents-hub?child=${childId}`;
  if (source === "memory") return `/compass?child=${childId}`;
  return `/timeline?child=${childId}`;
}

function buildConversationEntries(params: {
  child: Child;
  sessions: CoachSession[];
  messages: CoachMessage[];
}): JourneyEntry[] {
  const sessionIds = new Set(params.sessions.map((s) => s.id));
  const relevant = params.messages.filter((m) => sessionIds.has(m.session_id));

  return relevant
    .filter((m) => m.role === "parent" || m.role === "assistant")
    .slice(0, 60)
    .map((m) => ({
      id: `conversation-${m.id}`,
      source: "conversation",
      filter: "conversations",
      icon: "💬",
      title: m.role === "parent" ? "Parent message" : "Child Compass reply",
      summary: truncate(m.content, 200),
      childId: params.child.id,
      childName: params.child.nickname || params.child.first_name,
      date: m.created_at,
      sourceLabel: "Talk",
      href: sourceHref("conversation", params.child.id),
    }));
}

function buildCheckinEntries(child: Child, checkins: DailyCheckin[]): JourneyEntry[] {
  const childName = child.nickname || child.first_name;
  return checkins.map((c) => {
    const parts: string[] = [];
    if (c.sleep_quality != null) parts.push(`sleep ${c.sleep_quality}/5`);
    if (c.mood != null) parts.push(`mood ${c.mood}/5`);
    if (c.school_rating != null) parts.push(`school ${c.school_rating}/5`);
    if (c.wins?.length) parts.push(`wins: ${truncate(c.wins.join(", "), 80)}`);
    if (c.challenges?.length) parts.push(`challenges: ${truncate(c.challenges.join(", "), 80)}`);

    return {
      id: `checkin-${c.id}`,
      source: "checkin",
      filter: c.sleep_quality != null ? "sleep" : "health",
      icon: "📝",
      title: "Daily check-in",
      summary: parts.join(" • ") || "Daily check-in recorded",
      childId: child.id,
      childName,
      date: `${c.checkin_date}T12:00:00Z`,
      sourceLabel: "Daily check-in",
      href: sourceHref("checkin", child.id),
    };
  });
}

function isMilestoneEvent(event: TimelineEvent): boolean {
  const kind = String(event.metadata?.observation_kind || "").toLowerCase();
  if (kind === "milestone") return true;
  if (event.event_type === "victory") return true;
  const text = `${event.title} ${event.description || ""}`.toLowerCase();
  return text.includes("milestone") || text.includes("first time") || text.includes("breakthrough");
}

function buildTimelineEntries(child: Child, events: TimelineEvent[]): JourneyEntry[] {
  const childName = child.nickname || child.first_name;
  return events.map((event) => {
    const milestone = isMilestoneEvent(event);
    const filter: JourneyFilter = milestone
      ? "milestones"
      : event.event_type === "sleep"
        ? "sleep"
        : event.event_type === "school"
          ? "school"
          : "health";

    return {
      id: `${milestone ? "milestone" : "timeline"}-${event.id}`,
      source: milestone ? "milestone" : "timeline",
      filter,
      icon: milestone ? "🏆" : "📍",
      title: event.title,
      summary: truncate(event.description || "Timeline event", 200),
      childId: child.id,
      childName,
      date: event.event_date,
      sourceLabel: milestone ? "Milestone" : "Timeline event",
      href: sourceHref(milestone ? "milestone" : "timeline", child.id),
    };
  });
}

function buildReportEntries(child: Child, reports: GeneratedReport[]): JourneyEntry[] {
  const childName = child.nickname || child.first_name;
  return reports.map((report) => ({
    id: `report-${report.id}`,
    source: "report",
    filter: "reports",
    icon: "📄",
    title: report.title,
    summary: `${toReportLabel(report.report_type)} generated`,
    childId: child.id,
    childName,
    date: report.created_at,
    sourceLabel: "Report",
    href: sourceHref("report", child.id, report.id),
  }));
}

function buildCalendarEntries(params: {
  child: Child;
  therapy: TherapySession[];
  healthAppointments: HealthObservation[];
  schedules: VisualSchedule[];
}): JourneyEntry[] {
  const childName = params.child.nickname || params.child.first_name;
  const therapy = params.therapy.map<JourneyEntry>((session) => ({
    id: `calendar-therapy-${session.id}`,
    source: "calendar",
    filter: "calendar",
    icon: "🗓️",
    title: session.therapist_name ? `Therapy with ${session.therapist_name}` : "Therapy session",
    summary: truncate(session.notes || session.progress || "Therapy session logged", 180),
    childId: params.child.id,
    childName,
    date: `${session.session_date}T14:00:00Z`,
    sourceLabel: "Calendar",
    href: sourceHref("calendar", params.child.id),
  }));

  const appointments = params.healthAppointments.map<JourneyEntry>((item) => ({
    id: `calendar-health-${item.id}`,
    source: "calendar",
    filter: "calendar",
    icon: "🩺",
    title: item.title || "Health appointment",
    summary: truncate([item.value, item.notes].filter(Boolean).join(" • ") || "Health appointment", 180),
    childId: params.child.id,
    childName,
    date: `${item.observed_date}T09:00:00Z`,
    sourceLabel: "Calendar",
    href: sourceHref("calendar", params.child.id),
  }));

  const schedules = params.schedules.map<JourneyEntry>((s) => ({
    id: `calendar-schedule-${s.id}`,
    source: "calendar",
    filter: "calendar",
    icon: "📅",
    title: s.title,
    summary: `${s.schedule_type} schedule created`,
    childId: params.child.id,
    childName,
    date: s.created_at,
    sourceLabel: "Calendar",
    href: sourceHref("calendar", params.child.id),
  }));

  return [...therapy, ...appointments, ...schedules];
}

function buildMemoryEntries(child: Child, profile: ChildProfile | null): JourneyEntry[] {
  if (!profile) return [];

  const childName = child.nickname || child.first_name;
  const memories: Array<{ label: string; values: string[] }> = [
    { label: "Known trigger", values: profile.known_triggers || [] },
    { label: "Calming strategy", values: profile.calming_strategies || [] },
    { label: "Successful strategy", values: profile.successful_strategies || [] },
    { label: "Favourite thing", values: profile.favourite_things || [] },
    { label: "Challenge", values: profile.challenges || [] },
  ];

  const items: JourneyEntry[] = [];
  for (const memory of memories) {
    for (const value of memory.values) {
      const text = value.trim();
      if (!text) continue;
      items.push({
        id: `memory-${memory.label}-${text}`,
        source: "memory",
        filter: "memories",
        icon: "🧠",
        title: memory.label,
        summary: truncate(text, 180),
        childId: child.id,
        childName,
        date: profile.updated_at || profile.created_at,
        sourceLabel: "Memory",
        href: sourceHref("memory", child.id),
      });
      if (items.length >= 20) return items;
    }
  }

  return items;
}

export async function fetchJourneyTimeline(child: Child, limit = 200): Promise<JourneyEntry[]> {
  const supabase = await createClient();

  const [
    sessionsResult,
    checkinsResult,
    eventsResult,
    reportsResult,
    therapyResult,
    healthResult,
    schedulesResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("coach_sessions")
      .select("id, child_id, family_id, user_id, title, created_at")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("child_id", child.id)
      .order("checkin_date", { ascending: false })
      .limit(60),
    supabase
      .from("timeline_events")
      .select("*")
      .eq("child_id", child.id)
      .order("event_date", { ascending: false })
      .limit(80),
    supabase
      .from("generated_reports")
      .select("*")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("therapy_sessions")
      .select("*")
      .eq("child_id", child.id)
      .order("session_date", { ascending: false })
      .limit(30),
    supabase
      .from("health_observations")
      .select("*")
      .eq("child_id", child.id)
      .eq("observation_type", "appointment")
      .order("observed_date", { ascending: false })
      .limit(30),
    supabase
      .from("visual_schedules")
      .select("*")
      .eq("child_id", child.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("child_profiles")
      .select("*")
      .eq("child_id", child.id)
      .maybeSingle(),
  ]);

  const sessions = (sessionsResult.data || []) as CoachSession[];
  let messages: CoachMessage[] = [];

  if (sessions.length > 0) {
    const sessionIds = sessions.map((s) => s.id);
    const messageResult = await supabase
      .from("coach_messages")
      .select("id, session_id, role, content, metadata, created_at")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: false })
      .limit(120);

    messages = (messageResult.data || []) as CoachMessage[];
  }

  const conversationEntries = buildConversationEntries({ child, sessions, messages });
  const checkinEntries = buildCheckinEntries(child, (checkinsResult.data || []) as DailyCheckin[]);
  const timelineEntries = buildTimelineEntries(child, (eventsResult.data || []) as TimelineEvent[]);
  const reportEntries = buildReportEntries(child, (reportsResult.data || []) as GeneratedReport[]);
  const calendarEntries = buildCalendarEntries({
    child,
    therapy: (therapyResult.data || []) as TherapySession[],
    healthAppointments: (healthResult.data || []) as HealthObservation[],
    schedules: (schedulesResult.data || []) as VisualSchedule[],
  });
  const memoryEntries = buildMemoryEntries(child, (profileResult.data as ChildProfile | null) || null);

  return [
    ...conversationEntries,
    ...checkinEntries,
    ...timelineEntries,
    ...reportEntries,
    ...calendarEntries,
    ...memoryEntries,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
