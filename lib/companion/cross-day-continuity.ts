export type CoachMessageTurn = {
  role: string;
  content: string;
  created_at: string;
};

function pick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

function isMeaningful(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 20) return false;
  if (/^(ok|yes|no|thanks|thank you|hi|hello)\.?$/i.test(trimmed)) return false;
  return true;
}

function dateKey(iso: string): string {
  return iso.split("T")[0];
}

export function buildCrossDayContinuity(
  messages: CoachMessageTurn[],
  currentMessage: string,
): string | null {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const talkedToday = messages.some(
    (m) => m.role === "parent" && dateKey(m.created_at) === today,
  );
  if (talkedToday && !/today|this morning|how did/i.test(currentMessage.toLowerCase())) {
    return null;
  }

  const yesterdayParents = messages.filter(
    (m) =>
      m.role === "parent" &&
      dateKey(m.created_at) === yesterday &&
      isMeaningful(m.content),
  );

  if (!yesterdayParents.length) {
    const older = messages.filter(
      (m) =>
        m.role === "parent" &&
        dateKey(m.created_at) < today &&
        isMeaningful(m.content),
    );
    if (!older.length) return null;

    const daysSince = Math.floor(
      (Date.now() - new Date(older[older.length - 1].created_at).getTime()) / 86400000,
    );
    if (daysSince < 2 || daysSince > 7) return null;

    const snippet = older[older.length - 1].content.slice(0, 55);
    return pick(
      [
        `I've been thinking about what you shared recently — "${snippet}${older[older.length - 1].content.length > 55 ? "…" : ""}" — `,
        `When we last talked, you mentioned "${snippet}${older[older.length - 1].content.length > 55 ? "…" : ""}" — `,
      ],
      snippet,
    );
  }

  const last = yesterdayParents[yesterdayParents.length - 1];
  const snippet = last.content.slice(0, 55);

  return pick(
    [
      `Yesterday you mentioned "${snippet}${last.content.length > 55 ? "…" : ""}" — `,
      `I've been thinking about what you shared yesterday — `,
      `How did today go, after yesterday? `,
    ],
    last.content + currentMessage,
  );
}

export function daysSinceLastParentMessage(messages: CoachMessageTurn[]): number | null {
  const parents = messages.filter((m) => m.role === "parent");
  if (!parents.length) return null;
  const last = parents[parents.length - 1];
  return Math.floor((Date.now() - new Date(last.created_at).getTime()) / 86400000);
}
