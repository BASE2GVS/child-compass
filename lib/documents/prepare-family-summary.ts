import { compareWeeklyRegulation } from "@/lib/ai/debrief-engine";
import { bullets, uniqueStrings } from "@/lib/documents/section-helpers";
import type { DocumentInput } from "@/lib/documents/document-input";
import type { CompanionInsight } from "@/lib/intelligence/insight-engine";
import type { ReportContent } from "@/lib/services/report-generator";

export function prepareFamilySummary(
  input: DocumentInput,
  companionInsights: CompanionInsight[] = [],
): ReportContent {
  const { child, profile, checkins, patterns, debriefs, activeGoals, coachHighlights } = input;
  const name = child.nickname || child.first_name;
  const weekCheckins = checkins.slice(0, 7);
  const trend = compareWeeklyRegulation(weekCheckins);

  const learning = uniqueStrings([
    ...companionInsights.slice(0, 5).map((i) => i.displayText),
    ...coachHighlights.slice(0, 2),
  ]);

  const progress: string[] = [];
  if (weekCheckins.length >= 2) {
    progress.push(trend.message);
  }
  progress.push(
    ...checkins
      .flatMap((c) => c.wins ?? [])
      .slice(0, 5),
  );
  for (const p of patterns.filter((p) =>
    /improv|recover|better|easier|success/i.test(`${p.title} ${p.description}`),
  ).slice(0, 3)) {
    progress.push(p.description);
  }

  const challenges = uniqueStrings([
    ...checkins.flatMap((c) => c.challenges ?? []).slice(0, 5),
    ...patterns
      .filter((p) => !/improv|recover|better/i.test(p.description))
      .map((p) => p.description)
      .slice(0, 3),
    ...debriefs
      .slice(0, 3)
      .map((d) => d.likely_trigger)
      .filter(Boolean) as string[],
  ]);

  const strategies = uniqueStrings([
    ...(profile?.successful_strategies ?? []),
    ...(profile?.calming_strategies ?? []),
    ...checkins
      .flatMap((c) => c.wins ?? [])
      .filter((w) => /strategy|choice|timer|visual|quiet/i.test(w))
      .slice(0, 4),
  ]);

  const supportAreas = uniqueStrings([
    ...(child.support_needs ?? []),
    ...(profile?.challenges ?? []),
    ...activeGoals.map((g) => g.title),
    ...input.uploadedDocuments
      .filter((d) => d.category === "assessments" || d.category === "support_plans")
      .slice(0, 3)
      .map((d) => d.title),
  ]);

  return {
    headline: `Family Summary — ${name}`,
    childName: name,
    generatedAt: new Date().toISOString(),
    sections: [
      { title: "What we're learning", body: bullets(learning) },
      { title: "Recent progress", body: bullets(progress) },
      { title: "Current challenges", body: bullets(challenges) },
      { title: "Strategies that are helping", body: bullets(strategies) },
      { title: "Areas we'd like support with", body: bullets(supportAreas) },
    ],
  };
}
