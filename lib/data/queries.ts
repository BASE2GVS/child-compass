import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type {
  Child,
  ChildProfile,
  DailyCheckin,
  AIInsight,
  TimelineEvent,
  ParentDebrief,
  PatternFinding,
  GeneratedReport,
  DocumentRecord,
  Family,
  FamilyMember,
  Profile,
  UnifiedTimelineItem,
  CoachSession,
  CoachMessage,
  ChildGoal,
  GoalUpdate,
  Habit,
  HabitEntry,
  VisualSchedule,
  VisualScheduleItem,
  SchoolHubEntry,
  TherapySession,
  FamilyAccessInvite,
  ResourceLibraryItem,
  ChildIntelligenceSnapshot,
  HealthObservation,
} from "@/lib/types/database";
import { resolveActiveChild } from "@/lib/utils/child-selection";
import { compareWeeklyRegulation } from "@/lib/ai/debrief-engine";
import { getFamilyJourneyPhase } from "@/lib/intelligence/journey";
import { buildDashboardRecommendation } from "@/lib/ai/insight-generator";
import { computeRegulationLevel } from "@/lib/ai/debrief-engine";
import { buildFamilyIntelligence } from "@/lib/intelligence/family-intelligence";
import { QUERY_LIMITS } from "@/lib/scalability/query-limits";
import { buildChildIntelligence } from "@/lib/services/child-intelligence";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as Profile | null;
}

export async function getFamilyContext() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("family_members")
    .select("family_id, role, families(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return { user, family: null as Family | null, children: [] as Child[], members: [] as FamilyMember[] };

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("family_id", membership.family_id)
    .order("created_at", { ascending: true });

  const { data: members } = await supabase
    .from("family_members")
    .select("*")
    .eq("family_id", membership.family_id);

  return {
    user,
    family: membership.families as unknown as Family,
    children: (children || []) as Child[],
    members: (members || []) as FamilyMember[],
  };
}

export async function getChild(childId: string) {
  await requireUser();
  const supabase = await createClient();

  const { data: child } = await supabase.from("children").select("*").eq("id", childId).single();
  const { data: profile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("child_id", childId)
    .single();

  return { child: child as Child | null, profile: profile as ChildProfile | null };
}

export async function getCheckins(childId: string, limit = 30): Promise<DailyCheckin[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("child_id", childId)
    .order("checkin_date", { ascending: false })
    .limit(limit);
  return (data || []) as DailyCheckin[];
}

export async function getDebriefs(childId: string): Promise<ParentDebrief[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("parent_debriefs")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data || []) as ParentDebrief[];
}

export async function getPatterns(childId: string): Promise<PatternFinding[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("pattern_findings")
    .select("*")
    .eq("child_id", childId)
    .eq("is_active", true)
    .order("confidence", { ascending: false });
  return (data || []) as PatternFinding[];
}

export async function getInsights(childId: string, limit = 10): Promise<AIInsight[]> {
  const { family } = await getFamilyContext();
  if (!family) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as AIInsight[];
}

export async function getTimeline(childId: string, limit = 50): Promise<TimelineEvent[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("child_id", childId)
    .order("event_date", { ascending: false })
    .limit(limit);
  return (data || []) as TimelineEvent[];
}

export async function getUnifiedTimeline(childId: string, limit = 80): Promise<UnifiedTimelineItem[]> {
  await requireUser();
  const supabase = await createClient();

  const [events, checkins, debriefs, insights, reports] = await Promise.all([
    supabase
      .from("timeline_events")
      .select("*")
      .eq("child_id", childId)
      .order("event_date", { ascending: false })
      .limit(limit),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("child_id", childId)
      .order("checkin_date", { ascending: false })
      .limit(30),
    supabase
      .from("parent_debriefs")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("generated_reports")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const items: UnifiedTimelineItem[] = [];

  for (const e of events.data || []) {
    items.push({
      id: `event-${e.id}`,
      source: "timeline",
      event_type: e.event_type,
      title: e.title,
      description: e.description,
      event_date: e.event_date,
      metadata: e.metadata || {},
    });
  }

  for (const c of checkins.data || []) {
    items.push({
      id: `checkin-${c.id}`,
      source: "checkin",
      event_type: "checkin",
      title: "Daily check-in",
      description: `Mood ${c.mood}/5 · Sleep ${c.sleep_quality}/5 · Anxiety ${c.anxiety}/5`,
      event_date: `${c.checkin_date}T12:00:00Z`,
      metadata: { checkin_id: c.id },
    });
  }

  for (const d of debriefs.data || []) {
    items.push({
      id: `debrief-${d.id}`,
      source: "debrief",
      event_type: "debrief",
      title: "Parent Debrief™",
      description: d.likely_trigger || d.parent_message.slice(0, 120),
      event_date: d.created_at,
      metadata: { debrief_id: d.id },
    });
  }

  for (const i of insights.data || []) {
    items.push({
      id: `insight-${i.id}`,
      source: "insight",
      event_type: "ai_insight",
      title: i.title,
      description: i.content,
      event_date: i.created_at,
      metadata: { insight_id: i.id },
    });
  }

  for (const r of reports.data || []) {
    items.push({
      id: `report-${r.id}`,
      source: "report",
      event_type: "report",
      title: r.title,
      description: `Report generated: ${r.report_type.replace("_", " ")}`,
      event_date: r.created_at,
      metadata: { report_id: r.id, report_type: r.report_type },
    });
  }

  return items
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, limit);
}

export async function getDashboardData(searchParams?: { child?: string }) {
  const { user, family, children } = await getFamilyContext();
  const supabase = await createClient();

  const activeChild = await resolveActiveChild(children, searchParams);

  if (!family || !activeChild) {
    return {
      user,
      family,
      children,
      activeChild: null,
      checkin: null,
      yesterdayCheckin: null,
      insight: null,
      insights: [] as AIInsight[],
      timeline: [] as UnifiedTimelineItem[],
      regulation: null,
      weeklyTrend: null,
      recommendation: null,
      patterns: [] as PatternFinding[],
      unreadInsights: 0,
      journeyPhase: null,
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const [
    { data: checkin },
    { data: yesterdayCheckin },
    { data: insight },
    { data: insights },
    { data: patterns },
    { data: weekCheckins },
    { data: debriefSample },
  ] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("child_id", activeChild.id)
      .eq("checkin_date", today)
      .maybeSingle(),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("child_id", activeChild.id)
      .eq("checkin_date", yesterday)
      .maybeSingle(),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("child_id", activeChild.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("child_id", activeChild.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("pattern_findings")
      .select("*")
      .eq("child_id", activeChild.id)
      .eq("is_active", true)
      .order("confidence", { ascending: false })
      .limit(5),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("child_id", activeChild.id)
      .order("checkin_date", { ascending: false })
      .limit(7),
    supabase
      .from("parent_debriefs")
      .select("id")
      .eq("child_id", activeChild.id)
      .limit(1),
  ]);

  const timeline = await getUnifiedTimeline(activeChild.id, 5);
  const childName = activeChild.nickname || activeChild.first_name;

  const regulation = checkin
    ? computeRegulationLevel(checkin as DailyCheckin)
    : yesterdayCheckin
      ? computeRegulationLevel(yesterdayCheckin as DailyCheckin)
      : null;

  const weeklyTrend = compareWeeklyRegulation((weekCheckins || []) as DailyCheckin[]);
  const recommendation = buildDashboardRecommendation(
    childName,
    (checkin as DailyCheckin) || null,
    (patterns || []) as PatternFinding[],
  );

  const unreadInsights = (insights || []).filter((i: AIInsight) => !i.is_read).length;

  let headlineInsight = insight?.content || null;
  if (!headlineInsight && weeklyTrend.trend === "improving") {
    headlineInsight = `${childName} had a calmer week than last week.`;
  } else if (!headlineInsight && regulation?.level === "Elevated") {
    headlineInsight = `Today may be challenging because yesterday's regulation level was low.`;
  }

  const journeyPhase = getFamilyJourneyPhase(
    family.created_at,
    (weekCheckins || []).length,
    (patterns || []).length,
  );

  return {
    user,
    family,
    children,
    activeChild,
    checkin: checkin as DailyCheckin | null,
    yesterdayCheckin: yesterdayCheckin as DailyCheckin | null,
    insight: insight as AIInsight | null,
    insights: (insights || []) as AIInsight[],
    timeline,
    regulation,
    weeklyTrend,
    recommendation,
    patterns: (patterns || []) as PatternFinding[],
    unreadInsights,
    headlineInsight,
    hasDebrief: (debriefSample || []).length > 0,
    journeyPhase,
  };
}

export async function getReportsData(childId: string) {
  const { child, profile } = await getChild(childId);
  if (!child) return null;

  const [checkins, debriefs, patterns, reports] = await Promise.all([
    getCheckins(childId, 30),
    getDebriefs(childId),
    getPatterns(childId),
    getGeneratedReports(childId),
  ]);

  return { child, profile, checkins, debriefs, patterns, reports };
}

export async function getGeneratedReports(childId: string): Promise<GeneratedReport[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data || []) as GeneratedReport[];
}

export async function getDocuments(childId?: string): Promise<DocumentRecord[]> {
  const { family } = await getFamilyContext();
  if (!family) return [];
  const supabase = await createClient();

  let query = supabase
    .from("documents")
    .select("*")
    .eq("family_id", family.id)
    .order("created_at", { ascending: false });

  if (childId) {
    query = query.eq("child_id", childId);
  }

  const { data } = await query;
  return (data || []) as DocumentRecord[];
}

export async function getChildIntelligence(childId: string): Promise<ChildIntelligenceSnapshot> {
  const checkins = await getCheckins(childId, 14);
  return buildChildIntelligence(checkins);
}

export async function getCoachSession(childId: string): Promise<{
  session: CoachSession | null;
  messages: CoachMessage[];
}> {
  await requireUser();
  const { family, user } = await getFamilyContext();
  if (!family) return { session: null, messages: [] };
  const supabase = await createClient();

  let { data: session } = await supabase
    .from("coach_sessions")
    .select("*")
    .eq("child_id", childId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    const { data: created } = await supabase
      .from("coach_sessions")
      .insert({
        child_id: childId,
        family_id: family.id,
        user_id: user.id,
        title: "AI Child Coach",
      })
      .select()
      .single();
    session = created;
  }

  const { data: messages } = await supabase
    .from("coach_messages")
    .select("*")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  return {
    session: session as CoachSession,
    messages: (messages || []) as CoachMessage[],
  };
}

export async function getGoals(childId: string): Promise<{
  goals: ChildGoal[];
  updates: GoalUpdate[];
}> {
  await requireUser();
  const supabase = await createClient();
  const [{ data: goals }, { data: updates }] = await Promise.all([
    supabase
      .from("child_goals")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false }),
    supabase
      .from("goal_updates")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    goals: (goals || []) as ChildGoal[],
    updates: (updates || []) as GoalUpdate[],
  };
}

export async function getHabits(childId: string): Promise<{
  habits: Habit[];
  entries: HabitEntry[];
}> {
  await requireUser();
  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("child_id", childId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const ids = (habits || []).map((h) => h.id);
  if (ids.length === 0) return { habits: [], entries: [] };

  const { data: entries } = await supabase
    .from("habit_entries")
    .select("*")
    .in("habit_id", ids)
    .order("entry_date", { ascending: false })
    .limit(200);

  return {
    habits: (habits || []) as Habit[],
    entries: (entries || []) as HabitEntry[],
  };
}

export async function getVisualSchedules(childId: string): Promise<{
  schedules: VisualSchedule[];
  items: VisualScheduleItem[];
}> {
  await requireUser();
  const supabase = await createClient();
  const { data: schedules } = await supabase
    .from("visual_schedules")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  const scheduleIds = (schedules || []).map((s) => s.id);
  if (scheduleIds.length === 0) return { schedules: [], items: [] };

  const { data: items } = await supabase
    .from("visual_schedule_items")
    .select("*")
    .in("schedule_id", scheduleIds)
    .order("position", { ascending: true });

  return {
    schedules: (schedules || []) as VisualSchedule[],
    items: (items || []) as VisualScheduleItem[],
  };
}

export async function getSchoolHubEntries(childId: string): Promise<SchoolHubEntry[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("school_hub_entries")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false });
  return (data || []) as SchoolHubEntry[];
}

export async function getTherapySessions(childId: string): Promise<TherapySession[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("therapy_sessions")
    .select("*")
    .eq("child_id", childId)
    .order("session_date", { ascending: false });
  return (data || []) as TherapySession[];
}

export async function getFamilyInvites(): Promise<FamilyAccessInvite[]> {
  await requireUser();
  const { family } = await getFamilyContext();
  if (!family) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("family_access_invites")
    .select("*")
    .eq("family_id", family.id)
    .order("created_at", { ascending: false });
  return (data || []) as FamilyAccessInvite[];
}

export async function getResourceLibrary(search?: string): Promise<ResourceLibraryItem[]> {
  await requireUser();
  const supabase = await createClient();
  let query = supabase
    .from("resource_library_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (search?.trim()) {
    query = query.or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
  }

  const { data } = await query;
  return (data || []) as ResourceLibraryItem[];
}

export async function getGlobalSearchResults(search: string, childId?: string) {
  await requireUser();
  const supabase = await createClient();
  const q = search.trim();
  if (!q) {
    return {
      children: [] as Child[],
      reports: [] as GeneratedReport[],
      timeline: [] as TimelineEvent[],
      documents: [] as DocumentRecord[],
      insights: [] as AIInsight[],
      debriefs: [] as ParentDebrief[],
    };
  }

  const timelineQuery = supabase
    .from("timeline_events")
    .select("*")
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(8);
  const scopedTimelineQuery = childId ? timelineQuery.eq("child_id", childId) : timelineQuery;

  const [children, reports, timeline, documents, insights, debriefs] = await Promise.all([
    supabase.from("children").select("*").or(`first_name.ilike.%${q}%,nickname.ilike.%${q}%`).limit(8),
    supabase.from("generated_reports").select("*").ilike("title", `%${q}%`).limit(8),
    scopedTimelineQuery,
    supabase.from("documents").select("*").ilike("title", `%${q}%`).limit(8),
    supabase.from("ai_insights").select("*").or(`title.ilike.%${q}%,content.ilike.%${q}%`).limit(8),
    supabase.from("parent_debriefs").select("*").ilike("parent_message", `%${q}%`).limit(8),
  ]);

  return {
    children: (children.data || []) as Child[],
    reports: (reports.data || []) as GeneratedReport[],
    timeline: (timeline.data || []) as TimelineEvent[],
    documents: (documents.data || []) as DocumentRecord[],
    insights: (insights.data || []) as AIInsight[],
    debriefs: (debriefs.data || []) as ParentDebrief[],
  };
}

export async function getHealthObservations(childId: string): Promise<HealthObservation[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("health_observations")
    .select("*")
    .eq("child_id", childId)
    .order("observed_date", { ascending: false })
    .limit(50);
  return (data || []) as HealthObservation[];
}

export async function getFamilyIntelligenceSnapshot() {
  const { children } = await getFamilyContext();
  if (!children.length) return null;

  const checkinsByChild: Record<string, DailyCheckin[]> = {};
  const patternsByChild: Record<string, PatternFinding[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const [checkins, patterns] = await Promise.all([
        getCheckins(child.id, QUERY_LIMITS.dashboardCheckins),
        getPatterns(child.id),
      ]);
      checkinsByChild[child.id] = checkins;
      patternsByChild[child.id] = patterns;
    }),
  );

  return buildFamilyIntelligence(children, checkinsByChild, patternsByChild);
}
