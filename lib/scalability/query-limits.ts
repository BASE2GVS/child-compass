const DEFAULT_CHECKIN_LIMIT = 90;

export function recommendedCheckinFetch(days: number): number {
  return Math.min(days, DEFAULT_CHECKIN_LIMIT);
}

export function cacheKey(prefix: string, parts: (string | number)[]): string {
  return `${prefix}:${parts.join(":")}`;
}

export const QUERY_LIMITS = {
  dashboardCheckins: 7,
  intelligenceCheckins: 30,
  longitudinalCheckins: 365,
  timeline: 50,
  patterns: 10,
} as const;
