import type { Child } from "@/lib/types/database";
import { fetchJourneyTimeline, type JourneyEntry } from "@/lib/journey/timeline";
import { getExampleFamilyById, getExampleFamilyByChildId } from "@/lib/example-families/library";

export type JourneyDataSourceMode = "real-family" | "example-family";

export async function loadJourneyEntries(params: {
  mode: JourneyDataSourceMode;
  child: Child;
  exampleFamilyId?: string;
  limit?: number;
}): Promise<JourneyEntry[]> {
  // Stage 1.1 uses only real family data. This switch keeps Journey ready for
  // a future example-family source without building a second Journey UI.
  if (params.mode === "real-family") {
    return fetchJourneyTimeline(params.child, params.limit ?? 240);
  }

  const fromId = params.exampleFamilyId ? getExampleFamilyById(params.exampleFamilyId) : null;
  const fromChild = getExampleFamilyByChildId(params.child.id);
  const family = fromId || fromChild;
  if (family) {
    return family.entries.slice(0, params.limit ?? 240);
  }

  return [];
}
