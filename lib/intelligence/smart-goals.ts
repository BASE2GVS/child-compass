import type { ChildGoal, DailyCheckin } from "@/lib/types/database";

export type GoalEvaluation = {
  goalId: string;
  suggestedValue: number;
  note: string | null;
  shouldUpdate: boolean;
};

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function scoreFromCheckins(goal: ChildGoal, checkins: DailyCheckin[]): number | null {
  const recent = checkins.slice(0, 7);
  if (!recent.length) return null;

  switch (goal.category) {
    case "school_attendance":
    case "school":
      return Math.round(avg(recent.map((c) => c.school_rating ?? 3)) * (goal.target_value || 5) / 5);
    case "sleeping":
    case "sleep":
      return Math.round(avg(recent.map((c) => c.sleep_quality ?? 3)) * (goal.target_value || 5) / 5);
    case "morning_routine":
      return Math.round(avg(recent.map((c) => c.energy ?? 3)) * (goal.target_value || 5) / 5);
    case "homework":
      return Math.round(avg(recent.map((c) => 6 - (c.anxiety ?? 3))) * (goal.target_value || 5) / 5);
    case "eating":
      return Math.round(avg(recent.map((c) => c.appetite ?? 3)) * (goal.target_value || 5) / 5);
    case "independence":
    case "communication":
      return Math.round(avg(recent.map((c) => c.demand_tolerance ?? 3)) * (goal.target_value || 5) / 5);
  }

  const lowAnxietyDays = recent.filter((c) => (c.anxiety ?? 3) <= 2 && (c.sensory_overload ?? 3) <= 3).length;
  if (goal.title.toLowerCase().includes("meltdown") || goal.title.toLowerCase().includes("anxiety")) {
    return Math.min(goal.target_value || 5, lowAnxietyDays);
  }

  return null;
}

export function evaluateGoalsFromCheckins(
  goals: ChildGoal[],
  checkins: DailyCheckin[],
): GoalEvaluation[] {
  return goals
    .filter((g) => g.status === "active")
    .map((goal) => {
      const suggested = scoreFromCheckins(goal, checkins);
      if (suggested == null) {
        return { goalId: goal.id, suggestedValue: goal.current_value, note: null, shouldUpdate: false };
      }
      const clamped = Math.max(0, Math.min(goal.target_value || 5, suggested));
      const shouldUpdate = clamped !== goal.current_value;
      const note = shouldUpdate
        ? `Child Compass noticed progress from recent check-ins (${clamped}/${goal.target_value || 5}).`
        : null;
      return { goalId: goal.id, suggestedValue: clamped, note, shouldUpdate };
    });
}
