export type OfflineResourceType =
  | "pda_passport"
  | "calming_strategies"
  | "emergency_contacts"
  | "emergency_guidance"
  | "generated_report";

export type OfflineBundle = {
  version: string;
  childId: string;
  childName: string;
  generatedAt: string;
  calmingStrategies: string[];
  emergencyNotes: string | null;
  emergencyContacts: { name?: string; phone?: string; relationship?: string }[];
  pdaPassport: { headline: string; sections: { title: string; body: string | string[] }[] } | null;
  reports: { id: string; title: string; reportType: string; content: unknown }[];
};

export const OFFLINE_CACHE_VERSION = "2.0.0";

export function offlineStorageKey(childId: string): string {
  return `cc-offline-v2:${childId}`;
}
