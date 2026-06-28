import { createClient } from "@/lib/supabase/server";
import { detectPatterns } from "@/lib/services/pattern-engine";
import { generateInsight } from "@/lib/ai/insight-generator";
import { generateWeeklyFamilyReview } from "@/lib/intelligence/weekly-review";
import { buildFamilyMemory } from "@/lib/intelligence/memory";
import { evaluateGoalsFromCheckins } from "@/lib/intelligence/smart-goals";
import {
  getCached,
  intelligenceCacheKey,
  setCached,
} from "@/lib/intelligence/cache";
import { withPerformance } from "@/lib/observability/metrics";
import type { Child, DailyCheckin, PatternFinding } from "@/lib/types/database";

export async function runIntelligenceAnalysis(childId: string, familyId: string) {
  return withPerformance("intelligence_analysis", () =>
    runIntelligenceAnalysisCore(childId, familyId),
  );
}

async function runIntelligenceAnalysisCore(childId: string, familyId: string) {
  const supabase = await createClient();

  const { data: child } = await supabase
    .from("children")
    .select("first_name, nickname")
    .eq("id", childId)
    .single();

  if (!child) return { patterns: [], insight: null };

  const { data: checkins } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("child_id", childId)
    .order("checkin_date", { ascending: false })
    .limit(30);

  const checkinList = (checkins || []) as DailyCheckin[];
  const today = new Date().toISOString().split("T")[0];
  const cacheKey = intelligenceCacheKey(childId, checkinList.length, today);

  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("child_id", childId)
    .order("event_date", { ascending: false })
    .limit(50);

  let candidates = getCached<ReturnType<typeof detectPatterns>>(`${cacheKey}:patterns`);
  if (!candidates) {
    candidates = detectPatterns(childId, familyId, checkinList, timeline || []);
    setCached(`${cacheKey}:patterns`, candidates);
  }

  const savedPatterns: PatternFinding[] = [];

  for (const candidate of candidates) {
    const { data: existing } = await supabase
      .from("pattern_findings")
      .select("id")
      .eq("child_id", childId)
      .eq("title", candidate.title)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("pattern_findings")
        .update({
          description: candidate.description,
          confidence: candidate.confidence,
          evidence: candidate.evidence,
          is_active: true,
        })
        .eq("id", existing.id);
    } else {
      const { data: inserted } = await supabase
        .from("pattern_findings")
        .insert(candidate)
        .select()
        .single();
      if (inserted) savedPatterns.push(inserted as PatternFinding);
    }
  }

  const { data: allPatterns } = await supabase
    .from("pattern_findings")
    .select("*")
    .eq("child_id", childId)
    .eq("is_active", true)
    .order("confidence", { ascending: false });

  const patternList = (allPatterns || []) as PatternFinding[];
  setCached(cacheKey, { patterns: patternList });

  const childName = (child as Child).nickname || (child as Child).first_name;
  const insight = await generateInsight(childName, checkinList, patternList);

  if (insight) {
    const { data: recentInsight } = await supabase
      .from("ai_insights")
      .select("id, title")
      .eq("child_id", childId)
      .eq("insight_type", insight.insight_type)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString())
      .maybeSingle();

    if (!recentInsight || recentInsight.title !== insight.title) {
      await supabase.from("ai_insights").insert({
        child_id: childId,
        family_id: familyId,
        insight_type: insight.insight_type,
        title: insight.title,
        content: insight.content,
        confidence: insight.confidence,
        is_read: false,
      });
    }
  }

  const { data: goals } = await supabase
    .from("child_goals")
    .select("*")
    .eq("child_id", childId)
    .eq("status", "active");

  if (goals?.length) {
    const evaluations = evaluateGoalsFromCheckins(goals, checkinList);
    for (const evaluation of evaluations) {
      if (!evaluation.shouldUpdate) continue;
      await supabase
        .from("child_goals")
        .update({ current_value: evaluation.suggestedValue })
        .eq("id", evaluation.goalId);
    }
  }

  const isSunday = new Date().getDay() === 0;
  if (isSunday && checkinList.length > 0) {
    const { data: existingWeekly } = await supabase
      .from("generated_reports")
      .select("id")
      .eq("child_id", childId)
      .eq("report_type", "weekly_summary")
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
      .maybeSingle();

    if (!existingWeekly) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { patterns: patternList, insight };
      }

      const { data: profile } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("child_id", childId)
        .maybeSingle();
      const { data: debriefs } = await supabase
        .from("parent_debriefs")
        .select("*")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(10);

      const weekCheckins = checkinList.slice(0, 7);
      const memories = buildFamilyMemory({
        profile: profile || null,
        checkins: checkinList,
        debriefs: debriefs || [],
        timeline: timeline || [],
        patterns: patternList,
      });

      const weeklyReview = await generateWeeklyFamilyReview(
        childName,
        weekCheckins,
        patternList,
        memories,
      );

      await supabase.from("generated_reports").insert({
        child_id: childId,
        family_id: familyId,
        user_id: user.id,
        report_type: "weekly_summary",
        title: `AI Weekly Review™ — ${childName}`,
        content: {
          headline: weeklyReview.headline,
          biggestSuccess: weeklyReview.biggestSuccess,
          biggestChallenge: weeklyReview.biggestChallenge,
          progressMade: weeklyReview.progressMade,
          patternsDiscovered: weeklyReview.patternsDiscovered,
          recommendationsNextWeek: weeklyReview.recommendationsNextWeek,
          celebration: weeklyReview.celebration,
          highlights: [weeklyReview.biggestSuccess],
          challenges: [weeklyReview.biggestChallenge],
          patterns: weeklyReview.patternsDiscovered,
          suggestions: weeklyReview.recommendationsNextWeek,
          goals_next_week: weeklyReview.recommendationsNextWeek,
          learnings: weeklyReview.learnings,
          generatedBy: "AI Weekly Review™",
          generatedAt: new Date().toISOString(),
        },
      });
    }
  }

  return {
    patterns: patternList,
    insight,
  };
}
