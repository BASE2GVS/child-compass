import { appendFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

/** Serverless (Vercel/Lambda) has no writable local disk — never mkdir /var/task/data */
export function canWriteLocalFiles(): boolean {
  if (process.env.DISABLE_FILE_LOGS === "true") return false;
  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") return false;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  if (process.cwd().startsWith("/var/task")) return false;
  return process.env.NODE_ENV === "development";
}

export async function appendJsonlLine(filePath: string, row: unknown): Promise<void> {
  if (!canWriteLocalFiles()) return;
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await appendFile(filePath, `${JSON.stringify(row)}\n`, "utf8");
  } catch {
    /* observability must never break product flows */
  }
}

export async function readJsonlFile<T>(filePath: string, limit: number): Promise<T[]> {
  if (!canWriteLocalFiles()) return [];
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<boolean> {
  if (!canWriteLocalFiles()) return false;
  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  if (!canWriteLocalFiles()) return fallback;
  try {
    const raw = await readFile(filePath, "utf8");
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}
