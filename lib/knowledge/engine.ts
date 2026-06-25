import { knowledgePackV1, KNOWLEDGE_PACK_VERSION } from "@/lib/knowledge/packs/v1/articles";
import type { BlendedGuidance, KnowledgeArticle, KnowledgeDomain } from "@/lib/knowledge/types";

export function getKnowledgeVersion(): string {
  return KNOWLEDGE_PACK_VERSION;
}

export function getAllArticles(): KnowledgeArticle[] {
  return knowledgePackV1.articles;
}

export function retrieveKnowledge(input: {
  diagnosis?: string[];
  keywords?: string[];
  domains?: KnowledgeDomain[];
  limit?: number;
}): KnowledgeArticle[] {
  const limit = input.limit ?? 3;
  const diagnosisLower = (input.diagnosis || []).map((d) => d.toLowerCase());
  const keywords = (input.keywords || []).map((k) => k.toLowerCase());

  const domainSet = new Set<KnowledgeDomain>();
  for (const d of diagnosisLower) {
    if (d.includes("pda")) domainSet.add("pda");
    if (d.includes("autism") || d.includes("asc")) domainSet.add("autism");
    if (d.includes("adhd")) domainSet.add("adhd");
    if (d.includes("anxiety")) domainSet.add("anxiety");
  }
  for (const d of input.domains || []) domainSet.add(d);

  const scored = knowledgePackV1.articles.map((article) => {
    let score = 0;
    if (domainSet.has(article.domain)) score += 3;
    for (const tag of article.tags) {
      if (keywords.some((k) => tag.includes(k) || k.includes(tag))) score += 2;
      if (diagnosisLower.some((d) => tag.includes(d))) score += 1;
    }
    for (const g of article.guidance) {
      if (keywords.some((k) => g.toLowerCase().includes(k))) score += 1;
    }
    return { article, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.article);
}

export function retrieveKnowledgeForMessage(
  parentMessage: string,
  diagnosis: string[],
): KnowledgeArticle[] {
  const msg = parentMessage.toLowerCase();
  const keywordMap: Record<string, string[]> = {
    school: ["school", "refusal", "morning", "teacher", "homework"],
    sensory: ["loud", "noise", "shop", "crowd", "sensory", "overwhelm"],
    sleep: ["sleep", "tired", "bed", "night"],
    anxiety: ["anxious", "worry", "panic", "scared"],
    transition: ["transition", "change", "leave", "stop"],
    visitor: ["visitor", "guest"],
  };

  const keywords: string[] = [];
  for (const [, keys] of Object.entries(keywordMap)) {
    if (keys.some((k) => msg.includes(k))) keywords.push(...keys);
  }

  const domains: KnowledgeDomain[] = [];
  if (keywords.some((k) => ["school", "homework", "teacher"].includes(k))) {
    domains.push("school_accommodations");
  }
  if (keywords.some((k) => ["sensory", "crowd", "loud"].includes(k))) domains.push("sensory");
  if (keywords.some((k) => ["anxious", "worry", "panic"].includes(k))) domains.push("anxiety");

  return retrieveKnowledge({ diagnosis, keywords, domains, limit: 3 });
}

export function blendKnowledgeWithFamily(input: {
  familyObservation: string | null;
  articles: KnowledgeArticle[];
  childName: string;
}): BlendedGuidance {
  const evidenceText = input.articles
    .map((a) => `${a.title}: ${a.guidance[0]}`)
    .join(" ");

  const combined = input.familyObservation
    ? `For ${input.childName}, your family's history suggests: ${input.familyObservation} Evidence-based guidance supports: ${evidenceText}`
    : `Evidence-based guidance for ${input.childName}: ${evidenceText}`;

  return {
    familyObservation: input.familyObservation,
    evidenceGuidance: input.articles,
    combinedRecommendation: combined,
    confidenceNote:
      input.familyObservation && input.articles.length
        ? "High confidence — family data and established guidance align."
        : input.familyObservation
          ? "Medium confidence — based primarily on your family's recorded history."
          : "Medium confidence — based on established guidance; more check-ins will personalise this further.",
  };
}

export function formatKnowledgeForPrompt(articles: KnowledgeArticle[]): string {
  if (!articles.length) return "No matching evidence-based articles.";
  return articles
    .map(
      (a) =>
        `[${a.domain}] ${a.title} (${a.evidenceLevel}): ${a.guidance.join("; ")}`,
    )
    .join("\n");
}
