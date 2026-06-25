import type { ChildProfile, DailyCheckin, ParentDebrief, TimelineEvent } from "@/lib/types/database";

export type GraphNodeType =
  | "sleep"
  | "mood"
  | "sensory"
  | "school"
  | "homework"
  | "transition"
  | "visitor"
  | "medication"
  | "food"
  | "communication"
  | "recovery"
  | "anxiety"
  | "energy";

export type GraphNode = {
  id: string;
  type: GraphNodeType;
  label: string;
  date: string;
  intensity?: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  relationship: string;
  strength: number;
};

export type FamilyKnowledgeGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  insights: string[];
};

function nodeId(type: GraphNodeType, date: string): string {
  return `${type}:${date}`;
}

function detectHomework(text: string): boolean {
  return text.toLowerCase().includes("homework");
}

function detectVisitor(text: string): boolean {
  return text.toLowerCase().includes("visitor") || text.toLowerCase().includes("guest");
}

export function buildFamilyKnowledgeGraph(input: {
  checkins: DailyCheckin[];
  timeline: TimelineEvent[];
  debriefs: ParentDebrief[];
  profile: ChildProfile | null;
}): FamilyKnowledgeGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const c of input.checkins) {
    const date = c.checkin_date;
    if (c.sleep_quality != null) {
      nodes.push({ id: nodeId("sleep", date), type: "sleep", label: `Sleep ${c.sleep_quality}/5`, date, intensity: c.sleep_quality });
    }
    if (c.mood != null) {
      nodes.push({ id: nodeId("mood", date), type: "mood", label: `Mood ${c.mood}/5`, date, intensity: c.mood });
    }
    if (c.sensory_overload != null) {
      nodes.push({ id: nodeId("sensory", date), type: "sensory", label: `Sensory ${c.sensory_overload}/5`, date, intensity: c.sensory_overload });
    }
    if (c.school_rating != null) {
      nodes.push({ id: nodeId("school", date), type: "school", label: `School ${c.school_rating}/5`, date, intensity: c.school_rating });
    }
    if (c.anxiety != null) {
      nodes.push({ id: nodeId("anxiety", date), type: "anxiety", label: `Anxiety ${c.anxiety}/5`, date, intensity: c.anxiety });
    }
    if (c.appetite != null) {
      nodes.push({ id: nodeId("food", date), type: "food", label: `Appetite ${c.appetite}/5`, date, intensity: c.appetite });
    }

    const text = `${c.notes || ""} ${(c.challenges || []).join(" ")}`;
    if (detectHomework(text)) {
      nodes.push({ id: nodeId("homework", date), type: "homework", label: "Homework stress noted", date });
    }
    if (detectVisitor(text)) {
      nodes.push({ id: nodeId("visitor", date), type: "visitor", label: "Visitor-related note", date });
    }
  }

  for (const m of input.profile?.medication || []) {
    nodes.push({ id: `medication:${m}`, type: "medication", label: m, date: "" });
  }

  for (let i = 1; i < input.checkins.length; i++) {
    const prev = input.checkins[i];
    const curr = input.checkins[i - 1];
    const prevDate = prev.checkin_date;
    const currDate = curr.checkin_date;

    if ((prev.sleep_quality ?? 3) <= 2 && (curr.school_rating ?? 3) <= 2) {
      edges.push({
        from: nodeId("sleep", prevDate),
        to: nodeId("school", currDate),
        relationship: "Poor sleep linked to harder school day",
        strength: 0.8,
      });
    }
    if ((prev.sensory_overload ?? 3) >= 4 && (curr.mood ?? 3) <= 2) {
      edges.push({
        from: nodeId("sensory", prevDate),
        to: nodeId("mood", currDate),
        relationship: "High sensory load followed by lower mood",
        strength: 0.75,
      });
    }
    if ((prev.anxiety ?? 3) >= 4 && (curr.school_rating ?? 3) <= 2) {
      edges.push({
        from: nodeId("anxiety", prevDate),
        to: nodeId("school", currDate),
        relationship: "Elevated anxiety before difficult school day",
        strength: 0.78,
      });
    }
  }

  for (const e of input.timeline) {
    if (e.event_type === "meltdown") {
      nodes.push({ id: `recovery:${e.id}`, type: "recovery", label: e.title, date: e.event_date.split("T")[0] });
    }
  }

  const insights = edges
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5)
    .map((e) => e.relationship);

  if (insights.length === 0 && nodes.length >= 3) {
    insights.push("Child Compass is mapping relationships as more check-ins arrive.");
  }

  return { nodes, edges, insights };
}

export function graphSummaryForPrompt(graph: FamilyKnowledgeGraph): string {
  if (!graph.insights.length) return "No relationship patterns mapped yet.";
  return graph.insights.map((i) => `- ${i}`).join("\n");
}
