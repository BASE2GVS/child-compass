import type { CoachMessage, DailyCheckin, PatternFinding } from "@/lib/types/database";
import type { DayPhase } from "@/lib/companion/daily-rhythm";
import { invitationForCheckin } from "@/lib/companion/human-language";

export type ContextualAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type ContextualNextStep = {
  primary: ContextualAction;
  alternates: ContextualAction[];
};

function coachToday(messages: CoachMessage[]): boolean {
  const today = new Date().toISOString().split("T")[0];
  return messages.some((m) => m.role === "parent" && m.created_at.startsWith(today));
}

export function buildContextualNextStep(input: {
  phase: DayPhase;
  childId: string;
  childName: string;
  checkin: DailyCheckin | null;
  coachMessages: CoachMessage[];
  patterns: PatternFinding[];
  firstCheckinOffer?: boolean;
}): ContextualNextStep {
  const qs = `?child=${input.childId}`;
  const alternates: ContextualAction[] = [];

  if (!input.checkin) {
    return {
      primary: {
        id: "checkin",
        label: invitationForCheckin(input.childName),
        description: "Two minutes — then I can walk alongside you today.",
        href: `/check-in${qs}`,
      },
      alternates: [
        {
          id: "skip",
          label: "Not right now",
          description: "Come back when it suits you.",
          href: "#skip",
        },
      ],
    };
  }

  const talked = coachToday(input.coachMessages);
  const hour = new Date().getHours();
  const schoolPattern = input.patterns.some(
    (p) => p.category === "school" || p.description.toLowerCase().includes("morning"),
  );

  if (input.firstCheckinOffer && !talked) {
    return {
      primary: {
        id: "reflect",
        label: "Talk",
        description: `How did today feel for ${input.childName}?`,
        href: `/coach${qs}&reflect=1`,
      },
      alternates: [
        {
          id: "skip",
          label: "Not right now",
          description: "No pressure.",
          href: "#skip",
        },
      ],
    };
  }

  if (!talked && (input.phase === "morning" || input.phase === "day")) {
    return {
      primary: {
        id: "coach",
        label: "Talk",
        description: "Tell me what happened, plan ahead, or just think out loud.",
        href: `/coach${qs}`,
      },
      alternates: buildAlternates(input, qs, schoolPattern, talked),
    };
  }

  if (
    (input.phase === "day" || input.phase === "evening") &&
    (hour >= 15 || input.phase === "evening") &&
    schoolPattern
  ) {
    return {
      primary: {
        id: "prepare",
        label: "Prepare for tomorrow",
        description: `Gentle planning for ${input.childName}'s morning.`,
        href: `/coach${qs}&q=${encodeURIComponent("Help me prepare for tomorrow morning")}`,
      },
      alternates: buildAlternates(input, qs, schoolPattern, talked),
    };
  }

  if (talked && input.phase === "evening") {
    return {
      primary: {
        id: "review",
        label: "Pick up our conversation",
        description: "Continue from where we left off, if you'd like.",
        href: `/coach${qs}`,
      },
      alternates: buildAlternates(input, qs, schoolPattern, talked),
    };
  }

  if (schoolPattern && !alternates.some((a) => a.id === "teacher")) {
    return {
      primary: {
        id: "coach",
        label: "Talk",
        description: `Would it help to talk about ${input.childName}'s school day?`,
        href: `/coach${qs}`,
      },
      alternates: buildAlternates(input, qs, schoolPattern, talked),
    };
  }

  return {
    primary: {
      id: "coach",
      label: "Talk",
      description: "I'm here whenever something's on your mind.",
      href: `/coach${qs}`,
    },
    alternates: [
      {
        id: "skip",
        label: "Not right now",
        description: "Rest — tomorrow is enough.",
        href: "#skip",
      },
    ],
  };
}

function buildAlternates(
  input: { childId: string; childName: string },
  qs: string,
  schoolPattern: boolean,
  talked: boolean,
): ContextualAction[] {
  const list: ContextualAction[] = [];

  if (schoolPattern) {
    list.push({
      id: "teacher",
      label: "Share with school",
      description: `What helps ${input.childName} in the classroom.`,
      href: `/teacher-guide${qs}`,
    });
  }

  if (talked) {
    list.push({
      id: "review",
      label: "Pick up our conversation",
      description: "Let's keep going from earlier.",
      href: `/coach${qs}`,
    });
  }

  list.push({
    id: "skip",
    label: "Not right now",
    description: "That's completely fine.",
    href: "#skip",
  });

  return list.slice(0, 3);
}
