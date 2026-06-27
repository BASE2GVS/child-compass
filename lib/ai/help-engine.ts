import { assembleChildContext } from "@/lib/ai/child-context";
import { generateCoachResponse } from "@/lib/ai/coach-engine";
import type {
  Child,
  ChildProfile,
  CoachMessage,
  DailyCheckin,
  ParentDebrief,
  PatternFinding,
  TimelineEvent,
} from "@/lib/types/database";

export async function helpEngine(
  message: string,
  child: Child,
  profile: ChildProfile | null,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
  timeline: TimelineEvent[] = [],
  conversationHistory: Pick<CoachMessage, "role" | "content">[] = [],
) {
  const context = assembleChildContext(child, profile, checkins, debriefs, patterns, timeline);
  const { response } = await generateCoachResponse(message, context, conversationHistory);
  return response;
}
