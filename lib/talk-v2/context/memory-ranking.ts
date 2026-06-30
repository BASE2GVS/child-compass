import { CONTEXT_LIMITS, MEMORY_SOURCE_WEIGHT, MEMORY_STOP_WORDS } from "@/lib/talk-v2/context/constants";
import type {
  FamilyContextCheckin,
  FamilyContextMemory,
  FamilyContextPattern,
  FamilyContextTimelineHighlight,
} from "@/lib/talk-v2/contracts";
import type { ChildProfile, ParentDebrief } from "@/lib/types/database";

type MemoryCandidate = {
  source: FamilyContextMemory["source"];
  text: string;
  occurredAt?: string;
};

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !MEMORY_STOP_WORDS.has(token));
}

function overlapCount(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const bSet = new Set(b);
  let overlap = 0;
  for (const token of a) {
    if (bSet.has(token)) overlap += 1;
  }
  return overlap;
}

function daysSince(dateIso: string): number {
  const t = new Date(dateIso).getTime();
  if (!Number.isFinite(t)) return 365;
  const diff = Date.now() - t;
  return Math.max(0, Math.floor(diff / 86400000));
}

function recencyBoost(dateIso?: string): number {
  if (!dateIso) return 0;
  const days = daysSince(dateIso);
  return Math.max(0, 1 - days / 30);
}

function buildCandidates(input: {
  profile: ChildProfile | null;
  patterns: FamilyContextPattern[];
  checkins: FamilyContextCheckin[];
  timeline: FamilyContextTimelineHighlight[];
  debriefs: ParentDebrief[];
}): MemoryCandidate[] {
  const out: MemoryCandidate[] = [];

  const p = input.profile;
  if (p) {
    for (const t of p.known_triggers || []) out.push({ source: "profile", text: t });
    for (const s of p.calming_strategies || []) out.push({ source: "profile", text: s });
    for (const s of p.successful_strategies || []) out.push({ source: "profile", text: s });
    for (const c of p.challenges || []) out.push({ source: "profile", text: c });
  }

  for (const pattern of input.patterns) {
    out.push({
      source: "pattern",
      text: `${pattern.title}: ${pattern.description}`,
    });
  }

  for (const checkin of input.checkins) {
    for (const win of checkin.wins || []) {
      out.push({ source: "checkin", text: win, occurredAt: checkin.date });
    }
    for (const challenge of checkin.challenges || []) {
      out.push({ source: "checkin", text: challenge, occurredAt: checkin.date });
    }
    if (checkin.notes?.trim()) {
      out.push({ source: "checkin", text: checkin.notes.trim(), occurredAt: checkin.date });
    }
  }

  for (const item of input.timeline) {
    out.push({
      source: "timeline",
      text: `${item.title}${item.description ? `: ${item.description}` : ""}`,
      occurredAt: item.date,
    });
  }

  for (const debrief of input.debriefs) {
    out.push({ source: "debrief", text: debrief.parent_message, occurredAt: debrief.created_at });
    if (debrief.likely_trigger) {
      out.push({ source: "debrief", text: debrief.likely_trigger, occurredAt: debrief.created_at });
    }
  }

  return out.filter((c) => c.text.trim().length > 0);
}

export function rankRelevantMemories(input: {
  parentMessage: string;
  profile: ChildProfile | null;
  patterns: FamilyContextPattern[];
  checkins: FamilyContextCheckin[];
  timeline: FamilyContextTimelineHighlight[];
  debriefs: ParentDebrief[];
}): FamilyContextMemory[] {
  const queryTokens = normalizeTokens(input.parentMessage);
  const candidates = buildCandidates(input);

  const ranked = candidates
    .map((candidate) => {
      const tokens = normalizeTokens(candidate.text);
      const overlap = overlapCount(queryTokens, tokens);
      const sourceWeight = MEMORY_SOURCE_WEIGHT[candidate.source];
      const score = sourceWeight + overlap * 2 + recencyBoost(candidate.occurredAt);
      return {
        source: candidate.source,
        text: candidate.text,
        score: Number(score.toFixed(3)),
      } as FamilyContextMemory;
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.text.localeCompare(b.text);
    });

  const unique: FamilyContextMemory[] = [];
  const seen = new Set<string>();
  for (const item of ranked) {
    const key = `${item.source}:${item.text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= CONTEXT_LIMITS.relevantMemories) break;
  }

  return unique;
}
