import type { HealthObservation } from "@/lib/types/database";

export type { HealthObservation };

export type HealthHubSummary = {
  medication: string[];
  upcomingAppointments: string[];
  sleepNotes: string[];
  nutritionNotes: string[];
  exerciseNotes: string[];
  growthNotes: string[];
};

export function summariseHealthObservations(observations: HealthObservation[]): HealthHubSummary {
  const byType = (type: HealthObservation["observation_type"]) =>
    observations.filter((o) => o.observation_type === type).map((o) => o.title + (o.notes ? `: ${o.notes}` : ""));

  return {
    medication: byType("medication"),
    upcomingAppointments: byType("appointment"),
    sleepNotes: byType("sleep"),
    nutritionNotes: byType("nutrition"),
    exerciseNotes: byType("exercise"),
    growthNotes: byType("growth"),
  };
}
