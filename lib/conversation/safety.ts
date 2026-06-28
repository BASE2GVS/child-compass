const PROFESSIONAL_HELP_KEYWORDS = [
  "hurt themselves",
  "self-harm",
  "suicidal",
  "violent",
  "abuse",
  "unsafe",
  "emergency",
];

export function needsProfessionalHelp(message: string): boolean {
  const lower = message.toLowerCase();
  return PROFESSIONAL_HELP_KEYWORDS.some((k) => lower.includes(k));
}
