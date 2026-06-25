export type JourneyPhase = {
  week: 1 | 2 | 3 | 4;
  title: string;
  message: string;
  focus: string;
};

export function getFamilyJourneyPhase(
  familyCreatedAt: string | null | undefined,
  checkinCount: number,
  patternCount: number,
): JourneyPhase | null {
  if (!familyCreatedAt) return null;

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(familyCreatedAt).getTime()) / 86400000,
  );
  if (daysSinceStart > 35) return null;

  const week = (Math.min(4, Math.floor(daysSinceStart / 7) + 1)) as 1 | 2 | 3 | 4;

  const phases: Record<JourneyPhase["week"], JourneyPhase> = {
    1: {
      week: 1,
      title: "Week 1 — Getting to know your child",
      message:
        "You're building the foundation. Daily check-ins and profile details help Child Compass understand what makes your family unique.",
      focus: "Complete check-ins and add strengths, triggers, and calming strategies.",
    },
    2: {
      week: 2,
      title: "Week 2 — Early patterns emerging",
      message:
        checkinCount >= 5
          ? "Child Compass is beginning to notice rhythms in sleep, mood, and school."
          : "A few more check-ins will help Child Compass spot your first meaningful patterns.",
      focus: "Try Parent Debrief™ after challenging moments to deepen understanding.",
    },
    3: {
      week: 3,
      title: "Week 3 — Personalised guidance",
      message:
        patternCount > 0
          ? "Recommendations now draw on your family's own history — not generic advice."
          : "Keep checking in — personalised guidance strengthens with each entry.",
      focus: "Review patterns on the dashboard and share Teacher Guide™ if helpful.",
    },
    4: {
      week: 4,
      title: "Week 4 — Your first monthly picture",
      message:
        "You're ready for a fuller monthly review — celebrating progress and planning gently for next month.",
      focus: "Create your Monthly Progress™ report and set one gentle family goal.",
    },
  };

  return phases[week];
}
