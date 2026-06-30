import { CONTEXT_LIMITS } from "@/lib/talk-v2/context/constants";
import type {
  FamilyContextCheckin,
  FamilyContextFamilyStory,
  FamilyContextPattern,
  FamilyContextStorySignal,
  FamilyContextTimelineHighlight,
} from "@/lib/talk-v2/contracts";
import type { ChildProfile, ParentDebrief } from "@/lib/types/database";

function dedupeSignals(signals: FamilyContextStorySignal[]): FamilyContextStorySignal[] {
  const out: FamilyContextStorySignal[] = [];
  const seen = new Set<string>();
  for (const signal of signals) {
    const key = `${signal.kind}:${signal.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(signal);
    if (out.length >= CONTEXT_LIMITS.familyStorySignals) break;
  }
  return out;
}

function deriveStage(input: {
  checkins: FamilyContextCheckin[];
  patterns: FamilyContextPattern[];
  debriefs: ParentDebrief[];
}): FamilyContextFamilyStory["stage"] {
  const hasDepth = input.checkins.length >= 7 || input.debriefs.length >= 5;
  const highConfidencePattern = input.patterns.some((p) => (p.confidence ?? 0) >= 0.75);
  if (hasDepth && highConfidencePattern) return "adapting";
  if (hasDepth) return "stabilizing";
  return "forming";
}

export function buildFamilyStory(input: {
  profile: ChildProfile | null;
  checkins: FamilyContextCheckin[];
  timeline: FamilyContextTimelineHighlight[];
  patterns: FamilyContextPattern[];
  debriefs: ParentDebrief[];
}): FamilyContextFamilyStory | null {
  const signals: FamilyContextStorySignal[] = [];

  for (const pattern of input.patterns.slice(0, 4)) {
    signals.push({
      kind: "challenge",
      text: pattern.description,
      source: "pattern",
    });
  }

  for (const checkin of input.checkins.slice(0, 6)) {
    for (const win of checkin.wins || []) {
      signals.push({ kind: "progress", text: win, source: "checkin" });
    }
    for (const challenge of checkin.challenges || []) {
      signals.push({ kind: "challenge", text: challenge, source: "checkin" });
    }
  }

  for (const item of input.timeline.slice(0, 6)) {
    signals.push({
      kind: item.type === "victory" ? "progress" : "challenge",
      text: item.title,
      source: "timeline",
    });
  }

  for (const debrief of input.debriefs.slice(0, 4)) {
    signals.push({ kind: "relationship", text: debrief.parent_message, source: "debrief" });
  }

  if (input.profile) {
    for (const strategy of input.profile.successful_strategies || []) {
      signals.push({ kind: "support", text: strategy, source: "profile" });
    }
  }

  const compactSignals = dedupeSignals(signals);
  if (!compactSignals.length) return null;

  return {
    stage: deriveStage(input),
    signals: compactSignals,
  };
}
