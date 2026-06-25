import en from "@/lib/i18n/messages/en.json";

export type Locale = "en" | "en-GB";

const catalogs: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  "en-GB": en as Record<string, string>,
};

export function resolveLocale(input?: string | null): Locale {
  if (input === "en-GB") return "en-GB";
  return "en";
}

export function t(key: string, locale: Locale = "en"): string {
  return catalogs[locale][key] ?? catalogs.en[key] ?? key;
}

export function formatDate(date: Date | string, locale: Locale = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tag = locale === "en-GB" ? "en-GB" : "en-US";
  return d.toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" });
}

export function formatUnits(value: number, unit: "rating" | "percent"): string {
  if (unit === "rating") return `${value}/5`;
  return `${value}%`;
}
