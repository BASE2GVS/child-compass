import type { CoachMessage } from "@/lib/types/database";
import type { DayPhase } from "@/lib/companion/daily-rhythm";

export type JourneyStepStatus = "done" | "current" | "upcoming";

export type JourneyStep = {
  id: string;
  label: string;
  status: JourneyStepStatus;
};

function coachActivityToday(messages: CoachMessage[]): boolean {
  const today = new Date().toISOString().split("T")[0];
  return messages.some((m) => m.role === "parent" && m.created_at.startsWith(today));
}

export function buildDayJourney(input: {
  phase: DayPhase;
  hasCheckinToday: boolean;
  coachMessages: CoachMessage[];
  hasPatterns: boolean;
}): JourneyStep[] {
  const talkedToday = coachActivityToday(input.coachMessages);
  const understandingDone = talkedToday || input.hasPatterns;

  const steps: { id: string; label: string; done: boolean }[] = [
    { id: "morning", label: "Morning", done: input.phase !== "morning" },
    {
      id: "checkin",
      label: "Check-in",
      done: input.hasCheckinToday,
    },
    {
      id: "conversation",
      label: "Conversation",
      done: talkedToday,
    },
    {
      id: "understanding",
      label: "Understanding updated",
      done: understandingDone && input.hasCheckinToday,
    },
    {
      id: "reflection",
      label: "Reflection",
      done: input.phase === "evening" && (talkedToday || input.hasCheckinToday),
    },
  ];

  let foundCurrent = false;
  return steps.map((step) => {
    if (step.done) {
      return { id: step.id, label: step.label, status: "done" as const };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { id: step.id, label: step.label, status: "current" as const };
    }
    return { id: step.id, label: step.label, status: "upcoming" as const };
  });
}
