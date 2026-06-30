import type { Child } from "@/lib/types/database";
import type { JourneyEntry } from "@/lib/journey/timeline";

export type ExampleFamily = {
  id: string;
  label: string;
  parentName: string;
  child: Child;
  entries: JourneyEntry[];
};

const FAMILY_SEEDS = [
  { id: "example-family-01", label: "Amy & Erki", parentName: "Erki", childName: "Amy", diagnosis: ["Autism", "PDA"] },
  { id: "example-family-02", label: "Leo & Maria", parentName: "Maria", childName: "Leo", diagnosis: ["ADHD"] },
  { id: "example-family-03", label: "Noah & Sam", parentName: "Sam", childName: "Noah", diagnosis: ["Autism"] },
  { id: "example-family-04", label: "Mila & Hannah", parentName: "Hannah", childName: "Mila", diagnosis: ["Anxiety"] },
  { id: "example-family-05", label: "Owen & Priya", parentName: "Priya", childName: "Owen", diagnosis: ["PDA", "Anxiety"] },
  { id: "example-family-06", label: "Ruby & Daniel", parentName: "Daniel", childName: "Ruby", diagnosis: ["Autism", "ADHD"] },
  { id: "example-family-07", label: "Eli & Jo", parentName: "Jo", childName: "Eli", diagnosis: ["Speech delay"] },
  { id: "example-family-08", label: "Isla & Ben", parentName: "Ben", childName: "Isla", diagnosis: ["Sensory processing differences"] },
  { id: "example-family-09", label: "Aria & Fatima", parentName: "Fatima", childName: "Aria", diagnosis: ["Autism", "Anxiety"] },
  { id: "example-family-10", label: "Max & Oliver", parentName: "Oliver", childName: "Max", diagnosis: ["ADHD", "PDA"] },
] as const;

const SUPPORT_NEEDS = ["Predictable routine", "Transition support", "Sensory regulation", "School preparation"];
const TRIGGERS = ["Rushed transitions", "Loud spaces", "Unexpected changes"];
const CALMING = ["Headphones", "Quiet corner", "Visual schedule", "Favourite comfort item"];
const SUCCESS = ["Two clear choices", "Low-demand language", "Short transition preview"];
const FAVOURITES = ["Drawing", "Outdoor play", "Music", "Building toys"];

function isoDaysAgo(days: number, hour = 16): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function entry(seedId: string, child: Child, idx: number, partial: Omit<JourneyEntry, "id" | "childId" | "childName">): JourneyEntry {
  return {
    id: `${seedId}-${partial.source}-${idx}`,
    childId: child.id,
    childName: child.nickname || child.first_name,
    ...partial,
  };
}

function buildEntries(seedId: string, child: Child): JourneyEntry[] {
  const out: JourneyEntry[] = [];
  let i = 0;

  // Profile-derived memory entries
  for (const trigger of TRIGGERS) {
    out.push(
      entry(seedId, child, i++, {
        source: "memory",
        filter: "memories",
        icon: "🧠",
        title: "Known trigger",
        summary: trigger,
        date: isoDaysAgo(720 - i, 12),
        sourceLabel: "Memory",
        href: `/compass?child=${child.id}`,
      }),
    );
  }
  for (const item of CALMING) {
    out.push(
      entry(seedId, child, i++, {
        source: "memory",
        filter: "memories",
        icon: "🧠",
        title: "Calming strategy",
        summary: item,
        date: isoDaysAgo(710 - i, 12),
        sourceLabel: "Memory",
        href: `/compass?child=${child.id}`,
      }),
    );
  }
  for (const item of SUCCESS) {
    out.push(
      entry(seedId, child, i++, {
        source: "memory",
        filter: "memories",
        icon: "🧠",
        title: "Successful strategy",
        summary: item,
        date: isoDaysAgo(700 - i, 12),
        sourceLabel: "Memory",
        href: `/compass?child=${child.id}`,
      }),
    );
  }
  for (const item of FAVOURITES.slice(0, 2)) {
    out.push(
      entry(seedId, child, i++, {
        source: "memory",
        filter: "memories",
        icon: "🧠",
        title: "Favourite thing",
        summary: item,
        date: isoDaysAgo(690 - i, 12),
        sourceLabel: "Memory",
        href: `/compass?child=${child.id}`,
      }),
    );
  }

  // Approx two years of weekly cadence + monthly milestones
  for (let week = 0; week < 104; week += 1) {
    const daysAgo = 7 * week;

    out.push(
      entry(seedId, child, i++, {
        source: "checkin",
        filter: week % 3 === 0 ? "sleep" : week % 3 === 1 ? "school" : "health",
        icon: "📝",
        title: "Daily check-in",
        summary:
          week % 4 === 0
            ? "sleep 4/5 • mood 4/5 • school 3/5 • wins: calmer morning"
            : "sleep 3/5 • mood 3/5 • school 3/5 • challenges: transition pressure",
        date: isoDaysAgo(daysAgo + 1, 19),
        sourceLabel: "Daily check-in",
        href: `/check-in?child=${child.id}`,
      }),
    );

    out.push(
      entry(seedId, child, i++, {
        source: "conversation",
        filter: "conversations",
        icon: "💬",
        title: "Child Compass reply",
        summary:
          week % 2 === 0
            ? "Parent explored school transition planning with Child Compass."
            : "Parent reviewed calming options before a busy day.",
        date: isoDaysAgo(daysAgo + 2, 20),
        sourceLabel: "Talk",
        href: `/coach?child=${child.id}`,
      }),
    );

    out.push(
      entry(seedId, child, i++, {
        source: week % 5 === 0 ? "milestone" : "timeline",
        filter: week % 5 === 0 ? "milestones" : week % 2 === 0 ? "school" : "health",
        icon: week % 5 === 0 ? "🏆" : "📍",
        title: week % 5 === 0 ? "Important family milestone" : "Timeline observation",
        summary:
          week % 5 === 0
            ? "Family logged a meaningful progress moment this week."
            : week % 2 === 0
              ? "School transition needed extra support today."
              : "Afternoon regulation improved after quieter travel.",
        date: isoDaysAgo(daysAgo + 3, 17),
        sourceLabel: week % 5 === 0 ? "Milestone" : "Timeline event",
        href: `/timeline?child=${child.id}`,
      }),
    );

    if (week % 2 === 0) {
      out.push(
        entry(seedId, child, i++, {
          source: "calendar",
          filter: "calendar",
          icon: week % 4 === 0 ? "🩺" : "🗓️",
          title: week % 4 === 0 ? "Therapy appointment" : "School event",
          summary: week % 4 === 0 ? "Weekly therapy review session" : "Classroom event and transition practice",
          date: isoDaysAgo(daysAgo, 9),
          sourceLabel: "Calendar",
          href: `/schedules?child=${child.id}`,
        }),
      );
    }

    if (week % 4 === 0) {
      out.push(
        entry(seedId, child, i++, {
          source: "report",
          filter: "reports",
          icon: "📄",
          title: "Monthly progress report",
          summary: "Monthly progress generated",
          date: isoDaysAgo(daysAgo + 4, 11),
          sourceLabel: "Report",
          href: `/documents-hub?child=${child.id}`,
        }),
      );
    }

    if (week % 6 === 0) {
      out.push(
        entry(seedId, child, i++, {
          source: "timeline",
          filter: "health",
          icon: "🌙",
          title: "Evening Reflection",
          summary:
            week % 12 === 0
              ? "Today felt better than expected. Parent note: calmer bedtime after outdoor play."
              : "Today felt about the same.",
          date: isoDaysAgo(daysAgo, 20),
          sourceLabel: "Timeline event",
          href: `/timeline?child=${child.id}`,
        }),
      );
    }
  }

  return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function buildChild(seed: (typeof FAMILY_SEEDS)[number]): Child {
  return {
    id: `${seed.id}-child-1`,
    family_id: seed.id,
    photo_url: null,
    first_name: seed.childName,
    nickname: seed.childName,
    date_of_birth: "2017-05-20",
    gender: null,
    school: "Willow Primary",
    grade: "Year 3",
    diagnosis: [...seed.diagnosis],
    support_needs: [...SUPPORT_NEEDS],
    interests: ["Art", "Nature", "Music"],
    favourite_activities: ["Drawing", "Walks", "Building"],
    created_at: isoDaysAgo(730, 10),
    updated_at: isoDaysAgo(0, 10),
  };
}

const LIBRARY: ExampleFamily[] = FAMILY_SEEDS.map((seed) => {
  const child = buildChild(seed);
  return {
    id: seed.id,
    label: seed.label,
    parentName: seed.parentName,
    child,
    entries: buildEntries(seed.id, child),
  };
});

export function listExampleFamilies(): Array<{ id: string; label: string; childId: string }> {
  return LIBRARY.map((family) => ({
    id: family.id,
    label: family.label,
    childId: family.child.id,
  }));
}

export function getExampleFamilyById(id: string): ExampleFamily | null {
  return LIBRARY.find((family) => family.id === id) || null;
}

export function getExampleFamilyByChildId(childId: string): ExampleFamily | null {
  return LIBRARY.find((family) => family.child.id === childId) || null;
}
