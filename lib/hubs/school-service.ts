import type { SchoolHubEntry } from "@/lib/types/database";

export type SchoolHubSummary = {
  dailyCommunication: string[];
  classroomStrategies: string[];
  supportPlans: string[];
  sharedNotes: string[];
  observationHistory: string[];
  meetingSummaries: string[];
};

export function summariseSchoolHub(entries: SchoolHubEntry[]): SchoolHubSummary {
  const byType = (type: string) => entries.filter((e) => e.entry_type === type);

  return {
    dailyCommunication: byType("attendance_summary").map((e) => `${e.title}: ${e.content.slice(0, 120)}`),
    classroomStrategies: byType("classroom_strategy").map((e) => e.content),
    supportPlans: byType("support_plan").map((e) => e.content),
    sharedNotes: entries
      .filter((e) => !["teacher_guide", "support_plan"].includes(e.entry_type))
      .map((e) => `${e.title}: ${e.content.slice(0, 160)}`),
    observationHistory: byType("sensory_profile").map((e) => e.content),
    meetingSummaries: byType("transition_plan").concat(byType("exam_support")).map((e) => e.content),
  };
}

export function schoolHubInsight(entries: SchoolHubEntry[]): string | null {
  if (!entries.length) return null;
  const latest = entries[0];
  return `Latest school note (${latest.entry_type.replace("_", " ")}): ${latest.title}`;
}
