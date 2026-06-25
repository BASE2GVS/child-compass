"use server";

import { redirect } from "next/navigation";
import { submitSupportTicket } from "@/lib/actions/subscription";

async function submitAndRedirect(formData: FormData, returnPath: string) {
  const result = await submitSupportTicket(formData);
  if (result?.error) redirect(`${returnPath}?error=${encodeURIComponent(result.error)}`);
  redirect(`${returnPath}?sent=1`);
}

export async function submitContactForm(formData: FormData) {
  await submitAndRedirect(formData, "/help/contact");
}

export async function submitBugReportForm(formData: FormData) {
  await submitAndRedirect(formData, "/help/report");
}

export async function submitFeatureSuggestionForm(formData: FormData) {
  await submitAndRedirect(formData, "/help/suggest");
}
