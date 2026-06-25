import type { Child, DailyCheckin, PatternFinding } from "@/lib/types/database";
import { computeRegulationLevel } from "@/lib/ai/debrief-engine";

export type ChildFamilySnapshot = {
  childId: string;
  childName: string;
  regulationScore: number;
  regulationLevel: string;
  checkinCount: number;
  headline: string;
};

export type FamilyIntelligenceSnapshot = {
  children: ChildFamilySnapshot[];
  familyNote: string;
};

export function buildFamilyIntelligence(
  children: Child[],
  checkinsByChild: Record<string, DailyCheckin[]>,
  patternsByChild: Record<string, PatternFinding[]>,
): FamilyIntelligenceSnapshot {
  const snapshots: ChildFamilySnapshot[] = children.map((child) => {
    const checkins = checkinsByChild[child.id] || [];
    const latest = checkins[0];
    const regulation = latest ? computeRegulationLevel(latest) : null;
    const patterns = patternsByChild[child.id] || [];
    const name = child.nickname || child.first_name;

    let headline = `No check-in today for ${name}.`;
    if (latest) {
      headline =
        regulation!.level === "Regulated"
          ? `${name} looks relatively settled today.`
          : regulation!.level === "Managing"
            ? `${name} may need a gentler pace today.`
            : `${name} may need extra support today.`;
      if (patterns[0]) headline += ` Pattern: ${patterns[0].title.toLowerCase()}.`;
    }

    return {
      childId: child.id,
      childName: name,
      regulationScore: regulation?.score ?? 0,
      regulationLevel: regulation?.level ?? "Unknown",
      checkinCount: checkins.length,
      headline,
    };
  });

  const checkedInToday = snapshots.filter((s) => s.regulationLevel !== "Unknown").length;

  return {
    children: snapshots,
    familyNote:
      children.length > 1
        ? `${checkedInToday} of ${children.length} children checked in today. Each child's insights are kept separate.`
        : "Family-wide view — individual histories are never mixed.",
  };
}
