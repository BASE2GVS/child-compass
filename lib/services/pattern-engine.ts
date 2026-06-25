import type { DailyCheckin, PatternFinding, TimelineEvent } from "@/lib/types/database";

export type PatternCandidate = Omit<PatternFinding, "id" | "created_at" | "updated_at" | "is_active">;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function detectPatterns(
  childId: string,
  familyId: string,
  checkins: DailyCheckin[],
  timelineEvents: TimelineEvent[],
): PatternCandidate[] {
  const findings: PatternCandidate[] = [];

  if (checkins.length < 3) return findings;

  // Sleep → school refusal pattern
  const lowSleepDays = checkins.filter((c) => (c.sleep_quality ?? 3) <= 2);
  const lowSleepPoorSchool = lowSleepDays.filter((c) => (c.school_rating ?? 3) <= 2);
  if (lowSleepDays.length >= 2 && lowSleepPoorSchool.length / lowSleepDays.length >= 0.6) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "sleep",
      title: "Poor sleep predicts harder school days",
      description:
        "On days with poor sleep, school tends to be more challenging. Prioritising bedtime routines may reduce school refusal.",
      confidence: 0.82,
      evidence: { low_sleep_days: lowSleepDays.length, poor_school_after: lowSleepPoorSchool.length },
    });
  }

  // Monday anxiety
  const byDay: Record<number, number[]> = {};
  for (const c of checkins) {
    const day = new Date(c.checkin_date).getDay();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(c.anxiety ?? 3);
  }
  const overallAnxiety = avg(checkins.map((c) => c.anxiety ?? 3));
  for (const [day, anxieties] of Object.entries(byDay)) {
    const dayAvg = avg(anxieties);
    if (anxieties.length >= 2 && dayAvg > overallAnxiety + 0.7) {
      findings.push({
        child_id: childId,
        family_id: familyId,
        category: "mood",
        title: `${DAY_NAMES[Number(day)]}s have highest anxiety`,
        description: `Anxiety tends to peak on ${DAY_NAMES[Number(day)]}s. A calmer routine the night before may help.`,
        confidence: 0.75,
        evidence: { day: DAY_NAMES[Number(day)], avg_anxiety: dayAvg, overall: overallAnxiety },
      });
    }
  }

  // Sensory overload correlation
  const highSensory = checkins.filter((c) => (c.sensory_overload ?? 3) >= 4);
  const meltdownEvents = timelineEvents.filter((e) => e.event_type === "meltdown");
  if (highSensory.length >= 2 && meltdownEvents.length >= 1) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "sensory",
      title: "Sensory overload precedes meltdowns",
      description:
        "High sensory load days often coincide with meltdowns. Planning quiet recovery time after busy environments may help.",
      confidence: 0.78,
      evidence: { high_sensory_days: highSensory.length, meltdown_events: meltdownEvents.length },
    });
  }

  // Low energy + low demand tolerance
  const lowEnergyLowDemand = checkins.filter(
    (c) => (c.energy ?? 3) <= 2 && (c.demand_tolerance ?? 3) <= 2,
  );
  if (lowEnergyLowDemand.length >= 2) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "general",
      title: "Low energy reduces demand tolerance",
      description:
        "When energy is low, demand tolerance drops. Outdoor activity or rest before challenging tasks may improve outcomes.",
      confidence: 0.8,
      evidence: { occurrences: lowEnergyLowDemand.length },
    });
  }

  // Late bedtime proxy: poor sleep + next day anxiety
  for (let i = 1; i < checkins.length; i++) {
  const prev = checkins[i];
  const curr = checkins[i - 1];
    if ((prev.sleep_quality ?? 3) <= 2 && (curr.anxiety ?? 3) >= 4) {
      findings.push({
        child_id: childId,
        family_id: familyId,
        category: "sleep",
        title: "Late or poor sleep increases next-day anxiety",
        description:
          "Anxiety tends to be higher the day after poor sleep. Consistent bedtime routines may reduce anxious mornings.",
        confidence: 0.77,
        evidence: { pattern: "sleep_anxiety_chain" },
      });
      break;
    }
  }

  // School events in timeline
  const schoolStruggles = checkins.filter((c) => (c.school_rating ?? 3) <= 2);
  const schoolEvents = timelineEvents.filter((e) => e.event_type === "school");
  if (schoolStruggles.length >= 2 && schoolEvents.length >= 1) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "school",
      title: "School days need extra transition support",
      description:
        "School-related challenges appear regularly. Visual schedules and reduced morning demands may ease transitions.",
      confidence: 0.74,
      evidence: { difficult_days: schoolStruggles.length },
    });
  }

  // Shopping/sensory from timeline descriptions
  const sensoryEvents = timelineEvents.filter(
    (e) =>
      e.event_type === "meltdown" &&
      (e.description?.toLowerCase().includes("shop") ||
        e.title.toLowerCase().includes("shop") ||
        e.description?.toLowerCase().includes("crowd")),
  );
  if (sensoryEvents.length >= 1) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "sensory",
      title: "Busy environments trigger sensory overload",
      description:
        "Shopping centres and crowded places appear to trigger overload. Ear defenders, sunglasses, or exit plans may help.",
      confidence: 0.76,
      evidence: { events: sensoryEvents.length },
    });
  }

  // School refusal trend
  const schoolRefusalDays = checkins.filter(
    (c) => (c.school_rating ?? 3) <= 2 && (c.anxiety ?? 3) >= 4,
  );
  if (schoolRefusalDays.length >= 2) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "school",
      title: "School refusal may be increasing",
      description:
        "Several recent check-ins show low school tolerance with elevated anxiety. Gentler mornings and reduced transition pressure may help.",
      confidence: 0.79,
      evidence: { difficult_school_days: schoolRefusalDays.length },
    });
  }

  // Homework / after-school stress
  const homeworkStress = checkins.filter(
    (c) =>
      (c.anxiety ?? 3) >= 4 &&
      (c.notes?.toLowerCase().includes("homework") ||
        (c.challenges || []).some((ch) => ch.toLowerCase().includes("homework"))),
  );
  const homeworkEvents = timelineEvents.filter(
    (e) =>
      e.description?.toLowerCase().includes("homework") ||
      e.title.toLowerCase().includes("homework"),
  );
  if (homeworkStress.length >= 1 || homeworkEvents.length >= 1) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "school",
      title: "Homework stress affects regulation",
      description:
        "After-school demands and homework appear linked to higher anxiety. A decompression window before homework may support regulation.",
      confidence: 0.74,
      evidence: { checkins: homeworkStress.length, events: homeworkEvents.length },
    });
  }

  // Visitor anxiety
  const visitorEvents = timelineEvents.filter(
    (e) =>
      e.description?.toLowerCase().includes("visitor") ||
      e.description?.toLowerCase().includes("guest") ||
      e.title.toLowerCase().includes("visitor"),
  );
  const visitorAnxiety = checkins.filter(
    (c) =>
      (c.anxiety ?? 3) >= 4 &&
      (c.notes?.toLowerCase().includes("visitor") ||
        (c.challenges || []).some((ch) => ch.toLowerCase().includes("visitor"))),
  );
  if (visitorEvents.length >= 1 || visitorAnxiety.length >= 1) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "general",
      title: "Visitors can raise anxiety",
      description:
        "Changes to the home environment with visitors appear challenging. Advance notice and a quiet retreat space may ease transitions.",
      confidence: 0.73,
      evidence: { events: visitorEvents.length, checkins: visitorAnxiety.length },
    });
  }

  // Holiday / routine disruption
  const holidayEvents = timelineEvents.filter(
    (e) =>
      e.description?.toLowerCase().includes("holiday") ||
      e.title.toLowerCase().includes("holiday") ||
      e.description?.toLowerCase().includes("break"),
  );
  const postHolidayStruggle = checkins.filter(
    (c) =>
      (c.school_rating ?? 3) <= 2 &&
      (c.notes?.toLowerCase().includes("holiday") ||
        (c.challenges || []).some((ch) => ch.toLowerCase().includes("holiday"))),
  );
  if (holidayEvents.length >= 1 || postHolidayStruggle.length >= 1) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "general",
      title: "Holiday breaks disrupt routines",
      description:
        "Routine changes around holidays appear to affect regulation and school tolerance. A gradual return to familiar rhythms may help.",
      confidence: 0.72,
      evidence: { events: holidayEvents.length },
    });
  }

  // Recovery after difficult days
  for (let i = 1; i < checkins.length; i++) {
    const harder = checkins[i];
    const next = checkins[i - 1];
    const harderScore =
      (harder.anxiety ?? 3) + (harder.sensory_overload ?? 3) + (6 - (harder.mood ?? 3));
    const nextScore =
      (next.anxiety ?? 3) + (next.sensory_overload ?? 3) + (6 - (next.mood ?? 3));
    if (harderScore >= 10 && nextScore <= harderScore - 3) {
      findings.push({
        child_id: childId,
        family_id: familyId,
        category: "mood",
        title: "Recovery after difficult days is improving",
        description:
          "After challenging days, regulation appears to return more quickly. The strategies you use during recovery may be working.",
        confidence: 0.71,
        evidence: { pattern: "faster_recovery" },
      });
      break;
    }
  }

  // Weather correlations (future-ready — only when families note weather)
  const weatherNotes = checkins.filter(
    (c) =>
      c.notes?.toLowerCase().includes("rain") ||
      c.notes?.toLowerCase().includes("storm") ||
      c.notes?.toLowerCase().includes("weather"),
  );
  if (weatherNotes.length >= 2) {
    findings.push({
      child_id: childId,
      family_id: familyId,
      category: "general",
      title: "Weather may influence regulation",
      description:
        "Check-in notes mention weather on several challenging days. Tracking weather alongside mood may reveal helpful patterns.",
      confidence: 0.65,
      evidence: { weather_noted_days: weatherNotes.length },
    });
  }

  return dedupePatterns(findings);
}

function dedupePatterns(patterns: PatternCandidate[]): PatternCandidate[] {
  const seen = new Set<string>();
  return patterns.filter((p) => {
    const key = `${p.category}:${p.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
