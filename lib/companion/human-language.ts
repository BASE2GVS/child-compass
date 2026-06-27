/**
 * Phase 7 — human language instead of software language.
 */
const REPLACEMENTS: [RegExp, string][] = [
  [/\bGenerate\b/g, "Share"],
  [/\bgenerate\b/g, "share"],
  [/\bSubmit\b/g, "Save"],
  [/\bsubmit\b/g, "save"],
  [/\bComplete today's check-in\b/gi, "When you're ready, tell me how today went"],
  [/\bComplete check-in\b/gi, "Check in when you're ready"],
  [/\bComplete onboarding\b/gi, "Let's keep going together with setup"],
  [/\bContinue onboarding\b/gi, "Let's keep going with setup"],
  [/\bContinue our thread\b/gi, "Pick up our conversation"],
  [/\bReview today's conversation\b/gi, "Pick up our conversation"],
  [/\bProcess\b/g, "Think through"],
  [/\bprocess\b/g, "think through"],
  [/\bSkip for now\b/gi, "Not right now"],
  [/\bReview today's conversation\b/gi, "Pick up our conversation"],
  [/\bGenerate Teacher Guide\b/gi, "Share a Teacher Guide"],
  [/\bCreate your child's report\b/gi, "Share what we've learned"],
  [/\bCreate a fresh copy\b/gi, "Share a fresh copy"],
  [/\bGet calm guidance\b/gi, "Talk it through together"],
  [/\bSend your message\b/gi, "Share what's on your mind"],
  [/\bcheck-in today would help\b/gi, "would it help to tell me how today went"],
  [/\bcompleted \d+ check-ins\b/gi, "you've been showing up"],
  [/\bYou've completed\b/gi, "You've shared"],
  [/\bstreak\b/gi, "rhythm"],
  [/\bmissed\b/gi, "away"],
  [/\breminder\b/gi, "invitation"],
  [/\bManage\b/g, "Look after"],
  [/\bmanage\b/g, "look after"],
  [/\bDashboard\b/g, "Today"],
  [/\bdashboard\b/g, "today"],
  [/\bAnalytics\b/g, "Patterns"],
  [/\banalytics\b/g, "patterns"],
  [/\bconfiguration\b/gi, "settings"],
  [/\bConfiguration\b/g, "Settings"],
  [/\bworkflow\b/gi, "routine"],
  [/\bWorkflow\b/g, "Routine"],
  [/\bmodule\b/gi, "section"],
  [/\bModule\b/g, "Section"],
  [/\bTalk to Child Compass\b/g, "Talk"],
  [/\bHelp Centre\b/g, "Help"],
];

export function humanizeParentText(text: string): string {
  let result = text;
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function invitationForCheckin(childName: string): string {
  return `Would it help to tell me how today went for ${childName}?`;
}

export function invitationToTalk(): string {
  return "Would it help to talk about it?";
}

export function invitationToPrepare(childName: string): string {
  return `Would it help to prepare together for ${childName}'s tomorrow?`;
}

export function invitationToShareLearnings(): string {
  return "Would it help to share what we've learned together?";
}
