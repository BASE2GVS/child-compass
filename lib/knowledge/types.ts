export type KnowledgeDomain =
  | "pda"
  | "autism"
  | "adhd"
  | "anxiety"
  | "sensory"
  | "executive_function"
  | "school_accommodations"
  | "parenting"
  | "professional";

export type KnowledgeArticle = {
  id: string;
  domain: KnowledgeDomain;
  title: string;
  summary: string;
  guidance: string[];
  tags: string[];
  evidenceLevel: "established" | "widely_recommended" | "contextual";
  version: string;
};

export type KnowledgePack = {
  version: string;
  publishedAt: string;
  articles: KnowledgeArticle[];
};

export type BlendedGuidance = {
  familyObservation: string | null;
  evidenceGuidance: KnowledgeArticle[];
  combinedRecommendation: string;
  confidenceNote: string;
};
