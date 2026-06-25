import type { ChildIntelligenceSnapshot, DailyCheckin } from "@/lib/types/database";

function avg(values: number[]): number {
  if (values.length === 0) return 50;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function toPct(value: number | null | undefined): number {
  const safe = value ?? 3;
  return Math.round((safe / 5) * 100);
}

export function buildChildIntelligence(checkins: DailyCheckin[]): ChildIntelligenceSnapshot {
  const latest = checkins[0];
  const recent = checkins.slice(0, 7);
  const prior = checkins.slice(7, 14);

  const currentRegulation = latest
    ? Math.round(
        avg([
          toPct(latest.mood),
          100 - toPct(latest.anxiety),
          100 - toPct(latest.sensory_overload),
          toPct(latest.demand_tolerance),
          toPct(latest.energy),
        ]),
      )
    : 50;

  const emotionalState = latest ? toPct(latest.mood) : 50;
  const sensoryLoad = latest ? 100 - toPct(latest.sensory_overload) : 50;
  const demandTolerance = latest ? toPct(latest.demand_tolerance) : 50;
  const energy = latest ? toPct(latest.energy) : 50;
  const sleepQuality = latest ? toPct(latest.sleep_quality) : 50;
  const socialBattery = latest ? toPct(latest.social_battery) : 50;
  const confidenceLevel = Math.round(
    avg([emotionalState, demandTolerance, socialBattery, sleepQuality]),
  );

  const recentRegulation = avg(
    recent.map((c) =>
      avg([toPct(c.mood), 100 - toPct(c.anxiety), 100 - toPct(c.sensory_overload)]),
    ),
  );
  const priorRegulation = avg(
    prior.map((c) =>
      avg([toPct(c.mood), 100 - toPct(c.anxiety), 100 - toPct(c.sensory_overload)]),
    ),
  );
  const weeklyDelta = Math.round(recentRegulation - priorRegulation);
  const recoveryTrend = Math.max(0, Math.min(100, Math.round(50 + weeklyDelta * 2)));

  return {
    currentRegulation,
    emotionalState,
    sensoryLoad,
    demandTolerance,
    energy,
    sleepQuality,
    socialBattery,
    confidenceLevel,
    recoveryTrend,
    weeklyDelta,
  };
}
