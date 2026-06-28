import type { FamilyBrainInput } from "@/lib/intelligence/family-brain";
import type {
  ChildGoal,
  DocumentRecord,
  HealthObservation,
  SchoolHubEntry,
  TherapySession,
} from "@/lib/types/database";

export type DocumentInput = FamilyBrainInput & {
  healthObservations: HealthObservation[];
  therapySessions: TherapySession[];
  schoolEntries: SchoolHubEntry[];
  uploadedDocuments: DocumentRecord[];
  coachHighlights: string[];
  activeGoals: ChildGoal[];
};

export async function loadDocumentInput(childId: string): Promise<DocumentInput | null> {
  const { loadFamilyBrainInput } = await import("@/lib/intelligence/family-brain");
  const {
    getHealthObservations,
    getTherapySessions,
    getSchoolHubEntries,
    getDocuments,
    getGoals,
  } = await import("@/lib/data/queries");
  const { createClient } = await import("@/lib/supabase/server");

  const brain = await loadFamilyBrainInput(childId);
  if (!brain) return null;

  const [healthObservations, therapySessions, schoolEntries, uploadedDocuments, goalsData] =
    await Promise.all([
      getHealthObservations(childId),
      getTherapySessions(childId),
      getSchoolHubEntries(childId),
      getDocuments(childId),
      getGoals(childId),
    ]);

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("coach_sessions")
    .select("id")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let coachHighlights: string[] = [];
  if (session) {
    const { data: msgs } = await supabase
      .from("coach_messages")
      .select("content")
      .eq("session_id", session.id)
      .eq("role", "assistant")
      .order("created_at", { ascending: false })
      .limit(5);
    coachHighlights = (msgs ?? [])
      .map((m) => m.content.split("\n")[0]?.slice(0, 160))
      .filter(Boolean) as string[];
  }

  return {
    ...brain,
    healthObservations,
    therapySessions,
    schoolEntries,
    uploadedDocuments,
    coachHighlights,
    activeGoals: goalsData.goals.filter((g) => g.status === "active"),
  };
}
