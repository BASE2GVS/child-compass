"use server";

import { redirect } from "next/navigation";
import path from "path";

import { isPilotFeedbackActive } from "@/lib/pilot/config";
import { appendJsonlLine } from "@/lib/server/local-file-log";

function pilotFeedbackEnabled(): boolean {
  return process.env.PILOT_FEEDBACK_ENABLED === "true";
}

export async function submitPilotFeedback(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const active = pilotFeedbackEnabled() || (await isPilotFeedbackActive());
  if (!active) {
    return { error: "Pilot feedback is not enabled." };
  }

  const usefulness = Number(formData.get("usefulness") || 0);
  const confusion = (formData.get("confusion") as string)?.trim() || "";
  const improvements = (formData.get("improvements") as string)?.trim() || "";
  const featureRequest = (formData.get("featureRequest") as string)?.trim() || "";
  const familyId = (formData.get("familyId") as string)?.trim() || "unknown";

  if (!usefulness || usefulness < 1 || usefulness > 5) {
    return { error: "Please rate usefulness from 1 to 5." };
  }

  const entry = {
    submittedAt: new Date().toISOString(),
    familyId,
    usefulness,
    confusion,
    improvements,
    featureRequest,
  };

  const file = path.join(process.cwd(), "data", "pilot-feedback.jsonl");
  await appendJsonlLine(file, entry);

  const { trackProductEvent } = await import("@/lib/pilot/product-analytics");
  await trackProductEvent({
    event: "pilot_feedback_submitted",
    feature: "pilot_feedback",
    familyId: familyId !== "unknown" ? familyId : undefined,
    metadata: { usefulness },
  });

  return { success: true };
}

export async function requirePilotFeedbackAccess(): Promise<boolean> {
  return pilotFeedbackEnabled() || (await isPilotFeedbackActive());
}

export async function guardPilotFeedbackPage(): Promise<void> {
  const active = pilotFeedbackEnabled() || (await isPilotFeedbackActive());
  if (!active) {
    redirect("/today");
  }
}
