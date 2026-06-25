import type { TherapySession } from "@/lib/types/database";

export type TherapyHubSummary = {
  recentSessions: TherapySession[];
  activeGoals: string[];
  recommendations: string[];
  progressNotes: string[];
};

export function summariseTherapyHub(sessions: TherapySession[]): TherapyHubSummary {
  const recent = sessions.slice(0, 5);
  return {
    recentSessions: recent,
    activeGoals: [...new Set(recent.flatMap((s) => s.goals))].slice(0, 6),
    recommendations: [...new Set(recent.flatMap((s) => s.recommendations))].slice(0, 6),
    progressNotes: recent.map((s) => s.progress).filter(Boolean) as string[],
  };
}

export function therapyInsight(sessions: TherapySession[]): string | null {
  if (!sessions.length) return null;
  const latest = sessions[0];
  return latest.progress || latest.notes?.slice(0, 120) || null;
}
