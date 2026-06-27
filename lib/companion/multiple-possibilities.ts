const DEFINITIVE_REPLACEMENTS: [RegExp, string][] = [
  [/\bThis is because\b/gi, "This could be because"],
  [/\bThe reason is\b/gi, "One possibility is"],
  [/\bThis means\b/g, "This might mean"],
  [/\bwas likely\b/gi, "could have been"],
  [/\bis likely\b/gi, "could be"],
  [/\bdefinitely\b/gi, "perhaps"],
  [/\bcertainly\b/gi, "possibly"],
  [/\balways\b/gi, "often"],
  [/\bnever\b/gi, "may not always"],
  [/\bthe pattern is\b/gi, "one pattern could be"],
  [/\bthe trigger was\b/gi, "a trigger might have been"],
  [/\bprotective response — not defiance\b/gi, "protective response — and may not be defiance"],
];

export function softenDefinitiveLanguage(text: string): string {
  let result = text;
  for (const [pattern, replacement] of DEFINITIVE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function buildPossibilitiesFraming(
  parentMessage: string,
  hasMultipleFactors: boolean,
): string | null {
  const lower = parentMessage.toLowerCase();
  const complex =
    hasMultipleFactors ||
    lower.includes("meltdown") ||
    lower.includes("refused") ||
    lower.includes("why");

  if (!complex) return null;

  const openers = [
    "There may be more than one explanation — ",
    "This could be related to a few different things — ",
    "I wonder whether a few factors overlapped — ",
  ];
  const seed = parentMessage.length;
  return openers[seed % openers.length];
}
