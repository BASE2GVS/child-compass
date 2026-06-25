import type { AIInsight, DailyCheckin, PatternFinding } from "@/lib/types/database";
import { getLLMProvider, isExternalLLMConfigured } from "@/lib/ai/future-provider";
import { buildInsightPrompt } from "@/lib/ai/prompt-builder";
import { parseInsightResponse } from "@/lib/ai/response-parser";
import { computeRegulationLevel } from "@/lib/ai/debrief-engine";

export type GeneratedInsight = Pick<AIInsight, "title" | "content" | "confidence" | "insight_type">;

function buildLocalInsight(
  childName: string,
  checkins: DailyCheckin[],
  patterns: PatternFinding[],
): GeneratedInsight | null {
  if (checkins.length === 0 && patterns.length === 0) return null;

  const today = checkins[0];
  const name = childName;

  if (today) {
    const sleep = today.sleep_quality ?? 3;
    const anxiety = today.anxiety ?? 3;
    const school = today.school_rating ?? 3;

    if (sleep <= 2 && school <= 2) {
      return {
        title: "Sleep and school connection",
        content: `Poor sleep last night may make school harder for ${name} today. A calmer morning and reduced demands could help.`,
        confidence: 0.85,
        insight_type: "pattern",
      };
    }

    if (anxiety >= 4) {
      return {
        title: "Elevated anxiety today",
        content: `${name}'s anxiety is higher than usual. Consider lowering demands and offering extra co-regulation before tackling challenges.`,
        confidence: 0.8,
        insight_type: "daily",
      };
    }

    const regulation = computeRegulationLevel(today);
    if (regulation.level === "Regulated") {
      return {
        title: "A regulated day",
        content: `${name} is in a good place today. This could be a gentle window for connection or trying something new together.`,
        confidence: 0.75,
        insight_type: "daily",
      };
    }

    if (regulation.level === "Elevated") {
      return {
        title: "Capacity is low today",
        content: `Yesterday's regulation level was low. Today may be challenging — prioritise safety, connection, and reducing demands for ${name}.`,
        confidence: 0.82,
        insight_type: "daily",
      };
    }
  }

  const topPattern = patterns.find((p) => p.is_active);
  if (topPattern) {
    return {
      title: topPattern.title,
      content: topPattern.description,
      confidence: topPattern.confidence ?? 0.7,
      insight_type: "pattern",
    };
  }

  if (checkins.length >= 5) {
    const mondayCheckins = checkins.filter((c) => new Date(c.checkin_date).getDay() === 1);
    const avgMondayAnxiety =
      mondayCheckins.reduce((s, c) => s + (c.anxiety ?? 3), 0) / (mondayCheckins.length || 1);
    const avgOtherAnxiety =
      checkins
        .filter((c) => new Date(c.checkin_date).getDay() !== 1)
        .reduce((s, c) => s + (c.anxiety ?? 3), 0) /
      (checkins.filter((c) => new Date(c.checkin_date).getDay() !== 1).length || 1);

    if (mondayCheckins.length >= 2 && avgMondayAnxiety > avgOtherAnxiety + 0.8) {
      return {
        title: "Monday anxiety pattern",
        content: `Mondays tend to have higher anxiety for ${name}. A slower Sunday evening routine and gentle Monday morning may help.`,
        confidence: 0.78,
        insight_type: "pattern",
      };
    }
  }

  return {
    title: `Understanding ${name}`,
    content: `Keep recording daily check-ins. Child Compass learns ${name}'s unique rhythms over time and will surface personalised insights.`,
    confidence: 0.6,
    insight_type: "recommendation",
  };
}

export async function generateInsight(
  childName: string,
  checkins: DailyCheckin[],
  patterns: PatternFinding[],
): Promise<GeneratedInsight | null> {
  if (isExternalLLMConfigured() && checkins.length > 0) {
    try {
      const provider = getLLMProvider();
      const checkinData = checkins
        .slice(0, 14)
        .map(
          (c) =>
            `${c.checkin_date}: sleep ${c.sleep_quality}, mood ${c.mood}, anxiety ${c.anxiety}, sensory ${c.sensory_overload}, school ${c.school_rating}`,
        )
        .join("\n");
      const patternData = patterns.map((p) => `${p.title}: ${p.description}`).join("\n");
      const prompt = buildInsightPrompt(childName, checkinData, patternData);
      const raw = await provider.complete(prompt, { temperature: 0.5 });
      const parsed = parseInsightResponse(raw);
      if (parsed) return parsed;
    } catch {
      // Fall through
    }
  }

  return buildLocalInsight(childName, checkins, patterns);
}

export function buildDashboardRecommendation(
  childName: string,
  checkin: DailyCheckin | null,
  patterns: PatternFinding[],
): string {
  if (!checkin) {
    return `Start today's check-in for ${childName} — it only takes two minutes and helps Child Compass understand their day.`;
  }

  const regulation = computeRegulationLevel(checkin);
  if (regulation.level === "Elevated") {
    return `Today, focus on connection over correction for ${childName}. Reduce demands and offer calm co-regulation.`;
  }

  const sleepPattern = patterns.find((p) => p.category === "sleep");
  if (sleepPattern && (checkin.sleep_quality ?? 3) <= 2) {
    return sleepPattern.description;
  }

  if ((checkin.anxiety ?? 3) >= 4) {
    return `Anxiety is elevated today. Give ${childName} extra transition time and avoid stacking demands.`;
  }

  return `${childName} is in a ${regulation.level.toLowerCase()} state today. ${regulation.level === "Regulated" ? "A good day for gentle connection." : "Take things slowly and celebrate small wins."}`;
}
