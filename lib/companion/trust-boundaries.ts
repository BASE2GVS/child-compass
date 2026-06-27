const DIAGNOSIS_CLAIMS = [
  /\byour child has\b/gi,
  /\bthis is autism\b/gi,
  /\bthis is adhd\b/gi,
  /\bthis is pda\b/gi,
  /\bthey are autistic\b/gi,
  /\bwill definitely\b/gi,
  /\bguarantee\b/gi,
  /\bwill always\b/gi,
  /\bwill never\b/gi,
];

const PROFESSIONAL_SIGNALS = [
  "medication",
  "diagnose",
  "diagnosis",
  "psychiatrist",
  "paediatrician",
  "pediatrician",
  "therapist said",
  "doctor said",
  "prescribe",
];

export function stripOverreachLanguage(text: string): string {
  let result = text;
  for (const pattern of DIAGNOSIS_CLAIMS) {
    result = result.replace(pattern, (match) => {
      if (/will|guarantee/i.test(match)) return "might";
      return "this may relate to";
    });
  }
  return result;
}

export function needsBoundaryReminder(message: string): boolean {
  const lower = message.toLowerCase();
  return PROFESSIONAL_SIGNALS.some((s) => lower.includes(s));
}

export function buildBoundaryNote(message: string): string | null {
  const lower = message.toLowerCase();

  if (/diagnos|medication|prescri|doctor said|paediatrician|therapist said/i.test(lower)) {
    return "For anything clinical, your GP, paediatrician, or therapist can offer guidance I can't — I'm here to support you alongside them, not instead of them.";
  }

  if (/will they ever|will she ever|will he ever|will this get better|cure|fix them/i.test(lower)) {
    return "I can't promise outcomes — every child and family is different. What I can do is help you find the next gentle step.";
  }

  return null;
}

export function soundsAnalytical(text: string): boolean {
  return (
    /\bconfidence\b/i.test(text) ||
    /\bpattern detected\b/i.test(text) ||
    /\bknowledge graph\b/i.test(text) ||
    /\balgorithm\b/i.test(text) ||
    /\bdata shows\b/i.test(text) ||
    /\banalysis report\b/i.test(text) ||
    /Latest check-in: mood \d\/5/i.test(text)
  );
}
