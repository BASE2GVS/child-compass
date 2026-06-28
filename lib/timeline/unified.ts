import { createClient } from "@/lib/supabase/server";
import { isMirroredTimelineEvent } from "@/lib/timeline/categories";
import {
  buildCheckinItem,
  buildDebriefItem,
  buildDocumentItem,
  buildHealthItem,
  buildInsightItem,
  buildManualTimelineItem,
  buildReportItem,
  buildSchoolItem,
  buildTherapyItem,
} from "@/lib/timeline/presentation";
import type { UnifiedTimelineItem } from "@/lib/types/database";

export async function fetchUnifiedTimeline(childId: string, limit = 120): Promise<UnifiedTimelineItem[]> {
  const supabase = await createClient();

  const [events, checkins, debriefs, insights, reports, health, school, therapy, documents] =
    await Promise.all([
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
      .limit(60),
    supabase
      .from("parent_debriefs")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("ai_insights")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("generated_reports")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("health_observations")
      .select("*")
      .eq("child_id", childId)
      .order("observed_date", { ascending: false })
      .limit(40),
    supabase
      .from("school_hub_entries")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("therapy_sessions")
      .select("*")
      .eq("child_id", childId)
      .order("session_date", { ascending: false })
      .limit(30),
    supabase
      .from("documents")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const items: UnifiedTimelineItem[] = [];

  for (const e of events.data || []) {
    if (isMirroredTimelineEvent(e.event_type)) continue;
    items.push(buildManualTimelineItem(e));
  }

  for (const c of checkins.data || []) {
    items.push(buildCheckinItem(c));
  }
  for (const d of debriefs.data || []) {
    items.push(buildDebriefItem(d));
  }
  for (const i of insights.data || []) {
    items.push(buildInsightItem(i));
  }
  for (const r of reports.data || []) {
    items.push(buildReportItem(r));
  }
  for (const h of health.data || []) {
    items.push(buildHealthItem(h));
  }
  for (const s of school.data || []) {
    items.push(buildSchoolItem(s));
  }
  for (const t of therapy.data || []) {
    items.push(buildTherapyItem(t));
  }
  for (const doc of documents.data || []) {
    items.push(buildDocumentItem(doc));
  }

  return items
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, limit);
}
