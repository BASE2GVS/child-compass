import path from "path";
import { knowledgePackV1, KNOWLEDGE_PACK_VERSION } from "@/lib/knowledge/packs/v1/articles";
import { readJsonFile, writeJsonFile } from "@/lib/server/local-file-log";
import type { KnowledgeArticle } from "@/lib/knowledge/types";

export type PackStatus = "draft" | "review" | "published" | "archived";

export type KnowledgePackMeta = {
  version: string;
  status: PackStatus;
  changelog: string;
  evidenceNotes: string;
  publishedAt: string | null;
  updatedAt: string;
};

const META_PATH = path.join(process.cwd(), "data", "knowledge-pack-meta.json");
const DRAFT_PATH = path.join(process.cwd(), "data", "knowledge-pack-draft.json");

const DEFAULT_META: KnowledgePackMeta = {
  version: KNOWLEDGE_PACK_VERSION,
  status: "published",
  changelog: "Initial published pack",
  evidenceNotes: "Neurodiversity-affirming practices; subject to expert review.",
  publishedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function readPackMeta(): Promise<KnowledgePackMeta> {
  return readJsonFile<KnowledgePackMeta>(META_PATH, DEFAULT_META);
}

export async function writePackMeta(meta: Partial<KnowledgePackMeta>): Promise<KnowledgePackMeta> {
  const current = await readPackMeta();
  const next = { ...current, ...meta, updatedAt: new Date().toISOString() };
  await writeJsonFile(META_PATH, next);
  return next;
}

export async function readPublishedArticles(): Promise<KnowledgeArticle[]> {
  const meta = await readPackMeta();
  if (meta.status === "draft") {
    const draft = await readJsonFile<KnowledgeArticle[]>(DRAFT_PATH, knowledgePackV1.articles);
    return draft.length > 0 ? draft : knowledgePackV1.articles;
  }
  return knowledgePackV1.articles;
}

export async function saveDraftArticles(articles: KnowledgeArticle[]): Promise<void> {
  await writeJsonFile(DRAFT_PATH, articles);
  await writePackMeta({ status: "draft" });
}

export async function publishDraft(changelog: string, evidenceNotes: string): Promise<KnowledgePackMeta> {
  return writePackMeta({
    status: "published",
    changelog,
    evidenceNotes,
    publishedAt: new Date().toISOString(),
  });
}

export function articleSourceReference(article: KnowledgeArticle): string {
  return `[${article.domain}] ${article.title} (v${article.version}, ${article.evidenceLevel})`;
}
