import path from "path";
import { readJsonFile, writeJsonFile } from "@/lib/server/local-file-log";

export type PilotConfig = {
  pilotFeedbackEnabled: boolean;
  demoDataEnabled: boolean;
  analyticsEnabled: boolean;
};

const DEFAULT_CONFIG: PilotConfig = {
  pilotFeedbackEnabled: false,
  demoDataEnabled: false,
  analyticsEnabled: true,
};

const CONFIG_PATH = path.join(process.cwd(), "data", "pilot-config.json");

export async function readPilotConfig(): Promise<PilotConfig> {
  return readJsonFile<PilotConfig>(CONFIG_PATH, DEFAULT_CONFIG);
}

export async function writePilotConfig(patch: Partial<PilotConfig>): Promise<PilotConfig> {
  const current = await readPilotConfig();
  const next = { ...current, ...patch };
  await writeJsonFile(CONFIG_PATH, next);
  return next;
}

export function isPilotFeedbackEnabledEnv(): boolean {
  return process.env.PILOT_FEEDBACK_ENABLED === "true";
}

export async function isPilotFeedbackActive(): Promise<boolean> {
  if (isPilotFeedbackEnabledEnv()) return true;
  const config = await readPilotConfig();
  return config.pilotFeedbackEnabled;
}

export function isPilotAdminEnabled(): boolean {
  return process.env.PILOT_ADMIN_ENABLED === "true";
}

export async function isPilotAdminUser(userEmail: string | undefined): Promise<boolean> {
  if (!isPilotAdminEnabled() || !userEmail) return false;
  const allowlist = process.env.PILOT_ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
  if (allowlist.length === 0) return true;
  return allowlist.includes(userEmail.toLowerCase());
}
