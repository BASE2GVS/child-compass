import type { Child, ChildProfile, CoachMessage, DailyCheckin, ParentDebrief, PatternFinding, TimelineEvent } from "@/lib/types/database";
import { CONTEXT_LIMITS } from "@/lib/talk-v2/context/constants";

type QueryResult<T> = Promise<{ data: T[] | null }>;

type SingleQueryResult<T> = Promise<{ data: T | null }>;

type SupabaseLike = {
  from: (table: string) => {
    select: (fields: string) => {
      eq: (column: string, value: string) => any;
      order: (column: string, options: { ascending: boolean }) => any;
      limit: (count: number) => QueryResult<any>;
      maybeSingle: () => SingleQueryResult<any>;
      single: () => SingleQueryResult<any>;
    };
  };
};

export type ContextRepositoryInput = {
  supabase: SupabaseLike;
  childId: string;
  sessionId: string;
};

export type ContextRepositoryOutput = {
  child: Child | null;
  profile: ChildProfile | null;
  recentConversation: CoachMessage[];
  dailyCheckins: DailyCheckin[];
  timelineHighlights: TimelineEvent[];
  behaviourPatterns: PatternFinding[];
  recentDebriefs: ParentDebrief[];
};

export async function fetchContextData(
  input: ContextRepositoryInput,
): Promise<ContextRepositoryOutput> {
  const { supabase, childId, sessionId } = input;

  const [
    childResult,
    profileResult,
    conversationResult,
    checkinsResult,
    timelineResult,
    patternsResult,
    debriefsResult,
  ] = await Promise.all([
    supabase.from("children").select("*").eq("id", childId).maybeSingle(),
    supabase.from("child_profiles").select("*").eq("child_id", childId).maybeSingle(),
    supabase
      .from("coach_messages")
      .select("id, role, content, created_at, session_id, metadata")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(CONTEXT_LIMITS.recentConversation),
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("child_id", childId)
      .order("checkin_date", { ascending: false })
      .limit(CONTEXT_LIMITS.dailyCheckins),
    supabase
      .from("timeline_events")
      .select("*")
      .eq("child_id", childId)
      .order("event_date", { ascending: false })
      .limit(CONTEXT_LIMITS.timelineHighlights),
    supabase
      .from("pattern_findings")
      .select("*")
      .eq("child_id", childId)
      .eq("is_active", true)
      .order("confidence", { ascending: false })
      .limit(CONTEXT_LIMITS.behaviourPatterns),
    supabase
      .from("parent_debriefs")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(CONTEXT_LIMITS.recentDebriefs),
  ]);

  const recentConversation = ((conversationResult.data || []) as CoachMessage[])
    .slice()
    .reverse();

  return {
    child: (childResult.data as Child | null) || null,
    profile: (profileResult.data as ChildProfile | null) || null,
    recentConversation,
    dailyCheckins: (checkinsResult.data || []) as DailyCheckin[],
    timelineHighlights: (timelineResult.data || []) as TimelineEvent[],
    behaviourPatterns: (patternsResult.data || []) as PatternFinding[],
    recentDebriefs: (debriefsResult.data || []) as ParentDebrief[],
  };
}
