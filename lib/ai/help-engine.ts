import { generateDebriefResponse } from "@/lib/ai/debrief-engine";
import { assembleChildContext } from "@/lib/ai/child-context";
import type { Child, ChildProfile, DailyCheckin, ParentDebrief, PatternFinding } from "@/lib/types/database";
import type { TimelineEvent } from "@/lib/types/database";

export async function helpEngine(
  message: string,
  child: Child,
  profile: ChildProfile | null,
  checkins: DailyCheckin[],
  debriefs: ParentDebrief[],
  patterns: PatternFinding[],
  timeline: TimelineEvent[] = [],
) {
  const context = assembleChildContext(child, profile, checkins, debriefs, patterns, timeline);
  return generateDebriefResponse(message, context);
}
