export function buildPatientReturnWelcome(
  parentName: string,
  childName: string,
  daysAway: number,
): { headline: string; subline: string } {
  const headlines =
    daysAway >= 7
      ? [
          `It's good to see you again, ${parentName}.`,
          `${parentName}, I'm glad you're here.`,
          `Welcome back, ${parentName}.`,
        ]
      : [
          `Good to see you, ${parentName}.`,
          `${parentName}, I'm glad you're here.`,
          `Hi ${parentName} — whenever you're ready.`,
        ];

  const sublines = [
    `We can pick up wherever you'd like with ${childName}.`,
    `No pressure — tell me what's on your mind about ${childName}, or about you.`,
    `I'm here. We can start fresh or continue gently from before.`,
  ];

  const seed = `${parentName}-${daysAway}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  return {
    headline: headlines[h % headlines.length],
    subline: sublines[(h + 1) % sublines.length],
  };
}
